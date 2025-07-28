# Google Workspace Services

This directory contains service wrapper classes that extend the BaseService class to provide Google Workspace-specific functionality with built-in error handling, logging, metrics collection, rate limiting, and batch processing capabilities.

## Service Classes

### GmailService
Extends BaseService to provide Gmail-specific operations with batch processing and rate limiting.

#### Features
- Gmail label statistics
- Email export and parsing
- Batch email processing
- Email utilities (sender parsing, recipient handling)
- Rate limiting (100 requests/minute)

#### Usage
```javascript
var gmailService = WorkspaceAutomation.Services.getGmailService();

// Get label statistics
var labelStats = gmailService.getLabelStats();

// Export emails
var emails = gmailService.exportEmails('is:unread', 50);

// Mark emails as read in batch
gmailService.markEmailsRead(threadIds);
```

### DriveService
Extends BaseService to provide Google Drive operations with batch processing and rate limiting.

#### Features
- File listing and searching
- Batch file operations
- Rate limiting (100 requests/minute)

#### Usage
```javascript
var driveService = WorkspaceAutomation.Services.getDriveService();

// List files in a folder
var files = driveService.listFiles(folderId);

// Search for files
var searchResults = driveService.searchFiles('pdf');
```

### SheetsService
Extends BaseService to provide Google Sheets operations with comprehensive formatting and batch processing.

#### Features
- Sheet setup with headers and formatting
- Data insertion with options
- Sheet clearing and management
- Auto-resize columns
- Batch processing (1000 rows default)
- Rate limiting (100 requests/minute)

#### Usage
```javascript
var sheetsService = WorkspaceAutomation.Services.getSheetsService();

// Setup a sheet with headers
sheetsService.setupSheet(spreadsheetId, 'Data', ['Col1', 'Col2', 'Col3']);

// Insert data
sheetsService.insertDataIntoSheet(spreadsheetId, 'Data', data, headers, {
  clearExisting: true,
  autoResize: true
});

// Clear sheet while preserving headers
sheetsService.clearSheet(spreadsheetId, 'Data', true);
```

### DocsService
Extends BaseService to provide Google Docs operations with batch processing and rate limiting.

#### Features
- Document content extraction
- Markdown export (basic)
- Document metadata
- Text replacement
- Document formatting
- Rate limiting (100 requests/minute)

#### Usage
```javascript
var docsService = WorkspaceAutomation.Services.getDocsService();

// Get document content
var content = docsService.getDocContent(docId);

// Export to markdown
var markdown = docsService.exportToMarkdown(docId);

// Get document metadata
var metadata = docsService.getDocMetadata(docId);

// Replace text
docsService.replaceText(docId, 'oldText', 'newText');
```

## Service Factory

The ServiceFactory provides convenient methods for creating service instances:

```javascript
// Create individual services
var gmailService = WorkspaceAutomation.Services.ServiceFactory.createGmailService();
var driveService = WorkspaceAutomation.Services.ServiceFactory.createDriveService();

// Create all services at once
var services = WorkspaceAutomation.Services.ServiceFactory.createAllServices();
```

## Rate Limiting

All services include built-in rate limiting to prevent quota exhaustion:
- Default: 100 requests per minute
- Automatic waiting when limits are reached
- Configurable per service instance

## Batch Processing

Services support batch processing for efficiency:
- GmailService: 100 items per batch (default)
- DriveService: 100 items per batch (default)
- SheetsService: 1000 rows per batch (default)
- DocsService: 50 documents per batch (default)

## Error Handling

All services inherit comprehensive error handling from BaseService:
- Automatic error logging
- Metrics collection
- Context-aware error messages
- Graceful degradation

## Migration from Consolidated Scripts

The new service classes are designed to replace functionality from consolidated .gs files:

### Before (Consolidated Script)
```javascript
function exportGmailLabels() {
  var labels = GmailApp.getUserLabels();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Gmail Labels") || spreadsheet.insertSheet("Gmail Labels");

  sheet.clear();
  sheet.appendRow(["Labels", "Total Threads", "Total Emails"]);

  labels.forEach(function(label) {
    var threads = label.getThreads();
    var totalEmails = 0;
    threads.forEach(function(thread) {
      totalEmails += thread.getMessages().length;
    });
    sheet.appendRow([label.getName(), threads.length, totalEmails]);
  });
}
```

### After (Using Services)
```javascript
function exportGmailLabels() {
  var gmailService = WorkspaceAutomation.Services.getGmailService();
  var sheetsService = WorkspaceAutomation.Services.getSheetsService();

  var spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  var headers = ["Label Name", "Thread Count", "Email Count"];

  sheetsService.setupSheet(spreadsheetId, "Gmail Labels", headers);

  var labelStats = gmailService.getLabelStats();
  var sheetData = labelStats.map(function(stat) {
    return [stat.name, stat.threadCount, stat.emailCount];
  });

  sheetsService.insertDataIntoSheet(spreadsheetId, "Gmail Labels", sheetData, headers, {
    clearExisting: true,
    autoResize: true
  });
}
```

## Benefits of the New Approach

1. **Error Handling**: Automatic error catching, logging, and reporting
2. **Rate Limiting**: Built-in protection against quota exhaustion
3. **Batch Processing**: Efficient handling of large datasets
4. **Logging**: Comprehensive logging and metrics collection
5. **Reusability**: Consistent API across all Google Workspace services
6. **Maintainability**: Better code organization and separation of concerns
7. **Testing**: Easier to unit test individual service operations
8. **Monitoring**: Built-in health checks and service monitoring

## File Loading Order

When using these services, ensure files are loaded in the correct order:

1. `src/core/index.js` (BaseService)
2. `src/services/GmailService.js`
3. `src/services/DriveService.js`
4. `src/services/SheetsService.js`
5. `src/services/DocsService.js`
6. `src/services/index.js` (ServiceFactory)

## Examples

See `src/services/examples/ServiceUsageExample.js` for comprehensive usage examples and migration patterns.

## Future Enhancements

Planned additions to the service layer:
- CalendarService
- SlidesService
- TasksService
- ChatService
- PhotosService
- Enhanced error recovery
- Advanced batch optimization
- Service health monitoring dashboard
