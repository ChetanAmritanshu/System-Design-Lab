import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyProgress } from "@/components/lesson/case-study-progress";
import { LessonPager } from "@/components/lesson/lesson-pager";
import { SectionHeading } from "@/components/ui/section-heading";
import { paymentModules, apiExamples } from "@/content/payment-system";
import {
  IdempotencyRaceLab,
  LedgerBuilder,
  LostResponseLab,
  MoneyJourney,
  PaymentEstimator,
  PaymentStateLab,
} from "@/components/payments/core-labs";
import {
  ArchitectureBuilder,
  ControlRoom,
  PipelineLab,
  ReconciliationLab,
  RefundLab,
  ScalePaymentLab,
  SecurityLab,
} from "@/components/payments/operations-labs";
import {
  FinalPaymentInterview,
  InterviewGuide,
  PaymentIncidentGame,
} from "@/components/payments/interview";
import "./payment-system.css";

export const metadata: Metadata = {
  title: "Design a Payment System",
  description:
    "Build, break and defend a multi-PSP payment architecture: idempotency, uncertain outcomes, state machines, immutable ledgers, refunds, reconciliation and regional recovery.",
};
const labs: Record<string, React.ReactNode> = {
  money: <MoneyJourney />,
  requirements: <PaymentEstimator />,
  api: (
    <div className="pay-api">
      <div className="pay-pipeline">
        <span>CHECKOUT</span>
        <span>→ PAYMENT API</span>
        <span>→ DATABASE</span>
        <span>→ PSP</span>
      </div>
      <p>
        Illustrative HTTP contract, not a universal PSP standard. Demo token
        below is invented. INR ₹1,000 = 100,000 paise; use currency metadata for
        zero/three-decimal currencies rather than assuming every currency has
        two decimals.
      </p>
      <pre>
        <code>{apiExamples}</code>
      </pre>
    </div>
  ),
  states: <PaymentStateLab />,
  idempotency: <IdempotencyRaceLab />,
  unknown: <LostResponseLab />,
  ledger: <LedgerBuilder />,
  reconciliation: <ReconciliationLab />,
  pipeline: <PipelineLab />,
  scale: <ScalePaymentLab />,
  security: <SecurityLab />,
  advanced: <RefundLab />,
  operations: <ControlRoom />,
  architecture: <ArchitectureBuilder />,
};

export default function PaymentSystemPage() {
  return (
    <article className="lesson-page case-study-page payment-page">
      <section className="case-hero page-shell">
        <div className="lesson-breadcrumb">
          <Link href="/#case-studies">Case studies</Link>
          <span>/</span>
          <b>Case 04</b>
        </div>
        <CaseStudyProgress current="04" />
        <div className="case-hero-grid">
          <div>
            <p className="eyebrow">
              <span />
              MONEY · IDENTITY · UNCERTAINTY
            </p>
            <h1>
              One click.
              <br />
              <em>One financial effect.</em>
            </h1>
            <p className="lesson-deck">
              A customer pays ₹1,000. The provider accepts it. The response
              disappears. Build the system that finds the truth without charging
              again.
            </p>
            <a className="primary-cta" href="#money">
              Follow the ₹1,000 →
            </a>
          </div>
          <div className="pay-hero-card">
            <span className="pay-kicker">ORDER-42 · INR</span>
            <strong>
              ₹1,000<span>.00</span>
            </strong>
            <div>
              <span>PSP</span>
              <b>CAPTURED</b>
            </div>
            <div>
              <span>OUR API</span>
              <b className="pay-unknown">UNKNOWN</b>
            </div>
            <p>
              The charge happened.
              <br />
              The answer did not arrive.
            </p>
            <a href="#unknown">How would you recover? ↗</a>
          </div>
        </div>
        <div className="pay-contract">
          <span>14 MODULES</span>
          <span>13 INTERACTIVE LABS</span>
          <span>5 INCIDENT ROUNDS</span>
          <span>100-POINT FINAL INTERVIEW</span>
        </div>
      </section>
      <nav className="pay-chapter-nav" aria-label="Payment case study sections">
        <div className="page-shell">
          <a href="#money">01 · Understand</a>
          <a href="#states">04 · Correctness</a>
          <a href="#ledger">07 · Money</a>
          <a href="#scale">10 · Production</a>
          <a href="#architecture">14 · Build</a>
          <a href="#interview">Interview</a>
        </div>
      </nav>
      <section className="page-shell pay-intro">
        <p className="pay-kicker">YOUR LEARNING CONTRACT</p>
        <h2>Build simple. Break it. Earn every box.</h2>
        <p>
          Start with Checkout → Payment API → PSP. Every module introduces one
          concrete pressure, a mechanism you can experiment with, and an
          invariant you can defend. Explore at your own pace; the final guide
          rehearses a 45–60-minute interview.
        </p>
        <div className="pay-cards">
          <div>
            <small>A · MERCHANT CHECKOUT</small>
            <h3>Integrate one PSP.</h3>
            <p>
              Own orders and customer experience. Hosted payment collection can
              reduce raw card exposure.
            </p>
          </div>
          <div className="pay-focus">
            <small>B · OUR PRIMARY SCOPE</small>
            <h3>Orchestrate providers.</h3>
            <p>
              Own attempts, routing, recovery, verified evidence and an
              illustrative internal ledger. External banks and rails stay
              outside.
            </p>
          </div>
          <div>
            <small>C · PROCESSOR / PLATFORM</small>
            <h3>Own deeper obligations.</h3>
            <p>
              Clearing, settlement, financial balances and payouts depend on
              contracts and regulation. This lesson does not implement a bank.
            </p>
          </div>
        </div>
        <details>
          <summary>Open the full 14-module map</summary>
          <ol className="pay-module-map">
            {paymentModules.map((m, i) => (
              <li key={m.id}>
                <a href={`#${m.id}`}>
                  {String(i + 1).padStart(2, "0")} · {m.title}
                </a>
              </li>
            ))}
          </ol>
        </details>
      </section>
      {paymentModules.map((m, i) => (
        <section
          className="lesson-section page-shell pay-module"
          id={m.id}
          key={m.id}
        >
          <SectionHeading
            eyebrow={`${String(i + 1).padStart(2, "0")} · ${m.title.toUpperCase()}`}
            title={m.question}
            copy={m.explanation}
          />
          <div className="pay-pressure">
            <div>
              <small>APPLY PRESSURE</small>
              <p>{m.pressure}</p>
            </div>
            <div>
              <small>INTRODUCE A SOLUTION</small>
              <p>{m.solution}</p>
            </div>
          </div>
          {labs[m.id]}
          <div className="pay-module-footer">
            <p className="pay-rule">
              <span>INVARIANT</span>
              {m.invariant}
            </p>
            <details>
              <summary>Deep dive · {m.deepTitle}</summary>
              <p>{m.deep}</p>
            </details>
            <details>
              <summary>Checkpoint · defend your design</summary>
              <p>{m.interview}</p>
              <p>
                Answer aloud before opening the next module. A good answer names
                the authoritative owner, atomic boundary, failure and recovery
                evidence.
              </p>
            </details>
          </div>
        </section>
      ))}
      <section className="lesson-section page-shell pay-module" id="interview">
        <SectionHeading
          eyebrow="INTERVIEW MASTERCLASS"
          title="Design it without the training wheels."
          copy="First rehearse a structured walkthrough. Then handle five incidents and commit an independent set of architecture policies before seeing your rubric."
        />
        <InterviewGuide />
        <PaymentIncidentGame />
        <FinalPaymentInterview />
      </section>
      <section className="takeaway-section">
        <div className="page-shell">
          <div className="source-note">
            <span>SOURCE MAPPING & PRIMARY REFERENCES</span>
            <p>
              Source note inspected:{" "}
              <a href="https://github.com/ChetanAmritanshu/High-Level-Design/blob/main/06_Payment_System_Explained.docx">
                06_Payment_System_Explained.docx
              </a>
              . This case expands its durable identities, UNKNOWN outcomes,
              inbox/outbox and reconciliation themes with an explicit platform
              chart of accounts.
            </p>
            <ul>
              <li>
                <a href="https://docs.stripe.com/api/idempotent_requests">
                  Stripe: provider-specific idempotency and retention
                </a>
              </li>
              <li>
                <a href="https://docs.stripe.com/webhooks">
                  Stripe: webhook signatures, duplicates and ordering
                </a>
              </li>
              <li>
                <a href="https://docs.stripe.com/payments/paymentintents/lifecycle">
                  Stripe: payment lifecycle and method-specific processing
                </a>
              </li>
              <li>
                <a href="https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html">
                  AWS: transactional outbox and idempotent consumers
                </a>
              </li>
              <li>
                <a href="https://www.pcisecuritystandards.org/faqs/1326/">
                  PCI SSC: tokenization and connected-system scope
                </a>
              </li>
              <li>
                <a href="https://www.npci.org.in/what-we-do/upi/product-overview">
                  NPCI: UPI overview
                </a>
              </li>
              <li>
                <a href="https://docs.stripe.com/bank-reconciliation">
                  Stripe: comparing payouts with bank evidence
                  (provider/region-specific)
                </a>
              </li>
            </ul>
            <p>
              Conceptual educational models, synthetic capacity assumptions and
              illustrative endpoints. Real rail capabilities, accounting policy,
              compliance scope and settlement contracts require separate
              implementation and assessment.
            </p>
          </div>
          <LessonPager
            previous={{
              number: "CS 03",
              title: "Real-Time Chat",
              href: "/case-studies/realtime-chat",
            }}
            next={{
              number: "CS 05",
              title: "YouTube",
              copy: "Derive upload, processing, storage and playback—coming soon.",
            }}
          />
          <Link className="back-to-map" href="/#case-studies">
            ← Return to case studies
          </Link>
        </div>
      </section>
    </article>
  );
}
