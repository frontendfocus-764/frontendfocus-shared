let x = document.getElementById("login");
let y = document.getElementById("register");
let z = document.getElementById("btn");
let log = document.getElementById("log");
let reg = document.getElementById("reg");
let after = document.getElementById("after");

function register() {
	x.style.left = "-500px";
	y.style.left = "0px";
	z.style.left = "110px";
	log.style.color = "rgb(234, 234, 235)";
	reg.style.color = "#252525";
	after.style.left = "0";
	after.style.top = "0";
}
function login() {
	x.style.left = "0px";
	y.style.left = "500px";
	z.style.left = "0px";
	reg.style.color = "rgb(234, 234, 235)";
	log.style.color = "#252525";
	after.style.left = "50%";
	after.style.top = "0";
	
}
