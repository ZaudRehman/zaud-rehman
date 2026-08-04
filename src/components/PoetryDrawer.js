import { poems } from '../data/poetry.js';

export default function PoetryDrawer() {
  return `
    <!-- Trigger -->
    <button
      id="poetry-trigger"
      class="poetry-trigger fixed bottom-6 right-6 z-40 p-3 bg-paper border border-sepia/30 rounded-full shadow-lg hover:rotate-12 transition-transform cursor-pointer group"
      title="Open the drawer (P)"
    >
      <span class="text-2xl group-hover:animate-pulse">🕯️</span>
      <span class="poetry-hint absolute -top-8 left-1/2 -translate-x-1/2 font-serif text-[10px] text-sepia/60 italic whitespace-nowrap opacity-0 transition-opacity duration-500 pointer-events-none">Gazebound</span>
      <span class="absolute -top-1 -right-1 font-mono text-[8px] text-charcoal/30 bg-paper border border-charcoal/10 rounded w-3.5 h-3.5 flex items-center justify-center leading-none">P</span>
    </button>

    <!-- Overlay -->
    <div
      id="drawer-overlay"
      class="poetry-overlay fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-40 opacity-0 pointer-events-none transition-opacity duration-500"
    ></div>

    <!-- Drawer -->
    <aside
      id="poetry-drawer"
      class="poetry-drawer fixed top-0 right-0 h-full w-full md:w-[450px] z-50 shadow-2xl drawer-closed transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col border-l border-sepia/20"
    >
      <!-- Close Button -->
      <div class="p-6 md:p-8 flex justify-end">
        <button
          id="close-drawer"
          class="poetry-close font-mono text-sm tracking-widest uppercase hover:underline cursor-pointer z-50"
        >
          [CLOSE]
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-8 md:px-12 pb-12 custom-scrollbar space-y-16">
        <!-- Gazebound -->
        <article class="text-left">
          <h3 class="poetry-title font-serif text-3xl mb-6 italic">${poems.gazebound.title}</h3>
          ${poems.gazebound.lines.map(line => `
            <p class="poetry-line font-serif text-lg mb-3 leading-relaxed">${line}</p>
          `).join('')}
        </article>

        <div class="poetry-divider w-16 h-[1px]"></div>

        <!-- Afsaana (Urdu + Roman) -->
        <article>
          <h3 class="poetry-title font-serif text-3xl mb-8 italic text-left">${poems.afsaana.title}</h3>

          <div class="space-y-8">
            ${poems.afsaana.lines.map(line => `
              <div class="flex flex-col items-end">
                <p
                  class="poetry-urdu font-serif text-2xl mb-1 leading-loose"
                  dir="rtl"
                  lang="ur"
                  style="font-family: 'Noto Nastaliq Urdu', serif;"
                >
                  ${line.script}
                </p>

                <p class="poetry-roman font-mono text-xs tracking-wide text-right uppercase" dir="ltr">
                  ${line.roman}
                </p>
              </div>
            `).join('')}
          </div>

          <!-- English Translation Footer -->
          <div class="poetry-translation-wrap mt-12 pt-6 border-t border-charcoal/10">
            <p class="poetry-translation font-serif text-sm italic leading-relaxed text-center">
              "${poems.afsaana.translation}"
            </p>
          </div>
        </article>
      </div>

      <!-- Footer Note -->
      <div class="poetry-footer p-8 border-t border-charcoal/10">
        <p class="poetry-footer-note font-serif text-sm italic text-center">
          "These are my pauses between commits." - ZR
        </p>
      </div>
    </aside>
  `;
}