/ * *
 * Script Name: analyze- events- duration- distance
 *
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Analyze events duration distance patterns and trends
 * - Calculate statistics and metrics
 * - Generate insights and recommendations
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Format output for presentation
 * 5. Write results to destination
 *
 * Script Functions:
 * - exportAllCalendarEvents(): Exports all calendar events to external format
 * - getDayOfWeek(): Gets specific day of week or configuration
 * - getDayOfYear(): Gets specific day of year or configuration
 *
 * Script Helper Functions:
 * - getQuarter(): Gets specific quarter or configuration
 * - getWeekNumber(): Gets specific week number or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - CalendarApp: For calendar and event management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/ / Main Functions

/ * *

 * Exports all calendar events to external format
 * @returns {any} The result

 * /

function exportAllCalendarEvents() { / / Enable Advanced Calendar Service / / Go to Resources > Advanced Google Services and enable Calendar API / / Get today's date in UTC and set to 00:00:00
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0); / / Calculate start date as 18 months ago from today;
  let startDate = new Date(today);
  startDate.setUTCMonth(startDate.getUTCMonth() - 18); / / Set timeMax to tomorrow in UTC;
  let tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1); / / Format timeMin and timeMax for Calendar API in UTC;
  let timeMin = Utilities.formatDate(startDate, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'");
  let timeMax = Utilities.formatDate(tomorrow, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'"); / / Retrieve all accessible calendars;
  let calendars = CalendarApp.getAllCalendars(); / / Prepare data array with headers;
  let headers = ["Calendar Name", "Event Date", "Event Name", "Event Location", "Start Time", "End Time", "Duration", "Year", "Quarter", "Month", "Week", "Day of Year", "Day of Week"];
  let data = [headers]; / / Helper functions;
  / * *
   * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any
   * /
  function getQuarter(date) {
    let month = date.getUTCMonth();
    return Math.floor(month / 3) + 1;
  }

  / * *

   * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

   * /

  function getWeekNumber(date) {
    let d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((( (d - yearStart) / 86400000) + 1) / 7);
  }

  / * *

   * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

   * /

  function getDayOfYear(date) {
    let start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    let diff = date - start;
    let oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }

  / * *

   * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

   * /

  function getDayOfWeek(date) {
    let day = date.getUTCDay();
    if (day = = = 0) {
      return 7;
    } else {
      return day;
    }
  } / / Process each calendar
  calendars.forEach(function (calendar) {
    let calId = calendar.getId();
    let calName = calendar.getName(); / / Retrieve events for the calendar;
    let options = {
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    };
    let response = Calendar.Events.list(calId, options);
    let events = response.items; / / Process each event;
    events.forEach(function (event) {
      try {
        let eventDate = new Date(event.start.dateTime || event.start.date);
        let eventName = event.summary || "Untitled";
        let eventLocation = event.location || "";
        let startTime = event.start.dateTime ? new Date(event.start.dateTime) : "";
        let endTime = event.end.dateTime ? new Date(event.end.dateTime) : ""; / / Calculate duration;
        let duration;
        if (startTime && endTime && endTime > = startTime) {
          let diff = endTime - startTime;
          let hours = diff / (1000 * 60 * 60);
          duration = hours.toFixed(2); / / Format to two decimal places;
        } else {
          duration = 0;
        } / / Format dates and times in UTC
        let eventDateStr = Utilities.formatDate(eventDate, "UTC", "yyyy - MM - dd");
        let startTimeStr = startTime ? Utilities.formatDate(startTime, "UTC", "HH:mm") : "";
        let endTimeStr = endTime ? Utilities.formatDate(endTime, "UTC", "HH:mm") : ""; / / Create hyperlink for location;
        let locationHyperlink = eventLocation ? `= HYPERLINK("https: / / www.google.com / maps / search / ?api= 1&query= ${encodeURIComponent(eventLocation)}", "${eventLocation}")` : ""; / / Get additional date fields;
        let year = eventDate.getUTCFullYear();
        let quarter = getQuarter(eventDate);
        let month = eventDate.getUTCMonth() + 1; / / Months are 0 - based;
        let week = getWeekNumber(eventDate);
        let dayOfYear = getDayOfYear(eventDate);
        let dayOfWeek = getDayOfWeek(eventDate); / / Add row data;
        data.push([
          calName,
          eventDateStr,
          eventName,
          locationHyperlink,
          startTimeStr,
          endTimeStr,
          duration,
          year,
          quarter,
          month,
          week,
          dayOfYear,
          dayOfWeek
        ]);
      } catch (e) {
        Logger.log("Error processing event: " + (event.summary || "Untitled"));
        Logger.log(e);
      }
    });
  }); / / Create or clear the "Events" sheet
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("Events");
  if (sheet) {
    sheet.clear();
  } else {
    sheet = spreadsheet.insertSheet("Events");
  } / / Write data to the sheet
  if (data.length > 1) { / / Ensure there are events to write;
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  } / / Format the spreadsheet / / Freeze the top row and make header bold
  sheet.setFrozenRows(1);
  sheet.getRange("1:1").setFontWeight('bold'); / / Freeze column A and make it bold;
  sheet.setFrozenColumns(1);
  let columnA = sheet.getRange("A:A");
  columnA.setFontWeight('bold'); / / Auto - adjust columns;
  sheet.autoResizeColumns(1, headers.length); / / Format Start Time and End Time columns;
  sheet.getRange(2, 5, data.length - 1, 1).setNumberFormat("HH:mm");
  sheet.getRange(2, 6, data.length - 1, 1).setNumberFormat("HH:mm"); / / Optional: Add notification;
  SpreadsheetApp.getUi().alert('Events exported successfully to "Events" sheet.');
}

/ * *

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfWeek(date) {
    let day = date.getUTCDay();
    if (day = = = 0) {
      return 7;
    } else {
      return day;
    }
  }

/ * *

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfWeek(date) {
    let day = date.getUTCDay();
    if (day = = = 0) {
      return 7;
    } else {
      return day;
    }
  }

/ * *

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfWeek(date) {
    let day = date.getUTCDay();
    if (day = = = 0) {
      return 7;
    } else {
      return day;
    }
  }

/ * *

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfYear(date) {
    let start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    let diff = date - start;
    let oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }

/ * *

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfYear(date) {
    let start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    let diff = date - start;
    let oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }

/ * *

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfYear(date) {
    let start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    let diff = date - start;
    let oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }

/ / Helper Functions

/ * *

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getQuarter(date) {
    let month = date.getUTCMonth();
    return Math.floor(month / 3) + 1;
  }

/ * *

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getQuarter(date) {
    let month = date.getUTCMonth();
    return Math.floor(month / 3) + 1;
  }

/ * *

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getQuarter(date) {
    let month = date.getUTCMonth();
    return Math.floor(month / 3) + 1;
  }

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
    let d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((( (d - yearStart) / 86400000) + 1) / 7);
  }

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
    let d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((( (d - yearStart) / 86400000) + 1) / 7);
  }

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
    let d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((( (d - yearStart) / 86400000) + 1) / 7);
  }