const neonText = document.getElementById('neonText');
const textInput = document.getElementById('textInput');
const neonColor = document.getElementById('neonColor');
const colorHex = document.getElementById('colorHex');
const glowIntensity = document.getElementById('glowIntensity');
const blinkBtn = document.getElementById('blinkBtn');
const blinkSpeed = document.getElementById('blinkSpeed');
const blinkRate = document.querySelector('.blink-rate');

let isBlinking = false;
let blinkInterval;

// Update neon text
function updateNeon() {
  const text = textInput.value || 'CYBERPUNK';
  const color = neonColor.value;
  const intensity = glowIntensity.value;
  
  neonText.textContent = text;
  neonText.style.color = color;
  neonText.style.textShadow = `
    0 0 ${intensity}px ${color},
    0 0 ${intensity * 2}px ${color},
    0 0 ${intensity * 3}px ${color}
  `;
  
  colorHex.value = color;
}

// Sync color inputs
neonColor.addEventListener('input', () => {
  colorHex.value = neonColor.value;
  updateNeon();
});

colorHex.addEventListener('input', () => {
  if (/^#[0-9A-F]{6}$/i.test(colorHex.value)) {
    neonColor.value = colorHex.value;
    updateNeon();
  }
});

// Handle blink effect
blinkBtn.addEventListener('click', () => {
  isBlinking = !isBlinking;
  
  if (isBlinking) {
    blinkRate.style.display = 'block';
    blinkSpeed.disabled = false;
    startBlinking();
  } else {
    blinkRate.style.display = 'none';
    blinkSpeed.disabled = true;
    stopBlinking();
    updateNeon();
  }
});

function startBlinking() {
  const speed = parseInt(blinkSpeed.value);
  let isOn = true;
  
  blinkInterval = setInterval(() => {
    if (isOn) {
      neonText.style.opacity = '0.2';
    } else {
      neonText.style.opacity = '1';
    }
    isOn = !isOn;
  }, speed / 2);
}

function stopBlinking() {
  clearInterval(blinkInterval);
}

// Update blink speed
blinkSpeed.addEventListener('input', () => {
  if (isBlinking) {
    stopBlinking();
    startBlinking();
  }
});

// Initialize
textInput.addEventListener('input', updateNeon);
glowIntensity.addEventListener('input', updateNeon);
updateNeon();