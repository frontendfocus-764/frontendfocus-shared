const text = "Frontend Dev";
const element = document.getElementById("shine-text");

let index = 0;
function typeEffect() {
  if (index <= text.length) {
    element.textContent = text.slice(0, index);
    index++;
    setTimeout(typeEffect, 140);
  }
}
typeEffect();
