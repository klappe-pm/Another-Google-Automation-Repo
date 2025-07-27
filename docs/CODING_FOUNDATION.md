# Coding Foundation

**Purpose: Single source of truth for all coding standards and patterns**  
**Last Updated: July 27, 2025**

## Foundation Principles

1. **Consistency** - Same patterns everywhere
2. **Clarity** - Code explains itself
3. **Extensibility** - Easy to extend and modify
4. **Testability** - Everything can be tested
5. **Maintainability** - Easy to fix and update

## Code Standards

### File Structure
```javascript
/**
 * Header Comment Block (required)
 * - Proper JSDoc format (/** not / * *)
 * - 8 required sections (see below)
 */

// Constants
const MAX_RETRIES = 3;
const BATCH_SIZE = 100;

// Main Functions (alphabetical)
function analyzeData() { }
function exportResults() { }
function processItems() { }

// Helper Functions (alphabetical, prefixed with _)
function _formatDate() { }
function _validateInput() { }
```

### Header Format (Required)
```javascript
/**
 * Script Name: [filename without .gs]
 * 
 * Script Summary:
 * [One-line description of what this script does]
 * 
 * Script Purpose:
 * - [Primary purpose]
 * - [Secondary purpose if applicable]
 * - [Additional purposes]
 * 
 * Script Steps:
 * 1. [First step]
 * 2. [Second step]
 * 3. [Continue numbering]
 * 
 * Script Functions:
 * - functionName(): [What it does]
 * - anotherFunction(): [What it does]
 * 
 * Script Helper Functions:
 * - _helperName(): [What it does]
 * - _anotherHelper(): [What it does]
 * 
 * Script Dependencies:
 * - [External scripts or libraries]
 * - [Or "None" if standalone]
 * 
 * Google Services:
 * - ServiceName: [How it's used]
 * - [Or "None" if no services used]
 */
```

### Naming Conventions

#### Files
- **Format**: `action-noun.gs`
- **Examples**: 
  - ✅ `export-labels.gs`
  - ✅ `create-folders.gs`
  - ✅ `analyze-usage.gs`
  - ❌ `labelExporter.gs`
  - ❌ `gmail-export.gs`

#### Functions
- **Main functions**: `camelCase` verbs
  - `exportData()`, `processEmails()`, `analyzeTrends()`
- **Helpers**: `_camelCase` with underscore
  - `_formatDate()`, `_validateEmail()`, `_retry()`
- **Constants**: `UPPER_SNAKE_CASE`
  - `MAX_THREADS`, `DEFAULT_TIMEOUT`, `API_ENDPOINT`

#### Variables
- **Descriptive names**: `labelCount` not `lc`
- **Booleans**: `isValid`, `hasError`, `canProceed`
- **Arrays**: Plural - `labels`, `messages`, `results`
- **Objects**: Singular - `config`, `user`, `response`

### Function Documentation
```javascript
/**
 * Exports Gmail labels to a spreadsheet
 * @param {string} spreadsheetId - Target spreadsheet ID
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeSystem - Include system labels
 * @param {number} options.batchSize - Processing batch size
 * @returns {Object} Result object with success status and count
 * @throws {Error} If spreadsheet cannot be accessed
 */
function exportLabels(spreadsheetId, options = {}) {
  // Implementation
}
```

### Error Handling
```javascript
// Pattern 1: Try-Catch with Context
try {
  const result = riskyOperation();
  return { success: true, data: result };
} catch (error) {
  Logger.log(`Error in exportLabels: ${error.message}`);
  return { success: false, error: error.message };
}

// Pattern 2: Validation First
function processData(input) {
  // Validate inputs
  if (!input || !input.id) {
    throw new Error('Invalid input: missing required field "id"');
  }
  
  // Process after validation
  return performOperation(input);
}

// Pattern 3: Graceful Degradation
function fetchUserData(userId) {
  try {
    return getPrimarySource(userId);
  } catch (primaryError) {
    Logger.log(`Primary source failed: ${primaryError.message}`);
    try {
      return getSecondarySource(userId);
    } catch (secondaryError) {
      Logger.log(`Secondary source failed: ${secondaryError.message}`);
      return getDefaultData();
    }
  }
}
```

### Performance Patterns

#### Batch Operations
```javascript
// ❌ Bad: Individual API calls
for (let i = 0; i < rows.length; i++) {
  sheet.getRange(i + 1, 1).setValue(rows[i][0]);
  sheet.getRange(i + 1, 2).setValue(rows[i][1]);
}

// ✅ Good: Batch API call
sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
```

#### Caching
```javascript
// Cache expensive operations
function getExpensiveData() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('expensive-data');
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = performExpensiveOperation();
  cache.put('expensive-data', JSON.stringify(data), 3600); // 1 hour
  
  return data;
}
```

#### Early Returns
```javascript
// ✅ Good: Early returns for clarity
function processUser(user) {
  if (!user) return null;
  if (user.isInactive) return { status: 'inactive' };
  if (!user.hasPermission) return { status: 'unauthorized' };
  
  // Main logic here
  return processActiveUser(user);
}
```

### Google Apps Script Specific

#### Logger vs Console
```javascript
// ✅ Use Logger for Google Apps Script
Logger.log('Processing started');
Logger.log(`Found ${count} items`);

// ❌ Don't use console (doesn't work in GAS)
console.log('This won\'t work');
```

#### Service Limits
```javascript
// Handle quota limits
function processWithLimits(items) {
  const BATCH_SIZE = 100; // Stay under limits
  const results = [];
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    results.push(...processBatch(batch));
    
    // Avoid rate limits
    if (i + BATCH_SIZE < items.length) {
      Utilities.sleep(1000); // 1 second delay
    }
  }
  
  return results;
}
```

#### Property Service
```javascript
// Store configuration
PropertiesService.getScriptProperties().setProperty('API_KEY', 'your-key');

// Retrieve configuration
const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
```

## Code Patterns

### Initialization Pattern
```javascript
/**
 * Main entry point for the script
 */
function main() {
  try {
    // Initialize
    const config = loadConfiguration();
    const services = initializeServices(config);
    
    // Execute
    const data = fetchData(services);
    const processed = processData(data);
    const results = exportResults(processed);
    
    // Report
    Logger.log(`Success: Processed ${results.count} items`);
    return results;
    
  } catch (error) {
    Logger.log(`Fatal error: ${error.message}`);
    throw error;
  }
}
```

### Service Pattern
```javascript
/**
 * Service wrapper for consistent API usage
 */
class GmailService {
  constructor(options = {}) {
    this.maxResults = options.maxResults || 100;
    this.includeSpam = options.includeSpam || false;
  }
  
  getLabels() {
    try {
      return GmailApp.getUserLabels();
    } catch (error) {
      throw new Error(`Failed to get labels: ${error.message}`);
    }
  }
  
  searchMessages(query) {
    const threads = GmailApp.search(query, 0, this.maxResults);
    return threads.flatMap(thread => thread.getMessages());
  }
}
```

### Builder Pattern
```javascript
/**
 * Configuration builder for complex setups
 */
class ExportConfig {
  constructor() {
    this.format = 'csv';
    this.includeHeaders = true;
    this.dateFormat = 'yyyy-MM-dd';
  }
  
  setFormat(format) {
    this.format = format;
    return this;
  }
  
  setHeaders(include) {
    this.includeHeaders = include;
    return this;
  }
  
  setDateFormat(format) {
    this.dateFormat = format;
    return this;
  }
  
  build() {
    return Object.freeze({ ...this });
  }
}

// Usage
const config = new ExportConfig()
  .setFormat('json')
  .setHeaders(false)
  .build();
```

## Testing Standards

### Test Structure
```javascript
/**
 * Test suite for label export functionality
 */
function testLabelExport() {
  const tests = [
    testExportEmptyLabels,
    testExportSystemLabels,
    testExportUserLabels,
    testExportWithErrors
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      test();
      passed++;
      Logger.log(`✅ ${test.name}`);
    } catch (error) {
      failed++;
      Logger.log(`❌ ${test.name}: ${error.message}`);
    }
  });
  
  Logger.log(`\nTests: ${passed} passed, ${failed} failed`);
}
```

### Mock Pattern
```javascript
/**
 * Mock service for testing
 */
class MockGmailService {
  constructor(labels = []) {
    this.labels = labels;
  }
  
  getUserLabels() {
    return this.labels.map(name => ({
      getName: () => name,
      getMessageCount: () => Math.floor(Math.random() * 100)
    }));
  }
}
```

## Security Standards

### Never Hardcode Secrets
```javascript
// ❌ Bad
const API_KEY = 'sk-1234567890abcdef';

// ✅ Good
const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY');
```

### Validate Inputs
```javascript
function processUserInput(input) {
  // Sanitize
  const cleaned = input.trim().toLowerCase();
  
  // Validate
  if (!/^[a-z0-9-]+$/.test(cleaned)) {
    throw new Error('Invalid input format');
  }
  
  // Escape if needed
  const escaped = cleaned.replace(/[<>]/g, '');
  
  return escaped;
}
```

### Limit Permissions
```javascript
// Request only needed scopes in manifest
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",  // Not .modify
    "https://www.googleapis.com/auth/spreadsheets"     // Not .drive
  ]
}
```

## Common Utilities

### Date Formatting
```javascript
function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), format);
}
```

### Retry Logic
```javascript
function retryOperation(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        Utilities.sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError;
}
```

### Batch Processing
```javascript
function processBatches(items, batchSize, processor) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = processor(batch);
    results.push(...batchResults);
    
    // Progress logging
    Logger.log(`Processed ${Math.min(i + batchSize, items.length)}/${items.length}`);
  }
  
  return results;
}
```

## Migration Guide

### From Old to New Pattern
```javascript
// Old pattern
function script() {
  var sheet = SpreadsheetApp.getActiveSheet();
  for (var i = 0; i < 10; i++) {
    sheet.getRange(i + 1, 1).setValue(i);
  }
}

// New pattern
/**
 * Script Name: update-sheet-values
 * 
 * Script Summary:
 * Updates sheet with sequential values using batch operations
 * 
 * [... rest of header ...]
 */

/**
 * Updates sheet values in batch
 * @param {number} count - Number of values to write
 * @returns {Object} Result with success status
 */
function updateSheetValues(count = 10) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const values = Array.from({ length: count }, (_, i) => [i]);
    
    sheet.getRange(1, 1, values.length, 1).setValues(values);
    
    return { success: true, count: values.length };
  } catch (error) {
    Logger.log(`Error updating sheet: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

## Enforcement

### Automated Checks
1. Pre-commit hooks validate formatting
2. Linter enforces naming conventions
3. Tests required for new functions
4. Code review checklist

### Manual Review
1. Pattern compliance
2. Performance impact
3. Security considerations
4. Documentation quality

---

**This document supersedes all previous style guides and standards documents.**