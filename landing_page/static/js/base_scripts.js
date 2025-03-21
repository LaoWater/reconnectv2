
<!------------------------------------------------------->
<!-- Login&Register | Forms & Exchanges-->
<!------------------------------------------------------->

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginAjaxForm');
    const registerForm = document.getElementById('registerAjaxForm');

    // Utility Function to Display Messages
    const fadeMessage = (message, isSuccess) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fade-message ${isSuccess ? 'success' : 'error'}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => messageDiv.remove(), 500);
        }, 2000);
    };

    // Utility Function to Get CSRF Token
    const getCSRFToken = () => {
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') csrfToken = value;
        });
        return csrfToken;
    };

    // Check Login Status on Page Load
    const checkLoginStatus = () => {
        fetch('/ajax/check-login/', {
            method: 'GET',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
        })
        .then(async response => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return data;
            } else {
                const text = await response.text();
                console.error('Unexpected Response (HTML?):', text);
                throw new Error('Unexpected response format');
            }
        })
        .then(data => {
            console.log('Login Status:', data);
            if (data.logged_in) {
                loginBtn.textContent = 'Logout'; // User is logged in
            } else {
                loginBtn.textContent = 'Login'; // User is not logged in
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
    };

    // Call checkLoginStatus on page load
    checkLoginStatus();

    // Handle Login/Logout Button Click
    loginBtn.addEventListener('click', () => {
        if (loginBtn.textContent === 'Logout') {
            // Logout logic
            fetch('/ajax/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                },
            })
            .then(response => {
                if (response.ok) {
                    console.log('Logout successful');
                    fadeMessage('You have been logged out.', true);
                    loginBtn.textContent = 'Login'; // Reset to "Login"
                } else {
                    throw new Error('Logout failed.');
                }
            })
            .catch(error => {
                console.error('Logout Error:', error);
                fadeMessage('An error occurred during logout.', false);
            });
        } else {
            // Login modal logic
            loginModal.classList.remove('hidden');
        }
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

        // Close Modal when pressing "Escape"
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            loginModal.classList.add('hidden');
        }
    });


    // Tab Switching
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.parentElement.classList.add('active');
        registerForm.parentElement.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.parentElement.classList.add('active');
        loginForm.parentElement.classList.remove('active');
    });

    // AJAX Login Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);

        fetch('/ajax/login/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
        })
        .then(async response => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                return data;
            } else {
                const text = await response.text();
                throw new Error('Unexpected response format in login');
            }
        })
        .then(data => {
            if (data.success) {
                loginModal.classList.add('hidden');
                fadeMessage(data.message, true);
                loginBtn.textContent = 'Logout'; // Change button to "Logout"
            } else {
                fadeMessage(data.message, false);
            }
        })
        .catch(error => {
            console.error('Login Error:', error);
            fadeMessage('An unexpected error occurred during login', false);
        });
    });

    // AJAX Register Form Submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Create a FormData object from the registration form
    const formData = new FormData(registerForm);

    // Send the registration data to the server
    fetch('/ajax/register/', {
        method: 'POST', // HTTP POST method for submitting data
        body: formData, // Include the form data
        headers: {
            'X-CSRFToken': getCSRFToken(), // Add the CSRF token for security
        },
    })
    .then(async response => {
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json(); // Parse the JSON response
            return data; // Pass the parsed JSON to the next `.then()`
        } else {
            const text = await response.text(); // If not JSON, log the raw response
            throw new Error('Unexpected response format in register'); // Throw an error for unexpected formats
        }
    })
    .then(data => {
        // Handle the registration success or failure
        if (data.success) {
            console.log('Registration successful:', data); // Log the success response
            fadeMessage(data.message, true); // Show a success message
            loginModal.classList.add('hidden'); // Close the login/register modal

            // Prepare login data using the same credentials
            const loginFormData = new FormData();
            loginFormData.append('username', registerForm.querySelector('[name="username"]').value); // Get the username
            loginFormData.append('password', registerForm.querySelector('[name="password1"]').value); // Get the password

            // Automatically log in the user
            return fetch('/ajax/login/', {
                method: 'POST', // HTTP POST method for login
                body: loginFormData, // Include the login data
                headers: {
                    'X-CSRFToken': getCSRFToken(), // Add the CSRF token for security
                },
            });
        } else {
            fadeMessage(data.message, false); // Show an error message if registration fails
            throw new Error('Registration failed.'); // Stop further execution
        }
    })
    .then(async response => {
        // Check the response from the login request
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const loginData = await response.json(); // Parse the login JSON response
            if (loginData.success) {
                console.log('Auto-login successful:', loginData); // Log the successful auto-login
                fadeMessage('Registration and login successful!', true); // Show a combined success message
                loginBtn.textContent = 'Logout'; // Update the button to say "Logout"
            } else {
                fadeMessage('Registration successful, but login failed.', false); // Handle login failure
            }
        } else {
            const text = await response.text(); // Log unexpected non-JSON responses
            throw new Error('Unexpected response format in auto-login'); // Throw an error for unexpected formats
        }
    })
    .catch(error => {
        console.error('Register Error:', error); // Log any errors encountered
        fadeMessage('An unexpected error occurred during registration or login.', false); // Show a general error message
    });
});

});






<!------------------------------------------------------->
<!-- Google Login Animation & Handling -->
<!------------------------------------------------------->


// Function to handle the Google login process
function openGoogleLogin(event) {
  event.preventDefault();

  // Open Google login in a new tab
  var loginWindow = window.open(googleLoginUrl, "_blank", "width=500,height=600");

  // Update and show the loading screen
  var loadingScreen = document.getElementById("loading-screen");
  var loadingText = loadingScreen.querySelector("p");
  var overlay = document.getElementById("loading-overlay");
  loadingText.textContent = "Logging in with Google...";
  loadingScreen.style.display = "flex";
  overlay.style.display = "block";

  // Polling for login status on the server
  var pollingAttempts = 0;
  var maxPollingAttempts = 20; // approximately 20 seconds

  console.log(loginWindow);

  function pollLoginStatus() {
    console.log(loginWindow);
    fetch('/ajax/check-login/')
      .then(function(response) { return response.json(); })
      .then(function(data) {
        if (data.logged_in) {
          loadingText.textContent = "Welcome, " +
            (data.username.charAt(0).toUpperCase() + data.username.slice(1)) +
            "! Redirecting...";
          setTimeout(function() {
            loadingScreen.style.display = "none";
            overlay.style.display = "none";
            window.location.reload(); // Refresh to update logged-in state
          }, 1000);
        }
      })
      .catch(function() {
        // Handle unexpected errors
        loadingText.textContent = "An error occurred. Please try again.";
        setTimeout(function() {
          loadingScreen.style.display = "none";
          overlay.style.display = "none";
        }, 2000);
      });
  }

  // Start polling every second
  var loginCheck = setInterval(function() {
    pollLoginStatus();
    pollingAttempts++;
    if (pollingAttempts >= maxPollingAttempts) {
      clearInterval(loginCheck);
      loadingText.textContent = "Login timed out. Please try again.";
      setTimeout(function() {
        loadingScreen.style.display = "none";
        overlay.style.display = "none";
      }, 2000);
    }
  }, 1000);
}





<!------------------------------------------------------->
<!-- Mobile Nav Bar Rendering -->
<!------------------------------------------------------->


document.addEventListener("DOMContentLoaded", function () {
const hamburger = document.getElementById("hamburger");

  if (window.innerWidth > 768) {
    hamburger.style.display = "none";
  }

  if (window.innerWidth < 768) {
    const navMenu = document.getElementById("navMenu");
    const particleContainer = document.getElementById("particle-container");
    let menuOpen = false;

    // Toggle the menu when clicking on the hamburger
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!menuOpen) {
        openMenu();
      }
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (
        menuOpen &&
        !navMenu.contains(e.target) &&
        e.target !== hamburger &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    function openMenu() {
      menuOpen = true;
      hamburger.classList.add("hidden");
      createParticles(hamburger, "explode", function () {
        navMenu.classList.add("active");
      });
    }

    function closeMenu() {
      menuOpen = false;
      navMenu.classList.remove("active");
      createParticles(hamburger, "implode", function () {
        hamburger.classList.remove("hidden");
      });
    }

    function createParticles(element, animationType, callback) {
      // Get the hamburger center coordinates
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Get the navMenu rectangle dimensions to base our offsets on a rectangle
      const navRect = navMenu.getBoundingClientRect();

      // Increase the particle count for a denser effect
      for (let i = 0; i < 120; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Position particle at the center of the hamburger
        particle.style.left = centerX + "px";
        particle.style.top = centerY + "px";

        // Instead of a circular offset, use a random offset within the navMenu rectangle
        const tx = (Math.random() - 0.5) * navRect.width;
        const ty = (Math.random() - 0.5) * navRect.height;

        particle.style.setProperty("--tx", tx + "px");
        particle.style.setProperty("--ty", ty + "px");

        // Apply a color and glow effect similar to your text style
        const colors = ["#ff4500", "#ff8c00", "rgba(255, 140, 0, 0.8)"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = randomColor;
        particle.style.boxShadow = `0 0 10px ${randomColor}, 0 0 20px ${randomColor}`;

        // Use a slightly longer duration if needed and trigger the proper animation type
        if (animationType === "explode") {
          particle.style.animation = "explode 0.8s forwards";
        } else if (animationType === "implode") {
          particle.style.animation = "implode 0.8s forwards";
        }

        particleContainer.appendChild(particle);

        particle.addEventListener("animationend", function () {
          particle.remove();
        });
      }

      // Adjust callback timing so the navMenu (text) starts to appear mid-animation.
      // For example, with a total duration of 0.8s, you could trigger at ~0.4s (mid) or ~0.53s (2/3).
      setTimeout(callback, 400); // Adjust this value as needed
    }
  }
});




<!------------------------------------------------------->
<!-- Youtube API script embedding video -->
<!------------------------------------------------------->
//
//
//  // Load the YouTube API asynchronously
//  var tag = document.createElement('script');
//  tag.src = "https://www.youtube.com/iframe_api";
//  var firstScriptTag = document.getElementsByTagName('script')[0];
//  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
//
//  // Create YouTube player when API is ready
//  var player;
//  function onYouTubeIframeAPIReady() {
//    player = new YT.Player('youtube-player', {
//      // Replace VIDEO_ID with your actual YouTube video ID
//      videoId: '2R_24vlUXVo',
//      playerVars: {
//        'rel': 0,
//        'showinfo': 0,
//        'modestbranding': 1,
//        'origin': window.location.origin
//      },
//      events: {
//        'onReady': onPlayerReady
//      }
//    });
//  }
//
//  function onPlayerReady(event) {
//    // Player is ready
//    console.log('YouTube player is ready');
//  }