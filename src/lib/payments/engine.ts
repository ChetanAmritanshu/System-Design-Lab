/** Deterministic teaching models. No network calls, credentials, or real financial effects. */
export type AttemptStatus =
  | "created"
  | "requires_action"
  | "processing"
  | "unknown"
  | "authorized"
  | "captured"
  | "failed"
  | "voided";
export type Payment = {
  intent: "created" | "pending" | "succeeded" | "cancelled";
  attempt: AttemptStatus;
  provider: "none" | "authorized" | "captured" | "failed" | "voided";
  amount: number;
  captured: number;
  refunded: number;
  version: number;
  seen: string[];
  history: string[];
};
export type PaymentEvent =
  | "confirm"
  | "action"
  | "authorize"
  | "capture"
  | "timeout"
  | "decline"
  | "void"
  | "query"
  | "webhook"
  | "stale"
  | "restart";
export const paymentEvents: PaymentEvent[] = [
  "confirm",
  "action",
  "authorize",
  "capture",
  "timeout",
  "decline",
  "void",
  "query",
  "webhook",
  "stale",
  "restart",
];
export const initialPayment = (): Payment => ({
  intent: "created",
  attempt: "created",
  provider: "none",
  amount: 100000,
  captured: 0,
  refunded: 0,
  version: 0,
  seen: [],
  history: ["pi_1000 / attempt_a: ₹1,000.00 INR created. No money moved."],
});
function record(
  p: Payment,
  note: string,
  patch: Partial<Payment> = {},
): Payment {
  return { ...p, ...patch, history: [...p.history, note] };
}
export function transition(p: Payment, event: PaymentEvent): Payment {
  const reject = (why: string) => record(p, `Rejected ${event}: ${why}`);
  const move = (patch: Partial<Payment>, note: string) =>
    record(p, note, { ...patch, version: p.version + 1 });
  switch (event) {
    case "confirm":
      return p.attempt === "created"
        ? move(
            { attempt: "processing", intent: "pending" },
            "Confirmation durably claimed. attempt_a dispatched using provider key attempt_a.",
          )
        : reject(
            "this attempt has already started; replay its identity instead.",
          );
    case "action":
      return p.attempt === "processing" && p.provider === "none"
        ? move(
            { attempt: "requires_action" },
            "Issuer requests customer authentication. No authorization yet.",
          )
        : reject(
            "authentication is only requested before an external outcome.",
          );
    case "authorize":
      return ["processing", "requires_action"].includes(p.attempt) &&
        p.provider === "none"
        ? move(
            { attempt: "authorized", provider: "authorized" },
            "Provider confirms a ₹1,000 hold. Authorization is not settlement.",
          )
        : reject(
            "a live processing attempt is required; never reauthorize captured money.",
          );
    case "capture":
      return p.attempt === "authorized"
        ? move(
            {
              attempt: "captured",
              provider: "captured",
              captured: p.amount,
              intent: "succeeded",
            },
            "Provider confirms capture. Intent succeeded; settlement remains a separate dimension.",
          )
        : reject(
            "manual capture requires a valid authorization in this card model.",
          );
    case "timeout":
      return p.attempt === "processing"
        ? move(
            { attempt: "unknown", provider: "captured" },
            "Fault injected: automatic-capture PSP accepted ₹1,000; response vanished. Local outcome UNKNOWN. Recovery job persists.",
          )
        : reject(
            "start a processing attempt first; this fault represents automatic capture.",
          );
    case "decline":
      return ["processing", "requires_action"].includes(p.attempt) &&
        p.provider === "none"
        ? move(
            { attempt: "failed", provider: "failed" },
            "Authoritative provider decline. Attempt terminal; intent may use a NEW attempt after a product decision.",
          )
        : reject(
            "a timeout or stale callback cannot turn a captured attempt into failure.",
          );
    case "void":
      return p.attempt === "created"
        ? move(
            { attempt: "voided", intent: "cancelled" },
            "Unsubmitted intent cancelled locally.",
          )
        : p.attempt === "authorized"
          ? move(
              { attempt: "voided", provider: "voided", intent: "cancelled" },
              "Provider confirms authorization void. Captured money would require a refund.",
            )
          : reject(
              "only an unsubmitted intent or confirmed authorization can be cancelled here.",
            );
    case "query":
    case "webhook": {
      if (event === "webhook" && p.seen.includes("evt_capture_a"))
        return record(
          p,
          "Duplicate evt_capture_a acknowledged from durable inbox; no repeated effect.",
        );
      if (p.provider !== "captured")
        return reject(
          "no confirmed provider capture evidence. Keep recovery scheduled.",
        );
      return move(
        {
          attempt: "captured",
          intent: "succeeded",
          captured: p.amount,
          seen: event === "webhook" ? [...p.seen, "evt_capture_a"] : p.seen,
        },
        `${event}: validated provider/account/object evidence confirms captured ₹1,000. State + outbox commit together.`,
      );
    }
    case "stale":
      return record(
        p,
        "Old FAILED callback quarantined: event arrival is not state order. Query current provider object; preserve confirmed capture.",
      );
    case "restart":
      return record(
        p,
        "Process restarted. Durable attempt/reference and recovery job survive; no new provider charge.",
      );
  }
}

export function transitionAtVersion(
  p: Payment,
  event: PaymentEvent,
  expectedVersion: number,
): Payment {
  return p.version === expectedVersion
    ? transition(p, event)
    : record(
        p,
        `Rejected stale write: expected version ${expectedVersion}, current ${p.version}. Reload current evidence before deciding; no last-write-wins overwrite.`,
      );
}

export type Claim = { scope: string; fingerprint: string; completed: boolean };
export type Race = {
  claims: Claim[];
  calls: number;
  effects: number;
  history: string[];
};
export const initialRace = (): Race => ({
  claims: [],
  calls: 0,
  effects: 0,
  history: [
    "Two replicas share one database. Scope = merchant + endpoint + key.",
  ],
});
export function claimRequest(
  s: Race,
  scope: string,
  fingerprint: string,
  safe = true,
): Race {
  const existing = s.claims.find((c) => c.scope === scope);
  if (safe && existing)
    return {
      ...s,
      history: [
        ...s.history,
        existing.fingerprint !== fingerprint
          ? "409 conflict: same scoped key, different canonical payload; no provider call."
          : existing.completed
            ? "200 replay: persisted result reused; no provider call."
            : "202 in progress: unique claim owned by replica A; replica B must poll the same operation.",
      ],
    };
  return {
    ...s,
    calls: s.calls + 1,
    effects: s.effects + 1,
    claims: [...s.claims, { scope, fingerprint, completed: false }],
    history: [
      ...s.history,
      safe
        ? "Atomic UNIQUE insert wins. Provider receives stable attempt key; one financial effect."
        : "Unsafe check-then-act race: another replica independently calls provider with a new identity.",
    ],
  };
}
export function completeClaims(s: Race): Race {
  return {
    ...s,
    claims: s.claims.map((c) => ({ ...c, completed: true })),
    history: [
      ...s.history,
      "Result durably saved with claim completion. Future retries replay it.",
    ],
  };
}

export type Account =
  "psp_receivable" | "cash" | "merchant_payable" | "fee_expense";
export type Line = {
  account: Account;
  currency: string;
  debit: number;
  credit: number;
};
export type Journal = { id: string; lines: Line[]; reverses?: string };
export type Ledger = { journals: Journal[]; history: string[] };
export const initialLedger = (): Ledger => ({
  journals: [],
  history: [
    "Illustrative platform books: receivable/cash/fee expense debit-normal; merchant payable credit-normal. No customer bank account is on these books.",
  ],
});
export function balanced(lines: Line[]): boolean {
  if (
    lines.length < 2 ||
    lines.some(
      (l) =>
        !Number.isSafeInteger(l.debit) ||
        !Number.isSafeInteger(l.credit) ||
        l.debit < 0 ||
        l.credit < 0 ||
        l.debit > 0 === l.credit > 0,
    )
  )
    return false;
  return [...new Set(lines.map((l) => l.currency))].every(
    (c) =>
      lines
        .filter((l) => l.currency === c)
        .reduce(
          (sum, l) => sum + BigInt(l.debit) - BigInt(l.credit),
          BigInt(0),
        ) === BigInt(0),
  );
}
export function postJournal(s: Ledger, journal: Journal): Ledger {
  const prior = s.journals.find((j) => j.id === journal.id);
  if (prior)
    return {
      ...s,
      history: [
        ...s.history,
        JSON.stringify(prior) === JSON.stringify(journal)
          ? `Replay ${journal.id}: unique business identity suppressed duplicate journal.`
          : `Rejected ${journal.id}: identity conflicts with immutable posted content.`,
      ],
    };
  if (!balanced(journal.lines))
    return {
      ...s,
      history: [
        ...s.history,
        "Rejected: positive integer minor units and debit = credit per currency are required.",
      ],
    };
  if (journal.reverses) {
    const original = s.journals.find((j) => j.id === journal.reverses);
    if (
      !original ||
      s.journals.some((j) => j.reverses === journal.reverses) ||
      JSON.stringify(journal.lines) !== JSON.stringify(reversal(original).lines)
    )
      return {
        ...s,
        history: [
          ...s.history,
          "Rejected: reversal must exactly invert an existing journal, once, without editing history.",
        ],
      };
  }
  return {
    journals: [...s.journals, structuredClone(journal)],
    history: [
      ...s.history,
      `Posted ${journal.id} atomically. History remains immutable; external settlement still needs evidence.`,
    ],
  };
}
export const captureJournal = (): Journal => ({
  id: "capture:attempt_a",
  lines: [
    { account: "psp_receivable", currency: "INR", debit: 100000, credit: 0 },
    { account: "merchant_payable", currency: "INR", debit: 0, credit: 100000 },
  ],
});
export function reversal(j: Journal): Journal {
  return {
    id: `reversal:${j.id}`,
    reverses: j.id,
    lines: j.lines.map((l) => ({ ...l, debit: l.credit, credit: l.debit })),
  };
}
export function accountBalance(s: Ledger, account: Account): number {
  const raw = s.journals
    .flatMap((j) => j.lines)
    .filter((l) => l.account === account && l.currency === "INR")
    .reduce((sum, l) => sum + l.debit - l.credit, 0);
  return raw === 0 ? 0 : account === "merchant_payable" ? -raw : raw;
}

export type Refunds = {
  captured: number;
  completed: number;
  reserved: number;
  keys: Record<string, number>;
  history: string[];
};
export const initialRefunds = (): Refunds => ({
  captured: 100000,
  completed: 0,
  reserved: 0,
  keys: {},
  history: [
    "₹1,000 captured; reserve refund budget atomically before contacting PSP.",
  ],
});
export function reserveRefund(
  s: Refunds,
  key: string,
  amount: number,
): Refunds {
  if (key in s.keys)
    return {
      ...s,
      history: [
        ...s.history,
        s.keys[key] === amount
          ? "Replay refund identity; no extra refund reserved or sent."
          : "409 refund key fingerprint conflict.",
      ],
    };
  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    amount + s.completed + s.reserved > s.captured
  )
    return {
      ...s,
      history: [
        ...s.history,
        "Rejected refund: positive minor units and completed + pending + requested ≤ captured required.",
      ],
    };
  return {
    ...s,
    reserved: s.reserved + amount,
    keys: { ...s.keys, [key]: amount },
    history: [
      ...s.history,
      `Refund ${key}: ${amount} paise reserved under row lock/CAS; provider result pending. Timeout retains reservation.`,
    ],
  };
}
export function settleRefunds(s: Refunds): Refunds {
  return {
    ...s,
    completed: s.completed + s.reserved,
    reserved: 0,
    history: [
      ...s.history,
      "Authoritative PSP evidence confirms reserved refunds; append refund journals using each refund identity.",
    ],
  };
}

export type Pipeline = {
  outbox: number;
  queue: number;
  posted: number;
  acked: boolean;
  inbox: boolean;
  retries: number;
  dlq: number;
  history: string[];
};
export type PipelineEvent =
  | "accept"
  | "publish"
  | "crash"
  | "consume"
  | "duplicate"
  | "db-down"
  | "provider-delay"
  | "poison"
  | "redrive";
export const initialPipeline = (): Pipeline => ({
  outbox: 0,
  queue: 0,
  posted: 0,
  acked: false,
  inbox: false,
  retries: 0,
  dlq: 0,
  history: [
    "One capture evidence event; database, broker, and worker are separate failure domains.",
  ],
});
export function pipelineStep(s: Pipeline, event: PipelineEvent): Pipeline {
  const log = (note: string, patch: Partial<Pipeline> = {}) => ({
    ...s,
    ...patch,
    history: [...s.history, note],
  });
  if (event === "accept")
    return s.outbox || s.queue || s.inbox || s.posted || s.dlq
      ? log("Duplicate acceptance reuses operation; no new outbox row.")
      : log(
          "Payment + outbox row commit atomically; durable acceptance acknowledged.",
          { outbox: 1 },
        );
  if (event === "publish")
    return s.outbox
      ? log(
          "Broker confirms publish; outbox delivery marked. Relay crash could repeat publish.",
          { outbox: 0, queue: s.queue + 1 },
        )
      : log("No committed outbox work to publish.");
  if (event === "db-down")
    return log(
      "DB unavailable: no ACK, no posting. Durable broker/outbox retains accepted work.",
      { retries: s.retries + 1 },
    );
  if (event === "provider-delay")
    return log(
      "PSP delayed: bounded retry/backoff + jitter and circuit breaker; preserve UNKNOWN work.",
      { retries: s.retries + 1 },
    );
  if (event === "duplicate")
    return s.queue || s.posted
      ? log("Broker redelivers same business event.", { queue: s.queue + 1 })
      : log("Nothing exists to redeliver.");
  if (event === "poison")
    return s.queue
      ? log(
          "Schema invalid after bounded retries: quarantine to DLQ, alert with event reference.",
          { queue: s.queue - 1, dlq: s.dlq + 1 },
        )
      : log("No queued message.");
  if (event === "redrive")
    return s.dlq
      ? log(
          "Operator fixes decoder and replays original identity; no invented financial event.",
          { queue: s.queue + s.dlq, dlq: 0 },
        )
      : log("DLQ empty.");
  if (!s.queue) return log("No queued work. Commit then publish first.");
  if (event === "crash")
    return log(
      "Inbox + journal committed; worker dies before ACK. Broker retains message for replay.",
      { inbox: true, posted: 1, acked: false },
    );
  return log(
    s.inbox
      ? "Inbox business identity already committed; skip effect and ACK redelivery."
      : "Inbox + journal commit in one transaction, then ACK.",
    { inbox: true, posted: 1, queue: s.queue - 1, acked: true },
  );
}

export type EstimateInput = {
  daily: number;
  peak: number;
  reads: number;
  days: number;
  bytes: number;
  latency: number;
  availability: number;
};
export function estimate(x: EstimateInput) {
  const tps = x.daily / 86400;
  return {
    tps,
    peak: tps * x.peak,
    reads: tps * x.peak * x.reads,
    storage: (x.daily * x.days * x.bytes) / 1e9,
    inflight: (tps * x.peak * x.latency) / 1000,
    downtime: (1 - x.availability / 100) * 30 * 86400,
  };
}
export function capacity(
  tps: number,
  latency: number,
  workers: number,
  pool: number,
  quota: number,
  providerDown = false,
) {
  const service = providerDown
    ? 0
    : Math.min((workers * 1000) / latency, pool * 50, quota);
  return {
    service,
    backlog: Math.max(0, tps - service) * 60,
    utilization: service ? tps / service : Infinity,
  };
}

export type ComponentId =
  | "api"
  | "db"
  | "idempotency"
  | "adapters"
  | "outbox"
  | "queue"
  | "workers"
  | "ledger"
  | "webhooks"
  | "reconciliation"
  | "monitoring";
export const components: { id: ComponentId; label: string; why: string }[] = [
  {
    id: "api",
    label: "Payment API",
    why: "Authenticates tenants and validates money. Stateless replicas do not own payment truth.",
  },
  {
    id: "db",
    label: "Durable database",
    why: "ACID boundary for attempts, unique claims and outbox. Cannot atomically commit an external PSP call.",
  },
  {
    id: "idempotency",
    label: "Idempotency",
    why: "Scoped unique reservation + fingerprint + replay. Redis locks alone cannot preserve completed effects across a crash.",
  },
  {
    id: "adapters",
    label: "PSP adapters",
    why: "Normalize capabilities and durable provider references. A second PSP does not share the first PSP’s idempotency scope.",
  },
  {
    id: "outbox",
    label: "Transactional outbox",
    why: "Business state and work commit together. Relay delivery may duplicate.",
  },
  {
    id: "queue",
    label: "Bounded queue",
    why: "Absorbs bursts with admission control; does not create consumer idempotency.",
  },
  {
    id: "workers",
    label: "Recovery workers",
    why: "Leased work, backoff, query and redrive. A lease expiring must not authorize a fresh charge.",
  },
  {
    id: "ledger",
    label: "Financial ledger",
    why: "Unique, balanced, immutable postings. Balance alone does not prove external settlement.",
  },
  {
    id: "webhooks",
    label: "Verified inbox",
    why: "Validate signature/account, durably store then ACK; dedup and validate transitions.",
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    why: "Compare provider, books and bank evidence; unresolved differences go to review.",
  },
  {
    id: "monitoring",
    label: "Observability",
    why: "Expose UNKNOWN age, queue lag and financial discrepancies without logging sensitive data.",
  },
];
export const architectureEdges: [ComponentId, ComponentId][] = [
  ["api", "db"],
  ["idempotency", "db"],
  ["api", "adapters"],
  ["db", "outbox"],
  ["outbox", "queue"],
  ["queue", "workers"],
  ["workers", "adapters"],
  ["workers", "ledger"],
  ["ledger", "db"],
  ["webhooks", "db"],
  ["workers", "db"],
  ["reconciliation", "adapters"],
  ["reconciliation", "ledger"],
  ["monitoring", "db"],
];
export type Design = {
  nodes: ComponentId[];
  edges: string[];
  recovery: "query" | "retry" | "failover";
  region: "fenced" | "consensus" | "unfenced";
  inbox: boolean;
};
export const edgeKey = (a: ComponentId, b: ComponentId) => `${a} → ${b}`;
export const initialDesign = (): Design => ({
  nodes: ["api", "adapters"],
  edges: [edgeKey("api", "adapters")],
  recovery: "retry",
  region: "unfenced",
  inbox: false,
});
export function evaluateDesign(d: Design) {
  const has = (id: ComponentId) => d.nodes.includes(id);
  const path = (a: ComponentId, b: ComponentId) =>
    has(a) && has(b) && d.edges.includes(edgeKey(a, b));
  return [
    {
      name: "Concurrent duplicate requests",
      pass: path("api", "db") && path("idempotency", "db"),
      why: "A scoped unique claim and canonical fingerprint must reach the authoritative transaction boundary.",
    },
    {
      name: "Lost provider response",
      pass:
        d.recovery === "query" &&
        path("workers", "adapters") &&
        path("workers", "db"),
      why: "Persist attempt/reference; recover by query or validated callback. Never blindly change PSP after timeout.",
    },
    {
      name: "Commit / publish crash",
      pass:
        path("db", "outbox") &&
        path("outbox", "queue") &&
        path("queue", "workers"),
      why: "Atomic outbox + retrying relay bridge the DB/broker boundary; queue alone leaves a dual-write gap.",
    },
    {
      name: "Worker commit before ACK",
      pass: d.inbox && path("workers", "ledger") && path("ledger", "db"),
      why: "Inbox dedup + unique journal identity + ledger commit must be atomic. Broker ACK happens afterwards.",
    },
    {
      name: "Callback and settlement drift",
      pass:
        path("webhooks", "db") &&
        path("reconciliation", "adapters") &&
        path("reconciliation", "ledger"),
      why: "Authenticated durable inbox plus external evidence comparison repair missed or reordered notifications.",
    },
    {
      name: "Region failure",
      pass: has("db") && d.region !== "unfenced",
      why: "Fence the previous writer before promotion, or use a quorum protocol for each financial write. Replication alone permits split brain.",
    },
    {
      name: "Operator investigation",
      pass: path("monitoring", "db"),
      why: "Correlated audit records and unknown-age/ledger/reconciliation alerts make recovery observable.",
    },
  ];
}

export type ReconRow = {
  id: string;
  internal: number | null;
  provider: number | null;
  currency: string;
  reportCurrency: string;
  fee: number;
  net: number;
  age: number;
  duplicate?: boolean;
};
export const reconRows: ReconRow[] = [
  {
    id: "psp_a",
    internal: 100000,
    provider: 100000,
    currency: "INR",
    reportCurrency: "INR",
    fee: 2000,
    net: 98000,
    age: 3,
  },
  {
    id: "psp_b",
    internal: null,
    provider: 100000,
    currency: "INR",
    reportCurrency: "INR",
    fee: 2000,
    net: 98000,
    age: 3,
  },
  {
    id: "psp_c",
    internal: 100000,
    provider: 99000,
    currency: "INR",
    reportCurrency: "INR",
    fee: 2000,
    net: 97000,
    age: 3,
  },
  {
    id: "psp_d",
    internal: 100000,
    provider: null,
    currency: "INR",
    reportCurrency: "INR",
    fee: 0,
    net: 0,
    age: 1,
  },
  {
    id: "psp_e",
    internal: 100000,
    provider: 100000,
    currency: "INR",
    reportCurrency: "USD",
    fee: 2000,
    net: 98000,
    age: 4,
  },
  {
    id: "psp_f",
    internal: 100000,
    provider: 100000,
    currency: "INR",
    reportCurrency: "INR",
    fee: 2000,
    net: 98000,
    age: 3,
    duplicate: true,
  },
];
export function classifyRecon(r: ReconRow): string {
  if (r.duplicate) return "duplicate report";
  if (r.currency !== r.reportCurrency) return "currency mismatch";
  if (r.internal === null) return "missing internally";
  if (r.provider === null)
    return r.age <= 2 ? "within settlement window" : "missing externally";
  if (r.internal !== r.provider || r.provider - r.fee !== r.net)
    return "amount mismatch";
  return "matched";
}

export const rubric = [
  { name: "Requirements and estimation", max: 15 },
  { name: "APIs and data modeling", max: 15 },
  { name: "Correctness and idempotency", max: 20 },
  { name: "Failure recovery", max: 20 },
  { name: "Ledger and reconciliation", max: 15 },
  { name: "Scaling, security, and trade-offs", max: 15 },
];
export type AssessmentQuestion = {
  prompt: string;
  options: string[];
  correct: number;
  category: number;
  points: number;
  gate?: string;
  why: string;
  followup: string;
};
export const assessment: AssessmentQuestion[] = [
  {
    prompt: "Frame 10M payments/day",
    options: [
      "A complete bank with unspecified rails",
      "Multi-PSP orchestrator; 116 average TPS, peak assumption ×10 ≈ 1,157 TPS",
    ],
    correct: 1,
    category: 0,
    points: 15,
    why: "Clarify rails, capture/refund scope, settlement ownership and latency; separate average from peak.",
    followup:
      "What are your RPO and recovery objectives for accepted payments?",
  },
  {
    prompt: "Choose API and storage identity",
    options: [
      "Tenant-scoped intents, attempts, minor units, unique request fingerprints and CAS versions",
      "Float amount and client-supplied merchant owner",
    ],
    correct: 0,
    category: 1,
    points: 15,
    why: "Authorize server-side tenant ownership, currency precision, stable operation IDs and indexed recovery queries.",
    followup: "Which columns and constraints enforce ownership and uniqueness?",
  },
  {
    prompt: "Two replicas confirm the same checkout",
    options: [
      "Atomic durable claim and provider attempt key",
      "Check cache, then each issue a new charge",
    ],
    correct: 0,
    category: 2,
    points: 10,
    gate: "No blind duplicate charges",
    why: "One UNIQUE claim wins; duplicates replay or return in-progress; changed payload conflicts.",
    followup: "What happens when the idempotency key expires?",
  },
  {
    prompt: "Old FAILED event arrives after CAPTURED",
    options: [
      "Overwrite with most recently received event",
      "Verify evidence and reject stale transition; model a real reversal separately",
    ],
    correct: 1,
    category: 2,
    points: 5,
    gate: "No invalid state transitions",
    why: "Arrival order is not provider state order. Signed events still need identity, amount and transition validation.",
    followup: "How do you recover a missing prerequisite event?",
  },
  {
    prompt: "Two ₹700 refunds race on ₹1,000 captured",
    options: [
      "Atomically reserve refund budget including pending refunds",
      "Both read ₹1,000, both proceed",
    ],
    correct: 0,
    category: 2,
    points: 5,
    gate: "No unsafe refund overrun",
    why: "Under one transaction/CAS, completed + pending + new refund must not exceed captured.",
    followup: "Does a refund timeout release its budget?",
  },
  {
    prompt: "PSP accepted; API timed out",
    options: [
      "Mark FAILED and fail over to another PSP",
      "Keep UNKNOWN; query original reference, await verified callback, reconcile",
    ],
    correct: 1,
    category: 3,
    points: 10,
    gate: "No treating timeout as definitive failure",
    why: "External effect and local observation diverge. Durable recovery must not create a second financial attempt blindly.",
    followup: "What if the PSP has no query or idempotency capability?",
  },
  {
    prompt: "Worker dies after journal commit",
    options: [
      "Redeliver, suppress with transactional inbox + unique journal, then ACK",
      "ACK before committing to avoid duplicate delivery",
    ],
    correct: 0,
    category: 3,
    points: 10,
    why: "At-least-once delivery plus idempotent effects closes commit-before-ACK uncertainty.",
    followup: "Where is your atomic inbox/journal boundary?",
  },
  {
    prompt: "Capture journal is unbalanced",
    options: [
      "Post and fix asynchronously",
      "Reject the entire journal; balance per currency before posting",
    ],
    correct: 1,
    category: 4,
    points: 8,
    gate: "No unbalanced posted journal",
    why: "Immutable balanced postings need atomic validation; append reversals rather than edits.",
    followup: "Can a balanced ledger still disagree with the bank?",
  },
  {
    prompt: "Settlement is ₹20 short",
    options: [
      "Insert money to make totals match",
      "Match provider ID, currency, fees, net and window; quarantine unresolved evidence",
    ],
    correct: 1,
    category: 4,
    points: 7,
    gate: "No invented reconciliation corrections",
    why: "A discrepancy is evidence to investigate, not permission to fabricate a financial posting.",
    followup: "How do chargebacks after payout change the investigation?",
  },
  {
    prompt: "A region fails with payments in flight",
    options: [
      "Fenced single-writer promotion or consensus writes; reconcile uncertain work",
      "Independent active-active writes with local dedup only",
    ],
    correct: 0,
    category: 5,
    points: 8,
    why: "Accepted financial identity must survive failover. State RPO/RTO; pause if fencing or durable recovery is uncertain.",
    followup: "How do you prove the old writer is fenced?",
  },
  {
    prompt: "Secure and scale the hot path",
    options: [
      "Raw card logs, unbounded retries and shared tenant credentials",
      "Hosted tokenization, tenant auth, verified callbacks, bounded queues/quotas and redacted traces",
    ],
    correct: 1,
    category: 5,
    points: 7,
    why: "Isolate provider failures and hot merchants; reduce sensitive-data exposure. Tokenization is not a certification claim.",
    followup:
      "What metric alerts before UNKNOWN work becomes a financial incident?",
  },
];
export function grade(answers: number[]) {
  const categories = rubric.map((r, index) => ({
    ...r,
    score: assessment.reduce(
      (sum, q, i) =>
        sum + (q.category === index && answers[i] === q.correct ? q.points : 0),
      0,
    ),
  }));
  const failures = assessment
    .filter((q, i) => q.gate && answers[i] !== q.correct)
    .map((q) => q.gate!);
  return {
    total: categories.reduce((sum, c) => sum + c.score, 0),
    categories,
    failures,
    passed:
      failures.length === 0 &&
      categories.reduce((sum, c) => sum + c.score, 0) >= 80,
  };
}
