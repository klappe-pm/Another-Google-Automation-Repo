// Calendar Events Exporter with Distance Calculations

// Summary:
// This Google Apps Script exports events from specified Google Calendars (defined in the 'config' sheet) for the past 18 months up to tomorrow.
// For each event with a location, it calculates distances and travel times to/from up to five predefined start/return locations (defined in the 'config' sheet)
// using the Google Maps Distance Matrix API. Results are written to an 'Events' sheet with detailed date fields, distance/time metrics, and event details.
// The script optimizes API costs by batching calls, caching results, and handling timeouts with retries and incremental processing via an 'EventLog' sheet.
// Configuration (API key, calendar IDs, locations, date ranges) is stored in a 'config' sheet for flexibility and security.

// Inputs:
// - Google Calendar access for the authenticated user.
// - Google Maps Distance Matrix API key (in 'config' sheet).
// - Calendar IDs, start/return locations, and date ranges (in 'config' sheet).
// - Time range: 18 months ago to tomorrow (UTC).

// Outputs:
// - An 'Events' sheet with 25 columns: calendar name, event details, date fields, distances, times, and locations.
// - An 'EventLog' sheet tracking processed event IDs to avoid redundant API calls after timeouts.
// - A UI alert summarizing exported events and any errors.
// - Logs of errors for debugging.

// Key Features:
// - Batches Distance Matrix API calls with chunking to avoid URL length limits.
// - Caches date calculations and API results for performance.
// - Handles Calendar API pagination and API timeouts with retries.
// - Supports up to five start/return locations with dynamic date ranges.
// - Logs event IDs to resume after timeouts, reducing redundant calls.
// - Stores configuration in a 'config' sheet for easy updates.
// - Generates clickable Google Maps hyperlinks for event locations.

// Functions and Methods (Alphabetically Sorted):
// - CalendarApp.getCalendarById(calendarId): Retrieves a specific calendar by ID.
// - Calendar.Events.list(calendarId, options): Fetches events from a specific calendar.
// - chunkArray(array, size): Splits an array into smaller chunks of specified size.
// - exportAllCalendarEvents(): Main function to export calendar events and calculate distances.
// - formatValue(value): Formats numeric values to specified decimals or returns empty string for invalid values.
// - getDayOfWeek(date): Returns the day of the week (1-7, Sunday=1, Saturday=7) for a given date.
// - getDayOfYear(date): Calculates the day of the year (1-365/366) for a given date.
// - getDistancesFromGoogleMaps(origins, destinations, apiKey): Fetches distance and time data from the Google Maps Distance Matrix API.
// - getLocationForDate(date, configData): Determines the start/return location based on the event date and config.
// - getNameDayWeek(day): Returns the full day name (e.g., "Sunday") for a day number (1-7).
// - getNameMonth(month): Returns the full month name (e.g., "January") for a month number (1-12).
// - getNameQuarter(quarter): Returns the quarter name (e.g., "Q1") for a quarter number (1-4).
// - getQuarter(date): Determines the quarter (1-4) for a given date, with caching.
// - getWeekNumber(date): Calculates the ISO week number for a given date.
// - roundToQuarterHour(value): Rounds a duration (in hours) up to the nearest 15-minute increment.
// - SpreadsheetApp.getActiveSpreadsheet(): Gets the active spreadsheet.
// - SpreadsheetApp.getUi(): Displays UI alerts.
// - UrlFetchApp.fetch(url, options): Makes HTTP requests to the Distance Matrix API.
// - Utilities.formatDate(date, timezone, format): Formats dates for API calls and output.

// Functions and Methods (Execution Order):
// - exportAllCalendarEvents(): Initiates the script.
// - SpreadsheetApp.getActiveSpreadsheet(): Accesses the spreadsheet for config and logging.
// - getLocationForDate(date, configData): Determines the start/return location for the event date.
// - CalendarApp.getCalendarById(calendarId): Retrieves targeted calendars.
// - Calendar.Events.list(calendarId, options): Fetches events for each calendar.
// - getQuarter(date): Calculates quarter (cached).
// - getWeekNumber(date): Calculates week number (cached).
// - getDayOfYear(date): Calculates day of year (cached).
// - getDayOfWeek(date): Calculates day of week (cached).
// - getNameQuarter(quarter): Gets quarter name (e.g., "Q1").
// - getNameMonth(month): Gets month name (e.g., "January").
// - getNameDayWeek(day): Gets day name (e.g., "Sunday").
// - getDistancesFromGoogleMaps(origins, destinations, apiKey): Fetches batched distance/time data.
// - chunkArray(array, size): Splits origins/destinations into smaller chunks.
// - UrlFetchApp.fetch(url, options): Makes API requests for distances.
// - formatValue(value): Formats distance/time values.
// - roundToQuarterHour(value): Rounds durations to quarter-hour increments.
// - SpreadsheetApp.getUi(): Shows the final alert.

// Main function to export calendar events
function exportAllCalendarEvents() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = spreadsheet.getSheetByName('config');
  const logSheet = spreadsheet.getSheetByName('EventLog') || spreadsheet.insertSheet('EventLog');

  // Load configuration from 'config' sheet
  if (!configSheet) {
    SpreadsheetApp.getUi().alert('Error: "config" sheet not found. Please run setConfig() to create it.');
    Logger.log('Error: "config" sheet not found.');
    return;
  }

  const configData = configSheet.getDataRange().getValues().slice(1); // Skip headers
  const apiKey = configData[0][0]; // First row, apiKey column
  if (!apiKey) {
    SpreadsheetApp.getUi().alert('Error: Google Maps API key is not configured in the "config" sheet. Please run setConfig() to set the API key.');
    Logger.log('Error: Google Maps API key is not configured.');
    return;
  }

  // Validate calendar IDs and locations
  const calendarIds = [...new Set(configData.filter(row => row[1]).map(row => row[1]))]; // Unique calName
  const locations = configData
    .filter(row => row[2] && row[3] && row[4]) // Non-empty location, dateStart, dateEnd
    .map(row => ({
      address: row[2],
      start: new Date(row[3]),
      end: new Date(row[4]),
      index: configData.indexOf(row) + 1
    }))
    .filter(loc => !isNaN(loc.start) && !isNaN(loc.end)); // Valid dates

  if (!calendarIds.length) {
    SpreadsheetApp.getUi().alert('Error: No valid calendar IDs found in the "config" sheet.');
    Logger.log('Error: No valid calendar IDs found.');
    return;
  }
  if (!locations.length) {
    SpreadsheetApp.getUi().alert('Error: No valid locations with date ranges found in the "config" sheet.');
    Logger.log('Error: No valid locations found.');
    return;
  }

  // Load processed event IDs from EventLog
  const logData = logSheet.getDataRange().getValues();
  const processedEventIds = new Set(logData.slice(1).map(row => row[0])); // Event IDs in first column

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
  const timeMin = Utilities.formatDate(startDate, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const timeMax = Utilities.formatDate(tomorrow, "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");

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
  function getQuarter(date) {
    const key = date.toISOString().split('T')[0];
    if (!dateCache[key]) {
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

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function getDayOfYear(date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  function getDayOfWeek(date) {
    const day = date.getUTCDay();
    return day === 0 ? 1 : day + 1; // Sunday=1, Monday=2, etc.
  }

  function getNameQuarter(quarter) {
    return `Q${quarter}`;
  }

  function getNameMonth(month) {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  }

  function getNameDayWeek(day) {
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return days[day - 1] || "";
  }

  function getLocationForDate(date, configLocations) {
    for (const loc of configLocations) {
      if (date >= loc.start && date <= loc.end) {
        return { address: loc.address, index: loc.index };
      }
    }
    return null;
  }

  function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  function roundToQuarterHour(value) {
    if (typeof value !== 'number' || isNaN(value)) return "";
    const minutes = value * 60; // Convert hours to minutes
    const roundedMinutes = Math.ceil(minutes / 15) * 15; // Round up to nearest 15 minutes
    return (roundedMinutes / 60).toFixed(2); // Convert back to hours
  }

  function formatValue(value, decimals = 2) {
    return typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : "";
  }

  function getDistancesFromGoogleMaps(origins, destinations, apiKey) {
    const cacheKey = JSON.stringify({ origins, destinations });
    if (distanceCache[cacheKey]) {
      return distanceCache[cacheKey];
    }

    // Chunk origins to avoid URL length limit and timeouts
    const CHUNK_SIZE = 5;
    const originChunks = chunkArray(origins, CHUNK_SIZE);
    const results = Array(origins.length).fill().map(() => Array(destinations.length).fill({ distance: "", duration: "" }));

    const MAX_RETRIES = 3;
    try {
      originChunks.forEach((chunk, chunkIndex) => {
        const chunkOrigins = chunk;
        let attempts = 0;
        while (attempts < MAX_RETRIES) {
          try {
            const originsEncoded = encodeURIComponent(chunkOrigins.join("|"));
            const destinationsEncoded = encodeURIComponent(destinations.join("|"));
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${originsEncoded}&destinations=${destinationsEncoded}&key=${apiKey}`;
            Logger.log(`Fetching Distance Matrix for chunk ${chunkIndex + 1}/${originChunks.length}, attempt ${attempts + 1}`);
            const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
            const data = JSON.parse(response.getContentText());

            if (data.status === "OK") {
              chunkOrigins.forEach((_, i) => {
                const row = data.rows[i].elements;
                row.forEach((element, j) => {
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
              attempts++;
              if (attempts < MAX_RETRIES) Utilities.sleep(100); // Wait before retry
            }
          } catch (e) {
            errors.push(`Distance Matrix API call failed for chunk ${chunkIndex + 1}: ${e.message}`);
            attempts++;
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
  const locationMap = new Map(); // Maps event location to start/return address
  calendarIds.forEach(calendarId => {
    const calendar = CalendarApp.getCalendarById(calendarId);
    if (!calendar) {
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

      events.forEach(event => {
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

    eventLocations.forEach((eventLocation, i) => {
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
  allEvents.forEach(({ calendar, event, locationInfo }) => {
    try {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      const eventName = event.summary || "Untitled";
      const eventDescription = event.description || "";
      const eventLocation = event.location || "";
      const startTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
      const endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;

      const duration = startTime && endTime ? roundToQuarterHour((endTime - startTime) / (1000 * 60 * 60)) : "0.00";
      const eventDateStr = Utilities.formatDate(eventDate, "UTC", "yyyy-MM-dd");
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
      const locationEventLink = eventLocation ? `=HYPERLINK("https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}","${eventLocation}")` : "";

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
      logEntries.push([event.id, calendar, event.summary || "Untitled", Utilities.formatDate(eventDate, "UTC", "yyyy-MM-dd"), e.message]);
    }
  });

  // Write to spreadsheet
  let sheet = spreadsheet.getSheetByName("Events");
  if (!sheet) {
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

// Utility function to set up configuration
function setConfig() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = spreadsheet.getSheetByName('config');
  if (!configSheet) {
    configSheet = spreadsheet.insertSheet('config');
  } else {
    configSheet.clear();
  }

  // Default configuration
  const configData = [
    ["apiKey", "calName", "locationStartReturn", "dateStart", "dateEnd"],
    ["YOUR_API_KEY_HERE", "", "", "", ""], // API key row
    ["", "calendar1@group.calendar.google.com", "Address 1", "2023-10-08", "2024-01-05"],
    ["", "calendar2@group.calendar.google.com", "Address 2", "2024-01-06", "2024-07-15"],
    ["", "", "Address 3", "2024-07-16", "2025-04-29"],
    ["", "", "", "", ""], // Optional location 4
    ["", "", "", "", ""]  // Optional location 5
  ];

  configSheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);
  configSheet.getRange("1:1").setFontWeight('bold');
  configSheet.getDataRange().setHorizontalAlignment('left');

  Logger.log('Configuration sheet created/updated with default values. Please update the "config" sheet with your API key, calendar IDs, and locations.');
  SpreadsheetApp.getUi().alert('Configuration sheet created/updated. Please update the "config" sheet with your API key, calendar IDs, and location details.');
}