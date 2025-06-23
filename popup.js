document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ type: "GET_SELECTED_TEXT" }, function (response) {
    const output = document.getElementById('output');
    output.textContent = response?.selectedText || "No text selected.";
  });
});
