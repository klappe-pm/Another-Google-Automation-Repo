/**
 * Lists the titles and IDs of tasksList.
 * @see https://developers.google.com/tasks/reference/rest/v1/tasklists/list
 */
function listTaskLists() {
  try {
    // Returns all the authenticated user's task lists.
    const taskLists = Tasks.Tasklists.list();
    // If taskLists are available then print all tasklists.
    if (!taskLists.items) {
      console.log('No task lists found.');
      return;
    }
    // Print the tasklist title and tasklist id.
    for (let i = 0; i < taskLists.items.length; i++) {
      const taskList = taskLists.items[i];
      console.log('Task list with title "%s" and ID "%s" was found.', taskList.title, taskList.id);
    }
  } catch (err) {
    // TODO (developer) - Handle exception from Task API
    console.log('Failed with an error %s ', err.message);
  }
}