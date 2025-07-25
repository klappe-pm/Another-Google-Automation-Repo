/**
 * Title: Calendar Export Date Range
 * Service: Google Calendar
 * Purpose: Export calendar events from all calendars within specified date range
 * Created: 2025-01-16
 * Updated: 2025-07-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Export calendar events from all calendars within a specified date range to Google Sheets
- Description: Iterates through all available calendars and retrieves events for analysis or reporting
- Problem Solved: Automates the manual process of exporting calendar events, saving time and reducing errors
- Successful Execution: Creates a new spreadsheet with all calendar events within the specified date range
*/

/*
Functions-Alphabetical:
- clearLog(): Clears the console log.
- exportCalendarEvents(): Exports calendar events to a new spreadsheet.
- main(): Clears the log and runs the exportCalendarEvents function.
*/

/*
Functions-Ordered:
1. main(): Clears the log and runs the exportCalendarEvents function.
2. clearLog(): Clears the console log.
3. exportCalendarEvents(): Exports calendar events to a new spreadsheet.
*/

/*
Script-Steps:
1. Clear the log.
2. Set the date range for exporting events.
3. Get all calendars.
4. Create a new spreadsheet.
5. Set headers in the spreadsheet.
6. Iterate through each calendar and retrieve events within the date range.
7. Append each event's details to the spreadsheet.
8. Autofit columns in the spreadsheet.
9. Log the total number of events exported and the spreadsheet URL.
*/

/*
Helper Functions:
- clearLog(): Clears the console log.
- main(): Clears the log and runs the exportCalendarEvents function.
*/

function exportCalendarEvents() {
  // NEW: Added debug logging
  console.log('Starting exportCalendarEvents function');

  // Set the date range
  var startDate = new Date('2023-10-08');
  var endDate = new Date(); // Today's date
  // NEW: Added debug logging
  console.log('Date range: ' + startDate + ' to ' + endDate);

  // Get all calendars
  var calendars = CalendarApp.getAllCalendars();
  // NEW: Added debug logging
  console.log('Found ' + calendars.length + ' calendars');

  // Create a new spreadsheet
  var spreadsheet = SpreadsheetApp.create('Calendar Events Export');
  var sheet = spreadsheet.getActiveSheet();
  // NEW: Added debug logging
  console.log('Created new spreadsheet: ' + spreadsheet.getUrl());

  // Set headers
  sheet.appendRow(['Calendar', 'Event Title', 'Start Time', 'End Time', 'Description', 'Location']);
  // NEW: Added debug logging
  console.log('Added headers to the spreadsheet');

  // NEW: Added counter for total events
  var totalEvents = 0;

  // Iterate through all calendars
  for (var i = 0; i < calendars.length; i++) {
    var calendar = calendars[i];
    // NEW: Added debug logging
    console.log('Processing calendar: ' + calendar.getName());

    var events;
    // NEW: Added try-catch for error handling
    try {
      events = calendar.getEvents(startDate, endDate);
      // NEW: Added debug logging
      console.log('Found ' + events.length + ' events in ' + calendar.getName());
    } catch (error) {
      // NEW: Added error logging
      console.error('Error fetching events from ' + calendar.getName() + ': ' + error.toString());
      continue; // Skip to the next calendar if there's an error
    }

    // Iterate through all events in the calendar
    for (var j = 0; j < events.length; j++) {
      var event = events[j];
      // NEW: Added try-catch for error handling
      try {
        sheet.appendRow([
          calendar.getName(),
          event.getTitle(),
          event.getStartTime(),
          event.getEndTime(),
          event.getDescription(),
          event.getLocation()
        ]);
        totalEvents++; // NEW: Increment total events counter
      } catch (error) {
        // NEW: Added error logging
        console.error('Error adding event to spreadsheet: ' + error.toString());
      }
    }
  }

  // Autofit columns
  sheet.autoResizeColumns(1, 6);

  // NEW: Added summary logging
  console.log('Export completed. Total events exported: ' + totalEvents);
  console.log('Spreadsheet URL: ' + spreadsheet.getUrl());
}

// NEW: Added a function to clear the log
function clearLog() {
  console.clear();
}

// NEW: Added a main function to run the export with log clearing
function main() {
  clearLog();
  exportCalendarEvents();
}
