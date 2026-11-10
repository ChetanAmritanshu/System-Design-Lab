import test from "node:test";
import assert from "node:assert/strict";
import {
  initialPayment,
  transition,
  transitionAtVersion,
  paymentEvents,
  initialRace,
  claimRequest,
  completeClaims,
  initialLedger,
  balanced,
  postJournal,
  captureJournal,
  reversal,
  accountBalance,
  initialRefunds,
  reserveRefund,
  settleRefunds,
  initialPipeline,
  pipelineStep,
  estimate,
  capacity,
  components,
  architectureEdges,
  edgeKey,
  initialDesign,
  evaluateDesign,
  reconRows,
  classifyRecon,
  assessment,
  rubric,
  grade,
} from "../src/lib/payments/engine.ts";

const prepared = (events) => events.reduce(transition, initialPayment());
test("card manual authorization/capture and intent ownership", () => {
  let p = prepared(["confirm", "action", "authorize", "capture"]);
  assert.equal(p.intent, "succeeded");
  assert.equal(p.attempt, "captured");
  assert.equal(p.captured, 100000);
  assert.equal(p.provider, "captured");
  assert.equal(p.version, 4);
  assert.equal(p.refunded, 0);
});
test("all state/event combinations preserve valid transitions and integer amounts", () => {
  const paths = [
    [],
    ["confirm"],
    ["confirm", "action"],
    ["confirm", "authorize"],
    ["confirm", "authorize", "capture"],
    ["confirm", "decline"],
    ["void"],
    ["confirm", "timeout"],
  ];
  const allowed = {
    created: ["confirm", "void"],
    processing: ["action", "authorize", "timeout", "decline"],
    requires_action: ["authorize", "decline"],
    authorized: ["capture", "void"],
    captured: ["query", "webhook"],
    failed: [],
    voided: [],
    unknown: ["query", "webhook"],
  };
  for (const path of paths) {
    const p = prepared(path);
    for (const event of paymentEvents) {
      const before = structuredClone(p),
        result = transition(p, event);
      assert.deepEqual(p, before, "pure transition must not mutate its input");
      assert.ok(result.captured <= result.amount);
      assert.ok(result.refunded <= result.captured);
      if (!allowed[p.attempt].includes(event)) {
        assert.equal(
          result.version,
          p.version,
          `${p.attempt} + ${event} version`,
        );
        assert.equal(
          result.attempt,
          p.attempt,
          `${p.attempt} + ${event} state`,
        );
      }
      assert.equal(result.history.length, p.history.length + 1);
    }
  }
});
test("illegal capture, repeat confirmation, terminal failure and void do not fabricate money", () => {
  assert.equal(transition(initialPayment(), "capture").captured, 0);
  assert.equal(prepared(["confirm", "confirm"]).version, 1);
  assert.equal(
    prepared(["confirm", "decline", "capture", "authorize"]).attempt,
    "failed",
  );
  assert.equal(
    prepared(["confirm", "authorize", "void", "capture"]).attempt,
    "voided",
  );
  assert.equal(
    prepared(["confirm", "action", "void"]).attempt,
    "requires_action",
  );
});
test("concurrent state writes compare expected versions before applying", () => {
  const authorized = prepared(["confirm", "authorize"]);
  const captured = transitionAtVersion(
    authorized,
    "capture",
    authorized.version,
  );
  const staleVoid = transitionAtVersion(captured, "void", authorized.version);
  assert.equal(staleVoid.attempt, "captured");
  assert.equal(staleVoid.version, captured.version);
  assert.match(staleVoid.history.at(-1), /Rejected stale write/);
});
test("lost response is UNKNOWN; restart, query, duplicate/out-of-order callbacks recover original effect", () => {
  const unknown = prepared(["confirm", "timeout"]);
  assert.equal(unknown.attempt, "unknown");
  assert.equal(unknown.provider, "captured");
  assert.equal(unknown.captured, 0);
  const restarted = transition(unknown, "restart");
  assert.equal(restarted.attempt, "unknown");
  const recovered = transition(restarted, "query");
  assert.equal(recovered.captured, 100000);
  const first = transition(recovered, "webhook"),
    duplicate = transition(first, "webhook");
  assert.equal(duplicate.version, first.version);
  assert.equal(duplicate.seen.length, 1);
  const stale = transition(duplicate, "stale");
  assert.equal(stale.attempt, "captured");
  assert.equal(transition(stale, "decline").attempt, "captured");
});
test("100 simultaneous logical requests serialize to one durable claim and provider call", () => {
  let s = initialRace();
  for (let i = 0; i < 100; i++)
    s = claimRequest(s, "tenant:confirm:key", "INR:100000");
  assert.equal(s.claims.length, 1);
  assert.equal(s.calls, 1);
  assert.equal(s.effects, 1);
  assert.match(s.history.at(-1), /202/);
  s = completeClaims(s);
  s = claimRequest(s, "tenant:confirm:key", "INR:100000");
  assert.match(s.history.at(-1), /200 replay/);
  assert.equal(s.calls, 1);
});
test("idempotency fingerprints conflict, scopes isolate, unsafe race demonstrates duplicate effects", () => {
  let s = claimRequest(initialRace(), "tenant:confirm:key", "INR:100000");
  s = claimRequest(s, "tenant:confirm:key", "INR:200000");
  assert.equal(s.calls, 1);
  assert.match(s.history.at(-1), /409/);
  s = claimRequest(s, "other:confirm:key", "INR:100000");
  assert.equal(s.calls, 2);
  let unsafe = claimRequest(initialRace(), "same", "same", false);
  unsafe = claimRequest(unsafe, "same", "same", false);
  assert.equal(unsafe.effects, 2);
});
test("journals balance by currency, validate minor units, and reject mixed-currency offset", () => {
  assert.ok(balanced(captureJournal().lines));
  const bad = captureJournal();
  bad.lines[1].credit = 99999;
  assert.equal(balanced(bad.lines), false);
  assert.equal(postJournal(initialLedger(), bad).journals.length, 0);
  const mixed = captureJournal();
  mixed.lines[1].currency = "USD";
  assert.equal(balanced(mixed.lines), false);
  const fractional = captureJournal();
  fractional.lines[0].debit = 1.1;
  assert.equal(balanced(fractional.lines), false);
  const negative = captureJournal();
  negative.lines[0].debit = -100000;
  assert.equal(balanced(negative.lines), false);
  const zero = captureJournal();
  zero.lines.forEach((l) => {
    l.debit = 0;
    l.credit = 0;
  });
  assert.equal(balanced(zero.lines), false);
});
test("unique immutable journal identity prevents duplicate posting and payload replacement", () => {
  const original = initialLedger(),
    j = captureJournal(),
    posted = postJournal(original, j);
  assert.equal(original.journals.length, 0);
  assert.equal(posted.journals.length, 1);
  assert.equal(postJournal(posted, captureJournal()).journals.length, 1);
  j.lines[0].debit = 5;
  assert.equal(posted.journals[0].lines[0].debit, 100000);
  const conflict = captureJournal();
  conflict.lines.forEach((l) => {
    l.debit *= 2;
    l.credit *= 2;
  });
  assert.equal(postJournal(posted, conflict).journals.length, 1);
  assert.equal(accountBalance(posted, "psp_receivable"), 100000);
  assert.equal(accountBalance(posted, "merchant_payable"), 100000);
});
test("reversal must invert original exactly, append once, and preserve original entries", () => {
  const s = postJournal(initialLedger(), captureJournal()),
    reversed = postJournal(s, reversal(s.journals[0]));
  assert.equal(reversed.journals.length, 2);
  assert.equal(accountBalance(reversed, "merchant_payable"), 0);
  assert.equal(s.journals[0].lines[0].debit, 100000);
  assert.equal(
    postJournal(reversed, {
      ...reversal(s.journals[0]),
      id: "another-reversal",
    }).journals.length,
    2,
  );
  const fake = reversal(s.journals[0]);
  fake.lines.forEach((l) => {
    l.debit *= 2;
    l.credit *= 2;
  });
  assert.equal(postJournal(s, fake).journals.length, 1);
  assert.equal(
    postJournal(initialLedger(), reversal(captureJournal())).journals.length,
    0,
  );
});
test("partial refund reservations include pending, survive duplicate and conflicting requests", () => {
  let s = reserveRefund(initialRefunds(), "a", 70000);
  s = reserveRefund(s, "b", 70000);
  assert.equal(s.reserved, 70000);
  s = reserveRefund(s, "a", 70000);
  assert.equal(s.reserved, 70000);
  s = reserveRefund(s, "a", 30000);
  assert.match(s.history.at(-1), /409/);
  s = settleRefunds(s);
  assert.equal(s.completed, 70000);
  assert.equal(s.reserved, 0);
  s = reserveRefund(s, "b", 30000);
  s = settleRefunds(s);
  assert.equal(s.completed, 100000);
  assert.equal(reserveRefund(s, "c", 1).completed, 100000);
  assert.equal(reserveRefund(initialRefunds(), "a", -1).reserved, 0);
  assert.equal(reserveRefund(initialRefunds(), "a", 0.5).reserved, 0);
  assert.equal(settleRefunds(s).completed, 100000);
});
test("commit-before-ACK, duplicate messages, DB/provider failure and DLQ redrive retain invariants", () => {
  let s = initialPipeline();
  s = pipelineStep(s, "accept");
  assert.equal(pipelineStep(s, "accept").outbox, 1);
  const down = pipelineStep(s, "db-down");
  assert.equal(down.outbox, 1);
  assert.equal(down.posted, 0);
  s = pipelineStep(down, "publish");
  s = pipelineStep(s, "crash");
  assert.equal(s.queue, 1);
  assert.equal(s.posted, 1);
  assert.equal(s.acked, false);
  s = pipelineStep(s, "duplicate");
  s = pipelineStep(s, "consume");
  s = pipelineStep(s, "consume");
  assert.equal(s.queue, 0);
  assert.equal(s.posted, 1);
  assert.equal(s.acked, true);
  s = pipelineStep(s, "duplicate");
  s = pipelineStep(s, "provider-delay");
  assert.equal(s.queue, 1);
  s = pipelineStep(s, "poison");
  assert.equal(s.dlq, 1);
  assert.equal(s.queue, 0);
  s = pipelineStep(s, "redrive");
  s = pipelineStep(s, "consume");
  assert.equal(s.posted, 1);
  assert.equal(s.dlq, 0);
});
test("reconciliation classifies matching, missing, timing, currency, amount and duplicate evidence", () => {
  assert.deepEqual(reconRows.map(classifyRecon), [
    "matched",
    "missing internally",
    "amount mismatch",
    "within settlement window",
    "currency mismatch",
    "duplicate report",
  ]);
  assert.equal(
    classifyRecon({ ...reconRows[3], age: 4 }),
    "missing externally",
  );
  assert.equal(
    classifyRecon({ ...reconRows[0], net: 97000 }),
    "amount mismatch",
  );
});
test("estimates and capacity expose assumptions and limiting resource, including provider outage", () => {
  const e = estimate({
    daily: 10000000,
    peak: 10,
    reads: 3,
    days: 365,
    bytes: 4000,
    latency: 800,
    availability: 99.9,
  });
  assert.ok(Math.abs(e.tps - 115.74074) < 0.001);
  assert.equal(e.storage, 14600);
  assert.ok(Math.abs(e.downtime - 2592) < 0.001);
  assert.equal(capacity(1200, 800, 100, 20, 2000).service, 125);
  assert.equal(capacity(1200, 800, 4000, 20, 2000).service, 1000);
  assert.equal(capacity(1200, 800, 4000, 100, 2000, true).service, 0);
});
test("architecture suite evaluates graph connections and policies, not checkbox counts", () => {
  const complete = {
    nodes: components.map((c) => c.id),
    edges: architectureEdges.map(([a, b]) => edgeKey(a, b)),
    recovery: "query",
    region: "fenced",
    inbox: true,
  };
  assert.ok(evaluateDesign(complete).every((r) => r.pass));
  assert.ok(
    evaluateDesign({ ...complete, region: "consensus" }).every((r) => r.pass),
  );
  assert.ok(evaluateDesign({ ...complete, edges: [] }).some((r) => !r.pass));
  for (const removed of [
    "idempotency",
    "db",
    "outbox",
    "ledger",
    "webhooks",
    "workers",
  ]) {
    assert.ok(
      evaluateDesign({
        ...complete,
        nodes: complete.nodes.filter((n) => n !== removed),
      }).some((r) => !r.pass),
    );
  }
  assert.equal(
    evaluateDesign({ ...complete, recovery: "failover" })[1].pass,
    false,
  );
  assert.equal(
    evaluateDesign({ ...complete, region: "unfenced" })[5].pass,
    false,
  );
  assert.equal(evaluateDesign({ ...complete, inbox: false })[3].pass, false);
  assert.ok(evaluateDesign(initialDesign()).every((r) => !r.pass));
});
test("interview scoring totals 100; each critical gate fails independently of total score", () => {
  const answers = assessment.map((q) => q.correct),
    perfect = grade(answers);
  assert.equal(
    rubric.reduce((s, r) => s + r.max, 0),
    100,
  );
  assert.equal(perfect.total, 100);
  assert.equal(perfect.passed, true);
  assert.deepEqual(
    perfect.categories.map((c) => c.score),
    [15, 15, 20, 20, 15, 15],
  );
  assert.equal(assessment.filter((q) => q.gate).length, 6);
  assessment.forEach((q, i) => {
    if (q.gate) {
      const changed = [...answers];
      changed[i] = 1 - q.correct;
      const score = grade(changed);
      assert.equal(score.passed, false);
      assert.deepEqual(score.failures, [q.gate]);
    }
  });
  assert.equal(grade(assessment.map(() => -1)).total, 0);
});
test("reset constructors return independent empty models for replay", () => {
  for (const init of [
    initialPayment,
    initialRace,
    initialLedger,
    initialRefunds,
    initialPipeline,
    initialDesign,
  ]) {
    const a = init(),
      b = init();
    assert.deepEqual(a, b);
    assert.notEqual(a, b);
  }
  const a = initialPayment();
  a.history.push("changed");
  assert.equal(initialPayment().history.length, 1);
});
