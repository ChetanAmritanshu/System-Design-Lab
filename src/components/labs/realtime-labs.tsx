"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Rotate, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";

type Transport = "poll" | "long" | "sse" | "ws";

const models = {
  poll: { label: "Polling", requests: "60 / min", connections: "Open → close × 60", delay: "~500 ms avg", direction: "Client asks", copy: "Simple repeated HTTP requests. Delivery waits until the next interval, and quiet periods still produce requests." },
  long: { label: "Long polling", requests: "4–12 / min", connections: "Hold → respond → reconnect", delay: "Low after connect", direction: "Client asks; server waits", copy: "The server holds a request until an event or timeout, then the client immediately reconnects. Fewer empty responses, more connection churn." },
  sse: { label: "SSE", requests: "1 stream + reconnects", connections: "Long-lived HTTP", delay: "Event pushed", direction: "Server → client", copy: "A text event stream fits feeds and notifications. Browsers can reconnect, but client-to-server work still uses ordinary requests." },
  ws: { label: "WebSocket", requests: "1 upgrade", connections: "Persistent channel", delay: "Messages flow immediately", direction: "Full duplex", copy: "After a handshake, both sides send independently. The application must manage connection state, reconnects, and missed-event recovery." },
} as const;

export function RealtimeTransportLab() {
  const [transport, setTransport] = useState<Transport>("poll");
  const [interval, setInterval] = useState(1000);
  const [pulse, setPulse] = useState(0);
  const model = models[transport];
  const pollMetrics = useMemo(() => ({ requests: Math.round(60000 / interval), delay: `${interval / 2} ms`, idle: Math.max(0, Math.round(60000 / interval) - 2) }), [interval]);
  return <div className={`realtime-lab realtime-lab--${transport} lab-panel`}>
    <div className="lab-toolbar"><div><span className="live-dot" /> REALTIME TRANSPORT LAB <b>01</b></div><span>DETERMINISTIC TEACHING MODEL</span></div>
    <div className="realtime-tabs" role="tablist" aria-label="Realtime transport">{(Object.entries(models) as [Transport, typeof models[Transport]][]).map(([id,item]) => <button type="button" role="tab" aria-selected={transport === id} key={id} onClick={() => { setTransport(id); setPulse((value) => value + 1); }}>{item.label}</button>)}</div>
    <div className="realtime-stage" key={`${transport}-${pulse}`}>
      <div className="realtime-peer"><small>CLIENT</small><b>{transport === "ws" ? "CHAT" : "DASHBOARD"}</b></div>
      <div className="realtime-channel" aria-label={`${model.label}: ${model.direction}`}>
        {[0,1,2].map((event) => <i key={event} style={{ "--event": event } as React.CSSProperties}><span>{transport === "poll" ? "GET" : transport === "long" ? "WAIT" : transport === "sse" ? "EVENT" : event % 2 ? "SEND" : "RECEIVE"}</span></i>)}
        <code>{model.direction}</code>
      </div>
      <div className="realtime-peer"><small>SERVER</small><b>EVENT SOURCE</b></div>
    </div>
    {transport === "poll" ? <div className="poll-control"><span>POLL EVERY</span>{[500,1000,5000,10000].map((value) => <button type="button" className={interval === value ? "active" : ""} key={value} onClick={() => setInterval(value)}>{value < 1000 ? `${value}ms` : `${value / 1000}s`}</button>)}</div> : null}
    <div className="realtime-metrics"><span><small>HTTP REQUESTS</small><b>{transport === "poll" ? `${pollMetrics.requests} / min` : model.requests}</b></span><span><small>CONNECTION LIFECYCLE</small><b>{model.connections}</b></span><span><small>DELIVERY DELAY</small><b>{transport === "poll" ? pollMetrics.delay : model.delay}</b></span><span><small>DIRECTION</small><b>{model.direction}</b></span></div>
    <div className="observation"><span>{transport === "poll" ? `${pollMetrics.idle} IDLE REQUESTS / MIN` : model.label.toUpperCase()}</span><p>{model.copy} Values are illustrative, not measured benchmarks.</p><button type="button" className="quiet-button" onClick={() => setPulse((value) => value + 1)}><Rotate />REPLAY EVENTS</button></div>
  </div>;
}

const failures = {
  slow: ["NOTIFICATION WAITING", "A message arrived just after the last 10-second poll. The client cannot discover it until the next request."],
  aggressive: ["REQUEST SPIKE", "Polling every 500 ms cuts detection delay, but 10,000 clients now create about 20,000 requests each second—even when nothing changed."],
  disconnect: ["CHANNEL DISCONNECTED", "A WebSocket can reconnect, but the application must decide how to resume, replay, or detect events missed while offline."],
  direction: ["WRONG DIRECTIONAL FIT", "SSE streams server events well. Frequent client edits still need separate HTTP requests, so a full-duplex channel may fit better."],
} as const;

export function BreakRealtime() {
  const [failure, setFailure] = useState<keyof typeof failures>("slow");
  return <div className={`break-realtime break-realtime--${failure} lab-panel`}><div className="lab-toolbar"><div><span className="alert-dot" /> BREAK REALTIME <b>02</b></div><span>FAILURE LAB</span></div><div className="realtime-failure-display"><div><small>CLIENT</small><b>{failure === "disconnect" ? "OFFLINE" : "WAITING"}</b></div><span><i /><strong>{failure === "aggressive" ? "20K req/s" : failure === "slow" ? "+9.9 s" : failure === "direction" ? "POSTs still needed" : "× connection lost"}</strong></span><div><small>SERVER</small><b>{failure === "aggressive" ? "OVERLOADED" : "EVENT READY"}</b></div></div><div className="failure-buttons">{Object.entries({ slow:"SLOW POLLING", aggressive:"AGGRESSIVE POLLING", disconnect:"WEBSOCKET DISCONNECT", direction:"SSE + TWO-WAY WORK" }).map(([id,label]) => <button type="button" className={failure === id ? "active" : ""} onClick={() => setFailure(id as keyof typeof failures)} key={id}>{label}</button>)}</div><div className="observation" aria-live="polite"><span>{failures[failure][0]}</span><p>{failures[failure][1]}</p></div></div>;
}

const gameRounds = [
  { title:"Breaking-news feed", workload:"Many users receive occasional updates. Clients rarely send data.", options:["Polling every 500 ms","Server-Sent Events","WebSocket room"], answer:1, why:"SSE supplies a long-lived server-to-client stream with simpler semantics than a bidirectional socket." },
  { title:"Collaborative whiteboard", workload:"Many participants send and receive frequent cursor and canvas updates.", options:["30-second polling","Server-Sent Events only","WebSocket channel"], answer:2, why:"Frequent independent traffic in both directions is a strong fit for a persistent full-duplex WebSocket." },
  { title:"Internal dashboard", workload:"Data changes every 30 seconds and a small delay is acceptable.", options:["30-second polling","WebSocket per widget","SSE plus client heartbeat"], answer:0, why:"Simple polling is reasonable when updates are infrequent, scale is bounded, and seconds of delay are acceptable." },
  { title:"Background job status", workload:"A job emits a few updates over several minutes; the browser mostly listens.", options:["Aggressive 500 ms polling","SSE with reconnect","WebSocket with shared editing"], answer:1, why:"SSE can efficiently deliver one-way progress events and reconnect if the stream drops. Modest long polling could also be valid." },
] as const;

export function KeepChatLiveGame() {
  const [round,setRound] = useState(0); const [choice,setChoice] = useState<number|null>(null); const complete = round >= gameRounds.length; const current = gameRounds[Math.min(round,gameRounds.length - 1)]; const correct = choice === current.answer;
  const restart = () => { setRound(0); setChoice(null); };
  return <MiniGameShell title="KEEP THE CHAT LIVE" round={round} total={gameRounds.length} feedback={choice === null ? undefined : correct ? current.why : `That adds the wrong cost or directionality. ${current.why}`} feedbackTone={choice === null ? "neutral" : correct ? "success" : "error"} feedbackSuccessLabel="CHANNEL FIT ✓" feedbackErrorLabel="RETHINK THE WORKLOAD" complete={complete} completeTitle="REALTIME CHANNELS UNDERSTOOD" completeCopy="You matched direction, acceptable delay, event frequency, and connection lifecycle instead of treating WebSockets as a universal upgrade." onRestart={restart}>
    <div className="realtime-game-scenario"><small>WORKLOAD {String(round + 1).padStart(2,"0")}</small><h3>{current.title}</h3><p>{current.workload}</p><div><span>EVENT SOURCE</span><i /><b>{choice === null ? "CHOOSE A CHANNEL" : correct ? "DELIVERY FITS" : "COST / DELAY MISMATCH"}</b></div></div>
    <div className="game-choice-row">{current.options.map((option,index) => <button type="button" disabled={choice !== null} onClick={() => setChoice(index)} key={option}>{option}</button>)}</div>
    <div className="game-footer"><span />{choice !== null ? correct ? <button type="button" className="lab-button" onClick={() => { setRound((value) => value + 1); setChoice(null); }}>{round === gameRounds.length - 1 ? "FINISH" : "NEXT WORKLOAD"}<ArrowRight /></button> : <button type="button" className="lab-button" onClick={() => setChoice(null)}><Rotate />TRY AGAIN</button> : <span><SparkIcon /> Consider direction and acceptable delay.</span>}</div>
  </MiniGameShell>;
}
