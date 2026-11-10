const container = document.querySelector('.marquee-container');
const track = document.querySelector('.marquee-track');
const group = document.querySelector('.marquee-group');
const lineGlow = document.querySelector('.line-glow');

let position = 0;
let speed = 1;
let isDragging = false;
let startX = 0;

let groupWidth;

/* -----------------------------
   Measure group width
----------------------------- */

function measure() {
    groupWidth = group.offsetWidth;
}

measure();
window.addEventListener('resize', measure);

/* -----------------------------
   Infinite animation
----------------------------- */

function animate() {
    if (!isDragging) {
        position -= speed;
    }

    if (position <= -groupWidth) {
        position += groupWidth;
    }

    if (position >= 0) {
        position -= groupWidth;
    }

    track.style.transform = `translate3d(${position}px,0,0)`;

    requestAnimationFrame(animate);
}

animate();

/* -----------------------------
   Drag support
----------------------------- */

function startDrag(x) {
    isDragging = true;
    startX = x;
}

function drag(x) {
    if (!isDragging) return;

    const delta = x - startX;
    startX = x;

    position += delta;
}

function stopDrag() {
    isDragging = false;
}

/* Mouse */
container.addEventListener('mousedown', e => startDrag(e.pageX));
container.addEventListener('mousemove', e => drag(e.pageX));
container.addEventListener('mouseup', stopDrag);
container.addEventListener('mouseleave', stopDrag);

/* Touch */
container.addEventListener('touchstart', e => startDrag(e.touches[0].pageX));

container.addEventListener('touchmove', e => {
    drag(e.touches[0].pageX);
});

container.addEventListener('touchend', stopDrag);

/* -----------------------------
   Dynamic line glow height
----------------------------- */

function updateLineGlowHeight() {
    if (container && lineGlow) {
        lineGlow.style.height = `${container.offsetHeight}px`;
    }
}

updateLineGlowHeight();
window.addEventListener('resize', updateLineGlowHeight);