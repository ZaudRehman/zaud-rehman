import { bloomcraft } from '../data/bloomcraft.js';

export default function BloomCraftLab() {
  const statsHtml = `
    <article class="bloomcraft-stat bg-paper p-6 border border-charcoal/10 shadow-sm relative group transition-transform duration-300 bloomcraft-shell">
      <div class="absolute top-0 left-0 w-full h-px bg-sepia/30 group-hover:bg-sepia transition-colors"></div>
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-charcoal/50 mb-3">Index 01</p>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.total_filters}+</h4>
      <p class="font-serif text-lg text-sepia mb-2 italic">Filter Variants</p>
      <p class="font-mono text-xs text-charcoal/50">Production-grade implementations</p>
    </article>

    <article class="bloomcraft-stat bg-paper p-6 border border-charcoal/10 shadow-sm relative group transition-transform duration-300 bloomcraft-shell">
      <div class="absolute top-0 left-0 w-full h-px bg-sepia/30 group-hover:bg-sepia transition-colors"></div>
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-charcoal/50 mb-3">Index 02</p>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.hash_algorithms}</h4>
      <p class="font-serif text-lg text-sepia mb-2 italic">Hash Algorithms</p>
      <p class="font-mono text-xs text-charcoal/50">XXHash3, WyHash, SipHash, SIMD</p>
    </article>

    <article class="bloomcraft-stat bg-paper p-6 border border-charcoal/10 shadow-sm relative group transition-transform duration-300 bloomcraft-shell">
      <div class="absolute top-0 left-0 w-full h-px bg-sepia/30 group-hover:bg-sepia transition-colors"></div>
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-charcoal/50 mb-3">Index 03</p>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.concurrent_variants}</h4>
      <p class="font-serif text-lg text-sepia mb-2 italic">Concurrent Patterns</p>
      <p class="font-mono text-xs text-charcoal/50">Lock-free, sharded, striped</p>
    </article>

    <article class="bloomcraft-stat bg-paper p-6 border border-charcoal/10 shadow-sm relative group transition-transform duration-300 bloomcraft-shell">
      <div class="absolute top-0 left-0 w-full h-px bg-sepia/30 group-hover:bg-sepia transition-colors"></div>
      <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-charcoal/50 mb-3">Index 04</p>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.specialized_variants}</h4>
      <p class="font-serif text-lg text-sepia mb-2 italic">Specialized Filters</p>
      <p class="font-mono text-xs text-charcoal/50">Tree, partitioned, scalable</p>
    </article>
  `;

  const highlightsHtml = bloomcraft.highlights.map((h, i) => `
    <li class="flex items-start gap-3 font-mono text-sm text-charcoal/80 mb-4 bloomcraft-note-item">
      <span class="text-gold mt-1">${String(i + 1).padStart(2, '0')}</span>
      <span>${h}</span>
    </li>
  `).join('');

  return `
    <section id="bloomcraft" class="bloomcraft-research-shell py-32 relative overflow-hidden my-20 border-y border-charcoal/10 bg-paper-dark/30">
      <div class="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-20 pointer-events-none"></div>

      <div class="max-w-6xl mx-auto px-6 relative z-10">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start mb-16 gap-10">
          <div class="relative bloomcraft-heading-block">
            <div class="absolute -top-8 -left-6 opacity-20 bloomcraft-seal pointer-events-none">
              <svg width="92" height="92" viewBox="0 0 92 92" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="46" cy="46" r="34" stroke-dasharray="3 5"/>
                <circle cx="46" cy="46" r="20" opacity="0.45"/>
                <path d="M46 15V77M15 46H77" opacity="0.28"/>
                <path d="M46 30L51 46L46 62L41 46Z" fill="currentColor" stroke="none"/>
              </svg>
            </div>

            <div class="pl-4 border-l border-sepia/30 ml-2 md:ml-10 relative z-10">
              <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-charcoal/50 mb-3">Research Folio</p>
              <h2 class="font-serif text-5xl md:text-6xl text-charcoal mb-2">${bloomcraft.title}</h2>
              <h3 class="font-serif text-2xl text-sepia italic mb-4">${bloomcraft.subtitle}</h3>
              <p class="bloomcraft-tagline font-serif text-xl max-w-3xl leading-relaxed">
                ${bloomcraft.tagline}
              </p>
            </div>
          </div>

          <div class="bloomcraft-stamp border-4 p-4 -rotate-3 stamp rounded-sm backdrop-blur-sm">
            <span class="bloomcraft-stamp-label font-mono font-bold tracking-widest uppercase text-sm">Active Research</span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          ${statsHtml}
        </div>

        <!-- Main Research Sheet -->
        <div class="grid md:grid-cols-[1.1fr_0.9fr] gap-12 bg-paper p-8 md:p-10 border border-charcoal/10 shadow-lg relative bloomcraft-shell bloomcraft-main-sheet">
          <div class="bloomcraft-tape absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 opacity-80 rotate-1 shadow-sm"></div>

          <div class="bloomcraft-left-column">
            <div class="mb-10">
              <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-charcoal/50 mb-4">Field Notes</p>
              <h4 class="font-serif text-2xl mb-6 border-b border-charcoal/10 pb-3">Technical Highlights</h4>
              <ul>${highlightsHtml}</ul>
            </div>

            <div class="bloomcraft-margin-note p-5 border border-charcoal/10 rounded-sm bg-paper-dark/30">
              <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-sepia mb-2">Research Note</p>
              <p class="font-serif text-base text-charcoal/80 leading-relaxed italic">
                BloomCraft explores probabilistic data structures as living systems — tuned for throughput, concurrency, and real-world memory pressure instead of toy examples.
              </p>
            </div>
          </div>

          <div class="flex flex-col justify-between">
            <div>
              <p class="font-mono text-[10px] uppercase tracking-[0.24em] text-charcoal/50 mb-4">Tooling</p>
              <h4 class="font-serif text-2xl mb-6 border-b border-charcoal/10 pb-3">Getting Started</h4>

              <div class="mt-4 flex items-center gap-3">
                <div
                  class="relative group cursor-pointer"
                  onclick="navigator.clipboard.writeText('cargo add bloomcraft'); alert('Copied to clipboard: cargo add bloomcraft')"
                >
                  <code class="bloomcraft-code font-mono text-xs px-3 py-2 rounded-sm border border-charcoal group-hover:bg-sepia/10 transition-colors">
                    $ cargo add bloomcraft
                  </code>
                  <span class="bloomcraft-tooltip absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Copy to clipboard
                  </span>
                </div>
              </div>

              <div class="mt-8">
                <p class="font-mono text-xs text-charcoal/50 mb-3">Built with:</p>
                <div class="flex flex-wrap gap-2">
                  ${bloomcraft.tech_stack.primary.map(tech => `
                    <span class="bloomcraft-pill font-mono text-[10px] uppercase tracking-wider text-charcoal/70 border border-charcoal/20 px-2 py-1 rounded-sm">
                      ${tech}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="bloomcraft-link-row flex gap-4 mt-10 flex-wrap">
              <a
                href="${bloomcraft.links.github}"
                target="_blank"
                rel="noopener noreferrer"
                class="bloomcraft-solid-btn px-6 py-3 font-mono text-sm transition-colors"
              >
                View on GitHub
              </a>
              <a
                href="${bloomcraft.links.documentation}"
                target="_blank"
                rel="noopener noreferrer"
                class="bloomcraft-outline-btn px-6 py-3 border border-charcoal text-charcoal font-mono text-sm transition-colors"
              >
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}