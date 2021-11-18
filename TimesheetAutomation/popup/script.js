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
    generateTimesheet();
  }, 1000);
});

function showErrorMessage(content) {
  let nHeader = document.createElement('h3');
  let nNewLine = document.createElement('p');
  let nHeaderText = document.createTextNode(
    'Officient self service is not opened...'
  );
  nHeader.appendChild(nHeaderText);
  let nContentText = document.createTextNode('Open Officient self service:');
  let nContentLink = document.createElement('a');
  let nContentLinkText = document.createTextNode('Officient calendar');
  nContentLink.id = 'officient-button';
  nContentLink.href = '';
  nContentLink.onclick = function () {
    chrome.tabs.create({ url: 'https://selfservice.officient.io/daysoff' });
  };
  nContentLink.appendChild(nContentLinkText);
  let nNewLine2 = document.createElement('br');
  let nNoOfficientLink = document.createElement('a');
  let nNoOfficienLinkText = document.createTextNode(
    'Generate timesheet without Officiënt'
  );
  nNoOfficientLink.id = 'no-officient';
  nNoOfficientLink.href = '';
  nNoOfficientLink.onclick = function () {
    chrome.storage.local.set({ load_type: 'noofficient', days_off: null });
    chrome.tabs.create({
      url: chrome.extension.getURL('../timesheet/template.html'),
    });
  };
  nNoOfficientLink.appendChild(nNoOfficienLinkText);

  content.appendChild(nHeader);
  content.appendChild(nContentText);
  content.appendChild(nNewLine);
  content.appendChild(nContentLink);
  content.appendChild(nNewLine2);
  content.appendChild(nNoOfficientLink);
}

function showGeneratingMessage(content) {
  let nHeader = document.createElement('h3');
  let nHeaderText = document.createTextNode('Generating timesheet...');
  nHeader.appendChild(nHeaderText);
  content.appendChild(nHeader);
}

function generateTimesheet() {
  // create template in new tab
  chrome.tabs.create({
    url: chrome.extension.getURL('../timesheet/template.html'),
  });
}
