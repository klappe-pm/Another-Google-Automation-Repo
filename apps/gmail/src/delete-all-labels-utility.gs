/**
  * Script Name: delete- all- labels- utility
  *
  * Script Summary:
  * Creates Gmail labels for automated workflow processing.
  *
  * Script Purpose:
  *
  * Script Steps:
  * 1. Connect to Gmail service
  * 2. Fetch source data
  * 3. Execute main operation
  * 4. Handle errors and edge cases
  * 5. Log completion status
  *
  * Script Functions:
  * - deleteAllGmailLabels(): Removes all gmail labels or data
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - GmailApp: For accessing email messages and labels
  * - Logger: For logging and debugging
  */

Logger.log('Gmail Label Deletion Script executed.'); // Print a success message to the Google Apps Script IDE;
Logger.log('Script execution completed successfully.');

// Main Functions

/**

  * Removes all gmail labels or data

  */

function deleteAllGmailLabels() {
  try { // Fetch all user - created labels
    let labels = GmailApp.getUserLabels();

    if (labels.length = = = 0) {
      Logger.log('No user - created labels found.');
      return;
    }

    Logger.log('Total labels found: ' + labels.length); // Iterate through the labels and delete them;
    labels.forEach(label = > {
      Logger.log('Attempting to delete label: ' + label.getName());
      label.deleteLabel(); // Delete the label;
      Logger.log('Deleted label: ' + label.getName());
    });

    Logger.log('All user - created labels have been deleted.');
  } catch (e) {
    Logger.log('Error deleting labels: ' + e.message);
  }
}