chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    // Code to be executed on first install
    const optionsUrl = `chrome-extension://${chrome.runtime.id}/options/index.html`;
    chrome.tabs.create({
      url: optionsUrl,
    });
  }
});
