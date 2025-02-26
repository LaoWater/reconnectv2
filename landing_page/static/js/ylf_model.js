document.addEventListener('DOMContentLoaded', function() {
  // -------------------------------------------------
  // 1. Conversation Data + Helpers
  // -------------------------------------------------
  let conversations = [];
  let activeConversation = null;


// Fetch user data and conversations dynamically from the backend
async function initializeConversations() {
    return fetch('/get-user-data/')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                console.log('User is logged in:', data.username);
                if (data.conversations && data.conversations.length > 0) {
                    conversations = data.conversations; // Populate conversations array
                    console.log('Loaded conversation history:', conversations);
                } else {
                    console.log('No conversations found.');
                }
            } else {
                console.log('User is not logged in, starting with empty conversations.');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
}

// Initialize the conversations array (no additional logic here)
initializeConversations();


  // LLM Helper functions

  function handleLlmResponse(data) {
  // Step 1: Extract content from JSON
  const markdownContent = data.content || "No content provided";

  // Step 2: Parse the Markdown content to HTML
  const renderedHtml = marked.parse(markdownContent); // Assuming 'marked.js' is included

  // Step 3: Pass the rendered HTML to addChatBubble
  addChatBubble(renderedHtml, 'llm');
}



  // Return a unique name for a new conversation:
  // "New Chat" if none exists, "New Chat 2", "New Chat 3", etc.
  function getNewChatTitle() {
    const baseTitle = "New Chat";
    let count = 0;
    let candidate = baseTitle;  // "New Chat"
    // If there's *already* a conversation with exactly `candidate` as title,
    // increment count. Then we try "New Chat 2", "New Chat 3", etc.
    while (conversations.some(c => c.title === candidate)) {
      count++;
      candidate = `${baseTitle} ${count}`;
    }
    return candidate;
  }

  function createNewConversation(title = "New Chat") {
    return {
      id: Date.now(),   // Simple unique ID
      title: title,
      messages: [],
    };
  }

  // -------------------------------------------------
  // PAGE SETUP
  // 2. DOM Elements
  // -------------------------------------------------

  const ylfData        = document.getElementById('ylf-data');
  if (!ylfData) {
    console.error("ylf-data element not found!");
    return;
  }
  const ylfUrl         = ylfData.dataset.url;
  const csrfToken      = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const sendBtn        = document.getElementById('sendBtn');
  const chatMessages   = document.getElementById('chatMessages');
  const inputField     = document.getElementById('prompt');
  const newChatBtn     = document.getElementById('newChatBtn');
  const sidebarHistory = document.getElementById('sidebarHistory');



  // Page load setup wrapped in an async-await functions
async function setupPage() {
    // Wait for conversations to be initialized
    await initializeConversations();

    // Check if there's already a "New Chat" conversation
    const existingNewChat = conversations.find(c => c.title === "New Chat");

    if (existingNewChat) {
        // Load the existing "New Chat" as the active conversation
        activeConversation = existingNewChat;
        console.log(`Loaded existing conversation: ${activeConversation.title}`);
    } else {
        // Create a new conversation with the title "New Chat"
        activeConversation = createNewConversation("New Chat");
        conversations.push(activeConversation);
        console.log("Created a new conversation: New Chat");
    }

    // Render the sidebar history and active conversation
    renderSidebarHistory();

    // Render the active conversation's messages (if any)
    chatMessages.innerHTML = '';
    activeConversation.messages.forEach(msgObj => {
        const sender = msgObj.role === "assistant" ? "llm" : msgObj.role;
        addChatBubble(msgObj.content, sender);
    });

    console.log("Initial conversations:", conversations); // Debug log
}


// Call setupPage to handle page initialization
setupPage();

  // -------------------------------------------------
  // 4. Event Listeners
  // -------------------------------------------------
  newChatBtn.addEventListener('click', function() {
    // Make sure the current active conversation is updated in array
    updateConversationInArray(activeConversation);
    console.log("Updated conversations from new chat btn:", conversations); // debug log

    // Create a new conversation with a *unique* name
    const freshTitle = getNewChatTitle();
    activeConversation = createNewConversation(freshTitle);
    conversations.push(activeConversation);

    // Clear the chat window and re-render
    chatMessages.innerHTML = '';
    renderSidebarHistory();
  });

  sendBtn.addEventListener('click', sendMessage);
  inputField.addEventListener('keydown', function(evt) {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault();
      sendMessage();
    }
  });

  // -------------------------------------------------
  // 5. Functions
  // -------------------------------------------------
  function sendMessage() {
    const prompt = inputField.value.trim();
    if (!prompt) return;

    // 1) Add user bubble
    addChatBubble(prompt, 'user');
    // 2) Store in activeConversation
    activeConversation.messages.push({ role: 'user', content: prompt });
    // 3) Clear input
    inputField.value = '';
    // 4) Temporary "Thinking..." bubble
    let loadingBubble = addChatBubble('Thinking...', 'llm');

//    // Create the spinner element - for LLM thinking effect
//      const spinner = document.createElement('div');
//      spinner.classList.add('spinner');
//      spinner.innerHTML = `
//        <svg viewBox="0 0 50 50" class="circular">
//          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
//        </svg>
//      `;
//
// Circle Spinning option

// Logo option
const logoContainer = document.createElement('div');
logoContainer.classList.add('logo-container');
// Use img tag and set src attribute dynamically with a fallback
const logo = new Image();
logo.src = "/static/images/ylf_first_logo.png"; // Use the /static/ prefix
logo.alt = "Thinking...";
logo.classList.add('logo');

logo.onload = function() { // Handle image load success
  logoContainer.appendChild(logo);
  loadingBubble.insertBefore(logoContainer, loadingBubble.firstChild);
  logoContainer.style.marginRight = '5px';
};
// Optional: Handle potential error loading the image
logo.onerror = function() {
  console.error("Failed to load logo image.");
  // You can add alternative behavior here, like displaying an error message
};



    // Set a timeout to change the bubble text after 5 seconds
    let timeoutId = setTimeout(() => {
    // Check if loadingBubble exists and is a child of chatMessages
    if (!loadingBubble || !chatMessages.contains(loadingBubble)) {
      return; // Exit if the loading bubble doesn't exist
    }
      chatMessages.removeChild(loadingBubble);
      loadingBubble = addChatBubble('Analyzing Context...', 'llm'); // Change the text of the bubble
        loadingBubble.insertBefore(logoContainer, loadingBubble.firstChild);
    }, 5000);


    // Set a timeout to change the bubble text after 5 seconds
    timeoutId = setTimeout(() => {
    // Check if loadingBubble exists and is a child of chatMessages
    if (!loadingBubble || !chatMessages.contains(loadingBubble)) {
      return; // Exit if the loading bubble doesn't exist
    }
      chatMessages.removeChild(loadingBubble);
      loadingBubble = addChatBubble('Formatting & Processing response...', 'llm'); // Change the text of the bubble
        loadingBubble.insertBefore(logoContainer, loadingBubble.firstChild);
    }, 9000);


    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    console.log('CSRF Token:', csrfToken);

    // 5) POST to server
    fetch(ylfUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-CSRFToken': csrfToken
      },
      body: new URLSearchParams({ 'prompt': prompt })
    })

    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .then(data => {
      chatMessages.removeChild(loadingBubble);

      let llmResponse = "Unexpected response format.";
      if (data && data.paragraphs) {
        if (Array.isArray(data.paragraphs)) {
          llmResponse = data.paragraphs.join('\n\n');
        } else if (typeof data.paragraphs === 'string') {
          llmResponse = data.paragraphs;
        } else if (data.error) {
          llmResponse = "Error: " + data.error;
        }
      } else if (data && data.error) {
        llmResponse = "Error: " + data.error;
      }

      console.log(`Adding new chat bubble with LLM response.`)
      addChatBubble(llmResponse, 'llm');
      activeConversation.messages.push({ role: 'assistant', content: llmResponse });

      // Update store
      updateConversationInArray(activeConversation);
    })
    .catch(error => {
      console.error('Fetch Error:', error);
      chatMessages.removeChild(loadingBubble);

      const errMsg = `Error: ${error.message}`;
      addChatBubble(errMsg, 'llm');
      activeConversation.messages.push({ role: 'assistant', content: errMsg });
      updateConversationInArray(activeConversation);
    });
  }

// Handles adding new user & LLM responses to chat
function addChatBubble(message, sender) {
  let processing_phase = false;
  // Create the bubble container
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', sender);

  // Create the content container
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('content-container');

  // Create the span for the message text
  const messageContent = document.createElement('span');

  // Testing Markdown
  // message = "## Hello World\n\n**This is bold text** and *this is italic text*.";
  const renderedHtml = marked.parse(message); // Parse Markdown into HTML

  messageContent.innerHTML = renderedHtml;
  contentContainer.appendChild(messageContent);

  console.log(`Rendered HTML before adding chat message: ${renderedHtml}`);

    // Check if the message indicates a processing phase
    if (
      message.includes("Formatting & Processing response...") ||
      message.includes("Analyzing Context...") ||
      message.includes("Thinking...")
    ) {
      processing_phase = true;
    }
  // If it's an LLM message and processing phase finished, add copy & flag buttons
  if (sender === 'llm' && !processing_phase) {
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-btn');
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19 21H9c-1.1 0-2-.9-2-2V7h2v12h10v2zm2-16h-8c-1.1 0-2 .9-2 2v8
                 c0 1.1.9 2 2 2h8c-1.1.0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 10h-8V7h8v8z"/>
      </svg>
              <span class="tooltip-text-copy">Copy</span>
    `;
    contentContainer.appendChild(copyBtn);

    // Add functionality to copy the message text
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(message).then(() => {
        console.log("Copied to clipboard!");

         // Temporarily show "Copied!" message
      const tooltip = copyBtn.querySelector('.tooltip-text-copy');
      const originalText = tooltip.textContent;
      tooltip.textContent = "Copied!";

      // Reset back to original message after a delay
      setTimeout(() => {
        tooltip.textContent = originalText;
      }, 1500); // Display "Copied!" for 1.5 seconds

      });
    });

      // Adding Flag-as-Innapropriate Button
     // Create the flag button
  const flagBtn = document.createElement('button');
  flagBtn.classList.add('flag-btn');
        flagBtn.innerHTML = `
        <div class="flag-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" style="vertical-align: top;">
                <path d="M6 2c-1.1 0-2 .9-2 2v16c0 .55.45 1 1 1s1-.45 1-1V14h11c.82 0 1.54-.5 1.85-1.22L22 7c.25-.57.16-1.2-.25-1.65C21.37 5 20.8 4.88 20.27 5L16 7H6V4c0-1.1-.9-2-2-2z"/>
            </svg>
        </div>
        <span class="tooltip-text">Flag this response as inappropriate</span>
      `;
  contentContainer.appendChild(flagBtn);

// Add functionality to handle flagging the message
flagBtn.addEventListener('click', () => {
  // Find the corresponding prompt and prepare the JSON object
  const prompt = activeConversation.messages.find(
    (msg) => msg.role === "user"
  )?.content || "Unknown Prompt";

  const flaggedData = {
    prompt: prompt,
    response: message, // Flagged LLM response
  };

  console.log("Flagged Data:", JSON.stringify(flaggedData, null, 2));

  // Send flagged data to the backend
  fetch('/store-feedback/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken, // Add CSRF token for secure requests
    },
    body: JSON.stringify(flaggedData), // Send data as JSON
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        console.log('Feedback stored successfully:', data.message);
        // Functionality for post-feedback trigger - asking user if he wants to provide detailed feedback for Model's RLHF.
        handleFlagFeedback(flagBtn, flaggedData);
        // alert('Thank you for your feedback!'); Commented out since we're handling success message in handleFeedBack function
      } else {
        console.error('Error storing feedback:', data.error);
        alert('Failed to store feedback.');
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      alert('An error occurred while storing feedback.');
    });

});


  }

  // Append the content container to the bubble
  bubble.appendChild(contentContainer);

  // Append the bubble to the chat container
  chatMessages.appendChild(bubble);

  // Auto-scroll to the bottom of the chat
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return bubble;
}

  function renderSidebarHistory() {
    sidebarHistory.innerHTML = '';
    // Reverse the conversations array to show the latest first
    const reversedConversations = [...conversations].reverse();

    reversedConversations.forEach((conv) => {
      // Create a row for each conversation
      const entry = document.createElement('div');
      entry.classList.add('sidebar-chat-entry');

      // If this is the active conversation, highlight it
      if (conv.id === activeConversation.id) {
        entry.classList.add('active-conversation');
      }

      // Title area (click to load)
      const titleSpan = document.createElement('span');
      titleSpan.classList.add('sidebar-chat-title');
      titleSpan.textContent = conv.title;
      // Clicking the title loads that conversation
      titleSpan.addEventListener('click', () => {
        loadConversation(conv.id);
      });

      // 3-dots button, dropdown, rename/delete logic
      const dotsBtn = document.createElement('button');
      dotsBtn.classList.add('chat-options-btn');
      dotsBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      `;

      const dropdown = document.createElement('div');
      dropdown.classList.add('chat-options-dropdown');

      const renameBtn = document.createElement('button');
      renameBtn.textContent = "Rename";
      renameBtn.addEventListener('click', () => {
        dropdown.classList.remove('show');
        renameConversation(conv.id);
      });
      dropdown.appendChild(renameBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener('click', () => {
        dropdown.classList.remove('show');
        deleteConversation(conv.id);
      });
      dropdown.appendChild(deleteBtn);

      dotsBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        // close all open dropdowns
        document.querySelectorAll('.chat-options-dropdown.show').forEach(d => d.classList.remove('show'));
        dropdown.classList.toggle('show');
      });

      document.body.addEventListener('click', () => {
        dropdown.classList.remove('show');
      }, { capture: true });

      // Build row
      entry.appendChild(titleSpan);
      entry.appendChild(dotsBtn);
      entry.appendChild(dropdown);

      sidebarHistory.appendChild(entry);
    });
  }

  function loadConversation(convoId) {
    const foundConv = conversations.find(c => c.id === convoId);
    console.log(`LoadConversation: Searching for conversation with id ${convoId}`)
    console.log(`Found conv: ${foundConv}`)
    if (!foundConv) {
      console.error("Conversation not found:", convoId);
      return;
    }

    // Make foundConv the new active
    activeConversation = foundConv;

    // Clear chat & rebuild
    chatMessages.innerHTML = '';
    activeConversation.messages.forEach(msgObj => {
      const sender = msgObj.role === "assistant" ? "llm" : msgObj.role;
      addChatBubble(msgObj.content, sender);
    });

    // Re-render sidebar so highlight is updated
    renderSidebarHistory();
  }

  function renameConversation(convoId) {
    const foundConv = conversations.find(c => c.id === convoId);
    if (!foundConv) return;

    showCustomPrompt(foundConv.title, (newTitle) => {
      if (newTitle) {
        foundConv.title = newTitle.trim();
        renderSidebarHistory();

        // Save the updated conversation immediately
        updateConversationInArray(foundConv);
      }
    });

  }

  function deleteConversation(convoId) {
    // If deleting the active conversation, create a new blank one
    if (activeConversation.id === convoId) {
      activeConversation = createNewConversation(getNewChatTitle());
      conversations = conversations.filter(c => c.id !== convoId);
      conversations.push(activeConversation);
      chatMessages.innerHTML = '';
    } else {
      // Just remove the chosen conversation
      conversations = conversations.filter(c => c.id !== convoId);
    }
    renderSidebarHistory();

    // Fetch user data dynamically and then save conversations to the backend
    fetchUserData().then(username => {
        saveConversationsToBackend(username, conversations);
    });


  }

  // Store or update a conversation in the array
  function updateConversationInArray(convObj) {
    const idx = conversations.findIndex(c => c.id === convObj.id);
    console.log(`Hello From update conv in array function, computed idx is ${idx}`)
    console.log(`Conversations: ${conversations}`)
    if (idx > -1) {
      conversations[idx] = convObj;
    } else {
      conversations.push(convObj);
    }

    // Fetch user data dynamically and then save conversations to the backend
    fetchUserData().then(username => {
        saveConversationsToBackend(username, conversations);
    });


  }

// Fetch user data dynamically from the backend
function fetchUserData() {
    return fetch('/get-user-data/')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                console.log('User data:', data);
                return data.username;
            } else {
                console.log('User is not logged in.');
                return null;
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            return null; // Handle fetch errors gracefully
        });
}


// Save conversations to the backend
function saveConversationsToBackend(username, updatedConversations) {
    fetch('/save-conversations/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username || null, // Pass username if logged in
            conversations: updatedConversations, // Pass the updated conversation array
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log('Conversations saved successfully:', data.message);
            } else {
                console.error('Error saving conversations:', data.error);
            }
        })
        .catch(error => console.error('Fetch error:', error));
}

function handleFlagFeedback(flagBtn, flaggedData) {
// Get Flag Modal Elements
const flagModal = document.getElementById('flagModal');
const flagCloseModal = document.getElementById('flagCloseModal');
const flagParticipateModal = document.getElementById('flagParticipateModal');
const flagCloseBtn = document.querySelector('.flag-close-btn');
const customAlertModal = document.getElementById('customAlertModal');


// Show Flag Modal on Flag Button Click
flagModal.style.display = 'block';


// Close Flag Modal on Close Button Click
flagCloseModal.addEventListener('click', () => {
  flagModal.style.display = 'none';
});

// Close Flag Modal on Top Right 'X' Button
flagCloseBtn.addEventListener('click', () => {
  flagModal.style.display = 'none';
});

// Open Rating Modal
flagParticipateModal.addEventListener('click', () => {
  flagModal.style.display = 'none';
  ratingModal.style.display = 'block';
});

// Close Rating Modal
document.querySelector('.rating-close-btn').addEventListener('click', () => {
  ratingModal.style.display = 'none';
});

// Close Rating Modal on Escape key press
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && ratingModal.style.display === 'block') {
    ratingModal.style.display = 'none';
  }
});

// Handle Rating Selection
document.querySelectorAll('.rating-box').forEach((box) => {
  box.addEventListener('click', (e) => {
    // Remove "selected" class from all siblings
    const allBoxes = box.parentElement.querySelectorAll('.rating-box');
    allBoxes.forEach((item) => item.classList.remove('selected'));

    // Add "selected" class to the clicked rectangle
    box.classList.add('selected');
  });
});

 // Submit Feedback
document.querySelector('.rating-submit-btn').addEventListener('click', () => {
  const feedback = {};
  const requiredFields = [
    "I. Completeness",
    "II. Accuracy",
    "III. Instruction Following",
    "IV. Contextual Awareness",
    "V. Writing & Tonality Quality",
    "VI. Creativity",
    "VII. Overall Final Score",
  ];

  let missingFields = []; // To track missing fields

  document.querySelectorAll('.rating-section').forEach((section) => {
    const dimensionName = section.querySelector('h3')?.textContent.trim(); // Get the dimension name
    const rating = section.querySelector('.selected')?.dataset.value; // Get selected rating
    const justification = section.querySelector('.justification')?.value.trim() || null; // Get justification

    if (dimensionName && rating) {
      feedback[dimensionName] = {
        rating: rating,
        justification: justification,
      };
    } else if (dimensionName) {
      missingFields.push(dimensionName); // Track dimensions without ratings
    }
  });

  // Validate if all required fields are present
  missingFields = requiredFields.filter((field) => !(field in feedback));
  if (missingFields.length > 0) {
    console.error("Missing feedback fields:", missingFields.join(", "));
    showCustomAlert(`Please complete the following fields: ${missingFields.join(", ")}`);
    return; // Stop submission if any fields are missing
  }

  console.log("Feedback Object:", feedback); // Debugging

  // Send feedback to the backend
  fetch('/submit-rlhf-feedback/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken, // Add CSRF token for secure requests
    },
    body: JSON.stringify({
      prompt: activeConversation.messages.find((msg) => msg.role === 'user')?.content || 'Unknown Prompt',
      response: flaggedData['response'], // Flagged response
      feedback: feedback,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        console.log('RLHF Feedback stored successfully:', data.message);
        showCustomAlert('Thank you for your detailed feedback!');
      } else {
        console.error('Error storing RLHF feedback:', data.error);
        showCustomAlert('Failed to store feedback. Please try again.');
      }
    })
    .catch((error) => {
      console.error('Fetch error:', error);
      showCustomAlert('An error occurred while submitting feedback.');
    });

  // Close the rating modal
  ratingModal.style.display = 'none';

  });

  // Close Flag Modal When Clicking Outside of Modal
  window.addEventListener('click', (e) => {
    if (e.target === flagModal) {
      flagModal.style.display = 'none';
    }
  });

  // Function to show a custom alert
  function showCustomAlert(message) {
    customAlertModal.querySelector('.custom-alert-message').textContent = message;
    customAlertModal.style.display = 'flex';

    setTimeout(() => {
      customAlertModal.style.display = 'none';
    }, 3000); // Display the alert for 3 seconds
  }


} /* End of Handle Feedback Flag */

/* Create Custom Prompt For conversation Rename */


function showCustomPrompt(initialValue, callback) {
  // Create the overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease';

  // Create the modal container
  const modal = document.createElement('div');
  modal.style.backgroundColor = '#ffffff';
  modal.style.padding = '25px';
  modal.style.borderRadius = '12px';
  modal.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
  modal.style.width = '350px';
  modal.style.textAlign = 'center';
  modal.style.animation = 'fadeIn 0.4s ease';
  modal.style.transform = 'scale(0.95)';
  modal.style.transition = 'transform 0.2s ease';

  // Add modal open animation
  setTimeout(() => {
    modal.style.transform = 'scale(1)';
  }, 10);

  // Create the title
  const title = document.createElement('p');
  title.innerText = 'Rename Conversation';
  title.style.marginBottom = '20px';
  title.style.fontFamily = `'Poppins', sans-serif`;
  title.style.fontSize = '20px';
  title.style.color = '#333';

  // Create the input
  const input = document.createElement('input');
  input.type = 'text';
  input.value = initialValue || '';
  input.style.width = '100%';
  input.style.padding = '10px';
  input.style.border = '1px solid #ccc';
  input.style.borderRadius = '8px';
  input.style.marginBottom = '20px';
  input.style.fontSize = '14px';
  input.style.fontFamily = `'Poppins', sans-serif`;
  input.style.outline = 'none';
  input.style.transition = 'border-color 0.2s ease';

  // Input hover and focus styles
  input.addEventListener('focus', () => {
    input.style.borderColor = '#4CAF50';
  });
  input.addEventListener('blur', () => {
    input.style.borderColor = '#ccc';
  });

  // Create the buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.justifyContent = 'space-between';
  buttonsContainer.style.gap = '10px';

  // Create the OK button
  const okButton = document.createElement('button');
  okButton.innerText = 'Save';
  okButton.style.flex = '1';
  okButton.style.padding = '10px 15px';
  okButton.style.backgroundColor = '#388E3C';
  okButton.style.color = '#ffffff';
  okButton.style.border = 'none';
  okButton.style.borderRadius = '8px';
  okButton.style.cursor = 'pointer';
  okButton.style.fontFamily = `'Poppins', sans-serif`;
  okButton.style.transition = 'background-color 0.2s ease';

  okButton.addEventListener('mouseover', () => {
    okButton.style.backgroundColor = '#45a049';
  });
  okButton.addEventListener('mouseout', () => {
    okButton.style.backgroundColor = '#4CAF50';
  });

  okButton.addEventListener('click', () => {
    if (callback) callback(input.value.trim()); // Pass the new value to the callback
    document.body.removeChild(overlay);
  });

  // Create the Cancel button
  const cancelButton = document.createElement('button');
  cancelButton.innerText = 'Cancel';
  cancelButton.style.flex = '1';
  cancelButton.style.padding = '10px 15px';
  cancelButton.style.backgroundColor = '#D32F2F';
  cancelButton.style.color = '#ffffff';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '8px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.style.fontFamily = `'Poppins', sans-serif`;
  cancelButton.style.transition = 'background-color 0.2s ease';

  cancelButton.addEventListener('mouseover', () => {
    cancelButton.style.backgroundColor = '#d7372f';
  });
  cancelButton.addEventListener('mouseout', () => {
    cancelButton.style.backgroundColor = '#f44336';
  });

  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  // Append elements to the modal
  buttonsContainer.appendChild(okButton);
  buttonsContainer.appendChild(cancelButton);
  modal.appendChild(title);
  modal.appendChild(input);
  modal.appendChild(buttonsContainer);

  // Append modal to overlay
  overlay.appendChild(modal);

  // Append overlay to the body
  document.body.appendChild(overlay);

  // Trigger fade-in effect
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);
}

});





