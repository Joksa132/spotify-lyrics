console.log("Content script loaded");

let modalSelector;
let modalExists = false;

function createModal() {
  const modal = document.createElement("div");
  modal.id = "spotify-lyrics-modal";
  modal.setAttribute(
    "style",
    "display: flex; position: fixed; top: 0; right: 0; background: #121212; z-index: 999; padding: 10px; overflow-y: auto; height: calc(100vh - 120px); border-radius: 5px; width: 300px"
  );
  document.body.appendChild(modal);
  modalSelector = modal;
  modalExists = true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "CLICKED") {
    if (modalExists) {
      request.isOpened
        ? (modalSelector.style.display = "none")
        : (modalSelector.style.display = "flex");
    } else {
      createModal();
    }
  }
});
