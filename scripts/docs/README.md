# Google Docs Automation Scripts

## Overview
This collection provides comprehensive automation tools for Google Docs, enabling document conversion, formatting, content embedding, comment extraction, and file management workflows.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| docs-export-markdown-advanced.gs | Advanced Google Docs to Markdown conversion with YAML frontmatter and image handling | 2024-01-15 |
| docs-export-markdown-obsidian.gs | Export Google Docs to Markdown format optimized for Obsidian with backlink generation | 2024-01-15 |
| docs-embed-content-block.gs | Dynamically embed content from one Google Doc into another using placeholders | 2024-01-15 |
| docs-export-comments-sheets.gs | Extract all comments and replies from a Google Doc and export to spreadsheet | 2024-01-15 |
| docs-export-file-list-to-sheets.gs | Generate comprehensive file inventory with metadata for Google Docs in a folder | 2024-01-15 |
| docs-formatter.gs | Batch apply consistent formatting styles across multiple Google Docs | 2024-01-15 |

## Key Features

### Document Conversion
- **Markdown Export**: Convert Google Docs to Markdown with preserving formatting, headings, lists, and links
- **YAML Frontmatter**: Automatic metadata extraction and YAML header generation
- **Image Handling**: Extract and save embedded images with proper markdown linking
- **Obsidian Integration**: Export docs with Obsidian-compatible formatting and backlink structure

### Content Management
- **Dynamic Content Embedding**: Replace placeholders with live content from other documents
- **Batch Formatting**: Apply consistent styling across multiple documents
- **Comment Extraction**: Export all comments and replies for analysis and documentation

### Analysis & Reporting
- **File Inventory**: Generate detailed spreadsheets with file metadata, word counts, and links
- **Comment Analysis**: Track comment status, authors, timestamps, and content metrics
- **Document Metrics**: Automatic word count, character count, and metadata tracking

## Installation & Setup

1. **Open Google Apps Script**: Navigate to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Enable Required APIs**: Enable Docs, Drive, and Sheets APIs in the project
4. **Copy Code**: Paste script content and configure variables
5. **Authorize**: Run script to authorize required permissions

### Required OAuth Scopes
- `https://www.googleapis.com/auth/documents.readonly` - Read Google Docs
- `https://www.googleapis.com/auth/drive.file` - Create and modify files in Drive
- `https://www.googleapis.com/auth/spreadsheets` - Create and modify spreadsheets

## Usage Instructions

### Markdown Export Scripts
```javascript
// For advanced markdown export
1. Update sourceFolderId with your folder ID
2. Set targetFolderName for output location
3. Run exportAllDocsInFolderToMarkdown()

// For Obsidian export
1. Open the Google Doc you want to convert
2. Use the "Send to Obsidian" menu item
3. The script will create markdown files and backlinks automatically
```

### Content Embedding
```javascript
1. Set sourceDocId and destDocId variables
2. Define the sourceHeader to extract content from
3. Set the placeholder text to replace
4. Run updateDocument()
```

### Comment Export
```javascript
1. Run exportComments()
2. Enter document ID when prompted
3. Enter folder ID for spreadsheet storage
4. Review the generated comment analysis spreadsheet
```

### File Inventory
```javascript
1. Update folderId with your target folder
2. Set spreadsheetId for output location
3. Configure sheetName for the tab
4. Run listFilesInFolder()
```

### Batch Formatting
```javascript
1. Update folder_id_here with your folder ID
2. Customize font families and sizes as needed
3. Run updateFormatting()
```

## Configuration

### Required IDs
Most scripts require configuration of Google Drive folder IDs and document IDs. Update these variables:
- `sourceFolderId`: ID of the folder containing source documents
- `targetFolderId`: ID of the folder for output files
- `spreadsheetId`: ID of the spreadsheet for data export
- `docId`: ID of specific documents to process

### Customization Options
- **Formatting Styles**: Modify font families, sizes, and styling in docs-formatter.gs
- **Markdown Output**: Customize YAML frontmatter fields and structure
- **File Naming**: Adjust naming conventions for exported files
- **Content Filters**: Modify content extraction patterns and rules

## Best Practices

### Before Running Scripts
- **Backup Important Documents**: Always backup before batch operations
- **Test on Sample Documents**: Run scripts on test documents first
- **Verify Permissions**: Ensure proper access to all required folders and documents
- **Check Folder IDs**: Verify all folder and document IDs are correct

### Optimization Tips
- **Batch Processing**: Use folder-based operations for efficiency
- **Error Handling**: Monitor execution logs for any processing issues
- **Rate Limiting**: Be mindful of API quotas for large document sets
- **Output Organization**: Use clear naming conventions for exported files

## Troubleshooting & Common Issues

- **Permission Errors**: Ensure all required APIs are enabled and authorized
- **API Limits**: Monitor quota usage and implement rate limiting
- **File Access**: Verify folder/file permissions and sharing settings
- **Script Timeout**: Use batch processing for large operations
- **Large Documents**: Some scripts may timeout on very large documents
- **Image Export Issues**: Image extraction requires additional Drive permissions

## Best Practices & Optimization

- **Test First**: Always test scripts on small datasets before full deployment
- **Backup Data**: Create backups before running bulk operations
- **Monitor Performance**: Check execution logs and optimize for large datasets
- **Follow Quotas**: Respect Google API rate limits and daily quotas
- **Incremental Processing**: Process documents in manageable batches

## Contributing
Contributions are welcome! Please:
- Follow the existing code style and structure
- Add comprehensive comments and documentation
- Test thoroughly before submitting
- Update this README with any new features or changes

## License
MIT License - see repository root for full license text.

## 📞 Contact
**Primary Contact**: Kevin Lappe  
**Email**: kevin@averageintelligence.ai

## Related Resources

- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Google Docs API Documentation](https://developers.google.com/docs)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [Google Sheets API Documentation](https://developers.google.com/sheets)

## 🗂️ File Organization

```
docs/
├── README.md
├── LICENSE.md
├── Export Functions/
│   ├── docs-export-markdown-advanced.gs
│   ├── docs-export-comments-sheets.gs
│   └── docs-export-file-list-to-sheets.gs
├── Content Management/
│   ├── docs-embed-content-block.gs
│   └── docs-formatter.gs
├── Integration Tools/
│   └── docs-export-markdown-obsidian.gs
├── Analysis Tools/
│   └── [Future analysis scripts]
└── Legacy Files/
    └── [Future legacy files]
```
