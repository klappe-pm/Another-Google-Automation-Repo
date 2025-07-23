# Google Apps Script Performance Standards

## Table of Contents

- [Service Call Optimization](#service-call-optimization)
- [Batch Processing](#batch-processing)
- [Caching](#caching)
- [Timeout Management](#timeout-management)
- [Best Practices](#best-practices)

## Service Call Optimization

### Minimize Service Calls

1. **Batch Operations**
   - Use `Range.getValues()` and `Range.setValues()` for spreadsheets
   - Process data in memory before writing
   - Use array operations instead of individual cell manipulation

2. **Efficient Data Access**
   - Retrieve data in bulk when possible
   - Process data in memory
   - Write results in single operations

3. **Service Call Examples**

```javascript
// Inefficient - Multiple service calls
var cell = sheet.getRange('a1');
for (var y = 0; y < 100; y++) {
  for (var x = 0; x < 100; x++) {
    cell.offset(y, x).setBackgroundColor(getColorFromCoordinates(x, y));
  }
}

// Efficient - Batch processing
var colors = new Array(100);
for (var y = 0; y < 100; y++) {
  colors[y] = new Array(100);
  for (var x = 0; x < 100; x++) {
    colors[y][x] = getColorFromCoordinates(x, y);
  }
}
sheet.getRange(1, 1, 100, 100).setBackgrounds(colors);
```

## Batch Processing

### Standard Batch Size

- Default batch size: 100 items
- Maximum batch size: 1000 items
- Adjust based on service limits and performance

### Batch Processing Pattern

```javascript
function processInBatches(items, processFunction) {
  const batchSize = CONFIG.BATCH_SIZE;
  const totalBatches = Math.ceil(items.length / batchSize);
  
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const batchResults = processBatch(batch, processFunction);
      results.push(...batchResults);
    } catch (error) {
      logError(error, { batch });
      const partialResults = handlePartialFailure(error, batch);
      if (partialResults) {
        results.push(...partialResults);
      }
    }
  }
  
  return results;
}
```

## Caching

### Cache Configuration

```javascript
const CACHE_CONFIG = {
  DURATION: 3600, // 1 hour
  PREFIX: 'workspace_automation_',
  MAX_SIZE: 1000000 // 1MB
};
```

### Cache Usage Pattern

```javascript
function getCachedData(cacheKey, fetchFunction) {
  const fullKey = CACHE_CONFIG.PREFIX + cacheKey;
  const cache = CacheService.getScriptCache();
  
  const cached = cache.get(fullKey);
  if (cached) {
    debug(`Cache hit for ${fullKey}`);
    return JSON.parse(cached);
  }
  
  try {
    const data = fetchFunction();
    cache.put(fullKey, JSON.stringify(data), CACHE_CONFIG.DURATION);
    debug(`Cache miss for ${fullKey}, fetched fresh data`);
    return data;
  } catch (error) {
    logError(error, { cacheKey: fullKey });
    throw error;
  }
}
```

## Timeout Management

### Configuration

```javascript
const TIMEOUT_CONFIG = {
  MAX_EXECUTION: 300000, // 5 minutes
  BATCH_TIMEOUT: 30000,  // 30 seconds
  RETRY_DELAY: 5000,     // 5 seconds
  MAX_RETRIES: 3
};
```

### Timeout Handling

```javascript
function withTimeout(operation, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeout);
    
    operation()
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
```

## Best Practices

1. **Performance Monitoring**
   - Track execution time
   - Monitor service call frequency
   - Log performance metrics

2. **Optimization**
   - Use efficient data structures
   - Minimize memory usage
   - Optimize loops and iterations

3. **Error Recovery**
   - Implement retry mechanisms
   - Handle partial failures
   - Provide fallback options

4. **Testing**
   - Test with large datasets
   - Verify batch processing
   - Check caching effectiveness

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-07-21 UTC.
