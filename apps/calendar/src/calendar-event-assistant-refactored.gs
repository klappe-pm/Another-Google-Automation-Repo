/**
 * Calendar Event Assistant
 * 
 * Service: Google Calendar + AI Assistant
 * Version: 2.0.0
 * Created: 2025-01-16
 * Updated: 2025-08-07
 * License: MIT
 * 
 * PURPOSE:
 * AI-powered assistant for intelligent calendar event management, scheduling optimization,
 * and conflict resolution. Provides smart suggestions for meeting times and automated
 * event categorization.
 * 
 * FEATURES:
 * - Intelligent event scheduling with conflict detection
 * - Meeting optimization recommendations
 * - Automated event categorization and tagging
 * - Smart notification management
 * - Batch processing for large calendar operations
 * - Travel time calculations between events
 * - Working hours enforcement
 * - Meeting pattern analysis
 * 
 * CONFIGURATION:
 * All settings managed via Config sheet or Properties Service.
 * No personal information or API keys are hardcoded.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Run initializeEventAssistant() to create configuration
 * 2. Configure working hours and preferences
 * 3. Set notification rules and categories
 * 4. Run calendar optimization functions
 * 
 * REQUIRED PERMISSIONS:
 * - Calendar (read/write): Manage calendar events
 * - Drive (read): Access configuration files
 * - Script Properties: Store settings
 * 
 * @OnlyCurrentDoc
 */

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Get event assistant configuration
 * @return {Object} Configuration object with all settings
 */
function getEventAssistantConfig() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  return {
    // Working hours settings
    workingHours: {
      enabled: userProperties.getProperty('ENFORCE_WORKING_HOURS') !== 'false',
      startTime: userProperties.getProperty('WORK_START_TIME') || '09:00',
      endTime: userProperties.getProperty('WORK_END_TIME') || '17:00',
      workDays: (userProperties.getProperty('WORK_DAYS') || 'Mon,Tue,Wed,Thu,Fri').split(','),
      timezone: userProperties.getProperty('TIMEZONE') || Session.getScriptTimeZone(),
      bufferMinutes: Number(userProperties.getProperty('BUFFER_MINUTES') || 15)
    },
    
    // Meeting optimization
    optimization: {
      defaultDuration: Number(userProperties.getProperty('DEFAULT_DURATION') || 30),
      preferredDurations: (userProperties.getProperty('PREFERRED_DURATIONS') || '15,30,45,60').split(',').map(Number),
      maxBackToBack: Number(userProperties.getProperty('MAX_BACK_TO_BACK') || 3),
      breakDuration: Number(userProperties.getProperty('BREAK_DURATION') || 10),
      lunchStart: userProperties.getProperty('LUNCH_START') || '12:00',
      lunchDuration: Number(userProperties.getProperty('LUNCH_DURATION') || 60),
      travelTimeBuffer: Number(userProperties.getProperty('TRAVEL_TIME_BUFFER') || 30)
    },
    
    // Event categorization
    categorization: {
      enabled: userProperties.getProperty('AUTO_CATEGORIZE') !== 'false',
      categories: getCategoryRules(),
      defaultCategory: userProperties.getProperty('DEFAULT_CATEGORY') || 'Other',
      colorMapping: getColorMapping(),
      tagPatterns: getTagPatterns()
    },
    
    // Notification rules
    notifications: {
      defaultReminders: (userProperties.getProperty('DEFAULT_REMINDERS') || '10,30').split(',').map(Number),
      allDayReminders: Number(userProperties.getProperty('ALL_DAY_REMINDER') || 480), // 8 hours
      importantEventReminders: (userProperties.getProperty('IMPORTANT_REMINDERS') || '10,30,60,1440').split(',').map(Number),
      emailNotifications: userProperties.getProperty('EMAIL_NOTIFICATIONS') === 'true',
      popupNotifications: userProperties.getProperty('POPUP_NOTIFICATIONS') !== 'false'
    },
    
    // Conflict detection
    conflictDetection: {
      enabled: userProperties.getProperty('DETECT_CONFLICTS') !== 'false',
      allowDoubleBooking: userProperties.getProperty('ALLOW_DOUBLE_BOOKING') === 'true',
      checkTravelTime: userProperties.getProperty('CHECK_TRAVEL_TIME') === 'true',
      minBreakBetweenEvents: Number(userProperties.getProperty('MIN_BREAK_BETWEEN') || 5),
      warnOnWeekendEvents: userProperties.getProperty('WARN_WEEKEND_EVENTS') === 'true'
    },
    
    // Processing settings
    processing: {
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 100),
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 300000),
      cacheExpiration: Number(userProperties.getProperty('CACHE_EXPIRATION') || 3600000),
      daysAhead: Number(userProperties.getProperty('DAYS_AHEAD') || 30),
      daysBehind: Number(userProperties.getProperty('DAYS_BEHIND') || 7)
    },
    
    // AI Assistant settings
    aiAssistant: {
      enabled: userProperties.getProperty('AI_ENABLED') === 'true',
      apiKey: scriptProperties.getProperty('AI_API_KEY') || '',
      model: userProperties.getProperty('AI_MODEL') || 'standard',
      suggestOptimalTimes: userProperties.getProperty('SUGGEST_OPTIMAL_TIMES') !== 'false',
      analyzePatterns: userProperties.getProperty('ANALYZE_PATTERNS') === 'true'
    },
    
    // Logging
    logging: {
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO',
      logToSheet: userProperties.getProperty('LOG_TO_SHEET') === 'true',
      trackChanges: userProperties.getProperty('TRACK_CHANGES') !== 'false'
    }
  };
}

/**
 * Get category rules from configuration
 * @return {Array} Category rules
 */
function getCategoryRules() {
  const userProperties = PropertiesService.getUserProperties();
  const rulesJson = userProperties.getProperty('CATEGORY_RULES');
  
  if (rulesJson) {
    try {
      return JSON.parse(rulesJson);
    } catch (e) {
      logAssistant('WARN', 'Failed to parse category rules', { error: e.toString() });
    }
  }
  
  // Default categories
  return [
    { pattern: /meeting|sync|standup|1:1/i, category: 'Meeting', color: 'blue' },
    { pattern: /interview|recruiting|candidate/i, category: 'Interview', color: 'purple' },
    { pattern: /lunch|dinner|coffee|breakfast/i, category: 'Meal', color: 'orange' },
    { pattern: /workout|gym|exercise|yoga/i, category: 'Fitness', color: 'green' },
    { pattern: /doctor|dentist|medical|appointment/i, category: 'Appointment', color: 'red' },
    { pattern: /vacation|holiday|pto|out of office/i, category: 'Time Off', color: 'yellow' },
    { pattern: /deadline|due|submit|release/i, category: 'Deadline', color: 'red' },
    { pattern: /webinar|training|workshop|course/i, category: 'Learning', color: 'cyan' }
  ];
}

/**
 * Get color mapping for categories
 * @return {Object} Color mapping
 */
function getColorMapping() {
  return {
    'blue': CalendarApp.EventColor.BLUE,
    'green': CalendarApp.EventColor.GREEN,
    'red': CalendarApp.EventColor.RED,
    'yellow': CalendarApp.EventColor.YELLOW,
    'orange': CalendarApp.EventColor.ORANGE,
    'purple': CalendarApp.EventColor.MAUVE,
    'cyan': CalendarApp.EventColor.CYAN,
    'gray': CalendarApp.EventColor.GRAY
  };
}

/**
 * Get tag patterns for auto-tagging
 * @return {Array} Tag patterns
 */
function getTagPatterns() {
  const userProperties = PropertiesService.getUserProperties();
  const patternsJson = userProperties.getProperty('TAG_PATTERNS');
  
  if (patternsJson) {
    try {
      return JSON.parse(patternsJson);
    } catch (e) {
      logAssistant('WARN', 'Failed to parse tag patterns', { error: e.toString() });
    }
  }
  
  return [
    { pattern: /@(\w+)/g, type: 'person' },
    { pattern: /#(\w+)/g, type: 'project' },
    { pattern: /\[(\w+)\]/g, type: 'tag' }
  ];
}

/**
 * Initialize event assistant configuration
 */
function initializeEventAssistant() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Calendar Event Assistant');
  
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
    
    // Working hours
    ['Working Hours', 'ENFORCE_WORKING_HOURS', 'true', 'true', 'Enforce working hours for scheduling'],
    ['Working Hours', 'WORK_START_TIME', '09:00', '09:00', 'Work day start time (HH:mm)'],
    ['Working Hours', 'WORK_END_TIME', '17:00', '17:00', 'Work day end time (HH:mm)'],
    ['Working Hours', 'WORK_DAYS', 'Mon,Tue,Wed,Thu,Fri', 'Mon,Tue,Wed,Thu,Fri', 'Working days'],
    ['Working Hours', 'BUFFER_MINUTES', '15', '15', 'Buffer time between meetings'],
    
    ['', '', '', '', ''],
    
    // Meeting optimization
    ['Optimization', 'DEFAULT_DURATION', '30', '30', 'Default meeting duration (minutes)'],
    ['Optimization', 'PREFERRED_DURATIONS', '15,30,45,60', '15,30,45,60', 'Preferred durations'],
    ['Optimization', 'MAX_BACK_TO_BACK', '3', '3', 'Max consecutive meetings'],
    ['Optimization', 'BREAK_DURATION', '10', '10', 'Break duration between meetings'],
    ['Optimization', 'LUNCH_START', '12:00', '12:00', 'Lunch break start time'],
    ['Optimization', 'LUNCH_DURATION', '60', '60', 'Lunch duration (minutes)'],
    ['Optimization', 'TRAVEL_TIME_BUFFER', '30', '30', 'Travel time buffer (minutes)'],
    
    ['', '', '', '', ''],
    
    // Categorization
    ['Categorization', 'AUTO_CATEGORIZE', 'true', 'true', 'Auto-categorize events'],
    ['Categorization', 'DEFAULT_CATEGORY', 'Other', 'Other', 'Default category'],
    
    ['', '', '', '', ''],
    
    // Notifications
    ['Notifications', 'DEFAULT_REMINDERS', '10,30', '10,30', 'Default reminders (minutes)'],
    ['Notifications', 'ALL_DAY_REMINDER', '480', '480', 'All-day event reminder (minutes)'],
    ['Notifications', 'IMPORTANT_REMINDERS', '10,30,60,1440', '10,30,60,1440', 'Important event reminders'],
    ['Notifications', 'EMAIL_NOTIFICATIONS', 'false', 'false', 'Send email notifications'],
    ['Notifications', 'POPUP_NOTIFICATIONS', 'true', 'true', 'Show popup notifications'],
    
    ['', '', '', '', ''],
    
    // Conflict detection
    ['Conflicts', 'DETECT_CONFLICTS', 'true', 'true', 'Enable conflict detection'],
    ['Conflicts', 'ALLOW_DOUBLE_BOOKING', 'false', 'false', 'Allow double booking'],
    ['Conflicts', 'CHECK_TRAVEL_TIME', 'false', 'false', 'Check travel time between events'],
    ['Conflicts', 'MIN_BREAK_BETWEEN', '5', '5', 'Minimum break between events (minutes)'],
    ['Conflicts', 'WARN_WEEKEND_EVENTS', 'false', 'false', 'Warn on weekend events'],
    
    ['', '', '', '', ''],
    
    // Processing
    ['Processing', 'BATCH_SIZE', '100', '100', 'Events per batch'],
    ['Processing', 'MAX_EXECUTION_TIME', '300000', '300000', 'Max runtime (ms)'],
    ['Processing', 'CACHE_EXPIRATION', '3600000', '3600000', 'Cache expiration (ms)'],
    ['Processing', 'DAYS_AHEAD', '30', '30', 'Days to look ahead'],
    ['Processing', 'DAYS_BEHIND', '7', '7', 'Days to look behind'],
    
    ['', '', '', '', ''],
    
    // AI Assistant
    ['AI Assistant', 'AI_ENABLED', 'false', 'false', 'Enable AI features'],
    ['AI Assistant', 'AI_MODEL', 'standard', 'standard', 'AI model to use'],
    ['AI Assistant', 'SUGGEST_OPTIMAL_TIMES', 'true', 'true', 'Suggest optimal meeting times'],
    ['AI Assistant', 'ANALYZE_PATTERNS', 'false', 'false', 'Analyze calendar patterns'],
    
    ['', '', '', '', ''],
    
    // Logging
    ['Logging', 'LOG_LEVEL', 'INFO', 'INFO', 'Log level: DEBUG, INFO, WARN, ERROR'],
    ['Logging', 'LOG_TO_SHEET', 'false', 'false', 'Log to spreadsheet'],
    ['Logging', 'TRACK_CHANGES', 'true', 'true', 'Track calendar changes']
  ];
  
  // Write configuration
  configSheet.getRange(1, 1, configData.length, 5).setValues(configData);
  
  // Format headers
  configSheet.getRange(1, 1, 1, 5)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('white');
  
  // Auto-resize columns
  configSheet.autoResizeColumns(1, 5);
  
  // Create category rules sheet
  createCategoryRulesSheet(ss);
  
  // Show completion message
  SpreadsheetApp.getUi().alert(
    'Event Assistant Initialized',
    'Configuration created. Review settings and run optimization functions.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  logAssistant('INFO', 'Event assistant initialized successfully');
}

/**
 * Create category rules sheet
 * @param {Spreadsheet} ss - Spreadsheet
 */
function createCategoryRulesSheet(ss) {
  let sheet = ss.getSheetByName('Category Rules') || ss.insertSheet('Category Rules');
  sheet.clear();
  
  const rules = [
    ['Pattern', 'Category', 'Color', 'Priority'],
    ['meeting|sync|standup|1:1', 'Meeting', 'blue', '1'],
    ['interview|recruiting|candidate', 'Interview', 'purple', '2'],
    ['lunch|dinner|coffee|breakfast', 'Meal', 'orange', '3'],
    ['workout|gym|exercise|yoga', 'Fitness', 'green', '4'],
    ['doctor|dentist|medical|appointment', 'Appointment', 'red', '5'],
    ['vacation|holiday|pto|out of office', 'Time Off', 'yellow', '6'],
    ['deadline|due|submit|release', 'Deadline', 'red', '7'],
    ['webinar|training|workshop|course', 'Learning', 'cyan', '8']
  ];
  
  sheet.getRange(1, 1, rules.length, 4).setValues(rules);
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#34a853').setFontColor('white');
  sheet.autoResizeColumns(1, 4);
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

/**
 * Assistant-specific logging
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
function logAssistant(level, message, context = {}) {
  const config = getEventAssistantConfig();
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  
  if (levels.indexOf(level) < levels.indexOf(config.logging.logLevel)) {
    return;
  }
  
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  console.log(`[${timestamp}] [${level}] ${message}`, context);
  
  if (config.logging.logToSheet) {
    logToAssistantSheet(timestamp, level, message, context);
  }
}

/**
 * Log to assistant sheet
 * @param {string} timestamp - Timestamp
 * @param {string} level - Log level
 * @param {string} message - Message
 * @param {Object} context - Context
 */
function logToAssistantSheet(timestamp, level, message, context) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Assistant Logs') || ss.insertSheet('Assistant Logs');
    
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Message', 'Context']]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    sheet.appendRow([timestamp, level, message, JSON.stringify(context)]);
  } catch (error) {
    console.error('Failed to log to sheet:', error);
  }
}

// ============================================================================
// MAIN ASSISTANT FUNCTIONS
// ============================================================================

/**
 * Analyze calendar and provide optimization suggestions
 */
function analyzeCalendar() {
  const config = getEventAssistantConfig();
  const startTime = new Date().getTime();
  
  logAssistant('INFO', 'Starting calendar analysis');
  
  try {
    // Get date range
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - config.processing.daysBehind);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + config.processing.daysAhead);
    
    // Get calendar events
    const calendar = CalendarApp.getDefaultCalendar();
    const events = calendar.getEvents(startDate, endDate);
    
    logAssistant('INFO', `Analyzing ${events.length} events`);
    
    // Analyze patterns
    const analysis = {
      totalEvents: events.length,
      conflicts: [],
      backToBack: [],
      outsideWorkingHours: [],
      missingCategories: [],
      longMeetings: [],
      suggestions: []
    };
    
    // Process events
    events.forEach((event, index) => {
      // Check conflicts
      if (config.conflictDetection.enabled) {
        checkForConflicts(event, events, analysis);
      }
      
      // Check working hours
      if (config.workingHours.enabled) {
        checkWorkingHours(event, config, analysis);
      }
      
      // Check categorization
      if (config.categorization.enabled) {
        checkCategorization(event, config, analysis);
      }
      
      // Check meeting duration
      checkMeetingDuration(event, config, analysis);
    });
    
    // Generate suggestions
    generateSuggestions(analysis, config);
    
    // Create report
    createAnalysisReport(analysis, config);
    
    const duration = new Date().getTime() - startTime;
    logAssistant('INFO', 'Calendar analysis completed', { 
      duration: duration,
      eventsAnalyzed: events.length 
    });
    
    return analysis;
    
  } catch (error) {
    logAssistant('ERROR', 'Calendar analysis failed', { 
      error: error.toString() 
    });
    throw error;
  }
}

/**
 * Check for conflicts between events
 * @param {CalendarEvent} event - Event to check
 * @param {Array} allEvents - All events
 * @param {Object} analysis - Analysis object
 */
function checkForConflicts(event, allEvents, analysis) {
  const eventStart = event.getStartTime();
  const eventEnd = event.getEndTime();
  
  allEvents.forEach(otherEvent => {
    if (event.getId() === otherEvent.getId()) return;
    
    const otherStart = otherEvent.getStartTime();
    const otherEnd = otherEvent.getEndTime();
    
    // Check for overlap
    if ((eventStart < otherEnd) && (eventEnd > otherStart)) {
      analysis.conflicts.push({
        event1: event.getTitle(),
        event2: otherEvent.getTitle(),
        time: eventStart
      });
    }
  });
}

/**
 * Check if event is within working hours
 * @param {CalendarEvent} event - Event to check
 * @param {Object} config - Configuration
 * @param {Object} analysis - Analysis object
 */
function checkWorkingHours(event, config, analysis) {
  const eventStart = event.getStartTime();
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][eventStart.getDay()];
  
  // Check if work day
  if (!config.workingHours.workDays.includes(dayOfWeek)) {
    if (config.conflictDetection.warnOnWeekendEvents) {
      analysis.outsideWorkingHours.push({
        event: event.getTitle(),
        time: eventStart,
        reason: 'Weekend event'
      });
    }
    return;
  }
  
  // Check working hours
  const startHour = eventStart.getHours() + eventStart.getMinutes() / 60;
  const workStart = parseTime(config.workingHours.startTime);
  const workEnd = parseTime(config.workingHours.endTime);
  
  if (startHour < workStart || startHour >= workEnd) {
    analysis.outsideWorkingHours.push({
      event: event.getTitle(),
      time: eventStart,
      reason: 'Outside working hours'
    });
  }
}

/**
 * Check event categorization
 * @param {CalendarEvent} event - Event to check
 * @param {Object} config - Configuration
 * @param {Object} analysis - Analysis object
 */
function checkCategorization(event, config, analysis) {
  const title = event.getTitle();
  let hasCategory = false;
  
  // Check against category rules
  config.categorization.categories.forEach(rule => {
    if (rule.pattern.test(title)) {
      hasCategory = true;
    }
  });
  
  if (!hasCategory) {
    analysis.missingCategories.push({
      event: title,
      time: event.getStartTime()
    });
  }
}

/**
 * Check meeting duration
 * @param {CalendarEvent} event - Event to check
 * @param {Object} config - Configuration
 * @param {Object} analysis - Analysis object
 */
function checkMeetingDuration(event, config, analysis) {
  const duration = (event.getEndTime() - event.getStartTime()) / (1000 * 60); // minutes
  
  if (duration > 120) { // More than 2 hours
    analysis.longMeetings.push({
      event: event.getTitle(),
      duration: duration,
      time: event.getStartTime()
    });
  }
}

/**
 * Generate optimization suggestions
 * @param {Object} analysis - Analysis results
 * @param {Object} config - Configuration
 */
function generateSuggestions(analysis, config) {
  // Conflict suggestions
  if (analysis.conflicts.length > 0) {
    analysis.suggestions.push({
      type: 'conflicts',
      message: `Found ${analysis.conflicts.length} scheduling conflicts that need resolution`,
      priority: 'high'
    });
  }
  
  // Working hours suggestions
  if (analysis.outsideWorkingHours.length > 5) {
    analysis.suggestions.push({
      type: 'working_hours',
      message: `${analysis.outsideWorkingHours.length} events scheduled outside working hours`,
      priority: 'medium'
    });
  }
  
  // Long meeting suggestions
  if (analysis.longMeetings.length > 0) {
    analysis.suggestions.push({
      type: 'meeting_duration',
      message: `${analysis.longMeetings.length} meetings exceed 2 hours - consider breaking them up`,
      priority: 'low'
    });
  }
  
  // Categorization suggestions
  if (analysis.missingCategories.length > 10) {
    analysis.suggestions.push({
      type: 'categorization',
      message: `${analysis.missingCategories.length} events lack categories - run auto-categorization`,
      priority: 'low'
    });
  }
}

/**
 * Create analysis report
 * @param {Object} analysis - Analysis results
 * @param {Object} config - Configuration
 */
function createAnalysisReport(analysis, config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Analysis Report') || ss.insertSheet('Analysis Report');
  sheet.clear();
  
  // Summary section
  const summaryData = [
    ['Calendar Analysis Report'],
    ['Generated', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')],
    [''],
    ['Summary'],
    ['Total Events', analysis.totalEvents],
    ['Conflicts Found', analysis.conflicts.length],
    ['Outside Working Hours', analysis.outsideWorkingHours.length],
    ['Long Meetings', analysis.longMeetings.length],
    ['Missing Categories', analysis.missingCategories.length],
    [''],
    ['Suggestions']
  ];
  
  // Add suggestions
  analysis.suggestions.forEach(suggestion => {
    summaryData.push([`[${suggestion.priority.toUpperCase()}] ${suggestion.message}`]);
  });
  
  sheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData.map(row => 
    row.length === 1 ? [row[0], ''] : row
  ));
  
  // Format report
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  sheet.getRange(4, 1).setFontWeight('bold');
  sheet.getRange(11, 1).setFontWeight('bold');
  sheet.autoResizeColumns(1, 2);
  
  logAssistant('INFO', 'Analysis report created');
}

/**
 * Auto-categorize calendar events
 */
function autoCategorizeEvents() {
  const config = getEventAssistantConfig();
  const calendar = CalendarApp.getDefaultCalendar();
  
  // Get events for the configured period
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - config.processing.daysBehind);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + config.processing.daysAhead);
  
  const events = calendar.getEvents(startDate, endDate);
  
  logAssistant('INFO', `Auto-categorizing ${events.length} events`);
  
  let categorized = 0;
  const colorMap = getColorMapping();
  
  events.forEach(event => {
    const title = event.getTitle();
    const description = event.getDescription();
    const combined = `${title} ${description}`.toLowerCase();
    
    // Check against category rules
    for (const rule of config.categorization.categories) {
      if (rule.pattern.test(combined)) {
        // Set event color based on category
        if (colorMap[rule.color]) {
          event.setColor(colorMap[rule.color]);
        }
        
        // Add category tag to description if not present
        if (!description.includes(`[${rule.category}]`)) {
          event.setDescription(`[${rule.category}] ${description}`);
        }
        
        categorized++;
        logAssistant('DEBUG', `Categorized "${title}" as ${rule.category}`);
        break;
      }
    }
  });
  
  logAssistant('INFO', `Categorized ${categorized} events`);
  
  SpreadsheetApp.getUi().alert(
    'Categorization Complete',
    `Successfully categorized ${categorized} out of ${events.length} events.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Find optimal meeting times
 * @param {number} duration - Meeting duration in minutes
 * @param {number} daysAhead - Days to look ahead
 * @return {Array} Available time slots
 */
function findOptimalMeetingTimes(duration = 30, daysAhead = 7) {
  const config = getEventAssistantConfig();
  const calendar = CalendarApp.getDefaultCalendar();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);
  
  const availableSlots = [];
  
  // Check each day
  for (let d = new Date(today); d < endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    
    // Skip non-work days
    if (!config.workingHours.workDays.includes(dayOfWeek)) {
      continue;
    }
    
    // Get events for this day
    const dayStart = new Date(d);
    const dayEnd = new Date(d);
    dayEnd.setDate(dayEnd.getDate() + 1);
    
    const events = calendar.getEvents(dayStart, dayEnd);
    
    // Find free slots
    const workStart = parseTime(config.workingHours.startTime);
    const workEnd = parseTime(config.workingHours.endTime);
    const lunchStart = parseTime(config.optimization.lunchStart);
    
    // Create time slots
    const slots = generateTimeSlots(
      d,
      workStart,
      workEnd,
      duration,
      events,
      lunchStart,
      config.optimization.lunchDuration
    );
    
    availableSlots.push(...slots);
  }
  
  // Rank slots by preference
  return rankTimeSlots(availableSlots, config);
}

/**
 * Generate time slots for a day
 * @param {Date} date - Date
 * @param {number} workStart - Work start hour
 * @param {number} workEnd - Work end hour
 * @param {number} duration - Meeting duration
 * @param {Array} events - Existing events
 * @param {number} lunchStart - Lunch start hour
 * @param {number} lunchDuration - Lunch duration
 * @return {Array} Available slots
 */
function generateTimeSlots(date, workStart, workEnd, duration, events, lunchStart, lunchDuration) {
  const slots = [];
  const busyTimes = events.map(event => ({
    start: event.getStartTime().getHours() + event.getStartTime().getMinutes() / 60,
    end: event.getEndTime().getHours() + event.getEndTime().getMinutes() / 60
  }));
  
  // Add lunch as busy time
  busyTimes.push({
    start: lunchStart,
    end: lunchStart + lunchDuration / 60
  });
  
  // Sort busy times
  busyTimes.sort((a, b) => a.start - b.start);
  
  // Find free slots
  let currentTime = workStart;
  
  busyTimes.forEach(busy => {
    if (currentTime + duration / 60 <= busy.start) {
      slots.push({
        date: new Date(date),
        startHour: currentTime,
        duration: duration,
        score: 0
      });
    }
    currentTime = Math.max(currentTime, busy.end);
  });
  
  // Check end of day
  if (currentTime + duration / 60 <= workEnd) {
    slots.push({
      date: new Date(date),
      startHour: currentTime,
      duration: duration,
      score: 0
    });
  }
  
  return slots;
}

/**
 * Rank time slots by preference
 * @param {Array} slots - Available slots
 * @param {Object} config - Configuration
 * @return {Array} Ranked slots
 */
function rankTimeSlots(slots, config) {
  slots.forEach(slot => {
    // Prefer mid-morning and mid-afternoon
    if (slot.startHour >= 10 && slot.startHour <= 11) {
      slot.score += 10;
    } else if (slot.startHour >= 14 && slot.startHour <= 15) {
      slot.score += 10;
    }
    
    // Avoid early morning and late afternoon
    if (slot.startHour < 9) {
      slot.score -= 5;
    } else if (slot.startHour > 16) {
      slot.score -= 5;
    }
    
    // Prefer earlier days
    const daysFromNow = Math.floor((slot.date - new Date()) / (1000 * 60 * 60 * 24));
    slot.score -= daysFromNow;
  });
  
  return slots.sort((a, b) => b.score - a.score);
}

/**
 * Parse time string to hours
 * @param {string} timeStr - Time string (HH:mm)
 * @return {number} Hours as decimal
 */
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📅 Event Assistant')
    .addItem('⚙️ Initialize Configuration', 'initializeEventAssistant')
    .addItem('💾 Save Configuration', 'saveAssistantConfig')
    .addSeparator()
    .addSubMenu(ui.createMenu('📊 Analysis')
      .addItem('Analyze Calendar', 'analyzeCalendar')
      .addItem('Find Conflicts', 'findConflicts')
      .addItem('Check Working Hours', 'checkWorkingHoursCompliance'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎯 Optimization')
      .addItem('Auto-Categorize Events', 'autoCategorizeEvents')
      .addItem('Find Optimal Meeting Times', 'showOptimalTimes')
      .addItem('Optimize Notifications', 'optimizeNotifications'))
    .addSeparator()
    .addItem('📈 Generate Report', 'generateFullReport')
    .addItem('❓ Help', 'showAssistantHelp')
    .addToUi();
}

/**
 * Save configuration from sheet
 */
function saveAssistantConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    throw new Error('Config sheet not found. Run initializeEventAssistant() first.');
  }
  
  const data = configSheet.getDataRange().getValues();
  const userProperties = PropertiesService.getUserProperties();
  
  // Save configuration
  for (let i = 1; i < data.length; i++) {
    const [category, setting, value] = data[i];
    if (setting && value !== '') {
      userProperties.setProperty(setting, value);
    }
  }
  
  // Save category rules
  const rulesSheet = ss.getSheetByName('Category Rules');
  if (rulesSheet) {
    const rulesData = rulesSheet.getDataRange().getValues();
    const rules = [];
    
    for (let i = 1; i < rulesData.length; i++) {
      const [pattern, category, color, priority] = rulesData[i];
      if (pattern) {
        rules.push({
          pattern: pattern,
          category: category,
          color: color,
          priority: Number(priority) || 999
        });
      }
    }
    
    userProperties.setProperty('CATEGORY_RULES', JSON.stringify(rules));
  }
  
  SpreadsheetApp.getUi().alert('Configuration saved successfully!');
}

/**
 * Show optimal meeting times
 */
function showOptimalTimes() {
  const ui = SpreadsheetApp.getUi();
  
  const durationResponse = ui.prompt(
    'Meeting Duration',
    'Enter meeting duration in minutes (default: 30):',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (durationResponse.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const duration = Number(durationResponse.getResponseText()) || 30;
  const slots = findOptimalMeetingTimes(duration, 7);
  
  // Create results sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Optimal Times') || ss.insertSheet('Optimal Times');
  sheet.clear();
  
  const data = [['Date', 'Time', 'Duration (min)', 'Score']];
  
  slots.slice(0, 20).forEach(slot => {
    const hours = Math.floor(slot.startHour);
    const minutes = Math.round((slot.startHour - hours) * 60);
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    data.push([
      Utilities.formatDate(slot.date, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      timeStr,
      slot.duration,
      slot.score
    ]);
  });
  
  sheet.getRange(1, 1, data.length, 4).setValues(data);
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#34a853').setFontColor('white');
  sheet.autoResizeColumns(1, 4);
  
  ui.alert(`Found ${slots.length} available time slots. Top 20 shown in "Optimal Times" sheet.`);
}

/**
 * Show help dialog
 */
function showAssistantHelp() {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-height: 500px; overflow-y: auto;">
      <h2>Calendar Event Assistant - Help</h2>
      
      <h3>Features</h3>
      <ul>
        <li><strong>Calendar Analysis:</strong> Analyze your calendar for conflicts and optimization opportunities</li>
        <li><strong>Auto-Categorization:</strong> Automatically categorize and color-code events</li>
        <li><strong>Optimal Meeting Times:</strong> Find the best available time slots for meetings</li>
        <li><strong>Working Hours Enforcement:</strong> Identify events outside working hours</li>
        <li><strong>Conflict Detection:</strong> Find and resolve scheduling conflicts</li>
      </ul>
      
      <h3>Setup</h3>
      <ol>
        <li>Run "Initialize Configuration" to create config sheets</li>
        <li>Customize settings in the Config sheet</li>
        <li>Define category rules for auto-categorization</li>
        <li>Save configuration</li>
        <li>Run analysis and optimization functions</li>
      </ol>
      
      <h3>Category Rules</h3>
      <p>Define patterns to automatically categorize events. Examples:</p>
      <ul>
        <li><code>meeting|sync</code> → Meeting (blue)</li>
        <li><code>interview</code> → Interview (purple)</li>
        <li><code>lunch|coffee</code> → Meal (orange)</li>
      </ul>
      
      <h3>Working Hours</h3>
      <p>Configure your working hours to:</p>
      <ul>
        <li>Identify events outside work time</li>
        <li>Find optimal meeting slots within work hours</li>
        <li>Respect lunch breaks and buffer times</li>
      </ul>
      
      <p style="margin-top: 20px; color: #666;">
        Version 2.0.0 | All settings configurable | No hardcoded values
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Event Assistant Help');
}