console.log("Content script loaded");

let modalSelector;
let modalExists = false;

function getSongInfo() {
  const songNameElement = document.querySelector(
    "[data-testid='context-item-link']"
  );
  const songArtistsElements = document.querySelectorAll(
    "[data-testid='context-item-info-artist']"
  );
  let songArtists = [];

  songArtistsElements.forEach((songArtistElement) => {
    songArtists.push(songArtistElement.textContent);
  });

  return {
    songName: songNameElement.textContent,
    songArtists,
  };
}

function createModal() {
  const modal = document.createElement("div");
  modal.id = "spotify-lyrics-modal";
  modal.setAttribute(
    "style",
    "display: flex; position: fixed; top: 0; right: 0; background: #1A1A1A; z-index: 999; padding: 10px; overflow-y: auto; height: calc(100vh - 120px); border-radius: 5px; width: 35%"
  );
  modalExists = true;
  document.body.appendChild(modal);
  modalSelector = modal;
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
