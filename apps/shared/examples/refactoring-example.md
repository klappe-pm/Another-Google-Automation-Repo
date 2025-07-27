# Refactoring Example: Using Shared Utilities

This example shows how to refactor existing scripts to use the shared utility library.

## Before: Original Code (from export-gmail-to-pdf.gs)

```javascript
// Original implementation with duplicate functions
function extractEmail(fromString) {
  const emailMatch = fromString.match(/<(.+?)>/);
  if (emailMatch) return emailMatch[1];
  const emailOnlyMatch = fromString.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  return emailOnlyMatch ? emailOnlyMatch[0] : fromString;
}

function getOrCreateFolder(folderName, parentFolder) {
  const folders = (parentFolder || DriveApp).getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : safeOperation(() => (parentFolder || DriveApp).createFolder(folderName));
}

function safeOperation(operation, fallback = null, retries = 3) {
  let delay = 500;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return operation();
    } catch (error) {
      Logger.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt === retries - 1) return fallback;
      Utilities.sleep(delay);
      delay *= 2;
    }
  }
}
```

## After: Refactored Code Using Shared Utilities

```javascript
// Import shared utilities (copy these functions at the top of your script)
// In Google Apps Script, you would copy the utility files or use Libraries

// Your main script now uses the shared utilities
function processEmail(message) {
  // Use email-utils functions
  const senderInfo = formatSenderInfo(message.getFrom());
  const emailData = parseEmailData(message);
  
  // Use drive-utils functions
  const folder = getOrCreateFolder('Processed Emails');
  const file = safeCreateFile(folder, pdfBlob);
  
  // Use error-utils for better error handling
  return safeOperation(() => {
    // Your processing logic here
    return processEmailData(emailData);
  }, null, 3);
}

function setupEmailExportSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = createOrGetSheet(spreadsheet, 'Email Exports');
  
  // Use sheet-utils to setup the sheet
  const headers = ['Date', 'From', 'Subject', 'Status'];
  setupSheet(sheet, headers, {
    freezeRows: 1,
    headerBackground: '#4285F4'
  });
  
  return sheet;
}
```

## Step-by-Step Refactoring Guide

### 1. Identify Duplicate Functions
Search your script for functions that exist in the shared utilities:
- `extractEmail` → Use from `email-utils.gs`
- `getOrCreateFolder` → Use from `drive-utils.gs`
- `safeOperation` → Use from `error-utils.gs`
- `setupSheet` → Use from `sheet-utils.gs`

### 2. Copy Required Utility Modules
Copy only the utility modules you need to your script:
```javascript
// At the top of your script, copy the needed utilities
// Copy from: apps/shared/utils/email-utils.gs
// Copy from: apps/shared/utils/drive-utils.gs
// etc.
```

### 3. Remove Duplicate Implementations
Delete your local implementations of these functions.

### 4. Update Function Calls
Most utility functions have the same signature, so minimal changes needed:
```javascript
// Before
const email = extractEmail(fromString);

// After (no change needed!)
const email = extractEmail(fromString);
```

### 5. Take Advantage of New Features
The shared utilities often have more features:
```javascript
// New capabilities available
const senderInfo = formatSenderInfo(from); // Returns {email, name, domain, display}
const emailData = parseEmailData(message); // Comprehensive email parsing

// Better error handling
const result = retryWithBackoff(() => {
  return riskyOperation();
}, {
  maxAttempts: 5,
  initialDelay: 1000,
  onRetry: (error, attempt) => {
    Logger.log(`Retry attempt ${attempt}: ${error.message}`);
  }
});
```

## Benefits After Refactoring

1. **Less Code**: Removed ~100 lines of duplicate functions
2. **More Features**: Access to enhanced utility functions
3. **Better Error Handling**: Consistent retry logic and error reporting
4. **Easier Maintenance**: Bug fixes in utilities benefit all scripts
5. **Improved Readability**: Focus on business logic, not utility functions