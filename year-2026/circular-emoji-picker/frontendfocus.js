const s=document.querySelector('select'),n=s.length,d=360/n;
let i=s.selectedIndex,o=s.selectedOptions[0].getAttribute('data-emoji'),r=-i*d,h=0;

const Δ=(a,b)=>((a-b+180)%360+360)%360-180,
    set=(k=i)=>{
        let t=r+k*d;
        h+=Δ(t,h);
        s.style.cssText+=`;--active:"${o}";--rotation:${r}deg;--hover-angle:${h}deg`;
    };

s.onmouseover=e=>e.target.matches('option')&&set(e.target.index);
s.onmouseleave=()=>set();

s.onchange=()=>{
    let j=s.selectedIndex;
    r-=((j-i+n/2)%n+n)%n*d-n/2*d;
    i=j;
    o=s.selectedOptions[0].getAttribute('data-emoji');
    set();
};

set();