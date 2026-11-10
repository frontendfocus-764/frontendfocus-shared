const ACTIVE = 'tab-active';

const $tabs = $('.tab');

$tabs.on('click', e => {
  $tabs.removeClass(ACTIVE);
  $(e.currentTarget).addClass(ACTIVE);
});