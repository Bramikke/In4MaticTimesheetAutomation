function getStorageData() {
  try {
    chrome.storage.local.get(
      {
        employee: '',
        client: '',
        supervisor: '',
      },
      function (items) {
        document.getElementById('employee').innerText = items.employee;
        document.getElementById('client').innerText = items.client;
        document.getElementById('supervisor').innerText = items.supervisor;
      }
    );
    chrome.storage.local.get(
      {
        days_off: {},
      },
      (data) => {
        console.log(data);
        loadWorkingDays(data?.days_off);
      }
    );
  } catch {
    loadWorkingDays();
  }
}

function loadWorkingDays(days_off) {
  const date = new Date();
  date.setDate(1);
  const currentmonth = document.getElementById('currentmonth');
  currentmonth.innerText = date.toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  });
  const month = date.getMonth();
  const days = [];
  while (date.getMonth() === month) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  const content = document
    .getElementById('content')
    .getElementsByTagName('tbody')[0];
  console.log(days_off);
  days.forEach((day) => {
    // find days_off and personal_days_off and map to total hours off
    const isoDate = day.toISOString().split('T')[0];
    let hoursOff = 0;
    if (days_off) {
      if (days_off.company_days_off) {
        const result = days_off.company_days_off.find(
          (d) => d.date === isoDate
        );
        if (result) {
          hoursOff = 8;
        }
      }
      if (hoursOff === 0 && days_off.personal_days_off) {
        hoursOff = days_off.personal_days_off
          .filter((d) => d.date === isoDate)
          .reduce((tot, day_off) => tot + day_off.duration_minutes / 60, 0);
      }
    }
    // add row
    const addrow = document.createElement('tr');
    const addcell1 = document.createElement('td');
    addcell1.contentEditable = true;
    addcell1.innerText = day.toLocaleDateString('nl-BE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const addcell2 = document.createElement('td');
    addcell2.contentEditable = true;
    addcell2.innerText = (8 - hoursOff).toString();
    const addcell3 = document.createElement('td');
    addcell3.contentEditable = true;
    addcell3.innerText = '0';
    const addcell4 = document.createElement('td');
    addrow.appendChild(addcell1);
    addrow.appendChild(addcell2);
    addrow.appendChild(addcell3);
    addrow.appendChild(addcell4);

    content.appendChild(addrow);
    addRowListener(addrow);
  });
  calculateTotals();
}

function isWeekday(year, month, day) {
  var day = new Date(year, month, day).getDay();
  return day != 0 && day != 6;
}

function addRowListener(row) {
  const cells = row.getElementsByTagName('td');
  cells[0].addEventListener('keyup', removeRow);
  cells[1].addEventListener('keyup', calculateTotals);
  cells[2].addEventListener('keyup', calculateTotals);
  cells[cells.length - 2].addEventListener('keydown', addRow);
}

function removeRow(e) {
  if (e.key === 'Backspace' && e.target.innerText === '') {
    const removerow = e.target.parentElement;
    const removecells = removerow.children;
    removecells[0].removeEventListener('keyup', removeRow);
    removecells[removecells.length - 1].removeEventListener('keydown', addRow);
    removerow.remove();
    calculateTotals();
  }
}

function addRow(e) {
  if (e.key === 'Tab' && !e.shiftKey) {
    const currentrow = e.target.parentElement;
    const addrow = document.createElement('tr');
    const addcell1 = document.createElement('td');
    addcell1.contentEditable = true;
    const addcell2 = document.createElement('td');
    addcell2.contentEditable = true;
    addcell2.innerText = '8';
    const addcell3 = document.createElement('td');
    addcell3.contentEditable = true;
    addcell3.innerText = '0';
    const addcell4 = document.createElement('td');
    addcell4.innerText = '8';
    addrow.appendChild(addcell1);
    addrow.appendChild(addcell2);
    addrow.appendChild(addcell3);
    addrow.appendChild(addcell4);

    currentrow.parentNode.insertBefore(addrow, currentrow.nextSibling);
    addRowListener(addrow);
    calculateTotals();
  }
}

function calculateTotals() {
  let total_regularhours = 0;
  let total_overtimehours = 0;
  let total_totalhours = 0;
  const content = document
    .getElementById('content')
    .getElementsByTagName('tbody')[0];
  const contentrows = content.getElementsByTagName('tr');
  for (let row of contentrows) {
    total_regularhours += Number(row.children[1].innerText);
    total_overtimehours += Number(row.children[2].innerText);
    let totalhours =
      Number(row.children[1].innerText) + Number(row.children[2].innerText);
    row.children[3].innerText = totalhours;
    total_totalhours += totalhours;
  }
  const footer = document
    .getElementById('content')
    .getElementsByTagName('tfoot')[0];
  const footercells = footer.getElementsByTagName('tr')[0].children;
  footercells[1].innerText = total_regularhours;
  footercells[2].innerText = total_overtimehours;
  footercells[3].innerText = total_totalhours;
}

getStorageData();
