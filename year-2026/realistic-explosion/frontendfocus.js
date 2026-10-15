(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const hint = document.getElementById('hint');

  const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = t => t * t * (3 - 2 * t);
  // Bell-shaped random value in [-1, 1] for more natural clustering
  const bell = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  // Heat ramp: white-hot core -> orange -> dull red -> charcoal
  const PAL = [
    [255, 255, 255], [255, 248, 220], [255, 233, 163], [255, 209, 102], [255, 179, 71],
    [255, 145, 48], [255, 116, 20], [242, 90, 12], [215, 64, 10], [169, 44, 8],
    [122, 31, 8], [77, 22, 7], [42, 14, 6], [20, 7, 5]
  ];
  const PAL_STR = PAL.map(c => c.join(','));
  const PAL_MAX = PAL.length - 1;

  // Procedurally built soft sprites with eroded edges so no two look alike
  function makeSprite(rgb, aCore, aMid, blobs, bMin, bMax, size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const r = size / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, `rgba(${rgb},${aCore})`);
    grd.addColorStop(0.45, `rgba(${rgb},${aMid})`);
    grd.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < blobs; i++) {
      const a = rand(0, TAU);
      const d = r * rand(0.55, 0.95);
      const br = r * rand(bMin, bMax);
      const x = r + Math.cos(a) * d;
      const y = r + Math.sin(a) * d;
      const bg = g.createRadialGradient(x, y, 0, x, y, br);
      bg.addColorStop(0, 'rgba(0,0,0,0.6)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(x, y, br, 0, TAU);
      g.fill();
    }
    return c;
  }

  const FIRE = PAL.map(c => Array.from({ length: 4 }, () => makeSprite(c.join(','), 1, 0.75, 7, 0.14, 0.28, 96)));
  const SMOKE_COOL = Array.from({ length: 3 }, () => makeSprite('72,68,64', 0.6, 0.42, 12, 0.22, 0.42, 128));
  const SMOKE_WARM = Array.from({ length: 3 }, () => makeSprite('220,122,64', 0.6, 0.4, 12, 0.22, 0.42, 128));
  const DUST = Array.from({ length: 2 }, () => makeSprite('150,128,104', 0.55, 0.35, 9, 0.2, 0.4, 96));

  // Scene state
  let W = 0, H = 0, DPR = 1, minDim = 800, groundY = 600;
  let vignette = null;
  let time = 0, shake = 0, nextAuto = 0.5;
  let fire = [], smoke = [], sparks = [], debris = [], rings = [], flashes = [], glows = [], events = [];

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    minDim = Math.min(W, H);
    groundY = H * 0.8;
    vignette = ctx.createRadialGradient(W / 2, H * 0.45, minDim * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
  }

  function spawnSmoke(o) {
    smoke.push({
      x: o.x, y: o.y, vx: o.vx, vy: o.vy,
      age: 0, life: o.life, d0: o.d0, d1: o.d1,
      s: o.s, wind: o.wind,
      drag: rand(0.7, 1.0),
      turb: rand(18, 40) * o.s,
      tf: rand(0.4, 1.1), ph: rand(0, TAU),
      buoy: o.dust ? 4 * o.s : rand(18, 34) * o.s,
      warm: o.dust ? 0 : rand(1.2, 3.2),
      variant: (Math.random() * 3) | 0,
      dust: !!o.dust,
      alpha: rand(0.7, 1)
    });
  }

  function spawnSpark(o) {
    sparks.push({
      x: o.x, y: o.y, px: o.x, py: o.y,
      vx: o.vx, vy: o.vy, age: 0, life: o.life,
      drag: o.drag ?? rand(1.1, 2.0),
      g: o.g, w: o.w, bounces: 0,
      hot: o.hot ?? rand(0.7, 1)
    });
  }

  function detonate(x, y, opt = {}) {
    const secondary = !!opt.secondary;
    const S = (minDim / 850) * (opt.scale ?? rand(0.8, 1.22));
    const power = opt.power ?? rand(0.85, 1.2);
    const tilt = rand(0.88, 1.12);          // slight elliptical blast
    const wind = rand(-1, 1) * 22 * S;        // ambient drift for this blast
    const lean = rand(-0.15, 0.15);           // vertical asymmetry
    const cy = Math.min(y, groundY - 40 * S); // ground-burst limit

    shake = Math.max(shake, (secondary ? 4 : 16) * S * power);

    // Flash, glow, shockwave
    flashes.push({ x, y: cy, age: 0, life: rand(0.28, 0.4), r: 300 * S * power });
    glows.push({ x, y: cy, age: 0, life: rand(1.8, 2.6), r: 520 * S * power, seed: rand(0, 100), power });
    rings.push({ x, y: cy, age: 0, life: rand(0.9, 1.3), R: rand(340, 420) * S * power, tilt, ground: false, w: 10 * S });
    if (!secondary) {
      const cover = clamp(1 - (groundY - cy) / (H * 0.6), 0.25, 1);
      rings.push({ x, y: groundY, age: 0, life: rand(1.2, 1.8), R: rand(380, 480) * S * power, tilt: 1, ground: true, w: 8 * S, fade: cover });
    }

    // Fireball
    const nFire = Math.round((secondary ? 80 : 240) * power * rand(0.85, 1.15));
    for (let i = 0; i < nFire; i++) {
      const a = rand(0, TAU);
      const u = Math.random();   // 0 = slow hot core, 1 = fast cooler shell
      const sp = (0.15 + Math.pow(u, 0.6) * 0.95) * 560 * S * power * rand(0.85, 1.15);
      fire.push({
        x: x + bell() * 6 * S,
        y: cy + bell() * 6 * S,
        vx: Math.cos(a) * sp * tilt,
        vy: Math.sin(a) * sp * (1 + lean) - 60 * S * Math.random(),
        age: 0,
        life: rand(0.9, 1.7) * (0.8 + 0.3 * power),
        d0: rand(40, 70) * S,
        grow: rand(2.2, 3.4),
        drag: rand(2.2, 3.2),
        buoy: rand(90, 150) * S,
        cool: rand(0.8, 1.4),
        t0: clamp(1.05 - 0.5 * u + bell() * 0.05, 0.45, 1),
        ph: rand(0, TAU),
        tf: rand(1.5, 3.5),
        turb: rand(50, 120) * S,
        variant: (Math.random() * 4) | 0,
        alpha: rand(0.55, 0.8),
        wind
      });
    }

    // Rising smoke column (staggered over time)
    const nSmoke = Math.round((secondary ? 14 : 34) * power);
    for (let i = 0; i < nSmoke; i++) {
      events.push({
        t: time + rand(0.08, 1.3),
        fn: () => spawnSmoke({
          x: x + bell() * 28 * S,
          y: cy + bell() * 18 * S,
          vx: bell() * 14 * S + wind * 0.3,
          vy: -rand(70, 130) * S,
          d0: rand(50, 80) * S,
          d1: rand(230, 330) * S,
          life: rand(4.5, 7),
          wind, s: S
        })
      });
    }

    // Mushroom cap forms when the column reaches altitude
    if (!secondary) {
      events.push({
        t: time + rand(0.85, 1.25),
        fn: () => {
          const n = 26;
          const capY = cy - rand(170, 230) * S;
          const capR = rand(70, 100) * S;
          for (let j = 0; j < n; j++) {
            const a = (j / n) * TAU + rand(-0.15, 0.15);
            const r = capR * rand(0.6, 1);
            spawnSmoke({
              x: x + Math.cos(a) * r * 0.6,
              y: capY + Math.sin(a) * r * 0.3,
              vx: Math.cos(a) * rand(60, 120) * S * tilt + wind * 0.5,
              vy: -rand(10, 40) * S,
              d0: rand(90, 120) * S,
              d1: rand(300, 420) * S,
              life: rand(5, 8),
              wind, s: S
            });
          }
        }
      });
    }

    // Sparks
    const nSpark = Math.round((secondary ? 25 : 90) * power * rand(0.85, 1.15));
    for (let i = 0; i < nSpark; i++) {
      const a = rand(0, TAU);
      const sp = Math.pow(Math.random(), 0.5) * 900 * S * power + 150 * S;
      spawnSpark({
        x: x + bell() * 8 * S,
        y: cy + bell() * 8 * S,
        vx: Math.cos(a) * sp * tilt,
        vy: Math.sin(a) * sp - rand(0, 160) * S,
        life: rand(0.5, 1.6),
        g: 1000 * S,
        w: rand(1.0, 2.2) * S
      });
    }

    // Debris chunks
    const nDeb = Math.round((secondary ? 2 : 10) * rand(0.7, 1.3));
    for (let i = 0; i < nDeb; i++) {
      const a = rand(0, TAU);
      const sp = rand(220, 620) * S * power;
      const nv = 4 + ((Math.random() * 3) | 0);
      const pts = [];
      for (let j = 0; j < nv; j++) {
        const ang = (j / nv) * TAU + rand(-0.3, 0.3);
        const r = rand(0.45, 1);
        pts.push([Math.cos(ang) * r, Math.sin(ang) * r * rand(0.55, 1)]);
      }
      debris.push({
        x, y: cy,
        vx: Math.cos(a) * sp * tilt,
        vy: Math.sin(a) * sp - rand(100, 300) * S,
        rot: rand(0, TAU), vrot: rand(-14, 14),
        size: rand(6, 16) * S,
        pts, age: 0, life: rand(3, 4.5),
        bounces: 0, g: 1100 * S, hot: rand(0.5, 1), s: S
      });
    }

    // Secondary blasts
    if (!secondary && Math.random() < 0.7) {
      const count = 1 + ((Math.random() * 3) | 0);
      for (let i = 0; i < count; i++) {
        events.push({
          t: time + rand(0.25, 1.4),
          fn: () => detonate(x + rand(-260, 260) * S, cy + rand(-120, 60) * S, {
            secondary: true,
            scale: rand(0.25, 0.45),
            power: rand(0.5, 0.8)
          })
        });
      }
    }
  }

  // ---------- Update ----------
  function ageAll(arr, dt) {
    for (const o of arr) o.age += dt;
    return arr.filter(o => o.age < o.life);
  }

  function updateFire(dt) {
    for (const p of fire) {
      p.age += dt;
      const f = clamp(p.age / p.life, 0, 1);
      const k = Math.exp(-p.drag * dt);
      p.vx *= k;
      p.vy *= k;
      const n = p.age * p.tf + p.ph;
      const temp = p.t0 * (1 - Math.pow(f, p.cool));
      p.vx += (Math.sin(n) + 0.5 * Math.sin(n * 2.3 + 1.7)) * p.turb * dt + p.wind * dt * 0.6;
      p.vy += Math.cos(n * 0.9) * p.turb * 0.5 * dt - p.buoy * (0.25 + 0.75 * temp) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    fire = fire.filter(p => p.age < p.life);
  }

  function updateSmoke(dt) {
    for (const p of smoke) {
      p.age += dt;
      const k = Math.exp(-p.drag * dt);
      p.vx *= k;
      p.vy *= k;
      const n = p.age * p.tf + p.ph;
      p.vx += (Math.sin(n) * p.turb + p.wind * 0.5) * dt;
      p.vy += (Math.cos(n * 0.8) * p.turb * 0.5 - p.buoy) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    smoke = smoke.filter(p => p.age < p.life);
  }

  function updateSparks(dt) {
    for (const p of sparks) {
      p.px = p.x;
      p.py = p.y;
      p.age += dt;
      const k = Math.exp(-p.drag * dt);
      p.vx *= k;
      p.vy *= k;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y > groundY) {
        p.y = groundY;
        if (p.bounces < 2 && p.vy > 80) {
          p.vy = -p.vy * 0.3;
          p.vx *= 0.6;
          p.bounces++;
        } else {
          p.vy = 0;
          p.vx *= Math.exp(-8 * dt);
        }
      }
    }
    sparks = sparks.filter(p => p.age < p.life);
  }

  function updateDebris(dt) {
    for (const p of debris) {
      p.age += dt;
      const k = Math.exp(-0.8 * dt);
      p.vx *= k;
      p.vy *= k;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.vrot *= Math.exp(-0.6 * dt);

      const floor = groundY - p.size * 0.35;
      if (p.y > floor) {
        p.y = floor;
        if (p.bounces < 3 && p.vy > 120) {
          p.vy = -p.vy * 0.36;
          p.vx *= 0.65;
          p.vrot *= -0.5;
          p.bounces++;
          // Dust puff and small ember burst on impact
          spawnSmoke({
            x: p.x, y: groundY - 4,
            vx: p.vx * 0.25, vy: -20 * p.s,
            d0: p.size * 3, d1: p.size * 9,
            life: rand(1.2, 2), wind: 0, s: p.s, dust: true
          });
          for (let i = 0; i < 3; i++) {
            spawnSpark({
              x: p.x, y: groundY - 2,
              vx: rand(-120, 120) * p.s, vy: -rand(120, 300) * p.s,
              life: rand(0.3, 0.8), g: 1000 * p.s, w: 1.2 * p.s, hot: 0.8
            });
          }
        } else {
          p.vy = 0;
          p.vx *= Math.exp(-7 * dt);
          p.vrot *= Math.exp(-6 * dt);
        }
      }
    }
    debris = debris.filter(p => p.age < p.life);
  }

  function update(dt) {
    for (let i = events.length - 1; i >= 0; i--) {
      if (time >= events[i].t) {
        const e = events.splice(i, 1)[0];
        e.fn();
      }
    }
    shake *= Math.exp(-dt * 9);
    if (shake < 0.02) shake = 0;

    flashes = ageAll(flashes, dt);
    glows = ageAll(glows, dt);
    rings = ageAll(rings, dt);
    updateFire(dt);
    updateSmoke(dt);
    updateSparks(dt);
    updateDebris(dt);
  }

  // ---------- Render ----------
  function drawGlows() {
    for (const g of glows) {
      const p = g.age / g.life;
      const flick = 0.9 + 0.1 * Math.sin(g.age * 31 + g.seed) * Math.sin(g.age * 17 + g.seed * 1.7);
      const a = Math.pow(1 - p, 1.6) * 0.55 * g.power * flick;
      if (a <= 0.002) continue;

      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r);
      grd.addColorStop(0, `rgba(255,160,70,${a})`);
      grd.addColorStop(0.4, `rgba(255,90,20,${a * 0.45})`);
      grd.addColorStop(1, 'rgba(120,30,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);

      ctx.save();
      ctx.translate(g.x, groundY);
      ctx.scale(1, 0.18);
      const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, g.r * 1.1);
      gg.addColorStop(0, `rgba(255,120,40,${a * 0.8})`);
      gg.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 1.1, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawSmoke() {
    for (const p of smoke) {
      const f = clamp(p.age / p.life, 0, 1);
      const grow = 1 - Math.pow(1 - f, 2.2);
      const d = p.d0 + (p.d1 - p.d0) * grow;
      const fadeIn = smooth(clamp(p.age / 0.6, 0, 1));
      const fadeOut = 1 - smooth(clamp((f - 0.5) / 0.5, 0, 1));
      const a = fadeIn * fadeOut * p.alpha;
      if (a < 0.01) continue;

      if (p.dust) {
        ctx.globalAlpha = a * 0.8;
        ctx.drawImage(DUST[p.variant % 2], p.x - d / 2, p.y - d / 2, d, d);
        continue;
      }
      const w = clamp(1 - p.age / p.warm, 0, 1) * 0.85;
      ctx.globalAlpha = a * (1 - w * 0.7);
      ctx.drawImage(SMOKE_COOL[p.variant], p.x - d / 2, p.y - d / 2, d, d);
      if (w > 0.01) {
        ctx.globalAlpha = a * w;
        ctx.drawImage(SMOKE_WARM[p.variant], p.x - d / 2, p.y - d / 2, d, d);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFire() {
    for (const p of fire) {
      const f = clamp(p.age / p.life, 0, 1);
      const temp = p.t0 * (1 - Math.pow(f, p.cool));
      const idx = clamp(Math.floor((1 - temp) * PAL_MAX), 0, PAL_MAX);
      const d = p.d0 * (1 + (p.grow - 1) * Math.sqrt(f));
      const a = Math.min(1, p.age * 14) * Math.pow(1 - f, 1.15) * p.alpha;
      if (a < 0.01) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(FIRE[idx][p.variant], p.x - d / 2, p.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }

  function drawSparks() {
    for (const p of sparks) {
      const f = clamp(p.age / p.life, 0, 1);
      const a = Math.pow(1 - f, 1.2) * p.hot;
      if (a < 0.01) continue;
      const idx = clamp(1 + Math.floor(f * 7), 0, PAL_MAX);
      ctx.strokeStyle = `rgba(${PAL_STR[idx]},${a})`;
      ctx.lineWidth = Math.max(0.5, p.w * (1 - f * 0.5));
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  function drawRings() {
    for (const r of rings) {
      const p = clamp(r.age / r.life, 0, 1);
      const rad = r.R * (1 - Math.pow(1 - p, 3));
      const a = Math.pow(1 - p, 2) * (r.fade ?? 1);
      if (a < 0.01) continue;
      if (r.ground) {
        ctx.strokeStyle = `rgba(200,170,130,${a * 0.45})`;
        ctx.lineWidth = Math.max(1, r.w * (1 - p) + 1);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad, rad * 0.18, 0, 0, TAU);
        ctx.stroke();
      } else {
        ctx.strokeStyle = `rgba(255,236,200,${a * 0.7})`;
        ctx.lineWidth = Math.max(0.6, r.w * (1 - p) * 1.4);
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad * r.tilt, rad, 0, 0, TAU);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,170,90,${a * 0.22})`;
        ctx.lineWidth = r.w * 5 * (1 - p) + 1;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, rad * r.tilt * 0.96, rad * 0.96, 0, 0, TAU);
        ctx.stroke();
      }
    }
  }

  function drawDebris() {
    for (const p of debris) {
      const f = clamp(p.age / p.life, 0, 1);
      const fade = 1 - smooth(clamp((f - 0.7) / 0.3, 0, 1));
      if (fade <= 0.01) continue;
      const heat = clamp(1 - p.age / 1.4, 0, 1) * p.hot;
      const h = heat * heat;
      const r = 28 + 227 * h, g = 24 + 116 * h, b = 22 + 38 * h;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = fade;
      ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
      ctx.beginPath();
      p.pts.forEach(([px, py], i) => {
        if (i === 0) ctx.moveTo(px * p.size, py * p.size);
        else ctx.lineTo(px * p.size, py * p.size);
      });
      ctx.closePath();
      ctx.fill();
      if (heat > 0.05) {
        ctx.strokeStyle = `rgba(255,150,60,${heat * 0.9})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawFlashes() {
    for (const f of flashes) {
      const p = clamp(f.age / f.life, 0, 1);
      const a = Math.pow(1 - p, 2.2);
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(0.25, `rgba(255,240,200,${a * 0.8})`);
      g.addColorStop(0.6, `rgba(255,150,60,${a * 0.25})`);
      g.addColorStop(1, 'rgba(255,100,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
  }

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    const ox = shake > 0 ? (Math.random() * 2 - 1) * shake : 0;
    const oy = shake > 0 ? (Math.random() * 2 - 1) * shake : 0;
    ctx.translate(ox, oy);

    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#020206');
    sky.addColorStop(0.5, '#07060a');
    sky.addColorStop(0.78, '#0e0a09');
    sky.addColorStop(0.8, '#1c120c');
    sky.addColorStop(0.81, '#070504');
    sky.addColorStop(1, '#020101');
    ctx.fillStyle = sky;
    ctx.fillRect(-60, -60, W + 120, H + 120);

    ctx.globalCompositeOperation = 'lighter';
    drawGlows();

    ctx.globalCompositeOperation = 'source-over';
    drawSmoke();

    ctx.globalCompositeOperation = 'lighter';
    drawFire();
    drawSparks();

    ctx.globalCompositeOperation = 'source-over';
    drawRings();
    drawDebris();

    ctx.globalCompositeOperation = 'lighter';
    drawFlashes();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = vignette;
    ctx.fillRect(-60, -60, W + 120, H + 120);
  }

  // ---------- Loop & input ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    time += dt;

    if (time >= nextAuto) {
      detonate(rand(W * 0.3, W * 0.7), rand(H * 0.3, H * 0.6));
      nextAuto = time + rand(3.5, 6.5);
    }

    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  canvas.addEventListener('pointerdown', e => {
    detonate(e.clientX, e.clientY);
    hint.style.opacity = '0';
    nextAuto = time + rand(3.5, 6.5);
  });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();