import { projects } from '../data/projects.js';

const BENTO_LAYOUTS = [
  { cols: 'md:col-span-2', rows: 'md:row-span-2', featured: true },
  { cols: 'md:col-span-1', rows: 'md:row-span-2', featured: false },
  { cols: 'md:col-span-1', rows: 'md:row-span-1', featured: false },
  { cols: 'md:col-span-2', rows: 'md:row-span-1', featured: false },
];

const LINK_LABELS = {
  github: 'Source',
  frontend: 'Frontend',
  demo: 'Live demo',
  docs: 'API docs',
};

function linkIcon(kind) {
  if (kind === 'github') {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
  }
  if (kind === 'demo') {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
  }
  if (kind === 'frontend') {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
  }
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
}

function renderDescription(story) {
  const lines = story.split('\n').map(l => l.trim()).filter(Boolean);
  let html = '';
  const bullets = [];
  const flushBullets = () => {
    if (bullets.length) {
      html += `<ul class="space-y-2 mb-4">${bullets.map(item => `
        <li class="flex gap-2.5 leading-relaxed">
          <span class="font-mono text-sepia/60 mt-0.5 flex-shrink-0 text-xs">&rsaquo;</span>
          <span class="font-serif text-[15px] text-charcoal/70">${item}</span>
        </li>`).join('')}</ul>`;
      bullets.length = 0;
    }
  };
  lines.forEach(line => {
    if (line.startsWith('- ')) {
      bullets.push(line.slice(2));
    } else {
      flushBullets();
      html += `<p class="font-serif text-[15px] text-charcoal/70 leading-relaxed mb-4">${line}</p>`;
    }
  });
  flushBullets();
  return html;
}

function BentoTile(project, layout) {
  const previewStats = (project.stats || []).slice(0, 3);
  const linkKinds = Object.keys(project.links);

  return `
    <article class="bento-card group relative flex flex-col border border-charcoal/10 bg-paper p-7 md:p-8 overflow-hidden ${layout.featured ? 'bento-card-featured' : ''} ${layout.cols} ${layout.rows}" data-bento>

      ${layout.featured ? `
        <div class="absolute -top-1.5 left-1/3 w-24 h-[3px] bg-gradient-to-r from-transparent via-sepia/25 to-transparent rotate-[-0.5deg] rounded-full z-10"></div>
        <div class="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>
      ` : ''}

      <div class="flex justify-between items-start mb-5 relative">
        <div class="w-9 h-9 text-sepia/50 group-hover:text-sepia/80 transition-colors duration-400 flex-shrink-0">
          <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            ${project.svg.replace(/<svg[^>]*>|<\/svg>/g, '')}
          </svg>
        </div>
        <span class="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/45 bg-charcoal/4 border border-charcoal/8 px-2.5 py-1 rounded-sm">
          ${project.category}
        </span>
      </div>

      <h3 class="font-serif text-[1.6rem] md:text-[1.85rem] text-charcoal mb-2.5 relative bento-title-accent" style="font-weight:500; letter-spacing:-0.01em; line-height:1.2">
        ${project.title}
      </h3>

      <p class="font-serif text-sm text-sepia/70 italic leading-relaxed mb-6 relative max-w-md">
        ${project.hook}
      </p>

      <div class="flex flex-wrap gap-x-6 gap-y-3 mb-6 mt-auto relative">
        ${previewStats.map(s => `
          <div>
            <span class="font-mono text-lg text-charcoal block leading-none mb-1">${s.value}</span>
            <span class="font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/38">${s.label}</span>
          </div>
        `).join('')}
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-charcoal/8 relative">
        <div class="flex items-center gap-3">
          ${linkKinds.map(kind => `
            <a href="${project.links[kind]}" target="_blank" rel="noopener noreferrer"
               class="bento-link-pill p-1.5 text-charcoal/40 hover:text-sepia/80 rounded-sm inline-flex">
              ${linkIcon(kind)}
            </a>
          `).join('')}
          <span class="font-mono text-[9px] text-charcoal/28 tracking-widest ml-1">${project.year}</span>
        </div>
        <button data-project-open="${projects.indexOf(project)}"
                class="bento-toggle-btn flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-sepia/60 cursor-pointer relative z-10 px-2 py-1 -mr-2">
          <span>Case study</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </button>
      </div>
    </article>
  `;
}

function ProjectOverlayContent(project) {
  return `
    <div class="flex items-center gap-3 mb-8">
      <span class="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/45 bg-charcoal/4 border border-charcoal/8 px-2.5 py-1 rounded-sm">${project.category}</span>
      <span class="font-mono text-[9px] text-charcoal/28 tracking-widest">${project.year}</span>
      <span class="font-mono text-[9px] uppercase tracking-[0.18em] text-green-700/60 bg-green-800/6 border border-green-800/10 px-2.5 py-1 rounded-sm">${project.status}</span>
    </div>

    <div class="flex items-start gap-5 mb-8">
      <div class="w-11 h-11 text-sepia/60 flex-shrink-0 mt-0.5">
        <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          ${project.svg.replace(/<svg[^>]*>|<\/svg>/g, '')}
        </svg>
      </div>
      <div>
        <h2 class="font-serif text-3xl md:text-4xl text-charcoal mb-3" style="font-weight:500; letter-spacing:-0.015em; line-height:1.15">${project.title}</h2>
        <p class="font-serif text-base text-sepia/70 italic leading-relaxed">${project.hook}</p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mb-8">
      ${Object.entries(project.links).map(([kind, href]) => `
        <a href="${href}" target="_blank" rel="noopener noreferrer"
           class="bento-link-pill flex items-center gap-1.5 font-mono text-[11px] text-charcoal/55 border border-charcoal/10 px-3 py-1.5 rounded-sm">
          ${linkIcon(kind)}
          ${LINK_LABELS[kind] || kind}
        </a>
      `).join('')}
    </div>

    <div class="bento-detail-divider mb-8"></div>

    <div class="grid md:grid-cols-2 gap-x-10 gap-y-10">

      <div>
        <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/35 mb-4">Field Notes</p>
        <div>${renderDescription(project.story)}</div>
      </div>

      <div class="space-y-9">
        <div>
          <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/35 mb-4">Measured</p>
          <div class="grid grid-cols-2 gap-px bg-charcoal/8 border border-charcoal/8">
            ${project.stats.map(s => `
              <div class="bg-paper p-4 bento-stat-cell">
                <span class="font-mono text-xl text-charcoal block leading-none mb-1.5">${s.value}</span>
                <span class="font-mono text-[8px] uppercase tracking-[0.12em] text-charcoal/40">${s.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/35 mb-3">Highlights</p>
          <ul class="space-y-2">
            ${project.highlights.map(h => `
              <li class="flex items-start gap-2.5 leading-relaxed">
                <span class="font-mono text-sepia/50 mt-0.5 flex-shrink-0 text-xs">&rsaquo;</span>
                <span class="font-serif text-[13px] text-charcoal/68">${h}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div>
          <p class="font-mono text-[9px] uppercase tracking-[0.22em] text-charcoal/35 mb-3">Stack</p>
          <div class="flex flex-wrap gap-1.5">
            ${project.tech.map(t => `
              <span class="bento-stack-pill font-mono text-[10px] text-sepia/70 bg-sepia/6 border border-sepia/15 px-2.5 py-1 rounded-sm tracking-wide">${t}</span>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}

export function initProjectsGrid() {
  const overlay = document.getElementById('project-detail-overlay');
  const overlayBackdrop = overlay?.querySelector('.po-detail-backdrop');
  const overlayContent = overlay?.querySelector('.po-detail-content');
  const closeBtn = overlay?.querySelector('[data-project-close]');
  if (!overlay || !overlayBackdrop || !overlayContent) return;

  function openOverlay(index) {
    const project = projects[index];
    if (!project) return;
    overlayContent.innerHTML = ProjectOverlayContent(project);
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    requestAnimationFrame(() => {
      overlayBackdrop.style.opacity = '1';
      overlay.querySelector('.po-detail-panel').style.transform = 'translateY(0) scale(1)';
    });
    overlay.querySelector('.po-detail-scroll').scrollTop = 0;
    lenis?.stop();
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    overlayBackdrop.style.opacity = '0';
    overlay.querySelector('.po-detail-panel').style.transform = 'translateY(16px) scale(0.97)';
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      lenis?.start();
      document.body.style.overflow = '';
    }, 280);
  }

  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-project-open]');
    if (openBtn) {
      openOverlay(parseInt(openBtn.dataset.projectOpen, 10));
      return;
    }
    if (e.target === overlayBackdrop || e.target.closest('[data-project-close]')) {
      closeOverlay();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeOverlay();
    }
  });
}

let lenis;

export function setLenis(l) { lenis = l; }

export default function ProjectsGrid() {
  return `
    <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto" id="projects">

      <div class="flex items-center gap-3 mb-6 ml-2">
        <span class="font-mono text-[10px] text-sepia/50 tracking-[0.25em] uppercase">Works</span>
        <div class="h-px flex-1 max-w-xs bg-charcoal/8"></div>
        <span class="font-mono text-[10px] text-charcoal/35 tracking-widest">${projects.length} studies</span>
      </div>

      <p class="font-serif text-xl text-charcoal/60 italic ml-2 mb-10 max-w-2xl leading-relaxed">
        Four studies: a broker from scratch, a 28k-line real-time platform, a 3D algorithm lab, and a lesson in where systems break.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        ${projects.map((p, i) => BentoTile(p, BENTO_LAYOUTS[i], i)).join('')}
      </div>

    </section>

    <div id="project-detail-overlay" class="fixed inset-0 z-[100] hidden items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true" aria-label="Project case study">
      <div class="po-detail-backdrop absolute inset-0 bg-charcoal/30" style="opacity:0; transition: opacity 0.28s ease; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);"></div>
      <div class="po-detail-panel relative w-full max-w-4xl bg-paper border border-charcoal/10 shadow-2xl z-10 overflow-hidden rounded-lg" style="transform:translateY(16px) scale(0.97); transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease; max-height:88vh; display:flex; flex-direction:column;">
        <div class="po-detail-scroll flex-1 overflow-y-auto p-8 md:p-10" data-lenis-prevent>
          <button data-project-close class="absolute top-5 right-5 font-mono text-[10px] text-charcoal/30 hover:text-charcoal tracking-widest uppercase transition-colors z-20" aria-label="Close">Close</button>
          <div class="po-detail-content"></div>
        </div>
      </div>
    </div>
  `;
}
