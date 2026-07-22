// ─── DOM ──────────────────────────────────────────────────────────────────────
const TEXT_EL = document.querySelector('.text')
const BTN     = document.getElementById('replay')

// ─── Split ────────────────────────────────────────────────────────────────────
function split() {
  const raw = TEXT_EL.textContent
  TEXT_EL.textContent = ''
  return raw.split('').map(ch => {
    const s = document.createElement('span')
    s.className   = 'char'
    s.textContent = ch
    TEXT_EL.appendChild(s)
    return s
  })
}

// ─── Loop & run ───────────────────────────────────────────────────────────────
let _raf = null
function loop(tick) {
  cancelAnimationFrame(_raf)
  ;(function frame() { tick(); _raf = requestAnimationFrame(frame) })()
}

// ─── Easing ───────────────────────────────────────────────────────────────────
const ease = {
  out:     t => 1 - (1 - t) ** 3,
  in:      t => t ** 3,
  inOut:   t => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
  outBack: t => { const c = 1.70158 + 1; return 1 + c * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2 },
  bounce:  t => {
    const n = 7.5625, d = 2.75
    if (t < 1 / d)       return n * t * t
    if (t < 2 / d)       return n * (t -= 1.5 / d) * t + 0.75
    if (t < 2.5 / d)     return n * (t -= 2.25 / d) * t + 0.9375
    return n * (t -= 2.625 / d) * t + 0.984375
  },
}

function cyc(f, offset, enter, hold, exit, pause, eIn = ease.out, eOut = ease.in) {
  if (f < offset) return 0                          // stagger delay: wait at start
  const total = enter + hold + exit + pause
  const t = (f - offset) % total
  if (t < enter)                return eIn(t / enter)
  if (t < enter + hold)         return 1
  if (t < enter + hold + exit)  return 1 - eOut((t - enter - hold) / exit)
  return 0
}

// Linear interpolation helper
const lerp = (a, b, t) => a + (b - a) * t

// ── Cascade Drop ─────────────────────────────────────────────────────
function cascade_drop() {
  const chars = split()
  const STAGGER = 14, ENTER = 42, HOLD = 62, EXIT = 34, PAUSE = 36
  let f = 0
  loop(() => {
    f++
    chars.forEach((ch, i) => {
      const p = cyc(f, i * STAGGER, ENTER, HOLD, EXIT, PAUSE, ease.bounce, ease.in)
      ch.style.opacity   = p < 0.12 ? p / 0.12 : 1
      ch.style.transform = `translateY(${(1 - p) * -46}px)`
    })
  })
}

cascade_drop()