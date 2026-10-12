"use client";

import {useState} from "react";
import {ArrowRight} from "@/components/ui/icons";
import {MiniGameShell} from "@/components/ui/mini-game-shell";

export type DecisionRound={title:string;prompt:string;facts:string[];options:string[];answer:string;why:string};

export function DecisionGame({title,completeTitle,completeCopy,rounds}:{title:string;completeTitle:string;completeCopy:string;rounds:DecisionRound[]}){
  const [round,setRound]=useState(0);const [feedback,setFeedback]=useState("");const [tone,setTone]=useState<"neutral"|"success"|"error">("neutral");const [complete,setComplete]=useState(false);const current=rounds[round];
  const choose=(option:string)=>{const correct=option===current.answer;setTone(correct?"success":"error");setFeedback(correct?current.why:`That response does not address the main pressure yet. ${current.why}`)};
  const next=()=>{if(round===rounds.length-1)setComplete(true);else{setRound(value=>value+1);setFeedback("");setTone("neutral")}};
  const restart=()=>{setRound(0);setFeedback("");setTone("neutral");setComplete(false)};
  return <MiniGameShell title={title} round={round} total={rounds.length} feedback={feedback} feedbackTone={tone} complete={complete} completeTitle={completeTitle} completeCopy={completeCopy} onRestart={restart}>
    <div className="production-game-scenario"><small>ROUND {round+1} · {current.title}</small><h3>{current.prompt}</h3><div>{current.facts.map(fact=><span key={fact}>{fact}</span>)}</div></div>
    <div className="game-choice-row">{current.options.map(option=><button type="button" disabled={tone==="success"} onClick={()=>choose(option)} key={option}>{option}</button>)}</div>
    {tone==="success"?<div className="game-footer"><span>DECISION EXPLAINED</span><button type="button" className="lab-button" onClick={next}>{round===rounds.length-1?"FINISH":"NEXT ROUND"}<ArrowRight/></button></div>:null}
  </MiniGameShell>;
}
