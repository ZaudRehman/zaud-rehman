export default function InkCanvas() {
  return `<canvas id="ink-canvas" class="fixed inset-0 pointer-events-none z-[5] mix-blend-multiply opacity-60"></canvas>`;
}

export function initInk() {
  const canvas = document.getElementById('ink-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  // Ink Physics
  const config = {
    length: 20,
    width: 8,
    fade: 0.95,
  };

  function getInkColor() {
    return document.body.classList.contains('night-mode') ? '#c5cdd9' : '#2b2b2b';
  }

  function updateBlendMode() {
    canvas.style.mixBlendMode = document.body.classList.contains('night-mode') ? 'screen' : 'multiply';
  }

  const mouse = { x: 0, y: 0 };
  const prevMouse = { x: 0, y: 0 };
  let rafId = null;

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function animate() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - config.fade})`;
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'source-over';
    
    const inkColor = getInkColor();

    ctx.beginPath();
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = config.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(prevMouse.x, prevMouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    const speed = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
    if (speed > 15 && Math.random() > 0.5) {
      const spread = Math.random() * 20 - 10;
      ctx.fillStyle = inkColor;
      ctx.beginPath();
      ctx.arc(mouse.x + spread, mouse.y + spread, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;

    rafId = requestAnimationFrame(animate);
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', (e) => {
    if (prevMouse.x === 0 && prevMouse.y === 0) {
      prevMouse.x = e.clientX;
      prevMouse.y = e.clientY;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  init();
  start();
  updateBlendMode();

  const observer = new MutationObserver(updateBlendMode);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}