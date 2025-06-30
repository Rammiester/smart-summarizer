document.addEventListener("DOMContentLoaded", function () {
  // 🧭 Tab Switching
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      const tabId = tab.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  // 🧠 Load API key into input field on popup open
  const keyInput = document.getElementById("api-key-input");
  if (keyInput) {
    chrome.storage.sync.get("geminiApiKey", function (data) {
      if (data.geminiApiKey) keyInput.value = data.geminiApiKey;
    });
  }

  // 💾 Save API key when button is clicked
  const saveApiBtn = document.getElementById("save-api-btn");
  if (saveApiBtn) {
    saveApiBtn.addEventListener("click", () => {
      const key = keyInput.value.trim();
      chrome.storage.sync.set({ geminiApiKey: key }, () => {
        const status = document.getElementById("save-status");
        if (status) {
          status.textContent = "✅ API key saved!";
          setTimeout(() => (status.textContent = ""), 2000);
        }
      });
    });
  }

  // 🔍 Test Gemini API Key
  const testBtn = document.getElementById("test-api-btn");
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const key = keyInput.value.trim();
      const status = document.getElementById("test-status");
      if (!key || !status) return;
      status.style.color = "gray";
      status.textContent = "⏳ Testing...";
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.models)) {
          status.style.color = "green";
          status.textContent = "✅ Valid Gemini API key!";
        } else {
          status.style.color = "red";
          status.textContent = "❌ Invalid key. Check your billing.";
        }
      } catch (err) {
        status.style.color = "red";
        status.textContent = "❌ Could not test key. Network issue?";
      }
    });
  }

  // 🗑️ Reset settings button
  const resetBtn = document.getElementById("reset-settings-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      chrome.storage.sync.clear(() => {
        if (keyInput) keyInput.value = "";
        const status = document.getElementById("save-status");
        if (status) {
          status.textContent = "🔄 Settings reset!";
          setTimeout(() => (status.textContent = ""), 2000);
        }
      });
    });
  }

  // Summary Tab Logic
  const styleSelect = document.getElementById("style-select");
  const output = document.getElementById("output");
  const loader = document.getElementById("loader");
  const copyBtn = document.getElementById("copy-btn");

  if (styleSelect && output) {
    chrome.storage.sync.get(["selectedStyle", "geminiApiKey"], function (data) {
      const savedStyle = data.selectedStyle || "default";
      const apiKey = data.geminiApiKey;
      styleSelect.value = savedStyle;

      if (!apiKey) {
        output.textContent =
          "⚠️ Gemini API key not set. Go to extension settings.";
        return;
      }

      chrome.runtime.sendMessage(
        { type: "GET_SELECTED_TEXT" },
        function (response) {
          const selected = response?.selectedText || "No text selected.";
          output.textContent = selected;
          if (loader) loader.style.display = "block";
          if (copyBtn) copyBtn.style.display = "none";
          summarizeTextWithGemini(selected, apiKey);
        }
      );
    });

    styleSelect.addEventListener("change", () => {
      const selectedStyle = styleSelect.value;
      const selectedText = output.textContent;
      chrome.storage.sync.set({ selectedStyle });
      chrome.storage.sync.get("geminiApiKey", function (data) {
        const apiKey = data.geminiApiKey;
        if (!apiKey) return;
        if (selectedText && selectedText !== "No text selected.") {
          if (loader) loader.style.display = "block";
          summarizeTextWithGemini(selectedText, apiKey);
        }
      });
    });
  }

  // Auto-save API key on input (debounced)
  if (keyInput) {
    let debounceTimer;
    keyInput.addEventListener("input", (e) => {
      const key = e.target.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        chrome.storage.sync.set({ geminiApiKey: key }, () => {
          const status = document.getElementById("save-status");
          if (status) {
            status.textContent = "✅ API key saved!";
            setTimeout(() => (status.textContent = ""), 1500);
          }
        });
      }, 500);
    });
  }

  updateHistoryUI();

  const darkToggle = document.getElementById("dark-toggle");
  if (darkToggle) {
    chrome.storage.sync.get("darkMode", (data) => {
      const isDark = data.darkMode === true;
      document.documentElement.setAttribute(
        "data-theme",
        isDark ? "dark" : "light"
      );
      darkToggle.checked = isDark;
    });

    darkToggle.addEventListener("change", () => {
      const isDark = darkToggle.checked;
      chrome.storage.sync.set({ darkMode: isDark }, () => {
        document.documentElement.setAttribute(
          "data-theme",
          isDark ? "dark" : "light"
        );
      });
    });
  }
});

async function summarizeTextWithGemini(text, apiKey) {
  const style = document.getElementById("style-select")?.value || "default";

  let promptPrefix = "Summarize the following text in 1-2 sentences:";
  switch (style) {
    case "eli5":
      promptPrefix =
        "Explain the following text simply, like you're talking to a child. Use short sentences and easy words:";
      break;
    case "bullets":
      promptPrefix = "Summarize the following text in bullet points:";
      break;
    case "tweet":
      promptPrefix =
        "Summarize the following text as a tweet (under 280 characters):";
      break;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${promptPrefix}${text}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

    const output = document.getElementById("output");
    const loader = document.getElementById("loader");
    const copyBtn = document.getElementById("copy-btn");
    const exportBtn = document.getElementById("export-btn");

    if (loader) loader.style.display = "none";
    if (output) output.textContent = summary || "No summary returned.";

    if (summary && copyBtn && exportBtn) {
      copyBtn.style.display = "inline-block";
      exportBtn.style.display = "inline-block";

      copyBtn.onclick = () => {
        navigator.clipboard.writeText(summary).then(() => {
          copyBtn.textContent = "✅ Copied!";
          setTimeout(() => (copyBtn.textContent = "📋 Copy Summary"), 1500);
        });
      };

      exportBtn.onclick = () => {
        const blob = new Blob([summary], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "summary.txt";
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    chrome.storage.local.get("summaryHistory", (data) => {
      const history = data.summaryHistory || [];
      const newEntry = {
        text: summary,
        time: new Date().toLocaleTimeString(),
      };
      const updated = [newEntry, ...history].slice(0, 3);
      chrome.storage.local.set({ summaryHistory: updated }, updateHistoryUI);
    });
  } catch (err) {
    console.error("❌ Gemini API error:", err);
    const loader = document.getElementById("loader");
    const output = document.getElementById("output");
    if (loader) loader.style.display = "none";
    if (output) output.textContent = "Something went wrong.";
  }
}

function updateHistoryUI() {
  chrome.storage.local.get("summaryHistory", (data) => {
    const list = document.getElementById("history-list");
    if (!list) return;

    list.innerHTML = "";
    const history = data.summaryHistory || [];

    history.forEach((entry, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div style="margin-bottom: 6px;">
          🕒 ${entry.time}
          <button style="float: right;" data-index="${index}">📋</button><br/>
          <div style="font-size: 12px;">${entry.text}</div>
        </div>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll("button").forEach((btn) => {
      btn.onclick = (e) => {
        const idx = e.target.getAttribute("data-index");
        const text = history[idx]?.text;
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            e.target.textContent = "✅";
            setTimeout(() => (e.target.textContent = "📋"), 1500);
          });
        }
      };
    });
  });
}
