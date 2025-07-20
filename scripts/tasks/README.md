# Tasks Automation Scripts

## Overview
Google Apps Scripts for Google Tasks automation, todo management, and productivity workflows. These scripts help you export tasks, analyze productivity patterns, and integrate with note-taking systems.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| tasks-export-markdown.gs | Export tasks to markdown format | 2025-07-19 |
| tasks-export-obsidian.gs | Export tasks with Obsidian formatting | 2025-07-19 |
| tasks-analysis-productivity.gs | Analyze task completion patterns | 2025-07-19 |

## Primary Functions
- **Task Export**: Export tasks to markdown, YAML, and structured formats
- **Productivity Analysis**: Task completion rates and pattern analysis
- **Integration Tools**: Obsidian and note-taking system compatibility
- **Workflow Automation**: Automated task organization and reporting

## Installation
1. Copy desired script to Google Apps Script project
2. Enable Google Tasks API in Google Cloud Console
3. Configure task lists and export settings
4. Authorize tasks read permissions
5. Run the script functions as needed

## Prerequisites
- Google Tasks access
- Google Drive for output storage
- Tasks API enabled
- Apps Script project setup

## Common Configuration
```javascript
// Update these variables in scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const TASK_LIST_ID = '@default'; // or specific task list ID
const EXPORT_FORMAT = 'markdown'; // or 'yaml', 'json'
```

## Usage Examples

### Export Tasks
```javascript
// Export all tasks to markdown
exportTasksToMarkdown('@default');

// Export with custom formatting
exportTasksWithTemplate({
  taskListId: '@default',
  template: 'obsidian',
  includeCompleted: false
});
```

### Analyze Productivity
```javascript
// Analyze task completion patterns
analyzeTaskPatterns('@default', '2025-01-01', '2025-01-31');

// Generate productivity report
generateProductivityReport({
  period: 'monthly',
  includeGraphs: true
});
```

### Obsidian Integration
```javascript
// Export tasks to daily notes
exportToObsidianDaily({
  date: '2025-01-19',
  includeCompleted: true,
  format: 'checklist'
});
```

## Features
- **Multiple Export Formats**: Markdown, YAML, JSON, and custom templates
- **Status Tracking**: Track completion rates and progress over time
- **Date Filtering**: Export tasks by due date, creation date, or completion
- **Template Support**: Customizable output formats for different systems
- **Batch Processing**: Handle multiple task lists efficiently
- **Integration Ready**: Compatible with Obsidian, Notion, and other systems

## Supported Task Lists
- **Default Task List**: Primary Google Tasks list
- **Custom Lists**: Any created task lists
- **Bulk Export**: All task lists at once
- **Filtered Export**: Tasks by status, date, or priority

## Export Options
- **Include Completed**: Option to include or exclude completed tasks
- **Date Ranges**: Filter by creation, due, or completion dates
- **Priority Levels**: Filter by task priority
- **Subtask Handling**: Include or flatten subtask hierarchies

## Contributing
1. Follow the standard script header format
2. Include comprehensive error handling
3. Test with various task list configurations
4. Document any new API permissions required

## License
MIT License - See main repository LICENSE file for details.

## Contact
kevin@averageintelligence.ai

## Integration Date
2025-07-19

## Repository
Part of Workspace Automation (AGAR) project.
