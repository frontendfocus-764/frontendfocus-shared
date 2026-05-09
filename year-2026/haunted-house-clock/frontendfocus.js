function updateClock() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  const smoothSeconds = seconds + (milliseconds / 1000);

  const hourAngle = (hours * 30) + (minutes * 0.5) + (smoothSeconds * 0.00833);
  const minuteAngle = (minutes * 6) + (smoothSeconds * 0.1);
  const secondAngle = smoothSeconds * 6;

  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');

  if (hourHand) hourHand.style.transform = `rotate(${hourAngle}deg)`;
  if (minuteHand) minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
  if (secondHand) secondHand.style.transform = `rotate(${secondAngle}deg)`;
}

updateClock();
setInterval(updateClock, 50);