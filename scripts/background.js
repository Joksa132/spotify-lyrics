chrome.action.onClicked.addListener(() => {
  console.log("CLICKED EXTENSION");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "CLICKED" });
  });
});
