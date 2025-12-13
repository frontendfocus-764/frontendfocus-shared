// Password field - rules validation & toggle (Pure JS)

// Select elements
const passwordInput = document.querySelector('input[type="password"]');
const toggleBtn = document.querySelector('.togglePass');
const rulesList = document.querySelectorAll('.field__rules li');

// Password rules
const rules = {
    "one lowercase character": /[a-z]/,
    "one uppercase character": /[A-Z]/,
    "one number": /[0-9]/,
    "one special character": /[^a-z0-9]/i,
    "9 characters minimum": /.{9,}/,
};

// Password input event
passwordInput.addEventListener('input', function () {
    const value = this.value;

    // Toggle hasValue class (for floating label)
    this.classList.toggle('hasValue', value.length > 0);

    // Validate rules
    rulesList.forEach(item => {
        const ruleName = item.innerText.toLowerCase();
        if (rules[ruleName]) {
            const isValid = rules[ruleName].test(value);
            item.classList.toggle('pass', isValid);
        }
    });
});

// Show / Hide password
toggleBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const isActive = this.classList.toggle('active');
    passwordInput.type = isActive ? 'text' : 'password';

    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');

});