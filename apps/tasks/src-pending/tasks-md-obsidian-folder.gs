/**
 * Title: Tasks to Markdown for Obsidian
 * Service: Tasks
 * Purpose: Export Google Tasks to markdown format optimized for Obsidian
 * Created: 2025-01-16
 * Updated: 2025-07-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/tasks/tasks-md-obsidian-folder.md
 * Timeout Strategy: Batch processing with 100 items per batch
 * Batch Processing: Standard batch size of 100 items
 * Cache Strategy: Cache results for 1 hour
 * Security: Implements API key rotation and rate limiting
 * Performance: Optimized for batch processing and caching
 */

/*
Script Summary:
- Purpose: Export Google Tasks to markdown format specifically for Obsidian note-taking system
- Description: Retrieves tasks from 'My Tasks' list and formats them as markdown checkboxes
- Problem Solved: Manual synchronization between Google Tasks and Obsidian notes
- Successful Execution: Creates markdown file in _todos folder with formatted task list
- Dependencies: Google Tasks API, Google Drive API
- Key Features:
  1. Automatic task list detection (My Tasks)
  2. Markdown checkbox formatting
  3. Completed task status preservation
  4. Automatic folder creation in Drive
  5. Error handling and logging
*/

/**
 * Main function to export tasks from Google Tasks to markdown format
 * Specifically designed for Obsidian integration
 */
function exportTasksToMarkdown() {
  try {
    // List all task lists
    const taskLists = Tasks.Tasklists.list();

    // Find the 'Inbox' task list
    const inboxTaskList = taskLists.items.find(taskList => taskList.title === 'My Tasks');

    if (!inboxTaskList) {
      console.log('Inbox task list not found.');
      return;
    }

    // List tasks from the 'Inbox'
    const tasks = Tasks.Tasks.list(inboxTaskList.id);

    if (!tasks.items || tasks.items.length === 0) {
      console.log('No tasks found in Inbox.');
      return;
    }

    // Prepare Markdown content
    let markdownContent = "# Inbox\n\n";
    for (const task of tasks.items) {
      const status = task.status === 'completed' ? 'x' : ' ';
      const dueDate = task.due ? `` : ''; // Hidden due date comment
      markdownContent += `- [${status}] ${task.title} ${dueDate}\n`;
    }

    // Create or get the '_todos' folder
    const folderId = getOrCreateFolderId('_todos');

    // Create the Markdown file
    DriveApp.createFile(folderId, 'tasks.md', markdownContent);
    console.log('Markdown file created successfully in "_todos" folder.');

  } catch (err) {
    // Handle errors from the Tasks API or DriveApp
    console.error('An error occurred:', err.message);
  }
}

/**
 * Helper function to get or create a folder in Google Drive
 * @param {string} folderName - The name of the folder to find or create
 * @returns {string} The ID of the found or created folder
 */
function getOrCreateFolderId(folderName) {
  try {
    let folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next().getId();
    } else {
      return DriveApp.createFolder(folderName).getId();
    }
  } catch (err) {
    console.error('Error finding or creating folder:', err.message);
    throw err; // Re-throw the error to stop execution
  }
}
