/**
 * Script Title: Gmail Labels Export Script
 *
 * GitHub: https://github.com/klappe-pm/GMail-Label-Management-Suite/blob/main/gmail-labels-statistics
 * Script Summary:
 * This script exports information about Gmail labels to a Google Sheet. It includes the label name,
 * total number of threads, and total number of emails for each label. The script connects to the
 * bound Google Sheet, creates a new sheet if it doesn't exist, clears existing data to ensure
 * fresh information, retrieves all user-created Gmail labels, counts threads and emails for each
 * label, and exports the data to the sheet. It includes error handling and logging for robustness.
 *
 * Purpose:
 * The purpose of this script is to provide a summary of Gmail labels in a Google Sheet, making it
 * easier to analyze and manage email organization.
 *
 * Problem Solved:
 * This script solves the problem of manually tracking and analyzing Gmail labels by automating the
 * process and exporting the data to a Google Sheet for easy access and analysis.
 *
 * Successful Execution:
 * A successful execution of this script results in a Google Sheet containing up-to-date information
 * about all Gmail labels, including the label name, total number of threads, and total number of
 * emails for each label. The script logs its progress and any errors encountered.
 *
 * Functions-Alphabetical:
 * - exportGmailLabelsToSheet(): Main function to export Gmail labels information to a Google Sheet.
 *
 * Functions-Ordered:
 * 1. exportGmailLabelsToSheet(): Main function to export Gmail labels information to a Google Sheet.
 *
 * Script-Steps:
 * 1. Open the bound spreadsheet.
 * 2. Define the sheet name.
 * 3. Check if the specified sheet exists; if not, create it.
 * 4. Clear any existing data from the sheet.
 * 5. Set the header row in the sheet.
 * 6. Retrieve all user-created Gmail labels.
 * 7. Loop through each label to get the name, thread count, and email count.
 * 8. Append the data for each label to the sheet.
 * 9. Log the completion of the operation.
 *
 * Helper Functions:
 * - None (all functionality is contained within the main function)
 */

/**
 * Main function to export Gmail labels information to a Google Sheet
 */
function exportGmailLabelsToSheet() {
  console.log('Entering exportGmailLabelsToSheet function');

  // Define the sheet name
  var sheetName = "GMail Labels";
  console.log('Sheet Name:', sheetName);

  try {
    console.log('Attempting to open bound spreadsheet');
    // Open the bound spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('Bound spreadsheet opened successfully');

    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      console.log('Sheet not found. Creating new sheet:', sheetName);
      // If the sheet doesn't exist, create it
      sheet = spreadsheet.insertSheet(sheetName);
      console.log('New sheet created');
    } else {
      console.log('Existing sheet found:', sheetName);
    }

    console.log('Clearing existing data from sheet');
    // Clear the sheet of any existing data
    sheet.clear();
    console.log('Sheet cleared');

    console.log('Setting header row');
    // Set the header row
    sheet.appendRow(["Labels", "Total Threads", "Total Emails"]);
    console.log('Header row set');

    console.log('Retrieving Gmail labels');
    // Get all Gmail labels
    var labels = GmailApp.getUserLabels();
    console.log('Total labels found:', labels.length);

    console.log('Processing labels');
    // Loop through each label to get the name, thread count, and email count
    labels.forEach(function(label, index) {
      console.log('Processing label', index + 1, 'of', labels.length);

      var labelName = label.getName();
      console.log('Label name:', labelName);

      var threads = label.getThreads();
      var totalThreads = threads.length;
      console.log('Total threads:', totalThreads);

      // Calculate the total number of emails for the label
      var totalEmails = 0;
      threads.forEach(function(thread, threadIndex) {
        var messageCount = thread.getMessages().length;
        totalEmails += messageCount;
        console.log('Thread', threadIndex + 1, 'message count:', messageCount);
      });
      console.log('Total emails:', totalEmails);

      console.log('Appending row to sheet');
      // Add the data to the sheet
      sheet.appendRow([labelName, totalThreads, totalEmails]);
      console.log('Row appended');
    });

    console.log('All labels processed successfully');
    // Log the completion of the operation
    Logger.log("Gmail Labels have been updated in the sheet: " + sheetName);

  } catch (e) {
    console.error("Error in exportGmailLabelsToSheet:", e);
    Logger.log("Error: " + e.message);
  }

  console.log('Exiting exportGmailLabelsToSheet function');
}