"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { scaleRevelations } from "@/data/topics";
import { ArrowRight, DatabaseIcon, ServerIcon } from "@/components/ui/icons";

export function ScaleStory() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = scaleRevelations[active];
  return (
    <div className="scale-story">
      <div className="pressure-list" role="tablist" aria-label="Scaling pressures">
        {scaleRevelations.map((item, index) => (
          <button key={item.pressure} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)}>
            <span>0{index + 1}</span><span><b>{item.pressure}</b><small>{item.signal}</small></span><ArrowRight />
          </button>
        ))}
      </div>
      <div className="evolution-stage" aria-live="polite">
        <div className="stage-label"><span>LIVE MODEL</span><em>SCENARIO 0{active + 1}</em></div>
        <div className="simple-system">
          <div className="mini-node"><span>U</span><small>USERS</small></div>
          <div className="flow-dash"><i /><i /><i /></div>
          <div className="mini-node mini-node--server"><ServerIcon /><small>SERVER</small></div>
          <div className="flow-dash"><i /><i /><i /></div>
          <div className="mini-node"><DatabaseIcon /><small>DATA</small></div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={current.solution} className="solution-reveal" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }}>
            <span className="solve-label">PRESSURE DETECTED</span>
            <p>{current.pressure}</p>
            <div className="solution-line"><i /><span>introduce</span><i /></div>
            <strong>{current.solution}</strong>
            <small>{current.signal}</small>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
