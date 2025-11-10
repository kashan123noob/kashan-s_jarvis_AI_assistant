const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

// --- Add a chat message ---
function addMessage(msg, className) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg " + className;
    msgDiv.innerText = msg;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- Show typing animation ---
function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-msg bot-msg typing";
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv; // Return the element so we can remove it later
}

// --- Send message ---
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    addMessage(message, "user-msg");
    userInput.value = "";
    await getChatGPTResponse(message);
}

// --- Get ChatGPT response ---
async function getChatGPTResponse(message) {
    const typingDiv = showTyping(); // show typing dots

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_OPENAI_API_KEY" // replace with your key
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                max_tokens: 300
            })
        });

        const data = await response.json();
        const botMessage = data.choices[0].message.content.trim();

        // Remove typing animation
        typingDiv.remove();

        addMessage(botMessage, "bot-msg");

        // Text-to-Speech
        const utterance = new SpeechSynthesisUtterance(botMessage);
        window.speechSynthesis.speak(utterance);

    } catch (error) {
        typingDiv.remove();
        addMessage("Error: Could not connect to ChatGPT.", "bot-msg");
        console.error(error);
    }
}

// --- Voice input ---
function startListening() {
    if (!('webkitSpeechRecognition' in window)) {
        addMessage("Your browser does not support speech recognition.", "bot-msg");
        return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    const listeningMsg = addMessage("Listening...", "bot-msg");

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        listeningMsg.remove();
        addMessage(command, "user-msg");
        getChatGPTResponse(command);
    };
}

// --- Enter key sends message ---
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
