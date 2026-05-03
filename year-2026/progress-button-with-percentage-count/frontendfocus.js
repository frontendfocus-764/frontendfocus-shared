const buttonArea = document.querySelector('.btn-area')
const progressArea = document.querySelector('.progress-area')
const completeArea = document.querySelector('.complete-area')
const mainBtn = document.querySelector('.main-btn rect')
const frameBtn = document.querySelector('.frame-btn rect')
const loadingIcon = document.querySelector('.progress-area .area-left svg')
const loadingProgress = document.querySelector('.progress-area .area-left span')
const loadingBtn = document.querySelector('.progress-area .area-right')
const pauseBtn = document.querySelector('.progress-area .area-right .btn-pause')
const playBtn = document.querySelector('.progress-area .area-right .btn-play')
const tick1 = document.querySelector('.complete-area .tick-1')
const tick2 = document.querySelector('.complete-area .tick-2')
const doneText = document.querySelector('.complete-area span')

let loadingTime = 5500
let progress = {
  value: '0 %'
}
let loadingStatus = true

document.body.onload = function() {
  anime({
    targets: loadingIcon,
    opacity: [0, 1],
    duration: 750,
    easing: 'easeOutQuad'
  })

  let aniLoadingIcon = anime({
    targets: loadingIcon,
    rotateZ: 360,
    duration: 2000,
    loop: true,
    easing: 'linear'
  })

  anime({
    targets: loadingProgress,
    translateY: ['15px', '0'],
    opacity: [0, 1],
    delay: 250,
    duration: 750,
    easing: 'easeOutQuart'
  })

  anime({
    targets: loadingBtn,
    translateY: ['15px', '0'],
    opacity: [0, 1],
    delay: 350,
    duration: 1000,
    easing: 'easeOutQuart'
  })

  let aniProgress = anime({
    targets: progress,
    value: '100 %',
    duration: loadingTime,
    easing: 'cubicBezier(.5, .05, .3, .9)',
    delay: 1000,
    round: 1,
    update: function() {
      loadingProgress.innerHTML = JSON.stringify(progress.value).replace(/^"(.*)"$/, '$1')
    }
  })

  let aniFrameBtn = anime({
    targets: frameBtn,
    strokeDashoffset: [525, 0],
    duration: loadingTime,
    easing: 'cubicBezier(.5, .05, .3, .9)',
    delay: 1000,
    complete: function() {
      completeLoading()
    }
  })

  loadingBtn.addEventListener('click', () => {
    if (loadingStatus) {
      aniLoadingIcon.pause()
      aniProgress.pause()
      aniFrameBtn.pause()
      pauseBtn.style.transform = 'translateY(-40px)'
      playBtn.style.transform = 'translateY(0px)'
      loadingStatus = false
    } else {
      aniLoadingIcon.play()
      aniProgress.play()
      aniFrameBtn.play()
      pauseBtn.style.transform = 'translateY(0px)'
      playBtn.style.transform = 'translateY(40px)'
      loadingStatus = true
    }
    
  })
}

function completeLoading() {
  anime({
    targets: loadingIcon,
    translateX: [0, -20],
    opacity: [1, 0],
    duration: 500,
    delay: 0,
    easing: 'easeInQuad'
  })

  anime({
    targets: loadingProgress,
    translateY: [0, -20],
    opacity: [1, 0],
    duration: 500,
    delay: 250,
    easing: 'easeInQuad'
  })

  anime({
    targets: loadingBtn,
    translateY: [0, -20],
    opacity: [1, 0],
    duration: 500,
    delay: 500,
    easing: 'easeInQuad',
    complete: function() {
      progressArea.style.display = 'none'
      completeArea.style.display = 'flex'
    }
  })

  anime({
    targets: frameBtn,
    fill: ['#f5f9fe', '#1578ff'],
    duration: 500,
    delay: 750,
    easing: 'easeInQuad'
  })

  anime({
    targets: tick1,
    strokeDashoffset: [52, 0],
    opacity: [0, 1],
    duration: 500,
    easing: 'cubicBezier(.5, .05, .3, .9)',
    delay: 1000
  })

  anime({
    targets: tick2,
    strokeDashoffset: [52, 0],
    opacity: [0, 1],
    duration: 500,
    easing: 'cubicBezier(.5, .05, .3, .9)',
    delay: 1250
  })

  anime({
    targets: doneText,
    opacity: [0, 1],
    translateY: ['25', '0'],
    duration: 1000,
    easing: 'easeOutQuad',
    delay: 1250
  })
}