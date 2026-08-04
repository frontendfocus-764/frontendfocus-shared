const navButtons = document.querySelectorAll(".nav__link");
const dropdown = document.querySelector(".dropdown");
const menus = document.querySelectorAll(".dropdown__menu");
const dropdownBg = document.querySelector(".dropdown__background");
const nav = document.querySelector(".nav");

let leaveTimeout;

function getHeight(element) {
  return element.scrollHeight;
}

function handleEnter(targetId, activeButton) {
  if (leaveTimeout) clearTimeout(leaveTimeout);

  navButtons.forEach((btn) => {
    btn.classList.remove("nav__link-active");
    btn.setAttribute("aria-expanded", "false");
  });

  if (activeButton) {
    activeButton.classList.add("nav__link-active");
    activeButton.setAttribute("aria-expanded", "true");
  }

  dropdown.classList.add("dropdown-visible");
  dropdown.setAttribute("aria-hidden", "false");

  if (targetId) {
    const targetMenu = document.getElementById(targetId);

    menus.forEach((menu) => {
      menu.classList.remove("is-active");
      menu.setAttribute("aria-hidden", "true");
    });

    if (targetMenu) {
      targetMenu.classList.add("is-active");
      targetMenu.setAttribute("aria-hidden", "false");
      const height = getHeight(targetMenu);
      dropdownBg.style.setProperty("--current-height", `${height}px`);
    }
  }
}

function handleLeave() {
  leaveTimeout = setTimeout(() => {
    dropdown.classList.remove("dropdown-visible");
    dropdown.setAttribute("aria-hidden", "true");

    navButtons.forEach((btn) => {
      btn.classList.remove("nav__link-active");
      btn.setAttribute("aria-expanded", "false");
    });

    menus.forEach((menu) => {
      menu.setAttribute("aria-hidden", "true");
      menu.classList.remove("is-active");
    });
  }, 150);
}

navButtons.forEach((btn) => {
  btn.addEventListener("mouseenter", (e) => {
    const targetId = btn.getAttribute("aria-controls");
    handleEnter(targetId, btn);
  });

  btn.addEventListener("click", (e) => {
    const targetId = btn.getAttribute("aria-controls");
    const isExpanded = btn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      handleLeave();
    } else {
      handleEnter(targetId, btn);
    }
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const targetId = btn.getAttribute("aria-controls");
      handleEnter(targetId, btn);
      const targetMenu = document.getElementById(targetId);
      const firstLink = targetMenu.querySelector("a, button");
      if (firstLink) firstLink.focus();
    }
  });
});

nav.addEventListener("mouseleave", handleLeave);

dropdown.addEventListener("mouseenter", () => {
  if (leaveTimeout) clearTimeout(leaveTimeout);
});

dropdown.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const activeBtn = document.querySelector(
      ".nav__link[aria-expanded='true']"
    );
    handleLeave();
    if (activeBtn) activeBtn.focus();
  }
});
