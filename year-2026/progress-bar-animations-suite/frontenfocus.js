const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pauseBtn");

const cards = Array.from(document.querySelectorAll(".card"));
const stripedEl = document.querySelector("[data-indeterminate]");

// Build segmented steps (10)
const segWrap = document.querySelector("[data-segments]");
const SEG_COUNT = 10;
const segEls = [];
for (let i = 0; i < SEG_COUNT; i++) {
  const d = document.createElement("div");
  d.className = "seg";
  segWrap.appendChild(d);
  segEls.push(d);
}

// Helpers
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function setPctText(card, p) {
  const pct = card.querySelector("[data-pct]");
  if (!pct) return;
  pct.textContent = `${Math.round(p)}%`;
}

function setAria(card, p) {
  const bar = card.querySelector('[role="progressbar"]');
  if (!bar) return;
  bar.setAttribute("aria-valuenow", String(Math.round(p)));
}

function setFill(card, p) {
  const fill = card.querySelector("[data-fill]");
  if (!fill) return;
  fill.style.setProperty("--p", p.toFixed(2));
}

function setSegmented(p) {
  // map 0..100 to 0..10 steps
  const step = Math.round((p / 100) * SEG_COUNT);
  segEls.forEach((el, idx) => {
    el.classList.toggle("on", idx < step);
  });
}

function setBuffer(b, p) {
  const bufferEl = document.querySelector("[data-buffer]");
  const bTxt = document.querySelector("[data-btxt]");
  const pTxt = document.querySelector("[data-ptxt]");

  bufferEl.style.setProperty("--b", b.toFixed(2));
  bTxt.textContent = `${Math.round(b)}%`;
  pTxt.textContent = `${Math.round(p)}%`;
}

function setHeatMarker(p) {
  const heatCard = document.querySelector('[data-kind="heat"]');
  const marker = heatCard.querySelector("[data-marker]");
  const fill = heatCard.querySelector("[data-fill]");

  // 1) Fill should reach exact 0..100 (so 100% becomes fully filled)
  const fillP = clamp(p, 0, 100);
  fill.style.setProperty("--p", fillP.toFixed(2));

  // 2) Marker bubble should stay inside bounds (so it doesn't overflow)
  const markerP = clamp(p, 2, 98);
  marker.textContent = `${Math.round(p)}%`;
  marker.style.left = `${markerP}%`;
}


// State
let rafId = null;
let startTime = 0;
let paused = false;
let pauseAt = 0;
let lastP = 0;

// Timing curve (smooth but punchy)
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function applyAll(p) {
  // 1) Simple fill
  const simple = document.querySelector('[data-kind="simple"]');
  setFill(simple, p);
  setPctText(simple, p);
  setAria(simple, p);

  // 2) Segmented
  const seg = document.querySelector('[data-kind="segmented"]');
  setSegmented(p);
  setPctText(seg, p);

  // 3) Gradient
  const grad = document.querySelector('[data-kind="gradient"]');
  setFill(grad, p);
  setPctText(grad, p);
  setAria(grad, p);

  // 5) Buffer: buffer leads progress (buffer always >= progress)
  // buffer runs a bit ahead and settles near 100
  const bufferCard = document.querySelector('[data-kind="buffer"]');
  const buffer = clamp(p + 18 * (1 - p / 100) + 6 * Math.sin((p / 100) * Math.PI), 0, 100);
  bufferCard.querySelector("[data-fill]").style.setProperty("--p", p.toFixed(2));
  bufferCard.querySelector("[data-buffer]").style.setProperty("--b", buffer.toFixed(2));
  setPctText(bufferCard, p);
  setBuffer(buffer, p);

  // 6) Heat
  const heat = document.querySelector('[data-kind="heat"]');
  // heat bar fill width is safe-adjusted inside setHeatMarker
  setHeatMarker(p);
  setPctText(heat, p);
  setAria(heat, p);

  // keep glow position correct on simple/buffer/heat
  simple.querySelector(".glow")?.style.setProperty("--p", p.toFixed(2));
  bufferCard.querySelector(".cap")?.style.setProperty("--p", p.toFixed(2));
  heat.querySelector("[data-marker]")?.style.setProperty("--p", p.toFixed(2));

  lastP = p;
}

function startRun() {
  cancelAnimationFrame(rafId);
  paused = false;
  pauseBtn.setAttribute("aria-pressed", "false");
  pauseBtn.textContent = "Pause";

  // Enable indeterminate stripes animation
  stripedEl.style.animationPlayState = "running";

  startTime = performance.now();
  rafId = requestAnimationFrame(tick);
}

function tick(now) {
  if (paused) return;

  const DURATION = 3600; // ms total
  const t = clamp((now - startTime) / DURATION, 0, 1);

  // blend easing to feel premium
  const e = 0.65 * easeOutCubic(t) + 0.35 * easeInOut(t);
  const p = clamp(e * 100, 0, 100);

  applyAll(p);

  if (t < 1) {
    rafId = requestAnimationFrame(tick);
  } else {
    // Finish state: keep stripes running for a moment, then stop
    setTimeout(() => {
      // When completed, stripes can subtly pause (optional)
      if (!paused) stripedEl.style.animationPlayState = "paused";
    }, 450);
  }
}

function resetAll() {
  cancelAnimationFrame(rafId);
  paused = false;
  pauseBtn.setAttribute("aria-pressed", "false");
  pauseBtn.textContent = "Pause";

  // Reset values
  applyAll(0);

  // Segments off
  setSegmented(0);

  // Buffer text reset
  setBuffer(0, 0);

  // Heat marker reset
  const heatCard = document.querySelector('[data-kind="heat"]');
  const marker = heatCard.querySelector("[data-marker]");
  marker.textContent = "0%";
  marker.style.left = "0%";

  // Indeterminate stripes paused by default
  stripedEl.style.animationPlayState = "paused";
}

function togglePause() {
  if (!rafId && lastP === 0) return; // nothing running yet

  paused = !paused;
  pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
  pauseBtn.textContent = paused ? "Resume" : "Pause";

  // Pause indeterminate stripes too
  stripedEl.style.animationPlayState = paused ? "paused" : "running";

  if (!paused) {
    // continue from where we stopped:
    // rebuild startTime so progress resumes smoothly from lastP
    const DURATION = 3600;
    const tApprox = clamp(lastP / 100, 0, 1);
    // invert-ish: good enough for smooth resume
    startTime = performance.now() - tApprox * DURATION;
    rafId = requestAnimationFrame(tick);
  }
}

startBtn.addEventListener("click", startRun);
resetBtn.addEventListener("click", resetAll);
pauseBtn.addEventListener("click", togglePause);

// initial state
resetAll();
