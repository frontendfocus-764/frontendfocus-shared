document.querySelectorAll('.switch').forEach(elem => {
    elem.addEventListener('click', e => {
        let active = elem.classList.contains('active');

        gsap.to(elem, {
            '--c-background-top': active ? '#75757D' : '#F0F0F0',
            '--c-background-bottom': active ? '#45454C' : '#E9E9E9',
            '--c-background-top-shadow': active ? 'rgba(255, 255, 255, .45)' : '#fff',
            '--c-background-bottom-shadow': active ? 'rgba(0, 0, 0, .3)' : 'rgba(0, 0, 0, .18)',
            '--c-stroke-top': active ? '#262626' : '#E7E7E7',
            '--c-stroke-bottom': active ? '#3D3D43' : '#D0D0D0',
            '--c-inner': active ? '#6D6D6D' : '#EAEAEA',
            '--c-inner-top-shadow': active ? 'rgba(0, 0, 0, .3)' : 'rgba(156, 56, 0, .42)',
            '--c-inner-bottom-shadow': active ? 'rgba(255, 255, 255, .18)' : '#FFF3E5',
            '--c-inner-inset-shadow': active ? 'rgba(0, 0, 0, .14)' : 'rgba(0, 0, 0, .2)',
            '--c-knob-stroke-top': active ? '#515151' : '#cc4528',
            '--c-knob-stroke-bottom': active ? '#acacac' : '#f05f21',
            '--c-knob-inner-top': active ? '#8A8A8A' : '#E94714',
            '--c-knob-inner-middle-top': active ? '#A1A1A1' : '#E85617',
            '--c-knob-inner-middle-bottom': active ? '#B4B4B4' : '#FF7324',
            '--c-knob-inner-bottom': active ? '#BABABA' : '#FF844F',
            '--c-knob-inner-shadow-top': active ? 'rgba(255, 255, 255, .25)' : 'rgba(255, 170, 109, .44)',
            '--c-knob-inner-shadow-bottom': active ? 'rgba(0, 0, 0, .3)' : 'rgba(244, 44, 0, .9)',
            '--c-knob-shadow-1': active ? 'rgba(7, 7, 37, .16)' : 'rgba(255, 180, 175, .7)',

            '--shine-top-y': active ? '-5px' : '0px',
            '--shine-bottom-y': active ? '0px' : '5px',
            '--knob-inner-shadow-top-y': active ? '2.5px' : '5.5px',
            '--knob-inner-shadow-bottom-y': active ? '-5.5px' : '-1.5px',
            '--knob-shadow-1-y': active ? '20px' : '0px',
            '--knob-shadow-1-blur': active ? '20px' : '2px',
            '--knob-shadow-1-spread': active ? '0px' : '5px',
            '--knob-shadow-2-y': active ? '12.5px' : '6.5px',
            '--knob-shadow-2-blur': active ? '8.5px' : '4.5px',
            '--knob-shadow-3-y': active ? '6.5px' : '3.5px',
            '--knob-shadow-3-blur': active ? '4.5px' : '2.5px',
            '--knob-shadow-4-y': active ? '4px' : '2px',
            '--knob-shadow-4-blur': active ? '2.5px' : '1.5px',
            '--knob-shadow-7-y': active ? '15px' : '5px',
            '--top-shadow-blur': active ? '5px' : '3px',
            '--inner-bottom-shadow-blur': active ? '1.25px' : '1px',
            '--shine-top-opacity': active ? 0 : 1,
            '--shine-bottom-opacity': active ? 1 : 0,

            duration: 0.15,
            ease: 'power1.in',

            onComplete() {
                elem.classList.toggle('active');
            }
        });

        document.querySelector('body').classList.toggle('active');
    });
});