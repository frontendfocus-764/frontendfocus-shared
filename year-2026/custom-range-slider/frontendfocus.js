document.documentElement.classList.add('js');

addEventListener('input', e => {
  let _t = e.target;

  _t.style.setProperty('--val', +_t.value);
});