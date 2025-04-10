
// Animations per elements by Class Selector then showing it at 0.2 threshold and hiding it at 0.1 to prevent flickering.
// Somewhat computational expensive
document.addEventListener('DOMContentLoaded', function () {
  // Combine the animation configs from both scripts
  const animatedElements = [
    // --- From Script 1 ---
    {
      selector: '.custom-page5-fail',
      inClass: 'slide-in',
      outClass: 'fade-out'
    },
    {
      selector: '.custom-page5-isolation',
      inClass: 'slide-in',
      outClass: 'fade-out'
    },
    {
      selector: '.custom-page5-reason-isolation',
      inClass: 'slide-in',
      outClass: 'fade-out'
    },
    {
      selector: '.custom-page5-reintegration',
      inClass: 'slide-from-left',
      outClass: 'fade-out'
    },
    {
      selector: '.custom-page5-conclusion',
      inClass: 'slide-from-right',
      outClass: 'fade-out'
    },

    // --- From Script 2 ---
    { selector: '.custom-air-section',             inClass: 'slide-from-left',  outClass: 'fade-out' },
    { selector: '.custom-food-section',            inClass: 'slide-from-right', outClass: 'fade-out' },
    { selector: '#adevaruri-absolute',             inClass: 'slide-from-left',  outClass: 'fade-out' },
    { selector: '#adevaruri-absolute-movement',    inClass: 'slide-from-right', outClass: 'fade-out' },
    { selector: '#adevaruri-absolute-closing',     inClass: 'slide-from-left',  outClass: 'fade-out' }
  ];

   // Before we begin the observer script, set all elements to opacity: 0 to prevent un-pleasant flickering when showing first time, especially on Mobile
  animatedElements.forEach(({ selector }) => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.opacity = 0;
    });
  });


  const elementsState = new Map();

  // Single IntersectionObserver instance for all elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const config = animatedElements.find(item => entry.target.matches(item.selector));
      if (!config) return;

      let state = elementsState.get(entry.target);
      if (!state) {
        state = { isVisible: false };
        elementsState.set(entry.target, state);
      }

      const ratio = entry.intersectionRatio;

      // Show element if ratio >= 0.2 and it's not already visible
      if (!state.isVisible && ratio >= 0.2) {
        entry.target.classList.add(config.inClass);
        entry.target.classList.remove(config.outClass);
        state.isVisible = true;
      }
      // Hide element if ratio <= 0.1 and it's currently visible
      else if (state.isVisible && ratio <= 0.1) {
        entry.target.classList.remove(config.inClass);
        entry.target.classList.add(config.outClass);
        state.isVisible = false;
      }
      // Do nothing between these thresholds to avoid flickering
    });
  }, { threshold: [0.1, 0.2] });

  // Observe each selector in the combined list
  animatedElements.forEach(item => {
    const elements = document.querySelectorAll(item.selector);
    elements.forEach(el => {
      elementsState.set(el, { isVisible: false });
      observer.observe(el);
    });
  });

  // Responsive behavior for .food-symbol-wrapper from Script 2
  const wrapper = document.querySelector('.food-symbol-wrapper');
  if (wrapper) {
    const setWrapperDisplay = () => {
      wrapper.style.display = window.innerWidth > 1024 ? 'block' : 'none';
    };
    setWrapperDisplay();
    window.addEventListener('resize', setWrapperDisplay);
  }




//
////
//  // 2) GSAP Animations for #page1, #page2, #page7 -
//  // DISABLED for now due to laggy-feel
//  //
//    const pages = document.querySelectorAll("#page1, #page2, #page7");
//
//    pages.forEach((page) => {
//      // Choose stagger value based on page id
//      let staggerValue;
//
//      if (page.id === "page1") {
//        staggerValue = 0.11;
//      } else if (page.id === "page7") {
//        staggerValue = 0.11; // example custom value for page7
//      } else {
//        // default for other pages (e.g., #page2)
//        staggerValue = 0.11;
//      }
//
//    // Create a GSAP timeline for this page (paused by default)
//    const tl = gsap.timeline({ paused: true });
//
//    // Animate each direct child element
//    tl.from(page.children, {
//      duration: 1.3,
//      opacity: 0,
//      scale: 0.1,
//      filter: "blur(8px)",
//      x: () => gsap.utils.random(-20, 20),
//      y: () => gsap.utils.random(-20, 20),
//      ease: "power2.out",
//      stagger: staggerValue,
//      onComplete: function() {
//        // Remove the blur after animation completes
//        gsap.set(page.children, { filter: "blur(0px)" });
//      }
//    });
//
//    // Use a separate IntersectionObserver to trigger GSAP animations
//    const observerGSAP = new IntersectionObserver((entries) => {
//      entries.forEach(entry => {
//        if (entry.intersectionRatio >= 0.13) {
//          tl.play();
//        } else {
//          tl.reverse();
//        }
//      });
//    }, { threshold: [0, 0.13] });
//
//    observerGSAP.observe(page);
//  });
});


  function checkWidth() {
    const wrapper = document.querySelector('.food-symbol-wrapper');
    if (!wrapper) {
      // If .food-symbol-wrapper doesn't exist, stop or handle it gracefully
      return;
    }

    if (window.innerWidth > 1024) {
      wrapper.style.display = 'block';
    } else {
      wrapper.style.display = 'none';
    }
  }

  // Call it initially
  checkWidth();

  // Also handle window resize if desired
  window.addEventListener('resize', checkWidth);