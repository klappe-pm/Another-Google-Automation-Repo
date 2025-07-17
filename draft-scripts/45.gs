/**
 * Google Apps Script to extract email snippets from Gmail messages
 * Summary: This script processes email IDs from a Google Sheet tab "GMail",
 * extracts a snippet (preview text) from each Gmail message, and writes
 * the results to column X. It includes error handling and logging.
 * 
 * Inputs: Email IDs in column B of "GMail" sheet
 * Outputs: 
 *  - Column X: Email snippet (preview text)
 * 
 * Current Date: March 23, 2025
 */

/**
 * List of Functions:
 * - extractEmailSnippets(): Main function that processes email IDs and writes snippets
 * - setColumnHeaders(): Sets headers in the sheet
 */

function extractEmailSnippets() {
  // Initialize logging
  Logger.log("Starting extractEmailSnippets execution");
  
  // Get the active spreadsheet and "GMail" sheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("GMail");
  
  // Set column headers if not already present
  setColumnHeaders(sheet);
  
  // Get all data from column B (email IDs)
  var lastRow = sheet.getLastRow();
  var emailIds = sheet.getRange("B2:B" + lastRow).getValues();
  
  Logger.log("Processing " + emailIds.length + " email IDs");
  
  // Process each email ID
  for (var i = 0; i < emailIds.length; i++) {
    var emailId = emailIds[i][0];
    
    // Skip empty cells
    if (!emailId) {
      Logger.log("Row " + (i + 2) + ": Skipping empty email ID");
      continue;
    }
    
    try {
      // Get the email message using the email ID
      var message = GmailApp.getMessageById(emailId);
      Logger.log("Row " + (i + 2) + ": Processing email ID " + emailId);
      
      // Get the email snippet
      var snippet = message.getPlainBody().substring(0, 200); // Limit to 200 characters
      
      // Write snippet to column X (row offset by 2 due to starting at B2)
      var row = i + 2;
      sheet.getRange(row, 24).setValue(snippet);    // Column X (24)
      
      Logger.log("Row " + row + ": Successfully processed - Snippet length: " + snippet.length);
      
    } catch (e) {
      Logger.log("Row " + (i + 2) + ": Error processing email ID " + emailId + ": " + e.message);
      // Write error message to sheet
      sheet.getRange(i + 2, 24).setValue("Error: " + e.message);
      continue;
    }
  }
  
  Logger.log("extractEmailSnippets execution completed");
}

/**
 * Sets column headers in the sheet if they don't exist
 * @param {Sheet} sheet - The Google Sheet object to modify
 */
function setColumnHeaders(sheet) {
  Logger.log("Setting column headers");
  
  var headers = [
    ["Email ID", "Snippet"]
  ];
  
  // Check if headers already exist in B1
  var existingHeaders = sheet.getRange(1, 2, 1, 1).getValue();
  if (!existingHeaders) {
    // Set headers in B1 and X1
    sheet.getRange(1, 2).setValue(headers[0][0]);   // B1
    sheet.getRange(1, 24).setValue(headers[0][1]);  // X1
    Logger.log("Column headers set successfully");
  } else {
    Logger.log("Headers already exist, skipping");
    // Check if Snippet header exists, add it if not
    if (!sheet.getRange(1, 24).getValue()) {
      sheet.getRange(1, 24).setValue(headers[0][1]);
      Logger.log("Added Snippet header");
    }
  }
}