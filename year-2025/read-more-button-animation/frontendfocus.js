let link = document.querySelector(".link");
let pink = document.querySelector(".color");

let hoverTL = gsap.timeline();
hoverTL.pause();

hoverTL.to(pink, {
    width: "calc(100% + 1.3em)",
    ease: "Elastic.easeOut(0.25)",
    duration: 0.4
});
hoverTL.to(pink, {
    width: "2em",
    left: "calc(100% - 1.45em)",
    ease: "Elastic.easeOut(0.4)",
    duration: 0.6
});

link.addEventListener("mouseenter", () => {
    hoverTL.play();
});

link.addEventListener("mouseleave", () => {
    hoverTL.reverse();
});