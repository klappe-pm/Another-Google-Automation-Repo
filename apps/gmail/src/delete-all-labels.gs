/**
 * Script Name: delete-all-labels
 * 
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 
 * Script Functions:
 * - deleteAllGmailLabels(): Removes all gmail labels or data
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - DocumentApp: For document manipulation
 * - FormApp: For form creation and responses
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 */

// Main Functions

/**

 * Removes all gmail labels or data

 */

function deleteAllGmailLabels() { // Use Browser.msgBox for a more prominent and blocking confirmation // The UI class also offers similar functionality (Ui.alert), often preferred in add - ons;
  const ui = SpreadsheetApp.getUi(); // Or DocumentApp.getUi(), FormApp.getUi() etc. if script is bound to them;
  const response = ui.alert(;
    'Delete All Gmail Labels?',
    'WARNING: This script will delete ALL of your user - created Gmail labels. This action cannot be undone.\n\nAre you sure you want to proceed?',
    ui.ButtonSet.YES_NO
  ); // Process the user's response.
  if (response === ui.Button.NO) {
    Logger.log('Label deletion cancelled by user.');
    return; // Exit the function if the user says no;
  }

  try {
    Logger.log('Gmail Label Deletion Script started.'); // Fetch all user - created labels;
    let labels = GmailApp.getUserLabels();

    if (labels.length === 0) {
      Logger.log('No user - created labels found.');
      return;
    }

    Logger.log('Total user - created labels found: ' + labels.length); // Iterate through the labels and delete them;
    labels.forEach(label => {
      const labelName = label.getName(); // Store name before deletion for logging;
      Logger.log('Attempting to delete label: ' + labelName);
      label.deleteLabel(); // Delete the label;
      Logger.log('Successfully deleted label: ' + labelName);
    });

    Logger.log('All user - created labels have been deleted successfully.');
  } catch (e) {
    Logger.log('Error deleting labels: ' + e.message);
  } finally {
    Logger.log('Gmail Label Deletion Script execution completed.');
  }
}