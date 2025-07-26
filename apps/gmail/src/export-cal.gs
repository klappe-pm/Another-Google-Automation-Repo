/**
 * Script Name: export-cal
 * 
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * - Extract cal data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Access Drive file system
 * 4. Fetch source data
 * 5. Validate input data
 * 6. Process and transform data
 * 7. Apply filters and criteria
 * 8. Sort data by relevant fields
 * 
 * Script Functions:
 * - chunkArray(): Performs specialized operations
 * - debugLog(): Logs debug or messages
 * - exportAllCalendarEvents(): Exports all calendar events to external format
 * - exportLogs(): Exports logs to external format
 * - extractEmailDataWithGemini(): Extracts specific information
 * - fetchCalendarEvents(): Retrieves calendar events from service
 * - getDayOfYear(): Gets specific day of year or configuration
 * - getDistancesFromGoogleMaps(): Gets specific distances from google maps or configuration
 * - getLocationForDate(): Gets specific location for date or configuration
 * - getQuarter(): Gets specific quarter or configuration
 * - loadConfiguration(): Loads configuration from storage
 * - processEmails(): Processes and transforms emails
 * - processEventsData(): Processes and transforms events data
 * - roundToQuarterHour(): Performs specialized operations
 * - setConfig(): Sets config or configuration values
 * - testAllComponents(): Processes email data
 * - testCalendarAccess(): Works with spreadsheet data
 * - testEmailExtraction(): Extracts specific information
 * - testGeminiApiKey(): Performs specialized operations
 * - testGmailAccess(): Processes email data
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
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
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
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**

 * Logs debug or messages
 * @param
 * @param {any} level - The level parameter
 * @param {string} functionName - The functionName parameter
 * @param {string} message - The message content
 * @returns {any} The result

 */

function debugLog(level, functionName, message) {
  const timestamp = new Date().toISOString();
  Logger.log(`[${timestamp}] ${level} [${functionName}] ${message}`);
  if (level === 'ERROR' || level === 'WARN') {
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const errorSheet = spreadsheet.getSheetByName('ErrorLog') || spreadsheet.insertSheet('ErrorLog');
      errorSheet.appendRow([new Date(), level, functionName, message]);
    } catch (e) {
      Logger.log(`[${timestamp}] ERROR [debugLog] Failed to log to ErrorLog sheet: ${e.message}`);
    }
  }
}

/**

 * Exports all calendar events to external format
 * @returns {any} The result

 */

function exportAllCalendarEvents() {
  const functionName = 'exportAllCalendarEvents';
  debugLog('INFO', functionName, 'Starting execution');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const scriptProperties = PropertiesService.getScriptProperties();
  let threadsProcessed = 0;

  const logSheet = spreadsheet.getSheetByName('EventLog') || spreadsheet.insertSheet('EventLog');
  const invoiceSheet = spreadsheet.getSheetByName('InvoiceData') || spreadsheet.insertSheet('InvoiceData');
  if (invoiceSheet.getLastRow() === 0) {
    debugLog('INFO', functionName, 'Initializing InvoiceData sheet');
    invoiceSheet.getRange(1, 1, 1, 15).setValues([[;
      "Sender Email", "Subject", "Total Fare", "Trip Fare", "Service / Booking Fee",
      "Priority Pickup Fee", "Other Fees", "Travel Time", "Distance",
      "Pickup Time", "Drop - off Time", "Pickup Location", "Drop - off Location",
      "Driver Name", "Email Date"
    ]]);
    invoiceSheet.getRange("1:1").setFontWeight('bold');
  }

  const MAPS_API_KEY = scriptProperties.getProperty('GOOGLE_MAPS_API_KEY');
  const GEMINI_API_KEY = scriptProperties.getProperty('GEMINI_API_KEY');
  if (!MAPS_API_KEY || !GEMINI_API_KEY) {
    debugLog('ERROR', functionName, 'Google Maps or Gemini API key not configured');
    SpreadsheetApp.getUi().alert('Error: Google Maps or Gemini API key not configured. Please run setConfig().');
    return;
  }
  debugLog('INFO', functionName, `Maps API Key: ${MAPS_API_KEY.slice(0, 4)}...${MAPS_API_KEY.slice( - 4)}`);

  try {
    debugLog('INFO', functionName, 'Validating Google Maps API key');
    const testUrl = `https: // maps.googleapis.com / maps / api / distancematrix / json?units=imperial&origins=901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&destinations=901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&key=${MAPS_API_KEY}`;
    const testResponse = UrlFetchApp.fetch(testUrl, { muteHttpExceptions: true });
    const testData = JSON.parse(testResponse.getContentText());
    debugLog('INFO', functionName, `Maps API key test: status=${testData.status}, error=${testData.error_message || 'none'}`);
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
  if (!calendarIds || !locations) return;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startDate = new Date('2025 - 05 - 01'); // Small range for testing;
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date('2025 - 05 - 11');
  endDate.setUTCHours(0, 0, 0, 0);
  const timeMin = Utilities.formatDate(startDate, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'");
  const timeMax = Utilities.formatDate(endDate, "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'");
  debugLog('INFO', functionName, `Calendar query range: ${timeMin} to ${timeMax}`);

  const eventStart = new Date(startDate);
  const eventEnd = new Date(endDate);
  const sortedLocations = locations.sort((a, b) => a.start - b.start);
  let isCovered = sortedLocations.length > 0 && sortedLocations[0].start < = eventStart;
  for (let i = 0; i < sortedLocations.length - 1; i ++ ) {
    if (sortedLocations[i].end < sortedLocations[i + 1].start) {
      isCovered = false;
      break;
    }
  }
  isCovered = isCovered && sortedLocations[sortedLocations.length - 1].end > = eventEnd;
  if (!isCovered) {
    debugLog('WARN', functionName, `Location date ranges may not cover event period (${Utilities.formatDate(eventStart, "UTC", "yyyy - MM - dd")} to ${Utilities.formatDate(eventEnd, "UTC", "yyyy - MM - dd")})`);
  } else {
    debugLog('INFO', functionName, 'Location date ranges fully cover event period');
  }

  debugLog('INFO', functionName, 'Loading processed event IDs from EventLog');
  const logData = logSheet.getDataRange().getValues();
  const processedEventIds = new Set(logData.slice(1).map(row => row[0]));
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

  const pdfFolderName = "EmailPDFs";
  let pdfFolder = DriveApp.getFoldersByName(pdfFolderName).hasNext();
    ? DriveApp.getFoldersByName(pdfFolderName).next();
    : DriveApp.createFolder(pdfFolderName);
  debugLog('INFO', functionName, `Google Drive folder ${pdfFolderName} ready`);

  const allEvents = [];
  const locationMap = new Map();
  const logEntries = [["Event ID", "Calendar Name", "Event Name", "Event Date", "Error"]];
  debugLog('INFO', functionName, `Processing ${calendarIds.length} calendars`);
  calendarIds.forEach(calendarId => {
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

    eventLocations.forEach((eventLocation, i) => {
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

  debugLog('INFO', functionName, 'Proceeding to Gmail email processing despite calendar errors');
  threadsProcessed = processEmails(spreadsheet, invoiceSheet, GEMINI_API_KEY, today, errors);

  if (logEntries.length > 1) {
    debugLog('INFO', functionName, `Writing ${logEntries.length - 1} entries to EventLog`);
    logSheet.clear();
    logSheet.getRange(1, 1, logEntries.length, logEntries[0].length).setValues(logEntries);
  }

  const message = eventsData.length > 1 || threadsProcessed > 0;
    ? `Exported ${eventsData.length - 1} events and processed ${threadsProcessed} email threads.${errors.length ? `\n${errors.length} errors. See ErrorLog.` : ''}`
    : 'No new events or emails found.';
  debugLog('INFO', functionName, message);
  SpreadsheetApp.getUi().alert(message);

  if (errors.length) {
    debugLog('ERROR', functionName, `Encountered ${errors.length} errors: ${errors.join('; ')}`);
  }
  debugLog('INFO', functionName, 'Execution completed');
}

/**

 * Exports logs to external format
 * @returns {any} The result

 */

function exportLogs() {
  const functionName = 'exportLogs';
  debugLog('INFO', functionName, 'Exporting logs to ErrorLog.csv');
  try {
    const errorSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ErrorLog');
    const data = errorSheet.getDataRange().getValues();
    const csvContent = data.map(row => row.join(',')).join('\n');
    DriveApp.createFile('ErrorLog.csv', csvContent, 'text / csv');
    debugLog('INFO', functionName, 'Exported logs to ErrorLog.csv');
  } catch (e) {
    debugLog('ERROR', functionName, `Failed to export logs: ${e.message}`);
  }
}

/**

 * Extracts specific information
 * @param
 * @param {string} emailHtml - The emailHtml parameter
 * @param {string} geminiApiKey - The geminiApiKey parameter
 * @returns {any} The result

 */

function extractEmailDataWithGemini(emailHtml, geminiApiKey) {
  const functionName = 'extractEmailDataWithGemini';
  debugLog('INFO', functionName, 'Starting email data extraction');
  const MAX_RETRIES = 5;
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      const prompt = `Extract the following from the HTML - formatted email content (ignore any PDF attachments): - Sender Email: Identify if the sender is Lyft (e.g., no - reply@lyftmail.com) or Uber (e.g., noreply@uber.com). - Subject: The email subject line. - Total Fare: The total amount charged (e.g., "$8.20" or "$6.65"). - Trip Fare: The base fare for the trip (e.g., "$5.16" or "$2.76"). - Service or Booking Fee: Any service or booking fee (e.g., "$2.34" or "$3.80"). - Priority Pickup Fee: Fee for priority pickup, if present (e.g., "$2.00" or "$2.56"). - Other Fees: Any additional fees (e.g., Clean Miles Standard Regulatory Fee, Access for All Fee, CA Driver Benefits) as a JSON object. - Travel Time: Duration of the trip (e.g., "3 min" or "5m 52s"). - Distance: Trip distance (e.g., "0.85 miles" or "1.59mi"). - Pickup Time: Time of pickup (e.g., "2:46 PM" or "2:57 PM"). - Drop - off Time: Time of drop - off (e.g., "2:50 PM" or "3:02 PM"). - Pickup Location: Pickup address (e.g., "1565 Santa Ana Ave, Costa Mesa, CA 92627, US"). - Drop - off Location: Drop - off address (e.g., "1773 Newport Blvd, Costa Mesa, CA 92627, US"). - Driver Name: Name of the driver (e.g., "Julio" or "Maria").;
Return the result in JSON format with keys: sender_email, subject, total_fare, trip_fare, service_booking_fee, priority_pickup_fee, other_fees, travel_time, distance, pickup_time, dropoff_time, pickup_location, dropoff_location, driver_name. Use empty strings for missing values.`;
      const payload = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }, { text: emailHtml }]
        }],
        generationConfig: {
          response_mime_type: 'application / json'
        }
      };
      const options = {
        method: 'post',
        contentType: 'application / json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      const url = `https: // generativelanguage.googleapis.com / v1beta / models / gemini - 1.5 - pro:generateContent?key=${geminiApiKey}`;
      debugLog('INFO', functionName, `Sending Gemini API request, attempt ${attempts + 1}`);
      const response = UrlFetchApp.fetch(url, options);
      const responseText = response.getContentText();
      debugLog('INFO', functionName, `Gemini API response status: ${response.getResponseCode()}`);
      const data = JSON.parse(responseText);
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        debugLog('INFO', functionName, 'Gemini API response received');
        return JSON.parse(data.candidates[0].content.parts[0].text);
      }
      debugLog('ERROR', functionName, `No valid response from Gemini API: ${responseText.slice(0, 100)}...`);
      throw new Error(`No valid response from Gemini API: ${responseText.slice(0, 100)}...`);
    } catch (e) {
      debugLog('ERROR', functionName, `Error extracting email data, attempt ${attempts + 1}: ${e.message}`);
      attempts ++; if (attempts < MAX_RETRIES) {
        const delay = 5000 * Math.pow(2, attempts);
        debugLog('INFO', functionName, `Waiting ${delay}ms before retrying`);
        Utilities.sleep(delay);
      }
    }
  }
  debugLog('ERROR', functionName, `Failed to extract email data after ${MAX_RETRIES} retries`);
  return null;
}

/**

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

 */

function fetchCalendarEvents(calendarId, timeMin, timeMax, processedEventIds, dateCache, locations, logEntries, errors) {
  const functionName = 'fetchCalendarEvents';
  debugLog('INFO', functionName, `Processing calendar ${calendarId}`);
  const calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    debugLog('ERROR', functionName, `Invalid calendar ID: ${calendarId}`);
    errors.push(`Invalid calendar ID: ${calendarId}`);
    return [];
  }
  const calName = calendar.getName();
  let nextPageToken = null;
  let pageCount = 0;
  let totalEvents = 0;
  const allEvents = [];
  const startTime = new Date().getTime();
  const MAX_EXECUTION_TIME = 5 * 60 * 1000;
  const MAX_RETRIES = 5;
  const MAX_SERVER_ERRORS = 3;
  let globalAttempts = 0;
  const MAX_GLOBAL_ATTEMPTS = 2;

  while (globalAttempts < MAX_GLOBAL_ATTEMPTS) {
    debugLog('INFO', functionName, `Global attempt ${globalAttempts + 1} for calendar ${calendarId}`);
    nextPageToken = null;
    pageCount = 0;
    totalEvents = 0;
    allEvents.length = 0;

    do {
      if (new Date().getTime() - startTime > MAX_EXECUTION_TIME) {
        debugLog('ERROR', functionName, `Time limit reached for calendar ${calendarId}`);
        errors.push(`Execution time limit reached for calendar ${calendarId}`);
        break;
      }
      if (pageCount > = 1) {
        debugLog('INFO', functionName, `Limiting to 1 page for testing for ${calendarId}`);
        break;
      }

      const options = {
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: "startTime",
        pageToken: nextPageToken,
        maxResults: 20
      };
      debugLog('INFO', functionName, `Fetching events for ${calendarId}, page ${pageCount + 1}, options: ${JSON.stringify(options)}`);
      let response;
      let attempts = 0;
      let serverErrorCount = 0;

      while (attempts < MAX_RETRIES && serverErrorCount < MAX_SERVER_ERRORS) {
        try {
          response = Calendar.Events.list(calendarId, options);
          debugLog('INFO', functionName, `Successfully fetched page ${pageCount + 1} for ${calendarId}`);
          break;
        } catch (e) {
          if (e.message.includes('server error')) serverErrorCount ++; debugLog('ERROR', functionName, `Calendar API error for ${calendarId}, page ${pageCount + 1}, attempt ${attempts + 1}: ${e.message}`);
          attempts ++; if (serverErrorCount > = MAX_SERVER_ERRORS) {
            debugLog('ERROR', functionName, `Too many server errors for ${calendarId}. Skipping page.`);
            errors.push(`Too many server errors for ${calendarId}. Skipping page ${pageCount + 1}.`);
            break;
          }
          if (attempts < MAX_RETRIES) {
            const delay = 5000 * Math.pow(2, attempts);
            debugLog('INFO', functionName, `Waiting ${delay}ms before retrying`);
            Utilities.sleep(delay);
          }
        }
      }

      if (!response) {
        debugLog('ERROR', functionName, `Failed to fetch page ${pageCount + 1} for ${calendarId} after ${MAX_RETRIES} retries`);
        globalAttempts ++; if (globalAttempts < MAX_GLOBAL_ATTEMPTS) {
          debugLog('INFO', functionName, `Retrying entire calendar ${calendarId} after 15s`);
          Utilities.sleep(15000);
          break;
        } else {
          debugLog('ERROR', functionName, `Failed to fetch events for ${calendarId} after ${MAX_GLOBAL_ATTEMPTS} global attempts. Skipping calendar.`);
          errors.push(`Failed to fetch events for ${calendarId} after ${MAX_GLOBAL_ATTEMPTS} global attempts`);
          return allEvents;
        }
      }

      const events = response.items || [];
      debugLog('INFO', functionName, `Fetched ${events.length} events for ${calendarId}, page ${pageCount + 1}`);
      totalEvents += events.length;

      events.forEach(event => {
        if (processedEventIds.has(event.id)) {
          debugLog('INFO', functionName, `Skipping processed event ${event.id}`);
          return;
        }
        try {
          const eventDate = new Date(event.start.dateTime || event.start.date);
          if (!event.location) {
            debugLog('INFO', functionName, `Event ${event.id} skipped: no location`);
            return;
          }
          const locationInfo = getLocationForDate(eventDate, locations);
          debugLog('INFO', functionName, `Event ${event.id}: location=${event.location}, locationInfo=${locationInfo ? locationInfo.address : 'null'}`);
          if (locationInfo) {
            locationMap.set(event.location, locationInfo.address);
          }
          allEvents.push({ calendar: calName, event, locationInfo });
        } catch (e) {
          debugLog('ERROR', functionName, `Error parsing event ${event.id}: ${e.message}`);
          logEntries.push([event.id, calName, event.summary || "Untitled", "Unknown", e.message]);
        }
      });

      nextPageToken = response.nextPageToken;
      pageCount ++; debugLog('INFO', functionName, `Estimated API queries: ${pageCount} for ${calendarId}`);
    } while (nextPageToken);

    if (allEvents.length > 0) break;
  }

  debugLog('INFO', functionName, `Total events for ${calendarId}: ${totalEvents}`);
  return allEvents;
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
  const functionName = 'getDistancesFromGoogleMaps';
  debugLog('INFO', functionName, `Fetching distances: ${origins.length} origins, ${destinations.length} destinations`);
  const cacheKey = JSON.stringify({ origins, destinations });
  if (distanceCache[cacheKey]) {
    debugLog('INFO', functionName, `Using cached distance for ${cacheKey}`);
    return distanceCache[cacheKey];
  }

  const CHUNK_SIZE = 5;
  const originChunks = chunkArray(origins, CHUNK_SIZE);
  const results = Array(origins.length).fill().map(() => Array(destinations.length).fill({ distance: "", duration: "" }));
  const MAX_RETRIES = 5;

  try {
    originChunks.forEach((chunk, chunkIndex) => {
      const chunkOrigins = chunk;
      let attempts = 0;
      while (attempts < MAX_RETRIES) {
        try {
          const originsEncoded = encodeURIComponent(chunkOrigins.join("|"));
          const destinationsEncoded = encodeURIComponent(destinations.join("|"));
          const url = `https: // maps.googleapis.com / maps / api / distancematrix / json?units=imperial&origins=${originsEncoded}&destinations=${destinationsEncoded}&key=${apiKey}`;
          debugLog('INFO', functionName, `Distance Matrix API: chunk ${chunkIndex + 1} / ${originChunks.length}, attempt ${attempts + 1}`);
          const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
          const data = JSON.parse(response.getContentText());
          debugLog('INFO', functionName, `Distance Matrix status=${data.status}, error=${data.error_message || 'none'}`);

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
            break;
          } else {
            debugLog('ERROR', functionName, `Distance Matrix error for chunk ${chunkIndex + 1}: ${data.error_message || 'Unknown error'}`);
            attempts ++; if (attempts < MAX_RETRIES) {
              const delay = 5000 * Math.pow(2, attempts);
              debugLog('INFO', functionName, `Waiting ${delay}ms before retrying`);
              Utilities.sleep(delay);
            }
            if (attempts === MAX_RETRIES) {
              throw new Error(`Distance Matrix failed after ${MAX_RETRIES} retries`);
            }
          }
        } catch (e) {
          debugLog('ERROR', functionName, `Distance Matrix failed for chunk ${chunkIndex + 1}: ${e.message}`);
          attempts ++; if (attempts < MAX_RETRIES) {
            const delay = 5000 * Math.pow(2, attempts);
            debugLog('INFO', functionName, `Waiting ${delay}ms before retrying`);
            Utilities.sleep(delay);
          }
        }
      }
    });
    distanceCache[cacheKey] = results;
    debugLog('INFO', functionName, 'Distance Matrix results cached');
    return results;
  } catch (e) {
    debugLog('ERROR', functionName, `Distance Matrix failed: ${e.message}`);
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

/**

 * Gets specific quarter or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getQuarter(date) {
  const key = date.toISOString().split('T')[0];
  if (!dateCache[key]) {
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

/**

 * Loads configuration from storage
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @returns {any} The result

 */

function loadConfiguration(spreadsheet) {
  const functionName = 'loadConfiguration';
  debugLog('INFO', functionName, 'Loading configuration');
  const calendarSheet = spreadsheet.getSheetByName('config - calendars');
  const locationSheet = spreadsheet.getSheetByName('config - locations');

  if (!calendarSheet || !locationSheet) {
    debugLog('ERROR', functionName, `Missing sheet: ${!calendarSheet ? 'config - calendars' : 'config - locations'}`);
    SpreadsheetApp.getUi().alert(`Error: "${!calendarSheet ? 'config - calendars' : 'config - locations'}" sheet not found. Run setConfig().`);
    return { calendarIds: null, locations: null };
  }

  const calendarData = calendarSheet.getDataRange().getValues().slice(1);
  const calendarIds = [...new Set(calendarData.filter(row => row[0]).map(row => row[0]))];
  debugLog('INFO', functionName, `Loaded ${calendarIds.length} calendar IDs: ${calendarIds.join(', ')}`);

  const locationData = locationSheet.getDataRange().getValues().slice(1);
  const locations = locationData;
    .filter(row => row[0] && row[1] && row[2]);
    .map((row, index) => {
      const start = new Date(row[1]);
      const end = new Date(row[2]);
      if (isNaN(start) || isNaN(end)) {
        debugLog('WARN', functionName, `Invalid date range in config - locations row ${index + 2}: ${row[1]} to ${row[2]}`);
        return null;
      }
      debugLog('INFO', functionName, `Config location ${index + 1}: ${row[0]}, ${row[1]} to ${row[2]}`);
      return { address: row[0], start, end, index: index + 1 };
    })
    .filter(loc => loc);

  if (!calendarIds.length) {
    debugLog('ERROR', functionName, 'No valid calendar IDs in "config - calendars" sheet');
    SpreadsheetApp.getUi().alert('Error: No valid calendar IDs found.');
    return { calendarIds: null, locations: null };
  }
  if (!locations.length) {
    debugLog('ERROR', functionName, 'No valid locations in "config - locations" sheet');
    SpreadsheetApp.getUi().alert('Error: No valid locations found.');
    return { calendarIds: null, locations: null };
  }

  return { calendarIds, locations };
}

/**

 * Processes and transforms emails
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @param {Sheet} invoiceSheet - The invoiceSheet parameter
 * @param {string} geminiApiKey - The geminiApiKey parameter
 * @param {any} today - The today parameter
 * @param {any} errors - The errors parameter
 * @returns {any} The result

 */

function processEmails(spreadsheet, invoiceSheet, geminiApiKey, today, errors) {
  const functionName = 'processEmails';
  debugLog('INFO', functionName, 'Starting Gmail email processing');
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const fromDate = Utilities.formatDate(oneMonthAgo, "UTC", "yyyy - MM - dd");
  const query = `from:(no - reply@lyftmail.com OR noreply@uber.com) from:${fromDate}`;
  debugLog('INFO', functionName, `Gmail query: ${query}`);
  let threadsProcessed = 0;

  try {
    const threads = GmailApp.search(query, 0, 100);
    debugLog('INFO', functionName, `Found ${threads.length} email threads`);

    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        try {
          const from = message.getFrom();
          const subject = message.getSubject();
          const date = message.getDate();
          const emailHtml = message.getBody();
          debugLog('INFO', functionName, `Processing email: ${subject || 'Untitled'} from ${from}`);
          const emailData = extractEmailDataWithGemini(emailHtml, geminiApiKey);
          if (emailData) {
            invoiceSheet.appendRow([
              emailData.sender_email || from,
              emailData.subject || subject,
              emailData.total_fare || "",
              emailData.trip_fare || "",
              emailData.service_booking_fee || "",
              emailData.priority_pickup_fee || "",
              JSON.stringify(emailData.other_fees || {}) || "",
              emailData.travel_time || "",
              emailData.distance || "",
              emailData.pickup_time || "",
              emailData.dropoff_time || "",
              emailData.pickup_location || "",
              emailData.dropoff_location || "",
              emailData.driver_name || "",
              Utilities.formatDate(date, "UTC", "yyyy - MM - dd");
            ]);
            debugLog('INFO', functionName, `Extracted data from email: ${subject || 'Untitled'}`);
          } else {
            debugLog('WARN', functionName, `Failed to extract data from email "${subject || 'Untitled'}"`);
            errors.push(`Failed to extract data from email "${subject || 'Untitled'}"`);
          }
          threadsProcessed ++; } catch (e) {
          debugLog('ERROR', functionName, `Error processing email "${message.getSubject() || 'Untitled'}": ${e.message}`);
          errors.push(`Error processing email "${message.getSubject() || 'Untitled'}": ${e.message}`);
        }
      });
    });
  } catch (e) {
    debugLog('ERROR', functionName, `Gmail search failed: ${e.message}`);
    errors.push(`Gmail search failed: ${e.message}`);
  }

  debugLog('INFO', functionName, `Processed ${threadsProcessed} email threads`);
  return threadsProcessed;
}

/**

 * Processes and transforms events data
 * @param
 * @param {CalendarEvent} allEvents - The allEvents parameter
 * @param {Array} distanceResults - The distanceResults parameter
 * @param {any} dateCache - The dateCache parameter
 * @param {any} headers - The headers parameter
 * @param {any} logEntries - The logEntries parameter
 * @param {any} errors - The errors parameter
 * @returns {any} The result

 */

function processEventsData(allEvents, distanceResults, dateCache, headers, logEntries, errors) {
  const functionName = 'processEventsData';
  debugLog('INFO', functionName, `Processing ${allEvents.length} events`);
  const data = [headers];

  allEvents.forEach(({ calendar, event, locationInfo }) => {
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
      const locationEventLink = eventLocation ? `=HYPERLINK("https: // www.google.com / maps / search / ?api=1&query=${encodeURIComponent(eventLocation)}","${eventLocation}")` : "";

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
      logEntries.push([event.id, calendar, eventName, eventDateStr, ""]);
      debugLog('INFO', functionName, `Processed event ${event.id}: ${eventName}`);
    } catch (e) {
      debugLog('ERROR', functionName, `Error processing event "${event.summary || "Untitled"}" (ID: ${event.id}): ${e.message}`);
      logEntries.push([event.id, calendar, event.summary || "Untitled", "Unknown", e.message]);
    }
  });

  return data;
}

/**

 * Performs specialized operations
 * @param
 * @param {string|any} value - The value to set
 * @returns {any} The result

 */

function roundToQuarterHour(value) {
  if (typeof value ! = = 'number' || isNaN(value)) return "";
  const minutes = value * 60;
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  return (roundedMinutes / 60).toFixed(2);
}

/**

 * Sets config or configuration values
 * @returns {any} The result

 */

function setConfig() {
  const functionName = 'setConfig';
  debugLog('INFO', functionName, 'Starting configuration setup');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const mapsApiKey = ui.prompt('Enter Google Maps API Key').getResponseText();
  const geminiApiKey = ui.prompt('Enter Gemini API Key').getResponseText();
  if (!mapsApiKey || !geminiApiKey) {
    debugLog('ERROR', functionName, 'Both Google Maps and Gemini API keys are required');
    ui.alert('Error: Both Google Maps and Gemini API keys are required.');
    return;
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperties({
    'GOOGLE_MAPS_API_KEY': mapsApiKey,
    'GEMINI_API_KEY': geminiApiKey
  });
  debugLog('INFO', functionName, 'API keys stored in PropertiesService');

  let calendarSheet = spreadsheet.getSheetByName('config - calendars');
  if (!calendarSheet) {
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
  if (!locationSheet) {
    locationSheet = spreadsheet.insertSheet('config - locations');
  } else {
    locationSheet.clear();
  }

  const locationData = [;
    ["locationStartReturn", "dateStart", "dateEnd"],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ];
  locationSheet.getRange(1, 1, locationData.length, 3).setValues(locationData);
  locationSheet.getRange("1:1").setFontWeight('bold');
  locationSheet.getDataRange().setHorizontalAlignment('left');
  debugLog('INFO', functionName, 'config - locations sheet created');

  const obfuscatedMapsKey = mapsApiKey.length > 8 ? `${mapsApiKey.slice(0, 4)}...${mapsApiKey.slice( - 4)}` : ' *  *  *  * ';
  const obfuscatedGeminiKey = geminiApiKey.length > 8 ? `${geminiApiKey.slice(0, 4)}...${geminiApiKey.slice( - 4)}` : ' *  *  *  * ';
  debugLog('INFO', functionName, `Config updated. Maps Key: ${obfuscatedMapsKey}, Gemini Key: ${obfuscatedGeminiKey}, Sheets: config - calendars, config - locations`);
  ui.alert('Configuration sheets created. Populate "config - calendars" with calendar IDs (e.g., your.email@gmail.com) and "config - locations" with addresses and date ranges (yyyy - MM - dd). API keys set.');
}

/**

 * Processes email data
 * @returns {any} The result

 */

function testAllComponents() {
  const functionName = 'testAllComponents';
  debugLog('INFO', functionName, 'Starting component tests');
  testCalendarAccess();
  testGmailAccess();
  testMapsApiKey();
  testGeminiApiKey();
  testEmailExtraction();
  debugLog('INFO', functionName, 'Component tests completed');
}

/**

 * Works with spreadsheet data
 * @returns {any} The result

 */

function testCalendarAccess() {
  const functionName = 'testCalendarAccess';
  debugLog('INFO', functionName, 'Testing calendar access');
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const calendarSheet = spreadsheet.getSheetByName('config - calendars');
    if (!calendarSheet) {
      debugLog('ERROR', functionName, 'config - calendars sheet not found');
      return;
    }
    const calendarData = calendarSheet.getDataRange().getValues().slice(1);
    const calendarIds = [...new Set(calendarData.filter(row => row[0]).map(row => row[0]))];
    debugLog('INFO', functionName, `Testing ${calendarIds.length} calendar IDs: ${calendarIds.join(', ')}`);
    calendarIds.forEach(id => {
      try {
        const calendar = CalendarApp.getCalendarById(id);
        debugLog('INFO', functionName, `Calendar ${id}: ${calendar ? calendar.getName() : 'Not found'}`);
        const options = {
          timeMin: Utilities.formatDate(new Date('2023 - 10 - 08'), "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'"),
          timeMax: Utilities.formatDate(new Date('2023 - 10 - 09'), "UTC", "yyyy - MM - dd'T'HH:mm:ss'Z'"),
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

/**

 * Extracts specific information
 * @returns {any} The result

 */

function testEmailExtraction() {
  const functionName = 'testEmailExtraction';
  debugLog('INFO', functionName, 'Testing email extraction');
  try {
    const query = `from:(no - reply@lyftmail.com OR noreply@uber.com)`;
    const threads = GmailApp.search(query, 0, 1);
    if (threads.length > 0) {
      const message = threads[0].getMessages()[0];
      const emailHtml = message.getBody();
      const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
      const emailData = extractEmailDataWithGemini(emailHtml, key);
      debugLog('INFO', functionName, `Extracted Data: ${JSON.stringify(emailData, null, 2)}`);
    } else {
      debugLog('WARN', functionName, 'No emails found');
    }
  } catch (e) {
    debugLog('ERROR', functionName, `Test failed: ${e.message}`);
  }
}

/**

 * Performs specialized operations
 * @returns {any} The result

 */

function testGeminiApiKey() {
  const functionName = 'testGeminiApiKey';
  debugLog('INFO', functionName, 'Testing Gemini API key');
  try {
    const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    const url = `https: // generativelanguage.googleapis.com / v1beta / models / gemini - 1.5 - pro:generateContent?key=${key}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: 'Test prompt' }] }],
      generationConfig: { response_mime_type: 'application / json' }
    };
    const options = {
      method: 'post',
      contentType: 'application / json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    const response = UrlFetchApp.fetch(url, options);
    debugLog('INFO', functionName, `Gemini API test: ${response.getContentText().slice(0, 100)}...`);
  } catch (e) {
    debugLog('ERROR', functionName, `Test failed: ${e.message}`);
  }
}

/**

 * Processes email data
 * @returns {any} The result

 */

function testGmailAccess() {
  const functionName = 'testGmailAccess';
  debugLog('INFO', functionName, 'Testing Gmail access');
  try {
    const threads = GmailApp.search('from:me', 0, 1);
    debugLog('INFO', functionName, `Found ${threads.length} test emails`);
  } catch (e) {
    debugLog('ERROR', functionName, `Test failed: ${e.message}`);
  }
}

/**

 * Performs specialized operations
 * @returns {any} The result

 */

function testMapsApiKey() {
  const functionName = 'testMapsApiKey';
  debugLog('INFO', functionName, 'Testing Google Maps API key');
  try {
    const key = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY');
    const url = `https: // maps.googleapis.com / maps / api / distancematrix / json?units=imperial&origins=901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&destinations=901 % 20East % 20South % 20Street % 2C % 20Anaheim % 2C % 20CA % 2C % 2092815&key=${key}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    debugLog('INFO', functionName, `Maps API test: status=${data.status}, error=${data.error_message || 'none'}`);
  } catch (e) {
    debugLog('ERROR', functionName, `Test failed: ${e.message}`);
  }
}

/**

 * Writes events sheet to destination
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet parameter
 * @param {Object} data - The data object to process
 * @param {any} headers - The headers parameter
 * @returns {any} The result

 */

function writeEventsSheet(spreadsheet, data, headers) {
  const functionName = 'writeEventsSheet';
  debugLog('INFO', functionName, `Writing ${data.length - 1} events to Events sheet`);
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
    sheet.getRange(2, 18, data.length - 1, 2).setNumberFormat("HH:mm");
    sheet.getRange(2, 20, data.length - 1, 3).setNumberFormat("0.0");
    sheet.getRange(2, 23, data.length - 1, 3).setNumberFormat("0.00");
    sheet.getDataRange().setHorizontalAlignment('left');
    debugLog('INFO', functionName, 'Events sheet updated successfully');
  } else {
    debugLog('WARN', functionName, 'No events to write to Events sheet');
  }
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
  return typeof value === 'number' && !isNaN(value) ? value.toFixed(decimals) : "";
}

/**

 * Gets specific day of week or configuration
 * @param
 * @param {any} date - The date to retrieve
 * @returns {any} The requested any

 */

function getDayOfWeek(date) {
  const day = date.getUTCDay();
  return day === 0 ? 1 : day + 1;
}

/**

 * Gets specific name day week or configuration
 * @param
 * @param {any} day - The day to retrieve
 * @returns {any} The requested any

 */

function getNameDayWeek(day) {
  const days = [;
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
  const months = [;
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