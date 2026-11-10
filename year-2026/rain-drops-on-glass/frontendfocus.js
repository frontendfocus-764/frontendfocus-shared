function mount(root, o) {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wrap = root.querySelector(".ef-rwd__wrap");
  var cv = root.querySelector(".ef-rwd__cv");
  var ctx = cv.getContext("2d");
  var shapes = Array.prototype.map.call(
    root.querySelectorAll(".ef-rwd__src path"),
    function (p) {
      var vb = p.getAttribute("data-vb").split(/\s+/).map(Number);
      return {
        p: new Path2D(p.getAttribute("d")),
        x: vb[0],
        y: vb[1],
        w: vb[2],
        h: vb[3]
      };
    }
  );
  var opts = {},
    W = 0,
    H = 0,
    S = 1,
    last = 0,
    raf = 0,
    vis = true,
    dead = false,
    acc = 0,
    offs = [];
  var sharp = document.createElement("canvas"),
    soft = document.createElement("canvas");
  var statics = [],
    runners = [];
  var MAXSTATIC = 260;

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  function piece(g, s, cx, cy, size, rot, col, al) {
    g.save();
    g.translate(cx, cy);
    g.rotate(rot);
    var k = size / Math.max(s.w, s.h);
    g.scale(k, k);
    g.translate(-(s.x + s.w / 2), -(s.y + s.h / 2));
    g.globalAlpha = al;
    g.fillStyle = col;
    g.fill(s.p);
    g.restore();
  }
  function buildScene() {
    if (!W || !H) return;
    sharp.width = Math.round(W * S);
    sharp.height = Math.round(H * S);
    var g = sharp.getContext("2d"),
      m = Math.min(W, H);
    g.setTransform(S, 0, 0, S, 0, 0);
    var bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, opts.background);
    bg.addColorStop(0.55, "#005236");
    bg.addColorStop(1, "#0a6b46");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    function blob(x, y, r, col, a) {
      var rg = g.createRadialGradient(x * W, y * H, 0, x * W, y * H, r * m);
      rg.addColorStop(0, col);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha = a;
      g.fillStyle = rg;
      g.fillRect(0, 0, W, H);
      g.globalAlpha = 1;
    }
    blob(0.78, 0.22, 0.55, opts.accent, 0.6);
    blob(0.18, 0.82, 0.5, "#c6f26b", 0.38);
    blob(0.5, 0.55, 0.45, "#2f7d5b", 0.5);
    if (shapes.length === 3) {
      piece(g, shapes[0], W * 0.2, H * 0.3, m * 0.3, -0.22, opts.accent, 0.95);
      piece(g, shapes[1], W * 0.66, H * 0.74, m * 0.5, 0.12, "#fbf8f1", 0.9);
      piece(g, shapes[2], W * 0.86, H * 0.3, m * 0.34, 0.25, "#c6f26b", 0.9);
      piece(g, shapes[0], W * 0.38, H * 0.82, m * 0.18, 0.5, "#2f7d5b", 0.95);
      piece(g, shapes[2], W * 0.1, H * 0.7, m * 0.22, -0.3, "#fbf8f1", 0.8);
    }
    var div = Math.max(2, opts.blur),
      bw = Math.ceil(W / div),
      bh = Math.ceil(H / div);
    var tmp = document.createElement("canvas");
    tmp.width = bw;
    tmp.height = bh;
    var tg = tmp.getContext("2d");
    tg.imageSmoothingQuality = "high";
    tg.drawImage(sharp, 0, 0, bw, bh);
    soft.width = bw;
    soft.height = bh;
    var sg = soft.getContext("2d");
    sg.imageSmoothingQuality = "high";
    if ("filter" in sg) sg.filter = "blur(2px)";
    sg.drawImage(tmp, 0, 0);
  }
  function seed() {
    statics = [];
    runners = [];
    var n = Math.min(MAXSTATIC - 40, Math.round((W * H) / 3000));
    for (var i = 0; i < n; i++)
      statics.push({
        x: rnd(0, W),
        y: rnd(0, H),
        r: Math.pow(Math.random(), 1.9) * 7 + 1.6,
        life: -1
      });
    for (var j = 0; j < 4; j++)
      spawn(rnd(0.1, 0.9) * W, rnd(0.05, 0.6) * H, rnd(11, 16));
  }
  function spawn(x, y, r) {
    if (runners.length > 14) runners.shift();
    runners.push({
      x: x,
      y: y,
      r: r * opts.size,
      vy: rnd(30, 60),
      mode: 1,
      tm: rnd(0.3, 0.9),
      dist: 0,
      trail: [],
      ph: rnd(0, 6)
    });
  }
  function step(dt) {
    acc += dt * opts.rain;
    while (acc >= 1) {
      acc -= 1;
      spawn(rnd(0.04, 0.96) * W, rnd(-0.02, 0.5) * H, rnd(9, 15));
    }
    for (var i = runners.length - 1; i >= 0; i--) {
      var d = runners[i];
      d.tm -= dt;
      if (d.tm <= 0) {
        d.mode = d.mode ? 0 : 1;
        d.tm = d.mode ? rnd(0.35, 1) : rnd(0.12, 0.5);
      }
      var top = 34 + d.r * 12;
      d.vy += ((d.mode ? top : 4) - d.vy) * Math.min(1, dt * 5);
      var mvY = d.vy * dt;
      d.y += mvY;
      d.x += Math.sin(d.y * 0.04 + d.ph) * 4 * dt;
      d.dist += mvY;
      d.trail.push({ x: d.x, y: d.y, a: 1 });
      for (var k = d.trail.length - 1; k >= 0; k--) {
        d.trail[k].a -= dt * 0.45;
        if (d.trail[k].a <= 0) {
          d.trail.splice(0, k + 1);
          break;
        }
      }
      if (d.dist > d.r * 1.7 + 8) {
        d.dist = 0;
        if (statics.length < MAXSTATIC)
          statics.push({
            x: d.x + rnd(-1, 1),
            y: d.y - d.r,
            r: Math.max(1.2, (d.r * rnd(0.14, 0.24)) / opts.size),
            life: 12 + Math.random() * 6
          });
        d.r = Math.max(2, d.r * 0.985);
      }
      for (var s = statics.length - 1; s >= 0; s--) {
        var q = statics[s],
          dx = q.x - d.x,
          dy = q.y - d.y,
          rr = q.r * opts.size;
        if (dx * dx + dy * dy < Math.pow(d.r + rr * 0.5, 2) && rr < d.r * 0.8) {
          d.r = Math.min(22 * opts.size, Math.sqrt(d.r * d.r + rr * rr * 0.5));
          statics.splice(s, 1);
        }
      }
      if (d.y - d.r > H || d.r < 2.2) runners.splice(i, 1);
    }
    for (var j = statics.length - 1; j >= 0; j--) {
      var st = statics[j];
      if (st.life >= 0) {
        st.life -= dt;
        if (st.life <= 0) statics.splice(j, 1);
      }
    }
  }
  function drop(x, y, r, tall, fade) {
    var rx = r * 0.9,
      ry = r * (tall ? 1.18 : 1);
    ctx.save();
    ctx.globalAlpha = fade;
    if (r > 3.4) {
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832);
      ctx.clip();
      var kk = 1 + opts.refraction * 2.2,
        sw = 2 * rx * kk,
        sh = 2 * ry * kk;
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.drawImage(
        sharp,
        (x - sw / 2) * S,
        (y - sh / 2) * S,
        sw * S,
        sh * S,
        -rx,
        -ry,
        2 * rx,
        2 * ry
      );
      ctx.rotate(-Math.PI);
      ctx.translate(-x, -y);
    }
    var gr = ctx.createRadialGradient(
      x,
      y - ry * 0.15,
      ry * 0.2,
      x,
      y,
      ry * 1.05
    );
    gr.addColorStop(0, "rgba(12,30,24,0)");
    gr.addColorStop(0.75, "rgba(12,30,24," + (r > 3.4 ? 0.12 : 0.34) + ")");
    gr.addColorStop(1, "rgba(12,30,24,0.62)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832);
    ctx.fill();
    var lg = ctx.createRadialGradient(
      x,
      y + ry * 0.55,
      0,
      x,
      y + ry * 0.55,
      ry * 0.8
    );
    lg.addColorStop(0, "rgba(198,242,107,0.34)");
    lg.addColorStop(1, "rgba(198,242,107,0)");
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = "rgba(251,248,241,0.88)";
    ctx.beginPath();
    ctx.ellipse(
      x - rx * 0.36,
      y - ry * 0.42,
      rx * 0.2,
      ry * 0.12,
      -0.6,
      0,
      6.2832
    );
    ctx.fill();
    ctx.fillStyle = "rgba(251,248,241,0.28)";
    ctx.beginPath();
    ctx.ellipse(
      x + rx * 0.3,
      y + ry * 0.55,
      rx * 0.2,
      ry * 0.07,
      -0.5,
      0,
      6.2832
    );
    ctx.fill();
    ctx.restore();
  }
  function draw() {
    if (!W || !H) return;
    ctx.setTransform(S, 0, 0, S, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(soft, 0, 0, W, H);
    var veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0, "rgba(251,248,241,0.06)");
    veil.addColorStop(1, "rgba(12,30,24,0.14)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);
    var i, k;
    ctx.lineCap = "round";
    for (i = 0; i < runners.length; i++) {
      var d = runners[i],
        tr = d.trail;
      for (k = 1; k < tr.length; k++) {
        ctx.strokeStyle =
          "rgba(251,248,241," + (0.1 * tr[k].a).toFixed(3) + ")";
        ctx.lineWidth = Math.max(1, d.r * 0.55 * (0.4 + 0.6 * tr[k].a));
        ctx.beginPath();
        ctx.moveTo(tr[k - 1].x, tr[k - 1].y);
        ctx.lineTo(tr[k].x, tr[k].y);
        ctx.stroke();
      }
    }
    for (i = 0; i < statics.length; i++) {
      var s = statics[i],
        f = s.life >= 0 && s.life < 2 ? s.life / 2 : 1;
      drop(s.x, s.y, s.r * opts.size, false, f);
    }
    for (i = 0; i < runners.length; i++)
      drop(runners[i].x, runners[i].y, runners[i].r, true, 1);
  }
  function size() {
    var r = wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    W = r.width;
    H = r.height;
    S = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.round(W * S);
    cv.height = Math.round(H * S);
    buildScene();
    seed();
    if (reduce) still();
    else draw();
  }
  function still() {
    for (var i = 0; i < 90; i++) step(1 / 30);
    draw();
  }
  function frame(ts) {
    raf = 0;
    if (!vis || dead) return;
    var dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    step(dt);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (reduce || raf || !vis || dead) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function down(e) {
    var r = wrap.getBoundingClientRect();
    var x = e.clientX - r.left,
      y = e.clientY - r.top;
    if (reduce) {
      statics.push({ x: x, y: y, r: rnd(7, 10), life: -1 });
      draw();
      return;
    }
    spawn(x, y, rnd(13, 18));
  }
  wrap.addEventListener("pointerdown", down);
  offs.push(function () {
    wrap.removeEventListener("pointerdown", down);
  });
  var ro = null,
    io = null;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(size);
    ro.observe(wrap);
  } else {
    window.addEventListener("resize", size);
    offs.push(function () {
      window.removeEventListener("resize", size);
    });
  }
  if (window.IntersectionObserver) {
    io = new IntersectionObserver(function (en) {
      vis = en[en.length - 1].isIntersecting;
      if (vis) start();
      else stop();
    });
    io.observe(wrap);
  }
  function update(next) {
    var prev = opts;
    opts = Object.assign(
      {
        background: "#0c1e18",
        accent: "#e6ff55",
        rain: 1.6,
        size: 1,
        refraction: 0.6,
        blur: 8
      },
      opts,
      next || {}
    );
    opts.blur = Math.max(4, Math.min(16, opts.blur));
    wrap.style.background = opts.background;
    if (
      prev.accent !== opts.accent ||
      prev.blur !== opts.blur ||
      prev.background !== opts.background
    ) {
      buildScene();
      if (reduce) draw();
    } else if (reduce) draw();
    if (!prev.rain && prev.rain !== 0) {
      size();
    }
    start();
  }
  update(o);
  return {
    update: update,
    destroy: function () {
      dead = true;
      stop();
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      offs.forEach(function (f) {
        f();
      });
      offs = [];
    }
  };
}

var enrichr = mount(document.getElementById("enrichr-root"), {
  accent: "#e6ff55",
  rain: 1.6,
  size: 1,
  refraction: 0.6,
  blur: 8
});