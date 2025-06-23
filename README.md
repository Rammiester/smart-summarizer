# 🧠 Smart Summarizer — Chrome Extension

**Smart Summarizer** is a Chrome Extension that lets users quickly summarize selected text on any webpage using AI (OpenAI integration coming soon).

This project is part of a personal 2-week challenge to **build and learn in public** using JavaScript, Chrome APIs, and AI.

GitHub Repo: [github.com/Rammiester/smart-summarizer](https://github.com/Rammiester/smart-summarizer)

---

## 📌 Features (Week 1)

✅ Highlight text on any webpage  
✅ Right-click to access a custom context menu: **“🧠 Summarize with AI”**  
✅ Selected text is captured and stored via background script  
✅ Popup UI fetches and displays the selected text using message passing

---

## 💡 How It Works (So Far)

1. User selects text on a webpage  
2. Right-click → selects "Summarize with AI"  
3. Background script stores the selected text  
4. When the popup is opened, it requests the stored text from background.js  
5. The popup displays the selected text as a placeholder for the AI summary

---

## 📦 Tech Stack

- Manifest V3 Chrome Extension  
- JavaScript (Vanilla)  
- Chrome APIs: `contextMenus`, `runtime.sendMessage`  
- HTML/CSS (for popup UI)

---

## 🛠️ Project Structure
```└── smart-summarizer/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── images/
│ └── icon.png
└── README.md
```

---

## 🚧 Coming in Week 2

- Integrate OpenAI API to generate summaries  
- Display AI response in popup  
- Handle API errors and loading states  
- Experiment with different summary styles (tweet-size, ELI5, etc.)

---

## 🙌 Why This Project?

I wanted to stay consistent with my learning and apply concepts hands-on.  
A friend simply said, *"Build something to keep the momentum going."*  
So here we are. Learning by doing — and sharing along the way.

---

## 📸 Demo (Week 1)

![Right-click and popup](![image](https://github.com/user-attachments/assets/9bd1750e-f512-482e-9efc-45badfc52df6)
)

---

## 🏷️ Tags

`#chrome-extension` `#javascript` `#openai` `#buildinpublic` `#learningbydoing`

