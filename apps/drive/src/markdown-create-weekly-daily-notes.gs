/**
 * Script Name: markdown- create- weekly- daily- notes
 *
 * Script Summary:
 * Creates markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 *
 * Script Steps:
 * 1. Access Drive file system
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Format output for presentation
 *
 * Script Functions:
 * - createSingleDailyNote(): Creates new single daily note or resources
 * - createWeeklyDailyNotes(): Creates new weekly daily notes or resources
 * - ensureWeekFolderPath(): Manages files and folders
 * - findOrCreateFolder(): Creates new find or folder or resources
 * - generateDailyNoteContent(): Generates new content or reports
 * - generateEventTable(): Generates new content or reports
 * - getEventsForDay(): Gets specific events for day or configuration
 *
 * Script Helper Functions:
 * - formatDate(): Formats date for display
 * - getDayName(): Gets specific day name or configuration
 * - getMonthName(): Gets specific month name or configuration
 * - getNextMonday(): Gets specific next monday or configuration
 * - getWeekNumber(): Gets specific week number or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - CalendarApp: For calendar and event management
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 */

/ * Script Summary: - This script automates the creation of daily notes for the upcoming work week. - It creates a folder structure organized by year, month, and week, and generates a Markdown file for each day. - Each daily note includes metadata, navigation links, and a table of calendar events.;

Key features:
1. Creates a folder structure organized by year, month, and week.
2. Generates daily Markdown files with metadata, navigation links, and calendar events.
3. Ensures that daily notes are created only if they do not already exist.
4. Logs the creation process and any errors encountered. *// * Functions - Alphabetical: - createSingleDailyNote(): Creates a single daily note file. - createWeeklyDailyNotes(): Main function to create daily notes for the upcoming week. - ensureWeekFolderPath(): Ensures the entire folder path exists for a given date. - findOrCreateFolder(): Finds a folder by name or creates it if it doesn't exist. - formatDate(): Formats a date according to the specified format. - generateDailyNoteContent(): Generates the content for a daily note. - generateEventTable(): Generates the event table for a given date. - getDayName(): Gets the name of a day given a date. - getEventsForDay(): Gets all events for a specific day. - getMonthName(): Gets the name of a month given its number. - getNextMonday(): Gets the next Monday from a given date. - getWeekNumber(): Gets the week number for a given date. *// * Functions - Ordered:;
1. createWeeklyDailyNotes(): Main function to create daily notes for the upcoming week.;
2. createSingleDailyNote(): Creates a single daily note file.;
3. ensureWeekFolderPath(): Ensures the entire folder path exists for a given date.;
4. findOrCreateFolder(): Finds a folder by name or creates it if it doesn't exist.;
5. formatDate(): Formats a date according to the specified format.;
6. generateDailyNoteContent(): Generates the content for a daily note.;
7. generateEventTable(): Generates the event table for a given date.;
8. getDayName(): Gets the name of a day given a date.;
9. getEventsForDay(): Gets all events for a specific day.;
10. getMonthName(): Gets the name of a month given its number.;
11. getNextMonday(): Gets the next Monday from a given date.;
12. getWeekNumber(): Gets the week number for a given date. *// * Script - Steps:;
1. Ensure the root 'notes' folder exists.
2. Calculate the date for the upcoming Monday.
3. For each day from Monday to Friday, create a daily note file.
4. Generate content for each daily note, including metadata, navigation links, and a table of calendar events.
5. Save the daily note files in the appropriate folder structure.

// Main Functions

/**

 * Creates new single daily note or resources
 * @param
 * @param {any} date - The date for creation
 * @param {Folder} rootNotesFolder - The rootNotesFolder for creation
 * @returns {any} The newly created any

 */

function createSingleDailyNote(date, rootNotesFolder) {
  Logger.log('Creating daily note for ' + date.toISOString());

  try {
    const fileName = formatDate(date, 'yyyy - MM - dd');
    const folder = ensureWeekFolderPath(date, rootNotesFolder); // Check if file already exists;
    const existingFiles = folder.getFilesByName(fileName + '.md');
    if (existingFiles.hasNext()) {
      Logger.log('Daily note already exists for ' + fileName);
      return;
    }

    const content = generateDailyNoteContent(date);

    const file = folder.createFile(fileName + '.md', content, MimeType.PLAIN_TEXT);
    Logger.log('Daily note created: ' + file.getName() + ' in folder: ' + folder.getName());
  } catch (error) {
    Logger.log('Error in createSingleDailyNote: ' + error.message);
  }
}

/**

 * Creates new weekly daily notes or resources
 * @returns {any} The newly created any

 */

function createWeeklyDailyNotes() {
  const NOTES_FOLDER_NAME = 'notes';

  Logger.log('Starting createWeeklyDailyNotes function');

  try { // Ensure the root 'notes' folder exists
    let notesFolder = findOrCreateFolder(DriveApp.getRootFolder(), NOTES_FOLDER_NAME);
    Logger.log('Root notes folder ensured: ' + notesFolder.getName());

    const today = new Date();
    const monday = getNextMonday(today);

    for (let i = 0; i < 5; i + + ) {
      const currentDate = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
      createSingleDailyNote(currentDate, notesFolder);
    }

    Logger.log('Weekly daily notes creation completed');
  } catch (error) {
    Logger.log('Error in createWeeklyDailyNotes: ' + error.message);
  }
}

/**

 * Manages files and folders
 * @param
 * @param {any} date - The date parameter
 * @param {Folder} rootFolder - The rootFolder parameter
 * @returns {any} The result

 */

function ensureWeekFolderPath(date, rootFolder) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const weekNum = getWeekNumber(date);

  const yearFolder = findOrCreateFolder(rootFolder, year.toString());
  const monthFolder = findOrCreateFolder(yearFolder, `${month.toString().padStart(2, '0')} - ${getMonthName(month)}`);
  const weekFolder = findOrCreateFolder(monthFolder, `${year} - W${weekNum.toString().padStart(2, '0')}`);

  return weekFolder;
}

/**

 * Creates new find or folder or resources
 * @param
 * @param {Folder} parentFolder - The parentFolder for creation
 * @param {string} folderName - The folderName for creation
 * @returns {any} The newly created any

 */

function findOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    Logger.log('Creating new folder: ' + folderName);
    return parentFolder.createFolder(folderName);
  }
}

/**

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 */

function generateDailyNoteContent(date) {
  Logger.log('Generating content for ' + date.toISOString());

  const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  let content = ` - - - category: daily;
subCategory:
numMonth: ${date.getMonth() + 1}
numWeek: ${getWeekNumber(date)}
dateCreated: ${formatDate(date, 'yyyy - MM - dd')}
aliases:
tags: - - - # ${formatDate(date, 'yyyy - MM - dd')}
[[${formatDate(prevDate, 'yyyy - MM - dd')}]] | [[${formatDate(nextDate, 'yyyy - MM - dd')}]]
## Meetings today
| day | event | gvc | time | duration |
| - - -  -  - | - - -  - - -  - | - - -  -  - | - - -  - - - | - - -  - - -  - - -  - |
${generateEventTable(date)}`;

  return content;
}

/**

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 */

function generateEventTable(date) {
  Logger.log('Generating event table for ' + date.toISOString());

  const events = getEventsForDay(date);
  let tableContent = '';
  let totalDuration = 0;

  const dayName = getDayName(date);
  const dayLink = `[${formatDate(date, 'yyyy - MM - dd')}](${formatDate(date, 'yyyy - MM - dd')})`;

  events.forEach(event = > {
    const eventName = event.getTitle();
    const eventId = event.getId();
    const eventLink = `[${eventName}](https: // calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
    const gvcLink = `[GVC](https: // calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
    const eventTime = event.isAllDayEvent() ? 'All Day' : formatDate(event.getStartTime(), 'HH:mm');
    let duration = '';

    if (event.isAllDayEvent()) {
      duration = 'allday';
    } else {
      const durationMinutes = Math.round((event.getEndTime() - event.getStartTime()) / (60 * 1000));
      duration = durationMinutes + ' min';
      totalDuration + = durationMinutes;
    }

    tableContent + = `| ${dayName} | ${eventLink} | ${gvcLink} | ${eventTime} | ${duration} |\n`;
  }); // Add summary row
  const totalEvents = events.length;
  const totalDurationHours = Math.ceil(totalDuration / 60 * 4) / 4; // Round up to nearest 0.25;

  tableContent = `| ${dayName} | ${dayLink} | ${totalEvents} | | ${totalDurationHours} hrs |\n` + tableContent;

  return tableContent;
}

/**

 * Gets specific events for day or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getEventsForDay(date) {
  Logger.log('Getting events for ' + date.toISOString());

  const calendar = CalendarApp.getDefaultCalendar();
  const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  const events = calendar.getEvents(startTime, endTime);

  Logger.log('Found ' + events.length + ' events');

  return events;
}

// Helper Functions

/**

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @param {any} format - The format parameter
 * @returns {any} The result

 */

function formatDate(date, format) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return format;
    .replace('yyyy', year);
    .replace('MM', month);
    .replace('dd', day);
    .replace('HH', hours);
    .replace('mm', minutes);
}

/**

 * Gets specific day name or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**

 * Gets specific month name or configuration
 * @param
 * @param {any} month - The month to retrieve
 * @returns {any} The requested any

 */

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

/**

 * Gets specific next monday or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getNextMonday(date) {
  const dayOfWeek = date.getDay();
  const daysUntilMonday = dayOfWeek = = = 0 ? 1 : 8 - dayOfWeek;
  return new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
}

/**

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}