/ * *
 * Script Name: export- calendar- distance- time
 *
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Extract calendar distance time data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
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
 * - getDistancesFromGoogleMaps(): Gets specific distances from google maps or configuration
 *
 * Script Helper Functions:
 * - formatValue(): Formats value for display
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
 * - UrlFetchApp: For HTTP requests to external services
 * - Utilities: For utility functions and encoding
 * /

/ / Main Functions

/ * *

 * Exports all calendar events to external format
 * @returns {any} The result

 * /

function exportAllCalendarEvents() { / / Enable Advanced Calendar Service / / Go to Resources > Advanced Google Services and enable Calendar API / / Define the three destination locations;
  const destinationLocations = [;
    "901 East South Street, Anaheim, CA 92805",
    "17900 Jamboree Rd, Irvine, CA 92614",
    "1170 Winslow Lane, Newport Beach, CA 92660"
  ]; / / Get today's date in UTC and set to 00:00:00
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0); / / Calculate start date as 18 months ago from today;
  let startDate = new Date(today);
  startDate.setUTCMonth(startDate.getUTCMonth() - 18); / / Set timeMax to tomorrow in UTC;
  let tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1); / / Format timeMin and timeMax for Calendar API in UTC;
  let timeMin = Utilities.formatDate(startDate, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'");
  let timeMax = Utilities.formatDate(tomorrow, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'"); / / Retrieve all accessible calendars;
  let calendars = CalendarApp.getAllCalendars(); / / Prepare data array with headers;
  let headers = [;
    "Calendar Name", "Event Date", "Event Name", "Event Location", "Start Time", "End Time", "Duration",
    "Year", "Quarter", "Month", "Week", "Day of Year", "Day of Week",
    "Distance to Loc1", "Time to Loc1",
    "Distance to Loc2", "Time to Loc2",
    "Distance to Loc3", "Time to Loc3",
    "Distance from Loc1", "Time from Loc1",
    "Distance from Loc2", "Time from Loc2",
    "Distance from Loc3", "Time from Loc3"
  ];
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
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
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
  }

  / * *

   * Gets specific distances from google maps or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origins - The origins to retrieve
 * @param {any} destinations - The destinations to retrieve
 * @returns {any} The requested any

   * /

  function getDistancesFromGoogleMaps(apiKey, origins, destinations) {
    try {
      const originsEncoded = encodeURIComponent(origins.join("|"));
      const destinationsEncoded = encodeURIComponent(destinations.join("|"));
      const url = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      if (data && data.status = = = "OK") {
        if (origins.length = = = 1) {
          return data.rows[0].elements.map(element = > ({
            distance: element.distance && typeof element.distance.value = = = 'number' ? element.distance.value / 1609.34 : "",
            duration: element.duration && typeof element.duration.value = = = 'number' ? element.duration.value / 3600 : "";
          }));
        } else {
          return data.rows.map(row = > ({
            distance: row.elements[0].distance && typeof row.elements[0].distance.value = = = 'number' ? row.elements[0].distance.value / 1609.34 : "",
            duration: row.elements[0].duration && typeof row.elements[0].duration.value = = = 'number' ? row.elements[0].duration.value / 3600 : "";
          }));
        }
      } else {
        Logger.log(`Distance Matrix API call failed: ${data ? data.error_message : 'Unknown error'}`);
        return Array(origins.length).fill({ distance: "", duration: "" });
      }
    } catch (e) {
      Logger.log(`Error calling Distance Matrix API: ${e.message}`);
      return Array(origins.length).fill({ distance: "", duration: "" });
    }
  }

  / * *

   * Formats value for display
 * @param
 * @param {string|any} value - The value to set
 * @returns {any} The result

   * /

  function formatValue(value) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(2) : "";
  } / / Process each calendar
  calendars.forEach(function (calendar) {
    let calId = calendar.getId();
    let calName = calendar.getName(); / / Retrieve events for the calendar;
    let options = {
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: "startTime"
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
          duration = "0.00";
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
        let dayOfWeek = getDayOfWeek(eventDate); / / Calculate outbound distances and times if location is available;
        let distancesAndTimes = [];
        if (typeof eventLocation = = = 'string' && eventLocation ! = = "") {
          const origins = [eventLocation];
          const distancesOutbound = getDistancesFromGoogleMaps('AIzaSyBtVzNvki2XJ0A6l8NoiyEFaz1D6azeelA', origins, destinationLocations);
          distancesOutbound.forEach(distanceData = > {
            distancesAndTimes.push(
              formatValue(distanceData.distance),
              formatValue(distanceData.duration);
            );
          });
        } else { / / If no location, push blank strings for all distance and time fields
          for (let i = 0; i < destinationLocations.length * 2; i + + ) {
            distancesAndTimes.push("");
          }
        } / / Calculate return distances and times
        if (typeof eventLocation = = = 'string' && eventLocation ! = = "") {
          const originsReturn = destinationLocations;
          const distancesReturn = getDistancesFromGoogleMaps('AIzaSyBtVzNvki2XJ0A6l8NoiyEFaz1D6azeelA', originsReturn, [eventLocation]);
          distancesReturn.forEach(distanceData = > {
            distancesAndTimes.push(
              formatValue(distanceData.distance),
              formatValue(distanceData.duration);
            );
          });
        } else { / / If no location, push blank strings for all return distance and time fields
          for (let i = 0; i < destinationLocations.length * 2; i + + ) {
            distancesAndTimes.push("");
          }
        } / / Ensure distancesAndTimes has 12 elements
        if (distancesAndTimes.length ! = = 12) {
          Logger.log("distancesAndTimes length mismatch: " + distancesAndTimes.length);
          while (distancesAndTimes.length < 12) {
            distancesAndTimes.push("");
          }
        } / / Add row data
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
          dayOfWeek,
          ...distancesAndTimes
        ]); / / Log the length of the data row being pushed
        Logger.log("Data row length: " + data[data.length - 1].length);

      } catch (e) {
        Logger.log("Error processing event: " + (event.summary || "Untitled"));
        Logger.log("Event Location: " + event.location);
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
  sheet.getRange("1:1").setFontWeight('bold'); / / Freeze column A;
  sheet.setFrozenColumns(1); / / Format Start Time and End Time columns;
  sheet.getRange(2, 5, data.length - 1, 1).setNumberFormat("HH:mm");
  sheet.getRange(2, 6, data.length - 1, 1).setNumberFormat("HH:mm"); / / Left align all data in the sheet;
  sheet.getDataRange().setHorizontalAlignment('left'); / / Optional: Add notification;
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

/ * *

 * Gets specific distances from google maps or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origins - The origins to retrieve
 * @param {any} destinations - The destinations to retrieve
 * @returns {any} The requested any

 * /

function getDistancesFromGoogleMaps(apiKey, origins, destinations) {
    try {
      const originsEncoded = encodeURIComponent(origins.join("|"));
      const destinationsEncoded = encodeURIComponent(destinations.join("|"));
      const url = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      if (data && data.status = = = "OK") {
        if (origins.length = = = 1) {
          return data.rows[0].elements.map(element = > ({
            distance: element.distance && typeof element.distance.value = = = 'number' ? element.distance.value / 1609.34 : "",
            duration: element.duration && typeof element.duration.value = = = 'number' ? element.duration.value / 3600 : "";
          }));
        } else {
          return data.rows.map(row = > ({
            distance: row.elements[0].distance && typeof row.elements[0].distance.value = = = 'number' ? row.elements[0].distance.value / 1609.34 : "",
            duration: row.elements[0].duration && typeof row.elements[0].duration.value = = = 'number' ? row.elements[0].duration.value / 3600 : "";
          }));
        }
      } else {
        Logger.log(`Distance Matrix API call failed: ${data ? data.error_message : 'Unknown error'}`);
        return Array(origins.length).fill({ distance: "", duration: "" });
      }
    } catch (e) {
      Logger.log(`Error calling Distance Matrix API: ${e.message}`);
      return Array(origins.length).fill({ distance: "", duration: "" });
    }
  }

/ * *

 * Gets specific distances from google maps or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origins - The origins to retrieve
 * @param {any} destinations - The destinations to retrieve
 * @returns {any} The requested any

 * /

function getDistancesFromGoogleMaps(apiKey, origins, destinations) {
    try {
      const originsEncoded = encodeURIComponent(origins.join("|"));
      const destinationsEncoded = encodeURIComponent(destinations.join("|"));
      const url = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      if (data && data.status = = = "OK") {
        if (origins.length = = = 1) {
          return data.rows[0].elements.map(element = > ({
            distance: element.distance && typeof element.distance.value = = = 'number' ? element.distance.value / 1609.34 : "",
            duration: element.duration && typeof element.duration.value = = = 'number' ? element.duration.value / 3600 : "";
          }));
        } else {
          return data.rows.map(row = > ({
            distance: row.elements[0].distance && typeof row.elements[0].distance.value = = = 'number' ? row.elements[0].distance.value / 1609.34 : "",
            duration: row.elements[0].duration && typeof row.elements[0].duration.value = = = 'number' ? row.elements[0].duration.value / 3600 : "";
          }));
        }
      } else {
        Logger.log(`Distance Matrix API call failed: ${data ? data.error_message : 'Unknown error'}`);
        return Array(origins.length).fill({ distance: "", duration: "" });
      }
    } catch (e) {
      Logger.log(`Error calling Distance Matrix API: ${e.message}`);
      return Array(origins.length).fill({ distance: "", duration: "" });
    }
  }

/ * *

 * Gets specific distances from google maps or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origins - The origins to retrieve
 * @param {any} destinations - The destinations to retrieve
 * @returns {any} The requested any

 * /

function getDistancesFromGoogleMaps(apiKey, origins, destinations) {
    try {
      const originsEncoded = encodeURIComponent(origins.join("|"));
      const destinationsEncoded = encodeURIComponent(destinations.join("|"));
      const url = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      if (data && data.status = = = "OK") {
        if (origins.length = = = 1) {
          return data.rows[0].elements.map(element = > ({
            distance: element.distance && typeof element.distance.value = = = 'number' ? element.distance.value / 1609.34 : "",
            duration: element.duration && typeof element.duration.value = = = 'number' ? element.duration.value / 3600 : "";
          }));
        } else {
          return data.rows.map(row = > ({
            distance: row.elements[0].distance && typeof row.elements[0].distance.value = = = 'number' ? row.elements[0].distance.value / 1609.34 : "",
            duration: row.elements[0].duration && typeof row.elements[0].duration.value = = = 'number' ? row.elements[0].duration.value / 3600 : "";
          }));
        }
      } else {
        Logger.log(`Distance Matrix API call failed: ${data ? data.error_message : 'Unknown error'}`);
        return Array(origins.length).fill({ distance: "", duration: "" });
      }
    } catch (e) {
      Logger.log(`Error calling Distance Matrix API: ${e.message}`);
      return Array(origins.length).fill({ distance: "", duration: "" });
    }
  }

/ / Helper Functions

/ * *

 * Formats value for display
 * @param
 * @param {string|any} value - The value to set
 * @returns {any} The result

 * /

function formatValue(value) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(2) : "";
  }

/ * *

 * Formats value for display
 * @param
 * @param {string|any} value - The value to set
 * @returns {any} The result

 * /

function formatValue(value) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(2) : "";
  }

/ * *

 * Formats value for display
 * @param
 * @param {string|any} value - The value to set
 * @returns {any} The result

 * /

function formatValue(value) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(2) : "";
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
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
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
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
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
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }