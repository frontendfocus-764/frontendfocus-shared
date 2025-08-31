let hr = document.querySelector("#hr");
let mn = document.querySelector("#mn");
let sc = document.querySelector("#sc");

setInterval(function () {
  let day = new Date();
  let hour = day.getHours();
  let minutes = day.getMinutes();
  let seconds = day.getSeconds();
  hourstime = 30 * hour + minutes / 2;
  minutestime = minutes * 6;
  secondstime = seconds * 6;
  hr.style.transform = `rotate(${hourstime}deg)`;
  mn.style.transform = `rotate(${minutestime}deg)`;
  sc.style.transform = `rotate(${secondstime}deg)`;
}, 1000);
