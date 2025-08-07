# Technical Design Document - Library Architecture Implementation

## Overview

This document describes the technical implementation of Google Apps Script Libraries to eliminate code duplication across the Workspace Automation project.

## Current Architecture Problems

### Deployment Isolation
```
GitHub Repository (Shared Code)
    ↓ clasp push
Individual Script Projects (Isolated Runtime)
    - Gmail:    ScriptID_1 (Cannot access other projects)
    - Drive:    ScriptID_2 (Cannot access other projects)  
    - Calendar: ScriptID_3 (Cannot access other projects)
```

### Impact of Isolation
Each script project is a sealed container. Code that appears shared in GitHub becomes duplicated at runtime. The file `/apps/shared/utils/common.gs` is meaningless because no service can access it after deployment.

## Proposed Architecture

### Library-Based Sharing
```
Common Library (ScriptID_Library)
    ↑ import
    ├── Gmail Service (uses CommonLib.function())
    ├── Drive Service (uses CommonLib.function())
    └── Calendar Service (uses CommonLib.function())
```

### How Libraries Work
1. Library project is deployed with its own Script ID
2. Library is versioned and published
3. Services declare dependency in `appsscript.json`
4. Services access library functions via namespace

## Implementation Details

### Phase 1: Library Creation

#### Directory Structure
```
apps/
├── common-library/
│   ├── .clasp.json
│   │   {
│   │     "scriptId": "1XXX...library",
│   │     "rootDir": "./src"
│   │   }
│   ├── src/
│   │   ├── appsscript.json
│   │   ├── Core.js           # Entry point
│   │   ├── Utils.js          # Utility functions
│   │   ├── ErrorHandler.js   # Error management
│   │   ├── Logger.js         # Logging service
│   │   ├── Validator.js      # Input validation
│   │   └── DataProcessor.js  # Batch operations
│   └── README.md
```

#### Core Library Module
```javascript
// apps/common-library/src/Core.js

/**
 * Common Library Entry Point
 * All exported functions must be added to the global object
 */

// Import all modules (Google Apps Script doesn't support ES6 modules)
// Files are concatenated in alphabetical order

/**
 * Public API exposed to consuming services
 * This object becomes available as CommonLib in services
 */
function getLibrary() {
  return {
    // Utils
    formatDate: formatDate,
    parseDate: parseDate,
    sanitizeFileName: sanitizeFileName,
    validateEmail: validateEmail,
    validateUrl: validateUrl,
    
    // Error Handling
    handleError: handleError,
    withErrorHandling: withErrorHandling,
    
    // Logging
    log: log,
    logError: logError,
    logDebug: logDebug,
    
    // Data Processing
    processBatches: processBatches,
    checkTimeout: checkTimeout,
    
    // Validation
    sanitizeInput: sanitizeInput,
    validateRequired: validateRequired
  };
}

// Required for library usage
var CommonLib = getLibrary();
```

#### Utility Functions
```javascript
// apps/common-library/src/Utils.js

/**
 * Format date consistently across all services
 * @param {Date} date - Date to format
 * @param {string} format - Format string or preset
 * @return {string} Formatted date
 */
function formatDate(date, format = 'yyyy-MM-dd') {
  if (!date) date = new Date();
  
  const formats = {
    'iso': 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'',
    'date': 'yyyy-MM-dd',
    'datetime': 'yyyy-MM-dd HH:mm:ss',
    'filename': 'yyyy-MM-dd_HH-mm-ss'
  };
  
  const pattern = formats[format] || format;
  return Utilities.formatDate(date, Session.getScriptTimeZone(), pattern);
}

/**
 * Sanitize filename for Google Drive
 * @param {string} filename - Raw filename
 * @return {string} Safe filename
 */
function sanitizeFileName(filename) {
  return filename
    .replace(/[\/\\:*?"<>|]/g, '_')  // Invalid characters
    .replace(/\s+/g, '_')             // Multiple spaces
    .replace(/^\.+/, '')              // Leading dots
    .substring(0, 200);               // Length limit
}
```

#### Error Handler
```javascript
// apps/common-library/src/ErrorHandler.js

/**
 * Centralized error handling with context
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 * @return {Object} Error details
 */
function handleError(error, context = {}) {
  const errorInfo = {
    message: error.toString(),
    stack: error.stack || 'No stack trace',
    context: context,
    timestamp: new Date().toISOString(),
    service: context.service || 'Unknown'
  };
  
  // Log to console (appears in Stackdriver)
  console.error('ERROR:', errorInfo);
  
  // Store for debugging (last 10 errors)
  const props = PropertiesService.getScriptProperties();
  let errors = JSON.parse(props.getProperty('recent_errors') || '[]');
  errors.unshift(errorInfo);
  errors = errors.slice(0, 10);
  props.setProperty('recent_errors', JSON.stringify(errors));
  
  return errorInfo;
}

/**
 * Wrap function with error handling
 * @param {Function} func - Function to wrap
 * @param {Object} context - Context for error reporting
 * @return {Function} Wrapped function
 */
function withErrorHandling(func, context = {}) {
  return function(...args) {
    try {
      return func.apply(this, args);
    } catch (error) {
      const errorInfo = handleError(error, {
        ...context,
        function: func.name,
        arguments: args
      });
      
      // Re-throw with additional context
      throw new Error(`${errorInfo.message} [${context.service}]`);
    }
  };
}
```

#### Data Processor
```javascript
// apps/common-library/src/DataProcessor.js

/**
 * Process large datasets with timeout protection
 * @param {Array} items - Items to process
 * @param {number} batchSize - Items per batch
 * @param {Function} processor - Function to process batch
 * @param {number} maxMinutes - Maximum execution time
 * @return {Object} Results and status
 */
function processBatches(items, batchSize, processor, maxMinutes = 5) {
  const startTime = new Date().getTime();
  const maxTime = maxMinutes * 60 * 1000;
  const results = [];
  let lastProcessedIndex = 0;
  
  for (let i = 0; i < items.length; i += batchSize) {
    // Check timeout
    if (checkTimeout(startTime, maxTime)) {
      return {
        complete: false,
        results: results,
        lastIndex: i,
        remaining: items.length - i,
        message: 'Timeout approaching, saved progress'
      };
    }
    
    // Process batch
    const batch = items.slice(i, Math.min(i + batchSize, items.length));
    try {
      const batchResults = processor(batch);
      results.push(...(Array.isArray(batchResults) ? batchResults : [batchResults]));
      lastProcessedIndex = i + batch.length;
    } catch (error) {
      return {
        complete: false,
        results: results,
        lastIndex: i,
        error: error.toString(),
        message: 'Error during batch processing'
      };
    }
  }
  
  return {
    complete: true,
    results: results,
    processed: items.length,
    message: 'All items processed successfully'
  };
}

/**
 * Check if timeout is approaching
 * @param {number} startTime - Start timestamp
 * @param {number} maxTime - Maximum time in ms
 * @param {number} buffer - Safety buffer in ms
 * @return {boolean} True if timeout approaching
 */
function checkTimeout(startTime, maxTime, buffer = 30000) {
  const elapsed = new Date().getTime() - startTime;
  return elapsed > (maxTime - buffer);
}
```

### Phase 2: Service Integration

#### Adding Library Dependency
```json
// apps/gmail/src/appsscript.json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "CommonLib",
        "libraryId": "1XXX...library_script_id",
        "version": "1",
        "developmentMode": true
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

#### Using Library Functions
```javascript
// apps/gmail/src/gmail-analysis-24months.gs

// BEFORE: Duplicate implementation
function createEmailCountSpreadsheet() {
  var cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 180);
  
  // Manual date formatting
  var dateStr = Utilities.formatDate(cutoffDate, 'GMT', 'yyyy-MM-dd');
  
  // No timeout protection
  var threads = GmailApp.search('after:' + dateStr);
  threads.forEach(function(thread) {
    // Process all at once
  });
}

// AFTER: Using library
function createEmailCountSpreadsheet() {
  const context = { service: 'gmail', function: 'createEmailCountSpreadsheet' };
  
  try {
    var cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 180);
    
    // Use library formatting
    const dateStr = CommonLib.formatDate(cutoffDate, 'date');
    
    // Use library batch processing
    const threads = GmailApp.search('after:' + dateStr);
    const result = CommonLib.processBatches(
      threads,
      50,  // Process 50 threads at a time
      processEmailBatch,
      5    // 5 minute timeout
    );
    
    if (!result.complete) {
      CommonLib.log('Processing incomplete', result);
      // Save state for continuation
      saveProcessingState(result.lastIndex);
    }
    
  } catch (error) {
    CommonLib.handleError(error, context);
    throw error;
  }
}
```

### Phase 3: Deployment Pipeline

#### Updated Cloud Build Configuration
```yaml
# cloudbuild.yaml
steps:
  # Step 1: Check if library changed
  - name: 'gcr.io/cloud-builders/git'
    id: 'check-library-changes'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        if git diff --name-only HEAD HEAD~1 | grep -q "apps/common-library"; then
          echo "true" > /workspace/library-changed.txt
        else
          echo "false" > /workspace/library-changed.txt
        fi

  # Step 2: Deploy library if changed
  - name: 'node:18'
    id: 'deploy-library'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        if [ "$(cat /workspace/library-changed.txt)" = "true" ]; then
          echo "📚 Deploying Common Library..."
          cd apps/common-library
          
          # Push library code
          npx @google/clasp push --force
          
          # Create new version
          VERSION_DESC="Build ${BUILD_ID} - ${SHORT_SHA}"
          npx @google/clasp version "$VERSION_DESC"
          
          # Get version number
          VERSION=$(npx @google/clasp versions | tail -1 | awk '{print $1}')
          echo $VERSION > /workspace/library-version.txt
          
          echo "✅ Library deployed as version $VERSION"
        fi

  # Step 3: Update service dependencies if library changed
  - name: 'node:18'
    id: 'update-dependencies'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        if [ "$(cat /workspace/library-changed.txt)" = "true" ]; then
          VERSION=$(cat /workspace/library-version.txt)
          echo "📝 Updating services to use library version $VERSION..."
          
          # Update all service manifests
          for manifest in apps/*/src/appsscript.json; do
            if [ "$manifest" != "apps/common-library/src/appsscript.json" ]; then
              # Update library version
              jq ".dependencies.libraries[0].version = \"$VERSION\" | 
                  .dependencies.libraries[0].developmentMode = false" \
                  "$manifest" > "$manifest.tmp"
              mv "$manifest.tmp" "$manifest"
            fi
          done
        fi

  # Step 4: Deploy services
  - name: 'node:18'
    id: 'deploy-services'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        # ... existing service deployment logic
```

#### Local Development Script
```bash
#!/bin/bash
# automation/deploy-with-library.sh

set -e

echo "🚀 Deployment with Library Support"
echo "================================="

# Check for library changes
LIBRARY_CHANGED=$(git status --porcelain apps/common-library | wc -l)

if [ $LIBRARY_CHANGED -gt 0 ]; then
    echo "📚 Library has changes, deploying..."
    
    cd apps/common-library
    clasp push --force
    
    # For development, use development mode
    echo "📝 Library deployed in development mode"
    echo "   Services will use latest library code"
    cd ../..
else
    echo "✅ No library changes detected"
fi

# Deploy services
echo "📦 Deploying services..."
for service in apps/*/; do
    if [ -f "$service/.clasp.json" ] && [ "$service" != "apps/common-library/" ]; then
        echo "   Deploying $(basename $service)..."
        (cd "$service" && clasp push --force)
    fi
done

echo "✅ Deployment complete!"
```

## Migration Strategy

### Service Priority
1. **Gmail** (47 scripts) - Highest duplication, maximum impact
2. **Drive** (30 scripts) - Complex functionality, good test case
3. **Calendar, Sheets, Tasks** - Moderate complexity
4. **Others** - Simple services, straightforward migration

### Incremental Migration Pattern
```javascript
// Transition approach for each function
function formatDate(date) {
  // During migration: try library, fallback to local
  if (typeof CommonLib !== 'undefined') {
    return CommonLib.formatDate(date);
  } else {
    // Fallback to local implementation
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
}
```

## Rollback Plan

### Library Rollback
```bash
#!/bin/bash
# rollback-library.sh

PREVIOUS_VERSION=$1

# Step 1: Revert all services to previous library version
for manifest in apps/*/src/appsscript.json; do
    if grep -q "libraries" "$manifest"; then
        jq ".dependencies.libraries[0].version = \"$PREVIOUS_VERSION\"" \
           "$manifest" > "$manifest.tmp"
        mv "$manifest.tmp" "$manifest"
    fi
done

# Step 2: Deploy all services with old library version
for service in apps/*/; do
    if [ -f "$service/.clasp.json" ]; then
        (cd "$service" && clasp push --force)
    fi
done

echo "✅ Rolled back to library version $PREVIOUS_VERSION"
```

## Testing Strategy

### Unit Tests for Library
```javascript
// apps/common-library/tests/TestRunner.gs

function runAllTests() {
  const tests = [
    testFormatDate,
    testSanitizeFileName,
    testProcessBatches,
    testErrorHandler
  ];
  
  const results = tests.map(runTest);
  const passed = results.filter(r => r.passed).length;
  
  Logger.log(`Tests: ${passed}/${tests.length} passed`);
  return results;
}

function testFormatDate() {
  const date = new Date('2025-08-15T10:30:00Z');
  const tests = [
    { format: 'date', expected: '2025-08-15' },
    { format: 'filename', expected: '2025-08-15_10-30-00' }
  ];
  
  for (const test of tests) {
    const result = CommonLib.formatDate(date, test.format);
    if (result !== test.expected) {
      throw new Error(`Expected ${test.expected}, got ${result}`);
    }
  }
}
```

### Integration Tests
```javascript
// apps/gmail/tests/LibraryIntegration.gs

function testLibraryIntegration() {
  // Verify library is accessible
  if (typeof CommonLib === 'undefined') {
    throw new Error('Library not loaded');
  }
  
  // Test library functions
  const date = CommonLib.formatDate(new Date());
  const valid = CommonLib.validateEmail('test@example.com');
  
  // Test error handling
  try {
    CommonLib.withErrorHandling(() => {
      throw new Error('Test error');
    }, { service: 'gmail-test' })();
  } catch (e) {
    // Should include context
    if (!e.toString().includes('gmail-test')) {
      throw new Error('Context not included in error');
    }
  }
  
  Logger.log('✅ Library integration tests passed');
}
```

## Performance Considerations

### Library Call Overhead
- Each library function call has ~1-2ms overhead
- Batch operations to minimize cross-context calls
- Cache library results when possible

### Optimization Patterns
```javascript
// BAD: Multiple library calls in loop
for (let email of emails) {
  const formatted = CommonLib.formatDate(email.date);  // Many calls
}

// GOOD: Batch processing
const dates = emails.map(e => e.date);
const formatted = CommonLib.batchFormat(dates);  // Single call
```

## Documentation Requirements

### Library Documentation
- JSDoc comments for all public functions
- Usage examples in README
- Migration guide for each service
- Performance best practices

### Service Documentation Updates
- Note library dependency in README
- Document any service-specific overrides
- Include rollback procedures

---

**Document Version**: 1.0
**Last Updated**: August 2025
**Next Review**: After Phase 1 completion