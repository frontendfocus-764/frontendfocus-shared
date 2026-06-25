const buttons = document.querySelectorAll('button');
let selectedButton = document.querySelector('.selected');

const setAnchorOnSelected = () => {
  if (selectedButton) {
    selectedButton.style.anchorName = '--selected';
  }
};

setAnchorOnSelected();

// button click handlers
buttons.forEach(button => {
  button.addEventListener('click', () => {
    if (selectedButton) {
      selectedButton.classList.remove('selected');
      selectedButton.style.anchorName = '';
    }
    selectedButton = button;
    selectedButton.classList.add('selected');
    setAnchorOnSelected();
  });

  // Hover and focus
  const handleInteractionStart = () => {
    if (button !== selectedButton) {
      if (selectedButton) {
        selectedButton.style.anchorName = '';
      }
      
      button.style.anchorName = '--selected';
    }
  };

  button.addEventListener('mouseenter', handleInteractionStart);
  button.addEventListener('focus', handleInteractionStart);

  // Blur action
  const handleInteractionEnd = () => {
    if (button !== selectedButton) {
      button.style.anchorName = '';
      setAnchorOnSelected();
    }
  };

  button.addEventListener('mouseleave', handleInteractionEnd);
  button.addEventListener('blur', handleInteractionEnd);
});