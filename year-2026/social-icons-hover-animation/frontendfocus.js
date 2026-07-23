anime({
	targets: '.facebook-svg',
	translateY: [
		{value: -100 + '%', duration: 500},
		{value: 0, duration: 500}
	],
	rotateX: [
		{value: 0 + 'deg', duration: 500},		
		{value: 360 + 'deg', duration: 2500, delay: 500},
	]
});
anime({
	targets: '.instagram-svg',
	translateY: [
		{value: -100 + '%', duration: 500, delay: 500},
		{value: 0, duration: 500}
	],
	rotateX: [
		{value: 0 + 'deg', duration: 500},		
		{value: 360 + 'deg', duration: 2500, delay: 1000},
	]
});
anime({
	targets: '.twitter-svg',
	translateY: [
		{value: -100 + '%', duration: 500, delay: 1000},
		{value: 0, duration: 500}
	],
	rotateX: [
		{value: 0 + 'deg', duration: 500},		
		{value: 360 + 'deg', duration: 2500, delay: 1500},
	]
});
anime({
	targets: '.youTube-svg',
	translateY: [
		{value: -100 + '%', duration: 500, delay: 500},
		{value: 0, duration: 500}
	],
	rotateX: [
		{value: 0 + 'deg', duration: 500},		
		{value: 360 + 'deg', duration: 2500, delay: 1000},
	]
});
anime({
	targets: '.pinterest-svg',
	translateY: [
		{value: -100 + '%', duration: 500, delay: 1000},
		{value: 0, duration: 500}
	],
	rotateX: [
		{value: 0 + 'deg', duration: 500},		
		{value: 360 + 'deg', duration: 2500, delay: 1500},
	]
});
anime({
	targets: '.codepen-svg',
	translateY: [
		{value: -100 + '%', duration: 500, delay: 1500},
		{value: 0, duration: 500}
	],
	rotateX: [
		{value: 0 + 'deg', duration: 500},		
		{value: 360 + 'deg', duration: 2500, delay: 2000},
	]
});

let fblogoCircle = document.querySelector('.fb-logoCircle');
let fbRing = document.querySelector('.fb-ring');
let facebook = document.querySelector('.facebook-svg');

facebook.addEventListener('mouseenter', function() {
	anime({
		targets: fblogoCircle,
		scale: [
			{value: 1.1, duration: 150},
			{value: .65, duration: 300},
			{value: 1, duration: 500}
		],
	});
});

facebook.addEventListener('mouseenter', function() {
	anime({
		targets: fbRing,
		scale: [
			{value: 1, duration: 100},
			{value: .85, duration: 250}, 
			{value: 1, duration: 600}
		],
	});
});

let instaLogoCircle = document.querySelector('.ig-logoCircle');
let igRing = document.querySelector('.ig-ring');
let insta = document.querySelector('.instagram-svg');

insta.addEventListener('mouseenter', function() {
	anime({
		targets: instaLogoCircle,
		scale: [
			{value: 1.1, duration: 150},
			{value: .80, duration: 300},
			{value: 1, duration: 500}
		],
	});
});

insta.addEventListener('mouseenter', function() {
	anime({
		targets: igRing,
		scale: [
			{value: 1, duration: 100},
			{value: .85, duration: 250}, 
			{value: 1, duration: 600}
		],
	});
});

let twitterLogoCircle = document.querySelector('.tw-logoCircle');
let twRing = document.querySelector('.tw-ring');
let twitter = document.querySelector('.twitter-svg');

twitter.addEventListener('mouseenter', function() {
	anime({
		targets: twitterLogoCircle,
		scale: [
			{value: 1.1, duration: 150},
			{value: .65, duration: 300},
			{value: 1, duration: 500}
		],
	});
});

twitter.addEventListener('mouseenter', function() {
	anime({
		targets: twRing,
		scale: [
			{value: 1, duration: 100},
			{value: .85, duration: 250}, 
			{value: 1, duration: 600}
		],
	});
});

let youTubeLogoCircle = document.querySelector('.yt-logoCircle');
let ytRing = document.querySelector('.yt-ring');
let tube = document.querySelector('.youTube-svg');

tube.addEventListener('mouseenter', function() {
	anime({
		targets: youTubeLogoCircle,
		scale: [
			{value: 1.1, duration: 150},
			{value: .75, duration: 300},
			{value: 1, duration: 500}
		],
	});
});

tube.addEventListener('mouseenter', function() {
	anime({
		targets: ytRing,
		scale: [
			{value: 1, duration: 100},
			{value: .85, duration: 250}, 
			{value: 1, duration: 600}
		],
	});
});

let pinterestLogoCircle = document.querySelector('.pt-logoCircle');
let ptRing = document.querySelector('.pt-ring');
let pinterest = document.querySelector('.pinterest-svg');

pinterest.addEventListener('mouseenter', function() {
	anime({
		targets: pinterestLogoCircle,
		scale: [
			{value: 1.1, duration: 150},
			{value: .75, duration: 300},
			{value: 1, duration: 500}
		],
	});
});

pinterest.addEventListener('mouseenter', function() {
	anime({
		targets: ptRing,
		scale: [
			{value: 1, duration: 100},
			{value: .85, duration: 250}, 
			{value: 1, duration: 600}
		],
	});
});

let codepenLogoCircle = document.querySelector('.cp-logoCircle');
let ring = document.querySelector('.cp-ring');
let pen = document.querySelector('.codepen-svg');

pen.addEventListener('mouseenter', function() {
	anime({
		targets: codepenLogoCircle,
		scale: [
			{value: 1.1, duration: 150},
			{value: .75, duration: 300},
			{value: 1, duration: 500}
		],
	});
});

pen.addEventListener('mouseenter', function() {
	anime({
		targets: ring,
		scale: [
			{value: 1, duration: 100},
			{value: .85, duration: 250}, 
			{value: 1, duration: 600}
		],
	});
});