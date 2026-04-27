const inputs = document.querySelectorAll('.otp-input input');
const timerDisplay = document.getElementById('timer');
const resendButton = document.getElementById('resendButton');
let timeLeft = 180; // 3 minutes in seconds
let timerId;

function startTimer() {
    timerId = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerDisplay.textContent = "Code expired";
            resendButton.disabled = false;
            inputs.forEach(input => input.disabled = true);
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timeLeft--;
        }
    }, 1000);
}

function resendOTP() {
    // Here you would typically call your backend to resend the OTP
    alert("New OTP sent!");
    timeLeft = 180;
    inputs.forEach(input => {
        input.value = '';
        input.disabled = false;
    });
    resendButton.disabled = true;
    inputs[0].focus();
    clearInterval(timerId);
    startTimer();
}

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.slice(0, 1);
        }
        if (e.target.value.length === 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value) {
            if (index > 0) {
                inputs[index - 1].focus();
            }
        }
        if (e.key === 'e') {
            e.preventDefault();
        }
    });
});

function verifyOTP() {
    const otp = Array.from(inputs).map(input => input.value).join('');
    if (otp.length === 6) {
        if (timeLeft > 0) {
            alert(`Verifying OTP: ${otp}`);
            // Here you would typically send the OTP to your server for verification
        } else {
            alert('OTP has expired. Please request a new one.');
        }
    } else {
        alert('Please enter a 6-digit OTP');
    }
}

startTimer();