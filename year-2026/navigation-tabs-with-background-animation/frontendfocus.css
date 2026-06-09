* { box-sizing: border-box; }

html,
body {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  
  background-repeat: no-repeat;
  background-size: cover;
}

.cover-back {
  content: '';

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  opacity: 1;

  transition: all 1s cubic-bezier(0.4, 0, 1, 1);
}

.cover-back-body { background-image: linear-gradient(#7da4ff, #4161c8); }

.cover-back-tabs { background-color: #7E82EC; }

.tabs {
  position: relative;
  z-index: 1;

  display: flex;
  justify-content: center;

  width: 800px;
  overflow: hidden;
  
  border-radius: 293px;
  box-shadow: 0 20px 35px rgba(0, 0, 0, .30);
  transition: all .4s cubic-bezier(0.65, 0.05, 0.36, 1);
}

.tabs-container {
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 800px;
  height: 150px;
}

.tab-item {
  width: 100px;
  height: 100px;
  margin: 0 17.5px;
  
  color: #E9E9E9;
  opacity: 0;
  transform: scale(0);

  font-size: 50px;
  text-align: center;
  line-height: 100px;

  transition: all .9s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.tab-item:nth-child(1){ transition-delay: .3s; }

.tab-item:nth-child(2){ transition-delay: .5s; }

.tab-item:nth-child(4){ transition-delay: .7s; }

.tab-item:nth-child(5){ transition-delay: .9s; }

.tab-item{ cursor: pointer; }

.tab-item--middle {
  opacity: 1;
  transform: scale(1);
  border-radius: 50%;
  color: #7074E8;
  background-color: #A2B2FF;
}

/* Animations */

@keyframes show-tab-items {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes hide-tab-items {
  to {
    opacity: 0;
    transform: scale(0);
  }
}

@keyframes add-background {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes remove-background {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Javascript part */

.js-tabs-init {
  width: 150px;
  border-radius: 50%;
}

.js-cover-back-animate {
  opacity: 0;
  transition: all 5s;
  animation: add-background linear 2s forwards;
}

.js-tab-item-show {
  opacity: 1;
  transform: scale(1);
};

.js-tab-item-active { position: relative; }

.js-tab-item-active:after {
  content: '';

  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 10px;
  height: 10px;
  border-radius: 50%;

  border: 3px solid #ff5252;
  background-color: white;
  opacity: .6;
}