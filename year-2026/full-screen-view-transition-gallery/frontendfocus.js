const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    const alreadyFullscreen = item.classList.contains('fullscreen');  

    document.startViewTransition(() => {
      galleryItems.forEach(i => i.classList.remove('fullscreen'));

      if (!alreadyFullscreen) {
        item.classList.add('fullscreen');
      }
    });
  });
});

