# Sheets Service

Google Apps Script automation for Google Sheets processing and data management.

## Overview

This service provides automation scripts for Google Sheets operations including data processing, formatting, import/export operations, and spreadsheet management.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| sheets-create-markdown.gs | Create markdown from spreadsheet data | Active |
| sheets-create-tree-diagram.gs | Generate tree diagrams from data | Active |
| sheets-csv-combiner.gs | Combine multiple CSV files | Active |
| sheets-export-markdown-files.gs | Export sheets to markdown files | Active |
| sheets-format-comprehensive-styling.gs | Apply comprehensive formatting | Active |
| sheets-index-folders-files.gs | Index Drive folders/files in sheets | Active |
| sheets-index-general.gs | General indexing functionality | Active |
| sheets-process-date-automation.gs | Automate date-based processing | Active |
| sheets-utility-tab-sorter.gs | Sort spreadsheet tabs | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file"
  ],
  "dependencies": {
    "enabledAdvancedServices": [
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

- **Script ID**: `1HfBP6a8zJ7piAu74Q0iVFnik7wIOj5jsUIkqeNAM5IGlfE2AJwQMz9dZ`
- **Time Zone**: America/New_York
- **Runtime**: V8
- **Advanced Services**: Sheets API v4

## Usage

### Basic Spreadsheet Operations

```javascript
// Read data from a spreadsheet
function readSpreadsheetData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();

  data.forEach((row, index) => {
    Logger.log('Row ' + index + ': ' + row.join(', '));
  });

  return data;
}
```

### Common Operations

1. **Data Export**
   - Use `sheets-export-markdown-files.gs` for markdown generation
   - Use `sheets-create-tree-diagram.gs` for visual representations
   - Configure output formats and destinations

2. **Data Processing**
   - Use `sheets-csv-combiner.gs` to merge data sources
   - Use `sheets-process-date-automation.gs` for time-based operations
   - Implement batch processing for large datasets

3. **Formatting**
   - Use `sheets-format-comprehensive-styling.gs` for consistent styling
   - Apply conditional formatting rules
   - Create custom formatting templates

4. **Indexing**
   - Use `sheets-index-folders-files.gs` to catalog Drive contents
   - Create searchable indexes of resources
   - Update indexes automatically

## Development

### Adding New Scripts

1. Create new file following naming convention: `sheets-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Use batch operations for better performance
4. Update this README with script details

### Testing

```javascript
// Test Sheets API access
function testSheetsAccess() {
  try {
    // Create a test spreadsheet
    const spreadsheet = SpreadsheetApp.create('Test Spreadsheet');
    const sheet = spreadsheet.getActiveSheet();

    // Write test data
    sheet.getRange('A1').setValue('Test');
    sheet.getRange('B1').setValue('Data');

    // Read back
    const values = sheet.getRange('A1:B1').getValues();
    Logger.log('Test data: ' + values[0].join(', '));

    // Clean up
    DriveApp.getFileById(spreadsheet.getId()).setTrashed(true);
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**Formula Errors**
- Verify formula syntax for Apps Script
- Check cell references are valid
- Use proper error handling for calculations

**Performance Issues**
- Use batch operations instead of cell-by-cell
- Minimize calls to spreadsheet services
- Consider using arrays for data manipulation

**Formatting Lost**
- Use Sheets API v4 for complex formatting
- Apply formatting after data operations
- Save formatting templates for reuse

## Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Apps Script Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025