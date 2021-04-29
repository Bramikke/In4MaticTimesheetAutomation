chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  let url = tabs[0].url;
  let content = document.getElementById('content');
  // When URL is not Officient self service, show error message
  if (!url.includes('https://selfservice.officient.io/daysoff')) {
    showErrorMessage(content);
    return;
  }
  // Officient self service is open
  showGeneratingMessage(content);
  setTimeout(() => {
    generateTimesheet(tabs[0]);
  }, 1000);
});

function showErrorMessage(content) {
  let nHeader = content.getElementsByTagName('h3')[0];
  let nNewLine = document.createElement('p');
  let nHeaderText = document.createTextNode(
    'Officient self service is not opened...'
  );
  nHeader.appendChild(nHeaderText);
  let nContentText = document.createTextNode('Open Officient self service:');
  let nContentLink = document.createElement('a');
  let nContentLinkText = document.createTextNode('Officient calendar');
  nContentLink.href = '';
  nContentLink.onclick = function () {
    chrome.tabs.create({ url: 'https://selfservice.officient.io/daysoff' });
  };
  nContentLink.appendChild(nContentLinkText);

  content.appendChild(nContentText);
  content.appendChild(nNewLine);
  content.appendChild(nContentLink);
}

function showGeneratingMessage(content) {
  let nHeader = content.getElementsByTagName('h3')[0];
  let nHeaderText = document.createTextNode('Generating timesheet...');
  nHeader.appendChild(nHeaderText);
}

function onAttach(tabId) {
  //first enable the Network
  chrome.debugger.sendCommand({ tabId: tabId }, 'Network.enable');
  chrome.debugger.onEvent.addListener(allEventHandler);
}

function allEventHandler(debuggeeId, message, params) {
  if (currentTab.id != debuggeeId.tabId) {
    return;
  }

  if (message == 'Network.responseReceived') {
    //response return
    chrome.debugger.sendCommand(
      {
        tabId: debuggeeId.tabId,
      },
      'Network.getResponseBody',
      {
        requestId: params.requestId,
      },
      function (response) {
        // you get the response body here!
        // you can close the debugger tips by:
        chrome.debugger.detach(debuggeeId);
      }
    );
  }
}

function generateTimesheet(tab) {
  // get days_off from localstorage in active tab
  chrome.tabs.executeScript(
    tab.id,
    {
      code: `localStorage['days_off']`,
    },
    async (days_off) => {
      if (days_off[0]) {
        days_off = JSON.parse(days_off);
        // save days_off to storage of extension
        chrome.storage.local.set({ days_off });
      }
      // create template in new tab
      chrome.tabs.create({
        url: chrome.extension.getURL('../timesheet/template.html'),
      });
    }
  );
}
