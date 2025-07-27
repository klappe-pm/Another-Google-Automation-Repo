# Tasks Service

Google Apps Script automation for Google Tasks management and organization.

## Overview

This service provides automation scripts for Google Tasks operations including task creation, management, export, and synchronization with other services.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| tasks-export-markdown-yaml.gs | Export tasks to markdown with YAML frontmatter | Active |
| tasks-export-obsidian.gs | Export tasks to Obsidian-compatible format | Active |
| tasks-export-todos-markdown.gs | Export todos as markdown checklist | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/tasks",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### Project Settings

- **Script ID**: `1GtzgEyKr39SNn9OuOXMoYLdEigAdGV447GJFutEJFNl1GQHos0XyBA5O`
- **Time Zone**: America/New_York
- **Runtime**: V8

## Usage

### Basic Task Operations

```javascript
// Get all task lists
function getTaskLists() {
  const taskLists = Tasks.Tasklists.list();

  if (taskLists.items && taskLists.items.length > 0) {
    taskLists.items.forEach(taskList => {
      Logger.log('Task List: ' + taskList.title);
    });
  }
  return taskLists;
}

// Get tasks from a list
function getTasks(taskListId) {
  const tasks = Tasks.Tasks.list(taskListId);

  if (tasks.items && tasks.items.length > 0) {
    tasks.items.forEach(task => {
      Logger.log('Task: ' + task.title + ' - ' + (task.status || 'needsAction'));
    });
  }
  return tasks;
}
```

### Common Operations

1. **Task Export**
   - Use `tasks-export-markdown-yaml.gs` for structured export
   - Use `tasks-export-obsidian.gs` for knowledge base integration
   - Use `tasks-export-todos-markdown.gs` for simple checklists

2. **Task Management**
   - Create tasks programmatically
   - Update task status and properties
   - Organize tasks by project or context

3. **Integration**
   - Sync tasks with Google Sheets
   - Export to Drive for backup
   - Create daily/weekly task reports

## Development

### Adding New Scripts

1. Create new file following naming convention: `tasks-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Enable Tasks API in Google Cloud Console
4. Update this README with script details

### Testing

```javascript
// Test Tasks API access
function testTasksAccess() {
  try {
    // Note: Tasks API requires advanced service setup
    // This is a basic connectivity test
    const token = ScriptApp.getOAuthToken();
    Logger.log('OAuth token generated for Tasks API');

    // Actual API calls require Tasks advanced service
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**API Not Enabled**
- Enable Google Tasks API in Cloud Console
- Add Tasks advanced service in Apps Script

**No Task Lists Found**
- Ensure user has at least one task list
- Check API permissions and scopes

**Export Formatting**
- Verify markdown syntax in exports
- Check YAML frontmatter validity
- Test with different task properties

## Resources

- [Google Tasks API Documentation](https://developers.google.com/tasks)
- [Tasks API Reference](https://developers.google.com/tasks/reference/rest)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025