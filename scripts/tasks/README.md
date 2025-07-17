# Tasks Automation Scripts

## Overview
Google Tasks automation scripts for exporting task data to markdown files, creating Obsidian-compatible notes, and generating structured task documentation with YAML frontmatter.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| tasks-export-markdown-yaml.gs | Exports Google Tasks to structured markdown files with YAML frontmatter and task statistics | 2025-01-16 |
| tasks-export-obsidian.gs | Exports Google Tasks to Obsidian-compatible markdown format for note-taking integration | 2025-01-16 |
| tasks-export-todos-markdown.gs | Converts Google Tasks to todo-style markdown files with category organization | 2025-01-16 |

## Installation & Setup

1. **Open Google Apps Script**: Navigate to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Enable Required APIs**: Enable Tasks, Drive, and Sheets APIs in the project
4. **Copy Code**: Paste script content and configure variables
5. **Authorize**: Run script to authorize required permissions

### Required OAuth Scopes
- `https://www.googleapis.com/auth/tasks.readonly` - Read Google Tasks
- `https://www.googleapis.com/auth/drive.file` - Create files in Drive
- `https://www.googleapis.com/auth/spreadsheets` - Modify spreadsheets (for menu integration)

## Usage

### tasks-export-markdown-yaml.gs
Exports Google Tasks to structured markdown files with comprehensive YAML frontmatter.

**Features:**
- Custom Google Sheets menu integration
- User prompt for tasklist ID selection
- Categorizes tasks by due dates (overdue, today, upcoming, etc.)
- Generates detailed YAML frontmatter with task statistics
- Creates organized markdown structure
- Handles task completion status and priorities

**Usage:**
1. Open Google Sheets and find the custom "Tasks" menu
2. Select "Export Tasks to Markdown"
3. Enter the tasklist ID when prompted
4. File will be created in specified Drive folder

### tasks-export-obsidian.gs
Exports Google Tasks specifically formatted for Obsidian note-taking system.

**Features:**
- Targets 'My Tasks' tasklist by default
- Creates Obsidian-compatible markdown format
- Includes task metadata and linking
- Supports task completion tracking
- Organized folder structure for Obsidian vaults

**Configuration:**
- Modify tasklist search criteria as needed
- Update Drive folder destination
- Adjust markdown formatting preferences

### tasks-export-todos-markdown.gs
Converts Google Tasks to todo-style markdown with category organization.

**Features:**
- Category-based task organization
- YAML frontmatter with task statistics
- Todo checkbox format (- [ ] and - [x])
- Due date categorization (overdue, today, week, month, future)
- Comprehensive logging and error handling
- Google Sheets menu integration

**Configuration:**
- Update target Drive folder ID
- Modify category definitions
- Adjust date range calculations

## Dependencies
- Google Tasks API
- Google Drive API
- Google Sheets API (for menu integration)
- Google Apps Script runtime

## File Output Locations
Scripts create markdown files in specified Google Drive folders. Default locations:
- `/Tasks/` folder in Google Drive (configurable in each script)
- Files are timestamped and organized by export date
- YAML frontmatter includes creation metadata

## Troubleshooting & Common Issues

- **Permission Errors**: Ensure all required APIs are enabled and authorized
- **API Limits**: Monitor quota usage and implement rate limiting
- **File Access**: Verify Drive folder permissions and sharing settings
- **Script Timeout**: Use batch processing for large operations
- **Tasklist Access**: Verify proper Tasks API permissions and tasklist IDs
- **YAML Format Issues**: Check YAML syntax and frontmatter structure

## Best Practices & Optimization

- **Test First**: Always test scripts on small datasets before full deployment
- **Backup Data**: Create backups before running bulk operations
- **Monitor Performance**: Check execution logs and optimize for large datasets
- **Follow Quotas**: Respect Google API rate limits and daily quotas
- **Task Organization**: Use consistent task categorization and due date management

## Configuration Options

### Customizable Settings
- Target Drive folder IDs
- Date range calculations
- YAML frontmatter fields
- Markdown formatting preferences
- Task categorization rules
- Debug logging levels

### Default Behavior
- Exports all incomplete tasks by default
- Categorizes by due dates automatically
- Includes task statistics in YAML
- Creates timestamped filenames
- Handles nested task structures

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
- [Google Tasks API Documentation](https://developers.google.com/tasks)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [Google Sheets API Documentation](https://developers.google.com/sheets)

## 🗂️ File Organization

```
tasks/
├── README.md
├── LICENSE.md
├── Export Functions/
│   ├── tasks-export-markdown-yaml.gs
│   └── tasks-export-todos-markdown.gs
├── Integration Tools/
│   └── tasks-export-obsidian.gs
├── Task Management/
│   └── [Future task management scripts]
├── Data Analysis/
│   └── [Future analysis scripts]
└── Legacy Files/
    └── [Future legacy files]
```
