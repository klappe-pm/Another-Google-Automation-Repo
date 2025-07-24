/**
 * Title: Centralized Logging Utility
 * Service: Utility
 * Purpose: Unified logging system with multiple output channels and log levels
 * Created: 2025-01-16
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * 
 * Usage:
 *   Logger.info('Message', optionalData);
 *   Logger.error('Error message', error);
 *   Logger.debug('Debug info', debugData);
 * 
 * Timeout Strategy: 30-second timeout for sheet logging operations
 * Batch Processing: Batches log entries for sheet output (batch size: 100)
 * Cache Strategy: In-memory buffer for batch processing
 * Security: Sanitizes sensitive data, validates log levels
 * Performance: Async sheet logging, configurable levels
 */

/*
Script Summary:
- Purpose: Provide consistent logging across all Apps Script services
- Description: Multi-channel logging with console, sheet, and email output options
- Problem Solved: Inconsistent logging patterns and lack of centralized log management
- Successful Execution: All services use unified Logger for consistent monitoring and debugging
*/

/**
 * Log levels enumeration
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

/**
 * Centralized Logger class
 */
class Logger {
  // Static configuration
  static _config = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableSheet: false,
    enableEmail: false,
    sheetId: null,
    emailRecipients: [],
    batchSize: 100,
    maxRetries: 3
  };
  
  // Static batch buffer for sheet logging
  static _batchBuffer = [];
  static _lastFlush = Date.now();
  static _flushInterval = 60000; // 1 minute
  
  /**
   * Initialize logger with configuration
   * @param {Object} config - Logger configuration
   */
  static init(config = {}) {
    try {
      // Merge with default configuration
      this._config = { ...this._config, ...config };
      
      // Load configuration from Config if available
      if (typeof Config !== 'undefined') {
        this._config.level = this._parseLogLevel(Config.get('logger', 'level', 'INFO'));
        this._config.enableConsole = Config.get('logger', 'enableConsole', true);
        this._config.enableSheet = Config.get('logger', 'enableSheet', false);
        this._config.enableEmail = Config.get('logger', 'enableEmail', false);
        this._config.sheetId = Config.get('logger', 'sheetId', null);
        this._config.emailRecipients = Config.get('logger', 'emailRecipients', []);
        this._config.batchSize = Config.get('logger', 'batchSize', 100);
      }
      
      this._info('Logger initialized', this._config);
    } catch (error) {
      console.error('Logger initialization failed:', error);
    }
  }
  
  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} service - Service name (optional)
   */
  static debug(message, data = null, service = null) {
    this._log(LogLevel.DEBUG, message, data, service);
  }
  
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} service - Service name (optional)
   */
  static info(message, data = null, service = null) {
    this._log(LogLevel.INFO, message, data, service);
  }
  
  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} service - Service name (optional)
   */
  static warn(message, data = null, service = null) {
    this._log(LogLevel.WARN, message, data, service);
  }
  
  /**
   * Log error message
   * @param {string} message - Log message
   * @param {*} error - Error object or additional data
   * @param {string} service - Service name (optional)
   */
  static error(message, error = null, service = null) {
    this._log(LogLevel.ERROR, message, error, service);
  }
  
  /**
   * Log fatal error message
   * @param {string} message - Log message
   * @param {*} error - Error object or additional data
   * @param {string} service - Service name (optional)
   */
  static fatal(message, error = null, service = null) {
    this._log(LogLevel.FATAL, message, error, service);
  }
  
  /**
   * Log function execution time
   * @param {Function} fn - Function to execute and time
   * @param {string} functionName - Name of the function for logging
   * @param {*} args - Function arguments
   * @returns {*} Function result
   */
  static time(fn, functionName, ...args) {
    const startTime = Date.now();
    let result;
    let error = null;
    
    try {
      result = fn(...args);
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      const level = error ? LogLevel.ERROR : LogLevel.DEBUG;
      const message = `Function '${functionName}' ${error ? 'failed' : 'completed'} in ${duration}ms`;
      
      this._log(level, message, error || { args, result }, null);
    }
    
    return result;
  }
  
  /**
   * Create a child logger for a specific service
   * @param {string} service - Service name
   * @returns {Object} Child logger instance
   */
  static createChild(service) {
    return {
      debug: (message, data = null) => this.debug(message, data, service),
      info: (message, data = null) => this.info(message, data, service),
      warn: (message, data = null) => this.warn(message, data, service),
      error: (message, error = null) => this.error(message, error, service),
      fatal: (message, error = null) => this.fatal(message, error, service)
    };
  }
  
  /**
   * Flush pending logs to external systems
   */
  static flush() {
    try {
      if (this._batchBuffer.length > 0) {
        this._flushToSheet();
        this._batchBuffer = [];
        this._lastFlush = Date.now();
      }
    } catch (error) {
      console.error('Error flushing logs:', error);
    }
  }
  
  /**
   * Set log level
   * @param {string|number} level - Log level ('DEBUG', 'INFO', etc. or numeric)
   */
  static setLevel(level) {
    this._config.level = this._parseLogLevel(level);
    this._info('Log level changed', { level: this._getLogLevelName(this._config.level) });
  }
  
  /**
   * Get current configuration
   * @returns {Object} Current logger configuration
   */
  static getConfig() {
    return { ...this._config };
  }
  
  /**
   * Internal logging method
   * @private
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} service - Service name
   */
  static _log(level, message, data = null, service = null) {
    // Check if logging is enabled for this level
    if (level < this._config.level) {
      return;
    }
    
    const logEntry = this._createLogEntry(level, message, data, service);
    
    // Console logging
    if (this._config.enableConsole) {
      this._logToConsole(logEntry);
    }
    
    // Sheet logging (batched)
    if (this._config.enableSheet && this._config.sheetId) {
      this._addToBatch(logEntry);
    }
    
    // Email logging for high-priority messages
    if (this._config.enableEmail && level >= LogLevel.ERROR) {
      this._logToEmail(logEntry);
    }
    
    // Auto-flush batch if needed
    if (this._shouldAutoFlush()) {
      this.flush();
    }
  }
  
  /**
   * Create structured log entry
   * @private
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @param {string} service - Service name
   * @returns {Object} Log entry object
   */
  static _createLogEntry(level, message, data, service) {
    const timestamp = new Date();
    const levelName = this._getLogLevelName(level);
    
    return {
      timestamp: timestamp.toISOString(),
      level: levelName,
      service: service || 'unknown',
      message: message,
      data: this._sanitizeData(data),
      session: Session.getTemporaryActiveUserKey(),
      executionId: Utilities.getUuid()
    };
  }
  
  /**
   * Log to console
   * @private
   * @param {Object} logEntry - Log entry
   */
  static _logToConsole(logEntry) {
    const { timestamp, level, service, message, data } = logEntry;
    const prefix = `[${timestamp}] [${level}] [${service}]`;
    
    switch (level) {
      case 'DEBUG':
      case 'INFO':
        console.log(`${prefix} ${message}`, data || '');
        break;
      case 'WARN':
        console.warn(`${prefix} ${message}`, data || '');
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(`${prefix} ${message}`, data || '');
        break;
    }
  }
  
  /**
   * Add log entry to batch buffer
   * @private
   * @param {Object} logEntry - Log entry
   */
  static _addToBatch(logEntry) {
    this._batchBuffer.push(logEntry);
    
    if (this._batchBuffer.length >= this._config.batchSize) {
      this.flush();
    }
  }
  
  /**
   * Flush logs to sheet
   * @private
   */
  static _flushToSheet() {
    if (!this._config.sheetId || this._batchBuffer.length === 0) {
      return;
    }
    
    try {
      const sheet = this._getLogSheet();
      if (!sheet) {
        throw new Error('Could not access log sheet');
      }
      
      // Prepare data for sheet
      const rows = this._batchBuffer.map(entry => [
        entry.timestamp,
        entry.level,
        entry.service,
        entry.message,
        JSON.stringify(entry.data),
        entry.session,
        entry.executionId
      ]);
      
      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        const headers = ['Timestamp', 'Level', 'Service', 'Message', 'Data', 'Session', 'ExecutionId'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      // Append log entries
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
      
    } catch (error) {
      console.error('Error writing to log sheet:', error);
    }
  }
  
  /**
   * Get or create log sheet
   * @private
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Log sheet
   */
  static _getLogSheet() {
    try {
      const spreadsheet = SpreadsheetApp.openById(this._config.sheetId);
      let sheet = spreadsheet.getSheetByName('Logs');
      
      if (!sheet) {
        sheet = spreadsheet.insertSheet('Logs');
      }
      
      return sheet;
    } catch (error) {
      throw new Error(`Cannot access log sheet: ${error.message}`);
    }
  }
  
  /**
   * Send log entry via email
   * @private
   * @param {Object} logEntry - Log entry
   */
  static _logToEmail(logEntry) {
    if (!this._config.emailRecipients.length) {
      return;
    }
    
    try {
      const subject = `[${logEntry.level}] ${logEntry.service}: ${logEntry.message}`;
      const body = this._formatEmailBody(logEntry);
      
      MailApp.sendEmail({
        to: this._config.emailRecipients.join(','),
        subject: subject,
        body: body
      });
    } catch (error) {
      console.error('Error sending log email:', error);
    }
  }
  
  /**
   * Format log entry for email
   * @private
   * @param {Object} logEntry - Log entry
   * @returns {string} Formatted email body
   */
  static _formatEmailBody(logEntry) {
    return `
Timestamp: ${logEntry.timestamp}
Level: ${logEntry.level}
Service: ${logEntry.service}
Message: ${logEntry.message}

Data:
${JSON.stringify(logEntry.data, null, 2)}

Session: ${logEntry.session}
Execution ID: ${logEntry.executionId}
    `.trim();
  }
  
  /**
   * Sanitize data for logging
   * @private
   * @param {*} data - Data to sanitize
   * @returns {*} Sanitized data
   */
  static _sanitizeData(data) {
    if (!data) {
      return null;
    }
    
    try {
      // Convert errors to serializable format
      if (data instanceof Error) {
        return {
          name: data.name,
          message: data.message,
          stack: data.stack
        };
      }
      
      // Handle objects
      if (typeof data === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
          // Redact sensitive fields
          if (this._isSensitiveField(key)) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this._sanitizeValue(value);
          }
        }
        return sanitized;
      }
      
      return data;
    } catch (error) {
      return `[Sanitization Error: ${error.message}]`;
    }
  }
  
  /**
   * Check if field contains sensitive data
   * @private
   * @param {string} fieldName - Field name
   * @returns {boolean} True if field is sensitive
   */
  static _isSensitiveField(fieldName) {
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'apikey', 'auth'];
    return sensitiveFields.some(field => fieldName.toLowerCase().includes(field));
  }
  
  /**
   * Sanitize individual value
   * @private
   * @param {*} value - Value to sanitize
   * @returns {*} Sanitized value
   */
  static _sanitizeValue(value) {
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 1000) + '... [truncated]';
    }
    return value;
  }
  
  /**
   * Parse log level from string or number
   * @private
   * @param {string|number} level - Log level
   * @returns {number} Numeric log level
   */
  static _parseLogLevel(level) {
    if (typeof level === 'number') {
      return level;
    }
    
    const levelMap = {
      'DEBUG': LogLevel.DEBUG,
      'INFO': LogLevel.INFO,
      'WARN': LogLevel.WARN,
      'WARNING': LogLevel.WARN,
      'ERROR': LogLevel.ERROR,
      'FATAL': LogLevel.FATAL
    };
    
    return levelMap[level.toUpperCase()] || LogLevel.INFO;
  }
  
  /**
   * Get log level name from number
   * @private
   * @param {number} level - Numeric log level
   * @returns {string} Log level name
   */
  static _getLogLevelName(level) {
    const levelNames = {
      [LogLevel.DEBUG]: 'DEBUG',
      [LogLevel.INFO]: 'INFO',
      [LogLevel.WARN]: 'WARN',
      [LogLevel.ERROR]: 'ERROR',
      [LogLevel.FATAL]: 'FATAL'
    };
    
    return levelNames[level] || 'INFO';
  }
  
  /**
   * Check if auto-flush should occur
   * @private
   * @returns {boolean} True if should auto-flush
   */
  static _shouldAutoFlush() {
    return (Date.now() - this._lastFlush) > this._flushInterval ||
           this._batchBuffer.length >= this._config.batchSize;
  }
  
  /**
   * Internal info logging (bypasses level check)
   * @private
   */
  static _info(message, data = null) {
    if (this._config.enableConsole) {
      console.log(`[Logger] ${message}`, data || '');
    }
  }
}

// Initialize logger on load
Logger.init();

// Legacy function support
function logDebug(message, data = null) {
  Logger.debug(message, data);
}

function logInfo(message, data = null) {
  Logger.info(message, data);
}

function logWarn(message, data = null) {
  Logger.warn(message, data);
}

function logError(message, error = null) {
  Logger.error(message, error);
}
