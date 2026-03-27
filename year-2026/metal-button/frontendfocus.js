// script.js - Updated with sound alternative
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const metalButton = document.getElementById('metalButton');
    const animationSpeedSlider = document.getElementById('animationSpeed');
    const speedValue = document.getElementById('speedValue');
    const buttonSizeSlider = document.getElementById('buttonSize');
    const sizeValue = document.getElementById('sizeValue');
    const toggleAnimationBtn = document.getElementById('toggleAnimation');
    const toggleSoundBtn = document.getElementById('toggleSound');
    const sparkles = document.querySelectorAll('.sparkle');
    
    // Animation state
    let animationPaused = false;
    let soundEnabled = true;
    
    // Speed mapping for display
    const speedLabels = {
        1: 'Very Slow',
        5: 'Slow',
        10: 'Normal',
        15: 'Fast',
        20: 'Very Fast'
    };
    
    // Create audio context for sound effects (works on CodePen)
    let audioContext;
    let clickSoundBuffer;
    
    // Initialize audio context on user interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            createClickSound();
        }
    }
    
    // Create a synthetic click sound
    function createClickSound() {
        if (!audioContext) return;
        
        const duration = 0.1;
        const sampleRate = audioContext.sampleRate;
        const frameCount = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Create a simple "click" sound
        for (let i = 0; i < frameCount; i++) {
            const t = i / sampleRate;
            // Short click sound
            data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-30 * t);
        }
        
        clickSoundBuffer = buffer;
    }
    
    // Play synthetic click sound
    function playClickSound() {
        if (!soundEnabled || !audioContext || !clickSoundBuffer) return;
        
        try {
            const source = audioContext.createBufferSource();
            source.buffer = clickSoundBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        } catch (e) {
            console.log("Sound playback error:", e);
        }
    }
    
    // Update animation speed
    animationSpeedSlider.addEventListener('input', function() {
        const speed = this.value;
        const animationDuration = 24 - speed;
        
        metalButton.style.animationDuration = `${animationDuration}s, 4s`;
        
        const style = document.createElement('style');
        style.id = 'dynamicStyles';
        if (document.getElementById('dynamicStyles')) {
            document.getElementById('dynamicStyles').remove();
        }
        style.textContent = `
            .metal-button::before {
                animation-duration: ${animationDuration * 0.66}s;
            }
        `;
        document.head.appendChild(style);
        
        let label = 'Custom';
        if (speedLabels[speed]) {
            label = speedLabels[speed];
        } else if (speed < 5) {
            label = 'Slow';
        } else if (speed > 15) {
            label = 'Fast';
        }
        speedValue.textContent = label;
    });
    
    // Update button size
    buttonSizeSlider.addEventListener('input', function() {
        const size = this.value;
        metalButton.style.setProperty('--button_size', `${size}px`);
        sizeValue.textContent = `${size}px`;
    });
    
    // Toggle animation
    toggleAnimationBtn.addEventListener('click', function() {
        animationPaused = !animationPaused;
        
        if (animationPaused) {
            metalButton.style.animationPlayState = 'paused';
            this.textContent = 'Resume Animation';
            
            const style = document.createElement('style');
            style.id = 'pauseStyles';
            if (document.getElementById('pauseStyles')) {
                document.getElementById('pauseStyles').remove();
            }
            style.textContent = `
                .metal-button::before {
                    animation-play-state: paused;
                }
            `;
            document.head.appendChild(style);
        } else {
            metalButton.style.animationPlayState = 'running';
            this.textContent = 'Pause Animation';
            
            if (document.getElementById('pauseStyles')) {
                document.getElementById('pauseStyles').remove();
            }
        }
    });
    
    // Toggle sound
    toggleSoundBtn.addEventListener('click', function() {
        soundEnabled = !soundEnabled;
        this.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
        
        // Initialize audio if enabling sound
        if (soundEnabled) {
            initAudio();
        }
    });
    
    // Button click handler
    metalButton.addEventListener('click', function() {
        // Play sound if enabled
        if (soundEnabled) {
            initAudio();
            playClickSound();
        }
        
        // Trigger sparkle animation
        triggerSparkles();
        
        // Add visual click effect
        this.style.setProperty('--glow_opacity', '0.9');
        
        // Add ripple effect
        const buttonShadow = this.querySelector('.button-shadow');
        buttonShadow.style.animation = 'clickEffect 0.5s ease-out';
        
        // Simulate vibration if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        setTimeout(() => {
            this.style.setProperty('--glow_opacity', '0');
            if (buttonShadow) {
                buttonShadow.style.animation = '';
            }
        }, 300);
    });
    
    // Keyboard support
    metalButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    });
    
    // Hover effects
    let hoverTimeout;
    metalButton.addEventListener('mouseenter', function() {
        clearTimeout(hoverTimeout);
        this.style.setProperty('--glow_opacity', '0.6');
    });
    
    metalButton.addEventListener('mouseleave', function() {
        hoverTimeout = setTimeout(() => {
            this.style.setProperty('--glow_opacity', '0');
        }, 100);
    });
    
    // Initialize audio on first interaction
    metalButton.addEventListener('mousedown', initAudio);
    metalButton.addEventListener('touchstart', initAudio);
    toggleSoundBtn.addEventListener('click', initAudio);
    
    // Sparkle animation function
    function triggerSparkles() {
        sparkles.forEach((sparkle, index) => {
            sparkle.style.animation = 'none';
            sparkle.offsetHeight;
            sparkle.style.animation = `sparkle 0.8s ease ${index * 0.1}s forwards`;
        });
        
        setTimeout(() => {
            sparkles.forEach(sparkle => {
                sparkle.style.animation = 'none';
            });
        }, 1500);
    }
    
    // Initialize with default values
    animationSpeedSlider.dispatchEvent(new Event('input'));
    buttonSizeSlider.dispatchEvent(new Event('input'));
    
    // Add ambient pulse effect
    setInterval(() => {
        if (!animationPaused) {
            const container = document.querySelector('.button-container');
            container.style.filter = `drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5)) 
                                     drop-shadow(0 0 ${15 + Math.sin(Date.now() / 1000) * 5}px rgba(80, 100, 200, 0.3))`;
        }
    }, 100);
    
    console.log('Advanced Metal Button loaded successfully!');
});