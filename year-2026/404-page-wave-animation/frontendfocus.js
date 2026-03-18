// --- Global P5.js Variables ---

let particles = [];

let particleColorBase = 150; // Default light mode gray

let particleAlpha = 80;

// --- P5.js Sketch ---

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);

  canvas.parent("canvas-container"); // Attach canvas to the div

  updateColors(); // Set initial colors based on mode
}

function draw() {
  // Use background with alpha for subtle trails effect

  // Adjust alpha (4th arg) for more/less trail (lower = more)

  background(
    getComputedStyle(document.documentElement).getPropertyValue("--bg-color") +
      "40"
  ); // Use CSS var for bg

  // Create new particles periodically

  if (frameCount % 2 === 0 && particles.length < 150) {
    // Limit particle count

    let p = new Particle();

    particles.push(p);
  }

  // Update and display particles

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();

    particles[i].display();

    if (particles[i].isFinished()) {
      // Remove particle

      particles.splice(i, 1);
    }
  }
}

// --- Particle Class ---

class Particle {
  constructor() {
    // Start near bottom, random x

    this.x = random(width);

    this.y = random(height + 50, height + 200); // Start below screen

    this.vx = random(-0.5, 0.5);

    this.vy = random(-1.5, -0.5); // Move upwards

    this.lifespan = 255; // Alpha value acts as lifespan

    this.size = random(2, 6);
  }

  update() {
    this.x += this.vx;

    this.y += this.vy;

    this.lifespan -= 1.5; // Fade out

    // Add slight wiggle

    this.x += random(-0.3, 0.3);

    // Reset if particle goes too far off side (optional)

    if (this.x < -this.size || this.x > width + this.size) {
      this.x = random(width); // Re-appear randomly
    }
  }

  display() {
    noStroke();

    // Use dynamically set color base and alpha

    fill(particleColorBase, this.lifespan * (particleAlpha / 255)); // Adjust alpha based on lifespan

    ellipse(this.x, this.y, this.size);
  }

  isFinished() {
    return this.lifespan < 0 || this.y < -this.size; // Off top or faded
  }
}

// --- P5 Utility Functions ---

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// --- Color Mode Handling ---

function updateColors() {
  // Check the computed style which includes @media query results

  let currentParticleBase = getComputedStyle(document.documentElement)
    .getPropertyValue("--particle-color-base")
    .trim();

  let currentParticleAlpha = getComputedStyle(document.documentElement)
    .getPropertyValue("--particle-alpha")
    .trim();

  particleColorBase = parseInt(currentParticleBase, 10) || 150; // Use default if parsing fails

  particleAlpha = parseInt(currentParticleAlpha, 10) || 80;
}

// Listen for changes in color scheme

if (window.matchMedia) {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateColors);
}

// --- Anime.js Animations (Run after DOM is ready) ---

document.addEventListener("DOMContentLoaded", () => {
  if (typeof anime === "undefined") {
    console.error("Anime.js not loaded!");

    return;
  }

  // Staggered Wobbly Animation for "404" digits

  anime({
    targets: ".status-code .digit",

    translateY: [
      { value: -10, duration: 800 },

      { value: 0, duration: 800 }
    ],

    rotate: [
      { value: "2deg", duration: 600 },

      { value: "-2deg", duration: 600 },

      { value: "0deg", duration: 600 }
    ],

    opacity: [
      { value: 0.5, duration: 500 },

      { value: 1, duration: 500 }
    ],

    loop: true,

    delay: anime.stagger(150), // Stagger the start of each digit's animation

    direction: "alternate",

    easing: "easeInOutSine"
  });

  // Simple fade-in for message and button

  anime({
    targets: [".message", ".home-link"],

    opacity: [0, 1],

    translateY: [20, 0],

    duration: 1000,

    delay: anime.stagger(200, { start: 500 }), // Start after 500ms, stagger

    easing: "easeOutExpo"
  });
});
