const input = document.getElementById("password");
const toggle = document.getElementById("togglePassword");
toggle.addEventListener("click", () => {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggle.className = isPassword
        ? "ri-eye-fill toggle-password"
        : "ri-eye-off-fill toggle-password";
});