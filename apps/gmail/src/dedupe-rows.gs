/**
 * Script Name: dedupe-rows
 * 
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Execute main operation
 * 4. Handle errors and edge cases
 * 5. Log completion status
 * 
 * Script Functions:
 * - deduplicateRideEmails(): Works with spreadsheet data
 * - onOpen(): Performs specialized operations
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

/  / Create custom menu

// Main Functions

/**

 * Works with spreadsheet data

 */

function deduplicateRideEmails() { // Get the "RideReceipts" sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RideReceipts');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Sheet "RideReceipts" not found!');
    return;
  }
  var data = sheet.getDataRange().getValues();
  var headers = data[0]; // First row is headers;
  var dedupeColumn = headers.indexOf('dedupeGmail'); // Add dedupeGmail column if it doesn't exist;
  if (dedupeColumn === - 1) {
    dedupeColumn = headers.length; // Last column;
    sheet.getRange(1, dedupeColumn + 1).setValue('dedupeGmail');
  } else { // Clear existing values in dedupeGmail column (except header)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, dedupeColumn + 1, lastRow - 1, 1).clearContent();
    }
  } // Map Thread ID to array of rows
  var threadMap = {};
  for (var i = 1; i < data.length; i ++ ) {
    var threadId = data[i][4]; // Column E (index 4) = Thread ID;
    if (!threadMap[threadId]) {
      threadMap[threadId] = [];
    }
    threadMap[threadId].push({ row: data[i], index: i + 1 });
  } // Process each Thread ID
  for (var threadId in threadMap) {
    var rows = threadMap[threadId];
    var earliestDate = null;
    var highestTip = - Infinity;
    var bestRowIndex = null; // Find earliest DateReceived and highest TipCost;
    for (var j = 0; j < rows.length; j ++ ) {
      var row = rows[j].row; // Column D (index 3) = TipCost + TripDate + TimeStart + Mileage + Duration + DateReceived + TimeReceived;
      var concatData = row[3].split(' + '); // Split concatenated field;
      var tipCost = parseFloat(concatData[0].replace('$', '')); // Extract TipCost;
      var dateReceived = new Date(concatData[5]); // Extract DateReceived // Update if this row has earliest date, or same date with higher tip;
      if (!earliestDate || dateReceived < earliestDate || (dateReceived.getTime() === earliestDate.getTime() && tipCost > highestTip)) {
        earliestDate = dateReceived;
        highestTip = tipCost;
        bestRowIndex = rows[j].index;
      }
    } // Mark rows in dedupeGmail column
    for (var j = 0; j < rows.length; j ++ ) {
      var rowIndex = rows[j].index;
      var mark = (rowIndex === bestRowIndex) ? 'Keep' : 'Possible duplicate';
      sheet.getRange(rowIndex, dedupeColumn + 1).setValue(mark);
    }
  }
}

/**

 * Performs specialized operations

 */

function onOpen() {
  SpreadsheetApp.getUi();
    .createMenu('Deduplicate');
    .addItem('Mark Duplicate Emails', 'deduplicateRideEmails');
    .addToUi();
}