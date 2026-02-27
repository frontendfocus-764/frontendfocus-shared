$(document).ready(function () {

  // Initiate zoom
  var $zoom = $('.zoom').magnify();

  // Initiate carousel
  $('.owl-carousel').owlCarousel({
    items: 1,
    loop: true,
    margin: 10,
    nav: true,
    onTranslated: function () {
      
      // Destroy previous zoom
      $('.zoom').data('magnify') && $('.zoom').data('magnify').destroy();

      // Reinitialize zoom
      $zoom = $('.zoom').magnify();
    }
  });

});