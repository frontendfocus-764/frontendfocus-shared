let body = document.body
let bodyWidth = body.offsetWidth;
let bodyHeight = body.offsetHeight;

function checkBodyWithAndHeight() {
    let timoeutId = setTimeout(() => {
        bodyWidth = body.offsetWidth;
        bodyHeight = body.offsetHeight;
        clearTimeout(timoeutId)
        checkBodyWithAndHeight()
    }, 500)
}

function toggleBodyAnimation() {
    let randomTimeForBodyAnimation = Math.floor(Math.random() * 7000)

    let setTimeoutId = setTimeout(() => {
        body.classList.toggle("body-animation")
        clearInterval(setTimeoutId)
        toggleBodyAnimation()
    }, randomTimeForBodyAnimation)
}
toggleBodyAnimation()

function createRainDrop() {
    let position = -150;
    let newLeftPosition = 2
    let puddleWidth = 0;

    for (let i = 0; i < 150; i++) {
        let rainDrop = document.createElement("span")
        rainDrop.classList.add("raindrop")
        rainDrop.id = `${i}`
        body.appendChild(rainDrop)

        checkBodyWithAndHeight()

        let randomLeftPosition = Math.floor(Math.random() * bodyWidth)
        let randomTopPosition = Math.floor(Math.random() * (bodyHeight - bodyHeight + 150))
        let randomHeight = Math.floor(2 + (Math.random() * 5))

        rainDrop.style.height = randomHeight + "px"
        rainDrop.style.top = randomTopPosition + "px"
        rainDrop.style.left = randomLeftPosition + "px"

        if (parseInt(rainDrop.style.top) > bodyHeight) {
            rainDrop.remove()
            console.log("test")
        }

        function rain() {
            let setIntervalId = setInterval(() => {
                position = position + 2
                randomTopPosition = randomTopPosition + position
                rainDrop.style.top = randomTopPosition + "px"

                puddleWidth = puddleWidth + 2
                if (puddleWidth > 700) {
                    puddleWidth = 0
                }

                if (parseInt(rainDrop.style.top) > bodyHeight - 80) {
                    let puddle = document.createElement("span")
                    puddle.classList.add("puddle")
                    body.appendChild(puddle)

                    puddle.style.width = puddleWidth + "px";
                    puddle.style.top = randomTopPosition + "px"
                    puddle.style.left = parseInt(rainDrop.style.left) - (puddleWidth / 2) + "px"
                    let timeoutId = setTimeout(() => {
                        puddle.classList.add("puddle-drop")
                        clearTimeout(timeoutId)
                        puddle.remove()
                        puddleWidth = 0
                    }, 1000)


                    let puddleDropleft = 0;
                    for (let j = 0; j < 2; j++) {
                        if (j = 0) {
                            puddleDropleft = -5;
                        }
                        if (j = 1) {
                            puddleDropleft = 2;
                        }
                        let puddleDrop = document.createElement("span")
                        puddleDrop.classList.add("puddle-drop")
                        puddleDrop.style.left = puddleDropleft + "px"
                        puddle.appendChild(puddleDrop)

                    }

                    position = 0;
                    randomTopPosition = 0;
                    rainDrop.style.left = randomLeftPosition + "px";
                }
                clearInterval(setIntervalId)
                rain()
            }, 35)
        }
        rain()

    }

}
createRainDrop()