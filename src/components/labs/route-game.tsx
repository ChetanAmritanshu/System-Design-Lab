"use client";

import { useState } from "react";
import { ArrowRight, DatabaseIcon, MonitorIcon, Rotate, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";

const nodes = [
  { id: "mobile", label: "Mobile App", Icon: MonitorIcon },
  { id: "browser", label: "Browser", Icon: MonitorIcon },
  { id: "api", label: "API Server", Icon: ServerIcon },
  { id: "database", label: "Database", Icon: DatabaseIcon },
  { id: "cdn", label: "CDN", Icon: SparkIcon },
  { id: "service", label: "Backend Service", Icon: ServerIcon },
] as const;

const rounds = [
  { prompt: "A browser requests a dynamic webpage.", answer: ["browser", "api"], why: "The browser is the client. The web/API server receives the request and returns the page." },
  { prompt: "A mobile user requests their saved profile.", answer: ["mobile", "api", "database"], why: "The app calls an API, which owns the database access and returns a controlled response." },
  { prompt: "A background service needs data from another service.", answer: ["service", "api"], why: "A server can also act as a client when it initiates a call to another service." },
  { prompt: "A browser requests an already-cached static image.", answer: ["browser", "cdn"], why: "The browser can fetch cached static content from an edge CDN without reaching the application server." },
  { prompt: "A mobile app needs private account data. Choose the normal safe boundary.", answer: ["mobile", "api", "database"], why: "Clients normally do not connect directly to a database. The API enforces authentication, validation, and access rules." },
] as const;

export function RouteGame() {
  const [round, setRound] = useState(0);
  const [route, setRoute] = useState<string[]>([]);
  const [result, setResult] = useState<"idle" | "correct" | "incorrect">("idle");
  const complete = round >= rounds.length;
  const current = rounds[Math.min(round, rounds.length - 1)];

  function select(id: string) {
    if (result !== "idle" || route.includes(id) || route.length >= current.answer.length) return;
    setRoute((value) => [...value, id]);
  }

  function check() {
    const correct = current.answer.every((id, index) => route[index] === id);
    setResult(correct ? "correct" : "incorrect");
  }

  function next() { setRound((value) => value + 1); setRoute([]); setResult("idle"); }
  function retry() { setRoute([]); setResult("idle"); }
  function restart() { setRound(0); setRoute([]); setResult("idle"); }

  const directDatabase = route[1] === "database" && (route[0] === "mobile" || route[0] === "browser");
  const feedback = result === "correct" ? current.why : result === "incorrect" ? directDatabase ? "The database stores data, but a public client normally talks to an application server first. That server protects the data boundary." : `Follow who initiates the request, then choose the participant that owns the requested capability. ${current.why}` : undefined;

  return (
    <MiniGameShell title="ROUTE THE REQUEST" round={round} total={rounds.length} feedback={feedback} feedbackTone={result === "correct" ? "success" : result === "incorrect" ? "error" : "neutral"} feedbackSuccessLabel="REQUEST ROUTED ✓" feedbackErrorLabel="RETHINK THE PATH" complete={complete} completeTitle="REQUEST FLOW UNDERSTOOD" completeCopy="You can identify the client, follow work toward the responsible server, and keep databases behind application boundaries." onRestart={restart}>
      <div className="game-prompt"><small>SCENARIO {String(round + 1).padStart(2, "0")}</small><h3>{current.prompt}</h3><p>Build the request path in order. The response will return along the reverse path.</p></div>
      <div className={`route-slots route-slots--dynamic ${result === "correct" ? "route-slots--success" : ""}`} aria-label="Your selected route">
        {current.answer.map((_, index) => {
          const selected = nodes.find((node) => node.id === route[index]);
          return <div className={selected ? "route-slot route-slot--filled" : "route-slot"} key={index}><span>{index + 1}</span>{selected ? <><selected.Icon /><b>{selected.label}</b></> : <small>SELECT</small>}{index < current.answer.length - 1 ? <ArrowRight /> : null}</div>;
        })}
        {result === "correct" ? <div className="return-path"><i /> RESPONSE RETURNS</div> : null}
      </div>
      <div className="choice-grid choice-grid--six">
        {nodes.map(({ id, label, Icon }) => <button type="button" key={id} disabled={route.includes(id) || result !== "idle"} onClick={() => select(id)}><Icon /><span>{label}</span></button>)}
      </div>
      <div className="game-footer">
        <button type="button" className="quiet-button" onClick={retry} disabled={route.length === 0 && result === "idle"}><Rotate />CLEAR PATH</button>
        {result === "correct" ? <button type="button" className="lab-button" onClick={next}>{round === rounds.length - 1 ? "FINISH" : "NEXT SCENARIO"}<ArrowRight /></button> : result === "incorrect" ? <button type="button" className="lab-button" onClick={retry}><Rotate />TRY AGAIN</button> : <button type="button" className="lab-button" disabled={route.length !== current.answer.length} onClick={check}>ROUTE REQUEST <ArrowRight /></button>}
      </div>
    </MiniGameShell>
  );
}
