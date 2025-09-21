document.querySelector(".next").addEventListener("click", function () {
    const steps = document.querySelectorAll(".step-wrapper li");
    const activeStep = document.querySelector(".step-wrapper li.active");
    const lastStep = steps[steps.length - 1];

    if (lastStep.classList.contains("completed")) {
        alert("completed");
        return;
    }

    if (activeStep) {
        activeStep.classList.add("completed");
        activeStep.classList.remove("active");

        const nextStep = activeStep.nextElementSibling;
        if (nextStep) {
            nextStep.classList.add("active");
        }
    }
});

document.querySelector(".previous").addEventListener("click", function () {
    const steps = document.querySelectorAll(".step-wrapper li");
    const activeStep = document.querySelector(".step-wrapper li.active");
    const firstStep = steps[0];
    const lastStep = steps[steps.length - 1];

    if (firstStep.classList.contains("active")) {
        alert("Already on first step");
        return;
    }

    if (activeStep) {
        activeStep.classList.remove("active", "completed");

        const prevStep = activeStep.previousElementSibling;
        if (prevStep) {
            prevStep.classList.add("active");
            prevStep.classList.remove("completed");
        }
    }

    if (lastStep.classList.contains("completed")) {
        lastStep.classList.remove("completed");
        lastStep.classList.add("active");
    }
});