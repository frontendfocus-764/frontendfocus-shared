var line = document.getElementById('ropeLine');
var head = document.getElementById('ropeHead');

var SEGMENTS = 18;
var SEG_TAU = 38;

var pts = [];
for (var i = 0; i < SEGMENTS; i++) pts.push({ x: -20, y: -20 });

var targetX = -20, targetY = -20, started = false;

function moveTo(x, y) {
  targetX = x;
  targetY = y;
  if (!started) {
    pts.forEach(function (p) { p.x = x; p.y = y; });
    started = true;
  }
}

window.addEventListener('pointermove', function (e) { moveTo(e.clientX, e.clientY); });
window.addEventListener('touchmove', function (e) {
  var t = e.touches[0];
  if (t) moveTo(t.clientX, t.clientY);
}, { passive: true });

var last = 0;

function tick(now) {
  var dt = last ? Math.min(now - last, 64) : 16.7;
  last = now;
  var a = 1 - Math.exp(-dt / SEG_TAU);

  pts[0].x = targetX;
  pts[0].y = targetY;
  for (var i = 1; i < SEGMENTS; i++) {
    pts[i].x += (pts[i - 1].x - pts[i].x) * a;
    pts[i].y += (pts[i - 1].y - pts[i].y) * a;
  }

  line.setAttribute('points', pts.map(function (p) {
    return p.x.toFixed(1) + ',' + p.y.toFixed(1);
  }).join(' '));
  head.setAttribute('cx', targetX);
  head.setAttribute('cy', targetY);

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);