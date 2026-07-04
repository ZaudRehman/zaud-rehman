export default function Hero() {
  return `
    <section id="hero" class="min-h-screen relative flex items-center px-6 md:px-16 lg:px-24 overflow-hidden border-b border-charcoal/10 pt-20">
      
      <!-- Background Motifs -->
      <div class="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-0">
        
        <!-- Hero Background Image -->
        <div class="absolute right-0 top-[5%] w-[420px] h-[420px] md:w-[520px] md:h-[520px] lg:w-[600px] lg:h-[600px] transition-opacity duration-1000" id="hero-dragon-seal">
          <img
            src="/sumi-e/download (6).jpg"
            alt=""
            class="hero-day-img w-full h-full object-contain object-right"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <!-- Foreground Content -->
      <div class="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
        
        <!-- Left: Identity -->
        <div class="flex-1 pt-10">
          <div class="overflow-hidden mb-4">
            <h1 class="text-6xl md:text-8xl lg:text-[110px] font-serif text-charcoal leading-[0.85] tracking-tight opacity-0 translate-y-10" id="hero-name">
              ZAUD<br/>
              <span class="text-sepia">REHMAN</span>
            </h1>
          </div>
          
          <div class="overflow-hidden mb-6 flex items-center gap-4">
            <div class="w-0 h-[1px] bg-sepia opacity-0 origin-left" id="hero-line"></div>
            <h2 class="text-lg md:text-xl font-mono text-sepia tracking-[0.2em] uppercase opacity-0 translate-y-10" id="hero-role">
              Backend/Systems Engineer & Poet
            </h2>
          </div>

          <p class="font-mono text-sm text-charcoal/70 max-w-md leading-relaxed opacity-0" id="hero-sub">
            Building reliable backends, distributed systems, and low-level software with a bias for clarity, performance, and craft.
          </p>
        </div>

        <!-- Right: The Pinned Note -->
        <div class="md:w-5/12 lg:w-1/3 relative mt-12 md:mt-0 opacity-0" id="hero-note-container">
          <div class="p-8 md:p-10 bg-paper border border-charcoal/10 shadow-md relative rotate-2 hero-note-panel">
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
      <div class="absolute bottom-10 left-6 md:left-16 flex flex-col items-center gap-3 opacity-50">
        <div class="w-[1px] h-16 bg-charcoal/20 overflow-hidden relative">
          <div class="absolute top-0 left-0 w-full h-full bg-charcoal hero-scroll-line"></div>
        </div>
        <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-charcoal [writing-mode:vertical-rl]">
          Scroll
        </span>
      </div>
    </section>
  `;
}

export function initHeroParallax() {
  const section = document.getElementById('hero');
  const seal = document.getElementById('hero-dragon-seal');
  if (!section || !seal) return;

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let mx = cx, my = cy;
  let tx = cx, ty = cy;
  let rafId = null;

  section.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function tick() {
    tx += (mx - tx) * 0.06;
    ty += (my - ty) * 0.06;

    const dx = (tx - cx) / cx;
    const dy = (ty - cy) / cy;

    seal.style.transform = `translate(${dx * 18}px, ${dy * 12}px)`;

    rafId = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cx = window.innerWidth / 2;
        cy = window.innerHeight / 2;
        if (!rafId) rafId = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);

  window.addEventListener('resize', () => {
    cx = window.innerWidth / 2;
    cy = window.innerHeight / 2;
  }, { passive: true });
}