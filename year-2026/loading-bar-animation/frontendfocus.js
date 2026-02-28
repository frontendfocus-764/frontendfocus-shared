const bar = document.querySelector(".progress");
const replayBtn = document.querySelector(".replay");
const energy = document.querySelector(".energy");
const particleWrap = document.querySelector(".particles");
const core = document.querySelector(".energy .core");
const glare = document.querySelector(".energy .glare");
const loader = document.querySelector(".loader");
const doneFlash = document.querySelector(".done-flash");
const rootStyles = getComputedStyle(document.documentElement);

function cv(name) {
  return rootStyles.getPropertyValue(name).trim();
}

let targetProgress = 0;
let hiccupTimer = null;
let energyFrameId = null;
let fadeStartTime = 0;
let isLoading = false;

/* ── Inertia physics ── */
let ballX = 0; // visual position along tracker (0-100 %)
let ballVel = 0; // velocity in % per second
let lastTime = 0; // previous frame timestamp
const SPRING = 12; // stiffness (per-second²)
const DAMPING = 6; // friction (per-second) — critically-damped feel
const VEL_CAP = 80; // normalises speed into a 0-1 "t" value (per-second)
const BASE = parseInt(cv("--ball-size")) || 26; // read from CSS variable

/* ── Particles ── */
function spawnParticle() {
  const p = document.createElement("span");
  const sz = Math.random() * 3 + 1;
  const pColor = cv("--active-light");
  Object.assign(p.style, {
    width: sz + "px",
    height: sz + "px",
    left: "0px",
    top: (Math.random() - 0.5) * 20 + "px",
    position: "absolute",
    borderRadius: "50%",
    background: pColor,
    boxShadow: `0 0 8px ${pColor}`
  });
  particleWrap.appendChild(p);

  const dx = -(Math.random() * 40 + 20);
  const dy = (Math.random() - 0.5) * 30;
  const life = Math.random() * 400 + 300;
  const t0 = performance.now();

  (function tick(now) {
    const f = (now - t0) / life;
    if (f >= 1) {
      p.remove();
      return;
    }
    p.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
    p.style.opacity = 1 - f;
    requestAnimationFrame(tick);
  })(t0);
}

/* ── Flicker ── */
setInterval(() => {
  if (!isLoading) return;
  energy.style.filter = `brightness(${1 + Math.random() * 0.6}) saturate(${
    1.5 + Math.random()
  })`;
}, 80);

/* ── Reset core to resting shape ── */
function resetCoreStyle() {
  core.style.width = BASE + "px";
  core.style.height = BASE + "px";
  core.style.borderRadius = "50%";
  core.style.background = cv("--active-light");
  core.style.boxShadow = `0 0 12px ${cv("--active-soft")}, 0 0 32px ${cv(
    "--color-active"
  )}, 0 0 64px ${cv("--active-deep")}`;
  core.style.filter = "blur(2px)";
  glare.style.transform = "";
  energy.style.opacity = "0";
}

/* ── Main animation loop ── */
function updateEnergyBall(ts) {
  if (!isLoading) return;
  if (!fadeStartTime) fadeStartTime = ts;
  if (!lastTime) lastTime = ts;

  // Time-based physics for frame-rate independence
  const dt = Math.min((ts - lastTime) / 1000, 0.05); // cap at 50ms to avoid explosion
  lastTime = ts;

  // Chase the raw targetProgress (discrete jumps)
  const target = targetProgress;

  // Spring-damper: acceleration = SPRING * gap - DAMPING * velocity
  const gap = target - ballX;
  const accel = gap * SPRING - ballVel * DAMPING;
  ballVel += accel * dt;
  ballX = Math.max(0, Math.min(100, ballX + ballVel * dt));

  energy.style.left = ballX + "%";
  bar.style.width = ballX + "%";

  // Normalised speed 0→1 (velocity is now per-second)
  const spd = Math.abs(ballVel);
  const t = Math.min(spd / VEL_CAP, 1);
  const dir = ballVel >= 0 ? 1 : -1; // +1 = rightward

  /* ──── Deformation ──── */

  // Stretch horizontally, compress vertically
  const w = BASE + t * 40; // 26 → 66 px
  const h = BASE - t * 8; // 26 → 18 px

  // Border-radius: leading side stays round, trailing narrows to a sliver
  const lead = 50;
  const trail = Math.max(50 - t * 44, 6); // 50 → 6 %
  const [tl, tr, br, bl] =
    dir >= 0
      ? [trail, lead, lead, trail] // moving right
      : [lead, trail, trail, lead]; // moving left

  // Radial gradient shifts bright center toward leading edge
  //   at rest:  center 50 %   →   at max speed: ~95 % toward leading edge
  const gx = dir >= 0 ? 50 + t * 45 : 50 - t * 45;

  core.style.width = w + "px";
  core.style.height = h + "px";
  core.style.borderRadius = `${tl}% ${tr}% ${br}% ${bl}%`;
  core.style.background =
    `radial-gradient(ellipse at ${gx}% 50%, ` +
    `color-mix(in oklch, ${cv("--active-light")} ${(100 - t * 40).toFixed(
      0
    )}%, #fff) 0%, ` +
    `${cv("--active-light")} ${(30 - t * 25).toFixed(1)}%, ` +
    `color-mix(in oklch, ${cv("--color-active")} ${(
      (0.45 - t * 0.38) *
      100
    ).toFixed(0)}%, transparent) ${(55 - t * 28).toFixed(1)}%, ` +
    `transparent ${(82 - t * 40).toFixed(1)}%)`;

  // Box-shadow glow drifts toward leading edge
  const gs = dir * t * 8;
  core.style.boxShadow =
    `${gs.toFixed(1)}px 0 ${(12 + t * 10).toFixed(
      0
    )}px color-mix(in oklch, ${cv("--active-soft")} ${(
      (1 - t * 0.4) *
      100
    ).toFixed(0)}%, transparent), ` +
    `${(gs * 1.5).toFixed(1)}px 0 ${(32 + t * 14).toFixed(
      0
    )}px color-mix(in oklch, ${cv("--color-active")} ${(
      (0.8 - t * 0.35) *
      100
    ).toFixed(0)}%, transparent), ` +
    `${(gs * 2).toFixed(1)}px 0 ${(64 + t * 16).toFixed(
      0
    )}px color-mix(in oklch, ${cv("--active-deep")} ${(
      (0.6 - t * 0.3) *
      100
    ).toFixed(0)}%, transparent)`;

  // Slight motion blur at speed
  core.style.filter = `blur(${(2 + t * 2).toFixed(1)}px)`;

  // Glare stretches and trails behind at speed
  glare.style.transform = `translateX(${(-t * 30).toFixed(0)}px) scaleX(${(
    1 +
    t * 0.4
  ).toFixed(2)})`;

  // Particles – fewer, scaled to speed
  if (Math.random() < spd / 200) spawnParticle();

  // Fade envelope
  const fadeIn = Math.min((ts - fadeStartTime) / 400, 1);
  const fadeOut = ballX >= 95 ? (100 - ballX) / 5 : 1;
  energy.style.opacity = fadeIn * fadeOut;

  // Completion
  if (target >= 100 && ballX > 99.5) {
    replayBtn.classList.add("open");
    bar.classList.add("done");
    loader.classList.add("bloom");
    isLoading = false;
    resetCoreStyle();
  }

  energyFrameId = requestAnimationFrame(updateEnergyBall);
}

/* ── Progress hiccups ── */
function hiccup() {
  if (targetProgress >= 100) return;
  const jump =
    targetProgress > 80 ? Math.random() * 2 + 0.5 : Math.random() * 10;
  targetProgress = Math.min(targetProgress + jump, 100);
  // Don't set bar.style.width here — the animation loop drives it via the spring
  hiccupTimer = setTimeout(hiccup, Math.random() * 300 + 100);
}

/* ── Start / Replay ── */
function startLoading() {
  clearTimeout(hiccupTimer);
  cancelAnimationFrame(energyFrameId);

  targetProgress = 0;
  fadeStartTime = 0;
  lastTime = 0;
  isLoading = true;
  ballX = 0;
  ballVel = 0;

  bar.style.width = "0%";
  bar.classList.remove("done");
  loader.classList.remove("bloom");
  replayBtn.classList.remove("open");
  energy.style.opacity = "0";
  resetCoreStyle();

  hiccup();

  setTimeout(() => {
    cancelAnimationFrame(energyFrameId);
    energyFrameId = requestAnimationFrame(updateEnergyBall);
  }, 20);
}

replayBtn.addEventListener("click", startLoading);
startLoading();
