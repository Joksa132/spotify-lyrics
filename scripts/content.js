console.log("Content script loaded");

let modalSelector;
let modalExists = false;

function createModal() {
  const modal = document.createElement("div");
  modal.id = "spotify-lyrics-modal";

  modalExists = true;
  document.body.appendChild(modal);

  modalSelector = modal;
}

function createCloseButton() {
  const button = document.createElement("button");
  button.className = "close-button";
  button.innerHTML = "X";
  button.addEventListener("click", () => {
    modalSelector.classList.remove("lyrics-modal-open");
  });
  modalSelector.appendChild(button);
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

      createCloseButton();
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    modalSelector.innerHTML = "";

    const errElement = document.createElement("span");
    errElement.textContent = "Error fetching lyrics";
    modalSelector.appendChild(errElement);

    createCloseButton();
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

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const songNameElement = document.querySelector(
      "[data-testid='context-item-link']"
    );

    if (mutation.target.contains(songNameElement)) {
      handleLyrics();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
