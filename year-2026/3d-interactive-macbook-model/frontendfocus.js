import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GUI} from "https://esm.sh/lil-gui@0.17.0";
import { gsap } from "https://esm.sh/gsap@3.15.0";


// =======================================================
// Globals

const canvasEl = document.querySelector("#laptop");
const videoEl = document.createElement("video");

let mainTl, laptopAppearTl, laptopOpeningTl, screenOnTl, cameraOnTl, textureScrollTl, floatingTl;
let scene, camera, renderer, orbit;
let darkPlasticMaterial, cameraMaterial, baseMetalMaterial, logoMaterial, screenMaterial, keyboardMaterial;
let macGroup, lidGroup, bottomGroup, screenMesh, lightHolder, screenLight;
let screenImageTexture, screenCameraTexture;

let openingControl, contentScrollControl;
const controlParams = {
    cameraOn: false,
    openingProgress: 0,
    contentScrollProgress: 0
}
const screenSize = [29.4, 20];


// =======================================================
// Start the app

initScene();
createMaterials();

// connectToWebcam(); // if you set the webcam in advance

const modelLoader = new GLTFLoader();
modelLoader.load(
    "https://ksenia-k.com/models/mac-noUv.glb",
    glb => {
        parseModel(glb);
        addScreen();
        addKeyboard();
        createControls();
        createTimelines();
        mainTl.play(0);

        render();
        updateSceneSize();
        window.addEventListener("resize", () => updateSceneSize());
    });


// =======================================================
// Three.js stuff

function initScene() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 10, 1000);
    camera.position.z = 75;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: canvasEl
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, .2);
    scene.add(ambientLight);

    lightHolder = new THREE.Group();
    scene.add(lightHolder);
    const light = new THREE.PointLight(0xFFF5E1, .8);
    light.position.set(0, 5, 50);
    lightHolder.add(light);

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.minDistance = 45;
    orbit.maxDistance = 120;
    orbit.enablePan = false;
    orbit.enableDamping = true;

    macGroup = new THREE.Group();
    macGroup.position.z = -10;
    scene.add(macGroup);
    lidGroup = new THREE.Group();
    macGroup.add(lidGroup);
    bottomGroup = new THREE.Group();
    macGroup.add(bottomGroup);
}

function updateSceneSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createMaterials() {

    const textLoader = new THREE.TextureLoader();
    screenImageTexture = textLoader.load("https://ksenia-k.com/img/threejs/macbook-screen-texture.png", tex => {
        tex.flipY = false;
        tex.wrapS = THREE.RepeatWrapping;
        tex.repeat.y = tex.image.width / tex.image.height / screenSize[0] * screenSize[1];
    })

    screenCameraTexture = new THREE.VideoTexture(videoEl);
    screenCameraTexture.flipY = false;
    screenMaterial = new THREE.MeshBasicMaterial({
        map: screenImageTexture,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
    });
    const keyboardTexture = textLoader.load("keyboard-overlay.png");
    keyboardMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        alphaMap: keyboardTexture,
        transparent: true,
    });

    darkPlasticMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: .9,
        metalness: .9,
    });
    cameraMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333
    });
    baseMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0xCECFD3
    });
    logoMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });
}

function render() {
    orbit.update();
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}


// =======================================================
// Add laptop elements to the scene

function parseModel(glb) {
    [...glb.scene.children].forEach(child => {
        if (child.name === "_top") {
            lidGroup.add(child);
            [...child.children].forEach(mesh => {
                if (mesh.name === "lid") {
                    mesh.material = baseMetalMaterial;
                } else if (mesh.name === "logo") {
                    mesh.material = logoMaterial;
                } else if (mesh.name === "screen-frame") {
                    mesh.material = darkPlasticMaterial;
                } else if (mesh.name === "camera") {
                    mesh.material = cameraMaterial;
                }
            })
        } else if (child.name === "_bottom") {
            bottomGroup.add(child);
            [...child.children].forEach(mesh => {
                if (mesh.name === "base") {
                    mesh.material = baseMetalMaterial;
                } else if (mesh.name === "legs") {
                    mesh.material = darkPlasticMaterial;
                } else if (mesh.name === "keyboard") {
                    mesh.material = darkPlasticMaterial;
                } else if (mesh.name === "inner") {
                    mesh.material = darkPlasticMaterial;
                }
            })
        }
    });
}

// =======================================================
// Additional elements to create.
// The imported model doesn't have UV included (to reduce file size)
// so it's easier to add textured elements manually;

function addScreen() {
    screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(screenSize[0], screenSize[1]),
        screenMaterial
    )
    screenMesh.position.set(0, 10.5, -.11);
    screenMesh.rotation.set(Math.PI, 0, 0);
    lidGroup.add(screenMesh);

    screenLight = new THREE.RectAreaLight(0xffffff, 0, screenSize[0], screenSize[1]);
    screenLight.position.set(0, 10.5, 0);
    screenLight.rotation.set(Math.PI, 0, 0);
    lidGroup.add(screenLight);

    const darkScreen = screenMesh.clone();
    darkScreen.position.set(0, 10.5, -.111);
    darkScreen.rotation.set(Math.PI, Math.PI, 0);
    darkScreen.material = darkPlasticMaterial;
    lidGroup.add(darkScreen);
}

function addKeyboard() {
    const keyboardKeys = new THREE.Mesh(
        new THREE.PlaneGeometry(27.7, 11.6),
        keyboardMaterial
    )
    keyboardKeys.rotation.set(-.5 * Math.PI, 0, 0);
    keyboardKeys.position.set(0, .045, 7.21);
    bottomGroup.add(keyboardKeys);
}


// =======================================================
// Animation timelines:
//
// - floatingTl: laptop to move up and down slowly
// - screenOnTl: turn screen from dark panel to textured & lightened panel
// - laptopOpeningTl: open the lid & switch on the screen
//     => connected to the slider (see createControls())
// - cameraOnTl: switch webcam LED to green and back
// - textureScrollTl: move content on the screen vertically
//     => connected to the slider (see createControls())
// - laptopAppearTl: let laptop come to the viewport from the bottom of the screen
//
// - mainTl: master timeline we play on page load

function createTimelines() {

    // ---------------------------------------------------
    floatingTl = gsap.timeline({
        repeat: -1,
    })
        .to([lidGroup.position, bottomGroup.position], {
            duration: 1.5,
            y: "+=1",
            ease: "power1.inOut"
        }, 0)
        .to([lidGroup.position, bottomGroup.position], {
            duration: 1.5,
            y: "-=1",
            ease: "power1.inOut"
        })
        .timeScale(0)

    // ---------------------------------------------------
    screenOnTl = gsap.timeline({
        paused: true,
    })
        .to(screenMaterial, {
            duration: .1,
            opacity: .96
        }, 0)
        .to(screenLight, {
            duration: .1,
            intensity: 1.5
        }, 0)

    // ---------------------------------------------------
    laptopOpeningTl = gsap.timeline({
        paused: true,
        onUpdate: () => {
            controlParams.openingProgress = laptopOpeningTl.progress();
            openingControl.updateDisplay();
        }
    })
        .from(lidGroup.position, {
            duration: .75,
            z: "+=.5"
        }, 0)
        .fromTo(lidGroup.rotation, {
            duration: 1,
            x: .5 * Math.PI
        }, {
            x: -.2 * Math.PI
        }, 0)
        .to(screenOnTl, {
            duration: .06,
            progress: 1
        }, .05);

    // ---------------------------------------------------
    cameraOnTl = gsap.timeline({
        paused: true,
        reversed: true
    })
        .to(cameraMaterial.color, {
    duration: .01,
    r: 0,
    g: 1,
    b: 0
}, 0)

    // ---------------------------------------------------
    textureScrollTl = gsap.timeline({
        paused: true,
        onUpdate: () => {
            controlParams.contentScrollProgress = textureScrollTl.progress();
            contentScrollControl.updateDisplay();
        }
    })
        .to(screenImageTexture.offset, {
            duration: 2,
            y: .4,
            ease: "power1.inOut",
        })


    // ---------------------------------------------------
    laptopAppearTl = gsap.timeline({
        paused: true
    })
        .fromTo(macGroup.rotation, {
            x: .5 * Math.PI,
            y: .2 * Math.PI
        }, {
            duration: 2,
            x: .05 * Math.PI,
            y: -.1 * Math.PI
        }, 0)
        .fromTo(macGroup.position, {
            y: -50
        }, {
            duration: 1,
            y: -8
        }, 0)

    // ---------------------------------------------------
    // ---------------------------------------------------
    mainTl = gsap.timeline({
        defaults: {
            ease: "none"
        }
    })
        .to(laptopAppearTl, {
            duration: 1.5,
            progress: 1
        }, 0)
        .to(laptopOpeningTl, {
            duration: 1,
            progress: .34
        }, .5)
        .to(textureScrollTl, {
            duration: 1.5,
            progress: 1
        }, 1.5)
        .to(textureScrollTl, {
            duration: 1,
            progress: 0
        })
        .to(floatingTl, {
            duration: 1,
            timeScale: 1
        }, 1)
}

// =======================================================
// Handling web-camera stream

function connectToWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {video: {width: 1280, height: 720, facingMode: "user"}};
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            videoEl.srcObject = stream;
            videoEl.play();
        }).catch(err => {
            console.error("Unable to access the camera/webcam.", err);
        });
    } else {
        console.error("MediaDevices interface not available.");
    }
}

// =======================================================
// UX Controls for debugging and stuff

function createControls() {
    const gui = new GUI();
    gui.add(controlParams, "cameraOn").onChange(v => {
        if (v) {
            if (!videoEl.srcObject) {
                connectToWebcam();
            }
            gsap.to(screenOnTl, {
                duration: .2,
                progress: 1
            })
            cameraOnTl.play();
            contentScrollControl.hide();
        } else {
            cameraOnTl.reverse();
            contentScrollControl.show();
        }
        screenMaterial.map = v ? screenCameraTexture : screenImageTexture;
    })
        .name("camera on")
    openingControl = gui.add(controlParams, "openingProgress", 0, 1).onChange(v => {
        laptopOpeningTl.progress(v);
    })
        .name("laptop opening animation")
    contentScrollControl = gui.add(controlParams, "contentScrollProgress", 0, 1).onChange(v => {
        textureScrollTl.progress(v);
    })
        .name("scroll content")
}