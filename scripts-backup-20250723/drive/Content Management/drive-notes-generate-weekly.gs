// Title: Weekly Notes Generator

/*
Script Summary:
- This Google Apps Script automates the creation and updating of weekly notes based on calendar events.
- It creates a custom menu in Google Sheets to trigger the note creation/update process, and sets up time-based and calendar change triggers.
- The script categorizes events, generates YAML front matter with event statistics, and creates a structured markdown document for each week.

Key features:
1. Custom menu creation in Google Sheets UI
2. Automatic creation and updating of weekly notes in markdown format
3. Generation of YAML front matter with event statistics
4. Categorization of events (Accepted, Invited, Declined)
5. Creation of folder structure for organizing weekly notes
6. Time-based triggers for Monday and Friday updates
7. Calendar change trigger for real-time updates
8. Error handling and logging
*/

/*
Functions-Alphabetical:
- checkCalendarAppAvailability(): Checks if CalendarApp is available.
- clearLog(): Clears the console log.
- countEventsByStatus(): Counts events by their status.
- countNewEvents(): Counts new events for the week.
- countTotalAttendees(): Counts total attendees for the week.
- countUniqueAttendees(): Counts unique attendees for the week.
- createInitialWeeklyNoteContent(): Creates initial weekly note content.
- createInitialYamlFrontmatter(): Creates initial YAML front matter.
- createOrUpdateWeeklyNote(): Main function to create or update the weekly note.
- createTriggers(): Sets up time-based and calendar change triggers.
- formatDate(): Formats a date as YYYY-MM-DD.
- getEventStatus(): Gets the status of an event.
- getEventsForDay(): Gets events for a specific day.
- getOrCreateFolderPath(): Gets or creates a folder path.
- getOrCreateWeeklyFolder(): Gets or creates the weekly folder.
- getWeekNumber(): Gets the week number for a given date.
- getWeekStart(): Gets the start of the week for a given date.
- mondayTrigger(): Trigger function for Monday updates.
- onCalendarChange(): Trigger function for calendar change updates.
- onOpen(): Creates and adds the custom menu to the Google Sheets UI.
- parseYaml(): Parses YAML content.
- processEventsForDay(): Processes events for a single day.
- processEventsForWeek(): Processes events for the entire week.
- stringifyYaml(): Stringifies a YAML object.
- updateYamlFrontmatter(): Updates YAML front matter.
*/

/*
Functions-Ordered:
1. onOpen(): Creates and adds the custom menu to the Google Sheets UI.
2. createOrUpdateWeeklyNote(): Main function to create or update the weekly note.
3. checkCalendarAppAvailability(): Checks if CalendarApp is available.
4. getWeekNumber(): Gets the week number for a given date.
5. getWeekStart(): Gets the start of the week for a given date.
6. getOrCreateWeeklyFolder(): Gets or creates the weekly folder.
7. createInitialYamlFrontmatter(): Creates initial YAML front matter.
8. createInitialWeeklyNoteContent(): Creates initial weekly note content.
9. updateYamlFrontmatter(): Updates YAML front matter.
10. processEventsForWeek(): Processes events for the entire week.
11. processEventsForDay(): Processes events for a single day.
12. getEventsForDay(): Gets events for a specific day.
13. getEventStatus(): Gets the status of an event.
14. countEventsByStatus(): Counts events by their status.
15. calculateTotalEventMinutes(): Calculates total event minutes.
16. countNewEvents(): Counts new events for the week.
17. countTotalAttendees(): Counts total attendees for the week.
18. countUniqueAttendees(): Counts unique attendees for the week.
19. getOrCreateFolderPath(): Gets or creates a folder path.
20. parseYaml(): Parses YAML content.
21. stringifyYaml(): Stringifies a YAML object.
22. mondayTrigger(): Trigger function for Monday updates.
23. fridayTrigger(): Trigger function for Friday updates.
24. onCalendarChange(): Trigger function for calendar change updates.
25. createTriggers(): Sets up time-based and calendar change triggers.
*/

/*
Script-Steps:
1. Clear the log.
2. Check if CalendarApp is available.
3. Get the current date and calculate the week number and week start date.
4. Get or create the weekly folder.
5. Determine the filename for the weekly note.
6. Check if the weekly note file already exists.
7. If the file exists, update the YAML front matter. If not, create initial YAML front matter and content.
8. Process events for the entire week and update the content.
9. Save the updated content to the file.
10. Log the success message.
*/

/*
Helper Functions:
- checkCalendarAppAvailability(): Checks if CalendarApp is available.
- clearLog(): Clears the console log.
- countEventsByStatus(): Counts events by their status.
- countNewEvents(): Counts new events for the week.
- countTotalAttendees(): Counts total attendees for the week.
- countUniqueAttendees(): Counts unique attendees for the week.
- createInitialWeeklyNoteContent(): Creates initial weekly note content.
- createInitialYamlFrontmatter(): Creates initial YAML front matter.
- createTriggers(): Sets up time-based and calendar change triggers.
- formatDate(): Formats a date as YYYY-MM-DD.
- getEventStatus(): Gets the status of an event.
- getEventsForDay(): Gets events for a specific day.
- getOrCreateFolderPath(): Gets or creates a folder path.
- getOrCreateWeeklyFolder(): Gets or creates the weekly folder.
- getWeekNumber(): Gets the week number for a given date.
- getWeekStart(): Gets the start of the week for a given date.
- mondayTrigger(): Trigger function for Monday updates.
- onCalendarChange(): Trigger function for calendar change updates.
- onOpen(): Creates and adds the custom menu to the Google Sheets UI.
- parseYaml(): Parses YAML content.
- processEventsForDay(): Processes events for a single day.
- processEventsForWeek(): Processes events for the entire week.
- stringifyYaml(): Stringifies a YAML object.
- updateYamlFrontmatter(): Updates YAML front matter.
*/

// Global variables
const TIMEZONE = "America/Los_Angeles";

// Function to create and add the custom menu to the Google Sheets UI
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Export Meetings')
      .addItem('Create/Update Weekly Note', 'createOrUpdateWeeklyNote')
      .addToUi();
    console.log("onOpen function completed successfully");
  } catch (error) {
    console.error("Error in onOpen function: " + error.toString());
  }
}

// Main function to create or update the weekly note
function createOrUpdateWeeklyNote() {
  try {
    checkCalendarAppAvailability();
    const today = new Date();
    const weekNumber = getWeekNumber(today);
    const weekStart = getWeekStart(today);
    const folder = getOrCreateWeeklyFolder(weekStart);
    const fileName = `${weekNumber} - Weekly Notes.md`;

    let file;
    let content;
    let yamlFrontmatter;

    if (folder.getFilesByName(fileName).hasNext()) {
      file = folder.getFilesByName(fileName).next();
      content = file.getBlob().getDataAsString();
      yamlFrontmatter = updateYamlFrontmatter(content, weekStart);
    } else {
      yamlFrontmatter = createInitialYamlFrontmatter(weekNumber, weekStart);
      content = createInitialWeeklyNoteContent(weekNumber, weekStart);
    }

    content = yamlFrontmatter + content.split('---').slice(2).join('---');

    if (file) {
      file.setContent(content);
    } else {
      file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
    }

    processEventsForWeek(weekStart, content, file);
    console.log(`Weekly note for week ${weekNumber} created/updated successfully.`);
  } catch (error) {
    console.error("Error in createOrUpdateWeeklyNote: " + error.toString());
    // Handle the error appropriately, e.g., show an alert to the user
  }
}

// Function to create initial YAML front matter
function createInitialYamlFrontmatter(weekNumber, weekStart) {
  const now = new Date();
  const mondayEvents = getEventsForDay(weekStart);
  const eventCounts = countEventsByStatus(mondayEvents);

  const yamlObj = {
    category: 'weekly',
    weekNum: weekNumber,
    dateCreated: formatDate(now),
    dateRevised: formatDate(now),
    eventMonAccepts: eventCounts.accepted,
    eventMonInvites: eventCounts.total,
    eventMonDeclines: eventCounts.declined,
    eventFriAccepts: 0,
    eventFriInvites: 0,
    eventFriDeclines: 0,
    eventNew: 0,
    eventTimeInvite: calculateTotalEventMinutes(mondayEvents),
    eventTimeAct: 0,
    eventTimeInvToAct: 0,
    eventAttendeesTotal: 0,
    eventsAttendeesUnique: 0,
    aliases: '',
    tags: ''
  };

  return `---\n${stringifyYaml(yamlObj)}---\n\n`;
}

// Function to update YAML front matter
function updateYamlFrontmatter(content, weekStart) {
  let yaml = content.split('---')[1];
  let yamlObj = parseYaml(yaml);

  const now = new Date();
  const isFriday = now.getDay() === 5 && now.getHours() >= 16;

  yamlObj.dateRevised = formatDate(now);

  if (isFriday) {
    const fridayEvents = getEventsForDay(new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000));
    const eventCounts = countEventsByStatus(fridayEvents);

    yamlObj.eventFriAccepts = eventCounts.accepted;
    yamlObj.eventFriInvites = eventCounts.total;
    yamlObj.eventFriDeclines = eventCounts.declined;
    yamlObj.eventNew = countNewEvents(weekStart);
    yamlObj.eventTimeAct = calculateTotalEventMinutes(fridayEvents.filter(e => getEventStatus(e) === 'Accepted'));
    yamlObj.eventTimeInvToAct = yamlObj.eventTimeAct / yamlObj.eventTimeInvite;
    yamlObj.eventAttendeesTotal = countTotalAttendees(weekStart);
    yamlObj.eventsAttendeesUnique = countUniqueAttendees(weekStart);
  }

  return `---\n${stringifyYaml(yamlObj)}---\n\n`;
}

// Function to create initial weekly note content
function createInitialWeeklyNoteContent(weekNumber, weekStart) {
  let content = `# ${weekNumber} Weekly Note\n\n`;
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    const formattedDate = formatDate(currentDate);
    content += `### ${formattedDate}\n\n#### Accepted\n\n#### Invited\n\n#### Declined\n\n`;
  }
  content += `## ${weekNumber} - Summary\n\n`;
  return content;
}

// Function to process events for the entire week
function processEventsForWeek(weekStart, content, file) {
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    const events = getEventsForDay(currentDate);
    const dateString = formatDate(currentDate);

    let dateContent = `### ${dateString}\n\n`;
    dateContent += processEventsForDay(events, currentDate);

    const dateHeader = `### ${dateString}`;
    const contentParts = content.split(dateHeader);
    if (contentParts.length > 1) {
      content = contentParts[0] + dateContent + contentParts.slice(2).join(dateHeader);
    } else {
      content += dateContent;
    }
  }

  file.setContent(content);
}

// Function to process events for a single day
function processEventsForDay(events, date) {
  let content = '';
  const statuses = ['Accepted', 'Invited', 'Declined'];

  for (const status of statuses) {
    content += `#### ${status}\n`;
    const filteredEvents = events.filter(e => getEventStatus(e) === status);
    filteredEvents.sort((a, b) => a.getStartTime() - b.getStartTime());

    for (const event of filteredEvents) {
      const eventDate = formatDate(event.getStartTime());
      const eventTitle = event.getTitle();
      let eventLink = `[[${eventDate} ${eventTitle}]]`;

      if (event.isRecurringEvent()) {
        eventLink += " - Recurring";
      }
      if (event.getOriginalCalendarEvent()) {
        eventLink += " - Rescheduled";
      }
      if (date.getDay() === 1 && date.getHours() >= 8 && event.getDateCreated() > date) {
        eventLink += " - Unplanned - Review";
      }

      content += `- ${eventLink}\n`;
    }
    content += '\n';
  }

  return content;
}

// Helper functions

// Function to get the week number for a given date
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

// Function to get the start of the week for a given date
function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Function to format a date as YYYY-MM-DD
function formatDate(date) {
  return Utilities.formatDate(date, TIMEZONE, 'yyyy-MM-dd');
}

// Function to get events for a specific day
function getEventsForDay(date) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(date.getTime());
    startTime.setHours(0, 0, 0, 0);
    const endTime = new Date(date.getTime());
    endTime.setHours(23, 59, 59, 999);
    return calendar.getEvents(startTime, endTime);
  } catch (error) {
    console.error(`Error fetching events for ${formatDate(date)}: ${error.toString()}`);
    return [];
  }
}

// Function to get the status of an event
function getEventStatus(event) {
  try {
    const status = event.getMyStatus();
    // Add a check to ensure CalendarApp.EventStatus is defined
    if (typeof CalendarApp.EventStatus === 'undefined') {
      console.error('CalendarApp.EventStatus is undefined');
      return 'Unknown';
    }
    switch(status) {
      case CalendarApp.EventStatus.YES:
        return 'Accepted';
      case CalendarApp.EventStatus.NO:
        return 'Declined';
      case CalendarApp.EventStatus.MAYBE:
        return 'Maybe';
      case CalendarApp.EventStatus.INVITED:
        return 'Invited';
      default:
        return 'Unknown';
    }
  } catch (error) {
    console.error('Error in getEventStatus:', error);
    return 'Error';
  }
}

// Function to count events by status
function countEventsByStatus(events) {
  let accepted = 0, declined = 0, total = events.length;
  for (const event of events) {
    try {
      const status = getEventStatus(event);
      if (status === 'Accepted') accepted++;
      if (status === 'Declined') declined++;
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }
  return { accepted, declined, total };
}

// Function to calculate total event minutes
function calculateTotalEventMinutes(events) {
  return events.reduce((total, event) => {
    const duration = (event.getEndTime() - event.getStartTime()) / (1000 * 60);
    return total + duration;
  }, 0);
}

// Function to count new events for the week
function countNewEvents(weekStart) {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = CalendarApp.getDefaultCalendar().getEvents(weekStart, weekEnd);
  return events.filter(e => e.getDateCreated() >= weekStart).length;
}

// Function to count total attendees for the week
function countTotalAttendees(weekStart) {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = CalendarApp.getDefaultCalendar().getEvents(weekStart, weekEnd);
  return events.reduce((total, event) => total + event.getGuestList().length, 0);
}

// Function to count unique attendees for the week
function countUniqueAttendees(weekStart) {
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const events = CalendarApp.getDefaultCalendar().getEvents(weekStart, weekEnd);
  const uniqueAttendees = new Set();
  events.forEach(event => {
    event.getGuestList().forEach(guest => uniqueAttendees.add(guest.getEmail()));
  });
  return uniqueAttendees.size;
}

// Function to get or create the weekly folder
function getOrCreateWeeklyFolder(date) {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  const folderName = `Weekly Notes/${year}-${weekNumber}`;
  return getOrCreateFolderPath(folderName);
}

// Function to get or create a folder path
function getOrCreateFolderPath(path) {
  const folders = path.split('/');
  let parent = DriveApp.getRootFolder();
  for (let i = 0; i < folders.length; i++) {
    const folderName = folders[i];
    const foldersIterator = parent.getFoldersByName(folderName);
    if (foldersIterator.hasNext()) {
      parent = foldersIterator.next();
    } else {
      parent = parent.createFolder(folderName);
    }
  }
  return parent;
}

// Custom YAML parsing and stringifying functions
function parseYaml(yaml) {
  const lines = yaml.trim().split('\n');
  const result = {};
  for (const line of lines) {
    const [key, value] = line.split(':').map(s => s.trim());
    if (key && value) {
      result[key] = isNaN(value) ? value : Number(value);
    }
  }
  return result;
}

function stringifyYaml(obj) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

// Trigger functions
function mondayTrigger() {
  createOrUpdateWeeklyNote();
}

function fridayTrigger() {
  createOrUpdateWeeklyNote();
}

function onCalendarChange(e) {
  if (e.calendarId === CalendarApp.getDefaultCalendar().getId()) {
    createOrUpdateWeeklyNote();
  }
}

// Set up triggers
function createTriggers() {
  ScriptApp.newTrigger('mondayTrigger')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(8)
    .create();

  ScriptApp.newTrigger('fridayTrigger')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(16)
    .create();

  ScriptApp.newTrigger('onCalendarChange')
    .forUserCalendar(Session.getActiveUser().getEmail())
    .onEventUpdated()
    .create();
}

// New function to check if CalendarApp is available
function checkCalendarAppAvailability() {
  if (typeof CalendarApp === 'undefined') {
    throw new Error('CalendarApp is not available. Make sure you have the necessary permissions and that the Calendar service is enabled in your Google Apps Script project.');
  }
  console.log('CalendarApp is available');
}

// New function to clear the log
function clearLog() {
  console.clear();
}

// New main function to run the createOrUpdateWeeklyNote with log clearing
function main() {
  clearLog();
  createOrUpdateWeeklyNote();
}
