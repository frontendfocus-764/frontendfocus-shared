function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

class RadioButtonEffect {
    constructor(radioBtnGroups) {
        this.previousRadioBtn = null;

        radioBtnGroups.forEach((group) => {
            const radioBtn = group.querySelector("input[type='radio']");

            radioBtn.addEventListener("change", () => {
                const nodes = this.getNodes(radioBtn);

                if (this.previousRadioBtn && this.previousRadioBtn !== radioBtn) {
                    this.changeEffect(this.getNodes(this.previousRadioBtn), false);
                }

                this.changeEffect(nodes, true);
                this.previousRadioBtn = radioBtn;
            });
        });
    }

    getNodes(radioBtn) {
        const container = radioBtn.closest(".radio-btn-group");

        return [
            shuffleArray(container.querySelectorAll(".blue rect")),
            shuffleArray(container.querySelectorAll(".pink rect"))
        ];
    }

    changeEffect(nodes, isChecked) {
        gsap.to(nodes[0], {
            duration: 0.8,
            ease: "elastic.out(1, 0.3)",
            xPercent: isChecked ? "100" : "-100",
            stagger: 0.01,
            overwrite: true,
            delay: 0.13
        });

        gsap.to(nodes[1], {
            duration: 0.8,
            ease: "elastic.out(1, 0.3)",
            xPercent: isChecked ? "100" : "-100",
            stagger: 0.01,
            overwrite: true
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const radioBtnGroups = document.querySelectorAll(".radio-btn-group");
    new RadioButtonEffect(radioBtnGroups);
});