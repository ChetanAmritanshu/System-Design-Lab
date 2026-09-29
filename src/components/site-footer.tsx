import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>SYSTEM <b>LAB</b></span></Link>
        <p>Don’t memorize architectures. Derive them. · <a href="https://github.com/ChetanAmritanshu/High-Level-Design" target="_blank" rel="noreferrer">Source notes ↗</a></p>
      </div>
      <p className="footer-note">Open source · Built from first principles</p>
    </footer>
  );
}
