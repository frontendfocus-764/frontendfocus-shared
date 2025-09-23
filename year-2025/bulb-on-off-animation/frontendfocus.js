const bulb = document.getElementById('bulb');

    function bulb_on() {
      bulb.src = 'https://i.postimg.cc/6QyTynzr/bulb-on.png';
      bulb.classList.add('on'); 
    }

    function bulb_off() {
      bulb.src = 'https://i.postimg.cc/KjK1wL3c/bulb-off.png';
      bulb.classList.remove('on'); 
    }