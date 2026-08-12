document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('starCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let stars = [];
    

    window.addEventListener('resize', function() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Star {
        constructor(x, y, velocityX, velocityY) {
            this.x = x;
            this.y = y;
            this.finalSize = Math.random() * 2;
            this.size = this.finalSize * 2; // Starting size is twice the final size
            this.alpha = 1;
            this.velocityX = velocityX * 0.05;
            this.velocityY = 1 + Math.random() + velocityY * 0.05;
            this.gravity = 0.02;
            this.drag = 0.97;
            this.turbulence = () => Math.random() * 0.5 - 0.25;
            this.timeElapsed = 0; // Time since the star was created
        }
    
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    
        update(deltaTime) {
            this.x += this.velocityX + this.turbulence();
            this.velocityX *= this.drag;
            this.y += this.velocityY;
            this.velocityY += this.gravity;
            this.alpha = Math.max(0, this.alpha - 0.005);
    
            this.timeElapsed += deltaTime;
            if (this.timeElapsed < 2000) { // 2000 milliseconds = 2 seconds
                this.size = this.finalSize * 2 - (this.finalSize * this.timeElapsed / 2000);
            } else {
                this.size = this.finalSize;
            }
        } 
    }
    

    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;
    
    function addStar(e) {
        // Calculate mouse velocity
        mouseVelocityX = e.clientX - lastMouseX;
        mouseVelocityY = e.clientY - lastMouseY;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    
        // Random offset for mouse velocity
        let randomOffsetX = (Math.random() - 0.5) * 100; // Adjust the multiplier for more or less randomness
        let randomOffsetY = (Math.random() - 0.5) * 100;
    
        // Create new star with modified velocity
        stars.push(new Star(e.clientX, e.clientY, mouseVelocityX + randomOffsetX, mouseVelocityY + randomOffsetY));
    }
    
    canvas.addEventListener('mousemove', addStar);
    
    let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => star.update(deltaTime));
        stars.forEach(star => star.draw());
        stars = stars.filter(star => star.alpha > 0 && star.y < height && star.x > 0 && star.x < width);
        requestAnimationFrame(update);
    }

    update();
});
