function mount(root, o) {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wrap = root.querySelector(".ef-rpg__wrap");
  var cv = root.querySelector(".ef-rpg__cv");
  var txt = root.querySelector(".ef-rpg__txt");
  var ctx = cv.getContext("2d");
  var opts = {},
    W = 0,
    H = 0,
    dpr = 1,
    raf = 0,
    visible = true,
    dead = false;
  var ripples = [],
    last = 0,
    lastSpawn = { x: -999, y: -999, t: 0 };
  var BASE = [10, 76, 54],
    MID = [47, 125, 91],
    LIME = [198, 242, 107],
    CREAM = [251, 248, 241];

  function hex(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.replace(/(.)/g, "$1$1");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t
    ];
  }
  function size() {
    var r = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
  }
  function spawn(x, y, amp, now) {
    ripples.push({ x: x, y: y, t: now, a: amp });
    if (ripples.length > 14) ripples.shift();
  }

  function render(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#0c1e18";
    ctx.fillRect(0, 0, W, H);
    var cs = opts.cell,
      cols = Math.ceil(W / cs) + 1,
      rows = Math.ceil(H / cs) + 1;
    var ox = (W - (cols - 1) * cs) / 2,
      oy = (H - (rows - 1) * cs) / 2;
    var acc = hex(opts.accent),
      sp = 260 * opts.speed,
      wid = cs * 2.2,
      life = 1.9 / Math.max(0.5, opts.speed * 0.8);
    var live = [];
    for (var k = 0; k < ripples.length; k++) {
      var age = (now - ripples[k].t) / 1000;
      if (age < life)
        live.push({
          x: ripples[k].x,
          y: ripples[k].y,
          r: age * sp,
          f: Math.pow(1 - age / life, 1.5) * ripples[k].a * opts.strength
        });
    }
    if (!reduce)
      ripples = ripples.filter(function (r) {
        return (now - r.t) / 1000 < life;
      });
    var sq = opts.shape === "squares";
    for (var j = 0; j < rows; j++)
      for (var i = 0; i < cols; i++) {
        var x = ox + i * cs,
          y = oy + j * cs,
          w = 0;
        for (var m = 0; m < live.length; m++) {
          var p = live[m],
            dx = x - p.x,
            dy = y - p.y,
            d = Math.sqrt(dx * dx + dy * dy) - p.r;
          w += p.f * Math.exp(-(d * d) / (wid * wid));
        }
        if (w > 1.4) w = 1.4;
        var col =
          w < 0.6
            ? mix(BASE, MID, w / 0.6)
            : mix(
                mix(MID, acc, Math.min(1, (w - 0.6) / 0.4)),
                CREAM,
                Math.max(0, (w - 1) / 0.4) * 0.8
              );
        var rad = cs * (0.12 + w * 0.3);
        ctx.fillStyle =
          "rgb(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + ")";
        if (sq) {
          ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, 6.2832);
          ctx.fill();
        }
      }
    return live.length;
  }
  function frame(now) {
    raf = 0;
    if (dead || !visible) return;
    render(now);
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!raf && !reduce && !dead && visible) raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  function still() {
    if (!reduce) return;
    // one frozen frame: a ripple caught mid-flight near the centre
    var t = performance.now();
    ripples = [
      { x: W * 0.42, y: H * 0.45, t: t - 700, a: 1 },
      { x: W * 0.72, y: H * 0.7, t: t - 1100, a: 0.8 }
    ];
    render(t);
    ripples = [];
  }

  function pos(e) {
    var r = wrap.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function onMove(e) {
    if (reduce) return;
    var p = pos(e),
      now = performance.now();
    var d = Math.hypot(p.x - lastSpawn.x, p.y - lastSpawn.y);
    if (d > opts.cell * 1.6 && now - lastSpawn.t > 60) {
      spawn(p.x, p.y, 0.55, now);
      lastSpawn = { x: p.x, y: p.y, t: now };
    }
  }
  function onDown(e) {
    if (reduce) return;
    var p = pos(e);
    spawn(p.x, p.y, 1.5, performance.now());
  }

  var io = new IntersectionObserver(function (es) {
    visible = es[0].isIntersecting;
    if (visible) start();
    else stop();
  });
  var ro = new ResizeObserver(function () {
    size();
    still();
  });
  cv.addEventListener("pointermove", onMove);
  cv.addEventListener("pointerdown", onDown);
  io.observe(wrap);
  ro.observe(wrap);

  function update(next) {
    opts = Object.assign(
      {
        text: "Move, click, ripple",
        cell: 24,
        shape: "dots",
        speed: 1,
        strength: 1,
        accent: "#e6ff55"
      },
      opts,
      next || {}
    );
    opts.cell = Math.max(14, Math.min(48, +opts.cell));
    opts.speed = Math.max(0.4, Math.min(2, +opts.speed));
    opts.strength = Math.max(0.3, Math.min(1.5, +opts.strength));
    txt.textContent = opts.text;
    size();
    if (reduce) still();
    else if (!raf) render(performance.now());
  }
  update(o);
  if (!reduce) spawn(W * 0.5, H * 0.5, 1.2, performance.now());
  start();
  return {
    update: update,
    destroy: function () {
      dead = true;
      stop();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerdown", onDown);
      io.disconnect();
      ro.disconnect();
      ripples = [];
    }
  };
}

var enrichr = mount(document.getElementById("enrichr-root"), {
  text: "Move, click, ripple",
  shape: "dots",
  cell: 24,
  speed: 1,
  accent: "#e6ff55"
});