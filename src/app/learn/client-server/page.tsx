import type { Metadata } from "next";
import Link from "next/link";
import { LessonHero } from "@/components/lesson/lesson-hero";
import { RequestLab } from "@/components/labs/request-lab";
import { TrafficLab } from "@/components/labs/traffic-lab";
import { RouteGame } from "@/components/labs/route-game";
import { RequestAnatomy } from "@/components/lesson/request-anatomy";
import { RequestLifecycle } from "@/components/lesson/lifecycle";
import { clientServerLesson } from "@/content/client-server";
import { ArrowRight, DatabaseIcon, MonitorIcon, ServerIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ConceptChain } from "@/components/lesson/concept-chain";
import { LessonPager } from "@/components/lesson/lesson-pager";

export const metadata: Metadata = {
  title: "Client–Server Architecture",
  description: "Learn client–server architecture by sending, scaling, and breaking simulated requests.",
};

const toc = [
  ["01", "The problem", "#the-problem"], ["02", "The exchange", "#request-lab"], ["03", "Anatomy", "#anatomy"],
  ["04", "Lifecycle", "#lifecycle"], ["05", "Break it", "#break-it"], ["06", "Mental model", "#mental-model"], ["07", "Challenge", "#challenge"],
] as const;

export default function ClientServerPage() {
  return (
    <article className="lesson-page">
      <div className="page-shell"><LessonHero /></div>
      <div className="page-shell concept-chain-wrap"><ConceptChain current="01" /></div>
      <nav className="chapter-nav" aria-label="Chapter sections"><div className="page-shell"><span>CHAPTER 01</span><div>{toc.map(([number, label, href]) => <a href={href} key={number}><small>{number}</small>{label}</a>)}</div></div></nav>

      <section className="lesson-section page-shell" id="the-problem">
        <Reveal><SectionHeading eyebrow="01 · THE PROBLEM" title="One computer needs something from another." copy="A client–server system separates the participant asking for work from the participant equipped to do it. The role—not the device—defines which is which." /></Reveal>
        <div className="definition-grid">
          {clientServerLesson.definitions.map((item, index) => (
            <Reveal key={item.term} delay={index * 0.08} className="definition-card">
              <div className="definition-icon">{index === 0 ? <MonitorIcon /> : <ServerIcon />}</div><small>ROLE 0{index + 1}</small><h3>{item.term}</h3><p>{item.definition}</p><code>{item.examples}</code>
            </Reveal>
          ))}
        </div>
        <Reveal><div className="role-rule"><span>REMEMBER</span><p>Your phone can be a client. A backend service can be both: server to one caller, client to another dependency.</p></div></Reveal>
      </section>

      <section className="lesson-section lesson-section--wide" id="request-lab">
        <div className="page-shell"><Reveal><SectionHeading eyebrow="02 · THE EXCHANGE" title="Send a request. Watch every state change." copy="This is a deterministic teaching model—not a real network call. It isolates the core request → work → response loop." /></Reveal><Reveal delay={0.08}><RequestLab /></Reveal></div>
      </section>

      <section className="lesson-section page-shell" id="anatomy">
        <Reveal><SectionHeading eyebrow="03 · REQUEST ANATOMY" title="A request is structured intent." copy="HTTP adds a shared vocabulary. You only need four pieces here; the full protocol earns its own lesson later." /></Reveal>
        <Reveal delay={0.08}><RequestAnatomy /></Reveal>
      </section>

      <section className="lesson-section lesson-section--tint" id="lifecycle">
        <div className="page-shell"><Reveal><SectionHeading eyebrow="04 · WHAT ACTUALLY HAPPENS?" title="Seven moments. One round trip." copy="Focus each stage to follow responsibility across the boundary." /></Reveal><Reveal delay={0.08}><RequestLifecycle /></Reveal></div>
      </section>

      <section className="lesson-section page-shell" id="break-it">
        <Reveal><SectionHeading eyebrow="05 · PRESSURE & FAILURE" title="One server feels simple—until it becomes the limit." copy="Raise demand, slow the machine, or take it offline. The model is intentionally approximate: observe the direction of change, not benchmark-grade numbers." /></Reveal>
        <Reveal delay={0.08}><TrafficLab /></Reveal>
        <div className="future-seeds">
          <span>THIS FAILURE CREATES THE NEED FOR</span><div><b>Redundancy</b><i /> <b>Load balancing</b><i /> <b>Failover</b></div><small>Future lessons · not taught here yet</small>
        </div>
      </section>

      <section className="lesson-section lesson-section--analogy" id="mental-model">
        <div className="page-shell analogy-layout">
          <Reveal><SectionHeading eyebrow="06 · MENTAL MODEL" title="A restaurant, with one important caveat." copy="The analogy helps with roles. The real system still communicates over unreliable networks, can retry messages, and must manage state." /></Reveal>
          <Reveal delay={0.08} className="restaurant-flow">
            {[ ["Customer", "Client", "C"], ["Order", "Request", "→"], ["Kitchen", "Server", "K"], ["Meal", "Response", "←"] ].map(([top, bottom, mark]) => <div key={top}><span>{mark}</span><b>{top}</b><small>{bottom}</small></div>)}
          </Reveal>
          <div className="analogy-note"><b>Analogy ≠ architecture</b><p>Use it to remember who initiates and who works. Then return to real terms.</p></div>
        </div>
      </section>

      <section className="lesson-section page-shell" id="challenge">
        <Reveal><SectionHeading eyebrow="07 · APPLY IT" title="Route the request." copy="Five short scenarios test dynamic pages, APIs, service-to-service calls, CDN content, and the database boundary." /></Reveal>
        <Reveal delay={0.08}><RouteGame /></Reveal>
      </section>

      <section className="lesson-section page-shell">
        <Reveal><SectionHeading eyebrow="CLIENT–SERVER VARIANTS" title="The roles repeat at every scale." copy="The interface changes. The request–response relationship stays recognizable." /></Reveal>
        <div className="variant-table">
          <div className="variant-header"><span>CLIENT</span><span>SERVER</span><span>EXCHANGE</span></div>
          {clientServerLesson.variants.map(([client, server, exchange]) => <div key={client}><b>{client}</b><span>→</span><b>{server}</b><p>{exchange}</p></div>)}
        </div>
        <div className="state-callout"><div><span>STATEFUL</span><p>The server remembers client-specific context between requests. Convenient, but harder to move or multiply.</p></div><i>VS</i><div><span>STATELESS</span><p>Each request carries what the server needs. Instances are easier to replace and scale horizontally.</p></div></div>
      </section>

      <section className="takeaway-section">
        <div className="page-shell"><Reveal><SectionHeading eyebrow="KEY TAKEAWAYS" title="The four-part mental model." /></Reveal>
          <div className="takeaway-grid">{clientServerLesson.takeaways.map(([term, note], index) => <div key={term}><span>0{index + 1}</span><h3>{term}</h3><p>{note}</p></div>)}</div>
          <div className="source-note"><span>SOURCE MAPPING</span><p>This interactive lesson is derived from <a href="https://github.com/ChetanAmritanshu/High-Level-Design/blob/main/01_Client_Server_Architecture.docx" target="_blank" rel="noreferrer"><code>{clientServerLesson.source}</code></a> in the original notes repository. The source note remains unchanged and authoritative for the chapter’s scope.</p></div>
          <LessonPager next={{ number:"02", title:"DNS Fundamentals", href:"/learn/dns", copy:"Before a client can ask a server, how does it find the right address?" }} />
          <Link className="back-to-map" href="/#learning-map"><DatabaseIcon /> Return to the learning map <ArrowRight /></Link>
        </div>
      </section>
    </article>
  );
}
