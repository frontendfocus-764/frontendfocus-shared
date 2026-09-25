const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

// Effect configuration
const config = {
  particleCount: 120,
  connectDistance: 120,
  particleRadius: 2,

  // 🎨 COLORS — change these
  particleColor: "rgba(139, 92, 246, 0.8)", // Purple particles
  lineColor: "139, 92, 246",                // Purple lines
  mouseColor: "6, 182, 212",               // Cyan mouse lines

  lineOpacity: 0.20,
  mouseLineOpacity: 0.40,

  mouseConnectDistance: 180
};

let particles = [];

const mouse = {
  x: null,
  y: null
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (window.innerWidth < 768) {
    config.particleCount = 50;
  } else {
    config.particleCount = 120;
  }

  initParticles();
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;

    this.radius = config.particleRadius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) {
      this.vx *= -1;
    }

    if (this.y < 0 || this.y > canvas.height) {
      this.vy *= -1;
    }

    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.mouseConnectDistance && distance > 0) {
        const force =
          (config.mouseConnectDistance - distance) /
          config.mouseConnectDistance;

        this.x -= (dx / distance) * force * 2;
        this.y -= (dy / distance) * force * 2;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    ctx.fillStyle = config.particleColor;

    ctx.fill();
  }
}

function initParticles() {
  particles = [];

  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle());
  }
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {

    // Particle → Particle connections
    for (let j = i + 1; j < particles.length; j++) {

      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.connectDistance) {

        const alpha =
          (1 - distance / config.connectDistance) *
          config.lineOpacity;

        ctx.strokeStyle =
          `rgba(${config.lineColor}, ${alpha})`;

        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }

    // Particle → Mouse connections
    if (mouse.x !== null && mouse.y !== null) {

      const dx = particles[i].x - mouse.x;
      const dy = particles[i].y - mouse.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < config.mouseConnectDistance) {

        const alpha =
          (1 - distance / config.mouseConnectDistance) *
          config.mouseLineOpacity;

        ctx.strokeStyle =
          `rgba(${config.mouseColor}, ${alpha})`;

        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  drawLines();

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
  mouse.x = null;
  mouse.y = null;
});

resizeCanvas();
animate();
