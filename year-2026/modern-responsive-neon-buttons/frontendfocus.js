const buttons = document.querySelectorAll(".flux-button");

buttons.forEach((button) => {

    const icon = button.querySelector(".button-icon");
    const label = button.querySelector(".button-label");
    const arrow = button.querySelector(".button-arrow");

    const hover = gsap.timeline({
        paused: true
    });

    hover

    .to(button, {
        scale: 1.08,
        rotateX: 5,
        rotateY: -5,
        duration: .4,
        ease: "power3.out"
    }, 0)

    .to(icon, {
        scale: 1.35,
        rotation: 180,
        duration: .5,
        ease: "back.out(2)"
    }, 0)

    .to(label, {
        letterSpacing: "5px",
        y: -3,
        duration: .3
    }, 0)

    .to(arrow, {
        x: 6,
        y: -6,
        rotation: 45,
        duration: .35,
        ease: "power2.out"
    }, 0);

    /* MOUSE ENTER */

    button.addEventListener("mouseenter", () => {
        hover.play();
    });

    /* MOUSE LEAVE */

    button.addEventListener("mouseleave", () => {
        hover.reverse();
    });

    /* CLICK */

    button.addEventListener("click", () => {

        gsap.fromTo(button,
            { scale: .94 },
            {
                scale: 1.08,
                duration: .5,
                ease: "elastic.out(1, .3)"
            }
        );

    });

});