const bubble = document.getElementById('bubble');
const buttons = document.querySelectorAll('.triggers button');
const NAMES = { color: 'Hair', outfit: 'Outfit', eyes: 'Eyes' };
const cap = s => s[0].toUpperCase() + s.slice(1);

if (!window.Clotile) {
    bubble.textContent = 'Clotile could not load from wuppet-clotile.pages.dev';
    bubble.classList.add('show');
} else {
    const clo = Clotile.mount(document.getElementById('stage-clotile'), {
        onSay(text) {
            if (text) { bubble.textContent = text; bubble.classList.add('show'); }
            else bubble.classList.remove('show');
        },
        onChange(state) {
            buttons.forEach(b => {
                const n = b.dataset.act;
                if (n in NAMES) b.textContent = `${NAMES[n]}: ${cap(state[n])}`;
                else b.classList.toggle('on', typeof state[n] === 'boolean' ? state[n] : state.active === n);
            });
        },
    });
    buttons.forEach(b => b.addEventListener('click', () => clo.trigger(b.dataset.act)));
    window.clo = clo;
}