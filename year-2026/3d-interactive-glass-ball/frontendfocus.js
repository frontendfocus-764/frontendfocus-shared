document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("glass-container");
    const canvas = document.getElementById("glass-canvas");
    if (!container || !canvas) return;

    const ADVANCED_DEFAULTS = {
        tilt: 50,
        perspective: 80,
        ballOffset: 9,
        gridAngle: 20,
        travelAngle: 10,
        ballRadius: 87,
        moundInner: 35,
        heightJitter: 20,
        missingTiles: 25,
        tileGap: 8,
        floorGap: 3,
        cornerRound: 12,
        studSize: 4,
        floorLift: 16,
        peachColor: "#F0D6C9",
        innerColor: "#A8442A",
        studColor: "#8E8882",
        lightAngle: 135,
        lightHeight: 50,
        ambient: 65,
        shadowEdge: 10,
        shadowStrength: 80,
        band: 30,
        glassRim: 60,
        specular: 80,
        refraction: 40,
        quality: 60,
        grain: 0,
        vignette: 0,
        hover: 50,
    };

    const TILES_PER_SECOND = 43.4 / 15.6;
    const FT = 0.02;

    const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

    const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uRes;
uniform vec3 uCamPos;
uniform vec3 uCamR;
uniform vec3 uCamU;
uniform vec3 uCamF;
uniform float uFocal;
uniform float uOff;
uniform vec2 uGrid;
uniform vec2 uBallQ;
uniform vec2 uBall;
uniform float uMaxH;
uniform vec2 uMound;
uniform vec3 uTileP;
uniform vec3 uGaps;
uniform vec3 uHalf;
uniform vec3 uL;
uniform vec3 uAccent;
uniform vec3 uPeach;
uniform vec3 uInner;
uniform vec3 uFloor;
uniform vec3 uStudC;
uniform vec3 uBg;
uniform vec4 uLook;
uniform vec3 uGlass;
uniform vec3 uPtr;
uniform vec3 uFx;

const float FT = 0.02;
float gH;
float gMat;

float hash21(vec2 p) {
    p = mod(p, 256.0);
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 toQ(vec2 xz) {
    return vec2(dot(xz, vec2(uGrid.x, -uGrid.y)), dot(xz, vec2(uGrid.y, uGrid.x))) + uBallQ;
}

float cellH(vec2 id) {
    vec2 c = id + 0.5;
    float hv = hash21(id);
    float m = 1.0 - smoothstep(uMound.y, uMound.x, length(c - uBallQ));
    float keep = step(uTileP.y, hash21(id + 91.7));
    m *= mix(keep, 1.0, step(0.6, m));
    float j = 1.0 + uTileP.x * (hv * 2.0 - 1.0);
    float pm = uPtr.z * (1.0 - smoothstep(0.3, 2.2, length(c - uPtr.xy))) * 0.75;
    return uMaxH * max(m * j, pm * (0.8 + 0.4 * hv));
}

float tileSD(vec2 q, float y, vec2 id, out float h) {
    h = cellH(id);
    float top = FT + h;
    float gap = mix(uGaps.y, uGaps.x, smoothstep(0.0, 0.12 * uMaxH + 0.001, h));
    float hs = 0.5 - 0.5 * gap;
    float r = min(uTileP.z, hs);
    vec2 lp = q - id - 0.5;
    vec2 dq = abs(lp) - vec2(hs - r);
    float d2 = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0) - r;
    float hh = 0.5 * top;
    float bev = min(0.025, hh * 0.8);
    vec2 w = vec2(d2 + bev, abs(y - hh) - hh + bev);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - bev;
}

float mapF(vec3 p) {
    vec2 q = toQ(p.xz);
    vec2 id = floor(q);
    vec2 f = q - id;
    vec2 o = vec2(f.x < 0.5 ? -1.0 : 1.0, f.y < 0.5 ? -1.0 : 1.0);
    float h0; float h1; float h2; float h3;
    float d0 = tileSD(q, p.y, id, h0);
    float d1 = tileSD(q, p.y, id + vec2(o.x, 0.0), h1);
    float d2 = tileSD(q, p.y, id + vec2(0.0, o.y), h2);
    float d3 = tileSD(q, p.y, id + o, h3);
    float d = d0; gH = h0; gMat = 1.0;
    if (d1 < d) { d = d1; gH = h1; }
    if (d2 < d) { d = d2; gH = h2; }
    if (d3 < d) { d = d3; gH = h3; }
    if (p.y < d) { d = p.y; gMat = 0.0; }
    vec2 cq = q - floor(q + 0.5);
    float ds = length(vec2((abs(cq.x) + abs(cq.y)) * 0.7071, p.y)) - uGaps.z;
    if (ds < d) { d = ds; gMat = 2.0; }
    return min(d, 0.45);
}

vec3 nrmF(vec3 p) {
    const vec2 k = vec2(1.0, -1.0);
    float e = 0.002;
    return normalize(k.xyy * mapF(p + k.xyy * e) + k.yyx * mapF(p + k.yyx * e) + k.yxy * mapF(p + k.yxy * e) + k.xxx * mapF(p + k.xxx * e));
}

float topY() { return FT + uMaxH * 1.3 + 0.05; }

bool marchF(vec3 ro, vec3 rd, int steps, out vec3 hp) {
    hp = ro;
    if (rd.y > -0.002) return false;
    float t = 0.0;
    float Y = topY();
    if (ro.y > Y) t = (ro.y - Y) / (-rd.y);
    for (int i = 0; i < 96; i++) {
        if (i >= steps) break;
        vec3 p = ro + rd * t;
        float d = mapF(p);
        if (d < 0.0015) { hp = p; return true; }
        t += d * 0.9;
        if (p.y < -0.05) break;
    }
    hp = ro + rd * t;
    return true;
}

float shadowF(vec3 ro) {
    float res = 1.0;
    float t = 0.03;
    float Y = topY();
    for (int i = 0; i < 18; i++) {
        vec3 p = ro + uL * t;
        if (p.y > Y) break;
        float h = mapF(p);
        res = min(res, uLook.y * h / t);
        if (res < 0.02) break;
        t += clamp(h, 0.03, 0.25);
    }
    return clamp(res, 0.0, 1.0);
}

float sphShadow(vec3 ro, vec3 rd, vec3 c, float r, float k) {
    vec3 oc = ro - c;
    float b = dot(oc, rd);
    float cc = dot(oc, oc) - r * r;
    float h = b * b - cc;
    float d = sqrt(max(0.0, r * r - h)) - r;
    float t = -b - sqrt(max(h, 0.0));
    return (t < 0.0) ? 1.0 : smoothstep(0.0, 1.0, 2.5 * k * d / t);
}

float sphOcc(vec3 pos, vec3 nor, vec3 c, float r) {
    vec3 di = c - pos;
    float l = length(di);
    return 1.0 - max(0.0, dot(nor, di / l)) * (r * r) / (l * l);
}

float aoF(vec3 p, vec3 n) {
    float o = 0.0;
    float s = 1.0;
    for (int i = 1; i <= 3; i++) {
        float h = 0.04 * float(i);
        float d = mapF(p + n * h);
        o += (h - d) * s;
        s *= 0.6;
    }
    return clamp(1.0 - 3.5 * o, 0.0, 1.0);
}

vec3 shadeFloor(vec3 p, vec3 rd, bool full) {
    mapF(p);
    float mat = gMat;
    float h = gH;
    vec3 n = nrmF(p);
    vec3 C = vec3(0.0, uBall.y, 0.0);
    float R = uBall.x;
    float tn = clamp(h / max(uMaxH, 1e-3), 0.0, 1.0);
    vec3 alb;
    if (mat < 0.5) {
        alb = mix(uBg, uFloor, 0.4) * 0.6;
    } else if (mat < 1.5) {
        alb = mix(uFloor, uPeach, smoothstep(0.04, 0.3, tn));
        alb = mix(alb, uAccent, smoothstep(0.38, 0.62, tn));
    } else {
        alb = uStudC;
    }
    vec3 sp = p + n * 0.004;
    float sh = full ? shadowF(sp) : 1.0;
    sh *= mix(1.0, sphShadow(sp, uL, C, R, uLook.y * 0.4), 0.85);
    float ao = (full ? aoF(p, n) : 1.0) * sphOcc(p, n, C, R);
    float dif = max(dot(n, uL), 0.0);
    float sl = mix(1.0, sh, uLook.z);
    vec3 amb = vec3(uLook.x * (0.62 + 0.38 * n.y) * ao);
    amb *= mix(vec3(1.0), uAccent * 1.1 + 0.1, 0.25 * (1.0 - sl));
    vec3 col = alb * (amb + (1.0 - uLook.x) * 1.3 * dif * sl);
    col += 0.06 * pow(max(dot(reflect(rd, n), uL), 0.0), 18.0) * sl * step(0.5, mat);
    return col;
}

vec3 env(vec3 r) {
    float up = smoothstep(-0.3, 0.8, r.y);
    vec3 c = mix(uFloor * 0.9 + uBg * 0.1, vec3(0.62, 0.6, 0.58), up);
    c += vec3(1.0) * pow(max(dot(r, uL), 0.0), 24.0) * 0.9;
    return c;
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 uv = (frag - 0.5 * uRes) / uRes.y;
    vec3 rd = normalize(uCamR * uv.x + uCamU * (uv.y - uOff) + uCamF * uFocal);
    vec3 ro = uCamPos;
    vec3 C = vec3(0.0, uBall.y, 0.0);
    float R = uBall.x;
    vec3 col;

    vec3 oc = ro - C;
    float b = dot(oc, rd);
    float c = dot(oc, oc) - R * R;
    float h = b * b - c;
    if (h > 0.0 && -b - sqrt(h) > 0.0) {
        float t = -b - sqrt(h);
        vec3 P = ro + rd * t;
        vec3 N = (P - C) / R;
        float side = dot(N, uHalf);
        float cosv = max(dot(-rd, N), 0.0);
        float F = 0.04 + 0.96 * pow(1.0 - cosv, 5.0);
        vec3 refl = reflect(rd, N);
        vec3 base;
        if (side > 0.0) {
            float dif = max(dot(N, uL), 0.0);
            float amb = uLook.x * (0.5 + 0.5 * N.y);
            base = uAccent * (amb + (1.0 - uLook.x) * 1.3 * dif);
            base = mix(base, base * vec3(0.9, 0.8, 0.7), smoothstep(0.2, -0.6, dot(N, uL)));
        } else {
            float eta = 1.0 / (1.0 + 0.5 * uGlass.z);
            vec3 r2 = refract(rd, N, eta);
            vec3 pc = P - C;
            float b2 = dot(pc, r2);
            float c2 = dot(pc, pc) - R * R;
            float h2 = b2 * b2 - c2;
            float tex = -b2 + sqrt(max(h2, 0.0));
            float dn = dot(r2, uHalf);
            float tp = (abs(dn) > 1e-4) ? dot(C - P, uHalf) / dn : -1.0;
            if (tp > 0.0 && tp < tex) {
                vec3 Q = P + r2 * tp;
                float rr = clamp(length(Q - C) / R, 0.0, 1.0);
                vec3 inner = mix(uInner * 1.15, uInner * 0.75, smoothstep(0.1, 0.95, rr));
                float lit = 0.8 + 0.3 * max(dot(-uHalf, uL), 0.0);
                base = inner * lit;
                base = mix(base, uAccent * 0.95, smoothstep(0.9, 0.99, rr));
            } else {
                vec3 E = P + r2 * tex;
                vec3 NE = (E - C) / R;
                vec3 r3 = refract(r2, -NE, 1.0 / eta);
                if (dot(r3, r3) < 1e-4) r3 = reflect(r2, -NE);
                vec3 hp;
                marchF(E, r3, 48, hp);
                base = shadeFloor(hp, r3, false) * vec3(0.94, 0.93, 0.91);
            }
        }
        col = mix(base, env(refl), clamp(F * (0.6 + uGlass.x * 0.8), 0.0, 1.0));
        float rim = smoothstep(0.55, 0.95, 1.0 - cosv);
        col += vec3(0.92, 0.9, 0.88) * rim * rim * uGlass.x * (side > 0.0 ? 0.25 : 0.6);
        vec3 L2 = normalize(vec3(0.75, 0.45, -0.5));
        float s = pow(max(dot(refl, uL), 0.0), 420.0) * 2.5 + pow(max(dot(refl, L2), 0.0), 900.0) * 1.6;
        col += vec3(s) * uGlass.y;
    } else {
        vec3 hp;
        marchF(ro, rd, 80, hp);
        col = shadeFloor(hp, rd, true);
    }

    float x01 = frag.x / uRes.x;
    float y01 = 1.0 - frag.y / uRes.y;
    float bandF = smoothstep(0.16, 0.45, abs(y01 - (0.35 + 0.27 * x01)));
    col *= 1.0 - uLook.w * bandF;

    float vig = smoothstep(0.3, 1.0, length(uv));
    col *= 1.0 - uFx.y * vig;
    float g = hash12(frag + fract(uFx.z * 7.31) * 113.0) - 0.5;
    col += g * uFx.x * 0.25;

    fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

    const UNIFORMS = [
        "uRes", "uCamPos", "uCamR", "uCamU", "uCamF", "uFocal", "uOff", "uGrid", "uBallQ", "uBall",
        "uMaxH", "uMound", "uTileP", "uGaps", "uHalf", "uL", "uAccent", "uPeach", "uInner", "uFloor",
        "uStudC", "uBg", "uLook", "uGlass", "uPtr", "uFx",
    ];

    function parseColor(input) {
        if (typeof input !== "string") return [0, 0, 0];
        const s = input.trim();
        if (s.startsWith("#")) {
            let h = s.slice(1);
            if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
            const n = parseInt(h.slice(0, 6), 16);
            if (isNaN(n)) return [0, 0, 0];
            return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
        }
        const m = s.match(/rgba?\(([^)]+)\)/i);
        if (m) {
            const p = m[1].split(/[\s,\/]+/).filter(Boolean).map((v) => parseFloat(v));
            return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255];
        }
        return [0, 0, 0];
    }

    function compile(gl, type, src) {
        const sh = gl.createShader(type);
        if (!sh) throw new Error("shader create failed");
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(sh);
            gl.deleteShader(sh);
            throw new Error("shader compile failed: " + log);
        }
        return sh;
    }

    function createProgram(gl) {
        const vs = compile(gl, gl.VERTEX_SHADER, VERT);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        const prog = gl.createProgram();
        if (!prog) throw new Error("program create failed");
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link failed: " + gl.getProgramInfoLog(prog));
        return prog;
    }

    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = (a) => {
        const l = Math.hypot(a[0], a[1], a[2]) || 1;
        return [a[0] / l, a[1] / l, a[2] / l];
    };

    const props = {
        speed: 50,
        size: 125,
        accent: "#FF0000",
        background: "#000000",
        radius: 3,
        lift: 100,
        advanced: {},
    };

    const ptrRef = { x: 0, y: 0, over: 0, down: 0 };

    const gl = canvas.getContext("webgl2", {
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const prog = createProgram(gl);
    const U = {};
    for (const name of UNIFORMS) {
        const loc = gl.getUniformLocation(prog, name);
        if (!loc) throw new Error("missing uniform " + name);
        U[name] = loc;
    }
    const buf = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    let cssW = container.offsetWidth || 1200;
    let cssH = container.offsetHeight || 800;
    const ro = new ResizeObserver(() => {
        cssW = container.offsetWidth || cssW;
        cssH = container.offsetHeight || cssH;
    });
    ro.observe(container);

    const reduce = typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const onUp = () => {
        ptrRef.down = 0;
    };
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    const setPointer = (e) => {
        const rect = container.getBoundingClientRect();
        ptrRef.over = 1;
        ptrRef.x = e.clientX - rect.left;
        ptrRef.y = e.clientY - rect.top;
    };

    container.addEventListener("pointerenter", setPointer);
    container.addEventListener("pointermove", setPointer);
    container.addEventListener("pointerdown", (e) => {
        setPointer(e);
        ptrRef.down = 1;
    });
    container.addEventListener("pointerleave", () => {
        ptrRef.over = 0;
    });

    const eased = { over: 0, down: 0, px: 0, py: 0 };
    let dist = 0;
    let last = -1;
    let raf = 0;
    let clock = 0;

    const frame = (now) => {
        raf = requestAnimationFrame(frame);
        const dt = last < 0 ? 0 : Math.min((now - last) / 1000, 1 / 20);
        last = now;
        clock += dt;
        const p = props;
        const adv = { ...ADVANCED_DEFAULTS, ...(p.advanced ?? {}) };

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const q = Math.max(0.2, Math.min(1, adv.quality / 100));
        const W = Math.max(1, Math.round(cssW * dpr * q));
        const H = Math.max(1, Math.round(cssH * dpr * q));
        if (canvas.width !== W || canvas.height !== H) {
            canvas.width = W;
            canvas.height = H;
        }

        const ptr = ptrRef;
        const k = 1 - Math.exp(-dt * 6);
        eased.over += (ptr.over - eased.over) * k;
        eased.down += (ptr.down - eased.down) * k;
        const tx = ptr.over ? (ptr.x / Math.max(1, cssW)) * 2 - 1 : 0;
        const ty = ptr.over ? 1 - (ptr.y / Math.max(1, cssH)) * 2 : 0;
        eased.px += (tx - eased.px) * k;
        eased.py += (ty - eased.py) * k;
        const hk = Math.max(0, adv.hover) / 50;

        const rate = Math.max(0, Math.min(100, p.speed)) / 50;
        if (!reduce) dist += TILES_PER_SECOND * rate * dt;
        const R = Math.max(0.2, adv.ballRadius / 100);
        const maxH = (Math.max(0, Math.min(100, p.lift)) / 100) * 0.5;
        const jitter = adv.heightJitter / 100;
        const ballY = FT + maxH * (1 + jitter) + R;

        const ta = (adv.travelAngle * Math.PI) / 180;
        const ga = (adv.gridAngle * Math.PI) / 180;
        const cg = Math.cos(ga);
        const sg = Math.sin(ga);
        const Bx = -Math.cos(ta) * dist;
        const Bz = Math.sin(ta) * dist;
        const wrap = (v) => ((v % 256) + 256) % 256;
        const bq = [wrap(Bx * cg - Bz * sg), wrap(Bx * sg + Bz * cg)];

        const axis = [Math.sin(ta), 0, Math.cos(ta)];
        const theta = (dist / R) % (Math.PI * 2);
        const elBase = (adv.tilt * Math.PI) / 180;
        const n0 = [0, -Math.sin(elBase), Math.cos(elBase)];
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const kxv = cross(axis, n0);
        const kd = axis[0] * n0[0] + axis[1] * n0[1] + axis[2] * n0[2];
        const half = [
            n0[0] * ct + kxv[0] * st + axis[0] * kd * (1 - ct),
            n0[1] * ct + kxv[1] * st + axis[1] * kd * (1 - ct),
            n0[2] * ct + kxv[2] * st + axis[2] * kd * (1 - ct),
        ];

        const focal = Math.max(0.5, adv.perspective / 100);
        const el = elBase + ((eased.py * 4 * Math.PI) / 180) * hk * eased.over;
        const yaw = ((eased.px * 6 * Math.PI) / 180) * hk * eased.over;
        const D = (R * focal * Math.max(1, cssH)) / Math.max(10, p.size / 2);
        const back = [-Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)];
        const camPos = [back[0] * D, ballY + back[1] * D, back[2] * D];
        const fwd = [-back[0], -back[1], -back[2]];
        const right = norm([fwd[2], 0, -fwd[0]]);
        const up = cross(fwd, right);
        const off = adv.ballOffset / 100;

        let ptrQ = [9999, 9999];
        let ptrS = 0;
        if (eased.over > 0.001 && hk > 0) {
            const ux = (ptr.x - cssW / 2) / Math.max(1, cssH);
            const uy = (cssH / 2 - ptr.y) / Math.max(1, cssH);
            const dir = [
                right[0] * ux + up[0] * (uy - off) + fwd[0] * focal,
                right[1] * ux + up[1] * (uy - off) + fwd[1] * focal,
                right[2] * ux + up[2] * (uy - off) + fwd[2] * focal,
            ];
            if (dir[1] < -1e-4) {
                const t = (FT + maxH * 0.5 - camPos[1]) / dir[1];
                const X = camPos[0] + dir[0] * t;
                const Z = camPos[2] + dir[2] * t;
                ptrQ = [X * cg - Z * sg + bq[0], X * sg + Z * cg + bq[1]];
                ptrS = Math.min(1, eased.over * hk * (0.6 + 0.4 * eased.down));
            }
        }

        const la = (adv.lightAngle * Math.PI) / 180;
        const lh = (adv.lightHeight * Math.PI) / 180;
        const L = norm([Math.cos(lh) * Math.cos(la), Math.sin(lh), Math.cos(lh) * Math.sin(la)]);

        const bg = parseColor(p.background);
        const fl = adv.floorLift / 100;
        const floor = [bg[0] + (1 - bg[0]) * fl, bg[1] + (1 - bg[1]) * fl, bg[2] + (1 - bg[2]) * fl];
        const rad = Math.max(1, p.radius);

        gl.viewport(0, 0, W, H);
        gl.useProgram(prog);
        gl.bindVertexArray(vao);
        gl.uniform2f(U.uRes, W, H);
        gl.uniform3f(U.uCamPos, camPos[0], camPos[1], camPos[2]);
        gl.uniform3f(U.uCamR, right[0], right[1], right[2]);
        gl.uniform3f(U.uCamU, up[0], up[1], up[2]);
        gl.uniform3f(U.uCamF, fwd[0], fwd[1], fwd[2]);
        gl.uniform1f(U.uFocal, focal);
        gl.uniform1f(U.uOff, off);
        gl.uniform2f(U.uGrid, cg, sg);
        gl.uniform2f(U.uBallQ, bq[0], bq[1]);
        gl.uniform2f(U.uBall, R, ballY);
        gl.uniform1f(U.uMaxH, maxH);
        gl.uniform2f(U.uMound, rad, rad * Math.max(0.05, Math.min(0.95, adv.moundInner / 100)));
        gl.uniform3f(U.uTileP, jitter, adv.missingTiles / 100, adv.cornerRound / 100);
        gl.uniform3f(U.uGaps, adv.tileGap / 100, adv.floorGap / 100, adv.studSize / 100);
        gl.uniform3f(U.uHalf, half[0], half[1], half[2]);
        gl.uniform3f(U.uL, L[0], L[1], L[2]);
        gl.uniform3fv(U.uAccent, parseColor(p.accent));
        gl.uniform3fv(U.uPeach, parseColor(adv.peachColor));
        gl.uniform3fv(U.uInner, parseColor(adv.innerColor));
        gl.uniform3fv(U.uFloor, floor);
        gl.uniform3fv(U.uStudC, parseColor(adv.studColor));
        gl.uniform3fv(U.uBg, bg);
        gl.uniform4f(U.uLook, adv.ambient / 100, Math.max(1, adv.shadowEdge), adv.shadowStrength / 100, adv.band / 100);
        gl.uniform3f(U.uGlass, adv.glassRim / 100, adv.specular / 100, adv.refraction / 100);
        gl.uniform3f(U.uPtr, ptrQ[0], ptrQ[1], ptrS);
        gl.uniform3f(U.uFx, adv.grain / 100, adv.vignette / 100, clock);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(frame);

    window.addEventListener("beforeunload", () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        gl.deleteBuffer(buf);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(prog);
    });
});