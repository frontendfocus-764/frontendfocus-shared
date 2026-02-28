const emailField = document.getElementById('email');
const passField = document.getElementById('pass-field');
const toggleEye = document.getElementById('toggle-eye');
const carGlass = document.getElementById('car-glass');
const wheels = document.querySelectorAll('.wheel');
const carWrapper = document.getElementById('car-wrapper');
const loginBtn = document.getElementById('login-btn');
const city = document.getElementById('city');

let driveTimer;

function startDriving() {
    wheels.forEach(wheel => wheel.classList.add('spinning'));
    city.style.animationPlayState = 'running';

    clearTimeout(driveTimer);
    driveTimer = setTimeout(() => {
        wheels.forEach(wheel => wheel.classList.remove('spinning'));
        city.style.animationPlayState = 'paused';
    }, 300);
}

emailField.addEventListener('input', startDriving);
passField.addEventListener('input', startDriving);


emailField.addEventListener('focus', () => {
    carGlass.classList.add('glass-open');
});

passField.addEventListener('focus', () => {
    if (passField.type === "password") {
        carGlass.classList.remove('glass-open');
    }
});


toggleEye.onclick = () => {
    if (passField.type === "password") {
        passField.type = "text";
        toggleEye.classList.remove('fa-eye');
        toggleEye.classList.add('fa-eye-slash');
        
        carGlass.classList.add('glass-open'); 
    } else {
        passField.type = "password";
        toggleEye.classList.remove('fa-eye-slash');
        toggleEye.classList.add('fa-eye');
        
        carGlass.classList.remove('glass-open'); 
    }
}

loginBtn.onclick = () => {
    const email = emailField.value;
    const pass = passField.value;

    if (email === "admin@company.com" && pass === "1234") {
        window.location.href = "admin.html";
    } else if (email === "user@company.com" && pass === "1234") {
        window.location.href = "user.html";
    } else {
        alert("Invalid email or password!");
    }
}

function switchTab(mode) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(t => t.classList.remove('active'));

    if (mode === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('form-title').innerText = "Welcome Back";
        loginBtn.innerText = "LOGIN";
        carWrapper.classList.remove('car-out');
        carWrapper.classList.add('car-in');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('form-title').innerText = "Create Account";
        loginBtn.innerText = "REGISTER";
        carWrapper.classList.remove('car-in');
        carWrapper.classList.add('car-out');
    }
}