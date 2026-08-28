document.forms[0].addEventListener("change",e => {
	let tar = e.target;
	if (tar.classList.contains("pristine"))
		tar.removeAttribute("class");
});