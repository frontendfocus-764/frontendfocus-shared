'use strict';

/* ── CONFIG ── */
const RATINGS = [
  { v:1, label:'Terrible', emoji:'😤' },
  { v:2, label:'Bad',      emoji:'😕' },
  { v:3, label:'OK',       emoji:'😐' },
  { v:4, label:'Good',     emoji:'😊' },
  { v:5, label:'Excellent',emoji:'🤩' },
];

/* ── BUILD STAR SVG ── */
function buildStarSVG() {
  return `
<svg class="star-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="sg" cx="50%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#fff9c0"/>
      <stop offset="40%"  stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#ff8c00"/>
    </radialGradient>
    <filter id="sf" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <polygon
    points="26,5 31.18,18.09 45.51,19.1 35.01,27.91 38.35,42 26,34.4 13.65,42 16.99,27.91 6.49,19.1 20.82,18.09"
    fill="rgba(0,0,0,0.3)" transform="translate(1,2)" filter="url(#sf)"/>
  <polygon class="star-polygon-stroke"
    points="26,5 31.18,18.09 45.51,19.1 35.01,27.91 38.35,42 26,34.4 13.65,42 16.99,27.91 6.49,19.1 20.82,18.09"
    stroke-width="1.5"/>
  <polygon class="star-polygon-fill"
    points="26,5 31.18,18.09 45.51,19.1 35.01,27.91 38.35,42 26,34.4 13.65,42 16.99,27.91 6.49,19.1 20.82,18.09"
    fill="rgba(255,215,0,0)"/>
  <polygon class="star-highlight"
    points="26,5 31.18,18.09 45.51,19.1 35.01,27.91 38.35,42 26,34.4 13.65,42 16.99,27.91 6.49,19.1 20.82,18.09"
    fill="url(#sg)" opacity="0"
    style="transition:opacity .25s"/>
</svg>`;
}

/* ── BUILD STARS INTO DOM ── */
const row = document.getElementById('starsRow');
const labels = [];

RATINGS.forEach(r => {
  const lbl = document.createElement('label');
  lbl.setAttribute('for', `r${r.v}`);
  lbl.className = 'star-label';
  lbl.dataset.v = r.v;
  lbl.dataset.tip = r.label;
  lbl.innerHTML = `
    <div class="star-3d">
      <div class="star-glow"></div>
      ${buildStarSVG()}
      <canvas class="star-canvas" id="sc${r.v}" width="112" height="112"></canvas>
    </div>`;
  row.appendChild(lbl);
  labels.push(lbl);
});

/* ── STATE ── */
let selected = 0;

/* ── EVENTS ── */
row.addEventListener('change', e => {
  setRating(+e.target.value, true);
});

labels.forEach(lbl => {
  lbl.addEventListener('mouseenter', () => previewRating(+lbl.dataset.v));
});
row.addEventListener('mouseleave', () => {
  if (selected) previewRating(selected);
  else clearPreview();
});

/* ── PREVIEW (hover) ── */
function previewRating(v) {
  labels.forEach((l, i) => {
    const filled = (i + 1) <= v;
    l.querySelector('.star-highlight').style.opacity    = filled ? '1' : '0';
    l.querySelector('.star-polygon-fill').style.fill   = filled ? '#ffd700' : 'rgba(255,215,0,0)';
    l.querySelector('.star-glow').style.opacity         = filled ? '1' : '0';
  });
}

function clearPreview() {
  labels.forEach(l => {
    l.querySelector('.star-highlight').style.opacity    = '0';
    l.querySelector('.star-polygon-fill').style.fill   = 'rgba(255,215,0,0)';
    l.querySelector('.star-glow').style.opacity         = '0';
  });
  if (selected) applySelected(selected);
}

/* ── APPLY SELECTED STATE ── */
function applySelected(v) {
  labels.forEach((l, i) => {
    const filled = (i + 1) <= v;
    l.classList.toggle('filled', filled);
    l.querySelector('.star-highlight').style.opacity    = filled ? '1' : '0';
    l.querySelector('.star-polygon-fill').style.fill   = filled ? '#ffd700' : 'rgba(255,215,0,0)';
    l.querySelector('.star-glow').style.opacity         = filled ? '1' : '0';
  });
}

/* ── SET RATING (click) ── */
function setRating(v, burst) {
  selected = v;
  applySelected(v);

  // burst animation
  const lbl = labels[v - 1];
  lbl.classList.remove('bursting');
  void lbl.offsetWidth; // reflow
  lbl.classList.add('bursting');
  if (burst) burstParticles(v);

  // description text
  const rd  = RATINGS[v - 1];
  const txt = document.getElementById('ratingText');
  txt.classList.remove('show');
  setTimeout(() => {
    txt.innerHTML = `<span class="rating-desc__emoji">${rd.emoji}</span>${rd.label}`;
    txt.classList.add('show');
  }, 80);

  // enable submit button
  const btn = document.getElementById('submitBtn');
  btn.classList.add('ready');
  btn.removeAttribute('disabled');
  btn.querySelector('span').textContent = `Submit ${v}-Star Review`;
}

/* ── PARTICLE BURST ── */
function burstParticles(v) {
  const cv  = document.getElementById(`sc${v}`);
  const c   = cv.getContext('2d');
  const W   = cv.width, H = cv.height;
  const cx  = W / 2,    cy = H / 2;

  const colors = ['#ffd700','#ffaa00','#fff9c0','#ff8c00','#fffde0','#ffc0cb'];
  const particles = [];

  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2 + (Math.random() - .5) * .4;
    const speed = 2.5 + Math.random() * 3.5;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1, decay: .03 + Math.random() * .025,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - .5) * .3,
      sparkle: Math.random() > .5,
    });
  }

  let rafId;
  function tick() {
    c.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of particles) {
      p.x  += p.vx;  p.y  += p.vy;
      p.vy += 0.12;  p.vx *= .97;
      p.life -= p.decay; p.rot += p.rotV;
      if (p.life <= 0) continue;
      alive = true;
      c.save();
      c.globalAlpha = p.life;
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = p.color;
      if (p.sparkle) {
        const s = p.size * p.life;
        c.beginPath();
        c.moveTo(0, -s * 2); c.lineTo(s * .4, 0);
        c.lineTo(0,  s * 2); c.lineTo(-s * .4, 0);
        c.closePath(); c.fill();
      } else {
        c.beginPath();
        c.arc(0, 0, p.size * p.life * .8, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
    if (alive) rafId = requestAnimationFrame(tick);
    else c.clearRect(0, 0, W, H);
  }
  cancelAnimationFrame(rafId);
  tick();
}

/* ── SUBMIT ── */
document.getElementById('submitBtn').addEventListener('click', function () {
  if (!selected) return;
  const fb = document.getElementById('formBody');
  const sp = document.getElementById('successPanel');
  const ss = document.getElementById('successStars');

  fb.classList.add('hidden');
  setTimeout(() => {
    sp.classList.add('visible');
    ss.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const s = document.createElement('span');
      s.className    = 'mini-star';
      s.textContent  = i <= selected ? '⭐' : '☆';
      ss.appendChild(s);
    }
  }, 420);
});

/* ── BACKGROUND FLOATING ORBS ── */
(function () {
  const cv = document.getElementById('bg-canvas');
  const c  = cv.getContext('2d');
  let W, H;

  function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const orbs = Array.from({ length: 18 }, () => ({
    x:  Math.random(), y:  Math.random(),
    vx: (Math.random() - .5) * .0002,
    vy: (Math.random() - .5) * .0002,
    r:  60 + Math.random() * 180,
    hue: 30 + Math.random() * 40,
    a:  .018 + Math.random() * .025,
  }));

  function draw() {
    c.clearRect(0, 0, W, H);
    orbs.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -.1) o.x = 1.1;
      if (o.x > 1.1) o.x = -.1;
      if (o.y < -.1) o.y = 1.1;
      if (o.y > 1.1) o.y = -.1;
      const g = c.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r);
      g.addColorStop(0, `hsla(${o.hue},90%,55%,${o.a})`);
      g.addColorStop(1, 'transparent');
      c.fillStyle = g;
      c.beginPath();
      c.arc(o.x * W, o.y * H, o.r, 0, Math.PI * 2);
      c.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── CARD 3D TILT ── */
(function () {
  const wrap = document.getElementById('cardWrap');
  const card = document.getElementById('card');

  wrap.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width  - .5) * 2;
    const ny = ((e.clientY - r.top)  / r.height - .5) * 2;
    card.style.transform  = `rotateY(${nx * 7}deg) rotateX(${-ny * 5}deg)`;
    card.style.boxShadow  = `
      ${-nx * 20}px ${ny * 20}px 60px rgba(0,0,0,.5),
      0 40px 80px rgba(0,0,0,.6),
      0 0 0 1px rgba(255,255,255,.05) inset,
      0 1px 0 rgba(255,255,255,.12) inset`;
  });

  wrap.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0) rotateX(0)';
    card.style.boxShadow = '';
  });
})();