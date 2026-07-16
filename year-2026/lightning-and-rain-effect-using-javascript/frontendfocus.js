//Modified - added clouds and lightning bolts for more realistic effects - 14/01/26
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const hitCanvas = document.createElement('canvas');
const hitCtx = hitCanvas.getContext('2d', { willReadFrequently: true });

// Offscreen canvas for pre-rendered clouds
const cloudCanvas = document.createElement('canvas');
const cloudCtx = cloudCanvas.getContext('2d');

let width, height;
let drops = [];
let splashes = [];
let cloudLayers = [];
let lightningBolts = [];

const dropCount = 1200;
const textString = "RAIN";

// ======================================================
// RAIN ANGLE CONFIGURATION
// ======================================================
const RAIN_ANGLE = 5; // Degrees from vertical (0 = straight down, 45 = diagonal)
const rainAngleRad = (RAIN_ANGLE * Math.PI) / 180;
const rainVelocityX = Math.sin(rainAngleRad); // Horizontal component
const rainVelocityY = Math.cos(rainAngleRad); // Vertical component

let isLightning = false;
let lightningTimer = 0;
let lightningIntensity = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    hitCanvas.width = width;
    hitCanvas.height = height;
    cloudCanvas.width = width;
    cloudCanvas.height = Math.floor(height * 0.6);
    drawCollisionMap();
    initClouds();
}

function drawCollisionMap() {
    hitCtx.fillStyle = 'black';
    hitCtx.fillRect(0, 0, width, height);
    
    let fontSize = Math.min(Math.max(width * 0.22, 120), 400);
    hitCtx.font = `900 ${fontSize}px Roboto`;
    hitCtx.textAlign = 'center';
    hitCtx.textBaseline = 'middle';
    hitCtx.fillStyle = 'white'; 
    hitCtx.fillText(textString, width / 2, height / 2);
}

function draw3DText() {
    let fontSize = Math.min(Math.max(width * 0.22, 120), 400);
    ctx.font = `900 ${fontSize}px Roboto`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const cx = width / 2;
    const cy = height / 2;

    ctx.shadowColor = 'black';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 25;
    ctx.fillStyle = 'black';
    ctx.fillText(textString, cx, cy);
    ctx.shadowBlur = 0; 
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#111'; 
    ctx.fillText(textString, cx + 5, cy + 5);

    let gradient = ctx.createLinearGradient(0, cy - fontSize/2, 0, cy + fontSize/2);
    gradient.addColorStop(0, '#050505'); 
    gradient.addColorStop(0.3, '#222'); 
    gradient.addColorStop(0.5, '#080808'); 
    gradient.addColorStop(1, '#000');
    
    ctx.fillStyle = gradient;
    ctx.fillText(textString, cx, cy);

    ctx.save();
    ctx.fillStyle = isLightning ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)';
    ctx.fillText(textString, cx, cy - 1);
    ctx.restore();
}

// ======================================================
// PRE-RENDERED CLOUD TEXTURE (Created Once)
// ======================================================
function createCloudTexture(size, brightness) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Create multiple overlapping gradients for volume
    for(let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * size * 0.3;
        const offsetY = (Math.random() - 0.5) * size * 0.3;
        const radius = size * (0.4 + Math.random() * 0.2);
        
        const gradient = tempCtx.createRadialGradient(
            centerX + offsetX, centerY + offsetY, 0,
            centerX + offsetX, centerY + offsetY, radius
        );
        
        const alpha = 0.15 + Math.random() * 0.1;
        gradient.addColorStop(0, `rgba(${brightness + 25}, ${brightness + 25}, ${brightness + 30}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${brightness}, ${brightness}, ${brightness + 15}, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(${brightness - 10}, ${brightness - 10}, ${brightness}, 0)`);
        
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, size, size);
    }
    
    return tempCanvas;
}

// ======================================================
// OPTIMIZED CLOUD LAYER (Pre-rendered, scrolling texture)
// ======================================================
class CloudLayer {
    constructor(depth, yPos) {
        this.depth = depth; // 0 = far, 1 = near
        this.speed = (0.15 + depth * 0.25);
        this.offset = 0;
        this.y = yPos;
        this.brightness = 25 + depth * 15;
        
        // Pre-render cloud textures
        this.cloudTextures = [];
        const numClouds = 5.5;
        for(let i = 0; i < numClouds; i++) {
            const size = 200 + Math.random() * 400;
            this.cloudTextures.push({
                texture: createCloudTexture(size, this.brightness),
                size: size,
                x: (i / numClouds) * width * 1,
                offsetY: (Math.random() - 0.5) * 80
            });
        }
    }
    
    update() {
        this.offset += this.speed;
        if(this.offset > width) {
            this.offset = 0;
        }
    }
    
    draw() {
        ctx.save();
        
        // Set opacity and lightning effect
        let alpha = 0.7 + this.depth * 0.3;
        if(isLightning && lightningIntensity > 0) {
            alpha = Math.min(1, alpha + lightningIntensity * 0.4);
        }
        ctx.globalAlpha = alpha;
        
        // Apply lightning tint
        if(isLightning && lightningIntensity > 0) {
            ctx.globalCompositeOperation = 'lighter';
        }
        
        // Draw clouds twice for seamless loop
        for(let loop = 0; loop < 2; loop++) {
            this.cloudTextures.forEach(cloud => {
                const x = cloud.x - this.offset + (loop * width * 2);
                const y = this.y + cloud.offsetY;
                
                if(x + cloud.size > -cloud.size && x < width + cloud.size) {
                    ctx.drawImage(cloud.texture, x - cloud.size/2, y - cloud.size/2);
                }
            });
        }
        
        ctx.restore();
    }
}

// ======================================================
// INITIALIZE OPTIMIZED CLOUDS
// ======================================================
function initClouds() {
    cloudLayers = [];
    
    // Create 3 layers
    cloudLayers.push(new CloudLayer(0.3, height * 0.1));
    cloudLayers.push(new CloudLayer(0.6, height * 0.2));
    cloudLayers.push(new CloudLayer(1.0, height * 0.3));
}

// ======================================================
// LIGHTNING BOLT CLASS (Optimized)
// ======================================================
class LightningBolt {
    constructor() {
        this.segments = [];
        this.life = 1.0;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.generateBolt();
    }
    
    generateBolt() {
        const startX = Math.random() * width;
        const startY = 0;
        const endX = startX + (Math.random() - 0.5) * 400;
        const endY = height * (Math.random() * 0.4 + 0.2);
        
        this.segments = this.createBranch(startX, startY, endX, endY, 1);
        
        // Add branches
        if(Math.random() > 0.5) {
            const idx = Math.floor(this.segments.length * 0.6);
            const branchPoint = this.segments[idx];
            const branchEnd = {
                x: branchPoint.x + (Math.random() - 0.5) * 250,
                y: branchPoint.y + Math.random() * 150 + 50
            };
            this.segments.push(...this.createBranch(
                branchPoint.x, branchPoint.y, 
                branchEnd.x, branchEnd.y, 
                0.6
            ));
        }
    }
    
    createBranch(x1, y1, x2, y2, widthMult) {
        const segments = [];
        const steps = 10;
        
        let currentX = x1;
        let currentY = y1;
        
        for(let i = 0; i <= steps; i++) {
            const t = i / steps;
            const targetX = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 60;
            const targetY = y1 + (y2 - y1) * t;
            
            segments.push({
                x1: currentX,
                y1: currentY,
                x2: targetX,
                y2: targetY,
                width: (Math.random() * 2 + 1) * widthMult
            });
            
            currentX = targetX;
            currentY = targetY;
        }
        
        return segments;
    }
    
    update() {
        this.life -= 0.12;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life * this.brightness;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(200, 220, 255, 0.8)';
        
        this.segments.forEach(seg => {
            // Outer glow
            ctx.strokeStyle = 'rgba(180, 200, 255, 0.2)';
            ctx.lineWidth = seg.width * 10;
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
            
            // Core
            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
            ctx.lineWidth = seg.width * 1.5;
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
        });
        
        ctx.restore();
    }
}

// ======================================================
// SPLASH CLASS (Updated for diagonal impact)
// ======================================================
class Splash {
    constructor(x, y, impactAngle) {
        this.x = x;
        this.y = y;
        
        // Splash direction based on impact angle
        const baseAngle = -Math.PI/2 - rainAngleRad; // Perpendicular to rain direction
        const spreadAngle = (Math.random() - 0.5) * Math.PI * 0.6;
        const angle = baseAngle + spreadAngle;
        const speed = Math.random() * 6 + 3;
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0; 
        this.size = Math.random() * 2.5 + 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.5; // Gravity
        this.vx *= 0.98; // Air resistance
        this.life -= 0.04; 
    }
    draw() {
        ctx.fillStyle = `rgba(250, 250, 250, ${this.life})`; 
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// ======================================================
// DROP CLASS (Updated for diagonal rain)
// ======================================================
class Drop {
    constructor() {
        this.reset();
        this.y = Math.random() * height; 
        this.x = Math.random() * width + height * rainVelocityX; // Offset for diagonal entry
    }

    reset() {
        // Start from top-left area to account for diagonal movement
        this.x = Math.random() * width - height * 0.3 * rainVelocityX;
        this.y = -20; 
        
        const baseSpeed = Math.random() * 15 + 10;
        this.vy = baseSpeed * rainVelocityY; 
        this.baseVx = baseSpeed * rainVelocityX; // Base diagonal velocity
        this.vx = this.baseVx;
        
        this.state = 'falling'; 
        this.size = Math.random() * 1.5 + 1.2; 
        this.oscillationSpeed = Math.random() * 0.1 + 0.05; 
        this.phase = Math.random() * Math.PI * 2;   
        this.z = Math.random();
        this.canCollide = (this.z > 0.45 && this.z < 0.55); 
    }

    isSolid(tx, ty) {
        if (ty < 0 || ty >= height || tx < 0 || tx >= width) return false;
        if (ty > height/2 - 250 && ty < height/2 + 250) {
            return hitCtx.getImageData(Math.floor(tx), Math.floor(ty), 1, 1).data[0] > 100;
        }
        return false;
    }

    update() {
        let nextY = this.y + this.vy;
        let nextX = this.x + this.vx;
        
        if (this.canCollide) {
            let isCurrentlyInSolid = this.isSolid(nextX, nextY);
            let wasInSolid = this.isSolid(this.x, this.y);

            if (this.state === 'falling' && isCurrentlyInSolid && !wasInSolid) {
                this.state = 'flowing';
                this.y = nextY;
                this.vy = 0; 
                this.vx = 0;
                
                // Create splashes with impact angle
                for(let k=0; k<10; k++) {
                    splashes.push(new Splash(this.x, this.y, rainAngleRad));
                }
            }
            else if (this.state === 'flowing') {
                if (isCurrentlyInSolid) {
                    if (Math.random() < 0.10) {
                         this.vy = 0.1;
                    } else {
                         if (this.vy < 5) this.vy += 0.3; 
                    }
                    
                    let noise = (Math.random() - 0.5) * 2;
                    this.vx = (Math.sin(this.y * this.oscillationSpeed + this.phase) * 0.5) + noise;
                    this.y += this.vy;
                    this.x += this.vx;
                } else {
                    // Detaching - resume diagonal fall
                    this.state = 'detaching';
                    this.vx = this.baseVx * 0.5;
                    this.vy = 2; 
                }
            }
            else if (this.state === 'detaching') {
                this.y += this.vy;
                this.x += this.vx;
                this.vy += 0.5;
                this.vx += this.baseVx * 0.05; // Gradually return to diagonal
                
                if (this.vy > 12) {
                    this.state = 'falling';
                    this.vx = this.baseVx;
                }
            }
            else {
                // Falling diagonally
                this.y = nextY;
                this.x = nextX;
                if(this.vy < 25 * rainVelocityY) this.vy += 0.5 * rainVelocityY; 
            }
        } else {
            // Free fall - diagonal movement
            this.y = nextY;
            this.x = nextX;
            if(this.vy < 25 * rainVelocityY) this.vy += 0.5 * rainVelocityY; 
        }

        if (this.y > height || this.x > width + 100) this.reset();
    }

    draw() {
        let opacity = this.z * 0.5; 
        if(isLightning) opacity = 0.8;

        if (this.state === 'falling') {
            // Draw diagonal rain streak
            ctx.fillStyle = `rgba(180, 200, 220, ${opacity})`; 
            
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const len = speed * (this.z + 1.2);
            const angle = Math.atan2(this.vy, this.vx);
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillRect(0, -0.6, len, 1.2);
            ctx.restore();
        } 
        else {
            let stretch = this.vy * 18; 
            if(stretch < this.size) stretch = this.size;
            
            let grad = ctx.createLinearGradient(this.x, this.y - stretch, this.x, this.y);
            grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
            grad.addColorStop(0.5, `rgba(255, 255, 255, 0.05)`);
            grad.addColorStop(1, `rgba(255, 255, 255, 0.3)`); 
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(this.x - this.size/2, this.y);
            ctx.lineTo(this.x, this.y - stretch);
            ctx.lineTo(this.x + this.size/2, this.y);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, 0.15)`; 
            ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, 0.95)`; 
            ctx.arc(this.x - (this.size*0.3), this.y - (this.size*0.3), this.size * 0.35, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

function init() {
    resize();
    initClouds();
    for (let i = 0; i < dropCount; i++) {
        drops.push(new Drop());
    }
    animate();
}

let frameCount = 0;

function animate() {
    frameCount++;
    
    // ======================================================
    // LIGHTNING TRIGGER
    // ======================================================
    if (!isLightning && Math.random() < 0.006) {
        isLightning = true;
        lightningTimer = Math.random() * 12 + 8;
        lightningIntensity = 1.0;
        
        lightningBolts.push(new LightningBolt());
        
        if(Math.random() > 0.6) {
            setTimeout(() => {
                lightningBolts.push(new LightningBolt());
            }, 80);
        }
    }
    
    if (isLightning) {
        lightningTimer--;
        lightningIntensity = Math.max(0, lightningIntensity - 0.06);
        
        if (lightningTimer <= 0) {
            isLightning = false;
            lightningIntensity = 0;
        }
        
        if(lightningIntensity > 0.5 && Math.random() > 0.7) {
            ctx.fillStyle = `rgba(255, 255, 255, ${lightningIntensity * 0.04})`;
            ctx.fillRect(0, 0, width, height);
        }
    }

    // Clear with fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
    ctx.fillRect(0, 0, width, height);

    // ======================================================
    // RENDER ORDER
    // ======================================================
    
    // 1. Clouds (pre-rendered, just scroll)
    cloudLayers.forEach(layer => {
        layer.update();
        layer.draw();
    });
    
    // 2. Lightning
    for (let i = lightningBolts.length - 1; i >= 0; i--) {
        lightningBolts[i].update();
        lightningBolts[i].draw();
        if (lightningBolts[i].life <= 0) {
            lightningBolts.splice(i, 1);
        }
    }

    // 3. Text
    draw3DText();

    // 4. Rain
    drops.forEach(drop => {
        drop.update();
        drop.draw();
    });

    // 5. Splashes
    for (let i = splashes.length - 1; i >= 0; i--) {
        splashes[i].update();
        splashes[i].draw();
        if (splashes[i].life <= 0) {
            splashes.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.onload = init;