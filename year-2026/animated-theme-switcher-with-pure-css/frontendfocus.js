const {body} = document;
const comp = document.getElementById('switch');
const handleClick = () => {
    if (body.classList.contains('checked')) {
        body.classList.add('unchecked');
        body.classList.remove('checked');
        return;
    } else if(!body.classList.contains('checked')){
        body.classList.add('checked');
        body.classList.remove('unchecked');
    }
};
comp.addEventListener('pointerdown', handleClick);

comp.addEventListener('pointerdown', () => clearInterval(interval));