const sunny = document.getElementById("sunny");
const sun = document.getElementById("sun");
const moon = document.getElementById("moon");

const handleMove = (e) => {
  sunny.style.width = `${(e.clientX / window.innerWidth) * 100}%`;
  sun.style.bottom = `${
    (e.clientX / window.innerWidth) * window.innerHeight - sun.clientHeight - 20
  }px`;
  moon.style.bottom = `${
    (1 - e.clientX / window.innerWidth) * window.innerHeight -
    moon.clientHeight -
    20
  }px`;
};

document.onmousemove = (e) => handleMove(e);

document.ontouchmove = (e) => handleMove(e.touches[0]);

const rain = document.getElementById("rain");

for (var i = 0; i < 50; i++) {
  const drop = document.createElement("div");
  drop.classList.add("drop");
  drop.style.left = `${Math.floor(Math.random() * 100)}%`;
  drop.style.backgroundColor = `rgba(255, 255, 255, ${Math.random()})`;
  drop.style.animationDelay = `${Math.floor(Math.random() * 500)}ms`;
  drop.style.animationDuration = `${Math.random() * (0.9 - 0.5) + 0.5}s`;
  rain.appendChild(drop);
}

const clouds = document.getElementById("clouds");

for (var i = 0; i < 6; i++) {
  const cloud = document.createElement("div");
  cloud.classList.add("cloud");
  cloud.style.top = `${Math.floor(Math.random() * (80 - 10) + 10)}vh`;
  cloud.style.opacity = `${Math.random() * (0.8 - 0.4) + 0.4}`;
  cloud.style.transform = `scale(${Math.random() * (1 - 0.4) + 0.4})`;
  cloud.style.animationDelay = `${Math.floor(Math.random() * 19)}s`;
  cloud.style.animationDuration = `${Math.random() * (25 - 19) + 19}s`;
  clouds.appendChild(cloud);
}
