/**
 * Script Title: Gmail Label Deletion Script
 * 
 * GitHub: https://github.com/klappe-pm/GMail-Label-Management-Suite/blob/main/gmail-labels-delete-all
 *
 * Script Summary:
 * This script is designed to delete all user-created labels in a Gmail account.
 *
 * Purpose:
 * The purpose of this script is to automate the process of removing all user-created labels from a Gmail account.
 *
 * Description:
 * The script fetches all user-created labels and iterates through them, deleting each one. It logs the process and any errors encountered.
 *
 * Problem Solved:
 * This script addresses the need to quickly and efficiently remove all user-created labels from a Gmail account, which can be useful for cleaning up or reorganizing an email inbox.
 *
 * Successful Execution:
 * A successful execution of this script results in the deletion of all user-created labels, with logs confirming each deletion and a final success message.
 *
 * WARNING: This script will delete all of your Gmail labels, and this action cannot be undone.
 */

/**
 * Functions-Alphabetical:
 * - deleteAllGmailLabels(): Deletes all user-created labels in the Gmail account.
 */

/**
 * Functions-Ordered:
 * 1. deleteAllGmailLabels(): Deletes all user-created labels in the Gmail account.
 */

/**
 * Script-Steps:
 * 1. Fetch all user-created labels from the Gmail account.
 * 2. Check if there are any user-created labels.
 * 3. If labels are found, log the total number of labels.
 * 4. Iterate through each label and attempt to delete it.
 * 5. Log the deletion of each label.
 * 6. Log a success message upon completion.
 * 7. If no labels are found, log a message indicating no labels were found.
 * 8. If an error occurs, log the error message.
 */

/**
 * Helper Functions:
 * - None
 */

function deleteAllGmailLabels() {
  try {
    // Fetch all user-created labels
    let labels = GmailApp.getUserLabels();

    if (labels.length === 0) {
      Logger.log('No user-created labels found.');
      return;
    }

    Logger.log('Total labels found: ' + labels.length);

    // Iterate through the labels and delete them
    labels.forEach(label => {
      Logger.log('Attempting to delete label: ' + label.getName());
      label.deleteLabel(); // Delete the label
      Logger.log('Deleted label: ' + label.getName());
    });

    Logger.log('All user-created labels have been deleted.');
  } catch (e) {
    Logger.log('Error deleting labels: ' + e.message);
  }
}

// Print script execution to the Google Apps Script IDE
Logger.log('Gmail Label Deletion Script executed.');

// Print a success message to the Google Apps Script IDE
Logger.log('Script execution completed successfully.');