const pokemon = [
  {
    name: "Pikachu",
    number: "025",
    type: "electric",
    card: "./img/img-1.png",
    model: "./img/img-1-1.png"
  },
  {
    name: "Squirtle",
    number: "007",
    type: "water",
    card: "./img/img-2.png",
    model: "./img/img-2-2.png"
  },
  {
    name: "Bulbasaur",
    number: "001",
    type: "grass",
    card: "./img/img-3.png",
    model: "./img/img-3-3.png"
  },
  {
    name: "Charmander",
    number: "004",
    type: "fire",
    card: "./img/img-4.png",
    model: "./img/img-4-4.png"
  }
];

document.querySelector("#cards").innerHTML = pokemon.map((mon) => `
  <article
    class="scene ${mon.type}"
    tabindex="0"
    role="button"
    aria-label="Reveal ${mon.name}"
  >
    <div class="card">
      <span class="number">#${mon.number}</span>
      <img class="card-art" src="${mon.card}" alt="${mon.name}" />

      <div class="card-info">
        <h2 class="name">${mon.name}</h2>
        <p class="type">${mon.type}</p>
      </div>
    </div>

    <img class="model" src="${mon.model}" alt="" aria-hidden="true" />
    <span class="reveal-text">dimensional reveal</span>
  </article>
`).join("");

document.querySelectorAll(".scene").forEach((scene) => {
  const closeOthers = () => {
    document.querySelectorAll(".scene").forEach((other) => {
      if (other !== scene) other.classList.remove("active");
    });
  };

  scene.addEventListener("click", () => {
    const wasOpen = scene.classList.contains("active");
    closeOthers();
    scene.classList.toggle("active", !wasOpen);
  });

  scene.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      const wasOpen = scene.classList.contains("active");
      closeOthers();
      scene.classList.toggle("active", !wasOpen);
    }
  });
});