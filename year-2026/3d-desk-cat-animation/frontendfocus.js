const card = document.getElementById('card');
const cat = document.getElementById('cat');
const purrFill = document.getElementById('purrFill');
const statusText = document.getElementById('status-text');

let isPetting = false;
let purrLevel = 0;
let petInterval;

// Track mouse for 3D tilt & eye movement
window.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const cardCenterX = rect.left + rect.width / 2;
  const cardCenterY = rect.top + rect.height / 2;
  
  // Calculate relative offset from card center (-1 to 1)
  const offsetX = (e.clientX - cardCenterX) / (window.innerWidth / 2);
  const offsetY = (e.clientY - cardCenterY) / (window.innerHeight / 2);
  
  // Update CSS Custom Variables
  card.style.setProperty('--ry', `${offsetX * 15}deg`);
  card.style.setProperty('--rx', `${-offsetY * 15}deg`);
  card.style.setProperty('--mx', `${offsetX * 12}px`);
  card.style.setProperty('--my', `${offsetY * 12}px`);
});

// Reset perspective when cursor leaves window
window.addEventListener('mouseleave', () => {
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--mx', '0px');
  card.style.setProperty('--my', '0px');
});

// Interactive Petting Mechanics
card.addEventListener('mousedown', startPetting);
card.addEventListener('mouseup', stopPetting);
card.addEventListener('mouseleave', stopPetting);

// Touch Support for mobile preview
card.addEventListener('touchstart', (e) => { startPetting(e.touches[0]); });
card.addEventListener('touchend', stopPetting);

function startPetting(e) {
  isPetting = true;
  cat.classList.add('purring');
  statusText.textContent = 'Purring... ❤️';
  
  petInterval = setInterval(() => {
    if (purrLevel < 100) {
      purrLevel += 4;
      purrFill.style.width = `${purrLevel}%`;
    }
    spawnHeart(e);
  }, 100);
}

function stopPetting() {
  if (!isPetting) return;
  isPetting = false;
  cat.classList.remove('purring');
  statusText.textContent = purrLevel >= 80 ? 'Happy!' : 'Curious';
  clearInterval(petInterval);
  
  // Slowly drain purr meter over time
  const drain = setInterval(() => {
    if (purrLevel > 0 && !isPetting) {
      purrLevel -= 2;
      purrFill.style.width = `${purrLevel}%`;
    } else {
      clearInterval(drain);
      if (!isPetting) statusText.textContent = 'Curious';
    }
  }, 100);
}

function spawnHeart(e) {
  if (!e) return;
  const heart = document.createElement('div');
  heart.className = 'heart-particle';
  heart.innerHTML = '♥';
  
  const rect = card.getBoundingClientRect();
  const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
  const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
  
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  
  card.appendChild(heart);
  setTimeout(() => heart.remove(), 1000);
}