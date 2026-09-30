import Link from "next/link";

const concepts = [
  { number: "01", label: "Client / Server", href: "/learn/client-server", question: "Who talks?" },
  { number: "02", label: "DNS", href: "/learn/dns", question: "How are they found?" },
  { number: "03", label: "HTTP / TLS", href: "/learn/http-https-tls", question: "How do they talk safely?" },
  { number: "04", label: "HTTP Evolution", href: "", question: "How does transport evolve?" },
] as const;

export function ConceptChain({ current }: { current: "01" | "02" | "03" }) {
  return (
    <nav className="concept-chain" aria-label="Networking concept sequence">
      <span className="concept-chain__label">CONCEPT CHAIN</span>
      <div>
        {concepts.map((concept, index) => {
          const body = <><small>{concept.number}</small><span><b>{concept.label}</b><em>{concept.question}</em></span>{index < concepts.length - 1 ? <i aria-hidden="true">→</i> : null}</>;
          return concept.href ? <Link key={concept.number} href={concept.href} className={current === concept.number ? "active" : ""} aria-current={current === concept.number ? "page" : undefined}>{body}</Link> : <span key={concept.number} className="coming">{body}</span>;
        })}
      </div>
    </nav>
  );
}
