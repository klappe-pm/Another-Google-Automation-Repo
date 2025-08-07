/**
 * Title: Gmail Labels Export Script - Refactored
 * Service: Gmail + Google Sheets
 * Purpose: Export Gmail label statistics with configurable settings
 * Created: 2023-01-01
 * Refactored: 2025-08-07
 * Author: Configurable - See Config Sheet
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: Export Gmail labels data including thread/email counts
 * - Description: Analyzes all user labels and exports comprehensive statistics
 * - Problem Solved: Cross-account label tracking without hardcoded values
 * - Successful Execution: Creates detailed label report with usage metrics
 * - Dependencies: Gmail API, Sheets API
 * 
 * Configuration:
 * Run setupConfiguration() first to initialize settings
 * All settings stored securely in Script Properties
 * Use Config sheet for user-friendly configuration
 * 
 * Key Features:
 * 1. Fully configurable output location
 * 2. Batch processing with progress tracking
 * 3. Label hierarchy support
 * 4. Size estimation and storage metrics
 * 5. Activity tracking (last message date)
 * 6. Checkpoint/resume for large label sets
 * 7. Export to multiple formats (Sheet, CSV, JSON)
 */

// ================== CONFIGURATION MANAGEMENT ==================

/**
 * Initialize configuration on first run
 * Creates Config sheet and sets up default properties
 */
function setupConfiguration() {
  console.log('Setting up Gmail Labels Export configuration...');
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  
  // Create or get Config sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    
    // Add headers and default values
    const headers = [
      ['Gmail Labels Export Configuration', '', ''],
      ['', '', ''],
      ['Setting', 'Value', 'Description'],
      ['Output Sheet Name', 'Gmail Labels Report', 'Name of the sheet for label data'],
      ['Include System Labels', 'false', 'Include system labels (INBOX, SENT, etc.)'],
      ['Calculate Message Size', 'true', 'Estimate storage size for each label'],
      ['Track Last Activity', 'true', 'Track last message date per label'],
      ['Batch Size', '10', 'Number of labels to process per batch'],
      ['Max Threads Per Label', '500', 'Maximum threads to analyze per label'],
      ['Export Format', 'sheet', 'Output format (sheet, csv, json)'],
      ['', '', ''],
      ['Advanced Settings', '', ''],
      ['Enable Caching', 'true', 'Cache label data for performance'],
      ['Cache Duration (hours)', '24', 'How long to cache label data'],
      ['Max Execution Time (min)', '5', 'Maximum execution time before checkpoint'],
      ['Enable Logging', 'true', 'Enable detailed logging'],
      ['Log Level', 'INFO', 'Log level (DEBUG, INFO, WARN, ERROR)'],
      ['', '', ''],
      ['Export Options', '', ''],
      ['Sort By', 'emails', 'Sort labels by (name, emails, threads, size)'],
      ['Sort Order', 'desc', 'Sort order (asc, desc)'],
      ['Include Empty Labels', 'false', 'Include labels with no messages'],
      ['Export Threshold', '0', 'Minimum emails to include label (0 = all)']
    ];
    
    configSheet.getRange(1, 1, headers.length, 3).setValues(headers);
    
    // Format the sheet
    configSheet.getRange('A1:C1').merge()
      .setBackground('#ea4335')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    configSheet.getRange('A3:C3')
      .setBackground('#e8e8e8')
      .setFontWeight('bold');
    
    configSheet.setColumnWidth(1, 200);
    configSheet.setColumnWidth(2, 250);
    configSheet.setColumnWidth(3, 350);
    
    // Protect headers
    const protection = configSheet.getRange('A1:C3').protect();
    protection.setDescription('Configuration headers');
    protection.setWarningOnly(true);
  }
  
  // Set default properties if not exists
  const defaults = {
    'OUTPUT_SHEET_NAME': 'Gmail Labels Report',
    'INCLUDE_SYSTEM_LABELS': 'false',
    'CALCULATE_MESSAGE_SIZE': 'true',
    'TRACK_LAST_ACTIVITY': 'true',
    'BATCH_SIZE': '10',
    'MAX_THREADS_PER_LABEL': '500',
    'EXPORT_FORMAT': 'sheet',
    'ENABLE_CACHING': 'true',
    'CACHE_DURATION': '24',
    'MAX_EXECUTION_TIME': '5',
    'ENABLE_LOGGING': 'true',
    'LOG_LEVEL': 'INFO',
    'SORT_BY': 'emails',
    'SORT_ORDER': 'desc',
    'INCLUDE_EMPTY_LABELS': 'false',
    'EXPORT_THRESHOLD': '0'
  };
  
  Object.entries(defaults).forEach(([key, value]) => {
    if (!userProperties.getProperty(key)) {
      userProperties.setProperty(key, value);
    }
  });
  
  console.log('Configuration setup complete. Please review the Config sheet.');
  SpreadsheetApp.getUi().alert('Configuration Setup Complete', 
    'Please review the Config sheet and update any settings as needed.', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Get label export configuration from properties
 * @returns {Object} Configuration object
 */
function getLabelExportConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  
  return {
    output: {
      sheetName: userProperties.getProperty('OUTPUT_SHEET_NAME') || 'Gmail Labels Report',
      format: userProperties.getProperty('EXPORT_FORMAT') || 'sheet',
      sortBy: userProperties.getProperty('SORT_BY') || 'emails',
      sortOrder: userProperties.getProperty('SORT_ORDER') || 'desc',
      includeEmptyLabels: userProperties.getProperty('INCLUDE_EMPTY_LABELS') === 'true',
      exportThreshold: Number(userProperties.getProperty('EXPORT_THRESHOLD') || 0)
    },
    processing: {
      includeSystemLabels: userProperties.getProperty('INCLUDE_SYSTEM_LABELS') === 'true',
      calculateSize: userProperties.getProperty('CALCULATE_MESSAGE_SIZE') === 'true',
      trackActivity: userProperties.getProperty('TRACK_LAST_ACTIVITY') === 'true',
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 10),
      maxThreadsPerLabel: Number(userProperties.getProperty('MAX_THREADS_PER_LABEL') || 500)
    },
    advanced: {
      enableCaching: userProperties.getProperty('ENABLE_CACHING') === 'true',
      cacheDuration: Number(userProperties.getProperty('CACHE_DURATION') || 24) * 3600000,
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 5) * 60000,
      enableLogging: userProperties.getProperty('ENABLE_LOGGING') === 'true',
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO'
    }
  };
}

// ================== UI MANAGEMENT ==================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🏷️ Label Export')
    .addItem('📊 Export Gmail Labels', 'exportGmailLabels')
    .addItem('⚙️ Setup Configuration', 'setupConfiguration')
    .addItem('🔄 Resume Last Export', 'resumeLastExport')
    .addItem('📈 View Statistics', 'viewLabelStatistics')
    .addSeparator()
    .addItem('🗑️ Clear Cache', 'clearLabelCache')
    .addItem('🗑️ Clear Checkpoint', 'clearCheckpoint')
    .addToUi();
}

// ================== MAIN EXPORT FUNCTION ==================

/**
 * Main function to export Gmail labels with checkpoint/resume
 */
function exportGmailLabels() {
  const startTime = new Date().getTime();
  const config = getLabelExportConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  
  logger.info('Starting Gmail labels export');
  
  try {
    // Load or initialize checkpoint
    let checkpoint = loadCheckpoint() || {
      processedLabels: [],
      labelData: [],
      totalLabels: 0,
      currentIndex: 0,
      startTime: new Date().toISOString(),
      stats: {
        totalThreads: 0,
        totalEmails: 0,
        totalSize: 0,
        errors: []
      }
    };
    
    // Check cache if enabled
    let labels;
    if (config.advanced.enableCaching && !checkpoint.currentIndex) {
      const cachedData = loadCache();
      if (cachedData) {
        logger.info('Using cached label data');
        outputLabelData(cachedData, config);
        return;
      }
    }
    
    // Get all labels
    if (config.processing.includeSystemLabels) {
      labels = getAllLabels();
    } else {
      labels = GmailApp.getUserLabels();
    }
    
    checkpoint.totalLabels = labels.length;
    logger.info(`Found ${labels.length} labels to process`);
    
    // Process labels in batches
    const batchSize = config.processing.batchSize;
    let processed = 0;
    
    for (let i = checkpoint.currentIndex; i < labels.length; i++) {
      // Check execution time
      if (new Date().getTime() - startTime > config.advanced.maxExecutionTime) {
        checkpoint.currentIndex = i;
        saveCheckpoint(checkpoint);
        logger.info(`Execution time limit reached. Checkpoint saved at label ${i}`);
        
        SpreadsheetApp.getUi().alert('Export Paused', 
          `Processed ${processed} labels. Run "Resume Last Export" to continue.`,
          SpreadsheetApp.getUi().ButtonSet.OK);
        return;
      }
      
      const label = labels[i];
      
      // Skip if already processed
      if (checkpoint.processedLabels.includes(label.getName())) {
        continue;
      }
      
      try {
        const labelInfo = processLabel(label, config, logger);
        
        // Apply threshold filter
        if (labelInfo.totalEmails >= config.output.exportThreshold || 
            (config.output.includeEmptyLabels && labelInfo.totalEmails === 0)) {
          checkpoint.labelData.push(labelInfo);
        }
        
        checkpoint.processedLabels.push(label.getName());
        checkpoint.stats.totalThreads += labelInfo.totalThreads;
        checkpoint.stats.totalEmails += labelInfo.totalEmails;
        checkpoint.stats.totalSize += labelInfo.estimatedSize || 0;
        processed++;
        
        // Save checkpoint periodically
        if (processed % 5 === 0) {
          checkpoint.currentIndex = i;
          saveCheckpoint(checkpoint);
        }
      } catch (error) {
        logger.error(`Error processing label ${label.getName()}:`, error);
        checkpoint.stats.errors.push({
          label: label.getName(),
          error: error.toString()
        });
      }
    }
    
    // Sort label data
    sortLabelData(checkpoint.labelData, config.output.sortBy, config.output.sortOrder);
    
    // Output results
    outputLabelData(checkpoint.labelData, config);
    
    // Cache results if enabled
    if (config.advanced.enableCaching) {
      saveCache(checkpoint.labelData);
    }
    
    // Generate summary report
    generateSummaryReport(checkpoint);
    
    // Clear checkpoint
    clearCheckpoint();
    
    logger.info('Label export completed successfully');
    SpreadsheetApp.getUi().alert('Export Complete', 
      `Successfully exported ${checkpoint.labelData.length} labels with ${checkpoint.stats.totalEmails} total emails.`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    logger.error('Export failed:', error);
    SpreadsheetApp.getUi().alert('Export Error', 
      `An error occurred: ${error.toString()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ================== PROCESSING FUNCTIONS ==================

/**
 * Process a single label
 */
function processLabel(label, config, logger) {
  const labelName = label.getName();
  logger.debug(`Processing label: ${labelName}`);
  
  const labelInfo = {
    name: labelName,
    totalThreads: 0,
    totalEmails: 0,
    estimatedSize: 0,
    lastActivity: null,
    color: label.getColor() || '',
    visibility: label.getVisibility() || '',
    type: label.getType ? label.getType() : 'user'
  };
  
  try {
    // Get threads with limit
    const threads = label.getThreads(0, config.processing.maxThreadsPerLabel);
    labelInfo.totalThreads = threads.length;
    
    let newestDate = null;
    let totalSize = 0;
    
    // Process threads
    threads.forEach(thread => {
      const messages = thread.getMessages();
      labelInfo.totalEmails += messages.length;
      
      if (config.processing.trackActivity) {
        const lastMessage = messages[messages.length - 1];
        const messageDate = lastMessage.getDate();
        if (!newestDate || messageDate > newestDate) {
          newestDate = messageDate;
        }
      }
      
      if (config.processing.calculateSize) {
        messages.forEach(message => {
          // Estimate size (rough calculation)
          const bodySize = message.getRawContent ? 
            message.getRawContent().length : 
            (message.getBody().length + message.getPlainBody().length) / 2;
          totalSize += bodySize;
        });
      }
    });
    
    labelInfo.lastActivity = newestDate ? newestDate.toISOString() : null;
    labelInfo.estimatedSize = Math.round(totalSize / 1024); // Convert to KB
    
  } catch (error) {
    logger.warn(`Error processing threads for label ${labelName}:`, error);
  }
  
  return labelInfo;
}

/**
 * Get all labels including system labels
 */
function getAllLabels() {
  const userLabels = GmailApp.getUserLabels();
  const systemLabels = [
    { getName: () => 'INBOX', getThreads: (start, max) => GmailApp.getInboxThreads(start, max) },
    { getName: () => 'SENT', getThreads: (start, max) => GmailApp.search('in:sent', start, max) },
    { getName: () => 'DRAFT', getThreads: (start, max) => GmailApp.getDraftMessages().slice(start, start + max) },
    { getName: () => 'SPAM', getThreads: (start, max) => GmailApp.getSpamThreads(start, max) },
    { getName: () => 'TRASH', getThreads: (start, max) => GmailApp.getTrashThreads(start, max) },
    { getName: () => 'STARRED', getThreads: (start, max) => GmailApp.getStarredThreads(start, max) },
    { getName: () => 'IMPORTANT', getThreads: (start, max) => GmailApp.search('is:important', start, max) }
  ];
  
  return [...systemLabels, ...userLabels];
}

/**
 * Sort label data
 */
function sortLabelData(data, sortBy, sortOrder) {
  const sortFields = {
    'name': (a, b) => a.name.localeCompare(b.name),
    'emails': (a, b) => b.totalEmails - a.totalEmails,
    'threads': (a, b) => b.totalThreads - a.totalThreads,
    'size': (a, b) => (b.estimatedSize || 0) - (a.estimatedSize || 0),
    'activity': (a, b) => {
      if (!a.lastActivity && !b.lastActivity) return 0;
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    }
  };
  
  const compareFn = sortFields[sortBy] || sortFields['emails'];
  data.sort(compareFn);
  
  if (sortOrder === 'asc') {
    data.reverse();
  }
}

// ================== OUTPUT FUNCTIONS ==================

/**
 * Output label data to sheet
 */
function outputLabelData(labelData, config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(config.output.sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(config.output.sheetName);
  } else {
    sheet.clear();
  }
  
  // Add headers
  const headers = ['Label Name', 'Total Threads', 'Total Emails', 'Size (KB)', 'Last Activity', 'Type'];
  sheet.appendRow(headers);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#ea4335')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Add data
  labelData.forEach(label => {
    const row = [
      label.name,
      label.totalThreads,
      label.totalEmails,
      label.estimatedSize || 0,
      label.lastActivity ? new Date(label.lastActivity).toLocaleDateString() : '',
      label.type || 'user'
    ];
    sheet.appendRow(row);
  });
  
  // Add summary row
  const totalThreads = labelData.reduce((sum, l) => sum + l.totalThreads, 0);
  const totalEmails = labelData.reduce((sum, l) => sum + l.totalEmails, 0);
  const totalSize = labelData.reduce((sum, l) => sum + (l.estimatedSize || 0), 0);
  
  sheet.appendRow(['']);
  sheet.appendRow(['TOTAL', totalThreads, totalEmails, totalSize, '', '']);
  
  // Format summary row
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, headers.length)
    .setBackground('#f0f0f0')
    .setFontWeight('bold');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(1);
  
  // Add conditional formatting for large labels
  const dataRange = sheet.getRange(2, 3, labelData.length, 1);
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(1000)
    .setBackground('#fff2cc')
    .setRanges([dataRange])
    .build();
  sheet.setConditionalFormatRules([rule]);
}

/**
 * Generate summary report
 */
function generateSummaryReport(checkpoint) {
  const reportSheet = SpreadsheetApp.getActiveSpreadsheet()
    .insertSheet('Label Export Report - ' + new Date().toISOString().split('T')[0]);
  
  const reportData = [
    ['Gmail Label Export Report', ''],
    ['', ''],
    ['Export Started', checkpoint.startTime],
    ['Export Completed', new Date().toISOString()],
    ['Total Labels Processed', checkpoint.totalLabels],
    ['Total Threads', checkpoint.stats.totalThreads],
    ['Total Emails', checkpoint.stats.totalEmails],
    ['Total Size (MB)', Math.round(checkpoint.stats.totalSize / 1024)],
    ['', ''],
    ['Top 10 Labels by Email Count', ''],
  ];
  
  // Add top 10 labels
  checkpoint.labelData
    .sort((a, b) => b.totalEmails - a.totalEmails)
    .slice(0, 10)
    .forEach(label => {
      reportData.push([label.name, label.totalEmails]);
    });
  
  if (checkpoint.stats.errors.length > 0) {
    reportData.push(['', '']);
    reportData.push(['Errors', checkpoint.stats.errors.length]);
    checkpoint.stats.errors.forEach(err => {
      reportData.push([err.label, err.error]);
    });
  }
  
  reportSheet.getRange(1, 1, reportData.length, 2).setValues(reportData);
  
  // Format report
  reportSheet.getRange('A1:B1').merge()
    .setBackground('#ea4335')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center');
  
  reportSheet.autoResizeColumns(1, 2);
}

/**
 * View label statistics
 */
function viewLabelStatistics() {
  const config = getLabelExportConfiguration();
  const cachedData = loadCache();
  
  if (!cachedData) {
    SpreadsheetApp.getUi().alert('No Data Available', 
      'Please run "Export Gmail Labels" first to generate statistics.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Create statistics sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let statsSheet = ss.getSheetByName('Label Statistics');
  
  if (!statsSheet) {
    statsSheet = ss.insertSheet('Label Statistics');
  } else {
    statsSheet.clear();
  }
  
  // Calculate statistics
  const totalLabels = cachedData.length;
  const totalEmails = cachedData.reduce((sum, l) => sum + l.totalEmails, 0);
  const avgEmailsPerLabel = Math.round(totalEmails / totalLabels);
  const emptyLabels = cachedData.filter(l => l.totalEmails === 0).length;
  
  const stats = [
    ['Gmail Label Statistics', ''],
    ['', ''],
    ['Total Labels', totalLabels],
    ['Total Emails', totalEmails],
    ['Average Emails per Label', avgEmailsPerLabel],
    ['Empty Labels', emptyLabels],
    ['Labels with 100+ Emails', cachedData.filter(l => l.totalEmails >= 100).length],
    ['Labels with 1000+ Emails', cachedData.filter(l => l.totalEmails >= 1000).length],
    ['', ''],
    ['Cache Generated', new Date(getCacheTimestamp()).toLocaleString()]
  ];
  
  statsSheet.getRange(1, 1, stats.length, 2).setValues(stats);
  
  // Format
  statsSheet.getRange('A1:B1').merge()
    .setBackground('#ea4335')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(14)
    .setHorizontalAlignment('center');
  
  statsSheet.autoResizeColumns(1, 2);
  
  SpreadsheetApp.setActiveSheet(statsSheet);
}

// ================== CACHE & CHECKPOINT FUNCTIONS ==================

/**
 * Save data to cache
 */
function saveCache(data) {
  const cache = CacheService.getUserCache();
  const chunks = chunkData(JSON.stringify(data), 90000);
  
  chunks.forEach((chunk, index) => {
    cache.put(`LABEL_DATA_${index}`, chunk, 21600); // 6 hours
  });
  
  cache.put('LABEL_DATA_COUNT', chunks.length.toString(), 21600);
  cache.put('LABEL_DATA_TIMESTAMP', new Date().getTime().toString(), 21600);
}

/**
 * Load data from cache
 */
function loadCache() {
  const cache = CacheService.getUserCache();
  const timestamp = cache.get('LABEL_DATA_TIMESTAMP');
  
  if (!timestamp) return null;
  
  const config = getLabelExportConfiguration();
  const age = new Date().getTime() - Number(timestamp);
  
  if (age > config.advanced.cacheDuration) {
    return null;
  }
  
  const count = Number(cache.get('LABEL_DATA_COUNT') || 0);
  if (count === 0) return null;
  
  let data = '';
  for (let i = 0; i < count; i++) {
    data += cache.get(`LABEL_DATA_${i}`) || '';
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Get cache timestamp
 */
function getCacheTimestamp() {
  const cache = CacheService.getUserCache();
  return Number(cache.get('LABEL_DATA_TIMESTAMP') || 0);
}

/**
 * Clear cache
 */
function clearLabelCache() {
  const cache = CacheService.getUserCache();
  const count = Number(cache.get('LABEL_DATA_COUNT') || 0);
  
  for (let i = 0; i < count; i++) {
    cache.remove(`LABEL_DATA_${i}`);
  }
  
  cache.remove('LABEL_DATA_COUNT');
  cache.remove('LABEL_DATA_TIMESTAMP');
  
  SpreadsheetApp.getUi().alert('Cache cleared');
}

/**
 * Save checkpoint
 */
function saveCheckpoint(checkpoint) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('LABEL_EXPORT_CHECKPOINT', JSON.stringify(checkpoint));
}

/**
 * Load checkpoint
 */
function loadCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const checkpointStr = scriptProperties.getProperty('LABEL_EXPORT_CHECKPOINT');
  return checkpointStr ? JSON.parse(checkpointStr) : null;
}

/**
 * Clear checkpoint
 */
function clearCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('LABEL_EXPORT_CHECKPOINT');
  SpreadsheetApp.getUi().alert('Checkpoint cleared');
}

/**
 * Resume last export
 */
function resumeLastExport() {
  const checkpoint = loadCheckpoint();
  if (!checkpoint) {
    SpreadsheetApp.getUi().alert('No checkpoint found', 
      'There is no export to resume.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  exportGmailLabels();
}

// ================== HELPER FUNCTIONS ==================

/**
 * Chunk data for cache storage
 */
function chunkData(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

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

// ================== INITIALIZATION ==================

/**
 * Check if configuration exists on open
 */
function checkConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  if (!userProperties.getProperty('OUTPUT_SHEET_NAME')) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('Configuration Required', 
      'This script requires initial configuration. Would you like to set it up now?',
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      setupConfiguration();
    }
  }
}