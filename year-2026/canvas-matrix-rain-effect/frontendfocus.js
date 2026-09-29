const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

const matrixChars = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const fontSize = 16;
let columns, drops;

// Properly scale canvas for high-DPR screens to prevent smudging and trail artifacts
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    ctx.scale(dpr, dpr);

    columns = Math.floor(window.innerWidth / fontSize);
    drops = Array(columns).fill(1);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Set initial solid background
ctx.fillStyle = "#050522";
ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

// Secret message setup
const secretMessage = "the truth is out there".split("");
let messageStartTime = null;
let letterFadeProgress = Array(secretMessage.length).fill(0);
const letterFadeSpeed = 0.02;
const letterDelay = 500;

function drawMatrix() {
    // Semi-transparent fade trail (from your live site code)
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(5, 5, 34, 0.07)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw the Matrix characters
    ctx.fillStyle = "#00bba9";
    ctx.font = fontSize + "px 'White Rabbit Local', sans-serif";

    for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    // Secret message logic
    if (!messageStartTime) {
        messageStartTime = Date.now();
    }

    const elapsedTime = Date.now() - messageStartTime;
    if (elapsedTime >= 3000) {
        ctx.font = "400 18px 'White Rabbit Local', sans-serif";
        const textWidth = ctx.measureText(secretMessage.join("")).width;
        const xPos = (window.innerWidth - textWidth) / 2;
        const yPos = window.innerHeight / 2;

        secretMessage.forEach((char, index) => {
            const letterAppearTime = 3000 + index * letterDelay;
            if (elapsedTime >= letterAppearTime) {
                if (letterFadeProgress[index] < 1) {
                    letterFadeProgress[index] += letterFadeSpeed;
                }
                ctx.fillStyle = `rgba(0, 187, 169, ${Math.min(letterFadeProgress[index], 1)})`;
                ctx.fillText(char, xPos + ctx.measureText(secretMessage.slice(0, index).join("")).width, yPos);
            }
        });
    }
}

let matrixInterval = setInterval(drawMatrix, 50);

// Restart Button support if you have one
const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        drops = Array(columns).fill(1);
        letterFadeProgress = Array(secretMessage.length).fill(0);
        messageStartTime = null;
        ctx.fillStyle = "#050522";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    });
}