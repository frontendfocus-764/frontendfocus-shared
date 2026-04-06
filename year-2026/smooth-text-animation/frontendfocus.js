const TEXT  = document.querySelector('.text')
const BTN   = document.getElementById('replay')

/** Split element text into .char spans, preserving spaces */
function split(el) {
  const raw = el.textContent
  el.textContent = ''
  return raw.split('').map(ch => {
    const s = document.createElement('span')
    s.className = 'char'
    s.textContent = ch
    el.appendChild(s)
    return s
  })
}

/** Inject a @keyframes rule if not already present */
function keyframes(name, css) {
  if (document.getElementById('kf-' + name)) return
  const style = document.createElement('style')
  style.id = 'kf-' + name
  style.textContent = `@keyframes ${name} { ${css} }`
  document.head.appendChild(style)
}

/** Run an animation function, re-run on button click */
function run(fn) {
  fn()
  BTN.onclick = fn
}

// ─── Slide from Right ─────────────────────────────────────────────────────
function slide_right() {
  const chars = split(TEXT)
  chars.forEach((ch, i) => {
    const delay = (chars.length - 1 - i) * 40
    ch.style.cssText = 'opacity:0; transform:translateX(36px); transition:none'
    setTimeout(() => {
      ch.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
      ch.style.opacity = '1'
      ch.style.transform = 'translateX(0)'
    }, 20)
  })
}


run(slide_right)