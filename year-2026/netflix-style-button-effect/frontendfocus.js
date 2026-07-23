document.addEventListener("DOMContentLoaded", function () {
  let btns = document.querySelectorAll(".btn");
  btns.forEach(function (btn) {
    let spans = [];
    for (let i = 0; i < 120; i++) {
      let span = document.createElement("span");
      span.style.left = `${i * 2}px`;
      spans.push(span);
      btn.appendChild(span);
      let randomDealy = Math.random() * 1 + 0;
      span.style.transitionDelay = randomDealy + "s";
    }
  });
});
