console.log("Visernic Weather System Online ❄️");

// 1. DATE LOGIC (Automatically detects current date)
function updateDate() {
  const dateElement = document.getElementById('dateDisplay');
  const now = new Date();
  
  // Options to format like: "Saturday, 12 Dec 2025"
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  dateElement.innerText = now.toLocaleDateString('en-US', options);
}

// 2. SNOWFALL ANIMATION LOGIC
function createSnowflake() {
  const snowContainer = document.getElementById('snowContainer');
  const snowflake = document.createElement('div');
  snowflake.classList.add('snowflake');
  
  // Random Position & Size
  snowflake.style.left = Math.random() * 100 + '%';
  snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'; // 2s to 5s
  snowflake.style.opacity = Math.random();
  snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
  
  snowflake.innerText = '❄';
  
  snowContainer.appendChild(snowflake);
  
  // Remove snowflake after animation ends to keep DOM clean
  setTimeout(() => {
    snowflake.remove();
  }, 5000);
}

// Init
updateDate();
setInterval(createSnowflake, 100); // Create snow every 100ms