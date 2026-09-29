"use client";

import { useState } from "react";

const requestParts = [
  { id: "method", token: "GET", label: "Method", note: "The action the client wants to perform." },
  { id: "path", token: "/products/42", label: "Path", note: "The specific resource being requested." },
  { id: "protocol", token: "HTTP/1.1", label: "Protocol", note: "The communication rules both sides follow." },
  { id: "host", token: "example.com", label: "Destination", note: "The server responsible for this request." },
] as const;

export function RequestAnatomy() {
  const [active, setActive] = useState<(typeof requestParts)[number]["id"]>("method");
  const selected = requestParts.find((part) => part.id === active) ?? requestParts[0];
  return (
    <div className="anatomy-panel">
      <div className="http-sample" aria-label="HTTP request example">
        <span className="line-number">01</span>
        {requestParts.slice(0, 3).map((part) => <button className={active === part.id ? "active" : ""} type="button" key={part.id} onClick={() => setActive(part.id)}>{part.token}</button>)}
        <span className="line-number line-number--second">02</span><span className="host-prefix">Host:</span>
        <button className={active === "host" ? "active" : ""} type="button" onClick={() => setActive("host")}>example.com</button>
      </div>
      <div className="anatomy-explainer">
        <small>SELECTED FIELD</small><strong>{selected.label}</strong><code>{selected.token}</code><p>{selected.note}</p>
      </div>
      <div className="response-anatomy"><span>RESPONSE</span><code><b>HTTP/1.1</b> <em>200 OK</em>{`\n`}Content-Type: application/json{`\n\n`}{`{ "id": 42, "name": "Keyboard" }`}</code></div>
    </div>
  );
}
