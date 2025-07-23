/**
 * Title: Calendar Export to Obsidian
 * Service: Google Calendar
 * Purpose: Export calendar events to Obsidian markdown files
 * Created: 2025-01-16
 * Updated: 2025-07-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * GitHub Actions Test!
 */

/*
Script Summary:
- Purpose: Export Google Calendar events for the current day to markdown files formatted for Obsidian
- Description: Automates the creation of daily meeting notes in Obsidian with structured formatting
- Problem Solved: Eliminates manual effort required to document daily meetings in Obsidian
- Successful Execution: Creates markdown files for each of today's events in Daily Notes folder with complete meeting information
*/

// Functions-Alphabetical
// -----------------------
// - createMarkdownFilesForTodaysEvents(): Main function to create markdown files for today's events.
// - createOrGetDailyNotesFolder(): Get or create the "Daily Notes/yyyy-{week number}" folder.
// - getEventViewUrl(event, calendarId): Get the Google Calendar View Event URL.
// - getOrCreateFolderPath(path): Get or create a folder by path.
// - getWeekNumber(d): Helper function to calculate week number.
// - isOwnedByMe(event): Determine if the event is owned by the current user.
// - onOpen(): Function to add custom menu.

// Functions-Ordered
// -----------------
// 1. onOpen(): Adds a custom menu to the Google Sheets UI.
// 2. createMarkdownFilesForTodaysEvents(): Main function to process today's events and create markdown files.
// 3. createOrGetDailyNotesFolder(): Creates or retrieves the folder for storing daily notes.
// 4. getWeekNumber(d): Calculates the week number for folder organization.
// 5. getOrCreateFolderPath(path): Ensures the folder path exists or creates it.
// 6. getEventViewUrl(event, calendarId): Generates the URL to view the event in Google Calendar.
// 7. isOwnedByMe(event): Checks if the current user is the owner of the event.

// Script-Steps
// ------------
// 1. Add a custom menu to the Google Sheets UI.
// 2. Retrieve today's events from the primary Google Calendar.
// 3. Process each event to extract details such as title, date, time, duration, owner, description, and attendees.
// 4. Generate YAML front matter and markdown content for each event.
// 5. Create or retrieve the "Daily Notes" folder for the current week.
// 6. Create a markdown file for each event in the appropriate folder.
// 7. Log the creation of each file and handle any errors that occur.

// Helper Functions
// ----------------
// - getWeekNumber(d): Calculates the week number for a given date.
// - getOrCreateFolderPath(path): Ensures a folder path exists or creates it.
// - getEventViewUrl(event, calendarId): Generates a URL to view the event in Google Calendar.
// - isOwnedByMe(event): Determines if the current user is the owner of the event.

// Function to add custom menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Export Meetings')
    .addItem('Meetings to Obsidian', 'createMarkdownFilesForTodaysEvents')
    .addToUi();
}

// Main function to create markdown files for today's events
function createMarkdownFilesForTodaysEvents() {
  try {
    Logger.log("Script started.");
    const calendarId = 'primary';
    const today = new Date();
    const todayFormatted = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's events
    const events = CalendarApp.getCalendarById(calendarId).getEvents(startOfDay, endOfDay);
    Logger.log(`${events.length} events found.`);

    // Process each event and create a markdown file
    events.forEach((event) => {
      const title = event.getTitle();
      const meetingDate = Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      const ownerEmail = event.getCreators().join(", ");
      const meetingStart = Utilities.formatDate(event.getStartTime(), Session.getScriptTimeZone(), 'HH:mm');
      const meetingEnd = Utilities.formatDate(event.getEndTime(), Session.getScriptTimeZone(), 'HH:mm');
      const meetingDuration = (event.getEndTime() - event.getStartTime()) / (1000 * 60); // Duration in minutes

      const eventViewUrl = getEventViewUrl(event, calendarId);
      const isMyMeeting = isOwnedByMe(event);
      const description = event.getDescription() || 'No description';
      const isRecurring = event.isRecurringEvent();

      // Collect accepted attendees
      const attendees = event.getGuestList();
      const acceptedAttendees = attendees.filter(att => att.getResponseStatus() === 'accepted').map(att => att.getEmail());
      const sortedAttendees = acceptedAttendees.sort().map(att => `- [[${att}]]`).join('\n');

      // Count the number of attendees with different response statuses
      const countAttendeesYes = acceptedAttendees.length;
      const countAttendeesNo = attendees.filter(att => att.getResponseStatus() === 'declined').length;
      const countAttendeesMaybe = attendees.filter(att => att.getResponseStatus() === 'tentative').length;
      const countAttendeesNoResponse = attendees.filter(att => att.getResponseStatus() === 'needsAction').length;

      // YAML front matter
      const yamlContent = `---
category: meetings
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
tags:
---`;

      // Markdown content
      const markdownContent = `${yamlContent}

## ${title}
>[!tip] Daily Note - [[${todayFormatted}]]
>>---
>> - Meeting URL: [${meetingStart} - ${title}](${eventViewUrl})
>> - Description: ${description}
---

### Notes

#### Todos
-

#### Attendees
${sortedAttendees}
`;

      // Get or create the "Daily Notes/yyyy-{week number}" folder
      const dailyNotesFolder = createOrGetDailyNotesFolder();
      const fileName = `${meetingDate} - ${title.replace(/[^\w\s]/gi, '')}.md`;

      // Create the markdown file in the folder
      const file = dailyNotesFolder.createFile(fileName, markdownContent, MimeType.PLAIN_TEXT);
      Logger.log(`Created file: ${file.getName()}`);
    });
    Logger.log("Script completed successfully.");
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
  }
}

// Function to get or create the "Daily Notes/yyyy-{week number}" folder
function createOrGetDailyNotesFolder() {
  const todayDate = new Date();
  const year = Utilities.formatDate(todayDate, Session.getScriptTimeZone(), 'yyyy');
  const weekNumber = getWeekNumber(todayDate);
  const folderPath = `Daily Notes/${year}-${weekNumber}`;
  return getOrCreateFolderPath(folderPath);
}

// Helper function to calculate week number
function getWeekNumber(d) {
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return weekNumber;
}

// Function to get or create a folder by path
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

// Function to get the Google Calendar View Event URL
function getEventViewUrl(event, calendarId) {
  const splitEventId = event.getId().split('@');
  return "https://www.google.com/calendar/event?eid=" + Utilities.base64Encode(splitEventId[0] + " " + calendarId).replace("==", '');
}

// Function to determine if the event is owned by the current user
function isOwnedByMe(event) {
  const ownerEmail = event.getCreators().join(", ");
  return ownerEmail.includes(Session.getActiveUser().getEmail());
}
