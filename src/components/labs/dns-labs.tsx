"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, DatabaseIcon, MonitorIcon, Play, Rotate, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";
import { dnsLesson } from "@/content/dns";

const lookupSteps = [
  ["Browser", "asks for systemlab.dev"],
  ["Local cache", "no saved answer"],
  ["Recursive resolver", "takes responsibility for the lookup"],
  ["Root server", "points toward .dev"],
  [".dev TLD", "points toward the domain’s authority"],
  ["Authoritative DNS", "returns the owned A record"],
  ["203.0.113.42", "answer returned to the browser"],
] as const;

export function DnsLookupLab() {
  const [stage, setStage] = useState(-1);
  const [cached, setCached] = useState(false);
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function resolve() {
    timers.current.forEach(clearTimeout);
    setRunning(true);
    if (cached) {
      setStage(7);
      timers.current = [setTimeout(() => setRunning(false), reduce ? 40 : 500)];
      return;
    }
    setStage(0);
    const pace = reduce ? 35 : 430;
    lookupSteps.slice(1).forEach((_, index) => timers.current.push(setTimeout(() => setStage(index + 1), pace * (index + 1))));
    timers.current.push(setTimeout(() => { setCached(true); setRunning(false); }, pace * lookupSteps.length));
  }

  const done = (!running && cached) || stage === 7;
  return (
    <div className="dns-lookup lab-panel">
      <div className="lab-toolbar"><div><span className="live-dot" /> DNS RESOLVER LAB <b>01</b></div><span>ILLUSTRATIVE LATENCY</span></div>
      <div className="dns-query-bar"><MonitorIcon /><span><small>BROWSER QUERY</small><b>systemlab.dev</b></span><button type="button" className="lab-button" onClick={resolve} disabled={running}><Play />{cached ? "RESOLVE AGAIN" : "RESOLVE DOMAIN"}</button></div>
      <div className="dns-lookup-grid" aria-live="polite">
        {lookupSteps.map(([label, note], index) => <div key={label} className={`dns-hop ${stage >= index && stage !== 7 ? "active" : ""} ${stage === index ? "current" : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><i /><div><b>{label}</b><small>{note}</small></div>{index < lookupSteps.length - 1 ? <ArrowRight /> : null}</div>)}
        {stage === 7 ? <div className="dns-cache-shortcut"><SparkIcon /><span><b>RESOLVER CACHE HIT</b><small>The hierarchy was skipped.</small></span><ArrowRight /><code>203.0.113.42</code></div> : null}
      </div>
      <div className={`dns-result ${done ? "dns-result--visible" : ""}`}>
        <span><small>DOMAIN</small><b>systemlab.dev</b></span><ArrowRight /><span><small>ADDRESS</small><b>203.0.113.42</b></span><em>{stage === 7 ? "~3 ms · CACHE HIT" : "~120 ms · FULL LOOKUP"}</em>
      </div>
    </div>
  );
}

export function DnsRecordExplorer() {
  const [active, setActive] = useState(0);
  const record = dnsLesson.records[active];
  return (
    <div className="dns-records">
      <div className="record-tabs" role="tablist" aria-label="DNS record types">{dnsLesson.records.map((item, index) => <button key={item.type} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)}>{item.type}</button>)}</div>
      <div className="record-stage" aria-live="polite"><span className="record-type">{record.type}</span><div><small>OWNER NAME</small><code>{record.name}</code></div><ArrowRight /><div><small>RECORD VALUE</small><code>{record.value}</code></div><p>{record.note}</p></div>
    </div>
  );
}

export function TtlLab() {
  const [elapsed, setElapsed] = useState(0);
  const [authoritativeIp, setAuthoritativeIp] = useState("203.0.113.42");
  const [cachedIp, setCachedIp] = useState("203.0.113.42");
  const [refreshed, setRefreshed] = useState(false);
  const stale = authoritativeIp !== cachedIp;
  const remaining = 60 - elapsed;

  function advance() {
    const next = elapsed + 15;
    if (next >= 60) { setCachedIp(authoritativeIp); setElapsed(0); setRefreshed(true); }
    else { setElapsed(next); setRefreshed(false); }
  }
  function changeAuthority() { setAuthoritativeIp((value) => value.endsWith("42") ? "203.0.113.99" : "203.0.113.42"); setRefreshed(false); }

  return (
    <div className="ttl-lab lab-panel">
      <div className="lab-toolbar"><div><span className={stale ? "alert-dot" : "live-dot"} /> TTL TIME MACHINE <b>02</b></div><span>SIMULATED TIME</span></div>
      <div className="ttl-grid">
        <div className="ttl-card"><small>CLIENT CACHE</small><h3>systemlab.dev</h3><code>{cachedIp}</code><div className="ttl-meter"><i style={{ width: `${(remaining / 60) * 100}%` }} /></div><span>TTL {remaining}s remaining</span></div>
        <div className="ttl-versus">{stale ? "≠" : "="}</div>
        <div className="ttl-card ttl-card--authority"><small>AUTHORITATIVE ANSWER</small><h3>systemlab.dev</h3><code>{authoritativeIp}</code><span>Source of the next fresh lookup</span></div>
      </div>
      <div className="ttl-actions"><button type="button" onClick={changeAuthority}>CHANGE AUTHORITATIVE IP</button><button type="button" onClick={advance}>ADVANCE 15 SECONDS</button></div>
      <div className={`observation ${stale ? "observation--warn" : ""}`} aria-live="polite"><span>OBSERVATION</span><p>{refreshed ? "The TTL expired, so the next lookup refreshed the cache with the new authoritative address." : stale ? `The authority changed, but this client still uses ${cachedIp} until its cached record expires.` : "The cached and authoritative answers agree. Change the authority, then advance simulated time."}</p></div>
    </div>
  );
}

type DnsFailure = "healthy" | "resolver" | "stale" | "wrong";
export function BreakDnsLab() {
  const [mode, setMode] = useState<DnsFailure>("healthy");
  const copy = {
    healthy: ["LOOKUP COMPLETE", "203.0.113.42", "The resolver reaches the authority and returns a usable address."],
    resolver: ["RESOLUTION FAILED", "SERVFAIL", "Without a reachable resolver—and without a cached answer—the client cannot discover where to connect."],
    stale: ["STALE ANSWER", "203.0.113.18", "The cached record is still valid by TTL, but it points at an address the service no longer uses."],
    wrong: ["BAD RECORD", "192.0.2.9", "DNS succeeded technically, but the configured answer points clients at the wrong destination."],
  }[mode];
  return (
    <div className={`dns-break lab-panel dns-break--${mode}`}>
      <div className="lab-toolbar"><div><span className={mode === "healthy" ? "live-dot" : "alert-dot"} /> BREAK DNS <b>03</b></div><span>FAILURE MODEL</span></div>
      <div className="dns-break-stage"><div><MonitorIcon /><b>CLIENT</b></div><i /><div><ServerIcon /><b>RESOLVER</b></div><i /><div><DatabaseIcon /><b>AUTHORITY</b></div><span className="dns-break-answer"><small>{copy[0]}</small><strong>{copy[1]}</strong></span></div>
      <div className="failure-buttons"><button className={mode === "resolver" ? "active" : ""} type="button" onClick={() => setMode(mode === "resolver" ? "healthy" : "resolver")}>Resolver failure</button><button className={mode === "stale" ? "active" : ""} type="button" onClick={() => setMode(mode === "stale" ? "healthy" : "stale")}>Stale DNS</button><button className={mode === "wrong" ? "active" : ""} type="button" onClick={() => setMode(mode === "wrong" ? "healthy" : "wrong")}>Wrong record</button></div>
      <div className="observation"><span>WHAT HAPPENED</span><p>{copy[2]}</p></div>
    </div>
  );
}

const dnsActors = ["Browser", "Recursive Resolver", "Root", ".dev TLD", "Authoritative DNS", "CNAME Target", "API Server", "Old Address"] as const;
const dnsRounds = [
  { prompt: "First lookup for api.systemlab.dev", answer: ["Browser", "Recursive Resolver", "Root", ".dev TLD", "Authoritative DNS", "API Server"], why: "The resolver follows referrals from root to .dev to the authority, returns the address, and the browser can then connect." },
  { prompt: "The resolver already cached a valid A record", answer: ["Browser", "Recursive Resolver", "API Server"], why: "A valid cached answer skips root, TLD, and authoritative servers." },
  { prompt: "www.systemlab.dev is a CNAME", answer: ["Browser", "Recursive Resolver", "Authoritative DNS", "CNAME Target", "API Server"], why: "The alias points at another hostname, which must also resolve before connection." },
  { prompt: "The authority changed, but the cached TTL has not expired", answer: ["Browser", "Recursive Resolver", "Old Address"], why: "The resolver may legally return its still-valid cached answer, even though the authority now has a newer address." },
] as const;

export function DnsGame() {
  const [round, setRound] = useState(0);
  const [path, setPath] = useState<string[]>([]);
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");
  const complete = round >= dnsRounds.length;
  const current = dnsRounds[Math.min(round, dnsRounds.length - 1)];
  const restart = () => { setRound(0); setPath([]); setResult("idle"); };
  const reset = () => { setPath([]); setResult("idle"); };
  const check = () => setResult(current.answer.every((value, index) => path[index] === value) ? "correct" : "incorrect");
  const next = () => { setRound((value) => value + 1); setPath([]); setResult("idle"); };
  return (
    <MiniGameShell title="FIND THE SERVER" round={round} total={dnsRounds.length} feedback={result === "correct" ? current.why : result === "incorrect" ? `That route assigns a DNS role to the wrong actor. ${current.why}` : undefined} feedbackTone={result === "correct" ? "success" : result === "incorrect" ? "error" : "neutral"} feedbackSuccessLabel="LOOKUP ORDERED ✓" feedbackErrorLabel="RETHINK THE LOOKUP" complete={complete} completeTitle="DNS LOOKUP UNDERSTOOD" completeCopy="You can trace first, cached, aliased, and stale lookups—and distinguish finding an address from connecting to it." onRestart={restart}>
      <div className="game-prompt"><small>LOOKUP {String(round + 1).padStart(2, "0")}</small><h3>{current.prompt}</h3><p>Select each actor in the order it participates.</p></div>
      <div className="dns-game-path">{current.answer.map((_, index) => <div key={index} className={path[index] ? "filled" : ""}><span>{index + 1}</span><b>{path[index] ?? "SELECT"}</b>{index < current.answer.length - 1 ? <ArrowRight /> : null}</div>)}</div>
      <div className="dns-actor-grid">{dnsActors.map((actor) => <button key={actor} type="button" disabled={path.includes(actor) || result !== "idle"} onClick={() => path.length < current.answer.length && setPath((value) => [...value, actor])}>{actor}</button>)}</div>
      <div className="game-footer"><button className="quiet-button" type="button" onClick={reset} disabled={path.length === 0}><Rotate />CLEAR</button>{result === "correct" ? <button className="lab-button" type="button" onClick={next}>{round === dnsRounds.length - 1 ? "FINISH" : "NEXT LOOKUP"}<ArrowRight /></button> : result === "incorrect" ? <button className="lab-button" type="button" onClick={reset}><Rotate />TRY AGAIN</button> : <button className="lab-button" type="button" onClick={check} disabled={path.length !== current.answer.length}>CHECK ORDER <ArrowRight /></button>}</div>
    </MiniGameShell>
  );
}
