document.addEventListener('DOMContentLoaded', () => {

    const spinner = document.querySelector('.spinner');

    spinner.addEventListener('click', () => {
        spinner.classList.toggle('fast');
    });

});