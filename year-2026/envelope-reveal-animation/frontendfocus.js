const openButton = document.querySelector('#openButton');
const letter = document.querySelector('#letter');
const headline = document.querySelector('#headline');
const intro = document.querySelector('#intro');
const truceButton = document.querySelector('#truceButton');
const response = document.querySelector('#response');

openButton.addEventListener('click', () => {
  letter.classList.add('visible');
  letter.setAttribute('aria-hidden', 'false');
  headline.textContent = 'A note, just for you.';
  intro.textContent = 'I wanted to say this properly.';
  openButton.textContent = 'The note is open ♡';
  openButton.disabled = true;
  openButton.style.opacity = '.65';
  letter.scrollIntoView({behavior:'smooth', block:'nearest'});
});

truceButton.addEventListener('click', () => {
  response.textContent = 'Whatever you need, I’ll respect it. ♡';
  truceButton.textContent = 'Thannk youu sooo much, Fatiiii🥰 ♡';
  truceButton.disabled = true;
  for(let i=0;i<18;i++){
    const heart=document.createElement('span');
    heart.textContent=['♡','✦','✿'][i%3];
    heart.style.cssText=`position:fixed;left:${Math.random()*100}vw;bottom:-25px;z-index:99;color:#d69ab4;font-size:${14+Math.random()*13}px;pointer-events:none`;
    document.body.appendChild(heart);
    heart.animate([{transform:'translateY(0) rotate(0)',opacity:1},{transform:`translateY(-${65+Math.random()*40}vh) rotate(${Math.random()*180}deg)`,opacity:0}],{duration:2200+Math.random()*1300,easing:'ease-out'});
    setTimeout(()=>heart.remove(),3800);
  }
});