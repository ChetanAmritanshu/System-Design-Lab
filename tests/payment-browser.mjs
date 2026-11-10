// Optional browser QA: provide PLAYWRIGHT_MODULE as an absolute module path,
// or install Playwright outside the project. Tests the real GitHub Pages export.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE
    ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href
    : "playwright"
);
const output =
  process.env.PAYMENT_QA_OUTPUT || path.join(os.tmpdir(), "payment-system-qa");
fs.mkdirSync(output, { recursive: true });
const root = path.resolve("out"),
  base = "/System-Design-Lab",
  errors = [],
  failedRequests = [];
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (!url.startsWith(base + "/")) {
    res.writeHead(404);
    return res.end("base path required");
  }
  let file = path.join(root, url.slice(base.length));
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403);
    return res.end();
  }
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream",
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
await new Promise((resolve) => server.listen(4173, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:4173",
  url = origin + base + "/case-studies/payment-system/";
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.PAYMENT_BROWSER ||
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  const accessibility = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
  });
  for (const width of [390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url, { waitUntil: "networkidle" });
    assert.equal(await page.locator("section.pay-module").count(), 15);
    assert.equal(await page.locator(".pay-lab").count(), 15); // 13 labs + incident game + final assessment
    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      page: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll("article.payment-page *")]
        .filter(
          (e) =>
            e.getBoundingClientRect().right > innerWidth + 1 &&
            !e.closest(".pay-table-wrap") &&
            getComputedStyle(e).position !== "absolute",
        )
        .slice(0, 8)
        .map((e) => `${e.tagName}.${e.className}`),
    }));
    assert.ok(
      overflow.page <= width + 1,
      JSON.stringify({ width, ...overflow }),
    );
    assert.deepEqual(
      overflow.offenders,
      [],
      JSON.stringify({ width, ...overflow }),
    );
    await page.screenshot({ path: path.join(output, `payment-${width}.png`) });
    if (process.env.AXE_MODULE && [390, 1440].includes(width)) {
      const { AxeBuilder } = await import(
        pathToFileURL(process.env.AXE_MODULE).href
      );
      const result = await new AxeBuilder({ page })
        .include("article.payment-page")
        .analyze();
      accessibility.push({
        width,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          targets: v.nodes.map((n) => n.target),
        })),
      });
      assert.deepEqual(result.violations, [], `Accessibility at ${width}`);
    }
    for (const anchor of await page
      .locator('article a[href^="#"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href").slice(1))))
      assert.equal(await page.locator(`[id="${anchor}"]`).count(), 1, anchor);
  }
  const lab = (title) =>
    page
      .locator(".pay-lab")
      .filter({ has: page.getByRole("heading", { name: title, exact: true }) });
  const click = (title, button) =>
    lab(title).getByRole("button", { name: button, exact: true }).click();
  const latest = (title) => lab(title).locator(".pay-history");
  await click("Follow your money", "Advance money story →");
  assert.match(await latest("Follow your money").innerText(), /Merchant/);
  await click("Follow your money", "Bank / UPI-style");
  assert.match(await latest("Follow your money").innerText(), /bank-transfer/);
  await click("Follow your money", "Reset lab");
  const slider = lab("Size the workload").getByRole("slider", {
    name: "Peak multiplier",
    exact: true,
  });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await slider.inputValue(), "11");
  await click("Payment state machine playground", "Confirm");
  await click("Payment state machine playground", "PSP accepts; lose response");
  await click("Payment state machine playground", "Restart process");
  await click("Payment state machine playground", "Query PSP");
  await click("Payment state machine playground", "Capture webhook");
  await click("Payment state machine playground", "Capture webhook");
  assert.match(
    await latest("Payment state machine playground").innerText(),
    /Duplicate/,
  );
  await click("Payment state machine playground", "Provider decline");
  assert.match(
    await latest("Payment state machine playground").innerText(),
    /Rejected/,
  );
  await click("Payment state machine playground", "Write stale DB version");
  assert.match(
    await latest("Payment state machine playground").innerText(),
    /Rejected stale write/,
  );
  await click("Idempotency race lab", "Race replicas A + B");
  assert.match(await latest("Idempotency race lab").innerText(), /202/);
  await click("Idempotency race lab", "Same key, ₹2,000 payload");
  assert.match(await latest("Idempotency race lab").innerText(), /409/);
  await click("Lost response recovery", "Blind failover to PSP B");
  assert.match(await latest("Lost response recovery").innerText(), /UNSAFE/);
  await click("Lost response recovery", "Reset lab");
  await click("Lost response recovery", "Query original reference");
  await click("Double-entry ledger builder", "Validate + post capture");
  await click("Double-entry ledger builder", "Replay ₹1,000 capture event");
  assert.match(
    await latest("Double-entry ledger builder").innerText(),
    /suppressed/,
  );
  await click("Double-entry ledger builder", "Statement: ₹980 net + ₹20 fee");
  assert.equal(
    await lab("Double-entry ledger builder").locator("tbody tr").count(),
    5,
  );
  await click("Double-entry ledger builder", "Append capture reversal");
  assert.equal(
    await lab("Double-entry ledger builder").locator("tbody tr").count(),
    7,
  );
  await lab("Reconciliation investigator")
    .getByRole("combobox")
    .selectOption("1");
  await click("Reconciliation investigator", "missing internally");
  await click("Reconciliation investigator", "Investigate with evidence");
  assert.match(
    await latest("Reconciliation investigator").innerText(),
    /approval/,
  );
  await click("Reconciliation investigator", "Force totals to match");
  assert.match(
    await latest("Reconciliation investigator").innerText(),
    /REJECTED/,
  );
  for (const action of [
    "Accept + DB/outbox commit",
    "Relay publish",
    "Crash after commit, before ACK",
    "Duplicate delivery",
    "Consume + ACK",
  ])
    await click("Event pipeline failure lab", action);
  assert.match(
    await latest("Event pipeline failure lab").innerText(),
    /skip effect/,
  );
  await click("Scale the payment engine", "Provider UP");
  assert.match(
    await latest("Scale the payment engine").innerText(),
    /unavailable/,
  );
  await lab("Scale the payment engine")
    .getByRole("combobox")
    .selectOption("independent");
  assert.match(
    await lab("Scale the payment engine").locator(".pay-invariant").innerText(),
    /duplicate charges/,
  );
  const threats = [1, 0, 1, 0, 1];
  for (let i = 0; i < threats.length; i++) {
    const buttons = lab("Security threat scenarios").locator(
      ".pay-actions button",
    );
    await buttons.nth(threats[i]).click();
    if (i < 4) await click("Security threat scenarios", "Next threat");
  }
  assert.match(
    await lab("Security threat scenarios")
      .locator(".pay-invariant")
      .innerText(),
    /five security/,
  );
  await click("Partial refund concurrency", "Race A + B for same budget");
  assert.match(
    await latest("Partial refund concurrency").innerText(),
    /Rejected/,
  );
  await click("Partial refund concurrency", "Lose refund response");
  assert.match(
    await latest("Partial refund concurrency").innerText(),
    /retained/,
  );
  await click("Partial refund concurrency", "Confirm reserved refunds");
  await click("Payment incident control room", "Diagnose correlated signals");
  await click("Payment incident control room", "Contain new traffic safely");
  await click("Payment incident control room", "Recover original attempts");
  await click("Payment incident control room", "Verify financial closure");
  assert.match(
    await lab("Payment incident control room")
      .locator(".pay-invariant")
      .innerText(),
    /verified/,
  );
  const builder = lab("Architecture builder");
  await click("Architecture builder", "Run failure suite");
  assert.equal(await builder.locator(".pay-invariant.fail").count(), 7);
  for (const checkbox of await builder.getByRole("checkbox").all())
    await checkbox.check();
  await builder.getByRole("combobox").nth(0).selectOption("query");
  await builder.getByRole("combobox").nth(1).selectOption("fenced");
  await click("Architecture builder", "Run failure suite");
  assert.equal(await builder.locator(".pay-invariant.pass").count(), 7);
  const incidentAnswers = [1, 2, 1, 2, 0];
  for (let i = 0; i < 5; i++) {
    await lab("Five-round incident game")
      .locator(".pay-options button")
      .nth(incidentAnswers[i])
      .click();
    if (i < 4) await click("Five-round incident game", "Next incident →");
  }
  assert.match(
    await lab("Five-round incident game").innerText(),
    /All five incident responses/,
  );
  const { assessment } = await import("../src/lib/payments/engine.ts");
  const final = lab("Unguided final interview");
  assert.equal(await final.locator(".pay-score").count(), 0);
  for (let i = 0; i < assessment.length; i++)
    await final
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(assessment[i].correct)
      .check();
  await click("Unguided final interview", "Submit design for evaluation");
  assert.match(await final.locator(".pay-score").innerText(), /100 \/ 100/);
  assert.match(
    await final.locator(".pay-score").innerText(),
    /All six critical/,
  );
  await click("Unguided final interview", "Reset lab");
  assert.equal(await final.locator(".pay-score").count(), 0);
  assert.equal(await final.getByRole("radio", { checked: true }).count(), 0);
  for (let i = 0; i < assessment.length; i++)
    await final
      .locator("fieldset")
      .nth(i)
      .getByRole("radio")
      .nth(i === 2 ? 1 - assessment[i].correct : assessment[i].correct)
      .check();
  await click("Unguided final interview", "Submit design for evaluation");
  assert.match(await final.locator(".pay-score").innerText(), /90 \/ 100/);
  assert.match(
    await final.locator(".pay-score").innerText(),
    /No blind duplicate charges/,
  );
  assert.match(
    await final.locator(".pay-score").innerText(),
    /Revise the design/,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
    "auto",
  );
  await page.goto(url);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Skip to content");
  const reset = lab("Payment state machine playground").getByRole("button", {
    name: "Reset lab",
    exact: true,
  });
  await reset.focus();
  await page.keyboard.press("Enter");
  assert.match(
    await latest("Payment state machine playground").innerText(),
    /No money moved/,
  );
  for (const href of await page
    .locator(".case-progress a, .lesson-pager a")
    .evaluateAll((els) => els.map((e) => e.getAttribute("href")))) {
    assert.ok(href.startsWith(base + "/"), href);
    assert.equal((await page.request.get(origin + href)).status(), 200, href);
  }
  // HTTP smoke all existing lessons and case studies using the exported route tree.
  for (const folder of ["learn", "case-studies"])
    for (const slug of fs.readdirSync(path.join(root, folder))) {
      assert.equal(
        (
          await page.request.get(
            origin + base + "/" + folder + "/" + slug + "/",
          )
        ).status(),
        200,
        slug,
      );
    }
  await page.goto(origin + base + "/", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".case-card").count(), 7);
  assert.equal(
    await page
      .locator('a[href="' + base + '/case-studies/payment-system/"]')
      .count(),
    1,
  );
  await page
    .locator('a[href="' + base + '/case-studies/payment-system/"]')
    .click();
  await page.waitForURL(
    (u) =>
      u.pathname.replace(/\/$/, "") === base + "/case-studies/payment-system",
  );
  await page
    .getByRole("heading", { name: "Follow your money", exact: true })
    .waitFor();
  assert.equal(await page.locator(".pay-lab").count(), 15);
  await page
    .locator(".case-progress a")
    .filter({ hasText: "Real-Time Chat" })
    .click();
  await page.waitForURL(
    (u) =>
      u.pathname.replace(/\/$/, "") === base + "/case-studies/realtime-chat",
  );
  await page.locator(".lesson-pager__next").click();
  await page.waitForURL(
    (u) =>
      u.pathname.replace(/\/$/, "") === base + "/case-studies/payment-system",
  );
  await page
    .getByRole("heading", { name: "Follow your money", exact: true })
    .waitFor();
  assert.equal(await page.locator(".pay-lab").count(), 15);
  await page
    .locator("#ledger")
    .screenshot({ path: path.join(output, "ledger-desktop.png") });
  await page
    .locator("#architecture")
    .screenshot({ path: path.join(output, "architecture-desktop.png") });
  if (errors.length || failedRequests.length)
    console.log(JSON.stringify({ errors, failedRequests }, null, 2));
  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
  fs.writeFileSync(
    path.join(output, "results.json"),
    JSON.stringify(
      {
        viewports: [390, 768, 1024, 1440],
        labs: 13,
        games: 2,
        labsExercised: true,
        accessibility,
        keyboard: true,
        reducedMotion: true,
        horizontalOverflow: false,
        consoleErrors: errors,
        failedRequests,
        passed: true,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      passed: true,
      output,
      checks:
        "4 viewports, all labs, architecture graph, incident rounds, assessment 100-pass/90-gate-fail, keyboard, reduced motion, anchors, 30 lessons + 4 case studies and Pages assets",
    }),
  );
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
