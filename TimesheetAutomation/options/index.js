// Saves options to chrome.storage
function save_options() {
  const employee = document.getElementById('employee').value;
  const client = document.getElementById('client').value;
  const supervisor = document.getElementById('supervisor').value;
  chrome.storage.local.set(
    {
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(
    {
      employee: '',
      client: '',
      supervisor: '',
    },
    function (items) {
      document.getElementById('employee').value = items.employee;
      document.getElementById('client').value = items.client;
      document.getElementById('supervisor').value = items.supervisor;
    }
  );
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
