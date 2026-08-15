function equalize() {
	document.body.style.setProperty(
		"--eqz1",
		document.getElementById("equalizer").value
	);
}
window.addEventListener("load", (event) => {
	equalize();
});
