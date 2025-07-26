# Development Guide

This guide covers the development standards and practices for contributing to the Google Workspace Automation project.

## Code Standards

### Naming Conventions

#### File Naming
All script files follow the **action-noun** format:
- ✅ `export-labels.gs`
- ✅ `create-folders.gs`
- ✅ `analyze-data.gs`
- ❌ `labels-export.gs` (wrong order)
- ❌ `gmail-export-labels.gs` (no service prefix)

**Special Rules:**
- Markdown scripts start with `markdown-`: `markdown-export-docs.gs`
- No service prefixes (gmail-, drive-, etc.) - use folder structure
- Use kebab-case, not camelCase or snake_case
- Be specific: `export-labels-to-sheets.gs` not just `export.gs`

#### Function Naming
- Use camelCase: `exportLabelsToSheet()`
- Be descriptive: `calculateEmailStatistics()` not `calc()`
- Prefix helpers with underscore: `_validateInput()`

### Documentation Requirements

#### File Header (Required)
Every script must have this header format:

```javascript
/**
 * Script Name: export-labels-data
 * 
 * Script Summary:
 * Exports Gmail label data and statistics to Google Sheets for analysis.
 * 
 * Script Purpose:
 * - Extract comprehensive label metadata from Gmail
 * - Calculate label statistics (message counts, unread counts)
 * - Generate structured reports in spreadsheet format
 * - Support both full and incremental exports
 * 
 * Script Steps:
 * 1. Initialize spreadsheet with headers
 * 2. Fetch all Gmail labels via API
 * 3. Calculate statistics for each label
 * 4. Sort labels by hierarchy and name
 * 5. Write data to spreadsheet in batches
 * 6. Apply formatting and create summary sheet
 * 
 * Script Functions:
 * - exportLabelsToSheet(): Main function that orchestrates the export
 * - calculateLabelStats(): Computes message and unread counts
 * - createSummarySheet(): Generates overview sheet with totals
 * 
 * Script Helper Functions:
 * - _formatLabelName(): Formats label names for display
 * - _validateSpreadsheet(): Ensures spreadsheet is properly set up
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - GmailApp: For accessing labels and email data
 * - SpreadsheetApp: For creating and writing to sheets
 */
```

#### Function Comments (Required)
All functions need JSDoc comments:

```javascript
/**
 * Exports Gmail labels to a spreadsheet with statistics
 * @param {string} spreadsheetId - The ID of the target spreadsheet
 * @param {Object} options - Export configuration options
 * @param {boolean} options.includeSystem - Whether to include system labels
 * @param {number} options.batchSize - Number of labels to process at once
 * @returns {Object} Export summary with counts and timing
 */
function exportLabelsToSheet(spreadsheetId, options = {}) {
  // Implementation
}
```

### Code Organization

#### File Structure
```javascript
// 1. File header comment (required)

// 2. Constants
const MAX_BATCH_SIZE = 100;
const DEFAULT_SHEET_NAME = 'Label Export';

// 3. Main Functions (alphabetically)
function analyzeLabels() { }
function exportLabels() { }
function processLabels() { }

// 4. Helper Functions (alphabetically)
function _formatDate() { }
function _validateInput() { }
```

#### Function Organization
- Sort functions alphabetically within their section
- Separate main functions from helpers
- Use clear section comments

### Google Apps Script Best Practices

#### Use Logger, not console
```javascript
// ✅ Good
Logger.log('Processing started');

// ❌ Bad
console.log('Processing started');
```

#### Handle Errors Gracefully
```javascript
try {
  const labels = GmailApp.getUserLabels();
  // Process labels
} catch (error) {
  Logger.log(`Error fetching labels: ${error.message}`);
  // Handle error appropriately
}
```

#### Batch Operations
```javascript
// ✅ Good - Batch write
const values = data.map(row => [row.name, row.count]);
sheet.getRange(1, 1, values.length, 2).setValues(values);

// ❌ Bad - Individual writes
data.forEach((row, i) => {
  sheet.getRange(i + 1, 1).setValue(row.name);
  sheet.getRange(i + 1, 2).setValue(row.count);
});
```

## Development Workflow

### 1. Create New Script

```bash
# Navigate to appropriate service folder
cd apps/gmail/src

# Create new script with proper naming
touch export-email-statistics.gs
```

### 2. Add Required Documentation

Start with the complete header template and modify for your script.

### 3. Implement Functions

Follow the patterns in existing scripts:
- Check similar scripts in the same service
- Reuse common patterns
- Keep functions focused and single-purpose

### 4. Test Locally

```javascript
// Add test function
function testExportStatistics() {
  const result = exportEmailStatistics({
    maxThreads: 10,
    testMode: true
  });
  Logger.log('Test result:', result);
}
```

### 5. Run Development Tools

```bash
# Format your script
node automation/dev-tools/apply-smart-formatting.js

# Check for issues
node automation/dev-tools/lint-google-apps-scripts.js

# Standardize naming if needed
node automation/dev-tools/standardize-filenames.js
```

### 6. Deploy and Test

```bash
# Deploy to Google Apps Script
./automation/deploy-local.sh gmail

# Check logs
npx clasp logs
```

## Common Patterns

### Spreadsheet Operations

```javascript
/**
 * Initialize spreadsheet with headers
 */
function initializeSheet(spreadsheetId, sheetName) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  // Set headers
  const headers = ['Column1', 'Column2', 'Column3'];
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight('bold');
    
  return sheet;
}
```

### Gmail Operations

```javascript
/**
 * Process Gmail threads with pagination
 */
function processThreads(query, maxThreads = 100) {
  const batchSize = 100;
  let start = 0;
  const results = [];
  
  while (start < maxThreads) {
    const threads = GmailApp.search(query, start, batchSize);
    if (threads.length === 0) break;
    
    threads.forEach(thread => {
      // Process each thread
      results.push(processThread(thread));
    });
    
    start += threads.length;
  }
  
  return results;
}
```

### Drive Operations

```javascript
/**
 * Recursively process folders
 */
function processFolderTree(folder, depth = 0) {
  const indent = '  '.repeat(depth);
  Logger.log(`${indent}${folder.getName()}`);
  
  // Process files in folder
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    Logger.log(`${indent}  - ${file.getName()}`);
  }
  
  // Recurse into subfolders
  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    processFolderTree(subfolders.next(), depth + 1);
  }
}
```

## Testing

### Unit Testing Pattern

```javascript
/**
 * Test suite for label functions
 */
function runLabelTests() {
  const tests = [
    testLabelCreation,
    testLabelDeletion,
    testLabelStatistics
  ];
  
  tests.forEach(test => {
    try {
      test();
      Logger.log(`✅ ${test.name} passed`);
    } catch (error) {
      Logger.log(`❌ ${test.name} failed: ${error.message}`);
    }
  });
}
```

### Integration Testing

```javascript
/**
 * Integration test with real data
 */
function testFullWorkflow() {
  // Use test data
  const testConfig = {
    spreadsheetId: 'test-sheet-id',
    maxItems: 10,
    testMode: true
  };
  
  // Run workflow
  const result = runCompleteWorkflow(testConfig);
  
  // Verify results
  if (result.success && result.itemsProcessed === 10) {
    Logger.log('✅ Integration test passed');
  } else {
    Logger.log('❌ Integration test failed', result);
  }
}
```

## Debugging

### Use Debugger Labels

```javascript
function complexFunction() {
  Logger.log('[START] complexFunction');
  
  try {
    Logger.log('[FETCH] Getting data...');
    const data = fetchData();
    
    Logger.log('[PROCESS] Processing items...');
    const processed = processItems(data);
    
    Logger.log('[SAVE] Saving results...');
    saveResults(processed);
    
    Logger.log('[END] complexFunction completed');
  } catch (error) {
    Logger.log('[ERROR] complexFunction failed:', error);
    throw error;
  }
}
```

## Performance Optimization

### Cache Expensive Operations

```javascript
const cache = CacheService.getScriptCache();

function getExpensiveData() {
  const cached = cache.get('expensive-data');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = performExpensiveOperation();
  cache.put('expensive-data', JSON.stringify(data), 3600); // 1 hour
  
  return data;
}
```

### Use Batch Operations

```javascript
// ✅ Good - Single API call
const threads = GmailApp.getInboxThreads(0, 100);

// ❌ Bad - Multiple API calls
for (let i = 0; i < 100; i++) {
  const thread = GmailApp.getInboxThreads(i, 1)[0];
}
```

## Contributing Checklist

- [ ] Script follows action-noun naming convention
- [ ] Complete header documentation added
- [ ] All functions have JSDoc comments
- [ ] Functions are organized alphabetically
- [ ] Code follows Google Apps Script best practices
- [ ] Script has been tested locally
- [ ] No console.log statements (use Logger.log)
- [ ] Error handling is implemented
- [ ] Batch operations used where applicable
- [ ] Script added to appropriate service folder
- [ ] Catalog documentation updated

## Resources

- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Clasp Documentation](https://github.com/google/clasp)
- [Project Script Catalog](SCRIPT_CATALOG.md)
- [API Permissions Guide](API_PERMISSIONS.md)

---

Last Updated: July 2025