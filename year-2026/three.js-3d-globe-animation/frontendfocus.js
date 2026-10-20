import * as THREE from 'https://esm.sh/three@0.160';
import { OrbitControls } from 'https://esm.sh/three@0.160/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('globe');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 3.2);

const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableZoom = false;
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;

const RADIUS = 1;
const DOT_COLOR = 0xff7038;
const ARC_COLOR = 0xffffff;
const DOT_SIZE = 0.006;
const ARC_THICKNESS = 0.004;

const loader = new THREE.TextureLoader();
const landMask = await loader.loadAsync(
  'earth.jpg'
);

const maskCanvas = document.createElement('canvas');
const MASK_W = 1024, MASK_H = 512;
maskCanvas.width = MASK_W;
maskCanvas.height = MASK_H;
const ctx = maskCanvas.getContext('2d');
ctx.drawImage(landMask.image, 0, 0, MASK_W, MASK_H);
const maskData = ctx.getImageData(0, 0, MASK_W, MASK_H).data;

function isLand(lat, lon) {
  const u = (lon + 180) / 360;
  const v = (90 - lat) / 180;
  const x = Math.floor(u * MASK_W);
  const y = Math.floor(v * MASK_H);
  const i = (y * MASK_W + x) * 4;
  const brightness = (maskData[i] + maskData[i + 1] + maskData[i + 2]) / 3;
  return brightness < 100;
}

const positions = [];
const STEP = 1.2;

for (let lat = -90; lat <= 90; lat += STEP) {
  const circumference = Math.cos(lat * Math.PI / 180);
  const lonStep = STEP / Math.max(circumference, 0.05);
  for (let lon = -180; lon < 180; lon += lonStep) {
    if (!isLand(lat, lon)) continue;
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    positions.push(
      -RADIUS * Math.sin(phi) * Math.cos(theta),
       RADIUS * Math.cos(phi),
       RADIUS * Math.sin(phi) * Math.sin(theta)
    );
  }
}

const dotGeo = new THREE.SphereGeometry(DOT_SIZE, 6, 6);
const dotMat = new THREE.MeshBasicMaterial({ color: DOT_COLOR });
const dots = new THREE.InstancedMesh(dotGeo, dotMat, positions.length / 3);
const dummy = new THREE.Object3D();

for (let i = 0; i < positions.length / 3; i++) {
  dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
  dummy.updateMatrix();
  dots.setMatrixAt(i, dummy.matrix);
}
dots.instanceMatrix.needsUpdate = true;
scene.add(dots);

function latLonToVec3(lat, lon, r = RADIUS) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeIconTexture(type) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.fillStyle = '#ffffff';
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = '#ff7038';
  g.stroke();

  if (type === 'user') {
    g.strokeStyle = '#ff7038';
    g.lineWidth = 12;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(cx, cy - 30, 26, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy + 80, 52, Math.PI, 0, false);
    g.stroke();
  } else if (type === 'db') {
    g.fillStyle = '#ff7038';
    const w = 90, h = 26;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.ellipse(cx, cy - 38 + i * 38, w / 2, h / 2, 0, 0, Math.PI * 2);
      g.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const markerTextures = {
  user: makeIconTexture('user'),
  db: makeIconTexture('db')
};

const markers = [];

function addMarker(lat, lon, type) {
  const pos = latLonToVec3(lat, lon, RADIUS * 1.015);
  const mat = new THREE.SpriteMaterial({
    map: markerTextures[type],
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(mat);
  const baseScale = type === 'db' ? 0.10 : 0.08;
  sprite.scale.setScalar(baseScale);
  sprite.position.copy(pos);
  sprite.renderOrder = 100;
  sprite.visible = false;
  scene.add(sprite);

  markers.push({
    sprite,
    normal: pos.clone().normalize()
  });
}

const arcs = [];
let arcSeed = 0;

function makeArc(a, b, color = ARC_COLOR) {
  const v1 = latLonToVec3(a.lat, a.lon);
  const v2 = latLonToVec3(b.lat, b.lon);
  const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(1.35);
  const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);

  const tubularSegments = 128;
  const radialSegments = 6;
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, ARC_THICKNESS, radialSegments, false);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 5000;
  mesh.raycast = () => null;
  geometry.setDrawRange(0, 0);
  scene.add(mesh);

  const totalIndices = geometry.index.count;
  const ringIndices = radialSegments * 6;

  const seed = arcSeed++;
  arcs.push({
    geometry,
    totalIndices,
    ringIndices,
    delay: seed * 0.35,
    speed: 0.55 + (seed % 3) * 0.08
  });

  return mesh;
}

const POIS = [
  { lat: 37.77, lon: -122.42, type: 'user' },
  { lat: 51.50, lon: -0.12,   type: 'db'   },
  { lat: 35.68, lon: 139.69,  type: 'db'   },
  { lat: -33.86, lon: 151.20, type: 'user' },
  { lat: 1.35,  lon: 103.81,  type: 'user' },
  { lat: 55.75, lon: 37.61,   type: 'db'   },
];

POIS.forEach(p => addMarker(p.lat, p.lon, p.type));

makeArc(POIS[0], POIS[1]);
makeArc(POIS[1], POIS[2]);
makeArc(POIS[2], POIS[3]);
makeArc(POIS[1], POIS[5]);
makeArc(POIS[0], POIS[4]);

const clock = new THREE.Clock();

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const CYCLE = 3.4;
const camDir = new THREE.Vector3();

function tick() {
  const t = clock.getElapsedTime();
  controls.update();

  for (let a = 0; a < arcs.length; a++) {
    const arc = arcs[a];
    const local = ((t * arc.speed - arc.delay) % CYCLE + CYCLE) % CYCLE;
    const phase = local / CYCLE;

    const progress = easeInOut(phase) * 2;
    const head = Math.min(progress, 1);
    const tail = Math.max(progress - 1, 0);

    const startIdx = Math.floor(tail * arc.totalIndices / arc.ringIndices) * arc.ringIndices;
    const endIdx = Math.floor(head * arc.totalIndices / arc.ringIndices) * arc.ringIndices;
    const count = Math.max(0, endIdx - startIdx);

    arc.geometry.setDrawRange(startIdx, count);
  }

  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    camDir.copy(camera.position).sub(m.sprite.position).normalize();
    const facing = m.normal.dot(camDir);
    m.sprite.visible = facing > 0.05;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, innerHeight);
});