const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 1.5, 1000);
camera.position.set(0, 12, 55);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x050810, 1);
document.body.appendChild(renderer.domElement);

const COLS   = 62;
const ROWS   = 62;
const SPREAD = 22;
const RADIUS = 11;

const xs = Array.from({length: COLS}, (_, i) => (i/(COLS-1) - 0.5) * SPREAD);
const zs = Array.from({length: ROWS}, (_, j) => (j/(ROWS-1) - 0.5) * SPREAD);

const slimeOff = new Float32Array(COLS * ROWS);
const slimeVel = new Float32Array(COLS * ROWS);

const hLines = [];
const vLines = [];
const gridGroup = new THREE.Group();

const newMat = () => new THREE.LineBasicMaterial({
  color: 0x00ccff, transparent: true, opacity: 0.0,
  blending: THREE.AdditiveBlending, depthWrite: false,
});

(function buildGrid() {
  for (let row = 0; row < ROWS; row++) {
    const z = zs[row];
    let batch = [];
    const flush = () => {
      if (batch.length < 2) { batch = []; return; }
      const pts = batch.map(({col}) => new THREE.Vector3(xs[col], 0, z));
      const geo  = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, newMat());
      gridGroup.add(line);
      hLines.push({ line, verts: [...batch] });
      batch = [];
    };
    for (let col = 0; col < COLS; col++) {
      Math.hypot(xs[col], z) <= RADIUS ? batch.push({row,col}) : flush();
    }
    flush();
  }

  for (let col = 0; col < COLS; col++) {
    const x = xs[col];
    let batch = [];
    const flush = () => {
      if (batch.length < 2) { batch = []; return; }
      const pts = batch.map(({row}) => new THREE.Vector3(x, 0, zs[row]));
      const geo  = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, newMat());
      gridGroup.add(line);
      vLines.push({ line, verts: [...batch] });
      batch = [];
    };
    for (let row = 0; row < ROWS; row++) {
      Math.hypot(x, zs[row]) <= RADIUS ? batch.push({row,col}) : flush();
    }
    flush();
  }
})();

scene.add(gridGroup);

gridGroup.position.y = -15;
gsap.to(gridGroup.position, { y: 0, duration: 2.4, ease: 'power3.out' });
[...hLines, ...vLines].forEach(({line}) => {
  gsap.to(line.material, { opacity: 0.5, duration: 2.4, ease: 'power2.inOut' });
});

gsap.to('#hint', { opacity: 0, duration: 1.5, delay: 4, ease: 'power2.in' });

const wave = { t: 0 };
const WAVE_AMP   = 1.5;
const WAVE_FREQ  = 0.72;
const WAVE_SPEED = 2.2;
gsap.to(wave, { t: 1e6, duration: 1e6, ease: 'none', repeat: -1 });

function waveY(x, z) {
  const d = Math.hypot(x, z);
  const falloff = Math.max(0, 1 - d / RADIUS);
  return Math.sin(d * WAVE_FREQ - wave.t * WAVE_SPEED) * WAVE_AMP * falloff;
}

const raycaster   = new THREE.Raycaster();
const ndc         = new THREE.Vector2(-9999, -9999);
const groundPlane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
const worldMouse  = new THREE.Vector3();
const cursorEl    = document.getElementById('cursor');

let mouseActive = false;
window.addEventListener('mousemove', e => {
  mouseActive = true;
  ndc.set((e.clientX/innerWidth)*2-1, -(e.clientY/innerHeight)*2+1);
  cursorEl.style.left = e.clientX + 'px';
  cursorEl.style.top  = e.clientY + 'px';
});

const SLIME_R  = 3.0;
const PULL_MAX = 5.5;
const SPRING   = 24;
const DAMPING  = 7.2;

let prevT = performance.now();

gsap.ticker.add(() => {
  const now = performance.now();
  const dt  = Math.min((now - prevT) / 1000, 0.05);
  prevT = now;

  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.intersectPlane(groundPlane, worldMouse);
  const lm = gridGroup.worldToLocal(worldMouse.clone());

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = xs[col], z = zs[row];
      if (Math.hypot(x, z) > RADIUS) continue;

      const idx = row * COLS + col;
      const dm  = Math.hypot(x - lm.x, z - lm.z);

      let target = 0;
      if (mouseActive && dm < SLIME_R) {
        const u = 1 - dm / SLIME_R;
        target = PULL_MAX * u * u * (3 - 2*u);
      }

      const acc     = SPRING * (target - slimeOff[idx]) - DAMPING * slimeVel[idx];
      slimeVel[idx] += acc * dt;
      slimeOff[idx] += slimeVel[idx] * dt;
    }
  }

  for (const {line, verts} of hLines) {
    const a = line.geometry.attributes.position.array;
    for (let i = 0; i < verts.length; i++) {
      const {row, col} = verts[i];
      a[i*3+1] = waveY(xs[col], zs[row]) + slimeOff[row*COLS+col];
    }
    line.geometry.attributes.position.needsUpdate = true;
  }

  for (const {line, verts} of vLines) {
    const a = line.geometry.attributes.position.array;
    for (let i = 0; i < verts.length; i++) {
      const {row, col} = verts[i];
      a[i*3+1] = waveY(xs[col], zs[row]) + slimeOff[row*COLS+col];
    }
    line.geometry.attributes.position.needsUpdate = true;
  }

  gridGroup.rotation.y = wave.t * 0.04;

  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});