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
  
  // Logic Text vs Poetry Text
  const texts = {
    day: "Specializing in High-Performance Rust, Distributed Systems, and Low-Level Architecture.",
    night: "In the depths, a shadow of sorrow dwells—yet the lamp of passion burns."
  };

  let isNight = false;

  // Auto-detect night time (6 PM - 6 AM)
  const hour = new Date().getHours();
  if (hour >= 18 || hour < 6) {
    toggleTheme();
  }

  function toggleTheme() {
    isNight = !isNight;
    
    if (isNight) {
      body.classList.add('night-mode');
      icon.innerText = "🌙";
      
      // Animate Text Switch
      gsap.to(heroSub, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          heroSub.innerText = texts.night;
          heroSub.classList.add('italic', 'text-gold'); // Style for poetry
          gsap.to(heroSub, { opacity: 1, duration: 1 });
        }
      });

    } else {
      body.classList.remove('night-mode');
      icon.innerText = "☀️";
      
      gsap.to(heroSub, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          heroSub.innerText = texts.day;
          heroSub.classList.remove('italic', 'text-gold');
          gsap.to(heroSub, { opacity: 1, duration: 1 });
        }
      });
    }
  }

  btn.addEventListener('click', toggleTheme);
}
