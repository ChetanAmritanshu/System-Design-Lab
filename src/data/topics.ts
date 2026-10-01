export type Topic = {
  number: string;
  title: string;
  shortTitle: string;
  slug: string;
  available: boolean;
};

export type TopicGroup = {
  id: string;
  label: string;
  eyebrow: string;
  tone: "cyan" | "violet" | "amber" | "green" | "rose";
  topics: Topic[];
};

const topic = (number: number, title: string, shortTitle = title): Topic => ({
  number: String(number).padStart(2, "0"),
  title,
  shortTitle,
  slug: number === 1 ? "/learn/client-server" : number === 2 ? "/learn/dns" : number === 3 ? "/learn/http-https-tls" : number === 4 ? "/learn/http-evolution" : number === 5 ? "/learn/realtime-communication" : number === 6 ? "/learn/load-balancers" : number === 7 ? "/learn/reverse-proxy-api-gateway" : number === 8 ? "/learn/caching" : number === 9 ? "/learn/cache-architectures-redis" : number === 10 ? "/learn/cache-invalidation-failures" : number === 11 ? "/learn/cdn-edge-delivery" : "",
  available: number <= 11,
});

export const topicGroups: TopicGroup[] = [
  {
    id: "networking",
    label: "Networking & Communication",
    eyebrow: "How machines speak",
    tone: "cyan",
    topics: [
      topic(1, "Client–Server Architecture", "Client / Server"),
      topic(2, "DNS Fundamentals", "DNS"),
      topic(3, "HTTP, HTTPS & TLS", "HTTP / TLS"),
      topic(4, "HTTP Evolution & QUIC", "HTTP / QUIC"),
      topic(5, "Polling, SSE & WebSockets", "Realtime"),
      topic(6, "Load Balancers", "Load Balancing"),
      topic(7, "Reverse Proxy & API Gateway", "Gateways"),
    ],
  },
  {
    id: "performance",
    label: "Performance & Traffic",
    eyebrow: "When demand accelerates",
    tone: "violet",
    topics: [
      topic(8, "Caching Fundamentals", "Caching"),
      topic(9, "Cache Architectures & Redis", "Redis"),
      topic(10, "Cache Failures", "Cache Failures"),
      topic(11, "CDN & Edge Delivery", "CDN / Edge"),
      topic(12, "Rate Limiting", "Rate Limits"),
    ],
  },
  {
    id: "data",
    label: "Data & Distributed Storage",
    eyebrow: "Keeping truth at scale",
    tone: "amber",
    topics: [
      topic(13, "SQL & ACID", "SQL / ACID"),
      topic(14, "NoSQL", "NoSQL"),
      topic(15, "Indexing", "Indexes"),
      topic(16, "Replication", "Replication"),
      topic(17, "Sharding", "Sharding"),
      topic(18, "CAP Theorem", "CAP"),
      topic(19, "Consistency & Quorums", "Consistency"),
      topic(20, "Distributed Transactions & Sagas", "Sagas"),
    ],
  },
  {
    id: "distributed",
    label: "Asynchronous & Distributed",
    eyebrow: "Coordinating moving parts",
    tone: "green",
    topics: [
      topic(21, "Kafka & RabbitMQ", "Queues"),
      topic(22, "Stream Processing", "Streams"),
      topic(23, "Microservices", "Microservices"),
      topic(24, "Service Discovery & gRPC", "Discovery / gRPC"),
      topic(25, "Event-Driven, CQRS & Event Sourcing", "Events / CQRS"),
      topic(26, "Locks, Leader Election & Raft", "Consensus"),
    ],
  },
  {
    id: "production",
    label: "Production Engineering",
    eyebrow: "Making systems survive",
    tone: "rose",
    topics: [
      topic(27, "Reliability", "Reliability"),
      topic(28, "Observability", "Observability"),
      topic(29, "Idempotency & Backpressure", "Safety / Flow"),
      topic(30, "System Design Communication", "Communication"),
    ],
  },
];

export const caseStudies = [
  { title: "URL Shortener", mark: "URL", problem: "Long link → short link → redirect" },
  { title: "Distributed Rate Limiter", mark: "429", problem: "Should this request be allowed?" },
  { title: "WhatsApp", mark: "MSG", problem: "Alice sends “Hello” to Bob" },
  { title: "YouTube", mark: "PLAY", problem: "Creator uploads. Viewer presses play." },
  { title: "Uber", mark: "GEO", problem: "Find and reserve a nearby driver" },
  { title: "Payment System", mark: "PAY", problem: "Move money without guessing state" },
  { title: "Notification System", mark: "PING", problem: "Something happened → tell the user" },
] as const;

export const scaleRevelations = [
  { pressure: "Traffic grows", solution: "Load balancer", signal: "spread connections" },
  { pressure: "Reads explode", solution: "Cache", signal: "reuse hot answers" },
  { pressure: "Database bottlenecks", solution: "Replication", signal: "distribute reads" },
  { pressure: "Data outgrows one machine", solution: "Sharding", signal: "split the dataset" },
] as const;
