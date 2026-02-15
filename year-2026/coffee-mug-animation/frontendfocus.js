const { log } = console;

log('☕️');

const sl = document.querySelector.bind(document);

const internals = {};
internals.setElements = (prefix, array) => array.forEach((p) => (internals[`${prefix}${p}`] = sl(`#${prefix}${p}`)));

// -------

internals.svgRoot = sl('svg');

internals.cupBodyShape = sl('#cupBodyShape');
internals.setElements('cupBodyShape', '10 16 20 23'.split(' '));

internals.cupShadowShape = sl('#cupShadowShape')
internals.setElements('cupShadowShape', '10 16 20 23'.split(' '));

internals.cupHandleShape = sl('#cupHandleShape');
internals.setElements('cupHandleShape', '10 16 20 23'.split(' '));

internals.cupTop = sl('#cupTop');

internals.coffeeShape = sl('#coffeeShape');
internals.setElements('coffeeShape', '02 04 06 08 10 12 14 16 17 18 19 20 23 25 27'.split(' '));

internals.setElements('coffeeDrop', [1, 2, 3])

internals.footShape = sl('#foot');
internals.setElements('footShape', '10 16 20 23'.split(' '));

internals.face = sl('#face');
internals.eyesOpen = sl('#eyesOpen');
internals.eyesClosed = sl('#eyesClosed');
internals.eyeClosedTop = sl('#eyeClosedTop');
internals.eyeClosedBottom = sl('#eyeClosedBottom');
internals.mouthA = sl('#mouthClosed');
internals.mouthB = sl('#mouthOpen');

internals.drop1 = sl('#drop1');
internals.drop2 = sl('#drop2');
internals.drop3 = sl('#drop3');
internals.drop4 = sl('#drop4');
internals.vaporWrapper = sl('#vaporWrapper');

internals.shadow = sl('#shadow');
internals.wave = sl('#wave');

// -------

TweenLite.defaultEase = Power0.easeNone;
TweenMax.set([internals.cupBodyShape,  internals.face, internals.eyesClosed, internals.cupTop], { transformOrigin: '50% 100%' });
TweenMax.set(internals.cupTop, { autoAlpha: 1, x: 317, y: 86, rotation: -10 });
TweenMax.set(internals.face, { x: 356, y: 262, rotation: -4 });
TweenMax.set(internals.eyesOpen, { autoAlpha: 0 });
TweenMax.set(internals.eyeClosedTop, { transformOrigin: '100% 100%' });
TweenMax.set(internals.eyeClosedBottom, { transformOrigin: '100% 0%' });
TweenMax.set(internals.mouthB, { autoAlpha: 0, transformOrigin: '-10% center' });
TweenMax.set(internals.drop1, { transformOrigin: '50% 0', x: 428, y: 258, scale: 0 });
TweenMax.set(internals.drop2, { transformOrigin: '50% 0', x: 342, y: 239, scale: 0 });
TweenMax.set(internals.drop3, { transformOrigin: '50% 0', x: 438, y: 230, scale: 0 });
TweenMax.set(internals.drop4, { transformOrigin: '50% 0', x: 383, y: 219, scale: 0 });
TweenMax.set(internals.shadow, { transformOrigin: 'center' });

// -------

const createVaporWave = (svg, wave) => {
  const height = 56;
  const amplitude = 4;
  const frequency = 4;
  const segments  = 8;
  const interval  = height / segments;

  for (let i = 0; i <= segments; i++) {

    const norm  = i / segments;
    const point = wave.points.appendItem(svg.createSVGPoint());

    point.x = amplitude / 2;
    point.y = i * interval;

    TweenMax.to(point, 0.5, { x: -point.x, repeat: -1, yoyo: true }).progress(norm * frequency);
  }
}

const getMorphTimeline = (shapeName) => new TimelineMax()
  .to(internals[shapeName],   1, { morphSVG: internals[shapeName + '10'] })
  .to(internals[shapeName], 0.6, { morphSVG: internals[shapeName + '16'] })
  .to(internals[shapeName], 0.4, { morphSVG: internals[shapeName + '20'] })
  .to(internals[shapeName], 0.3, { morphSVG: internals[shapeName + '23'] })
  .to(internals[shapeName], 0.7, { morphSVG: internals[shapeName] })

const getTimelineCupBodyMorph = () => getMorphTimeline('cupBodyShape');
const getTimelineCupShadowMorph = () => getMorphTimeline('cupShadowShape');
const getTimelineCupHandleMorph = () => getMorphTimeline('cupHandleShape');
const getTimelineFeetMorph = () => getMorphTimeline('footShape');

const getTimelineCupTopPosition = () => new TimelineMax()
  .to(internals.cupTop,   1, { x: 335, y: 90, rotation: 9 })
  .to(internals.cupTop, 0.6, { x: 320, y: 116, rotation: -9, scaleX: 1.06 })
  .to(internals.cupTop, 0.4, { x: 329, y: 39, rotation: 3, scaleX: 1 })
  .to(internals.cupTop, 0.3, { x: 334, y: 108, rotation: 7 })
  .to(internals.cupTop, 0.7, { x: 317, y: 86, rotation: -10 })

const getTimelineCoffeeMorph = () => new TimelineMax()
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape02 }, 0)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape04 }, 0.2)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape06 }, 0.4)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape08 }, 0.6)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape10 }, 0.8)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape12 }, 1)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape14 }, 1.2)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape16 }, 1.4)
  .to(internals.coffeeShape, 0.1, { morphSVG: internals.coffeeShape17 }, 1.6)
  .to(internals.coffeeShape, 0.1, { morphSVG: internals.coffeeShape18 }, 1.7)
  .to(internals.coffeeShape, 0.1, { morphSVG: internals.coffeeShape19 }, 1.8)
  .to(internals.coffeeShape, 0.1, { morphSVG: internals.coffeeShape20 }, 1.9)
  .to(internals.coffeeShape, 0.3, { morphSVG: internals.coffeeShape23 }, 2)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape25 }, 2.3)
  .to(internals.coffeeShape, 0.2, { morphSVG: internals.coffeeShape27 }, 2.5)
  .to(internals.coffeeShape, 0.3, { morphSVG: internals.coffeeShape }, 2.7)

const getTimelineCoffeeDrops = () => new TimelineMax()
  .to(internals.coffeeDrop1, 0.2, { y: -26, scaleY: 0.7 }, 0)
  .to(internals.coffeeDrop1, 0.2, { y: -38, scaleY: .6 }, 0.2)
  .to(internals.coffeeDrop1, 0.2, { y: -20, scaleY: 0.7 }, 0.4)
  .to(internals.coffeeDrop1, 0.2, { y: 20, scaleY: 0.7 }, 0.6)
  .to(internals.coffeeDrop2, 0.2, { x: 10, y: -40 }, 1.8)
  .to(internals.coffeeDrop2, 0.2, { x: 20, y: -62 }, 2)
  .to(internals.coffeeDrop2, 0.2, { x: 60, y: -92, scale: 1.4 }, 2.2)
  .to(internals.coffeeDrop2, 0.2, { x: 80, y: -76, scaleX: 1.4, scaleY: 1.6 }, 2.4)
  .to(internals.coffeeDrop2, 0.2, { x: 86, y: -32, scale: 1.4 }, 2.6)
  .to(internals.coffeeDrop2, 0.2, { x: 86, y: 0, scale: 1.4 }, 2.8)
  .to(internals.coffeeDrop3, 0.2, { x: 26, y: -62, scaleY: 1.2 }, 2.2)
  .to(internals.coffeeDrop3, 0.2, { x: 54, y: -92, scaleY: 1.2 }, 2.4)
  .to(internals.coffeeDrop3, 0.2, { x: 66, y: -62, scaleY: 1.2 }, 2.6)
  .to(internals.coffeeDrop3, 0.2, { x: 70, y: -22, scaleY: 1.2 }, 2.8)

const getTimelineFace = () => new TimelineMax()
  .to(internals.face, 1, { x: 356, y: 262, rotation: 4 })
  .set(internals.eyesClosed, { autoAlpha: 0 }, .5)
  .set(internals.eyesOpen, { autoAlpha: 1 }, .5)
  .to(internals.mouthA, .3, { scaleX: 0.4 }, .5)
  .set(internals.mouthA, { autoAlpha: 0 }, .8)
  .set(internals.mouthB, { autoAlpha: 1, scale: 0.7 }, .8)
  .to(internals.mouthB, .5, { scale: 1 }, .8)
  .set(internals.eyesClosed, { autoAlpha: 1 }, 1.2)
  .set(internals.eyesOpen, { autoAlpha: 0 }, 1.2)
  .to(internals.face, .6, { x: 356, y: 274, rotation: -4 }, 1)
  .to(internals.mouthB, .4, { scale: .8 }, 1.3)
  .to(internals.mouthB, .2, { scaleX: .7 }, 1.7)
  .to(internals.eyesClosed, .4, { scaleY: .8 }, 1.2)
  .to(internals.face, .4, { x: 358, y: 218, rotation: 0 }, 1.6)
  .set(internals.eyesClosed, { scaleY: 1 })
  .set(internals.mouthA, { autoAlpha: 1 })
  .set(internals.mouthB, { autoAlpha: 0 })
  .to(internals.face, .3, { x: 360, y: 264, rotation: 3 }, 2)
  .to(internals.mouthA, .2, { scaleX: 1 }, 2)
  .to(internals.face, .7, { x: 356, y: 262, rotation: -4 }, 2.3)
  .to(internals.eyeClosedTop, .1, { rotation: -32 }, 2.8)
  .to(internals.eyeClosedBottom, .1, { rotation: 32 }, 2.8)
  .to(internals.eyeClosedTop, .1, { rotation: 0 }, 2.9)
  .to(internals.eyeClosedBottom, .1, { rotation: 0 }, 2.9)

const getTimelineFaceDrops = () => new TimelineMax()
  .to(internals.drop1, 0.8, { x: 434, y: 282, scale: 1 }, 0.2)
  .to(internals.drop1, 0.6, { x: 433, y: 317, scale: 0 })
  .set(internals.drop1, { x: 428, y: 258, scale: 0 }, 3)
  .to(internals.drop2, 0.6, { x: 340, y: 262, scale: 0.9 }, 0.6)
  .to(internals.drop2, 0.4, { x: 337, y: 300, scale: 0 }, 1.2)
  .set(internals.drop2, { x: 342, y: 239, scale: 0 }, 3)
  .to(internals.drop3, 0.7, { x: 434, y: 233, scale: 1 }, 1)
  .to(internals.drop3, 0.4, { x: 438, y: 246, scale: 0 }, 1.7)
  .set(internals.drop3, { x: 438, y: 230, scale: 0 }, 3)
  .to(internals.drop4, 0.2, { x: 394, y: 200, scale: 0.5 }, 1.7)
  .to(internals.drop4, 0.2, { x: 394, y: 200, scale: 0.8 }, 1.9)
  .to(internals.drop4, 0.2, { x: 394, y: 240, scale: 1 }, 2.1)
  .to(internals.drop4, 0.7, { x: 384, y: 270, scale: 0 }, 2.3)

const getTimelineVaporPosition = () => new TimelineMax()
  .to(internals.vaporWrapper, 1.3, { y: 104 }, 0)
  .to(internals.vaporWrapper, 0.2, { y: 110 }, 1.3)
  .to(internals.vaporWrapper, 0.1, { y: 120 }, 1.5)
  .to(internals.vaporWrapper, 0.2, { y: 100 }, 1.6)
  .to(internals.vaporWrapper, 0.2, { y: 77 }, 1.8)
  .to(internals.vaporWrapper, 0.4, { y: 100 }, 2)
  .to(internals.vaporWrapper, 0.6, { y: 85 }, 2.4)

const getTimelineShadow = () => new TimelineMax()
  .to(internals.shadow, .4, { scaleX: 0.6 })
  .to(internals.shadow, .3, { scaleX: 1 })

// -------

createVaporWave(internals.svgRoot, internals.wave);

internals.tl = new TimelineMax({ repeat: -1 })
  .add(getTimelineCupBodyMorph(), 0)
  .add(getTimelineCupShadowMorph(), 0)
  .add(getTimelineCupHandleMorph(), 0)
  .add(getTimelineFeetMorph(), 0)
  .add(getTimelineCupTopPosition(), 0)
  .add(getTimelineCoffeeMorph(), 0)
  .add(getTimelineCoffeeDrops(), 0)
  .add(getTimelineFace(), 0)
  .add(getTimelineFaceDrops(), 0)
  .add(getTimelineVaporPosition(), 0)
  .add(getTimelineShadow(), 1.7)