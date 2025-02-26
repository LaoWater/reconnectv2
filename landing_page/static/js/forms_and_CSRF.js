// Function to get the CSRF token from cookies
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

// Fetch the CSRF token
const csrftoken = getCookie('csrftoken');

// Add event listener for form submission
document.getElementById("newsletter-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the form inputs
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    // Prepare the data to send
    const data = {
        email: email,
        phone: phone
    };

    try {
        // Send the POST request to the Django backend
        const response = await fetch('/submit-newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(data),
        });

        // Handle the server response
        const result = await response.json(); // Parse the JSON response

        if (response.ok) {
            alert("Înscriere reușită!"); // Success message
        } else {
            alert(result.error || "Eroare la înscriere. Încercați din nou."); // Error message
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Eroare la înscriere. Încercați din nou.");
    }
});