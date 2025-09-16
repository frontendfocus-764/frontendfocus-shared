document.addEventListener("mousemove", (e) => {
    const trail = document.createElement("div");
    trail.className = "trail";
    trail.style.top = e.pageY + "px";
    trail.style.left = e.pageX + "px";
    document.body.appendChild(trail);

    setTimeout(() => {
        trail.remove();
    }, 800);
});