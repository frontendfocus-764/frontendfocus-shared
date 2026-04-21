gsap.config({trialWarn: false});
let select = s => document.querySelector(s),
		q = gsap.utils.selector(document),
		toArray = s => gsap.utils.toArray(s),
		mainSVG = select('#mainSVG')

gsap.set('svg', {
	visibility: 'visible'
})

let tl = gsap.timeline();
tl.fromTo('#lamp', {
	rotation: -26,
	svgOrigin: '400 130'
}, {	
	duration: 1,
	rotation: 26,
	svgOrigin: '400 130',
	ease: 'power1.inOut',
	repeat: -1,
	yoyo: true
})

