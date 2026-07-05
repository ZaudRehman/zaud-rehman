import './styles/main.css';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Components
import Hero, { initHeroParallax } from './components/Hero';
import Manifesto, { initManifesto } from './components/Manifesto';
import TechStack, { initTechStack } from './components/TechStack';
import ProjectsGrid from './components/ProjectsGrid';
import ErraLab from './components/ErraLab';
import BloomCraftLab, { initBloomCraftLab } from './components/BloomCraftLab';
import Footer from './components/Footer';
import PoetryDrawer from './components/PoetryDrawer';
import BootSequence, { runBootSequence } from './components/BootSequence';
import InkCanvas, { initInk } from './components/InkCanvas';
import DayNightToggle, { initDayNight } from './components/DayNightCycle';
import DotNav, { initDotNav } from './components/DotNav';

// Register GSAP Plugins
gsap.registerPlugin(TextPlugin, ScrollTrigger);

let lenis;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#app').innerHTML = `
    ${BootSequence()}
    ${InkCanvas()}
    ${DayNightToggle()}
    ${DotNav()}
    <div id="ink-blot-container"></div>

    <main class="relative z-10 opacity-0" id="main-content">
      ${Hero()}
      ${Manifesto()}
      ${TechStack()}
      ${ErraLab()}
      ${ProjectsGrid()}
      ${BloomCraftLab()}
      ${Footer()}
    </main>

    ${PoetryDrawer()}
  `;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  runBootSequence(() => {
    const main = document.getElementById('main-content');

    if (main) {
      gsap.to(main, {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out',
      });
    }

    initInk();
    initDayNight();
    initManifesto();
    initTechStack(lenis);
    initBloomCraftLab();
    initDotNav(lenis);
    initHeroParallax();
    initDraggableNote();
    runHeroIntro();
    initScrollAnimations();
    setupInteractions();

    ScrollTrigger.refresh();
  });
});

function runHeroIntro() {
  const poem = document.getElementById('hero-poem');
  if (!poem) return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.to('#hero-name', { opacity: 1, y: 0, duration: 1.5 })
    .to('#hero-line', { opacity: 1, width: '3rem', duration: 0.8 }, '-=1')
    .to('#hero-role', { opacity: 1, y: 0, duration: 1 }, '-=0.8')
    .to('#hero-sub', { opacity: 1, duration: 1 }, '-=0.6')
    .to('#hero-sub-secondary', { opacity: 1, duration: 0.8 }, '-=0.4')
    .to(
      '#hero-note-container',
      { opacity: 1, y: 0, duration: 1.2, ease: 'back.out(1.2)' },
      '-=0.5'
    )
    .to(
      '#hero-poem',
      {
        duration: 3,
        text: {
          value: `"Logic binds the stars in trace,<br>Yet chaos finds a quiet place."`,
          delimiter: '',
        },
        ease: 'none',
      },
      '-=0.5'
    );
}

function initScrollAnimations() {
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const scale = 0.8 + self.progress * 0.5;
      const opacity = self.progress * 0.8;
      gsap.set('#ink-blot-container', { opacity, scale });
    },
  });

  const revealElements = document.querySelectorAll('section > *');

  revealElements.forEach((elem) => {
    if (elem.closest('section')?.querySelector('#hero-name')) return;
    if (elem.closest('#manifesto-petals')) return;

    gsap.from(elem, {
      scrollTrigger: {
        trigger: elem,
        start: 'top 85%',
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    });
  });
}

function setupInteractions() {
  const drawer = document.getElementById('poetry-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const openBtn = document.getElementById('poetry-trigger');
  const closeBtn = document.getElementById('close-drawer');
  const drawerContent = drawer ? drawer.querySelector('.overflow-y-auto') : null;

  function toggleDrawer(isOpen) {
    if (!drawer || !overlay) return;

    if (isOpen) {
      drawer.classList.remove('drawer-closed');
      drawer.classList.add('drawer-open');
      overlay.style.pointerEvents = 'auto';
      overlay.style.opacity = '1';
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.add('drawer-closed');
      drawer.classList.remove('drawer-open');
      overlay.style.pointerEvents = 'none';
      overlay.style.opacity = '0';
      lenis?.start();
      document.body.style.overflow = '';
    }
  }

  if (openBtn) openBtn.addEventListener('click', () => toggleDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
  if (overlay) overlay.addEventListener('click', () => toggleDrawer(false));

  if (drawerContent) {
    drawerContent.setAttribute('data-lenis-prevent', 'true');
    drawerContent.addEventListener('wheel', (e) => e.stopPropagation(), { passive: false });
  }

  const triggerErraBtn = document.getElementById('trigger-erra-btn');
  const erraEmptyState = document.getElementById('erra-empty-state');
  const erraTraceContainer = document.getElementById('erra-trace-container');
  const erraNodes = document.querySelectorAll('.erra-node');
  const erraThread = document.getElementById('erra-thread');
  const erraHighlight = document.querySelector('.erra-highlight');

  if (
    triggerErraBtn &&
    erraEmptyState &&
    erraTraceContainer &&
    erraNodes.length &&
    erraThread &&
    erraHighlight
  ) {
    triggerErraBtn.addEventListener('click', () => {
      triggerErraBtn.disabled = true;
      erraHighlight.classList.add('active');

      gsap.to(erraEmptyState, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          erraEmptyState.style.display = 'none';
          erraTraceContainer.classList.remove('hidden');

          gsap.set(erraNodes, { opacity: 0, y: 16 });
          gsap.set(erraThread, { strokeDashoffset: 100 });
          gsap.set(erraTraceContainer, { opacity: 1 });

          gsap.to(erraThread, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          });

          gsap.to(erraNodes, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.4,
            ease: 'back.out(1.7)',
            onComplete: () => {
              setTimeout(() => {
                gsap.to(erraTraceContainer, {
                  opacity: 0,
                  duration: 0.5,
                  onComplete: () => {
                    erraTraceContainer.classList.add('hidden');
                    erraTraceContainer.style.opacity = 1;
                    erraEmptyState.style.display = 'block';
                    gsap.to(erraEmptyState, { opacity: 1, duration: 0.3 });
                    gsap.set(erraNodes, { opacity: 0, y: 16 });
                    gsap.set(erraThread, { strokeDashoffset: 100 });
                    erraHighlight.classList.remove('active');
                    triggerErraBtn.disabled = false;
                  },
                });
              }, 4000);
            },
          });
        },
      });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('drawer-open')) {
      toggleDrawer(false);
    }
    if (e.key === 'p' || e.key === 'P') {
      const active = document.activeElement;
      const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
      if (!isInput && !drawer?.classList.contains('forge-open')) {
        toggleDrawer(!drawer?.classList.contains('drawer-open'));
      }
    }
  });

  // Poetry scroll hint - show "Gazebound" label when Manifesto enters viewport
  const manifesto = document.getElementById('manifesto');
  const poetryHint = document.querySelector('.poetry-hint');
  if (manifesto && poetryHint && !sessionStorage.getItem('poetry-hint-seen')) {
    const hintObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          poetryHint.style.opacity = '1';
          sessionStorage.setItem('poetry-hint-seen', '1');
          setTimeout(() => { poetryHint.style.opacity = '0'; }, 4000);
          hintObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    hintObserver.observe(manifesto);
  }

  // Clickable poetry names in Manifesto
  document.querySelectorAll('.poetry-link').forEach(btn => {
    btn.addEventListener('click', () => toggleDrawer(true));
  });

  // Contact modal
  const contactModal = document.getElementById('contact-modal');
  const contactOverlay = document.getElementById('contact-overlay');
  const openContactBtn = document.getElementById('open-contact-modal');
  const closeContactBtn = document.getElementById('close-contact-modal');
  const contactForm = document.getElementById('contact-form');
  const contactStatus = document.getElementById('contact-status');

  function toggleContact(isOpen) {
    if (!contactModal) return;
    if (isOpen) {
      contactModal.classList.remove('hidden');
      contactModal.classList.add('flex');
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      setTimeout(() => contactOverlay && (contactOverlay.style.opacity = '1'), 10);
    } else {
      contactOverlay && (contactOverlay.style.opacity = '0');
      setTimeout(() => {
        contactModal.classList.add('hidden');
        contactModal.classList.remove('flex');
        lenis?.start();
        document.body.style.overflow = '';
        if (contactForm) contactForm.reset();
        if (contactStatus) contactStatus.textContent = '';
      }, 200);
    }
  }

  if (openContactBtn) openContactBtn.addEventListener('click', () => toggleContact(true));
  if (closeContactBtn) closeContactBtn.addEventListener('click', () => toggleContact(false));
  if (contactOverlay) contactOverlay.addEventListener('click', () => toggleContact(false));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal && !contactModal.classList.contains('hidden')) {
      toggleContact(false);
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      if (contactStatus) contactStatus.textContent = 'Sending...';

      try {
        const resp = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });

        if (resp.ok) {
          if (contactStatus) contactStatus.textContent = 'Sent! I\'ll get back to you.';
          contactForm.reset();
          setTimeout(() => toggleContact(false), 2000);
        } else {
          if (contactStatus) contactStatus.textContent = 'Something went wrong. Try again.';
        }
      } catch {
        if (contactStatus) contactStatus.textContent = 'Network error. Try again.';
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gsap.globalTimeline.pause();
    lenis?.stop();
  } else {
    gsap.globalTimeline.resume();
    lenis?.start();
  }
});

console.log('🌸 Portfolio initialized successfully');

function initDraggableNote() {
  const note = document.getElementById('hero-note-container');
  const hero = document.getElementById('hero');
  if (!note || !hero) return;

  const STORAGE_KEY = 'hero-note-pos';
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  function clampToHero(left, top) {
    const nw = note.offsetWidth;
    const nh = note.offsetHeight;
    const hw = hero.scrollWidth;
    const hh = hero.scrollHeight;
    return {
      left: Math.max(0, Math.min(hw - nw, left)),
      top: Math.max(0, Math.min(hh - nh, top)),
    };
  }

  // Ensure hero is positioning context
  const heroPos = getComputedStyle(hero).position;
  if (heroPos === 'static') hero.style.position = 'relative';

  // Restore saved position
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const pos = JSON.parse(saved);
      const clamped = clampToHero(pos.left, pos.top);
      note.style.position = 'absolute';
      note.style.left = clamped.left + 'px';
      note.style.top = clamped.top + 'px';
      note.style.zIndex = '60';
      note.style.width = 'auto';
      note.style.maxWidth = '380px';
      note.style.margin = '0';
    } catch {}
  }

  function onPointerDown(e) {
    if (e.target.closest('a, button')) return;
    isDragging = true;

    // Convert from current layout to absolute within hero
    if (note.style.position !== 'absolute') {
      const noteRect = note.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      note.style.position = 'absolute';
      note.style.left = (noteRect.left - heroRect.left + hero.scrollLeft) + 'px';
      note.style.top = (noteRect.top - heroRect.top + hero.scrollTop) + 'px';
      note.style.zIndex = '60';
      note.style.width = 'auto';
      note.style.maxWidth = '380px';
      note.style.margin = '0';
    }

    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseFloat(note.style.left);
    startTop = parseFloat(note.style.top);
    note.style.transition = 'none';
    note.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const clamped = clampToHero(startLeft + dx, startTop + dy);
    note.style.left = clamped.left + 'px';
    note.style.top = clamped.top + 'px';
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    note.style.transition = '';
    note.style.cursor = 'grab';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      left: parseFloat(note.style.left),
      top: parseFloat(note.style.top),
    }));
  }

  note.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}