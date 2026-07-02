document.addEventListener("DOMContentLoaded",() => {
	const n = new NumberInput(".n","number");
});

class NumberInput {
	constructor(qs,name) {
		this.el = document.querySelector(qs);
		this.value = 0;
		this.dir = 0;
		this.valueEl = null;
		this.timeout = null;
		this.init(name);
	}
	init(name) {
		if (this.el) {
			// use the input value at the start
			this.valueEl = this.el.querySelector(".n__value");

			if (this.valueEl)
				this.value = +this.valueEl.value;

			// attach the listeners
			let isTouch = "ontouchstart" in document.documentElement;

			this.el.addEventListener("keydown",this.kbdDownEvent.bind(this));
			this.el.addEventListener("keyup",this.release.bind(this));
			this.el.addEventListener(isTouch ? "touchstart" : "mousedown",this.rotate.bind(this));
			document.addEventListener(isTouch ? "touchend" : "mouseup",this.release.bind(this));
		}
	}
	kbdDownEvent(e) {
		let c = e.code;

		if (c == "Enter" || c == "NumpadEnter" || c == "Space")
			this.rotate(e);
	}
	rotate(e) {
		let tar = e.target || e;

		if (tar) {
			let dataStep = tar.getAttribute("data-step"),
				elCL = this.el.classList,
				up = "n--up",
				down = "n--down";

			// increment
			if (dataStep == "+" && !elCL.contains(up)) {
				this.dir = 1;
				elCL.add(up);

			// decrement
			} else if (dataStep == "-" && !elCL.contains(down)) {
				this.dir = -1;
				elCL.add(down);
			}
		}
	}
	release() {
		if (this.valueEl && document.activeElement != this.valueEl) {
			let valCL = this.valueEl.classList,
				up = "n__value--up",
				down = "n__value--down";

			// reset the animation
			if (valCL)
				valCL.remove(up,down);

			void this.valueEl.offsetWidth;
			clearTimeout(this.timeout);
			this.value = this.valueEl.value;
			this.valueEl.value = this.value;

			// apply the relevant one
			if (this.dir == 1) {
				++this.value;
				if (valCL)
					valCL.add(up);

			} else if (this.dir == -1) {
				--this.value;
				if (valCL)
					valCL.add(down);
			}

			// remove the transition class
			this.dir = 0;
			this.el.classList.remove("n--up","n--down");

			// update the display value midway the animation
			let elCS = window.getComputedStyle(this.el),
				sRaw = elCS.getPropertyValue("--trans"),
				s = (+sRaw.substr(0,sRaw.indexOf("s")) * 1e3) / 2;

			this.timeout = setTimeout(() => {
				this.valueEl.value = this.value;
			},s);
		}
	}
}