let latestSelectedText = "";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize",
    title: "🧠 Summarize with AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize") {
    latestSelectedText = info.selectionText || "";
    console.log("You selected:", latestSelectedText);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SELECTED_TEXT") {
    sendResponse({ selectedText: latestSelectedText });
  }
  return true;
});
