/**
 * Script Name: dedupe- rows- v2
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Send notifications or reports
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
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RideReceipts');
  if (! sheet) {
    SpreadsheetApp.getUi().alert('Sheet "RideReceipts" not found! ');
    return;
  }
  let data = sheet.getDataRange().getValues();
  let headers = data[0]; // First row is headers;
  let dedupeColumn = headers.indexOf('dedupeGmail');
  let clusterColumn = headers.indexOf('cluster');
  let dupThreadColumn = headers.indexOf('duplicateThreadId');
  let emailListColumn = headers.indexOf('emailIdList'); // Add dedupeGmail column if it doesn't exist;
  if (dedupeColumn = = = - 1) {
    dedupeColumn = headers.length; // Last column;
    sheet.getRange(1, dedupeColumn + 1).setValue('dedupeGmail');
  } // Ensure cluster column is in U (index 20)
  if (clusterColumn ! = = 20) {
    sheet.getRange(1, 21).setValue('cluster'); // Column U (1 - based index 21);
    clusterColumn = 20;
  } // Add duplicateThreadId column in W (index 22)
  if (dupThreadColumn = = = - 1) {
    dupThreadColumn = clusterColumn + 1; // After cluster;
    sheet.getRange(1, dupThreadColumn + 1).setValue('duplicateThreadId');
  } // Add emailIdList column in X (index 23)
  if (emailListColumn = = = - 1) {
    emailListColumn = dupThreadColumn + 1; // After duplicateThreadId;
    sheet.getRange(1, emailListColumn + 1).setValue('emailIdList');
  } // Clear existing values in dedupeGmail, cluster, duplicateThreadId, emailIdList (except headers)
  let lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, dedupeColumn + 1, lastRow - 1, 1).clearContent();
    sheet.getRange(2, clusterColumn + 1, lastRow - 1, 1).clearContent();
    sheet.getRange(2, dupThreadColumn + 1, lastRow - 1, 1).clearContent();
    sheet.getRange(2, emailListColumn + 1, lastRow - 1, 1).clearContent();
  } // List of unique four - letter words for cluster
  let fourLetterWords = ['LINK', 'CLIP', 'FUSE', 'BOLT', 'GRIP', 'SPIN', 'WAVE', 'CORD', 'MESH', 'TIDE'];
  let wordIndex = 0; // Map Thread ID and Trip Start Time to array of rows;
  let groupMap = {};
  for (let i = 1; i < data.length; i + + ) {
    let threadId = data[i][4]; // Column E (index 4) = Thread ID;
    let tripStartTime = data[i][12]; // Column M (index 12) = Trip Start Time;
    let key = threadId + '|' + tripStartTime; // Unique key;
    if (! groupMap[key]) {
      groupMap[key] = [];
    }
    groupMap[key].push({ row: data[i], index: i + 1, threadId: threadId });
  } // Track cluster words and email IDs per Thread ID
  let threadClusterWords = {};
  let threadEmailLists = {}; // Process each group (Thread ID + Trip Start Time);
  for (let key in groupMap) {
    let rows = groupMap[key];
    let earliestDate = null;
    let highestTip = - Infinity;
    let bestRowIndex = null;
    let threadId = rows[0].threadId;
    let duplicateEmailIds = []; // Find earliest DateReceived and highest TipCost, collect duplicate Message IDs;
    for (let j = 0; j < rows.length; j + + ) {
      let row = rows[j].row; // Column D (index 3) = TipCost + TripDate + TimeStart + Mileage + Duration + DateReceived + TimeReceived;
      let concatData = row[3].split(' + '); // Split concatenated field;
      let tipCost = parseFloat(concatData[0].replace('$', '')); // Extract TipCost;
      let dateReceived = new Date(concatData[5]); // Extract DateReceived // Update if this row has earliest date, or same date with higher tip;
      if (! earliestDate || dateReceived < earliestDate || (dateReceived.getTime() = = = earliestDate.getTime() && tipCost > highestTip)) {
        earliestDate = dateReceived;
        highestTip = tipCost;
        bestRowIndex = rows[j].index;
      }
    } // Collect Message IDs for duplicates
    for (let j = 0; j < rows.length; j + + ) {
      if (rows[j].index ! = = bestRowIndex) {
        duplicateEmailIds.push(rows[j].row[5]); // Column F (index 5) = Message ID;
      }
    } // Assign cluster word and store email ID list for this Thread ID if duplicates exist
    let hasDuplicates = rows.length > 1;
    if (hasDuplicates) {
      if (! threadClusterWords[threadId]) {
        threadClusterWords[threadId] = fourLetterWords[wordIndex % fourLetterWords.length];
        wordIndex + + ; }
      threadEmailLists[key] = duplicateEmailIds.join(', ');
    } // Mark rows in dedupeGmail, cluster, duplicateThreadId, emailIdList columns
    for (let j = 0; j < rows.length; j + + ) {
      let rowIndex = rows[j].index;
      let isKeep = rowIndex = = = bestRowIndex;
      let dedupeMark = isKeep ? 'Keep' : 'Possible duplicate';
      let clusterMark = (isKeep || ! hasDuplicates) ? '' : threadClusterWords[threadId];
      let dupThreadMark = isKeep ? '' : threadId;
      let emailListMark = (isKeep || ! hasDuplicates) ? '' : threadEmailLists[key];

      sheet.getRange(rowIndex, dedupeColumn + 1).setValue(dedupeMark);
      sheet.getRange(rowIndex, clusterColumn + 1).setValue(clusterMark);
      sheet.getRange(rowIndex, dupThreadColumn + 1).setValue(dupThreadMark);
      sheet.getRange(rowIndex, emailListColumn + 1).setValue(emailListMark);
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