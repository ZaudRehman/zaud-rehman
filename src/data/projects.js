export const projects = [
  {
    title: "Tributary",
    category: "Distributed Systems",
    year: "2026",
    status: "live",
    hook: "Every byte on the wire, every vote in the cluster: mine.",
    story: `A distributed message broker built from scratch in pure Python, modeled on Kafka's architecture.

- Custom binary wire protocol covering 42 message types, no external serialization library involved.
- Raft consensus for cluster coordination, with metadata kept fully isolated from the data plane.
- Segmented write-ahead log with CRC checks on every segment, so a crash never loses acknowledged data.
- TLS and mutual TLS, plus a hand-rolled SCRAM-SHA-256 implementation matching RFC 5802.
- Default-deny ACLs, a schema registry, and a dead-letter queue for messages that fail processing.
- Prometheus metrics wired through every component.

335 of 335 tests pass. mypy --strict is clean across all 60 source files. Zero runtime dependencies.

P99 produce latency runs 2 to 5 ms. Leader failover completes in under 6 seconds, confirmed by 8 benchmarks and 8 game-day drills.`,
    stats: [
      { value: "335", label: "Tests passing" },
      { value: "60", label: "Source files" },
      { value: "42", label: "Message types" },
      { value: "2–5ms", label: "P99 produce latency" },
      { value: "<6s", label: "Leader failover" },
      { value: "0", label: "Runtime dependencies" },
      { value: "8+8", label: "Benchmarks + drills" },
      { value: "~8.2k", label: "Lines of Python" },
    ],
    highlights: [
      "Raft election with 150–300ms timeouts, snapshots, and log replay",
      "Metadata consensus kept separate from the data plane so Raft never bottlenecks throughput",
      "1MB rolling segments, mmap zero-copy reads, sparse indexes, CRC-validated crash recovery",
      "Per-connection inflight-bytes sliding window for backpressure",
      "100-virtual-node consistent-hash partition assignment",
      "Certificate hot-reload, structured JSON logs with correlation IDs",
      "Docker Compose 3-node cluster; backup/restore with SHA256 manifests",
      "Disk-pressure read-only mode; SLOs documented with game-day drills",
    ],
    tech: ["Python 3.11", "asyncio", "Raft", "TLS 1.3 / mTLS", "SCRAM-SHA-256", "Prometheus"],
    links: {
      github: "https://github.com/ZaudRehman/Tributary",
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3c1.2 4 2.2 7.2 4.5 9s4.5 1.5 4.5 4.5"/><path d="M20 3c-1.2 4-2.2 7.2-4.5 9s-4.5 1.5-4.5 4.5"/><path d="M12 16.5c.8 1.5 1.3 2.8 1.5 4.5"/></svg>`
  },

  {
    title: "NoteFlow",
    category: "Real-time Full-stack",
    year: "2025–26",
    status: "live",
    hook: "CRDT collaboration, pure-Rust Web Push, 11 languages, 28,000 lines end to end.",
    story: `A collaborative note-taking platform built from scratch: Rust/Axum REST + WebSocket backend paired with a TipTap rich-text frontend, hardened through iterative production passes.

Backend, 9,400+ lines across 43 Rust files: 40+ REST endpoints and a WebSocket protocol with 8 message types. Block-level CRDT relay (add/update/remove/move) with late-join sync batches and live cursor broadcast. Ticket-based WebSocket authentication, a 30-second single-use ticket, so the JWT never touches a URL. RFC 8291 Web Push encryption written in pure Rust (AES-256-GCM + P-256 ECDH, no system OpenSSL). Dual-token JWT with rotation, bcrypt-12 hashing, account lockout, per-email brute-force rate limiting, session listing and revocation. PostgreSQL full-text search (GIN indexes, to_tsvector), revision history snapshots via DB triggers with point-in-time restore, and 7-format document export (Markdown, HTML, TXT, RTF, PDF, EPUB).

Frontend, 19,000+ lines across 167 files: TipTap/ProseMirror editor with 11 block types and a bidirectional conversion layer to the backend Block[] format. 15 Material 3-inspired themes injected as runtime CSS variables. Full i18n across 11 languages with RTL, pluralization, and locale-aware formatting. Zustand stores with optimistic updates, 14 custom hooks, 13 API modules.

Scaled to 1,000+ concurrent WebSocket connections with sub-200ms p95 responses. Compile-time-verified SQL via the SQLx offline cache. Observed end to end: Prometheus metrics, structured JSON logs, request-scoped tracing.`,
    stats: [
      { value: "28k", label: "Lines (Rust + TS)" },
      { value: "1,000+", label: "Concurrent WebSockets" },
      { value: "<200ms", label: "p95 response" },
      { value: "40+", label: "REST endpoints" },
      { value: "8", label: "WS message types" },
      { value: "11", label: "Languages" },
      { value: "15", label: "Switchable themes" },
      { value: "7", label: "Export formats" },
    ],
    highlights: [
      "Block-level CRDT relay (add/update/remove/move) with late-join sync batches and live cursors",
      "RFC 8291 Web Push built in pure Rust from the spec (VAPID, no external crypto service)",
      "Ticket-based WS auth: 30-second single-use tickets, JWT never in URLs",
      "Dual-token JWT rotation, bcrypt-12, account lockout, brute-force rate limiting",
      "PostgreSQL full-text search + revision history with point-in-time restore",
      "TipTap editor: 11 block types, resizable tables, inline Chart.js, slash commands",
      "15 Material 3-inspired themes; 11-language i18n with RTL support",
      "SQLx compile-time-verified queries across 15 migrations; structured tracing + metrics",
    ],
    tech: ["Rust", "Axum", "Tokio", "SQLx", "PostgreSQL", "Redis", "WebSockets", "Next.js 16", "React 19", "TypeScript", "TipTap"],
    links: {
      github: "https://github.com/ZaudRehman/noteflow-backend-v1",
      frontend: "https://github.com/ZaudRehman/noteflow-frontend",
      demo: "https://noteflow-frontend-phi.vercel.app/",
      docs: "https://noteflow-backend-v1.onrender.com/docs",
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
  },

  {
    title: "Switch & Signal",
    category: "Microservices",
    year: "2026",
    status: "live",
    hook: "The project that taught me where distributed systems actually break.",
    story: `A distributed microservices platform: the project that taught me where distributed systems actually break.

- Rust/Axum inventory engine with atomic state locking so conflicting stock updates serialize correctly.
- Python/FastAPI auth service issuing JWTs, keeping identity split from business logic.
- Next.js cyberpunk frontend wired to both services through a typed API layer.
- PostgreSQL as the shared source of truth.

Three services, one coherent product, containerized, deployed, and deliberately simple enough to study failure modes across boundaries.`,
    stats: [
      { value: "3", label: "Services" },
      { value: "2", label: "Languages" },
      { value: "1", label: "Shared database" },
      { value: "3", label: "Layers" },
    ],
    highlights: [
      "Rust inventory engine with atomic state locking",
      "Python/JWT auth split from business logic",
      "Next.js frontend with typed API layer",
      "PostgreSQL as the single source of truth",
    ],
    tech: ["Rust (Axum)", "Python (FastAPI)", "Next.js", "PostgreSQL", "Zustand"],
    links: {
      demo: "https://switch-signal-web.vercel.app/",
      github: "https://github.com/ZaudRehman/switch-signal",
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m19 5-3 1.5"/><path d="m5 5 3 1.5"/><path d="M19 19l-3-1.5"/><path d="M5 19l3-1.5"/><path d="M2 12h4"/><path d="M18 12h4"/><circle cx="12" cy="12" r="3"/><path d="M12 16v4"/></svg>`
  },

  {
    title: "Aesthete",
    category: "Visualization",
    year: "2026",
    status: "live",
    hook: "Time-travel debugging for algorithms, rendered in 3D.",
    story: `An interactive 3D engine for visualizing algorithms. A generator-based controller lets you step forward and back through Sorting, Graph, and Dynamic Programming algorithms with frame-perfect control, a debugger for algorithms rendered in WebGL.

- Custom generator-based AlgorithmController with time-travel stepping.
- 25+ algorithms across Sorting, Graphs, and DP at a steady 60 FPS.
- Scene-graph batching via Three.js and minimal re-render overhead via Zustand.

Built for educational tooling: synchronized, steppable visual state alongside running code.`,
    stats: [
      { value: "25+", label: "Algorithms" },
      { value: "60", label: "FPS" },
      { value: "3", label: "Categories" },
      { value: "2", label: "Languages shown" },
    ],
    highlights: [
      "Generator-based controller enabling frame-perfect forward/backward stepping",
      "Scene-graph batching keeps render load flat across 25+ algorithms",
      "Zustand store design minimizes re-renders during playback",
      "Sorting, Graphs, and DP with synchronized code highlighting",
    ],
    tech: ["React Three Fiber", "Three.js", "Zustand", "React Spring", "TailwindCSS"],
    links: {
      demo: "https://aesthete-six.vercel.app/",
      github: "https://github.com/ZaudRehman/aesthete",
    },
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
  }
];