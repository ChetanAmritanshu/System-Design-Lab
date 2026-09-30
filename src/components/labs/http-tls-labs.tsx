"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MonitorIcon, Play, Rotate, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";
import { httpTlsLesson } from "@/content/http-tls";

const messageFields = [
  { id: "method", label: "Method", token: "GET", copy: "Expresses the request’s intent: read a representation." },
  { id: "path", label: "Path", token: "/profile", copy: "Identifies the resource at this server." },
  { id: "protocol", label: "Protocol", token: "HTTP/1.1", copy: "Declares the message format and version." },
  { id: "headers", label: "Headers", token: "Accept: application/json", copy: "Carry metadata about the request and desired response." },
  { id: "body", label: "Body", token: "{ … }", copy: "Carries content when a request or response needs a payload." },
  { id: "status", label: "Status code", token: "200 OK", copy: "Summarizes how the server handled the request." },
] as const;

export function HttpMessageExplorer() {
  const [active, setActive] = useState("method");
  const field = messageFields.find((item) => item.id === active) ?? messageFields[0];
  return (
    <div className="http-explorer lab-panel">
      <div className="lab-toolbar"><div><span className="live-dot" /> HTTP MESSAGE EXPLORER <b>01</b></div><span>CLICK A FIELD</span></div>
      <div className="http-explorer-grid">
        <div className="http-message"><small>REQUEST</small><code><button className={active === "method" ? "active" : ""} onClick={() => setActive("method")}>GET</button> <button className={active === "path" ? "active" : ""} onClick={() => setActive("path")}>/profile</button> <button className={active === "protocol" ? "active" : ""} onClick={() => setActive("protocol")}>HTTP/1.1</button>{`\n`}Host: systemlab.dev{`\n`}<button className={active === "headers" ? "active" : ""} onClick={() => setActive("headers")}>Accept: application/json</button></code></div>
        <div className="http-message http-message--response"><small>RESPONSE</small><code>HTTP/1.1 <button className={active === "status" ? "active" : ""} onClick={() => setActive("status")}>200 OK</button>{`\n`}Content-Type: application/json{`\n\n`}<button className={active === "body" ? "active" : ""} onClick={() => setActive("body")}>{`{ "name": "Alice" }`}</button></code></div>
        <div className="http-field-note" aria-live="polite"><small>SELECTED FIELD</small><h3>{field.label}</h3><code>{field.token}</code><p>{field.copy}</p></div>
      </div>
    </div>
  );
}

export function MethodStatusExplorer() {
  const [method, setMethod] = useState(0);
  const [status, setStatus] = useState(0);
  const statusItem = httpTlsLesson.statuses[status];
  const category = Number(statusItem[0][0]);
  return (
    <div className="protocol-explorer">
      <div className="method-panel"><span className="panel-kicker">REQUEST INTENT</span><div className="method-list" role="tablist" aria-label="HTTP methods">{httpTlsLesson.methods.map(([name], index) => <button type="button" role="tab" aria-selected={method === index} onClick={() => setMethod(index)} key={name}>{name}</button>)}</div><div className="method-focus"><code>{httpTlsLesson.methods[method][2]}</code><h3>{httpTlsLesson.methods[method][0]}</h3><p>{httpTlsLesson.methods[method][1]}</p></div></div>
      <div className={`status-panel status-panel--${category}`}><span className="panel-kicker">RESPONSE OUTCOME</span><div className="status-categories"><span className={category === 2 ? "active" : ""}>2xx</span><span className={category === 3 ? "active" : ""}>3xx</span><span className={category === 4 ? "active" : ""}>4xx</span><span className={category === 5 ? "active" : ""}>5xx</span></div><div className="status-grid">{httpTlsLesson.statuses.map(([code], index) => <button type="button" className={status === index ? "active" : ""} onClick={() => setStatus(index)} key={code}>{code}</button>)}</div><div className="status-focus"><strong>{statusItem[0]}</strong><span><b>{statusItem[1]}</b><small>{statusItem[2]}</small></span></div></div>
    </div>
  );
}

export function HttpsTransformation() {
  const [secure, setSecure] = useState(false);
  const reduce = useReducedMotion();
  return (
    <div className={`https-transform lab-panel ${secure ? "https-transform--secure" : ""}`}>
      <div className="lab-toolbar"><div><span className={secure ? "live-dot" : "alert-dot"} /> TRANSPORT OBSERVER <b>02</b></div><span>{secure ? "HTTPS" : "HTTP"}</span></div>
      <div className="transport-stage">
        <div className="transport-node"><MonitorIcon /><b>CLIENT</b></div>
        <div className="transport-wire"><motion.code key={String(secure)} initial={reduce ? false : { x: "-20%", opacity: 0 }} animate={{ x: 0, opacity: 1 }}>{secure ? "7f a1 3c ••• encrypted records" : "password=secret123"}</motion.code><i /><span className="observer">◉<small>NETWORK OBSERVER</small></span></div>
        <div className="transport-node"><ServerIcon /><b>SERVER</b></div>
      </div>
      <div className="transport-explanation"><span>{secure ? "🔒" : "VISIBLE"}</span><p>{secure ? "HTTPS carries the same HTTP meaning inside a TLS-protected channel. An observer sees encrypted TLS records, not the plaintext message." : "Plain HTTP does not encrypt transport. Anyone able to observe the connection could read its content."}</p><button type="button" className="lab-button" onClick={() => setSecure((value) => !value)}>{secure ? <Rotate /> : <SparkIcon />}{secure ? "SHOW PLAIN HTTP" : "ENABLE HTTPS"}</button></div>
    </div>
  );
}

const handshakeSteps = [
  ["ClientHello", "Client → Server", "Supported TLS versions, cryptographic options, and ephemeral key share."],
  ["ServerHello + certificate", "Server → Client", "The server selects parameters, supplies its key share, and proves its identity with a certificate."],
  ["Verify identity", "Inside the client", "The client checks the trust chain, hostname, validity period, and signature."],
  ["Derive shared keys", "Both endpoints", "Ephemeral key agreement lets both sides derive matching symmetric traffic keys."],
  ["Encrypted HTTP", "Client ↔ Server", "HTTP messages now travel as authenticated, encrypted TLS records."],
] as const;

export function TlsHandshakeLab() {
  const [step, setStep] = useState(0);
  const finished = step === handshakeSteps.length - 1;
  return (
    <div className="tls-handshake lab-panel">
      <div className="lab-toolbar"><div><span className={finished ? "live-dot" : "live-dot"} /> TLS 1.3 HANDSHAKE <b>03</b></div><span>CONCEPTUAL SEQUENCE</span></div>
      <div className="handshake-stage"><div className="handshake-peer"><MonitorIcon /><b>CLIENT</b></div><div className="handshake-timeline">{handshakeSteps.map(([name, direction], index) => <button type="button" key={name} className={step === index ? "current" : step > index ? "done" : ""} onClick={() => setStep(index)}><span>{index + 1}</span><i /><div><b>{name}</b><small>{direction}</small></div></button>)}</div><div className="handshake-peer"><ServerIcon /><b>SERVER</b></div></div>
      <div className="handshake-focus" aria-live="polite"><span>STEP {step + 1}</span><h3>{handshakeSteps[step][0]}</h3><p>{handshakeSteps[step][2]}</p><button type="button" className="lab-button" onClick={() => setStep(finished ? 0 : step + 1)}>{finished ? <Rotate /> : <Play />}{finished ? "REPLAY" : "NEXT MESSAGE"}</button></div>
      <p className="accuracy-note">Modern TLS normally uses ephemeral key agreement; this model intentionally omits low-level message and key-schedule detail.</p>
    </div>
  );
}

const certFields = [
  ["Issued To", "systemlab.dev", "Hostname identity the certificate is valid for."],
  ["Issued By", "System Lab Test CA", "A trusted Certificate Authority signed this certificate."],
  ["Valid From", "Sep 01, 2026", "The certificate is not accepted before this date."],
  ["Valid Until", "Dec 01, 2026", "Expired certificates fail validation even if their signatures are intact."],
  ["Public Key", "ECDSA P-256", "Used with the certificate signature to authenticate the server; it is not a shared secret."],
  ["Status", "✓ Trusted", "The trust chain, hostname, dates, and signature all validate."],
] as const;

export function CertificateExplorer() {
  const [active, setActive] = useState(0);
  return (
    <div className="certificate-explorer">
      <div className="certificate-card"><div className="cert-top"><span>🔒</span><div><small>DIGITAL CERTIFICATE</small><h3>systemlab.dev</h3></div><em>TRUSTED</em></div>{certFields.map(([label, value], index) => <button key={label} type="button" className={active === index ? "active" : ""} onClick={() => setActive(index)}><small>{label}</small><b>{value}</b><ArrowRight /></button>)}<div className="cert-seal">CA</div></div>
      <div className="certificate-note" aria-live="polite"><span>FIELD {String(active + 1).padStart(2, "0")}</span><h3>{certFields[active][0]}</h3><code>{certFields[active][1]}</code><p>{certFields[active][2]}</p><div><b>A certificate proves</b><small>that a trusted issuer bound this public key to the validated hostname—not that the website itself is honest or bug-free.</small></div></div>
    </div>
  );
}

type TlsFailure = "healthy" | "expired" | "hostname" | "issuer";
export function BreakTlsLab() {
  const [mode, setMode] = useState<TlsFailure>("healthy");
  const detail = {
    healthy: ["SECURE CONNECTION", "Certificate checks passed. Encrypted HTTP may proceed."],
    expired: ["CERTIFICATE EXPIRED", "The certificate is outside its permitted validity window, so identity verification fails."],
    hostname: ["HOSTNAME MISMATCH", "Visited payments.example.com, but the certificate only covers api.example.com."],
    issuer: ["UNTRUSTED ISSUER", "The certificate chain does not lead to a trust anchor accepted by the client."],
  }[mode];
  return (
    <div className={`tls-break lab-panel tls-break--${mode}`}>
      <div className="lab-toolbar"><div><span className={mode === "healthy" ? "live-dot" : "alert-dot"} /> BREAK TLS <b>04</b></div><span>CERTIFICATE VALIDATION</span></div>
      <div className="browser-warning"><div className="browser-address"><span>{mode === "healthy" ? "🔒" : "⚠"}</span> https://payments.example.com</div><div><span className="warning-mark">{mode === "healthy" ? "✓" : "!"}</span><small>{mode === "healthy" ? "CONNECTION ALLOWED" : "CONNECTION BLOCKED"}</small><h3>{detail[0]}</h3><p>{detail[1]}</p></div></div>
      <div className="failure-buttons"><button className={mode === "expired" ? "active" : ""} type="button" onClick={() => setMode(mode === "expired" ? "healthy" : "expired")}>Expired certificate</button><button className={mode === "hostname" ? "active" : ""} type="button" onClick={() => setMode(mode === "hostname" ? "healthy" : "hostname")}>Hostname mismatch</button><button className={mode === "issuer" ? "active" : ""} type="button" onClick={() => setMode(mode === "issuer" ? "healthy" : "issuer")}>Untrusted issuer</button></div>
    </div>
  );
}

const trustRounds = [
  { url: "https://shop.example.com", host: "shop.example.com", issuer: "Trusted CA", validity: "Valid", protocol: "HTTPS", trust: true, why: "Hostname, issuer, and validity checks all pass, so the authenticated TLS connection may continue." },
  { url: "https://shop.example.com", host: "shop.example.com", issuer: "Trusted CA", validity: "Expired", protocol: "HTTPS", trust: false, why: "An expired certificate is no longer valid proof of the server’s identity." },
  { url: "https://payments.example.com", host: "api.example.com", issuer: "Trusted CA", validity: "Valid", protocol: "HTTPS", trust: false, why: "A valid certificate for a different hostname must not authenticate payments.example.com." },
  { url: "https://portal.example.com", host: "portal.example.com", issuer: "Unknown Lab CA", validity: "Valid", protocol: "HTTPS", trust: false, why: "The client cannot build a chain from this issuer to a trusted root." },
  { url: "http://accounts.example.com", host: "—", issuer: "—", validity: "No TLS", protocol: "HTTP", trust: false, why: "Plain HTTP provides no TLS encryption or authenticated server certificate; sensitive data should not be sent." },
] as const;

export function TrustGame() {
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const complete = round >= trustRounds.length;
  const current = trustRounds[Math.min(round, trustRounds.length - 1)];
  const correct = choice === current.trust;
  const restart = () => { setRound(0); setChoice(null); };
  return (
    <MiniGameShell title="TRUST OR BLOCK?" round={round} total={trustRounds.length} feedback={choice === null ? undefined : correct ? current.why : `That choice would ${choice ? "trust" : "block"} the connection for the wrong reason. ${current.why}`} feedbackTone={choice === null ? "neutral" : correct ? "success" : "error"} feedbackSuccessLabel="CORRECT DECISION ✓" feedbackErrorLabel="CHECK THE EVIDENCE" complete={complete} completeTitle="SECURE CONNECTION UNDERSTOOD" completeCopy="You can reason about HTTPS using protocol, hostname, validity, and certificate trust—not merely the presence of a lock icon." onRestart={restart}>
      <div className="trust-scenario"><span>CONNECTION {String(round + 1).padStart(2, "0")}</span><h3>{current.url}</h3><div><p><small>CERTIFICATE HOST</small><b>{current.host}</b></p><p><small>ISSUER</small><b>{current.issuer}</b></p><p><small>VALIDITY</small><b>{current.validity}</b></p><p><small>TRANSPORT</small><b>{current.protocol}</b></p></div></div>
      <div className="trust-actions"><button type="button" disabled={choice !== null} onClick={() => setChoice(true)}>✓ TRUST CONNECTION</button><button type="button" disabled={choice !== null} onClick={() => setChoice(false)}>× BLOCK CONNECTION</button></div>
      <div className="game-footer"><span />{choice !== null ? correct ? <button type="button" className="lab-button" onClick={() => { setRound((value) => value + 1); setChoice(null); }}>{round === trustRounds.length - 1 ? "FINISH" : "NEXT CONNECTION"}<ArrowRight /></button> : <button type="button" className="lab-button" onClick={() => setChoice(null)}><Rotate />TRY AGAIN</button> : null}</div>
    </MiniGameShell>
  );
}
