const wrapper = document.getElementById('scroll-wrapper');
const items = document.querySelectorAll('.timeline-item');
const progressLine = document.getElementById('progressLine');

// INERTIA CONFIG
let targetY = 0;
let currentY = 0;
const lerp = 0.08; 

function frame() {
  currentY += (targetY - currentY) * lerp;
  wrapper.style.transform = `translateY(-${currentY}px)`;

  const vCenter = currentY + (window.innerHeight / 2);

  // Sync Progress Line
  const firstTop = items[0].getBoundingClientRect().top + currentY;
  const lastTop = items[items.length - 1].getBoundingClientRect().top + currentY;
  const range = lastTop - firstTop;
  const prog = ((vCenter - firstTop) / range) * 100;
  progressLine.style.height = `${Math.max(0, Math.min(100, prog))}%`;

  // Sync Step Highlighting & Automatic Border Ignition
  items.forEach((item) => {
    const itemPos = item.getBoundingClientRect().top + currentY;
    // Activate when item is roughly in the middle 60% of the screen
    if (vCenter > itemPos - 50) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  requestAnimationFrame(frame);
}

// INERTIA SCROLL HANDLER
window.addEventListener('wheel', (e) => {
  targetY += e.deltaY;
  targetY = Math.max(0, Math.min(targetY, wrapper.scrollHeight - window.innerHeight));
}, { passive: true });

// LOCAL MOUSE POSITION TRACKING
items.forEach(item => {
  const card = item.querySelector('.glass-card');
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
});

window.addEventListener('load', () => {
  document.body.style.height = wrapper.scrollHeight + 'px';
  frame();
});