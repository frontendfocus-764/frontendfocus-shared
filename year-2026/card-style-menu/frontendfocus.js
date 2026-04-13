window.addEventListener("DOMContentLoaded",() => {
	const nav = new CardNav("nav");
});

class CardNav {
	constructor(qs) {
		this.overflowClass ="no-scroll";
		this.openClass = "nav--open";
		this.activeClass = "nav__item--active";
		this.el = document.querySelector(qs);
		this.el?.addEventListener("click",this.toggle.bind(this));
	}
	toggle(e) {
		e.preventDefault();

		const { target } = e;

		if (target.hasAttribute("href")) {
			const { body } = document;
			const { overflowClass, openClass, activeClass, el } = this;

			// toggle class to open or close
			el.classList.toggle(openClass);

			if (el.classList.contains(openClass)) {
				body.classList.add(overflowClass);
			} else {
				body.classList.remove(overflowClass);
				// take the class from the previously active item…
				const active = el?.querySelector(`.${activeClass}`);

				active.classList.remove(activeClass);

				// …and give it to the newly active item
				target.parentElement.classList.add(activeClass);
			}
		}
	}
}