export const dnsLesson = {
  source: "02_DNS_Fundamentals.docx",
  chapter: "02",
  title: "DNS Fundamentals",
  subtitle: "How a human-friendly name becomes a machine address.",
  summary: [
    ["Domain", "A human-friendly name"],
    ["DNS", "Maps names to address records"],
    ["Resolver", "Performs and caches lookups"],
    ["Authority", "Owns the final answer"],
    ["TTL", "Limits how long an answer is cached"],
  ],
  records: [
    { type: "A", name: "systemlab.dev", value: "203.0.113.42", note: "Maps a name to an IPv4 address." },
    { type: "AAAA", name: "systemlab.dev", value: "2001:db8::42", note: "Maps a name to an IPv6 address." },
    { type: "CNAME", name: "www.systemlab.dev", value: "edge.cdnprovider.net", note: "Makes one hostname an alias of another hostname." },
    { type: "MX", name: "systemlab.dev", value: "mail.systemlab.dev", note: "Directs email delivery for the domain." },
    { type: "TXT", name: "systemlab.dev", value: "verification=system-lab", note: "Stores text used for ownership, policy, and verification." },
    { type: "NS", name: "systemlab.dev", value: "ns1.dns-provider.net", note: "Delegates the zone to an authoritative name server." },
  ],
} as const;
