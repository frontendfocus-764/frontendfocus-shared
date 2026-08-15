const s=document.querySelector('select'),n=s.length,d=360/n;
let i=s.selectedIndex,r=-i*d,h=0;
const Δ=(a,b)=>((a-b+180)%360+360)%360-180,
    set=(k=i)=>{let t=r+k*d;h+=Δ(t,h);s.style.cssText+=`;--active:${i+1};--rotation:${r}deg;--hover-angle:${h}deg`};

s.onmouseover=e=>e.target.matches('option')&&set(e.target.index);
s.onmouseleave=()=>set();
s.onchange=()=>{let j=s.selectedIndex;r-=((j-i+n/2)%n+n)%n*d-n/2*d;i=j;set()};
set();

const select = document.querySelector('select.select-2');

        const controls = {
            size: 14,
            gap: 1,
            padding: 1,
            outlineWidth: 12,
            optionFontSize: 1,
        };

        const gui = new dat.GUI();

        gui.add(controls, 'size', 5, 25, 0.25)
            .name('Circle size')
            .onChange(value => {
                select.style.setProperty('--size', `${value}rem`);
            });

        gui.add(controls, 'gap', 0, 10, 0.25)
            .name('Menu gap')
            .onChange(value => {
                select.style.setProperty('--gap', `${value}rem`);
            });

        gui.add(controls, 'padding', 0, 4, 0.25)
            .name('Menu padding')
            .onChange(value => {
                select.style.setProperty('--padding', `${value}rem`);
            });

        gui.add(controls, 'outlineWidth', 6, 20, 0.25)
            .name('Outline width')
            .onChange(value => {
                select.style.setProperty('--outline-w', `${value}rem`);
            });

        gui.add(controls, 'optionFontSize', 0.5, 3, 0.1)
            .name('Option font size')
            .onChange(value => {
                select.style.setProperty('--option-fs', `${value}rem`);
            });
        gui.close();