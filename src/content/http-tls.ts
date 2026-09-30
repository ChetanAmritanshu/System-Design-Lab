export const httpTlsLesson = {
  source: "03_HTTP_HTTPS_and_TLS.docx",
  chapter: "03",
  title: "HTTP, HTTPS & TLS",
  subtitle: "How web messages travel—and how TLS protects them in transit.",
  methods: [
    ["GET", "Read a representation", "GET /profile"],
    ["POST", "Create or trigger work", "POST /orders"],
    ["PUT", "Replace a resource", "PUT /profile/42"],
    ["PATCH", "Change part of a resource", "PATCH /profile/42"],
    ["DELETE", "Request removal", "DELETE /sessions/current"],
  ],
  statuses: [
    ["200", "Success", "Profile returned"], ["201", "Created", "Order accepted and created"],
    ["301", "Moved", "Use the canonical URL"], ["400", "Bad request", "Input could not be understood"],
    ["401", "Unauthenticated", "Valid credentials are required"], ["404", "Not found", "No resource exists here"],
    ["429", "Too many requests", "The client exceeded a rate limit"], ["500", "Server error", "The server failed unexpectedly"],
    ["503", "Unavailable", "The service cannot handle the request now"],
  ],
  summary: [
    ["HTTP", "Structures requests and responses"],
    ["HTTPS", "HTTP carried over TLS"],
    ["TLS", "Encrypts and authenticates transport"],
    ["Certificate", "Binds a hostname to a public key"],
  ],
} as const;
