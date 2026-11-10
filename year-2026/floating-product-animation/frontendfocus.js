let flavorsWheel = document.querySelector(".flavors-wheel")
let container = document.querySelector(".container")
let juicesWheel = document.querySelector(".juices-wheel")
let flavors = document.querySelectorAll("section > .flavors .flavor")
let info = document.querySelector(".info")
let infoTimeout = null

const flavorData = {
    1: {
        juiceTransform: "translate(50%, 50%) rotate(-45deg)",
        flavorsTransform: "translate(-150%, -150%) rotate(-45deg)",
        background: "linear-gradient(90deg, rgba(167,162,244,1) 0%, rgba(112,112,143,1) 35%, rgba(166,149,13,1) 100%, rgba(0,212,255,1) 100%)",
        title: "Orange Juice",
        description: "Orange juice is a liquid extract of the orange tree fruit, produced by squeezing or reaming oranges. It comes in several different varieties, including blood orange, navel oranges, valencia orange, clementine, and tangerine."
    },
    2: {
        juiceTransform: "translate(50%, 50%) rotate(-135deg)",
        flavorsTransform: "translate(-150%, -150%) rotate(-135deg)",
        background: "linear-gradient(90deg, rgb(2, 19, 45) 4%, rgb(120, 109, 181) 49%, rgb(230, 132, 132) 100%, rgb(0, 212, 255) 100%)",
        title: "Plum Juice",
        description: "A luscious elixir extracted from ripe plums. Bursting with rich flavor and natural sweetness, it delivers a refreshing and satisfying experience. Indulge in the succulent essence of plums while enjoying the numerous health benefits it offers."
    },
    3: {
        juiceTransform: "translate(50%, 50%) rotate(-225deg)",
        flavorsTransform: "translate(-150%, -150%) rotate(-225deg)",
        background: "linear-gradient(90deg, rgb(9, 111, 55) 0%, rgb(39, 196, 129) 49%, rgb(47, 209, 232) 100%, rgb(0, 212, 255) 100%)",
        title: "Kiwi Juice",
        description: "A vibrant and tangy elixir extracted from ripe kiwis. Packed with essential nutrients, it offers a refreshing and invigorating experience. The perfect balance of sweetness and tanginess makes it a popular choice for a healthy and flavorful beverage."
    },
    4: {
        juiceTransform: "translate(50%, 50%) rotate(-315deg)",
        flavorsTransform: "translate(-150%, -150%) rotate(-315deg)",
        background: "linear-gradient(90deg, rgb(101, 18, 18) 0%, rgb(186, 44, 44) 49%, rgb(235, 134, 80) 100%, rgb(0, 212, 255) 100%)",
        title: "Strawberry Juice",
        description: "Strawberry Juice is a refreshing fresh fruit juice that is full of vitamin C and antioxidants and lot of invigorating flavor. Apart from fresh and ripe strawberries, this recipe also uses lime juice to make it tantalizing."
    }
}

flavors.forEach((flavor) => {
    flavor.addEventListener("click", () => {
        const flavorNumber = Number(flavor.dataset.num)
        const selectedFlavor = flavorData[flavorNumber]

        if (!selectedFlavor) return

        juicesWheel.style.transform = selectedFlavor.juiceTransform
        flavorsWheel.style.transform = selectedFlavor.flavorsTransform
        container.style.background = selectedFlavor.background
        info.style.opacity = "0"

        clearTimeout(infoTimeout)
        infoTimeout = setTimeout(() => {
            info.children[0].textContent = selectedFlavor.title
            info.children[1].textContent = selectedFlavor.description
            info.style.opacity = "1"
        }, 500)

        flavors.forEach((item) => item.classList.toggle("active", item === flavor))
    })
})
