const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");

togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  togglePasswordBtn.textContent = isPassword ? "Hide" : "Show";
});