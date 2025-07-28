/**
  * Script Name: error-utils
  *
  * Script Summary:
  * Shared utility functions for error handling and retry logic in Google Apps Script.
  *
  * Script Purpose:
  * - Provide consistent error handling across scripts
  * - Implement retry logic with exponential backoff
  * - Standardize error logging and reporting
  *
  * Script Functions:
  * - safeOperation(): Execute operations with retry logic
  * - handleError(): Standardized error handling
  * - logError(): Structured error logging
  * - retryWithBackoff(): Retry with exponential backoff
  * - isRetryableError(): Check if error is retryable
  * - formatError(): Format error for logging
  * - createErrorReport(): Create detailed error report
  * - notifyOnError(): Send error notifications
  *
  * Script Dependencies:
  * - None (standalone utility module)
  *
  * Google Services:
  * - Logger: For error logging
  * - Utilities: For sleep functionality
  */

/**
  * Error severity levels
  */
const ErrorSeverity = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

/**
  * Common retryable error patterns
  */
const RETRYABLE_ERRORS = [
  'Service invoked too many times',
  'Service unavailable',
  'Rate limit exceeded',
  'Timeout',
  'Internal error',
  'Backend error',
  'Network error'
];

/**
  * Executes an operation with retry logic
  * @param {Function} operation - The operation to execute
  * @param {*} fallback - Fallback value if all attempts fail
  * @param {number} retries - Maximum number of retry attempts
  * @returns {*} Result of the operation or fallback value
  */
function safeOperation(operation, fallback = null, retries = 3) {
  let lastError;
  let delay = 500; // Start with 500ms delay

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error;
      logError(error, ErrorSeverity.WARNING, {
        attempt: attempt + 1,
        maxAttempts: retries,
        operation: operation.name || 'anonymous'
      });

      // Check if error is retryable
      if (!isRetryableError(error) || attempt === retries - 1) {
        break;
      }

      // Sleep before retry with exponential backoff
      Utilities.sleep(delay);
      delay *= 2; // Double the delay for next attempt
    }
  }

  // Log final failure
  logError(lastError, ErrorSeverity.ERROR, {
    message: 'All retry attempts failed',
    fallbackUsed: true
  });

  return fallback;
}

/**
  * Retry operation with configurable backoff strategy
  * @param {Function} operation - The operation to execute
  * @param {Object} config - Retry configuration
  * @returns {*} Result of the operation
  */
function retryWithBackoff(operation, config) {
  const settings = Object.assign({
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    onRetry: null
  }, config || {});

  let lastError;
  let delay = settings.initialDelay;

  for (let attempt = 1; attempt <= settings.maxAttempts; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error;

      if (attempt === settings.maxAttempts || !isRetryableError(error)) {
        throw error;
      }

      // Call retry callback if provided
      if (settings.onRetry) {
        settings.onRetry(error, attempt, delay);
      }

      // Sleep before retry
      Utilities.sleep(Math.min(delay, settings.maxDelay));
      delay *= settings.backoffFactor;
    }
  }

  throw lastError;
}

/**
  * Checks if an error is retryable
  * @param {Error} error - The error to check
  * @returns {boolean} True if the error is retryable
  */
function isRetryableError(error) {
  const errorMessage = error.toString().toLowerCase();

  return RETRYABLE_ERRORS.some(pattern =>
    errorMessage.includes(pattern.toLowerCase())
  );
}

/**
  * Handles errors with standardized logging and optional notification
  * @param {Error} error - The error to handle
  * @param {string} context - Context where error occurred
  * @param {Object} metadata - Additional metadata
  * @returns {Object} Error report object
  */
function handleError(error, context, metadata) {
  const errorReport = createErrorReport(error, context, metadata);

  // Log the error
  logError(error, ErrorSeverity.ERROR, errorReport);

  // Determine if notification is needed
  if (shouldNotifyError(error, context)) {
    notifyOnError(errorReport);
  }

  return errorReport;
}

/**
  * Logs errors with structured format
  * @param {Error} error - The error to log
  * @param {string} severity - Error severity level
  * @param {Object} additionalInfo - Additional information to log
  */
function logError(error, severity = ErrorSeverity.ERROR, additionalInfo = {}) {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp: timestamp,
    severity: severity,
    message: error.message || error.toString(),
    stack: error.stack || 'No stack trace available',
    ...additionalInfo
  };

  const logMessage = `[${severity}] ${timestamp} - ${errorInfo.message}\n` +
    `Details: ${JSON.stringify(errorInfo, null, 2)}`;

  switch (severity) {
    case ErrorSeverity.DEBUG:
    case ErrorSeverity.INFO:
      console.info(logMessage);
      break;
    case ErrorSeverity.WARNING:
      console.warn(logMessage);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(logMessage);
      break;
    default:
      console.log(logMessage);
  }

  // Also log to GAS Logger
  Logger.log(logMessage);
}

/**
  * Formats error for display or logging
  * @param {Error} error - The error to format
  * @param {boolean} includeStack - Whether to include stack trace
  * @returns {string} Formatted error string
  */
function formatError(error, includeStack = false) {
  let formatted = `Error: ${error.message || error.toString()}`;

  if (includeStack && error.stack) {
    formatted += `\n\nStack Trace:\n${error.stack}`;
  }

  return formatted;
}

/**
  * Creates a detailed error report
  * @param {Error} error - The error to report
  * @param {string} context - Context where error occurred
  * @param {Object} metadata - Additional metadata
  * @returns {Object} Error report object
  */
function createErrorReport(error, context, metadata = {}) {
  return {
    timestamp: new Date().toISOString(),
    context: context,
    error: {
      message: error.message || error.toString(),
      name: error.name || 'Error',
      stack: error.stack || 'No stack trace available'
    },
    metadata: metadata,
    environment: {
      scriptId: Session.getActiveUser().getEmail() || 'Unknown',
      executionId: Utilities.getUuid()
    }
  };
}

/**
  * Determines if an error should trigger a notification
  * @param {Error} error - The error to check
  * @param {string} context - Context where error occurred
  * @returns {boolean} True if notification should be sent
  */
function shouldNotifyError(error, context) {
  // Critical contexts that always notify
  const criticalContexts = ['payment', 'authentication', 'data_loss'];

  // Check if context is critical
  if (criticalContexts.some(critical =>
    context.toLowerCase().includes(critical))) {
    return true;
  }

  // Check if error message indicates critical issue
  const criticalPatterns = ['corruption', 'security', 'unauthorized'];
  const errorMessage = error.toString().toLowerCase();

  return criticalPatterns.some(pattern =>
    errorMessage.includes(pattern));
}

/**
  * Sends error notification (placeholder - implement based on needs)
  * @param {Object} errorReport - The error report to send
  */
function notifyOnError(errorReport) {
  // This is a placeholder function
  // Implement based on your notification needs:
  // - Send email
  // - Post to Slack
  // - Log to external service
  // - Create calendar event

  Logger.log(`Error notification would be sent: ${JSON.stringify(errorReport)}`);
}

/**
  * Wraps a function with error handling
  * @param {Function} fn - Function to wrap
  * @param {string} context - Context for error reporting
  * @returns {Function} Wrapped function
  */
function withErrorHandling(fn, context) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (error) {
      handleError(error, context, {
        functionName: fn.name || 'anonymous',
        arguments: args
      });
      throw error; // Re-throw after handling
    }
  };
}