"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ServerIcon } from "@/components/ui/icons";

type Failure = "healthy" | "offline" | "slow" | "spike";
const modes: { id: Failure; label: string }[] = [
  { id: "offline", label: "Server offline" },
  { id: "slow", label: "Slow server" },
  { id: "spike", label: "Traffic spike" },
];

export function TrafficLab() {
  const [clients, setClients] = useState(24);
  const [failure, setFailure] = useState<Failure>("healthy");
  const reduce = useReducedMotion();
  const effectiveClients = failure === "spike" ? 100 : clients;
  const load = failure === "offline" ? 0 : Math.min(100, Math.round(effectiveClients * 0.92));
  const latency = failure === "offline" ? null : failure === "slow" ? 920 : 24 + Math.round(Math.pow(effectiveClients / 10, 1.65));
  const packetCount = Math.max(2, Math.ceil(effectiveClients / 13));

  return (
    <div className={`traffic-lab lab-panel traffic-lab--${failure}`}>
      <div className="lab-toolbar"><div><span className={failure === "healthy" ? "live-dot" : "alert-dot"} /> BREAK THE SYSTEM <b>02</b></div><span>EDUCATIONAL MODEL</span></div>
      <div className="traffic-controls">
        <label htmlFor="client-count"><span>CONNECTED CLIENTS</span><strong>{effectiveClients}</strong></label>
        <input id="client-count" type="range" min="1" max="100" value={effectiveClients} disabled={failure === "spike"} onChange={(event) => { setClients(Number(event.target.value)); if (failure !== "healthy") setFailure("healthy"); }} style={{ "--range": `${effectiveClients}%` } as React.CSSProperties} />
        <div className="range-labels"><span>1</span><span>100</span></div>
      </div>
      <div className="traffic-stage">
        <div className="client-cloud" aria-label={`${effectiveClients} simulated clients`}>
          {Array.from({ length: 9 }).map((_, index) => <i key={index} style={{ opacity: Math.max(0.18, Math.min(1, effectiveClients / ((index + 1) * 10))) }} />)}
          <span>CLIENT<br />SWARM</span>
        </div>
        <div className="traffic-lane">
          {Array.from({ length: packetCount }).map((_, index) => (
            <motion.i key={`${failure}-${index}`} className={failure === "offline" ? "failed-packet" : "traffic-packet"} initial={reduce ? false : { left: "0%", opacity: 0 }} animate={reduce ? undefined : { left: failure === "offline" ? "48%" : "95%", opacity: [0, 1, 1, failure === "offline" ? 1 : 0] }} transition={{ duration: failure === "slow" ? 3.6 : 1.5, delay: index * (1.2 / packetCount), repeat: Infinity, ease: "linear" }} />
          ))}
          {failure === "offline" ? <span className="connection-x">×</span> : null}
        </div>
        <div className="server-gauge">
          <div className="gauge-ring" style={{ "--load": `${load * 3.6}deg` } as React.CSSProperties}><span><ServerIcon /></span></div>
          <b>{failure === "offline" ? "OFFLINE" : `${load}% LOAD`}</b><small>SINGLE SERVER</small>
        </div>
      </div>
      <div className="metric-row">
        <div><small>THROUGHPUT</small><b>{failure === "offline" ? "0" : Math.round(effectiveClients * 4.7)} <em>req/s</em></b></div>
        <div><small>EST. LATENCY</small><b>{latency === null ? "—" : latency} <em>{latency === null ? "" : "ms"}</em></b></div>
        <div><small>RESPONSE</small><b className={failure === "offline" ? "metric-error" : ""}>{failure === "offline" ? "503" : failure === "slow" ? "DELAYED" : "200"}</b></div>
      </div>
      <div className="failure-buttons">
        {modes.map((mode) => <button type="button" className={failure === mode.id ? "active" : ""} key={mode.id} onClick={() => setFailure(failure === mode.id ? "healthy" : mode.id)}>{mode.label}</button>)}
      </div>
      <div className="observation" aria-live="polite">
        <span>OBSERVATION</span>
        <p>{failure === "offline" ? "Every request depends on one machine. When it disappears, the whole path fails: a single point of failure." : failure === "slow" ? "Work queues behind a slow dependency. Even healthy clients experience rising response times." : failure === "spike" ? "Arrival rate is outpacing one server’s capacity. Latency rises before the system fully fails." : "As more clients compete for one server, utilization and latency climb. Change the load—or break the server."}</p>
      </div>
    </div>
  );
}
