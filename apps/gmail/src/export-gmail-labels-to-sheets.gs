/**
 * Script Name: export-gmail-labels-to-sheets
 * 
 * Script Summary:
 * Exports Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * - Extract gmail labels to sheets data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Process and transform data
 * 5. Format output for presentation
 * 6. Send notifications or reports
 * 
 * Script Functions:
 * - exportGmailLabelsToSheet(): Exports gmail labels to sheet to external format
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 */

/*  *  * Main function to export Gmail labels information to a Google Sheet */// Main Functions

// Main Functions

/**

 * Exports gmail labels to sheet to external format

 */

function exportGmailLabelsToSheet() {
  Logger.log('Entering exportGmailLabelsToSheet function'); // Define the sheet name;
  var sheetName = "GMail Labels";
  Logger.log('Sheet Name:', sheetName);

  try {
    Logger.log('Attempting to open bound spreadsheet'); // Open the bound spreadsheet;
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log('Bound spreadsheet opened successfully');

    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      Logger.log('Sheet not found. Creating new sheet:', sheetName); // If the sheet doesn't exist, create it;
      sheet = spreadsheet.insertSheet(sheetName);
      Logger.log('New sheet created');
    } else {
      Logger.log('Existing sheet found:', sheetName);
    }

    Logger.log('Clearing existing data from sheet'); // Clear the sheet of any existing data;
    sheet.clear();
    Logger.log('Sheet cleared');

    Logger.log('Setting header row'); // Set the header row;
    sheet.appendRow(["Labels", "Total Threads", "Total Emails"]);
    Logger.log('Header row set');

    Logger.log('Retrieving Gmail labels'); // Get all Gmail labels;
    var labels = GmailApp.getUserLabels();
    Logger.log('Total labels found:', labels.length);

    Logger.log('Processing labels'); // Loop through each label to get the name, thread count, and email count;
    labels.forEach(function (label, index) {
      Logger.log('Processing label', index + 1, 'of', labels.length);

      var labelName = label.getName();
      Logger.log('Label name:', labelName);

      var threads = label.getThreads();
      var totalThreads = threads.length;
      Logger.log('Total threads:', totalThreads); // Calculate the total number of emails for the label;
      var totalEmails = 0;
      threads.forEach(function (thread, threadIndex) {
        var messageCount = thread.getMessages().length;
        totalEmails += messageCount;
        Logger.log('Thread', threadIndex + 1, 'message count:', messageCount);
      });
      Logger.log('Total emails:', totalEmails);

      Logger.log('Appending row to sheet'); // Add the data to the sheet;
      sheet.appendRow([labelName, totalThreads, totalEmails]);
      Logger.log('Row appended');
    });

    Logger.log('All labels processed successfully'); // Log the completion of the operation;
    Logger.log("Gmail Labels have been updated in the sheet: " + sheetName);

  } catch (e) {
    console.error("Error in exportGmailLabelsToSheet:", e);
    Logger.log("Error: " + e.message);
  }

  Logger.log('Exiting exportGmailLabelsToSheet function');
}