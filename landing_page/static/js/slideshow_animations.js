
    document.addEventListener("DOMContentLoaded", () => {
        const container = document.querySelector(".slideshow-container");
        const slides = container.querySelectorAll(".slide");
        const slideWidth = slides[0].offsetWidth; // Width of a single slide
        let position = 0;

        function loopSlides() {
            position -= 1; // Adjust the speed of sliding
            container.style.transform = `translateX(${position}px)`;

            // When the first slide is completely out of view
            if (Math.abs(position) >= slideWidth) {
                position += slideWidth + 15; // Correct the position to prevent spiking
                container.appendChild(container.firstElementChild); // Move first slide to the end
                container.style.transform = `translateX(${position}px)`; // Maintain smooth flow
            }

            requestAnimationFrame(loopSlides); // Keep the animation running
        }

        loopSlides(); // Start the animation
    });