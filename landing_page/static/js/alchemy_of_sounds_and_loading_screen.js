
document.addEventListener("DOMContentLoaded", () => {
const audio = document.getElementById("background-music");
const muteButton = document.getElementById("mute-btn");
const volumeSlider = document.getElementById("volume-slider");

let isPlaying = false; // Track play/pause state

muteButton.addEventListener("click", () => {
    if (!isPlaying) {
        audio.currentTime = 0; // Reset audio to the beginning
        audio.play().then(() => {
            console.log("Audio started from the beginning.");
            muteButton.textContent = "🔊"; // Update icon to unmuted
        }).catch((error) => {
            console.error("Audio playback failed:", error);
        });
    } else {
        audio.pause();
        console.log("Audio paused.");
        muteButton.textContent = "🔈"; // Update icon to muted
    }
    isPlaying = !isPlaying; // Toggle isPlaying state
});

// Volume slider controls the audio volume
volumeSlider.addEventListener("input", () => {
    const volumeValue = volumeSlider.value / 100; // Scale from 0 to 1
    audio.volume = volumeValue;
    console.log(`Volume set to: ${volumeValue}`);
});

// Sync slider position with audio volume
audio.addEventListener("volumechange", () => {
    volumeSlider.value = audio.volume * 100; // Sync slider with audio volume
});

// Debugging Events
audio.addEventListener("error", (e) => console.error("Audio playback error:", e));
audio.addEventListener("canplay", () => console.log("Audio is ready to play."));
audio.addEventListener("play", () => console.log("Audio is playing..."));
audio.addEventListener("pause", () => console.log("Audio is paused..."));
});

// JavaScript to control the loading screen
document.addEventListener("DOMContentLoaded", () => {
const loadingScreen = document.getElementById("loading-screen");
const content = document.getElementById("content");

// Wait for the entire page (including images, CSS, JS) to load
window.onload = () => {
    loadingScreen.style.display = "none";
};
});
