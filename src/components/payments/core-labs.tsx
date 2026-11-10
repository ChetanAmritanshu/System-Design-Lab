"use client";

import { useState } from "react";
import {
  accountBalance,
  captureJournal,
  claimRequest,
  completeClaims,
  estimate,
  initialLedger,
  initialPayment,
  initialRace,
  paymentEvents,
  postJournal,
  reversal,
  transition,
  transitionAtVersion,
} from "@/lib/payments/engine";
import type { Account, EstimateInput } from "@/lib/payments/engine";
import { Invariant, Metrics, PaymentLab, Range, rupees } from "./lab-ui";

const cardParticipants = [
  [
    "Customer",
    "Approves the purchase and any issuer authentication; does not decide settlement.",
  ],
  [
    "Merchant / checkout",
    "Owns order-42, displays processing and sends a token plus stable operation identity.",
  ],
  [
    "Our orchestrator",
    "Authorizes tenant access, records intent/attempt and routes to the PSP.",
  ],
  [
    "PSP / gateway / processor",
    "Gateway transports payment instructions; processor connects to acquiring/rail systems. A PSP can bundle these roles.",
  ],
  [
    "Acquirer → network → issuer",
    "Acquirer serves merchant, network routes, issuer authorizes the cardholder hold. These are external systems.",
  ],
  [
    "Clearing → settlement → payout",
    "Captured records clear, obligations settle, and eligible proceeds are paid to the merchant on separate schedules.",
  ],
];
const bankParticipants = [
  [
    "Customer",
    "Approves a bank transfer/UPI payment using the rail’s authentication flow.",
  ],
  [
    "Merchant / checkout",
    "Creates order-42 and a provider/rail reference; displays pending until confirmed.",
  ],
  [
    "Our orchestrator",
    "Records the attempt, calls the rail-capable adapter and schedules status recovery.",
  ],
  [
    "PSP / payer app",
    "Initiates/routes supported payment instructions. Capabilities depend on the PSP and rail.",
  ],
  [
    "Payer bank → rail → payee bank",
    "External banks and network process the transfer. Do not insert a universal card auth/capture hold here.",
  ],
  [
    "Confirmation → reconciliation",
    "Customer confirmation and inter-participant settlement are different layers. Refunds and merchant payout follow the actual contract.",
  ],
];
export function MoneyJourney() {
  const [bank, setBank] = useState(false),
    [step, setStep] = useState(0),
    [selected, setSelected] = useState(0),
    [history, setHistory] = useState([
      "Order-42: customer owes merchant ₹1,000.",
    ]);
  const people = bank ? bankParticipants : cardParticipants;
  const reset = () => {
    setBank(false);
    setStep(0);
    setSelected(0);
    setHistory(["Order-42: customer owes merchant ₹1,000."]);
  };
  return (
    <PaymentLab
      title="Follow your money"
      objective="Advance one stage, then select any participant to inspect its responsibility. Switch rails to expose the card-specific assumptions."
      history={history}
      reset={reset}
    >
      <div className="pay-actions">
        <button
          type="button"
          aria-pressed={!bank}
          onClick={() => {
            setBank(false);
            setStep(0);
            setSelected(0);
            setHistory((h) => [
              ...h,
              "Changed to illustrative card path; journey restarted.",
            ]);
          }}
        >
          Card
        </button>
        <button
          type="button"
          aria-pressed={bank}
          onClick={() => {
            setBank(true);
            setStep(0);
            setSelected(0);
            setHistory((h) => [
              ...h,
              "Changed to bank-transfer/UPI-style conceptual path; journey restarted.",
            ]);
          }}
        >
          Bank / UPI-style
        </button>
        <button
          type="button"
          disabled={step === 5}
          onClick={() => {
            const next = step + 1;
            setStep(next);
            setSelected(next);
            setHistory((h) => [...h, `${people[next][0]}: ${people[next][1]}`]);
          }}
        >
          Advance money story →
        </button>
      </div>
      <div className="pay-flow">
        {people.map(([name], i) => (
          <button
            type="button"
            key={name}
            className={`${i <= step ? "earned" : ""} ${selected === i ? "selected" : ""}`}
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i);
              setHistory((h) => [...h, `Inspected ${name}: ${people[i][1]}`]);
            }}
          >
            <small>
              {String(i + 1).padStart(2, "0")} {i === step ? "CURRENT" : ""}
            </small>
            {name}
          </button>
        ))}
      </div>
      <p className="pay-evidence">
        <b>{people[selected][0]}</b>
        <br />
        {people[selected][1]}
      </p>
      <Invariant pass={true}>
        {bank
          ? "Rail-specific model: no universal card authorization/capture lifecycle is assumed."
          : "Authorization, capture, settlement and payout are separate stages. ₹1,000 remains gross; fees and availability are separate."}
      </Invariant>
    </PaymentLab>
  );
}

const defaults: EstimateInput = {
  daily: 10000000,
  peak: 10,
  reads: 3,
  days: 365,
  bytes: 4000,
  latency: 800,
  availability: 99.9,
};
export function PaymentEstimator() {
  const [values, setValues] = useState(defaults),
    [history, setHistory] = useState([
      "Assumptions loaded: 10M payments/day, 10× peak; not measured performance.",
    ]);
  const result = estimate(values);
  const update = (key: keyof EstimateInput, value: number) => {
    setValues((v) => ({ ...v, [key]: value }));
    setHistory((h) => [
      ...h,
      `Assumption ${key} changed to ${value}; all derived estimates recalculated.`,
    ]);
  };
  return (
    <PaymentLab
      title="Size the workload"
      objective="Change assumptions and explain the derived peak TPS, storage and external concurrency before sizing machines."
      history={history}
      reset={() => {
        setValues(defaults);
        setHistory(["Default teaching assumptions restored."]);
      }}
    >
      <div className="pay-control-grid">
        <Range
          label="Daily payments"
          value={values.daily}
          min={100000}
          max={100000000}
          step={100000}
          onChange={(v) => update("daily", v)}
        />
        <Range
          label="Peak multiplier"
          value={values.peak}
          min={1}
          max={100}
          onChange={(v) => update("peak", v)}
          suffix="×"
        />
        <Range
          label="Read / write ratio"
          value={values.reads}
          min={1}
          max={20}
          onChange={(v) => update("reads", v)}
        />
        <Range
          label="Retention days"
          value={values.days}
          min={1}
          max={1095}
          onChange={(v) => update("days", v)}
        />
        <Range
          label="Bytes / payment bundle"
          value={values.bytes}
          min={1000}
          max={20000}
          step={1000}
          onChange={(v) => update("bytes", v)}
        />
        <Range
          label="Provider latency (ms)"
          value={values.latency}
          min={100}
          max={5000}
          step={100}
          onChange={(v) => update("latency", v)}
        />
        <Range
          label="Target availability (%)"
          value={values.availability}
          min={99}
          max={99.99}
          step={0.01}
          onChange={(v) => update("availability", v)}
        />
      </div>
      <Metrics
        items={[
          [
            "Average / peak TPS",
            `${result.tps.toFixed(1)} / ${result.peak.toFixed(1)}`,
          ],
          ["Peak read TPS", result.reads.toFixed(0)],
          ["Logical storage GB", result.storage.toFixed(0)],
          ["In-flight at PSP", result.inflight.toFixed(0)],
          [
            "30-day unavailable budget",
            `${result.downtime.toFixed(0)} seconds`,
          ],
        ]}
      />
      <details>
        <summary>Inspect formulas and missing overhead</summary>
        <p>
          TPS = daily / 86,400; peak = TPS × multiplier; reads = peak × ratio;
          GB = daily × days × bytes / 10⁹; in-flight = peak × latency / 1,000;
          unavailable seconds = (1 − availability/100) × 2,592,000. Replicas,
          backups, indexes beyond the bundle, retries and provider events
          require additional budget. None of these formulas predicts production
          p99 latency.
        </p>
      </details>
    </PaymentLab>
  );
}

export function PaymentStateLab() {
  const [p, setP] = useState(initialPayment);
  return (
    <PaymentLab
      title="Payment state machine playground"
      objective="Confirm then authorize and capture, or inject a lost response directly after confirmation. Try illegal transitions, duplicate callbacks and process restarts."
      history={p.history}
      reset={() => setP(initialPayment())}
    >
      <Metrics
        items={[
          ["Intent pi_1000", p.intent],
          ["Observed attempt_a", p.attempt],
          ["Provider evidence", p.provider],
          ["State version", p.version],
          ["Captured", rupees(p.captured)],
        ]}
      />
      <div className="pay-state-track">
        {[
          "created",
          "processing",
          "requires_action",
          "authorized",
          "captured",
          "failed",
          "voided",
          "unknown",
        ].map((s) => (
          <span className={s === p.attempt ? "active" : ""} key={s}>
            {s}
          </span>
        ))}
      </div>
      <div className="pay-actions">
        {paymentEvents.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => setP((v) => transition(v, e))}
          >
            {
              {
                confirm: "Confirm",
                action: "Require customer action",
                authorize: "Authorize",
                capture: "Capture",
                timeout: "PSP accepts; lose response",
                decline: "Provider decline",
                void: "Cancel / void",
                query: "Query PSP",
                webhook: "Capture webhook",
                stale: "Old failure callback",
                restart: "Restart process",
              }[e]
            }
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            setP((v) => transitionAtVersion(v, "void", v.version - 1))
          }
        >
          Write stale DB version
        </button>
      </div>
      <Invariant pass={p.attempt !== "unknown"}>
        {p.attempt === "unknown"
          ? "Local observation is uncertain. Capture evidence in the PSP column is visible to the learner; the API must recover it, not assume failure."
          : "Invalid transitions preserve financial state and version; evidence/history remain visible."}
      </Invariant>
    </PaymentLab>
  );
}

export function IdempotencyRaceLab() {
  const [s, setS] = useState(initialRace),
    [safe, setSafe] = useState(true);
  const scope = "merchant_1:confirm:order42";
  return (
    <PaymentLab
      title="Idempotency race lab"
      objective="Fire simultaneous replicas, retry before/after completion, and reuse the key with another amount. Compare the unsafe check-then-act implementation."
      history={s.history}
      reset={() => {
        setS(initialRace());
        setSafe(true);
      }}
    >
      <label className="pay-check">
        <input
          type="checkbox"
          checked={safe}
          onChange={(e) => {
            setSafe(e.target.checked);
            setS(initialRace());
          }}
        />
        Atomic durable uniqueness (changing mode starts a fresh experiment)
      </label>
      <Metrics
        items={[
          ["DB claim rows", s.claims.length],
          ["Provider calls", s.calls],
          ["Financial effects", s.effects],
        ]}
      />
      <div className="pay-actions">
        <button
          type="button"
          onClick={() =>
            setS((v) => claimRequest(v, scope, "INR:100000:pi_1000", safe))
          }
        >
          Pay / retry same request
        </button>
        <button
          type="button"
          onClick={() =>
            setS((v) =>
              claimRequest(
                claimRequest(v, scope, "INR:100000:pi_1000", safe),
                scope,
                "INR:100000:pi_1000",
                safe,
              ),
            )
          }
        >
          Race replicas A + B
        </button>
        <button type="button" onClick={() => setS(completeClaims)}>
          Persist completed result
        </button>
        <button
          type="button"
          onClick={() =>
            setS((v) => claimRequest(v, scope, "INR:200000:pi_1000", safe))
          }
        >
          Same key, ₹2,000 payload
        </button>
      </div>
      <Invariant pass={s.effects <= 1}>
        One logical checkout → at most one financial effect. Current effects:{" "}
        {s.effects}. Atomic claim ordering represents the database serialization
        of simultaneous inserts, not network timing.
      </Invariant>
      <p>
        The provider key is stable in safe mode. A duplicate with an in-progress
        claim does not send another call. New keys for the same business
        operation still require intent-level constraints.
      </p>
    </PaymentLab>
  );
}

export function LostResponseLab() {
  const [p, setP] = useState(() =>
      transition(transition(initialPayment(), "confirm"), "timeout"),
    ),
    [extra, setExtra] = useState(0);
  const note = (text: string) =>
    setP((v) => ({ ...v, history: [...v.history, text] }));
  return (
    <PaymentLab
      title="Lost response recovery"
      objective="Resolve attempt_a without charging twice. Restart, query, wait for callbacks, or try unsafe retry/failover policies and inspect their consequences."
      history={p.history}
      reset={() => {
        setP(transition(transition(initialPayment(), "confirm"), "timeout"));
        setExtra(0);
      }}
    >
      <Metrics
        items={[
          ["Local attempt", p.attempt],
          ["Actual provider outcome", p.provider],
          ["Financial effects", 1 + extra],
        ]}
      />
      <div className="pay-actions">
        <button
          type="button"
          onClick={() => setP((v) => transition(v, "query"))}
        >
          Query original reference
        </button>
        <button
          type="button"
          onClick={() =>
            note(
              "Still processing for customer; durable next-poll job remains scheduled with bounded backoff. Waiting is not resolution.",
            )
          }
        >
          Wait with recovery job
        </button>
        <button
          type="button"
          onClick={() =>
            note(
              "Same-provider replay uses original attempt_a within supported idempotency retention. Existing effect reused; fetch current outcome.",
            )
          }
        >
          Retry with original PSP key
        </button>
        <button
          type="button"
          onClick={() => {
            setExtra((v) => v + 1);
            note(
              "UNSAFE: PSP B has a different idempotency scope and charges again. Original A capture still exists.",
            );
          }}
        >
          Blind failover to PSP B
        </button>
        <button
          type="button"
          onClick={() =>
            note(
              "Rejected: timeout is not authoritative failure. Reconciliation must obtain provider/statement evidence; no status is invented.",
            )
          }
        >
          Declare failed / invent correction
        </button>
        <button
          type="button"
          onClick={() => setP((v) => transition(v, "webhook"))}
        >
          Verified capture webhook
        </button>
        <button
          type="button"
          onClick={() => setP((v) => transition(v, "stale"))}
        >
          Delayed failure callback
        </button>
        <button
          type="button"
          onClick={() => setP((v) => transition(v, "restart"))}
        >
          Restart process
        </button>
      </div>
      <Invariant pass={extra === 0}>
        No blind duplicate financial effects. Same-provider replay is
        conditional on documented idempotency support and retention; otherwise
        query or escalate.
      </Invariant>
    </PaymentLab>
  );
}

export function LedgerBuilder() {
  const [s, setS] = useState(initialLedger),
    [debit, setDebit] = useState(100000),
    [credit, setCredit] = useState(100000);
  const captured = s.journals.some((j) => j.id === "capture:attempt_a");
  return (
    <PaymentLab
      title="Double-entry ledger builder"
      objective="Build a capture journal in paise, reject imbalance, replay a capture, record evidence-backed settlement fees and append a reversal. Inspect account types and immutable lines."
      history={s.history}
      reset={() => {
        setS(initialLedger());
        setDebit(100000);
        setCredit(100000);
      }}
    >
      <div className="pay-control-grid">
        <Range
          label="Dr PSP receivable · asset (paise)"
          value={debit}
          min={1000}
          max={120000}
          step={1000}
          onChange={setDebit}
        />
        <Range
          label="Cr merchant payable · liability (paise)"
          value={credit}
          min={1000}
          max={120000}
          step={1000}
          onChange={setCredit}
        />
      </div>
      <div className="pay-actions">
        <button
          type="button"
          onClick={() =>
            setS((v) =>
              postJournal(v, {
                id: "capture:attempt_a",
                lines: [
                  {
                    account: "psp_receivable",
                    currency: "INR",
                    debit,
                    credit: 0,
                  },
                  {
                    account: "merchant_payable",
                    currency: "INR",
                    debit: 0,
                    credit,
                  },
                ],
              }),
            )
          }
        >
          Validate + post capture
        </button>
        <button
          type="button"
          onClick={() => setS((v) => postJournal(v, captureJournal()))}
        >
          Replay ₹1,000 capture event
        </button>
        <button
          type="button"
          onClick={() =>
            setS((v) => {
              const journal = v.journals.find(
                (j) => j.id === "capture:attempt_a",
              );
              return journal
                ? postJournal(v, reversal(journal))
                : {
                    ...v,
                    history: [
                      ...v.history,
                      "Capture must exist before a reversal can reference it.",
                    ],
                  };
            })
          }
        >
          Append capture reversal
        </button>
        <button
          type="button"
          onClick={() =>
            setS((v) => {
              const capture = v.journals.find(
                (j) => j.id === "capture:attempt_a",
              );
              if (
                !capture ||
                capture.lines[0].debit !== 100000 ||
                v.journals.some((j) => j.reverses === capture.id)
              )
                return {
                  ...v,
                  history: [
                    ...v.history,
                    "Settlement example requires an unreversed ₹1,000 capture. Reset and post it first.",
                  ],
                };
              return postJournal(v, {
                id: "settlement:batch_a",
                lines: [
                  { account: "cash", currency: "INR", debit: 98000, credit: 0 },
                  {
                    account: "fee_expense",
                    currency: "INR",
                    debit: 2000,
                    credit: 0,
                  },
                  {
                    account: "psp_receivable",
                    currency: "INR",
                    debit: 0,
                    credit: 100000,
                  },
                ],
              });
            })
          }
        >
          Statement: ₹980 net + ₹20 fee
        </button>
      </div>
      <Metrics
        items={(
          [
            "psp_receivable",
            "merchant_payable",
            "cash",
            "fee_expense",
          ] as Account[]
        ).map((a) => [a, rupees(accountBalance(s, a))])}
      />
      <div
        className="pay-table-wrap"
        role="region"
        aria-label="Scrollable ledger journal"
        tabIndex={0}
      >
        <table>
          <caption>
            Immutable posted journal timeline · INR · platform-borne fee example
          </caption>
          <thead>
            <tr>
              <th>Journal / account</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            {s.journals.flatMap((j) =>
              j.lines.map((l, i) => (
                <tr key={`${j.id}:${i}`}>
                  <td>
                    {j.id}
                    <br />
                    {l.account}
                  </td>
                  <td>{rupees(l.debit)}</td>
                  <td>{rupees(l.credit)}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
      <Invariant pass={true}>
        {s.journals.length} posted journals, each balanced per currency.{" "}
        {captured
          ? "Capture evidence is assumed for this accounting exercise."
          : "No posted capture yet."}{" "}
        Reversing an internal entry does not reverse the PSP charge; corrections
        require approval and evidence.
      </Invariant>
    </PaymentLab>
  );
}
