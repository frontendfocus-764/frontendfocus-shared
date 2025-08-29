// Create timeline
var basicTimeline = anime.timeline({
  autoplay: false
});

// Select all ".tick" elements
var pathEls = document.querySelectorAll(".tick");
var pathEl, offset;

for (var i = 0; i < pathEls.length; i++) {
  pathEl = pathEls[i];
  offset = anime.setDashoffset(pathEl);
  pathEl.setAttribute("stroke-dashoffset", offset);
}

// Timeline steps
basicTimeline
  .add({
    targets: ".btn-text",
    duration: 1,
    opacity: "0"
  })
  .add({
    targets: ".main-btn",
    duration: 1300,
    height: 10,
    width: 300,
    backgroundColor: "#21262D",
    border: "0",
    borderRadius: 100
  })
  .add({
    targets: ".loading-bar",
    duration: 2000,
    width: 300,
    easing: "linear"
  })
  .add({
    targets: ".main-btn",
    width: 0,
    duration: 1
  })
  .add({
    targets: ".loading-bar",
    width: 80,
    height: 80,
    delay: 500,
    duration: 750,
    borderRadius: 80,
    backgroundColor: "#58A6FF"
  })
  .add({
    targets: pathEls, // animate all ".tick"
    strokeDashoffset: [offset, 0],
    duration: 200,
    easing: "easeInOutSine"
  });

// Button click event
document.querySelectorAll(".main-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    basicTimeline.play();
  });
});

// Text click event
document.querySelectorAll(".btn-text").forEach(function (txt) {
  txt.addEventListener("click", function () {
    basicTimeline.play();
  });
});