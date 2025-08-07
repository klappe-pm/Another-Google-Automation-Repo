# Google Apps Script Refactoring Guide

## Overview
This guide provides comprehensive patterns and best practices for refactoring Google Apps Scripts to be reusable across different Google Workspace accounts without exposing personal information or requiring code modifications.

## Core Principles

### 1. No Hardcoded Values
- **Never hardcode**: emails, folder IDs, spreadsheet IDs, API keys, or personal information
- **Always use**: Properties Service, configuration sheets, or environment detection
- **Example**:
```javascript
// ❌ BAD - Hardcoded email
const ADMIN_EMAIL = 'john.doe@company.com';

// ✅ GOOD - Configurable
const ADMIN_EMAIL = PropertiesService.getUserProperties().getProperty('ADMIN_EMAIL') 
                    || Session.getActiveUser().getEmail();
```

### 2. Configuration Management
Every script should have:
- Configuration initialization function
- User-friendly Config sheet
- Validation for all settings
- Default values that work universally

### 3. Comprehensive Documentation
Each script file must include:
- Purpose and features
- Setup instructions
- Required permissions
- Configuration options
- Troubleshooting guide

## Standard Script Structure

```javascript
/**
 * [Service Name] [Tool Name]
 * 
 * Service: [Gmail/Drive/Calendar/etc] + [Dependencies]
 * Version: [X.Y.Z]
 * Created: [YYYY-MM-DD]
 * Updated: [YYYY-MM-DD]
 * License: MIT
 * 
 * PURPOSE:
 * [Clear description of what the script does and why]
 * 
 * FEATURES:
 * - [Feature 1]
 * - [Feature 2]
 * - [Feature 3]
 * 
 * CONFIGURATION:
 * [How configuration is managed]
 * 
 * SETUP INSTRUCTIONS:
 * 1. [Step 1]
 * 2. [Step 2]
 * 3. [Step 3]
 * 
 * REQUIRED PERMISSIONS:
 * - [Scope 1]: [Why needed]
 * - [Scope 2]: [Why needed]
 * 
 * @OnlyCurrentDoc (if applicable)
 */

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Get configuration with defaults
 * @return {Object} Configuration object
 */
function getConfiguration() {
  // Implementation
}

/**
 * Initialize configuration
 * Creates Config sheet with all settings
 */
function initializeConfiguration() {
  // Implementation
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Main entry point
 * [Description]
 */
function main() {
  // Implementation with proper error handling
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper functions

// ============================================================================
// UI FUNCTIONS
// ============================================================================

/**
 * Create custom menu
 */
function onOpen() {
  // Menu creation
}
```

## Configuration Patterns

### Pattern 1: Properties-Based Configuration

```javascript
function getConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  return {
    // User-specific settings (priority)
    email: userProperties.getProperty('EMAIL') || Session.getActiveUser().getEmail(),
    
    // Script-wide settings
    apiKey: scriptProperties.getProperty('API_KEY') || null,
    
    // Defaults that work everywhere
    batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 50),
    maxRetries: Number(userProperties.getProperty('MAX_RETRIES') || 3),
    
    // Feature flags
    enableLogging: userProperties.getProperty('ENABLE_LOGGING') !== 'false',
    
    // Computed values
    timezone: userProperties.getProperty('TIMEZONE') || Session.getScriptTimeZone()
  };
}
```

### Pattern 2: Config Sheet Pattern

```javascript
function setupConfiguration() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName('Config') || ss.insertSheet('Config');
  
  const configTemplate = [
    ['Category', 'Setting', 'Value', 'Default', 'Description'],
    ['General', 'MAX_RECORDS', '1000', '1000', 'Maximum records to process'],
    ['Email', 'SEND_NOTIFICATIONS', 'true', 'true', 'Send email notifications'],
    // ... more settings
  ];
  
  configSheet.getRange(1, 1, configTemplate.length, 5).setValues(configTemplate);
  
  // Format headers
  configSheet.getRange(1, 1, 1, 5)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
    
  configSheet.autoResizeColumns(1, 5);
}

function loadConfiguration() {
  const configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  if (!configSheet) {
    throw new Error('Config sheet not found. Run setupConfiguration() first.');
  }
  
  const data = configSheet.getDataRange().getValues();
  const config = {};
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const [category, setting, value] = data[i];
    if (setting) {
      config[setting] = value;
    }
  }
  
  return config;
}
```

### Pattern 3: Environment Detection

```javascript
function getEnvironmentConfig() {
  const domain = Session.getActiveUser().getEmail().split('@')[1];
  
  // Detect environment based on domain
  if (domain === 'test.company.com') {
    return {
      environment: 'test',
      debugMode: true,
      apiEndpoint: 'https://api-test.company.com'
    };
  } else if (domain === 'company.com') {
    return {
      environment: 'production',
      debugMode: false,
      apiEndpoint: 'https://api.company.com'
    };
  } else {
    return {
      environment: 'personal',
      debugMode: true,
      apiEndpoint: null
    };
  }
}
```

## Security Best Practices

### 1. Secret Management

```javascript
/**
 * Get secure value (never hardcode secrets)
 * @param {string} key - Secret key
 * @return {string} Secret value or null
 */
function getSecureValue(key) {
  // Priority: User > Script > Prompt
  const userValue = PropertiesService.getUserProperties().getProperty(key);
  if (userValue) return userValue;
  
  const scriptValue = PropertiesService.getScriptProperties().getProperty(key);
  if (scriptValue) return scriptValue;
  
  // Prompt user if critical
  if (isCriticalSecret(key)) {
    return promptForSecret(key);
  }
  
  return null;
}

function setSecureValue(key, value, scope = 'user') {
  const properties = scope === 'user' 
    ? PropertiesService.getUserProperties()
    : PropertiesService.getScriptProperties();
    
  properties.setProperty(key, value);
  
  // Log without exposing value
  Logger.log(`Secret '${key}' stored in ${scope} properties`);
}
```

### 2. Data Sanitization

```javascript
/**
 * Remove sensitive information before logging/sharing
 * @param {Object} data - Data to sanitize
 * @return {Object} Sanitized data
 */
function sanitizeData(data) {
  const sensitivePatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
    /Bearer\s+[A-Za-z0-9\-._~\+\/]+=*/g, // Auth tokens
  ];
  
  let sanitized = JSON.stringify(data);
  
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  return JSON.parse(sanitized);
}
```

### 3. Permission Validation

```javascript
/**
 * Validate user has required permissions
 * @return {boolean} True if authorized
 */
function validatePermissions() {
  const user = Session.getActiveUser().getEmail();
  const authorizedDomains = getConfiguration().authorizedDomains || [];
  const authorizedUsers = getConfiguration().authorizedUsers || [];
  
  // Check domain
  const userDomain = user.split('@')[1];
  if (authorizedDomains.includes(userDomain)) {
    return true;
  }
  
  // Check specific users
  if (authorizedUsers.includes(user)) {
    return true;
  }
  
  // Check if owner
  const fileId = SpreadsheetApp.getActive().getId();
  const file = DriveApp.getFileById(fileId);
  if (file.getOwner().getEmail() === user) {
    return true;
  }
  
  Logger.log(`Unauthorized access attempt by ${user}`);
  return false;
}
```

## Error Handling Patterns

### Comprehensive Error Wrapper

```javascript
/**
 * Execute function with comprehensive error handling
 * @param {Function} func - Function to execute
 * @param {Object} context - Context for logging
 * @return {*} Function result or error
 */
function executeWithErrorHandling(func, context = {}) {
  const startTime = new Date().getTime();
  
  try {
    Logger.log(`Starting: ${func.name}`, context);
    const result = func();
    
    const duration = new Date().getTime() - startTime;
    Logger.log(`Completed: ${func.name} (${duration}ms)`, { 
      ...context, 
      duration 
    });
    
    return result;
    
  } catch (error) {
    const duration = new Date().getTime() - startTime;
    
    Logger.log(`Error in ${func.name}: ${error.toString()}`, {
      ...context,
      error: error.toString(),
      stack: error.stack,
      duration
    });
    
    // Determine if retryable
    if (isRetryableError(error)) {
      Logger.log('Error is retryable, attempting retry...');
      return retryWithBackoff(func, context);
    }
    
    // Send notification if critical
    if (isCriticalError(error)) {
      notifyAdminOfError(error, context);
    }
    
    // User-friendly error
    throw new Error(getUserFriendlyMessage(error));
  }
}
```

## Logging Best Practices

### Structured Logging

```javascript
class Logger {
  constructor(service, config = {}) {
    this.service = service;
    this.config = config;
    this.logLevel = config.logLevel || 'INFO';
    this.logs = [];
  }
  
  log(level, message, context = {}) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    
    if (levels.indexOf(level) < levels.indexOf(this.logLevel)) {
      return;
    }
    
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      context: sanitizeData(context),
      user: Session.getActiveUser().getEmail()
    };
    
    // Console logging
    if (this.config.logToConsole !== false) {
      console.log(`[${entry.level}] ${entry.message}`, entry.context);
    }
    
    // Sheet logging
    if (this.config.logToSheet) {
      this.logToSheet(entry);
    }
    
    // Memory buffer
    this.logs.push(entry);
    if (this.logs.length > 1000) {
      this.logs.shift(); // Remove oldest
    }
  }
  
  logToSheet(entry) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = ss.getSheetByName('Logs') || ss.insertSheet('Logs');
      
      sheet.appendRow([
        entry.timestamp,
        entry.level,
        entry.service,
        entry.message,
        JSON.stringify(entry.context)
      ]);
    } catch (error) {
      console.error('Failed to log to sheet:', error);
    }
  }
}
```

## UI/UX Patterns

### User-Friendly Menus

```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const config = getConfiguration();
  
  const menu = ui.createMenu('📧 ' + (config.menuName || 'Custom Tools'));
  
  // Setup section
  menu.addItem('⚙️ Setup Configuration', 'showConfigurationDialog')
      .addItem('💾 Save Settings', 'saveConfiguration')
      .addSeparator();
  
  // Main functions
  menu.addItem('▶️ Run Process', 'runMainProcess')
      .addItem('⏸️ Pause Process', 'pauseProcess')
      .addItem('⏹️ Stop Process', 'stopProcess')
      .addSeparator();
  
  // Utilities
  menu.addSubMenu(ui.createMenu('🔧 Utilities')
      .addItem('Clear Cache', 'clearCache')
      .addItem('Export Logs', 'exportLogs')
      .addItem('Run Diagnostics', 'runDiagnostics'))
      .addSeparator();
  
  // Help
  menu.addItem('❓ Help', 'showHelp')
      .addItem('📖 Documentation', 'showDocumentation')
      .addItem('🐛 Report Issue', 'reportIssue');
  
  menu.addToUi();
}
```

### Interactive Dialogs

```javascript
function showConfigurationDialog() {
  const template = HtmlService.createTemplateFromFile('config-dialog');
  template.config = getConfiguration();
  
  const html = template.evaluate()
    .setWidth(600)
    .setHeight(500)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuration Settings');
}

// config-dialog.html
/*
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .form-group { margin-bottom: 15px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input, select { width: 100%; padding: 8px; border: 1px solid #ddd; }
      button { padding: 10px 20px; background: #4285f4; color: white; border: none; }
    </style>
  </head>
  <body>
    <h2>Configuration Settings</h2>
    
    <div class="form-group">
      <label>Email Notifications:</label>
      <select id="notifications">
        <option value="true">Enabled</option>
        <option value="false">Disabled</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Batch Size:</label>
      <input type="number" id="batchSize" min="1" max="1000" value="<?= config.batchSize ?>">
    </div>
    
    <button onclick="saveSettings()">Save Settings</button>
    <button onclick="google.script.host.close()">Cancel</button>
    
    <script>
      function saveSettings() {
        const settings = {
          notifications: document.getElementById('notifications').value,
          batchSize: document.getElementById('batchSize').value
        };
        
        google.script.run
          .withSuccessHandler(() => {
            google.script.host.close();
          })
          .withFailureHandler(error => {
            alert('Error: ' + error);
          })
          .saveConfigurationFromDialog(settings);
      }
    </script>
  </body>
</html>
*/
```

## Performance Optimization

### Batch Processing Pattern

```javascript
/**
 * Process items in optimized batches
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {Object} options - Processing options
 * @return {Object} Processing results
 */
function processBatches(items, processor, options = {}) {
  const config = {
    batchSize: options.batchSize || 50,
    maxTime: options.maxTime || 300000, // 5 minutes
    onProgress: options.onProgress || null,
    saveCheckpoint: options.saveCheckpoint || false
  };
  
  const startTime = new Date().getTime();
  const results = {
    processed: [],
    failed: [],
    skipped: [],
    checkpoint: null
  };
  
  for (let i = 0; i < items.length; i += config.batchSize) {
    // Check timeout
    if (new Date().getTime() - startTime > config.maxTime - 30000) {
      Logger.log('Approaching timeout, saving checkpoint');
      
      if (config.saveCheckpoint) {
        results.checkpoint = {
          lastIndex: i,
          timestamp: new Date().toISOString(),
          partial: results
        };
        saveCheckpoint(results.checkpoint);
      }
      
      break;
    }
    
    // Process batch
    const batch = items.slice(i, Math.min(i + config.batchSize, items.length));
    
    try {
      const batchResults = processor(batch, i / config.batchSize);
      results.processed.push(...batchResults);
      
      // Progress callback
      if (config.onProgress) {
        config.onProgress({
          current: i + batch.length,
          total: items.length,
          percentage: Math.round(((i + batch.length) / items.length) * 100)
        });
      }
      
    } catch (error) {
      Logger.log(`Batch processing error at index ${i}:`, error);
      results.failed.push(...batch);
    }
    
    // Prevent quota exhaustion
    Utilities.sleep(100);
  }
  
  return results;
}
```

### Caching Pattern

```javascript
class Cache {
  constructor(namespace, ttl = 3600) {
    this.namespace = namespace;
    this.ttl = ttl; // Time to live in seconds
    this.cache = CacheService.getUserCache();
  }
  
  get(key) {
    const cacheKey = `${this.namespace}_${key}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      try {
        const data = JSON.parse(cached);
        
        // Check expiration
        if (data.expires > new Date().getTime()) {
          Logger.log(`Cache hit: ${key}`);
          return data.value;
        }
      } catch (error) {
        Logger.log(`Cache parse error: ${error}`);
      }
    }
    
    Logger.log(`Cache miss: ${key}`);
    return null;
  }
  
  set(key, value) {
    const cacheKey = `${this.namespace}_${key}`;
    const data = {
      value: value,
      expires: new Date().getTime() + (this.ttl * 1000)
    };
    
    try {
      this.cache.put(cacheKey, JSON.stringify(data), this.ttl);
      Logger.log(`Cached: ${key}`);
    } catch (error) {
      Logger.log(`Cache write error: ${error}`);
    }
  }
  
  clear() {
    // Clear all keys with this namespace
    const allKeys = this.cache.getAll();
    const namespaceKeys = Object.keys(allKeys)
      .filter(k => k.startsWith(this.namespace));
      
    this.cache.removeAll(namespaceKeys);
    Logger.log(`Cleared ${namespaceKeys.length} cache entries`);
  }
}
```

## Testing Patterns

### Self-Test Function

```javascript
/**
 * Run comprehensive self-test
 * @return {Object} Test results
 */
function runSelfTest() {
  const tests = [];
  
  // Test configuration
  tests.push({
    name: 'Configuration',
    test: () => {
      const config = getConfiguration();
      assert(config !== null, 'Config should exist');
      assert(config.batchSize > 0, 'Batch size should be positive');
      return 'Configuration valid';
    }
  });
  
  // Test permissions
  tests.push({
    name: 'Permissions',
    test: () => {
      const hasSheets = !!SpreadsheetApp.getActiveSpreadsheet();
      const hasDrive = !!DriveApp.getRootFolder();
      assert(hasSheets, 'Should have Sheets access');
      assert(hasDrive, 'Should have Drive access');
      return 'Permissions granted';
    }
  });
  
  // Test utilities
  tests.push({
    name: 'Utilities',
    test: () => {
      const date = formatDate(new Date());
      const size = formatFileSize(1024);
      assert(date !== '', 'Date formatting works');
      assert(size === '1 KB', 'Size formatting works');
      return 'Utilities functional';
    }
  });
  
  // Run tests
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  tests.forEach(test => {
    try {
      const result = test.test();
      results.passed++;
      results.tests.push({
        name: test.name,
        status: 'PASSED',
        message: result
      });
      Logger.log(`✓ ${test.name}: ${result}`);
    } catch (error) {
      results.failed++;
      results.tests.push({
        name: test.name,
        status: 'FAILED',
        message: error.toString()
      });
      Logger.log(`✗ ${test.name}: ${error}`);
    }
  });
  
  results.summary = `${results.passed}/${tests.length} tests passed`;
  
  // Display results
  showTestResults(results);
  
  return results;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
```

## Migration Checklist

When refactoring existing scripts, follow this checklist:

### Pre-Migration
- [ ] Backup original script
- [ ] Document current functionality
- [ ] Identify all hardcoded values
- [ ] List required permissions
- [ ] Note any external dependencies

### During Migration
- [ ] Add comprehensive header documentation
- [ ] Replace hardcoded values with configuration
- [ ] Add configuration management functions
- [ ] Implement error handling
- [ ] Add logging system
- [ ] Create user-friendly UI
- [ ] Add validation for all inputs
- [ ] Implement checkpoint/resume capability
- [ ] Add self-test function

### Post-Migration
- [ ] Test with fresh account
- [ ] Verify no personal data exposed
- [ ] Document all configuration options
- [ ] Create setup instructions
- [ ] Add troubleshooting guide
- [ ] Test error scenarios
- [ ] Verify performance
- [ ] Get user feedback

## Common Refactoring Examples

### Example 1: Email Processing

**Before:**
```javascript
function processEmails() {
  const threads = GmailApp.search('from:john@example.com');
  const sheet = SpreadsheetApp.openById('1234567890');
  // Process...
}
```

**After:**
```javascript
function processEmails() {
  const config = getConfiguration();
  const searchQuery = config.searchQuery || 'is:unread';
  const threads = GmailApp.search(searchQuery, 0, config.maxThreads);
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet() || 
                 SpreadsheetApp.create(config.spreadsheetName);
  
  // Process with error handling...
  return executeWithErrorHandling(() => {
    // Processing logic
  }, { function: 'processEmails', query: searchQuery });
}
```

### Example 2: Drive Operations

**Before:**
```javascript
function backupFiles() {
  const folder = DriveApp.getFolderById('ABCDEFG123');
  const backupFolder = DriveApp.getFolderById('XYZ789');
  // Backup...
}
```

**After:**
```javascript
function backupFiles() {
  const config = getConfiguration();
  
  // Get or create folders
  const sourceFolder = config.sourceFolderId 
    ? DriveApp.getFolderById(config.sourceFolderId)
    : DriveApp.getRootFolder();
    
  const backupFolderName = config.backupFolderName || 'Backups';
  const backupFolder = getOrCreateFolder(backupFolderName);
  
  // Backup with progress tracking
  const files = sourceFolder.getFiles();
  const fileList = [];
  while (files.hasNext() && fileList.length < config.maxFiles) {
    fileList.push(files.next());
  }
  
  return processBatches(fileList, (batch) => {
    return batch.map(file => {
      file.makeCopy(file.getName(), backupFolder);
      return file.getName();
    });
  }, {
    batchSize: config.batchSize,
    onProgress: (progress) => {
      Logger.log(`Backup progress: ${progress.percentage}%`);
    }
  });
}
```

## Conclusion

By following these patterns and best practices, Google Apps Scripts become:
- **Portable**: Work across any Google account without modification
- **Secure**: No exposed personal information or credentials
- **Maintainable**: Clear structure and comprehensive documentation
- **Reliable**: Proper error handling and recovery mechanisms
- **User-Friendly**: Intuitive configuration and helpful UI
- **Professional**: Enterprise-ready with logging and monitoring

Remember: The goal is to create scripts that any user can deploy and use without needing to understand or modify the code.