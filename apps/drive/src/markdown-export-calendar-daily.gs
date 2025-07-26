/ * *
 * Script Name: markdown- export- calendar- daily
 *
 * Script Summary:
 * Exports markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 *
 * Script Steps:
 * 1. Access Drive file system
 * 2. Fetch source data
 * 3. Format output for presentation
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
 * /

/ / Main Functions

/ * *

 * Creates new single daily note or resources
 * @param
 * @param {any} date - The date for creation
 * @param {Folder} rootNotesFolder - The rootNotesFolder for creation
 * @returns {any} The newly created any

 * /

function createSingleDailyNote(date, rootNotesFolder) {
    Logger.log('Creating daily note for ' + date.toISOString());

    try {
      const fileName = formatDate(date, 'yyyy - MM - dd');
      const folder = ensureWeekFolderPath(date, rootNotesFolder); / / Check if file already exists;
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

/ * *

 * Creates new single daily note or resources
 * @param
 * @param {any} date - The date for creation
 * @param {Folder} rootNotesFolder - The rootNotesFolder for creation
 * @returns {any} The newly created any

 * /

function createSingleDailyNote(date, rootNotesFolder) {
    Logger.log('Creating daily note for ' + date.toISOString());

    try {
      const fileName = formatDate(date, 'yyyy - MM - dd');
      const folder = ensureWeekFolderPath(date, rootNotesFolder); / / Check if file already exists;
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

/ * *

 * Creates new single daily note or resources
 * @param
 * @param {any} date - The date for creation
 * @param {Folder} rootNotesFolder - The rootNotesFolder for creation
 * @returns {any} The newly created any

 * /

function createSingleDailyNote(date, rootNotesFolder) {
    Logger.log('Creating daily note for ' + date.toISOString());

    try {
      const fileName = formatDate(date, 'yyyy - MM - dd');
      const folder = ensureWeekFolderPath(date, rootNotesFolder); / / Check if file already exists;
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

/ * *

 * Creates new weekly daily notes or resources
 * @returns {any} The newly created any

 * /

function createWeeklyDailyNotes() {
  const NOTES_FOLDER_NAME = 'notes';

  Logger.log('Starting createWeeklyDailyNotes function');

  try { / / Ensure the root 'notes' folder exists
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
  } / *  *  * Creates a single daily note file * @param {Date} date - The date for which to create the note * @param {GoogleAppsScript.Drive.Folder} rootNotesFolder - The root 'notes' folder * / function createSingleDailyNote(date, rootNotesFolder) {
    Logger.log('Creating daily note for ' + date.toISOString());

    try {
      const fileName = formatDate(date, 'yyyy - MM - dd');
      const folder = ensureWeekFolderPath(date, rootNotesFolder); / / Check if file already exists;
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
  } / *  *  * Generates the content for a daily note * @param {Date} date - The date for which to generate content * @returns {string} The generated content * / function generateDailyNoteContent(date) {
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
  } / *  *  * Generates the event table for a given date * @param {Date} date - The date for which to generate the event table * @returns {string} The generated event table * / function generateEventTable(date) {
    Logger.log('Generating event table for ' + date.toISOString());

    const events = getEventsForDay(date);
    let tableContent = '';
    let totalDuration = 0;

    const dayName = getDayName(date);
    const dayLink = `[${formatDate(date, 'yyyy - MM - dd')}](${formatDate(date, 'yyyy - MM - dd')})`;

    events.forEach(event = > {
      const eventName = event.getTitle();
      const eventId = event.getId();
      const eventLink = `[${eventName}](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
      const gvcLink = `[GVC](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
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
    }); / / Add summary row
    const totalEvents = events.length;
    const totalDurationHours = Math.ceil(totalDuration / 60 * 4) / 4; / / Round up to nearest 0.25;

    tableContent = `| ${dayName} | ${dayLink} | ${totalEvents} | | ${totalDurationHours} hrs |\n` + tableContent;

    return tableContent;
  } / *  *  * Ensures the entire folder path exists for a given date * @param {Date} date - The date for which to ensure the folder path * @param {GoogleAppsScript.Drive.Folder} rootFolder - The root folder to start from * @returns {GoogleAppsScript.Drive.Folder} The final folder in the path * / function ensureWeekFolderPath(date, rootFolder) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const weekNum = getWeekNumber(date);

    const yearFolder = findOrCreateFolder(rootFolder, year.toString());
    const monthFolder = findOrCreateFolder(yearFolder, `${month.toString().padStart(2, '0')} - ${getMonthName(month)}`);
    const weekFolder = findOrCreateFolder(monthFolder, `${year} - W${weekNum.toString().padStart(2, '0')}`);

    return weekFolder;
  } / *  *  * Finds a folder by name or creates it if it doesn't exist * @param {GoogleAppsScript.Drive.Folder} parentFolder - The parent folder * @param {string} folderName - The name of the folder to find or create * @returns {GoogleAppsScript.Drive.Folder} The found or created folder * / function findOrCreateFolder(parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      Logger.log('Creating new folder: ' + folderName);
      return parentFolder.createFolder(folderName);
    }
  } / *  *  * Gets the next Monday from a given date * @param {Date} date - The reference date * @returns {Date} The next Monday * / function getNextMonday(date) {
    const dayOfWeek = date.getDay();
    const daysUntilMonday = dayOfWeek = = = 0 ? 1 : 8 - dayOfWeek;
    return new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  } / *  *  * Formats a date according to the specified format * @param {Date} date - The date to format * @param {string} format - The desired format * @returns {string} The formatted date string * / function formatDate(date, format) {
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
  } / *  *  * Gets the week number for a given date * @param {Date} date - The date to get the week number for * @returns {number} The week number * / function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  } / *  *  * Gets all events for a specific day * @param {Date} date - The date to get events for * @returns {GoogleAppsScript.Calendar.CalendarEvent[]} An array of calendar events * / function getEventsForDay(date) {
    Logger.log('Getting events for ' + date.toISOString());

    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    const events = calendar.getEvents(startTime, endTime);

    Logger.log('Found ' + events.length + ' events');

    return events;
  } / *  *  * Gets the name of a month given its number * @param {number} month - The month number (1 - 12) * @returns {string} The name of the month * / function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  } / *  *  * Gets the name of a day given a date * @param {Date} date - The date * @returns {string} The name of the day * / function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
}

/ * *

 * Manages files and folders
 * @param
 * @param {any} date - The date parameter
 * @param {Folder} rootFolder - The rootFolder parameter
 * @returns {any} The result

 * /

function ensureWeekFolderPath(date, rootFolder) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const weekNum = getWeekNumber(date);

    const yearFolder = findOrCreateFolder(rootFolder, year.toString());
    const monthFolder = findOrCreateFolder(yearFolder, `${month.toString().padStart(2, '0')} - ${getMonthName(month)}`);
    const weekFolder = findOrCreateFolder(monthFolder, `${year} - W${weekNum.toString().padStart(2, '0')}`);

    return weekFolder;
  }

/ * *

 * Manages files and folders
 * @param
 * @param {any} date - The date parameter
 * @param {Folder} rootFolder - The rootFolder parameter
 * @returns {any} The result

 * /

function ensureWeekFolderPath(date, rootFolder) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const weekNum = getWeekNumber(date);

    const yearFolder = findOrCreateFolder(rootFolder, year.toString());
    const monthFolder = findOrCreateFolder(yearFolder, `${month.toString().padStart(2, '0')} - ${getMonthName(month)}`);
    const weekFolder = findOrCreateFolder(monthFolder, `${year} - W${weekNum.toString().padStart(2, '0')}`);

    return weekFolder;
  }

/ * *

 * Manages files and folders
 * @param
 * @param {any} date - The date parameter
 * @param {Folder} rootFolder - The rootFolder parameter
 * @returns {any} The result

 * /

function ensureWeekFolderPath(date, rootFolder) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const weekNum = getWeekNumber(date);

    const yearFolder = findOrCreateFolder(rootFolder, year.toString());
    const monthFolder = findOrCreateFolder(yearFolder, `${month.toString().padStart(2, '0')} - ${getMonthName(month)}`);
    const weekFolder = findOrCreateFolder(monthFolder, `${year} - W${weekNum.toString().padStart(2, '0')}`);

    return weekFolder;
  }

/ * *

 * Creates new find or folder or resources
 * @param
 * @param {Folder} parentFolder - The parentFolder for creation
 * @param {string} folderName - The folderName for creation
 * @returns {any} The newly created any

 * /

function findOrCreateFolder(parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      Logger.log('Creating new folder: ' + folderName);
      return parentFolder.createFolder(folderName);
    }
  }

/ * *

 * Creates new find or folder or resources
 * @param
 * @param {Folder} parentFolder - The parentFolder for creation
 * @param {string} folderName - The folderName for creation
 * @returns {any} The newly created any

 * /

function findOrCreateFolder(parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      Logger.log('Creating new folder: ' + folderName);
      return parentFolder.createFolder(folderName);
    }
  }

/ * *

 * Creates new find or folder or resources
 * @param
 * @param {Folder} parentFolder - The parentFolder for creation
 * @param {string} folderName - The folderName for creation
 * @returns {any} The newly created any

 * /

function findOrCreateFolder(parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      Logger.log('Creating new folder: ' + folderName);
      return parentFolder.createFolder(folderName);
    }
  }

/ * *

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 * /

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

/ * *

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 * /

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

/ * *

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 * /

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

/ * *

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 * /

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
      const eventLink = `[${eventName}](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
      const gvcLink = `[GVC](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
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
    }); / / Add summary row
    const totalEvents = events.length;
    const totalDurationHours = Math.ceil(totalDuration / 60 * 4) / 4; / / Round up to nearest 0.25;

    tableContent = `| ${dayName} | ${dayLink} | ${totalEvents} | | ${totalDurationHours} hrs |\n` + tableContent;

    return tableContent;
  }

/ * *

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 * /

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
      const eventLink = `[${eventName}](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
      const gvcLink = `[GVC](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
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
    }); / / Add summary row
    const totalEvents = events.length;
    const totalDurationHours = Math.ceil(totalDuration / 60 * 4) / 4; / / Round up to nearest 0.25;

    tableContent = `| ${dayName} | ${dayLink} | ${totalEvents} | | ${totalDurationHours} hrs |\n` + tableContent;

    return tableContent;
  }

/ * *

 * Generates new content or reports
 * @param
 * @param {any} date - The date parameter
 * @returns {any} The result

 * /

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
      const eventLink = `[${eventName}](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
      const gvcLink = `[GVC](https: / / calendar.google.com / calendar / event?eid= ${encodeURIComponent(eventId)})`;
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
    }); / / Add summary row
    const totalEvents = events.length;
    const totalDurationHours = Math.ceil(totalDuration / 60 * 4) / 4; / / Round up to nearest 0.25;

    tableContent = `| ${dayName} | ${dayLink} | ${totalEvents} | | ${totalDurationHours} hrs |\n` + tableContent;

    return tableContent;
  }

/ * *

 * Gets specific events for day or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getEventsForDay(date) {
    Logger.log('Getting events for ' + date.toISOString());

    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    const events = calendar.getEvents(startTime, endTime);

    Logger.log('Found ' + events.length + ' events');

    return events;
  }

/ * *

 * Gets specific events for day or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getEventsForDay(date) {
    Logger.log('Getting events for ' + date.toISOString());

    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    const events = calendar.getEvents(startTime, endTime);

    Logger.log('Found ' + events.length + ' events');

    return events;
  }

/ * *

 * Gets specific events for day or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getEventsForDay(date) {
    Logger.log('Getting events for ' + date.toISOString());

    const calendar = CalendarApp.getDefaultCalendar();
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    const events = calendar.getEvents(startTime, endTime);

    Logger.log('Found ' + events.length + ' events');

    return events;
  }

/ / Helper Functions

/ * *

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @param {any} format - The format parameter
 * @returns {any} The result

 * /

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

/ * *

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @param {any} format - The format parameter
 * @returns {any} The result

 * /

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

/ * *

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @param {any} format - The format parameter
 * @returns {any} The result

 * /

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

/ * *

 * Gets specific day name or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

/ * *

 * Gets specific day name or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

/ * *

 * Gets specific day name or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

/ * *

 * Gets specific month name or configuration
 * @param
 * @param {any} month - The month to retrieve
 * @returns {any} The requested any

 * /

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  }

/ * *

 * Gets specific month name or configuration
 * @param
 * @param {any} month - The month to retrieve
 * @returns {any} The requested any

 * /

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  }

/ * *

 * Gets specific month name or configuration
 * @param
 * @param {any} month - The month to retrieve
 * @returns {any} The requested any

 * /

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  }

/ * *

 * Gets specific next monday or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getNextMonday(date) {
    const dayOfWeek = date.getDay();
    const daysUntilMonday = dayOfWeek = = = 0 ? 1 : 8 - dayOfWeek;
    return new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  }

/ * *

 * Gets specific next monday or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getNextMonday(date) {
    const dayOfWeek = date.getDay();
    const daysUntilMonday = dayOfWeek = = = 0 ? 1 : 8 - dayOfWeek;
    return new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  }

/ * *

 * Gets specific next monday or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getNextMonday(date) {
    const dayOfWeek = date.getDay();
    const daysUntilMonday = dayOfWeek = = = 0 ? 1 : 8 - dayOfWeek;
    return new Date(date.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
  }

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }