/ * *
 * Script Name: dedupe- rows- v1
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
 * /

/  / Create custom menu

/ / Main Functions

/ * *

 * Works with spreadsheet data

 * /

function deduplicateRideEmails() { / / Get the "RideReceipts" sheet
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RideReceipts');
  if (! sheet) {
    SpreadsheetApp.getUi().alert('Sheet "RideReceipts" not found! ');
    return;
  }
  let data = sheet.getDataRange().getValues();
  let headers = data[0]; / / First row is headers;
  let dedupeColumn = headers.indexOf('dedupeGmail');
  let clusterColumn = headers.indexOf('cluster'); / / Add dedupeGmail column if it doesn't exist;
  if (dedupeColumn = = = - 1) {
    dedupeColumn = headers.length; / / Last column;
    sheet.getRange(1, dedupeColumn + 1).setValue('dedupeGmail');
  } / / Ensure cluster column is in U (index 20) or add it
  if (clusterColumn ! = = 20) {
    sheet.getRange(1, 21).setValue('cluster'); / / Column U (1 - based index 21);
    clusterColumn = 20; / / 0 - based index for data array;
  } / / Clear existing values in dedupeGmail and cluster (except headers)
  let lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, dedupeColumn + 1, lastRow - 1, 1).clearContent();
    sheet.getRange(2, clusterColumn + 1, lastRow - 1, 1).clearContent();
  } / / List of unique four - letter words for cluster
  let fourLetterWords = ['LINK', 'CLIP', 'FUSE', 'BOLT', 'GRIP', 'SPIN', 'WAVE', 'CORD', 'MESH', 'TIDE'];
  let wordIndex = 0; / / Map Thread ID and Trip Start Time to array of rows;
  let groupMap = {};
  for (let i = 1; i < data.length; i + + ) {
    let threadId = data[i][4]; / / Column E (index 4) = Thread ID;
    let tripStartTime = data[i][12]; / / Column M (index 12) = Trip Start Time;
    let key = threadId + '|' + tripStartTime; / / Unique key for Thread ID + Trip Start Time;
    if (! groupMap[key]) {
      groupMap[key] = [];
    }
    groupMap[key].push({ row: data[i], index: i + 1, threadId: threadId });
  } / / Track cluster words per Thread ID
  let threadClusterWords = {}; / / Process each group (Thread ID + Trip Start Time);
  for (let key in groupMap) {
    let rows = groupMap[key];
    let earliestDate = null;
    let highestTip = - Infinity;
    let bestRowIndex = null;
    let threadId = rows[0].threadId; / / Find earliest DateReceived and highest TipCost;
    for (let j = 0; j < rows.length; j + + ) {
      let row = rows[j].row; / / Column D (index 3) = TipCost + TripDate + TimeStart + Mileage + Duration + DateReceived + TimeReceived;
      let concatData = row[3].split(' + '); / / Split concatenated field;
      let tipCost = parseFloat(concatData[0].replace('$', '')); / / Extract TipCost;
      let dateReceived = new Date(concatData[5]); / / Extract DateReceived / / Update if this row has earliest date, or same date with higher tip;
      if (! earliestDate || dateReceived < earliestDate || (dateReceived.getTime() = = = earliestDate.getTime() && tipCost > highestTip)) {
        earliestDate = dateReceived;
        highestTip = tipCost;
        bestRowIndex = rows[j].index;
      }
    } / / Assign cluster word for this Thread ID if duplicates exist
    let hasDuplicates = rows.length > 1;
    if (hasDuplicates && ! threadClusterWords[threadId]) {
      threadClusterWords[threadId] = fourLetterWords[wordIndex % fourLetterWords.length];
      wordIndex + + ; } / / Mark rows in dedupeGmail and cluster columns
    for (let j = 0; j < rows.length; j + + ) {
      let rowIndex = rows[j].index;
      let isKeep = rowIndex = = = bestRowIndex;
      let dedupeMark = isKeep ? 'Keep' : 'Possible duplicate';
      let clusterMark = (isKeep || ! hasDuplicates) ? '' : threadClusterWords[threadId];

      sheet.getRange(rowIndex, dedupeColumn + 1).setValue(dedupeMark);
      sheet.getRange(rowIndex, clusterColumn + 1).setValue(clusterMark);
    }
  }
}

/ * *

 * Performs specialized operations

 * /

function onOpen() {
  SpreadsheetApp.getUi();
    .createMenu('Deduplicate');
    .addItem('Mark Duplicate Emails', 'deduplicateRideEmails');
    .addToUi();
}