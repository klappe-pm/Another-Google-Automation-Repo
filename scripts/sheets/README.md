# Sheets Automation Scripts

## Overview
Google Apps Scripts for Google Sheets automation, data processing, and content generation. These scripts help you create visualizations, process CSV data, and generate markdown content from spreadsheet data.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| sheets-create-markdown.gs | Generate markdown from sheet data | 2025-07-19 |
| sheets-csv-combiner.gs | Combine multiple CSV files | 2025-07-19 |
| sheets-tree-diagram.gs | Create visual tree diagrams | 2025-07-19 |
| sheets-file-indexer.gs | Index files and folders in sheets | 2025-07-19 |

## Primary Functions
- **Content Generation**: Create markdown, documentation, and reports from data
- **Data Processing**: CSV combination, data cleaning, and transformation
- **Visualization**: Tree diagrams, charts, and visual representations
- **File Operations**: Index and catalog files across Google Drive

## Installation
1. Copy desired script to Google Apps Script project
2. Enable Google Sheets API in Google Cloud Console
3. Configure spreadsheet IDs and data ranges
4. Authorize sheets read/write permissions
5. Run the script functions as needed

## Prerequisites
- Google Sheets access
- Google Drive for input/output files
- Sheets API enabled
- Apps Script project setup

## Common Configuration
```javascript
// Update these variables in scripts:
const SPREADSHEET_ID = 'your-spreadsheet-id-here';
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const DATA_RANGE = 'A1:Z1000'; // Adjust based on your data
```

## Usage Examples

### Generate Markdown
```javascript
// Create markdown from sheet data
generateMarkdownFromSheet('spreadsheet-id', 'Sheet1');

// Create structured documentation
createDocumentationFromData({
  spreadsheetId: 'id-here',
  templateType: 'table',
  includeHeaders: true
});
```

### Process CSV Data
```javascript
// Combine multiple CSV files
combineCsvFiles(['file1.csv', 'file2.csv', 'file3.csv']);

// Clean and process data
cleanDataInSheet('spreadsheet-id', 'Sheet1');
```

### Create Visualizations
```javascript
// Generate tree diagram
createTreeDiagram({
  data: sheetData,
  outputFormat: 'markdown',
  includeLinks: true
});
```

## Features
- **Flexible Data Processing**: Handle various data formats and structures
- **Template System**: Customizable output templates for different use cases
- **Batch Operations**: Process multiple files and sheets efficiently
- **Visual Outputs**: Create diagrams, charts, and structured visualizations
- **Integration Ready**: Compatible with documentation and knowledge systems
- **Error Handling**: Robust error checking and data validation

## Supported Operations
- **Data Export**: Convert sheets to markdown, JSON, CSV
- **Data Import**: Bulk import from CSV and other formats
- **Data Transformation**: Clean, format, and restructure data
- **Visualization**: Create tree diagrams and hierarchical displays
- **Indexing**: Catalog and organize file systems

## Data Formats
- **Input**: Google Sheets, CSV, JSON
- **Output**: Markdown, HTML, JSON, CSV, PDF

## Contributing
1. Follow the standard script header format
2. Include comprehensive error handling
3. Test with various data types and sizes
4. Document any new API permissions required

## License
MIT License - See main repository LICENSE file for details.

## Contact
kevin@averageintelligence.ai

## Integration Date
2025-07-19

## Repository
Part of Workspace Automation (AGAR) project.
