/* =========================================================
   L'ORÉAL SMART BEAUTY ADVISOR
   Connected to the Cloudflare Worker
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

/* ---------- Cloudflare Worker URL ---------- */
/*
  This URL is safe to place in script.js.

  Your API key does NOT go here.
  The API key stays privately inside Cloudflare.
*/
const WORKER_URL =
  "https://lorealbot.ericwu20011213.workers.dev";

/* ---------- Conversation history LevelUp ---------- */
/*
  This array stores the user's questions and the chatbot's answers.

  Sending the earlier messages with each request lets the chatbot
  remember information from the conversation.
*/
let conversationHistory = [];

/* Keep only the newest 12 messages */
const MAX_HISTORY_MESSAGES = 12;

/* ---------- Suggested-question buttons ---------- */
suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Put the suggested question into the input
    userInput.value = button.dataset.question;

    // Submit the form
    chatForm.requestSubmit();
  });
});

/* ---------- Handle form submission ---------- */
chatForm.addEventListener("submit", async (event) => {
  // Prevent the page from refreshing
  event.preventDefault();

  // Get and clean the user's question
  const question = userInput.value.trim();

  // Do nothing when the input is empty
  if (question === "") {
    return;
  }

  /* Display the newest question above the chat */
  latestQuestionText.textContent = question;
  latestQuestion.hidden = false;

  /* Display the user's message bubble */
  addMessage("user", question);

  /* Add the question to conversation history */
  conversationHistory.push({
    role: "user",
    content: question,
  });

  /* Clear and disable the input while waiting */
  userInput.value = "";
  userInput.disabled = true;
  sendBtn.disabled = true;

  /* Show a temporary loading message */
  const loadingMessage = addMessage(
    "assistant",
    "Thinking..."
  );

  try {
    /*
      Send the conversation to the Cloudflare Worker.

      The Worker receives this messages array and then sends
      it to the OpenAI API using the secret API key.
    */
    const response = await fetch(WORKER_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        messages: conversationHistory.slice(
          -MAX_HISTORY_MESSAGES
        ),
      }),
    });

    /* Convert the Worker's response into JavaScript data */
    const data = await response.json();

    /*
      Throw an error when the Worker or OpenAI request failed.
    */
    if (!response.ok) {
      const errorMessage =
        data.error?.message ||
        data.error ||
        `Request failed with status ${response.status}.`;

      throw new Error(errorMessage);
    }

    /*
      The Chat Completions response contains the chatbot's
      message inside choices[0].message.content.
    */
    const assistantReply =
      data.choices?.[0]?.message?.content?.trim();

    // Make sure the answer contains text
    if (!assistantReply) {
      throw new Error(
        "The chatbot returned an empty response."
      );
    }

    /* Remove the temporary Thinking message */
    loadingMessage.remove();

    /* Display the real chatbot response */
    addMessage("assistant", assistantReply);

    /* Save the answer in conversation history */
    conversationHistory.push({
      role: "assistant",
      content: assistantReply,
    });

    /*
      Remove older messages if the history becomes too long.
    */
    if (
      conversationHistory.length >
      MAX_HISTORY_MESSAGES
    ) {
      conversationHistory = conversationHistory.slice(
        -MAX_HISTORY_MESSAGES
      );
    }
  } catch (error) {
    /* Remove the temporary Thinking message */
    loadingMessage.remove();

    /* Display the error in the browser console */
    console.error("Chatbot error:", error);

    /* Display a readable error in the chat */
    addMessage(
      "assistant",
      "Sorry, I could not connect to the beauty advisor. " +
        error.message
    );
  } finally {
    /* Enable the form again */
    userInput.disabled = false;
    sendBtn.disabled = false;

    /* Return the cursor to the input */
    userInput.focus();
  }
});

/* ---------- Add a message bubble ---------- */
function addMessage(role, text) {
  // Create the row that holds the message
  const messageRow = document.createElement("div");

  // Give the row a different class based on the sender
  if (role === "user") {
    messageRow.className = "message-row user-row";
  } else {
    messageRow.className =
      "message-row assistant-row";
  }

  /* Add the L avatar to assistant messages */
  if (role === "assistant") {
    const avatar = document.createElement("div");

    avatar.className = "avatar";
    avatar.textContent = "L";
    avatar.setAttribute("aria-hidden", "true");

    messageRow.appendChild(avatar);
  }

  /* Create the message bubble */
  const messageBubble = document.createElement("div");

  if (role === "user") {
    messageBubble.className =
      "message user-message";
  } else {
    messageBubble.className =
      "message assistant-message";
  }

  /*
    textContent displays the message safely without
    treating it as HTML code.
  */
  messageBubble.textContent = text;

  // Put the bubble inside the row
  messageRow.appendChild(messageBubble);

  // Add the message to the chat window
  chatWindow.appendChild(messageRow);

  // Scroll to the newest message
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Return the row so temporary messages can be removed
  return messageRow;
}