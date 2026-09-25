$(document).ready(function () {
    var canDownload = true;
    $(".fa-check").hide();
    $(".buy").on("click", function () {
        if (canDownload === true) {
            $(this).addClass("loading").find("span, small").hide();
            setTimeout(function () {
                $(".loading").addClass("processing");
                canDownload = false;
                setTimeout(function () {
                    $(".buy").removeClass("processing");
                    setTimeout(function () {
                        $(".buy")
                            .removeClass("loading")
                            .addClass("success")
                            .find(".fa-check")
                            .fadeIn(100);
                        setTimeout(function () {
                            $(".download")
                                .addClass("active")
                                .children()
                                .fadeIn(100, function () {
                                    $('meta[name="theme-color"]').attr("content", "#21d49a");
                                    $(".buy").css("background-color", "#21d49a");
                                });
                        }, 1000);
                    }, 400);
                }, 2800);
            }, 300);
        }
    });
});