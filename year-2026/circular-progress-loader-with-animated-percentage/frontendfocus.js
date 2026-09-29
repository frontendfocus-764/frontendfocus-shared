const totalLines = 60;
    const ring = document.getElementById('progressRing');
    const percentageText = document.getElementById('percentageText');
    const statusText = document.getElementById('statusText');
    const lines = [];

    for (let i = 0; i < totalLines; i++) {
      const line = document.createElement('div');
      line.classList.add('line');

      const angle = i * (360 / totalLines);
      line.style.transform = `rotate(${angle}deg) translateY(-115px)`;

      ring.appendChild(line);
      lines.push(line);
    }

    const sequence = [
      { target: 15, duration: 700, pause: 350 },
      { target: 45, duration: 1100, pause: 500 },
      { target: 80, duration: 1300, pause: 400 },
      { target: 95, duration: 800, pause: 450 },
      { target: 100, duration: 600, pause: 200 }
    ];

    let currentProgress = 0;

    function updateUI(value) {
      currentProgress = value;
      percentageText.textContent = Math.floor(value) + '%';

      const activeLinesCount = Math.floor((value / 100) * totalLines);

      lines.forEach((line, index) => {
        if (!line.classList.contains('completed')) {
          if (index < activeLinesCount) {
            line.classList.add('active');
          } else {
            line.classList.remove('active');
          }
        }
      });
    }

    function animateTo(target, duration) {
      return new Promise((resolve) => {
        const startValue = currentProgress;
        const startTime = performance.now();

        function step(currentTime) {
          const elapsed = currentTime - startTime;
          const progressRatio = Math.min(elapsed / duration, 1);
          
          const easeOut = 1 - Math.pow(1 - progressRatio, 3);
          const currentValue = startValue + (target - startValue) * easeOut;
          
          updateUI(currentValue);

          if (progressRatio < 1) {
            requestAnimationFrame(step);
          } else {
            updateUI(target);
            resolve();
          }
        }

        requestAnimationFrame(step);
      });
    }

    async function triggerCompletionWave() {
      statusText.textContent = 'complete';
      statusText.style.color = '#22c55e';

      for (let i = 0; i < totalLines; i++) {
        lines[i].classList.remove('active');
        lines[i].classList.add('completed');
        await new Promise(r => setTimeout(r, 22));
      }
    }

    async function startProgressSequence() {
      await new Promise(r => setTimeout(r, 400));

      for (const patch of sequence) {
        await animateTo(patch.target, patch.duration);
        if (patch.pause > 0) {
          await new Promise(r => setTimeout(r, patch.pause));
        }
      }

      await triggerCompletionWave();
    }

    startProgressSequence();