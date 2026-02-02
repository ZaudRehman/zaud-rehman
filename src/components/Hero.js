export default function Hero() {
  return `
    <section class="min-h-screen flex flex-col justify-center items-center px-6 relative">
      <div class="max-w-3xl w-full text-center">
        <!-- Poetry Intro (Typewriter Target) -->
        <div class="h-24 mb-8 font-serif text-2xl md:text-3xl text-charcoal italic opacity-80" id="hero-poem">
          <!-- GSAP will inject text here -->
        </div>
        
        <!-- Name Reveal -->
        <div class="overflow-hidden">
          <h1 class="wind text-6xl md:text-8xl font-serif text-charcoal mb-4 opacity-0 translate-y-10" id="hero-name">
            ZAUD REHMAN
          </h1>
        </div>
        
        <!-- Role -->
        <div class="overflow-hidden">
          <h2 class="wind text-xl md:text-2xl font-mono text-sepia tracking-widest uppercase mb-8 opacity-0 translate-y-10" id="hero-role">
            Backend Engineer
          </h2>
        </div>

        <!-- Description (Changes with Day/Night) -->
        <p class="font-mono text-sm text-charcoal/60 opacity-0 max-w-lg mx-auto leading-relaxed" id="hero-sub">
          Specializing in High-Performance Rust, Distributed Systems, and Low-Level Architecture.
        </p>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </div>
    </section>
  `;
}
