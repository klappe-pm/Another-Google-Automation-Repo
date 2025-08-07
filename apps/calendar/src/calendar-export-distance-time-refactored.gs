/**
 * Calendar Export with Distance and Time Calculations
 * 
 * Service: Google Calendar + Google Maps + Google Sheets
 * Version: 2.0.0
 * Created: 2025-01-16
 * Updated: 2025-08-07
 * License: MIT
 * 
 * PURPOSE:
 * Exports calendar events with travel distance and time calculations using Google Maps API.
 * Provides comprehensive travel planning data for events with location information.
 * 
 * FEATURES:
 * - Multi-calendar event retrieval with configurable date range
 * - Google Maps distance matrix calculations for multiple locations
 * - Bidirectional travel time calculations (to/from locations)
 * - Comprehensive date/time analytics (quarter, week, day calculations)
 * - Automatic spreadsheet formatting with hyperlinks
 * - Batch processing for large datasets
 * - Checkpoint/resume capability for timeout protection
 * - Configurable locations and API settings
 * 
 * CONFIGURATION:
 * All settings managed via Config sheet or Properties Service.
 * No personal information or API keys are hardcoded.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Run initializeCalendarExport() to create configuration
 * 2. Add your Google Maps API key to Script Properties
 * 3. Configure destination locations in Config sheet
 * 4. Run exportCalendarEvents() to generate report
 * 
 * REQUIRED PERMISSIONS:
 * - Calendar (read): Access calendar events
 * - Sheets (write): Create and modify spreadsheets
 * - Maps API: Calculate distances and travel times
 * - Script Properties: Store configuration
 * 
 * @OnlyCurrentDoc
 */

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Get configuration for calendar export
 * @return {Object} Configuration object with all settings
 */
function getCalendarExportConfig() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Build configuration with defaults
  const config = {
    // Date range settings
    dateRange: {
      monthsBack: Number(userProperties.getProperty('MONTHS_BACK') || 18),
      includeToday: userProperties.getProperty('INCLUDE_TODAY') !== 'false',
      timezone: userProperties.getProperty('TIMEZONE') || Session.getScriptTimeZone()
    },
    
    // Location settings (no hardcoded addresses)
    locations: {
      destinations: getDestinationLocations(),
      calculateReturn: userProperties.getProperty('CALCULATE_RETURN') !== 'false',
      includeTraffic: userProperties.getProperty('INCLUDE_TRAFFIC') === 'true',
      travelMode: userProperties.getProperty('TRAVEL_MODE') || 'driving' // driving, walking, transit, bicycling
    },
    
    // API settings (no hardcoded API keys)
    api: {
      mapsApiKey: scriptProperties.getProperty('MAPS_API_KEY') || '',
      maxLocationsPerBatch: Number(userProperties.getProperty('MAX_LOCATIONS_PER_BATCH') || 25),
      retryAttempts: Number(userProperties.getProperty('RETRY_ATTEMPTS') || 3),
      rateLimitDelay: Number(userProperties.getProperty('RATE_LIMIT_DELAY') || 100)
    },
    
    // Export settings
    export: {
      sheetName: userProperties.getProperty('SHEET_NAME') || 'Calendar Events Export',
      includePrivateEvents: userProperties.getProperty('INCLUDE_PRIVATE') !== 'false',
      includeAllDayEvents: userProperties.getProperty('INCLUDE_ALL_DAY') !== 'false',
      excludeCalendars: (userProperties.getProperty('EXCLUDE_CALENDARS') || '').split(',').filter(Boolean),
      dateFormat: userProperties.getProperty('DATE_FORMAT') || 'yyyy-MM-dd',
      timeFormat: userProperties.getProperty('TIME_FORMAT') || 'HH:mm'
    },
    
    // Processing settings
    processing: {
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 100),
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 300000), // 5 minutes
      enableCheckpoint: userProperties.getProperty('ENABLE_CHECKPOINT') !== 'false',
      resumeFromCheckpoint: userProperties.getProperty('RESUME_FROM_CHECKPOINT') === 'true'
    },
    
    // Logging settings
    logging: {
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO',
      logToSheet: userProperties.getProperty('LOG_TO_SHEET') === 'true',
      sendErrorEmail: userProperties.getProperty('SEND_ERROR_EMAIL') === 'true',
      errorEmailTo: userProperties.getProperty('ERROR_EMAIL_TO') || Session.getActiveUser().getEmail()
    }
  };
  
  // Validate critical settings
  if (!config.api.mapsApiKey) {
    throw new Error('Google Maps API key not configured. Run initializeCalendarExport() and add API key.');
  }
  
  return config;
}

/**
 * Get destination locations from configuration
 * @return {Array} Array of destination addresses
 */
function getDestinationLocations() {
  const userProperties = PropertiesService.getUserProperties();
  
  // Try to get from properties first
  const locationsJson = userProperties.getProperty('DESTINATION_LOCATIONS');
  if (locationsJson) {
    try {
      return JSON.parse(locationsJson);
    } catch (e) {
      Logger.log('Failed to parse destination locations: ' + e.toString());
    }
  }
  
  // Try to get from Config sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (configSheet) {
    const data = configSheet.getDataRange().getValues();
    const locations = [];
    
    for (let i = 1; i < data.length; i++) {
      const [category, setting, value] = data[i];
      if (category === 'Locations' && setting && setting.startsWith('LOCATION_')) {
        if (value) locations.push(value);
      }
    }
    
    if (locations.length > 0) {
      return locations;
    }
  }
  
  // Return empty array if no locations configured
  return [];
}

/**
 * Initialize calendar export configuration
 * Creates Config sheet and prompts for API key
 */
function initializeCalendarExport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Calendar Export Configuration');
  
  // Create Config sheet
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
  } else {
    configSheet.clear();
  }
  
  // Configuration template
  const configData = [
    ['Category', 'Setting', 'Value', 'Default', 'Description'],
    
    // Date range settings
    ['Date Range', 'MONTHS_BACK', '18', '18', 'Number of months to look back'],
    ['Date Range', 'INCLUDE_TODAY', 'true', 'true', 'Include today\'s events'],
    ['Date Range', 'TIMEZONE', Session.getScriptTimeZone(), Session.getScriptTimeZone(), 'Timezone for date calculations'],
    
    ['', '', '', '', ''],
    
    // Location settings
    ['Locations', 'LOCATION_1', '', '', 'First destination address'],
    ['Locations', 'LOCATION_2', '', '', 'Second destination address'],
    ['Locations', 'LOCATION_3', '', '', 'Third destination address'],
    ['Locations', 'CALCULATE_RETURN', 'true', 'true', 'Calculate return distances'],
    ['Locations', 'INCLUDE_TRAFFIC', 'false', 'false', 'Include traffic in calculations'],
    ['Locations', 'TRAVEL_MODE', 'driving', 'driving', 'Mode: driving, walking, transit, bicycling'],
    
    ['', '', '', '', ''],
    
    // API settings
    ['API', 'MAX_LOCATIONS_PER_BATCH', '25', '25', 'Max locations per API call'],
    ['API', 'RETRY_ATTEMPTS', '3', '3', 'Number of retry attempts'],
    ['API', 'RATE_LIMIT_DELAY', '100', '100', 'Delay between API calls (ms)'],
    
    ['', '', '', '', ''],
    
    // Export settings
    ['Export', 'SHEET_NAME', 'Calendar Events Export', 'Calendar Events Export', 'Name for export sheet'],
    ['Export', 'INCLUDE_PRIVATE', 'true', 'true', 'Include private events'],
    ['Export', 'INCLUDE_ALL_DAY', 'true', 'true', 'Include all-day events'],
    ['Export', 'EXCLUDE_CALENDARS', '', '', 'Comma-separated calendar names to exclude'],
    ['Export', 'DATE_FORMAT', 'yyyy-MM-dd', 'yyyy-MM-dd', 'Date format pattern'],
    ['Export', 'TIME_FORMAT', 'HH:mm', 'HH:mm', 'Time format pattern'],
    
    ['', '', '', '', ''],
    
    // Processing settings
    ['Processing', 'BATCH_SIZE', '100', '100', 'Events to process per batch'],
    ['Processing', 'MAX_EXECUTION_TIME', '300000', '300000', 'Max runtime in milliseconds'],
    ['Processing', 'ENABLE_CHECKPOINT', 'true', 'true', 'Enable checkpoint saving'],
    ['Processing', 'RESUME_FROM_CHECKPOINT', 'false', 'false', 'Resume from last checkpoint'],
    
    ['', '', '', '', ''],
    
    // Logging settings
    ['Logging', 'LOG_LEVEL', 'INFO', 'INFO', 'Log level: DEBUG, INFO, WARN, ERROR'],
    ['Logging', 'LOG_TO_SHEET', 'false', 'false', 'Log to spreadsheet'],
    ['Logging', 'SEND_ERROR_EMAIL', 'false', 'false', 'Email on errors'],
    ['Logging', 'ERROR_EMAIL_TO', Session.getActiveUser().getEmail(), '', 'Email for error notifications']
  ];
  
  // Write configuration
  configSheet.getRange(1, 1, configData.length, 5).setValues(configData);
  
  // Format headers
  configSheet.getRange(1, 1, 1, 5)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  // Auto-resize columns
  configSheet.autoResizeColumns(1, 5);
  
  // Prompt for API key
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Google Maps API Key Required',
    'Please enter your Google Maps API key:\n\n' +
    'Get one at: https://console.cloud.google.com/apis/credentials',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const apiKey = response.getResponseText();
    if (apiKey) {
      PropertiesService.getScriptProperties().setProperty('MAPS_API_KEY', apiKey);
      ui.alert('API key saved successfully! You can now configure locations and run the export.');
    }
  }
  
  // Create instructions sheet
  createCalendarInstructions(ss);
  
  logCalendar('INFO', 'Calendar export initialized successfully');
}

/**
 * Create instructions sheet
 * @param {Spreadsheet} ss - Target spreadsheet
 */
function createCalendarInstructions(ss) {
  let sheet = ss.getSheetByName('Instructions') || ss.insertSheet('Instructions');
  sheet.clear();
  
  const instructions = [
    ['Calendar Export - Instructions'],
    [''],
    ['SETUP:'],
    ['1. Review configuration in Config sheet'],
    ['2. Add destination addresses to LOCATION_1, LOCATION_2, LOCATION_3'],
    ['3. Save configuration by running saveCalendarConfig()'],
    ['4. Run exportCalendarEvents() to generate report'],
    [''],
    ['FEATURES:'],
    ['• Export events from all accessible calendars'],
    ['• Calculate travel distances and times to/from locations'],
    ['• Include comprehensive date analytics'],
    ['• Automatic formatting and hyperlinks'],
    ['• Checkpoint/resume for large datasets'],
    [''],
    ['TRAVEL MODES:'],
    ['• driving - Car travel (default)'],
    ['• walking - Walking directions'],
    ['• transit - Public transportation'],
    ['• bicycling - Bike routes'],
    [''],
    ['TROUBLESHOOTING:'],
    ['• Set LOG_LEVEL to DEBUG for detailed output'],
    ['• Check execution transcript for errors'],
    ['• Verify API key has Distance Matrix API enabled'],
    ['• Ensure location addresses are valid'],
    [''],
    ['API LIMITS:'],
    ['• Free tier: 40,000 elements per month'],
    ['• Elements = origins × destinations'],
    ['• Monitor usage in Google Cloud Console']
  ];
  
  sheet.getRange(1, 1, instructions.length, 1).setValues(instructions);
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  sheet.autoResizeColumn(1);
}

/**
 * Save configuration from Config sheet
 */
function saveCalendarConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    throw new Error('Config sheet not found. Run initializeCalendarExport() first.');
  }
  
  const data = configSheet.getDataRange().getValues();
  const userProperties = PropertiesService.getUserProperties();
  const locations = [];
  
  // Process configuration (skip header)
  for (let i = 1; i < data.length; i++) {
    const [category, setting, value] = data[i];
    
    if (setting && value !== '') {
      if (setting.startsWith('LOCATION_')) {
        locations.push(value);
      } else {
        userProperties.setProperty(setting, value);
        logCalendar('DEBUG', `Saved ${setting} = ${value}`);
      }
    }
  }
  
  // Save locations as JSON array
  if (locations.length > 0) {
    userProperties.setProperty('DESTINATION_LOCATIONS', JSON.stringify(locations));
    logCalendar('INFO', `Saved ${locations.length} destination locations`);
  }
  
  SpreadsheetApp.getUi().alert('Configuration saved successfully!');
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

/**
 * Calendar-specific logging function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
function logCalendar(level, message, context = {}) {
  const config = getCalendarExportConfig();
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  
  if (levels.indexOf(level) < levels.indexOf(config.logging.logLevel)) {
    return;
  }
  
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  // Console logging
  console.log(logEntry, context);
  
  // Sheet logging
  if (config.logging.logToSheet) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let logSheet = ss.getSheetByName('Logs');
      
      if (!logSheet) {
        logSheet = ss.insertSheet('Logs');
        logSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Message', 'Context']]);
        logSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      }
      
      logSheet.appendRow([timestamp, level, message, JSON.stringify(context)]);
    } catch (error) {
      console.error('Failed to log to sheet:', error);
    }
  }
  
  // Error email notification
  if (level === 'ERROR' && config.logging.sendErrorEmail) {
    try {
      MailApp.sendEmail({
        to: config.logging.errorEmailTo,
        subject: '[Calendar Export] Error Notification',
        body: `Error occurred in Calendar Export:\n\n${message}\n\nContext: ${JSON.stringify(context, null, 2)}`
      });
    } catch (error) {
      console.error('Failed to send error email:', error);
    }
  }
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Main entry point - Export calendar events with distance calculations
 */
function exportCalendarEvents() {
  const startTime = new Date().getTime();
  const config = getCalendarExportConfig();
  
  logCalendar('INFO', 'Starting calendar export', { 
    monthsBack: config.dateRange.monthsBack,
    destinations: config.locations.destinations.length 
  });
  
  try {
    // Check for resume from checkpoint
    let state = null;
    if (config.processing.resumeFromCheckpoint) {
      state = loadCalendarCheckpoint();
      if (state) {
        logCalendar('INFO', 'Resuming from checkpoint', { 
          eventsProcessed: state.eventsProcessed 
        });
      }
    }
    
    // Initialize state if not resuming
    if (!state) {
      state = {
        events: [],
        eventsProcessed: 0,
        calendarsProcessed: [],
        startTime: startTime,
        data: [createHeaderRow(config)]
      };
    }
    
    // Get date range
    const { timeMin, timeMax } = getDateRange(config);
    
    // Get calendars to process
    const calendars = getCalendarsToProcess(config, state);
    
    // Process each calendar
    for (const calendar of calendars) {
      if (isTimeoutApproaching(startTime, config)) {
        saveCalendarCheckpoint(state);
        throw new Error('Approaching timeout - checkpoint saved. Run again to resume.');
      }
      
      processCalendar(calendar, timeMin, timeMax, config, state);
    }
    
    // Process events with distance calculations
    processEventsWithDistances(state, config);
    
    // Create output spreadsheet
    createOutputSpreadsheet(state.data, config);
    
    // Clear checkpoint on success
    clearCalendarCheckpoint();
    
    // Log completion
    const duration = new Date().getTime() - startTime;
    logCalendar('INFO', 'Calendar export completed', {
      duration: duration,
      eventsProcessed: state.eventsProcessed,
      calendarsProcessed: state.calendarsProcessed.length
    });
    
    // Show success message
    SpreadsheetApp.getUi().alert(
      'Export Complete',
      `Exported ${state.eventsProcessed} events from ${state.calendarsProcessed.length} calendars.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    logCalendar('ERROR', 'Export failed', { 
      error: error.toString(), 
      stack: error.stack 
    });
    throw error;
  }
}

/**
 * Get date range for export
 * @param {Object} config - Configuration
 * @return {Object} Date range with timeMin and timeMax
 */
function getDateRange(config) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - config.dateRange.monthsBack);
  
  const endDate = config.dateRange.includeToday 
    ? new Date(today.getTime() + 24 * 60 * 60 * 1000)
    : today;
  
  return {
    timeMin: Utilities.formatDate(startDate, config.dateRange.timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
    timeMax: Utilities.formatDate(endDate, config.dateRange.timezone, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  };
}

/**
 * Get calendars to process
 * @param {Object} config - Configuration
 * @param {Object} state - Current state
 * @return {Array} Calendars to process
 */
function getCalendarsToProcess(config, state) {
  const allCalendars = CalendarApp.getAllCalendars();
  const calendars = [];
  
  for (const calendar of allCalendars) {
    const calName = calendar.getName();
    
    // Skip if already processed (checkpoint resume)
    if (state.calendarsProcessed.includes(calendar.getId())) {
      continue;
    }
    
    // Skip excluded calendars
    if (config.export.excludeCalendars.includes(calName)) {
      logCalendar('DEBUG', `Skipping excluded calendar: ${calName}`);
      continue;
    }
    
    calendars.push(calendar);
  }
  
  return calendars;
}

/**
 * Process a single calendar
 * @param {Calendar} calendar - Calendar to process
 * @param {string} timeMin - Start time
 * @param {string} timeMax - End time
 * @param {Object} config - Configuration
 * @param {Object} state - Current state
 */
function processCalendar(calendar, timeMin, timeMax, config, state) {
  const calId = calendar.getId();
  const calName = calendar.getName();
  
  logCalendar('DEBUG', `Processing calendar: ${calName}`);
  
  try {
    // Use Advanced Calendar Service for better performance
    const options = {
      timeMin: timeMin,
      timeMax: timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 2500
    };
    
    const response = Calendar.Events.list(calId, options);
    const events = response.items || [];
    
    logCalendar('DEBUG', `Found ${events.length} events in ${calName}`);
    
    // Add events to state
    events.forEach(event => {
      // Skip all-day events if configured
      if (!config.export.includeAllDayEvents && !event.start.dateTime) {
        return;
      }
      
      // Skip private events if configured
      if (!config.export.includePrivateEvents && event.visibility === 'private') {
        return;
      }
      
      state.events.push({
        calendarName: calName,
        event: event
      });
    });
    
    state.calendarsProcessed.push(calId);
    
  } catch (error) {
    logCalendar('WARN', `Error processing calendar ${calName}`, { 
      error: error.toString() 
    });
  }
}

/**
 * Process events with distance calculations
 * @param {Object} state - Current state
 * @param {Object} config - Configuration
 */
function processEventsWithDistances(state, config) {
  const batchSize = config.processing.batchSize;
  
  for (let i = 0; i < state.events.length; i += batchSize) {
    if (isTimeoutApproaching(state.startTime, config)) {
      state.eventsProcessed = i;
      saveCalendarCheckpoint(state);
      throw new Error('Approaching timeout during processing - checkpoint saved.');
    }
    
    const batch = state.events.slice(i, Math.min(i + batchSize, state.events.length));
    
    batch.forEach(eventData => {
      const row = processEvent(eventData, config);
      state.data.push(row);
      state.eventsProcessed++;
    });
    
    // Log progress
    if (state.eventsProcessed % 100 === 0) {
      logCalendar('INFO', `Processed ${state.eventsProcessed}/${state.events.length} events`);
    }
    
    // Rate limiting
    Utilities.sleep(config.api.rateLimitDelay);
  }
}

/**
 * Process individual event
 * @param {Object} eventData - Event data with calendar name
 * @param {Object} config - Configuration
 * @return {Array} Row data for spreadsheet
 */
function processEvent(eventData, config) {
  const { calendarName, event } = eventData;
  
  try {
    const eventDate = new Date(event.start.dateTime || event.start.date);
    const eventName = event.summary || "Untitled";
    const eventLocation = event.location || "";
    const startTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
    const endTime = event.end.dateTime ? new Date(event.end.dateTime) : null;
    
    // Calculate duration
    let duration = 0;
    if (startTime && endTime && endTime >= startTime) {
      duration = (endTime - startTime) / (1000 * 60 * 60);
    }
    
    // Format dates and times
    const eventDateStr = Utilities.formatDate(eventDate, config.dateRange.timezone, config.export.dateFormat);
    const startTimeStr = startTime ? Utilities.formatDate(startTime, config.dateRange.timezone, config.export.timeFormat) : "";
    const endTimeStr = endTime ? Utilities.formatDate(endTime, config.dateRange.timezone, config.export.timeFormat) : "";
    
    // Create location hyperlink
    const locationHyperlink = eventLocation 
      ? `=HYPERLINK("https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}", "${eventLocation}")`
      : "";
    
    // Get date analytics
    const analytics = getDateAnalytics(eventDate);
    
    // Calculate distances if location available
    const distances = eventLocation 
      ? calculateDistances(eventLocation, config)
      : createEmptyDistances(config);
    
    return [
      calendarName,
      eventDateStr,
      eventName,
      locationHyperlink,
      startTimeStr,
      endTimeStr,
      duration.toFixed(2),
      analytics.year,
      analytics.quarter,
      analytics.month,
      analytics.week,
      analytics.dayOfYear,
      analytics.dayOfWeek,
      ...distances
    ];
    
  } catch (error) {
    logCalendar('WARN', `Error processing event: ${event.summary || 'Untitled'}`, { 
      error: error.toString() 
    });
    
    // Return row with basic info and empty distances
    return [
      calendarName,
      '',
      event.summary || 'Error',
      '',
      '', '', '0',
      '', '', '', '', '', '',
      ...createEmptyDistances(config)
    ];
  }
}

/**
 * Get date analytics
 * @param {Date} date - Date to analyze
 * @return {Object} Date analytics
 */
function getDateAnalytics(date) {
  return {
    year: date.getFullYear(),
    quarter: Math.floor(date.getMonth() / 3) + 1,
    month: date.getMonth() + 1,
    week: getWeekNumber(date),
    dayOfYear: getDayOfYear(date),
    dayOfWeek: date.getDay() === 0 ? 7 : date.getDay()
  };
}

/**
 * Calculate week number
 * @param {Date} date - Date
 * @return {number} Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Calculate day of year
 * @param {Date} date - Date
 * @return {number} Day of year
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculate distances using Google Maps API
 * @param {string} eventLocation - Event location
 * @param {Object} config - Configuration
 * @return {Array} Distance and time values
 */
function calculateDistances(eventLocation, config) {
  const destinations = config.locations.destinations;
  const distances = [];
  
  if (destinations.length === 0) {
    return createEmptyDistances(config);
  }
  
  try {
    // Calculate outbound distances (event to destinations)
    const outbound = getDistancesFromMaps(
      [eventLocation], 
      destinations, 
      config
    );
    
    outbound.forEach(item => {
      distances.push(
        item.distance ? item.distance.toFixed(2) : '',
        item.duration ? item.duration.toFixed(2) : ''
      );
    });
    
    // Calculate return distances if configured
    if (config.locations.calculateReturn) {
      const returnDistances = getDistancesFromMaps(
        destinations,
        [eventLocation],
        config
      );
      
      returnDistances.forEach(item => {
        distances.push(
          item.distance ? item.distance.toFixed(2) : '',
          item.duration ? item.duration.toFixed(2) : ''
        );
      });
    }
    
  } catch (error) {
    logCalendar('WARN', 'Distance calculation failed', { 
      error: error.toString(),
      location: eventLocation 
    });
    return createEmptyDistances(config);
  }
  
  return distances;
}

/**
 * Get distances from Google Maps API
 * @param {Array} origins - Origin locations
 * @param {Array} destinations - Destination locations
 * @param {Object} config - Configuration
 * @return {Array} Distance and duration data
 */
function getDistancesFromMaps(origins, destinations, config) {
  const apiKey = config.api.mapsApiKey;
  const mode = config.locations.travelMode;
  const traffic = config.locations.includeTraffic ? 'pessimistic' : 'best_guess';
  
  const originsStr = origins.join('|');
  const destinationsStr = destinations.join('|');
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `units=imperial&` +
    `mode=${mode}&` +
    `traffic_model=${traffic}&` +
    `origins=${encodeURIComponent(originsStr)}&` +
    `destinations=${encodeURIComponent(destinationsStr)}&` +
    `key=${apiKey}`;
  
  let retries = 0;
  while (retries < config.api.retryAttempts) {
    try {
      const response = UrlFetchApp.fetch(url);
      const data = JSON.parse(response.getContentText());
      
      if (data.status === 'OK') {
        const results = [];
        
        if (origins.length === 1) {
          // One origin, multiple destinations
          data.rows[0].elements.forEach(element => {
            results.push({
              distance: element.distance ? element.distance.value / 1609.34 : null,
              duration: element.duration ? element.duration.value / 3600 : null
            });
          });
        } else {
          // Multiple origins, one destination
          data.rows.forEach(row => {
            results.push({
              distance: row.elements[0].distance ? row.elements[0].distance.value / 1609.34 : null,
              duration: row.elements[0].duration ? row.elements[0].duration.value / 3600 : null
            });
          });
        }
        
        return results;
      } else {
        throw new Error(`Maps API error: ${data.error_message || data.status}`);
      }
      
    } catch (error) {
      retries++;
      if (retries >= config.api.retryAttempts) {
        throw error;
      }
      Utilities.sleep(1000 * retries); // Exponential backoff
    }
  }
  
  return Array(Math.max(origins.length, destinations.length)).fill({ distance: null, duration: null });
}

/**
 * Create empty distances array
 * @param {Object} config - Configuration
 * @return {Array} Empty distance values
 */
function createEmptyDistances(config) {
  const numDestinations = config.locations.destinations.length || 3;
  const fieldsPerDestination = 2; // distance and time
  const numFields = config.locations.calculateReturn 
    ? numDestinations * fieldsPerDestination * 2  // Both directions
    : numDestinations * fieldsPerDestination;      // One direction
  
  return Array(numFields).fill('');
}

/**
 * Create header row
 * @param {Object} config - Configuration
 * @return {Array} Header row
 */
function createHeaderRow(config) {
  const headers = [
    "Calendar Name", "Event Date", "Event Name", "Event Location", 
    "Start Time", "End Time", "Duration (hrs)",
    "Year", "Quarter", "Month", "Week", "Day of Year", "Day of Week"
  ];
  
  // Add distance headers
  const destinations = config.locations.destinations;
  destinations.forEach((dest, index) => {
    const locName = `Loc${index + 1}`;
    headers.push(`Distance to ${locName} (mi)`, `Time to ${locName} (hrs)`);
  });
  
  if (config.locations.calculateReturn) {
    destinations.forEach((dest, index) => {
      const locName = `Loc${index + 1}`;
      headers.push(`Distance from ${locName} (mi)`, `Time from ${locName} (hrs)`);
    });
  }
  
  return headers;
}

/**
 * Create output spreadsheet
 * @param {Array} data - Data to write
 * @param {Object} config - Configuration
 */
function createOutputSpreadsheet(data, config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(config.export.sheetName);
  
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(config.export.sheetName);
  }
  
  // Write data
  if (data.length > 0) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  }
  
  // Format sheet
  formatOutputSheet(sheet, data.length);
  
  logCalendar('INFO', `Created output sheet: ${config.export.sheetName}`);
}

/**
 * Format output sheet
 * @param {Sheet} sheet - Sheet to format
 * @param {number} numRows - Number of rows
 */
function formatOutputSheet(sheet, numRows) {
  // Freeze header row
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  // Freeze first column
  sheet.setFrozenColumns(1);
  
  // Format time columns
  if (numRows > 1) {
    sheet.getRange(2, 5, numRows - 1, 1).setNumberFormat("HH:mm"); // Start time
    sheet.getRange(2, 6, numRows - 1, 1).setNumberFormat("HH:mm"); // End time
    sheet.getRange(2, 7, numRows - 1, 1).setNumberFormat("#,##0.00"); // Duration
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Left align all data
  sheet.getDataRange().setHorizontalAlignment('left');
}

// ============================================================================
// CHECKPOINT MANAGEMENT
// ============================================================================

/**
 * Save processing checkpoint
 * @param {Object} state - Current state
 */
function saveCalendarCheckpoint(state) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  const checkpoint = {
    events: state.events.slice(state.eventsProcessed),
    eventsProcessed: state.eventsProcessed,
    calendarsProcessed: state.calendarsProcessed,
    data: state.data,
    timestamp: new Date().toISOString()
  };
  
  // Compress if too large
  const json = JSON.stringify(checkpoint);
  if (json.length > 9000) {
    // Save in chunks
    const chunks = Math.ceil(json.length / 9000);
    for (let i = 0; i < chunks; i++) {
      scriptProperties.setProperty(
        `calendarCheckpoint_${i}`,
        json.substring(i * 9000, (i + 1) * 9000)
      );
    }
    scriptProperties.setProperty('calendarCheckpoint_chunks', chunks.toString());
  } else {
    scriptProperties.setProperty('calendarCheckpoint', json);
  }
  
  logCalendar('DEBUG', 'Checkpoint saved');
}

/**
 * Load processing checkpoint
 * @return {Object} Checkpoint or null
 */
function loadCalendarCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  try {
    // Check for chunked checkpoint
    const chunks = scriptProperties.getProperty('calendarCheckpoint_chunks');
    let json;
    
    if (chunks) {
      json = '';
      for (let i = 0; i < parseInt(chunks); i++) {
        json += scriptProperties.getProperty(`calendarCheckpoint_${i}`);
      }
    } else {
      json = scriptProperties.getProperty('calendarCheckpoint');
    }
    
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    logCalendar('WARN', 'Failed to load checkpoint', { error: error.toString() });
  }
  
  return null;
}

/**
 * Clear saved checkpoint
 */
function clearCalendarCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Clear main checkpoint
  scriptProperties.deleteProperty('calendarCheckpoint');
  
  // Clear chunked checkpoint
  const chunks = scriptProperties.getProperty('calendarCheckpoint_chunks');
  if (chunks) {
    for (let i = 0; i < parseInt(chunks); i++) {
      scriptProperties.deleteProperty(`calendarCheckpoint_${i}`);
    }
    scriptProperties.deleteProperty('calendarCheckpoint_chunks');
  }
  
  logCalendar('DEBUG', 'Checkpoint cleared');
}

/**
 * Check if timeout is approaching
 * @param {number} startTime - Start timestamp
 * @param {Object} config - Configuration
 * @return {boolean} True if timeout approaching
 */
function isTimeoutApproaching(startTime, config) {
  const elapsed = new Date().getTime() - startTime;
  const buffer = 30000; // 30 second buffer
  
  return elapsed > (config.processing.maxExecutionTime - buffer);
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📅 Calendar Export')
    .addItem('⚙️ Initialize Configuration', 'initializeCalendarExport')
    .addItem('💾 Save Configuration', 'saveCalendarConfig')
    .addSeparator()
    .addItem('▶️ Export Events', 'exportCalendarEvents')
    .addItem('⏸️ Resume from Checkpoint', 'resumeCalendarExport')
    .addSeparator()
    .addItem('🗑️ Clear Checkpoint', 'clearCalendarCheckpoint')
    .addItem('📊 Test Distance Calculation', 'testDistanceCalculation')
    .addSeparator()
    .addItem('❓ Help', 'showCalendarHelp')
    .addToUi();
}

/**
 * Resume export from checkpoint
 */
function resumeCalendarExport() {
  const config = getCalendarExportConfig();
  config.processing.resumeFromCheckpoint = true;
  
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('RESUME_FROM_CHECKPOINT', 'true');
  
  exportCalendarEvents();
  
  // Reset flag
  userProperties.setProperty('RESUME_FROM_CHECKPOINT', 'false');
}

/**
 * Test distance calculation
 */
function testDistanceCalculation() {
  const config = getCalendarExportConfig();
  
  if (config.locations.destinations.length === 0) {
    SpreadsheetApp.getUi().alert('No destination locations configured. Please add locations in Config sheet.');
    return;
  }
  
  const testLocation = "Los Angeles International Airport, CA";
  
  try {
    const distances = calculateDistances(testLocation, config);
    
    let message = `Test from: ${testLocation}\n\n`;
    config.locations.destinations.forEach((dest, index) => {
      const distIndex = index * 2;
      message += `To ${dest}:\n`;
      message += `  Distance: ${distances[distIndex]} miles\n`;
      message += `  Time: ${distances[distIndex + 1]} hours\n\n`;
    });
    
    SpreadsheetApp.getUi().alert('Distance Test Results', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Test Failed', error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Show help dialog
 */
function showCalendarHelp() {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-height: 500px; overflow-y: auto;">
      <h2>Calendar Export - Help</h2>
      
      <h3>Quick Start</h3>
      <ol>
        <li>Run <strong>Initialize Configuration</strong></li>
        <li>Enter your Google Maps API key when prompted</li>
        <li>Add destination addresses in Config sheet</li>
        <li>Run <strong>Save Configuration</strong></li>
        <li>Run <strong>Export Events</strong></li>
      </ol>
      
      <h3>Features</h3>
      <ul>
        <li>Export events from all accessible calendars</li>
        <li>Calculate travel distances and times</li>
        <li>Comprehensive date analytics</li>
        <li>Automatic hyperlinks for locations</li>
        <li>Checkpoint/resume for large exports</li>
      </ul>
      
      <h3>Configuration Options</h3>
      <dl>
        <dt><strong>MONTHS_BACK</strong></dt>
        <dd>How many months of history to export</dd>
        
        <dt><strong>LOCATION_1/2/3</strong></dt>
        <dd>Destination addresses for distance calculations</dd>
        
        <dt><strong>TRAVEL_MODE</strong></dt>
        <dd>driving, walking, transit, or bicycling</dd>
        
        <dt><strong>EXCLUDE_CALENDARS</strong></dt>
        <dd>Comma-separated calendar names to skip</dd>
      </dl>
      
      <h3>Google Maps API</h3>
      <ul>
        <li>Get API key at: <a href="https://console.cloud.google.com" target="_blank">Google Cloud Console</a></li>
        <li>Enable "Distance Matrix API"</li>
        <li>Free tier: 40,000 elements/month</li>
        <li>Element = origin × destination</li>
      </ul>
      
      <h3>Troubleshooting</h3>
      <ul>
        <li>Verify API key has Distance Matrix API enabled</li>
        <li>Check addresses are valid and complete</li>
        <li>Set LOG_LEVEL to DEBUG for details</li>
        <li>Use Test Distance Calculation to verify setup</li>
      </ul>
      
      <p style="margin-top: 20px; color: #666;">
        Version 2.0.0 | No personal data hardcoded
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Calendar Export Help');
}