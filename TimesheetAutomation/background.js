chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    // Code to be executed on first install
    const optionsUrl = `chrome-extension://${chrome.runtime.id}/options/index.html`;
    chrome.tabs.create({
      url: optionsUrl,
    });
  }
});

function registerWebRequestListener() {
  // Get webrequest details when api call is made
  chrome.webRequest.onBeforeSendHeaders.addListener(
    onBeforeSendHeaders,
    {
      urls: [
        'https://selfservice.officient.io/api/selfservice/secured/days_off/*',
      ],
    },
    ['requestHeaders']
  );
}

// Create a new request with request authentication headers
function onBeforeSendHeaders(details) {
  if (
    details.url.match(
      /api\/selfservice\/secured\/days_off\/\d{4}\/listDaysOff/g
    )
  ) {
    // pause listener to prevent infinite loop
    chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders);
    // create new webrequest to gather response data
    const http = new XMLHttpRequest();
    http.responseType = 'json';
    http.open('GET', details.url, true);
    http.setRequestHeader(
      'Authselfservice',
      // restart listener when request is done
      details.requestHeaders.find((req) => req.name === 'Authselfservice').value
    );
    http.onload = function () {
      chrome.storage.local.set({
        load_type: 'officient',
        days_off: http.response,
      });
      registerWebRequestListener();
    };
    http.send();
  }
}

registerWebRequestListener();
