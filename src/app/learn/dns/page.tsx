import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, DatabaseIcon, MonitorIcon, ServerIcon } from "@/components/ui/icons";
import { ConceptChain } from "@/components/lesson/concept-chain";
import { LessonPager } from "@/components/lesson/lesson-pager";
import { BreakDnsLab, DnsGame, DnsLookupLab, DnsRecordExplorer, TtlLab } from "@/components/labs/dns-labs";
import { dnsLesson } from "@/content/dns";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "DNS Fundamentals", description: "Trace DNS through caches, resolvers, root, TLD, and authoritative servers—then break it." };

const toc = [["01", "The name problem", "#problem"], ["02", "Resolve", "#resolve"], ["03", "Records", "#records"], ["04", "TTL", "#ttl"], ["05", "Break DNS", "#break"], ["06", "Challenge", "#challenge"]] as const;

export default function DnsPage() {
  return (
    <article className="lesson-page dns-page">
      <section className="dns-hero page-shell">
        <div className="lesson-breadcrumb"><Link href="/#learning-map">Learning map</Link><span>/</span><b>Networking</b><span>/</span><span>Chapter 02</span></div>
        <ConceptChain current="02" />
        <div className="dns-hero-grid">
          <div><p className="eyebrow"><span />NAME RESOLUTION · 20 MIN LAB</p><h1>Find the<br /><em>machine.</em></h1><p className="lesson-deck">You know the server exists. DNS explains how <strong>systemlab.dev</strong> becomes an address your client can reach.</p><a className="text-link" href="#problem">Start the lookup <ArrowDown /></a></div>
          <div className="dns-name-machine" aria-label="systemlab.dev resolves to IP address 203.0.113.42"><div className="dns-domain-chip"><small>HUMAN INPUT</small><b>systemlab.dev</b></div><div className="dns-question-path"><i /><span>?</span><i /><small>DNS RESOLUTION</small></div><div className="dns-ip-chip"><small>MACHINE ADDRESS</small><b>203.0.113.42</b></div><div className="dns-orbits"><i /><i /><i /></div></div>
        </div>
      </section>

      <nav className="chapter-nav" aria-label="Chapter sections"><div className="page-shell"><span>CHAPTER 02</span><div>{toc.map(([number,label,href]) => <a key={number} href={href}><small>{number}</small>{label}</a>)}</div></div></nav>

      <section className="lesson-section page-shell" id="problem">
        <Reveal><SectionHeading eyebrow="01 · THE NAME PROBLEM" title="People remember names. Networks route to addresses." copy="DNS is a distributed, hierarchical naming system. A resolver discovers records on a client’s behalf and caches answers so the global hierarchy does not handle every repeat lookup." /></Reveal>
        <div className="dns-principles">
          <Reveal className="dns-principle"><span>RECURSIVE</span><ServerIcon /><h3>One resolver owns the task</h3><p>The client asks its recursive resolver for a usable answer. That resolver performs the remaining work or returns an error.</p></Reveal>
          <Reveal className="dns-principle" delay={0.06}><span>ITERATIVE</span><ArrowRight /><h3>Authorities return referrals</h3><p>Root and TLD servers usually point the resolver toward the next responsible server rather than resolving the entire name.</p></Reveal>
          <Reveal className="dns-principle" delay={0.12}><span>AUTHORITATIVE</span><DatabaseIcon /><h3>The zone owns the answer</h3><p>The authoritative server publishes the domain’s final records. Resolver caches are useful copies—not the source of truth.</p></Reveal>
        </div>
        <div className="role-rule"><span>NOT JUST A PHONE BOOK</span><p>DNS is distributed delegation plus caching: no single directory stores every answer, and different clients may temporarily observe different cached versions.</p></div>
      </section>

      <section className="lesson-section lesson-section--wide" id="resolve"><div className="page-shell"><Reveal><SectionHeading eyebrow="02 · INTERACTIVE LOOKUP" title="Follow control through the hierarchy." copy="Run the first lookup through resolver, root, TLD, and authority. Run it again to see why caching is essential." /></Reveal><Reveal delay={0.08}><DnsLookupLab /></Reveal></div></section>

      <section className="lesson-section page-shell" id="records"><Reveal><SectionHeading eyebrow="03 · DNS RECORDS" title="A name can publish more than an address." copy="Select a record to see the relationship it represents. DNS records are typed statements owned by a zone." /></Reveal><Reveal delay={0.08}><DnsRecordExplorer /></Reveal></section>

      <section className="lesson-section lesson-section--tint" id="ttl"><div className="page-shell"><Reveal><SectionHeading eyebrow="04 · TTL & CACHING" title="Fast answers can be temporarily old." copy="TTL tells caches how long they may reuse an answer. Lower TTLs propagate changes sooner but cause more lookup work; higher TTLs reduce work but extend staleness." /></Reveal><Reveal delay={0.08}><TtlLab /></Reveal></div></section>

      <section className="lesson-section page-shell" id="break"><Reveal><SectionHeading eyebrow="05 · FAILURE MODES" title="A successful lookup can still be wrong." copy="Break the resolver, serve a stale cache, or publish a bad record. Each failure occurs at a different responsibility boundary." /></Reveal><Reveal delay={0.08}><BreakDnsLab /></Reveal></section>

      <section className="lesson-section dns-game-section" id="challenge"><div className="page-shell"><Reveal><SectionHeading eyebrow="06 · APPLY IT" title="Find the server." copy="Construct first, cached, aliased, and stale lookup paths. DNS ends with an address; the client then begins its network connection." /></Reveal><Reveal delay={0.08}><DnsGame /></Reveal></div></section>

      <section className="takeaway-section"><div className="page-shell"><Reveal><SectionHeading eyebrow="DNS SUMMARY" title="Names become routes through delegated answers." /></Reveal><div className="takeaway-grid takeaway-grid--five">{dnsLesson.summary.map(([term,note],index) => <div key={term}><span>0{index + 1}</span><h3>{term}</h3><p>{note}</p></div>)}</div><div className="source-note"><span>SOURCE MAPPING</span><p>Derived from <a href="https://github.com/ChetanAmritanshu/High-Level-Design/blob/main/02_DNS_Fundamentals.docx" target="_blank" rel="noreferrer"><code>{dnsLesson.source}</code></a>. The source establishes hierarchy, recursive and iterative lookup, resolver caching, TTL, authoritative servers, and failure behavior.</p></div><LessonPager previous={{ number:"01", title:"Client–Server", href:"/learn/client-server" }} next={{ number:"03", title:"HTTP, HTTPS & TLS", href:"/learn/http-https-tls", copy:"Now that the client found the server, how do they communicate safely?" }} /><Link className="back-to-map" href="/#learning-map"><MonitorIcon /> Return to the learning map <ArrowRight /></Link></div></section>
    </article>
  );
}
