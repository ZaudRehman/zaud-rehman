import { projects } from '../data/projects.js';

export default function ProjectsGrid() {
  const cardsHtml = projects.map((project, index) => `
    <div class="group block relative perspective-1000">
      <div class="bg-paper border border-charcoal/10 p-8 h-full transition-all duration-500 group-hover:shadow-xl group-hover:border-sepia/30 relative overflow-hidden flex flex-col">
        
        <!-- Header: Icon & Links -->
        <div class="flex justify-between items-start mb-6">
            <!-- Icon with Sketch Animation -->
            <div class="w-12 h-12 text-sepia group-hover:text-charcoal transition-colors duration-300">
              <svg class="draw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                ${project.svg
                  .replace(/<path/g, '<path class="path-anim"')
                  .replace(/<circle/g, '<circle class="path-anim"')
                  .replace(/<line/g, '<line class="path-anim"')
                  .replace(/<polyline/g, '<polyline class="path-anim"')
                  .replace(/<svg[^>]*>|<\/svg>/g, '') 
                }
              </svg>
            </div>

            <!-- GitHub & Live Links (UPDATED COLORS) -->
            <div class="flex gap-2 relative z-20">
                ${project.github ? `
                  <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="p-2 text-charcoal/80 hover:text-sepia hover:bg-charcoal/5 transition-all rounded-lg" title="View Source">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  </a>
                ` : ''}
                
                ${project.link || project.demo ? `
                  <a href="${project.link || project.demo}" target="_blank" rel="noopener noreferrer" class="p-2 text-charcoal/80 hover:text-sepia hover:bg-charcoal/5 transition-all rounded-lg" title="Live Demo">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                ` : ''}
            </div>
        </div>

        <!-- Title -->
        <h3 class="font-serif text-2xl text-charcoal mb-3 group-hover:translate-x-2 transition-transform duration-300">
          <a href="${project.link || project.demo || '#'}" target="_blank" class="hover:underline decoration-sepia decoration-2 underline-offset-4">
            ${project.title}
          </a>
        </h3>
        
        <!-- Description -->
        <p class="font-serif text-charcoal/80 mb-6 leading-relaxed">
          ${project.description}
        </p>

        <!-- Tech Stack -->
        <div class="flex flex-wrap gap-2 mt-auto">
          ${project.tech.map(t => `
            <span class="font-mono text-[11px] font-bold uppercase tracking-wider text-charcoal/70 border border-charcoal/20 px-2 py-1 rounded-sm">
              ${t}
            </span>
          `).join('')}
        </div>

        <!-- Hover Ink Effect -->
        <div class="absolute bottom-0 right-0 w-24 h-24 bg-sepia/5 rounded-full blur-2xl translate-x-12 translate-y-12 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700 pointer-events-none"></div>
      </div>
    </div>
  `).join('');

  return `
    <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        ${cardsHtml}
      </div>
    </section>
  `;
}
