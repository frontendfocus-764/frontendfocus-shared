const box = document.querySelector('.box');
                          
const rotateBtn = document.querySelector('.rotate-btn');

rotateBtn.addEventListener('click', () => {
  box.classList.toggle('rotate');
})