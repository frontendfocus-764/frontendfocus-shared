const canvas = document.getElementById('lovebirds');
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.41.0';
script.onload = () => {
  let pointerX = 0;
  let pointerY = 0;
  let pointerInside = false;
  let player;

  function updateCursor() {
    if (!player?.viewModelInstance) return;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width, rect.height) / 2;
    if (!scale) return;
    const cursorX = player.viewModelInstance.number('cursor_x_pos');
    const cursorY = player.viewModelInstance.number('cursor_y_pos');
    if (cursorX) cursorX.value = pointerInside ? (pointerX - (rect.left + rect.width / 2)) / scale : 0;
    if (cursorY) cursorY.value = pointerInside ? (pointerY - (rect.top + rect.height / 2)) / scale : 0;
  }

  canvas.addEventListener('pointermove', event => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerInside = true;
    updateCursor();
  });
  canvas.addEventListener('pointerleave', () => {
    pointerInside = false;
    updateCursor();
  });

  player = new rive.Rive({
    src: 'https://lovebirds-embed.vercel.app/lovebirds_v1.riv',
    canvas,
    autoplay: false,
    autoBind: false,
    stateMachine: 'State Machine 1',
    fit: rive.Fit.Contain,
    alignment: rive.Alignment.Center,
    onLoad: () => {
      player.resizeDrawingSurfaceToCanvas();
      const viewModel = player.viewModelByName('View Model 1');
      if (viewModel) player.bindViewModelInstance(viewModel.defaultInstance());
      player.play('State Machine 1');
      updateCursor();
    }
  });

  new ResizeObserver(() => {
    player?.resizeDrawingSurfaceToCanvas();
    updateCursor();
  }).observe(canvas);
};
document.head.appendChild(script);
