(() => {
  const canvas = document.getElementById('dancer');
  const ctx = canvas.getContext('2d');
  const buf = document.createElement('canvas');
  const bctx = buf.getContext('2d');
  const ringEl = document.querySelector('.ring');
  const arcEl = document.querySelector('.ring .arc');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const WHITE = '#FFFFFF';
  const FLOOR = '#8C8C8C';
  const GHOST_A = '#8C8C8C', GHOST_B = '#E0E0E0';

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
    canvas.width = buf.width = W;
    canvas.height = buf.height = H;
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const s = Math.sin, c = Math.cos, PI = Math.PI, TAU = PI * 2, H_PI = PI / 2;
  const add = (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
  const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const mul = (a, k) => [a[0]*k, a[1]*k, a[2]*k];
  const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  const mag = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => mul(a, 1 / (mag(a) || 1));
  const mix3 = (a, b, w) => add(a, mul(sub(b, a), w));
  const cross = (a, b) => [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
  const rotX = ([x, y, z], a) => [x, y*c(a) - z*s(a), y*s(a) + z*c(a)];
  const rotY = ([x, y, z], a) => [x*c(a) + z*s(a), y, -x*s(a) + z*c(a)];
  const rotZ = ([x, y, z], a) => [x*c(a) - y*s(a), x*s(a) + y*c(a), z];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, w) => a + (b - a) * w;
  const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const fract = (x) => x - Math.floor(x);
  const mod = (x, m) => ((x % m) + m) % m;
  const wrap = (a) => mod(a + PI, TAU) - PI;
  const easeOutBack = (x) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
  const limbDir = (side, abd, fwd) => rotX(rotZ([0, -1, 0], side * abd), -fwd);

  function blend(a, b, w) {
    if (typeof a === 'number') return a + (b - a) * w;
    const o = {};
    for (const k in a) o[k] = blend(a[k], b[k], w);
    return o;
  }
  function turnLike(v, from, to) {
    const ax = cross(from, to), sn = mag(ax), cs = dot(from, to);
    if (sn < 1e-6) return v;
    const k = mul(ax, 1 / sn);
    return add(add(mul(v, cs), mul(cross(k, v), sn)), mul(k, dot(k, v) * (1 - cs)));
  }
  function ik(root, target, a, b, hint) {
    const toT = sub(target, root);
    const d = Math.min(a + b - 1e-4, Math.max(0.05, mag(toT)));
    const u = norm(toT);
    const cosA = (a * a + d * d - b * b) / (2 * a * d);
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    const n = norm(sub(hint, mul(u, dot(hint, u))));
    return [add(root, add(mul(u, a * cosA), mul(n, a * sinA))), add(root, mul(u, d))];
  }

  const SPINE = 0.72, NECK = 0.1, HEAD_R = 0.17;
  const UPPER_ARM = 0.36, FOREARM = 0.34;
  const THIGH = 0.44, SHIN = 0.44, ANK = 0.06;
  const FLOOR_Y = -1.0;
  const N = 7, TILE = 0.26, HALF_W = N * TILE / 2;

  const HEEL_Z = -0.025, BALL_Z = 0.09, TOE_LEN = 0.05, BALL0 = [0, -ANK, BALL_Z];

  const A = (abd, fwd, eAbd, eFwd) => ({ abd, fwd, eAbd, eFwd });
  const L = (abd, fwd, knee, toe = 0) => ({ abd, fwd, knee, toe });
  const F = (x, y, z, point = 0, curl = 0) => ({ x, y, z, point, curl });
  const STANCE = L(0.1, 0, 0), HANG = A(0.06, 0, 0, 0);
  const DEF = {
    tx: 0, tz: 0, yaw: 0, spin: 0, pitch: 0, roll: 0, air: 0,
    leanFwd: 0, leanSide: 0, torsoX: 0, headTilt: 0, headTurn: 0, headNod: 0,
    armR: HANG, armL: HANG, legR: STANCE, legL: STANCE,
    ik: 0, hipH: 0.82, kneeOut: 0.35, footTurn: 0.2,
    fR: F(0.16, ANK, 0.02), fL: F(-0.16, ANK, 0.02), slideR: 0, slideL: 0
  };
  const P = (o) => Object.assign({}, DEF, o);

  const BOX   = A(0.15, 0, 0, H_PI);
  const UP    = A(0.15, 0, 0, PI);
  const FRONT = A(0.05, H_PI, 0, H_PI);
  const GOAL  = A(H_PI, 0, H_PI, 0);
  const DROP  = A(H_PI, 0, -H_PI, 0);
  const POINT = A(0.1, H_PI, 0, 0);
  const SNAP = 0.2;
  const snap = (f) => (f < SNAP ? easeOutBack(f / SNAP) : 1);
  const keyed = (keys) => (b) => {
    const x = Math.max(0, b), i = Math.floor(x) % keys.length;
    const prev = x < 1 ? keys[0] : keys[(i - 1 + keys.length) % keys.length];
    return blend(prev, keys[i], snap(fract(x)));
  };

  const robotArms = keyed([
    P({ armR: BOX,   armL: BOX }),
    P({ armR: UP,    armL: BOX,   headTurn: 0.6 }),
    P({ armR: BOX,   armL: UP,    headTurn: -0.6 }),
    P({ armR: FRONT, armL: FRONT, yaw: 0.45 }),
    P({ armR: GOAL,  armL: GOAL,  yaw: -0.45 }),
    P({ armR: DROP,  armL: DROP,  headNod: 0.3 }),
    P({ armR: POINT, armL: BOX,   headTurn: 0.5, yaw: 0.3 }),
    P({ armR: BOX,   armL: POINT, headTurn: -0.5, yaw: -0.3 })
  ]);

  const armWave = (b) => {
    const q = Math.floor(Math.max(0, b) * 6) / 6;
    const w = q * PI;
    const r = (i) => Math.max(0, s(w - i * 0.8));
    const dir = Math.floor(q / 2) % 2 === 0 ? 1 : -1;
    const j = (i) => r(dir > 0 ? i : 3 - i);
    const give = j(1) + j(2);
    return P({
      armR: A(H_PI - 0.1 + 0.35 * j(1), 0.1, 0.9 * j(0) - 0.2 * j(1), 0),
      armL: A(H_PI - 0.1 + 0.35 * j(2), 0.1, 0.9 * j(3) - 0.2 * j(2), 0),
      leanSide: 0.08 * (j(1) - j(2)), headTilt: 0.15 * (j(2) - j(1)),
      legR: L(0.12, 0.08 * give, 0.16 * give), legL: L(0.12, 0.08 * give, 0.16 * give)
    });
  };

  const tickWalk = (() => {
    const keys = [], lift = L(0.08, 0.9, 1.57);
    const arm = (f) => A(0.12, f, 0, H_PI);
    for (let n = 0; n < 8; n++) {
      const up = n % 2 === 0, right = n % 4 === 0;
      keys.push(P({
        legR: up && right ? lift : STANCE, legL: up && !right ? lift : STANCE,
        armR: arm(up ? (right ? -0.5 : 0.5) : 0), armL: arm(up ? (right ? 0.5 : -0.5) : 0),
        yaw: Math.floor(n / 2) * H_PI, headTurn: up ? (right ? -0.3 : 0.3) : 0
      }));
    }
    return keyed(keys);
  })();

  const slump = (d) => L(0.1, 0.45 * d, 0.9 * d);
  const hangFwd = (f) => A(0.06, f, 0, 0.2);
  const REBOOT_POSE = P({ armR: GOAL, armL: GOAL, headNod: -0.15 });
  const powerDown = keyed([
    P({ armR: BOX, armL: BOX }),
    P({ armR: BOX, armL: BOX, headNod: 0.55 }),
    P({ armR: HANG, armL: BOX, headNod: 0.55, leanSide: 0.08 }),
    P({ armR: HANG, armL: HANG, headNod: 0.6, leanFwd: 0.25, headTilt: 0.2 }),
    P({ armR: hangFwd(0.6), armL: hangFwd(0.6), headNod: 0.8, leanFwd: 0.6, legR: slump(0.6), legL: slump(0.6), headTilt: 0.25 }),
    P({ armR: hangFwd(0.9), armL: hangFwd(0.9), headNod: 0.9, leanFwd: 0.9, legR: slump(1), legL: slump(1), headTilt: 0.3 }),
    REBOOT_POSE, REBOOT_POSE
  ]);

  const STEP = TILE;
  const MOON_TURN = 0.08;
  function glideFoot(phi) {
    phi = mod(phi, 1);
    if (phi < 0.5) return { o: STEP / 2 - 2 * STEP * phi, heel: 0.9 * smooth(phi / 0.07), slide: 0 };
    const q = phi - 0.5;
    return { o: -STEP / 2 + 2 * STEP * q, heel: 0.9 * (1 - smooth(q / 0.07)), slide: q > 0.04 ? 1 : 0 };
  }
  const footAt = (side, o, dir, h) => {
    const ball = [side * 0.11 + dir[0] * o, 0, dir[2] * o];
    const a = sub(ball, rotY(rotX(BALL0, h), side * MOON_TURN));
    return F(a[0], a[1], a[2], h, h);
  };
  const glide = (from, to, yaw, dir) => (b, n) => {
    const u = clamp(b / n, 0, 1), moon = dir[2] !== 0;
    const R = glideFoot(b / 2), Lf = glideFoot(b / 2 + 0.5);
    const sw = s(b * PI);
    return P({
      ik: 1, kneeOut: 0.05, footTurn: MOON_TURN,
      tx: lerp(from[0], to[0], u), tz: lerp(from[1], to[1], u), yaw,
      fR: footAt(1, R.o, dir, R.heel), fL: footAt(-1, Lf.o, dir, Lf.heel),
      hipH: 0.84 - 0.015 * Math.abs(sw),
      leanFwd: moon ? 0.1 : 0.04, headTurn: moon ? 0 : -dir[0] * 0.5, headNod: moon ? 0.05 : 0,
      armR: A(0.18, moon ? 0.25 * sw : 0.1, 0, 0.5), armL: A(0.18, moon ? -0.25 * sw : 0.1, 0, 0.5),
      slideR: R.slide, slideL: Lf.slide
    });
  };
  const spinTo = (from, to, yaw0, turn) => (b) => {
    const spinU = smooth(b), stand = smooth((b - 1) / 0.15);
    const h = 0.9 + 0.45 * stand;
    const out = A(1.3 * (1 - stand), 0.1, 0.2, 0.3);
    return P({
      ik: 1, kneeOut: 0.05, footTurn: MOON_TURN,
      tx: lerp(from[0], to[0], spinU), tz: lerp(from[1], to[1], spinU), yaw: yaw0 + turn * spinU,
      fR: footAt(1, 0, [0, 0, 1], h), fL: footAt(-1, 0, [0, 0, 1], h),
      hipH: 0.88 - 0.12 * stand, leanFwd: -0.05 * stand, headTurn: 0.6 * stand, headNod: -0.1 * stand,
      armR: blend(out, A(2.3, 0.35, 0.15, 0), stand), armL: blend(out, A(0.12, 0.25, 0, 0.9), stand)
    });
  };
  const Q = 2 * TILE;
  const CNR = [[-Q, Q], [-Q, -Q], [Q, -Q], [Q, Q]], MID = [0, 0];
  const MOON_ROUTE = [
    { fn: spinTo(MID, CNR[0], -H_PI, TAU + H_PI), len: 2, toe: true },
    { fn: glide(CNR[0], CNR[1], 0, [0, 0, -1]),   len: 4 },
    { fn: spinTo(CNR[1], CNR[1], 0, TAU),         len: 2, toe: true },
    { fn: glide(CNR[1], CNR[2], 0, [1, 0, 0]),    len: 4 },
    { fn: spinTo(CNR[2], CNR[2], 0, TAU + PI),    len: 2, toe: true },
    { fn: glide(CNR[2], CNR[3], PI, [0, 0, -1]),  len: 4 },
    { fn: spinTo(CNR[3], CNR[3], PI, TAU + PI),   len: 2, toe: true },
    { fn: glide(CNR[3], CNR[0], 0, [-1, 0, 0]),   len: 4 },
    { fn: spinTo(CNR[0], MID, 0, TAU),            len: 2, toe: true }
  ].map((m) => Object.assign({ sec: 'moon', fade: 0.3 }, m));
  MOON_ROUTE[MOON_ROUTE.length - 1].ease = 'snap';
  const TOE_STEPS = [];
  MOON_ROUTE.reduce((at, m) => { if (m.toe) TOE_STEPS.push((at + 1) * 4); return at + m.len; }, 0);

  const G = 9.81 / 0.83;
  function jump(b, period, height, bpm) {
    const flight = Math.min(period * 0.75, Math.sqrt(8 * height / G) / (60 / bpm));
    const ground = period - flight, ph = mod(b, period);
    const takeoff = ground / 2, landing = takeoff + flight;
    if (ph >= takeoff && ph <= landing) {
      const u = (ph - takeoff) / flight;
      return { air: 4 * height * u * (1 - u), u, flying: true, crouch: 0 };
    }
    const g = ph < takeoff ? ph + ground / 2 : ph - landing;
    return { air: 0, u: 0, flying: false, crouch: s(PI * g / ground) };
  }
  const swap = (b, period = 1) => 0.5 + 0.5 * clamp(3 * s(PI * b / period), -1, 1);
  const bump = (b) => Math.abs(s(b * PI));

  const spinCurve = (u, turns) => TAU * turns * (u - s(TAU * u) / TAU);

  const toprock = (b) => {
    const sw = s(PI * b);
    const w = 0.5 + 0.5 * clamp(sw * 1.8, -1, 1);
    const step = 1 - Math.abs(2 * w - 1);
    const cross = L(-0.22, 0.35, 0.35), plant = L(0.12, -0.05, 0.15 + 0.2 * Math.abs(sw));
    const open = A(1.25, 0.2, 0.5, 0), guard = A(0.35, 0.9, 0, 1.5);
    const lift = (l) => L(l.abd, l.fwd + 0.1 * step, l.knee + 0.3 * step);
    return P({
      armR: blend(guard, open, w), armL: blend(open, guard, w),
      legR: lift(blend(plant, cross, w)), legL: lift(blend(cross, plant, w)),
      leanFwd: 0.12, yaw: 0.35 * sw, headTilt: -0.1 * sw
    });
  };

  const windmill = (b, n) => {
    const ang = spinCurve(clamp(b / n, 0, 1), 3);
    return P({
      armR: A(0.3, 0.6, -0.6, 1.2), armL: A(0.3, 0.6, -0.6, 1.2),
      legR: L(0.85, 0.15, 0), legL: L(0.85, 0.15, 0),
      pitch: 1.85, spin: ang, yaw: ang / 3
    });
  };

  const headspin = (b, n) => P({
    armR: A(1.35, 0.1, 0.4, 0), armL: A(1.35, 0.1, 0.4, 0),
    legR: L(0.5, 0, 0.05), legL: L(0.5, 0, 0.05),
    pitch: PI + 0.06 * s(b * PI / 2), spin: spinCurve(clamp(b / n, 0, 1), 5)
  });

  const freeze = (side) => (b) => {
    const r = 1.15, p = 0.45, tremble = 0.015 * s(b * 23);
    const support = A(r, p, 0, 0), flair = A(2.1, 0.3, 0.4, 0);
    const tuckA = L(0.3, 1.4, 1.8), tuckB = L(0.2, 0.9, 1.2);
    return P({
      armL: side < 0 ? support : flair, armR: side < 0 ? flair : support,
      legR: side < 0 ? tuckA : tuckB, legL: side < 0 ? tuckB : tuckA,
      pitch: p + tremble, roll: -side * r, yaw: side * 0.5, headTilt: side * 0.2
    });
  };

  const discoPoint = (b) => {
    const r = swap(b, 2), side = 2 * r - 1;
    const up = 0.5 - 0.5 * c(mod(b, 2) * PI);
    const point = A(0.2 + up * 2.3, 0.25, 0, 0), hip = A(0.75, -0.1, -1.6, 0);
    const knee = 0.2 + 0.35 * bump(b);
    return P({
      armR: blend(hip, point, r), armL: blend(point, hip, r),
      legR: L(0.12 + 0.1 * r, 0, knee), legL: L(0.22 - 0.1 * r, 0, knee),
      leanSide: side * 0.12 * up, yaw: side * 0.25, headTilt: side * 0.2 * up
    });
  };

  const handsUp = (b) => {
    const sway = s(b * PI / 2), k = bump(b);
    return P({
      armR: A(2.55 + sway * 0.3, 0.1, 0.2 + 0.3 * k, 0), armL: A(2.55 - sway * 0.3, 0.1, 0.2 + 0.3 * k, 0),
      legR: L(0.18, 0, 0.15 + 0.4 * k), legL: L(0.18, 0, 0.15 + 0.4 * k),
      leanSide: sway * 0.18, headTilt: -sway * 0.25
    });
  };

  const discoKicks = (b) => {
    const r = swap(b), a = 2 * r - 1, k = bump(b);
    const kick = L(0.05, 1.1 * k, 2.42 * k * (1 - k)), stand = L(0.08, -0.1 * k, 0.25 * k);
    return P({
      armR: A(0.35, -a * 0.9 * k, 0, 1.3), armL: A(0.35, a * 0.9 * k, 0, 1.3),
      legR: blend(stand, kick, r), legL: blend(kick, stand, r),
      leanFwd: -0.12 * k, yaw: -a * 0.2 * k
    });
  };

  const discoSpin = (b, n) => {
    const k = bump(b);
    return P({
      armR: A(1.45 + 0.2 * s(b * PI), 0, 0.3, 0), armL: A(1.45 - 0.2 * s(b * PI), 0, 0.3, 0),
      legR: L(0.1, 0, 0.1 + 0.2 * k), legL: L(0.05, 0.35, 0.9),
      yaw: spinCurve(clamp(b / n, 0, 1), 1), headTilt: 0.15
    });
  };

  const COSSACK_BPM = 116;
  const cossack = ({ lean = 0, px = 0, ...o }) => {
    const p = P(Object.assign({ ik: 1, hipH: 0.84, kneeOut: 0.3, footTurn: 0.25 }, o, { leanFwd: lean }));
    p.tx = px * c(p.yaw); p.tz = -px * s(p.yaw);
    p.fR = Object.assign({}, p.fR, { x: p.fR.x - px });
    p.fL = Object.assign({}, p.fL, { x: p.fL.x - px });
    return p;
  };
  const HIPS = A(0.75, -0.1, -1.6, 0);
  const CROSS_R = A(0.3, 1.15, -H_PI - 0.3, -1.15), CROSS_L = A(0.3, 1.3, -H_PI - 0.3, -1.3);
  const OPEN = A(1.45, 0.15, 0.15, 0);

  const stamp = (b) => {
    const k = s(PI * Math.pow(fract(b), 0.8)), right = mod(Math.floor(b), 2) === 0;
    const up = (x) => F(x, ANK + 0.24 * k, 0.1 * k, 0.3 * k), planted = (x) => F(x, ANK, 0);
    return cossack({
      fR: right ? up(0.13) : planted(0.13), fL: right ? planted(-0.13) : up(-0.13),
      hipH: 0.83 - 0.03 * k, armR: HIPS, armL: HIPS, lean: -0.06,
      yaw: 0.45 * s(b * PI / 4), headTurn: -0.3 * s(b * PI / 4)
    });
  };

  const prisiadka = (b) => {
    const j = jump(b, 1, 0.05, COSSACK_BPM);
    const kR = 0.5 + 0.5 * clamp(c(PI * b) * 3.5, -1, 1), kL = 1 - kR;
    const leg = (side, k) => F(side * (0.15 + 0.03 * k), lerp(0.1, ANK, k), lerp(0.05, 0.78, k), lerp(0.5, -0.6, k));
    return cossack({
      fR: leg(1, kR), fL: leg(-1, kL), hipH: 0.3 - 0.03 * j.crouch, air: j.air,
      armR: CROSS_R, armL: CROSS_L, lean: -0.12, headNod: -0.1, kneeOut: 0.6
    });
  };

  const polzunets = (b) => {
    const side = c(b * PI / 2), bendR = (1 + side) / 2;
    return cossack({
      px: 0.34 * side, hipH: 0.34 + 0.1 * (1 - Math.abs(side)),
      fR: F(0.55, ANK, 0.08, lerp(-0.6, 0.3, bendR)), fL: F(-0.55, ANK, 0.08, lerp(-0.6, 0.3, 1 - bendR)),
      armR: OPEN, armL: OPEN, leanSide: -0.22 * side, headTurn: -0.5 * side, kneeOut: 0.6
    });
  };

  const straddle = (b) => {
    const j = jump(b, 2, 0.55, COSSACK_BPM);
    const sp = j.flying ? Math.min(1, s(PI * j.u) * 1.7) : 0;
    const hipH = 0.84 - 0.3 * j.crouch;
    const leg = (side) => F(side * lerp(0.13, 0.85, sp), lerp(ANK, hipH + 0.05, sp), lerp(0, 0.28, sp), lerp(0, 0.9, sp));
    const reach = A(lerp(0.3, 1.25, sp), lerp(0.2 + 0.6 * j.crouch, 0.5, sp), 0, lerp(0.3, 0, sp));
    return cossack({
      fR: leg(1), fL: leg(-1), hipH, air: j.air,
      armR: reach, armL: reach, lean: 0.25 * j.crouch + 0.35 * sp, headNod: -0.15 * sp, kneeOut: 0.35
    });
  };

  const IRISH_BPM = 118;
  const LOCKED = A(0.07, 0, 0, 0);
  const irish = (o) => P(Object.assign({ armR: LOCKED, armL: LOCKED, leanFwd: -0.04, footTurn: 0.45 }, o));
  const soften = (l, cr) => L(l.abd, l.fwd + 0.25 * cr, l.knee + 0.55 * cr, l.toe);

  const sevens = (b) => {
    const j = jump(b, 1, 0.05, IRISH_BPM), k = j.flying ? s(PI * j.u) : 0, r = swap(b);
    const lift = soften(L(-0.12, -0.45 * k, 2.0 * k, 0.6 + 0.4 * k), j.crouch);
    const stand = soften(L(0.04, 0, 0, 0.6), j.crouch);
    return irish({
      legR: blend(stand, lift, r), legL: blend(lift, stand, r),
      air: j.air, tx: 0.32 * s(b * TAU / 8), yaw: 0.25 * c(b * TAU / 8)
    });
  };

  const kicks = (b) => {
    const j = jump(b, 1, 0.07, IRISH_BPM), k = s(PI * fract(b)), r = swap(b);
    const kick = soften(L(0.02, 1.75 * k, 0.15 * (1 - k), 0.6 + 0.4 * k), j.crouch * (1 - k));
    const stand = soften(L(0.04, 0, 0, 0.6), j.crouch);
    return irish({ legR: blend(stand, kick, r), legL: blend(kick, stand, r), air: j.air, leanFwd: -0.04 - 0.06 * k });
  };

  const leaps = (b) => {
    const j = jump(b, 2, 0.42, IRISH_BPM), r = swap(b, 2);
    const sp = j.flying ? Math.min(1, s(PI * j.u) * 1.6) : 0;
    const front = soften(L(0.03, 1.25 * sp, 0.1 * sp, 0.6 + 0.4 * sp), j.crouch);
    const back  = soften(L(0.03, -0.95 * sp, 0.35 * sp, 0.6 + 0.4 * sp), j.crouch);
    return irish({
      legR: blend(back, front, r), legL: blend(front, back, r),
      air: j.air, tz: 0.18 * s(b * TAU / 8), yaw: 0.2 * (2 * r - 1)
    });
  };

  const clicks = (b) => {
    const j = jump(b, 2, 0.36, IRISH_BPM);
    const arc = j.flying ? s(PI * j.u) : 0, side = Math.floor(b / 2) % 2 === 0 ? 1 : -1, out = 0.55 * arc;
    return irish({
      legR: soften(L(side * out + 0.04, 0.05, 0.25 * arc, 0.6 + 0.4 * arc), j.crouch),
      legL: soften(L(-side * out + 0.04, 0.05, 0.25 * arc, 0.6 + 0.4 * arc), j.crouch),
      air: j.air, leanSide: -side * 0.1 * arc, tx: -side * 0.08 * arc
    });
  };

  const T_DNB = 60 / 174;
  const dnb = ({ lean = 0.08, ...o }) => P(Object.assign({ ik: 1 }, o, { leanFwd: lean, torsoX: lean * 0.5 }));
  const FIST = (f, e) => A(0.35, f, -0.1, e);
  const WIND = A(0.5, -0.6, 0, 0.3);
  const REACH = A(2.7, 0.2, 0, 0);

  function build(b) {
    const rate = b < 12 ? 1 : b < 14 ? 2 : 4;
    const dip = (1 + c(TAU * b * rate)) / 2;
    const pre = smooth((b - 14.5) / 0.5);
    let air = 0, fly = 0;
    if (b >= 15) {
      const u = b - 15, Hj = G * T_DNB * T_DNB / 8;
      air = 4 * Hj * u * (1 - u); fly = s(PI * u);
    }
    const pump = A(2.5, 0.35, 0.15 * dip, 0.35 * dip);
    const bothUp = smooth((b - 12) / 2);
    const armR = blend(pump, REACH, bothUp);
    const armL = blend(blend(FIST(0.9, 1.4), pump, smooth((b - 7.5) / 0.75)), REACH, bothUp);
    const crouch = pre * (1 - fly);
    return dnb({
      hipH: 0.83 - 0.05 * dip * (1 - pre) - 0.28 * crouch, air,
      lean: 0.08 + 0.3 * crouch, headNod: 0.2 * dip * (1 - pre) + 0.3 * pre - 0.3 * fly,
      armR: blend(armR, WIND, crouch), armL: blend(armL, WIND, crouch)
    });
  }

  function skank(b) {
    const j = jump(b, 0.5, 0.02, 174);
    const kR = 0.5 + 0.5 * clamp(c(TAU * b) * 3, -1, 1), kL = 1 - kR;
    const m16 = mod(b, 16);
    const sideW = m16 < 12 ? smooth((m16 - 7.6) / 0.8) : 1 - smooth((m16 - 15.6) / 0.8);
    const kick = (sd, k) => blend(
      F(sd * lerp(0.12, 0.2, k), lerp(ANK, 0.12, k), lerp(0.02, 0.4, k), 0.5 * k),
      F(sd * lerp(0.12, 0.46, k), lerp(ANK, 0.14, k), lerp(0.02, 0.08, k), 0.4 * k), sideW);
    const land = Math.pow(clamp(1 - b / 0.6, 0, 1), 2);
    const f = fract(b), nod = f < 0.06 ? smooth(f / 0.06) : Math.pow(1 - (f - 0.06) / 0.94, 3);
    const catchArms = smooth(b / 0.35);
    return dnb({
      fR: kick(1, kR), fL: kick(-1, kL),
      hipH: 0.78 - 0.05 * j.crouch - 0.3 * land, air: j.air,
      lean: 0.16 + 0.2 * land, headNod: 0.28 * nod,
      yaw: 0.22 * (kR - kL), headTurn: -0.12 * (kR - kL),
      armR: blend(WIND, FIST(0.25 + 0.95 * kL, 1.5 - 0.7 * kL), catchArms),
      armL: blend(WIND, FIST(0.25 + 0.95 * kR, 1.5 - 0.7 * kR), catchArms)
    });
  }

  function halftime(b, n, gb) {
    const f = fract(b / 2), k = s(PI * Math.pow(f, 0.75));
    const right = Math.floor(b / 2) % 2 === 0;
    const hit = Math.exp(-since(gb, 'snare').dt * 3);
    const lift = (sd) => F(sd * 0.24, ANK + 0.26 * k, 0.03 + 0.09 * k, 0.2 * k);
    const plant = (sd) => F(sd * 0.24, ANK, 0.03);
    const fist = A(0.45, lerp(1.1, 0.35, hit), 0, lerp(1.4, 0.3, hit));
    return dnb({
      fR: right ? lift(1) : plant(1), fL: right ? plant(-1) : lift(-1),
      hipH: 0.76 - 0.14 * hit, lean: 0.2 + 0.15 * hit, headNod: 0.1 + 0.55 * hit,
      leanSide: (right ? -1 : 1) * 0.07 * k, kneeOut: 0.5, armR: fist, armL: fist
    });
  }

  const SEMA_BPM = 60, SEMA_LEN = 22;
  const SKIRT_L = 0.8, FLARE_REST = 0.25;
  const OMEGA_MAX = TAU * 11 / 13;
  const smoothInt = (x) => x * x * x - x * x * x * x / 2;
  function semaSpin(tl) {
    const OM = OMEGA_MAX;
    if (tl < 2.5) return { w: 0, a: 0, yaw: 0 };
    if (tl < 7) { const x = (tl - 2.5) / 4.5; return { w: OM * smooth(x), a: OM * 6 * x * (1 - x) / 4.5, yaw: OM * 4.5 * smoothInt(x) }; }
    const y1 = OM * 2.25;
    if (tl < 16) return { w: OM, a: 0, yaw: y1 + OM * (tl - 7) };
    const y2 = y1 + OM * 9;
    if (tl < 19.5) { const x = (tl - 16) / 3.5; return { w: OM * (1 - smooth(x)), a: -OM * 6 * x * (1 - x) / 3.5, yaw: y2 + OM * 3.5 * (x - smoothInt(x)) }; }
    return { w: 0, a: 0, yaw: y2 + OM * 1.75 };
  }
  const semaTime = (b) => clamp(b, 0, SEMA_LEN) * 60 / SEMA_BPM;
  const CROSSED = A(0.2, 0.6, -0.98, 3.1), RISE = A(0.35, 1.9, 0.1, 0.6);
  const PALM_SKY = A(2.25, 0.25, 0.25, 0.1), PALM_EARTH = A(1.35, 0.2, -0.25, 0);
  const semaArms = (u) => u < 0.5
    ? [blend(CROSSED, RISE, smooth(u / 0.5)), blend(CROSSED, RISE, smooth(u / 0.5))]
    : [blend(RISE, PALM_SKY, smooth((u - 0.5) / 0.5)), blend(RISE, PALM_EARTH, smooth((u - 0.5) / 0.5))];
  const PIVOT = [-0.07, 0, 0.02];
  const sema = (b) => {
    const tl = semaTime(b), spin = semaSpin(tl), spinU = spin.w / OMEGA_MAX;
    const armU = tl < 2.5 ? 0 : tl < 6 ? smooth((tl - 2.5) / 3.5) : tl < 16.5 ? 1 : tl < 19.5 ? 1 - smooth((tl - 16.5) / 3) : 0;
    const [armR, armL] = semaArms(armU);
    const bow = Math.max(smooth(1 - Math.abs(tl - 1.1) / 0.9), smooth(1 - Math.abs(tl - 20.8) / 0.9));
    const f = mod(spin.yaw / TAU, 1), push = spinU > 0.2 && f > 0.7 ? s(PI * (f - 0.7) / 0.3) : 0;
    const r = rotY(PIVOT, spin.yaw);
    const p = P({
      ik: 1, hipH: 0.84, kneeOut: 0.2,
      fL: F(PIVOT[0], ANK, PIVOT[2]), fR: F(0.14, ANK + 0.1 * push, 0.06 - 0.04 * push),
      armR, armL, leanFwd: 0.35 * bow, torsoX: 0.35 * bow, headNod: 0.35 * bow, headTilt: 0.35 * armU,
      yaw: spin.yaw, tx: PIVOT[0] - r[0], tz: PIVOT[2] - r[2]
    });
    return b < 1.5 ? blend(halftime(15.999, 16, SEMA - 0.001), p, smooth(b / 1.5)) : p;
  };
  const cloth = { flare: FLARE_REST, lag: 0 };
  function updateCloth(gb, dt) {
    let w = 0, a = 0;
    if (gb >= SEMA) ({ w, a } = semaSpin(semaTime(gb - SEMA)));
    const eq = w * w * SKIRT_L > G ? Math.acos(G / (w * w * SKIRT_L)) : 0;
    const dts = dt * (reduced ? 1 / 3 : 1);
    cloth.flare += (Math.max(FLARE_REST, eq) - cloth.flare) * (1 - Math.exp(-dts / 0.45));
    cloth.lag += (0.3 * (w / OMEGA_MAX) + 0.08 * a - cloth.lag) * (1 - Math.exp(-dts / 0.3));
  }

  let DEAD = 0;
  const shutdown = () => sema(SEMA_LEN - 0.001);
  const MOVES = [
    { fn: robotArms,  len: 8,  fade: 0.2, ease: 'snap', sec: 'robot' },
    { fn: armWave,    len: 8,  fade: 0.2, ease: 'snap', sec: 'robot' },
    { fn: tickWalk,   len: 8,  fade: 0.5,               sec: 'robot' },
    ...MOON_ROUTE,
    { fn: powerDown,  len: 8,  fade: 1.5, sec: 'power' },
    { fn: toprock,    len: 8,  fade: 1.5, sec: 'break' },
    { fn: windmill,   len: 8,  fade: 1.5, sec: 'break' },
    { fn: freeze(-1), len: 4,  fade: 1.5, sec: 'break' },
    { fn: toprock,    len: 4,  fade: 1.5, sec: 'break' },
    { fn: headspin,   len: 8,  fade: 1.5, sec: 'break' },
    { fn: freeze(1),  len: 4,  fade: 2,   sec: 'break' },
    { fn: discoPoint, len: 8,  fade: 1,   sec: 'disco' },
    { fn: handsUp,    len: 8,  fade: 1,   sec: 'disco' },
    { fn: discoKicks, len: 8,  fade: 1,   sec: 'disco' },
    { fn: discoSpin,  len: 8,  fade: 1,   sec: 'disco' },
    { fn: stamp,      len: 8,  fade: 0.75, sec: 'cossack' },
    { fn: prisiadka,  len: 8,  fade: 0.75, sec: 'cossack' },
    { fn: polzunets,  len: 4,  fade: 0.75, sec: 'cossack' },
    { fn: straddle,   len: 8,  fade: 0.4, sec: 'cossack' },
    { fn: sevens,     len: 8,  fade: 0.28, sec: 'irish' },
    { fn: kicks,      len: 8,  fade: 0.28, sec: 'irish' },
    { fn: leaps,      len: 8,  fade: 0.4, sec: 'irish' },
    { fn: clicks,     len: 8,  fade: 0.5, sec: 'irish' },
    { fn: build,      len: 16, fade: 0,   sec: 'build' },
    { fn: skank,      len: 32, fade: 0.5, sec: 'drop' },
    { fn: halftime,   len: 16, fade: 0,   sec: 'half' },
    { fn: sema,       len: 22, fade: 0,   sec: 'sema' },
    { fn: shutdown,   len: 1,  fade: 0,   sec: 'dead' }
  ];
  const TOTAL = MOVES.reduce((n, m) => n + m.len, 0);
  const SECTIONS = [];
  MOVES.reduce((at, m) => {
    if (!SECTIONS.length || SECTIONS[SECTIONS.length - 1][0] !== m.sec) SECTIONS.push([m.sec, at]);
    return at + m.len;
  }, 0);
  const startOf = (name) => SECTIONS.find(([n]) => n === name)[1];
  const MOON = startOf('moon'), BREAK = startOf('break'), DISCO = startOf('disco'), IRISH = startOf('irish');
  const COSSACK = startOf('cossack');
  const BUILD = startOf('build'), DROP_AT = startOf('drop');
  const REBOOT = startOf('power') + 6, HAT_LAND = MOON + 1;
  DEAD = startOf('dead');
  const SEMA = startOf('sema');
  const TEMPO = [
    [0, REBOOT, 100, 100],
    [REBOOT, BREAK, 100, 108],
    [BREAK, DISCO - 2, 108, 108],
    [DISCO - 2, DISCO, 108, 116],
    [DISCO, IRISH - 1, 116, 116],
    [IRISH - 1, IRISH, 116, 118],
    [IRISH, BUILD, 118, 118],
    [BUILD, BUILD + 12, 118, 174],
    [BUILD + 12, SEMA - 1, 174, 174],
    [SEMA - 1, SEMA, 174, 14],
    [SEMA, DEAD, SEMA_BPM, SEMA_BPM],
    [DEAD, TOTAL, 70, 70]
  ];
  const SCHEDULED = new Map([
    [REBOOT * 4, { dur: 0.22, strength: 1 }],
    [DROP_AT * 4, { dur: 0.22, strength: 1 }],
    [HAT_LAND * 4, { dur: 0.1, strength: 0.55 }],
    [COSSACK * 4, { dur: 0.12, strength: 0.6 }],
    [IRISH * 4, { dur: 0.12, strength: 0.6 }],
    [SEMA * 4, { dur: 0.2, strength: 0.8 }]
  ]);
  const GLITCH_ODDS = { robot: 0.3, moon: 0.15, power: 0, break: 0.3, disco: 0.3, cossack: 0.08, irish: 0.3, build: 0, drop: 0.3, half: 0.35, sema: 0.3, dead: 0 };

  function tempoAt(gb) {
    for (const [a, z, t0, t1] of TEMPO) if (gb < z) return lerp(t0, t1, clamp((gb - a) / (z - a), 0, 1));
    return TEMPO[TEMPO.length - 1][3];
  }
  function sectionAt(gb) {
    let i = SECTIONS.length - 1;
    while (i > 0 && gb < SECTIONS[i][1]) i--;
    return { sec: SECTIONS[i][0], b: gb - SECTIONS[i][1] };
  }

  function drums(step) {
    const { sec, b } = sectionAt(mod(step / 4, TOTAL));
    const ls = Math.round(b * 4), st = mod(ls, 16), bar = Math.floor(ls / 16);
    const hit = { kick: false, snare: false, hat: false };
    if (sec === 'robot') {
      hit.kick = st % 4 === 0; hit.snare = st === 4 || st === 12; hit.hat = st % 2 === 0;
    } else if (sec === 'moon') {
      const toe = TOE_STEPS.includes(ls);
      hit.kick = st === 0 || st === 8 || st === 10 || toe;
      hit.snare = st === 4 || st === 12 || toe;
      hit.hat = st % 2 === 0 || st === 15;
    } else if (sec === 'power') {
      if (bar === 0) hit.kick = st === 0 || st === 8;
      else hit.kick = hit.snare = st === 8;
    } else if (sec === 'break') {
      if (bar < 8) { hit.kick = st === 0 || st === 2 || st === 10; hit.snare = st === 4 || st === 12; hit.hat = st % 2 === 0; }
      else { hit.kick = st === 0; hit.snare = st === 4 || st >= 12; hit.hat = st % 2 === 0 && st < 12; }
    } else if (sec === 'disco') {
      hit.kick = st % 4 === 0;
      hit.snare = st === 4 || st === 12;
      hit.hat = st % 4 === 2;
    } else if (sec === 'sema') {
      if (ls < 80) { hit.kick = st === 0 || st === 8; hit.snare = st === 12; }
    } else if (sec === 'cossack') {
      hit.kick = st % 4 === 0;
      hit.snare = st % 4 === 2;
      hit.hat = st % 4 === 3;
    } else if (sec === 'irish') {
      hit.kick = st % 4 === 0;
      hit.snare = st === 4 || st === 12;
      hit.hat = st % 2 === 0 || st === 3 || st === 11;
    } else if (sec === 'build') {
      if (bar < 3) { hit.kick = st === 0; hit.snare = bar === 2 && (st === 4 || st === 12); hit.hat = st % 2 === 0; }
      else if (st < 8) hit.snare = st % 2 === 0;
      else if (st < 12) hit.snare = true;
    } else if (sec === 'drop') {
      hit.kick = st === 0 || st === 10;
      hit.snare = st === 4 || st === 12;
      hit.hat = st % 2 === 0 || st === 7 || st === 15;
    } else if (sec === 'half') {
      hit.kick = st === 0 || st === 11;
      hit.snare = st === 8;
      hit.hat = st % 4 === 2;
    }
    return hit;
  }
  function since(gb, type) {
    const step = Math.floor(gb * 4);
    for (let k = 0; k < 16; k++) if (drums(step - k)[type]) return { dt: gb - (step - k) / 4, step: step - k };
    return { dt: 99, step: 0 };
  }

  function poseAt(gb) {
    let m = mod(gb, TOTAL), i = 0;
    while (m >= MOVES[i].len) { m -= MOVES[i].len; i++; }
    const e = MOVES[i];
    const cur = e.fn(m, e.len, gb);
    if (e.fade > 0 && m > e.len - e.fade) {
      const n = MOVES[(i + 1) % MOVES.length];
      const next = n.fn(0, n.len, gb - m + e.len);
      for (const k of ['yaw', 'spin']) {
        cur[k] = wrap(cur[k]);
        next[k] = cur[k] + wrap(next[k] - cur[k]);
      }
      const x = (m - (e.len - e.fade)) / e.fade;
      return blend(cur, next, e.ease === 'snap' ? easeOutBack(x) : smooth(x));
    }
    return cur;
  }

  function lookAt(gb) {
    if (gb < REBOOT) {
      const fall = clamp((gb - (HAT_LAND - 0.8)) / 0.8, 0, 1);
      return {
        visor: 1 - smooth((gb - HAT_LAND + 0.05) / 0.15),
        fedora: gb >= HAT_LAND - 0.8 ? 1 : 0,
        hatY: gb < HAT_LAND ? 1.8 * (1 - fall * fall) : 0.03 * s(PI * clamp((gb - HAT_LAND) / 0.25, 0, 1)),
        hatSpin: 3 * TAU * Math.pow(1 - fall, 2),
        papakha: 0, cap: 0, capTurn: PI
      };
    }
    if (gb >= SEMA) return {
      visor: 0, fedora: 0, hatY: 0, hatSpin: 0, papakha: 0, cap: 0, capTurn: 0,
      sikke: 1, skirt: 1, palms: true, flare: FLARE_REST, lag: 0,
      spinU: semaSpin(semaTime(gb - SEMA)).w / OMEGA_MAX
    };
    const fur = gb >= COSSACK && gb < IRISH ? 1 : 0;
    return { visor: 0, fedora: 0, hatY: 0, hatSpin: 0, papakha: fur, cap: 1 - fur, capTurn: PI * (1 - smooth((gb - BUILD - 1) / 1.5)) };
  }

  const CAMS = {
    robot: { pitch: 0.22, cy: -0.05, scale: 0.27, follow: 0.6, orbit: 0.42 },
    moon:  { pitch: 0.22, cy: 0.08,  scale: 0.27, follow: 0.6, orbit: 0.42 },
    break: { pitch: 0.3,  cy: -0.05, scale: 0.27, follow: 0.6, orbit: 0.42 },
    disco: { pitch: 0.2,  cy: -0.05, scale: 0.27, follow: 0.6, orbit: 0.42 },
    cossack: { pitch: 0.22, cy: 0.3, scale: 0.235, follow: 0, orbit: 0.42 },
    irish: { pitch: 0.22, cy: -0.05, scale: 0.27, follow: 0.6, orbit: 0.42 },
    dnb:   { pitch: 0.28, cy: 0.1,   scale: 0.265, follow: 0.6, orbit: 0.42 },
    sema:  { pitch: 0.26, cy: 0,     scale: 0.25,  follow: 0,   orbit: 0.15 }
  };
  const camFor = (sec) => (sec === 'robot' || sec === 'power' ? 'robot' : sec === 'dead' ? 'sema' : CAMS[sec] ? sec : 'dnb');

  const LINE = 0.006;
  const easeIn = (x) => x * x * x;
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  function crtAt(gb) {
    if (gb >= DEAD) {
      const u = gb - DEAD;
      if (reduced) return { alpha: 1 - smooth(u / 0.5) };
      if (u < 0.28) { const e = easeIn(u / 0.28); return { sx: 1, sy: lerp(1, LINE, e), beam: Math.pow(e, 4), show: true }; }
      if (u < 0.46) { const e = easeIn((u - 0.28) / 0.18); return { sx: lerp(1, 0.015, e), sy: LINE, beam: 1, show: true }; }
      const e = clamp((u - 0.46) / 0.3, 0, 1);
      return { sx: 0.015 * (1 - 0.5 * e), sy: LINE, beam: 1 - e, show: false };
    }
    if (gb < 0.6) {
      const u = gb / 0.6;
      if (reduced) return { alpha: smooth(u) };
      if (u < 0.25) return { sx: lerp(0.015, 1, easeOut(u / 0.25)), sy: LINE, beam: 1, show: true };
      const x = (u - 0.25) / 0.75;
      return { sx: 1, sy: lerp(LINE, 1, easeOutBack(x)), beam: Math.pow(1 - x, 3), show: true };
    }
    return null;
  }

  function buildFigure(pose, look) {
    const hipR = [0.08, 0, 0], hipL = [-0.08, 0, 0], w = pose.ik;
    const leg = (hip, side, Lg, Ft) => {
      let knee = add(hip, mul(limbDir(side, Lg.abd, Lg.fwd), THIGH));
      let ank = add(knee, mul(limbDir(side, Lg.abd * 0.6, Lg.fwd - Lg.knee), SHIN));
      if (w > 0.001) {
        const target = mix3(ank, [Ft.x, Ft.y - pose.hipH, Ft.z], w);
        const hint = mix3(norm(sub(knee, hip)), norm([side * pose.kneeOut, 0.15, 1]), w);
        [knee, ank] = ik(hip, target, THIGH, SHIN, hint);
      }
      const point = Ft.point * w, curl = Ft.curl * w, pointe = Lg.toe * (1 - w), turn = side * pose.footTurn;
      const tip = (v, a) => rotY(rotX(v, a), turn);
      let fwd = tip([0, 0, 1], point), down = tip([0, -1, 0], point);
      if (pointe > 0.001) {
        const f = norm(mix3(fwd, norm(sub(ank, knee)), pointe));
        down = turnLike(down, fwd, f); fwd = f;
      }
      const at = (z) => add(ank, add(mul(down, ANK), mul(fwd, z)));
      const ball = at(BALL_Z), toeDir = curl > 0.001 ? tip([0, 0, 1], point - curl) : fwd;
      return [hip, knee, ank, at(HEEL_Z), ball, add(ball, mul(toeDir, TOE_LEN))];
    };
    const lr = leg(hipR, 1, pose.legR, pose.fR), ll = leg(hipL, -1, pose.legL, pose.fL);

    const up = rotZ(rotX([0, 1, 0], pose.leanFwd), -pose.leanSide);
    const neck = mul(up, SPINE), shoulder = mul(up, SPINE - 0.06);
    const headOrient = (v) => rotZ(rotX(rotY(v, pose.headTurn), pose.leanFwd + pose.headNod), -pose.leanSide - pose.headTilt);
    const headC = add(neck, mul(headOrient([0, 1, 0]), NECK + HEAD_R));
    const torso = (v) => rotZ(rotX(v, pose.torsoX), -pose.leanSide);
    const arm = (side, Ar) => {
      const elbow = add(shoulder, mul(torso(limbDir(side, Ar.abd, Ar.fwd)), UPPER_ARM));
      return [shoulder, elbow, add(elbow, mul(torso(limbDir(side, Ar.abd + Ar.eAbd, Ar.fwd + Ar.eFwd)), FOREARM))];
    };
    const ar = arm(1, pose.armR), al = arm(-1, pose.armL);

    const body = (p) => rotY(rotZ(rotX(rotY(p, pose.spin), pose.pitch), pose.roll), pose.yaw);
    let lowest = body(headC)[1] - HEAD_R;
    for (const p of [...lr, ...ll, ...ar, ...al]) lowest = Math.min(lowest, body(p)[1]);
    const dy = lerp(FLOOR_Y - lowest + 0.01, FLOOR_Y + pose.hipH, w) + pose.air;

    const polys = [];
    const place = (p) => { const q = body(p); return [q[0] + pose.tx, q[1] + dy, q[2] + pose.tz]; };
    const line = (pts, lw = 2.4) => polys.push({ pts: pts.map(place), color: WHITE, w: lw });

    line([[0, 0, 0], neck]);
    line([hipR, [0, 0, 0], hipL]);
    line([add(shoulder, torso([0.1, 0, 0])), shoulder, add(shoulder, torso([-0.1, 0, 0]))], 2.0);
    line(ar); line(al);
    line(lr.slice(0, 3)); line(ll.slice(0, 3));
    for (const Lg of [lr, ll]) line([Lg[4], Lg[2], Lg[3], Lg[4], Lg[5]], 2.0);

    const headPt = (v) => place(add(headC, headOrient(v)));
    for (const lat of [-0.5, 0, 0.5]) {
      const pts = [], r = HEAD_R * c(lat), y = HEAD_R * s(lat);
      for (let k = 0; k <= 18; k++) { const a = TAU * k / 18; pts.push(headPt([r * c(a), y, r * s(a)])); }
      polys.push({ pts, color: WHITE, w: 1.2, dim: lat !== 0 });
    }
    for (let m = 0; m < 4; m++) {
      const pts = [], a = PI * m / 4;
      for (let k = 0; k <= 18; k++) { const t = TAU * k / 18; pts.push(headPt([HEAD_R * c(t) * c(a), HEAD_R * s(t), HEAD_R * c(t) * s(a)])); }
      polys.push({ pts, color: WHITE, w: 1.0, dim: true });
    }
    if (look.visor > 0.02) {
      const pts = [];
      for (let k = 0; k <= 10; k++) { const a = -0.8 + 1.6 * k / 10; pts.push(headPt([HEAD_R * 1.04 * s(a), 0.03, HEAD_R * 1.04 * c(a)])); }
      polys.push({ pts, color: WHITE, w: 2.4, alpha: look.visor });
    }
    if (look.fedora > 0.02) {
      const hat = (v) => headPt(rotX(add(rotY(v, look.hatSpin), [0, HEAD_R * 0.62 + look.hatY, 0]), 0.18));
      const ring = (r, y, pinch = 0) => {
        const pts = [];
        for (let k = 0; k <= 24; k++) { const a = TAU * k / 24; pts.push(hat([r * c(a), y - pinch * Math.pow(c(a), 2), r * 1.1 * s(a)])); }
        return pts;
      };
      const al = look.fedora;
      polys.push({ pts: ring(0.27, 0), color: WHITE, w: 1.5, alpha: al });
      polys.push({ pts: ring(0.155, 0.01), color: WHITE, w: 1.1, dim: true, alpha: al });
      polys.push({ pts: ring(0.15, 0.14, 0.03), color: WHITE, w: 1.3, alpha: al });
      for (let k = 0; k < 8; k++) {
        const a = TAU * k / 8;
        polys.push({ pts: [hat([0.155 * c(a), 0.01, 0.17 * s(a)]), hat([0.15 * c(a), 0.14 - 0.03 * Math.pow(c(a), 2), 0.165 * s(a)])], color: WHITE, w: 1.0, dim: true, alpha: al });
      }
      polys.push({ pts: [hat([0, 0.14, 0.165]), hat([0, 0.1, 0]), hat([0, 0.14, -0.165])], color: WHITE, w: 1.0, dim: true, alpha: al });
    }
    if (look.papakha > 0.02) {
      const hatA = look.papakha, y0 = HEAD_R * 0.55, hh = 0.2;
      const ring = (y, r) => {
        const pts = [];
        for (let k = 0; k <= 20; k++) { const a = TAU * k / 20; pts.push(headPt([r * c(a), y, r * s(a)])); }
        return pts;
      };
      polys.push({ pts: ring(y0, 0.165), color: WHITE, w: 1.5, alpha: hatA });
      polys.push({ pts: ring(y0 + hh * 0.5, 0.175), color: WHITE, w: 0.9, dim: true, alpha: hatA });
      polys.push({ pts: ring(y0 + hh, 0.185), color: WHITE, w: 1.5, alpha: hatA });
      for (let k = 0; k < 10; k++) {
        const a = TAU * k / 10;
        polys.push({ pts: [headPt([0.165 * c(a), y0, 0.165 * s(a)]), headPt([0.185 * c(a), y0 + hh, 0.185 * s(a)])], color: WHITE, w: 0.9, dim: true, alpha: hatA });
      }
    }
    if (look.cap > 0.02) {
      const capPt = (v) => headPt(rotY(v, look.capTurn));
      const brim = [], peak = [];
      for (let k = 0; k <= 18; k++) { const a = PI * k / 18; brim.push(capPt([HEAD_R * 1.06 * c(a), HEAD_R * 0.25, HEAD_R * 1.06 * s(a)])); }
      for (let k = 0; k <= 10; k++) { const a = PI * k / 10; peak.push(capPt([HEAD_R * 0.95 * c(a), HEAD_R * 0.22, HEAD_R + 0.1 * s(a)])); }
      polys.push({ pts: brim, color: WHITE, w: 1.4, alpha: look.cap });
      polys.push({ pts: peak, color: WHITE, w: 1.4, alpha: look.cap });
      for (const q of [0.35, 0.7]) {
        const arc = [];
        for (let k = 0; k <= 12; k++) { const a = PI * k / 12; arc.push(capPt([HEAD_R * 1.04 * c(a) * c(q), HEAD_R * (0.25 + 0.75 * s(q)), HEAD_R * 1.04 * s(a) * c(q)])); }
        polys.push({ pts: arc, color: WHITE, w: 1.0, dim: true, alpha: look.cap });
      }
    }
    if (look.sikke > 0.02) {
      const hy = HEAD_R * 0.5, hh = 0.34, ha = look.sikke;
      const hRing = (y, r) => { const pts = []; for (let k = 0; k <= 20; k++) { const a = TAU * k / 20; pts.push(headPt([r * c(a), y, r * s(a)])); } return pts; };
      polys.push({ pts: hRing(hy, 0.15), color: WHITE, w: 1.5, alpha: ha });
      polys.push({ pts: hRing(hy + hh * 0.5, 0.135), color: WHITE, w: 0.9, dim: true, alpha: ha });
      polys.push({ pts: hRing(hy + hh, 0.12), color: WHITE, w: 1.4, alpha: ha });
      for (let k = 0; k < 8; k++) {
        const a = TAU * k / 8;
        polys.push({ pts: [headPt([0.15 * c(a), hy, 0.15 * s(a)]), headPt([0.12 * c(a), hy + hh, 0.12 * s(a)]), headPt([0.06 * c(a), hy + hh + 0.035, 0.06 * s(a)])], color: WHITE, w: 0.9, dim: true, alpha: ha });
      }
    }
    if (look.skirt > 0.02) {
      const th = look.flare, spinU = look.spinU, NS = 48, ska = look.skirt, WAIST_R = 0.12;
      const pleatW = (1 - smooth((th - FLARE_REST) / 0.5)) * 0.05;
      const skirtPt = (a, frac) => {
        const wave = 0.035 * spinU * s(a * 5 - pose.yaw * 2.3), aa = a - look.lag * frac;
        const r = WAIST_R + frac * (SKIRT_L * s(th) + pleatW * s(a * 12) * frac);
        const q = place([r * c(aa), 0.06 - frac * SKIRT_L * c(th) + wave * frac * frac, r * s(aa)]);
        q[1] = Math.max(q[1], FLOOR_Y + 0.02);
        return q;
      };
      const ringAt = (frac) => { const pts = []; for (let k = 0; k <= NS; k++) pts.push(skirtPt(TAU * k / NS, frac)); return pts; };
      polys.push({ pts: ringAt(0), color: WHITE, w: 1.6, alpha: ska });
      polys.push({ pts: ringAt(0.55), color: WHITE, w: 0.8, dim: true, alpha: ska });
      const hem = ringAt(1);
      polys.push({ pts: hem, color: WHITE, w: 1.8, alpha: ska });
      for (let k = 0; k < 16; k++) {
        const a = TAU * k / 16, pts = [];
        for (let j = 0; j <= 6; j++) pts.push(skirtPt(a, j / 6));
        polys.push({ pts, color: WHITE, w: 0.9, dim: true, alpha: ska });
      }
      polys.push({ pts: hem.map((q) => [q[0], FLOOR_Y + 0.003, q[2]]), color: FLOOR, w: 1.0, alpha: 0.5 * spinU * ska });
    }
    for (const [Ar, up] of [[ar, 1], [al, -1]]) {
      const h = Ar[2], pts = [];
      for (let k = 0; k <= 12; k++) {
        const a = TAU * k / 12;
        pts.push(place(add(h, look.palms ? [0.05 * c(a), 0.004 * up, 0.035 * s(a)] : [0.035 * c(a), 0.035 * s(a), 0])));
      }
      polys.push({ pts, color: WHITE, w: 1.2 });
    }

    const feet = [[lr, pose.slideR], [ll, pose.slideL]].map(([Lg, slide]) => {
      const heel = place(Lg[3]), ball = place(Lg[4]), toe = place(Lg[5]), low = toe[1] < ball[1] ? toe : ball;
      const lowY = Math.min(heel[1], ball[1], toe[1]);
      return { p: low, mid: place(mix3(Lg[3], Lg[4], 0.5)), down: lowY < FLOOR_Y + 0.02, slide };
    });
    return { polys, feet };
  }

  const hash = (n) => { let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16; return (x >>> 0) / 4294967296; };
  const tileOf = (p) => {
    const i = Math.floor((p[0] + HALF_W) / TILE), j = Math.floor((p[2] + HALF_W) / TILE);
    return i >= 0 && i < N && j >= 0 && j < N ? i * N + j : -1;
  };
  const FOOT_LIGHT = { moon: 'trace', irish: 'trace', cossack: 'stamp' };
  const footGlow = new Float32Array(N * N), wasDown = [false, false];
  function lightFootsteps(feet, dt, mode) {
    const k = Math.exp(-dt * 1.4);
    for (let i = 0; i < footGlow.length; i++) footGlow[i] *= k;
    feet.forEach((f, n) => {
      const lit = mode === 'trace' ? f.down : mode === 'stamp' && f.down && !wasDown[n];
      const tile = lit ? tileOf(f.p) : -1;
      if (tile >= 0) footGlow[tile] = 1;
      wasDown[n] = f.down;
    });
  }

  const trails = [[], []];
  const TRAIL_LIFE = 1.4;
  function recordTrails(feet, t) {
    feet.forEach((f, n) => {
      const tr = trails[n];
      if (f.slide > 0.5 && f.down) tr.push({ p: [f.mid[0], FLOOR_Y + 0.002, f.mid[2]], t });
      else if (tr.length && tr[tr.length - 1] !== null) tr.push(null);
      while (tr.length && (tr[0] === null || t - tr[0].t > TRAIL_LIFE)) tr.shift();
    });
  }
  function buildTrails(t) {
    const polys = [];
    for (const tr of trails) {
      for (let i = 1; i < tr.length; i++) {
        const a = tr[i - 1], b = tr[i];
        if (!a || !b || Math.hypot(a.p[0] - b.p[0], a.p[2] - b.p[2]) > 0.1) continue;
        const life = 1 - (t - b.t) / TRAIL_LIFE;
        polys.push({ pts: [a.p, b.p], color: WHITE, w: 2.2, alpha: 0.6 * life * life });
      }
    }
    return polys;
  }

  function buildFloor(gb, sec, b, power, center, hem = { r: 0, glow: 0 }) {
    const K = since(gb, 'kick'), S = since(gb, 'snare'), Hh = since(gb, 'hat');
    const polys = [];
    for (let i = 0; i <= N; i++) {
      const v = -HALF_W + i * TILE;
      polys.push({ pts: [[-HALF_W, FLOOR_Y, v], [HALF_W, FLOOR_Y, v]], color: FLOOR, w: 0.8, dim: true });
      polys.push({ pts: [[v, FLOOR_Y, -HALF_W], [v, FLOOR_Y, HALF_W]], color: FLOOR, w: 0.8, dim: true });
    }
    const riser = sec === 'build' && b >= 12 ? smooth((b - 12) / 3) * 0.35 : 0;
    const bass = sec === 'drop' ? 0.5 : sec === 'half' ? 2 : 0;
    const gain = { moon: 0.45, irish: 0.6, cossack: 0.6, disco: 0.55, sema: 0.35 }[sec] ?? 1;
    const checker = mod(Math.floor(K.step / 4), 2), checkGlow = sec === 'disco' ? 0.55 * Math.exp(-K.dt * 1.8) : 0;
    const hatTile = Math.floor(hash(Hh.step) * N * N);
    const rowMode = Math.floor(hash(S.step + 7) * 2), rowPick = Math.floor(hash(S.step + 3) * N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const cx = -HALF_W + (i + 0.5) * TILE, cz = -HALF_W + (j + 0.5) * TILE;
      const d = Math.hypot(cx - center[0], cz - center[1]);
      let v = 0;
      v += Math.exp(-K.dt * 2.5) * Math.exp(-Math.pow(d - K.dt * 2.2, 2) / 0.03);
      if ((rowMode ? i : j) === rowPick) v += Math.exp(-S.dt * 4);
      if (i * N + j === hatTile) v += 0.7 * Math.exp(-Hh.dt * 9);
      if (bass) v += 0.22 * (0.5 + 0.5 * s(cx * 3.2 - cz * 1.4 - gb * PI * bass));
      v += riser * (0.5 + 0.5 * s(gb * TAU * 4 + d * 6));
      v *= gain;
      if (checkGlow && mod(i + j, 2) === checker) v += checkGlow;
      v += 0.85 * footGlow[i * N + j];
      if (hem.glow) v += hem.glow * Math.exp(-Math.pow(d - hem.r, 2) / 0.012);
      if (sec === 'robot' || sec === 'power') v = Math.round(v * 4) / 4;
      v = clamp(v, 0, 1) * power;
      if (v < 0.06) continue;
      for (const [inset, th] of [[0.025, 0], [0.065, 0.45], [0.1, 0.75]]) {
        if (v <= th) break;
        const x0 = cx - TILE / 2 + inset, x1 = cx + TILE / 2 - inset, z0 = cz - TILE / 2 + inset, z1 = cz + TILE / 2 - inset;
        polys.push({ pts: [[x0, FLOOR_Y, z0], [x1, FLOOR_Y, z0], [x1, FLOOR_Y, z1], [x0, FLOOR_Y, z1], [x0, FLOOR_Y, z0]],
          color: WHITE, w: 1.3, alpha: v });
      }
    }
    return polys;
  }

  function project(p, view, jitter) {
    let [x, y, z] = p;
    x -= view.fx; y -= view.cy; z -= view.fz;
    if (jitter) { x += (Math.random()-.5)*jitter; y += (Math.random()-.5)*jitter; }
    const cy = c(view.yaw), sy = s(view.yaw);
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const cx = c(view.pitch), sx = s(view.pitch);
    const y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    const d = 5, persp = d / (d - z2);
    const scale = W * view.scale;
    return [W/2 + x1 * scale * persp, H/2 - y1 * scale * persp, z2];
  }

  function strokeAll(polys, view, color, alpha, ox, oy, jitter) {
    for (const poly of polys) {
      bctx.beginPath();
      let depthSum = 0;
      poly.pts.forEach((p, i) => {
        const [sx, sy, sz] = project(p, view, jitter);
        depthSum += sz;
        if (i === 0) bctx.moveTo(sx + ox, sy + oy); else bctx.lineTo(sx + ox, sy + oy);
      });
      const depth = depthSum / poly.pts.length;
      const fade = 0.45 + 0.55 * Math.min(1, Math.max(0, (depth + 1.2) / 2.4));
      bctx.globalAlpha = alpha * fade * (poly.dim ? 0.55 : 1) * (poly.alpha ?? 1);
      bctx.strokeStyle = color || poly.color;
      bctx.lineWidth = poly.w * dpr;
      bctx.stroke();
    }
    bctx.globalAlpha = 1;
  }

  let song = 0, prevStep = -1;
  let glitchT = 0, glitchStrength = 0, beatShift = 0;
  let orbit = 0, last = performance.now();
  let ringAnim = null, ringRate = 1;
  const cam = Object.assign({}, CAMS.robot);

  function frame(now) {
    if (W === 0 || H === 0) {
      resize();
      if (W === 0 || H === 0) { last = now; requestAnimationFrame(frame); return; }
    }
    const dt = Math.min(50, now - last) / 1000; last = now;
    song += dt * tempoAt(mod(song, TOTAL)) / 60 * (reduced ? 1 / 3 : 1);
    const gb = mod(song, TOTAL);
    const tempo = tempoAt(gb);
    const { sec } = sectionAt(gb);

    const step = Math.floor(song * 4);
    if (!reduced) {
      for (let st = prevStep + 1; st <= step; st++) {
        const ws = mod(st, TOTAL * 4), fixed = SCHEDULED.get(ws);
        if (fixed) {
          glitchT = fixed.dur; glitchStrength = fixed.strength; beatShift = 0;
        } else if (glitchT <= 0 && drums(st).snare && Math.random() < GLITCH_ODDS[sectionAt(ws / 4).sec]) {
          glitchT = 0.05 + Math.random() * 0.12;
          glitchStrength = 0.4 + Math.random() * 0.5;
          beatShift = Math.random() < 0.4 ? -0.25 : 0;
        }
      }
    }
    prevStep = step;
    const g = glitchT > 0;
    if (g) glitchT -= dt; else beatShift = 0;
    const shown = mod(song + beatShift, TOTAL);
    const at = sectionAt(shown);

    const power = gb >= DEAD ? 0 : gb >= SEMA ? lerp(14 / 174, 1, smooth((gb - SEMA) / 3))
      : gb >= SEMA - 1 ? tempo / 174 : 1;
    orbit += dt * cam.orbit * (reduced ? 0.36 : 1) * power;

    if (gb >= DEAD + 0.75) Object.assign(cam, CAMS.robot);
    else {
      const tgt = CAMS[camFor(sec)], k = 1 - Math.exp(-dt * 2.5);
      for (const key in cam) cam[key] += (tgt[key] - cam[key]) * k;
    }

    const kEnv = power * Math.exp(-since(shown, 'kick').dt * 5);
    if (ringEl) ringEl.style.transform = `rotate(-90deg) scale(${1 + 0.035 * kEnv})`;
    if (!ringAnim && arcEl && arcEl.getAnimations) ringAnim = arcEl.getAnimations()[0] || null;
    const rate = Math.max(0.15, (tempo / 108) * (gb >= DEAD ? 0 : 1));
    if (ringAnim && Math.abs(rate - ringRate) > 0.02) { ringAnim.playbackRate = rate; ringRate = rate; }

    const t = now / 1000;
    const pose = poseAt(shown);
    updateCloth(gb, dt);
    const look = lookAt(shown);
    if (look.skirt) { look.flare = cloth.flare; look.lag = cloth.lag; }
    const fig = buildFigure(pose, look);
    lightFootsteps(fig.feet, dt, FOOT_LIGHT[at.sec]);
    recordTrails(fig.feet, t);
    const view = {
      yaw: orbit, pitch: cam.pitch + s(t * 0.7) * 0.04, cy: cam.cy, scale: cam.scale,
      fx: pose.tx * cam.follow, fz: pose.tz * cam.follow
    };
    const hem = { r: 0.12 + SKIRT_L * s(cloth.flare), glow: look.skirt ? 0.7 * look.spinU : 0 };
    const polys = buildFloor(shown, at.sec, at.b, power, [pose.tx, pose.tz], hem).concat(buildTrails(t), fig.polys);

    bctx.clearRect(0, 0, W, H);
    bctx.lineJoin = 'round'; bctx.lineCap = 'round';
    bctx.globalCompositeOperation = 'lighter';
    if (g) {
      const off = (4 + Math.random() * 8) * dpr * glitchStrength;
      strokeAll(polys, view, GHOST_A, 0.7, -off, 0, 0.03 * glitchStrength);
      strokeAll(polys, view, GHOST_B, 0.6, off, (Math.random()-.5)*2*dpr, 0.03 * glitchStrength);
    }
    strokeAll(polys, view, null, g ? 0.85 : 1, 0, 0, g ? 0.02 : (reduced ? 0 : 0.004));
    bctx.globalCompositeOperation = 'source-over';

    ctx.clearRect(0, 0, W, H);
    const crt = crtAt(gb);
    ctx.save();
    if (crt && reduced) ctx.globalAlpha = crt.alpha;
    else if (crt) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(Math.max(crt.sx, 1e-3), Math.max(crt.sy, 1e-3));
      ctx.translate(-W / 2, -H / 2);
    }
    if (!crt || reduced || crt.show) {
      if (g) {
        let y = 0;
        while (y < H) {
          const h = Math.min(H - y, Math.max(2, Math.floor((4 + Math.random() * 30) * dpr)));
          const shift = Math.random() < 0.35 ? (Math.random() - .5) * 40 * dpr * glitchStrength : 0;
          ctx.drawImage(buf, 0, y, W, h, shift, y, W, h);
          y += h;
        }
        const blocks = Math.floor(Math.random() * 4);
        for (let i = 0; i < blocks; i++) {
          ctx.fillStyle = [WHITE, GHOST_A, GHOST_B][i % 3];
          ctx.globalAlpha = 0.18 + Math.random() * 0.3;
          ctx.fillRect(Math.random() * W, Math.random() * H, (10 + Math.random() * 60) * dpr, (1 + Math.random() * 3) * dpr);
        }
      } else {
        ctx.drawImage(buf, 0, 0);
      }
    }
    ctx.restore();
    if (crt && !reduced && crt.beam > 0.01) {
      const bw = Math.max(2 * dpr, W * crt.sx), bh = clamp(H * crt.sy, 1.5 * dpr, 3 * dpr);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = crt.beam * 0.9;
      ctx.fillStyle = WHITE;
      ctx.shadowColor = WHITE; ctx.shadowBlur = 10 * dpr;
      ctx.fillRect(W / 2 - bw / 2, H / 2 - bh / 2, bw, bh);
      ctx.restore();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();