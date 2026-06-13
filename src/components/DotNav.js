export default function DotNav() {
  const sections = [
    { id: 'hero',       label: 'Intro'      },
    { id: 'manifesto',  label: 'Philosophy' },
    { id: 'techstack',  label: 'Workshop'   },
    { id: 'erra',       label: 'Erra'       },
    { id: 'projects',   label: 'Projects'   },
    { id: 'bloomcraft', label: 'BloomCraft' },
  ];

  const dots = sections.map((s, i) => `
    <button
      class="dot-nav-btn group relative flex items-center justify-end gap-2"
      data-target="${s.id}"
      aria-label="Go to ${s.label}"
    >
      <span class="dot-nav-label font-mono text-[9px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        ${s.label}
      </span>
      <span class="dot-nav-dot block w-1.5 h-1.5 rounded-full bg-charcoal/25 transition-all duration-300 group-hover:bg-sepia group-hover:scale-125"></span>
    </button>
  `).join('');

  return `
    <nav id="dot-nav" class="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3.5 hidden lg:flex" aria-label="Page sections">
      ${dots}
    </nav>
  `;
}

export function initDotNav(lenis) {
  const nav = document.getElementById('dot-nav');
  if (!nav) return;

  const buttons = nav.querySelectorAll('.dot-nav-btn');
  const sectionIds = Array.from(buttons).map(b => b.dataset.target);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      if (lenis) {
        lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        buttons.forEach(btn => {
          const dot = btn.querySelector('.dot-nav-dot');
          const label = btn.querySelector('.dot-nav-label');
          if (btn.dataset.target === id) {
            dot.classList.remove('bg-charcoal/25');
            dot.classList.add('bg-sepia', 'scale-150');
            label.classList.add('opacity-60');
          } else {
            dot.classList.add('bg-charcoal/25');
            dot.classList.remove('bg-sepia', 'scale-150');
            label.classList.remove('opacity-60');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
