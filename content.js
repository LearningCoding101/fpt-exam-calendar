function parseExamSchedule() {
  const table = document.querySelector('#ctl00_mainContent_divContent table');
  if (!table) {
    console.error('Table not found');
    return [];
  }
  
  const rows = table.querySelectorAll('tbody tr');
  const events = [];
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 7) {
      console.warn('Skipping row due to insufficient cells', row);
      return;
    }
    
    const subject = cells[2]?.textContent.trim() || 'Unknown Subject';
    const date = cells[3]?.textContent.trim() || 'Unknown Date';
    const room = cells[4]?.textContent.trim() || 'Unknown Room';
    const time = cells[5]?.textContent.trim() || 'Unknown Time';
    const examType = cells[6]?.textContent.trim() || 'Unknown Type';
    
    events.push({
      title: `${subject} (${room})`,
      date: date,
      time: time,
      examType: examType
    });
  });
  
  return events;
}

function createCalendarHeader(year, month) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const header = document.createElement('div');
  header.className = 'calendar-header';
  
  const prevButton = document.createElement('button');
  prevButton.textContent = '< Prev';
  prevButton.onclick = () => changeMonth(-1);
  
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next >';
  nextButton.onclick = () => changeMonth(1);
  
  const title = document.createElement('h2');
  title.textContent = `${monthNames[month]} ${year}`;
  title.id = 'calendar-title';
  
  header.appendChild(prevButton);
  header.appendChild(title);
  header.appendChild(nextButton);
  
  return header;
}

function createCalendarGrid(events, year, month) {
  const grid = document.createElement('div');
  grid.className = 'calendar-grid';
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysHeader = document.createElement('div');
  daysHeader.className = 'days-header';
  daysOfWeek.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = day;
    daysHeader.appendChild(dayDiv);
  });
  grid.appendChild(daysHeader);
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    grid.appendChild(emptyDay);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);
    
    const currentDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayEvents = events.filter(event => {
      const eventDate = event.date.split('/').reverse().join('-'); // Convert to YYYY-MM-DD
      return eventDate === currentDate;
    });
    
    dayEvents.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'exam-event';
      eventDiv.classList.add(getExamTypeClass(event.examType));
      eventDiv.textContent = `${event.title} - ${event.time}`;
      dayDiv.appendChild(eventDiv);
    });
    
    grid.appendChild(dayDiv);
  }
  
  return grid;
}

function getExamTypeClass(examType) {
  switch(examType.toLowerCase()) {
    case 'eos':
      return 'eos';
    case 'project presentation':
      return 'project';
    case 'eos & pea':
      return 'eos-pea';
    case 'eos (multiple choice)':
      return 'eos-mc';
    default:
      return 'other';
  }
}

function createCalendar(events, year, month) {
  const calendarDiv = document.getElementById('exam-calendar') || document.createElement('div');
  calendarDiv.id = 'exam-calendar';
  calendarDiv.innerHTML = ''; // Clear existing content
  
  const header = createCalendarHeader(year, month);
  const grid = createCalendarGrid(events, year, month);
  
  calendarDiv.appendChild(header);
  calendarDiv.appendChild(grid);
  
  const contentDiv = document.querySelector('#ctl00_mainContent_divContent');
  if (contentDiv) {
    contentDiv.appendChild(calendarDiv);
  } else {
    console.error('Content div not found');
  }
}

let currentYear, currentMonth;
let events;

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  createCalendar(events, currentYear, currentMonth);
}

function initializeCalendar() {
  events = parseExamSchedule();
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  createCalendar(events, currentYear, currentMonth);
  
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    #exam-calendar {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      border-radius: 10px;
      overflow: hidden;
    }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #3498db;
      color: white;
      padding: 15px;
    }
    .calendar-header button {
      background-color: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 5px;
    }
    .calendar-header h2 {
      margin: 0;
      font-size: 24px;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }
    .days-header {
      display: contents;
    }
    .days-header div {
      background-color: #f0f0f0;
      padding: 10px 5px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
    }
    .calendar-day {
      border: 1px solid #ddd;
      padding: 5px;
      min-height: 100px;
      overflow-y: auto;
    }
    .calendar-day.empty {
      background-color: #f9f9f9;
    }
    .day-number {
      font-weight: bold;
      margin-bottom: 5px;
      font-size: 14px;
    }
    .exam-event {
      font-size: 11px;
      padding: 3px;
      margin-bottom: 3px;
      border-radius: 3px;
      color: white;
    }
    .exam-event.eos {
      background-color: #e74c3c;
    }
    .exam-event.project {
      background-color: #3498db;
    }
    .exam-event.eos-pea {
      background-color: #9b59b6;
    }
    .exam-event.eos-mc {
      background-color: #f1c40f;
    }
    .exam-event.other {
      background-color: #95a5a6;
    }
  `;
  document.head.appendChild(style);
}

// Initialize the calendar when the script runs
initializeCalendar();