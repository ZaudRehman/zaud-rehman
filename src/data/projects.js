export const projects = [
  {
    title: "Switch & Signal",
    description: "Distributed microservices platform. Features Python/JWT auth, Rust/Axum inventory engine with atomic state locking, and a Next.js cyberpunk frontend.",
    tech: ["Rust (Axum)", "Python (FastAPI)", "Next.js", "PostgreSQL", "Zustand"],
    link: "https://switch-signal-web.vercel.app/",
    github: "https://github.com/ZaudRehman/switch-signal",
    // Gears Icon
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="m19 5-3 1.5"/><path d="m5 5 3 1.5"/><path d="M19 19l-3-1.5"/><path d="M5 19l3-1.5"/><path d="M2 12h4"/><path d="M18 12h4"/><circle cx="12" cy="12" r="3"/><path d="M12 16v4"/></svg>`
  },
  {
    title: "Aesthete",
    description: "Interactive 3D engine for algorithm visualization. Implements a custom generator-based controller for time-travel debugging across Sorting, Graphs, and Dynamic Programming.",
    tech: ["React Three Fiber", 
        "Zustand", 
        "React Spring", 
        "TailwindCSS"],
    demo: "https://aesthete-six.vercel.app/",
    github: "https://github.com/ZaudRehman/aesthete",
    // Cube Icon
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
  },
  {
    title: "NoteFlow",
    description: "Real-time collaborative notes with WebSocket sync. Handles 1000+ concurrent connections at <100ms latency. Rust backend + Next.js 14.",
    tech: ["Next.js", "Rust/Axum", "PostgreSQL", "Redis", "WebSockets"],
    demo: "https://noteflow-frontend-phi.vercel.app/",
    github: "https://github.com/ZaudRehman/noteflow-frontend",
    githubBackend: "https://github.com/ZaudRehman/noteflow-backend-v1",
    tags: ["Real-time", "Collaborative", "Full-stack"],
    // Document Icon
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
  },
  {
    title: "TaskFlow",
    description: "Production-ready task management system featuring a high-performance REST API with async database operations, secure JWT authentication, and a responsive glassmorphism UI.",
    tech: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JavaScript"],
    github: "https://github.com/ZaudRehman/taskflow-api",
    demo: "https://taskflow-api-tzoh.onrender.com/app", 
    // Checklist Icon
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
  }
];
