const bell = document.querySelector('.bell-container');
const button = document.querySelector('.button');

if (bell && button) {
  button.addEventListener('click', () => {
    bell.classList.toggle('off');
  });
}
