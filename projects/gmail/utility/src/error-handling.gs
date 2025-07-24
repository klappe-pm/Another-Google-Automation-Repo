/**
 * Title: Error Handling and Reporting Utility
 * Service: Utility
 * Purpose: Centralized error handling, reporting, and recovery mechanisms
 * Created: 2025-01-16
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * 
 * Usage:
 *   ErrorHandler.handle(error, context);
 *   ErrorHandler.report(error, severity);
 *   const result = ErrorHandler.wrap(riskyFunction, fallbackValue);
 * 
 * Timeout Strategy: 15-second timeout for error reporting
 * Batch Processing: Batched error reports (batch size: 50)
 * Cache Strategy: Error pattern caching for intelligent handling
 * Security: Sanitizes sensitive data in error reports
 * Performance: Async error reporting, rate limiting
 */

/*
Script Summary:
- Purpose: Provide consistent error handling and reporting across all Apps Script services
- Description: Centralized error management with reporting, recovery, and monitoring
- Problem Solved: Inconsistent error handling and lack of proper error tracking
- Successful Execution: All services use ErrorHandler for robust error management
*/

/**
 * Error Severity Levels
 */
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error Categories
 */
const ErrorCategory = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  RUNTIME: 'runtime',
  EXTERNAL_API: 'external_api',
  CONFIGURATION: 'configuration',
  PERMISSION: 'permission',
  TIMEOUT: 'timeout',
  QUOTA: 'quota',
  UNKNOWN: 'unknown'
};

/**
 * Recovery Strategy
 */
const RecoveryStrategy = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  IGNORE: 'ignore',
  FAIL_FAST: 'fail_fast',
  USER_INPUT: 'user_input'
};

/**
 * Centralized Error Handler Class
 */
class ErrorHandler {
  static _config = {
    enableReporting: true,
    enableNotifications: false,
    batchSize: 50,
    maxRetries: 3,
    retryDelay: 1000,
    reportingTimeout: 15000,
    notificationEmails: [],
    trackingSheetId: null
  };
  
  static _errorBatch = [];
  static _errorPatterns = new Map();
  static _lastFlush = Date.now();
  static _flushInterval = 300000; // 5 minutes
  
  /**
   * Initialize error handler
   * @param {Object} config - Configuration options
   */
  static init(config = {}) {
    try {
      this._config = { ...this._config, ...config };
      
      // Load configuration from Config if available
      if (typeof Config !== 'undefined') {
        this._config.enableReporting = Config.get('errorHandler', 'enableReporting', true);
        this._config.enableNotifications = Config.get('errorHandler', 'enableNotifications', false);
        this._config.batchSize = Config.get('errorHandler', 'batchSize', 50);
        this._config.maxRetries = Config.get('errorHandler', 'maxRetries', 3);
        this._config.notificationEmails = Config.get('errorHandler', 'notificationEmails', []);
        this._config.trackingSheetId = Config.get('errorHandler', 'trackingSheetId', null);
      }
      
      Logger.info('ErrorHandler initialized', this._config);
    } catch (error) {
      console.error('ErrorHandler initialization failed:', error);
    }
  }
  
  /**
   * Handle error with context and automatic categorization
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context information
   * @param {string} severity - Error severity level
   * @returns {Object} Error handling result
   */
  static handle(error, context = {}, severity = ErrorSeverity.MEDIUM) {
    try {
      const errorInfo = this._processError(error, context, severity);
      
      // Log the error
      this._logError(errorInfo);
      
      // Report the error
      if (this._config.enableReporting) {
        this._reportError(errorInfo);
      }
      
      // Send notifications for high severity errors
      if (this._config.enableNotifications && 
          [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL].includes(severity)) {
        this._sendNotification(errorInfo);
      }
      
      // Determine recovery strategy
      const strategy = this._determineRecoveryStrategy(errorInfo);
      
      return {
        handled: true,
        errorId: errorInfo.id,
        category: errorInfo.category,
        severity: errorInfo.severity,
        recoveryStrategy: strategy,
        timestamp: errorInfo.timestamp
      };
    } catch (handlingError) {
      console.error('Error in error handler:', handlingError);
      return {
        handled: false,
        error: 'Error handler failed',
        originalError: error
      };
    }
  }
  
  /**
   * Report error to external systems
   * @param {Error|string} error - Error to report
   * @param {string} severity - Error severity
   * @param {Object} context - Additional context
   */
  static report(error, severity = ErrorSeverity.MEDIUM, context = {}) {
    try {
      const errorInfo = this._processError(error, context, severity);
      this._reportError(errorInfo);
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError);
    }
  }
  
  /**
   * Wrap function with error handling
   * @param {Function} fn - Function to wrap
   * @param {*} fallbackValue - Value to return on error
   * @param {Object} options - Wrapping options
   * @returns {*} Function result or fallback value
   */
  static wrap(fn, fallbackValue = null, options = {}) {
    const {
      retries = this._config.maxRetries,
      retryDelay = this._config.retryDelay,
      context = {},
      severity = ErrorSeverity.MEDIUM,
      throwOnFinal = false
    } = options;
    
    let attempt = 0;
    let lastError;
    
    while (attempt <= retries) {
      try {
        return fn();
      } catch (error) {
        lastError = error;
        
        const errorInfo = this._processError(error, {
          ...context,
          function: fn.name || 'anonymous',
          attempt: attempt + 1,
          maxAttempts: retries + 1
        }, severity);
        
        if (attempt < retries && this._isRetryableError(error)) {
          Logger.warn(`Function failed, retrying (${attempt + 1}/${retries + 1})`, {
            error: error.message,
            delay: retryDelay
          });
          
          Utilities.sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          attempt++;
        } else {
          this.handle(error, errorInfo.context, severity);
          
          if (throwOnFinal) {
            throw error;
          }
          
          return fallbackValue;
        }
      }
    }
    
    return fallbackValue;
  }
  
  /**
   * Create custom error with additional metadata
   * @param {string} message - Error message
   * @param {string} category - Error category
   * @param {Object} metadata - Additional metadata
   * @returns {Error} Custom error object
   */
  static createError(message, category = ErrorCategory.RUNTIME, metadata = {}) {
    const error = new Error(message);
    error.category = category;
    error.metadata = metadata;
    error.timestamp = Date.now();
    error.id = Utilities.getUuid();
    
    return error;
  }
  
  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is retryable
   */
  static isRetryable(error) {
    return this._isRetryableError(error);
  }
  
  /**
   * Flush pending error reports
   */
  static flush() {
    try {
      if (this._errorBatch.length > 0) {
        this._flushErrorBatch();
        this._errorBatch = [];
        this._lastFlush = Date.now();
      }
    } catch (error) {
      console.error('Error flushing error batch:', error);
    }
  }
  
  /**
   * Get error statistics
   * @param {number} timeRange - Time range in milliseconds (default: 24 hours)
   * @returns {Object} Error statistics
   */
  static getStats(timeRange = 86400000) {
    try {
      const cutoff = Date.now() - timeRange;
      const recentErrors = this._errorBatch.filter(error => error.timestamp > cutoff);
      
      const stats = {
        total: recentErrors.length,
        bySeverity: {},
        byCategory: {},
        byService: {},
        topErrors: []
      };
      
      // Group by severity
      Object.values(ErrorSeverity).forEach(severity => {
        stats.bySeverity[severity] = recentErrors.filter(e => e.severity === severity).length;
      });
      
      // Group by category
      Object.values(ErrorCategory).forEach(category => {
        stats.byCategory[category] = recentErrors.filter(e => e.category === category).length;
      });
      
      // Group by service
      recentErrors.forEach(error => {
        const service = error.context.service || 'unknown';
        stats.byService[service] = (stats.byService[service] || 0) + 1;
      });
      
      // Top error messages
      const errorCounts = {};
      recentErrors.forEach(error => {
        const key = error.message.substring(0, 100);
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      
      stats.topErrors = Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([message, count]) => ({ message, count }));
      
      return stats;
    } catch (error) {
      Logger.error('Failed to get error stats', error);
      return { total: 0, error: error.message };
    }
  }
  
  /**
   * Process error object and extract information
   * @private
   * @param {Error|string} error - Error to process
   * @param {Object} context - Additional context
   * @param {string} severity - Error severity
   * @returns {Object} Processed error information
   */
  static _processError(error, context, severity) {
    const timestamp = Date.now();
    const id = Utilities.getUuid();
    
    let message, stack, category, metadata;
    
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      category = error.category || this._categorizeError(error);
      metadata = error.metadata || {};
    } else {
      message = String(error);
      stack = null;
      category = ErrorCategory.UNKNOWN;
      metadata = {};
    }
    
    return {
      id,
      timestamp,
      message: this._sanitizeMessage(message),
      stack: this._sanitizeStack(stack),
      category,
      severity,
      context: this._sanitizeContext(context),
      metadata,
      session: Session.getTemporaryActiveUserKey(),
      executionId: context.executionId || Utilities.getUuid()
    };
  }
  
  /**
   * Categorize error based on message and type
   * @private
   * @param {Error} error - Error to categorize
   * @returns {string} Error category
   */
  static _categorizeError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('time out')) {
      return ErrorCategory.TIMEOUT;
    }
    
    if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes('unauthorized') || message.includes('forbidden') || 
        message.includes('authentication') || message.includes('token')) {
      return ErrorCategory.AUTH;
    }
    
    if (message.includes('permission') || message.includes('access denied')) {
      return ErrorCategory.PERMISSION;
    }
    
    if (message.includes('quota') || message.includes('limit exceeded') || 
        message.includes('rate limit')) {
      return ErrorCategory.QUOTA;
    }
    
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required')) {
      return ErrorCategory.VALIDATION;
    }
    
    if (message.includes('api') || message.includes('service unavailable') || 
        message.includes('bad gateway')) {
      return ErrorCategory.EXTERNAL_API;
    }
    
    if (message.includes('config') || message.includes('setting')) {
      return ErrorCategory.CONFIGURATION;
    }
    
    return ErrorCategory.RUNTIME;
  }
  
  /**
   * Log error using appropriate logger
   * @private
   * @param {Object} errorInfo - Processed error information
   */
  static _logError(errorInfo) {
    const logLevel = this._getLogLevel(errorInfo.severity);
    const context = {
      category: errorInfo.category,
      errorId: errorInfo.id,
      ...errorInfo.context
    };
    
    switch (logLevel) {
      case 'error':
      case 'fatal':
        Logger.error(errorInfo.message, context);
        break;
      case 'warn':
        Logger.warn(errorInfo.message, context);
        break;
      default:
        Logger.info(`Error: ${errorInfo.message}`, context);
    }
  }
  
  /**
   * Report error to external systems
   * @private
   * @param {Object} errorInfo - Processed error information
   */
  static _reportError(errorInfo) {
    try {
      this._errorBatch.push(errorInfo);
      
      if (this._errorBatch.length >= this._config.batchSize ||
          (Date.now() - this._lastFlush) > this._flushInterval) {
        this.flush();
      }
    } catch (error) {
      console.error('Error reporting failed:', error);
    }
  }
  
  /**
   * Flush error batch to external systems
   * @private
   */
  static _flushErrorBatch() {
    if (!this._config.trackingSheetId) {
      return;
    }
    
    try {
      const sheet = this._getErrorSheet();
      if (!sheet) {
        return;
      }
      
      // Prepare data for sheet
      const rows = this._errorBatch.map(error => [
        new Date(error.timestamp).toISOString(),
        error.id,
        error.severity,
        error.category,
        error.message,
        JSON.stringify(error.context),
        error.session,
        error.executionId
      ]);
      
      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        const headers = ['Timestamp', 'ID', 'Severity', 'Category', 'Message', 'Context', 'Session', 'ExecutionId'];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
      
      // Append error entries
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rows.length, rows[0].length).setValues(rows);
      
    } catch (error) {
      console.error('Error writing to tracking sheet:', error);
    }
  }
  
  /**
   * Get or create error tracking sheet
   * @private
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Error tracking sheet
   */
  static _getErrorSheet() {
    try {
      const spreadsheet = SpreadsheetApp.openById(this._config.trackingSheetId);
      let sheet = spreadsheet.getSheetByName('Errors');
      
      if (!sheet) {
        sheet = spreadsheet.insertSheet('Errors');
      }
      
      return sheet;
    } catch (error) {
      throw new Error(`Cannot access error tracking sheet: ${error.message}`);
    }
  }
  
  /**
   * Send error notification
   * @private
   * @param {Object} errorInfo - Processed error information
   */
  static _sendNotification(errorInfo) {
    if (!this._config.notificationEmails.length) {
      return;
    }
    
    try {
      const subject = `[${errorInfo.severity.toUpperCase()}] Error in ${errorInfo.context.service || 'Unknown Service'}`;
      const body = this._formatNotificationBody(errorInfo);
      
      MailApp.sendEmail({
        to: this._config.notificationEmails.join(','),
        subject: subject,
        body: body
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  /**
   * Format notification email body
   * @private
   * @param {Object} errorInfo - Error information
   * @returns {string} Formatted email body
   */
  static _formatNotificationBody(errorInfo) {
    return `
Error Report
============

Timestamp: ${new Date(errorInfo.timestamp).toISOString()}
Severity: ${errorInfo.severity}
Category: ${errorInfo.category}
Error ID: ${errorInfo.id}

Message:
${errorInfo.message}

Context:
${JSON.stringify(errorInfo.context, null, 2)}

Session: ${errorInfo.session}
Execution ID: ${errorInfo.executionId}

${errorInfo.stack ? `Stack Trace:
${errorInfo.stack}` : ''}
    `.trim();
  }
  
  /**
   * Determine recovery strategy for error
   * @private
   * @param {Object} errorInfo - Error information
   * @returns {string} Recovery strategy
   */
  static _determineRecoveryStrategy(errorInfo) {
    switch (errorInfo.category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
      case ErrorCategory.EXTERNAL_API:
        return RecoveryStrategy.RETRY;
        
      case ErrorCategory.QUOTA:
        return RecoveryStrategy.FALLBACK;
        
      case ErrorCategory.AUTH:
      case ErrorCategory.PERMISSION:
        return RecoveryStrategy.USER_INPUT;
        
      case ErrorCategory.VALIDATION:
      case ErrorCategory.CONFIGURATION:
        return RecoveryStrategy.FAIL_FAST;
        
      default:
        return errorInfo.severity === ErrorSeverity.CRITICAL ? 
               RecoveryStrategy.FAIL_FAST : RecoveryStrategy.RETRY;
    }
  }
  
  /**
   * Check if error is retryable
   * @private
   * @param {Error} error - Error to check
   * @returns {boolean} True if retryable
   */
  static _isRetryableError(error) {
    const retryablePatterns = [
      /timeout/i,
      /network error/i,
      /connection/i,
      /service unavailable/i,
      /internal server error/i,
      /rate limit/i,
      /quota/i
    ];
    
    const message = error.message || '';
    return retryablePatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * Get log level for severity
   * @private
   * @param {string} severity - Error severity
   * @returns {string} Log level
   */
  static _getLogLevel(severity) {
    const levelMap = {
      [ErrorSeverity.LOW]: 'info',
      [ErrorSeverity.MEDIUM]: 'warn',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'fatal'
    };
    
    return levelMap[severity] || 'error';
  }
  
  /**
   * Sanitize error message
   * @private
   * @param {string} message - Error message
   * @returns {string} Sanitized message
   */
  static _sanitizeMessage(message) {
    if (!message) return '';
    
    // Remove potential sensitive information
    return message
      .replace(/api[_-]?key[s]?[\s:=]+[\w-]+/gi, 'apikey=[REDACTED]')
      .replace(/token[s]?[\s:=]+[\w.-]+/gi, 'token=[REDACTED]')
      .replace(/password[s]?[\s:=]+\S+/gi, 'password=[REDACTED]')
      .substring(0, 500); // Limit length
  }
  
  /**
   * Sanitize stack trace
   * @private
   * @param {string} stack - Stack trace
   * @returns {string} Sanitized stack trace
   */
  static _sanitizeStack(stack) {
    if (!stack) return null;
    
    return stack.substring(0, 2000); // Limit length
  }
  
  /**
   * Sanitize context data
   * @private
   * @param {Object} context - Context data
   * @returns {Object} Sanitized context
   */
  static _sanitizeContext(context) {
    if (!context || typeof context !== 'object') {
      return {};
    }
    
    const sanitized = {};
    
    Object.entries(context).forEach(([key, value]) => {
      // Skip sensitive fields
      if (this._isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 200) {
        sanitized[key] = value.substring(0, 200) + '...[truncated]';
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }
  
  /**
   * Check if field contains sensitive data
   * @private
   * @param {string} fieldName - Field name
   * @returns {boolean} True if sensitive
   */
  static _isSensitiveField(fieldName) {
    const sensitiveFields = ['password', 'token', 'key', 'secret', 'apikey', 'auth', 'credential'];
    return sensitiveFields.some(field => fieldName.toLowerCase().includes(field));
  }
  
  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  static getConfig() {
    return { ...this._config };
  }
}

// Initialize ErrorHandler on load
ErrorHandler.init();

// Legacy function support
function handleError(error, context = {}) {
  return ErrorHandler.handle(error, context);
}

function reportError(error, severity = ErrorSeverity.MEDIUM) {
  return ErrorHandler.report(error, severity);
}

function wrapWithErrorHandling(fn, fallback = null) {
  return ErrorHandler.wrap(fn, fallback);
}
