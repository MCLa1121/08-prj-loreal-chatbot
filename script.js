/* =========================================================
   L'ORÉAL SMART BEAUTY ADVISOR
   Temporary version that works without an API key
   ========================================================= */

/* ---------- Get the HTML elements ---------- */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

const latestQuestion = document.getElementById("latestQuestion");
const latestQuestionText = document.getElementById(
  "latestQuestionText"
);

const suggestionButtons =
  document.querySelectorAll(".suggestion-chip");

/* ---------- Listen for suggested-question clicks ---------- */
suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Put the button's question into the input box
    userInput.value = button.dataset.question;

    // Submit the form automatically
    chatForm.requestSubmit();
  });
});

/* ---------- Listen for form submission ---------- */
chatForm.addEventListener("submit", (event) => {
  // Prevent the page from refreshing
  event.preventDefault();

  // Get the text the user entered
  const question = userInput.value.trim();

  // Stop if the input is empty
  if (question === "") {
    return;
  }

  /* Show the latest question above the chat */
  latestQuestionText.textContent = question;
  latestQuestion.hidden = false;

  /* Add the user's message bubble */
  addMessage("user", question);

  /* Clear the input box */
  userInput.value = "";

  /* Temporarily disable the form */
  userInput.disabled = true;
  sendBtn.disabled = true;

  /* Show a temporary typing message */
  const loadingMessage = addMessage(
    "assistant",
    "Thinking..."
  );

  /*
    Wait one second to simulate the chatbot responding.

    Later, we will replace this section with the real
    Cloudflare Worker and OpenAI request.
  */
  setTimeout(() => {
    // Remove the temporary "Thinking..." message
    loadingMessage.remove();

    // Create a temporary response
    const response = createTemporaryResponse(question);

    // Display the assistant response
    addMessage("assistant", response);

    // Enable the form again
    userInput.disabled = false;
    sendBtn.disabled = false;

    // Put the cursor back inside the input
    userInput.focus();
  }, 1000);
});

/* ---------- Add a message bubble ---------- */
function addMessage(role, text) {
  // Create the row that holds the message
  const messageRow = document.createElement("div");

  /*
    User messages go on the right.
    Assistant messages go on the left.
  */
  if (role === "user") {
    messageRow.className = "message-row user-row";
  } else {
    messageRow.className = "message-row assistant-row";
  }

  /* Add an avatar for assistant messages */
  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "L";

    messageRow.appendChild(avatar);
  }

  /* Create the actual message bubble */
  const messageBubble = document.createElement("div");

  if (role === "user") {
    messageBubble.className = "message user-message";
  } else {
    messageBubble.className =
      "message assistant-message";
  }

  /*
    Use textContent instead of innerHTML.

    This safely displays the message as text.
  */
  messageBubble.textContent = text;

  // Put the bubble inside the row
  messageRow.appendChild(messageBubble);

  // Put the row inside the chat window
  chatWindow.appendChild(messageRow);

  // Scroll down to the newest message
  chatWindow.scrollTop = chatWindow.scrollHeight;

  /*
    Return the row so it can be removed later,
    such as the temporary "Thinking..." message.
  */
  return messageRow;
}

/* ---------- Temporary chatbot responses ---------- */
function createTemporaryResponse(question) {
  // Convert the question to lowercase for easier checking
  const lowerQuestion = question.toLowerCase();

  /* Skincare response */
  if (
    lowerQuestion.includes("skin") ||
    lowerQuestion.includes("serum") ||
    lowerQuestion.includes("moisturizer")
  ) {
    return (
      "A simple skincare routine can include a cleanser, " +
      "serum, moisturizer, and sunscreen. To personalize it, " +
      "I would also ask about your skin type and main concern."
    );
  }

  /* Haircare response */
  if (
    lowerQuestion.includes("hair") ||
    lowerQuestion.includes("shampoo") ||
    lowerQuestion.includes("conditioner")
  ) {
    return (
      "For a haircare recommendation, I would first consider " +
      "your hair type, dryness level, damage, and styling habits. " +
      "You could begin with a gentle shampoo and moisturizing conditioner."
    );
  }

  /* Makeup response */
  if (
    lowerQuestion.includes("makeup") ||
    lowerQuestion.includes("foundation") ||
    lowerQuestion.includes("mascara") ||
    lowerQuestion.includes("lipstick")
  ) {
    return (
      "For an everyday makeup routine, you could use a light " +
      "base product, mascara, blush, and lip color. Your preferred " +
      "coverage and finish would help me give a better recommendation."
    );
  }

  /* Fragrance response */
  if (
    lowerQuestion.includes("fragrance") ||
    lowerQuestion.includes("perfume")
  ) {
    return (
      "I can help you explore fragrance families such as floral, " +
      "fresh, woody, or warm scents. What type of scent do you " +
      "usually enjoy?"
    );
  }

  /*
    Temporary refusal for questions outside the chatbot's topic.
    The real AI system prompt will handle this later.
  */
  return (
    "I’m designed to help with L’Oréal products, skincare, " +
    "haircare, makeup, fragrances, and beauty routines. " +
    "Please ask me a beauty-related question."
  );
}