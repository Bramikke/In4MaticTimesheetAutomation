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

// Saves options to chrome.storage
function save_options() {
  const company = document.getElementById('company').value;
  const employee = document.getElementById('employee').value;
  const client = document.getElementById('client').value;
  const supervisor = document.getElementById('supervisor').value;
  chrome.storage.local.set(
    {
      company,
      employee,
      client,
      supervisor,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      const messagebox = document.createElement('div');
      messagebox.classList.add('alert', 'alert-success');
      messagebox.textContent = 'Options saved.';
      status.appendChild(messagebox);
      setTimeout(function () {
        messagebox.remove();
      }, 2000);
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
    },
    function (items) {
      document.getElementById('company').value = items.company;
      document.getElementById('employee').value = items.employee;
      document.getElementById('client').value = items.client;
      document.getElementById('supervisor').value = items.supervisor;
      change_company();
    }
  );
}

restore_options();
document.getElementById('company').addEventListener('change', change_company);
document.getElementById('save').addEventListener('click', save_options);
