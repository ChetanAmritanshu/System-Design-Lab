import Link from "next/link";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";
import { clientServerLesson } from "@/content/client-server";

export function LessonHero() {
  return (
    <section className="lesson-hero">
      <div className="lesson-breadcrumb"><Link href="/">Learning map</Link><span>/</span><b>Networking</b><span>/</span><span>Chapter 01</span></div>
      <div className="lesson-hero-grid">
        <div>
          <p className="eyebrow"><span />FOUNDATION · {clientServerLesson.readingTime}</p>
          <h1><span>Client</span> meets <span>Server.</span></h1>
          <p className="lesson-deck">{clientServerLesson.subtitle}</p>
          <div className="lesson-principle"><b>THE QUESTION</b><p>How does one computer ask another computer to do something?</p></div>
          <a className="text-link" href="#the-problem">Begin the experiment <ArrowDown /></a>
        </div>
        <div className="lesson-hero-diagram" aria-label="A client sends a request to a server and receives a response">
          <div className="diagram-coordinates"><span>01 / ORIGIN</span><span>02 / DESTINATION</span></div>
          <div className="hero-entity hero-entity--client"><small>YOU</small><b>CLIENT</b><code>needs index.html</code></div>
          <div className="hero-exchange"><span className="exchange-request">“Give me index.html” <ArrowRight /></span><i /><span className="exchange-response"><ArrowRight /> HTML document</span></div>
          <div className="hero-entity hero-entity--server"><small>REMOTE MACHINE</small><b>SERVER</b><code>listening :443</code></div>
          <div className="diagram-caption"><span>REQUEST</span><i /><span>WORK</span><i /><span>RESPONSE</span></div>
        </div>
      </div>
    </section>
  );
}
