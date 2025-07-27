/ * *
 * Script Name: markdown- export- tasklist- yaml
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

/ / Main Functions

/ * *

 * Performs specialized operations
 * @param
 * @param {any} tasks - The tasks parameter
 * @returns {any} The result

 * /

function categorizeTasks(tasks) {
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

  return categories;
}

/ * *

 * Creates new y a m l frontmatter or resources
 * @param
 * @param {any} categorizedTasks - The categorizedTasks for creation
 * @returns {any} The newly created any

 * /

function createYAMLFrontmatter(categorizedTasks) {
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
  return yaml;
}

/ * *

 * Exports tasks to markdown to external format
 * @param
 * @param {string} tasklistId - The tasklistId parameter
 * @returns {any} The result

 * /

function exportTasksToMarkdown(tasklistId) {
  try {
    Logger.log('Starting task export for tasklist ID: ' + tasklistId);
    let tasks = Tasks.Tasks.list(tasklistId, {showHidden: true, maxResults: 100});
    Logger.log('Retrieved ' + (tasks.items ? tasks.items.length : 0) + ' tasks');

    let categorizedTasks = categorizeTasks(tasks.items || []);
    let yamlFrontmatter = createYAMLFrontmatter(categorizedTasks);
    let markdown = yamlFrontmatter + formatCategorizedTasks(categorizedTasks, yamlFrontmatter);

    let folder = getOrCreateFolder('_todos');
    Logger.log('_todos folder accessed or created');

    let fileName = 'myTodos.md';
    let file = getOrCreateFile(folder, fileName);
    file.setContent(markdown);
    Logger.log('myTodos.md file updated in _todos folder');

    SpreadsheetApp.getUi().alert('Tasks exported successfully to ' + file.getName());
    Logger.log('Task export completed successfully');
  } catch (error) {
    Logger.log('Error during task export: ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}

/ * *

 * Extracts specific information
 * @param
 * @param {any} yaml - The yaml parameter
 * @returns {any} The total count

 * /

function extractCountsFromYAML(yaml) {
  let counts = {};
  yaml.split('\n').forEach(line = > {
    let [key, value] = line.split(':').map(item = > item.trim());
    if (key && value) {
      counts[key] = parseInt(value);
    }
  });
  return counts;
}

/ * *

 * Gets specific or create file or configuration
 * @param
 * @param {Folder} folder - The folder to retrieve
 * @param {string} fileName - The fileName to retrieve
 * @returns {any} The requested any

 * /

function getOrCreateFile(folder, fileName) {
  let files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    Logger.log('Existing file found: ' + fileName);
    return files.next();
  } else {
    Logger.log('Creating new file: ' + fileName);
    return folder.createFile(fileName, '', MimeType.PLAIN_TEXT);
  }
}

/ * *

 * Gets specific or create folder or configuration
 * @param
 * @param {string} folderName - The folderName to retrieve
 * @returns {any} The requested any

 * /

function getOrCreateFolder(folderName) {
  let rootFolder = DriveApp.getRootFolder();
  let folders = rootFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    Logger.log('Existing folder found: ' + folderName);
    return folders.next();
  } else {
    Logger.log('Creating new folder: ' + folderName);
    return rootFolder.createFolder(folderName);
  }
}

/ * *

 * Performs specialized operations
 * @returns {any} The result

 * /

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tasks to _todos')
    .addItem('Export Tasks', 'showTasklistPrompt')
    .addToUi();
  Logger.log('Custom menu added to the spreadsheet');
}

/ * *

 * Checks boolean condition
 * @returns {any} True if condition is met, false otherwise

 * /

function showTasklistPrompt() {
  let ui = SpreadsheetApp.getUi();
  let result = ui.prompt(
    'Enter Tasklist ID',
    'Please enter the ID of the tasklist you want to export:',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() = = ui.Button.OK) {
    let tasklistId = result.getResponseText();
    Logger.log('User entered tasklist ID: ' + tasklistId);
    exportTasksToMarkdown(tasklistId);
  } else {
    Logger.log('User cancelled the tasklist ID prompt');
  }
}

/ / Helper Functions

/ * *

 * Counts new todos or occurrences
 * @param
 * @param {any} categorizedTasks - The categorizedTasks parameter
 * @returns {any} The total count

 * /

function countNewTodos(categorizedTasks) {
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
 * @returns {any} The result

 * /

function formatCategorizedTasks(categorizedTasks, yamlFrontmatter) {
  let counts = extractCountsFromYAML(yamlFrontmatter);
  let markdown = "# My Todos\n\n";
  markdown + = formatCategory("## Overdue", categorizedTasks.overdue, counts.totalOverdue);
  markdown + = formatCategory("## Due Today", categorizedTasks.dueToday, categorizedTasks.dueToday.length);
  markdown + = formatCategory("## Due Next Two Weeks", categorizedTasks.dueNextTwoWeeks, counts.totalNextTwo - categorizedTasks.dueToday.length);
  markdown + = formatCategory("## Due in Next Month", categorizedTasks.dueNextMonth, counts.countNextFour);
  markdown + = formatCategory("## No Due Date", categorizedTasks.noDueDate, counts.countNoDue);
  markdown + = formatCategory("### Done", categorizedTasks.completed, counts.countCummDone);
  return markdown;
}

/ * *

 * Formats category for display
 * @param
 * @param {any} header - The header parameter
 * @param {any} tasks - The tasks parameter
 * @param {number} count - The number of items
 * @returns {any} The result

 * /

function formatCategory(header, tasks, count) {
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
 * @returns {any} The result

 * /

function formatDate(date) {
  return `${date.getFullYear()}- ${String(date.getMonth() + 1).padStart(2, '0')}- ${String(date.getDate()).padStart(2, '0')}`;
}

/ * *

 * Formats task for display
 * @param
 * @param {any} task - The task parameter
 * @param {any} depth - The depth parameter
 * @returns {any} The result

 * /

function formatTask(task, depth) {
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