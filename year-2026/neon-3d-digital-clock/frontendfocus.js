const bars = [
	['end', 'top'],
	['side', 'top', 'left'],
	['side', 'top', 'right'],
	['middle'],
	['side', 'bottom', 'left'],
	['side', 'bottom', 'right'],
	['end', 'bottom']
];

const $main = document.querySelector('main');

const addDigits = number => {
	const initGroup = (number, padding = 2) => {
		const $group = document.createElement('div');
		$group.classList.add('group');

		const digits = [...`${number}`.padStart(padding, 0)].map(digit => {
			const $digit = document.createElement('figure');
			$digit.classList.add('digit');
			$digit.setAttribute('data-digit', digit);
			bars.forEach(classes => {
				const $span = document.createElement('span');
				$span.classList.add(...classes);
				$digit.append($span);
			});
			return $digit;
		});

		$group.append(...digits);

		return {
			element: $group,
			set number(val) {
				number = val;
				[...`${number}`.padStart(padding, 0).substring(`${number}`.length - 2)].forEach((digit, i) => {
					digits[i].setAttribute('data-digit', digit);
				});
			},

			get number() {
				return number;
			}
		}
	}
	
	const $digits = document.createElement('div');
	$digits.classList.add('digits');
	const group = initGroup(number);
	const groupShadow1 = initGroup(number);
	const groupShadow2 = initGroup(number);
	groupShadow1.element.classList.add('shadow');
	groupShadow1.element.classList.add('shadow1');
	groupShadow2.element.classList.add('shadow');
	groupShadow2.element.classList.add('shadow2');
	$digits.append(group.element);
	$digits.append(groupShadow1.element);
	$digits.append(groupShadow2.element);
	$main.append($digits);
	
	return {
		set number(val) {
			number = val;
			group.number = val;
			groupShadow1.number = val;
			groupShadow2.number = val;
		},
		get number() {
			return number;
		}
	}
}

const addColon = () => {
	const $colonGroup = document.createElement('div');
	$colonGroup.classList.add('colon-group');
	const $colon = document.createElement('figure');
	$colon.append(document.createElement('span'));
	const $colonShadow1 = document.createElement('figure');
	$colonShadow1.append(document.createElement('span'));
	const $colonShadow2 = document.createElement('figure');
	$colonShadow2.append(document.createElement('span'));
	$colon.classList.add('colon');
	$colonShadow1.classList.add('colon', 'shadow', 'shadow1');
	$colonShadow2.classList.add('colon', 'shadow', 'shadow2');
	$colonGroup.append($colon);
	$colonGroup.append($colonShadow1);
	$colonGroup.append($colonShadow2);
	$main.append($colonGroup);
}

const init = () => {
	let now = new Date();
	let hours = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();
	
	const numberHour = addDigits(hours);
	addColon();
	const numberMinute = addDigits(minutes);
	addColon();
	const numberSecond = addDigits(seconds);
	
	const update = () => {
		now = new Date();
		let newSeconds = now.getSeconds();
		if (seconds !== newSeconds) {
			hours = now.getHours();
			minutes = now.getMinutes();
			seconds = newSeconds;
			numberHour.number = hours;
			numberMinute.number = minutes;
			numberSecond.number = seconds;
		}
		
		requestAnimationFrame(update);
	}
	update();
}

if (/^(?:(?!chrome|android)[\s\S])*(?:safari|iPad|iPhone|iPod)/i.test(navigator.userAgent)) {
	document.body.classList.add('safari');
}

init();