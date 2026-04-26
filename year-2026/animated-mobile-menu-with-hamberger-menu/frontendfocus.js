let burger = document.getElementById('navTrigger'),
    nav    = document.getElementById('navMenu');

burger.addEventListener('click', function(e){
  this.classList.toggle('active');
  nav.classList.toggle('active');
});