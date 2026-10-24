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
let pendingImage = null;

const SYSTEM_PROMPT = `You are Vicky AI (விக்கி ஏஐ), a friendly bilingual assistant for English and Tamil. Reply in the same language the user writes (Tamil script, English, or Tanglish). Give concise, helpful, well-formatted answers with markdown. When the user sends a screenshot, look at it carefully: say exactly what you see, where the problem is, and give clear numbered steps telling them where to tap (for example, if an icon is missing, suggest checking the three-dot menu). Ask for another screenshot if you need more detail.`;

const MODELS = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"];

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

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(role, text, imageUrl) {
  const msgWrapper = document.createElement("div");
  msgWrapper.className = `flex gap-2.5 ${role === "user" ? "justify-end" : "justify-start"}`;

  const bubble = document.createElement("div");
  bubble.className = role === "user"
    ? "bg-indigo-600 border border-indigo-500 text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-sm"
    : "bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl rounded-tl-sm p-3.5 max-w-[85%] text-sm leading-relaxed prose prose-invert";

  if (role === "assistant") {
    bubble.innerHTML = marked.parse(text);
  } else {
    bubble.textContent = text;
    if (imageUrl) {
      const im = document.createElement("img");
      im.src = imageUrl;
      im.style.cssText = "max-width:100%;border-radius:8px;margin-top:6px;display:block";
      bubble.appendChild(im);
    }
  }

  msgWrapper.appendChild(bubble);
  chatBox.appendChild(msgWrapper);
  scrollToBottom();
  return bubble;
}

// ---------- 📎 Screenshot + 🎤 Voice buttons ----------
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

function makeBtn(label) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = label;
  b.style.cssText = "font-size:22px;padding:0 8px;background:transparent;border:0;cursor:pointer;color:inherit;";
  return b;
}
const attachBtn = makeBtn("📎");
const micBtn = makeBtn("🎤");
sendBtn.parentNode.insertBefore(micBtn, sendBtn);
sendBtn.parentNode.insertBefore(attachBtn, micBtn);

const previewBar = document.createElement("div");
previewBar.style.cssText = "display:none;align-items:center;padding:6px 12px;";
chatForm.parentNode.insertBefore(previewBar, chatForm);

function showPreview() {
  if (!pendingImage) {
    previewBar.style.display = "none";
    previewBar.innerHTML = "";
    return;
  }
  previewBar.style.display = "flex";
  previewBar.innerHTML = `<img src="${pendingImage.preview}" style="height:56px;border-radius:8px;margin-right:10px"><button type="button" id="rm-img" style="font-size:18px;background:transparent;border:0;color:inherit;cursor:pointer">✖</button>`;
  document.getElementById("rm-img").onclick = () => {
    pendingImage = null;
    showPreview();
  };
}

attachBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const url = c.toDataURL("image/jpeg", 0.8);
      pendingImage = { mimeType: "image/jpeg", data: url.split(",")[1], preview: url };
      showPreview();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  fileInput.value = "";
};

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recog = null;
let recognizing = false;

micBtn.onclick = () => {
  if (!SR) {
    alert("இந்த browser-ல் voice வசதி இல்லை. Chrome பயன்படுத்தவும்.");
    return;
  }
  if (recognizing) {
    recog.stop();
    return;
  }
  recog = new SR();
  recog.lang = "ta-IN";
  recog.interimResults = true;
  recog.continuous = false;
  const base = userInput.value;
  recog.onstart = () => {
    recognizing = true;
    micBtn.textContent = "🔴";
  };
  recog.onresult = (e) => {
    let t = "";
    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
    userInput.value = (base ? base + " " : "") + t;
  };
  recog.onend = () => {
    recognizing = false;
    micBtn.textContent = "🎤";
  };
  recog.onerror = () => {
    recognizing = false;
    micBtn.textContent = "🎤";
  };
  recog.start();
};

// ---------- Gemini streaming ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function streamFromModel(model, apiKey, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory,
    }),
  });

  if (!response.ok) {
    let msg = "";
    try { msg = (await response.json()).error.message; } catch (e) {}
    const err = new Error(msg || "HTTP " + response.status);
    err.status = response.status;
    throw err;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const json = line.slice(5).trim();
      if (!json) continue;
      try {
        const d = JSON.parse(json);
        const parts = (d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) || [];
        for (const p of parts) {
          if (p.text && !p.thought) {
            full += p.text;
            onChunk(full);
          }
        }
      } catch (e) {}
    }
  }
  return full;
}

chatForm.onsubmit = async (e) => {
  e.preventDefault();
  const apiKey = localStorage.getItem("vicky_gemini_key");
  if (!apiKey) {
    settingsBtn.click();
    return;
  }

  const message = userInput.value.trim();
  if (!message && !pendingImage) return;

  const text = message || "இந்த screenshot-ல் என்ன பிரச்சினை? நான் எங்கே என்ன செய்ய வேண்டும்?";
  const img = pendingImage;
  pendingImage = null;
  showPreview();

  appendMessage("user", message || "📷 Screenshot", img && img.preview);
  userInput.value = "";
  sendBtn.disabled = true;

  const parts = [];
  if (img) parts.push({ inlineData: { mimeType: img.mimeType, data: img.data } });
  parts.push({ text });
  conversationHistory.push({ role: "user", parts });
  const userIndex = conversationHistory.length - 1;

  const loadingWrapper = document.createElement("div");
  loadingWrapper.className = "flex gap-2.5 justify-start text-xs text-slate-400 italic";
  loadingWrapper.textContent = "Vicky AI is thinking...";
  chatBox.appendChild(loadingWrapper);
  scrollToBottom();

  let bubble = null;
  let reply = "";
  let keyProblem = false;

  outer:
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        reply = await streamFromModel(model, apiKey, (t) => {
          if (!bubble) {
            loadingWrapper.remove();
            bubble = appendMessage("assistant", "");
          }
          bubble.innerHTML = marked.parse(t);
          scrollToBottom();
        });
        if (reply) break outer;
        throw new Error("empty reply");
      } catch (err) {
        if (bubble) {
          bubble.parentElement.remove();
          bubble = null;
          chatBox.appendChild(loadingWrapper);
        }
        if (err.status === 401 || err.status === 403 || /api key/i.test(err.message)) {
          keyProblem = true;
          break outer;
        }
        if (err.status === 404) break;
        await sleep(1500 * (attempt + 1));
      }
    }
  }

  loadingWrapper.remove();

  if (reply) {
    // படத்தை history-ல் இருந்து நீக்கி, அடுத்த கேள்விகள் வேகமாக இருக்கும்
    conversationHistory[userIndex] = {
      role: "user",
      parts: [{ text: text + (img ? " [screenshot sent]" : "") }],
    };
    conversationHistory.push({ role: "model", parts: [{ text: reply }] });
  } else {
    conversationHistory.pop();
    appendMessage(
      "assistant",
      keyProblem
        ? "⚠️ API key சரியாக இல்லை. ⚙️ Key-ல் சரிபார்க்கவும்."
        : "😅 Vicky AI இப்போது கொஞ்சம் busy. சில நொடிகள் கழித்து மீண்டும் அனுப்புங்கள்."
    );
  }
  sendBtn.disabled = false;
};
