console.log("Content script loaded");

let modalSelector;
let modalExists = false;
const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";

function createModal() {
  const modal = document.createElement("div");
  modal.id = "spotify-lyrics-modal";

  modalExists = true;
  document.body.appendChild(modal);

  modalSelector = modal;
}

function createButton(buttonType) {
  const buttonContainer = document.querySelector(".button-container");
  const button = document.createElement("button");
  if (buttonType === "close") {
    button.className = "close-button";
    button.innerHTML = "X";
    button.addEventListener("click", () => {
      modalSelector.classList.remove("lyrics-modal-open");
    });
  } else if (buttonType === "update") {
    button.className = "update-button";
    button.innerHTML = "Update";
    button.addEventListener("click", () => {
      handleLyrics();
    });
  }
  buttonContainer.appendChild(button);
}

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

async function getSongLyrics() {
  const songInfo = getSongInfo();
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${songInfo.songArtists[0]}/${songInfo.songName}`
  );

  const songLyrics = await response.json();
  return songLyrics.lyrics;
}

async function handleLyrics() {
  try {
    const lyrics = await getSongLyrics();
    if (lyrics) {
      const lines = lyrics.split("\n");
      const modifiedLyrics = lines.slice(1).join("\n");
      modalSelector.innerHTML = "";

      const preElement = document.createElement("pre");
      preElement.textContent = modifiedLyrics;
      modalSelector.appendChild(preElement);
      modalSelector.appendChild(buttonContainer);

      buttonContainer.innerHTML = "";

      createButton("update");
      createButton("close");
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    modalSelector.innerHTML = "";

    const errElement = document.createElement("span");
    errElement.textContent = "Error fetching lyrics";
    modalSelector.appendChild(errElement);
    modalSelector.appendChild(buttonContainer);

    buttonContainer.innerHTML = "";

    createButton("update");
    createButton("close");
  }
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "CLICKED") {
    if (modalExists) {
      if (request.isOpened) {
        modalSelector.classList.remove("lyrics-modal-open");
      } else {
        modalSelector.classList.add("lyrics-modal-open");
        handleLyrics();
      }
    } else {
      createModal();
    }
  }
});
