const HOVER_R = 180;

function initSpotlight() {
  document.querySelectorAll(".item").forEach((card) => {
    const svg = card.querySelector("svg");
    const circle = svg.querySelector("clipPath circle");
    const pt = svg.createSVGPoint();

    const setPos = (e) => {
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
    };

    card.addEventListener("pointerenter", (e) => {
      setPos(e);
      circle.setAttribute("r", HOVER_R);
    });
    card.addEventListener("pointermove", setPos);
    card.addEventListener("pointerleave", () => circle.setAttribute("r", 0));

    card.addEventListener("click", (evt) => {
      if (evt.target.closest(".btn")) return;
      openModal(card);
    });
  });
}

function openModal(card) {
  const img = card.querySelector("image");
  const src =
    img.getAttribute("href") ||
    img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
  document.getElementById("modal-image").src = src;
  document.getElementById("modal").classList.add("active");
}

function initModal() {
  const modal = document.getElementById("modal");
  const close = document.getElementById("close-modal");
  close.addEventListener("click", () => modal.classList.remove("active"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    if (btn.classList.contains("ghost")) {
      openModal(btn.closest(".item"));
    }
  });
}

function initFilters() {
  const filtersEl = document.getElementById("filters");
  const countEl = document.getElementById("filter-count");
  const cards = Array.from(document.querySelectorAll(".item"));

  const apply = (filter) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    countEl.textContent = `${shown} / ${cards.length}`;
  };

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    filtersEl.querySelectorAll(".filter").forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    apply(btn.dataset.filter);
  });

  apply("all");
}

document.addEventListener("DOMContentLoaded", () => {
  initSpotlight();
  initModal();
  initFilters();
});
