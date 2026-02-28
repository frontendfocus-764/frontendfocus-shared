// Interactive star rating
const stars = document.querySelectorAll('.star');
stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        stars.forEach((s, i) => {
            s.style.color = i <= index ? '#ff006e' : '#00d4ff';
        });
    });

    star.addEventListener('mouseover', () => {
        stars.forEach((s, i) => {
            s.style.color = i <= index ? '#ff006e' : '#00d4ff';
        });
    });
});

// Button interactions
const buyBtn = document.querySelector('.btn-primary');
const learnBtn = document.querySelector('.btn-secondary');

buyBtn.addEventListener('click', () => {
    console.log('Added to cart: SonicPro X1');
    const originalText = buyBtn.textContent;
    buyBtn.textContent = '✓ Added to Cart';
    setTimeout(() => {
        buyBtn.textContent = originalText;
    }, 2000);
});

learnBtn.addEventListener('click', () => {
    console.log('Opening detailed specifications...');
});

// Parallax effect on mouse move
const cardWrapper = document.querySelector('.card-wrapper');
const card = document.querySelector('.product-card');

cardWrapper.addEventListener('mousemove', (e) => {
    const rect = cardWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

cardWrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0)';
});