# Google Apps Script Best Practices Guide

## Overview

This guide outlines best practices for developing maintainable, scalable, and efficient Google Apps Script applications based on JavaScript standards and Google's specific recommendations.

## 1. Code Organization

### 1.1 File Structure
```
project/
├── src/
│   ├── Config.js          # Configuration constants
│   ├── Utils.js           # Utility functions
│   ├── Services/          # Service wrappers
│   │   ├── GmailService.js
│   │   ├── DriveService.js
│   │   └── SheetsService.js
│   ├── Models/            # Data models
│   └── Main.js            # Entry points
├── tests/
└── appsscript.json
```

### 1.2 Modular Design
```javascript
// ❌ Bad: Everything in one file
function doEverything() {
  var threads = GmailApp.search('is:unread');
  var sheet = SpreadsheetApp.create('Export');
  // ... 500 more lines
}

// ✅ Good: Separated concerns
// GmailService.js
class GmailService {
  static searchUnread(limit = 50) {
    return GmailApp.search('is:unread', 0, limit);
  }
}

// ExportService.js
class ExportService {
  static toSheet(data, sheetName) {
    const sheet = SpreadsheetApp.create(sheetName);
    return this.writeData(sheet, data);
  }
}

// Main.js
function exportUnreadEmails() {
  const emails = GmailService.searchUnread();
  return ExportService.toSheet(emails, 'Unread Emails');
}
```

## 2. Performance Optimization

### 2.1 Batch Operations
```javascript
// ❌ Bad: Multiple API calls
function slowUpdate(sheet, data) {
  data.forEach((row, i) => {
    row.forEach((cell, j) => {
      sheet.getRange(i + 1, j + 1).setValue(cell);
    });
  });
}

// ✅ Good: Single API call
function fastUpdate(sheet, data) {
  const range = sheet.getRange(1, 1, data.length, data[0].length);
  range.setValues(data);
}
```

### 2.2 Caching
```javascript
// ✅ Use CacheService for expensive operations
class DataCache {
  static get(key) {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  static set(key, value, expirationInSeconds = 3600) {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(value), expirationInSeconds);
  }
}

function getExpensiveData() {
  const cacheKey = 'expensive-data';
  let data = DataCache.get(cacheKey);
  
  if (!data) {
    data = performExpensiveOperation();
    DataCache.set(cacheKey, data);
  }
  
  return data;
}
```

### 2.3 Minimize Service Calls
```javascript
// ❌ Bad: Multiple service calls
function inefficient() {
  const sheet = SpreadsheetApp.getActiveSheet();
  for (let i = 1; i <= 100; i++) {
    const value = sheet.getRange(i, 1).getValue();
    sheet.getRange(i, 2).setValue(value * 2);
  }
}

// ✅ Good: Batch read and write
function efficient() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const values = sheet.getRange(1, 1, 100, 1).getValues();
  const doubled = values.map(row => [row[0] * 2]);
  sheet.getRange(1, 2, 100, 1).setValues(doubled);
}
```

## 3. Error Handling

### 3.1 Comprehensive Error Handling
```javascript
// ✅ Proper error handling
class ErrorHandler {
  static wrap(fn, context = 'Unknown') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        console.error(`Error in ${context}:`, error);
        
        // Log to sheet for persistence
        this.logError(error, context);
        
        // Re-throw or return safe value
        if (this.isCritical(error)) {
          throw new Error(`Critical error in ${context}: ${error.message}`);
        }
        return null;
      }
    };
  }
  
  static logError(error, context) {
    try {
      const sheet = SpreadsheetApp.openById(ERROR_LOG_SHEET_ID);
      sheet.appendRow([
        new Date(),
        context,
        error.message,
        error.stack,
        Session.getActiveUser().getEmail()
      ]);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Usage
const safeFunction = ErrorHandler.wrap(riskyFunction, 'RiskyOperation');
```

### 3.2 Retry Logic
```javascript
// ✅ Exponential backoff retry
function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        Utilities.sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// Usage
const result = retryWithBackoff(() => {
  return UrlFetchApp.fetch(apiUrl);
});
```

## 4. State Management

### 4.1 Script Properties
```javascript
// ✅ Use Properties Service for configuration
class Config {
  static get(key, defaultValue = null) {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperty(key) || defaultValue;
  }
  
  static set(key, value) {
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty(key, value);
  }
  
  static getAll() {
    const properties = PropertiesService.getScriptProperties();
    return properties.getProperties();
  }
}

// Usage
const apiKey = Config.get('API_KEY');
Config.set('LAST_RUN', new Date().toISOString());
```

### 4.2 User Properties
```javascript
// ✅ Store user-specific settings
class UserSettings {
  static get(key, defaultValue = null) {
    const properties = PropertiesService.getUserProperties();
    const value = properties.getProperty(key);
    return value ? JSON.parse(value) : defaultValue;
  }
  
  static set(key, value) {
    const properties = PropertiesService.getUserProperties();
    properties.setProperty(key, JSON.stringify(value));
  }
}
```

## 5. Security Best Practices

### 5.1 Never Hard-code Secrets
```javascript
// ❌ Bad: Hard-coded credentials
function badExample() {
  const apiKey = 'sk-1234567890abcdef';
  return UrlFetchApp.fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
}

// ✅ Good: Use Properties Service
function goodExample() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  if (!apiKey) {
    throw new Error('API_KEY not configured');
  }
  
  return UrlFetchApp.fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
}
```

### 5.2 Input Validation
```javascript
// ✅ Validate all inputs
class Validator {
  static email(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(email)) {
      throw new Error(`Invalid email: ${email}`);
    }
    return email;
  }
  
  static dateRange(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }
    
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
    
    return { startDate, endDate };
  }
}
```

## 6. Testing Strategies

### 6.1 Unit Testing Pattern
```javascript
// TestRunner.js
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }
  
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  async run() {
    for (const test of this.tests) {
      try {
        await test.fn();
        this.results.push({ name: test.name, status: 'PASS' });
      } catch (error) {
        this.results.push({ 
          name: test.name, 
          status: 'FAIL', 
          error: error.message 
        });
      }
    }
    
    return this.results;
  }
}

// Example test
const runner = new TestRunner();

runner.test('Email validation should accept valid emails', () => {
  const valid = 'test@example.com';
  assert(Validator.email(valid) === valid);
});

runner.test('Email validation should reject invalid emails', () => {
  assertThrows(() => Validator.email('invalid-email'));
});
```

### 6.2 Integration Testing
```javascript
// ✅ Test with real services in test environment
class IntegrationTest {
  static async testEmailWorkflow() {
    // Create test data
    const testLabel = GmailApp.createLabel('TEST_' + Date.now());
    
    try {
      // Run workflow
      const result = await EmailWorkflow.process({
        label: testLabel.getName(),
        action: 'export'
      });
      
      // Verify results
      assert(result.success === true);
      assert(result.processed > 0);
      
    } finally {
      // Cleanup
      testLabel.deleteLabel();
    }
  }
}
```

## 7. Documentation

### 7.1 JSDoc Comments
```javascript
/**
 * Processes emails based on the provided configuration
 * @param {Object} config - The configuration object
 * @param {string} config.query - Gmail search query
 * @param {number} [config.limit=50] - Maximum emails to process
 * @param {string[]} [config.labels=[]] - Labels to apply
 * @returns {ProcessResult} The processing result
 * @throws {Error} If query is invalid
 * @example
 * const result = processEmails({
 *   query: 'is:unread',
 *   limit: 100,
 *   labels: ['Processed']
 * });
 */
function processEmails(config) {
  // Implementation
}
```

### 7.2 README Template
```markdown
# Project Name

## Overview
Brief description of what this script does

## Setup
1. Open Apps Script project
2. Add required OAuth scopes
3. Configure script properties:
   - `API_KEY`: Your API key
   - `SHEET_ID`: Target spreadsheet ID

## Usage
```javascript
// Run the main function
function main() {
  processEmails({
    query: 'label:important',
    exportFormat: 'pdf'
  });
}
```

## Configuration
| Property | Description | Default |
|----------|-------------|---------|
| BATCH_SIZE | Number of items to process | 50 |
| TIMEOUT | Max execution time (ms) | 300000 |
```

## 8. Deployment Best Practices

### 8.1 Version Control
```javascript
// ✅ Track version in code
const VERSION = '2.1.0';
const CHANGELOG = {
  '2.1.0': 'Added batch processing support',
  '2.0.0': 'Major refactoring for performance',
  '1.0.0': 'Initial release'
};

function getVersion() {
  return {
    version: VERSION,
    changelog: CHANGELOG,
    deployedAt: Config.get('DEPLOYED_AT'),
    deployedBy: Config.get('DEPLOYED_BY')
  };
}
```

### 8.2 Feature Flags
```javascript
// ✅ Use feature flags for gradual rollout
class FeatureFlags {
  static isEnabled(feature) {
    const flags = Config.get('FEATURE_FLAGS', {});
    return flags[feature] === true;
  }
  
  static enable(feature) {
    const flags = Config.get('FEATURE_FLAGS', {});
    flags[feature] = true;
    Config.set('FEATURE_FLAGS', flags);
  }
}

// Usage
function processEmails() {
  if (FeatureFlags.isEnabled('NEW_ALGORITHM')) {
    return processEmailsV2();
  }
  return processEmailsV1();
}
```

## 9. Common Pitfalls to Avoid

### 9.1 Quota Awareness
```javascript
// ✅ Monitor quota usage
class QuotaManager {
  static check(service, operation) {
    const quotas = {
      gmail: { read: 20000, write: 1000 },
      drive: { read: 20000, write: 1000 },
      sheets: { read: 20000, write: 20000 }
    };
    
    const used = this.getUsage(service, operation);
    const limit = quotas[service][operation];
    
    if (used > limit * 0.8) {
      console.warn(`Approaching quota limit for ${service}.${operation}`);
    }
    
    return { used, limit, remaining: limit - used };
  }
}
```

### 9.2 Time-based Triggers
```javascript
// ✅ Proper trigger management
class TriggerManager {
  static create(functionName, frequency) {
    // Remove existing triggers
    this.remove(functionName);
    
    // Create new trigger
    const trigger = ScriptApp.newTrigger(functionName)
      .timeBased()
      .everyMinutes(frequency)
      .create();
      
    // Store trigger ID
    Config.set(`TRIGGER_${functionName}`, trigger.getUniqueId());
    
    return trigger;
  }
  
  static remove(functionName) {
    const triggerId = Config.get(`TRIGGER_${functionName}`);
    if (triggerId) {
      ScriptApp.getProjectTriggers()
        .filter(t => t.getUniqueId() === triggerId)
        .forEach(t => ScriptApp.deleteTrigger(t));
    }
  }
}
```

## 10. Advanced Patterns

### 10.1 Event-Driven Architecture
```javascript
class EventBus {
  constructor() {
    this.handlers = new Map();
  }
  
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }
  
  emit(event, data) {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Handler error for ${event}:`, error);
      }
    });
  }
}

// Usage
const bus = new EventBus();

bus.on('email.processed', (data) => {
  updateStatistics(data);
});

bus.on('email.processed', (data) => {
  sendNotification(data);
});

// In processing code
bus.emit('email.processed', { count: 10, user: 'user@example.com' });
```

### 10.2 Pipeline Pattern
```javascript
class Pipeline {
  constructor() {
    this.steps = [];
  }
  
  add(step) {
    this.steps.push(step);
    return this;
  }
  
  async execute(input) {
    let result = input;
    
    for (const step of this.steps) {
      result = await step(result);
      
      if (result === null || result === false) {
        break; // Stop pipeline on null/false
      }
    }
    
    return result;
  }
}

// Usage
const emailPipeline = new Pipeline()
  .add(validateEmail)
  .add(enrichWithMetadata)
  .add(applyFilters)
  .add(exportToSheet)
  .add(sendNotification);

const result = await emailPipeline.execute(emailData);
```

## Summary

Following these best practices will result in:
- **More maintainable code** through modular design and clear documentation
- **Better performance** via batch operations and caching
- **Improved reliability** with comprehensive error handling
- **Enhanced security** through proper credential management
- **Easier debugging** with logging and testing strategies
- **Scalable architecture** using proven design patterns

Remember: Google Apps Script has execution time limits (6 minutes for consumer accounts, 30 minutes for Workspace accounts) and quota limits. Always design with these constraints in mind.