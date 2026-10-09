// Select Elements;
const signInButton = document.getElementById("signIn");
const signUpButton = document.getElementById("signUp");
const container = document.getElementById("container");

addEvent(signUpButton, "click", "add", container);
addEvent(signInButton, "click", "remove", container);

function addEvent(el, ename, behavior, actionOnEl) {
  el.addEventListener(ename, (_) => {
    if (behavior === "add") actionOnEl.classList.add("active");
    else actionOnEl.classList.remove("active");
  });
}
