$(document).ready(function() {
  
  $('.navbar-toggle').mouseenter(function() {
    if ($(this).hasClass('active')) {
    } else {
      $('.navbar-toggle').animate ({
          width: '60px',
          height: '60px'
        }, 200, function(){
          // anim complete
        });
    }
    });
  
  
    $('.navbar-toggle').mouseleave(function() {
      if ($(this).hasClass('active')) {} else {
    $('.navbar-toggle').animate ({
        width: '50px',
        height: '50px'
      }, 200, function(){
        // anim complete
      });
      }
  });
 
  
  $('.navbar-toggle').click(function() {
    var $this = $(this);
    
    if ($('.collapse').hasClass('open')) {
      $('.navbar > li').slideUp("fast");  
      $this.removeClass('active');
      $('.collapse').removeClass('open');  
      $this.animate ({
        width: '50px',
        height: '50px',
        borderBottomRightRadius: '12px'
      }, 200, function(){
        // anim complete
      });
      $('.close').hide('fast');
      setTimeout(function() {
        $this.children('.icon-bar').show("fast");
      }, 200);
    } 


    else {
      $this.delay("100").addClass('active');
      //$('.collapse').stop(true).slideDown("fast");
      $this.children('.icon-bar').hide();
      $this.delay("220").animate ({
        width: '300px',
        height: '275px',
        borderBottomRightRadius: '275px'
      }, 200, function(){
        // anim complete
      });
      setTimeout(function() {
        $('.navbar > li').slideDown("fast");
        $('.collapse').addClass('open');
        $('.close').show('fast');
      }, 500);
    }
  });
});