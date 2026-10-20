
const counters = [
  { digits: 70, slots: 2 },
  { digits: 909, slots: 3 },
  { digits: 2001 },
  { digits: 11938, slots: 5 },
  { digits: 272106, slots: 6 },
];

function getSlotTravels(paddedDigits) {
  const travels = [];
  let previous = 0;

  for (const digit of paddedDigits) {
    const revolutions = Math.max(
      0,
      Math.ceil((previous + 1 - digit) / 10)
    );

    const travel =
      digit === 0 && previous === 0
        ? 0
        : revolutions * 10 + digit;

    travels.push(travel);
    previous = travel;
  }

  return travels;
}

function usePrefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function createAnimatedCounter({
  digits,
  slots = 4,
  duration = 4000,
  hold = 1000,
  loop = true,
}) {
  const value = String(Math.max(0, Math.trunc(digits)));
  const slotCount = Math.max(slots, value.length);

  const paddedDigits = value
    .padStart(slotCount, "0")
    .split("")
    .map(Number);

  const travels = getSlotTravels(paddedDigits);

  const counter = document.createElement("div");
  counter.className = "counter";
  counter.setAttribute("role", "img");
  counter.setAttribute("aria-label", value);

  const slotsElements = [];

  travels.forEach((travel) => {
    const slot = document.createElement("div");
    slot.className = "counter__slot";
    slot.setAttribute("aria-hidden", "true");

    const slotDigits = document.createElement("div");
    slotDigits.className = "counter__slot-digits";

    slotDigits.style.setProperty("--offset", "0");
    slotDigits.style.setProperty("--roll-dur", `${duration}ms`);

    const stripLength = (Math.floor(travel / 10) + 1) * 10;

    for (let j = 0; j < stripLength; j++) {
      const digit = document.createElement("div");
      digit.className = "counter__digit";
      digit.textContent = String(j % 10);
      slotDigits.appendChild(digit);
    }

    slot.appendChild(slotDigits);
    counter.appendChild(slot);

    slotsElements.push({ slotDigits, travel });
  });

  let timers = [];
  let animationFrame = null;
  let stopped = false;

  const reducedMotion = usePrefersReducedMotion();

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function setOffset(offset) {
    slotsElements.forEach(({ slotDigits, travel }) => {
      slotDigits.style.setProperty(
        "--offset",
        String(offset ? travel : 0)
      );
    });
  }

  function schedule(callback, delay) {
    const timer = setTimeout(() => {
      timers = timers.filter((item) => item !== timer);

      if (!stopped) callback();
    }, delay);

    timers.push(timer);
  }

  function runCycle() {
    schedule(() => {
      setOffset(true);

      schedule(() => {
        setOffset(false);

        if (loop) {
          schedule(runCycle, duration);
        }
      }, duration + hold);
    }, hold);
  }

  function start() {
    if (reducedMotion) {
      setOffset(true);
      return;
    }

    // Ensure the initial position is rendered before animation.
    setOffset(false);

    animationFrame = requestAnimationFrame(() => {
      animationFrame = null;

      if (!stopped) {
        runCycle();
      }
    });
  }

  function destroy() {
    stopped = true;
    clearTimers();
  }

  start();

  return { element: counter, destroy };
}

const root = document.getElementById("root");

if (root) {
  const instances = counters.map(createAnimatedCounter);

  instances.forEach(({ element }) => {
    root.appendChild(element);
  });

  // Clean up timers if the page is being unloaded.
  window.addEventListener(
    "pagehide",
    () => instances.forEach(({ destroy }) => destroy()),
    { once: true }
  );
}
