class Droppy {
  DEFAULT_OPTIONS = {
    canvasSelector: ".canvas",
    textSelector: ".puddle",
    letterClassName: "puddle__letter",
    dropsClassName: "combined-puddles",
    delayBetweenDrops: 95,
    dropTypes: 10,
    wordAngleRange: [-3, 3]
  };

  constructor(opts) {
    this.opts = { ...this.DEFAULT_OPTIONS, ...opts };
    this.$textSelector = document.querySelectorAll(this.opts.textSelector);
    this.$canvas = document.querySelector(this.opts.canvasSelector);
    this.init();
  }

  init() {
    this.injectSVGFilter();
    this.wrapLetters();
    this.addDelayToEachLetter();
    this.createDrops();
    this.startAnimation();
  }

  getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  startAnimation() {
    this.$canvas.classList.add("canvas--animated");
  }

  wrapLetters() {
    this.$textSelector.forEach(($word) => {
      const letters = Array.from($word.innerText).map((letter) => {
        const dropType = this.getRandomInt(1, this.opts.dropTypes);
        const className = `${this.opts.letterClassName} ${this.opts.letterClassName}--t-${dropType}`;
        return `<div class="${className}">${letter}</div>`;
      });
      const angle = this.getRandomInt(
        this.opts.wordAngleRange[0],
        this.opts.wordAngleRange[1]
      );

      $word.style.cssText += `--r:${angle}deg`;
      $word.innerHTML = letters.join("");
    });
  }

  addDelayToEachLetter() {
    const letters = document.querySelectorAll(`.${this.opts.letterClassName}`);

    Array.from(letters, ($letter, index) => {
      const delay = index * this.opts.delayBetweenDrops;
      $letter.style.cssText += `--delay:${delay}ms`;
    });
  }

  createDrops() {
    const $drops = document.createElement("div");
    $drops.className = this.opts.dropsClassName;

    Array.from(this.$textSelector, ($word) =>
      $drops.appendChild($word.cloneNode(true))
    );

    this.$canvas.appendChild($drops);
  }

  injectSVGFilter() {
    const filter =
      '<svg style="display:none;"><filter id="drops-filter" x="-50%" width="200%" y="-50%" height="200%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7" result="cm" /></filter></svg>';
    this.$canvas.insertAdjacentHTML("beforeend", filter);
  }
}

new Droppy();
