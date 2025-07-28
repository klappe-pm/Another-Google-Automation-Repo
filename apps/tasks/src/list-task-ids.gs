/**
 * Script Name: list- task- ids
 *
 * Script Summary:
 * Manages tasks for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Execute main operation
 * 2. Handle errors and edge cases
 * 3. Log completion status
 *
 * Script Functions:
 * - listTaskLists(): Checks boolean condition
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - Tasks: For task list operations
 */

// Main Functions

/**

 * Checks boolean condition

 */

function listTaskLists() {
  try {
    // Returns all the authenticated user's task lists.
    const taskLists = Tasks.Tasklists.list();
    // If taskLists are available then print all tasklists.
    if (! taskLists.items) {
      console.log('No task lists found.');
      return;
    }
    // Print the tasklist title and tasklist id.
    for (let i = 0; i < taskLists.items.length; i+ + ) {
      const taskList = taskLists.items[i];
      console.log('Task list with title "% s" and ID "% s" was found.', taskList.title, taskList.id);
    }
  } catch (err) {
    // TODO (developer) - Handle exception from Task API
    console.log('Failed with an error % s ', err.message);
  }
}