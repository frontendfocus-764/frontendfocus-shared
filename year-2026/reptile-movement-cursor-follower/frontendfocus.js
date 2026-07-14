(() => {
  const canvas = document.getElementById('reptile'); // same ID
  const ctx = canvas.getContext('2d');

  /* =========================
     HiDPI sizing (crisp lines)
  ========================== */
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function fit() {
    const w = innerWidth, h = innerHeight;
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS px
  }
  addEventListener('resize', fit);
  fit();

  /* =========================
     Pointer target (mouse/touch)
  ========================== */
  const target = { x: innerWidth * 0.65, y: innerHeight * 0.55 };
  addEventListener('mousemove', e => { target.x = e.clientX; target.y = e.clientY; });
  addEventListener('touchmove', e => {
    const t = e.touches[0]; if (!t) return;
    target.x = t.clientX; target.y = t.clientY;
  }, { passive: true });

  /* =========================
     Leader (head) & motion tuning
  ========================== */
  const head = { x: innerWidth * 0.35, y: innerHeight * 0.75, a: 0 };
  const MAX_SPEED   = 150;   // px/s when far
  const MAX_TURN    = 2.2;   // rad/s → limits turn for curved paths
  const SLOW_RADIUS = 140;   // start slowing within this distance
  const STOP_RADIUS = 4;     // snap/stop threshold (px)

  /* =========================
     Trail & particles
  ========================== */
  const NUM_DOTS = 500;  // total dots
  const GAP_PX   = 2;    // 2px spacing → no gap for 2×2 dots
  const trail = [{ x: head.x, y: head.y }]; // newest at end

  // Pre-seed full chain so it appears immediately
  (function seedTrail(){
    const dx = Math.cos(head.a), dy = Math.sin(head.a);
    const total = (NUM_DOTS - 1) * GAP_PX;
    for (let d = total; d >= GAP_PX; d -= GAP_PX) {
      trail.unshift({ x: head.x - dx * d, y: head.y - dy * d });
    }
  })();

  function angleTowards(a, b, maxStep) {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d >  maxStep) d =  maxStep;
    if (d < -maxStep) d = -maxStep;
    return a + d;
  }
  const clamp01 = v => Math.max(0, Math.min(1, v));

  // Get a point on the trail 'distBack' pixels behind the head
  function sampleTrail(distBack) {
    let need = distBack;
    let i = trail.length - 1;
    let p = trail[i];
    while (i > 0) {
      const q = trail[i - 1];
      const seg = Math.hypot(p.x - q.x, p.y - q.y);
      if (seg >= need && seg > 0) {
        const t = need / seg; // interpolate within segment
        return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t };
      }
      need -= seg;
      i--;
      p = q;
    }
    return trail[0];
  }

  // Tangent direction (angle) at a given offset along the trail
  function directionAt(offset) {
    const ahead  = sampleTrail(Math.max(0, offset - 2));
    const behind = sampleTrail(offset + 2);
    const vx = ahead.x - behind.x, vy = ahead.y - behind.y;
    return (vx || vy) ? Math.atan2(vy, vx) : head.a;
  }

  /* helper: draw two backward curved arms (±45°) with OUTWARD bend (10°) */
  function drawCurvedArmsAt(p, aBack, length, baseAngRad, curveDegRad) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    for (const s of [-1, +1]) {
      const armAngle  = aBack + s * baseAngRad;
      const ctrlAngle = armAngle + s * curveDegRad; // outward bend

      const ctrlLen = length * 0.55;
      const endX = p.x + Math.cos(armAngle) * length;
      const endY = p.y + Math.sin(armAngle) * length;
      const cx   = p.x + Math.cos(ctrlAngle) * ctrlLen;
      const cy   = p.y + Math.sin(ctrlAngle) * ctrlLen;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(cx, cy, endX, endY);
      ctx.stroke();
    }
  }

  /* ===== Natural walking legs: foot-plant state machine (synced to motion) ===== */
  // Base parameters (per-leg scaling applied later)
  const LEG_BODY_R    = 6;
  const SWAY_MAX      = 4.5;
  const STEP_MIN      = 10;
  const STEP_MAX      = 26;
  const SWING_MIN     = 0.28;
  const SWING_MAX     = 0.12;
  const LIFT_MIN      = 4;
  const LIFT_MAX      = 10;
  const BASE_REACH    = 12;
  const KNEE_OUT      = 6;
  const THIGH_W_BASE  = 2.0;
  const SHIN_W_BASE   = 1.5;

  // Existing smaller legs near front
  const LEG_ANCHORS_SMALL = [16, 28, 40, 52]; // scale 1.0

  // Existing BIG legs near big arms region
  const LEG_ANCHORS_BIG = [102, 120, 138, 156, 174, 192]; // scale 1.7

  // NEW: more legs behind these (towards tail)
  // first set: still big-ish
  const LEG_ANCHORS_BIG2 = [210, 228, 246, 264, 282, 300]; // scale 1.6
  // second set: medium as we approach tail
  const LEG_ANCHORS_MED  = [318, 336, 354, 372, 390, 408]; // scale 1.3

  function makeLegEntry(idx, scale){
    return {
      idx,
      scale,
      centerPrev: null,
      sides: [
        { side: -1, phase: 'stance', foot: {x:0,y:0}, swing: null },
        { side: +1, phase: 'stance', foot: {x:0,y:0}, swing: null },
      ]
    };
  }

  const legs = [
    ...LEG_ANCHORS_SMALL.map(i => makeLegEntry(i, 1.0)),
    ...LEG_ANCHORS_BIG  .map(i => makeLegEntry(i, 1.7)),
    ...LEG_ANCHORS_BIG2 .map(i => makeLegEntry(i, 1.6)),
    ...LEG_ANCHORS_MED  .map(i => makeLegEntry(i, 1.3)),
  ];

  // init legs
  function initLegs(){
    for (const L of legs){
      const off = L.idx * GAP_PX;
      const p = sampleTrail(off);
      const a = directionAt(off);
      const nx = -Math.sin(a), ny = Math.cos(a);
      const tx =  Math.cos(a), ty = Math.sin(a);

      L.centerPrev = { x: p.x, y: p.y };

      const bodyR   = LEG_BODY_R * L.scale;
      const sway    = SWAY_MAX * 0.5 * L.scale;
      const reach   = BASE_REACH * L.scale;

      for (const S of L.sides){
        const hipX = p.x + nx * bodyR * S.side;
        const hipY = p.y + ny * bodyR * S.side;
        const stride = reach + (S.side > 0 ? STEP_MIN*0.4 : -STEP_MIN*0.2) * L.scale;
        S.foot.x = hipX + tx * stride + nx * (sway * S.side);
        S.foot.y = hipY + ty * stride + ny * (sway * S.side);
      }
      // start right leg mid-swing for alternating feel
      const R = L.sides[1];
      const hipRX = p.x + nx * bodyR * R.side;
      const hipRY = p.y + ny * bodyR * R.side;
      const targetX = hipRX + tx * (reach + STEP_MIN * L.scale) + nx * (SWAY_MAX*0.6 * L.scale * R.side);
      const targetY = hipRY + ty * (reach + STEP_MIN * L.scale) + ny * (SWAY_MAX*0.6 * L.scale * R.side);
      const midX = (R.foot.x + targetX)/2, midY = (R.foot.y + targetY)/2;
      const lift = (LIFT_MIN + LIFT_MAX)/2 * L.scale;
      R.phase = 'swing';
      R.swing = {
        t: 0.5, dur: 0.22,
        sx: R.foot.x, sy: R.foot.y,
        cx: midX + nx * lift * R.side,
        cy: midY + ny * lift * R.side,
        ex: targetX, ey: targetY
      };
    }
  }
  initLegs();

  function lerp(a,b,t){ return a + (b-a)*t; }
  function length(x,y){ return Math.hypot(x,y); }

  function partnerIsSwinging(L, side){
    const other = L.sides[ side > 0 ? 0 : 1 ];
    return other.phase === 'swing';
  }

  function updateAndRenderLegs(dt, tsec){
    ctx.lineCap = 'round';
    for (const L of legs){
      const off = L.idx * GAP_PX;
      const p = sampleTrail(off);
      const a = directionAt(off);
      const tx =  Math.cos(a), ty = Math.sin(a);
      const nx = -Math.sin(a), ny = Math.cos(a);

      // center speed (px/s) for stride scaling
      let speed = 0;
      if (L.centerPrev){
        const dx = p.x - L.centerPrev.x, dy = p.y - L.centerPrev.y;
        speed = dt > 0 ? length(dx,dy)/dt : 0;
      }
      L.centerPrev = { x: p.x, y: p.y };
      const v = clamp01(speed / 120);

      // per-leg scaled parameters
      const bodyR    = LEG_BODY_R * L.scale;
      const stepLen  = lerp(STEP_MIN, STEP_MAX, v) * L.scale;
      const swayAmp  = lerp(SWAY_MAX*0.6, SWAY_MAX, v) * L.scale;
      const swingDur = lerp(0.28, 0.12, v) * (1.0/Math.sqrt(L.scale)); // heavier → slower
      const liftAmt  = lerp(LIFT_MIN, LIFT_MAX, v) * L.scale * 0.9;
      const reach    = BASE_REACH * L.scale;
      const kneeOut  = KNEE_OUT * L.scale;
      const release  = stepLen * 0.7;

      const thighW = Math.max(1.5, THIGH_W_BASE * Math.sqrt(L.scale));
      const shinW  = Math.max(1.0, SHIN_W_BASE  * Math.sqrt(L.scale));
      const toeLen = 5 * L.scale * 0.9;

      for (const S of L.sides){
        const hipX = p.x + nx * bodyR * S.side;
        const hipY = p.y + ny * bodyR * S.side;

        if (S.phase === 'swing'){
          S.swing.t += dt / S.swing.dur;
          const t = Math.min(1, S.swing.t);
          const u = 1 - t;
          const bx = u*u*S.swing.sx + 2*u*t*S.swing.cx + t*t*S.swing.ex;
          const by = u*u*S.swing.sy + 2*u*t*S.swing.cy + t*t*S.swing.ey;
          S.foot.x = bx; S.foot.y = by;
          if (t >= 1){ S.phase = 'stance'; S.swing = null; }
        } else {
          // stance → check step trigger
          const fx = S.foot.x, fy = S.foot.y;
          const proj = (hipX - fx)*tx + (hipY - fy)*ty;
          const dist = Math.hypot(hipX - fx, hipY - fy);
          const shouldStep = (proj > release || dist > stepLen*1.2) && !partnerIsSwinging(L, S.side);

          if (shouldStep){
            const ex = hipX + tx * stepLen + nx * (swayAmp * S.side);
            const ey = hipY + ty * stepLen + ny * (swayAmp * S.side);
            const mx = (fx + ex) * 0.5, my = (fy + ey) * 0.5;

            S.phase = 'swing';
            S.swing = {
              t: 0, dur: swingDur,
              sx: fx, sy: fy,
              cx: mx + nx * liftAmt * S.side,
              cy: my + ny * liftAmt * S.side,
              ex, ey
            };
          }
        }

        // draw leg bones (hip → knee → foot)
        const fx = S.foot.x, fy = S.foot.y;
        const midX = (hipX + fx) * 0.5, midY = (hipY + fy) * 0.5;
        const kneeB = kneeOut * (0.75 + 0.25*Math.cos((L.idx*0.15))) * S.side;
        const kneeX = midX + nx * kneeB, kneeY = midY + ny * kneeB;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = thighW;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.stroke();

        ctx.lineWidth = shinW;
        ctx.beginPath();
        ctx.moveTo(kneeX, kneeY);
        ctx.lineTo(fx, fy);
        ctx.stroke();

        const footAng = Math.atan2(fy - kneeY, fx - kneeX);
        const spread = 0.45;
        for (let j = -1; j <= 1; j++) {
          const px = fx + Math.cos(footAng + j*spread) * toeLen;
          const py = fy + Math.sin(footAng + j*spread) * toeLen;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }
    }
  }

  /* =========================
     Arms (as-is from your last version)
  ========================== */
  let last = performance.now();
  let tsec = 0; // time accumulator (for legs/knee)
  function loop(now) {
    const dt = Math.min(0.03, (now - last) / 1000);
    last = now;
    tsec += dt;

    // Steering + arrival (clean stop)
    const dx = target.x - head.x;
    const dy = target.y - head.y;
    const dist = Math.hypot(dx, dy);

    if (dist > STOP_RADIUS) {
      const desired = Math.atan2(dy, dx);
      head.a = angleTowards(head.a, desired, MAX_TURN * dt);

      const speed = MAX_SPEED * clamp01((dist - STOP_RADIUS) / SLOW_RADIUS);
      const step  = Math.min(speed * dt, dist - STOP_RADIUS);

      head.x += Math.cos(head.a) * step;
      head.y += Math.sin(head.a) * step;
    } else {
      head.x = target.x;
      head.y = target.y;
    }

    // Extend trail when moved a bit (smooth sampling)
    const lastPt = trail[trail.length - 1];
    if (Math.hypot(head.x - lastPt.x, head.y - lastPt.y) > 0.5) {
      trail.push({ x: head.x, y: head.y });
    }
    if (trail.length > 12000) trail.splice(0, trail.length - 12000);

    // Draw background (clear)
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    // Draw 500 dots (2×2, no gaps)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < NUM_DOTS; i++) {
      const offset = i * GAP_PX;
      const p = sampleTrail(offset);
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }

    // Arms 1
    const ARM1_LEN   = 10;
    const BASE_ANG   = Math.PI / 4;        // 45°
    const CURVE_DEG  = 10 * Math.PI / 180; // 10°
    const arm1Indices = Array.from({ length: 5 }, (_, i) => 2 + i * 2);
    for (const idx of arm1Indices) {
      const offset = idx * GAP_PX;
      const p      = sampleTrail(offset);
      const aBack  = directionAt(offset) + Math.PI;
      drawCurvedArmsAt(p, aBack, ARM1_LEN, BASE_ANG, CURVE_DEG);
    }

    // Arms 2
    const EXTRA_LINES_TOTAL   = 30;
    const EXTRA_PER_PARTICLE  = 2;
    const EXTRA_PARTICLES     = EXTRA_LINES_TOTAL / EXTRA_PER_PARTICLE;
    const EXTRA_START_IDX     = 12;
    const EXTRA_STEP          = 6;   // leave five particles
    const EXTRA_LEN           = 20;
    for (let n = 0; n < EXTRA_PARTICLES; n++) {
      const idx    = EXTRA_START_IDX + n * EXTRA_STEP;
      const offset = idx * GAP_PX;
      const p      = sampleTrail(offset);
      const aBack  = directionAt(offset) + Math.PI;
      drawCurvedArmsAt(p, aBack, EXTRA_LEN, BASE_ANG, CURVE_DEG);
    }

    // Arms 3
    const tailIdx            = NUM_DOTS - 1;
    const EXTRA2_LINES_TOTAL = 80;   // 40 particles × 2 sides
    const EXTRA2_PER_PART    = 2;
    const EXTRA2_PARTICLES   = EXTRA2_LINES_TOTAL / EXTRA2_PER_PART;
    const EXTRA2_START_IDX   = 102;
    const EXTRA2_STEP        = 6;
    const EXTRA2_LEN         = 50;
    for (let n = 0; n < EXTRA2_PARTICLES; n++) {
      const idx = EXTRA2_START_IDX + n * EXTRA2_STEP;
      if (idx > tailIdx) break;
      const offset = idx * GAP_PX;
      const p      = sampleTrail(offset);
      const aBack  = directionAt(offset) + Math.PI;
      drawCurvedArmsAt(p, aBack, EXTRA2_LEN, BASE_ANG, CURVE_DEG);
    }

    // Arms 4 (taper 50 → 5)
    {
      const ARMS3_START = EXTRA2_START_IDX;
      const ARMS3_STEP  = EXTRA2_STEP;
      const ARMS3_COUNT = EXTRA2_PARTICLES;
      const ARMS3_LAST  = Math.min(ARMS3_START + (ARMS3_COUNT - 1) * ARMS3_STEP, tailIdx);
      const startIdx    = ARMS3_LAST + ARMS3_STEP;
      const MAX_LEN = 50, MIN_LEN = 5;

      if (startIdx < tailIdx) {
        const span = tailIdx - startIdx;
        for (let idx = startIdx; idx <= tailIdx; idx += ARMS3_STEP) {
          const t   = (tailIdx - idx) / span;
          const len = MIN_LEN + (MAX_LEN - MIN_LEN) * t;
          const off   = idx * GAP_PX;
          const p     = sampleTrail(off);
          const aBack = directionAt(off) + Math.PI;
          drawCurvedArmsAt(p, aBack, len, BASE_ANG, CURVE_DEG);
        }
      }
    }

    // Natural walking legs (now with extra rear legs)
    updateAndRenderLegs(dt, tsec);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
