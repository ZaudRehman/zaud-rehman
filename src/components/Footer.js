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


        <!-- ═══════ BOTTOM GARDEN ═══════ -->
        <div class="absolute bottom-0 left-0 w-full h-[280px] md:h-[360px] pointer-events-none overflow-hidden flora-garden" aria-hidden="true">

          <!-- Back row (taller, more transparent) -->
          <img src="/flora/bottom/pink-morning-glory.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[-2%] h-[200px] md:h-[280px] w-auto object-contain object-bottom opacity-50" loading="lazy"/>
          <img src="/flora/bottom/pink-daisies-lavender.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[8%] h-[190px] md:h-[260px] w-auto object-contain object-bottom opacity-45" loading="lazy"/>
          <img src="/flora/bottom/pink-cosmos.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[18%] h-[200px] md:h-[270px] w-auto object-contain object-bottom opacity-40" loading="lazy"/>
          <img src="/flora/bottom/yellow-daisies.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[28%] h-[180px] md:h-[250px] w-auto object-contain object-bottom opacity-45" loading="lazy"/>
          <img src="/flora/bottom/white-cream-vine.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[38%] h-[190px] md:h-[260px] w-auto object-contain object-bottom opacity-40" loading="lazy"/>
          <img src="/flora/bottom/yellow-poppies-purple.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[48%] h-[200px] md:h-[270px] w-auto object-contain object-bottom opacity-50" loading="lazy"/>
          <img src="/flora/bottom/pink-morning-glory.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[58%] h-[190px] md:h-[260px] w-auto object-contain object-bottom opacity-40" loading="lazy"/>
          <img src="/flora/bottom/pink-daisies-lavender.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[68%] h-[200px] md:h-[270px] w-auto object-contain object-bottom opacity-45" loading="lazy"/>
          <img src="/flora/bottom/pink-cosmos.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[78%] h-[180px] md:h-[250px] w-auto object-contain object-bottom opacity-40" loading="lazy"/>
          <img src="/flora/bottom/yellow-daisies.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[88%] h-[190px] md:h-[260px] w-auto object-contain object-bottom opacity-45" loading="lazy"/>
          <img src="/flora/bottom/pink-morning-glory.png" alt="" class="flora-img flora-sway absolute bottom-[-20px] left-[98%] h-[200px] md:h-[270px] w-auto object-contain object-bottom opacity-50" loading="lazy"/>

          <!-- Mid row -->
          <img src="/flora/bottom/pink-blue-bouquet.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[3%] h-[160px] md:h-[220px] w-auto object-contain object-bottom opacity-60" loading="lazy"/>
          <img src="/flora/bottom/blue-hydrangeas.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[14%] h-[130px] md:h-[180px] w-auto object-contain object-bottom opacity-55" loading="lazy"/>
          <img src="/flora/bottom/light-blue-hydrangeas.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[25%] h-[140px] md:h-[190px] w-auto object-contain object-bottom opacity-55" loading="lazy"/>
          <img src="/flora/bottom/blue-flax.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[36%] h-[130px] md:h-[180px] w-auto object-contain object-bottom opacity-60" loading="lazy"/>
          <img src="/flora/bottom/blue-hydrangeas.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[47%] h-[140px] md:h-[190px] w-auto object-contain object-bottom opacity-55" loading="lazy"/>
          <img src="/flora/bottom/pink-blue-bouquet.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[58%] h-[130px] md:h-[180px] w-auto object-contain object-bottom opacity-55" loading="lazy"/>
          <img src="/flora/bottom/light-blue-hydrangeas.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[69%] h-[160px] md:h-[220px] w-auto object-contain object-bottom opacity-60" loading="lazy"/>
          <img src="/flora/bottom/blue-flax.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[80%] h-[130px] md:h-[180px] w-auto object-contain object-bottom opacity-55" loading="lazy"/>
          <img src="/flora/bottom/blue-hydrangeas.png" alt="" class="flora-img flora-sway absolute bottom-[-10px] left-[91%] h-[140px] md:h-[190px] w-auto object-contain object-bottom opacity-55" loading="lazy"/>

          <!-- Front row (shorter, more visible) -->
          <img src="/flora/bottom/pink-hollyhock.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[2%] h-[120px] md:h-[160px] w-auto object-contain object-bottom opacity-75" loading="lazy"/>
          <img src="/flora/bottom/pink-buds-branch.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[12%] h-[110px] md:h-[150px] w-auto object-contain object-bottom opacity-70" loading="lazy"/>
          <img src="/flora/bottom/yellow-wildflowers.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[22%] h-[120px] md:h-[160px] w-auto object-contain object-bottom opacity-70" loading="lazy"/>
          <img src="/flora/bottom/white-daisies.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[32%] h-[110px] md:h-[150px] w-auto object-contain object-bottom opacity-75" loading="lazy"/>
          <img src="/flora/bottom/pink-hollyhock.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[42%] h-[110px] md:h-[150px] w-auto object-contain object-bottom opacity-70" loading="lazy"/>
          <img src="/flora/bottom/yellow-wildflowers.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[52%] h-[120px] md:h-[160px] w-auto object-contain object-bottom opacity-75" loading="lazy"/>
          <img src="/flora/bottom/pink-buds-branch.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[62%] h-[110px] md:h-[150px] w-auto object-contain object-bottom opacity-70" loading="lazy"/>
          <img src="/flora/bottom/white-daisies.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[72%] h-[120px] md:h-[160px] w-auto object-contain object-bottom opacity-75" loading="lazy"/>
          <img src="/flora/bottom/pink-hollyhock.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[82%] h-[110px] md:h-[150px] w-auto object-contain object-bottom opacity-70" loading="lazy"/>
          <img src="/flora/bottom/yellow-wildflowers.png" alt="" class="flora-img flora-sway absolute bottom-0 left-[92%] h-[120px] md:h-[160px] w-auto object-contain object-bottom opacity-75" loading="lazy"/>
        </div>

        <!-- Gradient fade for text readability -->
        <div class="absolute bottom-0 left-0 w-full h-48 flora-fade pointer-events-none" aria-hidden="true"></div>

        <!-- ═══════ CONTENT ═══════ -->
        <div class="max-w-4xl mx-auto text-center relative z-10">

          <!-- CTA heading with decorative underline -->
          <div class="relative inline-block mb-14">
            <h2 class="font-serif text-4xl md:text-5xl text-charcoal italic">Leave an ink trail.</h2>
            <svg class="absolute -bottom-3 left-0 w-full h-3 opacity-25" viewBox="0 0 300 12" preserveAspectRatio="none">
              <path d="M 0,8 C 60,2 120,10 180,4 C 240,0 280,8 300,6" stroke="currentColor" class="text-sepia" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
          </div>

          <!-- Contact links as paper scraps -->
          <div class="grid grid-cols-2 md:flex md:flex-row justify-center gap-3 md:gap-6 mb-16">

            <button type="button" id="open-contact-modal"
               class="footer-scrap group relative inline-flex items-center justify-center gap-1.5 md:gap-2 font-mono text-xs md:text-sm px-3 md:px-5 py-2.5 md:py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5 min-w-0 col-span-2 md:col-span-1 cursor-pointer">
              <span class="absolute -top-2 left-4 w-8 h-3 bg-charcoal/8 rotate-[-2deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors shrink-0">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors truncate">zaudrehman@gmail.com</span>
            </button>

            <a href="https://github.com/ZaudRehman" target="_blank" rel="noopener noreferrer"
               class="footer-scrap group relative inline-flex items-center justify-center gap-1.5 md:gap-2 font-mono text-xs md:text-sm px-3 md:px-5 py-2.5 md:py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5 min-w-0">
              <span class="absolute -top-2 right-6 w-8 h-3 bg-charcoal/8 rotate-[1deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors shrink-0">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors truncate">GitHub</span>
            </a>

            <a href="https://linkedin.com/in/zaud-rehman-31514a288" target="_blank" rel="noopener noreferrer"
               class="footer-scrap group relative inline-flex items-center justify-center gap-1.5 md:gap-2 font-mono text-xs md:text-sm px-3 md:px-5 py-2.5 md:py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5 min-w-0">
              <span class="absolute -bottom-2 left-6 w-8 h-3 bg-charcoal/8 rotate-[-1deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors shrink-0">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors truncate">LinkedIn</span>
            </a>

            <a href="https://zaud-rehman.hashnode.dev/" target="_blank" rel="noopener noreferrer"
               class="footer-scrap group relative inline-flex items-center justify-center gap-1.5 md:gap-2 font-mono text-xs md:text-sm px-3 md:px-5 py-2.5 md:py-3 border border-charcoal/12 hover:border-sepia/40 transition-all duration-300 hover:-translate-y-0.5 min-w-0">
              <span class="absolute -top-2 left-4 w-8 h-3 bg-charcoal/8 rotate-[2deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/60 group-hover:text-sepia transition-colors shrink-0">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span class="text-charcoal/70 group-hover:text-charcoal transition-colors truncate">Blog</span>
            </a>

            <a href="/resume.pdf"
               class="footer-scrap group relative inline-flex items-center justify-center gap-1.5 md:gap-2 font-mono text-xs md:text-sm px-3 md:px-5 py-2.5 md:py-3 border border-sepia/30 hover:border-sepia/60 transition-all duration-300 hover:-translate-y-0.5 min-w-0">
              <span class="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-sepia/10 rotate-[0.5deg]"></span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-sepia/70 group-hover:text-sepia transition-colors shrink-0">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span class="text-sepia/80 group-hover:text-sepia transition-colors truncate">Resume</span>
            </a>
          </div>

          <!-- Colophon -->
          <div class="border-t border-charcoal/10 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="font-mono text-[11px] text-charcoal/40 tracking-wide">
              Built with vanilla JS, Vite, GSAP & too much coffee
            </p>
            <div class="flex items-center gap-3 font-mono text-[11px] text-charcoal/35">
              <span class="w-1 h-1 rounded-full bg-sepia/40"></span>
              <span>Zaud Rehman &middot; ${new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
      </div>
    </footer>

    <!-- ═══════ CONTACT MODAL ═══════ -->
    <div id="contact-modal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Contact form">
      <!-- Overlay -->
      <div id="contact-overlay" class="absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300"></div>

      <!-- Modal panel -->
      <div class="contact-modal-panel relative w-full max-w-2xl bg-paper border border-charcoal/10 shadow-2xl z-10 overflow-hidden rotate-[0.3deg]">
        <!-- Tape strip -->
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-[18px] bg-sepia/10 rotate-[-1.5deg] rounded-sm"></div>

        <div class="flex flex-col md:flex-row">

          <!-- Left decorative column -->
          <div class="contact-modal-decor hidden md:flex md:w-2/5 flex-col items-center justify-center px-6 py-10 relative">
            <!-- Paper grain -->
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E&quot;);"></div>

            <!-- Ink brush flourish -->
            <svg class="contact-modal-ink-flourish mb-8 opacity-20" width="2" height="80" viewBox="0 0 2 80" fill="none">
              <line x1="1" y1="0" x2="1" y2="80" stroke="currentColor" class="text-sepia" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="1" cy="0" r="1.5" fill="currentColor" class="text-sepia"/>
              <circle cx="1" cy="80" r="1" fill="currentColor" class="text-sepia"/>
            </svg>

            <p class="font-serif text-base italic text-charcoal/60 text-center leading-relaxed max-w-[200px]">
              "Every message is a thread in the weave."
            </p>

            <div class="mt-6 w-8 h-[1px] bg-sepia/25"></div>

            <p class="mt-4 font-mono text-[9px] text-charcoal/30 tracking-wider uppercase">
              zaudrehman@gmail.com
            </p>
          </div>

          <!-- Right form column -->
          <div class="md:w-3/5 relative">
            <!-- Close button -->
            <button id="close-contact-modal" class="contact-close-btn absolute top-4 right-4 font-mono text-[10px] text-charcoal/30 hover:text-charcoal tracking-widest uppercase transition-colors z-20" aria-label="Close">
              [CLOSE]
            </button>

            <!-- Header -->
            <div class="px-6 pt-6 pb-4 md:pt-8">
              <div class="relative inline-block">
                <h3 class="font-serif text-2xl text-charcoal italic">Leave a note</h3>
                <!-- Brush underline -->
                <svg class="absolute -bottom-1 left-0 w-full h-2 opacity-25" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M 0,5 C 30,2 60,7 100,3 C 140,0 170,6 200,4" stroke="currentColor" class="text-sepia" stroke-width="1.5" fill="none" stroke-linecap="round"/>
                </svg>
              </div>
              <p class="font-mono text-[10px] text-charcoal/35 mt-3 tracking-[0.15em] uppercase">I'll write back</p>
            </div>

            <!-- Form -->
            <form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" class="px-6 pb-6 pt-2 space-y-5">
              <div class="grid grid-cols-2 gap-x-4 gap-y-5">
                <div class="contact-input-wrap">
                  <label for="contact-name" class="block font-mono text-[10px] text-charcoal/45 uppercase tracking-[0.15em] mb-2">Name</label>
                  <input type="text" name="name" id="contact-name" required
                         class="w-full bg-transparent border-b border-charcoal/12 focus:border-sepia/50 outline-none font-serif text-sm text-charcoal py-2 transition-colors placeholder:text-charcoal/18"
                         placeholder="Your name"/>
                </div>
                <div class="contact-input-wrap">
                  <label for="contact-email" class="block font-mono text-[10px] text-charcoal/45 uppercase tracking-[0.15em] mb-2">Email</label>
                  <input type="email" name="email" id="contact-email" required
                         class="w-full bg-transparent border-b border-charcoal/12 focus:border-sepia/50 outline-none font-serif text-sm text-charcoal py-2 transition-colors placeholder:text-charcoal/18"
                         placeholder="you@example.com"/>
                </div>
              </div>

              <div class="contact-input-wrap">
                <label for="contact-title" class="block font-mono text-[10px] text-charcoal/45 uppercase tracking-[0.15em] mb-2">Title</label>
                <input type="text" name="title" id="contact-title" required
                       class="w-full bg-transparent border-b border-charcoal/12 focus:border-sepia/50 outline-none font-serif text-sm text-charcoal py-2 transition-colors placeholder:text-charcoal/18"
                       placeholder="What's this about?"/>
              </div>

              <div class="contact-input-wrap">
                <label for="contact-message" class="block font-mono text-[10px] text-charcoal/45 uppercase tracking-[0.15em] mb-2">Message</label>
                <textarea name="message" id="contact-message" rows="4" required
                          class="w-full bg-transparent border-b border-charcoal/12 focus:border-sepia/50 outline-none font-serif text-sm text-charcoal py-2 transition-colors resize-none placeholder:text-charcoal/18"
                          placeholder="Write something..."></textarea>
              </div>

              <div class="flex items-center justify-between pt-3">
                <p id="contact-status" class="font-mono text-[10px] text-charcoal/35"></p>
                <button type="submit"
                        class="contact-send-btn font-mono text-[11px] px-6 py-2.5 border border-sepia/30 text-sepia/70 hover:bg-sepia hover:text-paper hover:border-sepia transition-all duration-300 tracking-[0.2em] uppercase">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
