const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const modal = document.getElementById("modal");
const settingsBtn = document.getElementById("settings-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const saveKeyBtn = document.getElementById("save-key-btn");
const apiKeyInput = document.getElementById("api-key-input");

let conversationHistory = [];

// Vicky AI System Persona Prompt
const SYSTEM_PROMPT = `You are Vicky AI (விக்கி ஏஐ), a brilliant, modern, empathetic bilingual assistant fluent in English and Tamil. 
Give concise, helpful, well-formatted answers with markdown styling.`;

// Settings Modal Management
settingsBtn.onclick = () => {
  apiKeyInput.value = localStorage.getItem("vicky_gemini_key") || "";
  modal.classList.remove("hidden");
};
closeModalBtn.onclick = () => modal.classList.add("hidden");

saveKeyBtn.onclick = () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem("vicky_gemini_key", key);
    modal.classList.add("hidden");
    alert("API Key saved successfully!");
  }
};

// Auto scroll chat to bottom
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Append message bubble
function appendMessage(role, text) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `flex gap-2.5 ${role === "user" ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");
  bubble.className = role === "user"
    ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-sm"
    : "bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-tl-sm p-3.5 max-w-[85%] text-sm leading-relaxed prose prose-invert";

  if (role === "assistant") {
    bubble.innerHTML = marked.parse(text);
  } else {
    bubble.textContent = text;
  }

  msgWrapper.appendChild(bubble);
  chatBox.appendChild(msgWrapper);
  scrollToBottom();
}

// Send message to Gemini API (Free tier)
chatForm.onsubmit = async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  const apiKey = localStorage.getItem("vicky_gemini_key");

  if (!apiKey) {
    settingsBtn.click();
    return;
  }
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";
  sendBtn.disabled = true;

  // Add user prompt to conversation
  conversationHistory.push({ role: "user", parts: [{ text: message }] });

  // Placeholder for AI Response
  const loadingWrapper = document.createElement("div");
  loadingWrapper.className = "flex gap-2.5 justify-start text-xs text-slate-400 italic";
  loadingWrapper.id = "loader";
  loadingWrapper.textContent = "Vicky AI is thinking...";
  chatBox.appendChild(loadingWrapper);
  scrollToBottom();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    loadingWrapper.remove();

    if (data.candidates && data.candidates[0].content) {
      const reply = data.candidates[0].content.parts[0].text;
      conversationHistory.push({ role: "model", parts: [{ text: reply }] });
      appendMessage("assistant", reply);
    } else {
      appendMessage("assistant", "⚠️ " + (data.error ? data.error.message : JSON.stringify(data)));
    }
  } catch (err) {
    loadingWrapper.remove();
    appendMessage("assistant", "⚠️ Connection error. Check your internet connection.");
  } finally {
    sendBtn.disabled = false;
  }
};
