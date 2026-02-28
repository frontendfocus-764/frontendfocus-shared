document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 280 * dpr;
    canvas.height = 320 * dpr;
    ctx.scale(dpr, dpr);

    let mouse = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let blink = 0;
    let time = 0;
    let clickCount = 0;
    let lastClick = 0;
    let angryUntil = 0;
    let collapseUntil = 0;
    let laughUntil = 0;
    let mouthMode = 'smile';
    let mouthUntil = 0;

    const updateTarget = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        target.x = (clientX - cx) / (rect.width / 2);
        target.y = (clientY - cy) / (rect.height / 2);
    };

    canvas.addEventListener('mousemove', (e) => {
        updateTarget(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseleave', () => {
        target.x = 0;
        target.y = 0;
    });

    function draw() {
        time += 0.05;
        mouse.x += (target.x - mouse.x) * 0.1;
        mouse.y += (target.y - mouse.y) * 0.1;

        const w = 280;
        const h = 320;
        const cx = w / 2;
        const cy = h / 2 + 20;

        ctx.clearRect(0, 0, w, h);
        const now = Date.now();
        if (now < collapseUntil) {
            canvas.style.opacity = '0';
            requestAnimationFrame(draw);
            return;
        }
        canvas.style.opacity = '1';
        const isAngry = now < angryUntil;
        const isLaughing = now < laughUntil;
        canvas.classList.toggle('robot-canvas-angry', isAngry);

        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 90, 40 + (Math.sin(time) * 5), 10, 0, 0, Math.PI * 2);
        ctx.fill();

        const floatY = Math.sin(time) * 8;

        const bodyX = cx + mouse.x * 5;
        const bodyY = cy + floatY + 30;

        let bodyGrad = ctx.createRadialGradient(bodyX - 20, bodyY - 20, 10, bodyX, bodyY, 60);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(1, '#d1d9e6');
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(bodyX, bodyY, 50, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        const logoX = bodyX + mouse.x * 10;
        const logoY = bodyY + mouse.y * 5;
        ctx.fillStyle = '#25d366';
        ctx.beginPath();
        ctx.arc(logoX, logoY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(logoX - 3, logoY - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        const headX = cx + mouse.x * 25;
        const headY = cy + floatY - 50 + (mouse.y * 15);

        let headGrad = ctx.createRadialGradient(headX - 30, headY - 20, 20, headX, headY, 80);
        headGrad.addColorStop(0, '#ffffff');
        headGrad.addColorStop(1, '#cbd5e1');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.roundRect(headX - 60, headY - 45, 120, 90, 40);
        ctx.fill();

        const faceX = headX + mouse.x * 10;
        const faceY = headY + mouse.y * 8;
        const faceHeight = 60;
        
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(faceX - 45, faceY - (faceHeight / 2), 90, faceHeight, 22);
        ctx.fill();

        if (Math.random() > 0.98) blink = 1;
        if (blink > 0) blink -= 0.2;

        const eyeY = faceY + (mouse.y * 5) - 2;
        const eyeColor = isAngry ? '#ff4d4d' : '#25d366';
        ctx.fillStyle = eyeColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = eyeColor;

        if (blink <= 0.2) {
            ctx.beginPath();
            ctx.ellipse(faceX - 22 + (mouse.x * 5), eyeY, 7, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(faceX + 22 + (mouse.x * 5), eyeY, 7, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0; 

        if (Date.now() > mouthUntil) mouthMode = 'smile';
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 4;
        const mouthFloat = mouse.y * 6;
        const baseY = faceY + 14 + mouthFloat;
        if (mouthMode === 'sad') {
            ctx.beginPath();
            ctx.moveTo(faceX - 18, baseY + 8);
            ctx.quadraticCurveTo(faceX, baseY - 2, faceX + 18, baseY + 8);
            ctx.stroke();
        } else if (mouthMode === 'wow') {
            ctx.beginPath();
            ctx.arc(faceX, baseY + 4, 6, 0, Math.PI * 2);
            ctx.stroke();
        } else if (mouthMode === 'oh') {
            ctx.beginPath();
            ctx.arc(faceX, baseY + 4, 4, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            const smileDepth = (isLaughing ? 12 : 8) + Math.abs(mouse.y * 4);
            ctx.beginPath();
            ctx.moveTo(faceX - 18, baseY);
            ctx.quadraticCurveTo(faceX, baseY + smileDepth, faceX + 18, baseY);
            ctx.stroke();
        }

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(headX - 40, headY - 40);
        ctx.lineTo(headX - 55, headY - 65);
        ctx.moveTo(headX + 40, headY - 40);
        ctx.lineTo(headX + 55, headY - 65);
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();

    canvas.addEventListener('click', () => {
        const now = Date.now();
        if (now - lastClick > 1500) clickCount = 0;
        clickCount += 1;
        lastClick = now;

        const funTexts = ['You tickle me', 'Haha', 'Nice', 'Okay', 'Wow', 'Ah'];
const angryTexts = ['Enough!', 'I\'m angry', 'Stop', 'Sad'];
const collapseTexts = ['Ouch!', 'I\'m done'];

        if (clickCount >= 8) {
            angryUntil = now + 1200;
            collapseUntil = now + 1200;
            clickCount = 0;
            canvas.classList.add('robot-canvas-collapse');
            setTimeout(() => {
                canvas.classList.remove('robot-canvas-collapse');
                canvas.classList.remove('robot-canvas-reappear');
                void canvas.offsetWidth;
                canvas.classList.add('robot-canvas-reappear');
            emitBubbles(14, 'burst');
                setTimeout(() => canvas.classList.remove('robot-canvas-reappear'), 600);
            }, 1200);
            emitBubbles(18, 'burst');
            mouthMode = 'oh';
            mouthUntil = now + 1400;
            emitPop(collapseTexts[Math.floor(Math.random() * collapseTexts.length)], 1400);
            return;
        }

        if (clickCount >= 5) {
            angryUntil = now + 1500;
            mouthMode = 'sad';
            mouthUntil = now + 1500;
            emitBubbles(8, 'angry');
            emitPop(angryTexts[Math.floor(Math.random() * angryTexts.length)], 1500);
        } else {
            laughUntil = now + 1200;
            mouthMode = Math.random() > 0.6 ? 'wow' : 'smile';
            mouthUntil = now + 1200;
            emitBubbles(4);
            emitPop(funTexts[Math.floor(Math.random() * funTexts.length)], 1200);
        }

        canvas.classList.remove('robot-canvas-fun');
        void canvas.offsetWidth;
        canvas.classList.add('robot-canvas-fun');
        setTimeout(() => canvas.classList.remove('robot-canvas-fun'), 600);
    });

    function emitPop(text, duration) {
        const card = canvas.closest('.robot-card');
        if (!card) return;
        const pop = document.createElement('span');
        pop.className = 'robot-pop';
        pop.textContent = text;
        card.appendChild(pop);
        setTimeout(() => pop.remove(), duration || 1200);
    }

    function emitBubbles(count, tone) {
        const card = canvas.closest('.robot-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) * 0.48;
        for (let i = 0; i < count; i += 1) {
            const bubble = document.createElement('span');
            bubble.className = tone === 'angry' ? 'robot-bubble robot-bubble-angry' : 'robot-bubble';
            if (tone === 'burst') {
                const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
                bubble.style.left = `${centerX + Math.cos(angle) * radius}px`;
                bubble.style.top = `${centerY + Math.sin(angle) * radius}px`;
            } else {
                bubble.style.left = `${40 + Math.random() * 40}%`;
                bubble.style.top = `${30 + Math.random() * 40}%`;
            }
            bubble.style.width = `${8 + Math.random() * 8}px`;
            bubble.style.height = bubble.style.width;
            card.appendChild(bubble);
            setTimeout(() => bubble.remove(), 900);
        }
    }

});
