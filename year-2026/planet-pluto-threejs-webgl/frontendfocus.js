import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
        import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
        import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
        import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
        import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

        let scene, camera, renderer, controls, clock, composer;
        let pluto;
        const container = document.getElementById('container');

        // Noise functions for procedural generation
        const noiseFunctions = `
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
            }
            float fbm(vec3 p) {
                float f = 0.0;
                f += 0.5000 * snoise(p); p *= 2.02;
                f += 0.2500 * snoise(p); p *= 2.03;
                f += 0.1250 * snoise(p); p *= 2.01;
                f += 0.0625 * snoise(p);
                return f / 0.9375;
            }
        `;

        function init() {
            scene = new THREE.Scene();
            clock = new THREE.Clock();
            
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
            camera.position.set(0, 0, 15);

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            container.appendChild(renderer.domElement);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 8;
            controls.maxDistance = 50;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.1;

            createPluto();
            createStarfield();
            createNebula();
            setupPostProcessing();

            window.addEventListener('resize', onWindowResize);
        }

        function setupPostProcessing() {
            composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));
            
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.3);
            composer.addPass(bloomPass);

            const vignettePass = new ShaderPass({
                uniforms: { "tDiffuse": { value: null }, "darkness": { value: 1.2 }, "offset": { value: 1.2 } },
                vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                fragmentShader: `
                    uniform sampler2D tDiffuse; uniform float darkness; uniform float offset; varying vec2 vUv;
                    void main() {
                        vec2 uv = (vUv - vec2(0.5)) * offset; float len = length(uv);
                        float vig = smoothstep(0.8, 0.2, len);
                        vec4 color = texture2D(tDiffuse, vUv);
                        gl_FragColor = color * vig * darkness;
                    }`
            });
            composer.addPass(vignettePass);
            composer.addPass(new OutputPass());
        }

        function createPluto() {
            const plutoMaterial = new THREE.ShaderMaterial({
                uniforms: { u_time: { value: 0 } },
                vertexShader: `
                    varying vec3 v_position; varying vec3 v_normal;
                    void main() {
                        v_position = position; v_normal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }`,
                fragmentShader: `
                    uniform float u_time; varying vec3 v_position; varying vec3 v_normal;
                    ${noiseFunctions}
                    void main() {
                        vec3 p = normalize(v_position); float t = u_time * 0.05;
                        float base_noise = fbm(p * 2.5 + t);
                        float detail_noise = fbm(p * 9.0 + t * 0.4);
                        float final_noise = (base_noise + detail_noise * 0.25) / 1.25;

                        // More realistic colors based on New Horizons data
                        vec3 color_ice = vec3(0.95, 0.92, 0.90);    // Bright nitrogen ice (Sputnik Planitia)
                        vec3 color_tholin = vec3(0.6, 0.3, 0.15);  // Reddish-brown organic compounds
                        vec3 color_dark = vec3(0.1, 0.08, 0.07);   // Dark, cratered terrain
                        
                        vec3 color = mix(color_dark, color_tholin, smoothstep(-0.2, 0.3, final_noise));
                        color = mix(color, color_ice, smoothstep(0.45, 0.48, final_noise)); // Sharper edge for the "heart"

                        float fresnel = pow(1.0 - abs(dot(v_normal, vec3(0.0, 0.0, 1.0))), 3.5);
                        vec3 glowColor = vec3(0.4, 0.6, 0.8) * 0.5; // Faint blue atmospheric haze

                        gl_FragColor = vec4(color + glowColor * fresnel, 1.0);
                    }`,
            });
            
            const geometry = new THREE.SphereGeometry(5, 128, 128);
            pluto = new THREE.Mesh(geometry, plutoMaterial);
            scene.add(pluto);
        }

        function createStarfield() {
            const starCount = 8000;
            const positions = new Float32Array(starCount * 3);
            const colors = new Float32Array(starCount * 3);
            const sizes = new Float32Array(starCount);
            const color = new THREE.Color();

            for (let i = 0; i < starCount; i++) {
                const r = 800 + Math.random() * 1200;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                positions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)], i * 3);
                
                color.setHSL(0.5 + Math.random() * 0.2, 0.8, 0.7 + Math.random() * 0.2);
                colors.set([color.r, color.g, color.b], i * 3);
                sizes[i] = Math.random() * 2.5 + 0.8;
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const starMaterial = new THREE.ShaderMaterial({
                uniforms: { u_time: { value: 0 } },
                vertexShader: `
                    attribute float size; varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }`,
                fragmentShader: `
                    uniform float u_time; varying vec3 vColor;
                    ${noiseFunctions}
                    void main() {
                        float twinkle = snoise(vec3(gl_PointCoord.xy * 10.0, u_time * 0.8));
                        float brightness = 0.7 + twinkle * 0.3;
                        if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
                        gl_FragColor = vec4(vColor * brightness, 1.0);
                    }`,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
            });

            const stars = new THREE.Points(geometry, starMaterial);
            scene.add(stars);
        }

        function createNebula() {
            const nebulaMaterial = new THREE.ShaderMaterial({
                uniforms: { u_time: { value: 0 } },
                vertexShader: `varying vec3 v_position; void main() { v_position = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
                fragmentShader: `
                    varying vec3 v_position; uniform float u_time;
                    ${noiseFunctions}
                    void main() {
                        vec3 p = normalize(v_position); float t = u_time * 0.01;
                        float noise_main = fbm(p * 1.5 + t);
                        float noise_detail = fbm(p * 5.0 + t * 0.5);
                        
                        vec3 color1 = vec3(0.01, 0.015, 0.02); // Deep, dark space
                        vec3 color2 = vec3(0.05, 0.06, 0.08);  // Faint dust clouds
                        
                        vec3 finalColor = mix(color1, color2, smoothstep(0.3, 0.6, noise_main));
                        finalColor += color1 * smoothstep(0.5, 0.7, noise_detail) * 0.5;

                        gl_FragColor = vec4(finalColor, 1.0);
                    }`,
                side: THREE.BackSide,
                depthWrite: false
            });
            const nebula = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 32), nebulaMaterial);
            scene.add(nebula);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // Update all time-based shaders
            scene.traverse(child => {
                if (child.material && child.material.uniforms && child.material.uniforms.u_time) {
                    child.material.uniforms.u_time.value = time;
                }
            });
            
            pluto.rotation.y += 0.03 * delta;

            controls.update();
            composer.render();
        }

        init();
        animate();