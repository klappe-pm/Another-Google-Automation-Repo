# Docs Service

Google Apps Script automation for Google Docs processing and manipulation.

## Overview

This service provides automation scripts for Google Docs operations including content extraction, formatting, comment management, and document export.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| docs-embed-content-block.gs | Embed content blocks in documents | Active |
| docs-export-comments-sheets.gs | Export document comments to Sheets | Active |
| docs-export-file-list-to-sheets.gs | Export file lists to spreadsheets | Active |
| docs-export-markdown-advanced.gs | Advanced markdown export with formatting | Active |
| docs-export-markdown-obsidian.gs | Export to Obsidian-compatible markdown | Active |
| docs-formatter-content.gs | Format document content programmatically | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ],
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Docs",
        "version": "v1",
        "serviceId": "docs"
      }
    ]
  }
}
```

### Project Settings

- **Script ID**: `16U33iZkZSoN_h697FSbTsa3Ma5yD0e6p7gGjeWgH1xlTuWzfg6X3NHgz`
- **Time Zone**: America/New_York
- **Runtime**: V8
- **Advanced Services**: Google Docs API v1

## Usage

### Basic Document Operations

```javascript
// Get document content
function getDocumentContent(documentId) {
  const doc = DocumentApp.openById(documentId);
  const body = doc.getBody();
  const text = body.getText();

  Logger.log('Document text: ' + text);
  return text;
}
```

### Common Operations

1. **Export to Markdown**
   - Use `docs-export-markdown-advanced.gs` for full formatting preservation
   - Use `docs-export-markdown-obsidian.gs` for Obsidian vault integration

2. **Comment Management**
   - Use `docs-export-comments-sheets.gs` to track document feedback
   - Export includes comment threads and resolutions

3. **Content Processing**
   - Use `docs-formatter-content.gs` for batch formatting
   - Use `docs-embed-content-block.gs` for template insertion

## Development

### Adding New Scripts

1. Create new file following naming convention: `docs-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Enable Docs API advanced service if using API directly
4. Update this README with script details

### Testing

```javascript
// Test document access
function testDocumentAccess() {
  try {
    // Create a test document
    const doc = DocumentApp.create('Test Document');
    const docId = doc.getId();
    Logger.log('Created test document: ' + docId);

    // Clean up
    DriveApp.getFileById(docId).setTrashed(true);
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**Document Not Found**
- Verify document ID is correct
- Check sharing permissions for the document

**API Limit Exceeded**
- Implement exponential backoff for retries
- Use batch operations where possible

**Formatting Lost in Export**
- Use advanced API for complex formatting
- Consider HTML intermediate format

## Resources

- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [Apps Script Document Service](https://developers.google.com/apps-script/reference/document)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025