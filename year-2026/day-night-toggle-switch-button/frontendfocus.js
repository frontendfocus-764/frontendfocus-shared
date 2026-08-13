const body = document.getElementById('dayNighttoggle');
const toggleContainer = document.getElementById('toggleContainer');
const toggleDot = document.getElementById('toggleDot');
const sunRadiant = document.getElementById('sunRadiant');
const moonRadiant = document.getElementById('moonRadiant');
const clouds = document.getElementsByClassName('cloud');
const stars = document.getElementById('stars');
const toggleCrater = document.getElementsByClassName('toggle-crater');

toggleContainer.addEventListener('click', function() {
  body.classList.toggle('night');
  toggleContainer.classList.toggle('toggle-container--night');
  toggleDot.classList.toggle('toggle-dot--night');
  sunRadiant.classList.toggle('sun-radiant--night');
  moonRadiant.classList.toggle('moon-radiant--night');
  stars.classList.toggle('stars--night');
  for(const cloud of clouds) {cloud.classList.toggle('cloud--night')}
  for(const crater of toggleCrater) {crater.classList.toggle('toggle-crater--night')}
});