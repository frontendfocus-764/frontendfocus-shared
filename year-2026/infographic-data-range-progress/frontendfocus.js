const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  .matches;
const items = gsap.utils.toArray(".item");
const tooltip = document.querySelector(".tooltip");
items.forEach((item, index) => {
  const value = Number(item.dataset.value);
  item.style.setProperty("--pct", value);
  item.addEventListener("pointermove", (event) => {
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  });
  item.addEventListener("pointerenter", () => {
    tooltip.textContent = `${item.dataset.label}: ${value}%`;
    tooltip.classList.add("show");
    if (!reduceMotion) {
      gsap.to(item, {
        y: -8,
        rotateX: 3,
        duration: 0.28,
        ease: "power2.out"
      });
    }
  });
  item.addEventListener("pointerleave", () => {
    tooltip.classList.remove("show");
    if (!reduceMotion) {
      gsap.to(item, {
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.44,
        ease: "elastic.out(1, 0.58)"
      });
    }
  });
  item.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    gsap.to(item, {
      rotateY: x * 7,
      duration: 0.25,
      ease: "power2.out"
    });
  });
  item.addEventListener("click", () => {
    const randomLift = Math.round(18 + Math.random() * 75);
    item.style.setProperty("--pct", randomLift);
    item.querySelector(".percent").innerHTML = `${String(randomLift).padStart(
      2,
      "0"
    )}<small>%</small>`;
    tooltip.textContent = `${item.dataset.label}: ${randomLift}%`;
    if (!reduceMotion) {
      gsap.fromTo(
        item.querySelector(".liquid"),
        {
          filter: "brightness(1.35) saturate(1.25)"
        },
        {
          filter: "brightness(1) saturate(1)",
          duration: 0.9,
          ease: "power2.out"
        }
      );
      gsap.fromTo(
        item.querySelector(".tube"),
        {
          scaleY: 1.025
        },
        {
          scaleY: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.35)",
          transformOrigin: "50% 100%"
        }
      );
    }
  });
});
if (!reduceMotion) {
  gsap.set(".item", {
    y: 34,
    opacity: 0,
    rotateX: -8
  });
  gsap.set(".liquid", {
    height: 0
  });
  gsap.set(".meniscus", {
    bottom: 0
  });
  const intro = gsap.timeline({
    defaults: {
      ease: "power3.out"
    }
  });
  intro
    .to(".item", {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.78,
      stagger: 0.09
    })
    .to(
      ".liquid",
      {
        height: (_, el) => `calc(${el.closest(".item").dataset.value} * 1%)`,
        duration: 1.15,
        stagger: 0.08,
        ease: "elastic.out(1, 0.55)"
      },
      "-=0.35"
    )
    .to(
      ".meniscus",
      {
        bottom: (_, el) =>
          `calc((${el.closest(".item").dataset.value} * 1%) - 1px)`,
        duration: 1.15,
        stagger: 0.08,
        ease: "elastic.out(1, 0.55)"
      },
      "<"
    );
  gsap.to(".tube", {
    y: -4,
    duration: 2.8,
    stagger: 0.18,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });
}
