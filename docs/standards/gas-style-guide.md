# Google Apps Script Style Guide

## Table of Contents
1. [Script Structure](#script-structure)
2. [Documentation Standards](#documentation-standards)
3. [Code Formatting](#code-formatting)
4. [Naming Conventions](#naming-conventions)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

## Script Structure

Every Google Apps Script file must follow this structure:

```javascript
/**
 * Title: [Descriptive Script Title]
 * Service: [Primary Google Service]
 * Purpose: [One-line description]
 * Created: [YYYY-MM-DD]
 * Updated: [YYYY-MM-DD]
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: [Detailed purpose]
- Description: [Complete functional description]
- Problem Solved: [Business problem addressed]
- Successful Execution: [Success criteria]
- Key Features:
  - [Feature 1]
  - [Feature 2]
  - [Feature 3]
- Services Used: [Google Services/APIs]
- Setup:
  1. [Complete setup steps]
  2. [Prerequisites]
  3. [Configuration]
  4. [Permissions]
  5. [Testing]
*/

// ============================================
// CONSTANTS AND CONFIGURATION
// ============================================
const CONFIG = {
  FOLDER_NAME: 'Output Folder',
  BATCH_SIZE: 100,
  // Add all configuration here
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Main entry point for the script
 * Describes what the function does in clear terms
 */
function main() {
  // Implementation
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper function description
 * @param {string} param - Parameter description
 * @return {string} Return value description
 */
function helperFunction(param) {
  // Implementation
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Handles errors and logs them appropriately
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred
 */
function handleError(error, context) {
  // Implementation
}
```

## Documentation Standards

### 1. Script Header (Required)
Every script MUST include a complete header with:
- **Title**: Clear, descriptive name
- **Service**: Primary Google service (Gmail, Drive, Sheets, etc.)
- **Purpose**: One-line description
- **Created/Updated**: Dates in YYYY-MM-DD format
- **Author/Contact**: Maintainer information
- **License**: MIT or appropriate license

### 2. Script Summary (Required)
Must include:
- **Purpose**: Why this script exists
- **Description**: What it does in detail
- **Problem Solved**: Business problem addressed
- **Successful Execution**: How to verify success
- **Key Features**: Bullet list of capabilities
- **Services Used**: All Google APIs/services
- **Setup**: Complete step-by-step instructions

### 3. Function Documentation (Required)
Every function must have:
```javascript
/**
 * Clear description of what the function does
 * 
 * @param {Type} paramName - What this parameter is for
 * @return {Type} What the function returns
 * @throws {Error} When this error might occur
 * 
 * Example:
 *   const result = functionName('value');
 *   console.log(result); // Expected output
 */
```

### 4. Inline Comments
Use inline comments for:
- Complex logic explanation
- API call purposes
- Error handling reasoning
- Performance considerations
- Debugging hints

## Code Formatting

### 1. Indentation
- Use 2 spaces (no tabs)
- Consistent indentation levels

### 2. Brackets and Spacing
```javascript
// Correct
function example() {
  if (condition) {
    // code
  } else {
    // code
  }
}

// Incorrect
function example(){
  if(condition){
    //code
  }
  else{
    //code
  }
}
```

### 3. Line Length
- Maximum 100 characters per line
- Break long statements logically

### 4. Variable Declarations
```javascript
// Use const for constants
const FOLDER_NAME = 'My Folder';

// Use let for variables
let counter = 0;

// Avoid var
var oldStyle = 'avoid'; // Don't use
```

## Naming Conventions

### 1. Constants
- UPPER_SNAKE_CASE
- Example: `MAX_RETRIES`, `DEFAULT_FOLDER`

### 2. Functions
- camelCase
- Verb-noun pattern
- Examples: `getUserData()`, `processEmails()`, `createSpreadsheet()`

### 3. Variables
- camelCase
- Descriptive names
- Examples: `userEmail`, `folderCount`, `isProcessing`

### 4. Configuration Objects
- UPPER_CASE for object name
- camelCase for properties
```javascript
const CONFIG = {
  maxRetries: 3,
  timeoutSeconds: 30
};
```

## Best Practices

### 1. Error Handling
```javascript
function processData() {
  try {
    // Main logic
  } catch (error) {
    console.error('Error in processData:', error);
    throw new Error(`Failed to process data: ${error.message}`);
  }
}
```

### 2. Service Calls
```javascript
// Bad: Multiple service calls
for (let i = 0; i < 100; i++) {
  sheet.getRange(i, 1).setValue(data[i]);
}

// Good: Batch operation
const values = data.map(item => [item]);
sheet.getRange(1, 1, data.length, 1).setValues(values);
```

### 3. Function Size
- Keep functions under 50 lines
- Single responsibility principle
- Extract complex logic to helper functions

### 4. Performance
- Minimize API calls
- Use batch operations
- Cache frequently accessed data
- Clear documentation of performance considerations

## Examples

### Complete Script Example

```javascript
/**
 * Title: Gmail Label Statistics Analyzer
 * Service: Gmail
 * Purpose: Analyze email distribution across Gmail labels
 * Created: 2024-01-15
 * Updated: 2024-01-20
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Provide insights into email organization by analyzing label usage
- Description: Scans all Gmail labels, counts messages, and generates statistics
- Problem Solved: Manual email organization analysis is time-consuming
- Successful Execution: Spreadsheet created with label statistics and charts
- Key Features:
  - Counts emails per label
  - Identifies unused labels
  - Calculates label usage percentages
  - Generates visual charts
- Services Used: Gmail API, Google Sheets API
- Setup:
  1. Enable Gmail API in Google Cloud Console
  2. Create a folder "Gmail Analysis" in Google Drive
  3. Run the script from Apps Script editor
  4. Grant necessary permissions when prompted
  5. Check the output folder for results spreadsheet
*/

// ============================================
// CONSTANTS AND CONFIGURATION
// ============================================
const CONFIG = {
  OUTPUT_FOLDER: 'Gmail Analysis',
  SPREADSHEET_PREFIX: 'Label_Stats_',
  BATCH_SIZE: 100,
  MAX_LABELS: 500
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Main entry point - analyzes Gmail labels and creates report
 * Orchestrates the entire analysis process
 */
function analyzeGmailLabels() {
  try {
    console.log('Starting Gmail label analysis...');
    
    const labels = fetchAllLabels();
    const statistics = calculateStatistics(labels);
    const spreadsheet = createReport(statistics);
    
    console.log(`Analysis complete! Report: ${spreadsheet.getUrl()}`);
    return spreadsheet.getUrl();
    
  } catch (error) {
    handleError(error, 'analyzeGmailLabels');
  }
}

/**
 * Fetches all Gmail labels with message counts
 * 
 * @return {Array} Array of label objects with counts
 * 
 * Example:
 *   const labels = fetchAllLabels();
 *   console.log(labels[0]); // {name: 'INBOX', count: 150}
 */
function fetchAllLabels() {
  const labels = [];
  const gmailLabels = Gmail.Users.Labels.list('me').labels;
  
  for (const label of gmailLabels) {
    const labelDetail = Gmail.Users.Labels.get('me', label.id);
    labels.push({
      name: label.name,
      id: label.id,
      count: labelDetail.messagesTotal || 0,
      type: label.type
    });
  }
  
  return labels;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculates statistics from label data
 * 
 * @param {Array} labels - Array of label objects
 * @return {Object} Statistics object
 */
function calculateStatistics(labels) {
  const totalMessages = labels.reduce((sum, label) => sum + label.count, 0);
  
  return {
    totalLabels: labels.length,
    totalMessages: totalMessages,
    averagePerLabel: totalMessages / labels.length,
    emptyLabels: labels.filter(l => l.count === 0).length,
    labelDetails: labels
  };
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Centralized error handling with context
 * 
 * @param {Error} error - The error object
 * @param {string} functionName - Where the error occurred
 */
function handleError(error, functionName) {
  console.error(`Error in ${functionName}:`, error);
  
  // Send email notification for critical errors
  if (error.message.includes('quota')) {
    GmailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      'Gmail Analysis Script Error',
      `Quota exceeded in ${functionName}: ${error.message}`
    );
  }
  
  throw new Error(`${functionName} failed: ${error.message}`);
}
```

## Validation Checklist

Before committing any Google Apps Script:

- [ ] Script header is complete with all required fields
- [ ] Script summary includes setup instructions
- [ ] All functions have documentation
- [ ] Code follows formatting standards
- [ ] Error handling is implemented
- [ ] Performance considerations are documented
- [ ] Setup instructions are tested and complete
- [ ] Code is readable and self-explanatory

## Tools and Automation

### Linting
Use the provided script validator:
```bash
node automation/dev-tools/script-validator.js apps/*/src/*.gs
```

### Formatting
Apply automatic formatting:
```bash
node automation/dev-tools/gas-formatter.js [script-path]
```

### Documentation Check
Validate documentation completeness:
```bash
node automation/dev-tools/doc-validator.js [script-path]
```

## Version History
- 2024-01-26: Initial style guide creation
- 2024-01-26: Added comprehensive documentation standards
- 2024-01-26: Included complete examples and validation checklist