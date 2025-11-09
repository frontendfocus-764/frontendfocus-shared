let tl = gsap.timeline({ease:Sine.in});
const button = document.querySelector('#button')
  tl.to('#text0',{translateY:'170%',duration:.5,onComplete:()=>{
  document.querySelector('#text0').innerHTML="THANKS FOR BUYING"
}})
.to('#cart',{translateX:'1.129%',duration:1.2})
.to('#tomato',{y:'0.28%',duration:1})
.to('#banana',{translateY:'0.25%',duration:.8})
.to('#paper',{translateY:'0.25%',duration:.8})
.to('#cart',{translateX:'1.699%',duration:.8,onStart:()=>{
  gsap.to('#tomato',{translateX:'1.759%',duration:1})
gsap.to('#banana',{translateX:'2.0999%',duration:1})
gsap.to('#paper',{translateX:'2.599%',duration:1,onStart:()=>{
  gsap.to('#text0',{translateX:'-20%'})
}})
}})
.to('#text0',{translateY:'0%',duration:.5})
.to('#text0',{translateY:'170%',duration:1.,delay:.5,onComplete:()=>{
  document.querySelector('#text0').innerHTML="ADD TO CART"
    gsap.to('#text0',{translateX:'0%',duration:.1})

     gsap.set('#cart',{translateX:'0%'})
       gsap.to('#banana',{translateY:'0%',duration:0.1})
       gsap.to('#tomato',{translateY:'0%',duration:0.1})
       gsap.to('#paper',{translateY:'0%',duration:0.1})
    gsap.to('#banana',{translateX:'1.22%',delay:0.1})
       gsap.to('#tomato',{translateX:'1.08%',delay:0.1})
       gsap.to('#paper',{translateX:'1.61%',delay:0.1})

}})
  .to('#text0',{translateY:'0%',duration:.5,delay:.2,onComplete:()=>{

  }})
   .pause()
  

button.addEventListener('click',()=>{
   tl.restart()
   

})