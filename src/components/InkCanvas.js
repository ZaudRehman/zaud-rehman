export default function InkCanvas() {
  return `<canvas id="ink-canvas" class="fixed inset-0 pointer-events-none z-[5] mix-blend-multiply opacity-70"></canvas>`;
}

export function initInk() {
  const canvas = document.getElementById('ink-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  const config = {
    minWidth: 1.2,
    maxWidth: 12,
    fade: 220,
    nibAngle: Math.PI / 4,
    smoothing: 0.22,
    pressureResponse: 0.45,
    curveThicken: 0.35,
    taperLength: 10,
    minDist: 1.5,
  };

  function getInkColor() {
    return document.body.classList.contains('night-mode') ? '#c5cdd9' : '#1a1a1a';
  }

  function updateBlendMode() {
    canvas.style.mixBlendMode = document.body.classList.contains('night-mode') ? 'screen' : 'multiply';
  }

  const mouse = { x: 0, y: 0 };
  const prevMouse = { x: 0, y: 0 };
  let rafId = null;
  let frameCount = 0;

  const strokes = [];
  let currentStroke = null;

  function init() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // ── Calligraphy width ─────────────────────────────────────
  function computeWidth(dx, dy, speed, prevAngle) {
    const angle = Math.atan2(dy, dx);
    const relAngle = Math.abs(Math.sin(angle - config.nibAngle));
    const dirWidth = config.minWidth + (config.maxWidth - config.minWidth) * relAngle;
    const speedFactor = 1 - Math.min(speed * 0.015, 0.5) * config.pressureResponse;

    let curveBoost = 0;
    if (prevAngle !== null) {
      let d = Math.abs(angle - prevAngle);
      if (d > Math.PI) d = 2 * Math.PI - d;
      curveBoost = d * config.curveThicken * config.maxWidth;
    }

    return Math.max(config.minWidth, dirWidth * speedFactor + curveBoost);
  }

  // ── Hermite smooth ────────────────────────────────────────
  function hermite(t, v0, v1, v2, v3) {
    const t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * v1) + (-v0 + v2) * t + (2 * v0 - 5 * v1 + 4 * v2 - v3) * t2 + (-v0 + 3 * v1 - 3 * v2 + v3) * t3);
  }

  // ── Smooth the raw points ─────────────────────────────────
  function smoothPoints(pts, rounds) {
    if (pts.length < 3) return pts;
    let out = pts.map(p => ({ ...p }));
    for (let r = 0; r < rounds; r++) {
      const next = [out[0]];
      for (let i = 1; i < out.length - 1; i++) {
        next.push({
          x: out[i - 1].x * 0.25 + out[i].x * 0.5 + out[i + 1].x * 0.25,
          y: out[i - 1].y * 0.25 + out[i].y * 0.5 + out[i + 1].y * 0.25,
          width: out[i - 1].width * 0.25 + out[i].width * 0.5 + out[i + 1].width * 0.25,
          frame: out[i].frame,
        });
      }
      next.push(out[out.length - 1]);
      out = next;
    }
    return out;
  }

  // ── Draw stroke as a filled polygon ───────────────────────
  function drawStrokePolygon(pts, fadeAlpha) {
    if (pts.length < 2) return;

    // Compute perpendicular offsets for each point
    const leftEdge = [];
    const rightEdge = [];

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];

      // Taper
      let taper = 1;
      const tLen = config.taperLength;
      if (i < tLen) {
        const t = i / tLen;
        taper = t * t * (3 - 2 * t);
      } else if (i > pts.length - tLen) {
        const t = (pts.length - i) / tLen;
        taper = t * t * (3 - 2 * t);
      }

      const halfW = Math.max(0.5, (p.width || config.minWidth) * taper * 0.5);

      // Normal direction (perpendicular to stroke direction)
      let nx, ny;
      if (i === 0) {
        const dx = pts[1].x - p.x;
        const dy = pts[1].y - p.y;
        const len = Math.hypot(dx, dy) || 1;
        nx = -dy / len;
        ny = dx / len;
      } else if (i === pts.length - 1) {
        const dx = p.x - pts[i - 1].x;
        const dy = p.y - pts[i - 1].y;
        const len = Math.hypot(dx, dy) || 1;
        nx = -dy / len;
        ny = dx / len;
      } else {
        // Average of both directions for smooth normals
        const dx1 = p.x - pts[i - 1].x;
        const dy1 = p.y - pts[i - 1].y;
        const dx2 = pts[i + 1].x - p.x;
        const dy2 = pts[i + 1].y - p.y;
        const len1 = Math.hypot(dx1, dy1) || 1;
        const len2 = Math.hypot(dx2, dy2) || 1;
        const mx = -(dy1 / len1 + dy2 / len2);
        const my = (dx1 / len1 + dx2 / len2);
        const mLen = Math.hypot(mx, my) || 1;
        nx = mx / mLen;
        ny = my / mLen;
      }

      leftEdge.push({ x: p.x + nx * halfW, y: p.y + ny * halfW });
      rightEdge.push({ x: p.x - nx * halfW, y: p.y - ny * halfW });
    }

    // Build polygon: left edge forward, right edge backward
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = currentStroke ? currentStroke.color : getInkColor();
    ctx.beginPath();
    ctx.moveTo(leftEdge[0].x, leftEdge[0].y);

    // Spline along left edge
    for (let i = 1; i < leftEdge.length - 1; i++) {
      const mx = (leftEdge[i].x + leftEdge[i + 1].x) / 2;
      const my = (leftEdge[i].y + leftEdge[i + 1].y) / 2;
      ctx.quadraticCurveTo(leftEdge[i].x, leftEdge[i].y, mx, my);
    }
    ctx.lineTo(leftEdge[leftEdge.length - 1].x, leftEdge[leftEdge.length - 1].y);

    // Connect to right edge (tip)
    const lastL = leftEdge[leftEdge.length - 1];
    const lastR = rightEdge[rightEdge.length - 1];
    ctx.lineTo(lastR.x, lastR.y);

    // Spline along right edge backward
    for (let i = rightEdge.length - 2; i > 0; i--) {
      const mx = (rightEdge[i].x + rightEdge[i - 1].x) / 2;
      const my = (rightEdge[i].y + rightEdge[i - 1].y) / 2;
      ctx.quadraticCurveTo(rightEdge[i].x, rightEdge[i].y, mx, my);
    }
    ctx.lineTo(rightEdge[0].x, rightEdge[0].y);

    // Close back to start
    ctx.closePath();
    ctx.fill();
  }

  // ── Draw splatters ────────────────────────────────────────
  function drawSplatters(stroke, fadeAlpha) {
    for (const sp of stroke.splatters) {
      const age = (frameCount - sp.frame) / config.fade;
      if (age >= 1) continue;

      const t = 1 - age;
      ctx.globalAlpha = t * t * 0.5 * fadeAlpha;
      ctx.fillStyle = stroke.color;

      ctx.save();
      ctx.translate(sp.x, sp.y);

      if (sp.type === 'elongated') {
        ctx.rotate(sp.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, sp.r * 2.2, sp.r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (sp.type === 'pool') {
        ctx.beginPath();
        ctx.arc(0, 0, sp.r * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = t * t * 0.25 * fadeAlpha;
        ctx.beginPath();
        ctx.arc(0, 0, sp.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // ── Main draw loop ────────────────────────────────────────
  function drawAll() {
    ctx.clearRect(0, 0, width, height);

    for (const stroke of strokes) {
      const age = (frameCount - stroke.startFrame) / config.fade;
      if (age >= 1) continue;

      const fadeT = 1 - age;
      const fadeAlpha = fadeT * fadeT;

      // Smooth the points for rendering
      const pts = smoothPoints(stroke.points, 2);

      drawStrokePolygon(pts, fadeAlpha);
      drawSplatters(stroke, fadeAlpha);
    }

    ctx.globalAlpha = 1;
  }

  // ── Animate ───────────────────────────────────────────────
  function animate() {
    frameCount++;

    if (mouse.x !== prevMouse.x || mouse.y !== prevMouse.y) {
      const dx = mouse.x - prevMouse.x;
      const dy = mouse.y - prevMouse.y;
      const dist = Math.hypot(dx, dy);

      if (dist < config.minDist) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      if (!currentStroke) {
        currentStroke = {
          points: [],
          splatters: [],
          color: getInkColor(),
          startFrame: frameCount,
        };
        strokes.push(currentStroke);
      }

      const prevAngle = currentStroke.points.length > 0
        ? Math.atan2(mouse.y - currentStroke.points[currentStroke.points.length - 1].y,
                      mouse.x - currentStroke.points[currentStroke.points.length - 1].x)
        : null;

      const w = computeWidth(dx, dy, dist, prevAngle);

      currentStroke.points.push({
        x: mouse.x,
        y: mouse.y,
        width: w,
        frame: frameCount,
      });

      const angle = Math.atan2(dy, dx);

      // Fast: directional splatter
      if (dist > 16 && Math.random() > 0.5) {
        currentStroke.splatters.push({
          x: mouse.x + (Math.random() - 0.5) * 12,
          y: mouse.y + (Math.random() - 0.5) * 8,
          r: Math.random() * 1.4 + 0.3,
          frame: frameCount,
          angle,
          type: 'elongated',
        });
      }

      // Very fast: micro dots
      if (dist > 28 && Math.random() > 0.65) {
        for (let i = 0; i < 2; i++) {
          currentStroke.splatters.push({
            x: mouse.x + (Math.random() - 0.5) * 18,
            y: mouse.y + (Math.random() - 0.5) * 18,
            r: Math.random() * 0.7 + 0.2,
            frame: frameCount,
            angle: Math.random() * Math.PI * 2,
            type: 'dot',
          });
        }
      }

      // Direction change: ink pool
      if (prevAngle !== null) {
        let d = Math.abs(angle - prevAngle);
        if (d > Math.PI) d = 2 * Math.PI - d;
        if (d > 0.5 && dist > 5 && Math.random() > 0.45) {
          currentStroke.splatters.push({
            x: mouse.x + (Math.random() - 0.5) * 6,
            y: mouse.y + (Math.random() - 0.5) * 6,
            r: Math.random() * 1.8 + 0.6,
            frame: frameCount,
            angle: 0,
            type: 'pool',
          });
        }
      }

      // Slow: pooling
      if (dist > 0.5 && dist < 2.5 && Math.random() > 0.6) {
        currentStroke.splatters.push({
          x: mouse.x + (Math.random() - 0.5) * 3,
          y: mouse.y + (Math.random() - 0.5) * 3,
          r: Math.random() * 0.9 + 0.2,
          frame: frameCount,
          angle: 0,
          type: 'pool',
        });
      }
    } else {
      currentStroke = null;
    }

    while (strokes.length > 0 && (frameCount - strokes[0].startFrame) > config.fade) {
      strokes.shift();
    }

    drawAll();
    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;

    rafId = requestAnimationFrame(animate);
  }

  function start() { if (!rafId) rafId = requestAnimationFrame(animate); }
  function stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', (e) => {
    if (prevMouse.x === 0 && prevMouse.y === 0) { prevMouse.x = e.clientX; prevMouse.y = e.clientY; }
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  init();
  start();
  updateBlendMode();

  const observer = new MutationObserver(updateBlendMode);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
