$.fn.duplicate = function(doClone) {
  const source = $(this);
  const copy = doClone ? source.clone(true, true) : source;

  const offset = source.offset();
  const width = source.outerWidth();
  const height = source.outerHeight();

  const cloneWrapper = $('<div class="flyer-wrapper"></div>').css({
    position: 'absolute',
    top: offset.top,
    left: offset.left,
    width: width,
    height: height,
    zIndex: 1000,
    pointerEvents: 'none'
  }).append(copy.clone());

  $('body').append(cloneWrapper);
  return cloneWrapper;
};

$.fn.flyTo = function(target, callback) {
  const source = $(this);
  const targetOffset = target.offset();
  const sourceWidth = source.outerWidth();
  const sourceHeight = source.outerHeight();
  const targetWidth = target.outerWidth();
  const targetHeight = target.outerHeight();

  const targetX = targetOffset.left + (targetWidth / 2) - (sourceWidth / 2);
  const targetY = targetOffset.top + (targetHeight / 2) - (sourceHeight / 2);

  source.animate({
    top: targetY,
    left: targetX,
    opacity: 0.3,
    transform: 'scale(0.3)'
  }, 1000, function () {
    source.remove();
    if (callback) callback();
  });
};

$.fn.loading = function() {
  return this.addClass('loading');
};

$.fn.stopLoading = function() {
  return this.removeClass('loading');
};

$(document).ready(function(){
  $('.add-to-cart').on('click', function(){
    const button = $(this);
    const cart = $('.cart-anchor');
    const cartIcon = $(this).find('.icon-cart');
    const productName = $(this).closest('.product-card').find('.product-name');

    $('html, body').animate({
      scrollTop: cart.position().top
    });

    const flyer = $('<div class="flyer-combo"></div>').css({
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }).append(cartIcon.clone().removeClass('white').addClass('grey')).append(productName.clone());

    const flyerWrapper = $('<div></div>').css({
      position: 'absolute',
      top: cartIcon.offset().top,
      left: cartIcon.offset().left,
      zIndex: 9999,
      opacity: 1
    }).append(flyer).appendTo('body');

    $(flyer).find('.cart-line-3').animate({ top: '-=25px' }, 300);

    flyerWrapper.animate({
      top: cart.offset().top,
      left: cart.offset().left,
      opacity: 0.3,
      transform: 'scale(0.3)'
    }, 1000, function(){
      flyerWrapper.remove();
      const nb = $('.cart-nb');
      nb.text(parseInt(nb.text()) + 1).animate({ top: '-=5px' }, 100).animate({ top: '+=5px' }, 100);
      button.stopLoading();
      cartIcon.css({ opacity: 1 });
    });

    button.loading();
    cartIcon.css({ opacity: 0 });
  });
});