
const animation = name => {
	let tl = new gsap.timeline({
		repeat: -1,
		paused: true
	});
	if (name === 'neg') {
		gsap.set("#mouth", { rotation: 10, svgOrigin: "220 265" });
		gsap.set(".eyelids", { y: -8 });
		gsap.set('#minus', {svgOrigin: "125 205"})
		
		tl
			.to("#Negative .pupils", { x: -3, y: 3, duration: 1, ease: "power3.out" }, '+=1')
			.to("#Negative #mouth", { rotation: 0, duration: 1, ease: "power3.out" }, '-=1')
			.to("#Negative #minus", { duration: 0.5, rotation: -20, ease: "power1.in" }, '-=0.5')
			.to("#Negative #minus", { duration: 1.2, rotation: 0, ease: "elastic.out(1, 0.2)" })
			.to("#Negative .pupils", { x: 0, y: 0, duration: 0.5, ease: "power3.out" })
			.to("#Negative #mouth", { rotation: 10, duration: 0.5, ease: "power3.out" }, "-=0.5")
			.to("#Negative #body", { y: 10, duration: 2, ease: "power2.out", delay: 1.2 })
			.to("#Negative .pupils", { x: 0, y: 5, duration: 2, delay: -2, ease: "power3.out" })
			.to("#Negative .eyelids", { y: 5, duration: 2, delay: -2, ease: "power3.out" })
			.to("#Negative #mouth", {rotation: 20,duration: 1.2,delay: -2,ease: "power3.out"})
			.to("#Negative #right-leg",{ duration: 0.75, y: -8, rotation: 15, ease: "Power1.in" },"+=1")
			.to("#Negative #mouth", { duration: 0.75, rotation: 10, ease: "Power1.in" }, "-=0.75")
			.to("#Negative #right-leg", { duration: 0.25, y: 0, rotation: 0, ease: "Power1.in" })
			.to("#Negative #mouth",{ duration: 0.25, rotation: 20, ease: "Power2.in" },"-=0.25")
			.to("#Negative #body, .pupils", { x: 0, y: 0, duration: 0.5, ease: "power3.out" }, "+=2.5")
			.to("#Negative .eyelids", { duration: 0.5, ease: "Power1.out", y: -8 }, "-=0.5")
			.to("#Negative #mouth", { duration: 0.5, ease: "Power2.in", rotation: 10 }, "-=0.5");
	}
	else if (name === 'neu') {
			tl.to('#Neutral .eyes', { duration: 0.75, x: '-=5', ease: 'power1.in' }, '+=1')
				.to('#Neutral .mouth', { duration: 0.75, x: -5, ease: 'power1.in' }, '-=0.75')
				.to('#Neutral .pupils', { duration: 0.75, x: -8 , ease: 'power1.in'}, '-=0.75')
				.to('#Neutral .eyes', { duration: 0.75, x: '+=5' }, '+=1')
				.to('#Neutral .mouth', { duration: 0.75, x: 0 }, '-=0.75')
				.to('#Neutral .pupils', { duration: 0.75, x: 0 }, '-=0.75')
				.to('#Neutral .eyelid-bot', {duration: 0.25, y: -14, x: -1.1, yoyo: true, repeat: 1 })
				.to('#Neutral .eyelid-top', {duration: 0.25, y: 14, x: -1.1, yoyo: true, repeat: 1 }, '-=0.5')
				.to('#Neutral .eyes', { duration: 0.75, x: '+=5', ease: 'power1.in' }, '+=1')
				.to('#Neutral .mouth', { duration: 0.75, x: 5, ease: 'power1.in' }, '-=0.75')
				.to('#Neutral .pupils', { duration: 0.75, x: 8, ease: 'power1.in' }, '-=0.75')
				.to('#Neutral .eyes', { duration: 0.75, x: '-=5' }, '+=1')
				.to('#Neutral .mouth', { duration: 0.75, x: 0 }, '-=0.75')
				.to('#Neutral .pupils', { duration: 0.75, x: 0 }, '-=0.75')
				.to('#Neutral .eyelid-bot', {duration: 0.25, y: -14, x: -1.1, yoyo: true, repeat: 1 })
				.to('#Neutral .eyelid-top', {duration: 0.25, y: 14, x: -1.1, yoyo: true, repeat: 1 }, '-=0.5')
				.to('#Neutral .eyes', { duration: 0.75, y: '+=5', ease: 'power1.in' }, '+=1')
				.to('#Neutral .pupils', { duration: 0.75, y: 8 , ease: 'power1.in'}, '-=0.75')
				.to('#Neutral .eyes', { duration: 0.75, y: '-=5', ease: 'power1.out' }, '+=2')
				.to('#Neutral .pupils', { duration: 0.75, y: 0 , ease: 'power1.out'}, '-=0.75')
	}
	else if (name === 'pos') {
		gsap.set('#Positive #body', { svgOrigin: '210 300' });
		gsap.set('#Positive #left-leg', { svgOrigin: '165 340' });
		gsap.set('#Positive #right-leg', { svgOrigin: '245 340' });
		tl.repeat(1);
		tl.to('#Positive #body', { duration: 0.4, rotation: -10, ease: 'sine.in' })
			.to('#Positive .legs', { duration: 0.4, rotation: 4, ease: 'sine.in' }, 0)
			.to('#Positive .shadow', { duration: 0.4, x: -10, ease: 'sine.in' }, 0)
			.to('#Positive #body', { duration: 0.8, rotation: 10, yoyo: true, repeat: -1, ease: 'sine.inOut'}, 0.4)
			.to('#Positive .legs', { duration: 0.8, rotation: -4, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 0.4)
			.to('#Positive .shadow', { duration: 0.8, x: 10, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 0.4)
			.to('#Positive .eyebrows', { duration: 0.4, y: -5, yoyo: true, repeat: -1, ease: 'Power3.inOut' }, 0)
	}
	return tl;
} 

const animations = [animation('neg'), animation('neu'), animation('pos')];
let prev = false;

function updateView(n) {
	gsap.to('.runner', { duration: 0.5, x: n * -100 + 'vw' });
	gsap.to('body', { duration: 0.5, background: ['#f27996', '#bdc5ff', '#a2f9d4'][+n + 1] });
	(prev !== false) && animations[prev + 1].pause(0);
	animations[n + 1].play(0);
}
updateView(0);

document.getElementById('range').addEventListener('input', e => {
	updateView(+e.target.value);
	prev = +e.target.value;
});