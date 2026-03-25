new p5(function (p) {
  const CANVAS_W = 680;
  const CANVAS_H = 420;
  const BG_COLOR = [238, 235, 230];

  // ── Ribbon geometry ───────────────────────────────────────────────────
  const SEGMENTS = 400; // number of quads along the ribbon
  const RIBBON_HALF_W = 14; // half-width at full face-on twist (px)
  const RIBBON_X_SCALE = 1.4; // horizontal overscan so ribbon fills edge-to-edge
  const RIBBON_X_OFFSET = 0.2; // fraction of W to shift path left (starts off-screen)

  // ── Wave / motion ─────────────────────────────────────────────────────
  const WAVE_SPEED = 0.018; // t increment per frame
  const WAVE1_FREQ = 3.5; // spatial frequency of primary wave (in π)
  const WAVE1_TIME_SPEED = 0.7; // how fast the primary wave moves over time
  const WAVE1_AMP = 110; // amplitude of primary wave (px)
  const WAVE2_FREQ = 7.0; // spatial frequency of secondary wave (in π)
  const WAVE2_TIME_SPEED = 1.1; // how fast the secondary wave moves over time
  const WAVE2_AMP = 30; // amplitude of secondary wave (px)

  // ── Twist ─────────────────────────────────────────────────────────────
  const TWIST_CYCLES = 6; // full rotations along the ribbon length (in π)
  const TWIST_TIME_SPEED = 0.5; // how fast the twist phase advances over time

  // ── Color palette ─────────────────────────────────────────────────────
  const COLOR_FACE = [255, 60, 10]; // orange-red  — visible on flat face
  const COLOR_FOLD_A = [180, 255, 0]; // neon yellow-green
  const COLOR_FOLD_B = [60, 80, 255]; // electric blue
  const COLOR_FOLD_C = [0, 220, 255]; // neon cyan

  const COLOR_CYCLE_FREQ = 2.0; // fold color cycles along ribbon length
  const COLOR_CYCLE_SPEED = 0.3; // how fast the fold color cycle drifts over time
  const FACE_BLEND_GAMMA = 1.2; // gamma on |twist| for face/fold blend (>1 = sharper edge)

  // ── Shadow ────────────────────────────────────────────────────────────
  const SHADOW_COLOR = [80, 60, 40];
  const SHADOW_ALPHA = 14;
  const SHADOW_OFFSET_X = 4;
  const SHADOW_OFFSET_Y = 7;

  // ── Edge lines ────────────────────────────────────────────────────────
  const EDGE_MIN_TWIST = 0.08; // |twist| threshold below which edges are skipped
  const EDGE_COLOR = [0, 0, 0];
  const EDGE_ALPHA = 22;
  const EDGE_WEIGHT = 0.5;

  // ─────────────────────────────────────────────────────────────────────

  let t = 0;

  function lerpColor(a, b, f) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * f),
      Math.round(a[1] + (b[1] - a[1]) * f),
      Math.round(a[2] + (b[2] - a[2]) * f)
    ];
  }

  function buildSpine(time) {
    const pts = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const progress = i / SEGMENTS;
      pts.push({
        x: progress * CANVAS_W * RIBBON_X_SCALE - CANVAS_W * RIBBON_X_OFFSET,
        y:
          CANVAS_H / 2 +
          Math.sin(progress * Math.PI * WAVE1_FREQ + time * WAVE1_TIME_SPEED) *
            WAVE1_AMP +
          Math.sin(progress * Math.PI * WAVE2_FREQ + time * WAVE2_TIME_SPEED) *
            WAVE2_AMP
      });
    }
    return pts;
  }

  function buildNormals(pts) {
    const last = pts.length - 1;
    return pts.map((_, i) => {
      const dx =
        i === 0
          ? pts[1].x - pts[0].x
          : i === last
          ? pts[last].x - pts[last - 1].x
          : pts[i + 1].x - pts[i - 1].x;
      const dy =
        i === 0
          ? pts[1].y - pts[0].y
          : i === last
          ? pts[last].y - pts[last - 1].y
          : pts[i + 1].y - pts[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      return { nx: -dy / len, ny: dx / len };
    });
  }

  function buildEdges(pts, normals, time) {
    const tops = [],
      bots = [],
      twists = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const twist = Math.cos(
        (i / SEGMENTS) * Math.PI * TWIST_CYCLES + time * TWIST_TIME_SPEED
      );
      const w = RIBBON_HALF_W * Math.abs(twist);
      const sign = twist >= 0 ? 1 : -1;
      twists.push(twist);
      tops.push({
        x: pts[i].x + normals[i].nx * w * sign,
        y: pts[i].y + normals[i].ny * w * sign
      });
      bots.push({
        x: pts[i].x - normals[i].nx * w * sign,
        y: pts[i].y - normals[i].ny * w * sign
      });
    }
    return { tops, bots, twists };
  }

  function getFoldColor(frac, time) {
    const cycle =
      (((frac * COLOR_CYCLE_FREQ + time * COLOR_CYCLE_SPEED) % 1) + 1) % 1;
    if (cycle < 1 / 3) return lerpColor(COLOR_FOLD_A, COLOR_FOLD_B, cycle * 3);
    if (cycle < 2 / 3)
      return lerpColor(COLOR_FOLD_B, COLOR_FOLD_C, (cycle - 1 / 3) * 3);
    return lerpColor(COLOR_FOLD_C, COLOR_FOLD_A, (cycle - 2 / 3) * 3);
  }

  function getRibbonColor(frac, twist, time) {
    const foldColor = getFoldColor(frac, time);
    const facedness = Math.pow(Math.abs(twist), FACE_BLEND_GAMMA);
    return lerpColor(foldColor, COLOR_FACE, facedness);
  }

  function drawQuad(ax, ay, bx, by, cx, cy, dx, dy) {
    p.beginShape();
    p.vertex(ax, ay);
    p.vertex(bx, by);
    p.vertex(cx, cy);
    p.vertex(dx, dy);
    p.endShape(p.CLOSE);
  }

  function drawShadow(tops, bots) {
    p.noStroke();
    p.fill(...SHADOW_COLOR, SHADOW_ALPHA);
    for (let i = 0; i < SEGMENTS; i++) {
      drawQuad(
        tops[i].x + SHADOW_OFFSET_X,
        tops[i].y + SHADOW_OFFSET_Y,
        tops[i + 1].x + SHADOW_OFFSET_X,
        tops[i + 1].y + SHADOW_OFFSET_Y,
        bots[i + 1].x + SHADOW_OFFSET_X,
        bots[i + 1].y + SHADOW_OFFSET_Y,
        bots[i].x + SHADOW_OFFSET_X,
        bots[i].y + SHADOW_OFFSET_Y
      );
    }
  }

  function drawRibbon(tops, bots, twists, time) {
    for (let i = 0; i < SEGMENTS; i++) {
      const [r, g, b] = getRibbonColor(i / SEGMENTS, twists[i], time);
      p.fill(r, g, b);
      p.noStroke();
      drawQuad(
        tops[i].x,
        tops[i].y,
        tops[i + 1].x,
        tops[i + 1].y,
        bots[i + 1].x,
        bots[i + 1].y,
        bots[i].x,
        bots[i].y
      );

      if (Math.abs(twists[i]) > EDGE_MIN_TWIST) {
        p.stroke(...EDGE_COLOR, EDGE_ALPHA);
        p.strokeWeight(EDGE_WEIGHT);
        p.line(tops[i].x, tops[i].y, tops[i + 1].x, tops[i + 1].y);
        p.line(bots[i].x, bots[i].y, bots[i + 1].x, bots[i + 1].y);
        p.noStroke();
      }
    }
  }

  p.setup = function () {
    const cvs = p.createCanvas(CANVAS_W, CANVAS_H);
    cvs.parent("container");
    cvs.elt.style.cssText = "display:block;width:100%;height:100%;";
    p.smooth();
  };

  p.draw = function () {
    p.background(...BG_COLOR);
    t += WAVE_SPEED;

    const pts = buildSpine(t);
    const normals = buildNormals(pts);
    const { tops, bots, twists } = buildEdges(pts, normals, t);

    drawShadow(tops, bots);
    drawRibbon(tops, bots, twists, t);
  };
}, "container");
