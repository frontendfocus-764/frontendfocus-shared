class MzaCarousel {
  constructor(root, opts = {}) {
    this.root = root;
    this.viewport = root.querySelector(".mzaCarousel-viewport");
    this.track = root.querySelector(".mzaCarousel-track");
    this.slides = Array.from(root.querySelectorAll(".mzaCarousel-slide"));
    this.prevBtn = root.querySelector(".mzaCarousel-prev");
    this.nextBtn = root.querySelector(".mzaCarousel-next");
    this.pagination = root.querySelector(".mzaCarousel-pagination");
    this.progressBar = root.querySelector(".mzaCarousel-progressBar");
    this.isFF = typeof InstallTrigger !== "undefined";
    this.n = this.slides.length;
    this.state = {
      index: 0,
      pos: 0,
      width: 0,
      height: 0,
      gap: 28,
      dragging: false,
      pointerId: null,
      x0: 0,
      v: 0,
      t0: 0,
      animating: false,
      hovering: false,
      startTime: 0,
      pausedAt: 0,
      rafId: 0
    };
    this.opts = Object.assign(
      {
        gap: 28,
        peek: 0.15,
        rotateY: 34,
        zDepth: 150,
        scaleDrop: 0.09,
        blurMax: 2.0,
        activeLeftBias: 0.12,
        interval: 4500,
        transitionMs: 900,
        keyboard: true,
        breakpoints: [
          {
            mq: "(max-width: 1200px)",
            gap: 24,
            peek: 0.12,
            rotateY: 28,
            zDepth: 120,
            scaleDrop: 0.08,
            activeLeftBias: 0.1
          },
          {
            mq: "(max-width: 1000px)",
            gap: 18,
            peek: 0.09,
            rotateY: 22,
            zDepth: 90,
            scaleDrop: 0.07,
            activeLeftBias: 0.09
          },
          {
            mq: "(max-width: 768px)",
            gap: 14,
            peek: 0.06,
            rotateY: 16,
            zDepth: 70,
            scaleDrop: 0.06,
            activeLeftBias: 0.08
          },
          {
            mq: "(max-width: 560px)",
            gap: 12,
            peek: 0.05,
            rotateY: 12,
            zDepth: 60,
            scaleDrop: 0.05,
            activeLeftBias: 0.07
          }
        ]
      },
      opts
    );
    if (this.isFF) {
      this.opts.rotateY = 10;
      this.opts.zDepth = 0;
      this.opts.blurMax = 0;
    }
    this._init();
  }
  _init() {
    this._setupDots();
    this._bind();
    this._preloadImages();
    this._measure();
    this.goTo(0, false);
    this._startCycle();
    this._loop();
  }
  _preloadImages() {
    this.slides.forEach((sl) => {
      const card = sl.querySelector(".mzaCard");
      const bg = getComputedStyle(card).getPropertyValue("--mzaCard-bg");
      const m = /url\((?:'|")?([^'")]+)(?:'|")?\)/.exec(bg);
      if (m && m[1]) {
        const img = new Image();
        img.src = m[1];
      }
    });
  }
  _setupDots() {
    this.pagination.innerHTML = "";
    this.dots = this.slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mzaCarousel-dot";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => {
        this.goTo(i);
      });
      this.pagination.appendChild(b);
      return b;
    });
  }
  _bind() {
    this.prevBtn.addEventListener("click", () => {
      this.prev();
    });
    this.nextBtn.addEventListener("click", () => {
      this.next();
    });
    if (this.opts.keyboard) {
      this.root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") this.prev();
        if (e.key === "ArrowRight") this.next();
      });
    }
    const pe = this.viewport;
    pe.addEventListener("pointerdown", (e) => this._onDragStart(e));
    pe.addEventListener("pointermove", (e) => this._onDragMove(e));
    pe.addEventListener("pointerup", (e) => this._onDragEnd(e));
    pe.addEventListener("pointercancel", (e) => this._onDragEnd(e));
    this.root.addEventListener("mouseenter", () => {
      this.state.hovering = true;
      this.state.pausedAt = performance.now();
    });
    this.root.addEventListener("mouseleave", () => {
      if (this.state.pausedAt) {
        this.state.startTime += performance.now() - this.state.pausedAt;
        this.state.pausedAt = 0;
      }
      this.state.hovering = false;
    });
    this.ro = new ResizeObserver(() => this._measure());
    this.ro.observe(this.viewport);
    this.opts.breakpoints.forEach((bp) => {
      const m = window.matchMedia(bp.mq);
      const apply = () => {
        Object.keys(bp).forEach((k) => {
          if (k !== "mq") this.opts[k] = bp[k];
        });
        this._measure();
        this._render();
      };
      if (m.addEventListener) m.addEventListener("change", apply);
      else m.addListener(apply);
      if (m.matches) apply();
    });
    this.viewport.addEventListener("pointermove", (e) => this._onTilt(e));
    window.addEventListener("orientationchange", () =>
      setTimeout(() => this._measure(), 250)
    );
  }
  _measure() {
    const viewRect = this.viewport.getBoundingClientRect();
    const rootRect = this.root.getBoundingClientRect();
    const pagRect = this.pagination.getBoundingClientRect();
    const bottomGap = Math.max(
      12,
      Math.round(rootRect.bottom - pagRect.bottom)
    );
    const pagSpace = pagRect.height + bottomGap;
    const availH = viewRect.height - pagSpace;
    const cardH = Math.max(320, Math.min(640, Math.round(availH)));
    this.state.width = viewRect.width;
    this.state.height = viewRect.height;
    this.state.gap = this.opts.gap;
    this.slideW = Math.min(880, this.state.width * (1 - this.opts.peek * 2));
    this.root.style.setProperty("--mzaPagH", `${pagSpace}px`);
    this.root.style.setProperty("--mzaCardH", `${cardH}px`);
  }
  _onTilt(e) {
    const r = this.viewport.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    this.root.style.setProperty("--mzaTiltX", (my * -6).toFixed(3));
    this.root.style.setProperty("--mzaTiltY", (mx * 6).toFixed(3));
  }
  _onDragStart(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    this.state.dragging = true;
    this.state.pointerId = e.pointerId;
    this.viewport.setPointerCapture(e.pointerId);
    this.state.x0 = e.clientX;
    this.state.t0 = performance.now();
    this.state.v = 0;
    this.state.pausedAt = performance.now();
  }
  _onDragMove(e) {
    if (!this.state.dragging || e.pointerId !== this.state.pointerId) return;
    const dx = e.clientX - this.state.x0;
    const dt = Math.max(16, performance.now() - this.state.t0);
    this.state.v = dx / dt;
    const slideSpan = this.slideW + this.state.gap;
    this.state.pos = this._mod(this.state.index - dx / slideSpan, this.n);
    this._render();
  }
  _onDragEnd(e) {
    if (!this.state.dragging || (e && e.pointerId !== this.state.pointerId))
      return;
    this.state.dragging = false;
    try {
      if (this.state.pointerId != null)
        this.viewport.releasePointerCapture(this.state.pointerId);
    } catch {}
    this.state.pointerId = null;
    if (this.state.pausedAt) {
      this.state.startTime += performance.now() - this.state.pausedAt;
      this.state.pausedAt = 0;
    }
    const v = this.state.v;
    const threshold = 0.18;
    let target = Math.round(
      this.state.pos - Math.sign(v) * (Math.abs(v) > threshold ? 0.5 : 0)
    );
    this.goTo(this._mod(target, this.n));
  }
  _startCycle() {
    this.state.startTime = performance.now();
    this._renderProgress(0);
  }
  _loop() {
    const step = (t) => {
      if (
        !this.state.dragging &&
        !this.state.hovering &&
        !this.state.animating
      ) {
        const elapsed = t - this.state.startTime;
        const p = Math.min(1, elapsed / this.opts.interval);
        this._renderProgress(p);
        if (elapsed >= this.opts.interval) this.next();
      }
      this.state.rafId = requestAnimationFrame(step);
    };
    this.state.rafId = requestAnimationFrame(step);
  }
  _renderProgress(p) {
    this.progressBar.style.transform = `scaleX(${p})`;
  }
  prev() {
    this.goTo(this._mod(this.state.index - 1, this.n));
  }
  next() {
    this.goTo(this._mod(this.state.index + 1, this.n));
  }
  goTo(i, animate = true) {
    const start = this.state.pos || this.state.index;
    const end = this._nearest(start, i);
    const dur = animate ? this.opts.transitionMs : 0;
    const t0 = performance.now();
    const ease = (x) => 1 - Math.pow(1 - x, 4);
    this.state.animating = true;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const p = dur ? ease(t) : 1;
      this.state.pos = start + (end - start) * p;
      this._render();
      if (t < 1) requestAnimationFrame(step);
      else this._afterSnap(i);
    };
    requestAnimationFrame(step);
  }
  _afterSnap(i) {
    this.state.index = this._mod(Math.round(this.state.pos), this.n);
    this.state.pos = this.state.index;
    this.state.animating = false;
    this._render(true);
    this._startCycle();
  }
  _nearest(from, target) {
    let d = target - Math.round(from);
    if (d > this.n / 2) d -= this.n;
    if (d < -this.n / 2) d += this.n;
    return Math.round(from) + d;
  }
  _mod(i, n) {
    return ((i % n) + n) % n;
  }
  _render(markActive = false) {
    const span = this.slideW + this.state.gap;
    const tiltX = parseFloat(
      this.root.style.getPropertyValue("--mzaTiltX") || 0
    );
    const tiltY = parseFloat(
      this.root.style.getPropertyValue("--mzaTiltY") || 0
    );
    for (let i = 0; i < this.n; i++) {
      let d = i - this.state.pos;
      if (d > this.n / 2) d -= this.n;
      if (d < -this.n / 2) d += this.n;
      const weight = Math.max(0, 1 - Math.abs(d) * 2);
      const biasActive = -this.slideW * this.opts.activeLeftBias * weight;
      const tx = d * span + biasActive;
      const depth = -Math.abs(d) * this.opts.zDepth;
      const rot = -d * this.opts.rotateY;
      const scale = 1 - Math.min(Math.abs(d) * this.opts.scaleDrop, 0.42);
      const blur = Math.min(Math.abs(d) * this.opts.blurMax, this.opts.blurMax);
      const z = Math.round(1000 - Math.abs(d) * 10);
      const s = this.slides[i];
      if (this.isFF) {
        s.style.transform = `translate(${tx}px,-50%) scale(${scale})`;
        s.style.filter = "none";
      } else {
        s.style.transform = `translate3d(${tx}px,-50%,${depth}px) rotateY(${rot}deg) scale(${scale})`;
        s.style.filter = `blur(${blur}px)`;
      }
      s.style.zIndex = z;
      if (markActive)
        s.dataset.state =
          Math.round(this.state.index) === i ? "active" : "rest";
      const card = s.querySelector(".mzaCard");
      const parBase = Math.max(-1, Math.min(1, -d));
      const parX = parBase * 48 + tiltY * 2.0;
      const parY = tiltX * -1.5;
      const bgX = parBase * -64 + tiltY * -2.4;
      card.style.setProperty("--mzaParX", `${parX.toFixed(2)}px`);
      card.style.setProperty("--mzaParY", `${parY.toFixed(2)}px`);
      card.style.setProperty("--mzaParBgX", `${bgX.toFixed(2)}px`);
      card.style.setProperty("--mzaParBgY", `${(parY * 0.35).toFixed(2)}px`);
    }
    const active = this._mod(Math.round(this.state.pos), this.n);
    this.dots.forEach((d, i) =>
      d.setAttribute("aria-selected", i === active ? "true" : "false")
    );
  }
}
const mza = new MzaCarousel(document.getElementById("mzaCarousel"), {
  transitionMs: 900
});
