document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    const card1 = document.getElementById('hero-card-1');
    const card2 = document.getElementById('hero-card-2');
    const card3 = document.getElementById('hero-card-3');

    if (!card1 || !card2 || !card3) return;

    const threshold = 500;

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / threshold, 1);

        const card1X = -280 * (1 - progress);
        const card1Rot = -12 * (1 - progress);
        const card1Opacity = 1 - progress * 1;
        card1.style.transform = `translateX(${card1X}px) translateY(0px) rotateZ(${card1Rot}deg) scale(${1 - progress * 0.05})`;
        card1.style.opacity = card1Opacity;

        card2.style.transform = `translateX(0px) translateY(0px) rotateZ(0deg) scale(${1.05 + progress * 0.05})`;
        card2.style.opacity = 1;
        card2.style.zIndex = 3;

        const card3X = 280 * (1 - progress);
        const card3Rot = 12 * (1 - progress);
        const card3Opacity = 1 - progress * 1;
        card3.style.transform = `translateX(${card3X}px) translateY(0px) rotateZ(${card3Rot}deg) scale(${1 - progress * 0.05})`;
        card3.style.opacity = card3Opacity;
    };

    window.addEventListener('scroll', handleScroll, {
        passive: true
    });
    handleScroll();
});