(function () {
  const menu = document.getElementById("branchedMenu");
  const marker = menu.querySelector("[data-marker]");
  const sections = menu.querySelectorAll(".section");
  const heads = menu.querySelectorAll("[data-head]");

  const open = new Set([0]);
  let active = "install";
  const MARK = 16;

  function activeSection() {
    let idx = -1;
    sections.forEach((s, i) => {
      if (s.querySelector('.child[data-value="' + active + '"]')) idx = i;
    });
    return idx;
  }

  function place(glide) {
    const idx = activeSection();
    const isOn = idx >= 0 && open.has(idx);
    const head = idx >= 0 ? heads[idx] : null;

    if (!glide) marker.style.transition = "none";
    if (isOn && head) {
      marker.style.top =
        head.offsetTop + (head.offsetHeight - MARK) / 2 + "px";
    }
    if (isOn) marker.setAttribute("data-on", "");
    else marker.removeAttribute("data-on");
    if (!glide) {
      void marker.offsetHeight;
      marker.style.transition = "";
    }
  }

  function updateReach() {
    menu.querySelectorAll(".branch-reach").forEach((p) => {
      const v = p.getAttribute("data-reach");
      const len = parseFloat(p.style.strokeDasharray);
      p.style.strokeDashoffset = v === active ? "0" : String(len);
    });
  }

  function updateChildren() {
    menu.querySelectorAll(".child").forEach((c) => {
      if (c.getAttribute("data-value") === active) c.setAttribute("data-active", "");
      else c.removeAttribute("data-active");
      const sec = c.closest(".section");
      const i = parseInt(sec.getAttribute("data-section"), 10);
      c.tabIndex = open.has(i) ? 0 : -1;
    });
  }

  function updateOpenAttrs() {
    sections.forEach((s, i) => {
      if (open.has(i)) s.setAttribute("data-open", "");
      else s.removeAttribute("data-open");
    });
  }

  function toggleSection(i) {
    if (open.has(i)) open.delete(i);
    else open.add(i);
    updateOpenAttrs();
    updateChildren();
    place(true);
  }

  function selectChild(value) {
    active = value;
    updateChildren();
    updateReach();
    place(true);
  }

  sections.forEach((s, i) => {
    const head = s.querySelector(".section-head");
    head.addEventListener("click", () => toggleSection(i));
  });

  menu.querySelectorAll(".child").forEach((c) => {
    c.addEventListener("click", () => selectChild(c.getAttribute("data-value")));
  });

  updateOpenAttrs();
  updateChildren();
  updateReach();

  requestAnimationFrame(() => place(false));
  window.addEventListener("resize", () => place(false));
})();