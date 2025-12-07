const srcTxt = document.querySelector(".src-txt"),
    topTxt = document.querySelector(".top-txt"),
    txtContent = srcTxt.textContent,
    bb = srcTxt.getBoundingClientRect();

for (let i = 0; i <= bb.width * .55; i++) {
    const div = document.createElement("div");
    topTxt.append(div);
    gsap.set(div, {
        position: "absolute",
        width: 4,
        height: bb.height,
        x: i * 2,
        y: -bb.height,
        textIndent: -i * 2,
        color: "#fff",
        overflow: "hidden",
        textContent: txtContent
    });
}

gsap.set('.wrapper', {
    rotate: -50,
    skewY: 22,
    scaleX: 0.75
});

const tl = gsap.timeline({
    paused: true,
    defaults: { duration: 0.25, ease: "power3.inOut", yoyoEase: "sine.inOut" }
})
    .to('.top-txt *', {
        y: "-=33",
        stagger: {
            amount: 1,
            yoyo: true,
            repeat: 1,
            ease: "none"
        }
    })

gsap.timeline()
    .fromTo(tl, { progress: 0.9 }, { duration: 1.5, progress: 0.1, ease: "power2.inOut" })
    .to(tl, { duration: 4, progress: 0.4, ease: "elastic.out(0.8)" })

window.onpointermove = (e) => {
    const xp = e.x / innerWidth;
    gsap.to(tl, { progress: xp, overwrite: true });
    gsap.to('.wrapper', {
        x: gsap.utils.mapRange(0, 1, 30, -30, xp),
        y: gsap.utils.mapRange(0, 1, -30, 30, xp)
    });
}

window.onmousedown = (e) => {
    gsap.timeline({ defaults: { duration: 0.2, overwrite: 'auto' } })
        .to('.top-txt', {
            y: -25
        })
        .to('.src-txt', {
            filter: 'blur(2px)',
            opacity: 0.85,
            scale: 0.96,
            transformOrigin: '45px 99px'
        }, 0)
}

window.onmouseup = (e) => {
    gsap.timeline({ defaults: { ease: 'bounce' } })
        .to('.top-txt', { y: 0 })
        .to('.src-txt', {
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1
        }, 0)
}