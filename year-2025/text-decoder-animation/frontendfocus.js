document.addEventListener('DOMContentLoaded', () => {
        const textElement = document.getElementById('thankYouText');
        const originalText = "Thank You";
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_-+=[]{}|;:,.<>?';

        originalText.split('').forEach(char => {
            const span = document.createElement('span');
            span.innerHTML = char === ' ' ? '&nbsp;' : char;
            textElement.appendChild(span);
        });

        const letters = Array.from(textElement.children);

        function createDecoderAnimation() {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.delayedCall(1, () => tl.restart());
                }
            });

            letters.forEach((letter, i) => {
                const originalChar = letter.innerHTML;
                if (originalChar === '&nbsp;') return;

                let proxy = { charIndex: 0 };
                
                tl.to(proxy, {
                    charIndex: chars.length - 1,
                    duration: 1.5,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        const randomIndex = Math.floor(Math.random() * chars.length);
                        letter.textContent = chars[randomIndex];
                    },
                    onComplete: () => {
                        letter.textContent = originalChar;
                    }
                }, i * 0.1);
            });
            
            tl.to({}, { duration: 2 });
        }
        
        createDecoderAnimation();
    });