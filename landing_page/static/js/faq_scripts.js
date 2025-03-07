
document.addEventListener('DOMContentLoaded', function() {
  const inputField = document.getElementById('ylf-prompt');
  const questions = [
    "What is the meaning of life?",
    "How can I learn JavaScript?",
    "What's the best way to stay productive?",
    "What are the benefits of meditation?",
    "How do I cook a perfect steak?"
  ];

  // Function to type text one character at a time
  function typeWriter(text, index, callback) {
    if (index < text.length) {
      inputField.value += text.charAt(index);
      setTimeout(() => typeWriter(text, index + 1, callback), 75); // adjust speed as needed
    } else {
      // Pause for 1 second after full text is displayed
      setTimeout(callback, 1000);
    }
  }

  // Function to erase text one character at a time
  function eraseText(callback) {
    const text = inputField.value;
    let index = text.length;
    function erase() {
      if (index > 0) {
        inputField.value = text.substring(0, index - 1);
        index--;
        setTimeout(erase, 40); // adjust speed as needed
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
    inputField.value = ""; // clear the field before typing
    typeWriter(question, 0, () => {
      eraseText(() => {
        setTimeout(loopQuestions, 500); // wait before showing the next question
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