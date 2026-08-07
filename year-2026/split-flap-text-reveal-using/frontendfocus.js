// ---- Config ----
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const FLIP_MS = 90;
const MIN_TICKS = 6;
const MAX_TICKS = 14;
const STAGGER_MS = 70;

const row = document.getElementById("row");
const form = document.getElementById("form");
const input = document.getElementById("input");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

function buildCell(char) {
  const isSpace = char === " ";
  const flap = document.createElement("div");
  flap.className = "flap" + (isSpace ? " flap--space" : "");

  if (isSpace) {
    row.appendChild(flap);
    return null;
  }

  flap.innerHTML = `
    <div class="flap__base"></div>
    <div class="flap__flipper">
      <div class="flap__face flap__face--front"><span class="ch"></span></div>
      <div class="flap__face flap__face--back"><span class="ch"></span></div>
    </div>
    <div class="flap__hinge"></div>
  `;
  row.appendChild(flap);

  return {
    flipper: flap.querySelector(".flap__flipper"),
    front: flap.querySelector(".flap__face--front .ch"),
    back: flap.querySelector(".flap__face--back .ch"),
    current: "",
  };
}

function setFace(el, char) {
  el.textContent = char;
}

function tick(cell, target, ticksLeft) {
  const nextChar = ticksLeft <= 1 ? target : randomChar();
  setFace(cell.back, nextChar);

  if (reducedMotion) {
    setFace(cell.front, nextChar);
    cell.current = nextChar;
    return;
  }

  cell.flipper.classList.add("is-flipping");

  setTimeout(() => {
    cell.flipper.classList.remove("is-flipping");
    setFace(cell.front, nextChar);
    cell.current = nextChar;

    if (ticksLeft > 1) {
      tick(cell, target, ticksLeft - 1);
    }
  }, FLIP_MS);
}

function playText(text) {
  row.innerHTML = "";
  const chars = text.toUpperCase().split("");
  const cells = chars.map((c) => buildCell(c));

  cells.forEach((cell, i) => {
    if (!cell) return;
    const target = chars[i];
    const ticks = MIN_TICKS + Math.floor(Math.random() * (MAX_TICKS - MIN_TICKS));
    setFace(cell.front, cell.current || " ");
    setTimeout(() => tick(cell, target, ticks), i * STAGGER_MS);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) playText(text);
});

playText(input.value);