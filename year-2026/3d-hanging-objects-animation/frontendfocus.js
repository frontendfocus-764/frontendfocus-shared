let select = e => document.querySelector(e);
let selectAll = e => document.querySelectorAll(e);

var timeLines = [[],[],[],[]];

const
gsapWrapper = select("#gsapWrapper"),
gsapBody = select("#gsapBody"),
shadow3dWrapper = select("#shadow3dWrapper"),
shadow3d = select("#shadow3d"),
world3d = select("#world3d"),
colorArray = [
	[ "#71d0e3", "#9cbab8", "#87c4b5", "#cfe2e0", "#dedcce", "#9aadb1" ],
	[ "#b4cc91", "#a4ba56", "#577831", "#648536", "#575e56", "#574b18" ],
	[ "#be5812", "#ed5b26", "#e88d1e", "#a8764f", "#f0c57a", "#bf9e7c" ],
	[ "#d0e69e", "#a1cc87", "#73ad6d", "#c9e0c3", "#f2faed", "#91c478" ],
	[ "#e3cd91", "#ffd770", "#e6b743", "#fce832", "#f7ca34", "#ebb552" ],
	[ "#2b2e36", "#d2d6d5", "#91918d", "#7d797b", "#7e807a", "#a6a6a6" ],
	[ "#80644f", "#d6c4b8", "#a86f0c", "#8a6355", "#d9ccb4", "#b38b00" ],
	[ "#823f22", "#9d4f1f", "#6b6155", "#c78e52", "#42342b", "#a1655d" ]
];


setupStage();

function setupStage()
{
	
	const // set circle dimensions used for chime strand positioning
	cX = 0,
	cZ = gsap.utils.random( 200, 250 ),
	r = gsap.utils.random( 130, 170 ),
	nPoints = 4,
	aIncrement = ( 2 * Math.PI) / nPoints,
	seed = gsap.utils.random( 0, 45 );

	const colorIndex1 = gsap.utils.random( 0, 7, 1 );
	for( var i = 0; i < nPoints; i++ ) // go through each strand and set behaviours
	{

		let // set random attributes of each strand
		colorIndex2 = gsap.utils.random( 0, 5, 1 ),
		targetColor = colorArray[colorIndex1][colorIndex2],
		targetDuration = gsap.utils.random( 2.6, 3.6, 0.1 ),
		targetRotStart = ( 5 * ( 3 - targetDuration ) ) - 20,
		targetRotEnd = 60 + ( 10 * ( 3 - targetDuration ) );

		let // strand position around edge of circle
		angle = ( aIncrement * i ) + seed,
		xPos = cX + r * Math.cos(angle),
		zPos = cZ + r * Math.sin(angle);

		var // translate x-axis / z-axis positioning of chime strand in 3D space
		cB = select("#cB"+i),
		t = 'translateX( ' + xPos + 'px ) translateY( 0px ) translateZ( ' + zPos + 'px )';
    gsap.to(cB, { transform : t });

		let // translate x-axis / z-axis positioning of shadow strand in 3D space
		cS = select("#cS"+i),
		xPos2 = ( xPos * 1.7 ) + 350,
		zPos2 = zPos / 4,
		t2 = 'translateX( ' + xPos2 + 'px ) translateY( 40px ) translateZ( ' + zPos2 + 'px )';
    gsap.to(cS, { transform : t2 });

		const chimes = selectAll("#cB"+i+" svg");
		chimes.forEach( ( chime, i2) => { // go through each chime in a strand and set behaviours

			const // chime elements
			glass1 = chime.querySelector("g.filters"),
			path01 = chime.querySelector("use.path01"),
			path02 = chime.querySelector("use.path02"),
			sideL = chime.querySelector("use.sideL"),
			sideR = chime.querySelector("use.sideR"),
			shadow = select("#c2"+i+i2),
			glass2 = shadow.querySelector("circle");

			gsap.to(path01, 1.5, { fill: targetColor });
			gsap.to(glass2, 1.5, { fill: targetColor });
			
			var tl = gsap.timeline({
				repeat: -1,
				yoyo: true,
				defaults: { ease: "sine.inOut", transformOrigin: "50% 0%", duration: targetDuration },
				onStart: () => {
						tl.seek( gsap.utils.random( 0, 4, 0.2 ) );
				}
			})

			.fromTo( [chime,shadow], { rotationY: targetRotStart }, { rotationY: targetRotEnd }, 0)
			.fromTo( path02, { opacity: 0.8	}, { opacity: 0, ease: "sine.out" }, 0)
			.fromTo( sideL, { opacity: 0 }, { opacity: 0.5 }, 0)
			.fromTo( sideR, { opacity: 0.3 }, { opacity: 0 }, 0);
			
			timeLines[i].push(tl);

		});

		// display strand and shadow
		gsap.set("#cB"+i, { autoAlpha: 1 });
		gsap.set("#cS"+i,{ autoAlpha: 1 });

	}

} // setStage()


function resetStage()
{
    
    const // set circle dimensions used for chime strand positioning
    cX = 0,
    cZ = gsap.utils.random( 200, 250 ),
    r = gsap.utils.random( 130, 170 ),
    nPoints = 4,
    aIncrement = ( 2 * Math.PI) / nPoints,
    seed = gsap.utils.random( 0, 45 );

    const colorIndex1 = gsap.utils.random( 0, 7, 1 );
    for( var i = 0; i < nPoints; i++ ) // go through each strand and set behaviours
    {
        let // set random attributes of each strand
        colorIndex2 = gsap.utils.random( 0, 5, 1 ),
        targetColor = colorArray[colorIndex1][colorIndex2],
        targetDuration = gsap.utils.random( 2.6, 3.6, 0.1 ),
        targetRotStart = ( 5 * ( 3 - targetDuration ) ) - 20,
        targetRotEnd = 60 + ( 10 * ( 3 - targetDuration ) );
        
        let // strand position around edge of circle
        angle = ( aIncrement * i ) + seed,
        xPos = cX + r * Math.cos(angle),
        zPos = cZ + r * Math.sin(angle);
        
        var // translate x-axis / z-axis positioning of chime strand in 3D space
        cB = select("#cB"+i),
        t = 'translateX( ' + xPos + 'px ) translateY( 0px ) translateZ( ' + zPos + 'px )';
        gsap.to(cB, { transform : t });

        let // translate x-axis / z-axis positioning of shadow strand in 3D space
        cS = select("#cS"+i),
        xPos2 = ( xPos * 1.7 ) + 350,
        zPos2 = zPos / 4,
        t2 = 'translateX( ' + xPos2 + 'px ) translateY( 40px ) translateZ( ' + zPos2 + 'px )';
        gsap.to(cS, { transform : t2 });

        const chimes = selectAll("#cB"+i+" svg");
        chimes.forEach( ( chime, i2) => { // go through each chime in a strand and set behaviours
            
            const // chime elements
            glass1 = chime.querySelector("g.filters"),
						path01 = chime.querySelector("use.path01"),
            shadow = select("#c2"+i+i2),
            glass2 = shadow.querySelector("circle");
            
            gsap.to(path01, 1.5, { fill: targetColor });
            gsap.to(glass2, 1.5, { fill: targetColor });

        });

    }
} // resetStage()


/* ************************************************************************** */
/* Eventlisteners */

gsapWrapper.addEventListener( 'mousemove', onMouseMove );
function onMouseMove ( e ) {
	
	// change rotation on mouse move
	const
	minPoint = gsapWrapper.offsetWidth / 2,
	offsetX = ( minPoint - e.clientX ) / gsapWrapper.offsetWidth,
	world3dXAngle = parseInt( ( 30 * offsetX ) - 25 ),
	shadow3dXAngle = 30 - ( 10 * offsetX );

	gsap.to( world3d, 4, { transform: "rotateY("+world3dXAngle+"deg)", transformOrigin: "50% 50%" } );
	gsap.to( shadow3dWrapper, 4, { transform: "rotateY("+shadow3dXAngle+"deg)", transformOrigin: "0% 50%" } );
    
}

reset.addEventListener('click', resetStageF );
function resetStageF() {
    
    var tl = gsap.timeline()
    .fromTo( resetBt, 0.5, { rotation: 0 }, { rotation: 360, transformOrigin: "50% 50%" } )
    .to( resetBt, 0.25, { fill: "#aad400", repeat: 1, yoyo: true, }, 0 )
    .to( resetBt, 0.25, { fill: "#b3b3b3", repeat: 1, yoyo: true, })
    .add( resetStage() );
}