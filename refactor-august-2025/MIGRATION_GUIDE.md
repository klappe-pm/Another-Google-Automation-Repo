# Migration Guide - Service to Library Architecture

## Overview

This guide provides step-by-step instructions for migrating each service from isolated scripts to the shared library architecture.

## Pre-Migration Checklist

Before migrating any service:
- [ ] Common Library deployed and versioned
- [ ] Library Script ID documented
- [ ] Local development environment ready
- [ ] Backup of current service code
- [ ] Test data prepared

## Generic Migration Process

### Step 1: Add Library Dependency

Edit `apps/[service]/src/appsscript.json`:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "CommonLib",
        "libraryId": "PASTE_LIBRARY_SCRIPT_ID_HERE",
        "version": "1",
        "developmentMode": true
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

### Step 2: Test Library Access

Create `apps/[service]/src/test-library.gs`:

```javascript
function testLibraryAccess() {
  try {
    // Test basic access
    if (typeof CommonLib === 'undefined') {
      throw new Error('Library not loaded');
    }
    
    // Test a simple function
    const date = CommonLib.formatDate(new Date());
    Logger.log('Formatted date: ' + date);
    
    // Test error handling
    CommonLib.log('Library test successful', { service: 'test' });
    
    return 'SUCCESS: Library accessible';
  } catch (error) {
    return 'FAILED: ' + error.toString();
  }
}
```

Deploy and run test:
```bash
cd apps/[service]
clasp push
clasp run testLibraryAccess
```

### Step 3: Identify Functions to Replace

Search for common patterns:
```bash
# Find date formatting
grep -n "formatDate\|Utilities.formatDate" src/*.gs

# Find validation functions
grep -n "validateEmail\|@.*\." src/*.gs

# Find error handling
grep -n "try\|catch\|handleError" src/*.gs
```

### Step 4: Incremental Migration

Replace functions one at a time with safety wrapper:

```javascript
// Before
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// After - with fallback
function formatDate(date) {
  try {
    if (typeof CommonLib !== 'undefined') {
      return CommonLib.formatDate(date, 'date');
    }
  } catch (e) {
    Logger.log('Library call failed: ' + e);
  }
  // Fallback to original implementation
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// Final - library only
function formatDate(date) {
  return CommonLib.formatDate(date, 'date');
}
```

## Service-Specific Migration

### Gmail Service Migration

**Complexity**: High (47 scripts)
**Priority**: Highest (most duplication)

#### Phase 1: Utility Functions
Replace in all scripts:
```javascript
// OLD: Multiple date formatting implementations
function getDateString(date) {
  var year = date.getFullYear();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);
  return year + '-' + month + '-' + day;
}

// NEW: Use library
function getDateString(date) {
  return CommonLib.formatDate(date, 'date');
}
```

#### Phase 2: Error Handling
Update all try-catch blocks:
```javascript
// OLD: Inconsistent error handling
try {
  // ... code
} catch (e) {
  Logger.log('Error: ' + e);
}

// NEW: Centralized error handling
try {
  // ... code
} catch (error) {
  CommonLib.handleError(error, {
    service: 'gmail',
    function: 'functionName',
    context: additionalInfo
  });
}
```

#### Phase 3: Batch Processing
Replace loops with batch processing:
```javascript
// OLD: Process all at once
var threads = GmailApp.search(query);
threads.forEach(function(thread) {
  processThread(thread);
});

// NEW: Batch with timeout protection
var threads = GmailApp.search(query);
var result = CommonLib.processBatches(
  threads,
  50,  // batch size
  function(batch) {
    return batch.map(processThread);
  },
  5    // max minutes
);

if (!result.complete) {
  // Handle incomplete processing
  saveState(result.lastIndex);
}
```

#### Gmail-Specific Functions to Migrate

1. **Email Validation**
   - Files: All export scripts
   - Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
   - Replace with: `CommonLib.validateEmail()`

2. **Date Range Queries**
   - Files: Analysis scripts
   - Pattern: `after:` + date formatting
   - Replace with: `CommonLib.buildDateQuery()`

3. **Spreadsheet Creation**
   - Files: Export scripts
   - Pattern: Similar headers and formatting
   - Create: `GmailExportLib.createSpreadsheet()`

### Drive Service Migration

**Complexity**: Medium (30 scripts)
**Priority**: High (complex functionality)

#### Key Patterns to Replace

1. **File Path Construction**
```javascript
// OLD: Manual path building
function getFilePath(file) {
  var path = [];
  var parent = file.getParents();
  while (parent.hasNext()) {
    var folder = parent.next();
    path.unshift(folder.getName());
    parent = folder.getParents();
  }
  return path.join('/');
}

// NEW: Use library
function getFilePath(file) {
  return CommonLib.getFilePath(file);
}
```

2. **Filename Sanitization**
```javascript
// OLD: Various implementations
filename.replace(/[^a-z0-9]/gi, '_');

// NEW: Consistent sanitization
CommonLib.sanitizeFileName(filename);
```

### Calendar Service Migration

**Complexity**: Low (6 scripts)
**Priority**: Medium

#### Focus Areas

1. **Event Date Formatting**
   - Consistent date/time display
   - Timezone handling

2. **Duration Calculations**
   - Event duration in minutes/hours
   - Travel time calculations

### Sheets Service Migration

**Complexity**: Low (10 scripts)
**Priority**: Medium

#### Key Replacements

1. **Data Validation**
2. **CSV Processing**
3. **Batch Updates**

## Testing Protocol

### Unit Testing
For each migrated function:
```javascript
function testMigratedFunction() {
  const testCases = [
    { input: x, expected: y },
    { input: a, expected: b }
  ];
  
  testCases.forEach(test => {
    const result = functionName(test.input);
    if (result !== test.expected) {
      throw new Error(`Failed: ${test.input} -> ${result}`);
    }
  });
}
```

### Integration Testing
```javascript
function integrationTest() {
  // Test complete workflow
  const data = fetchData();
  const processed = processData(data);
  const result = exportData(processed);
  
  // Verify result
  if (!result.success) {
    throw new Error('Integration test failed');
  }
}
```

### Performance Testing
```javascript
function performanceTest() {
  const startTime = new Date().getTime();
  
  // Run operation
  const result = performOperation();
  
  const duration = new Date().getTime() - startTime;
  Logger.log(`Operation took ${duration}ms`);
  
  // Compare with baseline
  const baseline = 5000; // ms
  if (duration > baseline * 1.2) {
    Logger.log('WARNING: Performance degradation detected');
  }
}
```

## Rollback Procedures

### Service-Level Rollback

If a service fails after migration:

1. **Immediate**: Revert to development mode
```json
{
  "libraries": [{
    "developmentMode": true  // Use last known good version
  }]
}
```

2. **Fix**: Update to previous library version
```json
{
  "libraries": [{
    "version": "PREVIOUS_VERSION",
    "developmentMode": false
  }]
}
```

3. **Emergency**: Remove library dependency
```bash
# Restore original functions
git checkout HEAD~1 -- apps/[service]/src/*.gs
clasp push --force
```

## Common Issues & Solutions

### Issue: "CommonLib is not defined"
**Cause**: Library not loaded
**Solution**: 
1. Check library ID in appsscript.json
2. Verify library is published
3. Check permissions

### Issue: Performance degradation
**Cause**: Too many library calls
**Solution**:
1. Batch operations
2. Cache library results
3. Keep critical functions local

### Issue: Timeout errors
**Cause**: Large dataset processing
**Solution**:
1. Use CommonLib.processBatches()
2. Implement checkpointing
3. Reduce batch size

### Issue: Different behavior after migration
**Cause**: Subtle implementation differences
**Solution**:
1. Compare implementations carefully
2. Add compatibility layer
3. Update library to match expected behavior

## Migration Validation

### Per-Service Checklist
- [ ] Library dependency added
- [ ] All common functions replaced
- [ ] Error handling centralized
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Rollback plan tested

### Sign-off Criteria
- No functionality regression
- Performance within 10% of baseline
- All tests passing
- Documentation complete

## Post-Migration

### Cleanup Tasks
1. Remove deprecated functions
2. Delete .backup files
3. Update service README
4. Document any service-specific overrides

### Monitoring
1. Check error logs daily for first week
2. Monitor performance metrics
3. Gather user feedback
4. Track any issues

---

**Document Version**: 1.0
**Last Updated**: August 2025
**For Questions**: Check implementation logs or raise issue