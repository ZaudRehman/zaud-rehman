import { bloomcraft } from '../data/bloomcraft.js';

export default function BloomCraftLab() {
  // Create stats cards from info object
  const statsHtml = `
    <div class="bg-paper p-6 border border-charcoal/10 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
      <div class="absolute top-0 left-0 w-full h-1 bg-sepia/20 group-hover:bg-sepia transition-colors"></div>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.total_filters}+</h4>
      <p class="font-serif text-lg text-sepia mb-2">Filter Variants</p>
      <p class="font-mono text-xs text-charcoal/50">Production-grade implementations</p>
    </div>
    <div class="bg-paper p-6 border border-charcoal/10 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
      <div class="absolute top-0 left-0 w-full h-1 bg-sepia/20 group-hover:bg-sepia transition-colors"></div>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.hash_algorithms}</h4>
      <p class="font-serif text-lg text-sepia mb-2">Hash Algorithms</p>
      <p class="font-mono text-xs text-charcoal/50">XXHash3, WyHash, SipHash, SIMD</p>
    </div>
    <div class="bg-paper p-6 border border-charcoal/10 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
      <div class="absolute top-0 left-0 w-full h-1 bg-sepia/20 group-hover:bg-sepia transition-colors"></div>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.concurrent_variants}</h4>
      <p class="font-serif text-lg text-sepia mb-2">Concurrent Patterns</p>
      <p class="font-mono text-xs text-charcoal/50">Lock-free, sharded, striped</p>
    </div>
    <div class="bg-paper p-6 border border-charcoal/10 shadow-sm relative group hover:-translate-y-1 transition-transform duration-300">
      <div class="absolute top-0 left-0 w-full h-1 bg-sepia/20 group-hover:bg-sepia transition-colors"></div>
      <h4 class="font-mono text-3xl text-charcoal mb-1">${bloomcraft.info.specialized_variants}</h4>
      <p class="font-serif text-lg text-sepia mb-2">Specialized Filters</p>
      <p class="font-mono text-xs text-charcoal/50">Tree, partitioned, scalable</p>
    </div>
  `;

  const highlightsHtml = bloomcraft.highlights.map(h => `
    <li class="flex items-start gap-3 font-mono text-sm text-charcoal/80 mb-3">
      <span class="text-gold mt-1">➢</span> ${h}
    </li>
  `).join('');

  return `
    <section class="py-32 relative overflow-hidden my-20 border-y border-charcoal/10 bg-paper-dark/30">
      <!-- Graph Paper Background -->
      <div class="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-30 pointer-events-none"></div>

      <div class="max-w-6xl mx-auto px-6 relative z-10">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
          <div>
            <h2 class="font-serif text-5xl md:text-6xl text-charcoal mb-2">${bloomcraft.title}</h2>
            <h3 class="font-serif text-2xl text-sepia italic">${bloomcraft.subtitle}</h3>
          </div>
          
          <!-- Stamp -->
          <div class="border-4 border-red-800/60 p-4 -rotate-3 stamp rounded-sm backdrop-blur-sm">
            <span class="font-mono font-bold text-red-800/80 tracking-widest uppercase text-sm">Active Research</span>
          </div>
        </div>

        <p class="font-serif text-xl max-w-3xl mb-12 leading-relaxed text-charcoal/90">
          ${bloomcraft.tagline}
        </p>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          ${statsHtml}
        </div>

        <div class="grid md:grid-cols-2 gap-12 bg-paper p-8 border border-charcoal/10 shadow-lg relative">
          <!-- Hand-drawn corner tape -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e8e0cc] opacity-80 rotate-1 shadow-sm"></div>

          <div>
            <h4 class="font-serif text-xl mb-6 border-b border-charcoal/10 pb-2">Technical Highlights</h4>
            <ul>${highlightsHtml}</ul>
          </div>

          <div class="flex flex-col justify-between">
            <div>
              <h4 class="font-serif text-xl mb-6 border-b border-charcoal/10 pb-2">Getting Started</h4>
              
              <!-- Cargo Add Interaction -->
              <div class="mt-4 flex items-center gap-3">
                <div class="relative group cursor-pointer" onclick="navigator.clipboard.writeText('cargo add bloomcraft'); alert('Copied to clipboard: cargo add bloomcraft')">
                  <code class="font-mono text-xs bg-charcoal text-paper px-3 py-2 rounded-sm border border-charcoal group-hover:bg-sepia transition-colors">
                    $ cargo add bloomcraft
                  </code>
                  <span class="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Copy to clipboard
                  </span>
                </div>
              </div>

              <!-- Tech Stack Pills -->
              <div class="mt-6">
                <p class="font-mono text-xs text-charcoal/50 mb-2">Built with:</p>
                <div class="flex flex-wrap gap-2">
                  ${bloomcraft.tech_stack.primary.map(tech => `
                    <span class="font-mono text-[10px] uppercase tracking-wider text-charcoal/70 border border-charcoal/20 px-2 py-1 rounded-sm bg-white/50">
                      ${tech}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <div class="flex gap-4 mt-8">
              <a href="${bloomcraft.links.github}" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-charcoal text-paper font-mono text-sm hover:bg-sepia transition-colors">
                View on GitHub
              </a>
              <a href="${bloomcraft.links.documentation}" target="_blank" rel="noopener noreferrer" class="px-6 py-3 border border-charcoal text-charcoal font-mono text-sm hover:bg-white transition-colors">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
