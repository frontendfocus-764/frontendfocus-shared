(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = document.getElementById('stage');
  var ids = ['smoke','far','mid','main','rimblur','beadblur','bead','bloom','glow'], C = {}, X = {};
  ids.forEach(function(k){ C[k] = document.getElementById(k); X[k] = C[k].getContext('2d'); });
  var L = 600, DPR = 1, S = 270, CX = 300, CY = 300, BW = 800, BH = 800;
  var BG = {}; ['bgbokeh','bgsmoke','bgring'].forEach(function(k){ var c = document.getElementById(k); BG[k] = {c:c, x:c.getContext('2d')}; });
  var grain = document.createElement('canvas'); grain.width = grain.height = 128;
  (function(){ var g = grain.getContext('2d'), im = g.createImageData(128,128), i; for(i=0;i<im.data.length;i+=4){ var v = Math.random(); im.data[i]=255; im.data[i+1]=235; im.data[i+2]=205; im.data[i+3]= v>0.55 ? Math.floor((v-0.55)*420) : 0; } g.putImageData(im,0,0); })();

  function fit(){
    L = Math.floor(Math.min(innerWidth, innerHeight) * 0.98);
    DPR = Math.min(devicePixelRatio || 1, 2);
    stage.style.width = stage.style.height = L + 'px';
    ids.forEach(function(k){ C[k].width = C[k].height = Math.round(L*DPR); X[k].setTransform(DPR,0,0,DPR,0,0); });
    BW = innerWidth; BH = innerHeight;
    ['bgbokeh','bgsmoke','bgring'].forEach(function(k){ var c = BG[k].c; c.width = Math.round(BW*DPR); c.height = Math.round(BH*DPR); BG[k].x.setTransform(DPR,0,0,DPR,0,0); });
    BG.bgbokeh.c.style.filter = 'blur('+(L*0.0035).toFixed(2)+'px)'; BG.bgsmoke.c.style.filter = 'blur('+(L*0.011).toFixed(1)+'px)';
    S = L*0.37; C.far.style.filter = 'blur('+(L*0.0034).toFixed(2)+'px)'; C.main.style.filter = 'blur('+Math.max(0.6, L*0.0013).toFixed(2)+'px)'; C.rimblur.style.filter = 'blur('+(L*0.0032).toFixed(2)+'px)'; C.mid.style.filter = 'blur('+(L*0.0016).toFixed(2)+'px)'; C.smoke.style.filter = 'blur('+(L*0.011).toFixed(1)+'px)'; CX = CY = L/2;
  }

  /* ---------- deterministic random ---------- */
  function rng(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a>>>15, 1|a); t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0)/4294967296; }; }
  var R = rng(20261012);

  /* ---------- geometry ---------- */
  function knn(P, k, maxD, from){
    var n = P.length, seen = {}, E = [], Ln = [], i, j, d, l, ii, m = from ? from.length : n;
    for(ii=0;ii<m;ii++){
      i = from ? from[ii] : ii; l = [];
      for(j=0;j<n;j++){ if(i===j) continue; var dx=P[i].x-P[j].x, dy=P[i].y-P[j].y, dz=P[i].z-P[j].z; d = dx*dx+dy*dy+dz*dz; if(d<maxD*maxD) l.push([d,j]); }
      l.sort(function(a,b){return a[0]-b[0];});
      for(j=0;j<Math.min(k,l.length);j++){ var a=Math.min(i,l[j][1]), b=Math.max(i,l[j][1]), key=a*10000+b; if(!seen[key]){ seen[key]=1; E.push(a,b); Ln.push(Math.sqrt(l[j][0])); } }
    }
    E.lens = Ln; return E;
  }
  var ph = []; for(var q=0;q<10;q++) ph.push([R()*6.28,R()*6.28,R()*6.28,1.2+R()*2.2]);
  function bump(x,y,z){ var s=0; for(var q=0;q<ph.length;q++){ var p=ph[q]; s += Math.sin(p[3]*(x*(q%3===0)+y*(q%3===1)+z*(q%3===2)+0.6*(x+y+z))+p[q%3]); } return s/ph.length; }

  /* outer shell: dense barrel wall (the rim band) plus sparse front and back caps (the big triangles) */
  var shell = [], tries = 0, WH = 0.17, PH = [R()*6.28,R()*6.28,R()*6.28], i, dx, dy, dz;
  function rimR(th){ return 1 + 0.085*(Math.sin(5*th+PH[0]) + 0.5*Math.sin(3*th+PH[1]) + 0.4*Math.sin(8*th+PH[2]) + 0.3*Math.sin(13*th+PH[0]*2))/1.6; }
  while(shell.length < 1250 && tries < 30000){
    tries++;
    var th = R()*6.2832, zz = (R()*2-1)*WH, rd = rimR(th)*(1-0.2*(zz/WH)*(zz/WH)) + (R()-.5)*0.08, ok = true,
        nx = Math.cos(th)*rd, ny = Math.sin(th)*rd, nz = zz + (R()-.5)*0.07;
    for(i=0;i<shell.length;i++){ dx=shell[i].x-nx; dy=shell[i].y-ny; dz=shell[i].z-nz; if(dx*dx+dy*dy+dz*dz < 0.04*0.04){ ok=false; break; } }
    if(ok) shell.push({x:nx,y:ny,z:nz,hot:R()<0.05,h:0,wall:true});
  }
  var nWall = shell.length;
  tries = 0; var nFace = 0;
  while(nFace < 520 && tries < 20000){
    tries++;
    var th2 = R()*6.2832, rr0 = 0.2+Math.sqrt(R())*0.62, side = R()<0.5 ? 1 : -1, nx2 = Math.cos(th2)*rr0*rimR(th2), ny2 = Math.sin(th2)*rr0*rimR(th2), nz2 = side*(WH*0.55 + R()*0.5*WH) , ok2 = true;
    for(i=nWall;i<shell.length;i++){ dx=shell[i].x-nx2; dy=shell[i].y-ny2; dz=shell[i].z-nz2; if(dx*dx+dy*dy+dz*dz < 0.12*0.12){ ok2=false; break; } }
    if(ok2){ shell.push({x:nx2,y:ny2,z:nz2,hot:false,h:0,wall:false}); nFace++; }
  }
  shell.forEach(function(n){ n.rays = [R()*6.28,R()*6.28,R()*6.28]; n.rl = [0.08+R()*0.2,0.06+R()*0.18,0.05+R()*0.15]; });
  shell.forEach(function(n){
    var th = Math.atan2(n.y,n.x), rim = rimR(th), RC = 0.84*rim;
    n.ox = n.x; n.oy = n.y; n.oz = n.z; n.ph = [R()*6.28,R()*6.28,R()*6.28]; n.fr = [0.7+R()*1.1,0.7+R()*1.1,0.7+R()*1.1];
    if(n.wall){ var ph = (n.z/WH)*1.0, cp = Math.cos(ph); n.cx = Math.cos(th)*cp*RC; n.cy = Math.sin(th)*cp*RC; n.cz = Math.sin(ph)*RC*0.92; }
    else { var u = Math.min(1, Math.hypot(n.x,n.y)/rim/0.86), lat = 1.0+(1-u)*(1.5708-1.0), cl2 = Math.cos(lat); n.cx = Math.cos(th)*cl2*RC; n.cy = Math.sin(th)*cl2*RC; n.cz = (n.z>0?1:-1)*Math.sin(lat)*RC*0.92; }
  });
  var wallIdx = [], faceIdx = []; for(i=0;i<shell.length;i++) (shell[i].wall ? wallIdx : faceIdx).push(i);
  var eW = knn(shell, 5, 0.12, wallIdx), eF = knn(shell, 4, 0.42, faceIdx);
  var shellE = eW.concat(eF); shellE.lens = eW.lens.concat(eF.lens);
  /* inner ring: thick torus around a hollow centre */
  function torus(n, Rm, rm, jit, seed){
    var o = [], rr = rng(seed);
    for(var i=0;i<n;i++){ var a = rr()*6.2832, b = rr()*6.2832, rad = Rm + rm*Math.cos(b) + (rr()-.5)*jit;
      o.push({x:Math.cos(a)*rad, y:Math.sin(a)*rad*0.92, z:rm*Math.sin(b)*1.2 + (rr()-.5)*jit, h:0, a:a}); }
    return o;
  }
  var ring = torus(560, 0.25, 0.1, 0.08, 5), ringE = knn(ring, 4, 0.13);
  var halo = torus(1800, 0.30, 0.16, 0.32, 9), haloE = knn(halo, 4, 0.16);
  (function(){ var added = 0, tr = 0; while(added < 260 && tr < 4000){ tr++; var ia = R()*halo.length|0, ib = R()*halo.length|0, ddx = halo[ia].x-halo[ib].x, ddy = halo[ia].y-halo[ib].y, ddz = halo[ia].z-halo[ib].z, dl = Math.sqrt(ddx*ddx+ddy*ddy+ddz*ddz);
    if(dl > 0.15 && dl < 0.42){ haloE.push(Math.min(ia,ib), Math.max(ia,ib)); haloE.lens.push(dl); added++; } } })();

  /* beads: orbit the inner ring, with some on the shell rim */
  var PAL = [[206,62,36],[238,112,40],[250,176,84],[255,236,196],[222,80,40]];
  var beads = [], b;
  for(b=0;b<110;b++){ var ang = (R()<0.7 ? 0.2+R()*2.7 : R()*6.28), rr2 = 0.19+R()*0.14;
    beads.push({type:0, a:ang, rr:rr2, z:(R()-.5)*0.25, w:R(), sp:(R()-.5)*0.12, c:PAL[R()*PAL.length|0], s:0.8+R()*1.7, blur:R()<0.35}); }
  var dots = [];
  shell.forEach(function(n, idx){
    var th = Math.atan2(n.y, n.x), cl2 = 0.5+0.5*Math.sin(th*2+1.7), thr = n.wall ? 0.1+0.5*cl2*cl2 : 0.62;
    if(R() < thr){ var q = R(); dots.push({i:idx, c:(q<0.38?PAL[0]:q<0.62?PAL[1]:q<0.82?PAL[2]:PAL[3]), s:0.9+R()*1.5, w:R()}); }
  });
  var adj = shell.map(function(){ return []; }), ei;
  for(ei=0;ei<shellE.length/2;ei++){ adj[shellE[2*ei]].push(ei); adj[shellE[2*ei+1]].push(ei); }
  for(b=0;b<0;b++){ var e0 = R()*(eW.length/2)|0; beads.push({type:1, e:e0, from:R()<0.5?shellE[2*e0]:shellE[2*e0+1], p:R(), v:0.07+R()*0.16, c:PAL[R()*PAL.length|0], s:0.8+R()*1.5, w:R(), blur:false}); }

  /* ---------- smoke: swirling soft dark puffs around the inner ring ---------- */
  var sprite = document.createElement('canvas'); sprite.width = sprite.height = 96;
  (function(){ var c = sprite.getContext('2d'), g = c.createRadialGradient(48,48,0,48,48,48);
    g.addColorStop(0,'rgba(24,24,28,1)'); g.addColorStop(.45,'rgba(24,24,28,.55)'); g.addColorStop(1,'rgba(24,24,28,0)'); c.fillStyle = g; c.fillRect(0,0,96,96); })();
  var puffs = [], pi;
  for(pi=0;pi<300;pi++){ var rq = R(); puffs.push({a:R()*6.2832, r:0.2+0.3*rq*rq, z:(R()-.5)*0.3, s:0.05+R()*0.1, al:0.012+R()*0.03, ph:R()*6.28}); }

  var puffs2 = [], bokeh = [];
  for(pi=0;pi<0;pi++) puffs2.push({a:R()*6.2832, r:0.8+0.42*R(), z:(R()-.5)*0.3, s:0.09+R()*0.16, al:0.012+R()*0.034, sp:0.03+R()*0.05});
  for(pi=0;pi<0;pi++) bokeh.push({a:R()*6.2832, r:1.05+R()*0.35, s:0.04+R()*0.05, al:0.1+R()*0.12, sp:(R()-.5)*0.05, warm:R()<0.6});

  /* ---------- heat: moving hot spots ---------- */
  var HA = [[0,.05,.62,.30,1],[2,.50,.52,.34,1],[4,.62,.15,.22,.7],[6,.12,.30,.18,1],[9,.05,.34,.16,.9],[11,-.55,.32,.26,.8],[13,.05,.62,.30,1]];
  var HB = [[0,-.2,-.65,.28,.9],[3,-.2,-.6,.2,.5],[5,.3,-.5,.2,.3],[8,-.6,.1,.2,.3],[10.5,-.5,-.4,.26,.6],[13,-.2,-.65,.28,.9]];
  var LOOP = 13;
  function ss(x){ return x*x*(3-2*x); }
  function key(K, t){ t = t % LOOP; for(var i=0;i<K.length-1;i++){ if(t>=K[i][0] && t<K[i+1][0]){ var f = ss((t-K[i][0])/(K[i+1][0]-K[i][0])), a = K[i], b = K[i+1];
      return {x:a[1]+(b[1]-a[1])*f, y:a[2]+(b[2]-a[2])*f, s:a[3]+(b[3]-a[3])*f, a:a[4]+(b[4]-a[4])*f}; } } var l = K[K.length-1]; return {x:l[1],y:l[2],s:l[3],a:l[4]}; }
  var heat = [];
  function heatAt(nx, ny){ var h = 0, sh = 0.5; for(var i=0;i<heat.length;i++){ var s = heat[i], dx = nx-s.x, dy = ny-s.y, ss2 = s.s*sh; h += s.a*Math.exp(-(dx*dx+dy*dy)/(2*ss2*ss2)); } return h>1?1:h; }

  /* ---------- pointer: the orb tilts toward the cursor, lights up near it and its mesh is nudged away ---------- */
  var ptr = {x:0, y:0, tx:0, ty:0, on:0, ton:0};
  function ptrFrom(e){ var r = stage.getBoundingClientRect(); ptr.tx = (e.clientX - (r.left + r.width/2))/S; ptr.ty = (e.clientY - (r.top + r.height/2))/S; ptr.ton = 1; }
  if(!reduce){
    addEventListener('pointermove', ptrFrom, {passive:true});
    addEventListener('pointerdown', ptrFrom, {passive:true});
    document.addEventListener('pointerleave', function(){ ptr.ton = 0; });
    addEventListener('blur', function(){ ptr.ton = 0; });
    addEventListener('pointerup', function(e){ if(e.pointerType !== 'mouse'){ ptr.ton = 0; } }, {passive:true});
  }
  function stepPtr(){ var cx = Math.max(-1.6,Math.min(1.6,ptr.tx))*(ptr.ton?1:0), cy = Math.max(-1.6,Math.min(1.6,ptr.ty))*(ptr.ton?1:0);
    ptr.x += (ptr.tx - ptr.x)*0.14; ptr.y += (ptr.ty - ptr.y)*0.14; ptr.on += (ptr.ton - ptr.on)*0.08;
    ptr.cx = (ptr.cx||0) + (cx - (ptr.cx||0))*0.06; ptr.cy = (ptr.cy||0) + (cy - (ptr.cy||0))*0.06; }
  function nudge(P){ if(ptr.on < 0.02) return; var px = CX + ptr.x*S, py = CY + ptr.y*S, rad = S*0.36, i, p, dx, dy, d, f;
    for(i=0;i<P.length;i++){ p = P[i]; dx = p.x-px; dy = p.y-py; d = Math.sqrt(dx*dx+dy*dy); if(d < rad && d > 0.5){ f = Math.pow(1-d/rad,2)*S*0.07*ptr.on/d; p.x += dx*f; p.y += dy*f; } } }

  /* ---------- projection ---------- */
  var M = {};
  function setCam(t){
    var roll = t*0.11, tx = 0.2+0.07*Math.sin(t*0.37) + (ptr.cy||0)*0.2, ty = 0.12*Math.sin(t*0.23) + (ptr.cx||0)*0.24;
    M.cr=Math.cos(roll); M.sr=Math.sin(roll); M.cx=Math.cos(tx); M.sx=Math.sin(tx); M.cy=Math.cos(ty); M.sy=Math.sin(ty);
  }
  function proj(x,y,z,out){
    var X1 = x*M.cr - y*M.sr, Y1 = x*M.sr + y*M.cr, Z1 = z;
    var Y2 = Y1*M.cx - Z1*M.sx, Z2 = Y1*M.sx + Z1*M.cx;
    var X3 = X1*M.cy + Z2*M.sy, Z3 = -X1*M.sy + Z2*M.cy;
    var k = 3.4/(3.4 - Z3);
    out.x = CX + X3*k*S; out.y = CY + Y2*k*S; out.z = Z3; out.nx = X3*k; out.ny = Y2*k;
  }
  function projectAll(A, spin, t, off, sc, jit){ sc = sc || 1; jit = jit || 0;
    var out = new Array(A.length), i, p, c = Math.cos(spin), s = Math.sin(spin);
    for(i=0;i<A.length;i++){ p = A[i]; var o = {}; var jx = jit*Math.sin(t*0.8+i*1.7+p.x*5), jy = jit*Math.sin(t*0.7+i*2.3+p.y*5), jz = jit*Math.sin(t*0.9+i*0.9);
      proj((p.x*c-p.y*s)*sc + (off?off[0]:0) + jx, (p.x*s+p.y*c)*sc + (off?off[1]:0) + jy, p.z*(2-sc) + jz, o); out[i] = o; }
    return out;
  }

  /* ---------- drawing ---------- */
  var NB = 4;
  function drawEdges(ctx, P, E, base, width, bright){
    var bk = [], i, k; for(k=0;k<NB;k++) bk.push([]);
    for(i=0;i<E.length;i+=2){ var a = P[E[i]], b = P[E[i+1]], z = (a.z+b.z)/2, bi = Math.max(0, Math.min(NB-1, Math.floor((z+1.1)/2.2*NB))); bk[bi].push(a.x,a.y,b.x,b.y); }
    ctx.lineWidth = width; ctx.lineCap = 'round';
    for(k=0;k<NB;k++){ ctx.strokeStyle = 'rgba(16,16,18,'+(base*(0.55+0.45*k/(NB-1))).toFixed(3)+')'; ctx.beginPath();
      var s = bk[k]; for(i=0;i<s.length;i+=4){ ctx.moveTo(s[i],s[i+1]); ctx.lineTo(s[i+2],s[i+3]); } ctx.stroke(); }
  }
  function drawEdgesLen(ctx, P, E, width, mode, aMul){ aMul = aMul || 1;
    var bk = [[],[],[],[]], al = [0.4,0.55,0.78,0.92], i, k, L2 = E.lens;
    for(i=0;i<E.length;i+=2){ var ln = L2[i/2], bi = ln>0.3?0 : ln>0.15?1 : ln>0.08?2 : 3, a = P[E[i]], b = P[E[i+1]], zz = Math.abs((a.z+b.z)/2), far = zz > 9; if(far !== (mode===1)) continue; bk[bi].push(a.x,a.y,b.x,b.y); }
    ctx.lineWidth = width; ctx.lineCap = 'round';
    for(k=0;k<4;k++){ ctx.strokeStyle = 'rgba(16,16,18,'+(al[k]*aMul).toFixed(3)+')'; ctx.beginPath(); var s = bk[k]; for(i=0;i<s.length;i+=4){ ctx.moveTo(s[i],s[i+1]); ctx.lineTo(s[i+2],s[i+3]); } ctx.stroke(); }
  }
  function glowEdges(P, nodes, E, wsc){
    var g = X.glow, bl = X.bloom, i;
    for(i=0;i<E.length;i+=2){ var a = E[i], b = E[i+1], h = (nodes[a].h+nodes[b].h)/2; if(h<0.14) continue;
      var al = Math.min(0.9,h*1.1), gg = 130+h*115|0, bb = 40+h*190|0;
      g.strokeStyle = 'rgba(255,'+gg+','+bb+','+al.toFixed(2)+')'; g.lineWidth = (0.8+h*1.8)*wsc;
      g.beginPath(); g.moveTo(P[a].x,P[a].y); g.lineTo(P[b].x,P[b].y); g.stroke();
      bl.strokeStyle = 'rgba(255,165,60,'+(al*0.16).toFixed(2)+')'; bl.lineWidth = (3+h*4)*wsc;
      bl.beginPath(); bl.moveTo(P[a].x,P[a].y); bl.lineTo(P[b].x,P[b].y); bl.stroke();
    }
  }
var RINGS = false;
  var DISCS = [[-1.08,-.74,.13,.22],[-1.02,-.47,.125,.2],[-1.24,-.29,.115,.17],[-1.0,.44,.12,.17],[-1.12,.12,.11,.12],[1.05,-.6,.1,.08]];
  function renderBg(t, e){
    var wsc = Math.max(L/600, 1.15), ox = BW/2 + (ptr.cx||0)*-S*0.02, oy = BH/2 + (ptr.cy||0)*-S*0.02, a, k, x;
    /* big thin circle */
    x = BG.bgring.x; x.clearRect(0,0,BW,BH); if(RINGS){ x.strokeStyle = 'rgba(40,40,44,.7)'; x.lineWidth = 1.2*wsc; x.beginPath(); x.arc(ox,oy,1.27*S*(0.92+0.08*e),0,6.2832); x.stroke(); }
    /* smoky outer ring: broken, uneven, slowly drifting */
    x = BG.bgsmoke.x; x.clearRect(0,0,BW,BH); x.lineCap = 'round';
    if(RINGS){
    var rr = 1.43*S*(0.93+0.07*e), steps = 240, seg = 6.2832/steps; x.lineCap = 'butt';
    for(k=0;k<steps;k++){ a = k*seg; var n = 0.5+0.5*Math.sin(a*2+t*0.15)*Math.sin(a*3-t*0.1+1.3), al = (0.8+0.2*n)*0.24, rw = rr*(1+0.006*Math.sin(a*3+t*0.2));
      x.strokeStyle = 'rgba(48,48,52,'+al.toFixed(3)+')'; x.lineWidth = 0.05*S; x.beginPath(); x.arc(ox,oy,rw,a,a+seg+0.004); x.stroke(); }
    }
    /* large warm grainy bokeh discs */
    x = BG.bgbokeh.x; x.clearRect(0,0,BW,BH);
    for(k=0;k<DISCS.length;k++){ var d = DISCS[k], dx = ox + (d[0] + 0.012*Math.sin(t*0.2+k))*S, dy = oy + (d[1] + 0.012*Math.cos(t*0.17+k*2))*S, rd = d[2]*S;
      x.save(); x.beginPath(); x.arc(dx,dy,rd,0,6.2832); x.fillStyle = 'rgba(222,186,150,'+d[3]+')'; x.fill(); x.clip();
      x.globalAlpha = 0.7; x.fillStyle = x.createPattern(grain,'repeat'); x.fillRect(dx-rd,dy-rd,rd*2,rd*2); x.restore();
      x.strokeStyle = 'rgba(235,205,170,'+(d[3]*0.9)+')'; x.lineWidth = 1.2*wsc; x.beginPath(); x.arc(dx,dy,rd,0,6.2832); x.stroke(); }
  }
  function render(t){
    var wsc = Math.max(L/600, 1.15), i, k, dtm = Math.max(0, Math.min(0.1, t - (window.__lt||t))); window.__lt = t;
    ids.forEach(function(n){ X[n].clearRect(0,0,L,L); });
    setCam(t);
    var o = Math.max(0, Math.min(1, (t-0.3)/2.7)), e = o*o*(3-2*o);
    var cl = 1-e;
    renderBg(t, e);
    for(i=0;i<shell.length;i++){ var sn = shell[i]; var ja = sn.wall ? 0.017 : 0.075, ca = sn.wall ? 0.03 : 0.06, mv = 0.25+0.75*e;
      sn.x = sn.cx+(sn.ox-sn.cx)*e + mv*(ja*Math.sin(t*sn.fr[0]+sn.ph[0]) + ca*Math.sin(t*0.75+sn.ox*2.6+sn.oy*1.9));
      sn.y = sn.cy+(sn.oy-sn.cy)*e + mv*(ja*Math.sin(t*sn.fr[1]+sn.ph[1]) + ca*Math.sin(t*0.5+sn.oy*2.4-sn.oz*2.2));
      sn.z = sn.cz+(sn.oz-sn.cz)*e + mv*(ja*Math.sin(t*sn.fr[2]+sn.ph[2]) + ca*Math.sin(t*0.6+sn.ox*1.8+sn.oz*3)); }
    heat = [key(HA,t), key(HB,t)]; if(ptr.on > 0.02) heat.push({x:ptr.x, y:ptr.y, s:0.17, a:0.95*ptr.on}); heat[0].a *= 1+0.1*cl; heat[0].s *= 1-0.25*cl; heat[1].s *= 1-0.25*cl;
    var Ps = projectAll(shell, 0, t), Pr = projectAll(ring, t*0.22, t, [0.02,0.06], 0.5+0.5*e, 0.014), Ph = projectAll(halo, -t*0.1, t, [0.0,0.04], 0.58+0.42*e, 0.03);
    nudge(Ps); nudge(Pr); nudge(Ph);
    for(i=0;i<shell.length;i++) shell[i].h = heatAt(Ps[i].nx, Ps[i].ny)*(Ps[i].z>-0.1?1:0.55);
    for(i=0;i<ring.length;i++) ring[i].h = heatAt(Pr[i].nx, Pr[i].ny);
    for(i=0;i<halo.length;i++) halo[i].h = 0;

    drawEdges(X.far,  Ph, haloE, 0.8, 1.0*wsc);
    for(k=0;k<puffs.length;k++){ var pf = puffs[k], an = pf.a + t*(0.2/(0.25+pf.r)), rr3 = (pf.r + 0.035*Math.sin(t*0.6+pf.ph))*(0.58+0.42*e), po = {};
      proj(Math.cos(an)*rr3 - 0.03, Math.sin(an)*rr3*0.92 - 0.05, pf.z, po);
      var ps = pf.s*S*2.2; X.smoke.globalAlpha = Math.min(1, pf.al*(1+cl*2.2)); X.smoke.drawImage(sprite, po.x-ps/2, po.y-ps/2, ps, ps);
      if(k%3===0){ X.far.globalAlpha = pf.al*1.4; X.far.drawImage(sprite, po.x-ps*0.3, po.y-ps*0.3, ps*0.6, ps*0.6); } }
    for(k=0;k<puffs2.length;k++){ var q2 = puffs2[k], an2 = q2.a + t*q2.sp, po2 = {}, rs = q2.r*(0.82+0.18*e);
      proj(Math.cos(an2)*rs, Math.sin(an2)*rs, q2.z, po2); var ps2 = q2.s*S*2.2; X.smoke.globalAlpha = q2.al*(1+cl*0.8); X.smoke.drawImage(sprite, po2.x-ps2/2, po2.y-ps2/2, ps2, ps2); }
    for(k=0;k<bokeh.length;k++){ var bq = bokeh[k], an3 = bq.a + t*bq.sp, bo = {}, br = bq.r*(0.85+0.15*e);
      proj(Math.cos(an3)*br, Math.sin(an3)*br*0.95, 0, bo); var rd = bq.s*S, cc = bq.warm ? '255,205,140' : '255,255,255';
      X.beadblur.fillStyle = 'rgba('+cc+','+bq.al.toFixed(3)+')'; X.beadblur.beginPath(); X.beadblur.arc(bo.x,bo.y,rd,0,6.2832); X.beadblur.fill();
      X.beadblur.strokeStyle = 'rgba('+cc+','+(bq.al*1.2).toFixed(3)+')'; X.beadblur.lineWidth = 1.2*wsc; X.beadblur.stroke(); }
    X.smoke.globalAlpha = 1; X.far.globalAlpha = 1;
    drawEdges(X.mid,  Pr, ringE, 0.9, 1.2*wsc);
    drawEdgesLen(X.main, Ps, shellE, 0.75*wsc, 0);
    drawEdgesLen(X.rimblur, Ps, shellE, 0.95*wsc, 1, 0.85);

    /* shell + ring nodes */
    var m = X.main, d = X.mid;
    for(i=0;i<shell.length;i++){ var p = Ps[i], n = shell[i];
      if(n.hot){ m.fillStyle = 'rgba(214,78,38,.95)'; m.beginPath(); m.arc(p.x,p.y,2.1*wsc*(0.75+0.35*Math.sin(t*2.4+i)),0,6.2832); m.fill(); }
      else { m.fillStyle = 'rgba(16,16,18,.7)'; m.beginPath(); m.arc(p.x,p.y,(n.wall?0.7:1.2)*wsc,0,6.2832); m.fill(); } }
    for(i=0;i<ring.length;i++){ d.fillStyle = 'rgba(20,20,22,.6)'; d.beginPath(); d.arc(Pr[i].x,Pr[i].y,1.1*wsc,0,6.2832); d.fill(); }

    /* beads */
    for(k=0;k<beads.length;k++){ var bd = beads[k], px, py, pz, o = {};
      if(bd.type===0){ var a = bd.a + t*bd.sp + t*0.22; var bs = 0.55+0.45*e; proj(Math.cos(a)*bd.rr*bs+0.02, Math.sin(a)*bd.rr*0.92*bs+0.06, bd.z, o); }
      else {
        var ea = shellE[2*bd.e], eb = shellE[2*bd.e+1], na = shell[bd.from], nb = shell[bd.from===ea ? eb : ea], len = shellE.lens[bd.e] || 0.08;
        bd.p += dtm*bd.v/len;
        if(bd.p >= 1){ var tail = bd.from===ea ? eb : ea, opts = adj[tail], pick = opts[R()*opts.length|0]; bd.from = tail; bd.e = pick; bd.p = 0; na = shell[bd.from]; nb = shell[shellE[2*pick]===tail ? shellE[2*pick+1] : shellE[2*pick]]; }
        proj(na.x+(nb.x-na.x)*bd.p, na.y+(nb.y-na.y)*bd.p, na.z+(nb.z-na.z)*bd.p, o);
      }
      var hh = heatAt(o.nx,o.ny), c = bd.c, r = bd.s*wsc*(1+hh*0.9)*(bd.type===1 ? 0.8+0.35*Math.sin(t*3.2+bd.w*40) : 1);
      var mix = hh*0.8, cr = c[0]+(255-c[0])*mix|0, cg = c[1]+(236-c[1])*mix|0, cb = c[2]+(190-c[2])*mix|0;
      var ctx = bd.blur ? X.beadblur : X.bead;
      ctx.fillStyle = 'rgba('+cr+','+cg+','+cb+','+(bd.blur?0.55:0.92)+')'; ctx.beginPath(); ctx.arc(o.x,o.y,bd.blur?r*1.9:r,0,6.2832); ctx.fill();
      if(bd.blur){ ctx.strokeStyle = 'rgba('+cr+','+cg+','+cb+',.35)'; ctx.lineWidth = 0.8*wsc; ctx.beginPath(); ctx.arc(o.x,o.y,r*1.9,0,6.2832); ctx.stroke(); }
      if(hh>0.25){ X.bloom.fillStyle = 'rgba(255,190,90,'+(hh*0.5).toFixed(2)+')'; X.bloom.beginPath(); X.bloom.arc(o.x,o.y,r*3,0,6.2832); X.bloom.fill(); }
    }

    /* dots attached to mesh nodes */
    for(k=0;k<dots.length;k++){ var dt = dots[k], pn = Ps[dt.i], nh = shell[dt.i].h, cc = dt.c, mx = nh*0.8, back = pn.z < -0.2;
      var dr = dt.s*wsc*(0.8+0.3*Math.sin(t*2.6+dt.w*30))*(1+nh*0.8)*(back?0.8:1);
      X.bead.fillStyle = 'rgba('+(cc[0]+(255-cc[0])*mx|0)+','+(cc[1]+(236-cc[1])*mx|0)+','+(cc[2]+(190-cc[2])*mx|0)+','+(back?0.6:0.95)+')';
      X.bead.beginPath(); X.bead.arc(pn.x,pn.y,dr,0,6.2832); X.bead.fill(); }
    /* emissive edges, crystalline fans and heat bloom */
    X.glow.lineCap = X.bloom.lineCap = 'round';
    glowEdges(Ps, shell, shellE, wsc);
    glowEdges(Pr, ring, ringE, wsc);
    var hot = [];
    for(i=0;i<shell.length;i++) if(shell[i].h>0.35) hot.push([Ps[i],shell[i].h]);
    for(i=0;i<ring.length;i++) if(ring[i].h>0.35) hot.push([Pr[i],ring[i].h]);
    X.glow.lineWidth = 1.1*wsc;
    for(i=0;i<shell.length;i++){ var nn = shell[i]; if(nn.h < 0.6 || i%3) continue; for(k=0;k<3;k++){ var rx = Ps[i].x + Math.cos(nn.rays[k])*nn.rl[k]*S, ry = Ps[i].y + Math.sin(nn.rays[k])*nn.rl[k]*S,
        gr2 = X.glow.createLinearGradient(Ps[i].x,Ps[i].y,rx,ry); gr2.addColorStop(0,'rgba(255,225,160,'+(0.8*nn.h).toFixed(2)+')'); gr2.addColorStop(1,'rgba(255,170,70,0)');
        X.glow.strokeStyle = gr2; X.glow.beginPath(); X.glow.moveTo(Ps[i].x,Ps[i].y); X.glow.lineTo(rx,ry); X.glow.stroke(); } }
    X.glow.lineWidth = 0.7*wsc;
    for(i=0;i<hot.length;i++) for(k=i+1;k<hot.length;k++){ var A = hot[i][0], B = hot[k][0], dx = A.x-B.x, dy = A.y-B.y, dd = Math.sqrt(dx*dx+dy*dy);
      if(dd < S*0.42 && dd > S*0.05){ var al = 0.5*Math.min(hot[i][1],hot[k][1]);
        X.glow.strokeStyle = 'rgba(255,215,140,'+al.toFixed(2)+')'; X.glow.beginPath(); X.glow.moveTo(A.x,A.y); X.glow.lineTo(B.x,B.y); X.glow.stroke(); } }
    for(i=0;i<hot.length;i++){ var q = hot[i], rr = (1.0+q[1]*1.8)*wsc;
      X.glow.fillStyle = 'rgba(255,240,205,'+Math.min(1,q[1]).toFixed(2)+')'; X.glow.beginPath(); X.glow.arc(q[0].x,q[0].y,rr,0,6.2832); X.glow.fill(); }
    for(i=0;i<heat.length;i++){ var s = heat[i], gx = CX+s.x*S, gy = CY+s.y*S, gr = s.s*S*0.9;
      var gd = X.bloom.createRadialGradient(gx,gy,0,gx,gy,gr); gd.addColorStop(0,'rgba(255,205,120,'+(0.2*s.a).toFixed(2)+')'); gd.addColorStop(1,'rgba(255,170,70,0)');
      X.bloom.fillStyle = gd; X.bloom.fillRect(0,0,L,L); }
  }

  var t0 = performance.now(), start = 0;
  function loop(){ if(window.__freeze) return; stepPtr(); render(start + (performance.now()-t0)/1000); requestAnimationFrame(loop); }
  addEventListener('dblclick', function(){ t0 = performance.now(); });
  addEventListener('resize', function(){ fit(); if(reduce || window.__freeze) render(window.__t||3); });
  fit();
  window.__ptr = function(x,y){ ptr.x = ptr.tx = x; ptr.y = ptr.ty = y; ptr.on = ptr.ton = 1; ptr.cx = Math.max(-1.6,Math.min(1.6,x)); ptr.cy = Math.max(-1.6,Math.min(1.6,y)); };
  window.__render = function(t){ window.__freeze = true; window.__t = t; render(t); };
  if(reduce){ render(3); } else { requestAnimationFrame(loop); }
})();