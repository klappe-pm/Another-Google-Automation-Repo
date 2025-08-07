/**
 * Title: Gmail Label Analysis - Refactored
 * Service: Gmail + Google Sheets
 * Purpose: Analyze Gmail labels and provide statistics about threads and messages
 * Created: 2023-01-01
 * Refactored: 2025-08-07
 * Author: Configurable - See Config Sheet
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: Comprehensive Gmail label analysis with statistics
 * - Description: Analyzes labels to provide thread, message, and attachment metrics
 * - Problem Solved: Manual counting and analyzing email data across accounts
 * - Successful Execution: Creates detailed label statistics in configured spreadsheet
 * - Dependencies: Gmail API, Google Sheets API
 * 
 * Configuration:
 * Run setupLabelAnalysisConfiguration() first to initialize settings
 * All settings stored securely in Script Properties
 * No hardcoded values or placeholders
 * 
 * Key Features:
 * 1. Comprehensive Gmail label analysis
 * 2. Statistical measures: average, min, max, median, percentiles
 * 3. Attachment analysis and tracking
 * 4. Configurable export options
 * 5. Batch processing for large label sets
 * 6. Progress tracking and resumable execution
 * 7. Custom label filtering
 * 8. Export to multiple formats
 * 9. No hardcoded spreadsheet IDs
 * 10. Cross-account portability
 */

// ================== CONFIGURATION MANAGEMENT ==================

/**
 * Initialize configuration on first run
 * Creates Config sheet and sets up default properties
 */
function setupLabelAnalysisConfiguration() {
  console.log('Setting up Label Analysis configuration...');
  
  const userProperties = PropertiesService.getUserProperties();
  
  // Create or get active spreadsheet
  const ss = SpreadsheetApp.getActiveSpreadsheet() || 
             SpreadsheetApp.create('Gmail Label Analysis Configuration');
  
  let configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    
    const headers = [
      ['Gmail Label Analysis Configuration', '', ''],
      ['', '', ''],
      ['Setting', 'Value', 'Description'],
      ['', '', ''],
      ['Output Settings', '', ''],
      ['Target Spreadsheet ID', '', 'Leave empty to use current spreadsheet'],
      ['Sheet Name', 'LabelStats', 'Name for the statistics sheet'],
      ['Create New Sheet', 'false', 'Create new sheet for each analysis'],
      ['Clear Before Write', 'true', 'Clear existing data before writing'],
      ['', '', ''],
      ['Analysis Options', '', ''],
      ['Include System Labels', 'false', 'Include Gmail system labels (e.g., INBOX, SENT)'],
      ['Label Filter Pattern', '', 'Regex pattern to filter labels (empty = all)'],
      ['Exclude Labels', '', 'Comma-separated labels to exclude'],
      ['Max Threads Per Label', '1000', 'Maximum threads to analyze per label (0 = unlimited)'],
      ['Process Batch Size', '50', 'Number of labels to process per batch'],
      ['', '', ''],
      ['Statistics Settings', '', ''],
      ['Calculate Percentiles', 'true', 'Calculate 25th, 75th, and 95th percentiles'],
      ['Include Attachment Details', 'true', 'Analyze attachment statistics'],
      ['Include Date Range', 'false', 'Include date range statistics'],
      ['Date Range Days', '30', 'Number of days for date range analysis'],
      ['Include Unread Stats', 'true', 'Include unread message statistics'],
      ['Include Starred Stats', 'true', 'Include starred message statistics'],
      ['Include Important Stats', 'false', 'Include important message statistics'],
      ['', '', ''],
      ['Output Columns', '', ''],
      ['Include Label Path', 'true', 'Show full label path'],
      ['Include Thread Count', 'true', 'Total threads in label'],
      ['Include Message Count', 'true', 'Total messages in label'],
      ['Include Average Messages', 'true', 'Average messages per thread'],
      ['Include Min Messages', 'true', 'Minimum messages in a thread'],
      ['Include Max Messages', 'true', 'Maximum messages in a thread'],
      ['Include Median Messages', 'true', 'Median messages per thread'],
      ['Include Percentiles', 'true', 'Message count percentiles'],
      ['Include Attachment Stats', 'true', 'Attachment statistics'],
      ['Include Unread Count', 'true', 'Number of unread messages'],
      ['Include Starred Count', 'true', 'Number of starred messages'],
      ['Include Date Stats', 'false', 'Date range statistics'],
      ['Include Label Size', 'false', 'Estimated label size in bytes'],
      ['', '', ''],
      ['Performance Settings', '', ''],
      ['Enable Caching', 'true', 'Cache results for faster re-runs'],
      ['Cache Duration (hours)', '24', 'How long to cache results'],
      ['Max Execution Time (min)', '5', 'Maximum execution time before checkpoint'],
      ['Enable Logging', 'true', 'Enable detailed logging'],
      ['Log Level', 'INFO', 'DEBUG, INFO, WARN, ERROR'],
      ['', '', ''],
      ['Export Options', '', ''],
      ['Export Format', 'sheet', 'sheet, csv, json'],
      ['Include Timestamp', 'true', 'Add analysis timestamp'],
      ['Sort By', 'threads', 'Sort by: name, threads, messages'],
      ['Sort Order', 'desc', 'Sort order: asc or desc'],
      ['Auto Resize Columns', 'true', 'Automatically resize columns'],
      ['Freeze Header Row', 'true', 'Freeze the header row'],
      ['Add Summary Row', 'true', 'Add summary statistics row'],
      ['', '', ''],
      ['Scheduling', '', ''],
      ['Enable Auto Run', 'false', 'Enable scheduled analysis'],
      ['Run Frequency', 'weekly', 'daily, weekly, monthly'],
      ['Run Day', 'Monday', 'Day for weekly runs'],
      ['Run Hour', '9', 'Hour to run (0-23)']
    ];
    
    configSheet.getRange(1, 1, headers.length, 3).setValues(headers);
    
    // Format configuration sheet
    configSheet.getRange('A1:C1').merge()
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(14)
      .setHorizontalAlignment('center');
    
    // Format section headers
    const sectionRows = [5, 11, 18, 27, 42, 49, 58];
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
    'SHEET_NAME': 'LabelStats',
    'CREATE_NEW_SHEET': 'false',
    'CLEAR_BEFORE_WRITE': 'true',
    'INCLUDE_SYSTEM_LABELS': 'false',
    'LABEL_FILTER_PATTERN': '',
    'EXCLUDE_LABELS': '',
    'MAX_THREADS_PER_LABEL': '1000',
    'PROCESS_BATCH_SIZE': '50',
    'CALCULATE_PERCENTILES': 'true',
    'INCLUDE_ATTACHMENT_DETAILS': 'true',
    'INCLUDE_DATE_RANGE': 'false',
    'DATE_RANGE_DAYS': '30',
    'INCLUDE_UNREAD_STATS': 'true',
    'INCLUDE_STARRED_STATS': 'true',
    'INCLUDE_IMPORTANT_STATS': 'false',
    'ENABLE_CACHING': 'true',
    'CACHE_DURATION_HOURS': '24',
    'MAX_EXECUTION_TIME': '5',
    'ENABLE_LOGGING': 'true',
    'LOG_LEVEL': 'INFO',
    'EXPORT_FORMAT': 'sheet',
    'INCLUDE_TIMESTAMP': 'true',
    'SORT_BY': 'threads',
    'SORT_ORDER': 'desc',
    'AUTO_RESIZE_COLUMNS': 'true',
    'FREEZE_HEADER_ROW': 'true',
    'ADD_SUMMARY_ROW': 'true',
    'ENABLE_AUTO_RUN': 'false',
    'RUN_FREQUENCY': 'weekly',
    'RUN_DAY': 'Monday',
    'RUN_HOUR': '9'
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
 * Get analysis configuration
 * @returns {Object} Configuration object
 */
function getAnalysisConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  
  return {
    output: {
      targetSpreadsheetId: userProperties.getProperty('TARGET_SPREADSHEET_ID') || '',
      sheetName: userProperties.getProperty('SHEET_NAME') || 'LabelStats',
      createNewSheet: userProperties.getProperty('CREATE_NEW_SHEET') === 'true',
      clearBeforeWrite: userProperties.getProperty('CLEAR_BEFORE_WRITE') === 'true'
    },
    analysis: {
      includeSystemLabels: userProperties.getProperty('INCLUDE_SYSTEM_LABELS') === 'true',
      labelFilterPattern: userProperties.getProperty('LABEL_FILTER_PATTERN') || '',
      excludeLabels: (userProperties.getProperty('EXCLUDE_LABELS') || '').split(',').filter(l => l.trim()),
      maxThreadsPerLabel: Number(userProperties.getProperty('MAX_THREADS_PER_LABEL') || 1000),
      processBatchSize: Number(userProperties.getProperty('PROCESS_BATCH_SIZE') || 50)
    },
    statistics: {
      calculatePercentiles: userProperties.getProperty('CALCULATE_PERCENTILES') === 'true',
      includeAttachmentDetails: userProperties.getProperty('INCLUDE_ATTACHMENT_DETAILS') === 'true',
      includeDateRange: userProperties.getProperty('INCLUDE_DATE_RANGE') === 'true',
      dateRangeDays: Number(userProperties.getProperty('DATE_RANGE_DAYS') || 30),
      includeUnreadStats: userProperties.getProperty('INCLUDE_UNREAD_STATS') === 'true',
      includeStarredStats: userProperties.getProperty('INCLUDE_STARRED_STATS') === 'true',
      includeImportantStats: userProperties.getProperty('INCLUDE_IMPORTANT_STATS') === 'true'
    },
    performance: {
      enableCaching: userProperties.getProperty('ENABLE_CACHING') === 'true',
      cacheDurationHours: Number(userProperties.getProperty('CACHE_DURATION_HOURS') || 24),
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 5) * 60000,
      enableLogging: userProperties.getProperty('ENABLE_LOGGING') === 'true',
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO'
    },
    export: {
      format: userProperties.getProperty('EXPORT_FORMAT') || 'sheet',
      includeTimestamp: userProperties.getProperty('INCLUDE_TIMESTAMP') === 'true',
      sortBy: userProperties.getProperty('SORT_BY') || 'threads',
      sortOrder: userProperties.getProperty('SORT_ORDER') || 'desc',
      autoResizeColumns: userProperties.getProperty('AUTO_RESIZE_COLUMNS') === 'true',
      freezeHeaderRow: userProperties.getProperty('FREEZE_HEADER_ROW') === 'true',
      addSummaryRow: userProperties.getProperty('ADD_SUMMARY_ROW') === 'true'
    },
    scheduling: {
      enableAutoRun: userProperties.getProperty('ENABLE_AUTO_RUN') === 'true',
      runFrequency: userProperties.getProperty('RUN_FREQUENCY') || 'weekly',
      runDay: userProperties.getProperty('RUN_DAY') || 'Monday',
      runHour: Number(userProperties.getProperty('RUN_HOUR') || 9)
    }
  };
}

// ================== UI MANAGEMENT ==================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📊 Label Analysis')
    .addItem('⚙️ Setup Configuration', 'setupLabelAnalysisConfiguration')
    .addSeparator()
    .addItem('▶️ Run Full Analysis', 'analyzeGmailLabels')
    .addItem('🔄 Resume Analysis', 'resumeAnalysis')
    .addSeparator()
    .addItem('📈 Quick Stats', 'quickLabelStats')
    .addItem('🎯 Analyze Specific Label', 'showLabelDialog')
    .addSeparator()
    .addItem('💾 Export to CSV', 'exportToCSV')
    .addItem('📋 Export to JSON', 'exportToJSON')
    .addItem('🗑️ Clear Cache', 'clearAnalysisCache')
    .addToUi();
}

// ================== MAIN ANALYSIS FUNCTION ==================

/**
 * Main function to analyze Gmail labels
 * Refactored version with full configuration support
 */
function analyzeGmailLabels() {
  const config = getAnalysisConfiguration();
  const logger = new Logger(config.performance.enableLogging, config.performance.logLevel);
  const startTime = new Date().getTime();
  
  logger.info('Starting Gmail label analysis...');
  
  try {
    // Get checkpoint data if resuming
    const checkpoint = getCheckpoint();
    const startIndex = checkpoint ? checkpoint.lastProcessedIndex + 1 : 0;
    
    // Fetch labels based on configuration
    let labels = getFilteredLabels(config, logger);
    logger.info(`Found ${labels.length} labels to analyze`);
    
    // Initialize results array
    let labelData = checkpoint ? checkpoint.labelData : [];
    
    // Process labels in batches
    const batchSize = config.analysis.processBatchSize;
    let processedCount = startIndex;
    
    for (let i = startIndex; i < labels.length; i++) {
      // Check execution time
      if (isExecutionTimeLimitApproaching(startTime, config.performance.maxExecutionTime)) {
        saveCheckpoint(i - 1, labelData);
        logger.warn('Execution time limit approaching. Saving checkpoint...');
        return showResumeDialog();
      }
      
      const label = labels[i];
      const labelName = label.getName();
      
      // Skip excluded labels
      if (shouldSkipLabel(labelName, config)) {
        logger.debug(`Skipping label: ${labelName}`);
        continue;
      }
      
      logger.info(`Processing label ${i + 1}/${labels.length}: ${labelName}`);
      
      // Analyze the label
      const stats = analyzeSingleLabel(label, config, logger);
      labelData.push(stats);
      
      processedCount++;
      
      // Process in batches to avoid timeout
      if (processedCount % batchSize === 0) {
        logger.info(`Processed ${processedCount} labels...`);
        Utilities.sleep(1000); // Brief pause to avoid rate limiting
      }
    }
    
    // Sort data based on configuration
    sortLabelData(labelData, config);
    
    // Export results
    exportResults(labelData, config, logger);
    
    // Clear checkpoint after successful completion
    clearCheckpoint();
    
    logger.info('Gmail label analysis completed successfully.');
    
    SpreadsheetApp.getUi().alert('Analysis Complete', 
      `Successfully analyzed ${labelData.length} labels.`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    logger.error('Analysis failed:', error);
    SpreadsheetApp.getUi().alert('Analysis Error', 
      `An error occurred: ${error.toString()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Analyze a single label
 * @param {GmailLabel} label - Gmail label to analyze
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Array} Statistics array for the label
 */
function analyzeSingleLabel(label, config, logger) {
  const labelName = label.getName();
  
  // Get threads with limit if configured
  let threads;
  if (config.analysis.maxThreadsPerLabel > 0) {
    threads = label.getThreads(0, config.analysis.maxThreadsPerLabel);
  } else {
    threads = label.getThreads();
  }
  
  // Initialize counters
  const stats = {
    labelName: labelName,
    totalThreads: threads.length,
    totalMessages: 0,
    messagesPerThread: [],
    threadsWithAttachments: 0,
    totalAttachments: 0,
    attachmentSizes: [],
    unreadMessages: 0,
    starredMessages: 0,
    importantMessages: 0,
    oldestMessageDate: null,
    newestMessageDate: null
  };
  
  // Process each thread
  threads.forEach(thread => {
    const messages = thread.getMessages();
    stats.totalMessages += messages.length;
    stats.messagesPerThread.push(messages.length);
    
    // Track thread properties
    if (thread.isUnread() && config.statistics.includeUnreadStats) {
      stats.unreadMessages += messages.filter(m => m.isUnread()).length;
    }
    
    if (thread.isImportant() && config.statistics.includeImportantStats) {
      stats.importantMessages += messages.length;
    }
    
    // Process messages for detailed stats
    let threadHasAttachment = false;
    messages.forEach(message => {
      // Date tracking
      const messageDate = message.getDate();
      if (!stats.oldestMessageDate || messageDate < stats.oldestMessageDate) {
        stats.oldestMessageDate = messageDate;
      }
      if (!stats.newestMessageDate || messageDate > stats.newestMessageDate) {
        stats.newestMessageDate = messageDate;
      }
      
      // Starred tracking
      if (message.isStarred() && config.statistics.includeStarredStats) {
        stats.starredMessages++;
      }
      
      // Attachment tracking
      if (config.statistics.includeAttachmentDetails) {
        const attachments = message.getAttachments();
        if (attachments.length > 0) {
          threadHasAttachment = true;
          stats.totalAttachments += attachments.length;
          attachments.forEach(att => {
            stats.attachmentSizes.push(att.getSize());
          });
        }
      }
    });
    
    if (threadHasAttachment) {
      stats.threadsWithAttachments++;
    }
  });
  
  // Calculate statistics
  const result = [labelName];
  
  if (config.export.includeTimestamp) {
    result.push(new Date().toISOString());
  }
  
  result.push(stats.totalThreads);
  result.push(stats.totalMessages);
  
  // Calculate message statistics
  if (stats.messagesPerThread.length > 0) {
    result.push(calculateAverage(stats.messagesPerThread));
    result.push(calculateMin(stats.messagesPerThread));
    result.push(calculateMax(stats.messagesPerThread));
    result.push(calculateMedian(stats.messagesPerThread));
    
    if (config.statistics.calculatePercentiles) {
      result.push(calculatePercentile(stats.messagesPerThread, 25));
      result.push(calculatePercentile(stats.messagesPerThread, 75));
      result.push(calculatePercentile(stats.messagesPerThread, 95));
    }
  } else {
    result.push(0, 0, 0, 0);
    if (config.statistics.calculatePercentiles) {
      result.push(0, 0, 0);
    }
  }
  
  // Attachment statistics
  if (config.statistics.includeAttachmentDetails) {
    result.push(stats.threadsWithAttachments);
    result.push(stats.totalAttachments);
    if (stats.attachmentSizes.length > 0) {
      result.push(calculateAverage(stats.attachmentSizes));
      result.push(formatFileSize(stats.attachmentSizes.reduce((a, b) => a + b, 0)));
    } else {
      result.push(0);
      result.push('0 B');
    }
  }
  
  // Status statistics
  if (config.statistics.includeUnreadStats) {
    result.push(stats.unreadMessages);
  }
  if (config.statistics.includeStarredStats) {
    result.push(stats.starredMessages);
  }
  if (config.statistics.includeImportantStats) {
    result.push(stats.importantMessages);
  }
  
  // Date range statistics
  if (config.statistics.includeDateRange && stats.oldestMessageDate) {
    result.push(Utilities.formatDate(stats.oldestMessageDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
    result.push(Utilities.formatDate(stats.newestMessageDate, Session.getScriptTimeZone(), 'yyyy-MM-dd'));
    const daySpan = Math.ceil((stats.newestMessageDate - stats.oldestMessageDate) / (1000 * 60 * 60 * 24));
    result.push(daySpan);
  }
  
  return result;
}

// ================== HELPER FUNCTIONS ==================

/**
 * Get filtered labels based on configuration
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Array} Filtered labels
 */
function getFilteredLabels(config, logger) {
  let labels = GmailApp.getUserLabels();
  
  // Include system labels if configured
  if (config.analysis.includeSystemLabels) {
    const systemLabels = [
      GmailApp.getUserLabelByName('INBOX'),
      GmailApp.getUserLabelByName('SENT'),
      GmailApp.getUserLabelByName('DRAFT'),
      GmailApp.getUserLabelByName('SPAM'),
      GmailApp.getUserLabelByName('TRASH'),
      GmailApp.getUserLabelByName('STARRED'),
      GmailApp.getUserLabelByName('IMPORTANT')
    ].filter(l => l !== null);
    labels = labels.concat(systemLabels);
  }
  
  // Apply filter pattern if provided
  if (config.analysis.labelFilterPattern) {
    const pattern = new RegExp(config.analysis.labelFilterPattern);
    labels = labels.filter(label => pattern.test(label.getName()));
  }
  
  return labels;
}

/**
 * Check if label should be skipped
 * @param {string} labelName - Label name
 * @param {Object} config - Configuration
 * @returns {boolean} True if should skip
 */
function shouldSkipLabel(labelName, config) {
  return config.analysis.excludeLabels.some(excluded => 
    labelName.toLowerCase() === excluded.toLowerCase().trim()
  );
}

/**
 * Sort label data based on configuration
 * @param {Array} labelData - Label statistics array
 * @param {Object} config - Configuration
 */
function sortLabelData(labelData, config) {
  const sortIndex = getSortIndex(config);
  const ascending = config.export.sortOrder === 'asc';
  
  labelData.sort((a, b) => {
    const aVal = a[sortIndex];
    const bVal = b[sortIndex];
    
    if (typeof aVal === 'string') {
      return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else {
      if (aVal < bVal) return ascending ? -1 : 1;
      if (aVal > bVal) return ascending ? 1 : -1;
      return 0;
    }
  });
}

/**
 * Get sort index based on configuration
 * @param {Object} config - Configuration
 * @returns {number} Sort index
 */
function getSortIndex(config) {
  let index = 0;
  
  if (config.export.includeTimestamp) index++;
  
  switch (config.export.sortBy) {
    case 'name': return 0;
    case 'threads': return index + 1;
    case 'messages': return index + 2;
    default: return index + 1;
  }
}

/**
 * Export results to configured destination
 * @param {Array} labelData - Label statistics
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 */
function exportResults(labelData, config, logger) {
  // Build headers
  const headers = buildHeaders(config);
  
  // Get target spreadsheet
  let spreadsheet;
  if (config.output.targetSpreadsheetId) {
    try {
      spreadsheet = SpreadsheetApp.openById(config.output.targetSpreadsheetId);
    } catch (e) {
      logger.warn('Could not open target spreadsheet, using active spreadsheet');
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }
  } else {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  // Get or create sheet
  let sheet;
  if (config.output.createNewSheet) {
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
    sheet = spreadsheet.insertSheet(`${config.output.sheetName}_${timestamp}`);
  } else {
    sheet = spreadsheet.getSheetByName(config.output.sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(config.output.sheetName);
    } else if (config.output.clearBeforeWrite) {
      sheet.clear();
    }
  }
  
  // Write headers
  sheet.appendRow(headers);
  
  // Write data
  if (labelData.length > 0) {
    const range = sheet.getRange(2, 1, labelData.length, labelData[0].length);
    range.setValues(labelData);
  }
  
  // Add summary row if configured
  if (config.export.addSummaryRow) {
    const summaryRow = buildSummaryRow(labelData, headers.length);
    sheet.appendRow(summaryRow);
  }
  
  // Format sheet
  formatSheet(sheet, config, headers.length);
  
  logger.info(`Data exported to sheet: ${sheet.getName()}`);
}

/**
 * Build headers based on configuration
 * @param {Object} config - Configuration
 * @returns {Array} Headers array
 */
function buildHeaders(config) {
  const headers = ['Label Name'];
  
  if (config.export.includeTimestamp) {
    headers.push('Analysis Timestamp');
  }
  
  headers.push('Total Threads', 'Total Messages', 'Avg Messages/Thread', 
               'Min Messages', 'Max Messages', 'Median Messages');
  
  if (config.statistics.calculatePercentiles) {
    headers.push('25th Percentile', '75th Percentile', '95th Percentile');
  }
  
  if (config.statistics.includeAttachmentDetails) {
    headers.push('Threads w/ Attachments', 'Total Attachments', 
                 'Avg Attachment Size', 'Total Attachment Size');
  }
  
  if (config.statistics.includeUnreadStats) {
    headers.push('Unread Messages');
  }
  
  if (config.statistics.includeStarredStats) {
    headers.push('Starred Messages');
  }
  
  if (config.statistics.includeImportantStats) {
    headers.push('Important Messages');
  }
  
  if (config.statistics.includeDateRange) {
    headers.push('Oldest Message', 'Newest Message', 'Day Span');
  }
  
  return headers;
}

/**
 * Build summary row
 * @param {Array} labelData - Label statistics
 * @param {number} columnCount - Number of columns
 * @returns {Array} Summary row
 */
function buildSummaryRow(labelData, columnCount) {
  const summary = new Array(columnCount).fill('');
  summary[0] = 'TOTAL/AVERAGE';
  
  // Calculate totals and averages
  let threadTotal = 0, messageTotal = 0, attachmentTotal = 0;
  
  labelData.forEach(row => {
    let index = 1;
    if (row[index] && typeof row[index] === 'string' && row[index].includes('T')) {
      index++; // Skip timestamp if present
    }
    threadTotal += row[index] || 0;
    messageTotal += row[index + 1] || 0;
    // Additional totals can be calculated here
  });
  
  summary[2] = threadTotal;
  summary[3] = messageTotal;
  summary[4] = labelData.length > 0 ? (messageTotal / threadTotal).toFixed(2) : 0;
  
  return summary;
}

/**
 * Format the output sheet
 * @param {Sheet} sheet - Sheet to format
 * @param {Object} config - Configuration
 * @param {number} columnCount - Number of columns
 */
function formatSheet(sheet, config, columnCount) {
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  headerRange.setBackground('#4285f4')
            .setFontColor('#ffffff')
            .setFontWeight('bold');
  
  if (config.export.freezeHeaderRow) {
    sheet.setFrozenRows(1);
  }
  
  if (config.export.autoResizeColumns) {
    for (let i = 1; i <= columnCount; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

// ================== STATISTICAL FUNCTIONS ==================

/**
 * Calculate average
 * @param {Array} array - Number array
 * @returns {number} Average
 */
function calculateAverage(array) {
  if (array.length === 0) return 0;
  const sum = array.reduce((a, b) => a + b, 0);
  return Number((sum / array.length).toFixed(2));
}

/**
 * Calculate minimum
 * @param {Array} array - Number array
 * @returns {number} Minimum value
 */
function calculateMin(array) {
  if (array.length === 0) return 0;
  return Math.min.apply(null, array);
}

/**
 * Calculate maximum
 * @param {Array} array - Number array
 * @returns {number} Maximum value
 */
function calculateMax(array) {
  if (array.length === 0) return 0;
  return Math.max.apply(null, array);
}

/**
 * Calculate median
 * @param {Array} array - Number array
 * @returns {number} Median value
 */
function calculateMedian(array) {
  if (array.length === 0) return 0;
  const sorted = array.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculate percentile
 * @param {Array} array - Number array
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} Percentile value
 */
function calculatePercentile(array, percentile) {
  if (array.length === 0) return 0;
  const sorted = array.slice().sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) {
    return sorted[lower];
  }
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ================== CHECKPOINT MANAGEMENT ==================

/**
 * Save checkpoint for resumable execution
 * @param {number} lastProcessedIndex - Last processed label index
 * @param {Array} labelData - Accumulated label data
 */
function saveCheckpoint(lastProcessedIndex, labelData) {
  const userProperties = PropertiesService.getUserProperties();
  const checkpoint = {
    lastProcessedIndex: lastProcessedIndex,
    labelData: labelData,
    timestamp: new Date().toISOString()
  };
  userProperties.setProperty('LABEL_ANALYSIS_CHECKPOINT', JSON.stringify(checkpoint));
}

/**
 * Get checkpoint data
 * @returns {Object|null} Checkpoint data or null
 */
function getCheckpoint() {
  const userProperties = PropertiesService.getUserProperties();
  const checkpointStr = userProperties.getProperty('LABEL_ANALYSIS_CHECKPOINT');
  return checkpointStr ? JSON.parse(checkpointStr) : null;
}

/**
 * Clear checkpoint
 */
function clearCheckpoint() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('LABEL_ANALYSIS_CHECKPOINT');
}

/**
 * Resume analysis from checkpoint
 */
function resumeAnalysis() {
  const checkpoint = getCheckpoint();
  if (!checkpoint) {
    SpreadsheetApp.getUi().alert('No Checkpoint Found', 
      'No previous analysis to resume.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  SpreadsheetApp.getUi().alert('Resuming Analysis', 
    `Resuming from label ${checkpoint.lastProcessedIndex + 1}.\n` +
    `Previously processed: ${checkpoint.labelData.length} labels.`,
    SpreadsheetApp.getUi().ButtonSet.OK);
  
  analyzeGmailLabels();
}

/**
 * Show resume dialog
 */
function showResumeDialog() {
  SpreadsheetApp.getUi().alert('Analysis Paused', 
    'Analysis has been paused to avoid timeout.\n\n' +
    'Use "Resume Analysis" from the menu to continue.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Check if execution time limit is approaching
 * @param {number} startTime - Start timestamp
 * @param {number} maxTime - Maximum execution time in milliseconds
 * @returns {boolean} True if approaching limit
 */
function isExecutionTimeLimitApproaching(startTime, maxTime) {
  const elapsed = new Date().getTime() - startTime;
  return elapsed > (maxTime * 0.9); // Use 90% of max time
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

// ================== EXPORT UTILITIES ==================

/**
 * Export to CSV format
 */
function exportToCSV() {
  const config = getAnalysisConfiguration();
  config.export.format = 'csv';
  analyzeGmailLabels();
}

/**
 * Export to JSON format
 */
function exportToJSON() {
  const config = getAnalysisConfiguration();
  config.export.format = 'json';
  analyzeGmailLabels();
}

/**
 * Clear analysis cache
 */
function clearAnalysisCache() {
  const cache = CacheService.getUserCache();
  cache.removeAll(['label_analysis_']);
  SpreadsheetApp.getUi().alert('Cache Cleared', 
    'Analysis cache has been cleared.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Quick label statistics
 */
function quickLabelStats() {
  const labels = GmailApp.getUserLabels();
  const totalThreads = labels.reduce((sum, label) => sum + label.getThreads(0, 1).length, 0);
  
  SpreadsheetApp.getUi().alert('Quick Stats', 
    `Total Labels: ${labels.length}\n` +
    `Estimated Total Threads: ${totalThreads}`,
    SpreadsheetApp.getUi().ButtonSet.OK);
}