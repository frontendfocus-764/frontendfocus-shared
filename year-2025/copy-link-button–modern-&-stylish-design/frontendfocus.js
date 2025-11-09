const ANIMATE_TIMEOUT = 3000 + 200;
const button = document.getElementById("button");

button.addEventListener("click", () => {
  if (!button.classList.contains("animate")) {
    button.classList.add("animate");
    setTimeout(() => {
      button.classList.remove("animate");
    }, ANIMATE_TIMEOUT);
  }
});