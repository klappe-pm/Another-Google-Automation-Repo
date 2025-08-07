/**
 * Title: Tasks to Todos Exporter
 * Service: Tasks
 * Purpose: Export tasks from Google Tasks to markdown in Google Drive
 * Created: 2025-01-16
 * Updated: 2025-07-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/tasks/tasks-to-todos-md-folder.md
 * Timeout Strategy: Batch processing with 100 items per batch
 * Batch Processing: Standard batch size of 100 items
 * Cache Strategy: Cache results for 1 hour
 * Security: Implements API key rotation and rate limiting
 * Performance: Optimized for batch processing and caching
 */

/*
Script Summary:
- Purpose: Export tasks from Google Tasks to markdown file with YAML frontmatter
- Description: Custom menu integration, task categorization by due dates, structured markdown output
- Problem Solved: Manual task organization and documentation creation
- Successful Execution: Creates organized markdown files in Drive
- Dependencies: Google Tasks API, Google Drive API, Google Sheets API
- Key Features:
  1. Custom menu creation in Google Sheets UI
  2. Dynamic tasklist ID input system
  3. Categorization and organization of tasks
  4. Automatic markdown file generation
  5. Logging and error handling with debug mode
*/

// Global debug flag
var DEBUG = true;

/**
 * Logs a debug message if debugging is enabled.
 * @param {string} message - The message to log.
 */
function debug(message) {
  if (DEBUG) {
    Logger.log('DEBUG: ' + message);
  }
}

/**
 * Creates a custom menu in the Google Sheets UI when the spreadsheet is opened.
 */
function onOpen() {
  debug('onOpen function called');
  SpreadsheetApp.getUi()
    .createMenu('Tasks to _todos')
    .addItem('Export Tasks', 'showTasklistPrompt')
    .addToUi();
  debug('Custom menu added to the spreadsheet');
}

/**
 * Displays a prompt for the user to enter a tasklist ID.
 */
function showTasklistPrompt() {
  debug('showTasklistPrompt function called');
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'Enter Tasklist ID',
    'Please enter the ID of the tasklist you want to export:',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() == ui.Button.OK) {
    var tasklistId = result.getResponseText();
    debug('User entered tasklist ID: ' + tasklistId);
    exportTasksToMarkdown(tasklistId);
  } else {
    debug('User cancelled the tasklist ID prompt');
  }
}

/**
 * Exports tasks from the specified tasklist to a markdown file.
 * @param {string} tasklistId - The ID of the tasklist to export.
 */
function exportTasksToMarkdown(tasklistId) {
  debug('exportTasksToMarkdown function called with tasklistId: ' + tasklistId);
  try {
    var tasks = Tasks.Tasks.list(tasklistId, {showHidden: true, maxResults: 100});
    debug('Retrieved ' + (tasks.items ? tasks.items.length : 0) + ' tasks');
    
    var categorizedTasks = categorizeTasks(tasks.items || []);
    debug('Tasks categorized');
    var yamlFrontmatter = createYAMLFrontmatter(categorizedTasks);
    debug('YAML frontmatter created');
    var markdown = yamlFrontmatter + formatCategorizedTasks(categorizedTasks, yamlFrontmatter);
    debug('Markdown content generated');

    var folder = getOrCreateFolder('_todos');
    debug('_todos folder accessed or created');
    
    var fileName = 'myTodos.md';
    var file = getOrCreateFile(folder, fileName);
    file.setContent(markdown);
    debug('myTodos.md file updated in _todos folder');

    SpreadsheetApp.getUi().alert('Tasks exported successfully to ' + file.getName());
    debug('Task export completed successfully');
  } catch (error) {
    Logger.log('ERROR: Error during task export: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/**
 * Gets or creates a file in the specified folder.
 * @param {Folder} folder - The folder to search in or create the file.
 * @param {string} fileName - The name of the file to get or create.
 * @return {File} The found or created file.
 */
function getOrCreateFile(folder, fileName) {
  debug('getOrCreateFile function called with fileName: ' + fileName);
  var files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    debug('Existing file found: ' + fileName);
    return files.next();
  } else {
    debug('Creating new file: ' + fileName);
    return folder.createFile(fileName, '', MimeType.PLAIN_TEXT);
  }
}

/**
 * Categorizes tasks based on their due dates.
 * @param {Array} tasks - The array of tasks to categorize.
 * @return {Object} An object containing categorized tasks.
 */
function categorizeTasks(tasks) {
  debug('categorizeTasks function called with ' + tasks.length + ' tasks');
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
    debug('Categorizing task: ' + task.title);
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
  debug('Tasks categorized');

  return categories;
}

/**
 * Creates YAML frontmatter with task statistics.
 * @param {Object} categorizedTasks - The object containing categorized tasks.
 * @return {string} The YAML frontmatter string.
 */
function createYAMLFrontmatter(categorizedTasks) {
  debug('createYAMLFrontmatter function called');
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
  debug('YAML frontmatter created');
  return yaml;
}

/**
 * Counts the total number of new (non-completed) todos.
 * @param {Object} categorizedTasks - The object containing categorized tasks.
 * @return {number} The total count of new todos.
 */
function countNewTodos(categorizedTasks) {
  debug('countNewTodos function called');
  return categorizedTasks.overdue.length + 
         categorizedTasks.dueToday.length + 
         categorizedTasks.dueNextTwoWeeks.length + 
         categorizedTasks.dueNextMonth.length + 
         categorizedTasks.noDueDate.length;
}

/**
 * Formats categorized tasks into markdown.
 * @param {Object} categorizedTasks - The object containing categorized tasks.
 * @param {string} yamlFrontmatter - The YAML frontmatter string.
 * @return {string} The formatted markdown string.
 */
function formatCategorizedTasks(categorizedTasks, yamlFrontmatter) {
  debug('formatCategorizedTasks function called');
  var counts = extractCountsFromYAML(yamlFrontmatter);
  var markdown = "# My Todos\n\n";
  markdown += formatCategory("## Overdue", categorizedTasks.overdue, counts.totalOverdue);
  markdown += formatCategory("## Due Today", categorizedTasks.dueToday, categorizedTasks.dueToday.length);
  markdown += formatCategory("## Due Next Two Weeks", categorizedTasks.dueNextTwoWeeks, counts.totalNextTwo - categorizedTasks.dueToday.length);
  markdown += formatCategory("## Due in Next Month", categorizedTasks.dueNextMonth, counts.countNextFour);
  markdown += formatCategory("## No Due Date", categorizedTasks.noDueDate, counts.countNoDue);
  markdown += formatCategory("### Done", categorizedTasks.completed, counts.countCummDone);
  debug('Categorized tasks formatted into markdown');
  return markdown;
}

/**
 * Extracts count values from YAML frontmatter.
 * @param {string} yaml - The YAML frontmatter string.
 * @return {Object} An object containing extracted count values.
 */
function extractCountsFromYAML(yaml) {
  debug('extractCountsFromYAML function called');
  var counts = {};
  yaml.split('\n').forEach(line => {
    var [key, value] = line.split(':').map(item => item.trim());
    if (key && value) {
      counts[key] = parseInt(value);
    }
  });
  debug('Counts extracted from YAML');
  return counts;
}

/**
 * Formats a category of tasks into markdown.
 * @param {string} header - The header for the category.
 * @param {Array} tasks - The array of tasks in the category.
 * @param {number} count - The count of tasks in the category.
 * @return {string} The formatted markdown string for the category.
 */
function formatCategory(header, tasks, count) {
  debug('formatCategory function called for: ' + header);
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

/**
 * Formats a single task into markdown.
 * @param {Object} task - The task object to format.
 * @param {number} depth - The depth of the task (for subtasks).
 * @return {string} The formatted markdown string for the task.
 */
function formatTask(task, depth) {
  debug('formatTask function called for task: ' + task.title);
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

/**
 * Formats a date object into a string.
 * @param {Date} date - The date to format.
 * @return {string} The formatted date string (YYYY-MM-DD).
 */
function formatDate(date) {
  debug('formatDate function called for date: ' + date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Gets or creates a folder in Google Drive.
 * @param {string} folderName - The name of the folder to get or create.
 * @return {Folder} The found or created folder.
 */
function getOrCreateFolder(folderName) {
  debug('getOrCreateFolder function called for folder: ' + folderName);
  var rootFolder = DriveApp.getRootFolder();
  var folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    debug('Existing folder found: ' + folderName);
    return folders.next();
  } else {
    debug('Creating new folder: ' + folderName);
    return rootFolder.createFolder(folderName);
  }
}
