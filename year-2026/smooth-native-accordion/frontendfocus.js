const items = document.querySelectorAll(".accordion__item");

function updateAccordionState() {
  const openItem = document.querySelector(".accordion__item[open]");

  items.forEach((item) => {
    item.classList.remove(
      "accordion__item--open",
      "accordion__item--before-open",
      "accordion__item--after-open",
      "accordion__item--dimmed"
    );

    if (openItem) {
      if (item === openItem) {
        item.classList.add("accordion__item--open");
      } else {
        item.classList.add("accordion__item--dimmed");

        const itemsArray = Array.from(items);
        const currentIndex = itemsArray.indexOf(item);
        const openIndex = itemsArray.indexOf(openItem);

        if (currentIndex < openIndex) {
          item.classList.add("accordion__item--before-open");
        } else {
          item.classList.add("accordion__item--after-open");
        }
      }
    }
  });
}

items.forEach((item) => {
  item.addEventListener("click", (e) => {
    const isCurrentlyOpen = item.hasAttribute("open");

    if (!isCurrentlyOpen) {
      e.preventDefault();

      updateAccordionState();

      requestAnimationFrame(() => {
        items.forEach((other) => {
          if (other !== item) {
            other.removeAttribute("open");
          }
        });

        item.setAttribute("open", "");

        requestAnimationFrame(() => {
          updateAccordionState();
        });
      });
    }
  });

  item.addEventListener("toggle", () => {
    if (!item.open) {
      updateAccordionState();
    }
  });
});

updateAccordionState();
