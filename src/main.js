import './styles/main.css';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Components
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import ProjectsGrid from './components/ProjectsGrid';
import BloomCraftLab from './components/BloomCraftLab';
import Footer from './components/Footer';
import PoetryDrawer from './components/PoetryDrawer';
import BootSequence, { runBootSequence } from './components/BootSequence';
import InkCanvas, { initInk } from './components/InkCanvas';
import DayNightToggle, { initDayNight } from './components/DayNightCycle';
import { initWind } from './components/Wind';
// import { initSpiritStation } from './game/spiritStationIndex';

// Register GSAP Plugins
gsap.registerPlugin(TextPlugin, ScrollTrigger);

// Global state for mini-games
let lenis;
let gameStates = {
  garden: false,
  compiler: false,
  kernel: false
};

// 1. Initialize App on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  
  // Render App Structure
  document.querySelector('#app').innerHTML = `
    ${BootSequence()} 
    ${InkCanvas()}
    ${DayNightToggle()}
    <div id="ink-blot-container"></div>
    
    <main class="relative z-10 opacity-0" id="main-content"> <!-- Hidden initially -->
      ${Hero()}
      ${Manifesto()}
      ${ProjectsGrid()}
      ${BloomCraftLab()}
      ${Footer()}
    </main>
    
    ${PoetryDrawer()}
  `;

  // 2. Initialize Core Systems
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

  // 3. Start Boot Sequence
  runBootSequence(() => {
    
    // --- Post-Boot Initialization ---
    
    // A. Reveal Main Content
    const main = document.getElementById('main-content');
    if (main) {
      gsap.to(main, { 
        opacity: 1, 
        duration: 1.5, 
        ease: "power2.out" 
      });
    }

    // B. Start Ambient Systems
    initInk(); 
    initDayNight(); 
    initWind(lenis); 
    // initSpiritStation();

    // D. Trigger Hero Animations
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    if (document.getElementById("hero-poem")) {
      tl.to("#hero-poem", {
        duration: 3.5,
        text: {
          value: `"Logic binds the stars in trace,<br>Yet chaos finds a quiet place."`,
          delimiter: "" 
        },
        ease: "none",
      })
      .to("#hero-name", { opacity: 1, y: 0, duration: 1 }, "+=0.3")
      .to("#hero-role", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to("#hero-sub", { opacity: 1, duration: 1 }, "-=0.4");
    }

    // E. Initialize Scroll Triggers
    initScrollAnimations();
    
    // F. Setup Global Interactions
    setupInteractions();
    
    // G. Setup Mini-Game Launchers
    setupGameLaunchers();
  });
});

// --- Helper Functions ---

function initScrollAnimations() {
  // Ink blot parallax
  ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => {
      const scale = 0.8 + (self.progress * 0.5);
      const opacity = self.progress * 0.8;
      gsap.set("#ink-blot-container", { opacity: opacity, scale: scale });
    }
  });

  // Reveal animations for sections
  const revealElements = document.querySelectorAll('section > *');
  revealElements.forEach((elem) => {
    // Skip if element is part of Hero or Game UI to prevent conflicts
    if(elem.closest('section')?.querySelector('#hero-name') || 
       elem.closest('#game-hud') || 
       elem.closest('#garden-hud') ||
       elem.closest('#compiler-hud')) return;
    
    gsap.from(elem, {
      scrollTrigger: {
        trigger: elem,
        start: "top 85%",
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  });
}

function setupInteractions() {
  // Drawer Logic
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
      lenis.stop();
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.add('drawer-closed');
      drawer.classList.remove('drawer-open');
      overlay.style.pointerEvents = 'none';
      overlay.style.opacity = '0';
      lenis.start();
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

  // Escape key handler for all modals/games
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawer?.classList.contains('drawer-open')) {
        toggleDrawer(false);
      }
      if (gameStates.garden) closeGame('garden');
      if (gameStates.compiler) closeGame('compiler');
      if (gameStates.kernel) closeGame('kernel');
    }
  });
}

function setupGameLaunchers() {
  // Garden Game Launcher
  const gardenTrigger = document.getElementById('garden-trigger');
  const gardenClose = document.getElementById('close-garden');
  
  if (gardenTrigger) {
    gardenTrigger.addEventListener('click', () => openGame('garden'));
  }
  
  if (gardenClose) {
    gardenClose.addEventListener('click', () => closeGame('garden'));
  }

  // Compiler Game Launcher
  const compilerTrigger = document.getElementById('compiler-trigger');
  const compilerClose = document.getElementById('close-compiler');
  
  if (compilerTrigger) {
    compilerTrigger.addEventListener('click', () => openGame('compiler'));
  }
  
  if (compilerClose) {
    compilerClose.addEventListener('click', () => closeGame('compiler'));
  }

  // Kernel Game Launcher
  const kernelTrigger = document.getElementById('kernel-trigger');
  const kernelClose = document.getElementById('close-game');
  
  if (kernelTrigger) {
    kernelTrigger.addEventListener('click', () => openGame('kernel'));
  }
  
  if (kernelClose) {
    kernelClose.addEventListener('click', () => closeGame('kernel'));
  }
}

function openGame(gameType) {
  if (gameStates[gameType]) return; // Already open
  
  const gameMap = {
    garden: { canvas: 'garden-canvas', hud: 'garden-hud', tutorial: 'garden-tutorial' },
    compiler: { canvas: 'compiler-canvas', hud: 'compiler-hud' },
    kernel: { canvas: 'game-canvas', hud: 'game-hud', tutorial: 'tutorial-overlay' }
  };
  
  const game = gameMap[gameType];
  if (!game) return;
  
  // Stop smooth scroll
  lenis.stop();
  
  // Show game elements with animation
  const canvas = document.getElementById(game.canvas);
  const hud = document.getElementById(game.hud);
  const tutorial = game.tutorial ? document.getElementById(game.tutorial) : null;
  
  if (canvas) {
    canvas.classList.remove('hidden');
    gsap.to(canvas, { opacity: 1, duration: 0.5, ease: "power2.out" });
  }
  
  if (hud) {
    hud.classList.remove('hidden');
    gsap.to(hud, { opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 });
  }
  
  if (tutorial) {
    // Tutorial fades out after 3 seconds
    setTimeout(() => {
      gsap.to(tutorial, { 
        opacity: 0, 
        duration: 1.5, 
        ease: "power2.inOut",
        onComplete: () => tutorial.style.display = 'none'
      });
    }, 3000);
  }
  
  gameStates[gameType] = true;
  
  // Trigger game-specific start events
  const event = new CustomEvent(`${gameType}GameOpened`);
  window.dispatchEvent(event);
  
  console.log(`🎮 ${gameType} game opened`);
}

function closeGame(gameType) {
  if (!gameStates[gameType]) return; // Already closed
  
  const gameMap = {
    garden: { canvas: 'garden-canvas', hud: 'garden-hud', canvas3d: 'garden-3d-canvas' },
    compiler: { canvas: 'compiler-canvas', hud: 'compiler-hud' },
    kernel: { canvas: 'game-canvas', hud: 'game-hud' }
  };
  
  const game = gameMap[gameType];
  if (!game) return;
  
  // Hide game elements with animation
  const canvas = document.getElementById(game.canvas);
  const hud = document.getElementById(game.hud);
  const canvas3d = game.canvas3d ? document.getElementById(game.canvas3d) : null;
  
  gsap.to([canvas, hud, canvas3d].filter(Boolean), {
    opacity: 0,
    duration: 0.5,
    ease: "power2.in",
    onComplete: () => {
      if (canvas) canvas.classList.add('hidden');
      if (hud) hud.classList.add('hidden');
      if (canvas3d) canvas3d.classList.add('hidden');
    }
  });
  
  gameStates[gameType] = false;
  
  // Resume smooth scroll
  lenis.start();
  
  // Trigger game-specific close events
  const event = new CustomEvent(`${gameType}GameClosed`);
  window.dispatchEvent(event);
  
  console.log(`🎮 ${gameType} game closed`);
}

// Expose global functions for games to use
window.closeGame = closeGame;
window.openGame = openGame;
window.gameStates = gameStates;

// Performance optimization: Pause animations when tab not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause GSAP animations
    gsap.globalTimeline.pause();
    
    // Pause Lenis
    lenis.stop();
  } else {
    // Resume
    gsap.globalTimeline.resume();
    
    // Only resume Lenis if no games are open
    if (!gameStates.garden && !gameStates.compiler && !gameStates.kernel) {
      lenis.start();
    }
  }
});

// Log initialization complete
console.log('🌸 Portfolio initialized successfully');
