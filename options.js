// Mountain Project Beta Videos
// Options script
// Version 1.2

var browser;
if (typeof browser === "undefined") {
    browser = chrome;
}

function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
      hideComments: document.querySelector("#hideComments").checked,
    });
    document.getElementById("submit_success").classList.add("show");
    document.getElementById("hideComments").addEventListener("click", function(){
      document.getElementById("submit_success").classList.remove("show");
    })
  }
  
  function restoreOptions() {
    function setCurrentChoice(result) {
      document.querySelector("#hideComments").checked = result.hideComments || false;
    }
  
    function onError(error) {
      console.log(`Error: ${error}`);
    }
  
    let getting = browser.storage.sync.get("hideComments");
    getting.then(setCurrentChoice, onError);
  }
  
  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);
  