/ * *
 * Script Name: markdown- export- tasks- todos
 *
 * Script Summary:
 * Exports markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Sort data by relevant fields
 * 6. Format output for presentation
 *
 * Script Functions:
 * - categorizeTasks(): Performs specialized operations
 * - createYAMLFrontmatter(): Creates new y a m l frontmatter or resources
 * - debug(): Performs specialized operations
 * - exportTasksToMarkdown(): Exports tasks to markdown to external format
 * - extractCountsFromYAML(): Extracts specific information
 * - getOrCreateFile(): Gets specific or create file or configuration
 * - getOrCreateFolder(): Gets specific or create folder or configuration
 * - onOpen(): Performs specialized operations
 * - showTasklistPrompt(): Checks boolean condition
 *
 * Script Helper Functions:
 * - countNewTodos(): Counts new todos or occurrences
 * - formatCategorizedTasks(): Formats categorized tasks for display
 * - formatCategory(): Formats category for display
 * - formatDate(): Formats date for display
 * - formatTask(): Formats task for display
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Tasks: For task list operations
 * /

let DEBUG = true;

/ * *
 * Creates a custom menu in the Google Sheets UI when the spreadsheet is opened.
 * / / * *
 * Displays a prompt for the user to enter a tasklist ID.
 * / / * *
 * Exports tasks from the specified tasklist to a markdown file.
 * / / * *
 * Gets or creates a file in the specified folder.
 * / / * *
 * Categorizes tasks based on their due dates.
 * @return {Object} An object containing categorized tasks.
 * / / * *
 * Creates YAML frontmatter with task statistics.
 * @param {Object} categorizedTasks - The object containing categorized tasks.
 * @return {string} The YAML frontmatter string.
 * / / * *
 * Counts the total number of new (non- completed) todos.
 * @param {Object} categorizedTasks - The object containing categorized tasks.
 * @return {number} The total count of new todos.
 * / / * *
 * Formats categorized tasks into markdown.
 * @param {Object} categorizedTasks - The object containing categorized tasks.
 * @param {string} yamlFrontmatter - The YAML frontmatter string.
 * @return {string} The formatted markdown string.
 * / / * *
 * Extracts count values from YAML frontmatter.
 * @param {string} yaml - The YAML frontmatter string.
 * @return {Object} An object containing extracted count values.
 * / / * *
 * Formats a category of tasks into markdown.
 * @param {string} header - The header for the category.
 * @param {Array} tasks - The array of tasks in the category.
 * @param {number} count - The count of tasks in the category.
 * @return {string} The formatted markdown string for the category.
 * / / * *
 * Formats a single task into markdown.
 * @param {Object} task - The task object to format.
 * @param {number} depth - The depth of the task (for subtasks).
 * @return {string} The formatted markdown string for the task.
 * / / * *
 * Formats a date object into a string.
 * @param {Date} date - The date to format.
 * @return {string} The formatted date string (YYYY- MM- DD).
 * / / * *
 * Gets or creates a folder in Google Drive.
 * @param {string} folderName - The name of the folder to get or create.
 * @return {Folder} The found or created folder.
 * / / / Main Functions

/ / Main Functions

/ * *

 * Performs specialized operations
 * @param
 * @param {any} tasks - The tasks parameter
 * @returns {number} The calculated value

 * /

function categorizeTasks(tasks) {
  debug('categorizeTasks function called with ' + tasks.length + ' tasks');
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let nextTwoWeeks = new Date(today);
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);
  let nextMonth = new Date(today);
  nextMonth.setDate(nextMonth.getDate() + 30);

  let categories = {
    overdue: [],
    dueToday: [],
    dueNextTwoWeeks: [],
    dueNextMonth: [],
    noDueDate: [],
    completed: []
  };

  tasks.forEach(task = > {
    debug('Categorizing task: ' + task.title);
    if (task.status = = = 'completed') {
      categories.completed.push(task);
      return;
    }

    let dueDate = task.due ? new Date(task.due) : null;
    if (! dueDate) {
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

  categories.noDueDate.sort((a, b) = > a.title.localeCompare(b.title));
  debug('Tasks categorized');

  return categories;
}

/ * *

 * Creates new y a m l frontmatter or resources
 * @param
 * @param {any} categorizedTasks - The categorizedTasks for creation
 * @returns {number} The newly created number

 * /

function createYAMLFrontmatter(categorizedTasks) {
  debug('createYAMLFrontmatter function called');
  let today = new Date();
  let yaml = '- - - \n';
  yaml + = 'category: todos\n';
  yaml + = `dateCreated: ${formatDate(today)}\n`;
  yaml + = `totalNewTodos: ${countNewTodos(categorizedTasks)}\n`;
  yaml + = `totalOverdue: ${categorizedTasks.overdue.length}\n`;
  yaml + = `totalNextTwo: ${categorizedTasks.dueToday.length + categorizedTasks.dueNextTwoWeeks.length}\n`;
  yaml + = `countNextFour: ${categorizedTasks.dueNextMonth.length}\n`;
  yaml + = `countNoDue: ${categorizedTasks.noDueDate.length}\n`;
  yaml + = `countCummDone: ${categorizedTasks.completed.length}\n`;
  yaml + = 'aliases: \n';
  yaml + = 'tags: gas- tasks- to- todos\n';
  yaml + = '- - - \n\n';
  debug('YAML frontmatter created');
  return yaml;
}

/ * *

 * Performs specialized operations
 * @param
 * @param {string} message - The message content
 * @returns {number} The calculated value

 * /

function debug(message) {
  if (DEBUG) {
    Logger.log('DEBUG: ' + message);
  }
}

/ * *

 * Exports tasks to markdown to external format
 * @param
 * @param {string} tasklistId - The tasklistId parameter
 * @returns {number} The calculated value

 * /

function exportTasksToMarkdown(tasklistId) {
  debug('exportTasksToMarkdown function called with tasklistId: ' + tasklistId);
  try {
    let tasks = Tasks.Tasks.list(tasklistId, {showHidden: true, maxResults: 100});
    debug('Retrieved ' + (tasks.items ? tasks.items.length : 0) + ' tasks');

    let categorizedTasks = categorizeTasks(tasks.items || []);
    debug('Tasks categorized');
    let yamlFrontmatter = createYAMLFrontmatter(categorizedTasks);
    debug('YAML frontmatter created');
    let markdown = yamlFrontmatter + formatCategorizedTasks(categorizedTasks, yamlFrontmatter);
    debug('Markdown content generated');

    let folder = getOrCreateFolder('_todos');
    debug('_todos folder accessed or created');

    let fileName = 'myTodos.md';
    let file = getOrCreateFile(folder, fileName);
    file.setContent(markdown);
    debug('myTodos.md file updated in _todos folder');

    SpreadsheetApp.getUi().alert('Tasks exported successfully to ' + file.getName());
    debug('Task export completed successfully');
  } catch (error) {
    Logger.log('ERROR: Error during task export: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/ * *

 * Extracts specific information
 * @param
 * @param {any} yaml - The yaml parameter
 * @returns {number} The total count

 * /

function extractCountsFromYAML(yaml) {
  debug('extractCountsFromYAML function called');
  let counts = {};
  yaml.split('\n').forEach(line = > {
    let [key, value] = line.split(':').map(item = > item.trim());
    if (key && value) {
      counts[key] = parseInt(value);
    }
  });
  debug('Counts extracted from YAML');
  return counts;
}

/ * *

 * Gets specific or create file or configuration
 * @param
 * @param {Folder} folder - The folder to retrieve
 * @param {string} fileName - The fileName to retrieve
 * @returns {number} The requested number

 * /

function getOrCreateFile(folder, fileName) {
  debug('getOrCreateFile function called with fileName: ' + fileName);
  let files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    debug('Existing file found: ' + fileName);
    return files.next();
  } else {
    debug('Creating new file: ' + fileName);
    return folder.createFile(fileName, '', MimeType.PLAIN_TEXT);
  }
}

/ * *

 * Gets specific or create folder or configuration
 * @param
 * @param {string} folderName - The folderName to retrieve
 * @returns {number} The requested number

 * /

function getOrCreateFolder(folderName) {
  debug('getOrCreateFolder function called for folder: ' + folderName);
  let rootFolder = DriveApp.getRootFolder();
  let folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    debug('Existing folder found: ' + folderName);
    return folders.next();
  } else {
    debug('Creating new folder: ' + folderName);
    return rootFolder.createFolder(folderName);
  }
}

/ * *

 * Performs specialized operations
 * @returns {number} The calculated value

 * /

function onOpen() {
  debug('onOpen function called');
  SpreadsheetApp.getUi()
    .createMenu('Tasks to _todos')
    .addItem('Export Tasks', 'showTasklistPrompt')
    .addToUi();
  debug('Custom menu added to the spreadsheet');
}

/ * *

 * Checks boolean condition
 * @returns {number} True if condition is met, false otherwise

 * /

function showTasklistPrompt() {
  debug('showTasklistPrompt function called');
  let ui = SpreadsheetApp.getUi();
  let result = ui.prompt(
    'Enter Tasklist ID',
    'Please enter the ID of the tasklist you want to export:',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() = = ui.Button.OK) {
    let tasklistId = result.getResponseText();
    debug('User entered tasklist ID: ' + tasklistId);
    exportTasksToMarkdown(tasklistId);
  } else {
    debug('User cancelled the tasklist ID prompt');
  }
}

/ / Helper Functions

/ * *

 * Counts new todos or occurrences
 * @param
 * @param {any} categorizedTasks - The categorizedTasks parameter
 * @returns {number} The total count

 * /

function countNewTodos(categorizedTasks) {
  debug('countNewTodos function called');
  return categorizedTasks.overdue.length +
         categorizedTasks.dueToday.length +
         categorizedTasks.dueNextTwoWeeks.length +
         categorizedTasks.dueNextMonth.length +
         categorizedTasks.noDueDate.length;
}

/ * *

 * Formats categorized tasks for display
 * @param
 * @param {any} categorizedTasks - The categorizedTasks parameter
 * @param {any} yamlFrontmatter - The yamlFrontmatter parameter
 * @returns {number} The calculated value

 * /

function formatCategorizedTasks(categorizedTasks, yamlFrontmatter) {
  debug('formatCategorizedTasks function called');
  let counts = extractCountsFromYAML(yamlFrontmatter);
  let markdown = "# My Todos\n\n";
  markdown + = formatCategory("## Overdue", categorizedTasks.overdue, counts.totalOverdue);
  markdown + = formatCategory("## Due Today", categorizedTasks.dueToday, categorizedTasks.dueToday.length);
  markdown + = formatCategory("## Due Next Two Weeks", categorizedTasks.dueNextTwoWeeks, counts.totalNextTwo - categorizedTasks.dueToday.length);
  markdown + = formatCategory("## Due in Next Month", categorizedTasks.dueNextMonth, counts.countNextFour);
  markdown + = formatCategory("## No Due Date", categorizedTasks.noDueDate, counts.countNoDue);
  markdown + = formatCategory("### Done", categorizedTasks.completed, counts.countCummDone);
  debug('Categorized tasks formatted into markdown');
  return markdown;
}

/ * *

 * Formats category for display
 * @param
 * @param {any} header - The header parameter
 * @param {any} tasks - The tasks parameter
 * @param {number} count - The number of items
 * @returns {number} The calculated value

 * /

function formatCategory(header, tasks, count) {
  debug('formatCategory function called for: ' + header);
  if (tasks.length = = = 0) return '';
  let markdown = `${header} - ${count}\n`;
  if (header ! = = "## No Due Date" && header ! = = "### Done") {
    tasks.sort((a, b) = > new Date(a.due || '9999- 12- 31') - new Date(b.due || '9999- 12- 31'));
  }
  tasks.forEach(task = > {
    markdown + = formatTask(task, 0);
  });
  return markdown + '\n';
}

/ * *

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @returns {number} The calculated value

 * /

function formatDate(date) {
  debug('formatDate function called for date: ' + date);
  return `${date.getFullYear()}- ${String(date.getMonth() + 1).padStart(2, '0')}- ${String(date.getDate()).padStart(2, '0')}`;
}

/ * *

 * Formats task for display
 * @param
 * @param {any} task - The task parameter
 * @param {any} depth - The depth parameter
 * @returns {number} The calculated value

 * /

function formatTask(task, depth) {
  debug('formatTask function called for task: ' + task.title);
  let indent = '  '.repeat(depth);
  let checkbox = task.status = = = 'completed' ? '[x]' : '[ ]';
  let dueDate = task.due ? ` ${formatDate(new Date(task.due))}` : '';
  let line = `${indent}- ${checkbox} ${task.title}${dueDate}\n`;
  if (task.subtasks && task.subtasks.length > 0) {
    task.subtasks.forEach(subtask = > {
      line + = formatTask(subtask, depth + 1);
    });
  }
  return line;
}