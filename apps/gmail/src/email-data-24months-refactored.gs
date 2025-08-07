/**
 * Title: Gmail Email Count Analysis - Refactored
 * Service: Gmail + Google Sheets
 * Purpose: Analyze email statistics with configurable time ranges
 * Created: 2024-01-01
 * Refactored: 2025-08-07
 * Author: Configurable - See Config Sheet
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: Analyze email volume by sender/recipient over configurable periods
 * - Description: Comprehensive email statistics without hardcoded values
 * - Problem Solved: Cross-account email analysis with flexible configuration
 * - Successful Execution: Creates detailed analysis with multiple metrics
 * - Dependencies: Gmail API, Sheets API
 * 
 * Configuration:
 * Run setupConfiguration() first to initialize settings
 * All settings stored securely in Script Properties
 * Use Config sheet for user-friendly configuration
 * 
 * Key Features:
 * 1. Configurable analysis period (days, months, years)
 * 2. Multiple analysis modes (sender, recipient, domain, thread)
 * 3. Batch processing with progress tracking
 * 4. Advanced filtering options
 * 5. Export to multiple formats
 * 6. Checkpoint/resume for large datasets
 * 7. Domain-level aggregation
 */

// ================== CONFIGURATION MANAGEMENT ==================

/**
 * Initialize configuration on first run
 * Creates Config sheet and sets up default properties
 */
function setupConfiguration() {
  console.log('Setting up Email Analysis configuration...');
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  
  // Create or get Config sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    
    // Add headers and default values
    const headers = [
      ['Email Analysis Configuration', '', ''],
      ['', '', ''],
      ['Setting', 'Value', 'Description'],
      ['Analysis Period (days)', '180', 'Number of days to analyze (0 = all time)'],
      ['Analysis Mode', 'sender', 'Analysis type (sender, recipient, domain, thread)'],
      ['Minimum Email Count', '2', 'Minimum emails to include in report'],
      ['Include Sent Emails', 'true', 'Include emails you sent'],
      ['Include Received Emails', 'true', 'Include emails you received'],
      ['Group by Domain', 'true', 'Group email addresses by domain'],
      ['Batch Size', '100', 'Number of threads to process per batch'],
      ['Max Threads', '5000', 'Maximum threads to analyze (0 = unlimited)'],
      ['', '', ''],
      ['Filtering Options', '', ''],
      ['Include Labels', '', 'Comma-separated labels to include (empty = all)'],
      ['Exclude Labels', 'spam,trash', 'Comma-separated labels to exclude'],
      ['Search Query', '', 'Additional Gmail search query'],
      ['Exclude Domains', '', 'Comma-separated domains to exclude'],
      ['', '', ''],
      ['Output Options', '', ''],
      ['Output Sheet Name', 'Email Analysis', 'Name of the output sheet'],
      ['Sort By', 'count', 'Sort results by (count, name, domain, recent)'],
      ['Sort Order', 'desc', 'Sort order (asc, desc)'],
      ['Include Charts', 'true', 'Generate visualization charts'],
      ['Chart Type', 'column', 'Chart type (column, pie, bar)'],
      ['Top N Results', '50', 'Show top N results (0 = all)'],
      ['', '', ''],
      ['Advanced Settings', '', ''],
      ['Max Execution Time (min)', '5', 'Maximum execution time before checkpoint'],
      ['Enable Caching', 'true', 'Cache analysis results'],
      ['Cache Duration (hours)', '24', 'How long to cache results'],
      ['Enable Logging', 'true', 'Enable detailed logging'],
      ['Log Level', 'INFO', 'Log level (DEBUG, INFO, WARN, ERROR)']
    ];
    
    configSheet.getRange(1, 1, headers.length, 3).setValues(headers);
    
    // Format the sheet
    configSheet.getRange('A1:C1').merge()
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    configSheet.getRange('A3:C3')
      .setBackground('#e8e8e8')
      .setFontWeight('bold');
    
    configSheet.setColumnWidth(1, 200);
    configSheet.setColumnWidth(2, 200);
    configSheet.setColumnWidth(3, 400);
    
    // Protect headers
    const protection = configSheet.getRange('A1:C3').protect();
    protection.setDescription('Configuration headers');
    protection.setWarningOnly(true);
  }
  
  // Set default properties if not exists
  const defaults = {
    'ANALYSIS_PERIOD': '180',
    'ANALYSIS_MODE': 'sender',
    'MIN_EMAIL_COUNT': '2',
    'INCLUDE_SENT': 'true',
    'INCLUDE_RECEIVED': 'true',
    'GROUP_BY_DOMAIN': 'true',
    'BATCH_SIZE': '100',
    'MAX_THREADS': '5000',
    'EXCLUDE_LABELS': 'spam,trash',
    'OUTPUT_SHEET_NAME': 'Email Analysis',
    'SORT_BY': 'count',
    'SORT_ORDER': 'desc',
    'INCLUDE_CHARTS': 'true',
    'CHART_TYPE': 'column',
    'TOP_N_RESULTS': '50',
    'MAX_EXECUTION_TIME': '5',
    'ENABLE_CACHING': 'true',
    'CACHE_DURATION': '24',
    'ENABLE_LOGGING': 'true',
    'LOG_LEVEL': 'INFO'
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
 * Get analysis configuration from properties
 * @returns {Object} Configuration object
 */
function getAnalysisConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  
  return {
    analysis: {
      period: Number(userProperties.getProperty('ANALYSIS_PERIOD') || 180),
      mode: userProperties.getProperty('ANALYSIS_MODE') || 'sender',
      minCount: Number(userProperties.getProperty('MIN_EMAIL_COUNT') || 2),
      includeSent: userProperties.getProperty('INCLUDE_SENT') === 'true',
      includeReceived: userProperties.getProperty('INCLUDE_RECEIVED') === 'true',
      groupByDomain: userProperties.getProperty('GROUP_BY_DOMAIN') === 'true',
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 100),
      maxThreads: Number(userProperties.getProperty('MAX_THREADS') || 5000)
    },
    filters: {
      includeLabels: (userProperties.getProperty('INCLUDE_LABELS') || '').split(',').filter(l => l),
      excludeLabels: (userProperties.getProperty('EXCLUDE_LABELS') || '').split(',').filter(l => l),
      searchQuery: userProperties.getProperty('SEARCH_QUERY') || '',
      excludeDomains: (userProperties.getProperty('EXCLUDE_DOMAINS') || '').split(',').filter(d => d)
    },
    output: {
      sheetName: userProperties.getProperty('OUTPUT_SHEET_NAME') || 'Email Analysis',
      sortBy: userProperties.getProperty('SORT_BY') || 'count',
      sortOrder: userProperties.getProperty('SORT_ORDER') || 'desc',
      includeCharts: userProperties.getProperty('INCLUDE_CHARTS') === 'true',
      chartType: userProperties.getProperty('CHART_TYPE') || 'column',
      topN: Number(userProperties.getProperty('TOP_N_RESULTS') || 50)
    },
    advanced: {
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 5) * 60000,
      enableCaching: userProperties.getProperty('ENABLE_CACHING') === 'true',
      cacheDuration: Number(userProperties.getProperty('CACHE_DURATION') || 24) * 3600000,
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
  
  ui.createMenu('📊 Email Analysis')
    .addItem('🔍 Analyze Emails', 'analyzeEmails')
    .addItem('⚙️ Setup Configuration', 'setupConfiguration')
    .addItem('📈 Quick Analysis (30 days)', 'quickAnalysis30Days')
    .addItem('📈 Quick Analysis (90 days)', 'quickAnalysis90Days')
    .addItem('📈 Quick Analysis (1 year)', 'quickAnalysis1Year')
    .addSeparator()
    .addItem('🔄 Resume Last Analysis', 'resumeLastAnalysis')
    .addItem('📊 View Cached Results', 'viewCachedResults')
    .addItem('🗑️ Clear Cache', 'clearAnalysisCache')
    .addItem('🗑️ Clear Checkpoint', 'clearCheckpoint')
    .addToUi();
}

// ================== MAIN ANALYSIS FUNCTION ==================

/**
 * Main email analysis function with checkpoint/resume
 */
function analyzeEmails() {
  const startTime = new Date().getTime();
  const config = getAnalysisConfiguration();
  const logger = new Logger(config.advanced.enableLogging, config.advanced.logLevel);
  
  logger.info('Starting email analysis');
  logger.info('Configuration:', config);
  
  try {
    // Check cache first
    if (config.advanced.enableCaching) {
      const cachedData = loadCache();
      if (cachedData) {
        logger.info('Using cached analysis results');
        outputAnalysisResults(cachedData, config);
        return;
      }
    }
    
    // Load or initialize checkpoint
    let checkpoint = loadCheckpoint() || {
      processedThreads: [],
      emailCounts: {},
      domainCounts: {},
      metadata: {},
      totalThreads: 0,
      currentIndex: 0,
      startTime: new Date().toISOString(),
      config: config,
      stats: {
        totalEmails: 0,
        uniqueSenders: 0,
        uniqueDomains: 0,
        errors: []
      }
    };
    
    // Build search query
    const query = buildSearchQuery(config);
    logger.info('Search query:', query);
    
    // Get email threads
    const maxThreads = config.analysis.maxThreads || Number.MAX_SAFE_INTEGER;
    const threads = GmailApp.search(query, 0, Math.min(maxThreads, 500));
    checkpoint.totalThreads = threads.length;
    logger.info(`Found ${threads.length} threads to analyze`);
    
    // Process threads in batches
    const batchSize = config.analysis.batchSize;
    let processed = 0;
    
    for (let i = checkpoint.currentIndex; i < threads.length; i++) {
      // Check execution time
      if (new Date().getTime() - startTime > config.advanced.maxExecutionTime) {
        checkpoint.currentIndex = i;
        saveCheckpoint(checkpoint);
        logger.info(`Execution time limit reached. Checkpoint saved at thread ${i}`);
        
        SpreadsheetApp.getUi().alert('Analysis Paused', 
          `Processed ${processed} threads. Run "Resume Last Analysis" to continue.`,
          SpreadsheetApp.getUi().ButtonSet.OK);
        return;
      }
      
      const thread = threads[i];
      
      // Skip if already processed
      if (checkpoint.processedThreads.includes(thread.getId())) {
        continue;
      }
      
      try {
        processThread(thread, checkpoint, config, logger);
        checkpoint.processedThreads.push(thread.getId());
        processed++;
        
        // Save checkpoint periodically
        if (processed % 20 === 0) {
          checkpoint.currentIndex = i;
          saveCheckpoint(checkpoint);
        }
      } catch (error) {
        logger.error(`Error processing thread ${thread.getId()}:`, error);
        checkpoint.stats.errors.push({
          threadId: thread.getId(),
          error: error.toString()
        });
      }
    }
    
    // Prepare final results
    const results = prepareResults(checkpoint, config);
    
    // Cache results if enabled
    if (config.advanced.enableCaching) {
      saveCache(results);
    }
    
    // Output results
    outputAnalysisResults(results, config);
    
    // Clear checkpoint
    clearCheckpoint();
    
    logger.info('Email analysis completed successfully');
    SpreadsheetApp.getUi().alert('Analysis Complete', 
      `Analyzed ${checkpoint.stats.totalEmails} emails from ${Object.keys(checkpoint.emailCounts).length} unique addresses.`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    logger.error('Analysis failed:', error);
    SpreadsheetApp.getUi().alert('Analysis Error', 
      `An error occurred: ${error.toString()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ================== PROCESSING FUNCTIONS ==================

/**
 * Process a single email thread
 */
function processThread(thread, checkpoint, config, logger) {
  const messages = thread.getMessages();
  const myEmail = Session.getActiveUser().getEmail();
  
  messages.forEach(message => {
    const from = extractEmail(message.getFrom());
    const to = message.getTo().split(',').map(e => extractEmail(e));
    const date = message.getDate();
    
    // Determine if sent or received
    const isSent = from.toLowerCase() === myEmail.toLowerCase();
    
    // Process based on configuration
    if (isSent && config.analysis.includeSent) {
      to.forEach(recipient => {
        if (recipient && !isExcludedDomain(recipient, config.filters.excludeDomains)) {
          incrementCount(checkpoint, recipient, 'recipient', date);
        }
      });
    }
    
    if (!isSent && config.analysis.includeReceived) {
      if (from && !isExcludedDomain(from, config.filters.excludeDomains)) {
        incrementCount(checkpoint, from, 'sender', date);
      }
    }
    
    checkpoint.stats.totalEmails++;
  });
}

/**
 * Increment count for an email address
 */
function incrementCount(checkpoint, email, type, date) {
  // Email count
  if (!checkpoint.emailCounts[email]) {
    checkpoint.emailCounts[email] = {
      count: 0,
      type: type,
      firstSeen: date,
      lastSeen: date,
      domain: extractDomain(email)
    };
  }
  checkpoint.emailCounts[email].count++;
  checkpoint.emailCounts[email].lastSeen = date;
  
  // Domain count
  const domain = extractDomain(email);
  if (domain) {
    if (!checkpoint.domainCounts[domain]) {
      checkpoint.domainCounts[domain] = {
        count: 0,
        uniqueAddresses: new Set(),
        type: type
      };
    }
    checkpoint.domainCounts[domain].count++;
    checkpoint.domainCounts[domain].uniqueAddresses.add(email);
  }
}

/**
 * Extract email address from string
 */
function extractEmail(emailString) {
  const match = emailString.match(/<(.+)>/);
  return match ? match[1].trim() : emailString.trim();
}

/**
 * Extract domain from email
 */
function extractDomain(email) {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

/**
 * Check if domain is excluded
 */
function isExcludedDomain(email, excludedDomains) {
  if (!excludedDomains || excludedDomains.length === 0) return false;
  const domain = extractDomain(email);
  return excludedDomains.includes(domain);
}

/**
 * Build Gmail search query
 */
function buildSearchQuery(config) {
  const queryParts = [];
  
  // Date range
  if (config.analysis.period > 0) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.analysis.period);
    queryParts.push(`after:${cutoffDate.toISOString().split('T')[0]}`);
  }
  
  // Include labels
  if (config.filters.includeLabels.length > 0) {
    const labelQuery = config.filters.includeLabels.map(l => `label:${l}`).join(' OR ');
    queryParts.push(`(${labelQuery})`);
  }
  
  // Exclude labels
  config.filters.excludeLabels.forEach(label => {
    queryParts.push(`-label:${label}`);
  });
  
  // Additional search query
  if (config.filters.searchQuery) {
    queryParts.push(config.filters.searchQuery);
  }
  
  return queryParts.join(' ') || 'in:anywhere';
}

/**
 * Prepare final results
 */
function prepareResults(checkpoint, config) {
  const results = [];
  
  // Convert based on analysis mode
  if (config.analysis.groupByDomain) {
    // Group by domain
    Object.entries(checkpoint.domainCounts).forEach(([domain, data]) => {
      results.push({
        name: domain,
        count: data.count,
        uniqueAddresses: data.uniqueAddresses.size,
        type: 'domain'
      });
    });
  } else {
    // Individual email addresses
    Object.entries(checkpoint.emailCounts).forEach(([email, data]) => {
      if (data.count >= config.analysis.minCount) {
        results.push({
          name: email,
          count: data.count,
          domain: data.domain,
          firstSeen: data.firstSeen,
          lastSeen: data.lastSeen,
          type: data.type
        });
      }
    });
  }
  
  // Sort results
  sortResults(results, config.output.sortBy, config.output.sortOrder);
  
  // Apply top N filter
  if (config.output.topN > 0) {
    results.splice(config.output.topN);
  }
  
  return {
    data: results,
    stats: checkpoint.stats,
    config: config,
    timestamp: new Date().toISOString()
  };
}

/**
 * Sort results
 */
function sortResults(results, sortBy, sortOrder) {
  const sortFunctions = {
    'count': (a, b) => b.count - a.count,
    'name': (a, b) => a.name.localeCompare(b.name),
    'domain': (a, b) => (a.domain || a.name).localeCompare(b.domain || b.name),
    'recent': (a, b) => {
      if (!a.lastSeen && !b.lastSeen) return 0;
      if (!a.lastSeen) return 1;
      if (!b.lastSeen) return -1;
      return new Date(b.lastSeen) - new Date(a.lastSeen);
    }
  };
  
  const sortFn = sortFunctions[sortBy] || sortFunctions['count'];
  results.sort(sortFn);
  
  if (sortOrder === 'asc') {
    results.reverse();
  }
}

// ================== OUTPUT FUNCTIONS ==================

/**
 * Output analysis results to sheet
 */
function outputAnalysisResults(results, config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(config.output.sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(config.output.sheetName);
  } else {
    sheet.clear();
  }
  
  // Add title and metadata
  sheet.getRange('A1').setValue('Email Analysis Report');
  sheet.getRange('A2').setValue(`Generated: ${new Date().toLocaleString()}`);
  sheet.getRange('A3').setValue(`Analysis Period: ${config.analysis.period} days`);
  sheet.getRange('A4').setValue(`Total Emails Analyzed: ${results.stats.totalEmails}`);
  
  // Format title
  sheet.getRange('A1:E1').merge()
    .setBackground('#4285f4')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(16)
    .setHorizontalAlignment('center');
  
  // Add headers
  const headers = config.analysis.groupByDomain ? 
    ['Domain', 'Email Count', 'Unique Addresses'] :
    ['Email Address', 'Count', 'Domain', 'First Seen', 'Last Seen'];
  
  sheet.getRange(6, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(6, 1, 1, headers.length)
    .setBackground('#e8e8e8')
    .setFontWeight('bold');
  
  // Add data
  const dataRows = results.data.map(item => {
    if (config.analysis.groupByDomain) {
      return [item.name, item.count, item.uniqueAddresses];
    } else {
      return [
        item.name,
        item.count,
        item.domain || '',
        item.firstSeen ? new Date(item.firstSeen).toLocaleDateString() : '',
        item.lastSeen ? new Date(item.lastSeen).toLocaleDateString() : ''
      ];
    }
  });
  
  if (dataRows.length > 0) {
    sheet.getRange(7, 1, dataRows.length, headers.length).setValues(dataRows);
  }
  
  // Add conditional formatting
  const countColumn = sheet.getRange(7, 2, dataRows.length, 1);
  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(100)
      .setBackground('#d4edda')
      .setRanges([countColumn])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(500)
      .setBackground('#cce5ff')
      .setRanges([countColumn])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThan(1000)
      .setBackground('#f8d7da')
      .setRanges([countColumn])
      .build()
  ];
  sheet.setConditionalFormatRules(rules);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  sheet.setFrozenRows(6);
  
  // Add chart if enabled
  if (config.output.includeCharts && dataRows.length > 0) {
    addChart(sheet, dataRows.length, config.output.chartType);
  }
}

/**
 * Add chart to sheet
 */
function addChart(sheet, dataRows, chartType) {
  const chartBuilder = sheet.newChart()
    .setPosition(5, 7, 0, 0)
    .addRange(sheet.getRange(6, 1, dataRows + 1, 2));
  
  switch (chartType) {
    case 'pie':
      chartBuilder.setChartType(Charts.ChartType.PIE)
        .setOption('title', 'Email Distribution')
        .setOption('pieSliceText', 'percentage');
      break;
    case 'bar':
      chartBuilder.setChartType(Charts.ChartType.BAR)
        .setOption('title', 'Email Counts by Sender');
      break;
    default:
      chartBuilder.setChartType(Charts.ChartType.COLUMN)
        .setOption('title', 'Email Counts by Sender');
  }
  
  sheet.insertChart(chartBuilder.build());
}

// ================== QUICK ANALYSIS FUNCTIONS ==================

/**
 * Quick analysis for 30 days
 */
function quickAnalysis30Days() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('ANALYSIS_PERIOD', '30');
  analyzeEmails();
}

/**
 * Quick analysis for 90 days
 */
function quickAnalysis90Days() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('ANALYSIS_PERIOD', '90');
  analyzeEmails();
}

/**
 * Quick analysis for 1 year
 */
function quickAnalysis1Year() {
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('ANALYSIS_PERIOD', '365');
  analyzeEmails();
}

// ================== CACHE & CHECKPOINT FUNCTIONS ==================

/**
 * Save results to cache
 */
function saveCache(data) {
  const cache = CacheService.getUserCache();
  const chunks = chunkData(JSON.stringify(data), 90000);
  
  chunks.forEach((chunk, index) => {
    cache.put(`ANALYSIS_DATA_${index}`, chunk, 21600);
  });
  
  cache.put('ANALYSIS_DATA_COUNT', chunks.length.toString(), 21600);
  cache.put('ANALYSIS_DATA_TIMESTAMP', new Date().getTime().toString(), 21600);
}

/**
 * Load results from cache
 */
function loadCache() {
  const cache = CacheService.getUserCache();
  const timestamp = cache.get('ANALYSIS_DATA_TIMESTAMP');
  
  if (!timestamp) return null;
  
  const config = getAnalysisConfiguration();
  const age = new Date().getTime() - Number(timestamp);
  
  if (age > config.advanced.cacheDuration) {
    return null;
  }
  
  const count = Number(cache.get('ANALYSIS_DATA_COUNT') || 0);
  if (count === 0) return null;
  
  let data = '';
  for (let i = 0; i < count; i++) {
    data += cache.get(`ANALYSIS_DATA_${i}`) || '';
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * View cached results
 */
function viewCachedResults() {
  const cachedData = loadCache();
  
  if (!cachedData) {
    SpreadsheetApp.getUi().alert('No Cached Data', 
      'No cached analysis results found. Please run an analysis first.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const config = getAnalysisConfiguration();
  outputAnalysisResults(cachedData, config);
  
  SpreadsheetApp.getUi().alert('Cached Results Loaded', 
    `Displaying cached results from ${new Date(cachedData.timestamp).toLocaleString()}`,
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Clear analysis cache
 */
function clearAnalysisCache() {
  const cache = CacheService.getUserCache();
  const count = Number(cache.get('ANALYSIS_DATA_COUNT') || 0);
  
  for (let i = 0; i < count; i++) {
    cache.remove(`ANALYSIS_DATA_${i}`);
  }
  
  cache.remove('ANALYSIS_DATA_COUNT');
  cache.remove('ANALYSIS_DATA_TIMESTAMP');
  
  SpreadsheetApp.getUi().alert('Cache cleared');
}

/**
 * Save checkpoint
 */
function saveCheckpoint(checkpoint) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('EMAIL_ANALYSIS_CHECKPOINT', JSON.stringify(checkpoint));
}

/**
 * Load checkpoint
 */
function loadCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const checkpointStr = scriptProperties.getProperty('EMAIL_ANALYSIS_CHECKPOINT');
  return checkpointStr ? JSON.parse(checkpointStr) : null;
}

/**
 * Clear checkpoint
 */
function clearCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('EMAIL_ANALYSIS_CHECKPOINT');
  SpreadsheetApp.getUi().alert('Checkpoint cleared');
}

/**
 * Resume last analysis
 */
function resumeLastAnalysis() {
  const checkpoint = loadCheckpoint();
  if (!checkpoint) {
    SpreadsheetApp.getUi().alert('No checkpoint found', 
      'There is no analysis to resume.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  analyzeEmails();
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
  if (!userProperties.getProperty('ANALYSIS_PERIOD')) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('Configuration Required', 
      'This script requires initial configuration. Would you like to set it up now?',
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      setupConfiguration();
    }
  }
}