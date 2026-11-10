"use client";

import { useState } from "react";
import { assessment, grade } from "@/lib/payments/engine";
import {
  followups,
  incidentRounds,
  interviewSteps,
} from "@/content/payment-system";
import { Invariant, Metrics, PaymentLab } from "./lab-ui";

export function PaymentIncidentGame() {
  const [round, setRound] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [history, setHistory] = useState([
      "Five incident rounds. Inspect evidence before choosing. Replay is available at any time.",
    ]),
    [solved, setSolved] = useState<number[]>([]);
  const r = incidentRounds[round],
    correct = answer === r.correct;
  return (
    <PaymentLab
      title="Five-round incident game"
      objective="Defend a response under increasing uncertainty. Wrong decisions expose consequences and recovery; solve each round before advancing."
      history={history}
      reset={() => {
        setRound(0);
        setAnswer(null);
        setSolved([]);
        setHistory(["Incident game restarted."]);
      }}
    >
      <p className="pay-kicker">
        ROUND {round + 1} / 5 · {r.title}
      </p>
      <h4 className="pay-scenario">{r.evidence}</h4>
      <div className="pay-options">
        {r.options.map((option, i) => (
          <button
            type="button"
            key={option}
            aria-pressed={answer === i}
            onClick={() => {
              setAnswer(i);
              if (i === r.correct)
                setSolved((v) => (v.includes(round) ? v : [...v, round]));
              setHistory((h) => [
                ...h,
                `${r.title}: ${i === r.correct ? "Safe decision" : "Unsafe decision"}. ${r.why} Recovery: ${r.recovery}`,
              ]);
            }}
          >
            {option}
          </button>
        ))}
      </div>
      {answer !== null ? (
        <div className="pay-evidence" aria-live="polite">
          <Invariant pass={correct}>
            {correct ? "Safe response explained" : "Revise this choice"}
          </Invariant>
          <p>{r.why}</p>
          <b>Recovery path</b>
          <p>{r.recovery}</p>
        </div>
      ) : null}
      <div className="pay-actions">
        <button
          type="button"
          onClick={() => {
            setAnswer(null);
            setHistory((h) => [
              ...h,
              `Round ${round + 1} replayed; choose again.`,
            ]);
          }}
        >
          Retry this round
        </button>
        <button
          type="button"
          disabled={!correct || round === 4}
          onClick={() => {
            setRound((v) => v + 1);
            setAnswer(null);
            setHistory((h) => [...h, "Next incident opened."]);
          }}
        >
          Next incident →
        </button>
      </div>
      {solved.length === 5 ? (
        <Invariant pass={true}>
          All five incident responses explained. Now defend an independent
          design in the final interview.
        </Invariant>
      ) : null}
    </PaymentLab>
  );
}

export function FinalPaymentInterview() {
  const [answers, setAnswers] = useState<number[]>(() =>
      assessment.map(() => -1),
    ),
    [submitted, setSubmitted] = useState(false),
    [history, setHistory] = useState([
      "No answers selected. Choose policies before seeing evaluation.",
    ]);
  const score = grade(answers),
    allAnswered = answers.every((a) => a >= 0);
  return (
    <PaymentLab
      title="Unguided final interview"
      objective="Design a payment platform processing 10 million transactions daily. Survive duplicates, provider failures, uncertain outcomes and settlement mismatches without silently losing or duplicating financial effects. Commit your choices before feedback."
      history={history}
      reset={() => {
        setAnswers(assessment.map(() => -1));
        setSubmitted(false);
        setHistory([
          "Interview reset. Feedback hidden; independent choices required.",
        ]);
      }}
    >
      <p>
        Use the architecture builder to sketch your design, then commit these
        structured decisions. Optional verbal explanations are self-assessed
        against the cheat sheet; this model does not grade free-form prose.
      </p>
      <div className="pay-assessment">
        {assessment.map((q, index) => (
          <fieldset key={q.prompt}>
            <legend>
              {index + 1}. {q.prompt} <small>· {q.points} points</small>
            </legend>
            {q.options.map((option, i) => (
              <label key={option}>
                <input
                  type="radio"
                  name={`payment-assessment-${index}`}
                  checked={answers[index] === i}
                  disabled={submitted}
                  onChange={() => {
                    setAnswers((v) => v.map((a, n) => (n === index ? i : a)));
                    setHistory((h) => [
                      ...h,
                      `Decision ${index + 1} selected; evaluation remains hidden.`,
                    ]);
                  }}
                />
                {option}
              </label>
            ))}
            {submitted ? (
              <p
                className={
                  answers[index] === q.correct ? "pay-good" : "pay-bad"
                }
              >
                {answers[index] === q.correct ? "Strength" : "Revision needed"}:{" "}
                {q.why}
                <br />
                <b>Follow-up:</b> {q.followup}
              </p>
            ) : null}
          </fieldset>
        ))}
      </div>
      <div className="pay-actions">
        <button
          type="button"
          disabled={!allAnswered || submitted}
          onClick={() => {
            setSubmitted(true);
            setHistory((h) => [
              ...h,
              `Interview evaluated: ${score.total}/100, ${score.failures.length} critical failures. Scoring is exact-match structured policy evaluation.`,
            ]);
          }}
        >
          Submit design for evaluation
        </button>
      </div>
      {!allAnswered ? (
        <p>
          {answers.filter((a) => a >= 0).length} / {assessment.length} decisions
          selected. Complete all decisions to submit.
        </p>
      ) : null}
      {submitted ? (
        <div className="pay-score" aria-live="polite">
          <h3>{score.total} / 100</h3>
          <Invariant pass={score.passed}>
            {score.passed
              ? "Structured assessment passed (≥80 and all safety gates). Practice the explanation aloud before claiming interview readiness."
              : "Revise the design. A high total cannot override a failed financial safety gate."}
          </Invariant>
          <Metrics
            items={score.categories.map((c) => [
              c.name,
              `${c.score} / ${c.max}`,
            ])}
          />
          <h4>Critical safety gates</h4>
          {score.failures.length ? (
            <ul>
              {score.failures.map((f) => (
                <li key={f} className="pay-bad">
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="pay-good">
              All six critical correctness gates passed.
            </p>
          )}
          <h4>Targeted revision</h4>
          <ul>
            {score.categories
              .filter((c) => c.score < c.max)
              .map((c) => (
                <li key={c.name}>
                  Revisit {c.name.toLowerCase()}; use the explanation and
                  follow-up under each missed decision, then replay the matching
                  lab.
                </li>
              ))}
          </ul>
          <p>
            Scoring: each decision awards its displayed points only for its
            declared safe policy. Category totals are 15 + 15 + 20 + 20 + 15 +
            15 = 100. All six financial safety gates are required, independently
            of score.
          </p>
        </div>
      ) : null}
    </PaymentLab>
  );
}

export function InterviewGuide() {
  return (
    <div className="pay-guide">
      <div className="pay-cards">
        {interviewSteps.map(([title, copy]) => (
          <details key={title}>
            <summary>{title}</summary>
            <p>{copy}</p>
          </details>
        ))}
      </div>
      <details className="pay-cheatsheet">
        <summary>
          Interview cheat sheet · framing, invariants, mistakes & 20 follow-ups
        </summary>
        <h3>Your 60-second framing</h3>
        <p>
          “I’m designing a multi-PSP payment orchestrator. The merchant owns the
          order; we own durable intent/attempt identities and internal financial
          records; providers and banks supply external outcome evidence. I’ll
          start with one authenticated API and a database, then show how unique
          claims, unknown-outcome recovery, immutable journals and
          reconciliation survive duplicate requests and crashes. I’ll state the
          rail capabilities, peak workload, consistency boundary and regional
          recovery trade-offs.”
        </p>
        <h4>Requirements checklist</h4>
        <p>
          Rails and provider capabilities; tenant ownership;
          create/confirm/query/capture/void/refund; expected volume and peak;
          minor-unit currency rules; settlement and payout scope; availability,
          latency, audit, recovery horizon and RPO/RTO.
        </p>
        <h4>Essential architecture</h4>
        <p>
          Checkout → API → durable claim/intent/attempt → adapter → PSP.
          Verified webhooks → inbox/state; transactionally committed outbox →
          queue → idempotent workers → ledger. Reconciliation compares
          payment/ledger, PSP and bank evidence; redacted monitoring exposes
          unresolved work. Fence regional ownership.
        </p>
        <h4>Key invariants & failure drill</h4>
        <p>
          One logical operation identity; no timeout-as-failure; valid versioned
          transitions; completed + pending refund ≤ captured; unique immutable
          journals balanced per currency; external evidence before
          reconciliation correction. Rehearse double-click, lost response,
          duplicate/reordered callbacks, commit-before-ACK, provider outage and
          regional split brain.
        </p>
        <h4>Trade-off talking points</h4>
        <p>
          Sync V1 vs queue isolation; shared ACID ledger vs separate service
          recovery; provider latency vs worker concurrency; strong regional
          ownership vs write availability; retention cost vs retry safety;
          tokenization scope vs operational exposure.
        </p>
        <h4>Common incorrect answers</h4>
        <ul>
          <li>
            “Disable Pay after clicking.” Other replicas, retries and callbacks
            still race; enforce durable identity.
          </li>
          <li>
            “Timeout means failed; try another PSP.” The first provider may
            already have charged.
          </li>
          <li>
            “Kafka gives exactly-once money.” Delivery semantics do not make an
            external PSP call and local DB commit atomic.
          </li>
          <li>
            “Redis lock is enough.” Lease expiry cannot establish whether an
            external effect happened.
          </li>
          <li>
            “Debits always subtract.” Direction depends on account type; assets
            and liabilities have different normal balances.
          </li>
          <li>
            “Our ledger balances, so the bank agrees.” Missing/duplicate but
            balanced journals and settlement drift still require reconciliation.
          </li>
          <li>
            “Refunds don’t need reservations.” Concurrent and unknown refunds
            can overspend the captured budget.
          </li>
          <li>
            “Both regions can write because replication exists.” Replication
            alone does not enforce global identity or prevent split brain.
          </li>
        </ul>
        <h4>Interviewer follow-ups</h4>
        <ol>
          {followups.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
