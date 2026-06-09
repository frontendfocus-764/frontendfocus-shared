const rightPupil = document.getElementById('rightPupil'),
rightPupilPositionInfo = rightPupil.getBoundingClientRect(),
leftPupil = document.getElementById('leftPupil'),
leftPupilPositionInfo = leftPupil.getBoundingClientRect();

const Eye = class Eye {
  constructor(pupilDirection, pupilPositionX, pupilPositionY) {
    this.pupilDirection = pupilDirection;
    this.pupilPositionX = pupilPositionX;
    this.pupilPositionY = pupilPositionY;
  }

  findAngle(cursorY, cursorX) {
    let angleDeg = Math.atan2(cursorY - this.pupilPositionY, cursorX - this.pupilPositionX) * 180 / Math.PI;
    angleDeg = angleDeg >= 360 ? angleDeg -= 360 : angleDeg < 0 ? angleDeg += 360 : angleDeg -= 360;
    this.rotatePupil(angleDeg);
  }

  rotatePupil(angleDeg) {
    this.pupilDirection.style.transform = `rotate(${angleDeg}deg)`;
  }};


const rightEye = new Eye(rightPupil, rightPupilPositionInfo.x, rightPupilPositionInfo.y);
const leftEye = new Eye(leftPupil, leftPupilPositionInfo.x, leftPupilPositionInfo.y);

const getCursorCoordinates = e => {
  let cursorY = e.clientY,
  cursorX = e.clientX;
  rightEye.findAngle(cursorY, cursorX);
  leftEye.findAngle(cursorY, cursorX);
};

document.addEventListener('mousemove', getCursorCoordinates, false);