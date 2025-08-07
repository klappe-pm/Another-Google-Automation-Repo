/**
 * Gmail Email Analysis Tool
 * 
 * Service: Gmail + Google Sheets
 * Version: 2.0.0
 * Created: 2024-01-01
 * Updated: 2025-08-06
 * License: MIT
 * 
 * PURPOSE:
 * Analyzes email patterns and generates comprehensive statistics for a configurable
 * time period. Creates detailed reports showing sender frequency, communication
 * patterns, and email volume trends.
 * 
 * FEATURES:
 * - Configurable analysis period (default: 180 days)
 * - Sender frequency analysis with percentage breakdown
 * - Batch processing with checkpoint/resume capability
 * - Automatic timeout protection for large mailboxes
 * - Cross-account portability (no hardcoded values)
 * - Comprehensive error handling and logging
 * 
 * CONFIGURATION:
 * All settings are managed via Properties Service or Config sheet.
 * No personal information or account-specific data is hardcoded.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Script Editor (Extensions > Apps Script)
 * 2. Run setupConfiguration() to create config template
 * 3. Customize settings via Properties or Config sheet
 * 4. Run createEmailAnalysis() to generate report
 * 
 * REQUIRED PERMISSIONS:
 * - Gmail (read): Access email metadata
 * - Sheets (write): Create and modify spreadsheets
 * - Drive (write): Create folders and files
 * 
 * @OnlyCurrentDoc
 */

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Get user configuration with defaults
 * Ensures script works across different accounts without modification
 * 
 * @return {Object} Configuration object with all settings
 */
function getConfiguration() {
  // Get user properties (account-specific settings)
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Build configuration with sensible defaults
  const config = {
    // Analysis settings
    analysisSettings: {
      daysToAnalyze: Number(userProperties.getProperty('DAYS_TO_ANALYZE') || 180),
      maxThreads: Number(userProperties.getProperty('MAX_THREADS') || 5000),
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 50),
      includeSpam: userProperties.getProperty('INCLUDE_SPAM') === 'true' || false,
      includeTrash: userProperties.getProperty('INCLUDE_TRASH') === 'true' || false,
      searchQuery: userProperties.getProperty('SEARCH_QUERY') || '',
      excludeLabels: (userProperties.getProperty('EXCLUDE_LABELS') || '').split(',').filter(Boolean)
    },
    
    // Export settings
    exportSettings: {
      createSpreadsheet: userProperties.getProperty('CREATE_SPREADSHEET') !== 'false',
      spreadsheetName: userProperties.getProperty('SPREADSHEET_NAME') || 'Email Analysis Report',
      folderName: userProperties.getProperty('FOLDER_NAME') || 'Email Reports',
      shareWithEmail: userProperties.getProperty('SHARE_WITH_EMAIL') || '',
      exportFormat: userProperties.getProperty('EXPORT_FORMAT') || 'sheets', // sheets, csv, pdf
      includeCharts: userProperties.getProperty('INCLUDE_CHARTS') === 'true' || false
    },
    
    // Processing settings
    processingSettings: {
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 300000), // 5 minutes
      checkpointInterval: Number(userProperties.getProperty('CHECKPOINT_INTERVAL') || 100),
      enableCaching: userProperties.getProperty('ENABLE_CACHING') !== 'false',
      resumeFromCheckpoint: userProperties.getProperty('RESUME_FROM_CHECKPOINT') === 'true' || false
    },
    
    // Display settings
    displaySettings: {
      timezone: userProperties.getProperty('TIMEZONE') || Session.getScriptTimeZone(),
      dateFormat: userProperties.getProperty('DATE_FORMAT') || 'yyyy-MM-dd',
      locale: userProperties.getProperty('LOCALE') || 'en-US',
      sortBy: userProperties.getProperty('SORT_BY') || 'count', // count, sender, date
      sortOrder: userProperties.getProperty('SORT_ORDER') || 'desc' // asc, desc
    },
    
    // Logging settings
    loggingSettings: {
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO', // DEBUG, INFO, WARN, ERROR
      logToSheet: userProperties.getProperty('LOG_TO_SHEET') === 'true' || false,
      logToConsole: userProperties.getProperty('LOG_TO_CONSOLE') !== 'false',
      sendErrorEmail: userProperties.getProperty('SEND_ERROR_EMAIL') === 'true' || false,
      errorEmailTo: userProperties.getProperty('ERROR_EMAIL_TO') || Session.getActiveUser().getEmail()
    }
  };
  
  return config;
}

/**
 * Setup initial configuration
 * Creates a Config sheet with all available settings
 * Users can modify this instead of editing code
 */
function setupConfiguration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Gmail Analysis Configuration');
  
  // Create or get Config sheet
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
  } else {
    configSheet.clear();
  }
  
  // Define configuration template
  const configTemplate = [
    ['Setting Category', 'Setting Name', 'Current Value', 'Default Value', 'Description'],
    ['Analysis', 'DAYS_TO_ANALYZE', '180', '180', 'Number of days to analyze (1-3650)'],
    ['Analysis', 'MAX_THREADS', '5000', '5000', 'Maximum email threads to process'],
    ['Analysis', 'BATCH_SIZE', '50', '50', 'Threads to process per batch (1-100)'],
    ['Analysis', 'INCLUDE_SPAM', 'false', 'false', 'Include spam folder in analysis'],
    ['Analysis', 'INCLUDE_TRASH', 'false', 'false', 'Include trash folder in analysis'],
    ['Analysis', 'SEARCH_QUERY', '', '', 'Additional Gmail search query (optional)'],
    ['Analysis', 'EXCLUDE_LABELS', '', '', 'Comma-separated labels to exclude'],
    ['', '', '', '', ''],
    ['Export', 'CREATE_SPREADSHEET', 'true', 'true', 'Create new spreadsheet for results'],
    ['Export', 'SPREADSHEET_NAME', 'Email Analysis Report', 'Email Analysis Report', 'Name for the results spreadsheet'],
    ['Export', 'FOLDER_NAME', 'Email Reports', 'Email Reports', 'Drive folder for reports'],
    ['Export', 'SHARE_WITH_EMAIL', '', '', 'Email to share results with (optional)'],
    ['Export', 'EXPORT_FORMAT', 'sheets', 'sheets', 'Format: sheets, csv, or pdf'],
    ['Export', 'INCLUDE_CHARTS', 'false', 'false', 'Create visualization charts'],
    ['', '', '', '', ''],
    ['Processing', 'MAX_EXECUTION_TIME', '300000', '300000', 'Max runtime in milliseconds'],
    ['Processing', 'CHECKPOINT_INTERVAL', '100', '100', 'Save progress every N threads'],
    ['Processing', 'ENABLE_CACHING', 'true', 'true', 'Cache processed data'],
    ['Processing', 'RESUME_FROM_CHECKPOINT', 'false', 'false', 'Resume from last checkpoint'],
    ['', '', '', '', ''],
    ['Display', 'TIMEZONE', Session.getScriptTimeZone(), Session.getScriptTimeZone(), 'Timezone for dates'],
    ['Display', 'DATE_FORMAT', 'yyyy-MM-dd', 'yyyy-MM-dd', 'Date format pattern'],
    ['Display', 'LOCALE', 'en-US', 'en-US', 'Locale for formatting'],
    ['Display', 'SORT_BY', 'count', 'count', 'Sort results by: count, sender, date'],
    ['Display', 'SORT_ORDER', 'desc', 'desc', 'Sort order: asc or desc'],
    ['', '', '', '', ''],
    ['Logging', 'LOG_LEVEL', 'INFO', 'INFO', 'Logging level: DEBUG, INFO, WARN, ERROR'],
    ['Logging', 'LOG_TO_SHEET', 'false', 'false', 'Log to spreadsheet'],
    ['Logging', 'LOG_TO_CONSOLE', 'true', 'true', 'Log to console'],
    ['Logging', 'SEND_ERROR_EMAIL', 'false', 'false', 'Email on errors'],
    ['Logging', 'ERROR_EMAIL_TO', Session.getActiveUser().getEmail(), '', 'Email for error notifications']
  ];
  
  // Write configuration to sheet
  const range = configSheet.getRange(1, 1, configTemplate.length, 5);
  range.setValues(configTemplate);
  
  // Format headers
  configSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Auto-resize columns
  configSheet.autoResizeColumns(1, 5);
  
  // Add instructions
  const instructionSheet = ss.getSheetByName('Instructions') || ss.insertSheet('Instructions');
  instructionSheet.clear();
  
  const instructions = [
    ['Gmail Analysis Tool - Setup Instructions'],
    [''],
    ['1. Configuration:'],
    ['   - Review settings in the Config sheet'],
    ['   - Modify "Current Value" column as needed'],
    ['   - Run saveConfiguration() to apply changes'],
    [''],
    ['2. Running Analysis:'],
    ['   - Run createEmailAnalysis() to start'],
    ['   - Check logs for progress'],
    ['   - Results appear in new spreadsheet'],
    [''],
    ['3. Advanced Options:'],
    ['   - Use SEARCH_QUERY for custom filters'],
    ['   - Enable RESUME_FROM_CHECKPOINT for large mailboxes'],
    ['   - Set SHARE_WITH_EMAIL to auto-share results'],
    [''],
    ['4. Troubleshooting:'],
    ['   - Set LOG_LEVEL to DEBUG for detailed logs'],
    ['   - Enable SEND_ERROR_EMAIL for notifications'],
    ['   - Check execution transcript for errors'],
    [''],
    ['For more help, see documentation at:'],
    ['https://github.com/your-repo/gmail-analysis']
  ];
  
  instructionSheet.getRange(1, 1, instructions.length, 1).setValues(instructions);
  instructionSheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  
  // Show success message
  SpreadsheetApp.getUi().alert(
    'Configuration Setup Complete',
    'Review settings in the Config sheet, then run createEmailAnalysis() to start.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  Logger.log('Configuration template created successfully');
}

/**
 * Save configuration from Config sheet to Properties
 * Validates settings before saving
 */
function saveConfiguration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    throw new Error('Config sheet not found. Run setupConfiguration() first.');
  }
  
  const data = configSheet.getDataRange().getValues();
  const userProperties = PropertiesService.getUserProperties();
  
  // Process each configuration row (skip header)
  for (let i = 1; i < data.length; i++) {
    const [category, name, value, defaultValue, description] = data[i];
    
    if (name && value !== '') {
      // Validate before saving
      if (validateConfigValue(name, value)) {
        userProperties.setProperty(name, value);
        Logger.log(`Saved ${name} = ${value}`);
      } else {
        Logger.log(`Invalid value for ${name}: ${value}`);
      }
    }
  }
  
  SpreadsheetApp.getUi().alert('Configuration saved successfully!');
}

/**
 * Validate configuration value
 * 
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @return {boolean} True if valid
 */
function validateConfigValue(key, value) {
  // Add validation rules for each setting
  const validationRules = {
    'DAYS_TO_ANALYZE': (v) => !isNaN(v) && v > 0 && v <= 3650,
    'MAX_THREADS': (v) => !isNaN(v) && v > 0 && v <= 10000,
    'BATCH_SIZE': (v) => !isNaN(v) && v > 0 && v <= 100,
    'INCLUDE_SPAM': (v) => v === 'true' || v === 'false',
    'INCLUDE_TRASH': (v) => v === 'true' || v === 'false',
    'CREATE_SPREADSHEET': (v) => v === 'true' || v === 'false',
    'EXPORT_FORMAT': (v) => ['sheets', 'csv', 'pdf'].includes(v),
    'INCLUDE_CHARTS': (v) => v === 'true' || v === 'false',
    'MAX_EXECUTION_TIME': (v) => !isNaN(v) && v >= 60000 && v <= 360000,
    'CHECKPOINT_INTERVAL': (v) => !isNaN(v) && v > 0 && v <= 1000,
    'ENABLE_CACHING': (v) => v === 'true' || v === 'false',
    'RESUME_FROM_CHECKPOINT': (v) => v === 'true' || v === 'false',
    'SORT_BY': (v) => ['count', 'sender', 'date'].includes(v),
    'SORT_ORDER': (v) => ['asc', 'desc'].includes(v),
    'LOG_LEVEL': (v) => ['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(v),
    'LOG_TO_SHEET': (v) => v === 'true' || v === 'false',
    'LOG_TO_CONSOLE': (v) => v === 'true' || v === 'false',
    'SEND_ERROR_EMAIL': (v) => v === 'true' || v === 'false'
  };
  
  // If no specific rule, allow any value
  const rule = validationRules[key];
  return rule ? rule(value) : true;
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

/**
 * Enhanced logging system with multiple outputs
 * 
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @param {Object} context - Additional context data
 */
function log(level, message, context = {}) {
  const config = getConfiguration();
  const logConfig = config.loggingSettings;
  
  // Check if should log based on level
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  const currentLevelIndex = levels.indexOf(logConfig.logLevel);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex < currentLevelIndex) {
    return; // Skip lower priority messages
  }
  
  // Format log entry
  const timestamp = Utilities.formatDate(new Date(), config.displaySettings.timezone, 'yyyy-MM-dd HH:mm:ss');
  const logEntry = {
    timestamp: timestamp,
    level: level,
    message: message,
    context: context,
    user: Session.getActiveUser().getEmail(),
    scriptId: ScriptApp.getScriptId()
  };
  
  // Log to console
  if (logConfig.logToConsole) {
    console.log(`[${timestamp}] [${level}] ${message}`, context);
  }
  
  // Log to sheet
  if (logConfig.logToSheet) {
    logToSheet(logEntry);
  }
  
  // Send error email if needed
  if (level === 'ERROR' && logConfig.sendErrorEmail) {
    sendErrorNotification(logEntry);
  }
}

/**
 * Log entry to spreadsheet
 * 
 * @param {Object} logEntry - Log entry object
 */
function logToSheet(logEntry) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = ss.getSheetByName('Logs');
    
    if (!logSheet) {
      logSheet = ss.insertSheet('Logs');
      logSheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Level', 'Message', 'Context', 'User']]);
      logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }
    
    logSheet.appendRow([
      logEntry.timestamp,
      logEntry.level,
      logEntry.message,
      JSON.stringify(logEntry.context),
      logEntry.user
    ]);
  } catch (error) {
    console.error('Failed to log to sheet:', error);
  }
}

/**
 * Send error notification email
 * 
 * @param {Object} logEntry - Error log entry
 */
function sendErrorNotification(logEntry) {
  try {
    const config = getConfiguration();
    const recipient = config.loggingSettings.errorEmailTo;
    
    if (!recipient) return;
    
    const subject = `[Gmail Analysis] Error: ${logEntry.message}`;
    const body = `
An error occurred in the Gmail Analysis script:

Time: ${logEntry.timestamp}
Message: ${logEntry.message}
Context: ${JSON.stringify(logEntry.context, null, 2)}
User: ${logEntry.user}
Script: ${logEntry.scriptId}

Please check the script logs for more details.
    `;
    
    GmailApp.sendEmail(recipient, subject, body);
  } catch (error) {
    console.error('Failed to send error email:', error);
  }
}

// ============================================================================
// MAIN ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Main entry point for email analysis
 * Orchestrates the entire analysis process
 */
function createEmailAnalysis() {
  const startTime = new Date().getTime();
  const config = getConfiguration();
  
  log('INFO', 'Starting email analysis', { config: config.analysisSettings });
  
  try {
    // Check for resume from checkpoint
    let checkpoint = null;
    if (config.processingSettings.resumeFromCheckpoint) {
      checkpoint = loadCheckpoint();
      if (checkpoint) {
        log('INFO', 'Resuming from checkpoint', { checkpoint });
      }
    }
    
    // Build search query
    const searchQuery = buildSearchQuery(config);
    log('DEBUG', 'Search query built', { query: searchQuery });
    
    // Search for emails
    const threads = searchEmails(searchQuery, config);
    log('INFO', `Found ${threads.length} threads to process`);
    
    // Process emails in batches
    const results = processEmailBatches(threads, config, checkpoint);
    
    // Generate report
    const reportUrl = generateReport(results, config);
    
    // Log completion
    const duration = new Date().getTime() - startTime;
    log('INFO', 'Analysis complete', {
      duration: duration,
      threadsProcessed: results.totalThreads,
      uniqueSenders: results.uniqueSenders,
      reportUrl: reportUrl
    });
    
    // Clear checkpoint on success
    if (config.processingSettings.resumeFromCheckpoint) {
      clearCheckpoint();
    }
    
    // Show success message
    SpreadsheetApp.getUi().alert(
      'Analysis Complete',
      `Processed ${results.totalThreads} threads from ${results.uniqueSenders} unique senders.\n\nReport: ${reportUrl}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    log('ERROR', 'Analysis failed', { error: error.toString(), stack: error.stack });
    
    // Save checkpoint for resume
    if (config.processingSettings.enableCaching) {
      saveCheckpoint(getCurrentState());
    }
    
    throw error;
  }
}

/**
 * Build Gmail search query from configuration
 * 
 * @param {Object} config - Configuration object
 * @return {string} Gmail search query
 */
function buildSearchQuery(config) {
  const parts = [];
  
  // Date range
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.analysisSettings.daysToAnalyze);
  parts.push(`after:${Utilities.formatDate(cutoffDate, 'GMT', 'yyyy/MM/dd')}`);
  
  // Include/exclude folders
  if (!config.analysisSettings.includeSpam) {
    parts.push('-in:spam');
  }
  if (!config.analysisSettings.includeTrash) {
    parts.push('-in:trash');
  }
  
  // Exclude labels
  config.analysisSettings.excludeLabels.forEach(label => {
    if (label) {
      parts.push(`-label:${label}`);
    }
  });
  
  // Custom search query
  if (config.analysisSettings.searchQuery) {
    parts.push(config.analysisSettings.searchQuery);
  }
  
  return parts.join(' ');
}

/**
 * Search for emails matching criteria
 * 
 * @param {string} query - Gmail search query
 * @param {Object} config - Configuration object
 * @return {Array} Array of GmailThread objects
 */
function searchEmails(query, config) {
  const maxThreads = config.analysisSettings.maxThreads;
  const threads = [];
  let start = 0;
  const batchSize = 500; // Gmail API limit
  
  while (start < maxThreads) {
    const batch = GmailApp.search(query, start, Math.min(batchSize, maxThreads - start));
    
    if (batch.length === 0) {
      break; // No more results
    }
    
    threads.push(...batch);
    start += batch.length;
    
    log('DEBUG', `Fetched ${threads.length} threads so far`);
    
    // Check execution time
    if (isTimeoutApproaching(config)) {
      log('WARN', 'Approaching timeout limit, stopping search');
      break;
    }
  }
  
  return threads;
}

/**
 * Process email threads in batches
 * 
 * @param {Array} threads - Array of GmailThread objects
 * @param {Object} config - Configuration object
 * @param {Object} checkpoint - Optional checkpoint to resume from
 * @return {Object} Processing results
 */
function processEmailBatches(threads, config, checkpoint) {
  const results = {
    emailCounts: checkpoint ? checkpoint.emailCounts : {},
    totalThreads: checkpoint ? checkpoint.totalThreads : 0,
    totalMessages: checkpoint ? checkpoint.totalMessages : 0,
    uniqueSenders: 0,
    startTime: new Date(),
    endTime: null
  };
  
  const batchSize = config.analysisSettings.batchSize;
  const startIndex = checkpoint ? checkpoint.lastIndex : 0;
  
  log('INFO', `Processing ${threads.length} threads in batches of ${batchSize}`);
  
  for (let i = startIndex; i < threads.length; i += batchSize) {
    const batch = threads.slice(i, Math.min(i + batchSize, threads.length));
    
    log('DEBUG', `Processing batch ${Math.floor(i/batchSize) + 1}`, {
      start: i,
      size: batch.length
    });
    
    // Process batch
    batch.forEach(thread => {
      try {
        const messages = thread.getMessages();
        results.totalThreads++;
        results.totalMessages += messages.length;
        
        messages.forEach(message => {
          const from = extractEmailAddress(message.getFrom());
          if (from && isValidEmail(from)) {
            results.emailCounts[from] = (results.emailCounts[from] || 0) + 1;
          }
        });
      } catch (error) {
        log('WARN', `Failed to process thread: ${error.message}`, { threadId: thread.getId() });
      }
    });
    
    // Save checkpoint periodically
    if ((i + batchSize) % config.processingSettings.checkpointInterval === 0) {
      saveCheckpoint({
        lastIndex: i + batchSize,
        emailCounts: results.emailCounts,
        totalThreads: results.totalThreads,
        totalMessages: results.totalMessages
      });
      log('DEBUG', 'Checkpoint saved', { index: i + batchSize });
    }
    
    // Check timeout
    if (isTimeoutApproaching(config)) {
      log('WARN', 'Approaching timeout, saving progress');
      saveCheckpoint({
        lastIndex: i + batchSize,
        emailCounts: results.emailCounts,
        totalThreads: results.totalThreads,
        totalMessages: results.totalMessages
      });
      throw new Error('Execution timeout - checkpoint saved. Run again to resume.');
    }
  }
  
  results.uniqueSenders = Object.keys(results.emailCounts).length;
  results.endTime = new Date();
  
  return results;
}

/**
 * Generate analysis report
 * 
 * @param {Object} results - Analysis results
 * @param {Object} config - Configuration object
 * @return {string} Report URL
 */
function generateReport(results, config) {
  log('INFO', 'Generating report');
  
  // Create or get report folder
  const folder = getOrCreateFolder(config.exportSettings.folderName);
  
  // Create spreadsheet
  const timestamp = Utilities.formatDate(new Date(), config.displaySettings.timezone, config.displaySettings.dateFormat + ' HH:mm:ss');
  const spreadsheetName = `${config.exportSettings.spreadsheetName} - ${timestamp}`;
  const spreadsheet = SpreadsheetApp.create(spreadsheetName);
  
  // Move to folder
  const file = DriveApp.getFileById(spreadsheet.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  // Create summary sheet
  const summarySheet = spreadsheet.getActiveSheet();
  summarySheet.setName('Summary');
  
  // Add summary data
  const summaryData = [
    ['Email Analysis Report'],
    [''],
    ['Analysis Period', `${config.analysisSettings.daysToAnalyze} days`],
    ['Report Generated', timestamp],
    ['Total Threads', results.totalThreads],
    ['Total Messages', results.totalMessages],
    ['Unique Senders', results.uniqueSenders],
    [''],
    ['Configuration'],
    ['Search Query', buildSearchQuery(config)],
    ['Include Spam', config.analysisSettings.includeSpam],
    ['Include Trash', config.analysisSettings.includeTrash],
    ['Max Threads', config.analysisSettings.maxThreads]
  ];
  
  summarySheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  summarySheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  summarySheet.getRange(3, 1, summaryData.length - 2, 1).setFontWeight('bold');
  
  // Create details sheet
  const detailsSheet = spreadsheet.insertSheet('Sender Analysis');
  
  // Prepare sender data
  const senderData = Object.entries(results.emailCounts)
    .map(([email, count]) => {
      const percentage = ((count / results.totalMessages) * 100).toFixed(2);
      const domain = email.split('@')[1] || 'unknown';
      return [email, count, `${percentage}%`, domain];
    })
    .sort((a, b) => {
      if (config.displaySettings.sortBy === 'count') {
        return config.displaySettings.sortOrder === 'desc' ? b[1] - a[1] : a[1] - b[1];
      } else if (config.displaySettings.sortBy === 'sender') {
        return config.displaySettings.sortOrder === 'desc' 
          ? b[0].localeCompare(a[0]) 
          : a[0].localeCompare(b[0]);
      }
      return 0;
    });
  
  // Add headers
  const headers = [['Sender Email', 'Message Count', 'Percentage', 'Domain']];
  detailsSheet.getRange(1, 1, 1, 4).setValues(headers);
  detailsSheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
  
  // Add data
  if (senderData.length > 0) {
    detailsSheet.getRange(2, 1, senderData.length, 4).setValues(senderData);
  }
  
  // Format sheet
  detailsSheet.autoResizeColumns(1, 4);
  detailsSheet.setFrozenRows(1);
  
  // Add charts if requested
  if (config.exportSettings.includeCharts) {
    createCharts(spreadsheet, senderData);
  }
  
  // Share if requested
  if (config.exportSettings.shareWithEmail) {
    try {
      spreadsheet.addEditor(config.exportSettings.shareWithEmail);
      log('INFO', `Shared report with ${config.exportSettings.shareWithEmail}`);
    } catch (error) {
      log('WARN', `Failed to share with ${config.exportSettings.shareWithEmail}: ${error.message}`);
    }
  }
  
  // Export to other formats if requested
  if (config.exportSettings.exportFormat !== 'sheets') {
    exportToFormat(spreadsheet, config.exportSettings.exportFormat, folder);
  }
  
  return spreadsheet.getUrl();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract email address from sender string
 * Handles formats like "Name <email@domain.com>" and "email@domain.com"
 * 
 * @param {string} sender - Sender string from email
 * @return {string} Clean email address
 */
function extractEmailAddress(sender) {
  if (!sender) return null;
  
  // Match email in angle brackets
  const match = sender.match(/<([^>]+)>/);
  if (match) {
    return match[1].toLowerCase().trim();
  }
  
  // Assume the whole string is an email
  return sender.toLowerCase().trim();
}

/**
 * Validate email address format
 * 
 * @param {string} email - Email address to validate
 * @return {boolean} True if valid email format
 */
function isValidEmail(email) {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if execution timeout is approaching
 * 
 * @param {Object} config - Configuration object
 * @return {boolean} True if timeout approaching
 */
function isTimeoutApproaching(config) {
  const maxTime = config.processingSettings.maxExecutionTime;
  const elapsed = new Date().getTime() - executionStartTime;
  const buffer = 30000; // 30 second buffer
  
  return elapsed > (maxTime - buffer);
}

// Track execution start time globally
const executionStartTime = new Date().getTime();

/**
 * Get or create Drive folder
 * 
 * @param {string} folderName - Name of folder to create/get
 * @return {Folder} Drive folder object
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  }
  
  return DriveApp.createFolder(folderName);
}

/**
 * Create visualization charts
 * 
 * @param {Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Array} data - Data for charts
 */
function createCharts(spreadsheet, data) {
  const chartSheet = spreadsheet.insertSheet('Charts');
  
  // Top 10 senders pie chart
  const top10Data = data.slice(0, 10);
  const chartBuilder = chartSheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(spreadsheet.getSheetByName('Sender Analysis').getRange(1, 1, 11, 2))
    .setPosition(1, 1, 0, 0)
    .setOption('title', 'Top 10 Email Senders')
    .setOption('width', 600)
    .setOption('height', 400);
  
  chartSheet.insertChart(chartBuilder.build());
  
  log('DEBUG', 'Charts created successfully');
}

/**
 * Export spreadsheet to different format
 * 
 * @param {Spreadsheet} spreadsheet - Spreadsheet to export
 * @param {string} format - Export format (csv, pdf)
 * @param {Folder} folder - Destination folder
 */
function exportToFormat(spreadsheet, format, folder) {
  try {
    const file = DriveApp.getFileById(spreadsheet.getId());
    
    if (format === 'pdf') {
      const blob = file.getAs('application/pdf');
      folder.createFile(blob.setName(spreadsheet.getName() + '.pdf'));
      log('INFO', 'Exported to PDF');
    } else if (format === 'csv') {
      const sheets = spreadsheet.getSheets();
      sheets.forEach(sheet => {
        const data = sheet.getDataRange().getValues();
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = Utilities.newBlob(csv, 'text/csv', `${sheet.getName()}.csv`);
        folder.createFile(blob);
      });
      log('INFO', 'Exported to CSV');
    }
  } catch (error) {
    log('WARN', `Export to ${format} failed: ${error.message}`);
  }
}

// ============================================================================
// CHECKPOINT MANAGEMENT
// ============================================================================

/**
 * Save processing checkpoint for resume capability
 * 
 * @param {Object} state - Current processing state
 */
function saveCheckpoint(state) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('analysisCheckpoint', JSON.stringify({
    ...state,
    timestamp: new Date().toISOString()
  }));
}

/**
 * Load saved checkpoint
 * 
 * @return {Object} Checkpoint data or null
 */
function loadCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const checkpoint = scriptProperties.getProperty('analysisCheckpoint');
  
  if (checkpoint) {
    try {
      return JSON.parse(checkpoint);
    } catch (error) {
      log('WARN', 'Failed to parse checkpoint', { error: error.message });
    }
  }
  
  return null;
}

/**
 * Clear saved checkpoint
 */
function clearCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('analysisCheckpoint');
  log('DEBUG', 'Checkpoint cleared');
}

/**
 * Get current processing state
 * 
 * @return {Object} Current state object
 */
function getCurrentState() {
  // This would be implemented based on current processing context
  return {
    lastIndex: 0,
    emailCounts: {},
    totalThreads: 0,
    totalMessages: 0
  };
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

/**
 * Create custom menu when spreadsheet opens
 * Called automatically via trigger
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📧 Email Analysis')
    .addItem('⚙️ Setup Configuration', 'setupConfiguration')
    .addItem('💾 Save Configuration', 'saveConfiguration')
    .addSeparator()
    .addItem('▶️ Run Analysis', 'createEmailAnalysis')
    .addItem('⏸️ Resume from Checkpoint', 'resumeFromCheckpoint')
    .addSeparator()
    .addItem('📊 View Last Report', 'viewLastReport')
    .addItem('🗑️ Clear All Data', 'clearAllData')
    .addSeparator()
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

/**
 * Resume analysis from checkpoint
 */
function resumeFromCheckpoint() {
  const config = getConfiguration();
  config.processingSettings.resumeFromCheckpoint = true;
  createEmailAnalysis();
}

/**
 * View last generated report
 */
function viewLastReport() {
  const config = getConfiguration();
  const folder = getOrCreateFolder(config.exportSettings.folderName);
  const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  
  if (files.hasNext()) {
    const latestFile = files.next();
    const url = latestFile.getUrl();
    
    const htmlOutput = HtmlService
      .createHtmlOutput(`<p>Opening last report...</p><script>window.open('${url}','_blank');google.script.host.close();</script>`)
      .setWidth(200)
      .setHeight(100);
    
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Opening Report');
  } else {
    SpreadsheetApp.getUi().alert('No reports found. Run analysis first.');
  }
}

/**
 * Clear all saved data and checkpoints
 */
function clearAllData() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert(
    'Clear All Data',
    'This will clear all saved configurations and checkpoints. Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response === ui.Button.YES) {
    PropertiesService.getUserProperties().deleteAllProperties();
    PropertiesService.getScriptProperties().deleteAllProperties();
    
    ui.alert('All data cleared successfully.');
  }
}

/**
 * Show help dialog
 */
function showHelp() {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Gmail Analysis Tool - Help</h2>
      
      <h3>Quick Start:</h3>
      <ol>
        <li>Run <b>Setup Configuration</b> to create config sheet</li>
        <li>Adjust settings in the Config sheet as needed</li>
        <li>Run <b>Save Configuration</b> to apply changes</li>
        <li>Run <b>Run Analysis</b> to generate report</li>
      </ol>
      
      <h3>Features:</h3>
      <ul>
        <li>Analyze email patterns over configurable time period</li>
        <li>Identify top senders and communication patterns</li>
        <li>Export results to multiple formats</li>
        <li>Resume from checkpoint if timeout occurs</li>
        <li>Share reports automatically</li>
      </ul>
      
      <h3>Configuration Options:</h3>
      <ul>
        <li><b>DAYS_TO_ANALYZE:</b> How far back to search (1-3650 days)</li>
        <li><b>MAX_THREADS:</b> Maximum emails to process</li>
        <li><b>BATCH_SIZE:</b> Processing batch size (affects performance)</li>
        <li><b>EXPORT_FORMAT:</b> Output format (sheets, csv, pdf)</li>
        <li><b>INCLUDE_CHARTS:</b> Create visualizations</li>
      </ul>
      
      <h3>Troubleshooting:</h3>
      <ul>
        <li>For large mailboxes, enable checkpoint/resume</li>
        <li>Reduce BATCH_SIZE if experiencing timeouts</li>
        <li>Check Logs sheet for detailed debugging</li>
        <li>Set LOG_LEVEL to DEBUG for verbose output</li>
      </ul>
      
      <h3>Privacy & Security:</h3>
      <ul>
        <li>No data is sent to external services</li>
        <li>All processing happens in your Google account</li>
        <li>Configuration is stored in script properties</li>
        <li>Reports are saved to your Drive</li>
      </ul>
      
      <p style="margin-top: 20px;">
        <b>Version:</b> 2.0.0<br>
        <b>License:</b> MIT<br>
        <b>Support:</b> Check documentation for updates
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(600)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Help - Gmail Analysis Tool');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Install script and set up triggers
 * Run this once when first installing the script
 */
function install() {
  // Set up time-based trigger for maintenance
  ScriptApp.newTrigger('maintenance')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
  
  // Set up menu trigger
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();
  
  // Initialize configuration
  setupConfiguration();
  
  log('INFO', 'Script installed successfully');
}

/**
 * Daily maintenance tasks
 * Called by time-based trigger
 */
function maintenance() {
  // Clean old checkpoints
  const scriptProperties = PropertiesService.getScriptProperties();
  const checkpoint = scriptProperties.getProperty('analysisCheckpoint');
  
  if (checkpoint) {
    try {
      const data = JSON.parse(checkpoint);
      const checkpointDate = new Date(data.timestamp);
      const daysSince = (new Date() - checkpointDate) / (1000 * 60 * 60 * 24);
      
      if (daysSince > 7) {
        clearCheckpoint();
        log('INFO', 'Cleared old checkpoint', { age: daysSince });
      }
    } catch (error) {
      log('WARN', 'Failed to process checkpoint during maintenance', { error: error.message });
    }
  }
  
  // Clean old logs
  cleanOldLogs();
}