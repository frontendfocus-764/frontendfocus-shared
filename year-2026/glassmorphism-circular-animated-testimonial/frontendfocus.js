const testimonials = [
    {
        quote: "An absolutely delightful experience from start to finish. The attention to detail, warm service, and overall atmosphere made this visit truly memorable.",
        name: "Danielle Hoffman",
        designation: "Happy Customer",
        src: "pp1.jpg",
    },
    {
        quote: "A fantastic place for regular visits. The ambiance is relaxing, the staff is welcoming, and the consistency in quality keeps me coming back every time.",
        name: "Michael Turner",
        designation: "Regular Guest",
        src: "pp2.jpg",
    },
    {
        quote: "Dining experience was outstanding. Each dish felt thoughtfully prepared, and flavors perfectly balanced. Service was prompt and professional throughout visit.",
        name: "Emily Richardson",
        designation: "Food Blogger",
        src: "pp3.jpg",
    },

];

let activeIndex = 0;
const imageContainer = document.getElementById('image-container');
const nameElement = document.getElementById('name');
const designationElement = document.getElementById('designation');
const quoteElement = document.getElementById('quote');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

function calculateGap(width) {
    const minWidth = 1024;
    const maxWidth = 1456;
    const minGap = 60;
    const maxGap = 86;

    if (width <= minWidth) return minGap;
    if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));

    return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

function updateTestimonial(direction) {
    const oldIndex = activeIndex;
    activeIndex = (activeIndex + direction + testimonials.length) % testimonials.length;

    const containerWidth = imageContainer.offsetWidth;
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8; // 80% of the calculated gap

    testimonials.forEach((testimonial, index) => {
        let img = imageContainer.querySelector(`[data-index="${index}"]`);
        if (!img) {
            img = document.createElement('img');
            img.src = testimonial.src;
            img.alt = testimonial.name;
            img.classList.add('testimonial-image');
            img.dataset.index = index;
            imageContainer.appendChild(img);
        }

        const offset = (index - activeIndex + testimonials.length) % testimonials.length;
        const zIndex = testimonials.length - Math.abs(offset);
        const opacity = index === activeIndex ? 1 : 1;
        const scale = index === activeIndex ? 1 : 0.85;

        let translateX, translateY, rotateY;
        if (offset === 0) {
            translateX = '0%';
            translateY = '0%';
            rotateY = 0;
        } else if (offset === 1 || offset === -2) {
            translateX = '20%';
            translateY = `-${maxStickUp / img.offsetHeight * 100}%`;
            rotateY = -15;
        } else {
            translateX = '-20%';
            translateY = `-${maxStickUp / img.offsetHeight * 100}%`;
            rotateY = 15;
        }

        gsap.to(img, {
            zIndex: zIndex,
            opacity: opacity,
            scale: scale,
            x: translateX,
            y: translateY,
            rotateY: rotateY,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    gsap.to([nameElement, designationElement], {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            nameElement.textContent = testimonials[activeIndex].name;
            designationElement.textContent = testimonials[activeIndex].designation;
            gsap.to([nameElement, designationElement], {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
    });

    gsap.to(quoteElement, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            quoteElement.innerHTML = testimonials[activeIndex].quote.split(' ').map(word => `<span class="word">${word}</span>`).join(' ');
            gsap.to(quoteElement, {
                opacity: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out"
            });
            animateWords();
        }
    });
}

function animateWords() {
    gsap.from('.word', {
        opacity: 0,
        y: 10,
        stagger: 0.02,
        duration: 0.2,
        ease: "power2.out"
    });
}

function handleNext() {
    updateTestimonial(1);
}

function handlePrev() {
    updateTestimonial(-1);
}

prevButton.addEventListener('click', handlePrev);
nextButton.addEventListener('click', handleNext);

// Initial setup
updateTestimonial(0);

// Autoplay functionality
const autoplayInterval = setInterval(handleNext, 5000);

// Stop autoplay on user interaction
[prevButton, nextButton].forEach(button => {
    button.addEventListener('click', () => {
        clearInterval(autoplayInterval);
    });
});

// Handle window resize
window.addEventListener('resize', () => updateTestimonial(0));

// JS appendic for your existing testimonial JS
const vertexSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position*0.9 + 0.5;
    gl_Position = vec4(position,0,1);
  }
`;

const fragmentSource = `
  precision mediump float;
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec2 vUv;

  float random(vec2 uv) {
    return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    float a = random(i);
    float b = random(i + vec2(1., 0.));
    float c = random(i + vec2(0., 1.));
    float d = random(i + vec2(1., 1.));
    vec2 u = f*f*(3.0-2.0*f);
    float v1 = mix(a, b, u.x);
    float v2 = mix(c, d, u.x);
    return mix(v1, v2, u.y);
  }

  vec3 palette(float t) {
    vec3 a = vec3(0.000, 0.500, 0.500);
    vec3 b = vec3(0.000, 0.500, 0.500);
    vec3 c = vec3(0.000, 0.500, 0.333);
    vec3 d = vec3(0.000, 0.500, 0.667);
    return a + b*cos(6.40318*(c*t + d));
  }

  #define OCTAVES 6
  float fbm(vec2 uv) {
    float lacunarity = 3.0;
    float gain = 0.5;
    float amplitude = 0.5;
    float frequency = 1.0;
    float result = 0.0;
    for(int i = 0; i < OCTAVES; i++) {
      result += amplitude*noise(frequency*uv);
      frequency *= lacunarity;
      amplitude *= gain;
    }
    return result;
  }

  void main() {
    vec2 fragCoord = vUv * iResolution;
    vec2 uv = (fragCoord - iResolution*0.5) / iResolution.y * 10.0;
    float uvt = sin(length(uv) - iTime);
    vec2 uv2 = uv * fbm(uv) * uvt;
    vec3 col = palette(fbm(uv2));
    gl_FragColor = vec4(col, 1.0);
  }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(shader);
    }
    return shader;
}

function createProgram(gl, vsrc, fsrc) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(prog);
    }
    return prog;
}

const canvas = document.getElementById('glcanvas');
let gl = canvas.getContext('webgl');
if (!gl) alert("WebGL not supported!");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

const prog = createProgram(gl, vertexSource, fragmentSource);

const posBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
]), gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(prog, 'position');
const iTimeLoc = gl.getUniformLocation(prog, 'iTime');
const iResLoc = gl.getUniformLocation(prog, 'iResolution');

function render(now) {
    const t = now * 0.001;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1f(iTimeLoc, t);
    gl.uniform2f(iResLoc, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
