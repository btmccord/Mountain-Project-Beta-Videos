// Mountain Project Beta Videos
// Background script
// Version 1

let pattern = "https://www.mountainproject.com/comments*";

function onError(error) {
    console.error(`Error: ${error}`);
  }

function commentsLoaded(tabs) {
    for (const tab of tabs) {
        browser.tabs
          .sendMessage(tab.id, { trigger: "loaded" })
          .catch(onError);
      } 
}

browser.webRequest.onCompleted.addListener(() => {
    browser.tabs
      .query({
        currentWindow: true,
        active: true,
      })
      .then(commentsLoaded)
      .catch(onError);
  },{ urls : [pattern]} );