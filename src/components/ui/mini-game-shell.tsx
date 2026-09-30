"use client";

import type { ReactNode } from "react";
import { Rotate } from "@/components/ui/icons";

export function MiniGameShell({
  title,
  round,
  total,
  children,
  feedback,
  feedbackTone = "neutral",
  feedbackSuccessLabel = "CORRECT ✓",
  feedbackErrorLabel = "TRY AGAIN",
  complete,
  completeTitle,
  completeCopy,
  onRestart,
}: {
  title: string;
  round: number;
  total: number;
  children: ReactNode;
  feedback?: string;
  feedbackTone?: "neutral" | "success" | "error";
  feedbackSuccessLabel?: string;
  feedbackErrorLabel?: string;
  complete: boolean;
  completeTitle: string;
  completeCopy: string;
  onRestart: () => void;
}) {
  return (
    <div className={`mini-game lab-panel mini-game--${feedbackTone}`}>
      <div className="lab-toolbar"><div><span className={complete ? "live-dot" : feedbackTone === "error" ? "alert-dot" : "live-dot"} /> {title}</div><span>{complete ? "COMPLETE" : `ROUND ${round + 1} / ${total}`}</span></div>
      <div className="mini-game__progress" aria-label={`${Math.min(round + (complete ? 1 : 0), total)} of ${total} rounds complete`}><i style={{ width: `${complete ? 100 : (round / total) * 100}%` }} /></div>
      {complete ? (
        <div className="mini-game__complete"><span>✓</span><small>LEARNING CHECK COMPLETE</small><h3>{completeTitle}</h3><p>{completeCopy}</p><button type="button" className="lab-button" onClick={onRestart}><Rotate />PLAY AGAIN</button></div>
      ) : children}
      {!complete && feedback ? <div className="mini-game__feedback" aria-live="polite"><b>{feedbackTone === "success" ? feedbackSuccessLabel : feedbackTone === "error" ? feedbackErrorLabel : "HINT"}</b><p>{feedback}</p></div> : null}
    </div>
  );
}
