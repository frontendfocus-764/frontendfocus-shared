const sidebar = document.querySelector('.sidebar');
const sidebarTheme = document.querySelectorAll('.sidebar-theme');
const selector = document.querySelector('.selector');

sidebarTheme.forEach(theme => {
  theme.addEventListener('click', () => {
    selector.setAttribute('class', `selector ${theme.getAttribute('data-theme')}`);
    sidebar.setAttribute('data-theme', theme.getAttribute('data-theme'));
  });
});