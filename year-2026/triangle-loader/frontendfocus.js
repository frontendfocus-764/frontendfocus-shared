jQuery(function($) {
  $('[data-origin]').each(function(index) {
    if ($(this).is('[data-origin]')) {
			var tOrig = $(this).attr('data-origin');
			if (tOrig) {
				gsap.set($(this).get(0), { transformOrigin: tOrig });
			}
		}
	});
  
  gsap.to('g.circle-spinner', { rotation: 360, duration: 1.5, repeat: -1, ease: 'linear' });
});

gsap.to('.penrose-bg', { opacity: 0.25, yoyo: true, duration: 3.5, repeat: -1 });