export default function Hero() {
  return `
    <section class="min-h-screen relative flex items-center px-6 md:px-16 lg:px-24 overflow-hidden border-b border-charcoal/10 pt-20">
      
      <!-- Background Motifs -->
      <div class="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-0">
        
        <!-- Subtle Dragon / Enso Seal -->
        <div class="absolute -right-32 top-10 w-[600px] h-[600px] opacity-[0.03] text-charcoal transition-opacity duration-1000" id="hero-dragon-seal">
          <svg viewBox="0 0 500 500" fill="none" stroke="currentColor" stroke-width="1.5">
            <!-- Mythic geometric/draconic crest representation -->
            <circle cx="250" cy="250" r="200" stroke-dasharray="2 6" />
            <circle cx="250" cy="250" r="180" opacity="0.5"/>
            <path d="M 250,50 C 350,150 450,250 250,450 C 50,250 150,150 250,50 Z" opacity="0.3"/>
            <path d="M 150,250 Q 250,100 350,250 Q 250,400 150,250 Z" opacity="0.5"/>
            <circle cx="250" cy="250" r="40" />
            <circle cx="250" cy="250" r="10" fill="currentColor"/>
          </svg>
        </div>

        <!-- Plum Blossom Branch Silhouette -->
        <div class="absolute right-0 top-0 w-64 md:w-96 opacity-10 text-charcoal transition-opacity duration-1000" id="hero-branch">
          <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M 200,20 C 150,40 120,80 80,90 C 50,95 20,80 -10,110" />
            <path d="M 140,50 C 120,30 90,20 70,-10" />
            <path d="M 100,85 C 100,110 130,130 150,150" />
            <!-- Blossoms -->
            <circle cx="150" cy="40" r="3" fill="currentColor"/>
            <circle cx="80" cy="90" r="4" fill="currentColor"/>
            <circle cx="120" cy="110" r="2" fill="currentColor"/>
            <circle cx="140" cy="140" r="3" fill="currentColor"/>
          </svg>
        </div>
      </div>

      <!-- Foreground Content -->
      <div class="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        
        <!-- Left: Identity -->
        <div class="flex-1 pt-10">
          <div class="overflow-hidden mb-6">
            <h1 class="text-6xl md:text-8xl lg:text-[110px] font-serif text-charcoal leading-[0.85] tracking-tight opacity-0 translate-y-10" id="hero-name">
              ZAUD<br/>REHMAN
            </h1>
          </div>
          
          <div class="overflow-hidden mb-8 flex items-center gap-4">
            <div class="w-12 h-[1px] bg-sepia opacity-0 origin-left" id="hero-line"></div>
            <h2 class="text-lg md:text-xl font-mono text-sepia tracking-[0.2em] uppercase opacity-0 translate-y-10" id="hero-role">
              Systems Engineer & Poet
            </h2>
          </div>

          <p class="font-mono text-sm text-charcoal/60 max-w-md leading-relaxed opacity-0" id="hero-sub">
            Specializing in High-Performance Rust, Distributed Systems, and Low-Level Architecture.
          </p>
        </div>

        <!-- Right: The Pinned Note -->
        <div class="md:w-5/12 lg:w-1/3 relative mt-16 md:mt-0 opacity-0" id="hero-note-container">
          <div class="p-8 md:p-10 bg-paper border border-charcoal/10 shadow-lg relative rotate-2 hero-note-panel">
             <!-- Archival Tape -->
             <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-charcoal/10 rotate-[-3deg]"></div>
             
             <p class="font-mono text-[10px] uppercase tracking-widest text-sepia mb-6 flex items-center gap-2">
               <span class="w-1.5 h-1.5 bg-sepia rounded-full"></span> Entry 01
             </p>
             <div class="h-[120px] font-serif text-xl md:text-2xl text-charcoal/90 italic leading-relaxed" id="hero-poem">
               <!-- GSAP typing target -->
             </div>
          </div>
        </div>

      </div>

      <!-- Left Edge Scroll Indicator -->
      <div class="absolute bottom-10 left-6 md:left-16 flex items-center gap-4 opacity-50">
         <div class="w-[1px] h-16 bg-charcoal/20 overflow-hidden relative">
           <div class="absolute top-0 left-0 w-full h-full bg-charcoal hero-scroll-line"></div>
         </div>
         <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-charcoal -rotate-90 origin-left translate-y-8 translate-x-3">Scroll</span>
      </div>
    </section>
  `;
}