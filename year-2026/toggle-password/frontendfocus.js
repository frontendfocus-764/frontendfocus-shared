var state = false;
function toggle() {
    if (state) {
        document.getElementById("password").setAttribute("type", "password");
        document.getElementById("eye-wrapper").style.boxShadow = '0 0 0 0px white';
        document.getElementById("lock").style.fill = 'white';
        document.getElementById("open").style.display = 'none';
        document.getElementById("close").style.display = 'block';
        state = false;
    }
    else {
        document.getElementById("password").setAttribute("type", "text");
        document.getElementById("eye-wrapper").style.boxShadow = '0 0 0 250px white';
        document.getElementById("lock").style.fill = '#121726';
        document.getElementById("open").style.display = 'block';
        document.getElementById("close").style.display = 'none';
        state = true;
    }
}