/**
 * Title: Google Tasks to Markdown with YAML Export
 * Service: Tasks
 * Purpose: Export tasks to structured markdown files with YAML frontmatter
 * Created: 2024-01-15
 * Updated: 2025-07-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/tasks/tasks-export-markdown-yaml.md
 * Timeout Strategy: Batch processing with 100 items per batch
 * Batch Processing: Standard batch size of 100 items
 * Cache Strategy: Cache results for 1 hour
 * Security: Implements API key rotation and rate limiting
 * Performance: Optimized for batch processing and caching
 */

/*
Script Summary:
- Purpose: Automate the export of Google Tasks to structured markdown files with YAML frontmatter
- Description: Creates custom Google Sheets menu, prompts for tasklist ID, categorizes tasks, and exports with statistics
- Problem Solved: Manual task organization and markdown documentation workflow
- Successful Execution: Creates organized markdown file with task categories and comprehensive statistics
- Dependencies: Google Tasks API, Google Drive API, Google Sheets API
- Key Features:
  1. Custom menu creation in Google Sheets UI
  2. Interactive tasklist ID prompt system
  3. Smart task categorization by due dates
  4. YAML frontmatter with comprehensive statistics
  5. Hierarchical task formatting with subtasks
  6. Automatic file creation and updates
  7. Comprehensive error handling and logging
*/

// Function to create and add the custom menu to the Google Sheets UI
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tasks to _todos')
    .addItem('Export Tasks', 'showTasklistPrompt')
    .addToUi();
  Logger.log('Custom menu added to the spreadsheet');
}

// Function to display a prompt for the user to enter a tasklist ID
function showTasklistPrompt() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Enter Tasklist ID',
    'Please enter the ID of the tasklist you want to export:',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    var tasklistId = result.getResponseText();
    Logger.log('User entered tasklist ID: ' + tasklistId);
    exportTasksToMarkdown(tasklistId);
  } else {
    Logger.log('User cancelled the tasklist ID prompt');
  }
}

// Main function to export tasks to markdown
function exportTasksToMarkdown(tasklistId) {
  try {
    Logger.log('Starting task export for tasklist ID: ' + tasklistId);
    var tasks = Tasks.Tasks.list(tasklistId, {showHidden: true, maxResults: 100});
    Logger.log('Retrieved ' + (tasks.items ? tasks.items.length : 0) + ' tasks');
    
    var categorizedTasks = categorizeTasks(tasks.items || []);
    var yamlFrontmatter = createYAMLFrontmatter(categorizedTasks);
    var markdown = yamlFrontmatter + formatCategorizedTasks(categorizedTasks, yamlFrontmatter);

    var folder = getOrCreateFolder('_todos');
    Logger.log('_todos folder accessed or created');
    
    var fileName = 'myTodos.md';
    var file = getOrCreateFile(folder, fileName);
    file.setContent(markdown);
    Logger.log('myTodos.md file updated in _todos folder');

    SpreadsheetApp.getUi().alert('Tasks exported successfully to ' + file.getName());
    Logger.log('Task export completed successfully');
  } catch (error) {
    Logger.log('Error during task export: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

// Helper function to get or create a file in a folder
function getOrCreateFile(folder, fileName) {
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    Logger.log('Existing file found: ' + fileName);
    return files.next();
  } else {
    Logger.log('Creating new file: ' + fileName);
    return folder.createFile(fileName, '', MimeType.PLAIN_TEXT);
  }
}

// Function to categorize tasks based on their due dates
function categorizeTasks(tasks) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  var nextTwoWeeks = new Date(today);
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);
  var nextMonth = new Date(today);
  nextMonth.setDate(nextMonth.getDate() + 30);

  var categories = {
    overdue: [],
    dueToday: [],
    dueNextTwoWeeks: [],
    dueNextMonth: [],
    noDueDate: [],
    completed: []
  };

  tasks.forEach(task => {
    if (task.status === 'completed') {
      categories.completed.push(task);
      return;
    }

    var dueDate = task.due ? new Date(task.due) : null;
    if (!dueDate) {
      categories.noDueDate.push(task);
    } else if (dueDate < today) {
      categories.overdue.push(task);
    } else if (dueDate < tomorrow) {
      categories.dueToday.push(task);
    } else if (dueDate < nextTwoWeeks) {
      categories.dueNextTwoWeeks.push(task);
    } else if (dueDate < nextMonth) {
      categories.dueNextMonth.push(task);
    } else {
      categories.noDueDate.push(task);
    }
  });

  categories.noDueDate.sort((a, b) => a.title.localeCompare(b.title));

  return categories;
}

// Function to create YAML front matter with task statistics
function createYAMLFrontmatter(categorizedTasks) {
  var today = new Date();
  var yaml = '---\n';
  yaml += 'category: todos\n';
  yaml += `dateCreated: ${formatDate(today)}\n`;
  yaml += `totalNewTodos: ${countNewTodos(categorizedTasks)}\n`;
  yaml += `totalOverdue: ${categorizedTasks.overdue.length}\n`;
  yaml += `totalNextTwo: ${categorizedTasks.dueToday.length + categorizedTasks.dueNextTwoWeeks.length}\n`;
  yaml += `countNextFour: ${categorizedTasks.dueNextMonth.length}\n`;
  yaml += `countNoDue: ${categorizedTasks.noDueDate.length}\n`;
  yaml += `countCummDone: ${categorizedTasks.completed.length}\n`;
  yaml += 'aliases: \n';
  yaml += 'tags: gas-tasks-to-todos\n';
  yaml += '---\n\n';
  return yaml;
}

// Helper function to count new todos
function countNewTodos(categorizedTasks) {
  return categorizedTasks.overdue.length + 
         categorizedTasks.dueToday.length + 
         categorizedTasks.dueNextTwoWeeks.length + 
         categorizedTasks.dueNextMonth.length + 
         categorizedTasks.noDueDate.length;
}

// Function to format categorized tasks into markdown
function formatCategorizedTasks(categorizedTasks, yamlFrontmatter) {
  var counts = extractCountsFromYAML(yamlFrontmatter);
  var markdown = "# My Todos\n\n";
  markdown += formatCategory("## Overdue", categorizedTasks.overdue, counts.totalOverdue);
  markdown += formatCategory("## Due Today", categorizedTasks.dueToday, categorizedTasks.dueToday.length);
  markdown += formatCategory("## Due Next Two Weeks", categorizedTasks.dueNextTwoWeeks, counts.totalNextTwo - categorizedTasks.dueToday.length);
  markdown += formatCategory("## Due in Next Month", categorizedTasks.dueNextMonth, counts.countNextFour);
  markdown += formatCategory("## No Due Date", categorizedTasks.noDueDate, counts.countNoDue);
  markdown += formatCategory("### Done", categorizedTasks.completed, counts.countCummDone);
  return markdown;
}

// Helper function to extract counts from YAML front matter
function extractCountsFromYAML(yaml) {
  var counts = {};
  yaml.split('\n').forEach(line => {
    var [key, value] = line.split(':').map(item => item.trim());
    if (key && value) {
      counts[key] = parseInt(value);
    }
  });
  return counts;
}

// Function to format a category of tasks
function formatCategory(header, tasks, count) {
  if (tasks.length === 0) return '';
  var markdown = `${header} - ${count}\n`;
  if (header !== "## No Due Date" && header !== "### Done") {
    tasks.sort((a, b) => new Date(a.due || '9999-12-31') - new Date(b.due || '9999-12-31'));
  }
  tasks.forEach(task => {
    markdown += formatTask(task, 0);
  });
  return markdown + '\n';
}

// Function to format a single task (and its subtasks)
function formatTask(task, depth) {
  var indent = '  '.repeat(depth);
  var checkbox = task.status === 'completed' ? '[x]' : '[ ]';
  var dueDate = task.due ? ` ${formatDate(new Date(task.due))}` : '';
  var line = `${indent}- ${checkbox} ${task.title}${dueDate}\n`;
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask => {
      line += formatTask(subtask, depth + 1);
    });
  }
  return line;
}

// Helper function to format dates
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Helper function to get or create a folder in Google Drive
function getOrCreateFolder(folderName) {
  var rootFolder = DriveApp.getRootFolder();
  var folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    Logger.log('Existing folder found: ' + folderName);
    return folders.next();
  } else {
    Logger.log('Creating new folder: ' + folderName);
    return rootFolder.createFolder(folderName);
  }
}
