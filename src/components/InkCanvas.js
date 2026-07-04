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
  let frameCount = 0;

  // Store strokes for clean redraw (avoids blend-mode fade conflicts)
  const strokes = [];
  let currentStroke = null;

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function drawStrokes() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let s = 0; s < strokes.length; s++) {
      const stroke = strokes[s];
      const age = (frameCount - stroke.startFrame) / stroke.lifetime;

      if (age >= 1) continue; // fully faded

      const alpha = 1 - age;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = config.width;
      ctx.beginPath();

      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }

      ctx.stroke();

      // Draw splatters
      for (const sp of stroke.splatters) {
        const splatAge = (frameCount - sp.frame) / stroke.lifetime;
        if (splatAge >= 1) continue;
        ctx.globalAlpha = (1 - splatAge) * 0.7;
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  function animate() {
    frameCount++;

    // Start new stroke on first movement
    if (mouse.x !== prevMouse.x || mouse.y !== prevMouse.y) {
      if (!currentStroke) {
        currentStroke = {
          points: [],
          splatters: [],
          color: getInkColor(),
          startFrame: frameCount,
          lifetime: 180, // ~3 seconds at 60fps
        };
        strokes.push(currentStroke);
      }
      currentStroke.points.push({ x: mouse.x, y: mouse.y });

      // Splatter on fast movement
      const speed = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
      if (speed > 15 && Math.random() > 0.5) {
        const spread = Math.random() * 20 - 10;
        currentStroke.splatters.push({
          x: mouse.x + spread,
          y: mouse.y + spread,
          r: Math.random() * 2,
          frame: frameCount,
        });
      }
    } else {
      currentStroke = null;
    }

    // Remove fully faded strokes to free memory
    while (strokes.length > 0 && (frameCount - strokes[0].startFrame) > strokes[0].lifetime) {
      strokes.shift();
    }

    drawStrokes();
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