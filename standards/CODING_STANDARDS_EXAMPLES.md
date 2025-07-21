# Google Apps Script Coding Standards Examples

This document provides concrete examples demonstrating how to implement the coding standards outlined in the main [CODING_STANDARDS.md](cci:7://file:///Users/kevinlappe/Documents/GitHub/Workspace%20Automation/docs/CODING_STANDARDS.md:0:0-0:0) document.

## Table of Contents

- [Performance Optimization](#performance-optimization)
  - [Batch Processing Example](#batch-processing-example)
  - [Caching Example](#caching-example)
  - [Service Call Optimization](#service-call-optimization)
- [Code Organization](#code-organization)
  - [File Structure Example](#file-structure-example)
  - [Function Organization](#function-organization)
- [Documentation](#documentation)
  - [Script Header Example](#script-header-example)
  - [Inline Comments](#inline-comments)
- [Error Handling](#error-handling)
  - [Error Recovery](#error-recovery)
  - [Debug Logging](#debug-logging)
- [Security](#security)
  - [API Key Management](#api-key-management)
  - [Data Validation](#data-validation)
- [Testing](#testing)
  - [Unit Testing Example](#unit-testing-example)
  - [Integration Testing](#integration-testing)

## Performance Optimization Examples

### Batch Processing Example

```javascript
// Efficient batch processing for spreadsheet operations
function processSpreadsheetData(sheet, data) {
  const batchSize = 100;
  const totalBatches = Math.ceil(data.length / batchSize);
  
  // Process data in batches
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    try {
      // Process batch
      const batchResults = processBatch(sheet, batch);
      
      // Cache results if appropriate
      cacheBatchResults(batchNumber, batchResults);
      
    } catch (error) {
      // Handle partial failure
      const partialResults = handlePartialFailure(error, batch);
      if (partialResults) {
        cacheBatchResults(batchNumber, partialResults, true);
      }
      
      // Log error with context
      logError(error, {
        batchNumber,
        batchSize: batch.length,
        totalBatches,
        items: batch
      });
    }
  }
}

// Helper function to process individual batch
function processBatch(sheet, batch) {
  // Prepare data in memory
  const results = [];
  
  // Process each item in batch
  batch.forEach(item => {
    try {
      const result = processItem(item);
      results.push(result);
    } catch (error) {
      // Handle individual item failure
      const recoveryResult = handleItemFailure(error, item);
      if (recoveryResult) {
        results.push(recoveryResult);
      }
    }
  });
  
  // Write batch results to spreadsheet in one operation
  const range = sheet.getRange(1, 1, results.length, results[0].length);
  range.setValues(results);
  
  return results;
}
```

### Caching Example

```javascript
// Cache configuration
const CACHE_CONFIG = {
  DURATION: 3600, // 1 hour
  PREFIX: 'workspace_automation_'
};

/**
 * Get cached data or fetch fresh data
 * 
 * @param {string} cacheKey - Unique key for cache entry
 * @param {Function} fetchFunction - Function to get fresh data
 * @returns {Object} Cached or fresh data
 */
function getCachedData(cacheKey, fetchFunction) {
  const fullKey = CACHE_CONFIG.PREFIX + cacheKey;
  const cache = CacheService.getScriptCache();
  
  // Check cache first
  const cached = cache.get(fullKey);
  if (cached) {
    debug(`Cache hit for ${fullKey}`);
    return JSON.parse(cached);
  }
  
  // Fetch fresh data
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

// Usage example
function getSpreadsheetData(spreadsheetId) {
  return getCachedData(`spreadsheet_${spreadsheetId}`, () => {
    const sheet = SpreadsheetApp.openById(spreadsheetId);
    return sheet.getDataRange().getValues();
  });
}
```

## Code Organization Examples

### File Structure Example

```
/scripts/
  /drive/
    /Content Management/
      drive-index-files.gs         # Main functionality
      drive-index-files-test.gs    # Unit tests
      drive-index-files-utils.gs   # Utility functions
      drive-index-files-config.gs  # Configuration
    /YAML Management/
      drive-yaml-frontmatter.gs
      drive-yaml-frontmatter-test.gs
      drive-yaml-frontmatter-utils.gs
  /gmail/
    /Analysis Tools/
      gmail-analysis-markdown.gs
      gmail-analysis-markdown-test.gs
      gmail-analysis-markdown-utils.gs
```

### Function Organization Example

```javascript
// ========================================
// Configuration
// ========================================

const CONFIG = {
  BATCH_SIZE: 100,
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 3600 // 1 hour
};

// ========================================
// Utility Functions
// ========================================

/**
 * Validate input data
 * 
 * @param {Object} data - Data to validate
 * @returns {boolean} True if valid
 */
function validateData(data) {
  // Validation logic
  return true;
}

// ========================================
// Core Functions
// ========================================

/**
 * Main processing function
 * 
 * @param {Object} params - Function parameters
 * @returns {Object} Processing results
 */
function mainFunction(params) {
  try {
    // Validate input
    if (!validateData(params)) {
      throw new Error('Invalid input data');
    }
    
    // Process data in batches
    const results = processInBatches(params.data, processData);
    
    // Return results
    return {
      success: true,
      results,
      timestamp: new Date()
    };
  } catch (error) {
    logError(error, { params });
    throw error;
  }
}

// ========================================
// Error Handling
// ========================================

/**
 * Log error with comprehensive context
 * 
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function logError(error, context) {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp
  };
  
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
}
```

## Documentation Examples

### Script Header Example

```javascript
/**
 * Drive File Indexer
 * Service: Google Drive
 * Purpose: Index files in Google Drive with metadata and YAML frontmatter
 * Created: 2025-07-21
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/blob/main/docs/usage/drive/drive-index-files.md
 * Timeout Strategy: Batch processing with 100 items per batch
 * Batch Processing: Standard batch size of 100 items
 * Cache Strategy: Cache file metadata for 1 hour
 * Security: Uses API key rotation and rate limiting
 * Performance: Implements batch processing and caching
 * 
 * Features:
 * - File indexing with metadata
 * - YAML frontmatter generation
 * - Batch processing
 * - Error recovery
 * 
 * Requirements:
 * - Google Drive API access
 * - Spreadsheet for logging
 * - Cache configuration
 * - Security measures
 */
```

### Inline Comments Example

```javascript
// ========================================
// File Processing
// ========================================

/**
 * Process files in batches
 * 
 * @param {Array} files - Files to process
 * @param {Function} processFunction - Processing function
 * @returns {Array} Processing results
 */
function processFilesInBatches(files, processFunction) {
  debug(`Starting file processing for ${files.length} files`, {
    batchSize: CONFIG.BATCH_SIZE,
    totalBatches: Math.ceil(files.length / CONFIG.BATCH_SIZE)
  });
  
  // Process files in batches
  const results = [];
  const totalBatches = Math.ceil(files.length / CONFIG.BATCH_SIZE);
  
  for (let i = 0; i < files.length; i += CONFIG.BATCH_SIZE) {
    const batch = files.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNumber = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
    
    debug(`Processing batch ${batchNumber} of ${totalBatches} (${batch.length} files)`);
    
    try {
      // Process batch
      const batchResults = processBatch(batch, processFunction);
      results.push(...batchResults);
      
      // Cache batch results if appropriate
      if (shouldCacheResults(batchResults)) {
        cacheBatchResults(batchNumber, batchResults);
      }
    } catch (error) {
      logError(error, {
        batchNumber,
        batchSize: batch.length,
        totalBatches,
        files: batch
      });
      
      // Handle partial failure
      const partialResults = handlePartialFailure(error, batch);
      if (partialResults) {
        results.push(...partialResults);
        cacheBatchResults(batchNumber, partialResults, true);
      }
    }
    
    // Check timeout after each batch
    if (checkTimeout()) {
      debug('Timeout approaching, stopping processing', {
        processed: results.length,
        remaining: files.length - (i + batch.length)
      });
      break;
    }
  }
  
  debug(`File processing completed. Processed ${results.length} files`, {
    totalFiles: files.length,
    successRate: results.length / files.length
  });
  
  return results;
}
```

## Error Handling Examples

### Error Recovery Example

```javascript
/**
 * Handle partial batch failure
 * 
 * @param {Error} error - Error object
 * @param {Array} batch - Batch items
 * @returns {Array} Partial results
 */
function handlePartialFailure(error, batch) {
  debug(`Handling partial failure: ${error.message}`, { batch });
  
  // Attempt to recover
  try {
    // Recovery logic
    const recoveryResults = attemptRecovery(error, batch);
    return recoveryResults;
  } catch (recoveryError) {
    // Log recovery failure
    logError(recoveryError, {
      originalError: error,
      batch,
      recoveryAttempted: true
    });
    
    // Return empty results if recovery fails
    return [];
  }
}

// Debug logging example
function debug(message, context = {}) {
  if (!CONFIG.DEBUG) return;
  
  const timestamp = new Date().toISOString();
  const contextStr = Object.entries(context)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(', ');
  
  const logMessage = `DEBUG ${timestamp}: ${message}${contextStr ? ` (${contextStr})` : ''}`;
  Logger.log(logMessage);
}
```

## Security Examples

### API Key Management

```javascript
// ========================================
// Security Configuration
// ========================================

const SECURITY_CONFIG = {
  API_KEYS: {
    // Never hardcode API keys here
    // Use environment variables or secure storage
    STORAGE: PropertiesService.getScriptProperties(),
    KEY_PREFIX: 'api_key_'
  },
  RATE_LIMITS: {
    MAX_CALLS: 100,
    RESET_PERIOD: 60000 // 1 minute
  },
  VALIDATION: {
    MAX_RETRIES: 3,
    TIMEOUT: 5000 // 5 seconds
  }
};

/**
 * Get secure API key
 * 
 * @param {string} keyName - Name of the API key
 * @returns {string} API key
 */
function getApiKey(keyName) {
  try {
    const fullKey = SECURITY_CONFIG.API_KEYS.KEY_PREFIX + keyName;
    const key = SECURITY_CONFIG.API_KEYS.STORAGE.getProperty(fullKey);
    
    if (!key) {
      throw new Error(`API key not found: ${keyName}`);
    }
    
    return key;
  } catch (error) {
    logError(error, { keyName });
    throw error;
  }
}

// Usage example
function makeApiCall(apiEndpoint) {
  try {
    const apiKey = getApiKey('external_service');
    
    // Rate limiting check
    checkRateLimit();
    
    // Make API call with proper security headers
    const options = {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      }
    };
    
    const response = UrlFetchApp.fetch(apiEndpoint, options);
    return response.getContentText();
  } catch (error) {
    logError(error, { apiEndpoint });
    throw error;
  }
}
```

## Testing Examples

### Unit Testing Example

```javascript
// ========================================
// Test Suite
// ========================================

function testProcessBatch() {
  // Test data
  const testData = [
    { id: 1, value: 'test1' },
    { id: 2, value: 'test2' },
    { id: 3, value: 'test3' }
  ];
  
  // Test function
  const testFunction = function(item) {
    return { processed: true, item: item };
  };
  
  // Process batch
  const results = processBatch(testData, testFunction);
  
  // Verify results
  assert(results.length === testData.length, 'Incorrect number of results');
  results.forEach((result, index) => {
    assert(result.processed === true, 'Item not processed');
    assert(result.item === testData[index], 'Incorrect item processed');
  });
}

function testErrorHandling() {
  // Test error case
  const errorFunction = function() {
    throw new Error('Test error');
  };
  
  try {
    processBatch([{ id: 1 }], errorFunction);
    assert(false, 'Error case did not throw');
  } catch (error) {
    assert(error.message === 'Test error', 'Incorrect error message');
  }
}

// Run tests
function runTests() {
  const tests = [
    testProcessBatch,
    testErrorHandling
  ];
  
  tests.forEach(test => {
    try {
      test();
      Logger.log(`Test passed: ${test.name}`);
    } catch (error) {
      Logger.log(`Test failed: ${test.name} - ${error.message}`);
    }
  });
}
```

### Integration Testing Example

```javascript
// ========================================
// Integration Tests
// ========================================

function testSpreadsheetIntegration() {
  // Setup test data
  const testSheet = SpreadsheetApp.create('Test Sheet');
  const testData = [
    ['Header1', 'Header2'],
    ['Value1', 'Value2'],
    ['Value3', 'Value4']
  ];
  
  try {
    // Write test data
    const range = testSheet.getRange(1, 1, testData.length, testData[0].length);
    range.setValues(testData);
    
    // Process data
    const results = processSpreadsheetData(testSheet);
    
    // Verify results
    assert(results.length === testData.length - 1, 'Incorrect number of processed rows');
    assert(results[0].header1 === testData[1][0], 'Incorrect header mapping');
    
  } finally {
    // Cleanup
    DriveApp.getFileById(testSheet.getId()).setTrashed(true);
  }
}

// Run integration tests
function runIntegrationTests() {
  const tests = [
    testSpreadsheetIntegration
  ];
  
  tests.forEach(test => {
    try {
      test();
      Logger.log(`Integration test passed: ${test.name}`);
    } catch (error) {
      Logger.log(`Integration test failed: ${test.name} - ${error.message}`);
    }
  });
}
```

Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2025-07-21 UTC.
