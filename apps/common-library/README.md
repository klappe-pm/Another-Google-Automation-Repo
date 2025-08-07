# Common Library - Workspace Automation

## Overview

This is the shared library for all Google Apps Script projects in the Workspace Automation suite. It provides common utilities, error handling, logging, and data processing functions to eliminate code duplication across services.

## Library Contents

### 1. Utils Module (`Utils.js`)
- **Date Functions**: `formatDate()`, `parseDate()`
- **Validation**: `validateEmail()`, `validateUrl()`
- **String Operations**: `sanitizeFileName()`, `truncateString()`, `toTitleCase()`
- **Array Operations**: `chunkArray()`, `uniqueArray()`
- **Utilities**: `generateId()`, `deepClone()`, `isEmpty()`, `sleep()`

### 2. Error Handler Module (`ErrorHandler.js`)
- **Core Functions**: `handleError()`, `withErrorHandling()`, `withRetry()`
- **Error Classification**: `classifyError()`, `determineSeverity()`
- **User Experience**: `getUserFriendlyMessage()`, `isRetryableError()`
- **Error Storage**: `getRecentErrors()`, `clearStoredErrors()`

### 3. Logger Module (`Logger.js`)
- **Log Levels**: `logDebug()`, `logInfo()`, `logWarn()`, `logError()`
- **Performance**: `logPerformance()`, `logFunctionEntry()`, `logFunctionExit()`
- **Configuration**: `configureLogging()`, `setLogLevel()`
- **Management**: `getRecentLogs()`, `clearLogs()`, `createLogger()`

### 4. Data Processor Module (`DataProcessor.js`)
- **Batch Processing**: `processBatches()` with timeout protection
- **Rate Limiting**: `processWithRateLimit()` for API calls
- **Parallel Processing**: `processInParallel()` for chunks
- **Checkpointing**: `getCheckpoint()`, `resumeFromCheckpoint()`
- **Optimization**: `calculateOptimalBatchSize()`, `withPerformanceMonitoring()`

## Setup Instructions

### Step 1: Deploy the Library

```bash
# Navigate to library directory
cd apps/common-library

# Create the Apps Script project (first time only)
clasp create --type library --title "Workspace Common Library"

# Push the library code
clasp push

# Open in browser to publish
clasp open
```

### Step 2: Publish as Library

1. In the Apps Script editor, go to **Deploy** > **New Deployment**
2. Select type: **Library**
3. Add description: "Common utilities v1.0"
4. Click **Deploy**
5. Copy the **Deployment ID** (this is your Library ID)

### Step 3: Add to Services

In each service's `appsscript.json`:

```json
{
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "CommonLib",
        "libraryId": "YOUR_LIBRARY_SCRIPT_ID",
        "version": "1",
        "developmentMode": true
      }
    ]
  }
}
```

## Usage Examples

### Using Date Utilities

```javascript
// Format date
const today = CommonLib.formatDate(new Date(), 'date');  // 2025-08-06
const timestamp = CommonLib.formatDate(new Date(), 'iso');  // ISO format
const filename = CommonLib.formatDate(new Date(), 'filename');  // 2025-08-06_10-30-00

// Parse date
const date = CommonLib.parseDate('2025-08-06', 'yyyy-MM-dd');
```

### Error Handling

```javascript
// Wrap function with error handling
const safeFunction = CommonLib.withErrorHandling(
  function riskyOperation() {
    // Your code here
  },
  { service: 'gmail', function: 'exportEmails' }
);

// Retry with exponential backoff
const result = CommonLib.withRetry(
  () => UrlFetchApp.fetch(url),
  3,  // max retries
  1000  // initial delay
);
```

### Logging

```javascript
// Create logger with context
const logger = CommonLib.createLogger({ service: 'gmail' });

// Log at different levels
logger.debug('Debug message', { details: 'value' });
logger.info('Processing started');
logger.warn('Rate limit approaching');
logger.error('Operation failed', { error: e.toString() });

// Log performance
const startTime = new Date().getTime();
// ... do work ...
logger.performance('Export operation', startTime);
```

### Batch Processing

```javascript
// Process large dataset with timeout protection
const emails = GmailApp.search('label:inbox');
const result = CommonLib.processBatches(
  emails,
  function processEmailBatch(batch, batchNumber) {
    return batch.map(email => {
      // Process each email
      return extractData(email);
    });
  },
  {
    batchSize: 50,
    maxMinutes: 5,
    onProgress: (progress) => {
      console.log(`Processed ${progress.percentage}%`);
    }
  }
);

if (!result.complete) {
  // Save checkpoint for continuation
  const checkpoint = result.checkpoint;
  PropertiesService.getScriptProperties()
    .setProperty('checkpoint', JSON.stringify(checkpoint));
}
```

### Rate-Limited Processing

```javascript
// Process with rate limiting (10 requests per second)
const urls = ['url1', 'url2', 'url3'];
const result = CommonLib.processWithRateLimit(
  urls,
  (url) => UrlFetchApp.fetch(url),
  { rateLimit: 10 }
);
```

## Testing

### Test Library Connection

```javascript
function testLibraryConnection() {
  console.log(CommonLib.testConnection());
  // Output: ✅ Successfully connected to Workspace Common Library v1.0.0
}
```

### Run Self-Test

```javascript
function runLibrarySelfTest() {
  const results = CommonLib.runSelfTest();
  console.log(results);
  // Tests all modules and reports results
}
```

### Get Library Info

```javascript
function getLibraryInfo() {
  const info = CommonLib.getLibraryInfo();
  console.log(info);
  // Shows version, modules, and metadata
}
```

## Development Mode

During development, use `"developmentMode": true` in the library dependency to always use the latest code:

```json
{
  "libraries": [{
    "userSymbol": "CommonLib",
    "libraryId": "YOUR_LIBRARY_ID",
    "version": "1",
    "developmentMode": true  // Always use HEAD version
  }]
}
```

For production, set `"developmentMode": false` and specify a stable version.

## Version Management

### Creating a New Version

```bash
# In the library directory
clasp version "Description of changes"
```

### Updating Services to New Version

Update the version number in each service's `appsscript.json`:

```json
{
  "libraries": [{
    "version": "2"  // Update to new version
  }]
}
```

## Performance Considerations

1. **Minimize Library Calls**: Batch operations when possible
2. **Cache Results**: Store frequently used values
3. **Use Batch Functions**: Prefer `processBatches()` over loops
4. **Monitor Timeouts**: Use timeout protection for long operations

## Troubleshooting

### "CommonLib is not defined"
- Check library ID in appsscript.json
- Verify library is published
- Check project permissions

### Performance Issues
- Review number of library calls
- Use batch processing functions
- Enable caching where appropriate

### Version Conflicts
- Use development mode during migration
- Pin to specific versions in production
- Test version compatibility

## Contributing

1. Make changes in the library source files
2. Test thoroughly using `testLibrary()`
3. Create a new version with descriptive message
4. Update services gradually
5. Document any breaking changes

## Support

For issues or questions:
- Check the [Migration Guide](../../refactor-august-2025/MIGRATION_GUIDE.md)
- Review [Technical Design](../../refactor-august-2025/TECHNICAL_DESIGN.md)
- See [Issues Tracker](../../refactor-august-2025/ISSUES_TRACKER.md)

---

**Library Version**: 1.0.0
**Last Updated**: 2025-08-06
**Author**: Kevin Lappe