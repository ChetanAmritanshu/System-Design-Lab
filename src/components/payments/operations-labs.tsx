"use client";

import { useState } from "react";
import {
  architectureEdges,
  capacity,
  classifyRecon,
  components,
  edgeKey,
  evaluateDesign,
  initialDesign,
  initialPipeline,
  initialRefunds,
  pipelineStep,
  reconRows,
  reserveRefund,
  settleRefunds,
} from "@/lib/payments/engine";
import type { Design, PipelineEvent } from "@/lib/payments/engine";
import { Invariant, Metrics, PaymentLab, Range, rupees } from "./lab-ui";

export function ReconciliationLab() {
  const [row, setRow] = useState(0),
    [choice, setChoice] = useState(""),
    [history, setHistory] = useState([
      "Statement batch imported by provider account, reference, currency and report version. Two-day window is illustrative.",
    ]);
  const r = reconRows[row],
    classification = classifyRecon(r);
  const choose = (value: string) => {
    setChoice(value);
    setHistory((h) => [
      ...h,
      `${r.id}: ${value === classification ? "Correct classification" : "Classification needs revision"}: ${value}. Evidence says ${classification}.`,
    ]);
  };
  return (
    <PaymentLab
      title="Reconciliation investigator"
      objective="Compare the three evidence sources, classify each discrepancy, then choose a safe investigation or repair action. Some cases deliberately remain unresolved."
      history={history}
      reset={() => {
        setRow(0);
        setChoice("");
        setHistory(["Investigation reset; no financial records modified."]);
      }}
    >
      <label className="pay-field">
        Investigation
        <select
          value={row}
          onChange={(e) => {
            setRow(+e.target.value);
            setChoice("");
            setHistory((h) => [
              ...h,
              `Opened ${reconRows[+e.target.value].id} evidence packet.`,
            ]);
          }}
        >
          {reconRows.map((x, i) => (
            <option key={x.id} value={i}>
              {x.id}
            </option>
          ))}
        </select>
      </label>
      <div className="pay-cards">
        <div>
          <small>INTERNAL PAYMENT + LEDGER</small>
          <b>
            {r.internal === null ? "No internal record" : rupees(r.internal)}
          </b>
          <p>
            Currency: {r.currency}.{" "}
            {r.internal === null
              ? "No capture journal found."
              : "Capture journal amount equals internal gross."}
          </p>
        </div>
        <div>
          <small>PSP STATEMENT</small>
          <b>
            {r.provider === null
              ? "Not in this report"
              : `${r.provider} minor units ${r.reportCurrency}`}
          </b>
          <p>
            Fee: {r.fee} · Net: {r.net} minor units.{" "}
            {r.duplicate
              ? "Same report line imported twice."
              : "One statement row."}
          </p>
        </div>
        <div>
          <small>BANK / TIMING EVIDENCE</small>
          <b>{r.age} days since capture</b>
          <p>
            {r.provider === null
              ? "No bank settlement reference yet."
              : `Bank batch net: ${r.net} minor units ${r.reportCurrency}.`}{" "}
            Window assumption: 2 days.
          </p>
        </div>
      </div>
      <div className="pay-actions">
        {[
          "matched",
          "missing internally",
          "amount mismatch",
          "within settlement window",
          "currency mismatch",
          "duplicate report",
        ].map((x) => (
          <button
            type="button"
            aria-pressed={choice === x}
            onClick={() => choose(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="pay-actions">
        <button
          type="button"
          onClick={() =>
            setHistory((h) => [
              ...h,
              classification === "matched"
                ? "Matched gross/fee/net/currency and bank reference; mark reconciled without creating duplicate journals."
                : classification === "within settlement window"
                  ? "Keep pending; schedule a recheck after the window. No financial correction yet."
                  : classification === "duplicate report"
                    ? "Deduplicate report identity; preserve raw evidence. Do not reverse a real capture because an ingestion row repeated."
                    : "Fetch PSP object and source statement, match account/reference, inspect inbox and journals; open exception with evidence. Missing-internal reconstruction requires verified provenance and audited approval. Amount/currency differences remain for human review.",
            ])
          }
        >
          Investigate with evidence
        </button>
        <button
          type="button"
          onClick={() =>
            setHistory((h) => [
              ...h,
              "REJECTED: fictional balancing adjustment would hide the discrepancy. No financial posting made; escalate unresolved evidence.",
            ])
          }
        >
          Force totals to match
        </button>
      </div>
      <Invariant pass={choice === "" || choice === classification}>
        Classification does not authorize a financial posting. Keep unresolved
        discrepancies visible.
      </Invariant>
    </PaymentLab>
  );
}

const pipelineActions: [PipelineEvent, string][] = [
  ["accept", "Accept + DB/outbox commit"],
  ["publish", "Relay publish"],
  ["consume", "Consume + ACK"],
  ["crash", "Crash after commit, before ACK"],
  ["duplicate", "Duplicate delivery"],
  ["db-down", "Inject DB outage"],
  ["provider-delay", "Inject provider delay"],
  ["poison", "Poison → DLQ"],
  ["redrive", "Fix + redrive identity"],
];
export function PipelineLab() {
  const [s, setS] = useState(initialPipeline);
  return (
    <PaymentLab
      title="Event pipeline failure lab"
      objective="Commit the capture evidence, publish, then crash before ACK. Redeliver and verify one journal. Inject outages and poison messages to inspect retained work."
      history={s.history}
      reset={() => setS(initialPipeline())}
    >
      <div className="pay-pipeline">
        <span>
          DB / OUTBOX <b>{s.outbox}</b>
        </span>
        <span>
          → BROKER <b>{s.queue}</b>
        </span>
        <span>
          → INBOX <b>{s.inbox ? "seen" : "empty"}</b>
        </span>
        <span>
          → JOURNAL <b>{s.posted}</b>
        </span>
      </div>
      <Metrics
        items={[
          ["Retry attempts", s.retries],
          ["DLQ messages", s.dlq],
          ["Last consume ACK", s.acked ? "sent" : "not sent"],
        ]}
      />
      <div className="pay-actions">
        {pipelineActions.map(([event, label]) => (
          <button
            type="button"
            key={event}
            onClick={() => setS((v) => pipelineStep(v, event))}
          >
            {label}
          </button>
        ))}
      </div>
      <Invariant pass={s.posted <= 1}>
        At most one journal for this business event, even when broker delivery
        repeats. Outages here are single injected failures; later Consume
        represents restored service.
      </Invariant>
    </PaymentLab>
  );
}

export function ScalePaymentLab() {
  const [traffic, setTraffic] = useState(1200),
    [latency, setLatency] = useState(800),
    [workers, setWorkers] = useState(100),
    [pool, setPool] = useState(20),
    [quota, setQuota] = useState(2000),
    [down, setDown] = useState(false),
    [region, setRegion] = useState("fenced"),
    [history, setHistory] = useState([
      "Illustrative capacity model; no measured performance or percentile-latency claim.",
    ]);
  const c = capacity(traffic, latency, workers, pool, quota, down);
  const log = (s: string) => setHistory((h) => [...h, s]);
  return (
    <PaymentLab
      title="Scale the payment engine"
      objective="Find the limiting resource. Increase offered traffic 100×, isolate a provider outage, and compare regional correctness policies."
      history={history}
      reset={() => {
        setTraffic(1200);
        setLatency(800);
        setWorkers(100);
        setPool(20);
        setQuota(2000);
        setDown(false);
        setRegion("fenced");
        setHistory(["Default capacity assumptions restored."]);
      }}
    >
      <div className="pay-control-grid">
        {[
          {
            label: "Offered TPS",
            v: traffic,
            set: setTraffic,
            min: 100,
            max: 120000,
            step: 100,
          },
          {
            label: "Provider latency (ms)",
            v: latency,
            set: setLatency,
            min: 100,
            max: 5000,
            step: 100,
          },
          {
            label: "Worker concurrency",
            v: workers,
            set: setWorkers,
            min: 10,
            max: 4000,
            step: 10,
          },
          {
            label: "DB pool connections",
            v: pool,
            set: setPool,
            min: 1,
            max: 100,
            step: 1,
          },
          {
            label: "Provider quota TPS",
            v: quota,
            set: setQuota,
            min: 100,
            max: 5000,
            step: 100,
          },
        ].map((x) => (
          <Range
            key={x.label}
            label={x.label}
            value={x.v}
            onChange={(v) => {
              x.set(v);
              log(`${x.label} = ${v}; limiting capacity recalculated.`);
            }}
            min={x.min}
            max={x.max}
            step={x.step}
          />
        ))}
      </div>
      <div className="pay-actions">
        <button
          type="button"
          aria-pressed={down}
          onClick={() => {
            setDown((v) => !v);
            log(
              down
                ? "Provider restored; drain retained work under quota."
                : "Provider unavailable; circuit breaker opens. No new financial attempts for uncertain work.",
            );
          }}
        >
          Provider {down ? "DOWN" : "UP"}
        </button>
      </div>
      <label className="pay-field">
        Regional ownership
        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            log(`Regional policy changed to ${e.target.value}.`);
          }}
        >
          <option value="fenced">Single writer; fence before promotion</option>
          <option value="consensus">Consensus-backed financial writes</option>
          <option value="independent">Independent active-active writers</option>
        </select>
      </label>
      <Metrics
        items={[
          ["Synthetic service TPS", c.service.toFixed(0)],
          ["Demand above service / minute", c.backlog.toFixed(0)],
          ["PSP concurrency latency floor", `${latency} ms`],
          [
            "Financial write ownership",
            region === "independent" ? "split-brain risk" : "coordinated",
          ],
        ]}
      />
      <p>
        Capacity = min(workers × 1,000 / provider ms, pool × assumed 50 DB
        commits/s, PSP quota). Arrivals above capacity must be durably queued
        within bounds or rejected before acceptance. A sustained overload grows
        queue age and end-to-end latency; the display is a one-minute fluid
        estimate with no queue cap or p99 prediction.
      </p>
      <Invariant pass={region !== "independent"}>
        {region === "independent"
          ? "Local dedup in two writable regions can admit duplicate charges. Fence or coordinate before accepting financial writes."
          : "Regional policy requires implementation evidence: replication durability, fencing/quorum and explicit RPO/RTO. A dropdown cannot itself guarantee these."}
      </Invariant>
    </PaymentLab>
  );
}

const threats = [
  {
    prompt: "A valid signed event says ₹2,000 for a ₹1,000 intent.",
    options: [
      "Trust the signature",
      "Check provider account, object, amount, currency and legal transition",
    ],
    correct: 1,
    why: "Origin authentication does not validate business ownership or amounts. Quarantine and query authoritative evidence.",
  },
  {
    prompt: "Merchant A queries merchant B’s payment ID.",
    options: [
      "Authorize tenant ownership on every object operation",
      "IDs are hard to guess, so allow it",
    ],
    correct: 0,
    why: "Server-side tenant authorization is mandatory; random IDs are not access control.",
  },
  {
    prompt: "A signed callback is replayed with the same event ID.",
    options: [
      "Timestamp only",
      "Raw-body signature + timestamp tolerance + durable replay identity",
    ],
    correct: 1,
    why: "Timestamp checks bound replay age; inbox/business identities suppress repeated financial effects.",
  },
  {
    prompt: "Debugging asks for PAN, CVV and provider secret in logs.",
    options: [
      "Use tokens/references, redact logs, vault and rotate secrets",
      "Log everything for auditability",
    ],
    correct: 0,
    why: "Auditability needs event identity and evidence links, not raw card data or credentials. Restrict operator access.",
  },
  {
    prompt: "A merchant sends 1,000 refund attempts per minute.",
    options: [
      "Only scale workers",
      "Enforce tenant/risk/velocity controls and atomic refund budgets",
    ],
    correct: 1,
    why: "Fraud/abuse controls complement financial invariants. Apply least privilege and review high-impact operations.",
  },
];
export function SecurityLab() {
  const [round, setRound] = useState(0),
    [history, setHistory] = useState([
      "Inspect synthetic threats. No credentials or real account data.",
    ]),
    [solved, setSolved] = useState(false);
  const t = threats[round];
  return (
    <PaymentLab
      title="Security threat scenarios"
      objective="Choose a mitigation at each boundary, read the consequence, then advance. All scenarios use invented identifiers."
      history={history}
      reset={() => {
        setRound(0);
        setSolved(false);
        setHistory(["Threat review restarted."]);
      }}
    >
      <p className="pay-scenario">
        {round + 1} / {threats.length} · {t.prompt}
      </p>
      <div className="pay-actions">
        {t.options.map((o, i) => (
          <button
            type="button"
            key={o}
            onClick={() => {
              setSolved(i === t.correct);
              setHistory((h) => [
                ...h,
                `${i === t.correct ? "Protected" : "Unsafe"}: ${t.why}`,
              ]);
            }}
          >
            {o}
          </button>
        ))}
        <button
          type="button"
          disabled={!solved || round === threats.length - 1}
          onClick={() => {
            setRound((v) => v + 1);
            setSolved(false);
            setHistory((h) => [...h, "Next threat opened."]);
          }}
        >
          Next threat
        </button>
      </div>
      {solved && round === threats.length - 1 ? (
        <Invariant pass={true}>
          All five security boundaries reviewed. This is design practice, not a
          compliance certification.
        </Invariant>
      ) : null}
    </PaymentLab>
  );
}

export function RefundLab() {
  const [s, setS] = useState(initialRefunds),
    [amount, setAmount] = useState(70000);
  return (
    <PaymentLab
      title="Partial refund concurrency"
      objective="Reserve two simultaneous refunds and test the ceiling, duplicate request, changed payload and unknown pending budget. Confirm only with external evidence."
      history={s.history}
      reset={() => {
        setS(initialRefunds());
        setAmount(70000);
      }}
    >
      <Range
        label="Refund request (paise)"
        value={amount}
        min={1000}
        max={100000}
        step={1000}
        onChange={setAmount}
      />
      <Metrics
        items={[
          ["Captured", rupees(s.captured)],
          ["Completed refunds", rupees(s.completed)],
          ["Pending reservation", rupees(s.reserved)],
          [
            "Unreserved capacity",
            rupees(s.captured - s.completed - s.reserved),
          ],
          [
            "Refund dimension",
            s.completed === s.captured
              ? "refunded"
              : s.completed
                ? "partially refunded"
                : "not refunded",
          ],
        ]}
      />
      <div className="pay-actions">
        <button
          type="button"
          onClick={() => setS((v) => reserveRefund(v, "refund_a", amount))}
        >
          Reserve / replay refund A
        </button>
        <button
          type="button"
          onClick={() =>
            setS((v) =>
              reserveRefund(
                reserveRefund(v, "refund_a", amount),
                "refund_b",
                amount,
              ),
            )
          }
        >
          Race A + B for same budget
        </button>
        <button
          type="button"
          onClick={() =>
            setS((v) => ({
              ...v,
              history: [
                ...v.history,
                "Refund response lost: reservation retained; query original refund reference. No fresh refund on another key.",
              ],
            }))
          }
        >
          Lose refund response
        </button>
        <button type="button" onClick={() => setS(settleRefunds)}>
          Confirm reserved refunds
        </button>
      </div>
      <Invariant pass={s.completed + s.reserved <= s.captured}>
        Completed + reserved ≤ captured. Independent refund keys do not permit
        independent spending of the same budget.
      </Invariant>
    </PaymentLab>
  );
}

const incidentStages = [
  {
    label: "09:00 · Detect",
    text: "Provider A p95 = 8s, UNKNOWN = 340, oldest UNKNOWN = 12min, webhook lag = 9min, queue oldest = 11min. B healthy. Ledger imbalance = 0; reconciliation differences = 21.",
  },
  {
    label: "09:03 · Contain",
    text: "New eligible attempts route to B; uncertain A attempts stay pinned to A. Recovery lane limited to A’s query quota. No financial rows erased. Unknown count stops growing.",
  },
  {
    label: "09:18 · Recover",
    text: "Validated queries/callbacks resolve 330 attempts. Ten remain in exception review. Queue oldest falls to 2min; no duplicate capture journals. Reconciliation differences still = 10.",
  },
  {
    label: "10:00 · Verify",
    text: "Statement and bank evidence resolve remaining exceptions; capture/refund totals and unique journal identities checked. UNKNOWN = 0, unexplained differences = 0. Close after impact and audit review.",
  },
];
export function ControlRoom() {
  const [stage, setStage] = useState(0),
    [history, setHistory] = useState([incidentStages[0].text]);
  return (
    <PaymentLab
      title="Payment incident control room"
      objective="Diagnose the evidence, choose safe containment, recover outcomes and prove financial resolution. A quiet API dashboard is not enough."
      history={history}
      reset={() => {
        setStage(0);
        setHistory([incidentStages[0].text]);
      }}
    >
      <p className="pay-kicker">{incidentStages[stage].label}</p>
      <p className="pay-evidence">{incidentStages[stage].text}</p>
      <div className="pay-actions">
        <button
          type="button"
          onClick={() =>
            setHistory((h) => [
              ...h,
              "UNSAFE: marking UNKNOWN as failed or replaying charges on B hides unresolved A captures. Keep original identities and evidence.",
            ])
          }
        >
          Clear backlog as failed
        </button>
        <button
          type="button"
          onClick={() =>
            setHistory((h) => [
              ...h,
              "Provider-scoped latency + UNKNOWN age + webhook lag indicate external/recovery degradation, not a license to repeat charges. Zero imbalance alone does not prove settlement.",
            ])
          }
        >
          Diagnose correlated signals
        </button>
        <button
          type="button"
          disabled={stage === 3}
          onClick={() => {
            const next = stage + 1;
            setStage(next);
            setHistory((h) => [...h, incidentStages[next].text]);
          }}
        >
          {stage === 0
            ? "Contain new traffic safely"
            : stage === 1
              ? "Recover original attempts"
              : "Verify financial closure"}
        </button>
      </div>
      <Invariant pass={stage === 3}>
        {stage === 3
          ? "Recovery verified against unique effects, immutable books and external evidence."
          : "Incident remains open until uncertain effects and unexplained settlement differences are accounted for."}
      </Invariant>
    </PaymentLab>
  );
}

export function ArchitectureBuilder() {
  const [d, setD] = useState(initialDesign),
    [run, setRun] = useState(false),
    [selected, setSelected] = useState("api"),
    [history, setHistory] = useState([
      "Minimal API → PSP adapter. Add components AND their correctness connections before running failures.",
    ]);
  const log = (text: string) => {
    setRun(false);
    setHistory((h) => [...h, text]);
  };
  const results = evaluateDesign(d);
  return (
    <PaymentLab
      title="Architecture builder"
      objective="Earn each component, wire its transaction/data path, choose policies, then inject the failure suite. Selecting every box without connections cannot pass."
      history={history}
      reset={() => {
        setD(initialDesign());
        setRun(false);
        setSelected("api");
        setHistory(["Minimal architecture restored."]);
      }}
    >
      <fieldset>
        <legend>1 · Components (select a label to inspect its purpose)</legend>
        <div className="pay-component-grid">
          {components.map((c) => (
            <div key={c.id}>
              <label>
                <input
                  type="checkbox"
                  checked={d.nodes.includes(c.id)}
                  onChange={(e) => {
                    setD((v) => ({
                      ...v,
                      nodes: e.target.checked
                        ? [...v.nodes, c.id]
                        : v.nodes.filter((n) => n !== c.id),
                    }));
                    log(
                      `${c.label} ${e.target.checked ? "added" : "removed"}; connections still require validation.`,
                    );
                  }}
                />
                {c.label}
              </label>
              <button
                type="button"
                className="pay-inspect"
                onClick={() => {
                  setSelected(c.id);
                  setHistory((h) => [...h, c.why]);
                }}
              >
                Why?
              </button>
            </div>
          ))}
        </div>
        <p className="pay-evidence">
          {components.find((c) => c.id === selected)?.why}
        </p>
      </fieldset>
      <fieldset>
        <legend>2 · Explicit directed connections</legend>
        <div className="pay-edge-grid">
          {architectureEdges.map(([a, b]) => {
            const key = edgeKey(a, b);
            return (
              <label className="pay-check" key={key}>
                <input
                  type="checkbox"
                  checked={d.edges.includes(key)}
                  onChange={(e) => {
                    setD((v) => ({
                      ...v,
                      edges: e.target.checked
                        ? [...v.edges, key]
                        : v.edges.filter((x) => x !== key),
                    }));
                    log(
                      `Connection ${key} ${e.target.checked ? "wired" : "removed"}.`,
                    );
                  }}
                />
                {key}
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="pay-control-grid">
        <label className="pay-field">
          3 · Uncertain outcome policy
          <select
            value={d.recovery}
            onChange={(e) => {
              setD((v) => ({
                ...v,
                recovery: e.target.value as Design["recovery"],
              }));
              log("Recovery policy changed.");
            }}
          >
            <option value="retry">New key retry</option>
            <option value="failover">Blind PSP failover</option>
            <option value="query">
              Query original / verified callback + reconciliation
            </option>
          </select>
        </label>
        <label className="pay-field">
          4 · Region write policy
          <select
            value={d.region}
            onChange={(e) => {
              setD((v) => ({
                ...v,
                region: e.target.value as Design["region"],
              }));
              log("Regional policy changed.");
            }}
          >
            <option value="unfenced">Independent writers</option>
            <option value="fenced">Fenced single writer</option>
            <option value="consensus">Consensus-backed writes</option>
          </select>
        </label>
      </div>
      <label className="pay-check">
        <input
          type="checkbox"
          checked={d.inbox}
          onChange={(e) => {
            setD((v) => ({ ...v, inbox: e.target.checked }));
            log("Consumer atomic inbox + journal boundary changed.");
          }}
        />
        Commit inbox dedup + journal together before broker ACK
      </label>
      <div className="pay-graph" aria-label="Current directed architecture">
        {d.edges
          .filter((key) => {
            const [a, b] = key.split(" → ");
            return (
              d.nodes.includes(a as Design["nodes"][number]) &&
              d.nodes.includes(b as Design["nodes"][number])
            );
          })
          .map((key) => (
            <code key={key}>{key}</code>
          ))}
      </div>
      <div className="pay-actions">
        <button
          type="button"
          onClick={() => {
            setRun(true);
            setHistory((h) => [
              ...h,
              `Failure suite: ${results.filter((r) => r.pass).length}/${results.length} explicit graph/configuration rules pass. No financial network effects were executed.`,
            ]);
          }}
        >
          Run failure suite
        </button>
      </div>
      {run ? (
        <div className="pay-results">
          {results.map((r) => (
            <div key={r.name}>
              <Invariant pass={r.pass}>{r.name}</Invariant>
              <p>{r.why}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>
          Configure first. Feedback appears when you run the suite; changing a
          design invalidates the previous result.
        </p>
      )}
      <details>
        <summary>Alternatives and scope of these rules</summary>
        <p>
          This suite targets the evolved asynchronous architecture. A low-load
          synchronous design can replace queues with transactional durable jobs
          and direct query recovery; it still needs durable identity, external
          uncertainty handling and financial records. Fenced single-writer and
          consensus-backed policies are both accepted. Rules check declared
          boundaries, not an actual distributed protocol; implementation still
          has to prove them.
        </p>
      </details>
    </PaymentLab>
  );
}
