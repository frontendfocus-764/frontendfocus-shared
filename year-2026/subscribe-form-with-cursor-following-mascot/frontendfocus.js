(function () {
  // ---------- Confetti loader + helpers ----------
  const confettiReady = import('https://esm.sh/canvas-confetti')
    .then(m => m.default)
    .catch(() => null);

  function burstAtElement(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confettiReady.then(c => {
      if (!c) return;
      // Two quick bursts from the element center
      c({ particleCount: 90, spread: 70, startVelocity: 40, origin: { x, y } });
      c({ particleCount: 50, spread: 100, startVelocity: 25, decay: 0.9, scalar: 0.9, origin: { x, y } });
    });
  }

  // ---------- Your existing code ----------
  function init() {
    // ---------- Element refs ----------
    const emailInput = document.getElementById('email');
    const track = document.getElementById('track');
    const chloe = document.getElementById('chloe');
    const leftEye = document.getElementById('eyeball-left');
    const rightEye = document.getElementById('eyeball-right');

    // Face/SVG references
    const faceSvg = document.querySelector('.mask svg');
    const mouthPath = faceSvg?.querySelector('.mouth'); // original mouth path

    // Curved error text (present in HTML) – target the <textPath>
    const errorTextEl = document.querySelector('.error-message textPath');
    if (errorTextEl) {
      errorTextEl.setAttribute('href', '#curve');
      errorTextEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#curve');
    }

    const shell = document.querySelector('.subscribe-outer');
    const form = document.querySelector('.subscribe');
    const successBox = document.querySelector('.subscribe_success'); // green pill

    // Make the success <div> behave like a button (click + keyboard)
    if (successBox) {
      successBox.setAttribute('role', 'button');
      successBox.setAttribute('tabindex', '0');
      successBox.style.cursor = 'pointer';
      successBox.addEventListener('click', () => burstAtElement(successBox));
      successBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          burstAtElement(successBox);
        }
      });
    }

    // ---------- Geometry / behavior constants ----------
    const EYE_TOP_FROM_CHLOE = 95; // px from .chloe top to eyeball top
    const EYE_RADIUS = 22;         // eyeball SVG is 44x44
    const LEFT_BASE_X = -40;
    const RIGHT_BASE_X = 40;

    const maxMoveX = 16;     // pupil range X
    const maxMoveY = 20;     // pupil range Y
    const sensitivity = 400; // lower -> eyes move more
    const leftScaleX = 0.95; // subtle asymmetry
    const rightScaleX = 1.05;

    // Easing presets
    const EASE_SMOOTH = 'cubic-bezier(.22,.61,.36,1)';
    const EASE_BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';

    // Mouth ellipse vertical nudge
    const MOUTH_Y_OFFSET = 5;

    // ---------- Drag state ----------
    const state = {
      dragging: false,
      startPointerX: 0,
      startOffset: 0,
      offset: 0,
      prevOffset: 0,
      velocity: 0,      // px/ms
      lastTime: 0,
      maxOffset: 0
    };

    // ---------- Utils ----------
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    function rubberBand(over, limit = 120) {
      return limit * (1 - 1 / (over / limit + 1));
    }

    function computeMaxOffset() {
      const trackW = track.clientWidth;
      const chloeW = chloe.getBoundingClientRect().width; // ~232px
      state.maxOffset = Math.max(0, trackW - chloeW);
      setOffset(clamp(state.offset, 0, state.maxOffset), false);
    }

    function setOffset(px, smooth = true) {
      state.offset = px;
      if (!smooth) chloe.style.transition = 'none';
      chloe.style.setProperty('--chx', `${Math.round(px)}px`);
      if (!smooth) {
        chloe.getBoundingClientRect();
        chloe.style.transition = `transform 220ms ${EASE_SMOOTH}`;
      }
    }

    // ---------- Eye math ----------
    const measureCtx = document.createElement('canvas').getContext('2d');

    function getCaretPoint(input) {
      const rect = input.getBoundingClientRect();
      const cs = getComputedStyle(input);
      measureCtx.font = `${cs.fontWeight || 400} ${cs.fontSize || '16px'} ${cs.fontFamily || 'Arial,sans-serif'}`;

      const selStart = input.selectionStart ?? input.value.length;
      const before = input.value.slice(0, selStart);
      const w = measureCtx.measureText(before).width;

      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const innerW = rect.width - padL - padR;
      const xInside = Math.min(w, innerW) - input.scrollLeft;

      const x = rect.left + padL + Math.max(0, xInside);
      const y = rect.top + rect.height / 2;
      return { x, y };
    }

    function ellipseClamp(dx, dy, rx, ry) {
      const nx = dx / rx, ny = dy / ry;
      const d = Math.hypot(nx, ny);
      if (d <= 1 || d === 0) return [dx, dy];
      return [(nx / d) * rx, (ny / d) * ry];
    }

    function eyeCenters() {
      const r = chloe.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + EYE_TOP_FROM_CHLOE + EYE_RADIUS;
      return {
        left:  { x: cx + LEFT_BASE_X,  y: cy },
        right: { x: cx + RIGHT_BASE_X, y: cy }
      };
    }

    function lookAt(x, y) {
      const { left, right } = eyeCenters();

      function offset(ex, ey, multX = 1) {
        const dx = x - ex;
        const dy = y - ey;
        const dist = Math.hypot(dx, dy);
        const p = Math.min(1, dist / sensitivity);
        const ang = Math.atan2(dy, dx);
        let mx = Math.cos(ang) * maxMoveX * p * multX;
        let my = Math.sin(ang) * maxMoveY * p;
        [mx, my] = ellipseClamp(mx, my, maxMoveX, maxMoveY);
        return { mx, my };
      }

      const L = offset(left.x, left.y, leftScaleX);
      const R = offset(right.x, right.y, rightScaleX);

      leftEye.style.transform  =
        `translateX(-50%) translateX(${LEFT_BASE_X}px) translate(${L.mx}px, ${L.my}px)`;
      rightEye.style.transform =
        `translateX(-50%) translateX(${RIGHT_BASE_X}px) translate(${R.mx}px, ${R.my}px)`;
    }

    function neutralEyes() {
      leftEye.style.transform  = `translateX(-50%) translateX(${LEFT_BASE_X}px)`;
      rightEye.style.transform = `translateX(-50%) translateX(${RIGHT_BASE_X}px)`;
    }

    // ---------- Modes: caret vs pointer ----------
    let lastPointer = { x: null, y: null };
    const isFocused = () => document.activeElement === emailInput;

    function updateCaret() {
      if (!isFocused()) return;
      requestAnimationFrame(() => {
        const { x, y } = getCaretPoint(emailInput);
        lookAt(x, y);
      });
    }

    function updatePointer(e) {
      lastPointer = { x: e.clientX, y: e.clientY };
      if (isFocused()) return;
      lookAt(lastPointer.x, lastPointer.y);
    }

    // ---------- Drag logic with bounce ----------
    function onPointerDown(e) {
      e.preventDefault();
      chloe.classList.add('dragging');
      state.dragging = true;
      chloe.setPointerCapture?.(e.pointerId);

      chloe.style.transition = 'none';
      state.startPointerX = e.clientX;
      state.startOffset = state.offset;
      state.prevOffset = state.offset;
      state.velocity = 0;
      state.lastTime = performance.now();
    }

    function onPointerMove(e) {
      if (!state.dragging) return;

      const now = performance.now();
      const dt = Math.max(1, now - state.lastTime);
      const dx = e.clientX - state.startPointerX;

      // Rubber-band beyond edges
      let desired = state.startOffset + dx;
      if (desired < 0) {
        const over = -desired;
        desired = -rubberBand(over);
      } else if (desired > state.maxOffset) {
        const over = desired - state.maxOffset;
        desired = state.maxOffset + rubberBand(over);
      }

      state.velocity = (desired - state.prevOffset) / dt;
      state.prevOffset = desired;
      state.lastTime = now;

      setOffset(desired, true);
    }

    function onPointerUp(e) {
      if (!state.dragging) return;
      state.dragging = false;
      chloe.classList.remove('dragging');
      chloe.releasePointerCapture?.(e.pointerId);

      const current = state.offset;
      const clamped = clamp(current, 0, state.maxOffset);
      const distToClamp = Math.abs(current - clamped);

      if (current < 0 || current > state.maxOffset) {
        const dur = Math.min(600, 260 + distToClamp * 0.9);
        chloe.style.transition = `transform ${dur}ms ${EASE_BOUNCE}`;
        setOffset(clamped, true);
        return;
      }

      const inertia = state.velocity * 160; // px
      const projected = clamp(current + inertia, 0, state.maxOffset);
      const dur = Math.min(400, 180 + Math.abs(inertia) * 0.6);
      chloe.style.transition = `transform ${dur}ms ${EASE_SMOOTH}`;
      setOffset(projected, true);
    }

    // ---------- Email error UI (mouth swap + curved type-on) ----------
    const svgNS = 'http://www.w3.org/2000/svg';
    const originalMouthD = mouthPath?.getAttribute('d') || '';
    let mouthEllipse = null; // current <ellipse> if any
    let typingTimer = null;  // interval for type-on
    const errorMessage = document.querySelector('.error-message');

    function swapMouthToEllipse() {
      if (!faceSvg || !mouthPath) return;
      if (mouthEllipse) return;

      const b = mouthPath.getBBox();
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;

      const el = document.createElementNS(svgNS, 'ellipse');
      el.setAttribute('class', 'mouth mouth-o');
      el.setAttribute('cx', cx);
      el.setAttribute('cy', (cy + 5).toString());
      el.setAttribute('rx', '6');
      el.setAttribute('ry', '10');
      el.setAttribute('fill', '#BD00A9');

      mouthPath.style.display = 'none';
      faceSvg.appendChild(el);
      mouthEllipse = el;

      errorMessage?.classList.add('is-active');
    }

    function restoreMouth() {
      if (!mouthPath) return;
      if (mouthEllipse) {
        mouthEllipse.remove();
        mouthEllipse = null;
      }
      mouthPath.setAttribute('d', originalMouthD);
      mouthPath.style.display = '';
      errorMessage?.classList.remove('is-active');
    }

    function showErrorUI() {
      shell?.classList.add('has-error');
      swapMouthToEllipse();
    }

    function clearErrorUI() {
      shell?.classList.remove('has-error');
      clearInterval(typingTimer);
      if (errorTextEl) errorTextEl.textContent = '';
      restoreMouth();
    }

    // ---------- Wiring ----------
    chloe.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    ['input', 'click', 'keyup', 'keydown', 'mouseup'].forEach(evt =>
      emailInput.addEventListener(evt, updateCaret)
    );
    emailInput.addEventListener('focus', updateCaret);
    emailInput.addEventListener('blur', () => {
      if (lastPointer.x != null) lookAt(lastPointer.x, lastPointer.y);
      else neutralEyes();
    });

    document.addEventListener('pointermove', updatePointer);

    // Submit: show error UI if invalid, otherwise show success + confetti
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // handle locally
      const isValid = emailInput.checkValidity();

      if (!isValid) {
        showErrorUI();
        emailInput.focus();
        return;
      }

      clearErrorUI();
      shell.classList.add('success'); // CSS should display the green pill
      form.reset();
      emailInput.blur();

      // Fire confetti from the success pill
      burstAtElement(successBox);
    });

    // While typing: hide success pill and clear error once valid
    emailInput.addEventListener('input', () => {
      shell.classList.remove('success');
      if (emailInput.value.includes('@')) clearErrorUI();
    });

    function onLayoutChange() {
      computeMaxOffset();
      if (isFocused()) updateCaret();
      else if (lastPointer.x != null) lookAt(lastPointer.x, lastPointer.y);
    }
    window.addEventListener('resize', onLayoutChange);
    window.addEventListener('scroll', onLayoutChange);

    // ---------- Init ----------
    computeMaxOffset();
    setOffset(Math.round(state.maxOffset / 2), false);
    neutralEyes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
