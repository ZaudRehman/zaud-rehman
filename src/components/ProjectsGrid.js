import { projects } from '../data/projects.js';

function FeaturedCard(project) {
  return `
    <div class="group relative border border-charcoal/12 bg-paper overflow-hidden mb-10 transition-all duration-500 hover:border-sepia/35 hover:shadow-xl">

      <!-- tape strip across top -->
      <div class="absolute -top-2 left-1/3 w-28 h-5 bg-sepia/18 rotate-[-0.6deg] rounded-sm z-10"></div>

      <div class="grid md:grid-cols-[1.15fr_0.85fr] gap-0 divide-x divide-charcoal/8">

        <!-- Left: identity -->
        <div class="p-9 md:p-12 flex flex-col justify-between relative">
          <div class="absolute inset-0 bg-grid-pattern opacity-[0.025] pointer-events-none"></div>

          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 text-sepia/70 group-hover:text-sepia transition-colors duration-300">
                <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  ${project.svg.replace(/<svg[^>]*>|<\/svg>/g, '')}
                </svg>
              </div>
              <span class="font-mono text-[9px] tracking-[0.3em] uppercase text-sepia/50">Featured</span>
            </div>

            <h3 class="font-serif text-4xl md:text-5xl text-charcoal mb-4 leading-tight group-hover:translate-x-1 transition-transform duration-300" style="font-weight:500">
              ${project.title}
            </h3>

            <p class="font-serif text-lg text-sepia italic leading-relaxed mb-8 max-w-sm border-l-2 border-sepia/30 pl-4">
              "${project.hook}"
            </p>
          </div>

          <!-- year + status -->
          <div class="relative z-10 flex items-center gap-4">
            <span class="font-mono text-[10px] text-charcoal/35 tracking-widest">${project.year}</span>
            <div class="h-px w-4 bg-charcoal/15"></div>
            <span class="font-mono text-[10px] uppercase tracking-widest text-sepia/60 border border-sepia/25 px-2 py-0.5 rounded-sm">${project.status}</span>
          </div>
        </div>

        <!-- Right: details -->
        <div class="p-9 md:p-12 flex flex-col justify-between bg-paper-dark/20">
          <div>
            <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-charcoal/35 mb-4">Field Notes</p>
            <p class="font-serif text-base text-charcoal/72 leading-relaxed mb-8">
              ${project.description}
            </p>

            <p class="font-mono text-[9px] uppercase tracking-[0.25em] text-charcoal/35 mb-3">Stack</p>
            <div class="flex flex-wrap gap-2">
              ${project.tech.map(t => `
                <span class="font-mono text-[10px] text-sepia/80 bg-sepia/8 border border-sepia/18 px-2 py-0.5 rounded-sm tracking-wide">
                  ${t}
                </span>
              `).join('')}
            </div>
          </div>

          <div class="flex items-center gap-3 mt-10 pt-6 border-t border-charcoal/8">
            ${project.github ? `
              <a href="${project.github}" target="_blank" rel="noopener noreferrer"
                 class="flex items-center gap-1.5 font-mono text-xs text-charcoal/60 hover:text-sepia transition-colors duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                Source
              </a>
            ` : ''}
            ${project.link || project.demo ? `
              <a href="${project.link || project.demo}" target="_blank" rel="noopener noreferrer"
                 class="flex items-center gap-1.5 font-mono text-xs text-charcoal/60 hover:text-sepia transition-colors duration-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Live Demo
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function SmallCard(project) {
  return `
    <div class="group relative border border-charcoal/10 bg-paper p-7 flex flex-col transition-all duration-400 hover:border-sepia/30 hover:shadow-lg overflow-hidden">

      <!-- ruled top line -->
      <div class="absolute top-0 left-0 right-0 h-px bg-sepia/20 group-hover:bg-sepia/45 transition-colors duration-300"></div>

      <div class="flex justify-between items-start mb-5">
        <div class="w-8 h-8 text-sepia/60 group-hover:text-sepia transition-colors duration-300 flex-shrink-0">
          <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            ${project.svg.replace(/<svg[^>]*>|<\/svg>/g, '')}
          </svg>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-[9px] text-charcoal/30 tracking-widest">${project.year}</span>
          ${project.github ? `
            <a href="${project.github}" target="_blank" rel="noopener noreferrer"
               class="p-1.5 text-charcoal/40 hover:text-sepia transition-colors duration-200 relative z-10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
          ` : ''}
          ${project.link || project.demo ? `
            <a href="${project.link || project.demo}" target="_blank" rel="noopener noreferrer"
               class="p-1.5 text-charcoal/40 hover:text-sepia transition-colors duration-200 relative z-10">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          ` : ''}
        </div>
      </div>

      <h3 class="font-serif text-xl text-charcoal mb-2 group-hover:translate-x-1 transition-transform duration-300" style="font-weight:500">
        ${project.title}
      </h3>

      <p class="font-serif text-sm text-sepia/75 italic leading-relaxed mb-5">
        ${project.hook}
      </p>

      <div class="flex flex-wrap gap-1.5 mt-auto">
        ${project.tech.map(t => `
          <span class="font-mono text-[9px] uppercase tracking-wider text-charcoal/50 border border-charcoal/14 px-1.5 py-0.5 rounded-sm">
            ${t}
          </span>
        `).join('')}
      </div>

      <!-- hover glow -->
      <div class="absolute bottom-0 right-0 w-20 h-20 bg-sepia/4 rounded-full blur-2xl translate-x-10 translate-y-10 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700 pointer-events-none"></div>
    </div>
  `;
}

export default function ProjectsGrid() {
  const featured = projects.find(p => p.featured);
  const rest = projects.filter(p => !p.featured);

  return `
    <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="projects">

      <div class="flex items-center gap-3 mb-14 ml-2">
        <span class="font-mono text-[10px] text-sepia/50 tracking-[0.25em] uppercase">Works</span>
        <div class="h-px flex-1 max-w-xs bg-charcoal/8"></div>
      </div>

      ${featured ? FeaturedCard(featured) : ''}

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${rest.map(SmallCard).join('')}
      </div>

    </section>
  `;
}
