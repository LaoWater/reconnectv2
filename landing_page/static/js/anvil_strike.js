// Select elements
const hammer = document.querySelector(".hammer");
const sparksContainer = document.querySelector(".sparks");

let isPageActive = true; // Tracks whether the page is active

// Function to check and update the page visibility state
function handleVisibilityChange() {
    isPageActive = !document.hidden; // `true` if the page is active
}

// Add event listener to detect page visibility changes
document.addEventListener("visibilitychange", handleVisibilityChange);

// Function to generate a single spark with fire-like properties
function generateSpark() {
    setTimeout(() => {
        const spark = document.createElement("div");
        spark.classList.add("spark");
        sparksContainer.appendChild(spark);

        // Randomize spark properties
        const angle = Math.random() * 360; // Random direction
        const distance = Math.random() * 50 + 30; // Random distance
        const size = Math.random() * 3 + 1; // Random size (smaller for fire-like sparks)
        const duration = Math.random() * 1.5 + 0.8; // Random animation duration
        const colors = ["#ff4500", "#ff6347", "#ffa07a"]; // Fire-like colors

        // Set initial position and size
        gsap.set(spark, {
            width: size,
            height: size,
            x: 0,
            y: 0,
            opacity: 1,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)], // Random fire color
            borderRadius: "50%",
            position: "absolute",
        });

        // Animate the spark's movement and fade
        gsap.to(spark, {
            x: distance * Math.cos((angle * Math.PI) / 180),
            y: distance * Math.sin((angle * Math.PI) / 180),
            opacity: 0,
            scale: Math.random() * 1.5 + 1, // Slightly grow the spark as it dissipates
            duration: duration,
            ease: "power2.out",
            onComplete: () => spark.remove(), // Remove spark after animation
        });
    }, 180);
}



// Hammer strike animation with realistic behavior
function hammerStrike() {

    if (!isPageActive) return; // Skip hammer animation if the page is inactive

    const timeline = gsap.timeline();

    // Simulate the hammer strike with a slight shake and delay before returning
    timeline
        .to(hammer, {

            rotation: -90, // Strike angle
            x: -30, // Move slightly left
            y: 10, // Move slightly downward
            duration: 0.17,
            transformOrigin: "bottom center", // Pivot at the handle's end
            ease: "power2.in",
        })
        .to(hammer, {
            rotation: -92, // Slight shake
            x: -31,
            y: 10,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
        })
        .to(hammer, {
            delay: 0.6, // Pause before returning
            rotation: 0, // Return to original position
            x: 0, // Reset position
            y: 0, // Reset position
            duration: 2,
            ease: "rough({ template: power1.out, strength: 1.5, points: 20, taper: 'none', randomize: true, clamp: false })",

        });

    // Generate multiple sparks during the strike
    for (let i = 0; i < 40; i++) {
        setTimeout(() => generateSpark(), i * 20); // Higher density of sparks
    }
}

// Trigger the hammer strike and spark animations every 3 seconds
setInterval(hammerStrike, 3000);