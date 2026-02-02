/**
 * THE SPIRIT STATION UI
 * Fully interactive HTML/CSS overlay managed via DOM events
 */

export default function SpiritUI() {
  // We attach the logic immediately when this string is rendered
  setTimeout(() => {
    initSpiritUILogic();
  }, 100);

  return `
    <div id="spirit-ui-root" class="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between p-8 font-serif select-none">
      
      <!-- TOP BAR -->
      <div class="flex justify-between items-start">
        <!-- Currency Badge -->
        <div class="pointer-events-auto bg-black/30 backdrop-blur-xl text-[#FFE5B4] px-6 py-3 rounded-full border border-[#FFE5B4]/30 shadow-2xl flex items-center gap-4 group transition-all hover:bg-black/50 hover:scale-105">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center shadow-lg group-hover:animate-pulse">
            <span class="text-xl">🔥</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs uppercase tracking-widest opacity-70">Spirit Embers</span>
            <span id="ui-ember-count" class="text-xl font-bold font-mono">0</span>
          </div>
        </div>
        
        <!-- Settings -->
        <div class="pointer-events-auto">
          <button onclick="window.dispatchEvent(new CustomEvent('ui-toggle-sound'))" 
            class="bg-white/10 backdrop-blur-md w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95">
            <span class="text-2xl">⚙️</span>
          </button>
        </div>
      </div>

      <!-- CENTER: SPIRIT INTERACTION (Hidden by default) -->
      <div id="spirit-dialog-container" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 opacity-0 translate-y-10 scale-90" style="display: none;">
        <div class="bg-[#FDF6E3] text-[#2C3E50] p-8 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-lg border-4 border-[#D4AC0D] relative overflow-hidden">
          
          <!-- Decorative Japanese Pattern Background -->
          <div class="absolute inset-0 opacity-5 pointer-events-none" 
            style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgMjBMMjAgME0wIDBMMjAgMjAiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==');">
          </div>

          <!-- Content -->
          <div class="relative z-10 text-center">
            <div class="w-16 h-16 bg-[#2C3E50] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg border-2 border-[#D4AC0D]">
              👻
            </div>
            
            <h3 class="text-3xl font-bold mb-2 font-serif text-[#D4AC0D]">A Guest Arrives</h3>
            <p id="spirit-message" class="text-xl italic text-gray-600 mb-8 leading-relaxed font-light">
              "The journey was long... I can barely float..."
            </p>
            
            <div class="grid grid-cols-2 gap-4">
              <button id="btn-offer-tea" class="group relative overflow-hidden bg-[#D4AC0D] text-white py-4 rounded-xl font-bold shadow-lg transform transition-all hover:scale-105 hover:shadow-xl active:scale-95">
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span class="relative flex items-center justify-center gap-2">
                  <span class="text-xl">🍵</span> Offer Tea
                </span>
              </button>
              
              <button id="btn-dismiss" class="group bg-[#E5E7EB] text-gray-600 py-4 rounded-xl font-bold hover:bg-[#D1D5DB] transition-all hover:text-gray-800 active:scale-95">
                <span>Wave Goodbye</span>
              </button>
            </div>
          </div>

          <!-- Speech Bubble Tail -->
          <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FDF6E3] rotate-45 border-b-4 border-r-4 border-[#D4AC0D]"></div>
        </div>
      </div>

      <!-- BOTTOM BAR: DOCK -->
      <div class="pointer-events-auto flex justify-center gap-6 pb-4">
        <button class="dock-btn group relative bg-white/10 hover:bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/20 transition-all hover:-translate-y-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          <span class="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform block">🪑</span>
          <span class="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2C3E50] text-[#FFE5B4] text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl font-bold tracking-wider transform translate-y-2 group-hover:translate-y-0">
            DECOR SHOP
          </span>
        </button>

        <button class="dock-btn group relative bg-white/10 hover:bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/20 transition-all hover:-translate-y-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          <span class="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform block">📜</span>
          <span class="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2C3E50] text-[#FFE5B4] text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl font-bold tracking-wider transform translate-y-2 group-hover:translate-y-0">
            MANIFEST
          </span>
        </button>

        <button class="dock-btn group relative bg-white/10 hover:bg-white/20 backdrop-blur-xl p-4 rounded-2xl border border-white/20 transition-all hover:-translate-y-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          <span class="text-4xl filter drop-shadow-lg group-hover:scale-110 transition-transform block">🚂</span>
          <span class="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2C3E50] text-[#FFE5B4] text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl font-bold tracking-wider transform translate-y-2 group-hover:translate-y-0">
            CALL TRAIN
          </span>
        </button>
      </div>

    </div>
  `;
}

// Logic injection (runs after HTML insertion)
function initSpiritUILogic() {
  const state = {
    embers: 0,
    currentSpirit: null
  };

  const els = {
    dialog: document.getElementById('spirit-dialog-container'),
    emberCount: document.getElementById('ui-ember-count'),
    btnTea: document.getElementById('btn-offer-tea'),
    btnDismiss: document.getElementById('btn-dismiss')
  };

  // Event Listener: Spirit Arrival
  window.addEventListener('spirit-arrived', (e) => {
    state.currentSpirit = e.detail.type;
    showDialog();
  });

  // Action: Offer Tea
  els.btnTea?.addEventListener('click', () => {
    state.embers += 15;
    updateEmbers();
    hideDialog();
    window.dispatchEvent(new CustomEvent('spirit-action', { detail: { action: 'tea' } }));
  });

  // Action: Dismiss
  els.btnDismiss?.addEventListener('click', () => {
    hideDialog();
    window.dispatchEvent(new CustomEvent('spirit-action', { detail: { action: 'dismiss' } }));
  });

  function showDialog() {
    if (!els.dialog) return;
    els.dialog.style.display = 'block';
    // Force reflow
    void els.dialog.offsetWidth;
    els.dialog.classList.remove('opacity-0', 'translate-y-10', 'scale-90');
    els.dialog.classList.add('opacity-100', 'translate-y-0', 'scale-100');
  }

  function hideDialog() {
    if (!els.dialog) return;
    els.dialog.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
    els.dialog.classList.add('opacity-0', 'translate-y-10', 'scale-90');
    setTimeout(() => {
      els.dialog.style.display = 'none';
    }, 500);
  }

  function updateEmbers() {
    if (els.emberCount) {
      els.emberCount.textContent = state.embers;
      // Animate counter
      els.emberCount.classList.add('text-yellow-300', 'scale-125');
      setTimeout(() => els.emberCount.classList.remove('text-yellow-300', 'scale-125'), 300);
    }
  }
}
