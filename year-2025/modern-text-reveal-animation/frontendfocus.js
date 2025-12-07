document.addEventListener("DOMContentLoaded", () => {
    const txtElement = document.querySelector(".txt");
    const textContent = txtElement.textContent;

    const animateText = () => {
        txtElement.textContent = "";

        textContent.split("").forEach((char, index) => {
            const span = document.createElement("span");
            span.textContent = char;
            span.style.animationDelay = `${index * 0.05}s`;
            span.style.display = char === " " ? "inline-block" : "inline";
            txtElement.appendChild(span);
        });
    };

    animateText();

    txtElement.addEventListener("click", () => {
        animateText();
    });
});