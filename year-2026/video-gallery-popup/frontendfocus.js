
$(".galleryVid").click(function () {

    var videoSrc = $(this).find("source").attr("src");

    $("#popupVideo source").attr("src", videoSrc);

    $("#popupVideo")[0].load();

    $(".showvideo").fadeIn();

});

$(".close, .overlay").click(function () {

    $(".showvideo").fadeOut();

    $("#popupVideo")[0].pause();

});

const videos = document.querySelectorAll(".galleryVid");
const popup = document.querySelector(".showvideo");
const popupVideo = document.getElementById("popupVideo");
const closeBtn = document.querySelector(".close");

videos.forEach(v => {
    v.addEventListener("click", () => {
        const src = v.querySelector("source").src;
        popupVideo.src = src;
        popup.style.display = "flex";
        popupVideo.play();
    });
});

closeBtn.onclick = () => {
    popup.style.display = "none";
    popupVideo.pause();
};
