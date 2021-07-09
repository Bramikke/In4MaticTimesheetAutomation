let notesEnabled = false;

function getStorageData() {
  chrome.storage.local.get(
    {
      company: 'i4m',
      employee: '',
      client: '',
      supervisor: '',
      signature: null,
    },
    (items) => {
      const headerImage = document.getElementById('headerImage');
      const footerCompany = document.getElementById('footerCompany');
      const footerDetails = document.getElementById('footerDetails');
      switch (items.company) {
        case 'i4m':
          headerImage.src = '../img/i4m_header.png';
          footerCompany.innerText = 'In4Matic N.V.';
          footerDetails.innerHTML =
            'Vosselarestraat 73, 9850 DEINZE &#8226; Tel.: +32 9 237 26 40 &#8226; E-mail: info@i4m.be &#8226; www.i4m.be';
          break;
        case 'i4f':
          headerImage.src = '../img/i4f_header.png';
          footerCompany.innerText = 'I4F';
          footerDetails.innerHTML =
            'Nevelestraat 106, 9880 AALTER &#8226; Tel.: +32 9 237 26 40 &#8226; E-mail: info@i4f.be &#8226; www.i4f.be';
          break;
        case '4it':
          headerImage.src = '../img/4it_header.png';
          footerCompany.innerText = '4IT Consulting';
          footerDetails.innerHTML =
            'Zeerobbenlaan 5, 8300 KNOKKE &#8226; Tel.: +32 9 237 26 40 &#8226; E-mail: info@4it.consulting &#8226; www.4it.consulting';
          break;
        default:
          break;
      }
      document.getElementById('employee').innerText = items.employee;
      document.getElementById('client').innerText = items.client;
      document.getElementById('supervisor').innerText = items.supervisor;
      if (items.signature) {
        document.getElementById('signature').src = items.signature;
        document.getElementById('signaturedate').innerText =
          new Date().toLocaleDateString('nl-BE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
      }
    }
  );
  chrome.storage.local.get(
    {
      load_type: null,
      days_off: null,
    },
    (data) => {
      console.log(data);
      daysoffLoaded(data);
      loadMonth(data);
    }
  );
}

function daysoffLoaded(data) {
  // if timesheet is loaded through officient calendar
  if (data.load_type === 'officient') {
    const span = document.getElementById('daysoff-message');
    if (data.days_off) {
      span.innerText = 'Off days loaded successfully!';
      span.classList = 'warn-success';
    } else {
      span.innerText = 'Off days not loaded.';
      span.classList = 'warn-error';
    }
    setTimeout(() => {
      span.innerText = '';
      span.classList = '';
    }, 6000);
  }
}

function loadMonth(data) {
  let date = new Date();
  const days_off = data.days_off;
  // if days_off, find calendar year
  if (days_off?.company_days_off?.length > 0) {
    const data_date = new Date(data.days_off.company_days_off[0].date);
    data_date.setMonth(0);
    // if year is different from this year, change date
    if (data_date.getFullYear() !== date.getFullYear()) {
      date = data_date;
    }
  }
  date.setDate(1);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const currentmonth = document.getElementById('currentmonth');
  // set min and max selectable value to date year
  if (data.load_type === 'officient') {
    currentmonth.min = `${year}-01`;
    currentmonth.max = `${year}-12`;
  }
  currentmonth.value = `${year}-${month < 10 ? '0' + month : month}`;
  // listen for month change events
  currentmonth.addEventListener('change', (event) => {
    const value = event.target.value;
    const newDate = new Date(value);
    newDate.setDate(1);
    loadWorkingDays(newDate, days_off);
  });
  loadWorkingDays(date, days_off);
}

function loadWorkingDays(date, days_off) {
  // set month/year to span which is shown on print
  const printcurrentmonth = document.getElementById('printcurrentmonth');
  printcurrentmonth.innerText = date.toLocaleDateString('en-GB', {
    month: 'short',
    year: '2-digit',
  });
  const month = date.getMonth();
  const days = [];
  const content = document
    .getElementById('content')
    .getElementsByTagName('tbody')[0];
  // clear timesheet table childnodes
  while (content.firstChild) {
    content.removeChild(content.lastChild);
  }
  // get all working days
  while (date.getMonth() === month) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
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
    addrow.appendChild(addcell1);
    const addcell2 = document.createElement('td');
    addcell2.contentEditable = true;
    addcell2.innerText = (8 - hoursOff).toString();
    addrow.appendChild(addcell2);
    const addcell3 = document.createElement('td');
    addcell3.contentEditable = true;
    addcell3.innerText = '0';
    addrow.appendChild(addcell3);
    const addcell4 = document.createElement('td');
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
    addrow.appendChild(addcell1);
    const addcell2 = document.createElement('td');
    addcell2.contentEditable = true;
    addcell2.innerText = '8';
    addrow.appendChild(addcell2);
    const addcell3 = document.createElement('td');
    addcell3.contentEditable = true;
    addcell3.innerText = '0';
    addrow.appendChild(addcell3);
    const addcell4 = document.createElement('td');
    addcell4.innerText = '8';
    addrow.appendChild(addcell4);
    if (notesEnabled) {
      const addcell5 = document.createElement('td');
      addcell5.contentEditable = true;
      addrow.appendChild(addcell5);
    }

    currentrow.parentNode.insertBefore(addrow, currentrow.nextSibling);
    addRowListener(addrow);
    calculateTotals();
  }
}

function calculateTotals() {
  let total_regularhours = 0;
  let total_overtimehours = 0;
  let total_totalhours = 0;
  const tbody = document
    .getElementById('content')
    .getElementsByTagName('tbody')[0];
  const contentrows = tbody.getElementsByTagName('tr');
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

function listenPrint() {
  const button = document.getElementById('print-button');
  button.addEventListener('click', () => {
    print();
  });
}

function listenNotes() {
  const button = document.getElementById('notes-button');
  button.addEventListener('click', () => {
    const tbody = document
      .getElementById('content')
      .getElementsByTagName('tbody')[0];
    const contentrows = tbody.getElementsByTagName('tr');
    for (let row of contentrows) {
      if (!notesEnabled) {
        const td = document.createElement('td');
        td.contentEditable = true;
        row.appendChild(td);
      } else {
        row.removeChild(row.lastChild);
      }
    }
    if (!notesEnabled) {
      button.classList = 'button active';
    } else {
      button.classList = 'button';
    }
    notesEnabled = !notesEnabled;
  });
}

listenPrint();
listenNotes();
getStorageData();
