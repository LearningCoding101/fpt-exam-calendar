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
      
      events.push({
        title: `${subject} (${room})`,
        date: date,
        time: time
      });
    });
    
    return events;
  }
  
  function createCalendar(events) {
    if (events.length === 0) {
      console.warn('No events to display in the calendar');
      return;
    }
    
    const calendarDiv = document.createElement('div');
    calendarDiv.id = 'exam-calendar';
    
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = '<h2>Exam Calendar</h2>';
    
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    
    // Assuming all exams are in the same month, get the month from the first event
    const firstEventDate = events[0].date.split('/').reverse().join('-'); // Convert to YYYY-MM-DD
    const firstDate = new Date(firstEventDate);
    if (isNaN(firstDate)) {
      console.error('Invalid date format in events');
      return;
    }
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    
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
        const eventTime = event.time.split(':')[0];
        eventDiv.classList.add(parseInt(eventTime) < 12 ? 'morning' : 'afternoon');
        eventDiv.textContent = `${event.title} - ${event.time}`;
        dayDiv.appendChild(eventDiv);
      });
      
      grid.appendChild(dayDiv);
    }
    
    calendarDiv.appendChild(header);
    calendarDiv.appendChild(grid);
    
    const contentDiv = document.querySelector('#ctl00_mainContent_divContent');
    if (contentDiv) {
      contentDiv.appendChild(calendarDiv);
    } else {
      console.error('Content div not found');
    }
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      #exam-calendar {
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
      }
      .calendar-header {
        text-align: center;
        margin-bottom: 20px;
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
      }
      .days-header {
        display: contents;
      }
      .days-header div {
        background-color: #f0f0f0;
        padding: 10px;
        text-align: center;
        font-weight: bold;
      }
      .calendar-day {
        border: 1px solid #ddd;
        padding: 10px;
        min-height: 100px;
      }
      .calendar-day.empty {
        background-color: #f9f9f9;
      }
      .day-number {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .exam-event {
        font-size: 12px;
        padding: 5px;
        margin-bottom: 5px;
        border-radius: 3px;
      }
      .exam-event.morning {
        background-color: #ffd700;
        color: #333;
      }
      .exam-event.afternoon {
        background-color: #4169e1;
        color: white;
      }
    `;
    document.head.appendChild(style);
  }
  
  const events = parseExamSchedule();
  createCalendar(events);