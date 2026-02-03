let rots = [ 
  { ry: 0,   rx: 0  }, // 1
  { ry: 90,  rx: 0  }, // 2
  { ry: 180, rx: 0  }, // 3
  { ry: 270, rx: 0  }, // 4
  { ry: 0,   rx: 90 }, // 5
  { ry: 0,   rx:-90 }  // 6
];

gsap.timeline()
    .set(".face", { // apply transform rotations to each face of the cube
      rotateY: (i) => rots[i].ry,
      rotateX: (i) => rots[i].rx,
      transformOrigin: "50% 50% -150px",
      z: 150,
      background:(i)=>'url(https://picsum.photos/id/'+(i+28)+'/450/) center'
    })
    // .from(cube, { // reveal
    //   scale:2,
    //   border:'solid black 300px',
    //   ease:'expoInOut'
    // })
    .add(function(){
      window.onmousemove = (e)=> { // make it respond to mouse position
        
        let winPercent = { x:e.clientX/innerWidth, y:e.clientY/innerHeight },
            distFromCenter = 1 - Math.abs( (e.clientX - innerWidth/2) / innerWidth*2 );

        gsap.to(cube, {
          duration:1,
          rotationX:-180+360*winPercent.y,
          rotationY:-180+360*winPercent.x
        });
        
        gsap.to('.face', {
          duration:1,
          backgroundPosition:-150+150*winPercent.x+'px '+(-150*winPercent.y)+'px'
        });
      }  
    })