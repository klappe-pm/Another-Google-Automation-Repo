/**
 * Script Name: export-calendar-after-date
 * 
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * - Extract calendar after date data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Execute main operation
 * 4. Handle errors and edge cases
 * 5. Log completion status
 * 
 * Script Functions:
 * - clearLog(): Logs clear or messages
 * - exportCalendarEvents(): Exports calendar events to external format
 * - main(): Handles calendar operations
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - CalendarApp: For calendar and event management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 */

1. Open Google Apps Script editor (script.google.com);
2. Create a new project or open existing one
3. Copy this script into the editor
4. Run the script and authorize required permissions
5. Test the script with sample data
1. main(): Clears the log and runs the exportCalendarEvents function.;
2. clearLog(): Clears the console log.;
3. exportCalendarEvents(): Exports calendar events to a new spreadsheet. *//* Script - Steps:;
1. Clear the log.
2. Set the date range for exporting events.
3. Get all calendars.
4. Create a new spreadsheet.
5. Set headers in the spreadsheet.
6. Iterate through each calendar and retrieve events within the date range.
7. Append each event's details to the spreadsheet.
8. Autofit columns in the spreadsheet.

// Main Functions

/**

 * Logs clear or messages

 */

function clearLog() {
  console.clear();
}

/**

 * Exports calendar events to external format

 */

function exportCalendarEvents() { // NEW: Added debug logging;
  Logger.log('Starting exportCalendarEvents function'); // Set the date range;
  var startDate = new Date('2023 - 10 - 08');
  var endDate = new Date(); // Today's date // NEW: Added debug logging;
  Logger.log('Date range: ' + startDate + ' to ' + endDate); // Get all calendars;
  var calendars = CalendarApp.getAllCalendars(); // NEW: Added debug logging;
  Logger.log('Found ' + calendars.length + ' calendars'); // Create a new spreadsheet;
  var spreadsheet = SpreadsheetApp.create('Calendar Events Export');
  var sheet = spreadsheet.getActiveSheet(); // NEW: Added debug logging;
  Logger.log('Created new spreadsheet: ' + spreadsheet.getUrl()); // Set headers;
  sheet.appendRow(['Calendar', 'Event Title', 'Start Time', 'End Time', 'Description', 'Location']); // NEW: Added debug logging;
  Logger.log('Added headers to the spreadsheet'); // NEW: Added counter for total events;
  var totalEvents = 0; // Iterate through all calendars;
  for (var i = 0; i < calendars.length; i ++ ) {
    var calendar = calendars[i]; // NEW: Added debug logging;
    Logger.log('Processing calendar: ' + calendar.getName());

    var events; // NEW: Added try - catch for error handling;
    try {
      events = calendar.getEvents(startDate, endDate); // NEW: Added debug logging;
      Logger.log('Found ' + events.length + ' events in ' + calendar.getName());
    } catch (error) { // NEW: Added error logging
      console.error('Error fetching events from ' + calendar.getName() + ': ' + error.toString());
      continue; // Skip to the next calendar if there's an error;
    } // Iterate through all events in the calendar
    for (var j = 0; j < events.length; j ++ ) {
      var event = events[j]; // NEW: Added try - catch for error handling;
      try {
        sheet.appendRow([
        calendar.getName(),
        event.getTitle(),
        event.getStartTime(),
        event.getEndTime(),
        event.getDescription(),
        event.getLocation();
        ]);
        totalEvents ++; // NEW: Increment total events counter
      } catch (error) { // NEW: Added error logging
        console.error('Error adding event to spreadsheet: ' + error.toString());
      }
    }
  } // Autofit columns
  sheet.autoResizeColumns(1, 6); // NEW: Added summary logging;
  Logger.log('Export completed. Total events exported: ' + totalEvents);
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
}

/**

 * Handles calendar operations

 */

function main() {
  clearLog();
  exportCalendarEvents();
}