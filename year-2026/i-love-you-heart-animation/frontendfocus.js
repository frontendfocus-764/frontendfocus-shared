const ui = document.getElementById("ui");
const totalItems = 100;
for (let i = 1; i <= totalItems; i++) {
  const love = document.createElement("div");
  love.className = "love";
  love.style.setProperty("--i", i);
  love.innerHTML = `
  <div class='love-horizontal'>
    <div class='love-vertical'>
      <div class='love-word'>
      I love you 
    </div>
      </div>
  </div>
  `;
  ui.appendChild(love);
}
