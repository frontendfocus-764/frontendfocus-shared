const texts = [
    "Creative Digital Experience",
    "Design That Feels Alive",
    "Smooth & Modern Interfaces",
    "Built With Clean Code"
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typingSpeed = 90;
const deletingSpeed = 45;
const pauseTime = 1400;

function typeLoop() {
    const current = texts[textIndex];
    const displayed = current.substring(0, charIndex);

    document.getElementById("type-text").textContent = displayed;

    if (!isDeleting && charIndex < current.length) {
        charIndex++;
        setTimeout(typeLoop, typingSpeed + Math.random() * 40); // natural typing
    } 
    else if (isDeleting && charIndex > 0) {
        charIndex--;
        setTimeout(typeLoop, deletingSpeed);
    } 
    else {
        isDeleting = !isDeleting;

        if (!isDeleting) {
            textIndex = (textIndex + 1) % texts.length;
        }

        setTimeout(typeLoop, pauseTime);
    }
}

typeLoop();