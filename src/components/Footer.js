export default function Footer() {
  return `
    <footer class="relative z-10 bg-paper overflow-hidden">

      <!-- Decorative ink divider -->
      <div class="relative h-px w-full">
        <div class="absolute inset-0 bg-charcoal/12"></div>
        <div class="absolute left-1/2 -translate-x-1/2 -top-3 opacity-35">
          <svg width="32" height="6" viewBox="0 0 32 6" fill="none">
            <circle cx="3" cy="3" r="1.5" fill="currentColor" class="text-sepia"/>
            <line x1="8" y1="3" x2="24" y2="3" stroke="currentColor" class="text-sepia" stroke-width="0.5"/>
            <circle cx="29" cy="3" r="1.5" fill="currentColor" class="text-sepia"/>
          </svg>
        </div>
      </div>

      <div class="relative py-24 md:py-32 px-6">

        <!-- Background ink branch motif -->
        <div class="absolute top-0 right-0 w-[480px] h-full pointer-events-none opacity-[0.07] footer-branch-motif hidden md:block" aria-hidden="true">
          <svg viewBox="0 0 480 600" fill="none" stroke="currentColor" class="text-charcoal w-full h-full">
            <path d="M 400,0 C 370,80 340,140 350,220 C 360,300 310,360 290,440 C 270,520 250,580 250,600" stroke-width="1.5" opacity="0.7"/>
            <path d="M 350,220 C 310,200 270,230 220,210" stroke-width="1" opacity="0.5"/>
            <path d="M 340,160 C 370,140 400,150 430,130" stroke-width="0.8" opacity="0.4"/>
            <path d="M 310,340 C 270,330 240,350 200,340" stroke-width="0.9" opacity="0.45"/>
            <path d="M 290,440 C 260,430 230,450 190,435" stroke-width="0.7" opacity="0.35"/>
            <path d="M 220,210 C 200,195 170,200 150,190" stroke-width="0.6" opacity="0.3"/>
            <path d="M 370,100 C 390,85 420,90 440,80" stroke-width="0.5" opacity="0.25"/>
            <!-- Small leaves / buds -->
            <ellipse cx="220" cy="210" rx="6" ry="3" transform="rotate(-20 220 210)" fill="currentColor" opacity="0.12"/>
            <ellipse cx="430" cy="130" rx="5" ry="2.5" transform="rotate(10 430 130)" fill="currentColor" opacity="0.1"/>
            <ellipse cx="200" cy="340" rx="5" ry="3" transform="rotate(-15 200 340)" fill="currentColor" opacity="0.11"/>
            <ellipse cx="190" cy="435" rx="4" ry="2" transform="rotate(5 190 435)" fill="currentColor" opacity="0.09"/>
            <ellipse cx="150" cy="190" rx="4" ry="2" transform="rotate(-25 150 190)" fill="currentColor" opacity="0.08"/>
            <!-- Tiny blossom -->
            <circle cx="440" cy="80" r="2.5" fill="currentColor" opacity="0.1"/>
          </svg>
        </div>

        <!-- Drifting petals (CSS animated) -->
        <div class="footer-petal absolute top-12 left-[12%] pointer-events-none opacity-0 hidden md:block" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="9" rx="7" ry="4" transform="rotate(-30 9 9)" fill="currentColor" class="text-sepia" opacity="0.5"/>
          </svg>
        </div>
        <div class="footer-petal footer-petal--delayed absolute top-24 left-[55%] pointer-events-none opacity-0 hidden md:block" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="9" rx="6" ry="3.5" transform="rotate(20 9 9)" fill="currentColor" class="text-sepia" opacity="0.4"/>
          </svg>
        </div>
        <div class="footer-petal footer-petal--delayed absolute top-8 left-[78%] pointer-events-none opacity-0 hidden md:block" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 18 18" fill="none">
            <ellipse cx="9" cy="9" rx="5" ry="3" transform="rotate(-45 9 9)" fill="currentColor" class="text-sepia" opacity="0.35"/>
          </svg>
        </div>

        <div class="max-w-4xl mx-auto text-center relative z-10">

          <!-- CTA heading with decorative underline -->
          <div class="relative inline-block mb-14">
            <h2 class="font-serif text-4xl md:text-5xl text-charcoal italic">Leave an ink trail.</h2>
            <svg class="absolute -bottom-3 left-0 w-full h-3 opacity-25" viewBox="0 0 300 12" preserveAspectRatio="none">
              <path d="M 0,8 C 60,2 120,10 180,4 C 240,0 280,8 300,6" stroke="currentColor" class="text-sepia" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- Contact links as paper scraps -->
          <div class="flex flex-col md:flex-row justify-center gap-5 md:gap-6 mb-16">

            <a href="mailto:zaudrehman@gmail.com"
               class="footer-scrap group relative inline-flex items-center gap-2 font-mono text-sm px-5 py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5">
              <span class="absolute -top-2 left-4 w-8 h-3 bg-charcoal/8 rotate-[-2deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors">zaudrehman@gmail.com</span>
            </a>

            <a href="https://github.com/ZaudRehman" target="_blank" rel="noopener noreferrer"
               class="footer-scrap group relative inline-flex items-center gap-2 font-mono text-sm px-5 py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5">
              <span class="absolute -top-2 right-6 w-8 h-3 bg-charcoal/8 rotate-[1deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors">GitHub</span>
            </a>

            <a href="https://linkedin.com/in/zaud-rehman-31514a288" target="_blank" rel="noopener noreferrer"
               class="footer-scrap group relative inline-flex items-center gap-2 font-mono text-sm px-5 py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5">
              <span class="absolute -bottom-2 left-6 w-8 h-3 bg-charcoal/8 rotate-[-1deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors">LinkedIn</span>
            </a>

            <a href="/resume.pdf"
               class="footer-scrap group relative inline-flex items-center gap-2 font-mono text-sm px-5 py-3 border border-sepia/30 hover:border-sepia/60 transition-all duration-300 hover:-translate-y-0.5">
              <span class="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-sepia/10 rotate-[0.5deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/70 group-hover:text-sepia transition-colors">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span class="text-sepia/80 group-hover:text-sepia transition-colors">Resume</span>
            </a>
          </div>

          <!-- Colophon -->
          <div class="border-t border-charcoal/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="font-mono text-[11px] text-charcoal/25 tracking-wide">
              Built with vanilla JS, Vite, GSAP & too much coffee
            </p>
            <div class="flex items-center gap-3 font-mono text-[11px] text-charcoal/20">
              <span class="w-1 h-1 rounded-full bg-sepia/30"></span>
              <span>Zaud Rehman &middot; ${new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  `;
}
