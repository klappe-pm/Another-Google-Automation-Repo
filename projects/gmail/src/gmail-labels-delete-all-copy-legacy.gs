/**
 * Script Title: Gmail Label Deletion Script
 *
 * Script Summary:
 * This script is designed to delete user-created labels in a Gmail account,
 * with an added confirmation step for user safety.
 *
 * Purpose:
 * The purpose of this script is to automate the process of removing user-created labels from a Gmail account.
 * It includes a crucial confirmation prompt to prevent accidental data loss.
 *
 * Description:
 * The script fetches all user-created labels and, after user confirmation, iterates through them,
 * deleting each one. It logs the process and any errors encountered.
 *
 * Problem Solved:
 * This script addresses the need to quickly and efficiently remove user-created labels from a Gmail account,
 * which can be useful for cleaning up or reorganizing an email inbox, now with an added layer of safety.
 *
 * Successful Execution:
 * A successful execution of this script results in the deletion of all user-created labels (after confirmation),
 * with logs confirming each deletion and a final success message.
 *
 * WARNING: This script will delete all of your Gmail labels, and this action cannot be undone.
 * A confirmation dialog will appear before any labels are deleted.
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
 * 1. Prompt the user for confirmation before proceeding with deletion.
 * 2. If confirmed, fetch all user-created labels from the Gmail account.
 * 3. Check if there are any user-created labels.
 * 4. If labels are found, log the total number of labels.
 * 5. Iterate through each label and attempt to delete it.
 * 6. Log the deletion of each label.
 * 7. Log a success message upon completion.
 * 8. If no labels are found, log a message indicating no labels were found.
 * 9. If an error occurs, log the error message.
 * 10. If the user cancels the operation, log a message indicating cancellation.
 */

/**
 * Helper Functions:
 * - None
 */

function deleteAllGmailLabels() {
  // Use Browser.msgBox for a more prominent and blocking confirmation
  // The UI class also offers similar functionality (Ui.alert), often preferred in add-ons
  const ui = SpreadsheetApp.getUi(); // Or DocumentApp.getUi(), FormApp.getUi() etc. if script is bound to them
  const response = ui.alert(
    'Delete All Gmail Labels?',
    'WARNING: This script will delete ALL of your user-created Gmail labels. This action cannot be undone.\n\nAre you sure you want to proceed?',
    ui.ButtonSet.YES_NO
  );

  // Process the user's response.
  if (response === ui.Button.NO) {
    Logger.log('Label deletion cancelled by user.');
    return; // Exit the function if the user says no
  }

  try {
    Logger.log('Gmail Label Deletion Script started.');

    // Fetch all user-created labels
    let labels = GmailApp.getUserLabels();

    if (labels.length === 0) {
      Logger.log('No user-created labels found.');
      return;
    }

    Logger.log('Total user-created labels found: ' + labels.length);

    // Iterate through the labels and delete them
    labels.forEach(label => {
      const labelName = label.getName(); // Store name before deletion for logging
      Logger.log('Attempting to delete label: ' + labelName);
      label.deleteLabel(); // Delete the label
      Logger.log('Successfully deleted label: ' + labelName);
    });

    Logger.log('All user-created labels have been deleted successfully.');
  } catch (e) {
    Logger.log('Error deleting labels: ' + e.message);
  } finally {
    Logger.log('Gmail Label Deletion Script execution completed.');
  }
}
