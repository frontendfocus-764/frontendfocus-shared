(() => {
'use strict';

const SPEED = 0.5;
const INTENSITY = 0.3;
const SCALE = 0.95;
const VIGNETTE = 2.5;
const TIP_SHADOW = 1.5;
const COLOR_BLEND = 1.2;
const GRAIN = 0.35;
const MOUSE_GLOW = 1.2;
const MOUSE_RADIUS = 0.3;
const PALETTE = ['#da0061', '#0090ff'];

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform float uTime; uniform vec2 uRes;
uniform float uIntensity, uScale, uVignette, uTipShadow, uBlend, uGrain, uGrainT, uSeed;
uniform vec3 uColA, uColB;
uniform vec4 uMouse;
#define TAU 6.28318530718
float hash11(float p){ p = fract(p*443.8975); p += p*(p+19.19); return fract(p*p); }
float hash21(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p, p.yx+19.19); return fract(p.x*p.y); }
float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  float a = hash21(i), b = hash21(i+vec2(1,0)), c = hash21(i+vec2(0,1)), d = hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){ float s = 0.0, a = 0.5; for(int k=0;k<4;k++){ s += a*vnoise(p); p = p*2.03 + 11.7; a *= 0.5; } return s; }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  float th = TAU * mod(uTime, 12.0) / 12.0;
  float along  = dot(uv, vec2(0.7071, 0.7071));
  float across = dot(uv, vec2(-0.7071, 0.7071));
  float freq = 13.0 * uScale;
  float bc = across * freq;
  float id = floor(bc);
  float xc = fract(bc);
  float h1 = hash11(id*0.1231 + 0.37 + uSeed);
  float h2 = hash11(id*0.3117 + 0.71 + uSeed);
  float h3 = hash11(id*0.5313 + 0.13 + uSeed);
  float m = (h2 - 0.5)*0.7 + 0.08;
  float L = 0.7 + 0.6*h1;
  float e = abs(along - m);
  float cap = 1.0 - smoothstep(L*0.6, L, e);
  float tip = 1.0 - uTipShadow*smoothstep(L*0.3, L*0.85, e);
  float wv = 0.6 + 0.5*h1;
  float xw = clamp((xc - 0.5)/wv + 0.5, 0.0, 1.0);
  float prof = 1.0;
  float shade = mix(1.18, 0.55, xc) * (0.9 + 0.2*h3);
  float sd = (xw - 0.42)/0.24;
  float spec = exp(-sd*sd);
  vec2 off = 0.55*vec2(cos(th + h2*TAU), sin(th + h2*TAU));
  float n = fbm(vec2(along*(0.9 + h3*0.8) + h1*23.0, id*0.7) + off);
  n = smoothstep(0.12, 0.78, n);
  float pk = 1.0 + floor(h2*2.0 + 0.5);
  float pulse = 0.7 + 0.3*sin(th*pk + h1*TAU);
  float light = (0.3 + 0.95*n) * pulse * (0.6 + 0.5*h3) * shade * tip;
  float rho = length(vec2(across/0.6, (along - 0.04)/0.95));
  float mask = 1.0 - smoothstep(0.5, 0.95, rho);
  vec2 q = gl_FragCoord.xy / uRes;
  mask *= smoothstep(0.0, 0.1, q.x) * smoothstep(1.0, 0.9, q.x)
        * smoothstep(0.0, 0.14, q.y) * smoothstep(1.0, 0.86, q.y);
  float B = cap * prof * light * mask * uIntensity * 1.4;
  B += spec * B * 0.35;
  vec2 mv = uv - uMouse.xy;
  B *= 1.0 + uMouse.z * exp(-dot(mv, mv)/(uMouse.w*uMouse.w));
  B = B / (1.0 + 0.3*B);
  float wB = smoothstep(0.165 - 0.5*uBlend, 0.165 + 0.5*uBlend, -across + 0.35*(h2 - 0.5));
  vec3 mainC = mix(uColA, uColB, wB);
  vec3 deepC = mainC*0.3;
  vec3 col = vec3(0.0);
  col = mix(col, deepC, smoothstep(0.02, 0.2, B));
  col = mix(col, mainC, smoothstep(0.18, 0.5, B));
  col *= 1.0 - uVignette*smoothstep(0.25, 1.3, length(uv));
  float g = hash12(gl_FragCoord.xy + vec2(uGrainT*7.13, uGrainT*3.71));
  col *= 1.0 + (g - 0.5)*uGrain;
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
}`;

function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true });
if (!gl) return;

function compile(type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);

gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aPos = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

const uTime = gl.getUniformLocation(prog, 'uTime');
const uRes = gl.getUniformLocation(prog, 'uRes');
const uGrainT = gl.getUniformLocation(prog, 'uGrainT');
const uMouse = gl.getUniformLocation(prog, 'uMouse');
gl.uniform1f(gl.getUniformLocation(prog, 'uGrain'), GRAIN);
gl.uniform1f(gl.getUniformLocation(prog, 'uSeed'), Math.random() * 10);
gl.uniform1f(gl.getUniformLocation(prog, 'uIntensity'), INTENSITY);
gl.uniform1f(gl.getUniformLocation(prog, 'uScale'), SCALE);
gl.uniform1f(gl.getUniformLocation(prog, 'uVignette'), VIGNETTE);
gl.uniform1f(gl.getUniformLocation(prog, 'uTipShadow'), TIP_SHADOW);
gl.uniform1f(gl.getUniformLocation(prog, 'uBlend'), COLOR_BLEND);
gl.uniform3fv(gl.getUniformLocation(prog, 'uColA'), hexToRgb(PALETTE[0]));
gl.uniform3fv(gl.getUniformLocation(prog, 'uColB'), hexToRgb(PALETTE[1]));

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }
}
addEventListener('resize', resize);
resize();

let mTX = innerWidth / 2, mTY = innerHeight / 2, mOn = 0;
let mX = 0, mY = 0, mS = 0;
addEventListener('pointermove', (e) => { mTX = e.clientX; mTY = e.clientY; mOn = 1; });
document.addEventListener('mouseleave', () => { mOn = 0; });

let t = Math.random() * 12, last = performance.now();
gl.uniform1f(uTime, t);
gl.uniform1f(uGrainT, 0);
gl.uniform4f(uMouse, mX, mY, mS * MOUSE_GLOW, MOUSE_RADIUS);
gl.drawArrays(gl.TRIANGLES, 0, 3);
requestAnimationFrame(function frame(now) {
  const dt = (now - last) / 1000;
  t += dt * SPEED;
  last = now;
  const k = 1 - Math.exp(-dt * 6);
  const d = canvas.width / innerWidth;
  mX += ((mTX * d - 0.5 * canvas.width) / canvas.height - mX) * k;
  mY += ((0.5 * canvas.height - mTY * d) / canvas.height - mY) * k;
  mS += (mOn - mS) * k;
  gl.uniform1f(uTime, t);
  gl.uniform1f(uGrainT, Math.floor(now / 1000 * 24) % 1024);
  gl.uniform4f(uMouse, mX, mY, mS * MOUSE_GLOW, MOUSE_RADIUS);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  requestAnimationFrame(frame);
});
})();