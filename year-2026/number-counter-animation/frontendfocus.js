const dur = 1;
let count = 10;

const txt = document.querySelector("text");
const elements = document.querySelector("#elements");
const left = document.querySelector("#circleLeft");
const right = document.querySelector("#circleRight");

// Get path lengths
const leftLen = left.getTotalLength();
const rightLen = right.getTotalLength();

// Prepare strokes
gsap.set([left, right], {
  strokeDasharray: leftLen,
  strokeDashoffset: 0
});

// Main loop
const master = gsap.timeline({ repeat: -1, onRepeat: countDown });

function unwrap() {
  const tl = gsap.timeline({ defaults: { duration: dur, ease: "none" } });

  tl.to(left, { strokeDashoffset: leftLen }, 0);
  tl.to(right, { strokeDashoffset: -rightLen }, 0);

  tl.fromTo(
    txt,
    { opacity: 0 },
    { opacity: 1, duration: 0.3 },
    0
  );

  tl.to(txt, { opacity: 0 }, dur);

  tl.to(elements, { y: "-=100", duration: dur * 2 }, 0);

  return tl;
}

function countDown() {
  count = count > 1 ? count - 1 : 10;
  txt.textContent = count;
}

// Start animation
master.add(unwrap(), 0);
