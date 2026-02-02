import { poems } from '../data/poetry.js';

export default function PoetryDrawer() {
  return `
    <!-- Trigger -->
    <button id="poetry-trigger" class="fixed bottom-6 right-6 z-40 p-3 bg-paper border border-sepia/30 rounded-full shadow-lg hover:rotate-12 transition-transform cursor-pointer group" title="Open the drawer">
      <span class="text-2xl group-hover:animate-pulse">🕯️</span>
    </button>

    <!-- Overlay -->
    <div id="drawer-overlay" class="fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-40 opacity-0 pointer-events-none transition-opacity duration-500"></div>

    <!-- Drawer -->
    <aside id="poetry-drawer" class="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#f0ebd8] z-50 shadow-2xl drawer-closed transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col border-l border-sepia/20">
      
      <!-- Close Button -->
      <div class="p-6 md:p-8 flex justify-end">
        <button id="close-drawer" class="font-mono text-charcoal/50 hover:text-charcoal text-sm tracking-widest uppercase hover:underline cursor-pointer z-50">
          [CLOSE]
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto px-8 md:px-12 pb-12 custom-scrollbar space-y-16">
        
        <!-- Gazebound -->
        <article class="text-left">
          <h3 class="font-serif text-3xl text-charcoal mb-6 italic">${poems.gazebound.title}</h3>
          ${poems.gazebound.lines.map(line => `<p class="font-serif text-lg text-charcoal/80 mb-3 leading-relaxed">${line}</p>`).join('')}
        </article>

        <div class="w-16 h-[1px] bg-sepia/30"></div>

        <!-- Afsaana (Urdu + Roman) -->
        <article>
          <h3 class="font-serif text-3xl text-charcoal mb-8 italic text-left">${poems.afsaana.title}</h3>
          
          <div class="space-y-8"> <!-- Adds spacing between couplets -->
            ${poems.afsaana.lines.map(line => `
              <div class="flex flex-col items-end">
                
                <!-- Urdu Script -->
                <p class="font-serif text-2xl text-charcoal/90 mb-1 leading-loose" dir="rtl" lang="ur" style="font-family: 'Noto Nastaliq Urdu', serif;">
                  ${line.script}
                </p>
                
                <!-- Roman Urdu Subtitle -->
                <p class="font-mono text-xs text-sepia/80 tracking-wide text-right uppercase" dir="ltr">
                  ${line.roman}
                </p>

              </div>
            `).join('')}
          </div>

          <!-- English Translation Footer -->
          <div class="mt-12 pt-6 border-t border-charcoal/10">
            <p class="font-serif text-sm text-charcoal/60 italic leading-relaxed text-center">
              "${poems.afsaana.translation}"
            </p>
          </div>
        </article>

      </div>

      <!-- Footer Note -->
      <div class="p-8 border-t border-charcoal/10 bg-[#f0ebd8]">
        <p class="font-serif text-sm text-sepia italic text-center">
          "These are my pauses between commits." — ZR
        </p>
      </div>
    </aside>
  `;
}
