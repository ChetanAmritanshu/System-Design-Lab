import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, MonitorIcon, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { ConceptChain } from "@/components/lesson/concept-chain";
import { LessonPager } from "@/components/lesson/lesson-pager";
import { BreakTlsLab, CertificateExplorer, HttpsTransformation, HttpMessageExplorer, MethodStatusExplorer, TlsHandshakeLab, TrustGame } from "@/components/labs/http-tls-labs";
import { httpTlsLesson } from "@/content/http-tls";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "HTTP, HTTPS & TLS", description: "Explore HTTP messages, transform plaintext into HTTPS, and reason through TLS handshakes and certificates." };

const toc = [["01","HTTP","#http"],["02","Messages","#messages"],["03","HTTPS","#https"],["04","Handshake","#handshake"],["05","Certificates","#certificates"],["06","Break TLS","#break"],["07","Challenge","#challenge"]] as const;

export default function HttpTlsPage() {
  return (
    <article className="lesson-page http-page">
      <section className="http-hero page-shell">
        <div className="lesson-breadcrumb"><Link href="/#learning-map">Learning map</Link><span>/</span><b>Networking</b><span>/</span><span>Chapter 03</span></div>
        <ConceptChain current="03" />
        <div className="http-hero-grid">
          <div><p className="eyebrow"><span />MESSAGES & TRUST · 24 MIN LAB</p><h1>Speak clearly.<br /><em>Travel safely.</em></h1><p className="lesson-deck">HTTP describes the message. TLS protects that message in transit and authenticates the server you reached.</p><a className="text-link" href="#http">Open the message <ArrowDown /></a></div>
          <div className="http-hero-terminal" aria-label="HTTP request and response protected by TLS"><div className="hero-terminal-bar"><span /><span /><span /><b>HTTPS · TLS 1.3</b></div><div className="hero-http-message"><small>REQUEST</small><code><b>GET</b> /profile HTTP/1.1{`\n`}Host: systemlab.dev</code></div><div className="hero-tls-channel"><i>🔒</i><span>ENCRYPTED TLS RECORDS</span><i>→</i></div><div className="hero-http-message hero-http-message--response"><small>RESPONSE</small><code>HTTP/1.1 <b>200 OK</b>{`\n`}{`{ "name": "Alice" }`}</code></div><div className="hero-security-metrics"><span><small>IDENTITY</small><b>VERIFIED</b></span><span><small>TRANSPORT</small><b>ENCRYPTED</b></span><span><small>INTEGRITY</small><b>PROTECTED</b></span></div></div>
        </div>
      </section>

      <nav className="chapter-nav" aria-label="Chapter sections"><div className="page-shell"><span>CHAPTER 03</span><div>{toc.map(([number,label,href]) => <a href={href} key={number}><small>{number}</small>{label}</a>)}</div></div></nav>

      <section className="lesson-section page-shell" id="http"><Reveal><SectionHeading eyebrow="01 · START WITH HTTP" title="A shared grammar for request and response." copy="HTTP is an application protocol: clients express intent in requests, servers report outcomes in responses. It is stateless by default—each request must make sense without assuming a remembered conversation." /></Reveal><div className="http-simple-flow"><div><MonitorIcon /><small>CLIENT</small><code>GET /profile</code></div><span><i />REQUEST<ArrowRight /></span><div><ServerIcon /><small>SERVER</small><code>200 OK</code></div></div><div className="session-note"><span>STATE ACROSS REQUESTS</span><div><b>Cookie</b><p>Small client-held data sent with matching HTTP requests.</p></div><ArrowRight /><div><b>Session</b><p>Server-side state identified by a token, often carried in a cookie.</p></div><em>HTTP remains request/response; applications layer state on top.</em></div></section>

      <section className="lesson-section lesson-section--wide" id="messages"><div className="page-shell"><Reveal><SectionHeading eyebrow="02 · MESSAGE EXPLORER" title="Intent goes out. Outcome comes back." copy="Inspect the fields, then compare common method intent and status categories. These are semantics—not guarantees that retries or repeated writes are safe." /></Reveal><Reveal delay={0.08}><HttpMessageExplorer /></Reveal><Reveal delay={0.12}><MethodStatusExplorer /></Reveal></div></section>

      <section className="lesson-section page-shell" id="https"><Reveal><SectionHeading eyebrow="03 · WHY HTTPS EXISTS" title="Plain HTTP exposes the message to the path." copy="HTTP alone does not provide transport encryption or authenticate the server. HTTPS is HTTP carried through TLS—not a separate application language." /></Reveal><Reveal delay={0.08}><HttpsTransformation /></Reveal><div className="security-triad"><div><span>01</span><b>Confidentiality</b><p>Observers cannot read protected application data.</p></div><div><span>02</span><b>Integrity</b><p>Changes to encrypted records are detected.</p></div><div><span>03</span><b>Authentication</b><p>The certificate helps verify the server’s hostname identity.</p></div></div></section>

      <section className="lesson-section tls-section" id="handshake"><div className="page-shell"><Reveal><SectionHeading eyebrow="04 · TLS 1.3 HANDSHAKE" title="Agree on protection. Verify identity. Then speak HTTP." copy="The handshake negotiates parameters, authenticates the server, and derives short-lived symmetric traffic keys. It does not send a shared symmetric key across the network." /></Reveal><Reveal delay={0.08}><TlsHandshakeLab /></Reveal></div></section>

      <section className="lesson-section page-shell" id="certificates"><Reveal><SectionHeading eyebrow="05 · CERTIFICATE EXPLORER" title="A signed binding between name and key." copy="A certificate lets the client validate that a trusted issuer bound a public key to the hostname being visited. Explore every field." /></Reveal><Reveal delay={0.08}><CertificateExplorer /></Reveal></section>

      <section className="lesson-section lesson-section--wide" id="break"><div className="page-shell"><Reveal><SectionHeading eyebrow="06 · FAILURE MODES" title="Encryption without verified identity is not enough." copy="Expire the certificate, visit the wrong hostname, or remove the trusted issuer. A careful client blocks before sending protected application data." /></Reveal><Reveal delay={0.08}><BreakTlsLab /></Reveal></div></section>

      <section className="lesson-section trust-game-section" id="challenge"><div className="page-shell"><Reveal><SectionHeading eyebrow="07 · APPLY IT" title="Trust or block?" copy="Decide whether each connection has enough evidence to proceed. The explanation—not the button—is the lesson." /></Reveal><Reveal delay={0.08}><TrustGame /></Reveal></div></section>

      <section className="takeaway-section"><div className="page-shell"><Reveal><SectionHeading eyebrow="HTTP / TLS SUMMARY" title="Meaning inside a protected channel." /></Reveal><div className="takeaway-grid">{httpTlsLesson.summary.map(([term,note],index) => <div key={term}><span>0{index + 1}</span><h3>{term}</h3><p>{note}</p></div>)}</div><div className="source-note"><span>SOURCE MAPPING</span><p>Derived from <a href="https://github.com/ChetanAmritanshu/High-Level-Design/blob/main/03_HTTP_HTTPS_and_TLS.docx" target="_blank" rel="noreferrer"><code>{httpTlsLesson.source}</code></a>. The source establishes HTTP lifecycle, methods and headers, cookies and sessions, encryption versus authentication, TLS handshake, certificates, and trust chains.</p></div><LessonPager previous={{ number:"02", title:"DNS Fundamentals", href:"/learn/dns" }} next={{ number:"04", title:"HTTP Evolution & QUIC", href:"/learn/http-evolution", copy:"How do HTTP/2, HTTP/3, and QUIC improve transport?" }} /><Link className="back-to-map" href="/#learning-map"><SparkIcon /> Return to the learning map <ArrowRight /></Link></div></section>
    </article>
  );
}
