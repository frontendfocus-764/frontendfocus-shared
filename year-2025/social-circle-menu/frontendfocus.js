const menu = document.querySelector(".circle-menu");
const mainBtn = document.querySelector(".main-btn");
const items = document.querySelectorAll(".item");
const particlesContainer = document.getElementById("particles");

function createParticles() {
  const colors = [
    "rgba(255, 107, 129, 0.2)",
    "rgba(59, 89, 152, 0.2)",
    "rgba(0, 172, 238, 0.2)",
    "rgba(255, 0, 0, 0.2)",
    "rgba(14, 118, 168, 0.2)",
    "rgba(189, 8, 28, 0.2)"
  ];

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    const size = Math.random() * 15 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particle.style.animationDuration = `${15 + Math.random() * 10}s`;

    particlesContainer.appendChild(particle);
  }
}

mainBtn.addEventListener("click", () => {
  menu.classList.toggle("active");
  mainBtn.classList.toggle("active");
  mainBtn.classList.remove("pulse");

  if (mainBtn.querySelector("i").classList.contains("fa-plus")) {
    mainBtn.querySelector("i").classList.remove("fa-plus");
    mainBtn.querySelector("i").classList.add("fa-times");
  } else {
    mainBtn.querySelector("i").classList.remove("fa-times");
    mainBtn.querySelector("i").classList.add("fa-plus");

    // Re-add pulse animation when closing
    setTimeout(() => {
      mainBtn.classList.add("pulse");
    }, 500);
  }
});

items.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();

    const ripple = document.createElement("div");
    ripple.style.position = "absolute";
    ripple.style.width = "100%";
    ripple.style.height = "100%";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.top = "0";
    ripple.style.left = "0";
    ripple.style.transform = "scale(0)";
    ripple.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";
    ripple.style.opacity = "1";

    item.appendChild(ripple);

    setTimeout(() => {
      ripple.style.transform = "scale(1.5)";
      ripple.style.opacity = "0";
    }, 10);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

createParticles();