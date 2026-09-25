document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll(".accordion-header");

  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const openHeader = document.querySelector(".accordion-header.active");
      const content = header.nextElementSibling;

      if (openHeader && openHeader !== header) {
        openHeader.classList.remove("active");
        openHeader.nextElementSibling.style.maxHeight = null;
      }

      const isActive = header.classList.contains("active");
      header.classList.toggle("active", !isActive);
      content.style.maxHeight = !isActive ? content.scrollHeight + "px" : null;
    });
  });
});
