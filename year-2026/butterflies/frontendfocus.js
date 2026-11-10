import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { gsap } from
"https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030407);

const camera = new THREE.OrthographicCamera(
  -8, 8, 5, -5, 0.1, 100
);

camera.position.set(0, 0, 25);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.1));

const warmLight = new THREE.DirectionalLight(0xffd5a5, 2.2);
warmLight.position.set(-5, 5, 10);
scene.add(warmLight);

const blueLight = new THREE.DirectionalLight(0x759ed4, 1.7);
blueLight.position.set(5, 2, 8);
scene.add(blueLight);

const COLORS = [
  0x7da9d5,
  0xd7a16c,
  0xe7d9c2,
  0x8998b9,
  0xb77b68,
  0x9aadd0,
  0xd5b18d
];

const butterflies = [];
const butterflyGroup = new THREE.Group();

scene.add(butterflyGroup);

const upperShape = new THREE.Shape();

upperShape.moveTo(0, 0);

upperShape.bezierCurveTo(
  0.10, 0.34,
  0.30, 0.72,
  0.70, 0.69
);

upperShape.bezierCurveTo(
  0.98, 0.66,
  1.02, 0.31,
  0.78, 0.12
);

upperShape.bezierCurveTo(
  0.54, -0.03,
  0.25, -0.08,
  0, 0
);

const lowerShape = new THREE.Shape();

lowerShape.moveTo(0, 0);

lowerShape.bezierCurveTo(
  0.12, 0.20,
  0.48, 0.29,
  0.60, 0.08
);

lowerShape.bezierCurveTo(
  0.67, -0.12,
  0.42, -0.38,
  0.22, -0.35
);

lowerShape.bezierCurveTo(
  0.07, -0.31,
  0.02, -0.12,
  0, 0
);


function createButterfly(index) {

  const butterfly = new THREE.Group();

  const color = COLORS[index % COLORS.length];

  const wingMaterial = new THREE.MeshPhysicalMaterial({
    color: color,
    side: THREE.DoubleSide,
    roughness: 0.5,
    metalness: 0.04,
    clearcoat: 0.4,
    emissive: color,
    emissiveIntensity: 0.07,
    transparent: true,
    opacity: 1,
    depthWrite: true
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x17181d,
    roughness: 0.7,
    transparent: true,
    opacity: 1
  });

  const veinMaterial = new THREE.LineBasicMaterial({
    color: 0xf4e4ce,
    transparent: true,
    opacity: 0.25
  });

  const upperGeometry = new THREE.ShapeGeometry(
    upperShape, 18
  );

  const lowerGeometry = new THREE.ShapeGeometry(
    lowerShape, 16
  );

  const wings = [];

  for (const side of [-1, 1]) {

    const upperPivot = new THREE.Group();

    upperPivot.position.set(side * 0.018, 0.035, 0);

    const upperWing = new THREE.Mesh(
      upperGeometry,
      wingMaterial
    );

    upperWing.scale.x = side;
    upperPivot.add(upperWing);

    butterfly.add(upperPivot);

    wings.push({
      pivot: upperPivot,
      side,
      lower: false
    });


    const lowerPivot = new THREE.Group();

    lowerPivot.position.set(side * 0.015, -0.035, -0.012);

    const lowerWing = new THREE.Mesh(
      lowerGeometry,
      wingMaterial
    );

    lowerWing.scale.x = side;
    lowerPivot.add(lowerWing);

    butterfly.add(lowerPivot);

    wings.push({
      pivot: lowerPivot,
      side,
      lower: true
    });
  }

  for (const side of [-1, 1]) {

    const points = [
      new THREE.Vector3(0, 0, 0.025),
      new THREE.Vector3(side * 0.24, 0.17, 0.025),
      new THREE.Vector3(side * 0.46, 0.32, 0.025),
      new THREE.Vector3(side * 0.68, 0.55, 0.025),

      new THREE.Vector3(side * 0.25, -0.11, 0.025),
      new THREE.Vector3(side * 0.43, -0.18, 0.025),
      new THREE.Vector3(side * 0.56, -0.20, 0.025)
    ];

    const geometry = new THREE.BufferGeometry()
      .setFromPoints(points);

    butterfly.add(
      new THREE.LineSegments(geometry, veinMaterial)
    );
  }

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.025, 0.23, 4, 8),
    bodyMaterial
  );

  body.rotation.z = Math.PI / 2;
  butterfly.add(body);

  for (const side of [-1, 1]) {

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side * 0.025, 0.12, 0),
      new THREE.Vector3(side * 0.07, 0.23, 0.005),
      new THREE.Vector3(side * 0.15, 0.25, 0.005)
    );

    const antenna = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(8)
      ),
      veinMaterial
    );

    butterfly.add(antenna);
  }


  const baseScale = 0.24 + Math.random() * 0.25;

  butterfly.scale.setScalar(baseScale);

  butterfly.userData = {
    wings,
    baseScale,
    phase: Math.random() * Math.PI * 2,
    flutter: 8 + Math.random() * 7,
    materials: [
      wingMaterial,
      bodyMaterial,
      veinMaterial
    ]
  };

  butterfly.visible = false;

  butterflyGroup.add(butterfly);
  butterflies.push(butterfly);

  return butterfly;
}

const BUTTERFLY_COUNT = 100;

for (let i = 0; i < BUTTERFLY_COUNT; i++) {
  createButterfly(i);
}

let halfWidth;
let halfHeight;

function resize() {

  const aspect = window.innerWidth / window.innerHeight;

  halfHeight = 5.15;
  halfWidth = halfHeight * aspect;

  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
}

resize();

window.addEventListener("resize", resize);

const clock = new THREE.Clock();

let elapsed = 0;

function animate() {

  requestAnimationFrame(animate);

  elapsed += Math.min(clock.getDelta(), 0.04);

  butterflies.forEach((b) => {

    if (!b.visible) return;

    const flap = Math.sin(
      elapsed * b.userData.flutter +
      b.userData.phase
    ) * 0.64;

    b.userData.wings.forEach(wing => {

      wing.pivot.rotation.y =
        wing.side * (wing.lower ? -0.18 : 0.08) +
        flap * wing.side;

      wing.pivot.rotation.z =
        wing.side * (wing.lower ? -0.055 : 0.025);

    });

    const phase = b.userData.phase;

    b.position.x +=
      Math.sin(elapsed * 0.48 + phase) * 0.0009;

    b.position.y +=
      Math.cos(elapsed * 0.62 + phase) * 0.0008;

  });

  renderer.render(scene, camera);
}

let masterTimeline;

function replayAnimation() {

  if (masterTimeline) {
    masterTimeline.kill();
  }

  butterflies.forEach(b => {

    b.visible = false;

    b.position.set(
      0,
      -halfHeight - 2,
      0
    );

    b.rotation.set(0, 0, 0);

    b.scale.setScalar(
      b.userData.baseScale
    );

    b.userData.materials.forEach(material => {
      material.opacity = 1;
    });

  });


  masterTimeline = gsap.timeline();

  const flightData = butterflies.map((b, i) => {

    const x = (Math.random() - 0.5) * halfWidth * 1.85;

    const y = (Math.random() - 0.5) * halfHeight * 1.75;

    const z = (Math.random() - 0.5) * 2.5;

    const delay =
      0.35 + i * 0.045 + Math.random() * 0.5;

    const scale =
      b.userData.baseScale *
      (0.7 + Math.random() * 1.15);

    return {
      b,
      x,
      y,
      z,
      delay,
      scale
    };

  });


  flightData.forEach(data => {

    const { b, x, y, z, delay, scale } = data;

    masterTimeline.add(() => {

      b.visible = true;

      b.position.set(
        (Math.random() - 0.5) * 1.2,
        -halfHeight - 1 - Math.random(),
        z
      );

      b.rotation.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.3
      );

      b.scale.setScalar(scale * 0.7);

    }, delay);

    masterTimeline.to(b.position, {

      x: x * 0.55,
      y: y - 0.3,
      z: z + 0.5,

      duration: 2.1 + Math.random() * 0.6,
      ease: "sine.out"

    }, delay);

    masterTimeline.to(b.scale, {

      x: scale,
      y: scale,
      z: scale,

      duration: 2,
      ease: "power2.out"

    }, delay);

    masterTimeline.to(b.position, {

      x: x,
      y: y + (Math.random() - 0.5) * 1.1,
      z: z,

      duration: 2.5 + Math.random() * 1.2,
      ease: "sine.inOut"

    }, delay + 1.6);

    masterTimeline.to(b.rotation, {

      y: (Math.random() - 0.5) * 2,
      z: (Math.random() - 0.5) * 0.6,

      duration: 3 + Math.random(),
      ease: "sine.inOut"

    }, delay + 0.3);

  });

  const ASCENT_START = 9.2;

  flightData.forEach(({ b }) => {

    const delay =
      ASCENT_START + Math.random() * 1.3;

    const targetY =
      halfHeight + 3 + Math.random() * 3;

    const targetX =
      b.position.x + (Math.random() - 0.5) * 2;


    masterTimeline.to(b.position, {

      x: targetX,
      y: targetY,
      z: b.position.z - 0.4,

      duration: 4.5 + Math.random() * 1.5,
      ease: "power1.in"

    }, delay);

    b.userData.materials.forEach(material => {

      masterTimeline.to(material, {

        opacity: 0,

        duration: 1.8,
        ease: "sine.in"

      }, delay + 3.1);

    });

  });

  masterTimeline.add(() => {

    butterflies.forEach(b => {
      b.visible = false;
    });

  }, 16.5);

}

document
  .getElementById("replay")
  .addEventListener("click", replayAnimation);

replayAnimation();
animate();