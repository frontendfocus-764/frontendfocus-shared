const canvas = document.querySelector( 'canvas' );
const context = canvas.getContext( '2d' );

let width, height, dpr;
let currentFocus;

const RADIUS = 8;
const TAIL_LENGTH = 10;

const head = {};
const tail = [];

document.body.addEventListener( 'focus', event => focus( event.target ), true );

function resize() {

  dpr = window.devicePixelRatio || 1;

	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width * dpr;
	canvas.height = height * dpr;

	context.scale( dpr, dpr );

}

function redraw() {

  paint();

  requestAnimationFrame( redraw );

}

function paint() {

  context.clearRect( 0, 0, width, height );

  if( currentFocus ) {

    // Add to the tail
    tail.push( { ...head } );
    if( tail.length > TAIL_LENGTH ) tail.shift();

    // Paint the tail
    if( tail.length > 3 ) {

      context.beginPath();
      context.moveTo( tail[0].x, tail[0].y );

      for( var i = 2; i < tail.length - 2; i++ ) {
        const p1 = tail[i];
        const p2 = tail[i+1];

        context.quadraticCurveTo(
          p1.x, p1.y,
          ( p1.x + p2.x ) / 2,
          ( p1.y + p2.y ) / 2
        );
      }

      context.quadraticCurveTo(
        tail[i].x, tail[i].y,
        tail[i+1].x, tail[i+1].y
      );

      context.lineWidth = RADIUS;
      context.lineCap = 'round';
      context.strokeStyle = '#2c8660';
      context.stroke();
    }
  
    // Animate the head towards target x/y
    head.x += ( head.tx - head.x ) * 0.2;
    head.y += ( head.ty - head.y ) * 0.2;

    head.vx *= 0.8;
    head.x += head.vx;

    context.beginPath();
    context.arc( head.x, head.y, RADIUS, 0, Math.PI*2 );
    context.fillStyle = '#40cb90';
    context.fill();

  }

}

function focus( element ) {

  const previousFocus = currentFocus;

  if( element ) currentFocus = element;
  
  if( !currentFocus ) return;

  head.tx = currentFocus.offsetLeft - 12 - RADIUS;
  head.ty = currentFocus.offsetTop + currentFocus.offsetHeight/2;

  if( typeof head.x !== 'number' ) {
    head.x = head.tx;
    head.y = head.ty;
  }

  if( currentFocus !== previousFocus ) {
    head.vx = -8 - Math.abs( head.tx - head.x ) / 5;
  }

}

resize();
redraw();

window.addEventListener( 'resize', () => {
  requestAnimationFrame( () => {
    resize();
    focus();
    paint();
  } );
} );

window.addEventListener( 'scroll', () => {
  requestAnimationFrame( () => {
    focus();
    paint();
  } );
} );

// document.querySelectorAll( 'input' )[0].focus();