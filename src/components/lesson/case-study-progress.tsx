import Link from "next/link";

const studies=[
  {number:"01",label:"URL Shortener",href:"/case-studies/url-shortener"},
  {number:"02",label:"Rate Limiter",href:"/case-studies/distributed-rate-limiter"},
  {number:"03",label:"Real-Time Chat",href:"/case-studies/realtime-chat"},
  {number:"04",label:"YouTube",href:""},
] as const;

export function CaseStudyProgress({current}:{current:"01"|"02"|"03"}){
  return <div className="case-progress"><span>PART II · CASE STUDIES</span><nav aria-label="Case study sequence">{studies.map((study,index)=>{const body=<><small>{study.number}</small><b>{study.label}</b>{index<studies.length-1?<i aria-hidden="true">→</i>:null}</>;return study.href?<Link className={study.number===current?"active":""} aria-current={study.number===current?"page":undefined} href={study.href} key={study.number}>{body}</Link>:<span className="locked" key={study.number}>{body}</span>})}</nav><div className="case-progress__stages" aria-label="Case study method"><b>REQUIREMENTS</b><i>→</i><b>V1</b><i>→</i><b>SCALE</b><i>→</i><b>FAILURES</b><i>→</i><b>FINAL DESIGN</b></div></div>;
}
