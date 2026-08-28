$(document).ready(function() {
    $('#btn').click(function() {
        $('#btn').toggleClass("cart_clk");

    });
    $("#btn").one("click", function() {
        $('.cart .fa').attr('data-before', '1');
    });

    var prnum = $('.num').text();
    $('.inc').click(function() {
        if (prnum > 0) {
            prnum++;
            $('.num').text(prnum);
            $('.cart .fa').attr('data-before', prnum);
        }

    });
    $('.dec').click(function() {
        if (prnum > 1) {
            prnum--;
            $('.num').text(prnum);
            $('.cart .fa').attr('data-before', prnum);
        }

    });

});