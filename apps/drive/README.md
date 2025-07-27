# Drive Service

Google Apps Script automation for Google Drive file and folder management.

## Overview

This service provides comprehensive automation scripts for Google Drive operations including file indexing, folder organization, metadata management, and content processing.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| drive-docs-find-by-alias.gs | Find documents by alias/alternative names | Active |
| drive-index-all-files.gs | Index all files in Drive | Active |
| drive-index-docs-files.gs | Index only Google Docs files | Active |
| drive-index-file-tree-generator.gs | Generate file tree structure | Active |
| drive-index-markdown-files.gs | Index markdown files | Active |
| drive-manager-comprehensive-indexer.gs | Comprehensive Drive indexing tool | Active |
| drive-markdown-lint-spacing.gs | Lint markdown file spacing | Active |
| drive-markdown-move-update-metadata.gs | Move files and update metadata | Active |
| drive-markdown-process-blank-links.gs | Process blank links in markdown | Active |
| drive-notes-create-weekly-daily.gs | Create weekly/daily note templates | Active |
| drive-notes-generate-weekly.gs | Generate weekly notes | Active |
| drive-shortcuts-convert.gs | Convert shortcuts to actual files | Active |
| drive-utility-deduplicate-files.gs | Remove duplicate files | Active |
| drive-utility-folder-ids.gs | Get folder IDs utility | Active |
| drive-yaml-add-frontmatter-bulk.gs | Add YAML frontmatter in bulk | Active |
| drive-yaml-add-frontmatter-multi.gs | Add frontmatter to multiple files | Active |
| drive-yaml-add-simple.gs | Simple YAML frontmatter addition | Active |
| drive-yaml-finder.gs | Find files with YAML frontmatter | Active |
| drive-yaml-folder-categories.gs | Categorize folders using YAML | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### Project Settings

- **Script ID**: `1Y62ucpYOhuhZ7PAQaBSg8ICqd0uPWPQ3aqwhgpbc6fDGwmlqKFjq0lLO`
- **Time Zone**: America/New_York
- **Runtime**: V8

## Usage

### Basic File Operations

```javascript
// List files in a folder
function listFilesInFolder(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    Logger.log(file.getName() + ' - ' + file.getId());
  }
}
```

### Common Operations

1. **File Indexing**
   - Use `drive-index-all-files.gs` for complete Drive inventory
   - Use `drive-index-markdown-files.gs` for markdown-specific indexing
   - Export results to Sheets for analysis

2. **Folder Organization**
   - Use `drive-utility-folder-ids.gs` to map folder structure
   - Use `drive-manager-comprehensive-indexer.gs` for detailed reports

3. **Markdown Processing**
   - Use `drive-markdown-lint-spacing.gs` for formatting consistency
   - Use `drive-yaml-add-frontmatter-bulk.gs` for metadata addition

4. **File Deduplication**
   - Use `drive-utility-deduplicate-files.gs` to clean up duplicates
   - Preserves most recent version by default

## Development

### Adding New Scripts

1. Create new file following naming convention: `drive-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Consider batch operations for large file sets
4. Update this README with script details

### Testing

```javascript
// Test Drive access and permissions
function testDriveAccess() {
  try {
    // Create test folder
    const folder = DriveApp.createFolder('Test Folder ' + new Date().getTime());
    const folderId = folder.getId();
    Logger.log('Created test folder: ' + folderId);

    // Create test file
    const file = folder.createFile('test.txt', 'Test content');
    Logger.log('Created test file: ' + file.getId());

    // Clean up
    folder.setTrashed(true);
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**Timeout Errors**
- Implement pagination for large file sets
- Use continuation tokens for resumable operations
- Consider time-based triggers for long operations

**Permission Denied**
- Check file/folder sharing settings
- Verify OAuth scopes include necessary permissions
- Ensure service account has access if applicable

**Quota Exceeded**
- Implement exponential backoff
- Use batch operations where possible
- Monitor quota usage in Cloud Console

## Resources

- [Google Drive API Documentation](https://developers.google.com/drive)
- [Apps Script Drive Service](https://developers.google.com/apps-script/reference/drive)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025