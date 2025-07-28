/**
  * Script Name: markdown- export- calendar- meetings
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
  * 1. Initialize spreadsheet connection
  * 2. Access Drive file system
  * 3. Fetch source data
  * 4. Apply filters and criteria
  * 5. Sort data by relevant fields
  * 6. Format output for presentation
  *
  * Script Functions:
  * - createMarkdownFilesForTodaysEvents(): Creates new markdown files for todays events or resources
  * - createOrGetDailyNotesFolder(): Gets specific create or daily notes folder or configuration
  * - getOrCreateFolderPath(): Gets specific or create folder path or configuration
  * - onOpen(): Manages files and folders
  *
  * Script Helper Functions:
  * - getEventViewUrl(): Gets specific event view url or configuration
  * - getWeekNumber(): Gets specific week number or configuration
  * - isOwnedByMe(): Checks boolean condition
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - CalendarApp: For calendar and event management
  * - DriveApp: For file and folder management
  * - Logger: For logging and debugging
  * - SpreadsheetApp: For spreadsheet operations
  * - Utilities: For utility functions and encoding
  */

1. Open Google Apps Script editor (script.google.com);
2. Create a new project or open existing one
3. Copy this script into the editor
4. Ensure proper Drive API permissions are granted
5. Open a Google Sheets / Docs file to see the custom menu
6. Run the script and authorize required permissions
7. Refresh the document to see custom menus
8. Test the script with sample data

// Main Functions

/**

  * Creates new markdown files for todays events or resources
  * @returns {any} The newly created any

  */

function createMarkdownFilesForTodaysEvents() {
  try {
    Logger.log("Script started.");
    const calendarId = 'primary';
    const today = new Date();
    const todayFormatted = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy - MM - dd');
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Get today's events;
    const events = CalendarApp.getCalendarById(calendarId).getEvents(startOfDay, endOfDay);
    Logger.log(`${events.length} events found.`); // Process each event and create a markdown file;
    events.forEach((event) = > {
      const title = event.getTitle();
      const meetingDate = Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'yyyy - MM - dd');
      const ownerEmail = event.getCreators().join(", ");
      const meetingStart = Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'HH:mm');
      const meetingEnd = Utilities.formatDate(event.getEndTime(), Session.getScriptTimeZone(), 'HH:mm');
      const meetingDuration = (event.getEndTime() - event.getStartTime()) / (1000 * 60); // Duration in minutes;

      const eventViewUrl = getEventViewUrl(event, calendarId);
      const isMyMeeting = isOwnedByMe(event);
      const description = event.getDescription() || 'No description';
      const isRecurring = event.isRecurringEvent(); // Collect accepted attendees;
      const attendees = event.getGuestList();
      const acceptedAttendees = attendees.filter(att = > att.getResponseStatus() = = = 'accepted').map(att = > att.getEmail());
      const sortedAttendees = acceptedAttendees.sort().map(att = > ` - [[${att}]]`).join('\n'); // Count the number of attendees with different response statuses;
      const countAttendeesYes = acceptedAttendees.length;
      const countAttendeesNo = attendees.filter(att = > att.getResponseStatus() = = = 'declined').length;
      const countAttendeesMaybe = attendees.filter(att = > att.getResponseStatus() = = = 'tentative').length;
      const countAttendeesNoResponse = attendees.filter(att = > att.getResponseStatus() = = = 'needsAction').length; // YAML front matter;
      const yamlContent = ` - - - category: meetings;
      meetingTitle: ${title}
      meetingDate: ${meetingDate}
      meetingStart: ${meetingStart}
      meetingEnd: ${meetingEnd}
      meetingDuration: ${meetingDuration}
      meetingURL: [${meetingStart} - ${title}](${eventViewUrl})
      meetingOwner: ${ownerEmail}
      isMyMeeting: ${isMyMeeting}
      isRecurring: ${isRecurring}
      countAttendeesYes: ${countAttendeesYes}
      countAttendeesNo: ${countAttendeesNo}
      countAttendeesMaybe: ${countAttendeesMaybe}
      countAttendeesNoResponse: ${countAttendeesNoResponse}
      aliases:
      tags: - - - `; // Markdown content
      const markdownContent = `${yamlContent}

      #### Todos - #### Attendees
      ${sortedAttendees}
      `; // Get or create the "Daily Notes / yyyy - {week number}" folder
      const dailyNotesFolder = createOrGetDailyNotesFolder();
      const fileName = `${meetingDate} - ${title.replace( / [^\w\s] / gi, '')}.md`; // Create the markdown file in the folder;
      const file = dailyNotesFolder.createFile(fileName, markdownContent, MimeType.PLAIN_TEXT);
      Logger.log(`Created file: ${file.getName()}`);
      });
      Logger.log("Script completed successfully.");
    } catch (error) {
      Logger.log(`Error: ${error.message}`);
    }
  }

/**

  * Gets specific create or daily notes folder or configuration
  * @returns {any} The requested any

  */

function createOrGetDailyNotesFolder() {
    const todayDate = new Date();
    const year = Utilities.formatDate(todayDate, Session.getScriptTimeZone(), 'yyyy');
    const weekNumber = getWeekNumber(todayDate);
    const folderPath = `Daily Notes / ${year} - ${weekNumber}`;
    return getOrCreateFolderPath(folderPath);
  }

/**

  * Gets specific or create folder path or configuration
  * @param
  * @param {string} path - The file path
  * @returns {any} The requested any

  */

function getOrCreateFolderPath(path) {
    const folders = path.split(' / ');
    let parent = DriveApp.getRootFolder();
    for (let i = 0; i < folders.length; i + + ) {
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

/**

  * Manages files and folders
  * @returns {any} The result

  */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Export Meetings');
  .addItem('Meetings to Obsidian', 'createMarkdownFilesForTodaysEvents');
  .addToUi();
}

// Helper Functions

/**

  * Gets specific event view url or configuration
  * @param
  * @param {CalendarEvent} event - The event to retrieve
  * @param {string} calendarId - The calendarId to retrieve
  * @returns {any} The requested any

  */

function getEventViewUrl(event, calendarId) {
    const splitEventId = event.getId().split('@');
    return "https: // www.google.com / calendar / event?eid = " + Utilities.base64Encode(splitEventId[0] + " " + calendarId).replace(" = = ", '');
  }

/**

  * Gets specific week number or configuration
  * @param
  * @param {any} d - The d to retrieve
  * @returns {any} The requested any

  */

function getWeekNumber(d) {
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return weekNumber;
  }

/**

  * Checks boolean condition
  * @param
  * @param {CalendarEvent} event - The event parameter
  * @returns {any} True if condition is met, false otherwise

  */

function isOwnedByMe(event) {
    const ownerEmail = event.getCreators().join(", ");
    return ownerEmail.includes(Session.getActiveUser().getEmail());
  }