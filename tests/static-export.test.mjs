import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { normalizeStaticSegments } from "../scripts/normalize-static-segments.mjs";

test("nested Windows segments gain flat aliases; repeated/already-correct exports are unchanged", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "payment-export-test-"));
  try {
    const route = path.join(root, "case-studies", "payment-system");
    const nested = path.join(route, "__next.case-studies", "payment-system");
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, "__PAGE__.txt"), "segment bytes");
    fs.writeFileSync(path.join(route, "index.html"), "html bytes");
    assert.equal(normalizeStaticSegments(root), 1);
    assert.equal(
      fs.readFileSync(
        path.join(route, "__next.case-studies.payment-system.__PAGE__.txt"),
        "utf8",
      ),
      "segment bytes",
    );
    assert.equal(normalizeStaticSegments(root), 0);
    assert.equal(
      fs.readFileSync(path.join(route, "index.html"), "utf8"),
      "html bytes",
    );
    fs.writeFileSync(
      path.join(route, "__next.case-studies.payment-system.__PAGE__.txt"),
      "conflict",
    );
    assert.throws(
      () => normalizeStaticSegments(root),
      /Conflicting static segment/,
    );
  } finally {
    assert.ok(
      path
        .resolve(root)
        .startsWith(
          path.resolve(os.tmpdir()) + path.sep + "payment-export-test-",
        ),
    );
    fs.rmSync(root, { recursive: true, force: true });
  }
});
