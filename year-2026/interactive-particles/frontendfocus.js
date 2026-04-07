document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const particleCount = 150;

  let mouse = {
    x: 0,
    y: 0,
    radius: 180
  };

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle class
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 4 + 2;
      this.speed = Math.random() * 1.8 + 1.2;
      this.swaySpeed = Math.random() * 0.04 + 0.02;
      this.swayAmount = Math.random() * 2.5 + 1.5;
      this.angle = Math.random() * Math.PI * 2;
    }
    update() {
      this.y -= this.speed;
      this.angle += this.swaySpeed;
      this.x += Math.sin(this.angle) * this.swayAmount;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius && distance > 0) {
        const force = (mouse.radius - distance) / mouse.radius;
        const dirX = dx / distance;
        const dirY = dy / distance;
        this.x += dirX * force * 7;
        this.y += dirY * force * 7;
      }

      if (this.y + this.size < 0) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#64c8ff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Mouse / touch tracking
  function trackMouse(e) {
    mouse.x = e.clientX || (e.touches && e.touches[0].clientX);
    mouse.y = e.clientY || (e.touches && e.touches[0].clientY);
  }
  window.addEventListener('mousemove', trackMouse);
  window.addEventListener('touchmove', trackMouse);

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Optional connecting lines
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.12)';
    ctx.lineWidth = 1;
    particles.forEach(p => {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    });

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  // === FLIPPING LETTERS ===
  const title = document.getElementById('hero-title');
  const text = title.textContent.trim();
  title.innerHTML = '';
  text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${150 + index * 55}ms`;
    title.appendChild(span);
  });

  // Start
  initParticles();
  animate();
});