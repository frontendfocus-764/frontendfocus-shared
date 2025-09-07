document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector("nav");

    const liNum = nav.querySelectorAll("ul li").length;
    const appHeight = liNum * 50 + "px";

    hamburger.addEventListener("click", function () {
        hamburger.querySelector(".line1").classList.toggle("line1_anim");
        hamburger.querySelector(".line2").classList.toggle("line2_anim");
        hamburger.querySelector(".line3").classList.toggle("line3_anim");

        nav.classList.toggle("nav_anim");
        nav.style.maxHeight = nav.classList.contains("nav_anim") ? appHeight : "0";
    });
});