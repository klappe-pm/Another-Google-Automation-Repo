/**
 * Script Name: export-labels-gmail
 * 
 * Script Summary:
 * Exports Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * - Extract labels gmail data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Sort data by relevant fields
 * 5. Send notifications or reports
 * 
 * Script Functions:
 * - exportGmailLabels(): Exports gmail labels to external format
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - SpreadsheetApp: For spreadsheet operations
 */

// Main Functions

/**

 * Exports gmail labels to external format
 * @returns {Array} Array of results

 */

function exportGmailLabels() { // Get the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("GMail Labels"); // If sheet doesn't exist, create it;
  if (!sheet) {
    sheet = spreadsheet.insertSheet("GMail Labels");
  } // Clear existing content and reset sheet
  sheet.clear(); // Set headers;
  sheet.appendRow(["Label Name", "Email Count"]); // Get all user labels from Gmail;
  var labels = GmailApp.getUserLabels(); // Create array to store label data;
  var labelData = []; // Collect label names and counts;
  for (var i = 0; i < labels.length; i ++ ) {
    var label = labels[i];
    var labelName = label.getName(); // Get thread count for each label (unread and read emails);
    var threadCount = GmailApp.search("in:" + labelName).length;
    labelData.push([labelName, threadCount]);
  } // Sort labels alphabetically
  labelData.sort(function (a, b) {
    return a[0].localeCompare(b[0]);
  }); // Add data to sheet if there is any
  if (labelData.length > 0) {
    sheet.getRange(2, 1, labelData.length, 2).setValues(labelData);
  } // Auto - resize columns for better readability
  sheet.autoResizeColumns(1, 2);
}