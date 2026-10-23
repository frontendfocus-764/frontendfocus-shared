const glassyButtons = document.querySelectorAll(".glassy-button");

glassyButtons.forEach((button) => {
  button.addEventListener("mousemove", (event) => {
    const centerX = button.offsetWidth / 2;
    const centerY = button.offsetHeight / 2;

    const offsetX = event.offsetX - centerX;
    const offsetY = event.offsetY - centerY;

    button.style.setProperty("--_x-motion", `${offsetX}px`);
    button.style.setProperty("--_y-motion", `${offsetY}px`);
  });
});
