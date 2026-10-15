const bulb = document.getElementById('bulb');

    function bulb_on() {
      bulb.src = './img/bulb-on.png';
      bulb.classList.add('on'); 
    }

    function bulb_off() {
      bulb.src = './img/bulb-off.png';
      bulb.classList.remove('on'); 
    }
