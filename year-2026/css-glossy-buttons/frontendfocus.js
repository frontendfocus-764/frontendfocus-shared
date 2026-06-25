const buttonContainer = document.querySelectorAll('.dark-shine-button-wrapper');

buttonContainer.forEach(button => {
button.addEventListener('pointermove', function(e) {
var target = target || e.target;
const buttonRect = target.getBoundingClientRect();
const mouseX = ((e.clientX - buttonRect.left) / buttonRect.width);
const mouseY = ((e.clientY - buttonRect.top) / buttonRect.height);

button.style.setProperty('--bmx', mouseX * 100 + '%');
button.style.setProperty('--bmy', mouseY * 100 + '%');
});
});
