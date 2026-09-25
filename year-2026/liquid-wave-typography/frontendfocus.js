const heroContainer = document.querySelector('.hero-container');

// Adds a subtle, floaty parallax effect to the entire hero section
document.addEventListener('mousemove', (e) => {
  // Dividing by 40 creates a very slight, premium-feeling movement
  const x = (window.innerWidth / 2 - e.pageX) / 40;
  const y = (window.innerHeight / 2 - e.pageY) / 40;
  
  heroContainer.style.transform = `translate(${x}px, ${y}px)`;
});