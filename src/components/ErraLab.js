export default function ErraLab() {
  return `
    <section id="erra" class="erra-shell py-32 relative overflow-hidden mb-20 border-y border-charcoal/10 bg-paper-dark/30">
      <div class="max-w-6xl mx-auto px-6 relative z-10">

        <!-- Header: Storybook Vibe -->
        <div class="mb-16 relative">
          <!-- Background Compass Stamp -->
          <div class="absolute -top-10 -left-6 opacity-20 erra-compass pointer-events-none">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="50" cy="50" r="40" stroke-dasharray="4 4"/>
              <path d="M50 10 L50 90 M10 50 L90 50 M25 25 L75 75 M25 75 L75 25" opacity="0.3"/>
              <circle cx="50" cy="50" r="8"/>
              <path d="M50 42 L53 58 L47 58 Z" fill="currentColor"/>
            </svg>
          </div>
          
          <div class="pl-4 border-l border-sepia/30 ml-6 md:ml-12 relative z-10">
            <div class="flex items-center gap-5 mb-4">
              <h2 class="font-serif text-5xl md:text-6xl text-charcoal italic pr-2">erra</h2>
              <span class="erra-badge font-mono text-xs px-2 py-1 rounded-sm border border-charcoal/20 text-charcoal/70 tracking-widest">v0.2.0</span>
            </div>
            <h3 class="font-serif text-2xl text-sepia mb-4">When systems fail, I keep the shape of the failure.</h3>
            <p class="erra-tagline font-serif text-lg max-w-2xl leading-relaxed">
              Typed errors, annotated like margin notes. No <code>Box&lt;dyn Error&gt;</code>. No forced allocations on the happy path. Just a clean, unspooling ink trail mapping the collapse.
            </p>
          </div>
        </div>

        <!-- Interactive Visualizer Split-Pane -->
        <div class="grid md:grid-cols-2 gap-8 mb-20 relative">

          <!-- Left: The Manuscript -->
          <div class="erra-folio-left p-8 bg-paper border border-charcoal/10 shadow-lg relative flex flex-col justify-between">
            <div class="erra-tape absolute -top-3 left-8 w-16 h-6 opacity-80 rotate-[-2deg] shadow-sm"></div>

            <div>
              <p class="font-mono text-xs text-charcoal/50 mb-6 uppercase tracking-widest flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full border border-sepia"></span> The Manuscript
              </p>
              <pre class="erra-code font-mono text-[13px] md:text-sm p-6 rounded-sm overflow-x-auto leading-loose border border-charcoal/10 shadow-inner"><code><span class="opacity-50">fn</span> <span class="text-charcoal font-bold">read_config</span>() <span class="opacity-50">-></span> Result&lt;Config, Error&lt;io::Error&gt;&gt; {
    fs::read_to_string(<span class="text-sepia">"config.toml"</span>)
        <span class="erra-highlight px-1 py-0.5 rounded transition-colors duration-300 relative">.annotate(<span class="text-sepia">"failed to read config file"</span>)?</span>;

    <span class="opacity-50">// ...</span>
}</code></pre>
            </div>

            <button id="trigger-erra-btn" class="erra-solid-btn w-full md:w-auto self-start mt-8 px-6 py-3 font-mono text-sm tracking-wider transition-all duration-300 flex items-center gap-3 group">
              <span class="group-hover:rotate-12 transition-transform">🖋️</span> Trace Ink
            </button>
          </div>

          <!-- Right: The Trail -->
          <div class="erra-folio-right p-8 bg-paper border border-charcoal/10 shadow-lg relative flex flex-col min-h-[350px] overflow-hidden">
            <p class="font-mono text-xs text-charcoal/50 uppercase tracking-widest absolute top-8 left-8 flex items-center gap-2">
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
                  <p class="font-serif text-2xl text-charcoal leading-tight italic mb-1">"failed to read config file"</p>
                  <p class="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Context Node &middot; Cow&lt;'static, str&gt;</p>
                </div>

                <!-- Inner Source Node -->
                <div class="erra-node relative opacity-0 translate-y-4">
                  <div class="absolute -left-[36px] top-2 w-2 h-2 rounded-full bg-charcoal/60 z-10"></div>
                  <p class="font-mono text-[13px] text-charcoal/80 leading-tight bg-charcoal/5 px-2 py-1 inline-block rounded mb-1 border border-charcoal/5">io::Error { kind: NotFound }</p>
                  <p class="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Root Cause &middot; Type Preserved</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- The Field Note (Replaces generic block) -->
        <div class="relative p-10 border border-charcoal/10 shadow-md bg-paper-dark/30 bloomcraft-shell md:w-4/5 mx-auto rotate-[1deg]">
          <!-- Pinned Tape -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-charcoal/10 rotate-[-2deg]"></div>
          
          <p class="font-mono text-xs text-sepia uppercase tracking-widest mb-4 text-center md:text-left">Field Note</p>
          <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div class="flex-1 text-center md:text-left">
              <h4 class="font-serif text-2xl text-charcoal mb-3">The elegance of zero-cost.</h4>
              <p class="font-serif text-charcoal/80 leading-relaxed text-lg">
                Because <code>annotate</code> takes a closure or static string, returning <code>Ok(T)</code> incurs exactly <strong>0 bytes</strong> of overhead compared to raw returns. The context only materializes when the path collapses.
              </p>
            </div>
            <div class="mt-4 md:mt-0 flex-shrink-0">
               <a href="https://github.com/ZaudRehman/erra" target="_blank" rel="noopener noreferrer" class="font-mono text-sm text-sepia hover:text-charcoal transition-colors border-b border-sepia/30 hover:border-charcoal pb-1">
                [ Read the benchmarks ]
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  `;
}