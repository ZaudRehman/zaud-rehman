export default function InkCanvas() {
  return `<canvas id="ink-canvas" class="fixed inset-0 pointer-events-none z-[5] mix-blend-multiply opacity-60"></canvas>`;
}

export function initInk() {
  const canvas = document.getElementById('ink-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let trails = [];
  
  // Ink Physics
  const config = {
    length: 20,      // Length of the trail
    width: 8,        // Thickness of the brush
    color: '#2b2b2b',// Charcoal color
    fade: 0.95,      // How fast ink dries (lower = faster)
  };

  const mouse = { x: 0, y: 0 };
  // Track previous mouse position for smooth lines
  const prevMouse = { x: 0, y: 0 };

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function animate() {
    // "Dry" the ink by fading the canvas slightly every frame
    // This creates the disappearing trail effect
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - config.fade})`;
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw the fresh ink from previous mouse pos to current
    ctx.beginPath();
    ctx.strokeStyle = config.color;
    ctx.lineWidth = config.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(prevMouse.x, prevMouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Add some "splatter" dots occasionally if moving fast
    const speed = Math.hypot(mouse.x - prevMouse.x, mouse.y - prevMouse.y);
    if (speed > 15 && Math.random() > 0.5) {
      const spread = Math.random() * 20 - 10;
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(mouse.x + spread, mouse.y + spread, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update previous position for next frame
    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', (e) => {
    // If it's the first move, snap prev to current to avoid long lines from (0,0)
    if (prevMouse.x === 0 && prevMouse.y === 0) {
      prevMouse.x = e.clientX;
      prevMouse.y = e.clientY;
    }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  init();
  animate();
}