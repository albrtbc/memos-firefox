document.getElementById("saveKey").textContent = chrome.i18n.getMessage("saveBtn");
document.getElementById("saveTag").textContent = chrome.i18n.getMessage("saveBtn");

document.getElementById("apiUrl").placeholder = chrome.i18n.getMessage("placeApiUrl");
document.getElementById("apiTokens").placeholder = chrome.i18n.getMessage("placeApiTokens");
document.getElementById("content").placeholder = chrome.i18n.getMessage("placeContent");

document.querySelector("#lockPrivate span").textContent = chrome.i18n.getMessage("lockPrivate");
document.querySelector("#lockProtected span").textContent = chrome.i18n.getMessage("lockProtected");
document.querySelector("#lockPublic span").textContent = chrome.i18n.getMessage("lockPublic");

document.getElementById("content_submit_text").textContent = chrome.i18n.getMessage("submitBtn");

document.getElementById("hideInput").placeholder = chrome.i18n.getMessage("placeHideInput");
document.getElementById("showInput").placeholder = chrome.i18n.getMessage("placeShowInput");