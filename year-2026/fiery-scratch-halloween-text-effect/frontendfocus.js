const textInput = document.getElementById('textInput');
const liveText = document.getElementById('liveText');

textInput.addEventListener('input', (e) => {
  const value = e.target.value.toUpperCase();
  liveText.textContent = value || "SPOOKY NIGHT";
  liveText.setAttribute('data-text', value || "SPOOKY NIGHT");
});

const canvas = document.getElementById('emberCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = height + Math.random() * 100;
    this.size = Math.random() * 3 + 1;
    this.speedY = Math.random() * 2 + 0.8;
    this.speedX = (Math.random() - 0.5) * 1.2;
    this.opacity = Math.random() * 0.8 + 0.2;
    this.color = Math.random() > 0.4 ? '#ff5500' : (Math.random() > 0.5 ? '#ffaa00' : '#ff0000');
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX + Math.sin(this.y * 0.01) * 0.5;
    this.opacity -= 0.003;

    if (this.y < -10 || this.opacity <= 0) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

const particles = Array.from({ length: 90 }, () => new Particle());

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}

animate();