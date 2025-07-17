function exportAllCalendarEvents() {
  Logger.log("🚀 Starting script execution...");

  // Retrieve API key from script properties
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GOOGLE_MAPS_API_KEY');
  if (!API_KEY) {
    logError("API key is missing. Set it in Script Properties.");
    return;
  }

  // Retrieve destination locations
  const destinationsProperty = PropertiesService.getScriptProperties().getProperty('DESTINATION_LOCATIONS');
  if (!destinationsProperty) {
    logError("Destination locations missing. Set them in Script Properties.");
    return;
  }

  const destinationLocations = JSON.parse(destinationsProperty);
  if (!Array.isArray(destinationLocations) || destinationLocations.length === 0) {
    logError("Invalid destination locations. Ensure it's a valid JSON array.");
    return;
  }

  // Define date range: October 1, 2023, to today
  const startDate = new Date('2023-10-01T00:00:00Z');
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999);

  const timeMin = startDate.toISOString();
  const timeMax = today.toISOString();

  // Generate dynamic sheet name
  const sheetName = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd") + "-cal-events-export";

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

  calendars.forEach(calendar => {
    const options = { 
      timeMin, timeMax, singleEvents: true, orderBy: "startTime", 
      fields: "items(id, start, end, summary, location)" 
    };

    let events = [];
    try {
      events = Calendar.Events.list(calendar.getId(), options).items || [];
      Utilities.sleep(1000); // Prevent API rate limits
    } catch (error) {
      logError(`Error fetching events for calendar '${calendar.getName()}': ${error.message}`);
      return;
    }

    events.forEach(event => {
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

      if (eventLocation.trim() !== "") {
        try {
          const geocodedOrigin = geocodeAddress(API_KEY, eventLocation);
          if (geocodedOrigin) {
            destinationLocations.forEach((destination, idx) => {
              try {
                const geocodedDestination = geocodeAddress(API_KEY, destination);
                if (geocodedDestination) {
                  // Don't use historical start times - instead use a time in the near future for traffic
                  const futureTime = new Date();
                  futureTime.setHours(futureTime.getHours() + 1); // One hour from now
                  const result = getRouteInfo(API_KEY, geocodedOrigin, geocodedDestination, futureTime.toISOString());
                  if (result) {
                    distancesAndTimes[idx * 2] = result.distance;
                    distancesAndTimes[idx * 2 + 1] = result.duration;
                  }
                }
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
    const headers = [
      "Event ID", "Calendar Name", "Event Date", "Event Summary", "Event Location",
      "Start Time", "End Time", "Duration (hours)", "Year", "Quarter",
      "Month", "Week Number", "Day of Year", "Day of Week",
      ...destinationLocations.flatMap(loc => [`Distance to ${loc} (miles)`, `Duration to ${loc} (hours)`])
    ];
    data.unshift(headers);

    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    Logger.log(`✅ Successfully added ${data.length - 1} new events to '${sheetName}'.`);
  } else {
    Logger.log("⚠️ No new events to export.");
  }

  Logger.log("🎉 Script execution completed successfully.");
}

// Function to geocode an address
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

// Function to get route information between two points using the Routes API
function getRouteInfo(apiKey, origin, destination, departureTime) {
  if (!origin?.geometry?.location || !destination?.geometry?.location) {
    logError("⚠️ Invalid origin or destination. Skipping route calculation.");
    return null;
  }
  
  try {
    Logger.log(`🧭 Calculating route from ${origin.formatted_address} to ${destination.formatted_address} at ${departureTime}`);
    
    // Format request for Routes API
    const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
    
    // Create proper payload (make sure departureTime is formatted correctly)
    const payload = {
      origin: {
        location: {
          latLng: {
            latitude: origin.geometry.location.lat,
            longitude: origin.geometry.location.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.geometry.location.lat,
            longitude: destination.geometry.location.lng
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "IMPERIAL"
    };
    
    // Only add departureTime if it's valid
    if (departureTime) {
      payload.departureTime = departureTime;
    }
    
    const options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline,routes.legs"
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    Utilities.sleep(1000); // Prevent API rate limits
    
    // Log the raw response for debugging
    const responseText = response.getContentText();
    
    if (response.getResponseCode() !== 200) {
      logError(`⚠️ API Error: ${response.getResponseCode()} - ${responseText}`);
      return null;
    }
    
    const json = JSON.parse(responseText);
    
    // Log full response in case of errors
    if (!json.routes || json.routes.length === 0) {
      logError(`⚠️ No valid routes found. API Response: ${JSON.stringify(json)}`);
      return null;
    }
    
    const route = json.routes[0];
    
    // Check if we have the data we need
    if (!route.distanceMeters || !route.duration) {
      logError(`⚠️ Missing distance or duration in route: ${JSON.stringify(route)}`);
      return null;
    }
    
    const distanceMiles = (route.distanceMeters / 1609.34).toFixed(2);
    
    // The duration format might be "123s" or a number
    let durationSeconds = route.duration;
    if (typeof durationSeconds === 'string') {
      durationSeconds = parseInt(durationSeconds.replace('s', ''));
    }
    
    const durationHours = (durationSeconds / 3600).toFixed(2);
    Logger.log(`✅ Route found: ${distanceMiles} miles, ${durationHours} hours`);
    
    return {
      distance: distanceMiles,
      duration: durationHours
    };
  } catch (error) {
    logError(`❌ Error fetching route info: ${error.message}`);
    return null;
  }
}

// Function to calculate quarter
function getQuarter(date) { return Math.floor(date.getUTCMonth() / 3) + 1; }
function getWeekNumber(date) { return Math.ceil(((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7); }
function getDayOfYear(date) { return Math.floor((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000) + 1; }
function getDayOfWeek(date) { return date.getUTCDay() || 7; }

// Function to log errors
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