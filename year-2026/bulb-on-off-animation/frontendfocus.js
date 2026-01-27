const bulb = document.getElementById('bulb');
const toggleBtn = document.getElementById('toggleBtn');

let isOn = false;

toggleBtn.addEventListener('click', () => {
  isOn = !isOn;

  if (isOn) {
    bulb.src = 'bulb-on.png';
    bulb.classList.add('on');
    toggleBtn.textContent = 'TURN OFF';
    toggleBtn.classList.add('active');
  } else {
    bulb.src = 'bulb-off.png';
    bulb.classList.remove('on');
    toggleBtn.textContent = 'TURN ON';
    toggleBtn.classList.remove('active');
  }
});
