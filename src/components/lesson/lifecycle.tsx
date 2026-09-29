"use client";

import { useState } from "react";
import { clientServerLesson } from "@/content/client-server";

export function RequestLifecycle() {
  const [active, setActive] = useState(0);
  return (
    <div className="lifecycle">
      <div className="lifecycle-rail" role="tablist" aria-label="Request lifecycle stages">
        {clientServerLesson.lifecycle.map(([number, title], index) => (
          <button type="button" role="tab" aria-selected={active === index} key={number} onClick={() => setActive(index)}>
            <span>{number}</span><b>{title}</b>
          </button>
        ))}
      </div>
      <div className="lifecycle-focus" aria-live="polite">
        <span className="focus-number">{clientServerLesson.lifecycle[active][0]}</span>
        <div><small>CURRENT STAGE</small><h3>{clientServerLesson.lifecycle[active][1]}</h3><p>{clientServerLesson.lifecycle[active][2]}</p></div>
        <div className="pulse-orbit" aria-hidden="true"><i /><i /><span /></div>
      </div>
    </div>
  );
}
