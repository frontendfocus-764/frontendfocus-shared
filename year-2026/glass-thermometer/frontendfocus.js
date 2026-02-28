const CONFIG = {
  minTemp: 20,
  maxTemp: 110,
  defaultTemp: 70,
  gradientColors: ["#00eaff", "#0099ff", "#00ff73", "#ffdd00", "#ff8800", "#ff0044"],
  gradientStops: [0, 0.25, 0.5, 0.7, 0.85, 1],
  thresholds: { snow: 40 }
};

const els = {
  track: document.getElementById("track"),
  mercury: document.getElementById("mercury"),
  knob: document.getElementById("knob"),
  scaleContainer: document.getElementById("scaleContainer"),
  tempValue: document.getElementById("tempValue"),
  statusText: document.getElementById("statusText"),
  uiParticles: document.getElementById("uiParticles"),
  root: document.documentElement
};

let currentTemp = CONFIG.defaultTemp;
let trackHeight = 0, knobBounds = { minY: 0, maxY: 0 }, scaleItems = [], colorMap;
let snowParticleIntervalId = null;

// linear interpolation helper
const lerp = (a, b, t) => a + (b - a) * t;

function createColorMap() {
  const stops = CONFIG.gradientStops;
  const colors = CONFIG.gradientColors.map(c => gsap.utils.splitColor(c));
  return t => {
    t = Math.max(0, Math.min(1, t));
    for (let i = 0; i < stops.length - 1; i++) {
      const s0 = stops[i], s1 = stops[i + 1];
      if (t >= s0 && t <= s1) {
        const n = (t - s0) / (s1 - s0);
        const c0 = colors[i], c1 = colors[i + 1];
        return `rgb(${Math.round(lerp(c0[0], c1[0], n))},${Math.round(lerp(c0[1], c1[1], n))},${Math.round(lerp(c0[2], c1[2], n))})`;
      }
    }
  };
}

function buildScale() {
  els.scaleContainer.innerHTML = "";
  scaleItems = [];
  const min = CONFIG.minTemp, max = CONFIG.maxTemp, range = max - min;
  const rect = els.track.getBoundingClientRect();
  const trackH = rect.height;
  for (let t = min; t <= max; t += 2) {
    const el = document.createElement("div");
    el.className = "scale-mark";
    const tick = document.createElement("div");
    tick.className = "tick";
    if (t % 10 === 0) tick.style.width = "18px";
    else if (t % 5 === 0) tick.style.width = "12px";
    else tick.style.width = "6px";
    const y = (1 - (t - min) / range) * (trackH - 1);
    el.style.top = `${y}px`;
    if (t % 10 === 0) el.innerHTML = `${t}<div class="tick"></div>`;
    el.appendChild(tick);
    el.dataset.temp = t;
    els.scaleContainer.appendChild(el);
    scaleItems.push(el);
  }
}

function updateScaleVisuals(knobY) {
  scaleItems.forEach(el => {
    const rect = els.track.getBoundingClientRect();
    const elY = parseFloat(el.style.top);
    const dist = Math.abs(knobY - elY), maxDist = 70;
    if (dist < maxDist) {
      const p = 1 - dist / maxDist;
      gsap.set(el, {
        scale: 1 + p * 0.8,
        opacity: 0.6 + p * 0.6,
        color: "#fff",
        textShadow: "0 0 8px var(--glow-color)"
      });
    } else {
      gsap.set(el, {
        scale: 1,
        opacity: 0.3,
        color: "rgba(255,255,255,0.35)",
        textShadow: "none"
      });
    }
  });
}

function updateStatusText(t) {
  let txt = "";
  if (t < 32) txt = "Freezing";
  else if (t < 55) txt = "Cold";
  else if (t < 66) txt = "Cool";
  else if (t <= 74) txt = "Comfortable";
  else if (t < 85) txt = "Warm";
  else if (t < 95) txt = "Hot";
  else txt = "Extreme";
  els.statusText.textContent = txt;
}

function applyColorTheme(color) {
  els.root.style.setProperty("--glow-color", color);
  els.tempValue.style.color = color;
  els.statusText.style.color = color;
  els.mercury.style.boxShadow = `0 0 40px ${color}, 0 0 80px ${color}`;
}

function updateSystemFromY(yPos) {
  yPos = Math.max(knobBounds.minY, Math.min(knobBounds.maxY, yPos));
  const pct = 1 - yPos / trackHeight;
  const temp = CONFIG.minTemp + pct * (CONFIG.maxTemp - CONFIG.minTemp);
  currentTemp = Math.round(temp);
  const norm = (currentTemp - CONFIG.minTemp) / (CONFIG.maxTemp - CONFIG.minTemp);
  const color = colorMap(norm);
  els.tempValue.textContent = currentTemp + "°";
  els.mercury.style.height = pct * 100 + "%";
  applyColorTheme(color);
  updateStatusText(currentTemp);
  updateScaleVisuals(yPos);
  updateSnowParticles(currentTemp);
}

function initLayout() {
  const rect = els.track.getBoundingClientRect();
  trackHeight = rect.height;
  knobBounds = { minY: 0, maxY: trackHeight };
  buildScale();
  const norm = (CONFIG.defaultTemp - CONFIG.minTemp) / (CONFIG.maxTemp - CONFIG.minTemp);
  const startY = trackHeight * (1 - norm);
  gsap.set(els.knob, { y: startY });
  updateSystemFromY(startY);
}

function initDrag() {
  Draggable.create(els.knob, {
    type: "y",
    bounds: { minY: knobBounds.minY, maxY: knobBounds.maxY },
    inertia: true,
    onDrag() { updateSystemFromY(this.y); },
    onThrowUpdate() { updateSystemFromY(this.y); }
  });
}

/* Improved Snow Particles with more prominence and random fall */

const minSnowSpawnInterval = 1.2;
const maxSnowSpawnInterval = 5;
const minSnowFallDuration = 4;
const maxSnowFallDuration = 7;

function createSnowParticle() {
  const p = document.createElement("div");
  p.className = "particle";
  els.uiParticles.appendChild(p);

  const vw = window.innerWidth, vh = window.innerHeight;
  const size = Math.random() * 12 + 7;
  const baseOpacity = 0.9 + Math.random() * 0.1;
  const blurVal = Math.random() * 1.6 + 0.9;

  p.style.width = p.style.height = size + "px";
  p.style.borderRadius = "50%";
  p.style.background = `radial-gradient(circle, rgba(255,255,255,${baseOpacity}) 0%, rgba(255,255,255,${baseOpacity * 0.9}) 70%, transparent 100%)`;
  p.style.filter = `blur(${blurVal}px)`; // +30% brightness
  p.style.boxShadow = "0 0 24px rgba(255,255,255,0.95)"; // 30% bigger glow

  // ALWAYS spawn ABOVE viewport
  const startX = Math.random() * vw;
  const startY = -50 - Math.random() * 150; // -50 to -200px

  gsap.set(p, { x: startX, y: startY, opacity: 0, scale: 0.6 });

  const swayX = 80 + Math.random() * 60;
  const fallDuration = getSnowFallDuration(currentTemp);

  gsap.timeline({ onComplete: () => p.remove() })
    .to(p, { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" })
    .to(p, {
      y: vh + 80,
      x: "+=" + (Math.random() * swayX - swayX / 2),
      rotation: Math.random() * 180,
      opacity: 0,
      duration: fallDuration,
      ease: "none"
    }, 0)
    .to(p, {
      x: "+=" + (Math.random() * 40 - 20),
      yoyo: true,
      repeat: 1,
      duration: 2 + Math.random() * 3,
      ease: "sine.inOut"
    }, 0.2);
}

function getSnowFallDuration(temp) {
  const clampedTemp = Math.max(20, Math.min(temp, 40));
  const requiredPct = (40 - clampedTemp) / 20;
  return lerp(maxSnowFallDuration, maxSnowFallDuration * 0.55, requiredPct); // 30% faster
}

function getSnowSpawnInterval(temp) {
  const clampedTemp = Math.max(20, Math.min(temp, 40));
  const requiredPct = (40 - clampedTemp) / 20;
  return lerp(maxSnowSpawnInterval, maxSnowSpawnInterval * 0.45, requiredPct); // 55% more snow
}

function updateSnowParticles(temp) {
  if (temp > CONFIG.thresholds.snow) {
    // Stop snow if above threshold
    if (snowParticleIntervalId !== null) {
      clearInterval(snowParticleIntervalId);
      snowParticleIntervalId = null;
    }
    els.uiParticles.innerHTML = "";
    return;
  }

  if (snowParticleIntervalId !== null) clearInterval(snowParticleIntervalId);

  // Spawn immediately on threshold crossing
  createSnowParticle();

  const spawnInterval = getSnowSpawnInterval(temp) * 100; // convert to ms scaled 
  snowParticleIntervalId = setInterval(() => {
    createSnowParticle();
  }, spawnInterval);
}

window.addEventListener("load", () => {
  colorMap = createColorMap();
  initLayout();
  initDrag();
  updateSnowParticles(currentTemp);
});

window.addEventListener("resize", () => {
  initLayout();
  updateSnowParticles(currentTemp);
});