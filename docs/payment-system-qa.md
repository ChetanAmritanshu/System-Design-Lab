# Payment System · implementation and QA

Route: `/case-studies/payment-system/`. GitHub Pages prefix: `/System-Design-Lab`.

## Scope and module inventory

The continuous story follows order-42 for ₹1,000 INR through a multi-PSP orchestrator. The internal chart of accounts assumes a platform entitled to a PSP receivable and owing the merchant. A non-custodial gateway must not treat these as its own assets/liabilities. Banks, networks, rails and regulators remain outside the modeled system.

| Module | Experiment / teaching outcome |
| --- | --- |
| 01 · How payments work | Follow your money: inspect participants and advance card or conceptual bank/UPI-style paths |
| 02 · Requirements and estimation | Adjust daily volume, peak multiplier, read/write ratio, retention, record size, latency and availability |
| 03 · V1 and APIs | Illustrative tenant-owned contracts, stable intent/attempt/refund IDs, minor units, tables, constraints, indexes and version fields |
| 04 · Payment states | Legal/illegal transitions, customer action, manual capture, UNKNOWN, restart, duplicate/stale callbacks and stale CAS write |
| 05 · Idempotency and concurrency | Race API replicas, conflict a fingerprint, persist/replay outcomes, compare unsafe check-then-act |
| 06 · Unknown provider outcomes | Recover original attempt via query/callback; expose duplicate effects from blind PSP failover |
| 07 · Ledger and money | Build balanced journals, reject invalid lines, suppress duplicate identities, record settlement fees, append reversals |
| 08 · Settlement and reconciliation | Classify six evidence packets, investigate missing/mismatched/duplicate/timing records, reject invented corrections |
| 09 · Distributed event pipeline | Outbox/publish/inbox/consumer flow, commit-before-ACK crash, duplicates, DB/provider failure, poison/DLQ/redrive |
| 10 · Scale and regions | Traffic, worker/pool/quota constraints, provider outage and fenced/consensus/independent write ownership |
| 11 · Security and fraud | Five scenarios for business validation, tenant authorization, replay, sensitive logs and refund velocity |
| 12 · Advanced workflows | Partial refund reservation race and ceilings; deep dives on captures, disputes, payouts, recurring methods, FX and rail capabilities |
| 13 · Operations | Four-stage incident timeline: diagnosis, safe containment, recovery and evidence-based financial closure |
| 14 · Final architecture | Constrained graph builder evaluates directed paths, atomic boundaries, uncertainty and regional policies |

There are **13 interactive labs**, plus a **five-round incident game** and **unguided final assessment**. Module 03 provides API/data-model examples rather than a fake HTTP service. Every lab has objective/control guidance, deterministic state/history, reset, consequences and an explicit simplification label. Controls are native keyboard-operable elements; the new page does not require automatic animation.

The interview guide includes a 45–60-minute outline, 60-second framing, requirements/architecture/invariant checklists, mistakes, trade-offs and 20 follow-up questions. The final assessment hides feedback until all 11 structured decisions are submitted. Points sum to 100 across six categories (15/15/20/20/15/15). Six critical gates are independent of total score; 90/100 can still fail. It does not automatically grade prose.

## Correctness boundaries

- A durable unique tenant/endpoint/key reservation with a canonical fingerprint serializes duplicate claims; completed responses replay. Provider identity and retention are separate capabilities.
- Timeout is a local knowledge state, not definitive provider failure. Query/callback/reconciliation recover the original attempt; blind cross-PSP retry can charge twice.
- Attempt and intent are distinct; captured/refunded, settlement and disputes are separate dimensions. Stale evidence cannot erase a confirmed capture. Expected-version writes reject stale updates.
- Completed plus pending refund reservations cannot exceed captured amount. Unknown refund results retain their reservation.
- Journals have positive integer minor-unit lines and equal debit/credit totals per currency. Posting is atomic in the model, uniquely identified and immutable. A reversal exactly inverts an existing journal once.
- Outbox and business state share a modeled transaction. Inbox/business identity and journal commit precede ACK. At-least-once redelivery cannot create another journal.
- Balanced books do not establish settlement. Corrections require external evidence and an audit path; unresolved discrepancies remain exceptions.
- Regional failover needs fenced ownership or a coordinated write protocol plus explicit replication/RPO/RTO guarantees.

## Files and integration

- `src/app/case-studies/payment-system/page.tsx` and `payment-system.css`: route, metadata, 14 modules, scoped responsive design.
- `src/content/payment-system.ts`: typed curriculum, APIs, incident evidence, interview guide and follow-ups.
- `src/lib/payments/engine.ts`: pure deterministic simulation, graph and grading functions.
- `src/components/payments/lab-ui.tsx`, `core-labs.tsx`, `operations-labs.tsx`, `interview.tsx`: focused presentation and controls.
- `src/data/topics.ts`, homepage, case-study progress and chat’s next pager: activate Case 04, keep four live / three planned, retain all 30 lessons and three prior cases.
- Shared case progress CSS accommodates five entries including planned YouTube.
- `tests/payments.test.mjs`, `tests/static-export.test.mjs`: domain/invariant and export regression tests.
- `tests/payment-browser.mjs`: optional actual-browser QA against the Pages export.
- `scripts/normalize-static-segments.mjs`: flat static prefetch aliases for Windows exports; Linux output remains unchanged.
- `package.json`, deployment workflow and README: build normalization, simulation test command and CI invariant step. No runtime dependencies were added; lockfile unchanged.

## Baseline and validation environment

Baseline commit: `17637e1` (Complete fundamentals and launch case studies). Workspace initially clean. Existing source note `06_Payment_System_Explained.docx` was read from the fetched High-Level-Design repository. Official provider, AWS, PCI SSC and NPCI references are linked from the new page; provider-specific behavior is identified as such.

`npm ci` restored the locked dependencies. Host: Windows, Node 26.13.0, npm 11.20.0. README/CI uses Node 24; the pure TypeScript tests were also executed with Node 24.22.2. No dependency upgrades were made. Installation reported 10 existing audit findings (7 moderate, 2 high, 1 critical); dependency remediation remains a separate task. Node emits a harmless module-type detection warning while importing the TypeScript test model; no package-wide module-mode change was made.

Before implementation, lint, typecheck, production build and Pages build all passed. Browser QA later exposed a Windows Next.js 16.3.7 export mismatch: nested `__next.*` segment directories were emitted while the client requested flattened `.txt` names. The normalization script adds content-identical flat aliases, refuses conflicting destinations, preserves original files, and is covered by a temporary-directory test. It does not rewrite routes, HTML, assets, the base path or Next configuration.

## Verification commands

```sh
npm run test:payments
npm run lint
npm run typecheck
npm run build
npm run build:pages
git diff --check
```

Optional browser QA uses an externally installed Playwright and installed browser, avoiding new application dependencies:

```powershell
$env:PLAYWRIGHT_MODULE = 'ABSOLUTE_PATH_TO_PLAYWRIGHT/index.mjs'
$env:PAYMENT_BROWSER = 'ABSOLUTE_PATH_TO_BROWSER_EXECUTABLE'
# Optional: axe module export (dist/index.js) for automated accessibility scans
$env:AXE_MODULE = 'ABSOLUTE_PATH_TO_AXE_PLAYWRIGHT/dist/index.js'
node tests/payment-browser.mjs
```

The test serves the actual `out/` artifact at the Pages prefix on port 4173. Screenshots and JSON go to the system temporary `payment-system-qa` directory, or `PAYMENT_QA_OUTPUT`. It checks 390/768/1024/1440 widths; hidden horizontal overflow; anchors; controls across all labs; graph failures and successes; all five incident rounds; assessment pass, gate failure and reset; keyboard/slider operation; reduced motion; client navigation; all 30 lesson and four case routes; browser errors and failed asset requests. Optional axe scans cover the payment article at 390 and 1440, not a formal whole-site/manual assistive-technology audit.

## Known limitations and future extensions

- Educational in-memory models, not a payment backend, cryptographic verifier, durable SQL implementation, distributed concurrency benchmark, certification or complete bank.
- Concurrency races are deterministic serializations of atomic claims; failure injection represents discrete events, not real network timing. Capacity equations are declared synthetic assumptions; no p99 or production sizing guarantee.
- Architecture rules validate declared graph/configuration boundaries, not a deployed consensus/fencing implementation. Two regional ownership policies are accepted. Low-load synchronous alternatives are explained separately from the asynchronous failure suite.
- Refund and ledger labs are separate exercises; real implementations must join state, financial identity and relevant postings within documented transactional/recovery boundaries.
- Capture, settlement, chargeback, payout, FX, recurring and UPI details depend on provider/rail contracts. Advanced workflows are optional deep dives rather than full rail simulators.
- No cross-session learning persistence, arbitrary-prose grading or real financial effects. Screen-reader behavior beyond semantic/automated checks needs a separate manual audit.
- Before deployment, review the feature branch against main. The existing Pages workflow deploys pushes to main, not a feature branch; a successful local export alone is not a production deployment.

## Final verification result

| Check | Result |
| --- | --- |
| Simulation/export tests | 18 passed on Node 24.22.2 and Node 26.13.0 |
| ESLint / TypeScript | Passed |
| Production build / Pages build | Passed; 30 lessons and four case-study routes preserved |
| Windows export normalization | 35 flat aliases added; repeated runs add none |
| Browser | Passed in installed Edge/Chromium at 390, 768, 1024 and 1440 pixels |
| Overflow / console / hydration / resource requests | No detected page overflow, browser errors or failed resource requests |
| Interaction QA | Every lab exercised; graph failure/success, five incident rounds, 100-point pass and 90-point critical-gate failure, reset, keyboard and reduced motion passed |
| Navigation | All module anchors, client transitions and HTTP smoke checks for all 30 lessons / four cases passed |
| Automated accessibility | Zero axe violations in the payment article at 390 and 1440 pixels; not a full manual audit |
| Diff review | Expected 21 files only; no unrelated changes; whitespace check passed |

Browser screenshots and machine-readable results were generated in the system temporary `payment-system-qa` directory. The feature branch is `codex/payment-system-case-study`; production deployment is separate from local validation and branch publication. The deployment workflow still runs on main pushes/manual dispatch.
