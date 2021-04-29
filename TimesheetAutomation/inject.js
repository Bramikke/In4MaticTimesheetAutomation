/**
 * code in inject.js
 * added "web_accessible_resources": ["injected.js"] to manifest.json
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  postMessage({ extensionMessage: request }, '*');
});
var s = document.createElement('script');
s.src = chrome.extension.getURL('injected.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
