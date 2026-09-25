const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

let w = (canvas.width = innerWidth);
let h = (canvas.height = innerHeight);

const mouse = {
  x: w / 2,
  y: h / 2
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", () => {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
});

const particles = [];

for (let i = 0; i < 1000; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 0,
    vy: 0
  });
}

function animate() {
  ctx.fillStyle = "rgba(5,5,5,0.08)";
  ctx.fillRect(0, 0, w, h);

  particles.forEach((p) => {
    const dx = mouse.x - p.x;
    const dy = mouse.y - p.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      const force = (150 - dist) / 150;

      p.vx -= dx * 0.0008 * force;
      p.vy -= dy * 0.0008 * force;
    }

    p.vx *= 0.98;
    p.vy *= 0.98;

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;

    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();
