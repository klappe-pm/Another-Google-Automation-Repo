# Gmail Automation Project

**Production-Ready Google Apps Script Tools for Email Management**

This project contains 47 Google Apps Script files for comprehensive Gmail automation, including email export, label management, analysis tools, and utility functions.

## 📊 Project Overview

**Script Count**: 47 files  
**Google Apps Script ID**: `1fRuwT0EE6AdpDTlQLSL5w-jjA5kS7b4-HYRJFWYObV0kKvIiq1-o4JvJ`  
**Primary Service**: Gmail API  
**Created**: 2024  
**Updated**: 2025-07-24  

## 🗂️ Script Categories

### 📤 Email Export (12 scripts)
- **PDF Export**: Convert emails to PDF documents
- **Markdown Export**: Export emails to Markdown format with YAML frontmatter
- **Sheets Export**: Export email data to Google Sheets
- **Multi-format Export**: Combined export workflows

Key Scripts:
- `gmail-export-pdf-markdown.gs` - PDF and Markdown export
- `gmail-export-advanced-sheets.gs` - Advanced spreadsheet export
- `gmail-export-transportation-emails-markdown.gs` - Specialized transport email export

### 🏷️ Label Management (16 scripts)
- **Label Creation**: Automated label creation based on patterns
- **Label Analysis**: Statistics and analytics for labels
- **Label Operations**: Bulk operations and management
- **Label Export**: Export label data to sheets

Key Scripts:
- `gmail-labels-create-sender.gs` - Create labels based on sender patterns
- `gmail-labels-analysis.gs` - Comprehensive label analytics
- `gmail-labels-delete-all.gs` - Bulk label deletion tools

### 📊 Analysis Tools (8 scripts)
- **Temporal Analysis**: 24-month email trends
- **Metadata Analysis**: Email header and content analysis
- **YAML Processing**: Frontmatter extraction and processing
- **Statistical Reports**: Email usage statistics

Key Scripts:
- `gmail-analysis-24months.gs` - 24-month email data analysis
- `gmail-analysis-markdown-yaml-v2.gs` - Advanced YAML processing
- `gmail-analysis-label-statistics.gs` - Label usage statistics

### 🔧 Utility Tools (11 scripts)
- **Data Processing**: Email data manipulation
- **Format Conversion**: Content format standardization
- **Maintenance**: Cleanup and optimization tools
- **Testing**: Development and testing utilities

Key Scripts:
- `gmail-utility-markdown-fixer.gs` - Markdown format correction
- `gmail-utility-header-cleaner.gs` - Email header cleanup
- `gmail-metadata-tools.gs` - Metadata processing utilities

## ⚙️ Configuration

### Required OAuth Scopes
```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify", 
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### Common Configuration Variables
Update these variables in scripts as needed:

```javascript
// Folder configuration
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const ARCHIVE_FOLDER_ID = 'your-archive-folder-id';

// Date range settings
const START_DATE = '2024-01-01';
const END_DATE = '2025-12-31';

// Export settings
const MAX_EMAILS_PER_BATCH = 50;
const EXPORT_FORMAT = 'markdown'; // 'pdf', 'markdown', 'sheets'
```

## 🚀 Quick Start

### 1. Setup Google Apps Script Project
```bash
# Open Google Apps Script
open https://script.google.com

# Create new project or use existing:
# Project ID: 1fRuwT0EE6AdpDTlQLSL5w-jjA5kS7b4-HYRJFWYObV0kKvIiq1-o4JvJ
```

### 2. Enable Required APIs
- Gmail API
- Google Drive API  
- Google Docs API
- Google Sheets API

### 3. Basic Usage Example
```javascript
// Test the Gmail connection
function testGmailConnection() {
  const threads = GmailApp.search('in:inbox', 0, 5);
  Logger.log(`Found ${threads.length} threads in inbox`);
  return threads.length;
}

// Export recent emails to markdown
function exportRecentEmails() {
  const threads = GmailApp.search('newer_than:7d', 0, 20);
  // Process threads...
}
```

## 📁 File Organization

### Current Structure
```
src/
├── appsscript.json           # Project configuration
├── test.gs                   # Basic test functions
├── gmail-analysis-*.gs       # Analysis tools (8 files)
├── gmail-export-*.gs         # Export functions (12 files)  
├── gmail-labels-*.gs         # Label management (16 files)
├── gmail-metadata-*.gs       # Metadata tools (1 file)
├── gmail-process-*.gs        # Processing scripts (1 file)
├── gmail-utility-*.gs        # Utility functions (6 files)
└── *.gs                      # Legacy and specialized scripts (3 files)
```

### Legacy Files
Files with `-copy-legacy` suffix are archived versions maintained for reference.

## 🔒 Security & Privacy

### Data Handling
- **No External Transmission**: All data stays within Google ecosystem
- **Minimal Permissions**: Only request necessary OAuth scopes
- **Error Handling**: Comprehensive error management and logging
- **Rate Limiting**: Respectful API usage patterns

### Best Practices
- Test with small datasets first
- Monitor quota usage in Google Cloud Console
- Use batch processing for large operations
- Implement proper error handling and retries

## 🛠️ Development

### Testing
```javascript
// Run basic tests
function runTests() {
  test();
  main();
  // Add your test functions here
}
```

### Debugging
- Use `Logger.log()` for debugging output
- Check execution logs in Apps Script IDE
- Monitor API quotas in Google Cloud Console

### Contributing
1. Follow existing naming conventions
2. Include comprehensive script headers
3. Test thoroughly with various datasets
4. Update documentation as needed

## 📊 Performance Metrics

### Typical Usage Limits
- **Gmail API**: 1 billion quota units per day
- **Drive API**: 20,000 requests per 100 seconds
- **Execution Time**: 6 minutes maximum per execution

### Optimization Tips
- Use batch operations when possible
- Implement pagination for large datasets
- Cache frequently accessed data
- Use `Utilities.sleep()` to avoid rate limiting

## 🆘 Troubleshooting

### Common Issues

#### Permission Errors
```javascript
// Solution: Check OAuth scopes in appsscript.json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.readonly"
  ]
}
```

#### Script Timeouts
```javascript
// Solution: Implement batch processing
function processBatch(items, batchSize = 50) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    // Process batch
    Utilities.sleep(1000); // Rate limiting
  }
}
```

#### File Access Issues
```javascript
// Solution: Verify folder IDs
function verifyAccess(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    Logger.log(`Access confirmed: ${folder.getName()}`);
    return true;
  } catch (error) {
    Logger.log(`Access denied: ${error.message}`);
    return false;
  }
}
```

## 📄 License

MIT License - See repository root for full license terms.

## 📞 Support

- **Repository**: [Workspace Automation](https://github.com/kevinlappe/workspace-automation)
- **Issues**: Use GitHub Issues for bug reports
- **Contact**: kevin@averageintelligence.ai

---

**⭐ Star the main repository if you find these tools helpful!**

*Last Updated: 2025-07-24*
