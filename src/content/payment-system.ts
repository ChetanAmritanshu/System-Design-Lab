export type PaymentModule = {
  id: string;
  title: string;
  question: string;
  explanation: string;
  pressure: string;
  solution: string;
  invariant: string;
  deepTitle: string;
  deep: string;
  interview: string;
};
export const paymentModules: PaymentModule[] = [
  {
    id: "money",
    title: "How payments really work",
    question: "The customer clicks Pay for ₹1,000. Where is the money?",
    explanation:
      "A payment intent records what a merchant wants to collect; an attempt records one execution against one provider. An authorization is permission and a temporary hold. Capture submits an authorized amount for collection. Clearing exchanges transaction details; settlement moves obligations between participants. A successful checkout can precede both merchant funds availability and payout.",
    pressure:
      "The browser says success, but the merchant’s bank has not received money.",
    solution:
      "Track payment execution, settlement and payout separately. The merchant owns the order; the PSP owns its operation; issuer and rail evidence determine external movement. Our orchestrator owns its attempts and internal books.",
    invariant: "Checkout success ≠ settled cash ≠ merchant payout.",
    deepTitle: "Choose the scope before drawing boxes",
    deep: "A: Merchant checkout uses one PSP and its hosted payment collection. B: This lesson’s multi-PSP orchestrator authenticates merchants, selects adapters, tracks attempts and maintains illustrative internal financial records. C: A processor/financial platform also owns deeper clearing, settlement and ledger workflows. Our internal ledger does not make B a complete bank. Acquirers serve merchants; issuers serve cardholders; networks connect them. Banks, rails and regulators remain outside this simplified boundary. UPI/bank-transfer-style flows need their own identifiers, payer approval and asynchronous status; do not assume card authorization/capture semantics apply to them. Fees reduce proceeds or create separate expenses according to the contract; available balances and payouts need distinct rules.",
    interview:
      "Who can authoritatively confirm a capture, a bank settlement, and a merchant payout?",
  },
  {
    id: "requirements",
    title: "Requirements & estimation",
    question:
      "Ten million payments a day sounds large. What actually sets capacity?",
    explanation:
      "Support create, confirm and query; capture/void when the rail supports them; full/partial refunds; authenticated provider events; internal records; reconciliation; and multiple PSPs. Prioritize financial integrity, durability, auditability, availability, bounded latency, uncertainty recovery, security and observable operations.",
    pressure:
      "Averages hide peak traffic, expensive writes and slow external calls.",
    solution:
      "Estimate peak TPS, query TPS, storage and in-flight operations separately. Budget recovery and reconciliation work as well as new payments. State the workload assumptions before promising an SLO.",
    invariant:
      "Durably accepted work remains recoverable through overload and failover.",
    deepTitle: "From arithmetic to capacity planning",
    deep: "Average TPS = daily payments / 86,400. Peak = average × peak multiplier. Read TPS = peak × read/write ratio. Logical storage = daily × retention days × bytes per payment bundle. A bundle must budget intents, attempts, history, idempotency, journals and indexes; replication, backups and queue overhead are additional. Little’s law estimates in-flight work = throughput × external latency in seconds. It does not predict tail latency or p99. A 30-day availability budget uses 2,592,000 seconds; availability alone says nothing about whether financial recovery is correct.",
    interview:
      "What assumptions change when retries, webhooks and three attempts per checkout are included?",
  },
  {
    id: "api",
    title: "V1 architecture & API design",
    question: "What is the smallest useful system we can explain?",
    explanation:
      "Checkout → authenticated Payment API → durable database → PSP adapter. Start with one transaction boundary and one provider. Store an attempt identity before dispatch; the PSP call is outside the database transaction, so recovery is required even in V1.",
    pressure:
      "Two tenants submit the same ID, or ₹1,000 is accidentally represented as a floating-point approximation.",
    solution:
      "Authorize ownership from the server-side identity, validate currency-aware integer minor units, scope idempotency by tenant and operation, and carry intent, attempt, provider reference and correlation IDs.",
    invariant:
      "A tenant cannot read, confirm, capture or refund another tenant’s payment.",
    deepTitle: "Data model & transaction boundaries",
    deep: "payment_intents(id, tenant_id, order_id, currency, amount_minor, status, version); attempts(id, intent_id, provider_account, provider_ref, provider_key, observed_status, recovery_due_at, version); idempotency(tenant_id, endpoint, key UNIQUE, fingerprint, status, response, expires_at); refunds(id, payment_id, amount_minor, status, key); inbox(provider_account, event_id UNIQUE, raw_digest, verified_at); outbox(id, aggregate_id, sequence, payload, delivered_at); journals(id, business_event_id UNIQUE, currency, posted_at); posting_lines(journal_id, account_id, debit_minor, credit_minor). Use composite tenant indexes, unique provider-account/reference indexes, and (status, recovery_due_at) for recovery scans. Row locks or version-checked updates coordinate changes. A CAS failure reloads state instead of overwriting a competing capture/refund. No SQL transaction makes a remote charge atomic.",
    interview:
      "Show the unique constraint and the transaction that reserves an operation before the PSP call.",
  },
  {
    id: "states",
    title: "Payment state machine",
    question: "Does a failed HTTP response mean the payment failed?",
    explanation:
      "No. The API can lose the response after the PSP accepted the operation. Keep observed attempt state UNKNOWN/processing until evidence resolves it. A failed attempt may permit a new attempt, while a captured attempt must not turn into failed because an old callback arrived.",
    pressure:
      "An old failure arrives after capture; a refund changes money without undoing the capture fact.",
    solution:
      "Separate intent progress, attempt execution, captured/refunded amounts, settlement and dispute state. Validate events against the current version and provider evidence.",
    invariant: "Confirmed capture is never erased by a stale failure event.",
    deepTitle: "The playground’s explicit scope",
    deep: "This is an illustrative INR/card model, not a universal PSP enum. Created → processing → requires_action or authorized → captured; a definitive decline ends this attempt; void releases an authorization. The timeout fault models an automatic-capture provider accepting while the local response disappears. UNKNOWN is a local knowledge state, not an external financial state. Refunds are a cumulative dimension: 0 < refunded < captured is partially refunded, equal amounts is refunded. Disputes are separate events. Provider-specific auth expiry, incremental auth, asynchronous methods and later reversals need explicit capability/state models. A rejected operation records an explanation without advancing the version.",
    interview:
      "Why can’t one monotonically increasing status number represent every payment workflow?",
  },
  {
    id: "idempotency",
    title: "Idempotency & concurrency",
    question: "Two API replicas both receive the same Pay click. Who may act?",
    explanation:
      "Both can handle the request, but only one may claim the financial operation. Atomically insert a unique merchant + endpoint + key reservation with a canonical payload fingerprint. A duplicate with the same payload gets in-progress or the persisted result; a changed payload gets a conflict.",
    pressure:
      "A check-then-insert race sends two charges; a worker crashes while owning a Redis lock.",
    solution:
      "Durable uniqueness, transactionally recorded ownership/results, stable attempt IDs and provider-side idempotency where supported. Refunds have independent operation keys and atomic budget reservation.",
    invariant:
      "Retries reuse identity; one logical operation has at most one intended financial effect.",
    deepTitle: "Expiry is a correctness decision",
    deep: "At-least-once transport repeats requests and events. Idempotent effects are an application guarantee, not exactly-once network delivery. Persist the provider key before dispatch. A lease/lock prevents some overlap but cannot prove an expired owner did not charge. Before stealing work, query external outcome using the same reference. Retain operation identity for the full retry/dispute/recovery horizon; provider key retention may be shorter than yours. After key expiry, do not silently treat an old operation as new—keep a durable business-identity tombstone or explicit attempt policy. Separate transient 5xx, 202 processing, 409 conflict and definitive business declines.",
    interview:
      "What happens if the provider’s idempotency cache expires before your recovery job runs?",
  },
  {
    id: "unknown",
    title: "Provider execution & unknown outcomes",
    question:
      "The PSP accepted ₹1,000. Our process restarted before recording success.",
    explanation:
      "Adapters normalize provider capabilities, error categories and external references. The durable attempt remains the recovery anchor. A timeout consumes a retry budget but cannot establish failure. Query, validated callbacks and reconciliation progressively resolve uncertainty.",
    pressure:
      "The user asks to retry on PSP B while PSP A’s charge is still unknown.",
    solution:
      "Keep the original identity, query PSP A, schedule bounded recovery and show processing to the customer. Fail over new traffic when safe; do not blindly replay an uncertain financial effect on another PSP.",
    invariant:
      "UNKNOWN never automatically becomes FAILED or a fresh charge elsewhere.",
    deepTitle: "Recovery without wishful atomicity",
    deep: "Persist attempt, route, provider account/key and recovery job before the external call. Query by reference/key when supported; otherwise isolate the operation for provider evidence or manual review. Same-provider retry is safe only within documented idempotency capabilities and retention. Exponential backoff, jitter and retry budgets prevent storms. Circuit breakers stop new traffic to an unhealthy PSP while a separate recovery lane drains uncertain work. A provider event is evidence: verify origin, tenant/account, object ID, amount, currency and legal transition; fetch the current provider object for ambiguous order. Durable scheduled recovery survives restarts.",
    interview:
      "When is cross-provider fallback safe, and which evidence makes it safe?",
  },
  {
    id: "ledger",
    title: "Double-entry ledger & money correctness",
    question: "Can we explain every rupee without editing yesterday’s records?",
    explanation:
      "A payment status describes execution. A ledger records financial claims and movements. On these illustrative platform books, capture debits PSP receivable (asset) and credits merchant payable (liability) for ₹1,000. Debit increases an asset; credit increases a liability. They do not universally mean minus and plus.",
    pressure:
      "A duplicate event posts money twice, or an operator wants to edit a historical amount.",
    solution:
      "Validate positive minor units, balance debit/credit per currency, commit all lines atomically and enforce a unique business-event journal. Correct with linked reversing and replacement entries after evidence review.",
    invariant:
      "Each posted currency balances; posted journals are immutable and uniquely identified.",
    deepTitle: "Chart of accounts, fees & projections",
    deep: "This chart assumes a platform contractually entitled to the PSP receivable and owing the merchant. A purely non-custodial orchestrator must not assert those claims as its own assets/liabilities. PSP receivable and cash are debit-normal assets. Merchant payable is a credit-normal liability. Provider fee expense is debit-normal. Example settlement with platform-borne ₹20 fee: Dr cash ₹980 + Dr fee expense ₹20 / Cr PSP receivable ₹1,000. Merchant-borne fees instead debit merchant payable under the contract. No revenue or customer bank balance is invented here. Auth holds are pending operational records, not posted captured cash. Refund confirmation adds Dr merchant payable / Cr PSP receivable, subject to refund budget and settlement context. A later payout is Dr payable / Cr cash only with payout evidence. Materialized balances are rebuildable projections; pending, reserved and available must remain distinct. FX requires explicit rates, rounding, currency-specific balancing and gain/loss/clearing accounts. A balanced ledger can still omit a transaction or disagree with the bank.",
    interview:
      "Show capture, settlement with fees, refund, and payout on your chart of accounts.",
  },
  {
    id: "reconciliation",
    title: "Settlement & reconciliation",
    question: "Our books balance. Why does the PSP statement show less?",
    explanation:
      "Compare internal payments, journals, PSP events/statements and bank deposits. Match provider account + transaction reference + currency, then gross, fees, net and settlement date/window. A ₹980 deposit can correctly settle a ₹1,000 capture with a ₹20 fee.",
    pressure:
      "A row is missing, duplicated, denominated in another currency, or delayed by settlement timing.",
    solution:
      "Classify before correcting: timing, missing internal/external record, amount/currency mismatch, duplicate or unexplained adjustment. Preserve raw evidence, ingest statements idempotently, open exceptions and assign review ownership.",
    invariant:
      "Never create a financial posting merely to force totals to agree.",
    deepTitle: "Evidence-driven repair",
    deep: "A two-day window here is a teaching assumption, not a universal rail promise. Match refunds, disputes and chargebacks to their own events; they can arrive after merchant payout. Re-fetch PSP objects, verify statement version and bank batch reference, inspect journal identity and reconstruct missing internal records only from authenticated evidence and audited approval. Unknown differences go to suspense/exception workflow under policy; a suspense posting is itself evidence-backed and balanced, not fictional income. Partition reconciliation by account, currency and time window with overlap for late data, watermark completeness and rerun safely. A missing provider row after the window needs escalation, not automatic failure.",
    interview:
      "How do you reconcile 100M records without a single serial table scan?",
  },
  {
    id: "pipeline",
    title: "Distributed event architecture",
    question:
      "The database committed. The message publish failed. What happens next?",
    explanation:
      "Write business state and an outbox record in one local transaction. A relay publishes committed work; at-least-once delivery can repeat. A consumer commits its inbox dedup marker and journal/state together, then acknowledges. This repairs the DB/broker gap without pretending the PSP participates in the transaction.",
    pressure:
      "A worker dies after committing but before ACK; a malformed event blocks a partition.",
    solution:
      "Idempotent consumers, per-payment ordering, bounded retries/backoff/jitter, DLQ with safe redrive and durable recovery. Isolate providers and hot merchants so one outage cannot consume every worker.",
    invariant: "Commit-before-ACK replay must not repeat the financial effect.",
    deepTitle: "Boundaries, ordering & sagas",
    deep: "Use aggregate versions/sequence numbers and partition by payment identity where order matters. Inbox event-ID dedup is insufficient if two different event IDs describe the same capture: unique financial business identity is also required. Queue depth and oldest age drive admission control; reject unaccepted work with a retryable response while retaining already accepted work. Retry poison messages only within a budget; preserve payload references and reason in DLQ. A saga refund/void is a new externally observable action, not a magical rollback; it can also time out and need reconciliation. Read-model lag must not authorize a refund or withdrawal. Audit history and trace IDs connect the whole path.",
    interview:
      "Which actions are atomic together, and which are repaired by recovery?",
  },
  {
    id: "scale",
    title: "Scaling & multi-region design",
    question: "Traffic grows 100× while the PSP takes two seconds per call.",
    explanation:
      "Stateless APIs can scale horizontally; money correctness still needs authoritative identity and balance ownership. Provider latency and quotas bound useful worker throughput. Database indexes, connection pools, hot merchants and recovery workloads constrain capacity before CPU does.",
    pressure:
      "Autoscaling adds workers but exhausts DB connections. A region dies while another writer is still alive.",
    solution:
      "Bound concurrency to provider quota and pool budget. Partition queues, isolate hot tenants and reserve recovery capacity. Prefer a fenced single writer/active-passive setup first; consensus-backed writes are a different, costlier choice.",
    invariant:
      "Regional failover must preserve accepted identities and prevent split-brain financial writes.",
    deepTitle: "Availability has an explicit price",
    deep: "For a single-writer design, fence the old writer before promotion. Asynchronous replication admits data loss unless the acceptance policy and replication guarantees close that gap; do not claim RPO=0 from backups alone. State RPO (accepted data loss tolerance) and RTO (recovery time). Strong cross-region quorum writes cost latency and may reduce availability during partitions. Independent active-active dedup stores can each admit the same charge. Data residency, storage/egress cost and operational complexity constrain regional choices. Keep provider operations separate from DB transactions; a slow network call must not hold a scarce connection. The lab uses a synthetic 50 commits/connection/second and a quota, not a production benchmark.",
    interview:
      "What happens to an accepted payment absent from the promoted replica?",
  },
  {
    id: "security",
    title: "Security, fraud & compliance",
    question:
      "Can a valid-looking callback or another merchant’s ID move money?",
    explanation:
      "Authenticate callers and authorize every tenant-owned object server-side. Use hosted payment collection/tokenization to reduce raw card exposure; never put PAN/CVV or secrets in logs. TLS, encryption at rest, secret management and least privilege protect separate boundaries.",
    pressure:
      "An attacker replays a signed event, guesses another tenant’s payment ID, or floods refund attempts.",
    solution:
      "Verify signatures over the raw body, timestamp tolerance and replay identity; map provider account to tenant. Add velocity/risk checks, secure redacted audit logs, credential rotation and controlled operational access.",
    invariant:
      "A signature alone does not authorize an arbitrary amount, tenant or state transition.",
    deepTitle: "Scope and operational controls",
    deep: "Tokenization changes exposure; connected systems and detokenization paths may remain in PCI DSS scope. Compliance is an assessed boundary, not a badge earned by this design. Use isolated provider credentials, secret vaults, restricted service identities, encryption keys with rotation and separation of duties for sensitive repairs. Minimize PII and set access/retention policies. Risk checks can require step-up/hold/rejection; they do not replace settlement correctness. Consider replay tolerance and clock skew together; retain event business identity beyond the timestamp check. Prefer audited dual approval for high-impact adjustments, with a reason and evidence link.",
    interview:
      "What remains in PCI scope when the checkout uses hosted fields?",
  },
  {
    id: "advanced",
    title: "Advanced payment workflows",
    question: "Can we refund ₹700 twice after capturing only ₹1,000?",
    explanation:
      "No. Refund reservation must include completed and pending amounts. Keep capture, refund, dispute, settlement, reserve and payout dimensions separate. A void releases uncollected authorization; a refund returns captured funds and has its own asynchronous lifecycle.",
    pressure:
      "Two concurrent partial refunds each see the original captured amount; one times out.",
    solution:
      "Atomically reserve remaining refund capacity, assign a refund key and retain the reservation while outcome is unknown. Only release on definitive failure; confirmed results append financial records.",
    invariant: "Completed refunds + pending reservations ≤ captured amount.",
    deepTitle: "Rail capabilities and product extensions",
    deep: "Partial capture and multiple captures require provider support, authorization ceilings/expiry, stable capture identities and aggregate reservations. Subscription payments use consent/mandates, schedule identities and explicit new attempts after known declines. Asynchronous methods may remain processing well beyond a checkout session. UPI is not a universal card hold/capture pipeline; model the actual PSP/rail contract, status queries and refunds. Routing should consider eligibility, quotas, cost and health before dispatch; uncertain attempts cannot be cloned to another PSP. FX uses explicit conversion legs and rounding policy. Disputes/chargebacks may reduce payable or create receivables after payout; merchant reserves and negative-balance policy need separate risk controls. These are extensions, not capabilities promised by every provider.",
    interview:
      "How do you prevent refund overrun when an earlier refund is UNKNOWN?",
  },
  {
    id: "operations",
    title: "Observability & incident response",
    question:
      "A merchant reports a missing payment. Can an operator trace it safely?",
    explanation:
      "Link tenant/order, intent, attempt, provider reference, webhook event, queue message, journal and settlement batch through redacted correlation IDs. Track authorization/capture success by cohort/provider, UNKNOWN count and oldest age, duplicate suppression, webhook lag, queue age/DLQ, refund failures and reconciliation differences.",
    pressure:
      "Provider A times out, queue age grows and success dashboards hide all UNKNOWN attempts.",
    solution:
      "Route new eligible work away from A, preserve uncertain attempts, give recovery a bounded isolated lane, and watch outcome convergence and reconciliation. Do not clear a backlog by declaring everything failed.",
    invariant:
      "Operational remediation preserves identity, evidence and append-only audit history.",
    deepTitle: "A runbook you can defend",
    deep: "Timeline: detect provider latency and unknown-age rise → scope affected accounts/attempt IDs → stop unsafe retries and isolate provider → confirm durable queues/jobs → recover with query, callbacks and statements → verify one effect per operation and journal consistency → communicate impact → close after financial reconciliation. Define SLOs separately for API acceptance, confirmed outcome within a horizon and reconciliation freshness. Error-budget burn and oldest age are more actionable than every transient retry. Measure authorization and capture denominators separately; exclude test traffic and identify declines instead of hiding uncertainty. Page for broken financial invariants; aggregate noisy retry warnings. Never repair by bulk editing statuses without evidence.",
    interview:
      "Which metric proves the incident is financially resolved rather than merely quiet?",
  },
  {
    id: "architecture",
    title: "Final architecture & trade-offs",
    question: "Can you justify every box from a failure you observed?",
    explanation:
      "The evolved request path authenticates, validates and claims a durable operation; records the attempt; dispatches via an adapter; and returns a known or processing result. The asynchronous path receives verified evidence, persists inbox/outbox work, applies validated state and balanced journals, and reconciles with external reports.",
    pressure:
      "An impressive diagram still has no answer for a timeout, duplicate event or failed regional promotion.",
    solution:
      "Build the graph below and test its boundaries. A smaller synchronous V1 with durable query recovery can be valid at low load; queues become useful under burst/isolation needs. A ledger may share one ACID database initially instead of introducing a distributed transaction early.",
    invariant:
      "Every financial effect has an identity, authoritative evidence and a recoverable audit path.",
    deepTitle: "Whiteboard walkthrough and known limits",
    deep: "1. Draw external checkout/PSPs/banks. 2. Add API → DB claim/attempt → adapter. 3. Mark the remote-call uncertainty boundary. 4. Add recovery worker and verified webhook inbox. 5. Connect DB transactional outbox → broker → inbox/idempotent worker → ledger transaction. 6. Compare journals/payment records to PSP statements and bank evidence. 7. Add redacted monitoring and fenced regional ownership. Control-plane routing configuration, provider credentials, risk rules and operator approvals govern the financial data path without becoming posted money. If ledger is a separate service, make command delivery idempotent and model state/ledger lag explicitly. This teaching system omits real processing, certifications, full dispute adjudication, rail-specific settlement contracts and production capacity measurements.",
    interview:
      "Which component would you omit at 10 TPS, and which correctness boundary would you retain?",
  },
];

export const apiExamples = `POST /payment-intents
Authorization: merchant-scoped identity
Idempotency-Key: order-42:create
X-Correlation-ID: trace-42
{ "order_id": "order-42", "amount_minor": 100000, "currency": "INR" }
→ 201 { "id": "pi_1000", "status": "created", "version": 0 }

POST /payment-intents/pi_1000/confirm
Idempotency-Key: order-42:confirm-1
{ "payment_method_token": "demo_token" }
→ 202 { "id": "pi_1000", "attempt_id": "attempt_a", "status": "processing" }

GET /payment-intents/pi_1000  → 200 observed state + captured/refunded totals
POST /payments/pi_1000/capture  { "amount_minor": 100000 }
POST /payments/pi_1000/refunds  { "amount_minor": 30000 }
POST /provider-events/provider-a  → verify raw-body signature, durable inbox, then 2xx

400 invalid currency/precision • 401 unauthenticated • 403 forbidden
404 absent or tenant-inaccessible • 409 fingerprint/version conflict
202 processing/unknown • 429 unaccepted overload • 503 not durably accepted
Definitive provider declines are business outcomes, not transport timeouts.`;

export const incidentRounds = [
  {
    title: "Duplicate checkout",
    evidence:
      "Two replicas read no row for order-42. Both are ready to charge ₹1,000.",
    options: [
      "Disable retries in the browser",
      "Atomic scoped DB claim + same provider attempt key",
      "Create a random key per replica",
    ],
    correct: 1,
    why: "A browser button is not the correctness boundary. One UNIQUE reservation wins; the other request receives in-progress/replay. Retain retry support.",
    recovery:
      "Inspect the attempt and provider reference; suppress duplicates and replay the durable result.",
  },
  {
    title: "The response vanished",
    evidence:
      "PSP A lists attempt_a as captured. Our attempt is UNKNOWN; the customer wants PSP B.",
    options: [
      "Retry on B",
      "Mark failed",
      "Query A and apply verified capture evidence",
    ],
    correct: 2,
    why: "A second provider does not share A’s idempotency identity. Timeout is a missing observation, not proof of failure.",
    recovery:
      "Recover original attempt, persist capture + outbox, and reconcile its journal. Keep identity after restart.",
  },
  {
    title: "Callbacks reversed",
    evidence:
      "evt_2 says captured; evt_1 says failed. evt_2 is delivered again. Both signatures are valid.",
    options: [
      "Apply latest arrival",
      "Dedup inbox, validate transition, fetch current PSP object",
      "Trust either signature without object checks",
    ],
    correct: 1,
    why: "Signature proves origin, not event order or current state. Dedup event ID and financial identity; preserve capture.",
    recovery:
      "Quarantine stale evidence and correlate authoritative object/version; record a genuine later reversal separately.",
  },
  {
    title: "Balanced but short",
    evidence:
      "Ledger receivable: ₹1,000. PSP settlement: gross ₹1,000, fee ₹20, net ₹980. Bank: ₹970.",
    options: [
      "Post ₹10 income",
      "Edit capture to ₹970",
      "Match batch/window and investigate unexplained ₹10",
    ],
    correct: 2,
    why: "The fee explains ₹20, but ₹10 remains unexplained. A balanced journal does not prove cash arrival.",
    recovery:
      "Verify statement/bank references and timing; keep an exception for human review until evidence supports an auditable correction.",
  },
  {
    title: "Regional partition",
    evidence:
      "Region A accepted a payment, then lost connectivity. B has a lagging replica; A may still write.",
    options: [
      "Fence A, establish durable recovery, then promote or pause",
      "Let both regions accept independently",
      "Erase UNKNOWN rows",
    ],
    correct: 0,
    why: "Independent writers can claim the same operation twice. Fencing and known replication guarantees matter more than a fast green dashboard.",
    recovery:
      "Pause unsafe financial writes, establish ownership and RPO impact, recover in-flight attempts against original PSP references, then reconcile.",
  },
];

export const interviewSteps = [
  [
    "0–5 min · Clarify",
    "Which rails, merchant roles, regions, authorization/capture mode, refund and settlement obligations? Frame a multi-PSP orchestrator, not a bank.",
  ],
  [
    "5–9 min · Requirements",
    "Create/confirm/query, capture/void where supported, refunds, verified events, internal records and reconciliation; prioritize correctness, durable acceptance and bounded recovery.",
  ],
  [
    "9–13 min · Estimate",
    "10M / 86,400 ≈ 116 TPS average; assumed 10× peak ≈ 1,157 TPS. Budget retries, events, ledger lines, retention, external latency and quotas.",
  ],
  [
    "13–17 min · APIs",
    "Stable tenant-owned intent/attempt/refund IDs, integer minor units, currency validation and scoped idempotency fingerprints. Separate 202 unknown from definitive decline.",
  ],
  [
    "17–22 min · Data",
    "Unique claim, provider reference and journal business identity; versioned states, indexed recovery jobs, inbox/outbox and balanced posting lines.",
  ],
  [
    "22–28 min · Architecture",
    "Start API → DB → adapter; identify remote-call uncertainty. Add recovery/inbox, then outbox/queue/workers when pressure warrants them.",
  ],
  [
    "28–35 min · Correctness",
    "Walk a concurrent duplicate, lost response, stale callback, refund reservation and immutable ledger transaction across explicit boundaries.",
  ],
  [
    "35–42 min · Failures",
    "Commit-before-ACK, provider outage, missed events, settlement drift and regional partition. State evidence needed to recover each safely.",
  ],
  [
    "42–50 min · Operations",
    "Bound workers to quotas/pools, isolate hot merchants, alert on UNKNOWN age/reconciliation, secure tokens and callbacks, fence regional promotion.",
  ],
  [
    "50–60 min · Defend",
    "Explain synchronous vs queued V1, shared vs separate ledger database, consistency/latency/cost and provider/rail limits; name what you deliberately leave out.",
  ],
];

export const followups = [
  "Where does an idempotency claim live, and what is its exact uniqueness scope?",
  "How do you reject the same key reused with a different amount?",
  "Can a Redis lock expiring prove a PSP did not charge?",
  "What changes after provider idempotency retention expires?",
  "Why is a timeout not a definitive decline?",
  "When is a new attempt or cross-PSP fallback safe?",
  "How do you validate duplicate and out-of-order webhooks?",
  "Which transaction contains inbox dedup and journal posting?",
  "What happens after DB commit but before broker ACK?",
  "How do two concurrent partial refunds share a ceiling?",
  "Which accounts receive debit and credit at capture and settlement?",
  "Why can a balanced ledger still be financially wrong?",
  "How do you explain gross, fee, net and bank differences?",
  "What happens to a chargeback after merchant payout?",
  "How does UPI change your card-centric state model?",
  "Which guarantees cost latency during a regional partition?",
  "What proves the old writer is fenced before promotion?",
  "How do tokenization and connected systems affect PCI scope?",
  "What alert detects an UNKNOWN backlog before customer complaints?",
  "Which components can a low-traffic V1 omit safely?",
];
