const links = document.querySelectorAll("nav li");
const allATags = document.querySelectorAll("nav li a");
const allIconTags = document.querySelectorAll("nav li a i");
const light = document.querySelector("nav .spotLight");

links.forEach((link, index) => {
  link.addEventListener("click", (e) => {
    const aTag = link.lastElementChild;
    if (aTag.classList.contains("active")) {
      aTag.classList.remove("active");
    } else {
      allATags.forEach((a) => a.classList.remove("active"));
      allIconTags.forEach((i) => (i.style.transform = "scale(1)"));
      aTag.classList.add("active");
    }
    const theIndex = link.dataset.val;
    light.style.left = `${15 + theIndex * 75}px`;
    const icon = link.childNodes[1].childNodes[0];
    icon.style.transform = "scale(1.2)";
  });
});
