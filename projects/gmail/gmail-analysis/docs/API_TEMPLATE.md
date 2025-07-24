# API Documentation Template

This template provides a standard format for documenting APIs in services built from this template.

## Service Overview

**Service Name**: gmail-analysis  
**Version**: [VERSION]  
**Last Updated**: [DATE]  
**Maintainer**: [TEAM/PERSON]  

### Description
[Brief description of what this service does]

### Base Configuration
- **Execution Frequency**: [e.g., Daily at 9 AM]
- **Timeout**: [e.g., 5 minutes]
- **Retry Policy**: [e.g., 3 attempts with 1s delay]

## Public Functions

### main()
Main entry point for the service.

**Signature**: `function main()`  
**Returns**: `void`  
**Triggers**: Time-based trigger  

**Description**:  
This is the primary function that executes when the service is triggered. It orchestrates the main service workflow.

**Example**:
```javascript
// Called automatically by trigger
main();
```

### healthCheck()
Returns the current health status of the service.

**Signature**: `function healthCheck()`  
**Returns**: `Object` - Health status information  

**Return Object**:
```javascript
{
  healthy: boolean,
  timestamp: string,
  service: string,
  version: string,
  details?: Object
}
```

**Example**:
```javascript
const health = healthCheck();
console.log(health.healthy ? 'Service is healthy' : 'Service has issues');
```

### runTests()
Executes all test suites for the service.

**Signature**: `function runTests()`  
**Returns**: `Object` - Test results  

**Return Object**:
```javascript
{
  passed: number,
  failed: number,
  total: number,
  errors: Array<Object>
}
```

**Example**:
```javascript
const testResults = runTests();
if (testResults.failed > 0) {
  console.log(`${testResults.failed} tests failed`);
}
```

## Configuration Functions

### getConfig(key, defaultValue)
Retrieves configuration values with fallback support.

**Signature**: `function getConfig(key, defaultValue = null)`  
**Parameters**:
- `key` (string) - Configuration key (supports dot notation)
- `defaultValue` (*) - Default value if key not found

**Returns**: `*` - Configuration value or default  

**Example**:
```javascript
const serviceName = getConfig('SERVICE_NAME');
const batchSize = getConfig('BATCH_SIZE', 100);
const apiUrl = getConfig('API_ENDPOINTS.MAIN_API');
```

### isDevelopment()
Checks if service is running in development mode.

**Signature**: `function isDevelopment()`  
**Returns**: `boolean` - True if in development mode  

### isProduction()
Checks if service is running in production mode.

**Signature**: `function isProduction()`  
**Returns**: `boolean` - True if in production mode  

## Utility Classes

### Logger
Provides structured logging functionality.

#### Logger.debug(message, data)
**Parameters**:
- `message` (string) - Log message
- `data` (Object, optional) - Additional data to log

#### Logger.info(message, data)
**Parameters**:
- `message` (string) - Log message
- `data` (Object, optional) - Additional data to log

#### Logger.warn(message, data)
**Parameters**:
- `message` (string) - Log message
- `data` (Object, optional) - Additional data to log

#### Logger.error(message, data)
**Parameters**:
- `message` (string) - Log message
- `data` (Object, optional) - Additional data to log

**Example**:
```javascript
Logger.info('Processing started', { batchSize: 100 });
Logger.error('API call failed', { endpoint: '/api/data', status: 500 });
```

### ErrorHandler
Standardized error handling and reporting.

#### ErrorHandler.handle(error, context, notify)
**Parameters**:
- `error` (Error) - The error object
- `context` (string) - Context where error occurred
- `notify` (boolean) - Whether to send notification email

**Returns**: `Object` - Standardized error response

**Example**:
```javascript
try {
  // risky operation
} catch (error) {
  return ErrorHandler.handle(error, 'dataProcessing', true);
}
```

### RetryHelper
Utility for retrying failed operations.

#### RetryHelper.execute(fn, maxAttempts, delay, context)
**Parameters**:
- `fn` (Function) - Function to execute
- `maxAttempts` (number, optional) - Maximum retry attempts
- `delay` (number, optional) - Delay between attempts (ms)
- `context` (string, optional) - Context for logging

**Returns**: `*` - Result of function execution  
**Throws**: `Error` - If all attempts fail

**Example**:
```javascript
const result = RetryHelper.execute(
  () => callExternalAPI(),
  3,
  1000,
  'API call'
);
```

## Utility Functions

### DateUtils

#### DateUtils.format(date, format)
**Parameters**:
- `date` (Date, optional) - Date to format (default: now)
- `format` (string) - Format type ('short', 'long', 'time', 'datetime')

**Returns**: `string` - Formatted date string

#### DateUtils.addDays(date, days)
**Parameters**:
- `date` (Date) - Base date
- `days` (number) - Number of days to add

**Returns**: `Date` - New date with added days

### StringUtils

#### StringUtils.isEmpty(str)
**Parameters**:
- `str` (string) - String to check

**Returns**: `boolean` - True if string is empty or null

#### StringUtils.truncate(str, maxLength, suffix)
**Parameters**:
- `str` (string) - String to truncate
- `maxLength` (number) - Maximum length
- `suffix` (string, optional) - Suffix when truncated (default: '...')

**Returns**: `string` - Truncated string

### ArrayUtils

#### ArrayUtils.chunk(array, size)
**Parameters**:
- `array` (Array) - Array to chunk
- `size` (number) - Chunk size

**Returns**: `Array<Array>` - Array of chunks

#### ArrayUtils.unique(array, keyFn)
**Parameters**:
- `array` (Array) - Array to deduplicate
- `keyFn` (Function, optional) - Function to extract comparison key

**Returns**: `Array` - Array without duplicates

### ValidationUtils

#### ValidationUtils.isValidEmail(email)
**Parameters**:
- `email` (string) - Email to validate

**Returns**: `boolean` - True if valid email

#### ValidationUtils.validateRequired(obj, requiredFields)
**Parameters**:
- `obj` (Object) - Object to validate
- `requiredFields` (Array<string>) - Required field names

**Returns**: `Object` - Validation result with `isValid` and `missing` properties

## Deployment Functions

### deployService(options)
Deploys the service to the specified environment.

**Parameters**:
- `options` (Object, optional) - Deployment options

**Options Object**:
```javascript
{
  environment: 'production',  // 'development', 'staging', 'production'
  runTests: true,            // Run tests before deployment
  backup: true,              // Create backup before deployment
  notify: true               // Send notification emails
}
```

**Returns**: `Object` - Deployment result

**Example**:
```javascript
const result = deployService({
  environment: 'production',
  runTests: true,
  notify: true
});
```

### rollbackService(backupId)
Rolls back the service to a previous version.

**Parameters**:
- `backupId` (string, optional) - Backup identifier

**Returns**: `Object` - Rollback result

## Error Codes

The service uses standardized error codes:

| Code | Type | Description |
|------|------|-------------|
| GEN_001 | General Error | An unexpected error occurred |
| VAL_001 | Validation Error | Input validation failed |
| API_001 | API Error | External API request failed |
| PER_001 | Permission Error | Insufficient permissions |
| TIM_001 | Timeout Error | Operation timed out |

## Configuration Reference

### SERVICE_CONFIG
Main service configuration object.

```javascript
{
  SERVICE_NAME: 'gmail-analysis',
  VERSION: '1.0.0',
  ENVIRONMENT: 'development',
  LOG_LEVEL: 'INFO',
  LOG_TO_CONSOLE: true,
  LOG_TO_SHEET: false,
  MAX_EXECUTION_TIME: 300000,
  BATCH_SIZE: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_ENABLED: true,
  CACHE_DURATION: 3600,
  NOTIFICATION_EMAIL: 'admin@company.com',
  ERROR_EMAIL: 'errors@company.com'
}
```

### GAS_CONFIG
Google Apps Script specific settings.

```javascript
{
  PROPERTY_KEYS: {
    API_KEY: 'API_KEY',
    LAST_RUN: 'LAST_RUN',
    ERROR_COUNT: 'ERROR_COUNT'
  },
  TRIGGER_INTERVAL: 'DAILY',
  TRIGGER_HOUR: 9,
  LOCK_TIMEOUT: 30000
}
```

## Examples

### Basic Service Implementation
```javascript
/**
 * Main service function
 */
function main() {
  const lock = LockManager.acquire('main-execution');
  
  if (!lock) {
    Logger.warn('Could not acquire lock, service may already be running');
    return;
  }
  
  try {
    Logger.info('Service execution started');
    
    // Your service logic here
    const data = processData();
    const results = transformData(data);
    saveResults(results);
    
    Logger.info('Service execution completed successfully');
  } catch (error) {
    ErrorHandler.handle(error, 'main', true);
  } finally {
    LockManager.release(lock, 'main-execution');
  }
}
```

### Error Handling Pattern
```javascript
function processData() {
  return RetryHelper.execute(() => {
    const response = UrlFetchApp.fetch(getConfig('API_ENDPOINTS.DATA_API'));
    
    if (response.getResponseCode() !== 200) {
      throw new Error(`API returned ${response.getResponseCode()}`);
    }
    
    return JSON.parse(response.getContentText());
  }, 3, 1000, 'API data fetch');
}
```

### Testing Pattern
```javascript
function runServiceTests() {
  testRunner.test('Configuration is valid', () => {
    Assert.isDefined(getConfig('SERVICE_NAME'));
    Assert.isTrue(getConfig('BATCH_SIZE') > 0);
  });
  
  testRunner.test('Data processing works', () => {
    const testData = [{ id: 1, name: 'test' }];
    const result = processData(testData);
    Assert.equals(result.length, 1);
  });
  
  return testRunner.run();
}
```

## Support

For questions about this API or issues with the service:

- **Documentation**: See README.md and docs/ folder
- **Issues**: Contact the development team
- **Emergency**: Use the error notification email system

---

*This documentation is auto-generated from the service template. Update this file when adding new public functions or changing existing APIs.*
