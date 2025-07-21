# Google Apps Script Error Handling Standards

## Table of Contents

- [Error Types](#error-types)
- [Error Handling Pattern](#error-handling-pattern)
- [Debugging](#debugging)
- [Logging](#logging)
- [Best Practices](#best-practices)

## Error Types

### Standard Error Types

```javascript
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  SERVICE: 'SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  INTERNAL: 'INTERNAL_ERROR',
  BATCH: 'BATCH_ERROR',
  CACHE: 'CACHE_ERROR'
};
```

### Error Classification

1. **Client Errors**
   - Validation errors
   - Authentication errors
   - Input errors

2. **Server Errors**
   - Service errors
   - Timeout errors
   - Internal errors

3. **Batch Processing Errors**
   - Partial failures
   - Batch size errors
   - Timeout issues

## Error Handling Pattern

### Try-Catch Pattern

```javascript
try {
  // Main operation
  const result = mainOperation(params);
  
  // Batch processing
  if (Array.isArray(result)) {
    result = processInBatches(result, processBatch);
  }
  
  return result;
} catch (error) {
  // Handle specific error types
  switch (error.type) {
    case ERROR_TYPES.VALIDATION:
      return handleValidationError(error);
    case ERROR_TYPES.SERVICE:
      return handleServiceError(error);
    case ERROR_TYPES.TIMEOUT:
      return handleTimeoutError(error);
    default:
      return handleInternalError(error);
  }
}
```

### Error Recovery

```javascript
function handlePartialFailure(error, batch) {
  debug(`Handling partial failure: ${error.message}`, { batch });
  
  // Attempt to recover
  try {
    const recoveryResult = recoverBatch(batch);
    if (recoveryResult) {
      return recoveryResult;
    }
  } catch (recoveryError) {
    logError(recoveryError, { originalError: error });
  }
  
  // Return partial results
  return batch.filter(item => !item.error);
}
```

## Debugging

### Debug Logging

```javascript
function debug(message, context = {}) {
  const debugLog = {
    timestamp: new Date().toISOString(),
    message,
    context,
    environment: CONFIG.ENV.CURRENT
  };
  
  Logger.log(JSON.stringify(debugLog, null, 2));
}
```

### Error Context

```javascript
function logError(error, context = {}) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      type: error.type,
      stack: error.stack
    },
    context: {
      ...context,
      environment: CONFIG.ENV.CURRENT
    }
  };
  
  Logger.log(JSON.stringify(errorDetails, null, 2));
}
```

## Logging

### Log Levels

```javascript
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};
```

### Structured Logging

```javascript
function log(level, message, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    environment: CONFIG.ENV.CURRENT
  };
  
  Logger.log(JSON.stringify(logEntry));
}
```

## Best Practices

1. **Error Handling**
   - Use try-catch blocks for error-prone operations
   - Handle specific error types
   - Implement proper error recovery
   - Provide clear error messages

2. **Debugging**
   - Include context in error messages
   - Use structured logging
   - Maintain consistent format
   - Include debugging steps

3. **Logging**
   - Use appropriate log levels
   - Include timestamps
   - Include context information
   - Maintain consistent format

4. **Error Recovery**
   - Implement retry mechanisms
   - Handle partial failures
   - Provide fallback options
   - Monitor error rates

5. **Monitoring**
   - Track error occurrences
   - Monitor error types
   - Alert on critical errors
   - Regularly review logs

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-07-21 UTC.
