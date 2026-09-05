const container = document.getElementById("container");
const boxes = [];
const BOX_COUNT = 14;

let mouse = { x: -999, y: -999 };

// Mouse position
window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Create boxes
for (let i = 0; i < BOX_COUNT; i++) {
  const box = document.createElement("div");
  box.className = "box";
  container.appendChild(box);

  boxes.push({
    el: box,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6
  });
}

function animate() {
  boxes.forEach(b => {
    // Floating motion
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < 0 || b.x > window.innerWidth - 120) b.vx *= -1;
    if (b.y < 0 || b.y > window.innerHeight - 60) b.vy *= -1;

    // Magnetic effect
    const dx = mouse.x - (b.x + 60);
    const dy = mouse.y - (b.y + 30);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      b.x += dx * 0.03;
      b.y += dy * 0.03;
      b.el.classList.add("active");
    } else {
      b.el.classList.remove("active");
    }

    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  });

  requestAnimationFrame(animate);
}

animate();