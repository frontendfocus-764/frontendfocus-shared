const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d", { alpha: false });

let w = 0,
  h = 0,
  dpr = 1;

function resize() {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", () => {
  resize();
  buildTargets();
  retarget(true);
});
resize();

const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ===========================
// 1) Herz-Kontur (Targets)
// ===========================
let targets = [];

function heartOutlinePoints(count, cx, cy, s) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * (Math.PI * 2);

    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      1 * Math.cos(4 * t);

    pts.push({ x: cx + x * s, y: cy - y * s });
  }
  return pts;
}

function buildTargets() {
  const cx = w * 0.5;
  const cy = h * 0.54; // leicht tiefer
  const scale = Math.min(w, h) * 0.018;

  targets = heartOutlinePoints(520, cx, cy, scale);
}
buildTargets();

// ===========================
// 2) Partikel (520)
// ===========================
const COUNT = 520;
const particles = [];

function spawnFromOutside() {
  // Startpositionen außerhalb des Viewports (Ring)
  const side = Math.floor(rand(0, 4));
  let x, y;

  if (side === 0) {
    // top
    x = rand(-w * 0.1, w * 1.1);
    y = rand(-h * 0.25, -20);
  } else if (side === 1) {
    // right
    x = rand(w + 20, w * 1.25);
    y = rand(-h * 0.1, h * 1.1);
  } else if (side === 2) {
    // bottom
    x = rand(-w * 0.1, w * 1.1);
    y = rand(h + 20, h * 1.25);
  } else {
    // left
    x = rand(-w * 0.25, -20);
    y = rand(-h * 0.1, h * 1.1);
  }
  return { x, y };
}

for (let i = 0; i < COUNT; i++) {
  const t = targets[i];
  const start = spawnFromOutside();

  particles.push({
    x: start.x,
    y: start.y,
    vx: rand(-0.4, 0.4),
    vy: rand(-0.4, 0.4),
    tx: t.x,
    ty: t.y,
    r: rand(1.2, 2.4),
    a: rand(0.22, 0.55),
    // kleine individuelle Verzögerung -> "einschweben" wirkt gestaffelt
    delay: i * 0.6, // Frames
  });
}

function retarget(reseed = false) {
  for (let i = 0; i < particles.length; i++) {
    const t = targets[i % targets.length];
    particles[i].tx = t.x;
    particles[i].ty = t.y;

    if (reseed) {
      const start = spawnFromOutside();
      particles[i].x = start.x;
      particles[i].y = start.y;
      particles[i].vx = rand(-0.6, 0.6);
      particles[i].vy = rand(-0.6, 0.6);
      particles[i].delay = i * 0.6;
    }
  }
}

// ===========================
// 3) Bewegung (sanftes "Settling")
// ===========================
const ATTRACTION = 0.02; // Zug zur Kontur
const DAMPING = 0.88; // bremst
const DRIFT = 0.02; // minimal lebendig (kann 0 sein)

function step() {
  // Hintergrund
  ctx.fillStyle = "#0b0c18";
  ctx.fillRect(0, 0, w, h);

  // Glow-Einstellungen (leicht!)
  ctx.shadowColor = "rgba(255, 170, 90, 0.28)";
  ctx.shadowBlur = 10;

  for (const p of particles) {
    // Delay: Partikel "warten" minimal, bevor sie losziehen
    if (p.delay > 0) {
      p.delay -= 1;
    } else {
      const ax = (p.tx - p.x) * ATTRACTION;
      const ay = (p.ty - p.y) * ATTRACTION;

      // Minimaler Drift, damit es nicht "tot" wirkt
      p.vx = (p.vx + ax + rand(-DRIFT, DRIFT)) * DAMPING;
      p.vy = (p.vy + ay + rand(-DRIFT, DRIFT)) * DAMPING;

      p.x += p.vx;
      p.y += p.vy;
    }

    // Punkt zeichnen
    ctx.fillStyle = `rgba(255, 205, 140, ${p.a})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glow zurücksetzen
  ctx.shadowBlur = 0;

  requestAnimationFrame(step);
}

step();

// Optional: Klick = nochmal einschweben lassen
window.addEventListener("click", () => {
  retarget(true);
});
