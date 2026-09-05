import gsap from "https://esm.sh/gsap@3.13.0";
import Draggable from "https://esm.sh/gsap@3.13.0/Draggable";
import { Pane } from "https://esm.sh/tweakpane@4.0.4";
gsap.registerPlugin(Draggable);

const config = {
  theme: "system",
  cols: 20,
  rows: 10
};

const ctrl = new Pane({
  title: "config",
  expanded: true
});

const grid = document.querySelector(".grid");
const buildGrid = () => {
  grid.innerHTML = new Array(config.cols * config.rows)
    .fill(0)
    .map(
      (_, index) => `
    <div style="
      --grade: ${Math.floor(Math.random() * 12 - 6)};
      --opacity: ${Math.min(Math.random(), 0.2)};
      --hue: ${Math.floor(Math.random() * 30)};
    ">+</div>
  `
    )
    .join("");
  grid.style.setProperty("--cols", config.cols);
  grid.style.setProperty("--rows", config.rows);
};
buildGrid();

const update = () => {
  document.documentElement.dataset.theme = config.theme;
};

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== "theme"
  )
    return update();
  document.startViewTransition(() => update());
};

ctrl
  .addBinding(config, "cols", {
    min: 5,
    max: 30,
    step: 1
  })
  .on("change", buildGrid);
ctrl
  .addBinding(config, "rows", {
    min: 5,
    max: 30,
    step: 1
  })
  .on("change", buildGrid);

ctrl.addBinding(config, "theme", {
  label: "theme",
  options: {
    system: "system",
    light: "light",
    dark: "dark"
  }
});

ctrl.on("change", sync);
update();

// make tweakpane panel draggable
const tweakClass = "div.tp-dfwv";
const d = Draggable.create(tweakClass, {
  type: "x,y",
  allowEventDefault: true,
  trigger: tweakClass + " button.tp-rotv_b"
});

document.querySelector(tweakClass).addEventListener("dblclick", () => {
  gsap.to(tweakClass, {
    x: `+=${d[0].x * -1}`,
    y: `+=${d[0].y * -1}`,
    onComplete: () => {
      gsap.set(tweakClass, { clearProps: "all" });
    }
  });
});

if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
  grid.addEventListener(
    "pointermove",
    (event) => {
      var _document$querySelect;
      (_document$querySelect = document.querySelector("[data-hover]")) ===
        null || _document$querySelect === void 0
        ? void 0
        : _document$querySelect.removeAttribute("data-hover");
      document.elementFromPoint(event.x, event.y).dataset.hover = "true";
    },
    true
  );
  grid.addEventListener(
    "pointerleave",
    (event) => {
      var _document$querySelect2;
      (_document$querySelect2 = document.querySelector("[data-hover]")) ===
        null || _document$querySelect2 === void 0
        ? void 0
        : _document$querySelect2.removeAttribute("data-hover");
    },
    true
  );
}