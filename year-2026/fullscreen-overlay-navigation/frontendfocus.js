$(".navT").on("click", function(){
  $(this).toggleClass("active");
  $("#menu").toggleClass("open");
  $(".content").toggleClass("shift");
  })