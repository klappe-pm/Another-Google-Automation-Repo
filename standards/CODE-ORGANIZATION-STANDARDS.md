# Google Apps Script Code Organization Standards

## Table of Contents

- [File Structure](#file-structure)
- [Function Organization](#function-organization)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## File Structure

### Directory Organization

```
/scripts/
  /service-name/
    /Feature Area/
      feature-main.gs         # Main functionality
      feature-test.gs         # Unit tests
      feature-utils.gs        # Utility functions
      feature-config.gs       # Configuration
```

### Naming Conventions

- Use lowercase with hyphens for directories
- Use camelCase for files
- Use descriptive names that indicate purpose
- Include feature area in filename

## Function Organization

### Section Headers

```javascript
// ========================================
// Configuration Settings
// ========================================

// ========================================
// Utility Functions
// ========================================

// ========================================
// Core Functions
// ========================================
```

### Function Grouping

1. **Configuration Functions**
   - Settings and constants
   - Environment variables
   - Global configurations

2. **Utility Functions**
   - Helper functions
   - Data processing
   - Common operations

3. **Core Functions**
   - Main functionality
   - Business logic
   - Service interactions

4. **Error Handling**
   - Error utilities
   - Validation functions
   - Recovery mechanisms

## Configuration

### Standard Configuration

```javascript
const CONFIG = {
  // Service Configuration
  SERVICE: {
    API_KEY: '',
    BASE_URL: '',
    TIMEOUT: 300000 // 5 minutes
  },
  
  // Performance Settings
  BATCH: {
    SIZE: 100,
    TIMEOUT: 30000 // 30 seconds
  },
  
  // Cache Settings
  CACHE: {
    DURATION: 3600, // 1 hour
    MAX_SIZE: 1000000 // 1MB
  }
};
```

### Environment Variables

```javascript
const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  CURRENT: 'development' // Set based on deployment
};
```

## Error Handling

### Error Types

```javascript
const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  SERVICE: 'SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  INTERNAL: 'INTERNAL_ERROR'
};
```

### Error Handling Pattern

```javascript
function handleError(error, context) {
  // Log error with context
  logError(error, context);
  
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

function logError(error, context) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      type: error.type,
      stack: error.stack
    },
    context: context
  };
  
  Logger.log(JSON.stringify(errorDetails));
}
```

## Best Practices

1. **Code Structure**
   - Keep files focused and modular
   - Group related functionality
   - Use clear section headers
   - Maintain consistent formatting

2. **Function Design**
   - Single responsibility principle
   - Small, focused functions
   - Clear parameter types
   - Consistent return values

3. **Configuration**
   - Centralized configuration
   - Environment-specific settings
   - Clear naming conventions
   - Proper validation

4. **Error Handling**
   - Comprehensive error types
   - Proper logging
   - Clear error messages
   - Appropriate recovery

5. **Maintainability**
   - Regular code reviews
   - Consistent patterns
   - Clear documentation
   - Regular updates

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-07-21 UTC.
