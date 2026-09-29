"use client";

import { useState } from "react";
import { ArrowRight, DatabaseIcon, MonitorIcon, Rotate, ServerIcon } from "@/components/ui/icons";

const choices = [
  { id: "mobile", label: "Mobile App", Icon: MonitorIcon },
  { id: "api", label: "API Server", Icon: ServerIcon },
  { id: "database", label: "Database", Icon: DatabaseIcon },
  { id: "browser", label: "Browser", Icon: MonitorIcon },
];
const answer = ["mobile", "api", "database"];

export function RouteGame() {
  const [route, setRoute] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const success = checked && answer.every((item, index) => route[index] === item);

  function select(id: string) {
    if (checked || route.includes(id) || route.length === 3) return;
    setRoute([...route, id]);
  }
  function reset() { setRoute([]); setChecked(false); }

  return (
    <div className="route-game lab-panel">
      <div className="lab-toolbar"><div><span className="live-dot" /> ROUTE THE REQUEST <b>03</b></div><span>MICRO CHALLENGE</span></div>
      <div className="game-prompt"><small>SCENARIO</small><h3>A mobile user requests their profile.</h3><p>Select the three participants in the order the request travels.</p></div>
      <div className="route-slots" aria-label="Your selected route">
        {[0, 1, 2].map((index) => {
          const selected = choices.find((choice) => choice.id === route[index]);
          return <div className={selected ? "route-slot route-slot--filled" : "route-slot"} key={index}><span>{index + 1}</span>{selected ? <><selected.Icon /><b>{selected.label}</b></> : <small>SELECT</small>}{index < 2 ? <ArrowRight /> : null}</div>;
        })}
      </div>
      <div className="choice-grid">
        {choices.map(({ id, label, Icon }) => <button type="button" key={id} disabled={route.includes(id) || checked} onClick={() => select(id)}><Icon /><span>{label}</span></button>)}
      </div>
      <div className="game-footer">
        <p aria-live="polite">{!checked ? `${route.length}/3 selected` : success ? "Exactly right: the client asks, the API coordinates, and the database supplies stored state." : "Not quite. Start with the device that initiates the request, then follow the work toward stored data."}</p>
        {checked ? <button type="button" className="lab-button" onClick={reset}><Rotate />TRY AGAIN</button> : <button type="button" className="lab-button" disabled={route.length !== 3} onClick={() => setChecked(true)}>CHECK ROUTE <ArrowRight /></button>}
      </div>
    </div>
  );
}
