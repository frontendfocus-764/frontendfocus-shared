const generate_btn = document.querySelector("button#generate_btn");
const password_el = document.querySelector("#password");

const PASSWORD_LENGTH = 30;

const CHAR_START = 33;
const CHAR_END = 126;
const CHARACTERS = Array.from({ length: CHAR_END - CHAR_START + 1 }, (_, i) =>
	String.fromCharCode(i + CHAR_START)
).join("");

function generate_random_character() {
	const index = Math.floor(Math.random() * CHARACTERS.length);
	return CHARACTERS[index];
}

function generate_password(length) {
	let password = "";
	for (let i = 0; i < length; i++) {
		password += generate_random_character();
	}
	return password;
}

function animate_password_generation(fixed_pw = "") {
	const partial_pw = generate_password(PASSWORD_LENGTH - fixed_pw.length);
	password_el.textContent = fixed_pw + partial_pw;
	if (fixed_pw.length === PASSWORD_LENGTH) return;
	setTimeout(() => {
		const new_char = Math.random() < 0.2 ? partial_pw[0] : "";
		animate_password_generation(fixed_pw + new_char);
	}, 1000 / 60);
}

generate_btn.addEventListener("click", () => {
	animate_password_generation();
});
