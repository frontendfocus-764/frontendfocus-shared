var toggle = document.getElementById("toggle");
var bod = document.getElementById("bod");
var border = document.getElementById("border");
var container = document.getElementById("container");
var flag = 0;

function togglel() {
    toggle.style.boxShadow =
        "5px 5px 500px rgb(255, 255, 0) inset, 0.5px 0.5px 50px yellow";
    toggle.style.border = "1px solid rgb(255, 255, 255)";
    toggle.style.backgroundColor = "orange";
}

function toggled() {
    toggle.style.boxShadow =
        "10px 10px 15px rgba(0, 0, 0, 0.312), -10px -10px 10px rgba(30, 30, 30, 0.696), 40px -5px 1px rgb(255, 255, 255) inset,  -2px 5px 10px rgba(23, 23, 23, 0.986) inset";
    toggle.style.border = "1px solid rgba(28, 28, 28, 0)";
    toggle.style.backgroundColor = "rgb(23, 23, 23)";
}

function roll() {
    if (flag == 0) {
        toggle.style.animation = "roll 1.5s forwards";
        container.style.boxShadow =
            "10px 10px 10px rgb(242, 241, 241), -4px -7px 15px rgb(242, 241, 241), 2px -5px 10px rgb(255, 255, 255) inset, -10px -1px 5px yellow inset";
        border.style.backgroundColor = " rgb(255, 255, 255)";
        border.style.boxShadow =
            "2px 5px 10px rgb(236, 235, 235) inset, -2px 0px 2px rgb(254, 254, 1) inset";
        bod.style.backgroundColor = "rgb(253, 253, 253)";
        setTimeout(togglel, 250);
        flag = 1;
    } else {
        toggle.style.animation = "rollback 1.5s forwards";
        container.style.boxShadow =
            "10px 10px 10px rgba(16, 16, 16, 0.667), 0px -8px 10px rgba(32, 32, 32, 0.453), -5px -5px 15px rgb(17, 17, 17) inset, 15px 15px 50px rgb(26, 26, 26) inset";
        border.style.backgroundColor = "rgb(23, 23, 23)";
        border.style.boxShadow =
            "5px 5px 10px rgb(23, 23, 23) inset, -4px -10px 10px rgb(25, 25, 25) inset";
        bod.style.backgroundColor = "rgb(23, 20, 20)";
        setTimeout(toggled, 250);
        flag = 0;
    }
}