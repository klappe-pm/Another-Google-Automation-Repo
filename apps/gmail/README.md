# Gmail Service

Google Apps Script automation for Gmail management, analysis, and export.

## Overview

This service provides comprehensive automation scripts for Gmail operations including email export, label management, analysis tools, and utility functions. With 47 production-ready scripts, it offers complete email automation capabilities.

## Scripts

### Email Export Scripts (12 files)

| Script Name | Purpose | Status |
|-------------|---------|--------|
| gmail-export-pdf-markdown.gs | Export emails to PDF and Markdown | Active |
| gmail-export-advanced-sheets.gs | Advanced export to Google Sheets | Active |
| gmail-export-basic-sheets.gs | Basic spreadsheet export | Active |
| gmail-export-docs-pdf.gs | Export emails to Google Docs as PDF | Active |
| gmail-export-emails-pdf-attachments.gs | Export with attachment handling | Active |
| gmail-export-labels-to-sheets.gs | Export label data to Sheets | Active |
| gmail-export-pdf-only.gs | PDF-only export functionality | Active |
| gmail-export-transportation-emails-markdown.gs | Specialized transport email export | Active |
| gmail-export-weekly-threads.gs | Export weekly email threads | Active |

### Label Management Scripts (16 files)

| Script Name | Purpose | Status |
|-------------|---------|--------|
| gmail-labels-create-sender.gs | Create labels based on senders | Active |
| gmail-labels-create-basic.gs | Basic label creation | Active |
| gmail-labels-analysis.gs | Comprehensive label analytics | Active |
| gmail-labels-auto-sender.gs | Automatic sender-based labeling | Active |
| gmail-labels-count.gs | Count emails by label | Active |
| gmail-labels-date-processor.gs | Process labels by date | Active |
| gmail-labels-delete-all.gs | Bulk label deletion | Active |
| gmail-labels-export-to-sheets.gs | Export label data | Active |
| gmail-labels-statistics.gs | Label usage statistics | Active |
| gmail-labels-status-count.gs | Count by status labels | Active |
| gmail-labels-unread-count.gs | Count unread by label | Active |

### Analysis Tools (8 files)

| Script Name | Purpose | Status |
|-------------|---------|--------|
| gmail-analysis-24months.gs | 24-month email trend analysis | Active |
| gmail-analysis-label-statistics.gs | Label usage analytics | Active |
| gmail-analysis-label-stats.gs | Quick label statistics | Active |
| gmail-analysis-labeled-vs-unlabeled-count.gs | Label coverage analysis | Active |
| gmail-analysis-labels-data.gs | Detailed label data analysis | Active |
| gmail-analysis-markdown-yaml.gs | YAML frontmatter processing | Active |
| gmail-analysis-markdown-yaml-v2.gs | Advanced YAML processing | Active |
| gmail-analysis-metadata-misc.gs | Metadata analysis tools | Active |

### Utility Scripts (11 files)

| Script Name | Purpose | Status |
|-------------|---------|--------|
| gmail-utility-markdown-fixer.gs | Fix markdown formatting | Active |
| gmail-utility-header-cleaner.gs | Clean email headers | Active |
| gmail-utility-mark-read.gs | Mark emails as read | Active |
| gmail-utility-md-linter.gs | Lint markdown content | Active |
| gmail-utility-delete-all-labels.gs | Remove all labels utility | Active |
| gmail-metadata-tools.gs | Metadata processing | Active |
| gmail-process-auto-label-by-sender.gs | Auto-labeling processor | Active |

## Configuration

### Required Permissions

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
  ],
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Gmail",
        "version": "v1",
        "serviceId": "gmail"
      },
      {
        "userSymbol": "Drive",
        "version": "v3",
        "serviceId": "drive"
      },
      {
        "userSymbol": "Docs",
        "version": "v1",
        "serviceId": "docs"
      },
      {
        "userSymbol": "Sheets",
        "version": "v4",
        "serviceId": "sheets"
      }
    ]
  }
}
```

### Project Settings

- **Script ID**: `1MhC1spUX-j1HfITDj6g68G2EobqbiZDiIpJJAxCEQOBAozERJPMoiXuq`
- **Time Zone**: America/New_York
- **Runtime**: V8
- **Advanced Services**: Gmail API v1, Drive API v3, Docs API v1, Sheets API v4

## Usage

### Basic Email Operations

```javascript
// Search and process emails
function processRecentEmails() {
  const threads = GmailApp.search('newer_than:7d', 0, 50);
  
  threads.forEach(thread => {
    const messages = thread.getMessages();
    messages.forEach(message => {
      Logger.log(message.getSubject() + ' - ' + message.getDate());
    });
  });
}
```

### Common Operations

1. **Email Export**
   - Use `gmail-export-pdf-markdown.gs` for dual format export
   - Use `gmail-export-advanced-sheets.gs` for detailed spreadsheet reports
   - Configure output folder ID for Drive storage

2. **Label Management**
   - Use `gmail-labels-create-sender.gs` for automatic organization
   - Use `gmail-labels-analysis.gs` for usage insights
   - Use `gmail-labels-delete-all.gs` for cleanup operations

3. **Email Analysis**
   - Use `gmail-analysis-24months.gs` for long-term trends
   - Export results to Sheets for visualization
   - Track label usage patterns over time

4. **Batch Processing**
   - Use utility scripts for bulk operations
   - Implement pagination for large datasets
   - Monitor execution time limits

## Development

### Adding New Scripts

1. Create new file following naming convention: `gmail-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Use batch operations for better performance
4. Update this README with script details

### Testing

```javascript
// Test Gmail access and permissions
function testGmailAccess() {
  try {
    const threads = GmailApp.search('in:inbox', 0, 1);
    Logger.log('Found ' + threads.length + ' threads');
    
    const labels = GmailApp.getUserLabels();
    Logger.log('Found ' + labels.length + ' labels');
    
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**Rate Limit Exceeded**
- Implement exponential backoff
- Use batch operations
- Add Utilities.sleep() between operations

**Script Timeout**
- Process emails in batches
- Use time-based triggers for long operations
- Store progress for resumable processing

**Permission Errors**
- Verify all OAuth scopes are included
- Check advanced services are enabled
- Ensure folder permissions for exports

## Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Apps Script Gmail Service](https://developers.google.com/apps-script/reference/gmail)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025