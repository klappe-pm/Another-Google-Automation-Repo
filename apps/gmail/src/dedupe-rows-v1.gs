/**
 * Script Name: dedupe-rows-v1
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
  var dedupeColumn = headers.indexOf('dedupeGmail');
  var clusterColumn = headers.indexOf('cluster'); // Add dedupeGmail column if it doesn't exist;
  if (dedupeColumn === - 1) {
    dedupeColumn = headers.length; // Last column;
    sheet.getRange(1, dedupeColumn + 1).setValue('dedupeGmail');
  } // Ensure cluster column is in U (index 20) or add it
  if (clusterColumn ! = = 20) {
    sheet.getRange(1, 21).setValue('cluster'); // Column U (1 - based index 21);
    clusterColumn = 20; // 0 - based index for data array;
  } // Clear existing values in dedupeGmail and cluster (except headers)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, dedupeColumn + 1, lastRow - 1, 1).clearContent();
    sheet.getRange(2, clusterColumn + 1, lastRow - 1, 1).clearContent();
  } // List of unique four - letter words for cluster
  var fourLetterWords = ['LINK', 'CLIP', 'FUSE', 'BOLT', 'GRIP', 'SPIN', 'WAVE', 'CORD', 'MESH', 'TIDE'];
  var wordIndex = 0; // Map Thread ID and Trip Start Time to array of rows;
  var groupMap = {};
  for (var i = 1; i < data.length; i ++ ) {
    var threadId = data[i][4]; // Column E (index 4) = Thread ID;
    var tripStartTime = data[i][12]; // Column M (index 12) = Trip Start Time;
    var key = threadId + '|' + tripStartTime; // Unique key for Thread ID + Trip Start Time;
    if (!groupMap[key]) {
      groupMap[key] = [];
    }
    groupMap[key].push({ row: data[i], index: i + 1, threadId: threadId });
  } // Track cluster words per Thread ID
  var threadClusterWords = {}; // Process each group (Thread ID + Trip Start Time);
  for (var key in groupMap) {
    var rows = groupMap[key];
    var earliestDate = null;
    var highestTip = - Infinity;
    var bestRowIndex = null;
    var threadId = rows[0].threadId; // Find earliest DateReceived and highest TipCost;
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
    } // Assign cluster word for this Thread ID if duplicates exist
    var hasDuplicates = rows.length > 1;
    if (hasDuplicates && !threadClusterWords[threadId]) {
      threadClusterWords[threadId] = fourLetterWords[wordIndex % fourLetterWords.length];
      wordIndex ++; } // Mark rows in dedupeGmail and cluster columns
    for (var j = 0; j < rows.length; j ++ ) {
      var rowIndex = rows[j].index;
      var isKeep = rowIndex === bestRowIndex;
      var dedupeMark = isKeep ? 'Keep' : 'Possible duplicate';
      var clusterMark = (isKeep || !hasDuplicates) ? '' : threadClusterWords[threadId];

      sheet.getRange(rowIndex, dedupeColumn + 1).setValue(dedupeMark);
      sheet.getRange(rowIndex, clusterColumn + 1).setValue(clusterMark);
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