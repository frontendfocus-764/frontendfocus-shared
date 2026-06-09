const randomInRange = (max, min) =>
  Math.floor(Math.random() * (max - min)) + min

const arry = new Array(200).fill();

arry.forEach(()=>{
  var pos = randomInRange(100.5, 0)
  var delay = randomInRange(10, 0);
  var speed = randomInRange(17, 12);
  var height =  randomInRange(12, 4);
  var blurVal = randomInRange(4, 1);
  const path = () => {
    const min = -150,
          max = 150;
    return [
      { x: randomInRange(max, min), y: randomInRange(max, min) },
      { x: randomInRange(max, min), y: randomInRange(max, min) },
      { x: randomInRange(max, min), y: randomInRange(max, min) },
      { x: randomInRange(max, min), y: randomInRange(max, min) }
    ];
  };

  droplet = document.createElement("div");
  droplet.className = "droplet";
  droplet.style.left = pos + "%";
  droplet.style.height = droplet.style.width = height +"px"; 
  
  TweenMax.set(droplet,{opacity:randomInRange(0.8, 0.5)});
  TweenMax.to(droplet, speed, {
    y: 1520,
    delay: delay,
    top: -300,
    filter: `blur(${blurVal}px)`,
    repeat: -1,
    bezier: {
      type: "soft",
      values:path(),
      autoRotate: true
    },
    ease: Power1.easeInOut
  });

  document.getElementById("container").appendChild(droplet);
})