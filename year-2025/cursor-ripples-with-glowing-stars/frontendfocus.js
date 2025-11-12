function createStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    let star = document.createElement("div");
    star.classList.add("glow-star");

    let size = Math.random() + 1;
    let x = Math.random() * window.innerWidth;
    let y = Math.random() * window.innerHeight;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.animationDuration = `${Math.random() + 1}s`;

    document.body.appendChild(star);
  }
}

createStars(100);

document.body.addEventListener("mousemove", function (e) {
  let ripple = document.createElement("div");
  ripple.classList.add("cursor-ripple");
  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;

  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 2000);
});