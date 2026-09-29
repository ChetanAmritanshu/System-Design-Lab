"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Close, Github, Menu } from "@/components/ui/icons";

const nav = [
  ["Learn", "/learn/client-server"],
  ["Map", "/#learning-map"],
  ["Case Studies", "/#case-studies"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label="System Lab home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>SYSTEM <b>LAB</b></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
        </nav>
        <div className="nav-actions">
          <a className="github-link" href="https://github.com/ChetanAmritanshu/System-Design-Lab" target="_blank" rel="noreferrer"><Github /> <span>GitHub</span></a>
          <button className="menu-button" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></Link>)}
          <a href="https://github.com/ChetanAmritanshu/System-Design-Lab" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
        </nav>
      ) : null}
    </header>
  );
}
