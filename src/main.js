import './styles/main.css';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Components
import Hero from './components/Hero';
import Manifesto, { initManifesto } from './components/Manifesto';
import TechStack, { initTechStack } from './components/TechStack';
import ProjectsGrid from './components/ProjectsGrid';
import ErraLab from './components/ErraLab';
import BloomCraftLab from './components/BloomCraftLab';
import Footer from './components/Footer';
import PoetryDrawer from './components/PoetryDrawer';
import BootSequence, { runBootSequence } from './components/BootSequence';
import InkCanvas, { initInk } from './components/InkCanvas';
import DayNightToggle, { initDayNight } from './components/DayNightCycle';
import { initWind } from './components/Wind';
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
    initWind(lenis);
    initManifesto();
    initTechStack();
    initDotNav(lenis);

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
  });
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