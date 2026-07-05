import { erra } from '../data/erra.js';

function renderErraCode(code) {
  const kw = (t) => `<span class="opacity-50">${t}</span>`;
  const str = (t) => `<span class="text-sepia">"${t}"</span>`;
  const fn = (t) => `<span class="text-charcoal font-bold">${t}</span>`;
  const hi = (t) => `<span class="erra-highlight px-1 py-0.5 rounded transition-colors duration-300 relative">${t}</span>`;

  return [
    `${kw('fn')} ${fn(code.title)}() ${kw('->')} Result&lt;Config, Error&lt;io::Error&gt;&gt; {`,
    `    fs::read_to_string(${str(code.source_file)})`,
    `        ${hi(`${kw('.') }annotate(${str(code.annotation)})?`)};`,
    ``,
    `    ${kw('// ...')}`,
    `}`,
  ].join('\n');
}

export default function ErraLab() {
  return `
    <section id="erra" class="erra-shell py-14 md:py-32 relative overflow-hidden mb-20 border-y border-charcoal/10 bg-paper-dark/30">
      <div class="max-w-6xl mx-auto px-6 relative z-10">

        <!-- Header -->
        <div class="mb-12 md:mb-16 relative">
          <!-- Background Compass Stamp — hidden on mobile to prevent overflow -->
          <div class="absolute -top-10 -left-6 opacity-20 erra-compass pointer-events-none hidden md:block">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="50" cy="50" r="40" stroke-dasharray="4 4"/>
              <path d="M50 10 L50 90 M10 50 L90 50 M25 25 L75 75 M25 75 L75 25" opacity="0.3"/>
              <circle cx="50" cy="50" r="8"/>
              <path d="M50 42 L53 58 L47 58 Z" fill="currentColor"/>
            </svg>
          </div>

          <div class="pl-4 border-l border-sepia/30 ml-2 md:ml-12 relative z-10">
            <div class="flex items-center gap-5 mb-4">
              <h2 class="font-serif text-4xl md:text-6xl text-charcoal italic pr-2">${erra.title}</h2>
              <span class="erra-badge font-mono text-xs px-2 py-1 rounded-sm border border-charcoal/20 text-charcoal/70 tracking-widest">${erra.version}</span>
            </div>
            <h3 class="font-serif text-xl md:text-2xl text-sepia mb-4">${erra.description}</h3>
            <p class="erra-tagline font-serif text-base md:text-lg max-w-2xl leading-relaxed">
              ${erra.tagline}
            </p>
          </div>
        </div>

        <!-- Interactive Visualizer Split-Pane -->
        <div class="grid md:grid-cols-2 gap-5 md:gap-8 mb-14 md:mb-20 relative">

          <!-- Left: The Manuscript -->
          <div class="erra-folio-left p-4 sm:p-5 md:p-8 bg-paper border border-charcoal/10 shadow-lg relative flex flex-col justify-between overflow-hidden">
            <div class="erra-tape absolute -top-3 left-8 w-16 h-6 opacity-80 rotate-[-2deg] shadow-sm"></div>

            <div class="overflow-hidden">
              <p class="font-mono text-xs text-charcoal/50 mb-4 md:mb-6 uppercase tracking-widest flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full border border-sepia"></span> The Manuscript
              </p>
              <pre class="erra-code font-mono text-[10px] sm:text-[11px] md:text-[13px] p-3 sm:p-4 md:p-6 rounded-sm overflow-x-auto leading-loose border border-charcoal/10 shadow-inner max-w-full"><code>${renderErraCode(erra.code)}</code></pre>
            </div>

            <button id="trigger-erra-btn" class="erra-solid-btn w-full md:w-auto self-start mt-6 md:mt-8 px-5 md:px-6 py-3 font-mono text-sm tracking-wider transition-all duration-300 flex items-center gap-3 group">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-12 transition-transform">
                <path d="M10 1.5l2.5 2.5-7 7H3v-2.5l7-7z"/>
                <path d="M8.5 3l2.5 2.5" opacity="0.4"/>
                <path d="M3 12.5h8" opacity="0.3"/>
              </svg>
              Trace Ink
            </button>
          </div>

          <!-- Right: The Trail -->
          <div class="erra-folio-right p-5 sm:p-6 md:p-8 bg-paper border border-charcoal/10 shadow-lg relative flex flex-col min-h-[200px] sm:min-h-[240px] md:min-h-[350px] overflow-hidden">
            <p class="font-mono text-xs text-charcoal/50 uppercase tracking-widest relative md:absolute md:top-6 md:left-8 flex items-center gap-2 mb-4 md:mb-0">
              <span class="w-1.5 h-1.5 bg-sepia/50 rounded-full"></span> The Trail
            </p>

            <div class="flex items-center justify-center h-full w-full mt-8">

              <!-- Empty State -->
              <div id="erra-empty-state" class="text-center transition-opacity duration-300">
                <p class="font-serif text-lg text-charcoal/40 italic">Awaiting the collapse...</p>
              </div>

              <!-- Animated Trace (Hidden initially) -->
              <div id="erra-trace-container" class="hidden relative w-full max-w-sm pl-14">

                <!-- Organic SVG Thread -->
                <svg class="absolute top-3 left-[22px] h-[110%] w-12 overflow-visible" preserveAspectRatio="none">
                  <path id="erra-thread" pathLength="100" d="M 0,0 C 15,30 -10,60 5,90 C 20,120 -5,150 0,200" fill="none" stroke="currentColor" class="text-sepia opacity-60" stroke-width="1.5" stroke-dasharray="100" stroke-dashoffset="100" stroke-linecap="round"/>
                </svg>

                <!-- Outer Context Node -->
                <div class="erra-node relative mb-12 opacity-0 translate-y-4">
                  <div class="absolute -left-[40px] top-1.5 w-4 h-4 rounded-full bg-paper border-[1.5px] border-sepia shadow-[0_0_12px_rgba(139,115,85,0.4)] z-10 flex items-center justify-center">
                    <div class="w-1.5 h-1.5 rounded-full bg-sepia"></div>
                  </div>
                  <p class="font-serif text-xl md:text-2xl text-charcoal leading-tight italic mb-1">"${erra.trace.context}"</p>
                  <p class="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Context Node &middot; ${erra.trace.context_type}</p>
                </div>

                <!-- Inner Source Node -->
                <div class="erra-node relative opacity-0 translate-y-4">
                  <div class="absolute -left-[36px] top-2 w-2 h-2 rounded-full bg-charcoal/60 z-10"></div>
                  <p class="font-mono text-[11px] md:text-[13px] text-charcoal/80 leading-tight bg-charcoal/5 px-2 py-1 inline-block rounded mb-1 border border-charcoal/5">${erra.trace.root_cause}</p>
                  <p class="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Root Cause &middot; Type Preserved</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- The Field Note -->
        <div class="relative p-7 md:p-10 border border-charcoal/10 shadow-md bg-paper-dark/30 bloomcraft-shell w-full md:w-4/5 mx-auto md:rotate-[1deg]">
          <!-- Pinned Tape -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-charcoal/10 rotate-[-2deg]"></div>

          <p class="font-mono text-xs text-sepia uppercase tracking-widest mb-4 text-center md:text-left">Field Note</p>
          <div class="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            <div class="flex-1 text-center md:text-left">
              <h4 class="font-serif text-xl md:text-2xl text-charcoal mb-3">${erra.field_note.title}</h4>
              <p class="font-serif text-charcoal/80 leading-relaxed text-base md:text-lg">
                ${erra.field_note.body}
              </p>
            </div>
            <div class="flex-shrink-0 flex flex-row md:flex-col gap-3 w-full md:w-auto justify-center md:justify-start">
              <a href="${erra.links.github}" target="_blank" rel="noopener noreferrer"
                 class="flex items-center gap-2 font-mono text-xs text-charcoal/70 hover:text-sepia transition-colors border border-charcoal/15 hover:border-sepia/40 px-3 py-2 rounded-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                GitHub
              </a>
              <a href="${erra.links.cratesio}" target="_blank" rel="noopener noreferrer"
                 class="flex items-center gap-2 font-mono text-xs text-charcoal/70 hover:text-sepia transition-colors border border-charcoal/15 hover:border-sepia/40 px-3 py-2 rounded-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                crates.io
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  `;
}
