/**
 * Script Name: export-emails
 * 
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * - Extract emails data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * - Support scheduled automation
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Validate input data
 * 4. Process and transform data
 * 5. Apply filters and criteria
 * 6. Format output for presentation
 * 7. Write results to destination
 * 
 * Script Functions:
 * - exportAllCalendarEvents(): Exports all calendar events to external format
 * - fetchCalendarEvents(): Retrieves calendar events from service
 * - geocodeAddress(): Performs specialized operations
 * - getDestinationLocations(): Gets specific destination locations or configuration
 * - getFixedDepartureTime(): Gets specific fixed departure time or configuration
 * - getHeaders(): Gets specific headers or configuration
 * - getRouteInfo(): Gets specific route info or configuration
 * - getSheetName(): Gets specific sheet name or configuration
 * - initializeSheet(): Initializes resources or configuration
 * - logError(): Logs error or messages
 * - processEvent(): Processes and transforms event
 * - resetProgressTracking(): Sets re progress tracking or configuration values
 * - saveDataToSheet(): Saves data to sheet persistently
 * - saveProgress(): Saves progress persistently
 * - scheduleRestart(): Performs specialized operations
 * - shouldSaveProgress(): Saves should progress persistently
 * 
 * Script Helper Functions:
 * - areLocationsEqual(): Performs specialized operations
 * - getDateRange(): Gets specific date range or configuration
 * - getDayOfWeek(): Gets specific day of week or configuration
 * - getDayOfYear(): Gets specific day of year or configuration
 * - getQuarter(): Gets specific quarter or configuration
 * - getScriptProperty(): Gets specific script property or configuration
 * - getTargetCalendars(): Gets specific target calendars or configuration
 * - getWeekNumber(): Gets specific week number or configuration
 * - isSameLocationApproximate(): Checks boolean condition
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - CalendarApp: For calendar and event management
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - SpreadsheetApp: For spreadsheet operations
 * - UrlFetchApp: For HTTP requests to external services
 * - Utilities: For utility functions and encoding
 */

// Main Functions

/**

 * Exports all calendar events to external format
 * @returns {any} The result

 */

function exportAllCalendarEvents() {
  Logger.log("🚀 Starting script execution...");

  const MAX_RUNTIME = 255000; // 4 minutes 15 seconds
  const SAVE_INTERVAL = 20000; // Save every 20 seconds
  const startTime = new Date().getTime();
  let lastSaveTime = startTime;

  const API_KEY = getScriptProperty('GOOGLE_MAPS_API_KEY');
  if (!API_KEY) {
    logError("API key is missing. Set it in Script Properties.");
    return;
  }

  const destinationLocations = getDestinationLocations();
  if (!destinationLocations) return;

  const { timeMin, timeMax } = getDateRange();
  const sheetName = getSheetName();
  const { spreadsheet, sheet, isResuming, lastCalendarIndex, lastEventIndex, processedEventIDs } = initializeSheet(sheetName);

  const calendars = getTargetCalendars();
  if (calendars.length === 0) {
    logError("Could not find any of the specified calendars. Please check the calendar names.");
    return;
  }

  Logger.log(`📅 Found ${calendars.length} matching calendars to process`);

  let allData = [];
  let calendarIndex = isResuming ? lastCalendarIndex : 0;
  let totalNewEvents = 0;

  while (calendarIndex < calendars.length) {
    const calendar = calendars[calendarIndex];
    Logger.log(`📅 Processing calendar: ${calendar.getName()} (${calendarIndex + 1}/${calendars.length})`);

    let events = fetchCalendarEvents(calendar, timeMin, timeMax);
    if (!events) {
      calendarIndex++;
      saveProgress(calendarIndex - 1, -1, processedEventIDs);
      continue;
    }

    Logger.log(`📋 Found ${events.length} events in calendar ${calendar.getName()}`);

    let eventIndex = (calendarIndex === lastCalendarIndex && lastEventIndex >= 0) ? lastEventIndex + 1 : 0;

    while (eventIndex < events.length) {
      const event = events[eventIndex];
      if (processedEventIDs.has(event.id)) {
        Logger.log(`🔄 Skipping already processed event: ${event.summary}`);
        eventIndex++;
        continue;
      }

      const eventData = processEvent(event, destinationLocations, API_KEY);
      allData.push(eventData);
      processedEventIDs.add(event.id);
      totalNewEvents++;

      if (shouldSaveProgress(startTime, lastSaveTime)) {
        saveProgress(calendarIndex, eventIndex, processedEventIDs);
        saveDataToSheet(spreadsheet, sheetName, allData);
        lastSaveTime = new Date().getTime();
        allData = [];
      }

      eventIndex++;
    }

    calendarIndex++;
    saveProgress(calendarIndex - 1, -1, processedEventIDs);
  }

  if (allData.length > 0 || !isResuming) {
    saveDataToSheet(spreadsheet, sheetName, allData);
  }

  resetProgressTracking();
  Logger.log(`✅ Successfully processed ${totalNewEvents} new events.`);
  Logger.log("🎉 Script execution completed successfully.");
}

/**

 * Retrieves calendar events from service
 * @param
 * @param {any} calendar - The calendar parameter
 * @param {number} timeMin - The timeMin parameter
 * @param {number} timeMax - The timeMax parameter
 * @returns {any} The result

 */

function fetchCalendarEvents(calendar, timeMin, timeMax) {
  const options = { timeMin, timeMax, singleEvents: true, orderBy: "startTime", fields: "items(id, start, end, summary, location)" };
  try {
    const events = Calendar.Events.list(calendar.getId(), options).items || [];
    Utilities.sleep(1000); // Prevent API rate limits
    return events;
  } catch (error) {
    logError(`Error fetching events for calendar '${calendar.getName()}': ${error.message}`);
    return null;
  }
}

/**

 * Performs specialized operations
 * @param
 * @param {string} apiKey - The apiKey parameter
 * @param {any} address - The address parameter
 * @returns {any} The result

 */

function geocodeAddress(apiKey, address) {
  if (!address.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const response = UrlFetchApp.fetch(url);
    const json = JSON.parse(response.getContentText());
    if (json.status !== "OK") throw new Error(json.error_message || "Unknown error");
    return json.results[0];
  } catch (error) {
    logError(`Geocoding failed for '${address}': ${error.message}`);
    return null;
  }
}

/**

 * Gets specific destination locations or configuration
 * @returns {any} The requested any

 */

function getDestinationLocations() {
  const destinationsProperty = getScriptProperty('DESTINATION_LOCATIONS');
  if (!destinationsProperty) {
    logError("Destination locations missing. Set them in Script Properties.");
    return null;
  }
  const destinationLocations = JSON.parse(destinationsProperty);
  if (!Array.isArray(destinationLocations) || destinationLocations.length === 0) {
    logError("Invalid destination locations. Ensure it's a valid JSON array.");
    return null;
  }
  return destinationLocations;
}

/**

 * Gets specific fixed departure time or configuration
 * @returns {any} The requested any

 */

function getFixedDepartureTime() {
  const fixedDepartureTime = new Date();
  fixedDepartureTime.setHours(10, 0, 0, 0); // 10:00:00.000 local time
  if (new Date() > fixedDepartureTime) {
    fixedDepartureTime.setDate(fixedDepartureTime.getDate() + 1);
  }
  return fixedDepartureTime;
}

/**

 * Gets specific headers or configuration
 * @returns {any} The requested any

 */

function getHeaders() {
  const destinationsProperty = getScriptProperty('DESTINATION_LOCATIONS');
  const destinationLocations = JSON.parse(destinationsProperty);
  return [
    "Event ID", "Calendar Name", "Event Date", "Event Summary", "Event Location",
    "Start Time", "End Time", "Duration (hours)", "Year", "Quarter",
    "Month", "Week Number", "Day of Year", "Day of Week",
    ...destinationLocations.flatMap(loc => [`Distance to ${loc} (miles)`, `Duration to ${loc} (hours)`])
  ];
}

/**

 * Gets specific route info or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origin - The origin to retrieve
 * @param {any} destination - The destination to retrieve
 * @param {any} departureTime - The departureTime to retrieve
 * @returns {any} The requested any

 */

function getRouteInfo(apiKey, origin, destination, departureTime) {
  if (!origin?.geometry?.location || !destination?.geometry?.location) {
    logError("⚠️ Invalid origin or destination. Skipping route calculation.");
    return null;
  }
  if (areLocationsEqual(origin.geometry.location, destination.geometry.location)) {
    Logger.log("📍 Origin and destination are the same location. Setting distance and duration to 0.");
    return { distance: "0.00", duration: "0.00" };
  }
  try {
    Logger.log(`🧭 Calculating route from ${origin.formatted_address} to ${destination.formatted_address} at ${departureTime}`);
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const payload = {
      origin: { location: { latLng: { latitude: origin.geometry.location.lat, longitude: origin.geometry.location.lng } } },
      destination: { location: { latLng: { latitude: destination.geometry.location.lat, longitude: destination.geometry.location.lng } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "IMPERIAL"
    };
    if (departureTime) {
      payload.departureTime = departureTime;
    }
    const options = {
      method: "post",
      contentType: "application/json",
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline,routes.legs" },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    Utilities.sleep(1000); // Prevent API rate limits
    const responseText = response.getContentText();
    if (response.getResponseCode() !== 200) {
      logError(`⚠️ API Error: ${response.getResponseCode()} - ${responseText}`);
      return null;
    }
    const json = JSON.parse(responseText);
    if (!json.routes || json.routes.length === 0) {
      logError(`⚠️ No valid routes found. API Response: ${JSON.stringify(json)}`);
      return null;
    }
    const route = json.routes[0];
    let distanceMeters = route.distanceMeters;
    let durationSeconds = route.duration;
    if ((!distanceMeters || !durationSeconds) && route.legs && route.legs.length > 0) {
      const leg = route.legs[0];
      if (!distanceMeters && leg.distanceMeters) {
        distanceMeters = leg.distanceMeters;
      }
      if (!durationSeconds && leg.duration) {
        durationSeconds = leg.duration;
      }
    }
    if (!distanceMeters || !durationSeconds) {
      if (isSameLocationApproximate(origin.geometry.location, destination.geometry.location)) {
        Logger.log("📍 Origin and destination are approximately the same. Using minimal values.");
        return { distance: "0.10", duration: "0.03" };
      }
      logError(`⚠️ Missing distance or duration in route: ${JSON.stringify(route)}`);
      return null;
    }
    const distanceMiles = (distanceMeters / 1609.34).toFixed(2);
    const durationHours = (durationSeconds / 3600).toFixed(2);
    Logger.log(`✅ Route found: ${distanceMiles} miles, ${durationHours} hours`);
    return { distance: distanceMiles, duration: durationHours };
  } catch (error) {
    logError(`❌ Error fetching route info: ${error.message}`);
    return null;
  }
}

/**

 * Gets specific sheet name or configuration
 * @returns {any} The requested any

 */

function getSheetName() {
  const today = new Date();
  return Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd") + "-cal-events-export";
}

/**

 * Initializes resources or configuration
 * @param
 * @param {string} sheetName - The sheetName parameter
 * @returns {any} The result

 */

function initializeSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  const isResuming = getScriptProperty('IS_PROCESSING') === 'true';
  const lastCalendarIndex = parseInt(getScriptProperty('LAST_CALENDAR_INDEX') || '-1');
  const lastEventIndex = parseInt(getScriptProperty('LAST_EVENT_INDEX') || '-1');
  const processedEvents = getScriptProperty('PROCESSED_EVENT_IDS');
  let processedEventIDs = processedEvents ? new Set(JSON.parse(processedEvents)) : new Set();

  if (!isResuming) {
    if (sheet) {
      Logger.log(`📄 Sheet '${sheetName}' exists. Clearing contents...`);
      sheet.clearContents();
    } else {
      Logger.log(`📄 Creating a new sheet: '${sheetName}'`);
      sheet = spreadsheet.insertSheet(sheetName);
    }
    resetProgressTracking();
  }

  // Check if the sheet was successfully created or retrieved
  if (!sheet) {
    logError(`Failed to create or retrieve the sheet: '${sheetName}'`);
    return;
  }

  let existingData = [];
  if (isResuming && sheet.getLastRow() > 1) {
    existingData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    Logger.log(`📊 Loaded ${existingData.length} existing rows from the sheet`);
  }

  return { spreadsheet, sheet, isResuming, lastCalendarIndex, lastEventIndex, processedEventIDs };
}

/**

 * Logs error or messages
 * @param
 * @param {string} message - The message content
 * @returns {any} The result

 */

function logError(message) {
  Logger.log(`❌ ERROR: ${message}`);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = spreadsheet.getSheetByName("Error Log");
  if (!logSheet) {
    logSheet = spreadsheet.insertSheet("Error Log");
    logSheet.appendRow(["Timestamp", "Error Message"]);
  }
  logSheet.appendRow([new Date(), message]);
}

/**

 * Processes and transforms event
 * @param
 * @param {CalendarEvent} event - The event parameter
 * @param {any} destinationLocations - The destinationLocations parameter
 * @param {string} API_KEY - The API_KEY parameter
 * @returns {any} The result

 */

function processEvent(event, destinationLocations, API_KEY) {
  const eventDate = new Date(event.start?.dateTime || event.start?.date);
  const eventLocation = event.location || "";
  const startTime = event.start?.dateTime ? new Date(event.start.dateTime) : null;
  const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  const duration = (startTime && endTime) ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2) : "0.00";

  let distancesAndTimes = new Array(destinationLocations.length * 2).fill("");
  if (eventLocation.trim() !== "") {
    const geocodedOrigin = geocodeAddress(API_KEY, eventLocation);
    if (geocodedOrigin) {
      for (let idx = 0; idx < destinationLocations.length; idx++) {
        const geocodedDestination = geocodeAddress(API_KEY, destinationLocations[idx]);
        if (geocodedDestination) {
          const fixedDepartureTime = getFixedDepartureTime();
          const result = getRouteInfo(API_KEY, geocodedOrigin, geocodedDestination, fixedDepartureTime.toISOString());
          if (result) {
            distancesAndTimes[idx * 2] = result.distance;
            distancesAndTimes[idx * 2 + 1] = result.duration;
          }
        }
      }
    }
  }

  return [
    event.id, calendar.getName(), eventDate.toISOString().split("T")[0], event.summary || "Untitled", eventLocation,
    startTime ? Utilities.formatDate(startTime, "UTC", "HH:mm") : "",
    endTime ? Utilities.formatDate(endTime, "UTC", "HH:mm") : "",
    duration, eventDate.getUTCFullYear(), getQuarter(eventDate),
    eventDate.getUTCMonth() + 1, getWeekNumber(eventDate), getDayOfYear(eventDate), getDayOfWeek(eventDate),
    ...distancesAndTimes
  ];
}

/**

 * Sets re progress tracking or configuration values
 * @returns {any} The result

 */

function resetProgressTracking() {
  PropertiesService.getScriptProperties().setProperty('IS_PROCESSING', 'false');
}

/**

 * Saves data to sheet persistently
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @param {string} sheetName - The sheetName parameter
 * @param {Object} data - The data object to process
 * @returns {any} The result

 */

function saveDataToSheet(spreadsheet, sheetName, data) {
  if (data.length === 0) return;
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  const headers = getHeaders();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
  Logger.log(`📝 Saved ${data.length} rows to sheet '${sheetName}'`);
}

/**

 * Saves progress persistently
 * @param
 * @param {number} calendarIndex - The calendarIndex parameter
 * @param {number} eventIndex - The eventIndex parameter
 * @param {string} processedEventIDs - The processedEventIDs parameter
 * @returns {any} The result

 */

function saveProgress(calendarIndex, eventIndex, processedEventIDs) {
  PropertiesService.getScriptProperties().setProperty('LAST_CALENDAR_INDEX', calendarIndex.toString());
  PropertiesService.getScriptProperties().setProperty('LAST_EVENT_INDEX', eventIndex.toString());
  PropertiesService.getScriptProperties().setProperty('PROCESSED_EVENT_IDS', JSON.stringify(Array.from(processedEventIDs)));
}

/**

 * Performs specialized operations
 * @returns {any} The result

 */

function scheduleRestart() {
  Logger.log("⏰ MAX RUNTIME REACHED: Please manually run the script again to continue processing.");
  Logger.log("🔄 Progress has been saved and the script will resume from where it left off.");
  PropertiesService.getScriptProperties().setProperty('IS_PROCESSING', 'true');
}

/**

 * Saves should progress persistently
 * @param
 * @param {any} startTime - The startTime parameter
 * @param {any} lastSaveTime - The lastSaveTime parameter
 * @returns {any} The result

 */

function shouldSaveProgress(startTime, lastSaveTime) {
  const currentTime = new Date().getTime();
  if (currentTime - startTime > MAX_RUNTIME) {
    Logger.log("⏱️ Approaching execution time limit, saving progress...");
    scheduleRestart();
    return true;
  }
  return currentTime - lastSaveTime > SAVE_INTERVAL;
}

// Helper Functions

/**

 * Performs specialized operations
 * @param
 * @param {any} loc1 - The loc1 parameter
 * @param {any} loc2 - The loc2 parameter
 * @returns {any} The result

 */

function areLocationsEqual(loc1, loc2) {
  return loc1.lat === loc2.lat && loc1.lng === loc2.lng;
}

/**

 * Gets specific date range or configuration
 * @returns {any} The requested any

 */

function getDateRange() {
  const startDate = new Date('2023-10-01T00:00:00Z');
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);
  return { timeMin: startDate.toISOString(), timeMax: today.toISOString() };
}

/**

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getDayOfWeek(date) { return date.getUTCDay() || 7; }

/**

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getDayOfYear(date) { return Math.floor((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000) + 1; }

/**

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getQuarter(date) { return Math.floor(date.getUTCMonth() / 3) + 1; }

/**

 * Gets specific script property or configuration
 * @param
 * @param {string} key - The key to look up
 * @returns {any} The requested any

 */

function getScriptProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

/**

 * Gets specific target calendars or configuration
 * @returns {any} The requested any

 */

function getTargetCalendars() {
  const targetCalendarNames = ["Kevin's Calendar", "Kevin's mTBI Calendar", "Kevin mTBI Calendar", "Kevin Calendar"];
  return CalendarApp.getAllCalendars().filter(cal =>
    targetCalendarNames.some(target => cal.getName().toLowerCase().includes(target.toLowerCase()))
  );
}

/**

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getWeekNumber(date) { return Math.ceil(((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7); }

/**

 * Checks boolean condition
 * @param
 * @param {any} loc1 - The loc1 parameter
 * @param {any} loc2 - The loc2 parameter
 * @returns {any} True if condition is met, false otherwise

 */

function isSameLocationApproximate(loc1, loc2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = loc1.lat * Math.PI/180;
  const φ2 = loc2.lat * Math.PI/180;
  const Δφ = (loc2.lat - loc1.lat) * Math.PI/180;
  const Δλ = (loc2.lng - loc1.lng) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance < 100;
}