let signaturedata;

// Changes company logo
function change_company() {
  const company = document.getElementById('company').value;
  const headerImage = document.getElementById('headerImage');
  switch (company) {
    case 'i4m':
      headerImage.src = '../img/i4m_header.png';
      break;
    case 'i4f':
      headerImage.src = '../img/i4f_header.png';
      break;
    case '4it':
      headerImage.src = '../img/4it_header.png';
      break;
    default:
      break;
  }
}

// Click input type="file" when click on normal button
function click_fileupload() {
  document.getElementById('signature').click();
}

// Load file into signaturedata
function upload_file(evt) {
  if (!window.FileReader) return; // Browser is not compatible

  const reader = new FileReader();
  reader.onload = function (evt) {
    if (evt.target.readyState != 2) return;
    if (evt.target.error) {
      create_message('Error while reading file.', false);
      return;
    }
    signaturedata = evt.target.result;
    update_signaturebutton(true);
  };
  reader.readAsDataURL(evt.target.files[0]);
}

function click_signatureremove() {
  signaturedata = null;
  update_signaturebutton(false);
}

function update_signaturebutton(uploaded) {
  if (uploaded) {
    document.getElementById('signaturegroup').classList =
      'form-group signatureuploaded';
    document.getElementById('signaturebutton').firstChild.data =
      'Signature uploaded!';
    document.getElementById('signaturebutton').title =
      'Upload new signature';
  } else {
    document.getElementById('signaturegroup').classList = 'form-group';
    document.getElementById('signaturebutton').firstChild.data =
      'Upload signature';
  }
}

// Saves options to chrome.storage
function save_options() {
  const company = document.getElementById('company').value;
  const employee = document.getElementById('employee').value;
  const client = document.getElementById('client').value;
  const supervisor = document.getElementById('supervisor').value;
  const signature = signaturedata;

  chrome.storage.local.set(
    {
      company,
      employee,
      client,
      supervisor,
      signature,
    },
    function () {
      // Update status to let user know options were saved.
      create_message('Options saved.');
    }
  );
}

// Restores select box and inputs state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(
    {
      company: 'i4m',
      employee: '',
      client: '',
      supervisor: '',
      signature: null,
    },
    function (items) {
      document.getElementById('company').value = items.company;
      change_company();
      document.getElementById('employee').value = items.employee;
      document.getElementById('client').value = items.client;
      document.getElementById('supervisor').value = items.supervisor;
      signaturedata = items.signature;
      if (signaturedata) {
        update_signaturebutton(true);
      }
    }
  );
}

// Adds error or success message to html
function create_message(text, success = true) {
  const status = document.getElementById('status');
  const messagebox = document.createElement('div');
  messagebox.classList.add('alert', success ? 'alert-success' : 'alert-error');
  messagebox.textContent = text;
  status.appendChild(messagebox);
  setTimeout(function () {
    messagebox.remove();
  }, 2000);
}

restore_options();
document.getElementById('company').addEventListener('change', change_company);
document
  .getElementById('signaturebutton')
  .addEventListener('click', click_fileupload);
document
  .getElementById('signatureremove')
  .addEventListener('click', click_signatureremove);
document.getElementById('signature').addEventListener('change', upload_file);
document.getElementById('save').addEventListener('click', save_options);
