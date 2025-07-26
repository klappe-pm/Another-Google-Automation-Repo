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
