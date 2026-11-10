const gsap = window.gsap;

// --- CONFIGURATION ---
const SENSITIVITY = 0.3;
const LERP = 0.045;       
const STAGGER_DELAY = 3; 

const hero = document.querySelector(".hero");
const depthLayers = gsap.utils.toArray(".depth-layer");
const totalDepthLayers = depthLayers.length;

const mouse = { x: 0, y: 0 };

// --- DESKTOP MOUSE EVENTS ---
hero.addEventListener("mousemove", (e) => {
  const rect = hero.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
});

hero.addEventListener("mouseleave", () => {
  mouse.x = 0;
  mouse.y = 0;
});

// --- MOBILE TOUCH EVENTS ---
// Touchstart and Touchmove act exactly like mousemove
function handleTouch(e) {
  if (e.touches.length > 0) {
    const rect = hero.getBoundingClientRect();
    const touch = e.touches[0];
    mouse.x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
  }
}

hero.addEventListener("touchstart", handleTouch, { passive: true });
hero.addEventListener("touchmove", handleTouch, { passive: true });

// Touchend and Touchcancel act exactly like mouseleave
function handleTouchEnd() {
  mouse.x = 0;
  mouse.y = 0;
}

hero.addEventListener("touchend", handleTouchEnd);
hero.addEventListener("touchcancel", handleTouchEnd);

// --- TRAIL BUFFER SETUP ---
const BUFFER_SIZE = totalDepthLayers * STAGGER_DELAY + 1;
const cursorTrail = [];

for (let i = 0; i < BUFFER_SIZE; i++) {
  cursorTrail.push({ x: 0, y: 0 });
}

const layers = depthLayers.map((node, i) => ({
  el: node,
  delay: (totalDepthLayers - 1 - i) * STAGGER_DELAY,
  current: { x: 0, y: 0 },
  setX: gsap.quickSetter(node, "x", "px"),
  setY: gsap.quickSetter(node, "y", "px")
}));

layers.forEach(l => gsap.set(l.el, { force3D: true, willChange: "transform" }));

// --- ANIMATION LOOP ---
gsap.ticker.add(() => {
  const rect = hero.getBoundingClientRect();
  const dt = Math.min(0.033, gsap.ticker.deltaRatio(60) / 60);
  const smoothLerp = 1 - Math.exp(-LERP * 60 * dt);

  cursorTrail.push({
    x: mouse.x * rect.width * SENSITIVITY,
    y: mouse.y * rect.height * SENSITIVITY
  });

  if (cursorTrail.length > BUFFER_SIZE) {
    cursorTrail.shift();
  }

  layers.forEach((layer) => {
    const trailIndex = Math.max(0, cursorTrail.length - 1 - layer.delay);
    const targetPos = cursorTrail[trailIndex];

    layer.current.x += (targetPos.x - layer.current.x) * smoothLerp;
    layer.current.y += (targetPos.y - layer.current.y) * smoothLerp;

    layer.setX(layer.current.x);
    layer.setY(layer.current.y);
  });
});