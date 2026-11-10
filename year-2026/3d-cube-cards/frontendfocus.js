const cardsData = [
  {
    title: "Flip Me",
    description: "Go on, give it a hover<br />I dare you",
    thumbImg: "./img/img-1.jpg"
  },
  {
    title: "Spin Cycle",
    description: "Now with 100% more<br />tumble per second",
    thumbImg: "./img/img-2.jpg",
  },
  {
    title: "Peek-a-Boo",
    description: "Six faces, one attitude<br />see them all",
    thumbImg: "./img/img-3.jpg",
  },
  {
    title: "Lean In",
    description: "It follows your cursor<br />a little clingy, honestly",
    thumbImg: "./img/img-4.jpg",
  },
];

const PARALLAX_STRENGTH = 50;

const cardWrappers = document.querySelectorAll(".card");
const cardCubes = [];

cardWrappers.forEach((cardWrapper, index) => {
  const card = cardsData[index];
  if (!card) return;

  const faceContent = `
    <img class="card-thumb" src="${card.thumbImg}" alt="${card.title}" />
    <h2 class="card-title">${card.title}</h2>
    <div class="card-meta">
      <p class="card-desc">${card.description}</p>
      <svg class="card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="12" x2="20" y2="12" />
        <polyline points="14 6 20 12 14 18" />
      </svg>
    </div>
  `;

  cardWrapper.innerHTML = `
    <div class="cube">
      <div class="face face-front">${faceContent}</div>
      <div class="face face-back">${faceContent}</div>
      <div class="face face-right"></div>
      <div class="face face-left"></div>
      <div class="face face-top"></div>
      <div class="face face-bottom"></div>
    </div>
  `;

  const cardCube = cardWrapper.querySelector(".cube");

  const cardDepth = parseFloat(
    getComputedStyle(cardWrapper).getPropertyValue("--card-depth"),
  );

  cardCubes.push({ cardCube, cardDepth });
});

cardCubes.forEach(({ cardCube, cardDepth }) => {
  const rotation = { flip: 0, tiltX: 0, tiltY: 0 };
  let isFlipped = false;

  function render() {
    gsap.set(cardCube, {
      rotateX: rotation.flip + rotation.tiltX,
      rotateY: rotation.tiltY,
      z: -cardDepth / 2,
    });
  }

  render();

  cardCube.addEventListener("mouseenter", () => {
    isFlipped = false;
    gsap.to(rotation, {
      flip: 180,
      duration: 0.5,
      ease: "power2.inOut",
      overwrite: "flip",
      onUpdate: render,
      onComplete: () => {
        isFlipped = true;
      },
    });
  });

  cardCube.addEventListener("mouseleave", () => {
    isFlipped = false;
    gsap.to(rotation, {
      flip: 0,
      tiltX: 0,
      tiltY: 0,
      duration: 0.6,
      ease: "power3.out",
      overwrite: true,
      onUpdate: render,
    });
  });

  cardCube.addEventListener("mousemove", (event) => {
    if (!isFlipped) return;

    const bounds = cardCube.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    const offsetX = (event.clientX - centerX) / bounds.width;
    const offsetY = (event.clientY - centerY) / bounds.height;

    gsap.to(rotation, {
      tiltY: offsetX * PARALLAX_STRENGTH,
      tiltX: -offsetY * PARALLAX_STRENGTH,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "tilt",
      onUpdate: render,
    });
  });
});