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
  { number: "09", label: "Redis", href: "/learn/cache-architectures-redis", question: "Where does cache live?" },
  { number: "10", label: "Cache Failures", href: "/learn/cache-invalidation-failures", question: "When do copies break?" },
  { number: "11", label: "CDN / Edge", href: "/learn/cdn-edge-delivery", question: "How does cache move closer?" },
  { number: "12", label: "Rate Limiting", href: "/learn/rate-limiting", question: "How is demand controlled?" },
  { number: "13", label: "SQL / ACID", href: "/learn/sql-acid", question: "How is truth protected?" },
  { number: "14", label: "NoSQL", href: "/learn/nosql", question: "Which data shape fits?" },
  { number: "15", label: "Indexing", href: "/learn/database-indexing", question: "How are rows found?" },
  { number: "16", label: "Replication", href: "/learn/replication", question: "How are copies kept?" },
  { number: "17", label: "Sharding", href: "/learn/sharding-partitioning", question: "How is data divided?" },
  { number: "18", label: "CAP Theorem", href: "/learn/cap-theorem", question: "What happens in a partition?" },
  { number: "19", label: "Consistency", href: "/learn/consistency-quorums", question: "How many copies participate?" },
  { number: "20", label: "Sagas", href: "/learn/distributed-transactions-sagas", question: "How do owners coordinate?" },
  { number: "21", label: "Queues / Logs", href: "/learn/message-queues-kafka-rabbitmq", question: "How is work handed off?" },
  { number: "22", label: "Streams", href: "/learn/stream-processing", question: "How are events computed?" },
  { number: "23", label: "Microservices", href: "/learn/microservices", question: "How are services composed?" },
  { number: "24", label: "Discovery / gRPC", href: "/learn/service-discovery-grpc", question: "How do services find and call?" },
  { number: "25", label: "Events / CQRS", href: "/learn/event-driven-cqrs-event-sourcing", question: "How do facts shape state?" },
  { number: "26", label: "Coordination", href: "/learn/distributed-coordination", question: "Who may act?" },
  { number: "27", label: "Reliability", href: "/learn/reliability-engineering", question: "How are failures contained?" },
  { number: "28", label: "Observability", href: "/learn/observability", question: "What is happening inside?" },
  { number: "29", label: "Safety / Flow", href: "", question: "How is duplicate and excess work controlled?" },
] as const;

export function ConceptChain({ current }: { current: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" }) {
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
