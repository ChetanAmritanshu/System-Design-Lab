"use client";

import { useState } from "react";
import { ArrowRight, Rotate, ServerIcon, SparkIcon } from "@/components/ui/icons";
import { MiniGameShell } from "@/components/ui/mini-game-shell";

export function ProxyPerspective() {
  const [mode,setMode] = useState<"forward"|"reverse">("reverse");
  return <div className="proxy-lab lab-panel"><div className="lab-toolbar"><div><span className="live-dot" /> PROXY PERSPECTIVE <b>01</b></div><span>WHO DOES THE PROXY REPRESENT?</span></div><div className="proxy-tabs" role="tablist" aria-label="Proxy perspective"><button type="button" role="tab" aria-selected={mode === "forward"} onClick={()=>setMode("forward")}>FORWARD PROXY</button><button type="button" role="tab" aria-selected={mode === "reverse"} onClick={()=>setMode("reverse")}>REVERSE PROXY</button></div><div className="proxy-stage"><div><small>{mode === "forward" ? "PRIVATE CLIENTS" : "INTERNET CLIENTS"}</small><b>{mode === "forward" ? "A · B · C" : "WEB · MOBILE · BOT"}</b></div><ArrowRight /><div className="proxy-core"><SparkIcon /><small>{mode.toUpperCase()} PROXY</small><b>{mode === "forward" ? "ACTS FOR CLIENTS" : "ACTS FOR SERVERS"}</b></div><ArrowRight /><div><small>{mode === "forward" ? "PUBLIC INTERNET" : "HIDDEN ORIGINS"}</small><b>{mode === "forward" ? "DESTINATIONS" : "APP · STATIC · API"}</b></div></div><div className="observation"><span>{mode === "forward" ? "CLIENT-SIDE INTERMEDIARY" : "SERVER-SIDE INTERMEDIARY"}</span><p>{mode === "forward" ? "Destinations see the proxy as the source; organizations may use it to control client egress." : "Clients see one public entry point while the proxy selects and protects internal origins. It may terminate TLS, route, compress, cache, or serve static content depending on configuration."}</p></div></div>;
}

type Failure = "valid"|"token"|"limit"|"route"|"backend";
const stages = ["TLS","AUTHENTICATE","RATE LIMIT","ROUTE","PAYMENTS"] as const;
const failureStop: Record<Failure,number> = { valid:5, token:1, limit:2, route:3, backend:4 };
const failureCopy: Record<Failure,[string,string]> = {
  valid:["200 · FORWARDED","Every checkpoint passed and the request reached the payments service."],
  token:["401 · STOPPED AT AUTH","An invalid token is rejected before internal routing. Authentication answers who the caller is; authorization rules may further limit what it can do."],
  limit:["429 · STOPPED AT RATE LIMIT","The caller exceeded its allowed request budget, so the gateway protects downstream capacity."],
  route:["404 · UNKNOWN ROUTE","No configured service owns this path. The gateway stops instead of guessing an internal destination."],
  backend:["503 · BACKEND UNAVAILABLE","The route is valid, but the service is unavailable. The gateway returns a bounded failure rather than forwarding forever."],
};

export function GatewayPipelineLab() {
  const [failure,setFailure] = useState<Failure>("valid"); const stop = failureStop[failure];
  return <div className={`gateway-pipeline gateway-pipeline--${failure} lab-panel`}><div className="lab-toolbar"><div><span className={failure === "valid" ? "live-dot" : "alert-dot"} /> GATEWAY PIPELINE <b>02</b></div><span>POST /payments</span></div><div className="request-envelope"><code>POST /payments</code><span>Authorization: Bearer {failure === "token" ? "invalid" : "••••••valid"}</span></div><div className="pipeline-stages">{stages.map((stage,index)=><div className={index < stop ? "passed" : index === stop ? "stopped" : "pending"} key={stage}><span>{String(index+1).padStart(2,"0")}</span><b>{stage}</b><i>{index < stop ? "✓" : index === stop ? "×" : "·"}</i></div>)}</div><div className="pipeline-controls" role="group" aria-label="Request condition">{(["valid","token","limit","route","backend"] as Failure[]).map((id)=><button type="button" className={failure===id?"active":""} onClick={()=>setFailure(id)} key={id}>{id === "valid" ? "VALID REQUEST" : id === "token" ? "INVALID TOKEN" : id === "limit" ? "RATE LIMIT" : id === "route" ? "UNKNOWN ROUTE" : "BACKEND DOWN"}</button>)}</div><div className="observation" aria-live="polite"><span>{failureCopy[failure][0]}</span><p>{failureCopy[failure][1]}</p></div></div>;
}

const roles = [
  { title:"Load balancer", question:"Which healthy instance receives this request?", detail:"Distributes work across equivalent or compatible targets using health and an algorithm." },
  { title:"Reverse proxy", question:"How is inbound traffic forwarded before origins?", detail:"Represents servers and can centralize TLS, routing, compression, caching, or static delivery." },
  { title:"API gateway", question:"How is API traffic governed across services?", detail:"Applies API-aware policies such as authentication, rate limits, routing, aggregation, and telemetry." },
] as const;

export function EdgeRoleComparison() {
  const [active,setActive]=useState(0); return <div className="edge-role lab-panel"><div className="lab-toolbar"><div><span className="live-dot" /> EDGE ROLE COMPARISON <b>03</b></div><span>OVERLAP IS NORMAL</span></div><div className="edge-role-tabs" role="tablist">{roles.map((role,index)=><button type="button" role="tab" aria-selected={active===index} onClick={()=>setActive(index)} key={role.title}>{role.title}</button>)}</div><div className="edge-role-stage"><ServerIcon /><span><small>PRIMARY QUESTION</small><h3>{roles[active].question}</h3><p>{roles[active].detail}</p></span></div><p className="role-caveat">These are architectural responsibilities, not mutually exclusive product boxes. One deployed proxy or cloud service may perform more than one role.</p></div>;
}

const requests = [
  { title:"GET /users", detail:"Valid token · within limit", options:["Authenticate → limit → route","Reject immediately","Send to static origin"], answer:0, why:"The valid API request passes policy checks, then routes to the users service." },
  { title:"POST /payments", detail:"Invalid bearer token", options:["Forward to payments","Authenticate → reject 401","Retry until accepted"], answer:1, why:"Authentication fails at the edge, so the request must not reach the payment service." },
  { title:"GET /admin", detail:"Valid identity · no admin permission", options:["Authorize → reject 403","Route to users","Skip gateway rules"], answer:0, why:"A known identity can still lack permission. Authorization blocks this protected route." },
  { title:"GET /image.png", detail:"Public static asset", options:["Payments service","Reverse proxy/static origin","Require payment token"], answer:1, why:"A reverse proxy can serve or forward static content without involving an API service." },
  { title:"GET /unknown", detail:"No route configured", options:["Choose any healthy service","Return 404","Disable rate limits"], answer:1, why:"An unknown route stops at routing; the gateway should not guess an internal destination." },
] as const;
const guardGates = ["AUTH","LIMIT","ROUTE","SERVICE"] as const;

export function GuardBackendGame() {
  const [round,setRound]=useState(0); const [choice,setChoice]=useState<number|null>(null); const complete=round>=requests.length; const current=requests[Math.min(round,requests.length-1)]; const correct=choice===current.answer;
  return <MiniGameShell title="GUARD THE BACKEND" round={round} total={requests.length} feedback={choice===null?undefined:correct?current.why:`That handling exposes or misroutes the request. ${current.why}`} feedbackTone={choice===null?"neutral":correct?"success":"error"} feedbackSuccessLabel="EDGE DECISION ✓" feedbackErrorLabel="REQUEST MISROUTED" complete={complete} completeTitle="EDGE LAYER UNDERSTOOD" completeCopy="You routed legitimate traffic and stopped invalid, unauthorized, excessive, or unknown requests at the right checkpoint." onRestart={()=>{setRound(0);setChoice(null);}}><div className="guard-scenario"><small>INBOUND REQUEST {String(round+1).padStart(2,"0")}</small><h3>{current.title}</h3><p>{current.detail}</p><div>{guardGates.map((gate,index)=><span key={gate}><i>{index+1}</i><b>{gate}</b></span>)}</div></div><div className="game-choice-row">{current.options.map((option,index)=><button type="button" disabled={choice!==null} onClick={()=>setChoice(index)} key={option}>{option}</button>)}</div><div className="game-footer"><span />{choice!==null?correct?<button type="button" className="lab-button" onClick={()=>{setRound((value)=>value+1);setChoice(null);}}>{round===requests.length-1?"FINISH":"NEXT REQUEST"}<ArrowRight /></button>:<button type="button" className="lab-button" onClick={()=>setChoice(null)}><Rotate />TRY AGAIN</button>:null}</div></MiniGameShell>;
}
