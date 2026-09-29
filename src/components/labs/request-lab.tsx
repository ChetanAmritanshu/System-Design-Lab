"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MonitorIcon, Play, Rotate, ServerIcon } from "@/components/ui/icons";

type Phase = "idle" | "request" | "processing" | "response" | "complete";
const deterministicLatency = [38, 52, 44, 61, 47];

export function RequestLab() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function send() {
    timers.current.forEach(clearTimeout);
    setPhase("request");
    timers.current = [
      setTimeout(() => setPhase("processing"), reduce ? 100 : 850),
      setTimeout(() => setPhase("response"), reduce ? 200 : 1650),
      setTimeout(() => { setPhase("complete"); setRun((value) => value + 1); }, reduce ? 300 : 2500),
    ];
  }

  const status = phase === "idle" ? "READY" : phase === "request" ? "IN TRANSIT" : phase === "processing" ? "PROCESSING" : phase === "response" ? "RETURNING" : "200 OK";
  return (
    <div className="request-lab lab-panel">
      <div className="lab-toolbar"><div><span className="live-dot" /> INTERACTIVE LAB <b>01</b></div><span>DETERMINISTIC SIMULATION</span></div>
      <div className="request-stage">
        <div className="endpoint endpoint--client">
          <span className="endpoint-icon"><MonitorIcon /></span><small>CLIENT</small><b>Browser</b><code>192.168.1.24</code>
        </div>
        <div className="request-lane">
          <div className="lane-label lane-label--top"><code>GET /hello</code><span>REQUEST</span></div>
          <div className="lane-track lane-track--request">
            {(phase === "request" || phase === "processing") && <motion.i className="lab-packet lab-packet--request" initial={{ left: "0%" }} animate={{ left: "94%" }} transition={{ duration: reduce ? 0 : 0.85, ease: "easeInOut" }} />}
          </div>
          <div className="lane-track lane-track--response">
            {(phase === "response" || phase === "complete") && <motion.i className="lab-packet lab-packet--response" initial={{ left: "94%" }} animate={{ left: "0%" }} transition={{ duration: reduce ? 0 : 0.85, ease: "easeInOut" }} />}
          </div>
          <div className="lane-label lane-label--bottom"><span>RESPONSE</span><code>200 OK</code></div>
        </div>
        <div className={`endpoint endpoint--server ${phase === "processing" ? "endpoint--processing" : ""}`}>
          <span className="endpoint-icon"><ServerIcon /></span><small>SERVER</small><b>API Server</b><code>system.design</code>
        </div>
      </div>
      <div className="lab-console">
        <div className="console-status"><small>SERVER STATE</small><strong><span />{status}</strong></div>
        <div className="console-output">
          <AnimatePresence mode="wait">
            {phase === "complete" ? (
              <motion.div key={run} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><code><b>200 OK</b>{`\n`}{`{\n  "message": "Hello, world"\n}`}</code><span>Round trip <strong>{deterministicLatency[run % deterministicLatency.length]} ms</strong></span></motion.div>
            ) : <p key="empty">{"// Response payload will appear here"}</p>}
          </AnimatePresence>
        </div>
        <button className="lab-button" type="button" onClick={send} disabled={["request", "processing", "response"].includes(phase)}>
          {phase === "complete" ? <Rotate /> : <Play />}{phase === "complete" ? "SEND AGAIN" : phase === "idle" ? "SEND REQUEST" : "REQUEST RUNNING"}
        </button>
      </div>
    </div>
  );
}
