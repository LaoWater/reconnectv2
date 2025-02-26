
document.addEventListener("DOMContentLoaded", () => {

    // Check for mobile screen size (<768px)
    if (window.matchMedia("(max-width: 768px)").matches) {
        const loginBtn = document.getElementById('loginBtn');
        const nav = document.querySelector('nav');
        const langButtons = document.querySelector('.language-buttons'); // Select the language buttons
        const nav_threshold = 1300;

        // Ensure the login button is hidden initially
        loginBtn.style.display = 'none';

        // Add scroll event listener to toggle button visibility
        document.body.addEventListener("scroll", () => {
            const scrollPosition = document.body.scrollTop; // Recalculate scroll position on each scroll event

            // Login button visibility logic
            if (scrollPosition >= 200 && scrollPosition <= 2300) {
                loginBtn.style.display = 'block';
                setTimeout(() => {
                    loginBtn.style.opacity = '1'; // Fade in
                }, 0);
            } else {
                loginBtn.style.opacity = '0';
            }

            // Language button visibility logic using "invisible" and "visible"
            if (scrollPosition > 100) {
                langButtons.classList.remove('visible');
                langButtons.classList.add('invisible');
            } else {
                langButtons.classList.remove('invisible');
                langButtons.classList.add('visible');
            }

            // Nav bar visibility logic
            if (scrollPosition > nav_threshold) {
                nav.classList.remove('visible');
                nav.classList.add('invisible');
            } else {
                nav.classList.remove('invisible');
                nav.classList.add('visible');
            }
        });
    } // Mobile section end



// Dynamically generate the Scroll-to-Top button
    const scrollToTopBtn = document.createElement("div");
    scrollToTopBtn.id = "scrollToTop";
    scrollToTopBtn.innerHTML = `
        <div class="line line-1"></div>
        <div class="line line-2"></div>
    `;
    document.body.appendChild(scrollToTopBtn); // Append to body


    let cumulativeScrollUp = 0;
    let lastScrollPosition = window.scrollY || 0;
    let isAutoScrolling = false; // Add a flag to detect automatic scrolling

// Scroll-Up functionality
// Add scroll event listener to toggle button visibility
    document.body.addEventListener("scroll", () => {
            const scrollPosition = document.body.scrollTop; // Recalculate scroll position on each scroll event
<!--            console.log(`Scroll To Top: `, scrollToTopBtn)-->
            if (scrollPosition == 0) {
                // Hide button after if manual scrolling reaches top
                scrollToTopBtn.classList.add("hide");
                scrollToTopBtn.classList.remove("show");
                isAutoScrolling = false;
                return;
            }

            if (isAutoScrolling) {
                return; // Ignore scroll events during automatic scrolling
            }

            // Check scroll direction and accumulate upward scroll
            if (scrollPosition < lastScrollPosition) {
                const scrollDelta = lastScrollPosition - scrollPosition;
                cumulativeScrollUp += scrollDelta;
            } else {
                cumulativeScrollUp = 0; // Reset if scrolling down
                isAutoScrolling = false; // Reset mechanism
            }

            lastScrollPosition = scrollPosition; // Update last scroll position

            // Show button if cumulative upward scroll exceeds 300px
            if (cumulativeScrollUp > 200) {
                scrollToTopBtn.classList.remove("hide");
                scrollToTopBtn.classList.add("show");
            } else {
                scrollToTopBtn.classList.add("hide");
                scrollToTopBtn.classList.remove("show");
            }
});

        // Scroll-to-Top button click
        scrollToTopBtn.addEventListener('click', () => {
            const start = document.body.scrollTop || document.documentElement.scrollTop;
            const duration = 500; // Total duration of scroll animation (in ms)
            const startTime = performance.now();

            isAutoScrolling = true; // Set the flag to true during automatic scrolling

            const smoothScroll = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1); // Ensure progress doesn't exceed 1
                const ease = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

                const newScrollTop = start * (1 - ease);
                document.body.scrollTop = newScrollTop; // For most browsers
                document.documentElement.scrollTop = newScrollTop; // For WebKit-based browsers (Chrome, Safari)

                if (progress < 1) {
                    requestAnimationFrame(smoothScroll); // Continue animation
                } else {
                    // Hide button after scrolling finishes
                    scrollToTopBtn.classList.add("hide");
                    scrollToTopBtn.classList.remove("show");

                    // Reset last scroll variables after scrolling to top
                    lastScrollPosition = 0;
                    cumulativeScrollUp = 0;

                }
            };

            requestAnimationFrame(smoothScroll); // Start the animation

        });


});