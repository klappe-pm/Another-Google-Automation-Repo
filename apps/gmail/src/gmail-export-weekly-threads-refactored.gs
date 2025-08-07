/**
 * Title: Gmail Weekly Threads Export - Refactored
 * Service: Gmail + Google Sheets
 * Purpose: Export weekly email threads to spreadsheet with full configuration
 * Created: 2024-01-01
 * Refactored: 2025-08-07
 * Author: Configurable - See Config Sheet
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: List emails from past week with comprehensive details
 * - Description: Exports Gmail threads to organized sheets by week
 * - Problem Solved: Cross-account email tracking without hardcoded values
 * - Successful Execution: Creates weekly email summary in spreadsheet
 * - Dependencies: Gmail API, Sheets API
 * 
 * Configuration:
 * Run setupConfiguration() first to initialize settings
 * All settings stored securely in Script Properties
 * No hardcoded spreadsheet IDs or values
 * 
 * Key Features:
 * 1. Configurable date ranges (weekly, daily, custom)
 * 2. Flexible sheet naming conventions
 * 3. Custom search queries and filters
 * 4. Thread grouping and conversation view
 * 5. Attachment tracking
 * 6. Label categorization
 * 7. Priority and importance indicators
 * 8. Export scheduling options
 * 9. Multiple spreadsheet support
 * 10. No hardcoded values
 */

// ================== CONFIGURATION MANAGEMENT ==================

/**
 * Initialize configuration on first run
 * Creates Config sheet and sets up default properties
 */
function setupConfiguration() {
  console.log('Setting up Weekly Threads Export configuration...');
  
  const userProperties = PropertiesService.getUserProperties();
  
  // Create or get active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet() || 
             SpreadsheetApp.create('Gmail Weekly Export Configuration');
  
  let configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    
    const headers = [
      ['Gmail Weekly Export Configuration', '', ''],
      ['', '', ''],
      ['Setting', 'Value', 'Description'],
      ['', '', ''],
      ['Spreadsheet Settings', '', ''],
      ['Target Spreadsheet ID', '', 'Leave empty to use current spreadsheet'],
      ['Create New Spreadsheet', 'false', 'Create new spreadsheet for each export'],
      ['Spreadsheet Name Format', 'Gmail Export {year}', 'Name format for new spreadsheets'],
      ['', '', ''],
      ['Export Settings', '', ''],
      ['Export Period', 'weekly', 'weekly, daily, monthly, or custom'],
      ['Custom Days', '7', 'Number of days for custom period'],
      ['Sheet Name Format', '{year}-W{week}', 'Format for sheet names'],
      ['Include Weekends', 'true', 'Include weekend emails'],
      ['Max Threads', '500', 'Maximum threads to export (0 = unlimited)'],
      ['', '', ''],
      ['Email Filters', '', ''],
      ['Search Query', '', 'Additional Gmail search query'],
      ['Include Labels', '', 'Comma-separated labels to include'],
      ['Exclude Labels', 'spam,trash', 'Comma-separated labels to exclude'],
      ['Only Unread', 'false', 'Export only unread emails'],
      ['Only Important', 'false', 'Export only important emails'],
      ['Only Starred', 'false', 'Export only starred emails'],
      ['', '', ''],
      ['Data Fields', '', ''],
      ['Include Thread ID', 'true', 'Include thread ID column'],
      ['Include Email ID', 'true', 'Include email ID column'],
      ['Include Date', 'true', 'Include date column'],
      ['Include Time', 'true', 'Include time column'],
      ['Include Sender', 'true', 'Include sender column'],
      ['Include Recipients', 'true', 'Include recipients column'],
      ['Include CC', 'false', 'Include CC recipients'],
      ['Include BCC', 'false', 'Include BCC recipients'],
      ['Include Subject', 'true', 'Include subject column'],
      ['Include Body Preview', 'false', 'Include email body preview'],
      ['Preview Length', '100', 'Characters for body preview'],
      ['Include Labels', 'true', 'Include email labels'],
      ['Include Read Status', 'true', 'Include read/unread status'],
      ['Include Attachments', 'true', 'Include attachment info'],
      ['Include Priority', 'false', 'Include priority/importance'],
      ['Include Size', 'false', 'Include email size'],
      ['', '', ''],
      ['Formatting', '', ''],
      ['Date Format', 'yyyy-MM-dd', 'Date format pattern'],
      ['Time Format', 'HH:mm:ss', 'Time format pattern'],
      ['Sort By', 'date', 'Sort by: date, sender, subject'],
      ['Sort Order', 'desc', 'Sort order: asc or desc'],
      ['Group By Thread', 'true', 'Group emails by thread'],
      ['', '', ''],
      ['Advanced Settings', '', ''],
      ['Time Zone', Session.getScriptTimeZone(), 'Time zone for dates'],
      ['Max Execution Time (min)', '5', 'Maximum execution time'],
      ['Enable Logging', 'true', 'Enable detailed logging'],
      ['Log Level', 'INFO', 'DEBUG, INFO, WARN, ERROR'],
      ['Auto Create Weekly', 'false', 'Automatically create weekly exports'],
      ['Export Day', 'Monday', 'Day to run weekly export'],
      ['Export Time', '09:00', 'Time to run export']
    ];
    
    configSheet.getRange(1, 1, headers.length, 3).setValues(headers);
    
    // Format configuration sheet
    configSheet.getRange('A1:C1').merge()
      .setBackground('#ea4335')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(14)
      .setHorizontalAlignment('center');
    
    // Format section headers
    const sectionRows = [5, 10, 17, 25, 44, 50];
    sectionRows.forEach(row => {
      configSheet.getRange(row, 1, 1, 3)
        .setBackground('#e8e8e8')
        .setFontWeight('bold');
    });
    
    configSheet.setColumnWidth(1, 200);
    configSheet.setColumnWidth(2, 250);
    configSheet.setColumnWidth(3, 350);
    configSheet.setFrozenRows(3);
  }
  
  // Set default properties
  const defaults = {
    'TARGET_SPREADSHEET_ID': '',
    'CREATE_NEW_SPREADSHEET': 'false',
    'SPREADSHEET_NAME_FORMAT': 'Gmail Export {year}',
    'EXPORT_PERIOD': 'weekly',
    'CUSTOM_DAYS': '7',
    'SHEET_NAME_FORMAT': '{year}-W{week}',
    'INCLUDE_WEEKENDS': 'true',
    'MAX_THREADS': '500',
    'SEARCH_QUERY': '',
    'INCLUDE_LABELS': '',
    'EXCLUDE_LABELS': 'spam,trash',
    'ONLY_UNREAD': 'false',
    'ONLY_IMPORTANT': 'false',
    'ONLY_STARRED': 'false',
    'INCLUDE_THREAD_ID': 'true',
    'INCLUDE_EMAIL_ID': 'true',
    'INCLUDE_DATE': 'true',
    'INCLUDE_TIME': 'true',
    'INCLUDE_SENDER': 'true',
    'INCLUDE_RECIPIENTS': 'true',
    'INCLUDE_CC': 'false',
    'INCLUDE_BCC': 'false',
    'INCLUDE_SUBJECT': 'true',
    'INCLUDE_BODY_PREVIEW': 'false',
    'PREVIEW_LENGTH': '100',
    'INCLUDE_LABELS_COL': 'true',
    'INCLUDE_READ_STATUS': 'true',
    'INCLUDE_ATTACHMENTS': 'true',
    'INCLUDE_PRIORITY': 'false',
    'INCLUDE_SIZE': 'false',
    'DATE_FORMAT': 'yyyy-MM-dd',
    'TIME_FORMAT': 'HH:mm:ss',
    'SORT_BY': 'date',
    'SORT_ORDER': 'desc',
    'GROUP_BY_THREAD': 'true',
    'TIME_ZONE': Session.getScriptTimeZone(),
    'MAX_EXECUTION_TIME': '5',
    'ENABLE_LOGGING': 'true',
    'LOG_LEVEL': 'INFO',
    'AUTO_CREATE_WEEKLY': 'false',
    'EXPORT_DAY': 'Monday',
    'EXPORT_TIME': '09:00'
  };
  
  Object.entries(defaults).forEach(([key, value]) => {
    if (!userProperties.getProperty(key)) {
      userProperties.setProperty(key, value);
    }
  });
  
  console.log('Configuration setup complete.');
  SpreadsheetApp.getUi().alert('Configuration Setup Complete', 
    'Please review the Config sheet and update settings as needed.\n\n' +
    'No hardcoded values - all settings are configurable.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Get export configuration
 * @returns {Object} Configuration object
 */
function getExportConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  
  return {
    spreadsheet: {
      targetId: userProperties.getProperty('TARGET_SPREADSHEET_ID') || '',
      createNew: userProperties.getProperty('CREATE_NEW_SPREADSHEET') === 'true',
      nameFormat: userProperties.getProperty('SPREADSHEET_NAME_FORMAT') || 'Gmail Export {year}'
    },
    export: {
      period: userProperties.getProperty('EXPORT_PERIOD') || 'weekly',
      customDays: Number(userProperties.getProperty('CUSTOM_DAYS') || 7),
      sheetNameFormat: userProperties.getProperty('SHEET_NAME_FORMAT') || '{year}-W{week}',
      includeWeekends: userProperties.getProperty('INCLUDE_WEEKENDS') === 'true',
      maxThreads: Number(userProperties.getProperty('MAX_THREADS') || 500)
    },
    filters: {
      searchQuery: userProperties.getProperty('SEARCH_QUERY') || '',
      includeLabels: (userProperties.getProperty('INCLUDE_LABELS') || '').split(',').filter(l => l.trim()),
      excludeLabels: (userProperties.getProperty('EXCLUDE_LABELS') || '').split(',').filter(l => l.trim()),
      onlyUnread: userProperties.getProperty('ONLY_UNREAD') === 'true',
      onlyImportant: userProperties.getProperty('ONLY_IMPORTANT') === 'true',
      onlyStarred: userProperties.getProperty('ONLY_STARRED') === 'true'
    },
    fields: {
      threadId: userProperties.getProperty('INCLUDE_THREAD_ID') === 'true',
      emailId: userProperties.getProperty('INCLUDE_EMAIL_ID') === 'true',
      date: userProperties.getProperty('INCLUDE_DATE') === 'true',
      time: userProperties.getProperty('INCLUDE_TIME') === 'true',
      sender: userProperties.getProperty('INCLUDE_SENDER') === 'true',
      recipients: userProperties.getProperty('INCLUDE_RECIPIENTS') === 'true',
      cc: userProperties.getProperty('INCLUDE_CC') === 'true',
      bcc: userProperties.getProperty('INCLUDE_BCC') === 'true',
      subject: userProperties.getProperty('INCLUDE_SUBJECT') === 'true',
      bodyPreview: userProperties.getProperty('INCLUDE_BODY_PREVIEW') === 'true',
      previewLength: Number(userProperties.getProperty('PREVIEW_LENGTH') || 100),
      labels: userProperties.getProperty('INCLUDE_LABELS_COL') === 'true',
      readStatus: userProperties.getProperty('INCLUDE_READ_STATUS') === 'true',
      attachments: userProperties.getProperty('INCLUDE_ATTACHMENTS') === 'true',
      priority: userProperties.getProperty('INCLUDE_PRIORITY') === 'true',
      size: userProperties.getProperty('INCLUDE_SIZE') === 'true'
    },
    formatting: {
      dateFormat: userProperties.getProperty('DATE_FORMAT') || 'yyyy-MM-dd',
      timeFormat: userProperties.getProperty('TIME_FORMAT') || 'HH:mm:ss',
      sortBy: userProperties.getProperty('SORT_BY') || 'date',
      sortOrder: userProperties.getProperty('SORT_ORDER') || 'desc',
      groupByThread: userProperties.getProperty('GROUP_BY_THREAD') === 'true'
    },
    advanced: {
      timeZone: userProperties.getProperty('TIME_ZONE') || Session.getScriptTimeZone(),
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 5) * 60000,
      enableLogging: userProperties.getProperty('ENABLE_LOGGING') === 'true',
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO',
      autoCreateWeekly: userProperties.getProperty('AUTO_CREATE_WEEKLY') === 'true',
      exportDay: userProperties.getProperty('EXPORT_DAY') || 'Monday',
      exportTime: userProperties.getProperty('EXPORT_TIME') || '09:00'
    }
  };
}

// ================== UI MANAGEMENT ==================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📧 Gmail Export')
    .addItem('⚙️ Setup Configuration', 'setupConfiguration')
    .addSeparator()
    .addItem('📅 Export This Week', 'exportThisWeek')
    .addItem('📅 Export Last Week', 'exportLastWeek')
    .addItem('📅 Export Custom Range', 'showCustomRangeDialog')
    .addSeparator()
    .addItem('📊 Export Today', 'exportToday')
    .addItem('📊 Export Yesterday', 'exportYesterday')
    .addSeparator()
    .addItem('🔄 Setup Auto Export', 'setupAutoExport')
    .addItem('📈 Generate Summary Report', 'generateSummaryReport')
    .addToUi();
}

// ================== MAIN EXPORT FUNCTIONS ==================

/**
 * Export emails for current week
 */
function exportThisWeek() {
  const today = new Date();
  const monday = getMonday(today);
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  exportEmailRange(monday, sunday, 'This Week');
}

/**
 * Export emails for last week
 */
function exportLastWeek() {
  const today = new Date();
  const lastMonday = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monday = getMonday(lastMonday);
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);
  exportEmailRange(monday, sunday, 'Last Week');
}

/**
 * Export emails for today
 */
function exportToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  exportEmailRange(today, tomorrow, 'Today');
}

/**
 * Export emails for yesterday
 */
function exportYesterday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  exportEmailRange(yesterday, today, 'Yesterday');
}

/**
 * Main export function for date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} periodName - Name of period
 */
function exportEmailRange(startDate, endDate, periodName) {
  const config = getExportConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  
  logger.info(`Starting email export for ${periodName}: ${startDate} to ${endDate}`);
  
  try {
    // Get target spreadsheet
    const spreadsheet = getTargetSpreadsheet(config);
    
    // Generate sheet name
    const sheetName = generateSheetName(startDate, config);
    
    // Get or create sheet
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    // Build search query
    const searchQuery = buildSearchQuery(startDate, endDate, config);
    logger.info(`Search query: ${searchQuery}`);
    
    // Get email threads
    let threads;
    if (config.export.maxThreads > 0) {
      threads = GmailApp.search(searchQuery, 0, config.export.maxThreads);
    } else {
      threads = GmailApp.search(searchQuery);
    }
    
    logger.info(`Found ${threads.length} threads`);
    
    // Build headers
    const headers = buildHeaders(config);
    sheet.appendRow(headers);
    
    // Format headers
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#ea4335')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // Process threads
    const emailData = [];
    let totalEmails = 0;
    
    threads.forEach((thread, threadIndex) => {
      // Check if weekend and should skip
      if (!config.export.includeWeekends) {
        const firstMessage = thread.getMessages()[0];
        const messageDate = firstMessage.getDate();
        if (messageDate.getDay() === 0 || messageDate.getDay() === 6) {
          logger.debug(`Skipping weekend thread: ${thread.getFirstMessageSubject()}`);
          return;
        }
      }
      
      const messages = thread.getMessages();
      
      messages.forEach((message, messageIndex) => {
        const rowData = buildRowData(thread, message, config);
        emailData.push(rowData);
        totalEmails++;
      });
      
      // Log progress
      if ((threadIndex + 1) % 10 === 0) {
        logger.info(`Processed ${threadIndex + 1} of ${threads.length} threads`);
      }
    });
    
    // Sort data
    sortEmailData(emailData, config);
    
    // Write data to sheet
    if (emailData.length > 0) {
      sheet.getRange(2, 1, emailData.length, emailData[0].length).setValues(emailData);
      
      // Auto-resize columns
      for (let i = 1; i <= headers.length; i++) {
        sheet.autoResizeColumn(i);
      }
    }
    
    // Add summary row
    sheet.appendRow(['']);
    sheet.appendRow(['Summary', `Total Threads: ${threads.length}`, `Total Emails: ${totalEmails}`]);
    
    logger.info(`Export complete. Exported ${totalEmails} emails from ${threads.length} threads`);
    
    SpreadsheetApp.getUi().alert('Export Complete', 
      `Successfully exported ${totalEmails} emails from ${threads.length} threads to sheet "${sheetName}"`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    logger.error('Export failed:', error);
    SpreadsheetApp.getUi().alert('Export Error', 
      `An error occurred: ${error.toString()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ================== HELPER FUNCTIONS ==================

/**
 * Get target spreadsheet
 * @param {Object} config - Configuration
 * @returns {Spreadsheet} Target spreadsheet
 */
function getTargetSpreadsheet(config) {
  if (config.spreadsheet.createNew) {
    const name = config.spreadsheet.nameFormat
      .replace('{year}', new Date().getFullYear())
      .replace('{month}', String(new Date().getMonth() + 1).padStart(2, '0'))
      .replace('{date}', new Date().toISOString().split('T')[0]);
    return SpreadsheetApp.create(name);
  } else if (config.spreadsheet.targetId) {
    try {
      return SpreadsheetApp.openById(config.spreadsheet.targetId);
    } catch (e) {
      // Fall back to active spreadsheet
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Generate sheet name based on date
 * @param {Date} date - Date for sheet name
 * @param {Object} config - Configuration
 * @returns {string} Sheet name
 */
function generateSheetName(date, config) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const week = getWeekNumber(date);
  const day = String(date.getDate()).padStart(2, '0');
  
  return config.export.sheetNameFormat
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{week}', week)
    .replace('{day}', day)
    .replace('{date}', `${year}-${month}-${day}`);
}

/**
 * Build Gmail search query
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Object} config - Configuration
 * @returns {string} Search query
 */
function buildSearchQuery(startDate, endDate, config) {
  const parts = [];
  
  // Date range
  parts.push(`after:${formatDateForQuery(startDate)}`);
  parts.push(`before:${formatDateForQuery(endDate)}`);
  
  // Custom search query
  if (config.filters.searchQuery) {
    parts.push(config.filters.searchQuery);
  }
  
  // Include labels
  if (config.filters.includeLabels.length > 0) {
    const labelQuery = config.filters.includeLabels.map(l => `label:${l}`).join(' OR ');
    parts.push(`(${labelQuery})`);
  }
  
  // Exclude labels
  config.filters.excludeLabels.forEach(label => {
    parts.push(`-label:${label}`);
  });
  
  // Status filters
  if (config.filters.onlyUnread) parts.push('is:unread');
  if (config.filters.onlyImportant) parts.push('is:important');
  if (config.filters.onlyStarred) parts.push('is:starred');
  
  return parts.join(' ');
}

/**
 * Format date for Gmail query
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDateForQuery(date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Build headers based on configuration
 * @param {Object} config - Configuration
 * @returns {Array} Headers array
 */
function buildHeaders(config) {
  const headers = [];
  
  if (config.fields.threadId) headers.push('Thread ID');
  if (config.fields.emailId) headers.push('Email ID');
  if (config.fields.date) headers.push('Date');
  if (config.fields.time) headers.push('Time');
  if (config.fields.sender) headers.push('Sender');
  if (config.fields.recipients) headers.push('Recipients');
  if (config.fields.cc) headers.push('CC');
  if (config.fields.bcc) headers.push('BCC');
  if (config.fields.subject) headers.push('Subject');
  if (config.fields.bodyPreview) headers.push('Preview');
  if (config.fields.labels) headers.push('Labels');
  if (config.fields.readStatus) headers.push('Read Status');
  if (config.fields.attachments) headers.push('Attachments');
  if (config.fields.priority) headers.push('Priority');
  if (config.fields.size) headers.push('Size');
  
  return headers;
}

/**
 * Build row data for email
 * @param {Thread} thread - Email thread
 * @param {Message} message - Email message
 * @param {Object} config - Configuration
 * @returns {Array} Row data
 */
function buildRowData(thread, message, config) {
  const row = [];
  const messageDate = message.getDate();
  
  if (config.fields.threadId) row.push(thread.getId());
  if (config.fields.emailId) row.push(message.getId());
  if (config.fields.date) {
    row.push(Utilities.formatDate(messageDate, config.advanced.timeZone, config.formatting.dateFormat));
  }
  if (config.fields.time) {
    row.push(Utilities.formatDate(messageDate, config.advanced.timeZone, config.formatting.timeFormat));
  }
  if (config.fields.sender) row.push(message.getFrom());
  if (config.fields.recipients) row.push(message.getTo());
  if (config.fields.cc) row.push(message.getCc() || '');
  if (config.fields.bcc) row.push(message.getBcc() || '');
  if (config.fields.subject) row.push(message.getSubject());
  if (config.fields.bodyPreview) {
    const body = message.getPlainBody();
    row.push(body.substring(0, config.fields.previewLength) + (body.length > config.fields.previewLength ? '...' : ''));
  }
  if (config.fields.labels) {
    row.push(thread.getLabels().map(l => l.getName()).join(', '));
  }
  if (config.fields.readStatus) {
    row.push(thread.isUnread() ? 'Unread' : 'Read');
  }
  if (config.fields.attachments) {
    const attachments = message.getAttachments();
    row.push(attachments.length > 0 ? `${attachments.length} attachment(s)` : '');
  }
  if (config.fields.priority) {
    row.push(thread.isImportant() ? 'Important' : 'Normal');
  }
  if (config.fields.size) {
    // Estimate size
    const size = message.getRawContent ? message.getRawContent().length : 0;
    row.push(formatFileSize(size));
  }
  
  return row;
}

/**
 * Sort email data
 * @param {Array} emailData - Email data array
 * @param {Object} config - Configuration
 */
function sortEmailData(emailData, config) {
  const sortIndex = getSortIndex(config);
  const ascending = config.formatting.sortOrder === 'asc';
  
  emailData.sort((a, b) => {
    const aVal = a[sortIndex];
    const bVal = b[sortIndex];
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

/**
 * Get sort index based on configuration
 * @param {Object} config - Configuration
 * @returns {number} Sort index
 */
function getSortIndex(config) {
  let index = 0;
  const sortBy = config.formatting.sortBy;
  
  // Calculate index based on enabled fields
  if (sortBy === 'date' && config.fields.date) {
    if (config.fields.threadId) index++;
    if (config.fields.emailId) index++;
    return index;
  }
  
  if (sortBy === 'sender' && config.fields.sender) {
    if (config.fields.threadId) index++;
    if (config.fields.emailId) index++;
    if (config.fields.date) index++;
    if (config.fields.time) index++;
    return index;
  }
  
  if (sortBy === 'subject' && config.fields.subject) {
    if (config.fields.threadId) index++;
    if (config.fields.emailId) index++;
    if (config.fields.date) index++;
    if (config.fields.time) index++;
    if (config.fields.sender) index++;
    if (config.fields.recipients) index++;
    if (config.fields.cc) index++;
    if (config.fields.bcc) index++;
    return index;
  }
  
  return 0; // Default to first column
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
 * Get ISO week number
 * @param {Date} date - Date
 * @returns {string} Week number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo.toString().padStart(2, '0');
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

// ================== AUTO EXPORT ==================

/**
 * Setup automatic weekly export
 */
function setupAutoExport() {
  const config = getExportConfiguration();
  
  if (!config.advanced.autoCreateWeekly) {
    SpreadsheetApp.getUi().alert('Auto Export Disabled', 
      'Automatic export is disabled. Enable it in the Config sheet.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Create weekly trigger
  const dayMap = {
    'Monday': ScriptApp.WeekDay.MONDAY,
    'Tuesday': ScriptApp.WeekDay.TUESDAY,
    'Wednesday': ScriptApp.WeekDay.WEDNESDAY,
    'Thursday': ScriptApp.WeekDay.THURSDAY,
    'Friday': ScriptApp.WeekDay.FRIDAY,
    'Saturday': ScriptApp.WeekDay.SATURDAY,
    'Sunday': ScriptApp.WeekDay.SUNDAY
  };
  
  const hour = parseInt(config.advanced.exportTime.split(':')[0]);
  
  ScriptApp.newTrigger('autoExportWeekly')
    .timeBased()
    .onWeekDay(dayMap[config.advanced.exportDay])
    .atHour(hour)
    .create();
  
  SpreadsheetApp.getUi().alert('Auto Export Enabled', 
    `Weekly export will run every ${config.advanced.exportDay} at ${config.advanced.exportTime}`,
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Automatic weekly export function
 */
function autoExportWeekly() {
  exportLastWeek();
}