$(document).ready(function () {
  $(".search .search__btn").click(function () {
    $(".search").addClass("search--visible");
  });
  $(document).on("click", function (e) {
    if ($(e.target).closest(".search").length === 0) {
      $(".search").removeClass("search--visible");
    }
  });
});