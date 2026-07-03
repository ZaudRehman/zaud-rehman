import gsap from "gsap";

export default function DayNightToggle() {
  return `
    <button id="theme-toggle" class="fixed top-6 right-6 z-50 p-2 font-serif text-xl opacity-70 hover:opacity-100 transition-opacity" title="Toggle Day/Night">
      <span id="theme-icon">☀️</span>
    </button>
  `;
}

export function initDayNight() {
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const body = document.body;
  const heroSub = document.getElementById('hero-sub');
  
  const texts = {
    day: "Specializing in High-Performance Rust, Distributed Systems, and Low-Level Architecture.",
    night: "Though the night claims every quiet corner,<br>the ember refuses to sleep."
  };

  const STORAGE_KEY = 'theme-preference';
  let isNight = false;

  function applyTheme(night) {
    isNight = night;
    if (isNight) {
      body.classList.add('night-mode');
      icon.innerText = "🌙";
    } else {
      body.classList.remove('night-mode');
      icon.innerText = "☀️";
    }
  }

  function toggleTheme() {
    isNight = !isNight;
    applyTheme(isNight);
    localStorage.setItem(STORAGE_KEY, isNight ? 'night' : 'day');

    gsap.to(heroSub, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        if (isNight) {
          heroSub.innerHTML = texts.night;
          heroSub.classList.add('italic', 'text-gold');
        } else {
          heroSub.innerText = texts.day;
          heroSub.classList.remove('italic', 'text-gold');
        }
        gsap.to(heroSub, { opacity: 1, duration: 1 });
      }
    });
  }

  // Load saved preference, fallback to time-based auto-detect
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved === 'night');
  } else {
    const hour = new Date().getHours();
    applyTheme(hour >= 18 || hour < 6);
  }

  btn.addEventListener('click', toggleTheme);
}
