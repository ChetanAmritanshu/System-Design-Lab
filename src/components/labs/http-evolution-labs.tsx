"use client";

import { useState } from "react";
import { ArrowRight, MonitorIcon, Rotate, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";
import { httpEvolutionLesson } from "@/content/http-evolution";

type Protocol = "h1" | "h2" | "h3";

const protocolModels = {
  h1: { label: "HTTP/1.1", connections: "4 reusable TCP", streams: "1 active response per connection", roundTrips: "3 setup waves", time: "1.84 s", copy: "Several persistent connections create practical parallelism, but each connection pays setup and sequences its own responses." },
  h2: { label: "HTTP/2", connections: "1 TCP", streams: "6 logical streams", roundTrips: "1 setup sequence", time: "1.18 s", copy: "Frames from many streams interleave on one connection. This removes HTTP-level sequencing between these resources." },
  h3: { label: "HTTP/3", connections: "1 QUIC", streams: "6 transport streams", roundTrips: "Integrated setup", time: "0.96 s", copy: "QUIC combines transport and cryptographic setup and keeps stream recovery independent. This is illustrative, not a benchmark." },
} as const;

export function ProtocolLoadLab() {
  const [protocol, setProtocol] = useState<Protocol>("h1");
  const [run, setRun] = useState(0);
  const model = protocolModels[protocol];
  return (
    <div className={`protocol-load lab-panel protocol-load--${protocol}`}>
      <div className="lab-toolbar"><div><span className="live-dot" /> PROTOCOL LOAD LAB <b>01</b></div><span>ILLUSTRATIVE TIMING</span></div>
      <div className="protocol-tabs" role="tablist" aria-label="Choose an HTTP protocol">{(Object.entries(protocolModels) as [Protocol, typeof protocolModels[Protocol]][]).map(([id,item]) => <button type="button" role="tab" aria-selected={protocol === id} key={id} onClick={() => { setProtocol(id); setRun((value) => value + 1); }}>{item.label}</button>)}</div>
      <div className="load-stage" key={`${protocol}-${run}`} aria-live="polite">
        <div className="load-peer"><ServerIcon /><b>SERVER</b><small>6 resources</small></div>
        <div className="load-lanes" style={{ "--lane-count": protocol === "h1" ? 4 : 1 } as React.CSSProperties}>
          {httpEvolutionLesson.assets.map(([name,size,id],index) => <div className={`resource-flight resource-flight--${id}`} style={{ "--asset-index": index, "--asset-duration": `${0.75 + index * 0.08}s` } as React.CSSProperties} key={id}><span>{name}</span><i /><small>{size}</small></div>)}
        </div>
        <div className="load-peer"><MonitorIcon /><b>BROWSER</b><small>page assembled</small></div>
      </div>
      <div className="load-metrics"><span><small>CONNECTIONS</small><b>{model.connections}</b></span><span><small>STREAM MODEL</small><b>{model.streams}</b></span><span><small>ROUND TRIPS</small><b>{model.roundTrips}</b></span><span><small>SIMULATED COMPLETE</small><b>{model.time}</b></span></div>
      <div className="observation"><span>WHAT CHANGED</span><p>{model.copy} Timings are deterministic teaching values.</p><button type="button" className="quiet-button" onClick={() => setRun((value) => value + 1)}><Rotate />REPLAY LOAD</button></div>
    </div>
  );
}

export function HttpOnePressureLab() {
  const [mode, setMode] = useState<"normal" | "latency" | "large">("normal");
  const detail = {
    normal: ["REUSABLE CONNECTIONS", "Four warm TCP connections share six assets. Keep-alive avoids reconnecting for every request."],
    latency: ["SETUP COST MULTIPLIES", "With high round-trip time, opening several TCP + TLS connections makes each setup penalty more visible."],
    large: ["ONE LANE STAYS BUSY", "The large hero occupies one connection while smaller assets assigned behind that lane wait; other connections can still progress."],
  }[mode];
  return (
    <div className={`h1-pressure lab-panel h1-pressure--${mode}`}>
      <div className="lab-toolbar"><div><span className={mode === "normal" ? "live-dot" : "alert-dot"} /> BREAK HTTP/1.1 <b>02</b></div><span>MULTIPLE CONNECTIONS</span></div>
      <div className="connection-rack">{[0,1,2,3].map((lane) => <div className="connection-lane" key={lane}><small>TCP {lane + 1}</small><span>{lane === 0 ? "HTML" : lane === 1 ? "CSS" : lane === 2 ? "JS" : "HERO"}</span><i />{lane === 3 && mode === "large" ? <b>700 KB · BUSY</b> : <b>KEEP-ALIVE</b>}</div>)}</div>
      <div className="failure-buttons"><button type="button" className={mode === "latency" ? "active" : ""} onClick={() => setMode(mode === "latency" ? "normal" : "latency")}>SIMULATE HIGH LATENCY</button><button type="button" className={mode === "large" ? "active" : ""} onClick={() => setMode(mode === "large" ? "normal" : "large")}>SIMULATE LARGE ASSET</button></div>
      <div className="observation" aria-live="polite"><span>{detail[0]}</span><p>{detail[1]} HTTP pipelining existed, but ordering constraints and weak deployment support made it rare in practice.</p></div>
    </div>
  );
}

export function MultiplexingVisualizer() {
  const [multiplexed, setMultiplexed] = useState(true);
  const sequence = multiplexed ? ["A","B","C","A","B","C","A","C","B"] : ["A","A","A","A","B","B","B","C","C"];
  return (
    <div className={`multiplex-lab lab-panel ${multiplexed ? "multiplex-lab--on" : ""}`}>
      <div className="lab-toolbar"><div><span className="live-dot" /> MULTIPLEXING VISUALIZER <b>03</b></div><span>{multiplexed ? "HTTP/2" : "HTTP/1.1 LANE"}</span></div>
      <div className="frame-sequence" aria-label={multiplexed ? "Frames from streams A, B and C interleaved" : "Responses A, B and C sequenced"}>{sequence.map((frame,index) => <span className={`frame frame--${frame.toLowerCase()}`} key={`${frame}-${index}`}>{frame}<small>{index + 1}</small></span>)}</div>
      <div className="multiplex-copy"><span><b>{multiplexed ? "A B C A B C …" : "A A A A · B B B · C C"}</b><small>{multiplexed ? "Binary frames from independent HTTP streams share one TCP connection." : "One response occupies this illustrative lane before the next advances."}</small></span><button type="button" className="lab-button" onClick={() => setMultiplexed((value) => !value)}><SparkIcon />SHOW {multiplexed ? "SEQUENCING" : "MULTIPLEXING"}</button></div>
    </div>
  );
}

function StreamRows({ mode, lost }: { mode: "tcp" | "quic"; lost: boolean }) {
  return <div className="stream-rows">{["A","B","C"].map((stream,index) => { const waiting = lost && (mode === "tcp" || stream === "B"); return <div className={`stream-row stream-row--${stream.toLowerCase()} ${waiting ? "stream-row--waiting" : lost ? "stream-row--moving" : ""}`} key={stream}><span>STREAM {stream}</span><i><b style={{ width: `${[88,72,80][index]}%` }} /></i><em>{waiting ? stream === "B" ? "RETRANSMIT" : "WAITING" : lost ? "CONTINUES" : "FLOWING"}</em>{stream === "B" && lost ? <strong>× LOST</strong> : null}</div>; })}</div>;
}

export function TcpHolDemo() {
  const [lost, setLost] = useState(false);
  return (
    <div className={`packet-loss lab-panel ${lost ? "packet-loss--active" : ""}`}>
      <div className="lab-toolbar"><div><span className={lost ? "alert-dot" : "live-dot"} /> TCP HEAD-OF-LINE <b>04</b></div><span>HTTP/2 OVER ONE TCP STREAM</span></div>
      <StreamRows mode="tcp" lost={lost} />
      <div className="loss-control"><span><small>UNDERLYING TRANSPORT</small><b>ONE ORDERED TCP BYTE STREAM</b></span><button type="button" className="lab-button" onClick={() => setLost((value) => !value)}>{lost ? <Rotate /> : <SparkIcon />}{lost ? "RESET PACKET" : "DROP PACKET"}</button></div>
      <div className="observation" aria-live="polite"><span>{lost ? "ALL STREAMS WAIT" : "DELIVERY IN ORDER"}</span><p>{lost ? "HTTP/2 streams are independent at the HTTP layer, but TCP cannot expose later bytes until the missing segment is recovered." : "Multiplexing prevents one HTTP response from monopolizing the application layer. Now introduce transport loss."}</p></div>
    </div>
  );
}

export function QuicLab() {
  const [lost, setLost] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <div className={`quic-lab lab-panel ${lost ? "quic-lab--loss" : ""}`}>
      <div className="lab-toolbar"><div><span className="live-dot" /> QUIC STREAM LAB <b>05</b></div><span>HTTP/3</span></div>
      <StreamRows mode="quic" lost={lost} />
      <div className="quic-controls"><button type="button" className="lab-button" onClick={() => setLost((value) => !value)}>{lost ? <Rotate /> : <SparkIcon />}{lost ? "RESET STREAMS" : "DROP PACKET ON STREAM B"}</button><button type="button" className="quiet-button" onClick={() => setMobile((value) => !value)}><Rotate />{mobile ? "RETURN TO WI-FI" : "SWITCH TO MOBILE DATA"}</button></div>
      <div className="migration-stage"><div><MonitorIcon /><small>PHONE</small><b>{mobile ? "5G" : "WI-FI"}</b></div><span><i /><code>CONNECTION ID · 8F2A</code></span><div><ServerIcon /><small>SERVER</small><b>SAME QUIC CONNECTION</b></div></div>
      <div className="observation" aria-live="polite"><span>{lost ? "STREAM B RECOVERS" : mobile ? "PATH CHANGED" : "INDEPENDENT STREAMS"}</span><p>{lost ? "A and C continue while B retransmits its missing data. Shared congestion control may still reduce overall sending rate." : mobile ? "The IP path changed, but a QUIC connection ID lets the endpoints associate packets with the existing connection." : "QUIC supplies reliability, congestion control, TLS 1.3 security, and stream semantics in user space above UDP."}</p></div>
    </div>
  );
}

export function ProtocolComparison() {
  const [active, setActive] = useState(0);
  return (
    <div className="evolution-comparison lab-panel">
      <div className="lab-toolbar"><div><span className="live-dot" /> PROTOCOL COMPARISON <b>06</b></div><span>DESCRIPTIVE, NOT A SCORECARD</span></div>
      <div className="comparison-tabs" role="tablist" aria-label="Protocol comparison columns">{["HTTP/1.1","HTTP/2","HTTP/3"].map((item,index) => <button type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)} key={item}>{item}</button>)}</div>
      <div className="comparison-list">{httpEvolutionLesson.comparison.map((row) => <div key={row[0]}><small>{row[0]}</small><b>{row[active + 1]}</b></div>)}</div>
      <div className="setup-comparison"><div><span>TCP + TLS</span><b>TCP handshake</b><ArrowRight /><b>TLS handshake</b><ArrowRight /><b>HTTP</b></div><div><span>QUIC</span><b>Transport + TLS 1.3 setup</b><ArrowRight /><b>HTTP/3</b></div><p>QUIC can reduce setup work, especially on a resumed connection. It does not promise zero-round-trip startup for every request; 0-RTT has replay constraints and is only appropriate for safe operations.</p></div>
    </div>
  );
}

const gameRounds = [
  { title: "Many small files", condition: "Moderate latency · Low loss · 18 resources", options: ["HTTP/1.1 parallel connections","HTTP/2 multiplexing","One new connection per file"], answer: 1, outcome: "A B C A B C", why: "HTTP/2 multiplexing lets many resource streams share one established connection efficiently." },
  { title: "Packet loss", condition: "Moderate latency · Elevated loss · Several active streams", options: ["HTTP/2 over TCP","HTTP/3 over QUIC","HTTP/1.1 pipelining"], answer: 1, outcome: "A →  B ×  C →", why: "QUIC isolates stream delivery: B recovers while A and C can continue. The connection still shares congestion control." },
  { title: "Mobile network switch", condition: "Wi-Fi → cellular during a page load", options: ["Restart TCP connections","Use QUIC connection migration","Disable encryption"], answer: 1, outcome: "WI-FI ⇢ 8F2A ⇢ 5G", why: "A QUIC connection ID can preserve the logical connection across a client path change." },
  { title: "Legacy environment", condition: "HTTP/1.1 only · HTTPS supported · Large page", options: ["Primary cost: several setups and per-lane sequencing","HTTP/1.1 cannot be encrypted","HTTP/1.1 has no caching"], answer: 0, outcome: "TCP 1 · TCP 2 · TCP 3", why: "HTTP/1.1 can use HTTPS and caching. Its practical pressure here is managing several connections and sequencing within each lane." },
] as const;

export function DeliverPageGame() {
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const complete = round >= gameRounds.length;
  const current = gameRounds[Math.min(round, gameRounds.length - 1)];
  const correct = choice === current.answer;
  const restart = () => { setRound(0); setChoice(null); };
  return (
    <MiniGameShell title="DELIVER THE PAGE" round={round} total={gameRounds.length} feedback={choice === null ? undefined : correct ? current.why : `That choice misses the pressure in this round. ${current.why}`} feedbackTone={choice === null ? "neutral" : correct ? "success" : "error"} feedbackSuccessLabel="PAGE DELIVERED ✓" feedbackErrorLabel="RETHINK THE NETWORK" complete={complete} completeTitle="PROTOCOL EVOLUTION UNDERSTOOD" completeCopy="You can choose protocol behavior from workload, loss, path changes, and compatibility—not simply pick the newest label." onRestart={restart}>
      <div className="delivery-scenario"><small>NETWORK SCENARIO {String(round + 1).padStart(2,"0")}</small><h3>{current.title}</h3><p>{current.condition}</p><div className={choice === null ? "delivery-outcome" : correct ? "delivery-outcome delivery-outcome--success" : "delivery-outcome delivery-outcome--error"}><span>{current.outcome}</span><i /><b>{choice === null ? "CHOOSE A BEHAVIOR" : correct ? "EFFICIENT OUTCOME" : "PRESSURE REMAINS"}</b></div></div>
      <div className="delivery-options">{current.options.map((option,index) => <button type="button" disabled={choice !== null} onClick={() => setChoice(index)} key={option}>{option}</button>)}</div>
      <div className="game-footer"><span />{choice !== null ? correct ? <button type="button" className="lab-button" onClick={() => { setRound((value) => value + 1); setChoice(null); }}>{round === gameRounds.length - 1 ? "FINISH" : "NEXT NETWORK"}<ArrowRight /></button> : <button type="button" className="lab-button" onClick={() => setChoice(null)}><Rotate />TRY AGAIN</button> : null}</div>
    </MiniGameShell>
  );
}
