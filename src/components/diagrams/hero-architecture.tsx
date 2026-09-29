"use client";

import { motion, useReducedMotion } from "motion/react";
import { DatabaseIcon, MonitorIcon, ServerIcon } from "@/components/ui/icons";

function Node({ kind, label, detail, accent = false }: { kind: "client" | "server" | "database" | "balancer"; label: string; detail: string; accent?: boolean }) {
  const Icon = kind === "client" ? MonitorIcon : kind === "database" ? DatabaseIcon : ServerIcon;
  return (
    <div className={`architecture-node ${accent ? "architecture-node--accent" : ""}`}>
      <span className="node-icon"><Icon /></span>
      <span><b>{label}</b><small>{detail}</small></span>
      <i className="status-dot" />
    </div>
  );
}

function Packet({ delay = 0, reverse = false }: { delay?: number; reverse?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={`packet ${reverse ? "packet--response" : ""}`}
      initial={reduce ? { left: reverse ? "75%" : "25%" } : { left: reverse ? "82%" : "18%", opacity: 0 }}
      animate={reduce ? undefined : { left: reverse ? ["82%", "18%"] : ["18%", "82%"], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.4, delay, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
    />
  );
}

export function HeroArchitecture() {
  return (
    <div className="hero-architecture" aria-label="Animated preview of a client request flowing through a growing architecture">
      <div className="terminal-bar"><span /><span /><span /><code>topology.live</code><em>● NOMINAL</em></div>
      <div className="architecture-canvas">
        <div className="canvas-grid" />
        <div className="architecture-row architecture-row--main">
          <Node kind="client" label="CLIENT" detail="request origin" />
          <div className="node-line"><span>GET /data</span><Packet /><Packet reverse delay={1.35} /></div>
          <Node kind="balancer" label="ROUTER" detail="traffic control" accent />
        </div>
        <div className="fanout-line" aria-hidden="true"><i /><i /><i /></div>
        <div className="server-cluster">
          <Node kind="server" label="API–01" detail="12% load" />
          <Node kind="server" label="API–02" detail="18% load" />
          <Node kind="server" label="API–03" detail="09% load" />
        </div>
        <div className="storage-flow">
          <span className="vertical-flow" />
          <Node kind="database" label="DATABASE" detail="source of truth" />
        </div>
        <div className="telemetry-strip">
          <span><small>REQUESTS</small><b>1,248/s</b></span>
          <span><small>P95 LATENCY</small><b>42 ms</b></span>
          <span><small>SUCCESS</small><b>99.98%</b></span>
        </div>
      </div>
    </div>
  );
}
