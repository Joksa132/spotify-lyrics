let isOpened = false;

chrome.action.onClicked.addListener(() => {
  console.log("CLICKED EXTENSION");
  isOpened = !isOpened;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { message: "CLICKED", isOpened });
  });
});
