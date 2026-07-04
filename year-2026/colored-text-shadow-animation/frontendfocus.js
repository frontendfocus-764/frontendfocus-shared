const container = document.querySelector('.container');
const text = container.querySelector('h1');
const shadowOffset = 100; 

  function createShadow(e) {
    const { offsetWidth: containerX, offsetHeight: containerY } = container;
    let { clientX: x, clientY: y } = e;
    const shadowX = Math.round((x / containerX * shadowOffset) - (shadowOffset / 2));
    const shadowY = Math.round((y / containerY * shadowOffset) - (shadowOffset / 2));

    text.style.textShadow = `
      ${shadowX}px ${shadowY}px 0 hsl(${x}, 50%, 50%, .5)
    `;
  }
  container.addEventListener('mousemove', createShadow);