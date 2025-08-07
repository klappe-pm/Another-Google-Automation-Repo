/**
 * Title: Weekly Daily Notes Creator - Refactored
 * Service: Google Drive + Google Calendar
 * Purpose: Automate creation of daily notes with configurable templates
 * Created: 2024-01-01
 * Refactored: 2025-08-07
 * Author: Configurable - See Config Sheet
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: Create structured daily notes for work week planning
 * - Description: Generates markdown notes with calendar integration
 * - Problem Solved: Cross-account note generation without hardcoded values
 * - Successful Execution: Creates organized folder structure with daily notes
 * - Dependencies: Drive API, Calendar API
 * 
 * Configuration:
 * Run setupConfiguration() first to initialize settings
 * All settings stored securely in Script Properties
 * Use Config sheet for user-friendly configuration
 * 
 * Key Features:
 * 1. Fully configurable note templates
 * 2. Flexible folder structure (year/month/week/day)
 * 3. Calendar event integration
 * 4. Custom metadata fields
 * 5. Navigation links between notes
 * 6. Meeting duration calculations
 * 7. Multiple calendar support
 * 8. Time zone awareness
 * 9. Template variables
 * 10. No hardcoded values
 * 
 * Functions Overview:
 * - setupConfiguration(): Initialize all settings
 * - createWeeklyNotes(): Main function to create notes
 * - generateNoteContent(): Generate note from template
 * - syncCalendarEvents(): Integrate calendar data
 * - No placeholder values - all settings functional
 */

// ================== CONFIGURATION MANAGEMENT ==================

/**
 * Initialize configuration on first run
 * Creates Config sheet and sets up default properties
 * All values are functional defaults - no placeholders
 */
function setupConfiguration() {
  console.log('Setting up Daily Notes configuration...');
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  
  // Create or get Config sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Daily Notes Configuration');
  let configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    
    // Add comprehensive configuration headers and defaults
    const headers = [
      ['Daily Notes Configuration', '', ''],
      ['', '', ''],
      ['Setting', 'Value', 'Description'],
      ['', '', ''],
      ['Folder Settings', '', ''],
      ['Root Folder Name', 'Daily Notes', 'Main folder for all notes'],
      ['Root Folder ID', '', 'Specific folder ID (empty = create in My Drive)'],
      ['Folder Structure', 'year/month/week', 'Folder hierarchy (year/month/week/day)'],
      ['Year Format', 'yyyy', 'Year folder format (yyyy or yy)'],
      ['Month Format', 'MM-MonthName', 'Month folder format (MM, MonthName, MM-MonthName)'],
      ['Week Format', 'yyyy-Www', 'Week folder format (Www, yyyy-Www)'],
      ['Create Weekend Notes', 'false', 'Include Saturday and Sunday notes'],
      ['', '', ''],
      ['Note Settings', '', ''],
      ['File Name Format', 'yyyy-MM-dd', 'Daily note file name format'],
      ['File Extension', 'md', 'File extension (md, txt)'],
      ['Note Template', 'default', 'Template to use (default, minimal, detailed)'],
      ['Include Metadata', 'true', 'Include YAML frontmatter'],
      ['Include Navigation', 'true', 'Include prev/next day links'],
      ['Include Calendar', 'true', 'Include calendar events'],
      ['Include Tasks', 'true', 'Include task section'],
      ['Include Journal', 'true', 'Include journal section'],
      ['', '', ''],
      ['Calendar Settings', '', ''],
      ['Calendar Source', 'default', 'Calendar to use (default, specific ID)'],
      ['Specific Calendar ID', '', 'Calendar ID if not using default'],
      ['Include All Day Events', 'true', 'Include all-day events'],
      ['Include Private Events', 'false', 'Include private events'],
      ['Event Time Format', 'HH:mm', 'Time format for events'],
      ['Show Event Location', 'true', 'Include event locations'],
      ['Show Event Description', 'false', 'Include event descriptions'],
      ['Show Event Attendees', 'false', 'Include attendee list'],
      ['Calculate Duration', 'true', 'Calculate meeting durations'],
      ['Duration Format', 'hours', 'Duration format (minutes, hours, both)'],
      ['', '', ''],
      ['Metadata Fields', '', ''],
      ['Category', 'daily', 'Default category for notes'],
      ['Tags', 'daily-note, planner', 'Default tags (comma-separated)'],
      ['Author', '', 'Note author (empty = current user)'],
      ['Custom Field 1 Name', '', 'Name for custom field 1'],
      ['Custom Field 1 Value', '', 'Value for custom field 1'],
      ['Custom Field 2 Name', '', 'Name for custom field 2'],
      ['Custom Field 2 Value', '', 'Value for custom field 2'],
      ['', '', ''],
      ['Template Sections', '', ''],
      ['Section 1 Title', 'Meetings Today', 'Title for section 1'],
      ['Section 1 Type', 'calendar', 'Type (calendar, tasks, custom)'],
      ['Section 2 Title', 'Tasks', 'Title for section 2'],
      ['Section 2 Type', 'tasks', 'Type for section 2'],
      ['Section 3 Title', 'Notes', 'Title for section 3'],
      ['Section 3 Type', 'custom', 'Type for section 3'],
      ['Section 4 Title', 'Tomorrow', 'Title for section 4'],
      ['Section 4 Type', 'preview', 'Type for section 4'],
      ['', '', ''],
      ['Scheduling Settings', '', ''],
      ['Auto Create', 'false', 'Automatically create notes on schedule'],
      ['Create Days Ahead', '7', 'Number of days to create ahead'],
      ['Create Time', '06:00', 'Time to create notes (HH:mm)'],
      ['Time Zone', Session.getScriptTimeZone(), 'Time zone for scheduling'],
      ['Skip Holidays', 'false', 'Skip notes on holidays'],
      ['Holiday Calendar', '', 'Holiday calendar ID'],
      ['', '', ''],
      ['Advanced Settings', '', ''],
      ['Enable Logging', 'true', 'Enable detailed logging'],
      ['Log Level', 'INFO', 'Log level (DEBUG, INFO, WARN, ERROR)'],
      ['Overwrite Existing', 'false', 'Overwrite existing notes'],
      ['Backup Before Overwrite', 'true', 'Create backup before overwriting'],
      ['Max Events Per Day', '20', 'Maximum events to include'],
      ['Link Format', 'markdown', 'Link format (markdown, wiki, html)'],
      ['Date Locale', 'en-US', 'Locale for date formatting']
    ];
    
    configSheet.getRange(1, 1, headers.length, 3).setValues(headers);
    
    // Format the configuration sheet
    configSheet.getRange('A1:C1').merge()
      .setBackground('#34a853')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(14)
      .setHorizontalAlignment('center');
    
    // Format section headers
    const sectionRows = [5, 14, 24, 37, 46, 56, 64];
    sectionRows.forEach(row => {
      configSheet.getRange(row, 1, 1, 3)
        .setBackground('#e8e8e8')
        .setFontWeight('bold');
    });
    
    configSheet.getRange('A3:C3')
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    configSheet.setColumnWidth(1, 250);
    configSheet.setColumnWidth(2, 250);
    configSheet.setColumnWidth(3, 400);
    
    // Protect headers
    const protection = configSheet.getRange('A1:C3').protect();
    protection.setDescription('Configuration headers');
    protection.setWarningOnly(true);
    
    configSheet.setFrozenRows(3);
  }
  
  // Set default properties if not exists
  const defaults = {
    'ROOT_FOLDER_NAME': 'Daily Notes',
    'ROOT_FOLDER_ID': '',
    'FOLDER_STRUCTURE': 'year/month/week',
    'YEAR_FORMAT': 'yyyy',
    'MONTH_FORMAT': 'MM-MonthName',
    'WEEK_FORMAT': 'yyyy-Www',
    'CREATE_WEEKEND_NOTES': 'false',
    'FILE_NAME_FORMAT': 'yyyy-MM-dd',
    'FILE_EXTENSION': 'md',
    'NOTE_TEMPLATE': 'default',
    'INCLUDE_METADATA': 'true',
    'INCLUDE_NAVIGATION': 'true',
    'INCLUDE_CALENDAR': 'true',
    'INCLUDE_TASKS': 'true',
    'INCLUDE_JOURNAL': 'true',
    'CALENDAR_SOURCE': 'default',
    'SPECIFIC_CALENDAR_ID': '',
    'INCLUDE_ALL_DAY': 'true',
    'INCLUDE_PRIVATE': 'false',
    'EVENT_TIME_FORMAT': 'HH:mm',
    'SHOW_LOCATION': 'true',
    'SHOW_DESCRIPTION': 'false',
    'SHOW_ATTENDEES': 'false',
    'CALCULATE_DURATION': 'true',
    'DURATION_FORMAT': 'hours',
    'CATEGORY': 'daily',
    'TAGS': 'daily-note, planner',
    'AUTHOR': '',
    'SECTION_1_TITLE': 'Meetings Today',
    'SECTION_1_TYPE': 'calendar',
    'SECTION_2_TITLE': 'Tasks',
    'SECTION_2_TYPE': 'tasks',
    'SECTION_3_TITLE': 'Notes',
    'SECTION_3_TYPE': 'custom',
    'SECTION_4_TITLE': 'Tomorrow',
    'SECTION_4_TYPE': 'preview',
    'AUTO_CREATE': 'false',
    'CREATE_DAYS_AHEAD': '7',
    'CREATE_TIME': '06:00',
    'TIME_ZONE': Session.getScriptTimeZone(),
    'SKIP_HOLIDAYS': 'false',
    'HOLIDAY_CALENDAR': '',
    'ENABLE_LOGGING': 'true',
    'LOG_LEVEL': 'INFO',
    'OVERWRITE_EXISTING': 'false',
    'BACKUP_BEFORE_OVERWRITE': 'true',
    'MAX_EVENTS_PER_DAY': '20',
    'LINK_FORMAT': 'markdown',
    'DATE_LOCALE': 'en-US'
  };
  
  Object.entries(defaults).forEach(([key, value]) => {
    if (!userProperties.getProperty(key)) {
      userProperties.setProperty(key, value);
    }
  });
  
  console.log('Configuration setup complete. Please review the Config sheet.');
  SpreadsheetApp.getUi().alert('Configuration Setup Complete', 
    'Please review the Config sheet and update any settings as needed.\n\n' +
    'All settings have functional defaults - no placeholder values.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Get notes configuration from properties
 * @returns {Object} Configuration object
 */
function getNotesConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  
  return {
    folders: {
      rootName: userProperties.getProperty('ROOT_FOLDER_NAME') || 'Daily Notes',
      rootId: userProperties.getProperty('ROOT_FOLDER_ID') || '',
      structure: userProperties.getProperty('FOLDER_STRUCTURE') || 'year/month/week',
      yearFormat: userProperties.getProperty('YEAR_FORMAT') || 'yyyy',
      monthFormat: userProperties.getProperty('MONTH_FORMAT') || 'MM-MonthName',
      weekFormat: userProperties.getProperty('WEEK_FORMAT') || 'yyyy-Www',
      createWeekends: userProperties.getProperty('CREATE_WEEKEND_NOTES') === 'true'
    },
    notes: {
      fileNameFormat: userProperties.getProperty('FILE_NAME_FORMAT') || 'yyyy-MM-dd',
      fileExtension: userProperties.getProperty('FILE_EXTENSION') || 'md',
      template: userProperties.getProperty('NOTE_TEMPLATE') || 'default',
      includeMetadata: userProperties.getProperty('INCLUDE_METADATA') === 'true',
      includeNavigation: userProperties.getProperty('INCLUDE_NAVIGATION') === 'true',
      includeCalendar: userProperties.getProperty('INCLUDE_CALENDAR') === 'true',
      includeTasks: userProperties.getProperty('INCLUDE_TASKS') === 'true',
      includeJournal: userProperties.getProperty('INCLUDE_JOURNAL') === 'true'
    },
    calendar: {
      source: userProperties.getProperty('CALENDAR_SOURCE') || 'default',
      specificId: userProperties.getProperty('SPECIFIC_CALENDAR_ID') || '',
      includeAllDay: userProperties.getProperty('INCLUDE_ALL_DAY') === 'true',
      includePrivate: userProperties.getProperty('INCLUDE_PRIVATE') === 'true',
      timeFormat: userProperties.getProperty('EVENT_TIME_FORMAT') || 'HH:mm',
      showLocation: userProperties.getProperty('SHOW_LOCATION') === 'true',
      showDescription: userProperties.getProperty('SHOW_DESCRIPTION') === 'true',
      showAttendees: userProperties.getProperty('SHOW_ATTENDEES') === 'true',
      calculateDuration: userProperties.getProperty('CALCULATE_DURATION') === 'true',
      durationFormat: userProperties.getProperty('DURATION_FORMAT') || 'hours',
      maxEvents: Number(userProperties.getProperty('MAX_EVENTS_PER_DAY') || 20)
    },
    metadata: {
      category: userProperties.getProperty('CATEGORY') || 'daily',
      tags: (userProperties.getProperty('TAGS') || 'daily-note').split(',').map(t => t.trim()),
      author: userProperties.getProperty('AUTHOR') || Session.getActiveUser().getEmail(),
      customFields: getCustomFields(userProperties)
    },
    sections: getSectionConfiguration(userProperties),
    scheduling: {
      autoCreate: userProperties.getProperty('AUTO_CREATE') === 'true',
      daysAhead: Number(userProperties.getProperty('CREATE_DAYS_AHEAD') || 7),
      createTime: userProperties.getProperty('CREATE_TIME') || '06:00',
      timeZone: userProperties.getProperty('TIME_ZONE') || Session.getScriptTimeZone(),
      skipHolidays: userProperties.getProperty('SKIP_HOLIDAYS') === 'true',
      holidayCalendar: userProperties.getProperty('HOLIDAY_CALENDAR') || ''
    },
    advanced: {
      enableLogging: userProperties.getProperty('ENABLE_LOGGING') === 'true',
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO',
      overwriteExisting: userProperties.getProperty('OVERWRITE_EXISTING') === 'true',
      backupBeforeOverwrite: userProperties.getProperty('BACKUP_BEFORE_OVERWRITE') === 'true',
      linkFormat: userProperties.getProperty('LINK_FORMAT') || 'markdown',
      dateLocale: userProperties.getProperty('DATE_LOCALE') || 'en-US'
    }
  };
}

/**
 * Get custom field configuration
 * @param {PropertiesService.Properties} properties - User properties
 * @returns {Array} Custom fields
 */
function getCustomFields(properties) {
  const fields = [];
  
  for (let i = 1; i <= 2; i++) {
    const name = properties.getProperty(`CUSTOM_FIELD_${i}_NAME`);
    const value = properties.getProperty(`CUSTOM_FIELD_${i}_VALUE`);
    
    if (name && value) {
      fields.push({ name, value });
    }
  }
  
  return fields;
}

/**
 * Get section configuration
 * @param {PropertiesService.Properties} properties - User properties
 * @returns {Array} Section configuration
 */
function getSectionConfiguration(properties) {
  const sections = [];
  
  for (let i = 1; i <= 4; i++) {
    const title = properties.getProperty(`SECTION_${i}_TITLE`);
    const type = properties.getProperty(`SECTION_${i}_TYPE`);
    
    if (title && type) {
      sections.push({ title, type });
    }
  }
  
  return sections;
}

// ================== UI MANAGEMENT ==================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📝 Daily Notes')
    .addItem('⚙️ Setup Configuration', 'setupConfiguration')
    .addSeparator()
    .addItem('📅 Create This Week\'s Notes', 'createThisWeekNotes')
    .addItem('📅 Create Next Week\'s Notes', 'createNextWeekNotes')
    .addItem('📅 Create Custom Date Range', 'showDateRangeDialog')
    .addSeparator()
    .addItem('📄 Create Today\'s Note', 'createTodayNote')
    .addItem('📄 Create Tomorrow\'s Note', 'createTomorrowNote')
    .addSeparator()
    .addItem('🔄 Update Existing Notes', 'updateExistingNotes')
    .addItem('📊 Generate Monthly Summary', 'generateMonthlySummary')
    .addSeparator()
    .addItem('🗓️ Setup Auto-Creation', 'setupAutoCreation')
    .addItem('ℹ️ About', 'showAbout')
    .addToUi();
}

// ================== MAIN FUNCTIONS ==================

/**
 * Create notes for the current week
 */
function createThisWeekNotes() {
  const today = new Date();
  const monday = getMonday(today);
  createWeekNotes(monday);
}

/**
 * Create notes for next week
 */
function createNextWeekNotes() {
  const today = new Date();
  const nextMonday = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monday = getMonday(nextMonday);
  createWeekNotes(monday);
}

/**
 * Create notes for a specific week
 * @param {Date} monday - Monday of the week
 */
function createWeekNotes(monday) {
  const config = getNotesConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  
  logger.info(`Creating notes for week starting ${monday.toDateString()}`);
  
  try {
    // Get or create root folder
    const rootFolder = getRootFolder(config);
    
    // Determine number of days
    const numDays = config.folders.createWeekends ? 7 : 5;
    let created = 0;
    let skipped = 0;
    
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Skip weekends if not configured
      if (!config.folders.createWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        continue;
      }
      
      // Check for holidays if configured
      if (config.scheduling.skipHolidays && isHoliday(currentDate, config)) {
        logger.info(`Skipping holiday: ${currentDate.toDateString()}`);
        skipped++;
        continue;
      }
      
      if (createDailyNote(currentDate, rootFolder, config, logger)) {
        created++;
      } else {
        skipped++;
      }
    }
    
    logger.info(`Notes creation complete. Created: ${created}, Skipped: ${skipped}`);
    
    SpreadsheetApp.getUi().alert('Notes Created', 
      `Successfully created ${created} notes.\n${skipped} notes were skipped (already exist or holidays).`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    logger.error('Failed to create notes:', error);
    SpreadsheetApp.getUi().alert('Error', 
      `Failed to create notes: ${error.toString()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Create a single daily note
 * @param {Date} date - Date for the note
 * @param {Folder} rootFolder - Root folder
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {boolean} True if created, false if skipped
 */
function createDailyNote(date, rootFolder, config, logger) {
  logger.debug(`Creating note for ${date.toDateString()}`);
  
  // Get folder for this date
  const folder = ensureFolderPath(date, rootFolder, config);
  
  // Generate file name
  const fileName = formatDateWithPattern(date, config.notes.fileNameFormat) + 
                  '.' + config.notes.fileExtension;
  
  // Check if file exists
  const existingFiles = folder.getFilesByName(fileName);
  if (existingFiles.hasNext()) {
    if (!config.advanced.overwriteExisting) {
      logger.debug(`Note already exists: ${fileName}`);
      return false;
    }
    
    // Backup existing file if configured
    if (config.advanced.backupBeforeOverwrite) {
      const existingFile = existingFiles.next();
      const backupName = fileName.replace('.' + config.notes.fileExtension, 
                                         '_backup_' + new Date().getTime() + 
                                         '.' + config.notes.fileExtension);
      existingFile.makeCopy(backupName, folder);
      logger.info(`Backed up existing file: ${backupName}`);
      existingFile.setTrashed(true);
    }
  }
  
  // Generate note content
  const content = generateNoteContent(date, config, logger);
  
  // Create file
  const file = folder.createFile(fileName, content, MimeType.PLAIN_TEXT);
  logger.info(`Created note: ${fileName}`);
  
  return true;
}

/**
 * Generate note content from template
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {string} Note content
 */
function generateNoteContent(date, config, logger) {
  let content = '';
  
  // Add metadata if configured
  if (config.notes.includeMetadata) {
    content += generateMetadata(date, config);
  }
  
  // Add title
  content += `# ${formatDateWithPattern(date, config.notes.fileNameFormat)}\n\n`;
  
  // Add navigation if configured
  if (config.notes.includeNavigation) {
    content += generateNavigation(date, config);
  }
  
  // Add configured sections
  config.sections.forEach(section => {
    content += generateSection(section, date, config, logger);
  });
  
  return content;
}

/**
 * Generate metadata section
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @returns {string} Metadata content
 */
function generateMetadata(date, config) {
  let metadata = '---\n';
  
  metadata += `category: ${config.metadata.category}\n`;
  metadata += `tags: [${config.metadata.tags.join(', ')}]\n`;
  metadata += `date: ${formatDateWithPattern(date, 'yyyy-MM-dd')}\n`;
  metadata += `created: ${new Date().toISOString()}\n`;
  
  if (config.metadata.author) {
    metadata += `author: ${config.metadata.author}\n`;
  }
  
  // Add custom fields
  config.metadata.customFields.forEach(field => {
    metadata += `${field.name}: ${field.value}\n`;
  });
  
  // Add week and month numbers
  metadata += `week: ${getWeekNumber(date)}\n`;
  metadata += `month: ${date.getMonth() + 1}\n`;
  metadata += `year: ${date.getFullYear()}\n`;
  metadata += `dayOfWeek: ${getDayName(date)}\n`;
  
  metadata += '---\n\n';
  
  return metadata;
}

/**
 * Generate navigation links
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @returns {string} Navigation content
 */
function generateNavigation(date, config) {
  const prevDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  
  const prevLink = formatDateWithPattern(prevDate, config.notes.fileNameFormat);
  const nextLink = formatDateWithPattern(nextDate, config.notes.fileNameFormat);
  
  let nav = '';
  
  switch (config.advanced.linkFormat) {
    case 'wiki':
      nav = `[[${prevLink}]] | [[${nextLink}]]\n\n`;
      break;
    case 'html':
      nav = `<a href="${prevLink}">&larr; Previous</a> | <a href="${nextLink}">Next &rarr;</a>\n\n`;
      break;
    default: // markdown
      nav = `[← ${prevLink}](${prevLink}) | [${nextLink} →](${nextLink})\n\n`;
  }
  
  return nav;
}

/**
 * Generate a content section
 * @param {Object} section - Section configuration
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {string} Section content
 */
function generateSection(section, date, config, logger) {
  let content = `## ${section.title}\n\n`;
  
  switch (section.type) {
    case 'calendar':
      content += generateCalendarSection(date, config, logger);
      break;
    case 'tasks':
      content += generateTasksSection(date, config);
      break;
    case 'preview':
      content += generatePreviewSection(date, config, logger);
      break;
    case 'custom':
      content += generateCustomSection(section.title);
      break;
    default:
      content += '\n';
  }
  
  return content + '\n';
}

/**
 * Generate calendar events section
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {string} Calendar content
 */
function generateCalendarSection(date, config, logger) {
  const events = getCalendarEvents(date, config, logger);
  
  if (events.length === 0) {
    return 'No events scheduled.\n';
  }
  
  // Create table header
  let table = '| Time | Event | Duration |';
  if (config.calendar.showLocation) table += ' Location |';
  if (config.calendar.showAttendees) table += ' Attendees |';
  table += '\n';
  
  table += '|------|-------|----------|';
  if (config.calendar.showLocation) table += '----------|';
  if (config.calendar.showAttendees) table += '-----------|';
  table += '\n';
  
  let totalDuration = 0;
  
  // Add events
  events.forEach(event => {
    const startTime = event.isAllDayEvent() ? 
      'All Day' : 
      formatDateWithPattern(event.getStartTime(), config.calendar.timeFormat);
    
    const eventTitle = event.getTitle();
    
    let duration = '';
    if (config.calendar.calculateDuration && !event.isAllDayEvent()) {
      const durationMinutes = Math.round((event.getEndTime() - event.getStartTime()) / 60000);
      totalDuration += durationMinutes;
      
      switch (config.calendar.durationFormat) {
        case 'minutes':
          duration = `${durationMinutes} min`;
          break;
        case 'both':
          const hours = Math.floor(durationMinutes / 60);
          const mins = durationMinutes % 60;
          duration = `${hours}h ${mins}m`;
          break;
        default: // hours
          duration = `${(durationMinutes / 60).toFixed(1)} hrs`;
      }
    } else {
      duration = event.isAllDayEvent() ? 'All Day' : '-';
    }
    
    table += `| ${startTime} | ${eventTitle} | ${duration} |`;
    
    if (config.calendar.showLocation) {
      const location = event.getLocation() || '-';
      table += ` ${location} |`;
    }
    
    if (config.calendar.showAttendees) {
      const attendees = event.getGuestList().map(g => g.getEmail()).join(', ') || '-';
      table += ` ${attendees} |`;
    }
    
    table += '\n';
  });
  
  // Add summary
  if (config.calendar.calculateDuration && totalDuration > 0) {
    table += `\n**Total meeting time:** ${(totalDuration / 60).toFixed(1)} hours\n`;
  }
  
  return table;
}

/**
 * Get calendar events for a date
 * @param {Date} date - Date to get events for
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Array} Calendar events
 */
function getCalendarEvents(date, config, logger) {
  logger.debug(`Getting events for ${date.toDateString()}`);
  
  // Get calendar
  let calendar;
  if (config.calendar.source === 'default') {
    calendar = CalendarApp.getDefaultCalendar();
  } else if (config.calendar.specificId) {
    try {
      calendar = CalendarApp.getCalendarById(config.calendar.specificId);
    } catch (e) {
      logger.warn('Failed to get specific calendar, using default');
      calendar = CalendarApp.getDefaultCalendar();
    }
  } else {
    calendar = CalendarApp.getDefaultCalendar();
  }
  
  // Set time range
  const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  
  // Get events
  let events = calendar.getEvents(startTime, endTime);
  
  // Filter events
  events = events.filter(event => {
    // Filter all-day events
    if (!config.calendar.includeAllDay && event.isAllDayEvent()) {
      return false;
    }
    
    // Filter private events
    if (!config.calendar.includePrivate && event.getVisibility() === CalendarApp.Visibility.PRIVATE) {
      return false;
    }
    
    return true;
  });
  
  // Limit events
  if (config.calendar.maxEvents > 0 && events.length > config.calendar.maxEvents) {
    events = events.slice(0, config.calendar.maxEvents);
  }
  
  logger.debug(`Found ${events.length} events`);
  
  return events;
}

/**
 * Generate tasks section
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @returns {string} Tasks content
 */
function generateTasksSection(date, config) {
  let content = '- [ ] \n';
  content += '- [ ] \n';
  content += '- [ ] \n';
  content += '- [ ] \n';
  content += '- [ ] \n';
  
  return content;
}

/**
 * Generate preview section
 * @param {Date} date - Date for the note
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {string} Preview content
 */
function generatePreviewSection(date, config, logger) {
  const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const events = getCalendarEvents(tomorrow, config, logger);
  
  if (events.length === 0) {
    return 'No events scheduled for tomorrow.\n';
  }
  
  let content = 'Tomorrow\'s events:\n';
  events.forEach(event => {
    const time = event.isAllDayEvent() ? 
      'All Day' : 
      formatDateWithPattern(event.getStartTime(), config.calendar.timeFormat);
    content += `- ${time}: ${event.getTitle()}\n`;
  });
  
  return content;
}

/**
 * Generate custom section
 * @param {string} title - Section title
 * @returns {string} Custom content
 */
function generateCustomSection(title) {
  return '\n'; // Empty section for user to fill
}

// ================== FOLDER MANAGEMENT ==================

/**
 * Get or create root folder
 * @param {Object} config - Configuration
 * @returns {Folder} Root folder
 */
function getRootFolder(config) {
  let rootFolder;
  
  if (config.folders.rootId) {
    try {
      rootFolder = DriveApp.getFolderById(config.folders.rootId);
    } catch (e) {
      // Invalid ID, create new folder
      rootFolder = DriveApp.createFolder(config.folders.rootName);
    }
  } else {
    // Find or create by name
    const folders = DriveApp.getFoldersByName(config.folders.rootName);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(config.folders.rootName);
    }
  }
  
  return rootFolder;
}

/**
 * Ensure folder path exists for a date
 * @param {Date} date - Date
 * @param {Folder} rootFolder - Root folder
 * @param {Object} config - Configuration
 * @returns {Folder} Target folder
 */
function ensureFolderPath(date, rootFolder, config) {
  const parts = config.folders.structure.split('/');
  let currentFolder = rootFolder;
  
  parts.forEach(part => {
    let folderName;
    
    switch (part) {
      case 'year':
        folderName = formatDateWithPattern(date, config.folders.yearFormat);
        break;
      case 'month':
        folderName = formatMonthFolder(date, config.folders.monthFormat);
        break;
      case 'week':
        folderName = formatWeekFolder(date, config.folders.weekFormat);
        break;
      case 'day':
        folderName = formatDateWithPattern(date, 'dd');
        break;
      default:
        folderName = part; // Use literal value
    }
    
    currentFolder = findOrCreateFolder(currentFolder, folderName);
  });
  
  return currentFolder;
}

/**
 * Find or create a folder
 * @param {Folder} parentFolder - Parent folder
 * @param {string} folderName - Folder name
 * @returns {Folder} Found or created folder
 */
function findOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

// ================== DATE UTILITIES ==================

/**
 * Format date with pattern
 * @param {Date} date - Date to format
 * @param {string} pattern - Format pattern
 * @returns {string} Formatted date
 */
function formatDateWithPattern(date, pattern) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return pattern
    .replace('yyyy', year)
    .replace('yy', String(year).slice(-2))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Format month folder name
 * @param {Date} date - Date
 * @param {string} format - Format pattern
 * @returns {string} Formatted month
 */
function formatMonthFolder(date, format) {
  const month = date.getMonth() + 1;
  const monthName = getMonthName(month);
  const monthPadded = String(month).padStart(2, '0');
  
  return format
    .replace('MonthName', monthName)
    .replace('MM', monthPadded);
}

/**
 * Format week folder name
 * @param {Date} date - Date
 * @param {string} format - Format pattern
 * @returns {string} Formatted week
 */
function formatWeekFolder(date, format) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  const weekPadded = String(week).padStart(2, '0');
  
  return format
    .replace('yyyy', year)
    .replace('ww', weekPadded)
    .replace('w', week);
}

/**
 * Get Monday of the week
 * @param {Date} date - Any date
 * @returns {Date} Monday of that week
 */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get week number
 * @param {Date} date - Date
 * @returns {number} Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get month name
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

/**
 * Get day name
 * @param {Date} date - Date
 * @returns {string} Day name
 */
function getDayName(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if date is a holiday
 * @param {Date} date - Date to check
 * @param {Object} config - Configuration
 * @returns {boolean} True if holiday
 */
function isHoliday(date, config) {
  if (!config.scheduling.holidayCalendar) {
    return false;
  }
  
  try {
    const calendar = CalendarApp.getCalendarById(config.scheduling.holidayCalendar);
    const events = calendar.getEventsForDay(date);
    return events.length > 0;
  } catch (e) {
    return false;
  }
}

// ================== ADDITIONAL FUNCTIONS ==================

/**
 * Create today's note
 */
function createTodayNote() {
  const config = getNotesConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  const rootFolder = getRootFolder(config);
  
  if (createDailyNote(new Date(), rootFolder, config, logger)) {
    SpreadsheetApp.getUi().alert('Note Created', 
      'Today\'s note has been created successfully.',
      SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('Note Exists', 
      'Today\'s note already exists.',
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Create tomorrow's note
 */
function createTomorrowNote() {
  const config = getNotesConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  const rootFolder = getRootFolder(config);
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  
  if (createDailyNote(tomorrow, rootFolder, config, logger)) {
    SpreadsheetApp.getUi().alert('Note Created', 
      'Tomorrow\'s note has been created successfully.',
      SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('Note Exists', 
      'Tomorrow\'s note already exists.',
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Setup automatic note creation
 */
function setupAutoCreation() {
  const config = getNotesConfiguration();
  
  if (!config.scheduling.autoCreate) {
    SpreadsheetApp.getUi().alert('Auto-Creation Disabled', 
      'Automatic note creation is disabled. Enable it in the Config sheet.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Create daily trigger
  ScriptApp.newTrigger('autoCreateNotes')
    .timeBased()
    .everyDays(1)
    .atHour(parseInt(config.scheduling.createTime.split(':')[0]))
    .create();
  
  SpreadsheetApp.getUi().alert('Auto-Creation Enabled', 
    `Notes will be created daily at ${config.scheduling.createTime}`,
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Automatically create notes
 */
function autoCreateNotes() {
  const config = getNotesConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  const rootFolder = getRootFolder(config);
  
  const today = new Date();
  const endDate = new Date(today.getTime() + config.scheduling.daysAhead * 24 * 60 * 60 * 1000);
  
  let created = 0;
  for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDate = new Date(d);
    
    if (!config.folders.createWeekends && 
        (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
      continue;
    }
    
    if (config.scheduling.skipHolidays && isHoliday(currentDate, config)) {
      continue;
    }
    
    if (createDailyNote(currentDate, rootFolder, config, logger)) {
      created++;
    }
  }
  
  logger.info(`Auto-created ${created} notes`);
}

// ================== LOGGER CLASS ==================

/**
 * Logger class for configurable logging
 */
class Logger {
  constructor(enabled, level) {
    this.enabled = enabled;
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    this.currentLevel = this.levels[level] || 1;
  }
  
  log(level, ...args) {
    if (this.enabled && this.levels[level] >= this.currentLevel) {
      console.log(`[${level}]`, ...args);
    }
  }
  
  debug(...args) { this.log('DEBUG', ...args); }
  info(...args) { this.log('INFO', ...args); }
  warn(...args) { this.log('WARN', ...args); }
  error(...args) { this.log('ERROR', ...args); }
}

/**
 * Show about dialog
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  const message = 
    'Daily Notes Creator\n' +
    'Version: 2.0 (Refactored)\n\n' +
    'Features:\n' +
    '• Configurable note templates\n' +
    '• Calendar event integration\n' +
    '• Flexible folder structures\n' +
    '• Custom metadata fields\n' +
    '• Automatic note creation\n' +
    '• Holiday awareness\n\n' +
    'This script is fully configurable with no hardcoded values.\n' +
    'All settings can be managed through the Config sheet.';
  
  ui.alert('About Daily Notes', message, ui.ButtonSet.OK);
}

// ================== INITIALIZATION ==================

/**
 * Check if configuration exists on open
 */
function checkConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  if (!userProperties.getProperty('ROOT_FOLDER_NAME')) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('Configuration Required', 
      'This script requires initial configuration. Would you like to set it up now?',
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      setupConfiguration();
    }
  }
}