document.querySelectorAll(".btn-3d").forEach((btn) => {
  btn.addEventListener("click", () => {
    const svg = btn.querySelector("svg");
    svg.classList.add("pulse");
    setTimeout(() => svg.classList.remove("pulse"), 500);
  });
});
