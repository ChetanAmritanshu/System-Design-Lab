"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Rotate, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";

type Algorithm = "round" | "least" | "weighted";
type ServerState = { name: string; load: number; requests: number; healthy: boolean; weight: number };
const initialServers: ServerState[] = [
  { name:"A", load:18, requests:2, healthy:true, weight:1 },
  { name:"B", load:34, requests:4, healthy:true, weight:2 },
  { name:"C", load:12, requests:1, healthy:true, weight:4 },
];

export function LoadBalancerLab() {
  const [algorithm,setAlgorithm] = useState<Algorithm>("round");
  const [servers,setServers] = useState(initialServers);
  const [cursor,setCursor] = useState(0);
  const [last,setLast] = useState<string>("—");
  const route = () => {
    const healthy = servers.map((server,index) => ({server,index})).filter(({server}) => server.healthy);
    if (!healthy.length) return;
    let target = healthy[0];
    if (algorithm === "round") target = healthy[cursor % healthy.length];
    if (algorithm === "least") target = healthy.reduce((best,item) => item.server.load < best.server.load ? item : best);
    if (algorithm === "weighted") { const expanded = healthy.flatMap((item) => Array(item.server.weight).fill(item)); target = expanded[cursor % expanded.length]; }
    setServers((value) => value.map((server,index) => index === target.index ? { ...server, load:Math.min(100,server.load + (index === 1 ? 18 : 10)), requests:server.requests + 1 } : { ...server, load:Math.max(5,server.load - 3) }));
    setCursor((value) => value + 1); setLast(target.server.name);
  };
  const reset = () => { setServers(initialServers); setCursor(0); setLast("—"); };
  return <div className="lb-lab lab-panel"><div className="lab-toolbar"><div><span className="live-dot" /> FLEET DISTRIBUTION LAB <b>01</b></div><span>LAST ROUTE · SERVER {last}</span></div>
    <div className="lb-tabs" role="tablist" aria-label="Load balancing algorithm">{(["round","least","weighted"] as Algorithm[]).map((id) => <button type="button" role="tab" aria-selected={algorithm === id} key={id} onClick={() => { setAlgorithm(id); reset(); }}>{id === "round" ? "ROUND ROBIN" : id === "least" ? "LEAST CONNECTIONS" : "WEIGHTED 1:2:4"}</button>)}</div>
    <div className="lb-topology"><div className="lb-clients"><small>CLIENT WAVE</small><b>{cursor + 1}</b><span>REQUESTS</span></div><div className="lb-router"><SparkIcon /><small>LOAD BALANCER</small><b>{algorithm === "round" ? "NEXT IN ROTATION" : algorithm === "least" ? "LOWEST ACTIVE LOAD" : "CAPACITY WEIGHTS"}</b><i /></div><div className="server-fleet">{servers.map((server) => <div className={!server.healthy ? "server-card server-card--down" : server.load > 75 ? "server-card server-card--hot" : "server-card"} key={server.name}><ServerIcon /><small>SERVER {server.name}</small><b>{server.healthy ? `${server.load}% LOAD` : "UNHEALTHY"}</b><i><span style={{ width:`${server.healthy ? server.load : 100}%` }} /></i><em>{server.requests} requests · weight {server.weight}</em></div>)}</div></div>
    <div className="lb-controls"><button type="button" className="lab-button" onClick={route}><ArrowRight />ROUTE REQUEST</button><button type="button" className="quiet-button" onClick={reset}><Rotate />RESET WAVE</button></div>
    <div className="observation"><span>{algorithm === "round" ? "EVEN ROTATION" : algorithm === "least" ? "LOAD-AWARE" : "CAPACITY-AWARE"}</span><p>{algorithm === "round" ? "Round robin ignores request duration: a slow server stays in rotation." : algorithm === "least" ? "Least connections prefers the least-busy healthy instance, which helps when request durations differ." : "Weighted distribution sends proportionally more work to stronger instances. Weights still require monitoring and tuning."}</p></div>
  </div>;
}

export function HealthAndSessionLab() {
  const [down,setDown] = useState(false); const [removed,setRemoved] = useState(false); const [session,setSession] = useState<"local"|"sticky"|"shared">("local");
  const kill = () => { if (!down) { setDown(true); setRemoved(false); window.setTimeout(() => setRemoved(true), 700); } else { setDown(false); setRemoved(false); } };
  return <div className="health-lab lab-panel"><div className="lab-toolbar"><div><span className={down ? "alert-dot" : "live-dot"} /> HEALTH + STATE LAB <b>02</b></div><span>{down ? removed ? "REMOVED FROM POOL" : "HEALTH CHECK PENDING" : "3 / 3 HEALTHY"}</span></div><div className="health-stage"><div><small>LOAD BALANCER</small><b>{removed ? "ROUTING A + C" : "ROUTING A + B + C"}</b></div>{["A","B","C"].map((name) => <span className={name === "B" && down ? "down" : ""} key={name}><ServerIcon /><b>SERVER {name}</b><small>{name === "B" && down ? removed ? "OUT OF ROTATION" : "CHECK FAILING…" : "HEALTHY"}</small></span>)}</div><div className="health-actions"><button type="button" className="lab-button" onClick={kill}>{down ? <Rotate /> : <SparkIcon />}{down ? "RECOVER SERVER B" : "KILL SERVER B"}</button><p>Health checks stop new traffic after failure is detected. Existing in-flight work may still fail.</p></div><div className="session-problem"><div><small>LOGIN</small><b>USER 42 → SERVER A</b></div><ArrowRight /><div><small>NEXT REQUEST</small><b>USER 42 → SERVER C</b></div><p>{session === "local" ? "Session stored only on A: C cannot find it." : session === "sticky" ? "Affinity keeps this client on A, but A can fail or become hot." : "A shared session store or stateless token lets any instance serve the request."}</p></div><div className="session-tabs" role="tablist" aria-label="Session strategy">{(["local","sticky","shared"] as const).map((id) => <button type="button" role="tab" aria-selected={session === id} onClick={() => setSession(id)} key={id}>{id === "local" ? "LOCAL SESSION" : id === "sticky" ? "STICKY SESSION" : "SHARED / STATELESS"}</button>)}</div></div>;
}

const rounds = [
  { title:"Equal fleet", signal:"Three equal, healthy servers. Similar request duration.", options:["Round Robin","Least Connections","IP Hash only"], answer:0, why:"Round robin is a simple fit when capacity and request cost are similar." },
  { title:"One slow server", signal:"Server B keeps long-running requests open.", options:["Round Robin","Least Connections","Double B's weight"], answer:1, why:"Least connections sees B remain busy and sends new work toward freer instances." },
  { title:"Unequal hardware", signal:"A has 4 CPU, B has 8 CPU, C has 16 CPU.", options:["Equal rotation","Weighted 1:2:4","Sticky sessions"], answer:1, why:"Weights express the different capacities so C receives a larger share." },
  { title:"Server B dies", signal:"Connections to B fail while traffic continues.", options:["Keep rotating","Health checks remove B","Store sessions on B"], answer:1, why:"Health checks remove an unhealthy target from new routing; capacity and redundancy absorb the remaining work." },
  { title:"Login state disappears", signal:"Login lands on A; the next request lands on C.", options:["More round robin","Local sessions only","Shared state or stateless servers"], answer:2, why:"Shared session state or stateless application servers avoid coupling identity to one instance." },
] as const;

export function KeepFleetAliveGame() {
  const [round,setRound]=useState(0); const [choice,setChoice]=useState<number|null>(null); const complete=round>=rounds.length; const current=rounds[Math.min(round,rounds.length-1)]; const correct=choice===current.answer; const bars=useMemo(() => round===1 ? [38,92,35] : round===2 ? [18,42,78] : [55,55,55],[round]);
  return <MiniGameShell title="KEEP THE FLEET ALIVE" round={round} total={rounds.length} feedback={choice===null?undefined:correct?current.why:`That decision leaves the fleet exposed. ${current.why}`} feedbackTone={choice===null?"neutral":correct?"success":"error"} feedbackSuccessLabel="FLEET STABLE ✓" feedbackErrorLabel="PRESSURE REMAINS" complete={complete} completeTitle="TRAFFIC DISTRIBUTION UNDERSTOOD" completeCopy="You selected algorithms, health checks, and state strategies from workload evidence rather than one default rule." onRestart={() => {setRound(0);setChoice(null);}}><div className="fleet-game-scenario"><small>TRAFFIC WAVE {String(round+1).padStart(2,"0")}</small><h3>{current.title}</h3><p>{current.signal}</p><div>{bars.map((bar,index)=><span key={index}><b>SERVER {String.fromCharCode(65+index)}</b><i><em style={{width:`${bar}%`}} /></i><small>{bar}%</small></span>)}</div></div><div className="game-choice-row">{current.options.map((option,index)=><button type="button" disabled={choice!==null} onClick={()=>setChoice(index)} key={option}>{option}</button>)}</div><div className="game-footer"><span />{choice!==null?correct?<button type="button" className="lab-button" onClick={()=>{setRound((value)=>value+1);setChoice(null);}}>{round===rounds.length-1?"FINISH":"NEXT WAVE"}<ArrowRight /></button>:<button type="button" className="lab-button" onClick={()=>setChoice(null)}><Rotate />TRY AGAIN</button>:null}</div></MiniGameShell>;
}
