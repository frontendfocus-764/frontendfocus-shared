function mount(root, o) {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wrap = root.querySelector(".ef-tw");
  var canvas = root.querySelector(".ef-tw__c");
  var ctx = canvas.getContext("2d");
  var opts = {}, raf = 0, visible = true, io = null, ro = null, destroyed = false, last = 0, t = 0;
  var W = 1, H = 1, dpr = 1, n = 0, X, Y, PX, PY, AGE, KIND, seed = 90211;
  var mx = -9999, my = -9999, hasPtr = false, bg = [12, 30, 24], acc = [230, 255, 85];
  var PAL = [[10, 107, 70], [47, 125, 91], [198, 242, 107], [251, 248, 241]];

  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function rgb(h, d) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ""); var v = parseInt(m ? m[1] : d, 16); return [v >> 16, (v >> 8) & 255, v & 255]; }
  function hash(i, j) { var h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function noise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, wrap.clientWidth); H = Math.max(1, wrap.clientHeight);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fillBg(1);
    for (var i = 0; i < n; i++) respawn(i, true);
  }
  function fillBg(a) { ctx.fillStyle = "rgba(" + bg[0] + "," + bg[1] + "," + bg[2] + "," + a + ")"; ctx.fillRect(0, 0, W, H); }
  function respawn(i, anywhere) {
    if (anywhere) { X[i] = rnd() * W; Y[i] = rnd() * H; }
    else if (KIND[i] % 2 === 0) { X[i] = rnd() < 0.5 ? -2 : W + 2; Y[i] = rnd() * H; }
    else { X[i] = rnd() * W; Y[i] = rnd() < 0.5 ? -2 : H + 2; }
    PX[i] = X[i]; PY[i] = Y[i]; AGE[i] = rnd() * 400;
  }
  function populate() {
    if (n === opts.threads && X) return;
    n = opts.threads;
    X = new Float32Array(n); Y = new Float32Array(n); PX = new Float32Array(n); PY = new Float32Array(n); AGE = new Float32Array(n); KIND = new Uint8Array(n);
    for (var i = 0; i < n; i++) { KIND[i] = (rnd() * 8) | 0; respawn(i, true); }
  }
  function step(dt) {
    var sp = opts.speed * 80, tb = opts.turbulence, sc = 0.0032 * (0.6 + tb * 0.5), tt = t * 0.06;
    var pr = Math.max(60, Math.min(W, H) * 0.22), pr2 = pr * pr;
    for (var i = 0; i < n; i++) {
      var warp = KIND[i] % 2 === 0;
      var a = noise(X[i] * sc + tt, Y[i] * sc - tt) * 6.2832 * tb;
      if (!warp) a += 1.5708 + noise(Y[i] * sc * 1.6, X[i] * sc * 1.6 + tt) * 1.4;
      var vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
      if (hasPtr) {
        var dx = X[i] - mx, dy = Y[i] - my, d2 = dx * dx + dy * dy;
        if (d2 < pr2 && d2 > 1) { var d = Math.sqrt(d2), p = (1 - d / pr); vx += dx / d * p * 150; vy += dy / d * p * 150; }
      }
      PX[i] = X[i]; PY[i] = Y[i];
      X[i] += vx * dt; Y[i] += vy * dt; AGE[i] += 1;
      if (X[i] < -6 || X[i] > W + 6 || Y[i] < -6 || Y[i] > H + 6 || AGE[i] > 700) respawn(i, false);
    }
  }
  function draw() {
    ctx.lineWidth = 1.4; ctx.lineCap = "round";
    for (var c = 0; c < 4; c++) {
      var col = c === 2 ? acc : PAL[c];
      ctx.strokeStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + (c === 3 ? 0.7 : c === 2 ? 0.95 : 0.9) + ")";
      ctx.beginPath();
      for (var i = 0; i < n; i++) {
        if ((KIND[i] >> 1) % 4 !== c) continue;
        var dx = X[i] - PX[i], dy = Y[i] - PY[i];
        if (dx * dx + dy * dy > 900) continue; // skip respawn jumps
        ctx.moveTo(PX[i], PY[i]); ctx.lineTo(X[i], Y[i]);
      }
      ctx.stroke();
    }
  }
  function tick(dt) {
    fillBg(0.015 + (1 - opts.trail) * 0.2);
    step(dt); draw();
  }
  function frame(now) {
    raf = 0;
    if (destroyed || !visible) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now; t += dt * opts.speed;
    tick(dt);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!reduce && !raf && visible && !destroyed) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function still() {
    fillBg(1);
    var keep = opts.trail; opts.trail = 0.9;
    for (var k = 0; k < 260; k++) { t += 0.016; tick(0.016); }
    opts.trail = keep;
  }
  function mv(e) { var r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; hasPtr = true; }
  function lv() { hasPtr = false; mx = my = -9999; }
  var prevTh = -1;
  function update(next) {
    opts = Object.assign({ background: "#0c1e18", accent: "#e6ff55", threads: 110, trail: 0.8, speed: 1, turbulence: 1.2, pieces: "on" }, opts, next || {});
    opts.threads = Math.max(20, Math.min(200, Math.round(opts.threads)));
    opts.trail = Math.max(0, Math.min(1, +opts.trail));
    bg = rgb(opts.background, "0c1e18"); acc = rgb(opts.accent, "e6ff55");
    wrap.style.background = opts.background;
    wrap.classList.toggle("no-pieces", String(opts.pieces) === "off");
    populate();
    if (reduce) still(); else { if (prevTh !== opts.threads) fillBg(1); start(); }
    prevTh = opts.threads;
  }
  opts = { background: "#0c1e18", accent: "#e6ff55", threads: 110, trail: 0.8, speed: 1, turbulence: 1.2, pieces: "on" };
  size();
  update(o);
  canvas.addEventListener("pointermove", mv);
  canvas.addEventListener("pointerleave", lv);
  if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(function () { size(); if (reduce) still(); }); ro.observe(wrap); }
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); else stop(); });
    io.observe(wrap);
  }
  return {
    update: update,
    destroy: function () {
      destroyed = true; stop();
      canvas.removeEventListener("pointermove", mv); canvas.removeEventListener("pointerleave", lv);
      if (ro) ro.disconnect(); if (io) io.disconnect();
    }
  };
}

var enrichr = mount(document.getElementById("enrichr-root"), {
  "accent": "#e6ff55",
  "threads": 110,
  "trail": 0.8,
  "speed": 1
});