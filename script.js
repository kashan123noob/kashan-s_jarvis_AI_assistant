const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function addMessage(msg, className) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg " + className;
    msgDiv.innerText = msg;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

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
    return typingDiv;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    addMessage(message, "user-msg");
    userInput.value = "";
    await getChatGPTResponse(message);
}

async function getChatGPTResponse(message) {
    const typingDiv = showTyping();

    try {
        const response = await fetch("https://YOUR_BACKEND_URL/chat", {  // Replace with your backend URL
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        const botMessage = data.choices[0].message.content.trim();

        typingDiv.remove();
        addMessage(botMessage, "bot-msg");

        const utterance = new SpeechSynthesisUtterance(botMessage);
        window.speechSynthesis.speak(utterance);

    } catch (error) {
        typingDiv.remove();
        addMessage("Error: Could not connect to ChatGPT.", "bot-msg");
        console.error(error);
    }
}

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

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
