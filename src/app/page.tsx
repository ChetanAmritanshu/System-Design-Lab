import Link from "next/link";
import { ArrowDown, ArrowRight, SparkIcon } from "@/components/ui/icons";
import { HeroArchitecture } from "@/components/diagrams/hero-architecture";
import { LearningMap } from "@/components/learning-map";
import { ScaleStory } from "@/components/scale-story";
import { CaseStudyGrid } from "@/components/case-study-grid";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export default function Home() {
  return (
    <>
      <section className="home-hero page-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span />INTERACTIVE SYSTEM DESIGN</p>
          <h1>System Design<br /><em>From First Principles.</em></h1>
          <p className="hero-deck">Don’t memorize architectures. Learn <strong>why they exist</strong>—then build, stress, and break them yourself.</p>
          <div className="hero-actions">
            <Link className="primary-cta" href="/learn/client-server">Start with Client → Server <ArrowRight /></Link>
            <a className="secondary-cta" href="#learning-map">Explore the map <ArrowDown /></a>
          </div>
          <div className="hero-proof"><span><b>30</b> core concepts</span><i /><span><b>07</b> complete systems</span><i /><span><b>08</b> live labs</span></div>
        </div>
        <HeroArchitecture />
        <div className="hero-scroll" aria-hidden="true"><span>SCROLL TO EXPLORE</span><i /></div>
      </section>

      <section className="manifesto-strip">
        <div className="page-shell"><span>SEE IT</span><ArrowRight /><span>PLAY WITH IT</span><ArrowRight /><span>BREAK IT</span><ArrowRight /><strong>UNDERSTAND IT</strong></div>
      </section>

      <section className="map-section page-shell" id="learning-map">
        <Reveal><SectionHeading eyebrow="THE LEARNING MAP" title="One system. Thirty pressure points." copy="Follow the dependency trail from a single request to the coordination problems of distributed systems. The first eight interactive lessons are open; the full map shows where every idea eventually connects." /></Reveal>
        <LearningMap />
      </section>

      <section className="pressure-section">
        <div className="page-shell">
          <Reveal><SectionHeading eyebrow="FIRST-PRINCIPLES METHOD" title="Don’t add boxes. Discover the pressure." copy="Every architecture starts small. Each new component must earn its place by solving an observable problem." /></Reveal>
          <Reveal delay={0.08}><div className="million-question"><SparkIcon /><span>START WITH</span><b>Client → Server</b><i /><strong>What breaks when 1,000,000 users arrive?</strong></div></Reveal>
          <Reveal delay={0.12}><ScaleStory /></Reveal>
        </div>
      </section>

      <section className="case-section page-shell" id="case-studies">
        <Reveal><div className="case-heading"><SectionHeading eyebrow="COMPLETE SYSTEMS" title="Put the primitives under pressure." copy="The case studies are where fundamentals collide. Each one begins with a human action—not a pre-drawn architecture." /><span className="case-status">07 SYSTEMS · PREVIEW</span></div></Reveal>
        <Reveal delay={0.08}><CaseStudyGrid /></Reveal>
      </section>

      <section className="home-cta page-shell">
        <Reveal className="home-cta-inner">
          <span className="cta-kicker">LAB 01 IS READY</span><h2>Watch a request leave home.</h2><p>Meet the client. Meet the server. Send traffic, raise the load, and pull the plug.</p>
          <Link className="primary-cta" href="/learn/client-server">Enter Client–Server Lab <ArrowRight /></Link>
        </Reveal>
      </section>
    </>
  );
}
