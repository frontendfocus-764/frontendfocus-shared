document.querySelectorAll('.fef-button').forEach(btn => {
    btn.addEventListener('click', e => {
        let label = btn.querySelector('.label'),
            counter = label.querySelector('.counter');

        if (!btn.classList.contains('active') && !btn.classList.contains('done')) {
            btn.classList.add('active');

            setLabel(label, label.querySelector('.default'), label.querySelector('.state'));

            setTimeout(() => {
                counter.classList.add('hide');

                animateWidth(counter, 0, 400, () => {
                    label.style.width = label.querySelector('.state > span').offsetWidth + "px";
                    counter.style.width = '';
                });

                btn.classList.remove('active');
                btn.classList.add('done');
            }, parseInt(getComputedStyle(btn).getPropertyValue('--duration')));
        }

        e.preventDefault();
    });
});

document.querySelectorAll('.restart').forEach(rst => {
    rst.addEventListener('click', e => {
        let btn = document.querySelector('.fef-button'),
            label = btn.querySelector('.label'),
            counter = label.querySelector('.counter');

        setLabel(label, label.querySelector('.state'), label.querySelector('.default'), () => {
            counter.classList.remove('hide');
            btn.classList.remove('done');
        });

        e.preventDefault();
    });
});

function setLabel(labelContainer, fromElement, toElement, callback) {
    fromElement.classList.add('hide');

    animateWidth(labelContainer, toElement.offsetWidth, 200, () => {
        fromElement.classList.remove('show', 'hide');
        toElement.classList.add('show');
        labelContainer.style.width = '';
        if (typeof callback === 'function') callback();
    });
}

function animateWidth(element, targetWidth, duration, callback) {
    let startWidth = element.offsetWidth;
    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;
        let progress = Math.min((time - startTime) / duration, 1);
        let currentWidth = startWidth + (targetWidth - startWidth) * progress;
        element.style.width = currentWidth + "px";

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (typeof callback === 'function') callback();
        }
    }

    requestAnimationFrame(animate);
}