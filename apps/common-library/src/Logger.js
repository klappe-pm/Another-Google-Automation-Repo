/**
 * Common Library - Logger Module
 * 
 * Purpose: Structured logging for all services
 * Service: Shared Library
 * Created: 2025-08-06
 * 
 * This module provides:
 * - Consistent logging format across services
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Context preservation
 * - Performance tracking
 * - Audit trail capabilities
 */

/**
 * Log levels enum
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * Global logging configuration
 */
const LogConfig = {
  level: LogLevel.INFO,
  includeTimestamp: true,
  includeContext: true,
  includeStackTrace: false,
  maxLogSize: 1000,  // Maximum characters per log entry
  enableConsole: true,
  enableSheet: false,
  sheetId: null
};

/**
 * Main logging function
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
function log(message, context = {}, level = 'INFO') {
  const logLevel = LogLevel[level] || LogLevel.INFO;
  
  // Check if should log based on configured level
  if (logLevel < LogConfig.level) {
    return;
  }
  
  const logEntry = createLogEntry(level, message, context);
  
  // Output to console
  if (LogConfig.enableConsole) {
    outputToConsole(logEntry);
  }
  
  // Output to sheet if configured
  if (LogConfig.enableSheet && LogConfig.sheetId) {
    outputToSheet(logEntry);
  }
  
  // Store in properties for retrieval
  storeLogEntry(logEntry);
  
  return logEntry;
}

/**
 * Debug level logging
 * @param {string} message - Debug message
 * @param {Object} context - Additional context
 */
function logDebug(message, context = {}) {
  return log(message, context, 'DEBUG');
}

/**
 * Info level logging
 * @param {string} message - Info message
 * @param {Object} context - Additional context
 */
function logInfo(message, context = {}) {
  return log(message, context, 'INFO');
}

/**
 * Warning level logging
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
function logWarn(message, context = {}) {
  return log(message, context, 'WARN');
}

/**
 * Error level logging
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 */
function logError(message, context = {}) {
  return log(message, context, 'ERROR');
}

/**
 * Create structured log entry
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 * @return {Object} Structured log entry
 */
function createLogEntry(level, message, context) {
  const entry = {
    level: level,
    message: truncateMessage(message),
    timestamp: new Date().toISOString()
  };
  
  // Add context if enabled
  if (LogConfig.includeContext) {
    entry.context = {
      service: context.service || 'unknown',
      function: context.function || 'unknown',
      user: context.user || getCurrentUser(),
      executionId: context.executionId || getExecutionId(),
      ...context
    };
  }
  
  // Add stack trace for errors if enabled
  if (LogConfig.includeStackTrace && level === 'ERROR') {
    entry.stack = new Error().stack;
  }
  
  return entry;
}

/**
 * Output log entry to console
 * @param {Object} logEntry - Log entry
 */
function outputToConsole(logEntry) {
  const prefix = getLogPrefix(logEntry.level);
  const message = formatConsoleMessage(logEntry);
  
  switch (logEntry.level) {
    case 'ERROR':
      console.error(prefix, message);
      break;
    case 'WARN':
      console.warn(prefix, message);
      break;
    case 'DEBUG':
      console.log(prefix, message);
      break;
    default:
      console.info(prefix, message);
  }
}

/**
 * Get console prefix for log level
 * @param {string} level - Log level
 * @return {string} Console prefix
 */
function getLogPrefix(level) {
  const prefixes = {
    'DEBUG': '🔍',
    'INFO': 'ℹ️',
    'WARN': '⚠️',
    'ERROR': '❌'
  };
  
  return prefixes[level] || '📝';
}

/**
 * Format message for console output
 * @param {Object} logEntry - Log entry
 * @return {string} Formatted message
 */
function formatConsoleMessage(logEntry) {
  let message = logEntry.message;
  
  if (LogConfig.includeTimestamp) {
    message = `[${logEntry.timestamp}] ${message}`;
  }
  
  if (LogConfig.includeContext && logEntry.context) {
    const contextStr = Object.entries(logEntry.context)
      .filter(([key, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(', ');
    
    if (contextStr) {
      message += ` | ${contextStr}`;
    }
  }
  
  return message;
}

/**
 * Output log entry to Google Sheet
 * @param {Object} logEntry - Log entry
 */
function outputToSheet(logEntry) {
  try {
    const sheet = SpreadsheetApp.openById(LogConfig.sheetId).getSheetByName('Logs');
    if (!sheet) {
      return;
    }
    
    const row = [
      logEntry.timestamp,
      logEntry.level,
      logEntry.message,
      logEntry.context ? JSON.stringify(logEntry.context) : '',
      logEntry.context?.service || '',
      logEntry.context?.function || '',
      logEntry.context?.user || ''
    ];
    
    sheet.appendRow(row);
  } catch (e) {
    console.error('Failed to write to log sheet:', e);
  }
}

/**
 * Store log entry in Script Properties
 * @param {Object} logEntry - Log entry
 */
function storeLogEntry(logEntry) {
  try {
    const props = PropertiesService.getScriptProperties();
    let logs = JSON.parse(props.getProperty('recent_logs') || '[]');
    
    // Add new log
    logs.unshift({
      timestamp: logEntry.timestamp,
      level: logEntry.level,
      message: logEntry.message.substring(0, 100),  // Truncate for storage
      service: logEntry.context?.service
    });
    
    // Keep only last 20 logs
    logs = logs.slice(0, 20);
    
    props.setProperty('recent_logs', JSON.stringify(logs));
  } catch (e) {
    // Silently fail to avoid infinite loop
  }
}

/**
 * Truncate message if too long
 * @param {string} message - Message to truncate
 * @return {string} Truncated message
 */
function truncateMessage(message) {
  if (!message) return '';
  
  const str = typeof message === 'string' ? message : JSON.stringify(message);
  
  if (str.length <= LogConfig.maxLogSize) {
    return str;
  }
  
  return str.substring(0, LogConfig.maxLogSize - 3) + '...';
}

/**
 * Get current user email
 * @return {string} User email
 */
function getCurrentUser() {
  try {
    return Session.getActiveUser().getEmail() || 'anonymous';
  } catch (e) {
    return 'anonymous';
  }
}

/**
 * Get unique execution ID
 * @return {string} Execution ID
 */
function getExecutionId() {
  // Use timestamp + random for unique ID
  return new Date().getTime().toString(36) + Math.random().toString(36).substring(2, 5);
}

/**
 * Configure logging settings
 * @param {Object} config - Configuration object
 */
function configureLogging(config) {
  Object.assign(LogConfig, config);
}

/**
 * Set log level
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, NONE)
 */
function setLogLevel(level) {
  if (LogLevel.hasOwnProperty(level)) {
    LogConfig.level = LogLevel[level];
  }
}

/**
 * Get recent logs
 * @param {number} count - Number of logs to retrieve
 * @return {Array} Recent log entries
 */
function getRecentLogs(count = 20) {
  try {
    const props = PropertiesService.getScriptProperties();
    const logs = JSON.parse(props.getProperty('recent_logs') || '[]');
    return logs.slice(0, count);
  } catch (e) {
    return [];
  }
}

/**
 * Clear stored logs
 */
function clearLogs() {
  try {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('recent_logs');
  } catch (e) {
    console.error('Failed to clear logs:', e);
  }
}

/**
 * Log performance metrics
 * @param {string} operation - Operation name
 * @param {number} startTime - Start timestamp
 * @param {Object} context - Additional context
 */
function logPerformance(operation, startTime, context = {}) {
  const duration = new Date().getTime() - startTime;
  
  return logInfo(`Performance: ${operation}`, {
    ...context,
    duration: duration,
    durationFormatted: `${duration}ms`,
    operation: operation
  });
}

/**
 * Create logger instance with predefined context
 * @param {Object} defaultContext - Default context for all logs
 * @return {Object} Logger instance
 */
function createLogger(defaultContext = {}) {
  return {
    debug: (message, context = {}) => logDebug(message, {...defaultContext, ...context}),
    info: (message, context = {}) => logInfo(message, {...defaultContext, ...context}),
    warn: (message, context = {}) => logWarn(message, {...defaultContext, ...context}),
    error: (message, context = {}) => logError(message, {...defaultContext, ...context}),
    performance: (operation, startTime, context = {}) => 
      logPerformance(operation, startTime, {...defaultContext, ...context})
  };
}

/**
 * Log function entry (for debugging)
 * @param {string} functionName - Function name
 * @param {Object} args - Function arguments
 * @param {Object} context - Additional context
 */
function logFunctionEntry(functionName, args = {}, context = {}) {
  return logDebug(`Entering: ${functionName}`, {
    ...context,
    function: functionName,
    arguments: args,
    type: 'function_entry'
  });
}

/**
 * Log function exit (for debugging)
 * @param {string} functionName - Function name
 * @param {*} result - Function result
 * @param {Object} context - Additional context
 */
function logFunctionExit(functionName, result = undefined, context = {}) {
  return logDebug(`Exiting: ${functionName}`, {
    ...context,
    function: functionName,
    hasResult: result !== undefined,
    type: 'function_exit'
  });
}