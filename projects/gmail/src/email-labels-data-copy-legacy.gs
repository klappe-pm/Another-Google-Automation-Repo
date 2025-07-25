/**
 * Gmail Labels Export Script
 * 
 * This script exports information about Gmail labels to a Google Sheet.
 * It includes the label name, total number of threads, and total number of emails for each label.
 * 
 * Key features:
 * 1. Connects to a specific Google Sheet
 * 2. Creates a new sheet if it doesn't exist
 * 3. Clears existing data to ensure fresh information
 * 4. Retrieves all user-created Gmail labels
 * 5. Counts threads and emails for each label
 * 6. Exports data to the sheet
 * 7. Includes error handling and logging
 */

/**
 * Main function to export Gmail labels information to a Google Sheet
 */
function exportGmailLabelsToSheet() {
  console.log('Entering exportGmailLabelsToSheet function');
  
  // Define the spreadsheet ID and the sheet name
  var sheetId = "1BphNcua2k7w18o5nI0j407q-DNLnPIGve4w9uwJhBWE"; // Provided Sheet ID
  var sheetName = "GMail Labels";
  
  console.log('Sheet ID:', sheetId);
  console.log('Sheet Name:', sheetName);
  
  try {
    console.log('Attempting to open spreadsheet');
    // Open the spreadsheet and get the specific sheet
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    console.log('Spreadsheet opened successfully');
    
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
