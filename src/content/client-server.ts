export const clientServerLesson = {
  source: "01_Client_Server_Architecture.docx",
  chapter: "01",
  title: "Client–Server Architecture",
  subtitle: "How a request leaves your device, reaches a service, and comes back.",
  readingTime: "18 min lab",
  definitions: [
    {
      term: "Client",
      definition: "The participant that initiates communication because it needs data or work performed.",
      examples: "Browser · mobile app · another service",
    },
    {
      term: "Server",
      definition: "The participant that listens for requests, performs work, and returns a response.",
      examples: "Web server · API · database",
    },
  ],
  lifecycle: [
    ["01", "Create", "The client decides what it needs and constructs a request."],
    ["02", "Travel", "The request crosses a network toward the server."],
    ["03", "Receive", "The server accepts the request at a listening endpoint."],
    ["04", "Execute", "Application logic reads data, computes, or performs work."],
    ["05", "Respond", "The server packages a status and result."],
    ["06", "Return", "The response travels back across the network."],
    ["07", "Use", "The client renders the result or continues its own workflow."],
  ],
  variants: [
    ["Browser", "Web server", "Pages and assets"],
    ["Mobile app", "API server", "Structured application data"],
    ["Service A", "Service B", "Internal capabilities"],
  ],
  takeaways: [
    ["Client", "Initiates communication"],
    ["Request", "Describes the work needed"],
    ["Server", "Receives and processes"],
    ["Response", "Returns a status and result"],
  ],
} as const;

export type ClientServerLesson = typeof clientServerLesson;
