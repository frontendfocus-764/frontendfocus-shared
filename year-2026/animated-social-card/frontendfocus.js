  // ── Particles ──
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  const scene = document.getElementById('scene');

  function resizeCanvas() {
    canvas.width = scene.offsetWidth;
    canvas.height = scene.offsetHeight;
  }
  resizeCanvas();

  const colors = ['#ff2eee','#7b2fff','#00d4ff','#ff6a00','#ffffff'];
  const pts = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.6 + Math.random() * 1.8,
    color: colors[Math.floor(Math.random() * colors.length)],
    sx: (Math.random() - 0.5) * 0.4,
    sy: -0.3 - Math.random() * 0.5,
    op: Math.random(),
    ops: 0.005 + Math.random() * 0.008
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.floor(p.op * 255).toString(16).padStart(2, '0');
      ctx.fill();
      p.x += p.sx; p.y += p.sy; p.op += p.ops;
      if (p.op > 1 || p.op < 0) p.ops *= -1;
      if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
    }
    requestAnimationFrame(draw);
  }
  draw();

  // ── Orientation toggle ──
  const orientBtn = document.getElementById('orientBtn');
  const orientIcon = document.getElementById('orientIcon');
  let isLandscape = true;
  let totalDeg = 0;

  orientBtn.addEventListener('click', () => {
    isLandscape = !isLandscape;
    scene.classList.toggle('landscape', isLandscape);
    scene.classList.toggle('portrait', !isLandscape);
    totalDeg += 180;
    orientIcon.style.transform = `rotate(${totalDeg}deg)`;
    setTimeout(resizeCanvas, 700);
  });

  // ── 3D Tilt ──
  const wrap = document.getElementById('cardWrap');
  const card = document.getElementById('card');
  const halo = document.querySelector('.card-halo');

  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `rotateX(${-dy * 12}deg) rotateY(${dx * 12}deg)`;
    halo.style.filter = `blur(${18 + Math.abs(dx) * 6}px)`;
    halo.style.opacity = '1';
  });

  wrap.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s cubic-bezier(.2,.8,.4,1)';
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    halo.style.filter = 'blur(16px)';
    halo.style.opacity = '0.85';
    setTimeout(() => { card.style.transition = 'transform 0.08s linear'; }, 500);
  });

  // ── Follow + sparks ──
  const followBtn = document.getElementById('followBtn');
  const followText = document.getElementById('followText');
  let following = false;

  followBtn.addEventListener('click', (e) => {
    following = !following;
    followText.textContent = following ? '✓ Following' : 'Follow';
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span');
      s.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:4px;height:4px;border-radius:50%;background:${colors[Math.floor(Math.random()*colors.length)]};pointer-events:none;z-index:9999;`;
      document.body.appendChild(s);
      const a = (i / 14) * 360, d = 28 + Math.random() * 44;
      const tx = Math.cos(a * Math.PI / 180) * d;
      const ty = Math.sin(a * Math.PI / 180) * d;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
      ], { duration: 550, easing: 'cubic-bezier(.2,.8,.4,1)', fill: 'forwards' })
        .onfinish = () => s.remove();
    }
  });
