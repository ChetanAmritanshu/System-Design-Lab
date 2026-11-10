"use client";

import type { ReactNode } from "react";

export function PaymentLab({
  title,
  objective,
  children,
  history,
  reset,
}: {
  title: string;
  objective: string;
  children: ReactNode;
  history: string[];
  reset: () => void;
}) {
  return (
    <div className="pay-lab lab-panel">
      <div className="pay-lab-head">
        <div>
          <span className="pay-kicker">DETERMINISTIC SANDBOX</span>
          <h3>{title}</h3>
        </div>
        <button type="button" onClick={reset}>
          Reset lab
        </button>
      </div>
      <p className="pay-objective">{objective}</p>
      {children}
      <div className="pay-history" aria-live="polite" aria-atomic="true">
        <b>Latest event</b>
        <p>{history.at(-1)}</p>
      </div>
      <details className="pay-history-all">
        <summary>Event history · {history.length}</summary>
        <ol tabIndex={0} aria-label="Lab event history">
          {history.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ol>
      </details>
      <p className="pay-simplified">
        Simplified local model. Controls apply deterministic events; no real
        provider or money is involved.
      </p>
    </div>
  );
}
export function Metrics({ items }: { items: [string, string | number][] }) {
  return (
    <dl className="pay-metrics">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Range({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="pay-range">
      <span>
        {label}
        <b>
          {value.toLocaleString("en-IN")}
          {suffix}
        </b>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export function Invariant({
  pass,
  children,
}: {
  pass: boolean;
  children: ReactNode;
}) {
  return (
    <p className={`pay-invariant ${pass ? "pass" : "fail"}`}>
      <b>{pass ? "PASS" : "ATTENTION"}</b> {children}
    </p>
  );
}
export const rupees = (minor: number) =>
  `₹${(minor / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
