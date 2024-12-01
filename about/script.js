// Function to update the progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    let progress = 0;
  
    // Interval to simulate progress
    const interval = setInterval(() => {
      progress += 2;
      progressBar.style.width = `${progress}%`;
      progressText.innerText = `${progress}%`;
  
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 100);
  }
  
  // Call updateProgressBar on page load
  window.onload = updateProgressBar;
  
  // Timeline visibility
  (function () {
    "use strict";
  
    const items = document.querySelectorAll(".timeline li");
  
    function isElementInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  
    function callbackFunc() {
      for (let i = 0; i < items.length; i++) {
        if (isElementInViewport(items[i])) {
          items[i].classList.add("in-view");
        }
      }
    }
  
    window.addEventListener("load", callbackFunc);
    window.addEventListener("resize", callbackFunc);
    window.addEventListener("scroll", callbackFunc);
  })();
  
