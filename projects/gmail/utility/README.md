# Utility Package for Apps Script Services

A centralized utility package providing shared functionality across all Apps Script services in the Gmail automation project.

## Overview

This utility package centralizes common functionality that was previously duplicated across services:

- **Configuration Management**: Global `Config.get(service, key)` loader
- **Logging**: Unified logging with multiple output channels
- **HTTP Client**: Standardized HTTP operations with retry logic
- **Authentication**: Secure credential management
- **Error Handling**: Centralized error reporting and recovery

## Features

### Configuration (`Config`)
- Global configuration loader reading from service-specific `src/config.gs` files
- Dot notation support for nested keys: `Config.get('service', 'section.key')`
- Caching with TTL for performance
- Runtime configuration updates
- Configuration validation

### Logging (`Logger`)
- Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- Console, sheet, and email output channels
- Batched logging for performance
- Service-specific child loggers
- Sensitive data sanitization

### HTTP Client (`HttpClient`)
- Standardized HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Automatic retry with exponential backoff
- Authentication handling
- Response caching
- Batch request processing
- Rate limiting protection

### Authentication (`Auth`)
- Secure credential storage with encryption
- Multiple auth types (API Key, Bearer Token, Basic Auth, OAuth2)
- Token validation and refresh
- Service-specific auth management
- Authorization header generation

### Error Handling (`ErrorHandler`)
- Automatic error categorization
- Severity-based handling
- Recovery strategy determination
- Error reporting and notifications
- Retry logic for transient errors
- Error statistics and monitoring

## Installation

### Option 1: Include in Your Project

1. Copy all files from `utility/src/` into your Apps Script project
2. Include the `appsscript.json` dependencies
3. Initialize in your code:

```javascript
// Initialize utilities
Utilities.init();

// Use throughout your service
const value = Config.get('myservice', 'api.endpoint');
Logger.info('Service started', { service: 'myservice' });
```

### Option 2: Library Deployment

1. Deploy the utility package as an Apps Script library
2. Add the library to your project
3. Use with library prefix:

```javascript
// If deployed as library 'UtilityLib'
const value = UtilityLib.Config.get('myservice', 'key');
UtilityLib.Logger.info('Message');
```

## Usage Examples

### Configuration

```javascript
// Get configuration value
const apiKey = Config.get('gmail', 'api.key', 'default-key');

// Set runtime configuration
Config.set('gmail', 'debug.enabled', true);

// Get all configuration for a service
const allConfig = Config.getAll('gmail');

// Validate configuration
const validation = Config.validate('gmail', {
  required: ['api.key', 'folders.output'],
  fields: {
    'api.key': { type: 'string' },
    'folders.output': { type: 'string' }
  }
});
```

### Logging

```javascript
// Basic logging
Logger.info('Process started');
Logger.error('Process failed', error);

// With context data
Logger.info('Email processed', { 
  emailId: 'abc123', 
  recipient: 'user@example.com' 
});

// Service-specific logger
const serviceLogger = Logger.createChild('gmail-export');
serviceLogger.info('Export started');

// Performance logging
const result = Logger.time(() => {
  return processEmails();
}, 'processEmails');
```

### HTTP Client

```javascript
// Simple GET request
const response = await HttpClient.get('https://api.example.com/data');

// POST with data
const result = await HttpClient.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// With authentication
HttpClient.setAuth('api-service', 'your-api-key', 'Bearer');
const response = await HttpClient.get('https://api.example.com/protected', {
  auth: 'api-service'
});

// Batch requests
const requests = [
  { url: 'https://api.example.com/user/1' },
  { url: 'https://api.example.com/user/2' },
  { url: 'https://api.example.com/user/3' }
];
const results = await HttpClient.batch(requests);
```

### Authentication

```javascript
// Set API key
Auth.setApiKey('gmail-service', 'your-api-key');

// Set Bearer token with expiry
Auth.setBearerToken('api-service', 'token', 3600); // 1 hour

// Set Basic auth
Auth.setBasicAuth('service', 'username', 'password');

// Get authentication header
const authHeader = Auth.getAuthHeader('gmail-service');

// Check token status
const status = Auth.validateToken('api-service');
if (status === 'expired') {
  Auth.refreshToken('api-service');
}

// Service-specific auth helper
const gmailAuth = new ServiceAuth('gmail-service');
gmailAuth.setApiKey('your-key');
const token = gmailAuth.getToken();
```

### Error Handling

```javascript
// Handle errors with context
try {
  processEmails();
} catch (error) {
  ErrorHandler.handle(error, {
    service: 'gmail-export',
    operation: 'processEmails',
    userId: 'user123'
  }, 'high');
}

// Wrap risky functions
const result = ErrorHandler.wrap(
  () => riskyOperation(),
  'fallback-value',
  { retries: 3, context: { operation: 'riskyOperation' } }
);

// Create custom errors
const error = ErrorHandler.createError(
  'Invalid email format',
  'validation',
  { email: 'invalid@', field: 'recipient' }
);

// Get error statistics
const stats = ErrorHandler.getStats(86400000); // Last 24 hours
console.log(`Errors in last 24h: ${stats.total}`);
```

## Configuration File Structure

Each service should have a `src/config.gs` file with configuration exported as a global variable:

```javascript
// gmail/src/config.gs
const GMAIL_CONFIG = {
  api: {
    key: 'your-api-key',
    endpoint: 'https://api.gmail.com'
  },
  folders: {
    output: 'folder-id-123',
    archive: 'folder-id-456'
  },
  limits: {
    batchSize: 50,
    maxRetries: 3
  }
};
```

The Config utility will automatically discover and load these configurations.

## Testing

Run the comprehensive unit test suite:

```javascript
// Run all tests
runAllUtilityTests();

// Run specific test suite
runConfigTests();
runLoggerTests();
runHttpTests();
runAuthTests();
runErrorHandlerTests();

// Quick development test
quickTest();

// Performance tests
runPerformanceTests();
```

## Best Practices

### Configuration
- Use consistent naming conventions for config keys
- Group related settings under sections
- Provide sensible defaults
- Validate critical configuration on startup

### Logging
- Use appropriate log levels
- Include contextual information
- Don't log sensitive data
- Use child loggers for service-specific logging

### HTTP Requests
- Set appropriate timeouts
- Handle rate limiting gracefully
- Use authentication helpers
- Cache responses when appropriate

### Authentication
- Store credentials securely
- Validate tokens before use
- Implement token refresh logic
- Use service-specific auth objects

### Error Handling
- Categorize errors appropriately
- Provide meaningful context
- Implement proper recovery strategies
- Monitor error patterns

## Security Considerations

- Credentials are encrypted before storage
- Sensitive data is automatically sanitized in logs
- API keys and tokens are redacted in error reports
- HTTPS is enforced for external requests
- Input validation is performed on all utilities

## Performance

- Configuration values are cached for fast access
- Logging is batched to minimize API calls
- HTTP requests use connection pooling
- Error reporting is asynchronous
- Cleanup operations prevent memory leaks

## Monitoring

- Comprehensive logging of all utility operations
- Error statistics and trending
- Performance metrics collection
- Health check diagnostics
- Automated alerts for critical issues

## Version History

### 1.0.0 (2025-01-16)
- Initial release
- Core utilities: Config, Logger, HttpClient, Auth, ErrorHandler
- Comprehensive unit tests
- Full documentation and examples

## Support

For issues, questions, or contributions:
- Author: Kevin Lappe
- Email: kevin@averageintelligence.ai
- Project: Workspace Automation - Gmail

## License

MIT License - see project root for full license text.
