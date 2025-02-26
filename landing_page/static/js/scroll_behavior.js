

 <!-- Debugging & Exploring Scroll behavior -->

    document.querySelectorAll('*').forEach((el) => {
    const style = getComputedStyle(el);
    if (style.overflowY === 'scroll' || style.overflowY === 'auto') {
        console.log('Scrollable Element:', el);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Add scroll event listener for the <body> element
    document.body.addEventListener("scroll", () => {
        console.log("Body scroll event triggered. Scroll Top:", document.body.scrollTop);
    });

    // Add scroll event listener for the <html> element
    document.documentElement.addEventListener("scroll", () => {
        console.log("HTML scroll event triggered. Scroll Top:", document.documentElement.scrollTop);
    });

    // Add scroll event listener for the window to observe window.scrollY
    window.addEventListener("scroll", () => {
        console.log("Window scroll event triggered. Scroll Y:", window.scrollY);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    console.log("Scroll Y:", window.scrollY);
    console.log("Inner Width:", window.innerWidth);
    console.log("Inner Height:", window.innerHeight);
    console.log("Document Body Offset Height:", document.body.offsetHeight);

   // Add scroll event listener to print the current scroll position
    document.addEventListener('scroll', () => {
        console.log('Scroll event triggered. Scroll Y:', window.scrollY);
    });

});

document.addEventListener('DOMContentLoaded', () => {

window.addEventListener("load", () => {
 console.log("Using Load Listener: \nScroll Y:");
    console.log("Scroll Y:", window.scrollY);
    console.log("Inner Width:", window.innerWidth);
    console.log("Inner Height:", window.innerHeight);
    console.log("Document Body Offset Height:", document.body.offsetHeight);
});
});
