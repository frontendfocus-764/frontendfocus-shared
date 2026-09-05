// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x444444); // Ensures the background is properly set

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); // Alpha false to allow solid background color
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x444444, 1); // Ensure clear color matches background
document.body.appendChild(renderer.domElement);

// Load cloud texture
const textureLoader = new THREE.TextureLoader();
const cloudTexture = textureLoader.load('clouds.webp'); 

// Create cloud material
const cloudMaterial = new THREE.SpriteMaterial({ map: cloudTexture, transparent: true });

// Function to create clouds at random positions
function createCloud(scaleSize, depthRange, spread) {
    const cloud = new THREE.Sprite(cloudMaterial.clone());
    cloud.scale.set(scaleSize, scaleSize * 0.67, 1);
    cloud.position.set(
        Math.random() * spread - spread / 2,
        Math.random() * (spread / 2) - spread / 4,
        Math.random() * depthRange - depthRange / 2
    );
    return cloud;
}

// Generate clickable floating clouds
const clouds = [];
for (let i = 0; i < 20; i++) {
    const cloud = createCloud(5, 10, 20);
    scene.add(cloud);
    clouds.push(cloud);
}

// Generate background clouds that move like particles
const bgClouds = [];
for (let i = 0; i < 30; i++) {
    const cloud = createCloud(6, 30, 30);
    scene.add(cloud);
    bgClouds.push(cloud);
}

// Create rain particles **NOW SPREAD ACROSS THE WHOLE SCREEN**
const rainGeometry = new THREE.BufferGeometry();
const rainCount = 3000; // Increased rain density
const rainVertices = [];

for (let i = 0; i < rainCount; i++) {
    rainVertices.push(
        Math.random() * 40 - 20, // Spread across the whole screen
        Math.random() * 20,       // Covers the whole height
        Math.random() * -40 + 10 // Covers depth in the scene
    );
}
rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));

const rainMaterial = new THREE.PointsMaterial({ color: 0x66aaff, size: 0.05 });
const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

camera.position.z = 6;

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Handle cloud clicking
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clouds);

    if (intersects.length > 0) {
        let clickedCloud = intersects[0].object;

        // "Poof" particle burst
        const burstParticles = [];
        for (let i = 0; i < 10; i++) {
            const particle = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffffff, transparent: true, opacity: 1 }));
            particle.scale.set(0.5, 0.5, 0.5);
            particle.position.copy(clickedCloud.position);
            scene.add(particle);
            burstParticles.push(particle);
            
            gsap.to(particle.position, {
                x: particle.position.x + (Math.random() - 0.5) * 2,
                y: particle.position.y + (Math.random() - 0.5) * 2,
                z: particle.position.z + (Math.random() - 0.5) * 2,
                duration: 1,
                onComplete: () => scene.remove(particle)
            });

            gsap.to(particle.material, { opacity: 0, duration: 1 });
        }

        gsap.to(clickedCloud.scale, { x: 0, y: 0, duration: 0.5, onComplete: () => scene.remove(clickedCloud) });
        clouds.splice(clouds.indexOf(clickedCloud), 1);
    }
}

window.addEventListener('click', onMouseClick);

// Animate background clouds moving like particles
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();

    // Move rain down
    const positions = rain.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.08;
        if (positions[i] < -10) positions[i] = 10; // Covers full height of scene
    }
    rain.geometry.attributes.position.needsUpdate = true;

    // Move background clouds slowly for depth effect
    bgClouds.forEach(cloud => {
        cloud.position.x += 0.005;
        if (cloud.position.x > 15) cloud.position.x = -15;
    });

    renderer.render(scene, camera);
}
animate();

// Handle resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
