# Service Template Usage Guide

This guide explains how to use the service template to create new Google Apps Script services with a consistent foundation.

## Quick Start

1. **Copy the Template**
   ```bash
   cp -r service-template/ my-new-service/
   cd my-new-service/
   ```

2. **Customize Configuration**
   - Edit `src/config.gs` and replace `[SERVICE_NAME]` with your service name
   - Update `[your.email@domain.com]` placeholders in file headers
   - Set appropriate configuration values for your service

3. **Implement Your Service**
   - Add your service logic to the `src/` directory
   - Follow the patterns established in the template
   - Use the provided utilities and error handling

4. **Write Tests**
   - Add test cases to `src/test.gs`
   - Use the `TestFramework` and `Assert` classes
   - Run tests with `runTests()`

5. **Deploy**
   - Use the deployment script: `deployService()`
   - Monitor logs and health status

## Template Structure

```
service-template/
├── src/
│   ├── config.gs      # Service configuration and constants
│   ├── common.gs      # Shared utilities (Logger, ErrorHandler, etc.)
│   ├── utils.gs       # Helper functions (DateUtils, StringUtils, etc.)
│   └── test.gs        # Testing framework and test cases
├── test/              # Additional test files (optional)
├── docs/              # Documentation files
│   ├── STYLE_GUIDE.md # Code and documentation standards
│   └── API_TEMPLATE.md# API documentation template
├── deploy/
│   └── deploy.gs      # Deployment and rollback utilities
├── appsscript.json    # Google Apps Script manifest
└── README.md          # Service documentation
```

## Customization Steps

### 1. Update Service Configuration

Edit `src/config.gs`:

```javascript
const SERVICE_CONFIG = {
  SERVICE_NAME: 'MyAwesomeService',  // Replace with your service name
  VERSION: '1.0.0',
  ENVIRONMENT: 'development',
  
  // Update notification emails
  NOTIFICATION_EMAIL: 'team@company.com',
  ERROR_EMAIL: 'alerts@company.com',
  
  // Adjust other settings as needed
  BATCH_SIZE: 50,
  RETRY_ATTEMPTS: 3,
};
```

### 2. Update File Headers

Replace placeholder values in all `.gs` files:

```javascript
/**
 * @fileoverview Email processing service for daily reports
 * @author Jane Doe <jane.doe@company.com>
 * @version 1.0.0
 * @since 2024-02-01
 * @lastmodified 2024-02-01
 */
```

### 3. Implement Main Service Logic

Create your main service function. The template provides a `main()` function that you should customize:

```javascript
/**
 * Main service entry point
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
    const emails = fetchEmails();
    const processedData = processEmails(emails);
    saveResults(processedData);
    
    Logger.info(`Processed ${processedData.length} items successfully`);
  } catch (error) {
    ErrorHandler.handle(error, 'main', true);
  } finally {
    LockManager.release(lock, 'main-execution');
  }
}

/**
 * Fetch emails from Gmail
 * @returns {Array} Array of email threads
 */
function fetchEmails() {
  // Your implementation here
}

/**
 * Process email data
 * @param {Array} emails - Email threads to process
 * @returns {Array} Processed data
 */
function processEmails(emails) {
  // Your implementation here
}
```

### 4. Add Service-Specific Tests

Add your test cases to `src/test.gs`:

```javascript
/**
 * Test email processing functionality
 */
function runEmailTests() {
  testRunner.test('fetchEmails returns array', () => {
    const emails = fetchEmails();
    Assert.isTrue(Array.isArray(emails));
  });
  
  testRunner.test('processEmails handles empty input', () => {
    const result = processEmails([]);
    Assert.equals(result.length, 0);
  });
  
  // Add more tests...
}

// Update the main test runner to include your tests
function runTests() {
  runUtilityTests();
  runConfigTests();
  runEmailTests();  // Add your test suite
  
  return testRunner.run();
}
```

### 5. Update Documentation

1. **Update README.md**: Replace template content with service-specific information
2. **Create API docs**: Use `docs/API_TEMPLATE.md` as a starting point
3. **Add usage examples**: Include common use cases and troubleshooting

### 6. Configure Triggers

Update trigger configuration in `src/config.gs`:

```javascript
const GAS_CONFIG = {
  TRIGGER_INTERVAL: 'DAILY',  // or 'HOURLY', 'WEEKLY', etc.
  TRIGGER_HOUR: 9,           // For daily triggers
  LOCK_TIMEOUT: 30000,
};
```

## Best Practices

### Error Handling
Always use the provided error handling patterns:

```javascript
try {
  // risky operation
  const result = callExternalAPI();
  return result;
} catch (error) {
  return ErrorHandler.handle(error, 'API call', true);
}
```

### Logging
Use the Logger class for consistent logging:

```javascript
Logger.info('Processing started', { batchSize: 100 });
Logger.warn('Rate limit approaching', { remaining: 10 });
Logger.error('Processing failed', { error: error.message });
```

### Configuration
Use the configuration system for all settings:

```javascript
const batchSize = getConfig('BATCH_SIZE', 50);
const apiUrl = getConfig('API_ENDPOINTS.MAIN_API');
```

### Retries
Use RetryHelper for operations that might fail temporarily:

```javascript
const result = RetryHelper.execute(
  () => UrlFetchApp.fetch(url),
  3,      // max attempts
  1000,   // delay ms
  'API fetch'
);
```

### Testing
Write comprehensive tests:

```javascript
testRunner.test('Service handles empty data', () => {
  const result = processData([]);
  Assert.equals(result.length, 0);
});

testRunner.test('Service validates input', () => {
  Assert.throws(() => processData(null));
});
```

## Deployment

### Development
```javascript
// Test your service
runTests();

// Deploy to development
deployService({
  environment: 'development',
  runTests: true,
  notify: false
});
```

### Production
```javascript
// Deploy to production
deployService({
  environment: 'production',
  runTests: true,
  backup: true,
  notify: true
});
```

### Rollback
```javascript
// Rollback if needed
rollbackService('backup_1706123456789');
```

## Monitoring

### Health Checks
```javascript
// Check service health
const health = healthCheck();
console.log(health);
```

### Logs
- Check Google Apps Script logs in the Apps Script console
- Monitor notification emails for errors
- Use Logger output for debugging

## Common Patterns

### Batch Processing
```javascript
const items = getAllItems();
const batches = ArrayUtils.chunk(items, getConfig('BATCH_SIZE'));

for (const batch of batches) {
  processBatch(batch);
  Utilities.sleep(1000); // Rate limiting
}
```

### Data Validation
```javascript
const validation = ValidationUtils.validateRequired(data, [
  'id', 'name', 'email'
]);

if (!validation.isValid) {
  throw new Error(`Missing required fields: ${validation.missing.join(', ')}`);
}
```

### Caching
```javascript
// Get from cache
let data = CacheUtils.get('api-data');

if (!data) {
  // Fetch and cache
  data = fetchFromAPI();
  CacheUtils.set('api-data', data, 3600); // 1 hour
}
```

## Troubleshooting

### Common Issues

1. **Lock Timeout**: Increase `LOCK_TIMEOUT` in configuration
2. **Memory Errors**: Reduce `BATCH_SIZE` or process data in smaller chunks
3. **API Rate Limits**: Add delays between requests or increase retry delays
4. **Permission Errors**: Check Google Apps Script permissions and OAuth scopes

### Debug Mode
Enable debug logging:

```javascript
const SERVICE_CONFIG = {
  LOG_LEVEL: 'DEBUG',
  LOG_TO_CONSOLE: true,
  // ...
};
```

### Testing Locally
```javascript
// Test individual functions
function testMyFunction() {
  const result = myFunction('test-input');
  console.log(result);
}

// Run specific test suites
runTestSuite('utilities');
```

## Migration from Existing Services

1. **Copy your existing logic** into the new template structure
2. **Update error handling** to use the ErrorHandler class
3. **Replace logging** with the Logger class
4. **Add configuration** to the config.gs file
5. **Write tests** for your existing functionality
6. **Update documentation** to match the new structure

## Support

For help with the service template:

1. **Documentation**: Check the `docs/` folder
2. **Examples**: Look at other services using this template
3. **Issues**: Contact the platform team
4. **Updates**: Monitor the template repository for improvements

---

*This template is maintained by the platform team. Please suggest improvements or report issues.*
