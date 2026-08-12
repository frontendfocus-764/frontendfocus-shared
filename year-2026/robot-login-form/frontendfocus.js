// login robot
const $ = (s) => document.querySelector(s);

const robot = $('#robot');
const stage = $('#stage');
const eyes = $('#eyes');
const bubble = $('#bubble');
const bubbleText = $('#bubbleText');
const meter = $('#meter');
const meterBars = [...meter.children];
const panelLabel = $('#panelLabel');
const form = $('#form');
const nameI = $('#name');
const emailI = $('#email');
const passI = $('#password');
const peekBtn = $('#togglePass');
const btn = $('#loginBtn');
const btnLabel = $('#btnLabel');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let done = false;
let lastSaid = '';

// helpers
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function setMood(mood) {
  if (!done) robot.dataset.mood = mood;
}

function say(text) {
  if (text === lastSaid) return;
  lastSaid = text;
  bubbleText.textContent = text;
  bubble.classList.remove('pop');
  void bubble.offsetWidth; // restart animation
  bubble.classList.add('pop');
}

function look(x, y) {
  eyes.style.setProperty('--lx', `${x}px`);
  eyes.style.setProperty('--ly', `${y}px`);
}

// head tilt (deg)
const head3d = document.querySelector('.head3d');
function tilt(ry, rx) {
  head3d.style.setProperty('--ry', `${ry}deg`);
  head3d.style.setProperty('--rx', `${rx}deg`);
}

// eyes follow the text length
function followTyping(input) {
  const ratio = Math.min(input.value.length / 22, 1);
  look(-6 + 12 * ratio, 5);
  tilt(-5 + 10 * ratio, -8); // look down at the card
}

function turnAway(on) {
  robot.classList.toggle('is-turned', on);
}

// name
nameI.addEventListener('focus', () => {
  turnAway(false);
  setMood('watching');
  say(pick(["A visitor. State your name.", "Typing detected. Go on, I'm watching."]));
  followTyping(nameI);
});

nameI.addEventListener('input', () => {
  followTyping(nameI);
  const v = nameI.value.trim();
  if (v.length >= 2) say(`${v}. Solid name. Filed forever.`);
  else if (v.length === 0) say("Deleted. I've already forgotten it. Mostly.");
});

// email
emailI.addEventListener('focus', () => {
  turnAway(false);
  setMood('watching');
  say('Email next. I don\'t do spam — I don\'t even have an inbox.');
  followTyping(emailI);
});

emailI.addEventListener('input', () => {
  followTyping(emailI);
  if (EMAIL_RE.test(emailI.value.trim())) {
    setMood('happy');
    say(pick(['Now that is a proper email. Respect.', 'Valid address detected. Quietly delighted.']));
  } else {
    setMood('watching');
    if (emailI.value.includes('@')) say('Close. My sensors say: not yet.');
  }
});

// password - head turns around
passI.addEventListener('focus', () => {
  setMood('shy');
  turnAway(true);
  look(0, 0);
  tilt(0, 0);
  say("A secret? Say no more. *turns around*");
  panelLabel.textContent = 'NOT LOOKING';
});

passI.addEventListener('blur', (e) => {
  if (e.relatedTarget === peekBtn) return; // ignore the eye toggle
  turnAway(false);
});

passI.addEventListener('input', () => {
  const v = passI.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v)) score++;
  if (v.length > 0 && score === 0) score = 1;

  meter.dataset.lvl = score;
  meterBars.forEach((bar, i) => bar.classList.toggle('on', i < score));
  panelLabel.textContent = v.length === 0
    ? 'NOT LOOKING'
    : ['NOT LOOKING', 'TOO SHORT', 'GETTING THERE', 'STRONG', 'FORT KNOX'][score];
});

// show / hide password
peekBtn.addEventListener('click', () => {
  const show = passI.type === 'password';
  passI.type = show ? 'text' : 'password';
  peekBtn.setAttribute('aria-pressed', String(show));
  peekBtn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  if (show) say('Revealing it? Good thing I\'m facing the wall.');
  passI.focus();
});

// button hover
function hype(on) {
  if (done) return;
  if (on && robot.classList.contains('is-pressed')) return;
  robot.classList.toggle('is-hyped', on);
  if (on) {
    turnAway(false);
    setMood('excited');
    say(pick(['Ooh. Do it. Press it.', 'This is my favorite part.']));
  } else {
    setMood('idle');
    say('The button misses you already.');
  }
}
btn.addEventListener('mouseenter', () => hype(true));
btn.addEventListener('mouseleave', () => hype(false));
btn.addEventListener('focus', () => hype(true));
btn.addEventListener('blur', () => hype(false));

// closed happy eyes on every click
let pressTimer;
btn.addEventListener('pointerdown', () => {
  clearTimeout(pressTimer);
  robot.classList.add('is-pressed');
  robot.dataset.mood = 'pressed';
  say(pick(['Ahh. That’s the stuff.', 'Mmm. Satisfying.', 'Beep. Do that again.']));
});
function releasePress() {
  clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    robot.classList.remove('is-pressed');
    if (robot.dataset.mood === 'pressed') {
      robot.dataset.mood = done ? 'success' : 'excited';
    }
  }, 340);
}
btn.addEventListener('pointerup', releasePress);
btn.addEventListener('pointercancel', releasePress);
btn.addEventListener('pointerleave', () => {
  if (robot.classList.contains('is-pressed')) releasePress();
});

// submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (done) return;

  const complaints = [];
  if (!nameI.value.trim()) complaints.push(["Still don't know your name.", nameI]);
  else if (!EMAIL_RE.test(emailI.value.trim())) complaints.push(['That email isn\'t a real place.', emailI]);
  else if (!passI.value) complaints.push(['A password would help.', passI]);

  if (complaints.length) {
    const [msg, field] = complaints[0];
    setTimeout(() => { say(msg); setMood('watching'); }, 380);
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');
    field.focus();
    return;
  }

  done = true;
  turnAway(false);
  robot.classList.remove('is-hyped');

  setTimeout(() => {
    robot.dataset.mood = 'success';
    say(`Access granted. Welcome, ${nameI.value.trim()}.`);
    btn.classList.add('is-success');
    btnLabel.textContent = 'ACCESS GRANTED ✓';
    look(0, 0);
    tilt(0, 0);

    if (!reduceMotion) {
      robot.classList.add('is-spinning');
      setTimeout(() => robot.classList.remove('is-spinning'), 950);
      confetti();
    }
  }, 420);

  setTimeout(reset, 5600);
});

function reset() {
  done = false;
  robot.dataset.mood = 'idle';
  btn.classList.remove('is-success');
  btnLabel.textContent = 'LOG ME IN';
  say('Again? I could do this all day.');
}

// blinking + follow the mouse
(function blinkLoop() {
  setTimeout(() => {
    if (robot.dataset.mood !== 'success' && !robot.classList.contains('is-turned')) {
      eyes.classList.add('blink');
      setTimeout(() => eyes.classList.remove('blink'), 150);
    }
    blinkLoop();
  }, 2600 + Math.random() * 2600);
})();

let rafPending = false;
document.addEventListener('mousemove', (e) => {
  const active = document.activeElement;
  if (done || (active && active.tagName === 'INPUT')) return;
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    const rect = robot.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 260));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 260));
    look(dx * 7, dy * 6);
    if (!robot.classList.contains('is-turned')) tilt(dx * 12, -dy * 9);
  });
});

// confetti
function confetti() {
  const colors = ['#ff6b4b', '#2ec4b6', '#ffc53d', '#23252d', '#fffdf8'];
  const origin = btn.getBoundingClientRect();
  const host = document.querySelector('.scene');
  const hostRect = host.getBoundingClientRect();
  const ox = origin.left - hostRect.left + origin.width / 2;
  const oy = origin.top - hostRect.top;

  for (let i = 0; i < 70; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti';
    bit.style.background = pick(colors);
    if (Math.random() > .5) bit.style.borderRadius = '50%';
    host.appendChild(bit);

    const angle = -Math.PI / 2 + (Math.random() - .5) * 1.6;
    const speed = 240 + Math.random() * 380;
    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed;

    bit.animate(
      [
        { transform: `translate(${ox}px, ${oy}px) rotate(0deg) scale(1)`, opacity: 1 },
        { transform: `translate(${ox + tx}px, ${oy + ty + 320}px) rotate(${540 * (Math.random() > .5 ? 1 : -1)}deg) scale(.6)`, opacity: 0 }
      ],
      { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.15,.6,.35,1)' }
    ).onfinish = function () { bit.remove(); };
  }
}
