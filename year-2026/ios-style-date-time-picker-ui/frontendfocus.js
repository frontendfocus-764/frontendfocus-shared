if (!CSS.supports('scroll-start: auto')) {
  window.onload = () => {
    document.querySelectorAll('[data-scroll-start-target]').forEach((item, idx) => {
      setTimeout(function () {
        item.scrollIntoView({ block: 'center', inline: 'start', behavior: 'instant' });
      }, 1 * idx);
    });
  };
}

document.querySelectorAll('.picker > span').forEach(scroller => {
  scroller.addEventListener('scrollsnapchange', e => {
    console.info('Snap Changed', e === null || e === void 0 ? void 0 : e.snapTargetBlock);

    output.animate([{
      boxShadow: '0 0 0 0px hsl(200 100% 50% / 50%)' },
    {
      boxShadow: '0 0 0 20px hsl(200 100% 50% / 0%)' }],
    {
      duration: 900,
      iterations: 1,
      easing: 'ease-out' });

  });

  scroller.addEventListener('scrollsnapchanging', e => {
    console.info('Snap Changing', e === null || e === void 0 ? void 0 : e.snapTargetBlock);
    const snapTarget = e === null || e === void 0 ? void 0 : e.snapTargetBlock;

    // the title matches the <output> ID
    let col = snapTarget.parentElement.getAttribute('title');

    // put the text of the snapTarget into the relevant <output> span
    window[col].textContent = snapTarget.innerText;
  });
});