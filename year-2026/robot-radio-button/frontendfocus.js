gsap.config({trialWarn: false});
let select = s => document.querySelector(s),
		q = gsap.utils.selector(document),
		toArray = s => gsap.utils.toArray(s),
		mainSVG = select('#mainSVG'),
		toggle = select('#offRing'),
		style = getComputedStyle(document.body),
		uiGrey = style.getPropertyValue('--ui-grey'),
		uiBlue = style.getPropertyValue('--ui-blue')
		

gsap.set('svg', {
	visibility: 'visible'
})
function setToggledEnabled(state) {
	if(state) {
		toggle.addEventListener('click', click);
		toggle.style.pointerEvents = 'auto'
	} else {
		toggle.removeEventListener('click', click);
		toggle.style.pointerEvents = 'none'
	}
}

let tl = gsap.timeline({
	defaults: {
		duration: 0.3
	},
	paused: true,
	onComplete: setToggledEnabled,
	onCompleteParams: [true]	
});
tl.add('offSelected')
.to('#onDot', {
	attr: {
		r: 0
	},
	//ease: 'elastic(0.6, 0.4)'
}, 'offSelected')
.to('#onRing', {
	stroke: uiGrey
}, 'offSelected')
.to('#onText', {
	fill: uiGrey
}, 'offSelected')

.to('#offDot', {
	attr: {
		r: 14
	},
	duration: 0.6,
	ease: 'elastic(0.6, 0.4)'
}, 'offSelected')
.to('#offRing', {
	stroke: uiBlue
}, 'offSelected')
.to('#offText', {
	fill: uiBlue
}, 'offSelected')


.add('handIn', '+=1')
.from(['#allRobotHands', '#robotThumb'], {
	x: 60,
	y: -180,
	duration: 0.4,
	ease: 'back(0.3)'
}, 'handIn')
.from('#robotThumb', {
	rotation: -20,
	transformOrigin: '20% 20%',
	duration: 0.4,
	ease: 'expo.inOut'
}, 'handIn+=0.1')
.from('#robotIndexFinger', {
	rotation: 15,
	transformOrigin: '100% 0%',
	duration: 0.4,
	ease: 'expo.inOut'
}, 'handIn+=0.1')

.add('handAcross')
.to(['#allRobotHands', '#robotThumb'], {
	x: 120,
	y: 0,
	ease: 'back.inOut(0.53)'
}, 'handAcross')
.to(['#allRobotHands', '#robotThumb, #offDot'], {
	y: '-=50',	
	duration: 0.15,
	ease: 'sine.in'
}, 'handAcross')
.to(['#allRobotHands', '#robotThumb, #offDot'], {
	y: '+=50',		
	duration: 0.15,
	ease: 'sine'
}, 'handAcross+=0.15')
.to('#offDot', {
	x: 120,
	ease: 'back.inOut(0.3)'
}, 'handAcross')
.to('#robotThumb', {
	rotation: -10,
	transformOrigin: '20% 20%',
	duration: 0.4,
	ease: 'expo.inOut'
}, 'handAcross+=0.3')
.to('#robotIndexFinger', {
	rotation: 5,
	transformOrigin: '100% 0%',
	duration: 0.4,
	ease: 'expo.inOut'
}, 'handAcross+=0.3')
.to(['#allRobotHands', '#robotThumb'], {
	duration: 0.4,
	y: '-=20',
	ease: 'sine.inOut'
}, 'handAcross+=0.3')
.add('hornHands', '+=0.35')
.to(['#allRobotHands', '#robotThumb'], {
	duration: 0.166,
	y: '+=20'
},'hornHands')
.to(['#robotHand', '#robotHandHorns','#robotThumb'], {
	opacity: gsap.utils.wrap([0, 1, 0]),
	duration: 0.06,
}, 'hornHands')
.to(['#allRobotHands'], {
	rotation: '+=12',
	//scale:1.1,
	transformOrigin: '80% 30%',
	//repeat: 9,
	//yoyo: true,
	duration: 0.08,
	ease: 'sine.inOut'
}, 'hornHands')

.to(['#allRobotHands'], {
	rotation: '-=12',
	scale:1.1,
	transformOrigin: '100% 30%',
	repeat: 9,
	yoyo: true,
	duration: 0.08,
	ease: 'sine.inOut'
}, 'hornHands+=0.166')
.to('#robotThumb', {
	rotation: 20,
	scaleY: 0.75,
	transformOrigin: '20% 20%',
	duration: 0.1,
	ease: 'expo.in'
}, 'hornHands-=0.1')

.add('handOut', '+=0')
.to(['#allRobotHands', '#robotThumb'], {
	x: 160,
	y: -200,
	ease: 'sine.in'
}, 'handOut')
.to('#allRobotHands', {
	//rotation: -45,
	ease: 'sine'
}, 'handOut')

.to('#onRing', {
	stroke: uiBlue
}, 'hornHands-=0.5')
.to('#onText', {
	fill: uiBlue
}, 'hornHands-=0.5')


.to('#offRing', {
	stroke: uiGrey
}, 'hornHands-=0.5')
.to('#offText', {
	fill: uiGrey
}, 'hornHands-=0.5')
.set(['#onDot', '#offDot'], {
	attr: {
		r: gsap.utils.wrap([14, 0])
	},
	x: 0
}, 'handOut')

function click (e) {
	setToggledEnabled(false)
	tl.play(0);
}

setToggledEnabled(true)

