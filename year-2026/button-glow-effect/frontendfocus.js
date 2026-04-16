(function setGlowEffectRx() {
  const glowEffects = document.querySelectorAll('.glow');
  
  glowEffects.forEach(element => {
    const rx = getComputedStyle(element).borderRadius;
    const glowRects = element.querySelectorAll('rect');
    
    glowRects.forEach(rect => {
      rect.setAttribute('rx', rx);
    })
  })
})();