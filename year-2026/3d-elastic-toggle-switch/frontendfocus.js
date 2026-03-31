document.addEventListener("click",e => {
	let tar = e.target;
	if (tar.name == "toggle")
		tar.removeAttribute("class");
});