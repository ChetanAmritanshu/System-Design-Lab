export const httpEvolutionLesson = {
  source: "04_HTTP_Evolution_HTTP_1_1_HTTP_2_HTTP_3_QUIC.docx",
  assets: [
    ["HTML", "8 KB", "html"],
    ["CSS", "20 KB", "css"],
    ["JS", "120 KB", "js"],
    ["Hero", "700 KB", "hero"],
    ["Avatar", "60 KB", "avatar"],
    ["Analytics", "30 KB", "analytics"],
  ],
  comparison: [
    ["Transport", "TCP", "TCP", "QUIC over UDP"],
    ["Resource concurrency", "Several reusable connections", "Multiplexed streams on one connection", "Independent QUIC streams"],
    ["Transport loss effect", "Can delay work sharing a connection", "A TCP gap can delay every HTTP stream", "A stream gap need not stop unrelated streams"],
    ["Encryption", "Optional; HTTPS adds TLS", "Commonly HTTPS/TLS in browsers", "TLS 1.3 integrated into QUIC"],
    ["Migration", "New TCP connection when path changes", "New TCP connection when path changes", "Connection IDs can survive a path change"],
    ["Main improvement", "Reuse connections", "Multiplex requests efficiently", "Remove cross-stream transport HOL"],
  ],
  misconceptions: [
    ["HTTP/2 opens one connection per request.", "HTTP/2 normally multiplexes many logical streams over one TCP connection to an origin."],
    ["HTTP/3 is HTTP over raw, unreliable UDP.", "HTTP/3 uses QUIC. QUIC adds reliability, congestion control, encryption, and stream semantics above UDP."],
    ["HTTP/3 is always faster.", "Loss, latency, server support, middleboxes, caching, and connection reuse all affect the result."],
    ["HTTP/2 eliminated all head-of-line blocking.", "It removes HTTP/1.1-style application sequencing, but TCP ordered delivery can still delay all streams after packet loss."],
  ],
  summary: [
    ["HTTP/1.1", "Persistent connections reduce setup, while several connections provide practical parallelism."],
    ["HTTP/2", "Binary framing multiplexes logical streams efficiently over one TCP connection."],
    ["TCP HOL", "A missing TCP segment can hold later bytes—and therefore multiple HTTP/2 streams—behind it."],
    ["HTTP/3", "HTTP semantics run over QUIC, whose transport streams recover independently."],
  ],
} as const;
