// ====================================================================
// UTILITY FUNCTIONS & CLASSES
// ====================================================================

const SurfaceEquations = {
    convex_squircle: (x) => Math.pow(1 - Math.pow(1 - x, 4), 1 / 4)
};

class Spring {
    constructor(v, s = 300, d = 20) {
        this.value = v;
        this.target = v;
        this.velocity = 0;
        this.stiffness = s;
        this.damping = d;
    }

    setTarget(t) {
        this.target = t;
    }

    update(dt) {
        const f = (this.target - this.value) * this.stiffness;
        const df = this.velocity * this.damping;
        this.velocity += (f - df) * dt;
        this.value += this.velocity * dt;
        return this.value;
    }

    isSettled() {
        return Math.abs(this.target - this.value) < 0.001 && Math.abs(this.velocity) < 0.001;
    }
}

function calculateDisplacementMap1D(gt, bw, sf, ri, s = 128) {
    const e = 1 / ri;
    const r = [];
    for (let i = 0; i < s; i++) {
        const x = i / s;
        const y = sf(x);
        const dx = x < 1 ? 0.0001 : -0.0001;
        const d = (sf(Math.max(0, Math.min(1, x + dx))) - y) / dx;
        const m = Math.sqrt(d * d + 1);
        const n = [-d / m, -1 / m];
        const dt = n[1];
        const k = 1 - e * e * (1 - dt * dt);

        if (k < 0) {
            r.push(0);
        } else {
            const rf = [
                -(e * dt + Math.sqrt(k)) * n[0],
                e - (e * dt + Math.sqrt(k)) * n[1]
            ];
            r.push(rf[0] * ((y * bw + gt) / rf[1]));
        }
    }
    return r;
}

function calculateDisplacementMap2D(cw, ch, ow, oh, rad, bw, md, pMap) {
    const img = new ImageData(cw, ch);
    for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = 128;
        img.data[i + 1] = 128;
        img.data[i + 3] = 255;
    }
    const rSq = rad * rad;
    const rp1Sq = (rad + 1) ** 2;
    const rmBwSq = Math.max(0, rad - bw) ** 2;
    const wB = ow - rad * 2;
    const hB = oh - rad * 2;
    const oX = (cw - ow) / 2;
    const oY = (ch - oh) / 2;

    for (let y1 = 0; y1 < oh; y1++) {
        for (let x1 = 0; x1 < ow; x1++) {
            const idx = ((oY + y1) * cw + oX + x1) * 4;
            const x = x1 < rad ? x1 - rad : x1 >= ow - rad ? x1 - rad - wB : 0;
            const y = y1 < rad ? y1 - rad : y1 >= oh - rad ? y1 - rad - hB : 0;
            const dSq = x * x + y * y;

            if (dSq <= rp1Sq && dSq >= rmBwSq) {
                const dist = Math.sqrt(dSq);
                const op = dSq < rSq ? 1 : 1 - (dist - rad) / (Math.sqrt(rp1Sq) - rad);
                const bIdx = Math.floor(Math.max(0, Math.min(1, (rad - dist) / bw)) * pMap.length);
                const dVal = pMap[Math.max(0, Math.min(bIdx, pMap.length - 1))] || 0;
                const dX = md > 0 ? (-(dist > 0 ? x / dist : 0) * dVal) / md : 0;
                const dY = md > 0 ? (-(dist > 0 ? y / dist : 0) * dVal) / md : 0;

                img.data[idx] = Math.max(0, Math.min(255, 128 + dX * 127 * op));
                img.data[idx + 1] = Math.max(0, Math.min(255, 128 + dY * 127 * op));
            }
        }
    }
    return img;
}

function calculateSpecularHighlight(ow, oh, rad, bw) {
    const img = new ImageData(ow, oh);
    const sVec = [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)];
    const rSq = rad * rad;
    const rp1Sq = (rad + 1) ** 2;
    const rmSSq = Math.max(0, (rad - 1.5) ** 2);

    for (let y1 = 0; y1 < oh; y1++) {
        for (let x1 = 0; x1 < ow; x1++) {
            const x = x1 < rad ? x1 - rad : x1 >= ow - rad ? x1 - rad - (ow - rad * 2) : 0;
            const y = y1 < rad ? y1 - rad : y1 >= oh - rad ? y1 - rad - (oh - rad * 2) : 0;
            const dSq = x * x + y * y;

            if (dSq <= rp1Sq && dSq >= rmSSq) {
                const dist = Math.sqrt(dSq);
                const op = dSq < rSq ? 1 : 1 - (dist - rad) / (Math.sqrt(rp1Sq) - rad);
                const dp = Math.abs((dist > 0 ? x / dist : 0) * sVec[0] + (dist > 0 ? -y / dist : 0) * sVec[1]);
                const cf = dp * Math.sqrt(1 - (1 - Math.max(0, Math.min(1, (rad - dist) / 1.5))) ** 2);
                const c = Math.min(255, 255 * cf);
                const idx = (y1 * ow + x1) * 4;

                img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = c;
                img.data[idx + 3] = Math.min(255, c * cf * op);
            }
        }
    }
    return img;
}

function imageDataToDataURL(img) {
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    c.getContext("2d").putImageData(img, 0, 0);
    return c.toDataURL();
}

let useBackdropFilter = false;

function detectFeatures() {
    const t = document.createElement("div");
    t.style.backdropFilter = "url(#test)";
    useBackdropFilter = !!window.chrome && t.style.backdropFilter.includes("url");
    if (useBackdropFilter) document.body.classList.add("use-backdrop-filter");
}

// ====================================================================
// SQUISH VOLUME DEMO INITIALIZATION
// ====================================================================

function initVolDemo() {
    const config = { width: 80, height: 320, radius: 40, bezelWidth: 20, glassThickness: 100, refractiveIndex: 1.6, maxDisp: 0 };
    const state = { value: 30, isDragging: false };
    const springs = { fill: new Spring(30, 300, 25), squishY: new Spring(1.0, 400, 20), squishX: new Spring(1.0, 400, 20) };

    const container = document.getElementById('volContainer'), glass = document.getElementById('volGlass'), fill = document.getElementById('volFill'), cloneWorld = document.getElementById('volCloneWorld');
    let animationFrameId = null;

    const precomputed = calculateDisplacementMap1D(config.glassThickness, config.bezelWidth, SurfaceEquations.convex_squircle, config.refractiveIndex);
    config.maxDisp = Math.max(...precomputed.map(Math.abs));

    document.getElementById("volDisplacementImage").setAttribute("href", imageDataToDataURL(calculateDisplacementMap2D(config.width, config.height, config.width, config.height, config.radius, config.bezelWidth, config.maxDisp || 1, precomputed)));
    document.getElementById("volSpecularImage").setAttribute("href", imageDataToDataURL(calculateSpecularHighlight(config.width, config.height, config.radius, config.bezelWidth)));

    if (!useBackdropFilter) {
        cloneWorld.innerHTML = document.getElementById('volRealWorld').outerHTML;
        document.getElementById('volClone').style.filter = "url(#volGlassFilter)";
    }

    function loop() {
        const dt = Math.min(0.032, 1 / 60);
        let overpull = 0;

        if (state.value > 100) overpull = state.value - 100;
        else if (state.value < 0) overpull = state.value;

        springs.squishY.setTarget(Math.max(0.65, Math.min(1.35, 1.0 + (overpull * 0.006))));
        springs.squishX.setTarget(Math.max(0.75, Math.min(1.25, 1.0 - (overpull * 0.003))));

        let visualVal = Math.max(0, Math.min(100, state.value));
        springs.fill.setTarget(visualVal);

        const f = springs.fill.update(dt), sy = springs.squishY.update(dt), sx = springs.squishX.update(dt);
        fill.style.height = `${f}%`;
        glass.style.transform = `scale(${sx}, ${sy})`;
        document.getElementById("volDisplacementMap").setAttribute("scale", config.maxDisp * sx);

        if (!useBackdropFilter) {
            const areaRect = document.body.getBoundingClientRect();
            cloneWorld.style.width = areaRect.width + "px";
            cloneWorld.style.height = areaRect.height + "px";
            const offsetLeft = (areaRect.width - config.width) / 2;
            const offsetTop = (areaRect.height - config.height) / 2;
            cloneWorld.style.transform = `scale(${1 / sx}, ${1 / sy}) translate(${-offsetLeft}px, ${-offsetTop - config.height}px)`;
        }

        if (!Object.values(springs).every(sp => sp.isSettled())) animationFrameId = requestAnimationFrame(loop);
        else animationFrameId = null;
    }

    function updateValueFromEvent(e) {
        const rect = container.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const percentage = 100 - ((clientY - rect.top) / rect.height) * 100;

        if (state.isDragging) {
            if (percentage > 100) state.value = 100 + (percentage - 100) * 0.35;
            else if (percentage < 0) state.value = percentage * 0.35;
            else state.value = percentage;
        } else {
            state.value = Math.max(0, Math.min(100, percentage));
        }
        if (!animationFrameId) animationFrameId = requestAnimationFrame(loop);
    }

    container.addEventListener('pointerdown', (e) => {
        state.isDragging = true;
        container.setPointerCapture(e.pointerId);
        updateValueFromEvent(e);
    });

    container.addEventListener('pointermove', (e) => {
        if (state.isDragging) updateValueFromEvent(e);
    });

    container.addEventListener('pointerup', () => {
        state.isDragging = false;
        state.value = Math.max(0, Math.min(100, state.value));
        if (!animationFrameId) animationFrameId = requestAnimationFrame(loop);
    });

    animationFrameId = requestAnimationFrame(loop);
}

// ====================================================================
// INITIALIZATION
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    detectFeatures();
    initVolDemo();
});