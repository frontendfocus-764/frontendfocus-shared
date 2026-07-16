const canvas = document.getElementById("flaskCanvas");
const ctx = canvas.getContext("2d");

const size = 240;
const dpr = window.devicePixelRatio || 1;
canvas.width = size * dpr;
canvas.height = size * dpr;
canvas.style.width = `${size}px`;
canvas.style.height = `${size}px`;
ctx.scale(dpr, dpr);

const cx = size / 2;
const cy = 140;
const r = 48;
const neckY = 100;
const neckWidth = 22;
const leftNeck = cx - neckWidth;
const rightNeck = cx + neckWidth;
const topNeck = 45;

const bubbles = [];
const bubbleCount = 15;

class Bubble {
  constructor() {
    this.reset();
    this.y = cy + r * Math.random();
  }
  reset() {
    this.x = cx + (Math.random() - 0.5) * (r * 1.5);
    this.y = cy + r + 10;
    this.size = Math.random() * 2.5 + 1;
    this.speed = Math.random() * 1.5 + 0.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 0.05 + 0.02;
    this.opacity = Math.random() * 0.5 + 0.3;
  }
  update() {
    this.y -= this.speed;
    this.wobble += this.wobbleSpeed;
    this.currentX = this.x + Math.sin(this.wobble) * 1;

    if (this.y < topNeck + 20) {
      this.reset();
    }
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.currentX, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();
  }
}

// Initiale Bläschen erzeugen
for (let i = 0; i < bubbleCount; i++) {
  bubbles.push(new Bubble());
}

function createFlaskPath() {
  ctx.beginPath();
  ctx.moveTo(rightNeck, neckY);
  ctx.lineTo(rightNeck, topNeck + 5);
  ctx.quadraticCurveTo(rightNeck, topNeck, cx + 30, topNeck);
  ctx.lineTo(cx + 30, topNeck - 4);
  ctx.quadraticCurveTo(cx + 30, topNeck - 7, cx + 27, topNeck - 7);
  ctx.lineTo(cx - 27, topNeck - 7);
  ctx.quadraticCurveTo(cx - 30, topNeck - 7, cx - 30, topNeck - 4);
  ctx.lineTo(cx - 30, topNeck);
  ctx.quadraticCurveTo(leftNeck, topNeck, leftNeck, topNeck + 5);
  ctx.lineTo(leftNeck, neckY);

  let startAngle = Math.atan2(neckY - cy, rightNeck - cx);
  let endAngle = Math.atan2(neckY - cy, leftNeck - cx);
  ctx.arc(cx, cy, r, startAngle, endAngle, false);
  ctx.closePath();
}

function drawWave(time, yOffset, phase, amplitude, color) {
  ctx.beginPath();
  ctx.moveTo(0, size);

  // Wellenberechnung über die gesamte Breite
  for (let x = 0; x <= size; x += 5) {
    let y = yOffset + Math.sin(x * 0.02 + time * phase) * amplitude;
    // Zusätzliches Schwappen der gesamten Flüssigkeit
    let tilt = Math.sin(time * 0.002) * 8;
    let normalizedX = (x - cx) / r;
    y += normalizedX * tilt;

    if (x === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.lineTo(size, size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let time = performance.now();

  ctx.save();

  // 1. Clipping-Maske (Die Form des Kolbens)
  createFlaskPath();
  ctx.clip();

  // 2. Hintergrund/Flüssigkeits-Base
  const gradient = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  gradient.addColorStop(0, "rgba(0, 229, 255, 0.1)");
  gradient.addColorStop(1, "rgba(0, 153, 255, 0.4)");
  ctx.fillStyle = gradient;
  ctx.fill();

  // 3. Bläschen zeichnen (im Hintergrund der Wellen)
  bubbles.forEach((bubble) => {
    bubble.update();
    bubble.draw(ctx);
  });

  // 4. Hintere Welle (dunkler, versetzt)
  drawWave(time, 140, 0.003, 6, "rgba(0, 180, 255, 0.6)");

  // 5. Vordere Welle (heller, Hauptwelle)
  const frontGradient = ctx.createLinearGradient(0, 130, 0, cy + r);
  frontGradient.addColorStop(0, "rgba(0, 242, 255, 0.9)");
  frontGradient.addColorStop(1, "rgba(0, 132, 255, 0.95)");
  drawWave(time, 145, 0.004, 7, frontGradient);

  // Highlight Linie auf der vorderen Welle
  ctx.beginPath();
  for (let x = 0; x <= size; x += 5) {
    let y = 145 + Math.sin(x * 0.02 + time * 0.004) * 7;
    let tilt = Math.sin(time * 0.002) * 8;
    y += ((x - cx) / r) * tilt;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore(); // Maske aufheben

  // 6. Glaskolben Umriss
  createFlaskPath();
  ctx.strokeStyle = "rgba(180, 240, 255, 0.6)";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Äußerer Glow
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Innerer heller Umriss (für massives Glas)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // 7. Glas-Reflexionen (3D Effekt)
  // Große Reflektion links
  ctx.beginPath();
  ctx.arc(cx, cy, r - 6, Math.PI * 0.7, Math.PI * 1.3);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Kleine scharfe Kante links
  ctx.beginPath();
  ctx.arc(cx, cy, r - 6, Math.PI * 0.85, Math.PI * 1.15);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Sanfte Reflektion rechts
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, Math.PI * 1.8, Math.PI * 2.1);
  ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Hals-Reflexion links
  ctx.beginPath();
  ctx.moveTo(leftNeck + 4, neckY - 5);
  ctx.lineTo(leftNeck + 4, topNeck + 10);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.stroke();

  requestAnimationFrame(draw);
}

draw();
