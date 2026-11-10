const wishlistButtons = document.querySelectorAll(
    '.product-actions button:nth-child(2)'
);

wishlistButtons.forEach(button => {
    button.addEventListener('click', () => {
        const icon = button.querySelector('i');

        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');

        button.classList.toggle('active');
    });
});