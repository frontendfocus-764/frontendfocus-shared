function makeRain(layer, intensity, speed) {
    let drops = "";
    let increment = 0;

    while (increment < 100) {
        let delay = Math.floor(Math.random() * 100);
        let size = Math.random() * 0.5 + 0.8;
        increment += Math.random() * intensity;

        drops += `
        <div class="drop" style="
            left:${increment}%;
            transform:scale(${size});
            animation-duration:${speed}s;
            animation-delay:0.${delay}s;">
            <div class="stem"></div>
            <div class="splat"></div>
        </div>`;
    }

    $(layer).append(drops);
}

/* 🌧️ Slower speeds */
makeRain(".front-row", 1.4, 0.9);   // foreground
makeRain(".mid-row", 2.0, 1.4);   // mid layer
makeRain(".back-row", 2.8, 2.2);   // far background