/**
  * Script Name: export- calendar
  *
  * Script Summary:
  * Exports spreadsheet data for automated workflow processing.
  *
  * Script Purpose:
  * - Extract calendar data from Google services
  * - Convert data to portable formats
  * - Generate reports and summaries
  * - Handle bulk operations efficiently
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Fetch source data
  * 3. Process and transform data
  * 4. Apply filters and criteria
  * 5. Format output for presentation
  *
  * Script Functions:
  * - chunkArray(): Performs specialized operations
  * - exportAllCalendarEvents(): Exports all calendar events to external format
  * - getDayOfYear(): Gets specific day of year or configuration
  * - getDistancesFromGoogleMaps(): Gets specific distances from google maps or configuration
  * - getLocationForDate(): Gets specific location for date or configuration
  * - getQuarter(): Gets specific quarter or configuration
  * - roundToQuarterHour(): Performs specialized operations
  * - setConfig(): Sets config or configuration values
  *
  * Script Helper Functions:
  * - formatValue(): Formats value for display
  * - getDayOfWeek(): Gets specific day of week or configuration
  * - getNameDayWeek(): Gets specific name day week or configuration
  * - getNameMonth(): Gets specific name month or configuration
  * - getNameQuarter(): Gets specific name quarter or configuration
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
  */

// Main Functions

/**

  * Performs specialized operations
  * @param
  * @param {Array} array - Array of elements
  * @param {number} size - The size limit
  * @returns {any} The result

  */

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i + = size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

/**

  * Performs specialized operations
  * @param
  * @param {Array} array - Array of elements
  * @param {number} size - The size limit
  * @returns {any} The result

  */

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i + = size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

/**

  * Performs specialized operations
  * @param
  * @param {Array} array - Array of elements
  * @param {number} size - The size limit
  * @returns {any} The result

  */

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i + = size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

/**

  * Exports all calendar events to external format
  * @returns {any} The result

  */

function exportAllCalendarEvents() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = spreadsheet.getSheetByName('config');
  const logSheet = spreadsheet.getSheetByName('EventLog') || spreadsheet.insertSheet('EventLog');

  // Load configuration from 'config' sheet
  if (! configSheet) {
    SpreadsheetApp.getUi().alert('Error: "config" sheet not found. Please run setConfig() to create it.');
    Logger.log('Error: "config" sheet not found.');
    return;
  }

  const configData = configSheet.getDataRange().getValues().slice(1); // Skip headers
  const apiKey = configData[0][0]; // First row, apiKey column
  if (! apiKey) {
    SpreadsheetApp.getUi().alert('Error: Google Maps API key is not configured in the "config" sheet. Please run setConfig() to set the API key.');
    Logger.log('Error: Google Maps API key is not configured.');
    return;
  }

  // Validate calendar IDs and locations
  const calendarIds = [...new Set(configData.filter(row = > row[1]).map(row = > row[1]))]; // Unique calName
  const locations = configData
    .filter(row = > row[2] && row[3] && row[4]) // Non- empty location, dateStart, dateEnd
    .map(row = > ({
      address: row[2],
      start: new Date(row[3]),
      end: new Date(row[4]),
      index: configData.indexOf(row) + 1
    }))
    .filter(loc = > ! isNaN(loc.start) && ! isNaN(loc.end)); // Valid dates

  if (! calendarIds.length) {
    SpreadsheetApp.getUi().alert('Error: No valid calendar IDs found in the "config" sheet.');
    Logger.log('Error: No valid calendar IDs found.');
    return;
  }
  if (! locations.length) {
    SpreadsheetApp.getUi().alert('Error: No valid locations with date ranges found in the "config" sheet.');
    Logger.log('Error: No valid locations found.');
    return;
  }

  // Load processed event IDs from EventLog
  const logData = logSheet.getDataRange().getValues();
  const processedEventIds = new Set(logData.slice(1).map(row = > row[0])); // Event IDs in first column

  // Initialize cache for date calculations and API results
  const dateCache = {};
  const distanceCache = {};
  const errors = [];

  // Get today's date in UTC and set to 00:00:00
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Calculate start date (18 months ago) and tomorrow
  const startDate = new Date(today);
  startDate.setUTCMonth(startDate.getUTCMonth() - 18);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(today.getUTCDate() + 1);

  // Format timeMin and timeMax for Calendar API
  const timeMin = Utilities.formatDate(startDate, "UTC", "yyyy- MM- dd'T'HH:mm:ss'Z'");
  const timeMax = Utilities.formatDate(tomorrow, "UTC", "yyyy- MM- dd'T'HH:mm:ss'Z'");

  // Prepare data array with headers
  const headers = [
    "calName", "eventDate", "eventName", "eventDescription", "eventDuration",
    "numYear", "numQuarter", "numMonth", "numWeek", "numDayYear", "numDayMonth", "numDayWeek",
    "nameQuarter", "nameMonth", "nameDayWeek", "locationStartReturn", "locationEvent",
    "eventStartTime", "eventEndTime", "distanceTotal", "distanceToEvent", "distanceToReturn",
    "timeTotal", "timetoEvent", "timeToReturn"
  ];
  const data = [headers];

  // Helper functions
  / * *
    * Gets specific quarter or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any
    */
  function getQuarter(date) {
    const key = date.toISOString().split('T')[0];
    if (! dateCache[key]) {
      dateCache[key] = {
        quarter: Math.floor(date.getUTCMonth() / 3) + 1,
        week: getWeekNumber(date),
        dayOfYear: getDayOfYear(date),
        dayOfWeek: getDayOfWeek(date),
        dayOfMonth: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear()
      };
    }
    return dateCache[key].quarter;
  }

  / * *

    * Gets specific week number or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

    */

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  / * *

    * Gets specific day of year or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

    */

  function getDayOfYear(date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  / * *

    * Gets specific day of week or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

    */

  function getDayOfWeek(date) {
    const day = date.getUTCDay();
    return day = = = 0 ? 1 : day + 1; // Sunday= 1, Monday= 2, etc.
  }

  / * *

    * Gets specific name quarter or configuration
  * @param
  * @param {any} quarter - The quarter to retrieve
  * @returns {any} The requested any

    */

  function getNameQuarter(quarter) {
    return `Q${quarter}`;
  }

  / * *

    * Gets specific name month or configuration
  * @param
  * @param {any} month - The month to retrieve
  * @returns {any} The requested any

    */

  function getNameMonth(month) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  }

  / * *

    * Gets specific name day week or configuration
  * @param
  * @param {any} day - The day to retrieve
  * @returns {any} The requested any

    */

  function getNameDayWeek(day) {
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return days[day - 1] || "";
  }

  / * *

    * Gets specific location for date or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @param {Object} configLocations - The configLocations to retrieve
  * @returns {any} The requested any

    */

  function getLocationForDate(date, configLocations) {
    for (const loc of configLocations) {
      if (date > = loc.start && date < = loc.end) {
        return { address: loc.address, index: loc.index };
      }
    }
    return null;
  }

  / * *

    * Performs specialized operations
  * @param
  * @param {Array} array - Array of elements
  * @param {number} size - The size limit
  * @returns {any} The result

    */

  function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i + = size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  / * *

    * Performs specialized operations
  * @param
  * @param {string|any} value - The value to set
  * @returns {any} The result

    */

  function roundToQuarterHour(value) {
    if (typeof value ! = = 'number' || isNaN(value)) return "";
    const minutes = value * 60; // Convert hours to minutes
    const roundedMinutes = Math.ceil(minutes / 15) * 15; // Round up to nearest 15 minutes
    return (roundedMinutes / 60).toFixed(2); // Convert back to hours
  }

  / * *

    * Formats value for display
  * @param
  * @param {string|any} value - The value to set
  * @param {any} decimals - The decimals parameter
  * @returns {any} The result

    */

  function formatValue(value, decimals = 2) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(decimals) : "";
  }

  / * *

    * Gets specific distances from google maps or configuration
  * @param
  * @param {any} origins - The origins to retrieve
  * @param {any} destinations - The destinations to retrieve
  * @param {string} apiKey - The apiKey to retrieve
  * @returns {any} The requested any

    */

  function getDistancesFromGoogleMaps(origins, destinations, apiKey) {
    const cacheKey = JSON.stringify({ origins, destinations });
    if (distanceCache[cacheKey]) {
      return distanceCache[cacheKey];
    }

    // Chunk origins to avoid URL length limit and timeouts
    const CHUNK_SIZE = 5;
    const originChunks = chunkArray(origins, CHUNK_SIZE);
    const results = Array(origins.length).fill().map(() = > Array(destinations.length).fill({ distance: "", duration: "" }));

    const MAX_RETRIES = 3;
    try {
      originChunks.forEach((chunk, chunkIndex) = > {
        const chunkOrigins = chunk;
        let attempts = 0;
        while (attempts < MAX_RETRIES) {
          try {
            const originsEncoded = encodeURIComponent(chunkOrigins.join("|"));
            const destinationsEncoded = encodeURIComponent(destinations.join("|"));
            const url = `https:// maps.googleapis.com/ maps/ api/ distancematrix/ json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
            Logger.log(`Fetching Distance Matrix for chunk ${chunkIndex + 1}/ ${originChunks.length}, attempt ${attempts + 1}`);
            const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
            const data = JSON.parse(response.getContentText());

            if (data.status = = = "OK") {
              chunkOrigins.forEach((_, i) = > {
                const row = data.rows[i].elements;
                row.forEach((element, j) = > {
                  const originIndex = chunkIndex * CHUNK_SIZE + i;
                  if (originIndex < origins.length) {
                    results[originIndex][j] = {
                      distance: element.distance ? element.distance.value / 1609.34 : "",
                      duration: element.duration ? element.duration.value / 3600 : ""
                    };
                  }
                });
              });
              break; // Success, exit retry loop
            } else {
              errors.push(`Distance Matrix API error for chunk ${chunkIndex + 1}: ${data.error_message || 'Unknown error'}`);
              attempts+ + ;
              if (attempts < MAX_RETRIES) Utilities.sleep(100); // Wait before retry
            }
          } catch (e) {
            errors.push(`Distance Matrix API call failed for chunk ${chunkIndex + 1}: ${e.message}`);
            attempts+ + ;
            if (attempts < MAX_RETRIES) Utilities.sleep(100);
          }
        }
      });

      distanceCache[cacheKey] = results;
      return results;
    } catch (e) {
      errors.push(`Distance Matrix API call failed: ${e.message}`);
      return Array(origins.length).fill(Array(destinations.length).fill({ distance: "", duration: "" }));
    }
  }

  // Collect all events and unique locations
  const allEvents = [];
  const locationMap = new Map(); // Maps event location to start/ return address
  calendarIds.forEach(calendarId = > {
    const calendar = CalendarApp.getCalendarById(calendarId);
    if (! calendar) {
      errors.push(`Invalid calendar ID: ${calendarId}`);
      return;
    }
    const calName = calendar.getName();
    let nextPageToken = null;

    do {
      const options = {
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: "startTime",
        pageToken: nextPageToken
      };
      const response = Calendar.Events.list(calendarId, options);
      const events = response.items || [];

      events.forEach(event = > {
        if (processedEventIds.has(event.id)) return; // Skip processed events
        const eventDate = new Date(event.start.dateTime || event.start.date);
        const locationInfo = event.location ? getLocationForDate(eventDate, locations) : null;
        if (event.location && locationInfo) {
          locationMap.set(event.location, locationInfo.address);
        }
        allEvents.push({ calendar: calName, event, locationInfo });
      });

      nextPageToken = response.nextPageToken;
    } while (nextPageToken);
  });

  // Batch Distance Matrix API calls
  const eventLocations = Array.from(locationMap.keys());
  let distanceResults = {};
  if (eventLocations.length > 0) {
    const destinationAddresses = Array.from(new Set(locationMap.values()));
    const outboundResults = getDistancesFromGoogleMaps(eventLocations, destinationAddresses, apiKey);
    const returnResults = getDistancesFromGoogleMaps(destinationAddresses, eventLocations, apiKey);

    eventLocations.forEach((eventLocation, i) = > {
      const destAddress = locationMap.get(eventLocation);
      const destIndex = destinationAddresses.indexOf(destAddress);
      distanceResults[eventLocation] = {
        outbound: outboundResults[i][destIndex] || { distance: "", duration: "" },
        return: returnResults[destIndex][i] || { distance: "", duration: "" }
      };
    });
  }

  // Process events
  const logEntries = [["Event ID", "Calendar Name", "Event Name", "Event Date", "Error"]]; // Log header
  allEvents.forEach(({ calendar, event, locationInfo }) = > {
    try {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      const eventName = event.summary || "Untitled";
      const eventDescription = event.description || "";
      const eventLocation = event.location || "";
      const startTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
      const endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;

      const duration = startTime && endTime ? roundToQuarterHour((endTime - startTime) / (1000 * 60 * 60)) : "0.00";
      const eventDateStr = Utilities.formatDate(eventDate, "UTC", "yyyy- MM- dd");
      const startTimeStr = startTime ? Utilities.formatDate(startTime, "UTC", "HH:mm") : "";
      const endTimeStr = endTime ? Utilities.formatDate(endTime, "UTC", "HH:mm") : "";

      const year = dateCache[eventDate.toISOString().split('T')[0]]?.year || eventDate.getUTCFullYear();
      const quarter = getQuarter(eventDate);
      const month = dateCache[eventDate.toISOString().split('T')[0]]?.month || eventDate.getUTCMonth() + 1;
      const week = dateCache[eventDate.toISOString().split('T')[0]]?.week || getWeekNumber(eventDate);
      const dayOfYear = dateCache[eventDate.toISOString().split('T')[0]]?.dayOfYear || getDayOfYear(eventDate);
      const dayOfMonth = dateCache[eventDate.toISOString().split('T')[0]]?.dayOfMonth || eventDate.getUTCDate();
      const dayOfWeek = dateCache[eventDate.toISOString().split('T')[0]]?.dayOfWeek || getDayOfWeek(eventDate);

      const nameQuarter = getNameQuarter(quarter);
      const nameMonth = getNameMonth(month);
      const nameDayWeek = getNameDayWeek(dayOfWeek);

      const locationStartReturn = locationInfo ? locationInfo.address : "";
      const locationEventLink = eventLocation ? `= HYPERLINK("https:// www.google.com/ maps/ search/ ?api= 1&query= ${encodeURIComponent(eventLocation)}","${eventLocation}")` : "";

      const distancesAndTimes = eventLocation && distanceResults[eventLocation]
        ? [
            formatValue((distanceResults[eventLocation].outbound.distance || 0) + (distanceResults[eventLocation].return.distance || 0), 1),
            formatValue(distanceResults[eventLocation].outbound.distance, 1),
            formatValue(distanceResults[eventLocation].return.distance, 1),
            roundToQuarterHour((distanceResults[eventLocation].outbound.duration || 0) + (distanceResults[eventLocation].return.duration || 0)),
            formatValue(distanceResults[eventLocation].outbound.duration, 2),
            formatValue(distanceResults[eventLocation].return.duration, 2)
          ]
        : ["", "", "", "", "", ""];

      data.push([
        calendar,
        eventDateStr,
        eventName,
        eventDescription,
        duration,
        year,
        quarter,
        month,
        week,
        dayOfYear,
        dayOfMonth,
        dayOfWeek,
        nameQuarter,
        nameMonth,
        nameDayWeek,
        locationStartReturn,
        locationEventLink,
        startTimeStr,
        endTimeStr,
        ...distancesAndTimes
      ]);

      // Log processed event
      logEntries.push([event.id, calendar, eventName, eventDateStr, ""]);
    } catch (e) {
      errors.push(`Error processing event "${event.summary || "Untitled"}": ${e.message}`);
      logEntries.push([event.id, calendar, event.summary || "Untitled", Utilities.formatDate(eventDate, "UTC", "yyyy- MM- dd"), e.message]);
    }
  });

  // Write to spreadsheet
  let sheet = spreadsheet.getSheetByName("Events");
  if (! sheet) {
    sheet = spreadsheet.insertSheet("Events");
  } else if (data.length > 1) {
    sheet.clear();
  }

  if (data.length > 1) {
    sheet.getRange(1, 1, data.length, headers.length).setValues(data);
    sheet.setFrozenRows(1);
    sheet.getRange("1:1").setFontWeight('bold');
    sheet.setFrozenColumns(1);
    sheet.getRange(2, 18, data.length - 1, 2).setNumberFormat("HH:mm"); // eventStartTime, eventEndTime
    sheet.getRange(2, 20, data.length - 1, 3).setNumberFormat("0.0"); // distanceTotal, distanceToEvent, distanceToReturn
    sheet.getRange(2, 23, data.length - 1, 3).setNumberFormat("0.00"); // timeTotal, timetoEvent, timeToReturn
    sheet.getDataRange().setHorizontalAlignment('left');
  }

  // Update EventLog
  if (logEntries.length > 1) {
    logSheet.clear();
    logSheet.getRange(1, 1, logEntries.length, logEntries[0].length).setValues(logEntries);
  }

  // Notify user
  const message = data.length > 1
    ? `Exported ${data.length - 1} events to "Events" sheet.${errors.length ? `\n${errors.length} errors occurred. See "EventLog" sheet for details.` : ''}`
    : 'No new events found to export.';
  SpreadsheetApp.getUi().alert(message);

  // Log errors
  if (errors.length) {
    Logger.log(`Errors encountered:\n${errors.join('\n')}`);
  }
}

/**

  * Gets specific day of year or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getDayOfYear(date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

/**

  * Gets specific day of year or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getDayOfYear(date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

/**

  * Gets specific day of year or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getDayOfYear(date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

/**

  * Gets specific distances from google maps or configuration
  * @param
  * @param {any} origins - The origins to retrieve
  * @param {any} destinations - The destinations to retrieve
  * @param {string} apiKey - The apiKey to retrieve
  * @returns {any} The requested any

  */

function getDistancesFromGoogleMaps(origins, destinations, apiKey) {
    const cacheKey = JSON.stringify({ origins, destinations });
    if (distanceCache[cacheKey]) {
      return distanceCache[cacheKey];
    }

    // Chunk origins to avoid URL length limit and timeouts
    const CHUNK_SIZE = 5;
    const originChunks = chunkArray(origins, CHUNK_SIZE);
    const results = Array(origins.length).fill().map(() = > Array(destinations.length).fill({ distance: "", duration: "" }));

    const MAX_RETRIES = 3;
    try {
      originChunks.forEach((chunk, chunkIndex) = > {
        const chunkOrigins = chunk;
        let attempts = 0;
        while (attempts < MAX_RETRIES) {
          try {
            const originsEncoded = encodeURIComponent(chunkOrigins.join("|"));
            const destinationsEncoded = encodeURIComponent(destinations.join("|"));
            const url = `https:// maps.googleapis.com/ maps/ api/ distancematrix/ json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
            Logger.log(`Fetching Distance Matrix for chunk ${chunkIndex + 1}/ ${originChunks.length}, attempt ${attempts + 1}`);
            const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
            const data = JSON.parse(response.getContentText());

            if (data.status = = = "OK") {
              chunkOrigins.forEach((_, i) = > {
                const row = data.rows[i].elements;
                row.forEach((element, j) = > {
                  const originIndex = chunkIndex * CHUNK_SIZE + i;
                  if (originIndex < origins.length) {
                    results[originIndex][j] = {
                      distance: element.distance ? element.distance.value / 1609.34 : "",
                      duration: element.duration ? element.duration.value / 3600 : ""
                    };
                  }
                });
              });
              break; // Success, exit retry loop
            } else {
              errors.push(`Distance Matrix API error for chunk ${chunkIndex + 1}: ${data.error_message || 'Unknown error'}`);
              attempts+ + ;
              if (attempts < MAX_RETRIES) Utilities.sleep(100); // Wait before retry
            }
          } catch (e) {
            errors.push(`Distance Matrix API call failed for chunk ${chunkIndex + 1}: ${e.message}`);
            attempts+ + ;
            if (attempts < MAX_RETRIES) Utilities.sleep(100);
          }
        }
      });

      distanceCache[cacheKey] = results;
      return results;
    } catch (e) {
      errors.push(`Distance Matrix API call failed: ${e.message}`);
      return Array(origins.length).fill(Array(destinations.length).fill({ distance: "", duration: "" }));
    }
  }

/**

  * Gets specific distances from google maps or configuration
  * @param
  * @param {any} origins - The origins to retrieve
  * @param {any} destinations - The destinations to retrieve
  * @param {string} apiKey - The apiKey to retrieve
  * @returns {any} The requested any

  */

function getDistancesFromGoogleMaps(origins, destinations, apiKey) {
    const cacheKey = JSON.stringify({ origins, destinations });
    if (distanceCache[cacheKey]) {
      return distanceCache[cacheKey];
    }

    // Chunk origins to avoid URL length limit and timeouts
    const CHUNK_SIZE = 5;
    const originChunks = chunkArray(origins, CHUNK_SIZE);
    const results = Array(origins.length).fill().map(() = > Array(destinations.length).fill({ distance: "", duration: "" }));

    const MAX_RETRIES = 3;
    try {
      originChunks.forEach((chunk, chunkIndex) = > {
        const chunkOrigins = chunk;
        let attempts = 0;
        while (attempts < MAX_RETRIES) {
          try {
            const originsEncoded = encodeURIComponent(chunkOrigins.join("|"));
            const destinationsEncoded = encodeURIComponent(destinations.join("|"));
            const url = `https:// maps.googleapis.com/ maps/ api/ distancematrix/ json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
            Logger.log(`Fetching Distance Matrix for chunk ${chunkIndex + 1}/ ${originChunks.length}, attempt ${attempts + 1}`);
            const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
            const data = JSON.parse(response.getContentText());

            if (data.status = = = "OK") {
              chunkOrigins.forEach((_, i) = > {
                const row = data.rows[i].elements;
                row.forEach((element, j) = > {
                  const originIndex = chunkIndex * CHUNK_SIZE + i;
                  if (originIndex < origins.length) {
                    results[originIndex][j] = {
                      distance: element.distance ? element.distance.value / 1609.34 : "",
                      duration: element.duration ? element.duration.value / 3600 : ""
                    };
                  }
                });
              });
              break; // Success, exit retry loop
            } else {
              errors.push(`Distance Matrix API error for chunk ${chunkIndex + 1}: ${data.error_message || 'Unknown error'}`);
              attempts+ + ;
              if (attempts < MAX_RETRIES) Utilities.sleep(100); // Wait before retry
            }
          } catch (e) {
            errors.push(`Distance Matrix API call failed for chunk ${chunkIndex + 1}: ${e.message}`);
            attempts+ + ;
            if (attempts < MAX_RETRIES) Utilities.sleep(100);
          }
        }
      });

      distanceCache[cacheKey] = results;
      return results;
    } catch (e) {
      errors.push(`Distance Matrix API call failed: ${e.message}`);
      return Array(origins.length).fill(Array(destinations.length).fill({ distance: "", duration: "" }));
    }
  }

/**

  * Gets specific distances from google maps or configuration
  * @param
  * @param {any} origins - The origins to retrieve
  * @param {any} destinations - The destinations to retrieve
  * @param {string} apiKey - The apiKey to retrieve
  * @returns {any} The requested any

  */

function getDistancesFromGoogleMaps(origins, destinations, apiKey) {
    const cacheKey = JSON.stringify({ origins, destinations });
    if (distanceCache[cacheKey]) {
      return distanceCache[cacheKey];
    }

    // Chunk origins to avoid URL length limit and timeouts
    const CHUNK_SIZE = 5;
    const originChunks = chunkArray(origins, CHUNK_SIZE);
    const results = Array(origins.length).fill().map(() = > Array(destinations.length).fill({ distance: "", duration: "" }));

    const MAX_RETRIES = 3;
    try {
      originChunks.forEach((chunk, chunkIndex) = > {
        const chunkOrigins = chunk;
        let attempts = 0;
        while (attempts < MAX_RETRIES) {
          try {
            const originsEncoded = encodeURIComponent(chunkOrigins.join("|"));
            const destinationsEncoded = encodeURIComponent(destinations.join("|"));
            const url = `https:// maps.googleapis.com/ maps/ api/ distancematrix/ json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
            Logger.log(`Fetching Distance Matrix for chunk ${chunkIndex + 1}/ ${originChunks.length}, attempt ${attempts + 1}`);
            const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
            const data = JSON.parse(response.getContentText());

            if (data.status = = = "OK") {
              chunkOrigins.forEach((_, i) = > {
                const row = data.rows[i].elements;
                row.forEach((element, j) = > {
                  const originIndex = chunkIndex * CHUNK_SIZE + i;
                  if (originIndex < origins.length) {
                    results[originIndex][j] = {
                      distance: element.distance ? element.distance.value / 1609.34 : "",
                      duration: element.duration ? element.duration.value / 3600 : ""
                    };
                  }
                });
              });
              break; // Success, exit retry loop
            } else {
              errors.push(`Distance Matrix API error for chunk ${chunkIndex + 1}: ${data.error_message || 'Unknown error'}`);
              attempts+ + ;
              if (attempts < MAX_RETRIES) Utilities.sleep(100); // Wait before retry
            }
          } catch (e) {
            errors.push(`Distance Matrix API call failed for chunk ${chunkIndex + 1}: ${e.message}`);
            attempts+ + ;
            if (attempts < MAX_RETRIES) Utilities.sleep(100);
          }
        }
      });

      distanceCache[cacheKey] = results;
      return results;
    } catch (e) {
      errors.push(`Distance Matrix API call failed: ${e.message}`);
      return Array(origins.length).fill(Array(destinations.length).fill({ distance: "", duration: "" }));
    }
  }

/**

  * Gets specific location for date or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @param {Object} configLocations - The configLocations to retrieve
  * @returns {any} The requested any

  */

function getLocationForDate(date, configLocations) {
    for (const loc of configLocations) {
      if (date > = loc.start && date < = loc.end) {
        return { address: loc.address, index: loc.index };
      }
    }
    return null;
  }

/**

  * Gets specific location for date or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @param {Object} configLocations - The configLocations to retrieve
  * @returns {any} The requested any

  */

function getLocationForDate(date, configLocations) {
    for (const loc of configLocations) {
      if (date > = loc.start && date < = loc.end) {
        return { address: loc.address, index: loc.index };
      }
    }
    return null;
  }

/**

  * Gets specific location for date or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @param {Object} configLocations - The configLocations to retrieve
  * @returns {any} The requested any

  */

function getLocationForDate(date, configLocations) {
    for (const loc of configLocations) {
      if (date > = loc.start && date < = loc.end) {
        return { address: loc.address, index: loc.index };
      }
    }
    return null;
  }

/**

  * Gets specific quarter or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getQuarter(date) {
    const key = date.toISOString().split('T')[0];
    if (! dateCache[key]) {
      dateCache[key] = {
        quarter: Math.floor(date.getUTCMonth() / 3) + 1,
        week: getWeekNumber(date),
        dayOfYear: getDayOfYear(date),
        dayOfWeek: getDayOfWeek(date),
        dayOfMonth: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear()
      };
    }
    return dateCache[key].quarter;
  }

/**

  * Gets specific quarter or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getQuarter(date) {
    const key = date.toISOString().split('T')[0];
    if (! dateCache[key]) {
      dateCache[key] = {
        quarter: Math.floor(date.getUTCMonth() / 3) + 1,
        week: getWeekNumber(date),
        dayOfYear: getDayOfYear(date),
        dayOfWeek: getDayOfWeek(date),
        dayOfMonth: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear()
      };
    }
    return dateCache[key].quarter;
  }

/**

  * Gets specific quarter or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getQuarter(date) {
    const key = date.toISOString().split('T')[0];
    if (! dateCache[key]) {
      dateCache[key] = {
        quarter: Math.floor(date.getUTCMonth() / 3) + 1,
        week: getWeekNumber(date),
        dayOfYear: getDayOfYear(date),
        dayOfWeek: getDayOfWeek(date),
        dayOfMonth: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear()
      };
    }
    return dateCache[key].quarter;
  }

/**

  * Performs specialized operations
  * @param
  * @param {string|any} value - The value to set
  * @returns {any} The result

  */

function roundToQuarterHour(value) {
    if (typeof value ! = = 'number' || isNaN(value)) return "";
    const minutes = value * 60; // Convert hours to minutes
    const roundedMinutes = Math.ceil(minutes / 15) * 15; // Round up to nearest 15 minutes
    return (roundedMinutes / 60).toFixed(2); // Convert back to hours
  }

/**

  * Performs specialized operations
  * @param
  * @param {string|any} value - The value to set
  * @returns {any} The result

  */

function roundToQuarterHour(value) {
    if (typeof value ! = = 'number' || isNaN(value)) return "";
    const minutes = value * 60; // Convert hours to minutes
    const roundedMinutes = Math.ceil(minutes / 15) * 15; // Round up to nearest 15 minutes
    return (roundedMinutes / 60).toFixed(2); // Convert back to hours
  }

/**

  * Performs specialized operations
  * @param
  * @param {string|any} value - The value to set
  * @returns {any} The result

  */

function roundToQuarterHour(value) {
    if (typeof value ! = = 'number' || isNaN(value)) return "";
    const minutes = value * 60; // Convert hours to minutes
    const roundedMinutes = Math.ceil(minutes / 15) * 15; // Round up to nearest 15 minutes
    return (roundedMinutes / 60).toFixed(2); // Convert back to hours
  }

/**

  * Sets config or configuration values
  * @returns {any} The result

  */

function setConfig() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = spreadsheet.getSheetByName('config');
  if (! configSheet) {
    configSheet = spreadsheet.insertSheet('config');
  } else {
    configSheet.clear();
  }

  // Default configuration
  const configData = [
    ["apiKey", "calName", "locationStartReturn", "dateStart", "dateEnd"],
    ["YOUR_API_KEY_HERE", "", "", "", ""], // API key row
    ["", "calendar1@group.calendar.google.com", "Address 1", "2023- 10- 08", "2024- 01- 05"],
    ["", "calendar2@group.calendar.google.com", "Address 2", "2024- 01- 06", "2024- 07- 15"],
    ["", "", "Address 3", "2024- 07- 16", "2025- 04- 29"],
    ["", "", "", "", ""], // Optional location 4
    ["", "", "", "", ""]  // Optional location 5
  ];

  configSheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);
  configSheet.getRange("1:1").setFontWeight('bold');
  configSheet.getDataRange().setHorizontalAlignment('left');

  Logger.log('Configuration sheet created/ updated with default values. Please update the "config" sheet with your API key, calendar IDs, and locations.');
  SpreadsheetApp.getUi().alert('Configuration sheet created/ updated. Please update the "config" sheet with your API key, calendar IDs, and location details.');
}

// Helper Functions

/**

  * Formats value for display
  * @param
  * @param {string|any} value - The value to set
  * @param {any} decimals - The decimals parameter
  * @returns {any} The result

  */

function formatValue(value, decimals = 2) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(decimals) : "";
  }

/**

  * Formats value for display
  * @param
  * @param {string|any} value - The value to set
  * @param {any} decimals - The decimals parameter
  * @returns {any} The result

  */

function formatValue(value, decimals = 2) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(decimals) : "";
  }

/**

  * Formats value for display
  * @param
  * @param {string|any} value - The value to set
  * @param {any} decimals - The decimals parameter
  * @returns {any} The result

  */

function formatValue(value, decimals = 2) {
    return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(decimals) : "";
  }

/**

  * Gets specific day of week or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getDayOfWeek(date) {
    const day = date.getUTCDay();
    return day = = = 0 ? 1 : day + 1; // Sunday= 1, Monday= 2, etc.
  }

/**

  * Gets specific day of week or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getDayOfWeek(date) {
    const day = date.getUTCDay();
    return day = = = 0 ? 1 : day + 1; // Sunday= 1, Monday= 2, etc.
  }

/**

  * Gets specific day of week or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getDayOfWeek(date) {
    const day = date.getUTCDay();
    return day = = = 0 ? 1 : day + 1; // Sunday= 1, Monday= 2, etc.
  }

/**

  * Gets specific name day week or configuration
  * @param
  * @param {any} day - The day to retrieve
  * @returns {any} The requested any

  */

function getNameDayWeek(day) {
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return days[day - 1] || "";
  }

/**

  * Gets specific name day week or configuration
  * @param
  * @param {any} day - The day to retrieve
  * @returns {any} The requested any

  */

function getNameDayWeek(day) {
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return days[day - 1] || "";
  }

/**

  * Gets specific name day week or configuration
  * @param
  * @param {any} day - The day to retrieve
  * @returns {any} The requested any

  */

function getNameDayWeek(day) {
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return days[day - 1] || "";
  }

/**

  * Gets specific name month or configuration
  * @param
  * @param {any} month - The month to retrieve
  * @returns {any} The requested any

  */

function getNameMonth(month) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  }

/**

  * Gets specific name month or configuration
  * @param
  * @param {any} month - The month to retrieve
  * @returns {any} The requested any

  */

function getNameMonth(month) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  }

/**

  * Gets specific name month or configuration
  * @param
  * @param {any} month - The month to retrieve
  * @returns {any} The requested any

  */

function getNameMonth(month) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  }

/**

  * Gets specific name quarter or configuration
  * @param
  * @param {any} quarter - The quarter to retrieve
  * @returns {any} The requested any

  */

function getNameQuarter(quarter) {
    return `Q${quarter}`;
  }

/**

  * Gets specific name quarter or configuration
  * @param
  * @param {any} quarter - The quarter to retrieve
  * @returns {any} The requested any

  */

function getNameQuarter(quarter) {
    return `Q${quarter}`;
  }

/**

  * Gets specific name quarter or configuration
  * @param
  * @param {any} quarter - The quarter to retrieve
  * @returns {any} The requested any

  */

function getNameQuarter(quarter) {
    return `Q${quarter}`;
  }

/**

  * Gets specific week number or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

/**

  * Gets specific week number or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

/**

  * Gets specific week number or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {any} The requested any

  */

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }