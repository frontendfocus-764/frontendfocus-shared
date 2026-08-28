(function () {
  'use strict';

  const canvas = document.getElementById('terrarium');
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Environment state
  const time = { current: 0, delta: 0, last: 0 };
  const wind = { x: 0, strength: 0.8, frequency: 0.0018 };

  // Pointer state
  const pointer = {
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    downX: 0,
    downY: 0,
    isDown: false,
    isActive: false,
    dwellTime: 0,
    lastMoveTime: 0,
    speed: 0,
    activeTouches: new Map()
  };

  // Ecosystem collections
  const flora = [];
  const rocks = [];
  const mushrooms = [];
  const critters = [];
  const particles = [];
  const burstEffects = [];

  // Spawner rotation for clicks
  let clickSpawnType = 0; // 0: Flower, 1: Rock, 2: Mushroom, 3: Bug

  // Palettes
  const PALETTES = {
    greens: ['#4a7c59', '#3b6e4c', '#5b8e5d', '#689668', '#7fa976', '#8fb388', '#385e43', '#2d4a36'],
    moss: ['#5a7343', '#6f8b47', '#879f53', '#475d34'],
    flowers: [
      { petal: '#e06d64', center: '#f4c542', name: 'coral' },
      { petal: '#d97d99', center: '#fff3a8', name: 'rose' },
      { petal: '#7e9cd8', center: '#f0e68c', name: 'periwinkle' },
      { petal: '#b088d4', center: '#ffe066', name: 'lavender' },
      { petal: '#e8a84c', center: '#5c3a21', name: 'marigold' },
      { petal: '#f4ecd8', center: '#e69a39', name: 'ivory' },
      { petal: '#52a396', center: '#ffeaa7', name: 'seafoam' }
    ],
    shrooms: [
      { cap: '#c04a3e', spots: '#f4e8d0', gills: '#eed8be' }, // Red Amanita
      { cap: '#d4883b', spots: '#fae3c6', gills: '#dfbe99' }, // Golden Chanterelle
      { cap: '#6b4f7a', spots: '#e3d2ea', gills: '#c2b0cc' }, // Violet Cap
      { cap: '#486e68', spots: '#d2eae4', gills: '#9fbfba' }, // Forest Teal
      { cap: '#8c6541', spots: '#ecd8c4', gills: '#ccb69f' }  // Earth Brown
    ],
    rocks: [
      { base: '#3b4046', light: '#515861', dark: '#262a2e' },
      { base: '#42453e', light: '#595d54', dark: '#2b2d28' },
      { base: '#4a4440', light: '#635c57', dark: '#302c29' }
    ]
  };

  // Utilities
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randInt = (min, max) => Math.floor(rand(min, max));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  // Resize handler with High-DPI support
  function handleResize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
  }

  // --- ENTITY CLASSES ---

  /**
   * Sprout / Vine / Fern flora that unfurls from cursor lingering
   */
  class Plant {
    constructor(x, y, type = 'sprout') {
      this.x = x;
      this.y = y;
      this.type = type; // 'sprout', 'fern', 'vine', 'moss', 'grass'
      this.age = 0;
      this.growth = 0;
      this.maxGrowth = rand(0.7, 1.0);
      this.growthSpeed = rand(0.015, 0.035);
      this.color = pick(PALETTES.greens);
      this.accentColor = pick(PALETTES.greens);
      this.angle = rand(-0.35, 0.35) - Math.PI / 2; // Upwards bias
      this.length = rand(18, 55);
      this.curve = rand(-0.4, 0.4);
      this.branches = [];
      this.leaves = [];
      this.seed = rand(0, 100);
      this.thickness = rand(1.2, 2.8);

      // Generate leaf layout along stem
      const leafCount = randInt(2, 6);
      for (let i = 0; i < leafCount; i++) {
        this.leaves.push({
          pos: rand(0.2, 0.95),
          side: i % 2 === 0 ? 1 : -1,
          size: rand(4, 11),
          angle: rand(0.5, 1.1),
          growth: 0,
          color: pick(PALETTES.greens)
        });
      }

      // Small chance of secondary offshoot branch
      if (this.length > 35 && Math.random() > 0.5) {
        this.branches.push({
          startPos: rand(0.4, 0.7),
          side: Math.random() > 0.5 ? 1 : -1,
          length: this.length * rand(0.4, 0.7),
          angle: rand(0.4, 0.8),
          curve: rand(-0.3, 0.3),
          leaves: [
            { pos: 0.6, side: 1, size: rand(3, 7), color: pick(PALETTES.greens) },
            { pos: 0.9, side: -1, size: rand(3, 7), color: pick(PALETTES.greens) }
          ]
        });
      }
    }

    update(dt, windOffset) {
      this.age += dt;
      if (this.growth < this.maxGrowth) {
        this.growth = Math.min(this.maxGrowth, this.growth + this.growthSpeed * dt * 60);
      }
    }

    draw(ctx, windFactor) {
      const g = this.growth;
      if (g <= 0.02) return;

      ctx.save();
      ctx.translate(this.x, this.y);

      const sway = Math.sin(time.current * 0.002 + this.seed) * 0.08 * windFactor;
      const currentAngle = this.angle + sway + this.curve * 0.5;

      const stemLen = this.length * g;
      const endX = Math.cos(currentAngle) * stemLen;
      const endY = Math.sin(currentAngle) * stemLen;
      const ctrlX = Math.cos(currentAngle - this.curve + sway) * (stemLen * 0.55);
      const ctrlY = Math.sin(currentAngle - this.curve + sway) * (stemLen * 0.55);

      // Draw Main Stem
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.thickness * (0.6 + g * 0.4);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw Leaves
      for (let i = 0; i < this.leaves.length; i++) {
        const leaf = this.leaves[i];
        if (g > leaf.pos) {
          const leafGrowth = clamp((g - leaf.pos) / 0.35, 0, 1);
          const t = leaf.pos;
          // Point along quadratic bezier
          const lx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrlX + t * t * endX;
          const ly = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrlY + t * t * endY;

          // Tangent calculation
          const tx = 2 * (1 - t) * (ctrlX - 0) + 2 * t * (endX - ctrlX);
          const ty = 2 * (1 - t) * (ctrlY - 0) + 2 * t * (endY - ctrlY);
          const baseAngle = Math.atan2(ty, tx);
          const leafAngle = baseAngle + leaf.side * leaf.angle + sway * 0.5;

          const lSize = leaf.size * leafGrowth;
          const tipX = lx + Math.cos(leafAngle) * lSize;
          const tipY = ly + Math.sin(leafAngle) * lSize;

          const cp1x = lx + Math.cos(leafAngle - 0.4 * leaf.side) * (lSize * 0.6);
          const cp1y = ly + Math.sin(leafAngle - 0.4 * leaf.side) * (lSize * 0.6);
          const cp2x = lx + Math.cos(leafAngle + 0.4 * leaf.side) * (lSize * 0.6);
          const cp2y = ly + Math.sin(leafAngle + 0.4 * leaf.side) * (lSize * 0.6);

          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.quadraticCurveTo(cp1x, cp1y, tipX, tipY);
          ctx.quadraticCurveTo(cp2x, cp2y, lx, ly);
          ctx.fillStyle = leaf.color;
          ctx.fill();
        }
      }

      // Draw Sub-branches
      for (let i = 0; i < this.branches.length; i++) {
        const b = this.branches[i];
        if (g > b.startPos) {
          const bGrowth = clamp((g - b.startPos) / 0.4, 0, 1);
          const t = b.startPos;
          const bx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrlX + t * t * endX;
          const by = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * ctrlY + t * t * endY;
          const bLen = b.length * bGrowth;
          const bAngle = currentAngle + b.side * b.angle + sway;
          const bEndX = bx + Math.cos(bAngle) * bLen;
          const bEndY = by + Math.sin(bAngle) * bLen;

          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bEndX, bEndY);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.thickness * 0.7;
          ctx.stroke();

          // Branch tip leaf
          if (bGrowth > 0.5) {
            ctx.beginPath();
            ctx.arc(bEndX, bEndY, 2.5 * bGrowth, 0, Math.PI * 2);
            ctx.fillStyle = this.accentColor;
            ctx.fill();
          }
        }
      }

      // Sprout tip bud
      if (g >= this.maxGrowth * 0.8) {
        ctx.beginPath();
        ctx.arc(endX, endY, 1.8 * g, 0, Math.PI * 2);
        ctx.fillStyle = this.accentColor;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Moss clump for micro carpets around plants and rocks
   */
  class MossPatch {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = rand(4, 14);
      this.maxGrowth = 1;
      this.growth = 0;
      this.growthSpeed = rand(0.02, 0.05);
      this.dots = [];
      const count = randInt(5, 14);
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(Math.random()) * this.radius;
        const theta = Math.random() * Math.PI * 2;
        this.dots.push({
          ox: Math.cos(theta) * r,
          oy: Math.sin(theta) * r,
          size: rand(1.5, 3.8),
          color: pick(PALETTES.moss)
        });
      }
    }

    update(dt) {
      if (this.growth < this.maxGrowth) {
        this.growth = Math.min(this.maxGrowth, this.growth + this.growthSpeed * dt * 60);
      }
    }

    draw(ctx) {
      const g = this.growth;
      if (g <= 0.05) return;
      for (let i = 0; i < this.dots.length; i++) {
        const d = this.dots[i];
        ctx.beginPath();
        ctx.arc(this.x + d.ox * g, this.y + d.oy * g, d.size * g, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
        ctx.fill();
      }
    }
  }

  /**
   * Procedural blooming flower
   */
  class Flower {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.palette = pick(PALETTES.flowers);
      this.stemHeight = rand(25, 60);
      this.stemColor = pick(PALETTES.greens);
      this.petalCount = pick([5, 6, 7, 8, 12]);
      this.petalRadius = rand(7, 15);
      this.centerRadius = rand(3, 6.5);
      this.growth = 0;
      this.bloomSpeed = rand(0.015, 0.03);
      this.swaySeed = rand(0, 50);
      this.stemCurve = rand(-0.25, 0.25);
      this.leaves = [
        { pos: 0.35, side: -1, size: rand(5, 9) },
        { pos: 0.65, side: 1, size: rand(5, 9) }
      ];
    }

    update(dt) {
      if (this.growth < 1) {
        this.growth = Math.min(1, this.growth + this.bloomSpeed * dt * 60);
      }
    }

    draw(ctx, windFactor) {
      const g = this.growth;
      if (g <= 0.01) return;

      const sway = Math.sin(time.current * 0.0025 + this.swaySeed) * 0.12 * windFactor;
      const curStemH = this.stemHeight * Math.min(1, g * 1.3);

      const topX = this.x + Math.sin(sway + this.stemCurve) * curStemH;
      const topY = this.y - Math.cos(sway + this.stemCurve) * curStemH;
      const ctrlX = this.x + Math.sin(this.stemCurve) * (curStemH * 0.5);
      const ctrlY = this.y - curStemH * 0.5;

      // Stem
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, topX, topY);
      ctx.strokeStyle = this.stemColor;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Stem Leaves
      for (let i = 0; i < this.leaves.length; i++) {
        const lf = this.leaves[i];
        if (g > lf.pos) {
          const t = lf.pos;
          const lx = (1 - t) * (1 - t) * this.x + 2 * (1 - t) * t * ctrlX + t * t * topX;
          const ly = (1 - t) * (1 - t) * this.y + 2 * (1 - t) * t * ctrlY + t * t * topY;
          const leafAngle = -Math.PI / 2 + lf.side * 0.8 + sway;
          const lSize = lf.size * Math.min(1, (g - lf.pos) * 3);

          ctx.beginPath();
          ctx.ellipse(
            lx + Math.cos(leafAngle) * (lSize * 0.5),
            ly + Math.sin(leafAngle) * (lSize * 0.5),
            lSize * 0.6,
            lSize * 0.25,
            leafAngle,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = this.stemColor;
          ctx.fill();
        }
      }

      // Flower Head (blooms once stem nears full height)
      if (g > 0.35) {
        const bloomProgress = (g - 0.35) / 0.65;
        const pRad = this.petalRadius * bloomProgress;
        const cRad = this.centerRadius * bloomProgress;

        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(sway * 0.8);

        // Petals
        for (let i = 0; i < this.petalCount; i++) {
          const angle = (i / this.petalCount) * Math.PI * 2;
          const px = Math.cos(angle) * (pRad * 0.65);
          const py = Math.sin(angle) * (pRad * 0.65);

          ctx.beginPath();
          ctx.ellipse(px, py, pRad * 0.65, pRad * 0.32, angle, 0, Math.PI * 2);
          ctx.fillStyle = this.palette.petal;
          ctx.fill();
        }

        // Center Pistil
        ctx.beginPath();
        ctx.arc(0, 0, cRad, 0, Math.PI * 2);
        ctx.fillStyle = this.palette.center;
        ctx.fill();

        // Pistil texture dots
        if (bloomProgress > 0.8) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * (cRad * 0.45), Math.sin(a) * (cRad * 0.45), 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }
    }
  }

  /**
   * Procedural layered stone with mineral facets and moss
   */
  class Rock {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.palette = pick(PALETTES.rocks);
      this.size = rand(16, 36);
      this.scale = 0;
      this.targetScale = 1;
      this.vertices = [];
      this.mossPuffs = [];

      // Generate organic faceted polygon
      const numPoints = randInt(6, 9);
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const radius = this.size * rand(0.7, 1.25);
        this.vertices.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.75 // Flattened perspective
        });
      }

      // Generate moss on upper vertices
      for (let i = 0; i < 3; i++) {
        this.mossPuffs.push({
          x: rand(-this.size * 0.6, this.size * 0.6),
          y: rand(-this.size * 0.6, -this.size * 0.1),
          r: rand(3, 7),
          color: pick(PALETTES.moss)
        });
      }
    }

    update(dt) {
      if (this.scale < this.targetScale) {
        this.scale += (this.targetScale - this.scale) * 0.18;
      }
    }

    draw(ctx) {
      if (this.scale <= 0.05) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);

      // Base shadow underneath
      ctx.beginPath();
      ctx.ellipse(0, this.size * 0.4, this.size * 1.1, this.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 12, 14, 0.45)';
      ctx.fill();

      // Main rock polygon
      ctx.beginPath();
      ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
      for (let i = 1; i < this.vertices.length; i++) {
        ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = this.palette.base;
      ctx.fill();

      // Highlight facet on top-left
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.2);
      ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
      ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fillStyle = this.palette.light;
      ctx.fill();

      // Dark facet on bottom-right
      const lastIdx = this.vertices.length - 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.vertices[lastIdx].x, this.vertices[lastIdx].y);
      ctx.lineTo(this.vertices[lastIdx - 1].x, this.vertices[lastIdx - 1].y);
      ctx.closePath();
      ctx.fillStyle = this.palette.dark;
      ctx.fill();

      // Moss patches on rock top
      for (let i = 0; i < this.mossPuffs.length; i++) {
        const m = this.mossPuffs[i];
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Forest Fungi / Mushrooms with spots and gills
   */
  class Mushroom {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.palette = pick(PALETTES.shrooms);
      this.capWidth = rand(14, 28);
      this.capHeight = rand(10, 18);
      this.stemHeight = rand(16, 32);
      this.stemWidth = rand(3.5, 7);
      this.curve = rand(-4, 4);
      this.growth = 0;
      this.growthSpeed = rand(0.02, 0.045);
      this.spots = [];

      // Cap polka dots
      const spotCount = randInt(4, 9);
      for (let i = 0; i < spotCount; i++) {
        this.spots.push({
          x: rand(-0.7, 0.7),
          y: rand(-0.7, 0.1),
          r: rand(1.2, 2.8)
        });
      }
    }

    update(dt) {
      if (this.growth < 1) {
        this.growth = Math.min(1, this.growth + this.growthSpeed * dt * 60);
      }
    }

    draw(ctx) {
      const g = this.growth;
      if (g <= 0.02) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(g, g);

      const sh = this.stemHeight;
      const sw = this.stemWidth;
      const cw = this.capWidth;
      const ch = this.capHeight;

      // Stem
      ctx.beginPath();
      ctx.moveTo(-sw * 0.5, 0);
      ctx.quadraticCurveTo(this.curve, -sh * 0.5, -sw * 0.4, -sh);
      ctx.lineTo(sw * 0.4, -sh);
      ctx.quadraticCurveTo(this.curve + sw * 0.3, -sh * 0.5, sw * 0.5, 0);
      ctx.closePath();
      ctx.fillStyle = '#e8dcc8';
      ctx.fill();

      // Stem Ring
      ctx.beginPath();
      ctx.ellipse(this.curve * 0.5, -sh * 0.6, sw * 0.6, 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#cfbe9f';
      ctx.fill();

      // Gills underside
      ctx.beginPath();
      ctx.ellipse(0, -sh, cw * 0.85, ch * 0.35, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.palette.gills;
      ctx.fill();

      // Main Cap
      ctx.beginPath();
      ctx.moveTo(-cw, -sh);
      ctx.bezierCurveTo(-cw * 0.95, -sh - ch * 1.3, cw * 0.95, -sh - ch * 1.3, cw, -sh);
      ctx.quadraticCurveTo(0, -sh + ch * 0.25, -cw, -sh);
      ctx.closePath();
      ctx.fillStyle = this.palette.cap;
      ctx.fill();

      // Cap Spots
      ctx.fillStyle = this.palette.spots;
      for (let i = 0; i < this.spots.length; i++) {
        const sp = this.spots[i];
        const sx = sp.x * cw * 0.75;
        const sy = -sh - ch * 0.55 + sp.y * ch * 0.45;
        ctx.beginPath();
        ctx.arc(sx, sy, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Autonomous Critters (Ladybug, Beetle, Moth, Butterfly, Firefly)
   */
  class Critter {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.type = pick(['butterfly', 'beetle', 'firefly', 'ladybug']);
      this.vx = rand(-0.8, 0.8);
      this.vy = rand(-0.8, 0.8);
      this.angle = Math.atan2(this.vy, this.vx);
      this.wingPhase = rand(0, Math.PI * 2);
      this.color = pick(['#e74c3c', '#e67e22', '#f1c40f', '#9b59b6', '#3498db', '#1abc9c']);
      this.size = rand(5, 9);
      this.age = 0;
      this.targetX = x + rand(-150, 150);
      this.targetY = y + rand(-150, 150);
      this.wanderTimer = 0;
    }

    update(dt) {
      this.age += dt;
      this.wanderTimer -= dt;

      // Update target periodically or when near
      if (this.wanderTimer <= 0 || dist(this.x, this.y, this.targetX, this.targetY) < 25) {
        this.wanderTimer = rand(2, 5);
        this.targetX = clamp(this.x + rand(-200, 200), 40, width - 40);
        this.targetY = clamp(this.y + rand(-150, 150), 40, height - 40);
      }

      // Smooth steering toward target
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const desiredAngle = Math.atan2(dy, dx);
      let diff = desiredAngle - this.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.angle += diff * 0.04;

      const speed = this.type === 'butterfly' ? 1.4 : this.type === 'beetle' || this.type === 'ladybug' ? 0.7 : 1.1;
      this.vx = Math.cos(this.angle) * speed;
      this.vy = Math.sin(this.angle) * speed;

      this.x += this.vx;
      this.y += this.vy;

      // Keep within bounds
      if (this.x < 20) this.x = 20;
      if (this.x > width - 20) this.x = width - 20;
      if (this.y < 20) this.y = 20;
      if (this.y > height - 20) this.y = height - 20;

      this.wingPhase += (this.type === 'butterfly' ? 0.35 : 0.15);
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.type === 'butterfly') {
        const flap = Math.cos(this.wingPhase);
        const wScale = Math.abs(flap) * 0.7 + 0.3;

        // Wings
        ctx.fillStyle = this.color;
        // Upper wing left
        ctx.beginPath();
        ctx.ellipse(-2, -this.size * 0.9 * wScale, this.size * 0.9, this.size * 0.7 * wScale, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // Upper wing right
        ctx.beginPath();
        ctx.ellipse(-2, this.size * 0.9 * wScale, this.size * 0.9, this.size * 0.7 * wScale, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Slender body
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.7, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === 'ladybug' || this.type === 'beetle') {
        // Legs
        ctx.strokeStyle = '#1a1d20';
        ctx.lineWidth = 1.2;
        const legWalk = Math.sin(this.age * 12) * 2;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 3, -this.size * 0.5);
          ctx.lineTo(i * 4 + legWalk * i, -this.size * 0.9);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(i * 3, this.size * 0.5);
          ctx.lineTo(i * 4 - legWalk * i, this.size * 0.9);
          ctx.stroke();
        }

        // Body Shell
        ctx.fillStyle = this.type === 'ladybug' ? '#d63031' : '#2d3436';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.65, this.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing divide seam
        ctx.strokeStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.6, 0);
        ctx.lineTo(this.size * 0.4, 0);
        ctx.stroke();

        // Ladybug spots
        if (this.type === 'ladybug') {
          ctx.fillStyle = '#111';
          ctx.beginPath();
          ctx.arc(-1, -this.size * 0.25, 1.2, 0, Math.PI * 2);
          ctx.arc(-1, this.size * 0.25, 1.2, 0, Math.PI * 2);
          ctx.arc(2, -this.size * 0.2, 1, 0, Math.PI * 2);
          ctx.arc(2, this.size * 0.2, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Head
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(this.size * 0.6, 0, this.size * 0.28, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Firefly with ambient bio-glow
        const glow = (Math.sin(this.age * 4) + 1) * 0.5;

        // Bio-glow halo
        ctx.beginPath();
        ctx.arc(0, 0, this.size * (1.5 + glow * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 240, 90, ${0.15 + glow * 0.25})`;
        ctx.fill();

        // Core body
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.ellipse(1, 0, this.size * 0.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lantern tail
        ctx.fillStyle = `rgba(220, 255, 120, ${0.7 + glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(-this.size * 0.4, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Environmental particles (Spore dust, ambient pollen, click bursts)
   */
  class Particle {
    constructor(x, y, type = 'spore') {
      this.x = x;
      this.y = y;
      this.type = type;
      this.vx = rand(-0.4, 0.4);
      this.vy = type === 'burst' ? rand(-2.5, 2.5) : rand(-0.6, -0.1);
      if (type === 'burst') this.vx = rand(-2.5, 2.5);
      this.life = 1;
      this.decay = type === 'burst' ? rand(0.02, 0.04) : rand(0.003, 0.008);
      this.size = type === 'burst' ? rand(1.5, 3.5) : rand(1, 2.5);
      this.color = type === 'burst' ? pick(PALETTES.greens) : 'rgba(160, 210, 150, 0.55)';
    }

    update(dt) {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.life);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  // --- SPAWNING HELPERS ---

  function spawnPlantColony(x, y) {
    // Add 1-2 sprouts/stems
    const count = randInt(1, 3);
    for (let i = 0; i < count; i++) {
      const px = x + rand(-12, 12);
      const py = y + rand(-10, 10);
      flora.push(new Plant(px, py));
    }

    // Add tiny moss patch
    if (Math.random() > 0.4) {
      flora.push(new MossPatch(x + rand(-15, 15), y + rand(-15, 15)));
    }

    // Occasional spore
    if (Math.random() > 0.6) {
      particles.push(new Particle(x + rand(-10, 10), y + rand(-10, 10), 'spore'));
    }

    // Cap total flora for peak 60fps performance
    if (flora.length > 260) {
      flora.splice(0, 15);
    }
  }

  function spawnClickItem(x, y) {
    // Burst particles
    for (let i = 0; i < 12; i++) {
      particles.push(new Particle(x, y, 'burst'));
    }

    // Cycle through types: 0: Flower, 1: Rock, 2: Mushroom, 3: Bug
    switch (clickSpawnType) {
      case 0:
        // Flowers
        flowers: {
          flora.push(new Flower(x, y));
          // Mini companion flower or sprout
          if (Math.random() > 0.4) {
            flora.push(new Flower(x + rand(-20, 20), y + rand(-10, 10)));
          }
          flora.push(new MossPatch(x, y));
        }
        break;
      case 1:
        // Rocks
        rocks: {
          rocks.push(new Rock(x, y));
          flora.push(new MossPatch(x + rand(-18, 18), y + rand(-8, 8)));
          if (rocks.length > 40) rocks.shift();
        }
        break;
      case 2:
        // Mushrooms
        mushrooms: {
          mushrooms.push(new Mushroom(x, y));
          // Cluster 1-2 smaller fungi
          if (Math.random() > 0.3) {
            mushrooms.push(new Mushroom(x + rand(-22, 22), y + rand(-8, 8)));
          }
          flora.push(new MossPatch(x, y));
          if (mushrooms.length > 50) mushrooms.shift();
        }
        break;
      case 3:
        // Bugs / Critters
        bugs: {
          critters.push(new Critter(x, y));
          if (critters.length > 30) critters.shift();
        }
        break;
    }

    // Rotate spawn type
    clickSpawnType = (clickSpawnType + 1) % 4;
  }

  // --- EVENT LISTENERS ---

  function onPointerMove(x, y) {
    const now = performance.now();
    const d = dist(x, y, pointer.x, pointer.y);

    pointer.speed = d / Math.max(1, now - pointer.lastMoveTime);
    pointer.prevX = pointer.x;
    pointer.prevY = pointer.y;
    pointer.x = x;
    pointer.y = y;
    pointer.isActive = true;
    pointer.lastMoveTime = now;
  }

  window.addEventListener('mousemove', (e) => {
    onPointerMove(e.clientX, e.clientY);
  });

  window.addEventListener('mousedown', (e) => {
    pointer.isDown = true;
    pointer.downX = e.clientX;
    pointer.downY = e.clientY;
  });

  window.addEventListener('mouseup', (e) => {
    pointer.isDown = false;
    const dragDistance = dist(e.clientX, e.clientY, pointer.downX, pointer.downY);
    // Treat minimal movement as click
    if (dragDistance < 10) {
      spawnClickItem(e.clientX, e.clientY);
    }
  });

  window.addEventListener('mouseleave', () => {
    pointer.isActive = false;
    pointer.x = -1000;
    pointer.y = -1000;
  });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      onPointerMove(touch.clientX, touch.clientY);
      pointer.isDown = true;
      pointer.downX = touch.clientX;
      pointer.downY = touch.clientY;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      onPointerMove(touch.clientX, touch.clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    pointer.isDown = false;
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      const dragDistance = dist(touch.clientX, touch.clientY, pointer.downX, pointer.downY);
      if (dragDistance < 12) {
        spawnClickItem(touch.clientX, touch.clientY);
      }
    }
  }, { passive: false });

  // Window resize
  window.addEventListener('resize', handleResize);

  // --- INITIAL SEEDING ---

  function seedInitialGarden() {
    handleResize();

    // Scatter an initial welcoming cluster across the bottom substrate
    const count = Math.min(18, Math.floor(width / 60));
    for (let i = 0; i < count; i++) {
      const sx = rand(40, width - 40);
      const sy = rand(height * 0.5, height * 0.95);
      flora.push(new Plant(sx, sy));
      if (Math.random() > 0.4) flora.push(new MossPatch(sx, sy));
      if (Math.random() > 0.6) flora.push(new Flower(sx, sy));
    }

    // 2-3 starting rocks
    for (let i = 0; i < 3; i++) {
      rocks.push(new Rock(rand(80, width - 80), rand(height * 0.6, height * 0.9)));
    }

    // 2 starting critters
    critters.push(new Critter(rand(100, width - 100), rand(100, height - 100)));
    critters.push(new Critter(rand(100, width - 100), rand(100, height - 100)));
  }

  // --- ANIMATION LOOP ---

  function animate(now) {
    time.delta = Math.min((now - time.last) * 0.001, 0.1);
    time.last = now;
    time.current = now;

    // Wind dynamics
    wind.x = Math.sin(now * wind.frequency) * wind.strength;

    // Linger detection: If cursor is active and moving slowly, accumulate dwell
    if (pointer.isActive && pointer.x > 0 && pointer.y > 0) {
      if (pointer.speed < 0.35) {
        pointer.dwellTime += time.delta;
        // Germinate plants at rate based on dwell time
        if (pointer.dwellTime > 0.08) {
          spawnPlantColony(pointer.x, pointer.y);
          pointer.dwellTime = 0;
        }
      } else {
        pointer.dwellTime = Math.max(0, pointer.dwellTime - time.delta * 2);
      }
    }

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Update & Draw Rocks (lowest layer)
    for (let i = 0; i < rocks.length; i++) {
      rocks[i].update(time.delta);
      rocks[i].draw(ctx);
    }

    // Update & Draw Flora & Moss
    for (let i = 0; i < flora.length; i++) {
      flora[i].update(time.delta, wind.x);
      flora[i].draw(ctx, wind.x);
    }

    // Update & Draw Mushrooms
    for (let i = 0; i < mushrooms.length; i++) {
      mushrooms[i].update(time.delta);
      mushrooms[i].draw(ctx);
    }

    // Update & Draw Critters
    for (let i = 0; i < critters.length; i++) {
      critters[i].update(time.delta);
      critters[i].draw(ctx);
    }

    // Update & Draw Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(time.delta);
      particles[i].draw(ctx);
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Cursor indicator: Subtle seedling ring when lingering
    if (pointer.isActive && pointer.x > 0 && pointer.y > 0) {
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(140, 200, 130, 0.4)';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  // Start
  seedInitialGarden();
  requestAnimationFrame(animate);

})();
