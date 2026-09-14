window.addEventListener("DOMContentLoaded",() => {
	const b1 = new OnOffButton("#btn1");
	const b2 = new OnOffButton("#btn2");
});

class OnOffButton {
	constructor(el) {
		this.el = document.querySelector(el);
		this.el?.addEventListener("click",this.power.bind(this));
	}
	power() {
		const pressed = this.el?.getAttribute("aria-pressed") === "true";
		this.el?.setAttribute("aria-pressed",`${!pressed}`);
	}
}