const btn       = document.getElementById('dlBtn');
const arcCircle = document.getElementById('arcCircle');
const pctLabel  = document.getElementById('pctLabel');
const stateLabel= document.getElementById('stateLabel');
const arrowIcon = document.getElementById('arrowIcon');
const tick      = document.getElementById('tick');
const tickPath  = document.getElementById('tickPath');
const pulse     = document.getElementById('pulse');

const CIRCUMFERENCE = 408;

let running = false;
let progress = { val: 0 };

function resetBtn() {
  running = false;
  progress.val = 0;
  arcCircle.style.strokeDashoffset = CIRCUMFERENCE;
  pctLabel.textContent = '';
  stateLabel.textContent = 'click to download';
  stateLabel.style.color = 'rgba(255,255,255,0.25)';
  arrowIcon.style.display = 'flex';
  arrowIcon.style.opacity = '1';
  arrowIcon.style.transform = '';
  tick.style.display = 'none';
  tickPath.style.strokeDashoffset = '50';
  gsap.set(pulse, { scale: 1, opacity: 0 });
  gsap.killTweensOf(progress);
  gsap.killTweensOf([arrowIcon, pulse]);
}

function startDownload() {
  if (running) return;
  running = true;
  stateLabel.textContent = 'downloading...';
  stateLabel.style.color = 'rgba(0,212,212,0.5)';

  // Bounce arrow
  gsap.to(arrowIcon, {
    y: 6, duration: 0.4, repeat: -1, yoyo: true, ease: 'power1.inOut'
  });

  // Animate progress 0 → 100
  gsap.to(progress, {
    val: 100,
    duration: 3.2,
    ease: 'power1.inOut',
    onUpdate: () => {
      const v = Math.round(progress.val);
      const offset = CIRCUMFERENCE - (CIRCUMFERENCE * v / 100);
      arcCircle.style.strokeDashoffset = offset;
      pctLabel.textContent = v + '%';
    },
    onComplete: () => completeDownload()
  });
}

function completeDownload() {
  gsap.killTweensOf(arrowIcon);

  gsap.to(arrowIcon, {
    opacity: 0, scale: 0.5, duration: 0.25,
    onComplete: () => { arrowIcon.style.display = 'none'; }
  });

  pctLabel.textContent = '';
  stateLabel.textContent = 'complete!';
  stateLabel.style.color = 'rgba(0,212,212,0.8)';

  tick.style.display = 'flex';

  // Draw checkmark
  gsap.to(tickPath, {
    strokeDashoffset: 0,
    duration: 0.45,
    ease: 'power2.out',
    delay: 0.1
  });

  // Pulse rings
  gsap.fromTo(pulse,
    { scale: 1, opacity: 0.6 },
    { scale: 1.6, opacity: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
  );
  gsap.fromTo(pulse,
    { scale: 1, opacity: 0.3 },
    { scale: 1.9, opacity: 0, duration: 1.1, ease: 'power2.out', delay: 0.5 }
  );

  // Glow flash on ring
  gsap.fromTo(arcCircle,
    { filter: 'drop-shadow(0 0 16px rgba(0,212,212,1))' },
    { filter: 'drop-shadow(0 0 4px rgba(0,212,212,0.4))', duration: 1.2, delay: 0.2 }
  );

  // Auto-reset
  setTimeout(resetBtn, 2800);
}

btn.addEventListener('click', startDownload);