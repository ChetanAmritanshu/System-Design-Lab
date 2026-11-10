# System Design Lab

An interactive visual learning experience for High-Level System Design.

**Don’t memorize architectures. Learn why they exist.**

System Design Lab turns system-design concepts into small visual experiments: start with the simplest architecture, apply pressure, observe what fails, and introduce the component that solves that specific problem.

> Build simple. Break it. Understand why it broke. Then scale it.

## Live website

[chetanamritanshu.github.io/System-Design-Lab](https://chetanamritanshu.github.io/System-Design-Lab/)

The current release includes:

- an animated System Lab homepage and complete 30-topic learning map
- all 30 interactive fundamentals, from client–server architecture to production safety and system design communication
- four available case studies: URL Shortener, Distributed Rate Limiter, Real-Time Chat, and Payment System
- a 14-module Payment System case study with 13 deterministic labs, architecture builder, five-round incident game, guided interview, and a structured 100-point final assessment
- responsive navigation, keyboard controls, reduced-motion support, and static GitHub Pages export
- planned YouTube, Uber, and Notification System case studies

## Source material

The educational source notes remain in the separate [ChetanAmritanshu/High-Level-Design](https://github.com/ChetanAmritanshu/High-Level-Design) repository. This repository contains only the website presentation layer and typed web content derived from those notes.

Examples of the source-to-lesson mapping:

```text
High-Level-Design/01_Client_Server_Architecture.docx
  → src/content/client-server.ts
  → src/app/learn/client-server/page.tsx

High-Level-Design/02_DNS_Fundamentals.docx
  → src/content/dns.ts
  → src/app/learn/dns/page.tsx

High-Level-Design/03_HTTP_HTTPS_and_TLS.docx
  → src/content/http-tls.ts
  → src/app/learn/http-https-tls/page.tsx

High-Level-Design/04_HTTP_Evolution_HTTP_1_1_HTTP_2_HTTP_3_QUIC.docx
  → src/content/http-evolution.ts
  → src/app/learn/http-evolution/page.tsx
```

The original DOCX and PDF files are not parsed at runtime and are not copied into this repository. Later lessons and case studies compose typed content and dedicated labs directly. Payment System derives from `06_Payment_System_Explained.docx`, with primary references linked at the end of its page.

## Payment System · Case 04

Route: `/case-studies/payment-system/` (Pages: `/System-Design-Lab/case-studies/payment-system/`).

The continuous story follows a ₹1,000 order through 14 modules:

1. Payment participants, card versus bank/UPI-style flows, and scope.
2. Requirements and transparent workload estimates.
3. V1 architecture, tenant-scoped illustrative APIs, data and money representation.
4. Intent/attempt state machine and external evidence.
5. Idempotency, concurrent claims and request fingerprints.
6. Provider execution, lost responses and UNKNOWN recovery.
7. Double-entry ledger, account types, immutable postings and reversals.
8. Settlement, gross/fee/net matching and evidence-driven reconciliation.
9. Outbox/inbox, queues, crash recovery and DLQ redrive.
10. Provider quotas, concurrency, capacity and regional ownership.
11. Tokenization, webhook verification, tenant authorization and operational security.
12. Refund reservations and provider-dependent advanced workflows.
13. Observability, incident containment and financial closure.
14. Graph-based architecture builder and explicit correctness policies.

The interview masterclass includes a 45–60-minute guide, five replayable incidents, 20 follow-ups and an independent structured assessment. The rubric totals 100; six financial safety gates must pass regardless of score. Free-form prose is not automatically graded.

Implementation: `src/lib/payments/engine.ts` contains pure deterministic domain models; `src/content/payment-system.ts` holds the curriculum; `src/components/payments/` contains focused UI/labs; the route has scoped CSS. No payment SDK, credentials, backend or real-money network requests are used. Capacity formulas are synthetic assumptions, not benchmarks. The platform chart of accounts is illustrative; rail capabilities and accounting/compliance policies require separate assessment.

Run `npm run test:payments` on Node 24+ for the simulation invariants. See [payment implementation and QA notes](docs/payment-system-qa.md) for validation and known limits.

## Local development

Requirements: Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Before contributing, run:

```bash
npm run test:payments
npm run lint
npm run typecheck
npm run build
npm run build:pages
```

## Project structure

```text
src/
  app/                 App Router pages and global visual system
  components/
    diagrams/          Architecture visuals
    labs/              Interactive teaching simulations
    lesson/            Reusable lesson presentation patterns
    ui/                Shared interface primitives
  content/             Typed lesson content derived from source notes
  data/                Learning map and case-study metadata
```

## Adding a lesson

1. Keep the original source note in `High-Level-Design`.
2. Extract and verify its useful technical structure.
3. Add a typed module under `src/content/`.
4. Compose the lesson from existing visual and lab primitives, adding abstractions only when they are reusable.
5. Add a static App Router page under `src/app/learn/`.
6. Mark the corresponding entry in `src/data/topics.ts` as available.
7. Run the complete validation commands above.

## GitHub Pages deployment

The application uses Next.js static export. When `GITHUB_PAGES=true`, [next.config.ts](./next.config.ts) applies the `/System-Design-Lab` base path and asset prefix. The export is written to `out/` with `.nojekyll` included.

Both build commands normalize static route-segment filenames after export. This adds the flat prefetch aliases expected by Next.js on Windows; already-correct Linux exports are unchanged. A regression test covers normalization, repeated runs, and conflicting files.

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml), which installs dependencies, validates the project, builds the Pages export, uploads `out/`, and deploys through the official GitHub Pages actions.

No backend, database, authentication, or server runtime is required.
