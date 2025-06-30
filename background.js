chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize-text",
    title: "\ud83e\udde0 Summarize with AI",
    contexts: ["selection"],
  });
});

let selectedText = "";

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize-text") {
    selectedText = info.selectionText || "";
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SELECTED_TEXT") {
    sendResponse({ selectedText });
  }
});
