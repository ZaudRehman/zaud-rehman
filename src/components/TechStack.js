export default function TechStack() {
  const categories = [
    {
      id: "foundry",
      index: "01",
      label: "The Foundry",
      sublabel: "Core Languages",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><polygon points="9,2 16,6 16,12 9,16 2,12 2,6"/><line x1="9" y1="2" x2="9" y2="16"/><line x1="2" y1="6" x2="16" y2="12"/><line x1="16" y1="6" x2="2" y2="12"/></svg>`,
      note: "where systems begin",
      tools: [
        { name: "Rust", glyph: "Rs" },
        { name: "C", glyph: "C" },
        { name: "C++", glyph: "Cpp" },
        { name: "Python", glyph: "Py" },
        { name: "TypeScript", glyph: "Ts" },
      ],
    },
    {
      id: "archives",
      index: "02",
      label: "The Archives",
      sublabel: "Persistence & State",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="14" height="3.5"/><rect x="2" y="7.5" width="14" height="3.5"/><rect x="2" y="13" width="14" height="3"/><line x1="5" y1="3.75" x2="7" y2="3.75"/><line x1="5" y1="9.25" x2="7" y2="9.25"/></svg>`,
      note: "relational truth · distributed scale",
      tools: [
        { name: "PostgreSQL", glyph: "PG", note: "relational truth" },
        { name: "Cassandra", glyph: "CS", note: "distributed scale" },
        { name: "Redis", glyph: "RD", note: "high-velocity state" },
      ],
    },
    {
      id: "architecture",
      index: "03",
      label: "The Architecture",
      sublabel: "Systems & Theory",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="9" r="7"/><line x1="9" y1="2" x2="9" y2="16"/><line x1="2" y1="9" x2="16" y2="9"/><ellipse cx="9" cy="9" rx="4" ry="7"/></svg>`,
      note: "where precision lives",
      tools: [
        { name: "Distributed Systems", glyph: "DS" },
        { name: "Kernels", glyph: "KN" },
        { name: "Concurrency", glyph: "CC" },
        { name: "Probabilistic DSA", glyph: "PD" },
      ],
      artifact: {
        label: "BloomCraft ↗",
        note: "open-source Rust library",
      },
    },
    {
      id: "canvas",
      index: "04",
      label: "The Canvas",
      sublabel: "Frontend Craft",
      icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="14" height="12" rx="1"/><line x1="2" y1="7" x2="16" y2="7"/><line x1="6" y1="3" x2="6" y2="7"/></svg>`,
      note: "tools that render thought",
      tools: [
        { name: "Vite", glyph: "Vt" },
        { name: "GSAP", glyph: "GS" },
        { name: "Vanilla JS", glyph: "JS" },
        { name: "Three.js", glyph: "3J" },
      ],
    },
  ];

  const cards = categories.map((cat, i) => {
    const tools = cat.tools.map((t) => `
      <div class="techstack-tool group relative flex items-center gap-2.5 py-1.5 cursor-default" data-tool="${t.name}">
        <span class="font-mono text-[10px] text-sepia/60 w-5 shrink-0 select-none">${t.glyph}</span>
        <span class="font-mono text-xs text-charcoal/70 tracking-wide group-hover:text-charcoal transition-colors duration-200">
          ${t.name}
        </span>
        ${t.note ? `<span class="hidden md:inline font-serif text-[10px] text-sepia/40 italic ml-auto">${t.note}</span>` : ""}
      </div>
    `).join('<div class="h-px bg-charcoal/8 my-0.5"></div>');

    const offsetClass = i % 2 === 1 ? "md:mt-10" : "";

    return `
      <article class="techstack-card ${offsetClass} relative border border-charcoal/10 bg-paper p-6 rounded-sm hover:border-sepia/30 transition-all duration-300 group/card"
               style="opacity:0; transform:translateY(24px)">
        <div class="absolute inset-0 bg-grid-pattern opacity-[0.03] rounded-sm pointer-events-none"></div>

        <div class="absolute -top-3 left-5 h-6 w-20 bg-sepia/15 rounded-sm rotate-[-0.8deg] flex items-center justify-center">
          <span class="font-mono text-[8px] text-sepia/50 tracking-[0.2em] uppercase">${cat.index}</span>
        </div>

        <div class="flex items-start justify-between mb-5">
          <div>
            <div class="text-sepia/70 mb-2 techstack-card-icon">${cat.icon}</div>
            <h3 class="font-serif text-lg text-charcoal leading-tight" style="font-weight:500">${cat.label}</h3>
            <span class="font-mono text-[9px] text-sepia/50 tracking-widest uppercase">${cat.sublabel}</span>
          </div>

          <div class="text-charcoal/10 group-hover/card:text-sepia/20 transition-colors duration-300">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="0.7">
              <path d="M20 0 L20 20 L0 20" />
              <path d="M20 0 L20 12 L8 20" opacity="0.5"/>
            </svg>
          </div>
        </div>

        <div class="space-y-0">
          ${tools}
        </div>

        ${cat.artifact ? `
          <div class="mt-5 pt-4 border-t border-charcoal/8">
            <div class="flex items-center gap-2 mb-2">
              <div class="h-px w-3 bg-sepia/30"></div>
              <span class="font-mono text-[9px] text-sepia/55 tracking-[0.24em] uppercase">Artifact</span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="font-mono text-[11px] text-sepia tracking-wide">${cat.artifact.label}</span>
              <span class="font-serif text-[10px] text-sepia/45 italic">${cat.artifact.note}</span>
            </div>
          </div>
        ` : `
          <div class="mt-5 pt-4 border-t border-charcoal/8 flex items-center gap-2">
            <div class="h-px w-3 bg-sepia/30"></div>
            <span class="font-serif text-[10px] text-sepia/45 italic">${cat.note}</span>
          </div>
        `}
      </article>
    `;
  }).join("");

  return `
    <section class="py-28 px-8 md:px-20 relative overflow-hidden" id="techstack">
      <div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none text-charcoal" style="opacity:0.025" aria-hidden="true">
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" stroke="currentColor">
          <circle cx="140" cy="140" r="130" stroke-width="0.5"/>
          <circle cx="140" cy="140" r="100" stroke-width="0.4"/>
          <circle cx="140" cy="140" r="60" stroke-width="0.4"/>
          <circle cx="140" cy="140" r="20" stroke-width="0.5"/>
          <line x1="140" y1="10" x2="140" y2="270" stroke-width="0.5"/>
          <line x1="10" y1="140" x2="270" y2="140" stroke-width="0.5"/>
          <line x1="47" y1="47" x2="233" y2="233" stroke-width="0.3"/>
          <line x1="233" y1="47" x2="47" y2="233" stroke-width="0.3"/>
          <polygon points="140,10 134,35 140,28 146,35" fill="currentColor"/>
          <polygon points="140,270 134,245 140,252 146,245" fill="currentColor"/>
          <polygon points="10,140 35,134 28,140 35,146" fill="currentColor"/>
          <polygon points="270,140 245,134 252,140 245,146" fill="currentColor"/>
        </svg>
      </div>

      <div class="flex items-center gap-3 mb-16">
        <span class="font-mono text-[10px] text-sepia tracking-[0.3em] uppercase">§ 003</span>
        <div class="h-px w-10 bg-sepia/40"></div>
        <span class="font-mono text-[10px] text-sepia/50 tracking-[0.25em] uppercase">Field Kit</span>
        <div class="h-px flex-1 max-w-xs bg-charcoal/8"></div>
      </div>

      <div class="mb-16 max-w-xl">
        <h2 class="font-serif text-3xl md:text-4xl text-charcoal mb-3" style="font-weight:500">
          The Workshop
        </h2>
        <p class="font-serif text-base text-charcoal/50 italic">
          Tools chosen for precision, not popularity. Each one earned.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start" id="techstack-grid">
        ${cards}
      </div>
    </section>
  `;
}

export function initTechStack() {
  const cards = document.querySelectorAll('.techstack-card');
  if (!cards.length) return;

  import('gsap').then(({ default: gsap }) => {
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);

      cards.forEach((card, i) => {
        const icon = card.querySelector('.techstack-card-icon');

        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.08,
          ease: 'power3.out',
        });

        if (icon) {
          card.addEventListener('mouseenter', () => {
            gsap.to(icon, { y: -2, rotation: -2, duration: 0.22, ease: 'power2.out' });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(icon, { y: 0, rotation: 0, duration: 0.22, ease: 'power2.out' });
          });
        }
      });
    });
  });
}