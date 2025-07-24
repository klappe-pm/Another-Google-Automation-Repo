/**
 * @fileoverview Common utilities and shared functions
 * @author Platform Team <platform-team@company.com>
 * @version 1.0.0
 * @since 2025-07-24
 * @lastmodified 2025-07-24
 */

/**
 * Logger class for consistent logging across the service
 */
class Logger {
  /**
   * Log a debug message
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static debug(message, data = null) {
    if (getConfig('LOG_LEVEL') === 'DEBUG') {
      this._log('DEBUG', message, data);
    }
  }
  
  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static info(message, data = null) {
    const logLevel = getConfig('LOG_LEVEL');
    if (['DEBUG', 'INFO'].includes(logLevel)) {
      this._log('INFO', message, data);
    }
  }
  
  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static warn(message, data = null) {
    const logLevel = getConfig('LOG_LEVEL');
    if (['DEBUG', 'INFO', 'WARN'].includes(logLevel)) {
      this._log('WARN', message, data);
    }
  }
  
  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static error(message, data = null) {
    this._log('ERROR', message, data);
  }
  
  /**
   * Internal logging method
   * @private
   * @param {string} level - Log level
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static _log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (getConfig('LOG_TO_CONSOLE', true)) {
      console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
    }
    
    if (getConfig('LOG_TO_SHEET', false)) {
      this._logToSheet(level, message, data);
    }
  }
  
  /**
   * Log to a Google Sheet (optional)
   * @private
   * @param {string} level - Log level
   * @param {string} message - The message to log
   * @param {Object} data - Additional data to log
   */
  static _logToSheet(level, message, data) {
    // Implementation for logging to Google Sheets
    // This would require a specific sheet ID and setup
  }
}

/**
 * Error handling utilities
 */
class ErrorHandler {
  /**
   * Handle and log errors consistently
   * @param {Error} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @param {boolean} notify - Whether to send notification email
   * @returns {Object} Standardized error response
   */
  static handle(error, context = 'Unknown', notify = false) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message,
      stack: error.stack,
      service: getConfig('SERVICE_NAME'),
      version: getConfig('VERSION')
    };
    
    Logger.error(`Error in ${context}`, errorInfo);
    
    if (notify && !isDevelopment()) {
      this._sendErrorNotification(errorInfo);
    }
    
    return {
      success: false,
      error: {
        code: this._getErrorCode(error),
        message: error.message,
        context: context,
        timestamp: errorInfo.timestamp
      }
    };
  }
  
  /**
   * Get standardized error code
   * @private
   * @param {Error} error - The error object
   * @returns {string} Error code
   */
  static _getErrorCode(error) {
    // Map common error types to codes
    if (error.name === 'TypeError') return ERROR_CODES.VALIDATION_ERROR.code;
    if (error.message.includes('timeout')) return ERROR_CODES.TIMEOUT_ERROR.code;
    if (error.message.includes('permission')) return ERROR_CODES.PERMISSION_ERROR.code;
    return ERROR_CODES.GENERAL_ERROR.code;
  }
  
  /**
   * Send error notification email
   * @private
   * @param {Object} errorInfo - Error information
   */
  static _sendErrorNotification(errorInfo) {
    try {
      const subject = `${getConfig('SERVICE_NAME')} Error: ${errorInfo.context}`;
      const body = `
        An error occurred in ${getConfig('SERVICE_NAME')}:
        
        Context: ${errorInfo.context}
        Message: ${errorInfo.message}
        Timestamp: ${errorInfo.timestamp}
        Version: ${errorInfo.version}
        
        Stack Trace:
        ${errorInfo.stack}
      `;
      
      MailApp.sendEmail({
        to: getConfig('ERROR_EMAIL'),
        subject: subject,
        body: body
      });
    } catch (e) {
      Logger.error('Failed to send error notification', e);
    }
  }
}

/**
 * Lock manager for preventing concurrent executions
 */
class LockManager {
  /**
   * Acquire a lock with timeout
   * @param {string} lockName - Name of the lock
   * @param {number} timeout - Timeout in milliseconds
   * @returns {LockService.Lock|null} Lock object or null if failed
   */
  static acquire(lockName = 'default', timeout = null) {
    timeout = timeout || getConfig('LOCK_TIMEOUT', 30000);
    
    try {
      const lock = LockService.getScriptLock();
      if (lock.tryLock(timeout)) {
        Logger.debug(`Lock '${lockName}' acquired`);
        return lock;
      } else {
        Logger.warn(`Failed to acquire lock '${lockName}' within ${timeout}ms`);
        return null;
      }
    } catch (error) {
      Logger.error(`Error acquiring lock '${lockName}'`, error);
      return null;
    }
  }
  
  /**
   * Release a lock
   * @param {LockService.Lock} lock - Lock to release
   * @param {string} lockName - Name of the lock for logging
   */
  static release(lock, lockName = 'default') {
    if (lock) {
      try {
        lock.releaseLock();
        Logger.debug(`Lock '${lockName}' released`);
      } catch (error) {
        Logger.error(`Error releasing lock '${lockName}'`, error);
      }
    }
  }
}

/**
 * Retry utility for handling transient failures
 */
class RetryHelper {
  /**
   * Execute a function with retry logic
   * @param {Function} fn - Function to execute
   * @param {number} maxAttempts - Maximum number of attempts
   * @param {number} delay - Delay between attempts in milliseconds
   * @param {string} context - Context for logging
   * @returns {*} Result of the function execution
   * @throws {Error} If all attempts fail
   */
  static execute(fn, maxAttempts = null, delay = null, context = 'Unknown') {
    maxAttempts = maxAttempts || getConfig('RETRY_ATTEMPTS', 3);
    delay = delay || getConfig('RETRY_DELAY', 1000);
    
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        Logger.debug(`Attempt ${attempt}/${maxAttempts} for ${context}`);
        return fn();
      } catch (error) {
        lastError = error;
        Logger.warn(`Attempt ${attempt}/${maxAttempts} failed for ${context}`, error.message);
        
        if (attempt < maxAttempts) {
          Utilities.sleep(delay);
        }
      }
    }
    
    throw new Error(`All ${maxAttempts} attempts failed for ${context}: ${lastError.message}`);
  }
}
