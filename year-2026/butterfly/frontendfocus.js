/**
 * Digital Metamorphosis
 * An interactive demonstration of CSS ::before/::after pseudo-elements
 * and JavaScript before()/after() methods for the CodePen Challenge
 */

// ============================================
// DOM ELEMENTS
// ============================================
const caterpillar = document.getElementById("caterpillar");
const cocoon = document.getElementById("cocoon");
const butterfly = document.getElementById("butterfly");
const transformBtn = document.getElementById("transformBtn");
const statusText = document.getElementById("statusText");
const particlesContainer = document.getElementById("particles");
const phaseDots = document.querySelectorAll(".phase-dot");
const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");

// ============================================
// STATE MANAGEMENT
// ============================================
let currentPhase = 0;
const phases = [
	{
		name: "Caterpillar",
		status: "The journey begins...",
		buttonText: "Transform"
	},
	{
		name: "Cocoon",
		status: "Transformation in progress...",
		buttonText: "Emerge"
	},
	{
		name: "Butterfly",
		status: "Metamorphosis complete!",
		buttonText: "Restart"
	}
];

// ============================================
// PARTICLE SYSTEM
// ============================================

/**
 * Creates a single particle element
 * Demonstrates using JavaScript after() method to insert elements
 */
function createParticle(x, y, color, size) {
	const particle = document.createElement("div");
	particle.className = "particle";
	particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                --tx: ${(Math.random() - 0.5) * 200}px;
                --ty: ${(Math.random() - 0.5) * 200}px;
                animation-duration: ${3 + Math.random() * 4}s;
                box-shadow: 0 0 ${size * 2}px ${color};
            `;
	return particle;
}

/**
 * Creates a burst of particles
 * Uses JavaScript after() method to insert particles into the DOM
 */
function createParticleBurst(centerX, centerY, count, colors) {
	const fragment = document.createDocumentFragment();

	for (let i = 0; i < count; i++) {
		const angle = (Math.PI * 2 * i) / count;
		const distance = Math.random() * 100;
		const x = centerX + Math.cos(angle) * distance;
		const y = centerY + Math.sin(angle) * distance;
		const color = colors[Math.floor(Math.random() * colors.length)];
		const size = 4 + Math.random() * 8;

		const particle = createParticle(x, y, color, size);
		fragment.appendChild(particle);

		// Remove particle after animation completes
		setTimeout(() => {
			if (particle.parentNode) {
				particle.remove();
			}
		}, 8000);
	}

	// Using after() method to insert particles
	// This demonstrates the JavaScript after() method from the challenge
	const firstChild = particlesContainer.firstChild;
	if (firstChild) {
		firstChild.after(fragment);
	} else {
		particlesContainer.appendChild(fragment);
	}
}

/**
 * Creates sparkle effects using before() and after() methods
 */
function createSparkles(element) {
	const rect = element.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;

	const colors = ["#00d4ff", "#7b2cbf", "#ff6b35", "#ffd700"];
	createParticleBurst(centerX, centerY, 30, colors);
}

/**
 * Creates magical elements using before() method
 * Inserts decorative elements before the target
 */
function addMagicalElements(targetElement) {
	// Create a magical glow element
	const glowElement = document.createElement("div");
	glowElement.style.cssText = `
                position: absolute;
                width: 200px;
                height: 200px;
                background: radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                animation: sparkle 2s ease-out forwards;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            `;

	// Using before() method to insert the glow before the target
	// This demonstrates the JavaScript before() method from the challenge
	targetElement.before(glowElement);

	setTimeout(() => {
		glowElement.remove();
	}, 2000);
}

/**
 * Creates trailing elements using after() method
 * Inserts decorative elements after the target
 */
function addTrailingElements(targetElement) {
	const trailElement = document.createElement("div");
	trailElement.style.cssText = `
                position: absolute;
                width: 150px;
                height: 150px;
                background: radial-gradient(circle, rgba(123, 44, 191, 0.4), transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                animation: sparkle 1.5s ease-out forwards;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            `;

	// Using after() method to insert the trail after the target
	targetElement.after(trailElement);

	setTimeout(() => {
		trailElement.remove();
	}, 1500);
}

// ============================================
// PHASE TRANSITIONS
// ============================================

/**
 * Updates the phase indicator dots
 */
function updatePhaseIndicator(phase) {
	phaseDots.forEach((dot, index) => {
		if (index <= phase) {
			dot.classList.add("active");
		} else {
			dot.classList.remove("active");
		}
	});

	// Update progress lines
	if (phase >= 1) {
		line1.classList.add("progress-1");
	} else {
		line1.classList.remove("progress-1");
	}

	if (phase >= 2) {
		line2.classList.add("progress-2");
	} else {
		line2.classList.remove("progress-2");
	}
}

/**
 * Phase 0 to Phase 1: Caterpillar to Cocoon
 */
function toCocoon() {
	// Add magical effect before transition
	addMagicalElements(caterpillar);
	createSparkles(caterpillar);

	setTimeout(() => {
		caterpillar.classList.add("hidden");

		setTimeout(() => {
			cocoon.classList.add("visible");
			addTrailingElements(cocoon);

			// Add status message elements using after()
			updateStatus(phases[1].status);
			updatePhaseIndicator(1);
			transformBtn.textContent = phases[1].buttonText;
			currentPhase = 1;
		}, 400);
	}, 300);
}

/**
 * Phase 1 to Phase 2: Cocoon to Butterfly
 */
function toButterfly() {
	// Add magical effect
	addMagicalElements(cocoon);
	createSparkles(cocoon);

	cocoon.classList.add("cracking");

	setTimeout(() => {
		cocoon.classList.remove("visible", "cracking");

		setTimeout(() => {
			butterfly.classList.add("visible");

			// Create celebration particles
			const rect = butterfly.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			createParticleBurst(centerX, centerY, 50, [
				"#00d4ff",
				"#7b2cbf",
				"#ff6b35",
				"#ffd700",
				"#ffffff"
			]);

			setTimeout(() => {
				butterfly.classList.add("flying");
				addTrailingElements(butterfly);
			}, 500);

			updateStatus(phases[2].status);
			updatePhaseIndicator(2);
			transformBtn.textContent = phases[2].buttonText;
			currentPhase = 2;

			// Add celebratory elements using before() and after()
			addCelebration();
		}, 500);
	}, 1000);
}

/**
 * Reset to initial state
 */
function reset() {
	butterfly.classList.remove("visible", "flying");
	cocoon.classList.remove("visible", "cracking");

	setTimeout(() => {
		caterpillar.classList.remove("hidden");
		updateStatus(phases[0].status);
		updatePhaseIndicator(0);
		transformBtn.textContent = phases[0].buttonText;
		currentPhase = 0;
	}, 400);
}

/**
 * Adds celebration elements using before() and after() methods
 */
function addCelebration() {
	const container = document.getElementById("creatureContainer");

	// Create multiple celebration elements
	for (let i = 0; i < 5; i++) {
		const celebrationElement = document.createElement("div");
		celebrationElement.className = "celebration-sparkle";
		celebrationElement.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: ${["#ffd700", "#00d4ff", "#ff6b35"][i % 3]};
                    border-radius: 50%;
                    left: ${20 + Math.random() * 60}%;
                    top: ${20 + Math.random() * 60}%;
                    animation: sparkle ${1 + Math.random()}s ease-out forwards;
                    animation-delay: ${i * 0.1}s;
                    pointer-events: none;
                `;

		// Alternate between before() and after() to demonstrate both methods
		if (i % 2 === 0) {
			butterfly.before(celebrationElement);
		} else {
			butterfly.after(celebrationElement);
		}

		setTimeout(() => {
			celebrationElement.remove();
		}, 2000);
	}
}

/**
 * Updates the status text with animation
 */
function updateStatus(text) {
	statusText.style.opacity = "0";
	setTimeout(() => {
		statusText.textContent = text;
		statusText.style.opacity = "1";
	}, 300);
}

// ============================================
// EVENT LISTENERS
// ============================================

transformBtn.addEventListener("click", () => {
	switch (currentPhase) {
		case 0:
			toCocoon();
			break;
		case 1:
			toButterfly();
			break;
		case 2:
			reset();
			break;
	}
});

// Allow clicking on phase dots to jump to phases (only backward)
phaseDots.forEach((dot) => {
	dot.addEventListener("click", () => {
		const targetPhase = parseInt(dot.dataset.phase);
		if (targetPhase < currentPhase) {
			reset();
		}
	});
});

// ============================================
// BACKGROUND AMBIENT PARTICLES
// ============================================

function createAmbientParticles() {
	setInterval(() => {
		const x = Math.random() * window.innerWidth;
		const y = Math.random() * window.innerHeight;
		const colors = [
			"rgba(0, 212, 255, 0.5)",
			"rgba(123, 44, 191, 0.5)",
			"rgba(255, 107, 53, 0.3)"
		];
		const color = colors[Math.floor(Math.random() * colors.length)];
		const size = 2 + Math.random() * 4;

		const particle = createParticle(x, y, color, size);
		particlesContainer.appendChild(particle);

		setTimeout(() => {
			if (particle.parentNode) {
				particle.remove();
			}
		}, 8000);
	}, 500);
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
	// Set initial status text transition
	statusText.style.transition = "opacity 0.3s ease";

	// Start ambient particle system
	createAmbientParticles();

	// Log challenge info
	console.log(
		"%c🦋 Digital Metamorphosis",
		"font-size: 20px; font-weight: bold; color: #00d4ff;"
	);
	console.log(
		"%cCodePen Challenge: Before & After",
		"font-size: 14px; color: #7b2cbf;"
	);
	console.log("%cThis demo uses:", "font-size: 12px; color: #888;");
	console.log(
		"%c  • CSS ::before and ::after pseudo-elements",
		"font-size: 12px; color: #4ade80;"
	);
	console.log(
		"%c  • JavaScript before() and after() methods",
		"font-size: 12px; color: #4ade80;"
	);
}

// Start the application
init();
