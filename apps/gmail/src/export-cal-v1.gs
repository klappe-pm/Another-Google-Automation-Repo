/ * *
 * Script Name: export- cal- v1
 *
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Extract cal v1 data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Apply filters and criteria
 * 7. Sort data by relevant fields
 * 8. Format output for presentation
 *
 * Script Functions:
 * - chunkArray(): Performs specialized operations
 * - debugLog(): Logs debug or messages
 * - exportAllCalendarEvents(): Exports all calendar events to external format
 * - exportLogs(): Exports logs to external format
 * - fetchCalendarEvents(): Retrieves calendar events from service
 * - getDayOfYear(): Gets specific day of year or configuration
 * - getDistancesFromGoogleMaps(): Gets specific distances from google maps or configuration
 * - getLocationForDate(): Gets specific location for date or configuration
 * - getQuarter(): Gets specific quarter or configuration
 * - loadConfiguration(): Loads configuration from storage
 * - processEventsData(): Processes and transforms events data
 * - roundToQuarterHour(): Performs specialized operations
 * - setConfig(): Sets config or configuration values
 * - testAllComponents(): Handles calendar operations
 * - testCalendarAccess(): Works with spreadsheet data
 * - testMapsApiKey(): Performs specialized operations
 * - writeEventsSheet(): Writes events sheet to destination
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
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - ScriptApp: For script management and triggers
 * - SpreadsheetApp: For spreadsheet operations
 * - UrlFetchApp: For HTTP requests to external services
 * - Utilities: For utility functions and encoding
 * /

/  / Guard against global scope execution;
if (typeof ScriptApp ! = = 'undefined') {
  const triggerInfo = ScriptApp.getProjectTriggers().map(t = > `${t.getHandlerFunction()} (${t.getEventType()})`).join(', ') || 'No triggers';
  Logger.log(`[${new Date().toISOString()}] ERROR [Global] Script executed at global scope. Please run a specific function (e.g., exportAllCalendarEvents). Triggers: ${triggerInfo}, Stack: ${new Error().stack}`);
}

let locationMap = new Map(); / / Global to ensure scope consistency;
let debugCounter = 0; / / Unique ID for each debug log;

/ / Main Functions

/ * *

 * Performs specialized operations
 * @param
 * @param {Array} array - Array of elements
 * @param {number} size - The size limit
 * @returns {any} The result

 * /

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i + = size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/ * *

 * Logs debug or messages
 * @param
 * @param {any} level - The level parameter
 * @param {string} functionName - The functionName parameter
 * @param {string} message - The message content
 * @returns {any} The result

 * /

function debugLog(level, functionName, message) {
  const debugId = debugCounter + + ; if (! level || ! functionName || ! message) {
    const stack = new Error().stack.split('\n').slice(1).join('\n');
    const errorMessage = `Invalid log call (ID: ${debugId}): level= ${level}, functionName= ${functionName}, message= ${message}\nStack: ${stack}`;
    Logger.log(`[${new Date().toISOString()}] ERROR [debugLog] ${errorMessage}`);
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const errorSheet = spreadsheet.getSheetByName('ErrorLog') || spreadsheet.insertSheet('ErrorLog');
      errorSheet.appendRow([new Date(), 'ERROR', 'debugLog', errorMessage]);
    } catch (e) {
      Logger.log(`[${new Date().toISOString()}] ERROR [debugLog] Failed to log to ErrorLog sheet: ${e.message}`);
    }
    return;
  }
  const timestamp = new Date().toISOString();
  Logger.log(`[${timestamp}] ${level} [${functionName}] ${message} (ID: ${debugId})`);
  if (level = = = 'ERROR' || level = = = 'WARN') {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const errorSheet = spreadsheet.getSheetByName('ErrorLog') || spreadsheet.insertSheet('ErrorLog');
      errorSheet.appendRow([new Date(), level, functionName, `${message} (ID: ${debugId})`]);
    } catch (e) {
      Logger.log(`[${timestamp}] ERROR [debugLog] Failed to log to ErrorLog sheet: ${e.message}`);
    }
  }
}

/ * *

 * Exports all calendar events to external format
 * @returns {any} The result

 * /

function exportAllCalendarEvents() {
  const functionName = 'exportAllCalendarEvents';
  debugLog('INFO', functionName, 'Starting execution');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProperties = PropertiesService.getScriptProperties(); / / Early configuration check;
  const calendarSheet = spreadsheet.getSheetByName('config - calendars');
  const locationSheet = spreadsheet.getSheetByName('config - locations');
  if (! calendarSheet || ! locationSheet) {
    debugLog('ERROR', functionName, `Missing configuration sheet: ${! calendarSheet ? 'config - calendars' : 'config - locations'}`);
    SpreadsheetApp.getUi().alert(`Error: Missing "${! calendarSheet ? 'config - calendars' : 'config - locations'}" sheet. Run setConfig().`);
    return;
  }

  const logSheet = spreadsheet.getSheetByName('EventLog') || spreadsheet.insertSheet('EventLog');
  const MAPS_API_KEY = scriptProperties.getProperty('GOOGLE_MAPS_API_KEY');
  if (! MAPS_API_KEY) {
    debugLog('ERROR', functionName, 'Google Maps API key not configured');
    SpreadsheetApp.getUi().alert('Error: Google Maps API key not configured. Please run setConfig().');
    return;
  }
  debugLog('INFO', functionName, `Maps API Key: ${MAPS_API_KEY.slice(0, 4)}...${MAPS_API_KEY.slice( - 4)}`);

  try {
    debugLog('INFO', functionName, 'Validating Google Maps API key');
    const testUrl = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= 901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&destinations= 901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&key= ${MAPS_API_KEY}`;
    const testResponse = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
    const testData = JSON.parse(testResponse.getContentText());
    debugLog('INFO', functionName, `Maps API key test: status= ${testData.status}, error= ${testData.error_message || 'none'}`);
    if (testData.status ! = = "OK") {
      debugLog('ERROR', functionName, `Google Maps API key invalid: ${testData.error_message || 'Unknown error'}`);
      SpreadsheetApp.getUi().alert(`Error: Google Maps API key invalid: ${testData.error_message || 'Unknown error'}`);
      return;
    }
  } catch (e) {
    debugLog('ERROR', functionName, `Failed to validate Google Maps API key: ${e.message}`);
    SpreadsheetApp.getUi().alert(`Error: Failed to validate Google Maps API key: ${e.message}`);
    return;
  }

  const { calendarIds, locations } = loadConfiguration(spreadsheet);
  if (! calendarIds || ! locations) return;

  const startDate = new Date('2025 - 05 - 01'); / / Small range for testing;
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date('2025 - 05 - 11');
  endDate.setUTCHours(0, 0, 0, 0);
  const timeMin = Utilities.formatDate(startDate, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'");
  const timeMax = Utilities.formatDate(endDate, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'");
  debugLog('INFO', functionName, `Calendar query range: ${timeMin} to ${timeMax}`);

  const eventStart = new Date(startDate);
  const eventEnd = new Date(endDate);
  const sortedLocations = locations.sort((a, b) = > a.start - b.start);
  let isCovered = sortedLocations.length > 0 && sortedLocations[0].start < = eventStart;
  for (let i = 0; i < sortedLocations.length - 1; i + + ) {
    if (sortedLocations[i].end < sortedLocations[i + 1].start) {
      isCovered = false;
      break;
    }
  }
  isCovered = isCovered && sortedLocations[sortedLocations.length - 1].end > = eventEnd;
  if (! isCovered) {
    debugLog('WARN', functionName, `Location date ranges may not cover event period (${Utilities.formatDate(eventStart, "UTC", "yyyy - MM - dd")} to ${Utilities.formatDate(eventEnd, "UTC", "yyyy - MM - dd")})`);
  } else {
    debugLog('INFO', functionName, 'Location date ranges fully cover event period');
  }

  debugLog('INFO', functionName, 'Loading processed event IDs from EventLog');
  const logData = logSheet.getDataRange().getValues();
  const processedEventIds = new Set(logData.slice(1).map(row = > row[0]));
  debugLog('INFO', functionName, `Loaded ${processedEventIds.size} processed event IDs`);

  const dateCache = {};
  const distanceCache = {};
  const errors = [];

  const headers = [;
    "calName", "eventDate", "eventName", "eventDescription", "eventDuration",
    "numYear", "numQuarter", "numMonth", "numWeek", "numDayYear", "numDayMonth", "numDayWeek",
    "nameQuarter", "nameMonth", "nameDayWeek", "locationStartReturn", "locationEvent",
    "eventStartTime", "eventEndTime", "distanceTotal", "distanceToEvent", "distanceToReturn",
    "timeTotal", "timetoEvent", "timeToReturn"
  ];
  const data = [headers];

  const logEntries = [["Event ID", "Calendar Name", "Event Name", "Event Date", "Error"]];
  debugLog('INFO', functionName, `Processing ${calendarIds.length} calendars`);
  locationMap.clear(); / / Reset global map;
  const allEvents = [];
  calendarIds.forEach(calendarId = > {
    const events = fetchCalendarEvents(calendarId, timeMin, timeMax, processedEventIds, dateCache, locations, logEntries, errors);
    allEvents.push(...events);
  });

  debugLog('INFO', functionName, 'Starting Distance Matrix API calls');
  let distanceResults = {};
  const eventLocations = Array.from(locationMap.keys());
  debugLog('INFO', functionName, `Event locations: ${eventLocations.length}`);
  if (eventLocations.length > 0) {
    const destinationAddresses = Array.from(new Set(locationMap.values()));
    debugLog('INFO', functionName, `Destination addresses: ${destinationAddresses.join('|')}`);
    const outboundResults = getDistancesFromGoogleMaps(eventLocations, destinationAddresses, MAPS_API_KEY);
    const returnResults = getDistancesFromGoogleMaps(destinationAddresses, eventLocations, MAPS_API_KEY);

    eventLocations.forEach((eventLocation, i) = > {
      const destAddress = locationMap.get(eventLocation);
      const destIndex = destinationAddresses.indexOf(destAddress);
      distanceResults[eventLocation] = {
        outbound: outboundResults[i][destIndex] || { distance: "", duration: "" },
        return: returnResults[destIndex][i] || { distance: "", duration: "" }
      };
    });
    debugLog('INFO', functionName, 'Distance Matrix API calls completed');
  } else {
    debugLog('WARN', functionName, 'No event locations for Distance Matrix API');
  }

  const eventsData = processEventsData(allEvents, distanceResults, dateCache, headers, logEntries, errors);
  writeEventsSheet(spreadsheet, eventsData, headers);

  if (logEntries.length > 1) {
    debugLog('INFO', functionName, `Writing ${logEntries.length - 1} entries to EventLog`);
    logSheet.clear();
    logSheet.getRange(1, 1, logEntries.length, logEntries[0].length).setValues(logEntries);
  }

  const message = eventsData.length > 1;
    ? `Exported ${eventsData.length - 1} events.${errors.length ? `\n${errors.length} errors. See ErrorLog.` : ''}`
    : 'No new events found.';
  debugLog('INFO', functionName, message);
  SpreadsheetApp.getUi().alert(message);

  if (errors.length) {
    debugLog('ERROR', functionName, `Encountered ${errors.length} errors: ${errors.join('; ')}`);
  }
  debugLog('INFO', functionName, 'Execution completed');
}

/ * *

 * Exports logs to external format
 * @returns {any} The result

 * /

function exportLogs() {
  const functionName = 'exportLogs';
  debugLog('INFO', functionName, 'Exporting logs to ErrorLog.csv');
  try {
    const errorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ErrorLog');
    const data = errorSheet.getDataRange().getValues();
    const csvContent = data.map(row = > row.join(',')).join('\n');
    DriveApp.createFile('ErrorLog.csv', csvContent, 'text / csv');
    debugLog('INFO', functionName, 'Exported logs to ErrorLog.csv');
  } catch (e) {
    debugLog('ERROR', functionName, `Failed to export logs: ${e.message}`);
  }
}

/ * *

 * Retrieves calendar events from service
 * @param
 * @param {string} calendarId - The calendarId parameter
 * @param {number} timeMin - The timeMin parameter
 * @param {number} timeMax - The timeMax parameter
 * @param {string} processedEventIds - The processedEventIds parameter
 * @param {any} dateCache - The dateCache parameter
 * @param {any} locations - The locations parameter
 * @param {any} logEntries - The logEntries parameter
 * @param {any} errors - The errors parameter
 * @returns {any} The result

 * /

function fetchCalendarEvents(calendarId, timeMin, timeMax, processedEventIds, dateCache, locations, logEntries, errors) {
  const functionName = 'fetchCalendarEvents';
  debugLog('INFO', functionName, `Processing calendar ${calendarId}`);
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (! calendar) {
    debugLog('ERROR', functionName, `Invalid calendar ID: ${calendarId}`);
    errors.push(`Invalid calendar ID: ${calendarId}`);
    return [];
  }
  const calName = calendar.getName();
  const options = {
    timeMin: timeMin,
    timeMax: timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 100 / / Increased for efficiency
  };
  const MAX_RETRIES = 3;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const response = Calendar.Events.list(calendarId, options);
      debugLog('INFO', functionName, `Fetched ${response.items?.length || 0} events for ${calendarId}`);
      const events = response.items || [];
      const allEvents = [];
      events.forEach(event = > {
        if (processedEventIds.has(event.id)) {
          debugLog('INFO', functionName, `Skipping processed event ${event.id}`);
          return;
        }
        try {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          if (! event.location) {
            debugLog('INFO', functionName, `Event ${event.id} skipped: no location`);
            return;
          }
          const locationInfo = getLocationForDate(eventDate, locations);
          debugLog('INFO', functionName, `Event ${event.id}: location= ${event.location}, locationInfo= ${locationInfo ? locationInfo.address : 'null'}`);
          if (locationInfo) {
            locationMap.set(event.location, locationInfo.address);
          }
          allEvents.push({ calendar: calName, event, locationInfo });
          logEntries.push([event.id, calName, event.summary || "Untitled", Utilities.formatDate(eventDate, "UTC", "yyyy - MM - dd"), ""]);
        } catch (e) {
          debugLog('ERROR', functionName, `Error parsing event ${event.id}: ${e.message}`);
          logEntries.push([event.id, calName, event.summary || "Untitled", "Unknown", e.message]);
          errors.push(`Error parsing event ${event.id}: ${e.message}`);
        }
      });
      return allEvents;
    } catch (e) {
      attempts + + ; if (e.message.includes('Quota exceeded') || e.message.includes('429')) {
        debugLog('ERROR', functionName, `Rate limit hit for ${calendarId}. Waiting 30s.`);
        Utilities.sleep(30000);
      } else if (attempts < MAX_RETRIES) {
        debugLog('ERROR', functionName, `Calendar API error for ${calendarId}, attempt ${attempts}: ${e.message}`);
        Utilities.sleep(5000 * Math.pow(2, attempts));
      } else {
        debugLog('ERROR', functionName, `Failed to fetch events for ${calendarId} after ${MAX_RETRIES} retries: ${e.message}`);
        errors.push(`Failed to fetch events for ${calendarId}: ${e.message}`);
        return [];
      }
    }
  }
  return [];
}

/ * *

 * Gets specific day of year or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/ * *

 * Gets specific distances from google maps or configuration
 * @param
 * @param {any} origins - The origins to retrieve
 * @param {any} destinations - The destinations to retrieve
 * @param {string} apiKey - The apiKey to retrieve
 * @returns {any} The requested any

 * /

function getDistancesFromGoogleMaps(origins, destinations, apiKey) {
  const functionName = 'getDistancesFromGoogleMaps';
  debugLog('INFO', functionName, `Fetching distances: ${origins.length} origins, ${destinations.length} destinations`);
  const cacheKey = JSON.stringify({ origins, destinations });
  if (distanceCache[cacheKey]) {
    debugLog('INFO', functionName, `Using cached distance for ${cacheKey}`);
    return distanceCache[cacheKey];
  }

  if (! origins.every(addr = > addr && typeof addr = = = 'string' && addr.trim()) || ! destinations.every(addr = > addr && typeof addr = = = 'string' && addr.trim())) {
    debugLog('ERROR', functionName, 'Invalid addresses detected');
    return Array(origins.length).fill().map(() = > Array(destinations.length).fill({ distance: "", duration: "" }));
  }

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
          const url = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= ${originsEncoded}&destinations= ${destinationsEncoded}&key= ${apiKey}`;
          debugLog('INFO', functionName, `Distance Matrix API: chunk ${chunkIndex + 1} / ${originChunks.length}, attempt ${attempts + 1}`);
          const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
          const data = JSON.parse(response.getContentText());
          debugLog('INFO', functionName, `Distance Matrix status= ${data.status}, error= ${data.error_message || 'none'}`);

          if (data.status = = = "OK") {
            chunkOrigins.forEach((_, i) = > {
              const row = data.rows[i].elements;
              row.forEach((element, j) = > {
                const originIndex = chunkIndex * CHUNK_SIZE + i;
                if (originIndex < origins.length) {
                  if (element.status ! = = 'OK') {
                    debugLog('WARN', functionName, `Distance Matrix failed for origin ${origins[originIndex]}, dest ${destinations[j]}: ${element.status}`);
                    results[originIndex][j] = { distance: "", duration: "" };
                  } else {
                    results[originIndex][j] = {
                      distance: element.distance ? element.distance.value / 1609.34 : "",
                      duration: element.duration ? element.duration.value / 3600 : ""
                    };
                  }
                }
              });
            });
            break;
          } else {
            debugLog('ERROR', functionName, `Distance Matrix error for chunk ${chunkIndex + 1}: ${data.error_message || 'Unknown error'}`);
            attempts + + ; if (attempts < MAX_RETRIES) {
              Utilities.sleep(5000 * Math.pow(2, attempts));
            } else {
              throw new Error(`Distance Matrix failed after ${MAX_RETRIES} retries`);
            }
          }
        } catch (e) {
          debugLog('ERROR', functionName, `Distance Matrix failed for chunk ${chunkIndex + 1}: ${e.message}`);
          attempts + + ; if (attempts < MAX_RETRIES) {
            Utilities.sleep(5000 * Math.pow(2, attempts));
          } else {
            throw e;
          }
        }
      }
    });
    distanceCache[cacheKey] = results;
    debugLog('INFO', functionName, 'Distance Matrix results cached');
    return results;
  } catch (e) {
    debugLog('ERROR', functionName, `Distance Matrix failed: ${e.message}`);
    return Array(origins.length).fill().map(() = > Array(destinations.length).fill({ distance: "", duration: "" }));
  }
}

/ * *

 * Gets specific location for date or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @param {Object} configLocations - The configLocations to retrieve
 * @returns {any} The requested any

 * /

function getLocationForDate(date, configLocations) {
  const functionName = 'getLocationForDate';
  for (const loc of configLocations) {
    if (date > = loc.start && date < = loc.end) {
      debugLog('INFO', functionName, `Found location ${loc.address} for date ${Utilities.formatDate(date, "UTC", "yyyy - MM - dd")}`);
      return { address: loc.address, index: loc.index };
    }
  }
  debugLog('WARN', functionName, `No location for date ${Utilities.formatDate(date, "UTC", "yyyy - MM - dd")}`);
  return null;
}

/ * *

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getQuarter(date) {
  const key = date.toISOString().split('T')[0];
  if (! dateCache[key]) {
    dateCache[key] = {
      quarter: Math.floor(date.getUTCMonth() / 3) + 1,
      week: getWeekNumber(date),
      dayOfYear: getDayOfYear(date),
      dayOfMonth: date.getUTCDate(),
      dayOfWeek: getDayOfWeek(date),
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear();
    };
    debugLog('INFO', 'getQuarter', `Cached date calculations for ${key}`);
  }
  return dateCache[key].quarter;
}

/ * *

 * Loads configuration from storage
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @returns {any} The result

 * /

function loadConfiguration(spreadsheet) {
  const functionName = 'loadConfiguration';
  debugLog('INFO', functionName, 'Loading configuration');
  const calendarSheet = spreadsheet.getSheetByName('config - calendars');
  const locationSheet = spreadsheet.getSheetByName('config - locations');

  if (! calendarSheet || ! locationSheet) {
    debugLog('ERROR', functionName, `Missing sheet: ${! calendarSheet ? 'config - calendars' : 'config - locations'}`);
    SpreadsheetApp.getUi().alert(`Error: "${! calendarSheet ? 'config - calendars' : 'config - locations'}" sheet not found. Run setConfig().`);
    return { calendarIds: null, locations: null };
  }

  const calendarData = calendarSheet.getDataRange().getValues().slice(1);
  const calendarIds = [...new Set(calendarData.filter(row = > row[0]).map(row = > row[0]))];
  debugLog('INFO', functionName, `Loaded ${calendarIds.length} calendar IDs`); / / Validate calendar IDs;
  const validCalendarIds = calendarIds.filter(id = > {
    try {
      CalendarApp.getCalendarById(id).getName();
      return true;
    } catch (e) {
      debugLog('ERROR', functionName, `Invalid calendar ID ${id}: ${e.message}`);
      return false;
    }
  });
  if (! validCalendarIds.length) {
    debugLog('ERROR', functionName, 'No valid calendar IDs in "config - calendars" sheet');
    SpreadsheetApp.getUi().alert('Error: No valid calendar IDs found.');
    return { calendarIds: null, locations: null };
  }

  const locationData = locationSheet.getDataRange().getValues().slice(1);
  const locations = locationData;
    .filter(row = > row[0] && row[3] && row[4]) / / Check Column A (index 0), D (index 3), E (index 4);
    .map((row, index) = > {
      const start = new Date(row[3]); / / Column D;
      const end = new Date(row[4]); / / Column E;
      if (isNaN(start) || isNaN(end) || start > end) {
        debugLog('WARN', functionName, `Invalid date range in config - locations row ${index + 2}: ${row[3]} to ${row[4]}`);
        return null;
      }
      debugLog('INFO', functionName, `Config location ${index + 1}: ${row[0]}, ${row[3]} to ${row[4]}`);
      return { address: row[0], start, end, index: index + 1 };
    })
    .filter(loc = > loc);

  if (! locations.length) {
    debugLog('ERROR', functionName, 'No valid locations in "config - locations" sheet');
    SpreadsheetApp.getUi().alert('Error: No valid locations found.');
    return { calendarIds: null, locations: null };
  }

  return { calendarIds: validCalendarIds, locations };
}

/ * *

 * Processes and transforms events data
 * @param
 * @param {CalendarEvent} allEvents - The allEvents parameter
 * @param {Array} distanceResults - The distanceResults parameter
 * @param {any} dateCache - The dateCache parameter
 * @param {any} headers - The headers parameter
 * @param {any} logEntries - The logEntries parameter
 * @param {any} errors - The errors parameter
 * @returns {any} The result

 * /

function processEventsData(allEvents, distanceResults, dateCache, headers, logEntries, errors) {
  const functionName = 'processEventsData';
  debugLog('INFO', functionName, `Processing ${allEvents.length} events`);
  const data = [headers];

  allEvents.forEach(({ calendar, event, locationInfo }) = > {
    try {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      const eventName = event.summary || "Untitled";
      const eventDescription = event.description || "";
      const eventLocation = event.location || "";
      const startTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
      const endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;

      const duration = startTime && endTime ? roundToQuarterHour((endTime - startTime) / (1000 * 60 * 60)) : "0.00";
      const eventDateStr = Utilities.formatDate(eventDate, "UTC", "yyyy - MM - dd");
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
      const locationEventLink = eventLocation ? `= HYPERLINK("https: / / www.google.com / maps / search / ?api= 1&query= ${encodeURIComponent(eventLocation)}","${eventLocation}")` : "";

      const distancesAndTimes = eventLocation && distanceResults[eventLocation];
        ? [
            formatValue((distanceResults[eventLocation].outbound.distance || 0) + (distanceResults[eventLocation].return.distance || 0), 1),
            formatValue(distanceResults[eventLocation].outbound.distance, 1),
            formatValue(distanceResults[eventLocation].return.distance, 1),
            roundToQuarterHour((distanceResults[eventLocation].outbound.duration || 0) + (distanceResults[eventLocation].return.duration || 0)),
            formatValue(distanceResults[eventLocation].outbound.duration, 2),
            formatValue(distanceResults[eventLocation].return.duration, 2);
          ]
        : ["", "", "", "", "", ""];

      const eventRow = [;
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
      ];

      data.push(eventRow);
      debugLog('INFO', functionName, `Processed event ${event.id}: ${eventName}`);
    } catch (e) {
      debugLog('ERROR', functionName, `Error processing event "${event.summary || "Untitled"}" (ID: ${event.id}): ${e.message}`);
      logEntries.push([event.id, calendar, event.summary || "Untitled", "Unknown", e.message]);
      errors.push(`Error processing event ${event.id}: ${e.message}`);
    }
  });

  return data;
}

/ * *

 * Performs specialized operations
 * @param
 * @param {string|any} value - The value to set
 * @returns {any} The result

 * /

function roundToQuarterHour(value) {
  if (typeof value ! = = 'number' || isNaN(value)) return "";
  const minutes = value * 60;
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  return (roundedMinutes / 60).toFixed(2);
}

/ * *

 * Sets config or configuration values
 * @returns {any} The result

 * /

function setConfig() {
  const functionName = 'setConfig';
  debugLog('INFO', functionName, 'Starting configuration setup');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const mapsApiKey = ui.prompt('Enter Google Maps API Key').getResponseText();
  if (! mapsApiKey) {
    debugLog('ERROR', functionName, 'Google Maps API key is required');
    ui.alert('Error: Google Maps API key is required.');
    return;
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('GOOGLE_MAPS_API_KEY', mapsApiKey);
  debugLog('INFO', functionName, 'API key stored in PropertiesService');

  let calendarSheet = spreadsheet.getSheetByName('config - calendars');
  if (! calendarSheet) {
    calendarSheet = spreadsheet.insertSheet('config - calendars');
  } else {
    calendarSheet.clear();
  }

  const calendarData = [;
    ["calendarID"],
    [""],
    [""],
    [""],
    [""]
  ];
  calendarSheet.getRange(1, 1, calendarData.length, 1).setValues(calendarData);
  calendarSheet.getRange("1:1").setFontWeight('bold');
  calendarSheet.getDataRange().setHorizontalAlignment('left');
  debugLog('INFO', functionName, 'config - calendars sheet created');

  let locationSheet = spreadsheet.getSheetByName('config - locations');
  if (! locationSheet) {
    locationSheet = spreadsheet.insertSheet('config - locations');
  } else {
    locationSheet.clear();
  }

  const locationData = [;
    ["locationStartReturn", "", "", "dateStart", "dateEnd"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
  ];
  locationSheet.getRange(1, 1, locationData.length, 5).setValues(locationData);
  locationSheet.getRange("1:1").setFontWeight('bold');
  locationSheet.getDataRange().setHorizontalAlignment('left');
  debugLog('INFO', functionName, 'config - locations sheet created');

  const obfuscatedMapsKey = mapsApiKey.length > 8 ? `${mapsApiKey.slice(0, 4)}...${mapsApiKey.slice( - 4)}` : ' *  *  *  * ';
  debugLog('INFO', functionName, `Config updated. Maps Key: ${obfuscatedMapsKey}, Sheets: config - calendars, config - locations`);
  ui.alert('Configuration sheets created. Populate "config - calendars" with calendar IDs (e.g., your.email@gmail.com) and "config - locations" with addresses (Column A) and date ranges (Columns D and E, yyyy - MM - dd). API key set.');
}

/ * *

 * Handles calendar operations
 * @returns {any} The result

 * /

function testAllComponents() {
  const functionName = 'testAllComponents';
  debugLog('INFO', functionName, 'Starting component tests');
  testCalendarAccess();
  testMapsApiKey();
  debugLog('INFO', functionName, 'Component tests completed');
}

/ * *

 * Works with spreadsheet data
 * @returns {any} The result

 * /

function testCalendarAccess() {
  const functionName = 'testCalendarAccess';
  debugLog('INFO', functionName, 'Testing calendar access');
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const calendarSheet = spreadsheet.getSheetByName('config - calendars');
    if (! calendarSheet) {
      debugLog('ERROR', functionName, 'config - calendars sheet not found');
      return;
    }
    const calendarData = calendarSheet.getDataRange().getValues().slice(1);
    const calendarIds = [...new Set(calendarData.filter(row = > row[0]).map(row = > row[0]))];
    debugLog('INFO', functionName, `Testing ${calendarIds.length} calendar IDs`);
    calendarIds.forEach(id = > {
      try {
        const calendar = CalendarApp.getCalendarById(id);
        debugLog('INFO', functionName, `Calendar ${id}: ${calendar ? calendar.getName() : 'Not found'}`);
        const options = {
          timeMin: Utilities.formatDate(new Date('2025 - 05 - 01'), "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'"),
          timeMax: Utilities.formatDate(new Date('2025 - 05 - 02'), "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'"),
          singleEvents: true,
          maxResults: 10
        };
        const response = Calendar.Events.list(id, options);
        debugLog('INFO', functionName, `Test API call for ${id}: Fetched ${response.items ? response.items.length : 0} events`);
      } catch (e) {
        debugLog('ERROR', functionName, `Error accessing calendar ${id}: ${e.message}`);
      }
    });
  } catch (e) {
    debugLog('ERROR', functionName, `Test failed: ${e.message}`);
  }
}

/ * *

 * Performs specialized operations
 * @returns {any} The result

 * /

function testMapsApiKey() {
  const functionName = 'testMapsApiKey';
  debugLog('INFO', functionName, 'Testing Google Maps API key');
  try {
    const key = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY');
    const url = `https: / / maps.googleapis.com / maps / api / distancematrix / json?units= imperial&origins= 901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&destinations= 901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&key= ${key}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    debugLog('INFO', functionName, `Maps API test: status= ${data.status}, error= ${data.error_message || 'none'}`);
  } catch (e) {
    debugLog('ERROR', functionName, `Test failed: ${e.message}`);
  }
}

/ * *

 * Writes events sheet to destination
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @param {Object} data - The data object to process
 * @param {any} headers - The headers parameter
 * @returns {any} The result

 * /

function writeEventsSheet(spreadsheet, data, headers) {
  const functionName = 'writeEventsSheet';
  debugLog('INFO', functionName, `Writing ${data.length - 1} events to Events sheet`);
  let sheet = spreadsheet.getSheetByName("Events");
  if (! sheet) {
    sheet = spreadsheet.insertSheet("Events");
  } else if (data.length > 1) {
    sheet.clear();
  }

  if (data.length > 1) {
    try {
      const batchSize = 100;
      for (let i = 0; i < data.length; i + = batchSize) {
        const chunk = data.slice(i, i + batchSize);
        sheet.getRange(i + 1, 1, chunk.length, headers.length).setValues(chunk);
      }
      sheet.setFrozenRows(1);
      sheet.getRange("1:1").setFontWeight('bold');
      sheet.setFrozenColumns(1);
      sheet.getRange(2, 18, data.length - 1, 2).setNumberFormat("HH:mm");
      sheet.getRange(2, 20, data.length - 1, 3).setNumberFormat("0.0");
      sheet.getRange(2, 23, data.length - 1, 3).setNumberFormat("0.00");
      sheet.getDataRange().setHorizontalAlignment('left');
      debugLog('INFO', functionName, 'Events sheet updated successfully');
    } catch (e) {
      debugLog('ERROR', functionName, `Failed to write to Events sheet: ${e.message}`);
      SpreadsheetApp.getUi().alert(`Error: Failed to write to Events sheet: ${e.message}`);
    }
  } else {
    debugLog('WARN', functionName, 'No events to write to Events sheet');
  }
}

/ / Helper Functions

/ * *

 * Formats value for display
 * @param
 * @param {string|any} value - The value to set
 * @param {any} decimals - The decimals parameter
 * @returns {any} The result

 * /

function formatValue(value, decimals = 2) {
  return typeof value = = = 'number' && ! isNaN(value) ? value.toFixed(decimals) : "";
}

/ * *

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getDayOfWeek(date) {
  const day = date.getUTCDay();
  return day = = = 0 ? 1 : day + 1;
}

/ * *

 * Gets specific name day week or configuration
 * @param
 * @param {any} day - The day to retrieve
 * @returns {any} The requested any

 * /

function getNameDayWeek(day) {
  const days = [;
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];
  return days[day - 1] || "";
}

/ * *

 * Gets specific name month or configuration
 * @param
 * @param {any} month - The month to retrieve
 * @returns {any} The requested any

 * /

function getNameMonth(month) {
  const months = [;
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[month - 1] || "";
}

/ * *

 * Gets specific name quarter or configuration
 * @param
 * @param {any} quarter - The quarter to retrieve
 * @returns {any} The requested any

 * /

function getNameQuarter(quarter) {
  return `Q${quarter}`;
}

/ * *

 * Gets specific week number or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 * /

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}