(function () {
  'use strict';

  const toggle     = document.getElementById('toggle');
  const track      = document.getElementById('track');
  const knob       = document.getElementById('knob');
  const knobBody   = document.getElementById('knobBody');
  const ballShadow = document.getElementById('ballShadow');

  const R           = 31;
  const INSET       = 7;
  const GRAVITY     = 2400;
  const BOUNCE      = 0.72;
  const WALL_BOUNCE = 0.78;
  const FIXED_DT    = 1 / 240;

  let isOn      = false;
  let mode      = 'idle';
  let x = 0, y = 0;
  let vx = 0, vy = 0;
  let targetX = 0, targetY = 0;
  let bounces = 0, elapsed = 0, returnTime = 0;
  let nextState = false;

  let lastTime = 0, acc = 0;

  function restPositions() {
    const r  = track.getBoundingClientRect();
    const cy = r.top + r.height / 2;
    return {
      off: { x: r.left  + INSET + R, y: cy },
      on : { x: r.right - INSET - R, y: cy }
    };
  }

  function currentRest() {
    const p = restPositions();
    return isOn ? p.on : p.off;
  }

  function render() {
    knob.style.transform =
      'translate3d(' + (x - R).toFixed(2) + 'px,' + (y - R).toFixed(2) + 'px,0)';

    const H     = window.innerHeight;
    const floor = H - 4;
    const h     = Math.max(0, floor - (y + R));
    const t     = Math.min(1, h / 420);
    const s     = 1 - 0.45 * t;

    ballShadow.style.transform =
      'translate3d(' + (x - R).toFixed(2) + 'px,' + (floor - R).toFixed(2) + 'px,0) ' +
      'scale(' + s.toFixed(3) + ',' + (s * 0.3).toFixed(3) + ')';
    ballShadow.style.opacity = (0.62 - 0.55 * t).toFixed(3);
  }

  function step(dt) {
    if (mode === 'falling') {
      elapsed += dt;
      vy += GRAVITY * dt;
      x  += vx * dt;
      y  += vy * dt;

      const W = window.innerWidth;
      const H = window.innerHeight;

      if (y + R > H) {
        y = H - R;
        if (vy > 0) {
          vy = -vy * BOUNCE;
          vx *= 0.985;
          bounces++;
        }
      }
      if (y - R < 0) {
        y = R;
        if (vy < 0) vy = -vy * BOUNCE;
      }
      if (x - R < 0) {
        x = R;
        if (vx < 0) vx = -vx * WALL_BOUNCE;
      }
      if (x + R > W) {
        x = W - R;
        if (vx > 0) vx = -vx * WALL_BOUNCE;
      }

      if (bounces >= 5 || elapsed > 4.5) {
        mode = 'returning';
        returnTime = 0;
        const p   = restPositions();
        const tgt = nextState ? p.on : p.off;
        targetX = tgt.x;
        targetY = tgt.y;
      }

    } else if (mode === 'returning') {
      returnTime += dt;

      const K = 300;
      const C = 36;
      vx += ((targetX - x) * K - vx * C) * dt;
      vy += ((targetY - y) * K - vy * C) * dt;
      x  += vx * dt;
      y  += vy * dt;

      const dist  = Math.hypot(targetX - x, targetY - y);
      const speed = Math.hypot(vx, vy);

      if ((dist < 1 && speed < 200) || returnTime > 1.4) {
        x  = targetX;
        y  = targetY;
        vx = 0;
        vy = 0;
        mode = 'idle';

        isOn = nextState;
        toggle.classList.toggle('on', isOn);

        knobBody.classList.remove('land');
        void knobBody.offsetWidth;
        knobBody.classList.add('land');
      }
    }
  }

  function frame(now) {
    if (!lastTime) lastTime = now;
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.05) dt = 0.05;

    acc += dt;
    let guard = 0;
    while (acc >= FIXED_DT && guard < 40) {
      step(FIXED_DT);
      acc -= FIXED_DT;
      guard++;
    }

    render();

    if (mode === 'idle') {
      acc = 0;
      lastTime = 0;
    } else {
      requestAnimationFrame(frame);
    }
  }

  function launch() {
    if (mode !== 'idle') return;

    const p     = restPositions();
    const start = isOn ? p.on : p.off;

    x = start.x;
    y = start.y;

    const dir = isOn ? -1 : 1;
    vx = dir * (380 + Math.random() * 260);
    vy = 240;

    bounces    = 0;
    elapsed    = 0;
    returnTime = 0;
    nextState  = !isOn;
    mode       = 'falling';

    lastTime = 0;
    acc = 0;

    requestAnimationFrame(frame);
  }

  toggle.addEventListener('click', launch);

  window.addEventListener('resize', function () {
    if (mode === 'idle') {
      const p = currentRest();
      x = p.x;
      y = p.y;
      render();
    }
  });

  (function init() {
    const p = restPositions();
    x = p.off.x;
    y = p.off.y;
    render();
  })();

})();