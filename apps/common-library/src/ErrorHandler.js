/**
 * Common Library - Error Handler Module
 * 
 * Purpose: Centralized error handling and reporting
 * Service: Shared Library
 * Created: 2025-08-06
 * 
 * This module provides:
 * - Consistent error handling across all services
 * - Error logging and tracking
 * - Context preservation for debugging
 * - Retry logic for transient failures
 * - Error recovery strategies
 */

/**
 * Error severity levels
 */
const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Error types for categorization
 */
const ErrorType = {
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  QUOTA: 'QUOTA',
  DATA: 'DATA',
  SYSTEM: 'SYSTEM',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Main error handling function
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @return {Object} Structured error information
 */
function handleError(error, context = {}) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    message: error.message || error.toString(),
    stack: error.stack || 'No stack trace available',
    type: classifyError(error),
    severity: determineSeverity(error),
    context: {
      service: context.service || 'unknown',
      function: context.function || 'unknown',
      user: context.user || Session.getActiveUser().getEmail(),
      ...context
    },
    id: generateErrorId()
  };
  
  // Log to console (appears in Stackdriver)
  console.error('ERROR:', JSON.stringify(errorInfo));
  
  // Store in Script Properties for debugging (keep last 10 errors)
  storeError(errorInfo);
  
  // Send alert for critical errors
  if (errorInfo.severity === ErrorSeverity.CRITICAL) {
    sendErrorAlert(errorInfo);
  }
  
  return errorInfo;
}

/**
 * Wrap function with error handling
 * @param {Function} func - Function to wrap
 * @param {Object} context - Context for error reporting
 * @return {Function} Wrapped function with error handling
 */
function withErrorHandling(func, context = {}) {
  return function(...args) {
    const functionContext = {
      ...context,
      function: func.name || 'anonymous',
      arguments: args.length > 0 ? `[${args.length} args]` : 'none',
      startTime: new Date().toISOString()
    };
    
    try {
      const result = func.apply(this, args);
      
      // Handle promises
      if (result && typeof result.then === 'function') {
        return result.catch(error => {
          handleError(error, functionContext);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      const errorInfo = handleError(error, functionContext);
      
      // Re-throw with enhanced message
      const enhancedError = new Error(
        `[${errorInfo.type}] ${error.message} (Error ID: ${errorInfo.id})`
      );
      enhancedError.originalError = error;
      enhancedError.errorInfo = errorInfo;
      
      throw enhancedError;
    }
  };
}

/**
 * Retry function with exponential backoff
 * @param {Function} func - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @param {Object} context - Context for error reporting
 * @return {*} Function result
 */
function withRetry(func, maxRetries = 3, initialDelay = 1000, context = {}) {
  let lastError;
  let delay = initialDelay;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return func();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      const errorType = classifyError(error);
      if (errorType === ErrorType.VALIDATION || 
          errorType === ErrorType.AUTHORIZATION) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
        Utilities.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  // All retries failed
  handleError(lastError, {
    ...context,
    retries: maxRetries,
    finalAttempt: true
  });
  
  throw lastError;
}

/**
 * Classify error type based on message and properties
 * @param {Error} error - Error to classify
 * @return {string} Error type from ErrorType enum
 */
function classifyError(error) {
  const message = error.message ? error.message.toLowerCase() : '';
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  
  if (message.includes('authentication') || message.includes('unauthorized')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('permission') || message.includes('forbidden')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK;
  }
  
  if (message.includes('timeout') || message.includes('time limit')) {
    return ErrorType.TIMEOUT;
  }
  
  if (message.includes('quota') || message.includes('rate limit')) {
    return ErrorType.QUOTA;
  }
  
  if (message.includes('data') || message.includes('parse')) {
    return ErrorType.DATA;
  }
  
  if (message.includes('system') || message.includes('internal')) {
    return ErrorType.SYSTEM;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Determine error severity based on type and context
 * @param {Error} error - Error to evaluate
 * @return {string} Severity level from ErrorSeverity enum
 */
function determineSeverity(error) {
  const type = classifyError(error);
  const message = error.message ? error.message.toLowerCase() : '';
  
  // Critical errors
  if (type === ErrorType.SYSTEM || 
      message.includes('critical') ||
      message.includes('fatal')) {
    return ErrorSeverity.CRITICAL;
  }
  
  // High severity
  if (type === ErrorType.AUTHENTICATION ||
      type === ErrorType.AUTHORIZATION ||
      type === ErrorType.QUOTA) {
    return ErrorSeverity.HIGH;
  }
  
  // Medium severity
  if (type === ErrorType.NETWORK ||
      type === ErrorType.TIMEOUT ||
      type === ErrorType.DATA) {
    return ErrorSeverity.MEDIUM;
  }
  
  // Low severity
  return ErrorSeverity.LOW;
}

/**
 * Generate unique error ID
 * @return {string} Unique error identifier
 */
function generateErrorId() {
  const timestamp = new Date().getTime().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ERR_${timestamp}_${random}`.toUpperCase();
}

/**
 * Store error in Script Properties for debugging
 * @param {Object} errorInfo - Error information to store
 */
function storeError(errorInfo) {
  try {
    const props = PropertiesService.getScriptProperties();
    let errors = JSON.parse(props.getProperty('recent_errors') || '[]');
    
    // Add new error
    errors.unshift({
      id: errorInfo.id,
      timestamp: errorInfo.timestamp,
      message: errorInfo.message,
      type: errorInfo.type,
      severity: errorInfo.severity,
      service: errorInfo.context.service,
      function: errorInfo.context.function
    });
    
    // Keep only last 10 errors
    errors = errors.slice(0, 10);
    
    props.setProperty('recent_errors', JSON.stringify(errors));
    props.setProperty('last_error_id', errorInfo.id);
    props.setProperty('last_error_time', errorInfo.timestamp);
  } catch (e) {
    // Failed to store error, log to console
    console.error('Failed to store error:', e);
  }
}

/**
 * Get recent errors from storage
 * @param {number} count - Number of errors to retrieve
 * @return {Array} Recent errors
 */
function getRecentErrors(count = 10) {
  try {
    const props = PropertiesService.getScriptProperties();
    const errors = JSON.parse(props.getProperty('recent_errors') || '[]');
    return errors.slice(0, count);
  } catch (e) {
    console.error('Failed to retrieve errors:', e);
    return [];
  }
}

/**
 * Clear stored errors
 */
function clearStoredErrors() {
  try {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('recent_errors');
    props.deleteProperty('last_error_id');
    props.deleteProperty('last_error_time');
  } catch (e) {
    console.error('Failed to clear errors:', e);
  }
}

/**
 * Send alert for critical errors
 * @param {Object} errorInfo - Error information
 */
function sendErrorAlert(errorInfo) {
  try {
    // Log critical error with special formatting
    console.error('🚨 CRITICAL ERROR 🚨', {
      id: errorInfo.id,
      message: errorInfo.message,
      service: errorInfo.context.service,
      function: errorInfo.context.function,
      timestamp: errorInfo.timestamp
    });
    
    // Could also send email or create calendar event
    // Keeping it simple for now to avoid additional dependencies
  } catch (e) {
    console.error('Failed to send error alert:', e);
  }
}

/**
 * Create user-friendly error message
 * @param {Error} error - Original error
 * @param {string} fallbackMessage - Fallback message if error is too technical
 * @return {string} User-friendly message
 */
function getUserFriendlyMessage(error, fallbackMessage = 'An error occurred. Please try again.') {
  const type = classifyError(error);
  
  switch (type) {
    case ErrorType.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Authentication failed. Please sign in again.';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ErrorType.TIMEOUT:
      return 'The operation took too long. Please try again.';
    case ErrorType.QUOTA:
      return 'Rate limit exceeded. Please wait a moment and try again.';
    case ErrorType.DATA:
      return 'Data processing error. Please check your data format.';
    case ErrorType.SYSTEM:
      return 'System error. Please contact support if this persists.';
    default:
      return fallbackMessage;
  }
}

/**
 * Check if error is retryable
 * @param {Error} error - Error to check
 * @return {boolean} True if error is retryable
 */
function isRetryableError(error) {
  const type = classifyError(error);
  
  return type === ErrorType.NETWORK ||
         type === ErrorType.TIMEOUT ||
         type === ErrorType.QUOTA ||
         (type === ErrorType.SYSTEM && !error.message.includes('fatal'));
}