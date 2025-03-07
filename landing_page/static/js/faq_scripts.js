document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('ylf-prompt');
    const questions = [
        "How can I optimize my breathing for stress relief?",
        "What natural exercises boost my energy?",
        "How do I improve my posture naturally?",
        "Can holistic practices ease chronic pain?",
        "What are simple movements for overall wellness?",
        "How does mindful breathing improve sleep?",
        "What routines help reconnect mind and body?",
        "How can ancient methods enhance modern fitness?",
        "What dietary tips support vitality?",
        "How do I integrate mind, body, and movement?"
    ];

    function adjustHeight() {
        inputField.style.height = "auto"; // Reset height
        inputField.style.height = Math.min(inputField.scrollHeight, 200) + "px"; // Expand dynamically up to 200px max
    }

    inputField.addEventListener("input", adjustHeight);

    // Function to type text one character at a time
    function typeWriter(text, index, callback) {
        if (index < text.length) {
            inputField.value += text.charAt(index);
            adjustHeight();
            setTimeout(() => typeWriter(text, index + 1, callback), 43);
        } else {
            setTimeout(callback, 1000); // Pause for 1 second after full text is displayed
        }
    }

    // Function to erase text one character at a time
    function eraseText(callback) {
        const text = inputField.value;
        let index = text.length;
        function erase() {
            if (index > 0) {
                inputField.value = text.substring(0, index - 1);
                adjustHeight();
                index--;
                setTimeout(erase, 20);
            } else {
                callback();
            }
        }
        erase();
    }

    // Main loop to cycle through questions
    function loopQuestions() {
        const randomIndex = Math.floor(Math.random() * questions.length);
        const question = questions[randomIndex];
        inputField.value = ""; // Clear the field before typing
        adjustHeight();
        typeWriter(question, 0, () => {
            eraseText(() => {
                setTimeout(loopQuestions, 500); // Wait before showing the next question
            });
        });
    }

    loopQuestions();
});




document.querySelectorAll('.faq-title').forEach(title => {
    title.addEventListener('click', () => {
        const content = title.nextElementSibling;
        const icon = title.querySelector('.faq-icon');

        // Toggle content expansion
        content.classList.toggle('expanded');

        // Toggle icon rotation
        icon.classList.toggle('rotated');
    });
});