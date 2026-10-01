import Link from "next/link";

const concepts = [
  { number: "01", label: "Client / Server", href: "/learn/client-server", question: "Who talks?" },
  { number: "02", label: "DNS", href: "/learn/dns", question: "How are they found?" },
  { number: "03", label: "HTTP / TLS", href: "/learn/http-https-tls", question: "How do they talk safely?" },
  { number: "04", label: "HTTP Evolution", href: "/learn/http-evolution", question: "How does transport evolve?" },
  { number: "05", label: "Real-Time", href: "/learn/realtime-communication", question: "How does data stay live?" },
  { number: "06", label: "Load Balancers", href: "/learn/load-balancers", question: "How is traffic spread?" },
  { number: "07", label: "Gateway", href: "/learn/reverse-proxy-api-gateway", question: "How is the edge governed?" },
  { number: "08", label: "Caching", href: "/learn/caching", question: "How is work reused?" },
  { number: "09", label: "Redis", href: "", question: "How is cache distributed?" },
] as const;

export function ConceptChain({ current }: { current: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" }) {
  const currentIndex = concepts.findIndex((concept) => concept.number === current);
  const start = Math.max(0, Math.min(currentIndex - 2, concepts.length - 5));
  const visible = concepts.slice(start, start + 5);
  return (
    <nav className="concept-chain" aria-label="Networking concept sequence">
      <span className="concept-chain__label">CONCEPT CHAIN</span>
      <div>
        {visible.map((concept, index) => {
          const body = <><small>{concept.number}</small><span><b>{concept.label}</b><em>{concept.question}</em></span>{index < visible.length - 1 ? <i aria-hidden="true">→</i> : null}</>;
          return concept.href ? <Link key={concept.number} href={concept.href} prefetch={false} className={current === concept.number ? "active" : ""} aria-current={current === concept.number ? "page" : undefined}>{body}</Link> : <span key={concept.number} className="coming">{body}</span>;
        })}
      </div>
    </nav>
  );
}
