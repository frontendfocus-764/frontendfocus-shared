const sky = document.getElementById("sky");
const poppedEl = document.getElementById("popped");
const flewEl = document.getElementById("flew");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const bubbles = [];
let popped = 0,
  flew = 0;
const pointer = { x: -9999, y: -9999 };
const rand = (a, b) => a + Math.random() * (b - a);

// Make one bubble at (x, y). If y is omitted, it starts below the screen.
function blow(x = rand(0, innerWidth), y = innerHeight + 100, size) {
  const s = size || rand(44, Math.min(170, innerWidth * 0.32));
  const el = document.createElement("div");
  el.className = "bubble";
  el.style.setProperty("--size", s + "px");
  el.style.setProperty("--swirl", rand(6, 12) + "s");
  sky.appendChild(el);
  const b = {
    el,
    x,
    y,
    s,
    baseX: x,
    rise: rand(0.35, 0.9) * (reduce ? 0.4 : 1) * (60 / s + 0.6), // small ones rise faster
    sway: rand(10, 30),
    freq: rand(0.0006, 0.0014),
    phase: rand(0, Math.PI * 2),
    push: 0,
    pushX: 0,
    pushY: 0,
    grow: y > innerHeight ? 1 : 0 // new bubbles at the pointer grow in
  };
  el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    pop(b);
  });
  bubbles.push(b);
  return b;
}

// Pop: flash the film, throw droplets, draw a ring
function pop(b) {
  if (b.el.classList.contains("is-popping")) return;
  b.el.classList.add("is-popping");
  bubbles.splice(bubbles.indexOf(b), 1);
  setTimeout(() => b.el.remove(), 160);
  poppedEl.textContent = ++popped;
  if (reduce) return;

  const r = b.s / 2;
  const ring = document.createElement("div");
  ring.className = "ring";
  Object.assign(ring.style, {
    width: b.s + "px",
    height: b.s + "px",
    marginLeft: -r + "px",
    marginTop: -r + "px"
  });
  sky.appendChild(ring);
  ring.animate(
    [
      { transform: `translate(${b.x}px, ${b.y}px) scale(1)`, opacity: 0.8 },
      { transform: `translate(${b.x}px, ${b.y}px) scale(1.5)`, opacity: 0 }
    ],
    { duration: 420, easing: "cubic-bezier(.2,.7,.3,1)" }
  ).onfinish = () => ring.remove();

  const n = Math.round(10 + b.s / 12);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand(-0.2, 0.2);
    const d = document.createElement("i");
    d.className = "drop";
    d.style.setProperty("--d", rand(2, 5) + "px");
    sky.appendChild(d);
    const x0 = b.x + Math.cos(a) * r,
      y0 = b.y + Math.sin(a) * r;
    const dist = rand(20, 60) + r * 0.3;
    const x1 = x0 + Math.cos(a) * dist,
      y1 = y0 + Math.sin(a) * dist;
    d.animate(
      [
        { transform: `translate(${x0}px, ${y0}px)`, opacity: 1 },
        {
          transform: `translate(${x1}px, ${y1}px)`,
          opacity: 0.9,
          offset: 0.45
        },
        {
          transform: `translate(${x1 + Math.cos(a) * 8}px, ${
            y1 + rand(50, 110)
          }px)`,
          opacity: 0
        } // falls
      ],
      { duration: rand(600, 900), easing: "cubic-bezier(.15,.6,.4,1)" }
    ).onfinish = () => d.remove();
  }
}

// Tap the background: blow a new bubble there
sky.addEventListener("pointerdown", (e) => {
  const b = blow(e.clientX, e.clientY, rand(60, 120));
  b.rise *= 0.6;
});
addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});
addEventListener("pointerleave", () => {
  pointer.x = pointer.y = -9999;
});

// Start with a sky full of bubbles
const start = Math.round(Math.max(8, Math.min(14, innerWidth / 70)));
for (let i = 0; i < start; i++)
  blow(rand(0, innerWidth), rand(innerHeight * 0.2, innerHeight * 1.1));

let last = performance.now();
function tick(now) {
  const dt = Math.min(48, now - last);
  last = now;
  for (const b of [...bubbles]) {
    b.y -= b.rise * dt * 0.06;
    // the pointer works like a light breeze
    const dx = b.x - pointer.x,
      dy = b.y - pointer.y;
    const dist = Math.hypot(dx, dy),
      reach = b.s / 2 + 90;
    if (dist < reach && dist > 0) {
      const f = (1 - dist / reach) * 0.9;
      b.pushX += (dx / dist) * f;
      b.pushY += (dy / dist) * f;
    }
    b.pushX *= 0.94;
    b.pushY *= 0.94;
    b.baseX += b.pushX;
    b.y += b.pushY;
    b.x = b.baseX + Math.sin(now * b.freq + b.phase) * b.sway;
    if (b.grow < 1) b.grow = Math.min(1, b.grow + dt / 260);
    const wobble = reduce ? 1 : 1 + Math.sin(now * 0.003 + b.phase) * 0.025;
    b.el.style.transform = `translate(${b.x}px, ${b.y}px) scale(${
      b.grow * wobble
    }, ${b.grow / wobble})`;
    // flew away over the top: count it and send a new one from below
    if (b.y < -b.s) {
      b.el.remove();
      bubbles.splice(bubbles.indexOf(b), 1);
      flewEl.textContent = ++flew;
      blow();
    }
  }
  // keep the sky from getting empty
  if (bubbles.length < start * 0.6) blow();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
