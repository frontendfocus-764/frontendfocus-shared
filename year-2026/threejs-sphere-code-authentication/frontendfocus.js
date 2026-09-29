const canvas = document.getElementById('three-canvas');
const width = 280;
const height = 280;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.z = 175;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function createDigitTexture(digit) {
    const numCanvas = document.createElement('canvas');
    numCanvas.width = 128;
    numCanvas.height = 128;
    const ctx = numCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 85px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, 64, 64);
    const texture = new THREE.CanvasTexture(numCanvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

const digitTextures = [];
for (let i = 0; i <= 9; i++) {
    digitTextures.push(createDigitTexture(i));
}

const sphereGroup = new THREE.Group();
scene.add(sphereGroup);

const sphereRadius = 65;
const totalParticles = 650;
const sprites = [];

for (let i = 0; i < totalParticles; i++) {
    const phi = Math.acos(-1 + (2 * i) / totalParticles);
    const theta = Math.sqrt(totalParticles * Math.PI) * phi;

    const randomDigit = Math.floor(Math.random() * 10);
    const material = new THREE.SpriteMaterial({ 
        map: digitTextures[randomDigit], 
        transparent: true,
        opacity: 1.0
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.x = sphereRadius * Math.sin(phi) * Math.cos(theta);
    sprite.position.y = sphereRadius * Math.sin(phi) * Math.sin(theta);
    sprite.position.z = sphereRadius * Math.cos(phi);

    const scale = 5.8;
    sprite.scale.set(scale, scale, 1);

    sphereGroup.add(sprite);
    sprites.push(sprite);
}

const coreCanvas = document.createElement('canvas');
coreCanvas.width = 64;
coreCanvas.height = 64;
const coreCtx = coreCanvas.getContext('2d');
const gradient = coreCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.25)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
coreCtx.fillStyle = gradient;
coreCtx.fillRect(0, 0, 64, 64);

const coreTexture = new THREE.CanvasTexture(coreCanvas);
const coreMaterial = new THREE.SpriteMaterial({ map: coreTexture, transparent: true });
const coreSprite = new THREE.Sprite(coreMaterial);
coreSprite.scale.set(12, 12, 1);
sphereGroup.add(coreSprite);

const worldPos = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);
    sphereGroup.rotation.y += 0.0025;
    sphereGroup.rotation.x += 0.0008;

    for (let i = 0; i < sprites.length; i++) {
        sprites[i].getWorldPosition(worldPos);
        const depthRatio = (worldPos.z + sphereRadius) / (2 * sphereRadius);
        sprites[i].material.opacity = Math.max(0.12, Math.min(1.0, depthRatio * 1.1));
    }
    renderer.render(scene, camera);
}
animate();

const inputs = document.querySelectorAll('.otp-input');
const inputBoxes = document.querySelectorAll('.otp-input-box');
const otpContainer = document.getElementById('otp-container');
const svgOverlay = document.getElementById('svg-overlay');
const morphPath = document.getElementById('morph-path');
const dissolveLines = document.querySelectorAll('.dissolve-line');
const checkmarkSvg = document.getElementById('checkmark-svg');

const CORRECT_CODE = "2026";
let isVerifying = false;

const MERGED_CAPSULE_PATH = "M 18,1 H 234 A 17,17 0 0 1 251,18 V 50 A 17,17 0 0 1 234,67 H 18 A 17,17 0 0 1 1,50 V 18 A 17,17 0 0 1 18,1 Z";

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (isVerifying) return;

        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        if (e.target.value !== '' && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        const currentCode = Array.from(inputs).map(inp => inp.value).join('');
        if (currentCode.length === inputs.length) {
            validateCode(currentCode);
        }
    });

    input.addEventListener('keydown', (e) => {
        if (isVerifying) return;
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            inputs[index - 1].focus();
        }
    });

    input.addEventListener('focus', (e) => {
        if (!isVerifying) e.target.select();
    });
});

function validateCode(code) {
    if (code === CORRECT_CODE) {
        isVerifying = true;

        inputBoxes.forEach(box => {
            box.classList.remove('error');
            box.classList.add('correct');
            box.querySelector('input').blur();
        });

        setTimeout(() => {
            svgOverlay.classList.add('active');
            otpContainer.classList.add('morphed');

            dissolveLines.forEach(line => line.classList.add('dissolved'));

            setTimeout(() => {
                morphPath.setAttribute('d', MERGED_CAPSULE_PATH);
            }, 50);

            setTimeout(() => {
                checkmarkSvg.classList.add('active');
            }, 50);

        }, 2000);

    } else {
        isVerifying = true;
        inputBoxes.forEach(box => {
            box.classList.remove('correct');
            box.classList.add('error');
        });
        
        otpContainer.classList.add('shake');

        setTimeout(() => {
            otpContainer.classList.remove('shake');
            inputBoxes.forEach(box => {
                box.classList.remove('error');
                box.querySelector('input').value = '';
            });
            inputs[0].focus();
            isVerifying = false;
        }, 500);
    }
}

inputs[0].focus();