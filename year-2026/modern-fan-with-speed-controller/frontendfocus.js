const SPEED_LEVELS = {
  on: 160,
  1: 100,
  2: 250,
  3: 500,
  off: 0
};

const fan = document.getElementById("fan");
const speedValue = document.getElementById("speedValue");
const buttons = document.querySelectorAll("button");

let currentSpeed = 0;
let targetSpeed = 0;
let angle = 0;
let lastTime = 0;

let powerOn = false;

function updateButtons(){

  buttons.forEach(btn=>{

    const mode = btn.dataset.mode;

    if(mode === "on"){
      btn.disabled = powerOn;
    }

    else if(mode === "off"){
      btn.disabled = !powerOn;
    }

    else{
      btn.disabled = !powerOn;
    }

  });

}

function setActive(mode){

  buttons.forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

}

function setMode(mode){

  if(mode === "on"){
    powerOn = true;
    targetSpeed = SPEED_LEVELS.on;
  }

  else if(mode === "off"){
    powerOn = false;
    targetSpeed = 0;
  }

  else{

    if(!powerOn) return;

    targetSpeed = SPEED_LEVELS[mode];

  }

  setActive(mode);
  updateButtons();

}

buttons.forEach(btn=>{

  btn.addEventListener("click", function(){

    const mode = this.dataset.mode;
    setMode(mode);

  });

});

updateButtons();

function animate(time){

  if(!lastTime) lastTime = time;

  const delta = (time-lastTime)/1000;
  lastTime = time;

  const diff = targetSpeed-currentSpeed;

  currentSpeed += diff*0.04;

  angle += currentSpeed*delta*1.8;

  fan.style.transform = `rotate(${angle}deg)`;

  speedValue.textContent = Math.round(currentSpeed);

  requestAnimationFrame(animate);

}

requestAnimationFrame(animate);