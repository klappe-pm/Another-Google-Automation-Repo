/**
 * Script Name: export- emails
 *
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Extract emails data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Format output for presentation
 *
 * Script Functions:
 * - exportAllCalendarEvents(): Exports all calendar events to external format
 * - geocodeAddress(): Performs specialized operations
 * - getRouteInfo(): Gets specific route info or configuration
 * - logError(): Logs error or messages
 *
 * Script Helper Functions:
 * - getDayOfWeek(): Gets specific day of week or configuration
 * - getDayOfYear(): Gets specific day of year or configuration
 * - getQuarter(): Gets specific quarter or configuration
 * - getWeekNumber(): Gets specific week number or configuration
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
 * /

/  / Function to geocode an address
 / / Function to get route information between two points using the Routes API
 / / Function to calculate quarter

 / / Function to log errors;

/ / Main Functions

/**

 * Exports all calendar events to external format
 * @returns {any} The result

 * /

/**

 * Exports all calendar events to external format
 * @returns {any} The result

 * /

function exportAllCalendarEvents() {
  Logger.log("🚀 Starting script execution..."); / / Reset the API unavailable log flag at the start of each run;
  PropertiesService.getScriptProperties().deleteProperty('LOGGED_API_UNAVAILABLE'); / / Retrieve API key from script properties;
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY');
  if (! API_KEY) {
    logError("API key is missing. Set it in Script Properties.");
    return;
  } / / Retrieve destination locations
  const destinationsProperty = PropertiesService.getScriptProperties().getProperty('DESTINATION_LOCATIONS');
  if (! destinationsProperty) {
    logError("Destination locations missing. Set them in Script Properties.");
    return;
  }

  const destinationLocations = JSON.parse(destinationsProperty);
  if (! Array.isArray(destinationLocations) || destinationLocations.length = = = 0) {
    logError("Invalid destination locations. Ensure it's a valid JSON array.");
    return;
  } / / Define date range: October 1, 2023, to today
  const startDate = new Date('2023 - 10 - 01T00:00:00Z');
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  const timeMin = startDate.toISOString();
  const timeMax = today.toISOString(); / / Generate dynamic sheet name;
  const sheetName = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy - MM - dd") + " - cal - events - export";

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (sheet) {
    Logger.log(`📄 Sheet '${sheetName}' exists. Clearing contents...`);
    sheet.clearContents();
  } else {
    Logger.log(`📄 Creating a new sheet: '${sheetName}'`);
    sheet = spreadsheet.insertSheet(sheetName);
  }

  let existingEventIDs = new Set();
  if (sheet.getLastRow() > 1) {
    existingEventIDs = new Set(sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat());
  } else {
    Logger.log("🌟 First run detected. Treating all events as new.");
  }

  const calendars = CalendarApp.getAllCalendars();
  const data = [];

  calendars.forEach(calendar = > {
    const options = {
      timeMin, timeMax, singleEvents: true, orderBy: "startTime",
      fields: "items(id, start, end, summary, location)"
    };

    let events = [];
    try {
      events = Calendar.Events.list(calendar.getId(), options).items || [];
      Utilities.sleep(1000); / / Prevent API rate limits;
    } catch (error) {
      logError(`Error fetching events for calendar '${calendar.getName()}': ${error.message}`);
      return;
    }

    events.forEach(event = > {
      if (existingEventIDs.has(event.id)) {
        Logger.log(`🔄 Skipping duplicate event: ${event.summary}`);
        return;
      }

      const eventDate = new Date(event.start?.dateTime || event.start?.date);
      const eventLocation = event.location || "";
      const startTime = event.start?.dateTime ? new Date(event.start.dateTime) : null;
      const endTime = event.end?.dateTime ? new Date(event.end.dateTime) : null;
      const duration = (startTime && endTime) ? ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2) : "0.00";

      let distancesAndTimes = new Array(destinationLocations.length * 2).fill("");

      if (eventLocation.trim() ! = = "") {
        try {
          const geocodedOrigin = geocodeAddress(API_KEY, eventLocation);
          if (geocodedOrigin) {
            destinationLocations.forEach((destination, idx) = > {
              try {
                const geocodedDestination = geocodeAddress(API_KEY, destination);
                if (geocodedDestination) {
                  const result = getRouteInfo(API_KEY, geocodedOrigin, geocodedDestination);
                  if (result) {
                    distancesAndTimes[idx * 2] = result.distance;
                    distancesAndTimes[idx * 2 + 1] = result.duration;
                  }
                }
                Utilities.sleep(1000);
              } catch (error) {
                logError(`Error calculating route to '${destination}': ${error.message}`);
              }
            });
          }
        } catch (error) {
          logError(`Error processing location for event '${event.summary}': ${error.message}`);
        }
      }

      data.push([
        event.id, calendar.getName(), eventDate.toISOString().split("T")[0], event.summary || "Untitled", eventLocation,
        startTime ? Utilities.formatDate(startTime, "UTC", "HH:mm") : "",
        endTime ? Utilities.formatDate(endTime, "UTC", "HH:mm") : "",
        duration, eventDate.getUTCFullYear(), getQuarter(eventDate),
        eventDate.getUTCMonth() + 1, getWeekNumber(eventDate), getDayOfYear(eventDate), getDayOfWeek(eventDate),
        ...distancesAndTimes
      ]);
    });
  });

  if (data.length > 0) {
    const headers = [;
      "Event ID", "Calendar Name", "Event Date", "Event Summary", "Event Location",
      "Start Time", "End Time", "Duration (hours)", "Year", "Quarter",
      "Month", "Week Number", "Day of Year", "Day of Week",
      ...destinationLocations.flatMap(loc = > [`Distance to ${loc} (miles)`, `Duration to ${loc} (hours)`]);
    ];
    data.unshift(headers);

    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    Logger.log(`✅ Successfully added ${data.length - 1} new events to '${sheetName}'.`);
  } else {
    Logger.log("⚠️ No new events to export.");
  }

  Logger.log("🎉 Script execution completed successfully.");
}

/**

 * Performs specialized operations
 * @param
 * @param {string} apiKey - The apiKey parameter
 * @param {any} address - The address parameter
 * @returns {any} The result

 * /

/**

 * Performs specialized operations
 * @param
 * @param {string} apiKey - The apiKey parameter
 * @param {any} address - The address parameter
 * @returns {any} The result

 * /

function geocodeAddress(apiKey, address) {
  if (! address.trim()) return null;

  try {
    const url = `https: / / maps.googleapis.com / maps / api / geocode / json?address= ${encodeURIComponent(address)}&key= ${apiKey}`;
    const response = UrlFetchApp.fetch(url);
    Utilities.sleep(1000);

    const json = JSON.parse(response.getContentText());
    if (json.status ! = = "OK") throw new Error(json.error_message || "Unknown error");

    return json.results[0];
  } catch (error) {
    logError(`Geocoding failed for '${address}': ${error.message}`);
    return null;
  }
}

/**

 * Gets specific route info or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origin - The origin to retrieve
 * @param {any} destination - The destination to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific route info or configuration
 * @param
 * @param {string} apiKey - The apiKey to retrieve
 * @param {any} origin - The origin to retrieve
 * @param {any} destination - The destination to retrieve
 * @returns {any} The requested any

 * /

function getRouteInfo(apiKey, origin, destination) {
  try {
    const originLoc = {
      latitude: origin.geometry.location.lat,
      longitude: origin.geometry.location.lng
    };

    const destLoc = {
      latitude: destination.geometry.location.lat,
      longitude: destination.geometry.location.lng
    }; / / Using the Routes API (v2)
    const url = "https: / / routes.googleapis.com / directions / v2:computeRoutes";

    const payload = {
      origin: {
        location: {
          latLng: {
            latitude: originLoc.latitude,
            longitude: originLoc.longitude
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destLoc.latitude,
            longitude: destLoc.longitude
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      languageCode: "en - US",
      units: "IMPERIAL"
    };

    const options = {
      method: 'POST',
      contentType: 'application / json',
      headers: {
        'X - Goog - Api - Key': apiKey,
        'X - Goog - FieldMask': 'routes.duration,routes.distanceMeters'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    Utilities.sleep(1000);

    const json = JSON.parse(response.getContentText());

    if (! json.routes || json.routes.length = = = 0) {
      throw new Error("No routes found in response");
    }

    const route = json.routes[0];
    const distanceInMiles = (route.distanceMeters / 1609.34).toFixed(2); / / Convert meters to miles;
    const durationInHours = (route.duration.replace('s', '') / 3600).toFixed(2); / / Convert seconds to hours;

    return {
      distance: distanceInMiles,
      duration: durationInHours
    };
  } catch (error) {
    logError(`Route calculation failed: ${error.message}`);
    return null;
  }
}

/**

 * Logs error or messages
 * @param
 * @param {string} message - The message content
 * @returns {any} The result

 * /

/**

 * Logs error or messages
 * @param
 * @param {string} message - The message content
 * @returns {any} The result

 * /

function logError(message) {
  Logger.log(`❌ ERROR: ${message}`);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = spreadsheet.getSheetByName("Error Log");

  if (! logSheet) {
    logSheet = spreadsheet.insertSheet("Error Log");
    logSheet.appendRow(["Timestamp", "Error Message"]);
  }

  logSheet.appendRow([new Date(), message]);
}

/ / Helper Functions

/**

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfWeek(date) { return date.getUTCDay() || 7; }

/**

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfYear(date) { return Math.floor((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000) + 1; }

/**

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getQuarter(date) { return Math.floor(date.getUTCMonth() / 3) + 1; }

/**

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) { return Math.ceil(((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7); }