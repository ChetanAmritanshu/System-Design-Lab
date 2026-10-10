import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ServerIcon } from "@/components/ui/icons";
import { ConceptChain } from "@/components/lesson/concept-chain";
import { LessonPager } from "@/components/lesson/lesson-pager";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

type Card={title:string;copy:string};
export type FoundationLessonProps={
  number:"12"|"13"|"14"|"15"|"16"|"17"; className:string; category:string; eyebrow:string;
  title:string; accent:string; deck:string; question:string; heroLabels:[string,string,string];
  storyTitle:string; storyCopy:string; story:Card[]; labTitle:string; labCopy:string; lab:ReactNode;
  conceptsTitle:string; conceptsCopy:string; concepts:Card[]; breaks:Card[]; gameTitle:string; gameCopy:string; game:ReactNode;
  summary:Card[]; sourceFile:string; sourceSummary:string;
  previous:{number:string;title:string;href:string}; next:{number:string;title:string;href?:string;copy:string};
};

export function FoundationLesson(p:FoundationLessonProps){
  const ids=["pressure","lab","model","break","challenge"];
  return <article className={`lesson-page foundation-page ${p.className}`}>
    <section className="foundation-hero page-shell">
      <div className="lesson-breadcrumb"><Link href="/#learning-map">Learning map</Link><span>/</span><b>{p.category}</b><span>/</span><span>Chapter {p.number}</span></div>
      <ConceptChain current={p.number}/>
      <div className="topic-hero-grid"><div><p className="eyebrow"><span/>{p.eyebrow} · INTERACTIVE LAB</p><h1>{p.title}<br/><em>{p.accent}</em></h1><p className="lesson-deck">{p.deck}</p><div className="lesson-principle"><b>THE QUESTION</b><p>{p.question}</p></div><a className="text-link" href="#pressure">Find the pressure <ArrowDown/></a></div>
      <div className="foundation-hero-viz" aria-label={`${p.heroLabels.join(" to ")} system flow`}><small>ONE IDEA · THREE STATES</small>{p.heroLabels.map((label,index)=><div key={label}><span>{String(index+1).padStart(2,"0")}</span><b>{label}</b>{index<2?<ArrowRight/>:null}</div>)}<p>Start simple. Apply pressure. Observe what must change.</p></div></div>
    </section>
    <nav className="chapter-nav" aria-label="Chapter sections"><div className="page-shell"><span>CHAPTER {p.number}</span><div>{[["01","Pressure"],["02","Lab"],["03","Model"],["04","Break"],["05","Challenge"]].map(([n,l],i)=><a href={`#${ids[i]}`} key={n}><small>{n}</small>{l}</a>)}</div></div></nav>
    <section className="lesson-section page-shell" id="pressure"><Reveal><SectionHeading eyebrow="01 · THE PRESSURE" title={p.storyTitle} copy={p.storyCopy}/></Reveal><div className="foundation-story-grid">{p.story.map((c,i)=><Reveal delay={i*.04} key={c.title}><div><span>0{i+1}</span><h3>{c.title}</h3><p>{c.copy}</p></div></Reveal>)}</div></section>
    <section className="lesson-section lesson-section--wide" id="lab"><div className="page-shell"><Reveal><SectionHeading eyebrow="02 · SEE IT / PLAY WITH IT" title={p.labTitle} copy={p.labCopy}/></Reveal><Reveal delay={.08}>{p.lab}</Reveal></div></section>
    <section className="lesson-section page-shell" id="model"><Reveal><SectionHeading eyebrow="03 · BUILD THE MENTAL MODEL" title={p.conceptsTitle} copy={p.conceptsCopy}/></Reveal><div className="foundation-concepts">{p.concepts.map((c,i)=><Reveal delay={i*.04} key={c.title}><div><span>{String(i+1).padStart(2,"0")}</span><b>{c.title}</b><p>{c.copy}</p></div></Reveal>)}</div></section>
    <section className="lesson-section lesson-section--wide" id="break"><div className="page-shell"><Reveal><SectionHeading eyebrow="04 · BREAK THE SYSTEM" title="Healthy diagrams hide failure." copy="Trigger the pressure mentally before choosing the remedy. A component earns its place only when it solves a named failure or correctness risk."/></Reveal><div className="break-card-grid">{p.breaks.map((c,i)=><Reveal delay={i*.05} key={c.title}><div><span>{i===0?"FAULT":i===1?"RACE":"SCALE"}</span><h3>{c.title}</h3><p>{c.copy}</p></div></Reveal>)}</div></div></section>
    <section className="lesson-section page-shell" id="challenge"><Reveal><SectionHeading eyebrow="05 · APPLY IT" title={p.gameTitle} copy={p.gameCopy}/></Reveal><Reveal delay={.08}>{p.game}</Reveal></section>
    <section className="takeaway-section"><div className="page-shell"><Reveal><SectionHeading eyebrow={`${p.title.toUpperCase()} SUMMARY`} title="Name the pressure. Choose the mechanism. State the trade-off."/></Reveal><div className="topic-summary-grid">{p.summary.map((c,i)=><div key={c.title}><span>{String(i+1).padStart(2,"0")}</span><b>{c.title}</b><p>{c.copy}</p></div>)}</div><div className="source-note"><span>SOURCE MAPPING</span><p>Derived from <a href={`https://github.com/ChetanAmritanshu/High-Level-Design/blob/main/${p.sourceFile}`} target="_blank" rel="noreferrer"><code>{p.sourceFile}</code></a>. {p.sourceSummary}</p></div><LessonPager previous={p.previous} next={p.next}/><Link className="back-to-map" href="/#learning-map"><ServerIcon/> Return to the learning map <ArrowRight/></Link></div></section>
  </article>;
}
