export default function Manifesto() {
  return `
    <section class="py-28 px-8 md:px-20 relative overflow-hidden" id="manifesto">

      <!-- Petal layer -->
      <div id="manifesto-petals" class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true"></div>

      <!-- Right-side sakura branch image -->
      <div
        class="absolute right-[-5rem] top-[-2.5rem] hidden lg:block w-[520px] xl:w-[680px] pointer-events-none select-none opacity-[0.82]"
        aria-hidden="true"
      >
        <img
          src="public/Sakura branch Manifesto.png"
          alt=""
          class="w-full h-auto object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>

      <!-- Vertical mark -->
      <div class="absolute left-0 top-24 bottom-24 w-[3px] bg-sepia/20 rounded-full"></div>

      <!-- Section marker -->
      <div class="flex items-center gap-3 mb-16 ml-4">
        <span class="font-mono text-[10px] text-sepia tracking-[0.3em] uppercase">§ 002</span>
        <div class="h-px w-10 bg-sepia/40"></div>
        <span class="font-mono text-[10px] text-sepia/50 tracking-[0.25em] uppercase">Philosophy</span>
      </div>

      <div class="max-w-5xl ml-4 md:ml-8 relative">
        <p class="font-serif text-3xl md:text-5xl leading-[1.22] text-charcoal mb-14" style="font-weight:500">
          I treat code like <em>composition</em>.<br>
          Clean functions. Tight loops.<br>
          <span class="text-charcoal/50">No ornament without purpose.</span>
        </p>

        <div class="manifesto-wind-line mb-14 flex items-center gap-4">
          <div class="h-px flex-1 bg-charcoal/15"></div>
          <svg width="48" height="12" viewBox="0 0 48 12" fill="none" class="text-sepia/50 flex-shrink-0">
            <path d="M0 6 Q12 1 24 6 Q36 11 48 6" stroke="currentColor" stroke-width="0.8" fill="none"/>
            <path d="M0 6 Q12 2 24 6 Q36 10 48 6" stroke="currentColor" stroke-width="0.4" fill="none" opacity="0.4"/>
          </svg>
          <div class="h-px w-8 bg-charcoal/15"></div>
        </div>

        <div class="grid md:grid-cols-2 gap-10 md:gap-16 mb-14">
          <div>
            <p class="font-serif text-lg md:text-xl text-charcoal/80 leading-relaxed mb-6">
              Right now, I’m building
              <span class="font-mono text-sm text-sepia bg-sepia/8 px-1.5 py-0.5 rounded-sm border border-sepia/15">AchronOS</span>,
              a deterministic kernel. I’m also exploring probabilistic data structures in Rust, mostly because I enjoy systems work that rewards precision.
            </p>

            <p class="font-serif text-base text-charcoal/60 leading-relaxed">
              I’m especially drawn to backend and systems problems, distributed coordination, concurrency, low-level execution, and performance work where the details actually matter.
            </p>
          </div>

          <div class="relative">
            <div class="border border-sepia/20 bg-sepia/4 p-5 rounded-sm relative">
              <div class="manifesto-tape absolute -top-2.5 left-4 h-5 w-16 bg-sepia/20 rounded-sm rotate-[-0.5deg]"></div>
              <span class="font-mono text-[9px] text-sepia/60 tracking-widest uppercase block mb-3">After Hours</span>

              <p class="font-serif text-base text-charcoal/75 italic leading-relaxed">
                I write too. Mostly poetry.
                <span class="font-mono text-xs text-sepia not-italic">Gazebound</span>
                and
                <span class="font-mono text-xs text-sepia not-italic">Afsaana</span>
                are two collections that matter a lot to me.
              </p>

              <p class="font-serif text-sm text-charcoal/50 mt-3 leading-relaxed">
                For me, writing and programming come from the same place. Both ask for rhythm, restraint, and care.
              </p>
            </div>

            <div class="mt-6 pl-4 border-l-2 border-sepia/30">
              <p class="font-serif text-sm text-charcoal/55 italic leading-relaxed">
                “To love is to see a universe in a single gaze.<br> To write is simply to leave a lantern burning by its edge.”
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="h-px w-6 bg-charcoal/12"></div>
          <svg width="80" height="10" viewBox="0 0 80 10" fill="none" class="text-sepia/30">
            <path d="M0 5 Q20 1 40 5 Q60 9 80 5" stroke="currentColor" stroke-width="0.7" fill="none"/>
          </svg>
          <div class="h-px flex-1 bg-charcoal/12"></div>
        </div>
      </div>
    </section>
  `;
}

export function initManifesto() {
  const container = document.getElementById('manifesto-petals');
  const section = document.getElementById('manifesto');
  if (!container || !section) return;

  const petalPaths = [
    'M10,0 C14,0 18,4 16,8 C14,12 8,14 4,12 C0,10 -1,5 2,2 C4,0 7,-1 10,0Z',
    'M8,0 C12,2 14,7 11,11 C8,14 2,13 0,9 C-2,5 1,0 5,0 C6,0 7,0 8,0Z',
    'M6,0 C10,1 12,6 9,10 C7,13 2,12 0,8 C-1,4 2,0 6,0Z',
  ];

  const petalColors = ['#f6c8d2', '#ef9fb3', '#fff0f4', '#e9859e'];

  let interval = null;
  let hasStarted = false;

  function spawnPetal() {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '-2 -2 22 18');
    el.style.cssText = `
      position:absolute;
      width:${8 + Math.random() * 8}px;
      height:auto;
      left:${10 + Math.random() * 80}%;
      top:-20px;
      pointer-events:none;
      opacity:0;
      color:${petalColors[Math.floor(Math.random() * petalColors.length)]};
      will-change:transform,opacity;
      filter:blur(${Math.random() > 0.7 ? '0.4px' : '0px'});
    `;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', petalPaths[Math.floor(Math.random() * petalPaths.length)]);
    path.setAttribute('fill', 'currentColor');
    el.appendChild(path);
    container.appendChild(el);

    const drift = (Math.random() - 0.5) * 120;
    const rot = (Math.random() - 0.5) * 420;
    const dur = 8 + Math.random() * 5;

    import('gsap').then(({ default: gsap }) => {
      const peakOpacity = 0.16 + Math.random() * 0.13;

      gsap.to(el, {
        y: window.innerHeight * 0.55 + Math.random() * 180,
        x: drift,
        rotation: rot,
        opacity: peakOpacity,
        duration: dur,
        ease: 'none',
        onComplete: () => el.remove(),
      });

      gsap.to(el, {
        opacity: peakOpacity,
        duration: 1,
        delay: 0.15,
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasStarted) {
        hasStarted = true;
        spawnPetal();
        interval = setInterval(spawnPetal, window.innerWidth < 768 ? 2600 : 1700);
      } else if (!entry.isIntersecting && interval) {
        clearInterval(interval);
        interval = null;
      }
    });
  }, { threshold: 0.15 });

  observer.observe(section);
}