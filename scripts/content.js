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

async function getSongLyrics() {
  const songInfo = getSongInfo();
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${songInfo.songArtists[0]}/${songInfo.songName}`
  );

  const songLyrics = await response.json();
  return songLyrics.lyrics;
}

function createModal() {
  const modal = document.createElement("div");
  modal.id = "spotify-lyrics-modal";

  modalExists = true;
  document.body.appendChild(modal);
  modalSelector = modal;
  handleLyrics();
}

async function handleLyrics() {
  try {
    const lyrics = await getSongLyrics();
    if (lyrics) {
      const lines = lyrics.split("\n");
      const modifiedLyrics = lines.slice(1).join("\n");
      modalSelector.innerHTML = `<pre>${modifiedLyrics}</pre>`;
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    modalSelector.innerHTML = "Error fetching lyrics";
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
