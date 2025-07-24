/**
 * Gmail Automation Configuration Management
 * Service: Configuration
 * Purpose: Centralized configuration management for Gmail automation scripts
 * Created: 2025-07-24
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Centralized configuration management for all Gmail automation scripts
- Description: Provides consistent configuration access and validation
- Problem Solved: Eliminates duplicate configuration code across scripts
- Successful Execution: All scripts use consistent, validated configuration
*/

/**
 * Global configuration object for Gmail automation
 */
const GMAIL_CONFIG = {
  // Project Information
  project: {
    name: 'Gmail Automation - Dev',
    version: '2.0.0',
    scriptId: '1fRuwT0EE6AdpDTlQLSL5w-jjA5kS7b4-HYRJFWYObV0kKvIiq1-o4JvJ',
    author: 'Kevin Lappe',
    contact: 'kevin@averageintelligence.ai',
    repository: 'https://github.com/kevinlappe/workspace-automation'
  },
  
  // Default folder IDs (CUSTOMIZE THESE)
  folders: {
    output: '', // Set to your Google Drive output folder ID
    archive: '', // Set to your archive folder ID (optional)
    templates: '', // Set to your templates folder ID (optional)
    temp: '' // Set to temporary files folder ID (optional)
  },
  
  // Processing limits and batch sizes
  limits: {
    maxEmailsPerBatch: 50,
    maxThreadsPerSearch: 500,
    maxAttachmentsPerEmail: 10,
    maxLabelsPerOperation: 100,
    requestDelay: 1000 // milliseconds between requests
  },
  
  // Date range defaults
  dateRanges: {
    default: {
      start: '2024-01-01',
      end: '2025-12-31'
    },
    recent: {
      start: getDateXDaysAgo(30),
      end: getCurrentDate()
    },
    lastMonth: {
      start: getFirstDayOfLastMonth(),
      end: getLastDayOfLastMonth()
    }
  },
  
  // Export format settings
  export: {
    formats: ['pdf', 'markdown', 'sheets'],
    defaultFormat: 'markdown',
    includeAttachments: false,
    includeHeaders: true,
    includeYamlFrontmatter: true,
    markdownTemplate: 'obsidian'
  },
  
  // Label management settings
  labels: {
    createPrefix: 'Auto/',
    archivePrefix: 'Archive/',
    maxLabelLength: 50,
    autoCreateLabels: true,
    preserveSystemLabels: true
  },
  
  // Analysis settings
  analysis: {
    includeSpam: false,
    includeTrash: false,
    groupByMonth: true,
    generateCharts: false,
    exportToSheets: true
  },
  
  // Search query templates
  searchQueries: {
    recent: 'newer_than:7d',
    unread: 'is:unread',
    important: 'is:important',
    labeled: 'has:userlabels',
    unlabeled: '-has:userlabels',
    withAttachments: 'has:attachment',
    largeEmails: 'larger:10M'
  },
  
  // Error handling
  errorHandling: {
    maxRetries: 3,
    retryDelay: 2000,
    logErrors: true,
    throwOnFatalError: true
  },
  
  // Debug and logging
  debug: {
    enabled: true,
    logLevel: 'INFO', // 'DEBUG', 'INFO', 'WARN', 'ERROR'
    logToSheet: false,
    logSheetId: '' // Set if you want to log to a specific sheet
  }
};

/**
 * Get configuration value with optional default
 */
function getConfig(path, defaultValue = null) {
  try {
    const keys = path.split('.');
    let value = GMAIL_CONFIG;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  } catch (error) {
    logError(`Error getting config for path '${path}': ${error.message}`);
    return defaultValue;
  }
}

/**
 * Set configuration value
 */
function setConfig(path, value) {
  try {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let obj = GMAIL_CONFIG;
    
    for (const key of keys) {
      if (!(key in obj)) {
        obj[key] = {};
      }
      obj = obj[key];
    }
    
    obj[lastKey] = value;
    logInfo(`Configuration updated: ${path} = ${JSON.stringify(value)}`);
    
  } catch (error) {
    logError(`Error setting config for path '${path}': ${error.message}`);
    throw error;
  }
}

/**
 * Validate configuration
 */
function validateConfig() {
  const issues = [];
  
  // Check required folder IDs
  if (!getConfig('folders.output')) {
    issues.push('Output folder ID not configured (folders.output)');
  }
  
  // Validate batch sizes
  const maxBatch = getConfig('limits.maxEmailsPerBatch');
  if (maxBatch > 100) {
    issues.push('Max emails per batch should not exceed 100 for performance');
  }
  
  // Check date ranges
  const defaultStart = getConfig('dateRanges.default.start');
  const defaultEnd = getConfig('dateRanges.default.end');
  
  if (new Date(defaultStart) > new Date(defaultEnd)) {
    issues.push('Default date range: start date is after end date');
  }
  
  // Validate export settings
  const formats = getConfig('export.formats');
  const defaultFormat = getConfig('export.defaultFormat');
  
  if (!formats.includes(defaultFormat)) {
    issues.push(`Default export format '${defaultFormat}' not in supported formats`);
  }
  
  if (issues.length > 0) {
    logError('Configuration validation failed:');
    issues.forEach(issue => logError(`  - ${issue}`));
    return false;
  } else {
    logInfo('Configuration validation passed');
    return true;
  }
}

/**
 * Get folder by ID with error handling
 */
function getFolder(folderId) {
  try {
    if (!folderId) {
      throw new Error('Folder ID is empty or null');
    }
    
    const folder = DriveApp.getFolderById(folderId);
    logDebug(`Successfully accessed folder: ${folder.getName()}`);
    return folder;
    
  } catch (error) {
    logError(`Cannot access folder with ID '${folderId}': ${error.message}`);
    throw error;
  }
}

/**
 * Get output folder (primary destination for exports)
 */
function getOutputFolder() {
  const folderId = getConfig('folders.output');
  if (!folderId) {
    throw new Error('Output folder ID not configured. Set GMAIL_CONFIG.folders.output');
  }
  return getFolder(folderId);
}

/**
 * Get archive folder (optional)
 */
function getArchiveFolder() {
  const folderId = getConfig('folders.archive');
  return folderId ? getFolder(folderId) : null;
}

/**
 * Create standardized filename
 */
function createFilename(type, identifier, extension, includeTimestamp = true) {
  const timestamp = includeTimestamp ? `_${getCurrentTimestamp()}` : '';
  const sanitizedId = identifier.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `gmail_${type}_${sanitizedId}${timestamp}.${extension}`;
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date X days ago in YYYY-MM-DD format
 */
function getDateXDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Get first day of last month
 */
function getFirstDayOfLastMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setDate(1);
  return date.toISOString().split('T')[0];
}

/**
 * Get last day of last month
 */
function getLastDayOfLastMonth() {
  const date = new Date();
  date.setDate(0);
  return date.toISOString().split('T')[0];
}

/**
 * Get current timestamp for filenames
 */
function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
}

/**
 * Logging functions
 */
function logDebug(message) {
  if (getConfig('debug.enabled') && getConfig('debug.logLevel') === 'DEBUG') {
    Logger.log(`[DEBUG] ${message}`);
  }
}

function logInfo(message) {
  if (getConfig('debug.enabled')) {
    Logger.log(`[INFO] ${message}`);
  }
}

function logWarn(message) {
  if (getConfig('debug.enabled')) {
    Logger.log(`[WARN] ${message}`);
  }
}

function logError(message) {
  if (getConfig('debug.enabled')) {
    Logger.log(`[ERROR] ${message}`);
  }
}

/**
 * Rate limiting utility
 */
function rateLimitDelay() {
  const delay = getConfig('limits.requestDelay');
  if (delay > 0) {
    Utilities.sleep(delay);
  }
}

/**
 * Retry utility with exponential backoff
 */
function retryWithBackoff(fn, maxRetries = null) {
  maxRetries = maxRetries || getConfig('errorHandling.maxRetries');
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return fn();
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        logError(`Max retries (${maxRetries}) exceeded: ${error.message}`);
        throw error;
      }
      
      const delay = getConfig('errorHandling.retryDelay') * Math.pow(2, retries - 1);
      logWarn(`Retry ${retries}/${maxRetries} after ${delay}ms: ${error.message}`);
      Utilities.sleep(delay);
    }
  }
}

/**
 * Display current configuration
 */
function showConfig() {
  logInfo('=== Gmail Automation Configuration ===');
  logInfo(JSON.stringify(GMAIL_CONFIG, null, 2));
}

/**
 * Test configuration
 */
function testConfig() {
  logInfo('Testing Gmail Automation Configuration...');
  
  try {
    // Validate config
    const isValid = validateConfig();
    
    if (isValid) {
      // Test folder access if configured
      const outputFolderId = getConfig('folders.output');
      if (outputFolderId) {
        const outputFolder = getOutputFolder();
        logInfo(`✓ Output folder accessible: ${outputFolder.getName()}`);
      } else {
        logWarn('⚠ Output folder not configured');
      }
      
      // Test other configurations
      logInfo(`✓ Project: ${getConfig('project.name')}`);
      logInfo(`✓ Version: ${getConfig('project.version')}`);
      logInfo(`✓ Max batch size: ${getConfig('limits.maxEmailsPerBatch')}`);
      logInfo(`✓ Default format: ${getConfig('export.defaultFormat')}`);
      
      logInfo('✓ Configuration test completed successfully');
      
    } else {
      throw new Error('Configuration validation failed');
    }
    
  } catch (error) {
    logError(`Configuration test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Initialize configuration for first-time setup
 */
function initializeConfig() {
  logInfo('Initializing Gmail Automation Configuration...');
  
  // Show current configuration
  showConfig();
  
  // Validate configuration
  validateConfig();
  
  logInfo('Configuration initialized. Update folder IDs before running scripts.');
  logInfo('Key configurations to set:');
  logInfo('  - GMAIL_CONFIG.folders.output: Your output folder ID');
  logInfo('  - GMAIL_CONFIG.folders.archive: Your archive folder ID (optional)');
  logInfo('  - Adjust limits and preferences as needed');
}
