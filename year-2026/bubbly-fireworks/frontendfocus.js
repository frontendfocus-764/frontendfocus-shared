const color = ['#f7ae1a', '#f37021', '#db2f32', '#809d3c', '#6ebbdf', '#003278']
const count = 45

const renderFireworkBubble = (target) => {
    const bubble = document.createElement('div')
    const container = document.createElement('div')

    bubble.classList.add('firework-bubble')
    container.classList.add('firework-bubble-container')
    target.appendChild(container)
    container.appendChild(bubble)

    gsap.set(container, {
        rotation: gsap.utils.random(0, 360),
    })

    const tween = gsap.fromTo(
        bubble,
        {
            background: gsap.utils.random(color),
            scale: gsap.utils.random(5, 30) * 0.1,
            x: gsap.utils.random(3, 21),
            y: 0,
        },
        {
            scale: 0,
            x: gsap.utils.random(77, 211),
            y: gsap.utils.random(-21, 21),
            duration: gsap.utils.random(0.93, 1.37),
            ease: 'power4.out',
            onComplete: () => {
                bubble.remove()
                container.remove()
                tween.kill()
                if (target.children.length === 0) {
                    target.remove()
                }
            },
        },
    )
}

const renderFireworkRing = (target) => {
    const ring = document.createElement('div')
    const size = gsap.utils.random(123, 234)

    ring.classList.add('firework-ring')
    target.appendChild(ring)

    const tween = gsap.to(ring, {
        width: size,
        height: size,
        opacity: 0,
        duration: 0.77,
        ease: 'power3.out',
        onComplete: () => {
            ring.remove()
            tween.kill()
        },
    })
}

const renderFirework = (event) => {
    const x = event.touches ? event.touches[0].clientX : event.clientX
    const y = event.touches ? event.touches[0].clientY : event.clientY

    if (x < 1) {
        return
    }

    const firework = document.createElement('div')
    firework.classList.add('firework')
    document.querySelector('.fireworks').appendChild(firework)
    gsap.set(firework, { top: y, left: x })

    renderFireworkRing(firework)

    for (let i = 0; i < count; i++) {
        renderFireworkBubble(firework)
    }
}

document.querySelector('.bubbly-fireworks').addEventListener('click', renderFirework)

setTimeout(() => {
    renderFirework({ clientX: window.innerWidth / 2 + 77, clientY: window.innerHeight / 2 - 77 })
}, 345)