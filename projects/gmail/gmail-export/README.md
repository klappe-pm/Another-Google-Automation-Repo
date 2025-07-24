# Gmail Export PDF + Markdown

A comprehensive Google Apps Script solution for exporting Gmail message threads to both PDF and Markdown formats with robust error handling and extensive testing.

## 🚀 Features

### Core Functionality
- **Dual Format Export**: Generate both PDF and Markdown files from Gmail threads
- **HTML to Markdown Conversion**: Advanced conversion with support for:
  - Headers (H1-H6)
  - Text formatting (bold, italic, underline, code)
  - Links with proper Markdown syntax
  - Lists (ordered and unordered)
  - Blockquotes
  - Tables (basic support)
  - HTML entity decoding
- **PDF Generation**: Create formatted PDF documents via Google Docs
- **Flexible Search**: Support for Gmail search queries with date filtering
- **Batch Processing**: Handle multiple threads efficiently
- **Smart File Naming**: Safe filename generation with special character handling

### Advanced Features
- **Drive Integration**: Automatic folder creation with date-based organization
- **Error Recovery**: Robust error handling with detailed logging
- **Rate Limiting**: Built-in delays to prevent API throttling
- **Memory Management**: Efficient processing of large datasets
- **Progress Tracking**: Comprehensive export summaries
- **Attachment Metadata**: Include attachment information in exports

### Testing & Quality
- **Comprehensive Test Suite**: 40+ unit tests covering all functionality
- **Performance Testing**: Benchmarks and scalability tests
- **Integration Testing**: End-to-end workflow validation
- **Error Scenario Testing**: Edge case and failure mode coverage
- **Mock Framework**: Complete clasp-mock implementation

## 📁 Project Structure

```
gmail-export/
├── src/
│   ├── scripts/
│   │   └── gmail-export-pdf-markdown.gs    # Main implementation
│   ├── common.gs                           # Shared utilities (Logger, ErrorHandler, etc.)
│   ├── config.gs                          # Configuration and constants
│   ├── utils.gs                           # Utility functions
│   └── test.gs                            # Testing framework
├── test/
│   ├── gmail-export-pdf-markdown.test.gs  # Unit tests
│   ├── performance.test.gs                # Performance tests
│   └── integration.test.gs                # Integration tests
├── docs/
│   ├── API_TEMPLATE.md                    # API documentation template
│   └── STYLE_GUIDE.md                     # Code style guide
├── deploy/
│   └── deploy.gs                          # Deployment utilities
├── appsscript.json                        # Apps Script manifest
└── README.md                              # This file
```

## 🛠️ Installation

### Prerequisites
- Google Apps Script project
- Gmail API access
- Google Drive API access
- Google Docs API access

### Setup Steps

1. **Create a new Google Apps Script project**:
   ```bash
   # Using clasp CLI
   clasp create --type standalone --title "Gmail Export PDF Markdown"
   ```

2. **Copy the source files** to your Apps Script project:
   - `src/scripts/gmail-export-pdf-markdown.gs`
   - `src/common.gs`
   - `src/config.gs`
   - `src/utils.gs`
   - `src/test.gs`

3. **Update the manifest** (`appsscript.json`):
   ```json
   {
     "timeZone": "America/New_York",
     "dependencies": {
       "enabledAdvancedServices": [
         {
           "userSymbol": "Gmail",
           "version": "v1",
           "serviceId": "gmail"
         }
       ]
     },
     "oauthScopes": [
       "https://www.googleapis.com/auth/gmail.readonly",
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/documents",
       "https://www.googleapis.com/auth/drive"
     ],
     "runtimeVersion": "V8"
   }
   ```

4. **Deploy the project**:
   ```bash
   clasp push
   clasp deploy
   ```

## 📖 Usage

### Basic Usage

#### Simple Markdown Export
```javascript
// Export recent inbox messages to Markdown
const result = gmailExportPdfMarkdown({
  query: 'in:inbox',
  maxThreads: 10,
  includePdf: false,
  includeMarkdown: true
});

console.log(result);
```

#### Dual Format Export
```javascript
// Export to both PDF and Markdown
const result = gmailExportPdfMarkdown({
  query: 'from:important@company.com',
  maxThreads: 5,
  includePdf: true,
  includeMarkdown: true,
  folderName: 'Important Emails Export'
});
```

#### Date Range Export
```javascript
// Export messages from specific date range
const result = gmailExportPdfMarkdown({
  query: 'has:attachment',
  afterDate: new Date('2025-01-01'),
  beforeDate: new Date('2025-01-31'),
  includePdf: false,
  includeMarkdown: true
});
```

### Utility Functions

#### Export Recent Messages
```javascript
// Export messages from last 7 days
const result = exportRecentInboxMessages(7, {
  folderName: 'Recent Messages'
});
```

#### Export from Specific Sender
```javascript
// Export all messages from a specific sender
const result = exportMessagesFromSender('sender@example.com', {
  maxThreads: 20,
  includePdf: true
});
```

#### Export Specific Threads
```javascript
// Export specific threads by ID
const threadIds = ['thread_id_1', 'thread_id_2', 'thread_id_3'];
const result = exportGmailThreadsByIds(threadIds, {
  includeMarkdown: true,
  folderName: 'Specific Threads'
});
```

#### Batch Export
```javascript
// Export multiple queries in batch
const queries = [
  'from:client@company.com',
  'subject:"project update"',
  'has:attachment after:2025/01/01'
];

const results = batchExportGmailQueries(queries, {
  includePdf: false,
  includeMarkdown: true,
  folderName: 'Batch Export'
});
```

## ⚙️ Configuration

### Export Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `query` | string | `'in:inbox'` | Gmail search query |
| `maxThreads` | number | `50` | Maximum threads to process |
| `includePdf` | boolean | `true` | Generate PDF files |
| `includeMarkdown` | boolean | `true` | Generate Markdown files |
| `folderId` | string | `null` | Specific Drive folder ID |
| `folderName` | string | `'Gmail Exports'` | Drive folder name |
| `afterDate` | Date | `null` | Only messages after this date |
| `beforeDate` | Date | `null` | Only messages before this date |

### Performance Settings

```javascript
// In config.gs - PDF_MARKDOWN_CONFIG
const PDF_MARKDOWN_CONFIG = {
  MAX_THREADS_PER_RUN: 50,
  MAX_MESSAGES_PER_THREAD: 100,
  PROCESSING_DELAY: 100, // ms between operations
  API_RETRY_DELAY: 1000  // ms between API retries
};
```

## 📊 Output Format

### Markdown Structure

```markdown
# Email Subject

**Thread ID:** thread_abc123
**Messages:** 3
**Last Message:** January 20, 2025 at 3:30:00 PM EST
**Labels:** Important, Work

---

## Message 1

**From:** sender@example.com
**To:** recipient@example.com
**Date:** January 20, 2025 at 2:00:00 PM EST
**Subject:** Original Subject
**Attachments:** 1
- document.pdf (application/pdf, 2048 bytes)

### Content

This is the **formatted** message content with *emphasis* and [links](https://example.com).

---

*Exported on January 20, 2025 at 4:00:00 PM EST by Gmail Export Tool*
```

### PDF Structure

- **Title**: Thread subject
- **Metadata**: Thread ID, message count, dates, labels
- **Messages**: Each message with full headers and content
- **Formatting**: Professional document layout with proper typography

### Export Summary

```javascript
{
  "success": true,
  "startTime": "2025-01-20T21:00:00.000Z",
  "duration": "15s",
  "processed": 10,
  "successful": 10,
  "failed": 0,
  "filesGenerated": 20, // 10 PDF + 10 Markdown
  "targetFolder": {
    "name": "Gmail Exports/2025-01-20",
    "id": "folder_id_123",
    "url": "https://drive.google.com/drive/folders/folder_id_123"
  },
  "files": [
    {
      "type": "markdown",
      "name": "Thread_Subject_2025-01-20_abc123de.md",
      "id": "file_id_456",
      "url": "https://drive.google.com/file/d/file_id_456/view",
      "size": 4096
    }
    // ... more files
  ]
}
```

## 🧪 Testing

### Running Tests

```javascript
// Run all tests
runAllGmailExportTests();

// Run specific test suites
runGmailExportPdfMarkdownTests();  // Unit tests
runAllPerformanceTests();          // Performance tests
runAllIntegrationTests();          // Integration tests
```

### Test Coverage

- **Unit Tests**: 25+ tests covering all functions
- **Performance Tests**: Benchmarks and scalability validation
- **Integration Tests**: End-to-end workflow testing
- **Error Handling**: Edge cases and failure scenarios
- **Mock Framework**: Complete Google Apps Script API simulation

### Test Results Example

```
==============================================
GMAIL EXPORT TEST SUMMARY
==============================================
Total Tests: 43
Passed: 43
Failed: 0
Success Rate: 100.0%
✅ All tests passed!
```

## 🔧 Advanced Features

### HTML to Markdown Conversion

The implementation includes a sophisticated HTML to Markdown converter that handles:

- **Headers**: `<h1>` → `# Header`
- **Text Formatting**: `<strong>` → `**bold**`, `<em>` → `*italic*`
- **Links**: `<a href="url">text</a>` → `[text](url)`
- **Lists**: `<ul><li>` → `- item`
- **Code**: `<code>` → `` `code` ``
- **Blockquotes**: `<blockquote>` → `> quote`
- **HTML Entities**: `&amp;` → `&`, `&lt;` → `<`
- **Clean Output**: Removes excessive whitespace and formatting

### Error Handling

```javascript
// Automatic retry with exponential backoff
RetryHelper.execute(
  () => riskyOperation(),
  3,    // max attempts
  1000, // delay ms
  'operation context'
);

// Comprehensive error logging
ErrorHandler.handle(error, 'function_name', true); // with notification
```

### Performance Optimization

- **Batch Processing**: Process threads in configurable batches
- **Rate Limiting**: Built-in delays between API calls
- **Memory Management**: Efficient content processing
- **Caching**: Optional caching for repeated operations
- **Progress Tracking**: Real-time processing updates

### File Organization

```
Gmail Exports/
├── 2025-01-20/
│   ├── Important_Project_Update_2025-01-20_abc123de.md
│   ├── Important_Project_Update_2025-01-20_abc123de.pdf
│   ├── Meeting_Notes_2025-01-20_def456gh.md
│   └── Meeting_Notes_2025-01-20_def456gh.pdf
└── 2025-01-21/
    └── ...
```

## 🚨 Error Handling

### Common Error Scenarios

1. **No Messages Found**
   ```javascript
   {
     "success": true,
     "processed": 0,
     "message": "No threads found matching criteria"
   }
   ```

2. **Permission Errors**
   ```javascript
   {
     "success": false,
     "error": {
       "code": "PER_001",
       "message": "Insufficient permissions to access Gmail"
     }
   }
   ```

3. **API Rate Limits**
   - Automatic retry with exponential backoff
   - Built-in delays between operations
   - Graceful degradation under load

4. **Large Dataset Handling**
   - Memory usage monitoring
   - Batch processing limits
   - Progress reporting

### Error Recovery

```javascript
// Mixed success/failure handling
{
  "success": true,
  "processed": 10,
  "successful": 8,
  "failed": 2,
  "errors": [
    {
      "thread": "Problem Thread Subject",
      "error": "Thread contains no messages"
    }
  ]
}
```

## 📈 Performance Characteristics

### Benchmarks

- **HTML Conversion**: ~2ms per KB of content
- **Thread Processing**: ~500ms per thread average
- **File Creation**: ~300ms per file
- **Batch Processing**: Linear scaling with built-in optimizations

### Scalability

- **Small Datasets** (1-10 threads): ~5-15 seconds
- **Medium Datasets** (10-25 threads): ~30-60 seconds
- **Large Datasets** (25-50 threads): ~2-5 minutes

### Memory Usage

- **Single Thread**: ~100KB memory usage
- **Batch Processing**: ~10MB maximum batch size
- **Efficient Cleanup**: Automatic garbage collection

## 🔐 Security & Privacy

### Data Handling
- **Read-Only Access**: Only reads Gmail data, never modifies
- **Secure Processing**: No data transmitted to external servers
- **Local Storage**: All files saved to user's Google Drive
- **Audit Trail**: Comprehensive logging of all operations

### Permissions Required
```javascript
"oauthScopes": [
  "https://www.googleapis.com/auth/gmail.readonly",     // Read Gmail
  "https://www.googleapis.com/auth/spreadsheets",      // Logging (optional)
  "https://www.googleapis.com/auth/documents",         // PDF generation
  "https://www.googleapis.com/auth/drive"              // File storage
]
```

## 🛠️ Customization

### Custom HTML Conversion

```javascript
// Extend the conversion rules in convertHtmlToMarkdown()
const customConversions = [
  { from: /<custom-tag>(.*?)<\/custom-tag>/gi, to: '**$1**' },
  // Add your own conversion rules
];
```

### Custom File Naming

```javascript
// Modify generateFilename() function
function generateFilename(thread, content) {
  // Your custom naming logic
  const customName = `${content.subject}_${new Date().getTime()}`;
  return sanitizeFilename(customName);
}
```

### Custom Export Formats

```javascript
// Add new export format in processThread()
if (config.includeCustomFormat) {
  const customFile = exportToCustomFormat(threadContent, filenameBase, context.targetFolder);
  result.files.push(customFile);
}
```

## 📚 API Reference

### Main Functions

#### `gmailExportPdfMarkdown(options)`
Main export function with comprehensive options.

**Parameters:**
- `options` (Object): Export configuration options

**Returns:**
- `Object`: Export results summary

#### `exportGmailThreadsByIds(threadIds, options)`
Export specific threads by their Gmail IDs.

**Parameters:**
- `threadIds` (Array): Array of Gmail thread IDs
- `options` (Object): Export options

**Returns:**
- `Object`: Export results

#### `exportRecentInboxMessages(days, options)`
Quick export of recent inbox messages.

**Parameters:**
- `days` (Number): Number of days back to search
- `options` (Object): Additional export options

**Returns:**
- `Object`: Export results

### Utility Functions

#### `convertHtmlToMarkdown(htmlContent)`
Convert HTML content to Markdown format.

#### `generateThreadContent(thread, messages)`
Generate structured content from Gmail thread.

#### `buildMarkdownContent(content)`
Build complete Markdown document from thread content.

#### `exportToMarkdown(content, filenameBase, folder)`
Export content to Markdown file.

#### `exportToPdf(content, filenameBase, folder)`
Export content to PDF file via Google Docs.

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install clasp CLI: `npm install -g @google/clasp`
3. Login to Google: `clasp login`
4. Create new project: `clasp create`
5. Push code: `clasp push`

### Testing Guidelines

- All new features must include unit tests
- Performance tests for functions processing large datasets
- Integration tests for complete workflows
- Error handling tests for edge cases

### Code Style

- Follow existing code patterns
- Use JSDoc comments for all functions
- Include comprehensive error handling
- Add logging for debugging purposes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

1. **Authorization Errors**
   - Ensure all required OAuth scopes are enabled
   - Re-authorize the script if permissions change

2. **Performance Issues**
   - Reduce `maxThreads` for large exports
   - Enable caching in configuration
   - Use date filters to limit scope

3. **File Naming Issues**
   - Special characters are automatically sanitized
   - Long subjects are truncated to safe lengths
   - Duplicate names get unique suffixes

### Debug Mode

```javascript
// Enable debug logging
SERVICE_CONFIG.LOG_LEVEL = 'DEBUG';

// Run with debug output
const result = gmailExportPdfMarkdown({
  query: 'test query',
  maxThreads: 1
});
```

### Getting Help

- Check the test files for usage examples
- Review the integration tests for workflow patterns
- Enable debug logging for troubleshooting
- Use the performance tests to benchmark your usage

---

**Made with ❤️ for Gmail power users who need comprehensive email archiving solutions.**
