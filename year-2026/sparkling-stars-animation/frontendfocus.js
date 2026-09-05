(() => {
  "use strict";

  const canvas = document.querySelector("#star-canvas");
  const context = canvas.getContext("2d", { alpha: false });
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const seedValues = new Uint32Array(1);

  window.crypto.getRandomValues(seedValues);
  const sessionSeed = seedValues[0];

  const BACKGROUND = "#02020a";
  const COLORS = [
    "#f8fbff",
    "#32dfff",
    "#2693ff",
    "#5557ff",
    "#a65cff",
    "#f14dff",
    "#ff3da7",
    "#ff6685",
    "#ffb52e",
    "#ffe063",
    "#48eea4"
  ];

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    staticLayer: document.createElement("canvas"),
    stars: [],
    random: null,
    animationId: 0,
    resizeTimer: 0,
    lastFrame: 0
  };

  function mulberry32(seed) {
    return function random() {
      let value = (seed += 0x6d2b79f5);
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomBetween(random, minimum, maximum) {
    return minimum + random() * (maximum - minimum);
  }

  function chooseColor(random, preferBright = false) {
    if (preferBright && random() < 0.22) {
      return COLORS[0];
    }

    return COLORS[Math.floor(random() * COLORS.length)];
  }

  function setCanvasSize(target, width, height, dpr) {
    target.width = Math.round(width * dpr);
    target.height = Math.round(height * dpr);
    target.style.width = `${width}px`;
    target.style.height = `${height}px`;

    const targetContext = target.getContext("2d", { alpha: target !== canvas });
    targetContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    return targetContext;
  }

  function drawMicroStar(layerContext, star) {
    layerContext.save();
    layerContext.globalAlpha = star.alpha;
    layerContext.fillStyle = star.color;

    if (star.cross) {
      const ray = star.radius * 3.4;
      layerContext.fillRect(star.x - ray, star.y - 0.25, ray * 2, 0.5);
      layerContext.fillRect(star.x - 0.25, star.y - ray, 0.5, ray * 2);
    }

    layerContext.beginPath();
    layerContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    layerContext.fill();
    layerContext.restore();
  }

  function buildStaticLayer(random) {
    const layerContext = setCanvasSize(
      state.staticLayer,
      state.width,
      state.height,
      state.dpr
    );

    layerContext.clearRect(0, 0, state.width, state.height);

    const area = state.width * state.height;
    const starCount = Math.max(620, Math.min(3300, Math.round(area / 650)));

    for (let index = 0; index < starCount; index += 1) {
      const sizeChance = random();
      const radius = sizeChance > 0.985
        ? randomBetween(random, 1.15, 1.75)
        : randomBetween(random, 0.35, 0.95);

      drawMicroStar(layerContext, {
        x: random() * state.width,
        y: random() * state.height,
        radius,
        alpha: randomBetween(random, 0.3, 0.98),
        color: chooseColor(random, true),
        cross: sizeChance > 0.992
      });
    }
  }

  function createSmallStar(random, beginAtRandomAge = false) {
    const direction = random() * Math.PI * 2;
    const driftSpeed = randomBetween(random, 3, 12);
    const lifetime = randomBetween(random, 7, 16);

    return {
      family: "small",
      type: "small",
      x: randomBetween(random, 0.04, 0.96) * state.width,
      y: randomBetween(random, 0.04, 0.96) * state.height,
      size: randomBetween(random, 1.2, 3.4),
      color: chooseColor(random, true),
      alpha: randomBetween(random, 0.45, 0.95),
      phase: random() * Math.PI * 2,
      speed: randomBetween(random, 0.55, 1.7),
      velocityX: Math.cos(direction) * driftSpeed,
      velocityY: Math.sin(direction) * driftSpeed,
      age: beginAtRandomAge ? random() * lifetime : 0,
      lifetime,
      fadeDuration: randomBetween(random, 0.8, 1.8)
    };
  }

  function createFeatureStar(random, beginAtRandomAge = false) {
    const dramatic = random() > 0.76;
    const direction = random() * Math.PI * 2;
    const driftSpeed = randomBetween(random, 1.5, 6.5);
    const lifetime = randomBetween(random, 9, 21);

    return {
      family: "feature",
      type: dramatic ? "large" : "medium",
      x: randomBetween(random, 0.06, 0.94) * state.width,
      y: randomBetween(random, 0.06, 0.94) * state.height,
      size: dramatic
        ? randomBetween(random, 17, 36)
        : randomBetween(random, 7, 17),
      color: chooseColor(random, true),
      alpha: randomBetween(random, 0.68, 1),
      phase: random() * Math.PI * 2,
      speed: randomBetween(random, 0.35, 1.05),
      rayBias: randomBetween(random, 0.72, 1.32),
      velocityX: Math.cos(direction) * driftSpeed,
      velocityY: Math.sin(direction) * driftSpeed,
      age: beginAtRandomAge ? random() * lifetime : 0,
      lifetime,
      fadeDuration: randomBetween(random, 1.2, 2.5)
    };
  }

  function createDynamicStars(random) {
    const area = state.width * state.height;
    const smallCount = Math.max(70, Math.min(260, Math.round(area / 7200)));
    const featureCount = Math.max(24, Math.min(82, Math.round(area / 22000)));
    const stars = [];

    for (let index = 0; index < smallCount; index += 1) {
      stars.push(createSmallStar(random, true));
    }

    for (let index = 0; index < featureCount; index += 1) {
      stars.push(createFeatureStar(random, true));
    }

    return stars.sort((first, second) => first.size - second.size);
  }

  function respawnStar(star) {
    const replacement = star.family === "small"
      ? createSmallStar(state.random)
      : createFeatureStar(state.random);

    Object.assign(star, replacement);
  }

  function updateStars(deltaSeconds) {
    for (const star of state.stars) {
      star.age += deltaSeconds;
      star.x += star.velocityX * deltaSeconds;
      star.y += star.velocityY * deltaSeconds;

      const margin = Math.max(40, star.size * 3);
      const outsideField = star.x < -margin
        || star.x > state.width + margin
        || star.y < -margin
        || star.y > state.height + margin;

      if (star.age >= star.lifetime || outsideField) {
        respawnStar(star);
      }
    }
  }

  function getLifeVisibility(star) {
    const fadeIn = Math.min(1, star.age / star.fadeDuration);
    const fadeOut = Math.min(
      1,
      Math.max(0, (star.lifetime - star.age) / star.fadeDuration)
    );

    return Math.min(fadeIn, fadeOut);
  }

  function drawSoftPoint(star, brightness, scale) {
    const radius = star.size * scale;

    context.save();
    context.globalAlpha = star.alpha * brightness;
    context.fillStyle = star.color;
    context.shadowColor = star.color;
    context.shadowBlur = radius * 2.4;
    context.beginPath();
    context.arc(star.x, star.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function drawDiamond(x, y, horizontalRadius, verticalRadius, color, alpha) {
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y - verticalRadius);
    context.lineTo(x + horizontalRadius, y);
    context.lineTo(x, y + verticalRadius);
    context.lineTo(x - horizontalRadius, y);
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawFeatureStar(star, brightness, scale) {
    const size = star.size * scale;
    const horizontalRay = size * star.rayBias;
    const verticalRay = size * (2.15 - star.rayBias);
    const haloRadius = size * 1.55;
    const halo = context.createRadialGradient(
      star.x,
      star.y,
      0,
      star.x,
      star.y,
      haloRadius
    );

    halo.addColorStop(0, star.color);
    halo.addColorStop(0.18, `${star.color}b8`);
    halo.addColorStop(0.52, `${star.color}28`);
    halo.addColorStop(1, `${star.color}00`);

    context.save();
    context.globalAlpha = star.alpha * brightness;
    context.fillStyle = halo;
    context.beginPath();
    context.arc(star.x, star.y, haloRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();

    drawDiamond(
      star.x,
      star.y,
      horizontalRay,
      Math.max(0.7, size * 0.075),
      star.color,
      star.alpha * brightness * 0.72
    );
    drawDiamond(
      star.x,
      star.y,
      Math.max(0.7, size * 0.075),
      verticalRay,
      star.color,
      star.alpha * brightness * 0.8
    );

    if (star.type === "large") {
      const diagonal = size * 0.46;
      context.save();
      context.translate(star.x, star.y);
      context.rotate(Math.PI / 4);
      drawDiamond(
        0,
        0,
        diagonal,
        Math.max(0.55, size * 0.045),
        star.color,
        star.alpha * brightness * 0.35
      );
      drawDiamond(
        0,
        0,
        Math.max(0.55, size * 0.045),
        diagonal,
        star.color,
        star.alpha * brightness * 0.35
      );
      context.restore();
    }

    context.save();
    context.globalAlpha = Math.min(1, star.alpha * brightness + 0.12);
    context.fillStyle = "#fffdf8";
    context.shadowColor = star.color;
    context.shadowBlur = size * 0.42;
    context.beginPath();
    context.arc(star.x, star.y, Math.max(0.9, size * 0.105), 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function render(time = 0) {
    context.fillStyle = BACKGROUND;
    context.fillRect(0, 0, state.width, state.height);
    context.drawImage(state.staticLayer, 0, 0, state.width, state.height);

    const seconds = time / 1000;

    for (const star of state.stars) {
      const wave = Math.sin(seconds * star.speed * Math.PI * 2 + star.phase);
      const lifeVisibility = getLifeVisibility(star);
      const brightness = (0.58 + (wave + 1) * 0.21) * lifeVisibility;
      const scale = 0.72 + (wave + 1) * 0.18;

      if (star.type === "small") {
        drawSoftPoint(star, brightness, scale);
      } else {
        drawFeatureStar(star, brightness, scale);
      }
    }
  }

  function animate(time) {
    if (time - state.lastFrame >= 1000 / 45) {
      const deltaSeconds = state.lastFrame === 0
        ? 0
        : Math.min(0.05, (time - state.lastFrame) / 1000);

      updateStars(deltaSeconds);
      render(time);
      state.lastFrame = time;
    }

    state.animationId = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    window.cancelAnimationFrame(state.animationId);
    state.animationId = 0;
  }

  function startAnimation() {
    stopAnimation();
    state.lastFrame = 0;

    if (motionQuery.matches || document.hidden) {
      render(1750);
      return;
    }

    state.animationId = window.requestAnimationFrame(animate);
  }

  function rebuild() {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(bounds.width));
    const height = Math.max(320, Math.round(bounds.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    if (width === state.width && height === state.height && dpr === state.dpr) {
      return;
    }

    state.width = width;
    state.height = height;
    state.dpr = dpr;

    setCanvasSize(canvas, width, height, dpr);

    const random = mulberry32(sessionSeed ^ (width * 31) ^ (height * 17));
    state.random = random;
    buildStaticLayer(random);
    state.stars = createDynamicStars(random);
    startAnimation();
  }

  function scheduleRebuild() {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(rebuild, 120);
  }

  window.addEventListener("resize", scheduleRebuild, { passive: true });
  document.addEventListener("visibilitychange", startAnimation);
  motionQuery.addEventListener("change", startAnimation);

  rebuild();
})();
