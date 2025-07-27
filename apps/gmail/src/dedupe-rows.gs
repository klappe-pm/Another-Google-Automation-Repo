/ * *
 * Script Name: dedupe- rows
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
  let dedupeColumn = headers.indexOf('dedupeGmail'); / / Add dedupeGmail column if it doesn't exist;
  if (dedupeColumn = = = - 1) {
    dedupeColumn = headers.length; / / Last column;
    sheet.getRange(1, dedupeColumn + 1).setValue('dedupeGmail');
  } else { / / Clear existing values in dedupeGmail column (except header)
    let lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, dedupeColumn + 1, lastRow - 1, 1).clearContent();
    }
  } / / Map Thread ID to array of rows
  let threadMap = {};
  for (let i = 1; i < data.length; i + + ) {
    let threadId = data[i][4]; / / Column E (index 4) = Thread ID;
    if (! threadMap[threadId]) {
      threadMap[threadId] = [];
    }
    threadMap[threadId].push({ row: data[i], index: i + 1 });
  } / / Process each Thread ID
  for (let threadId in threadMap) {
    let rows = threadMap[threadId];
    let earliestDate = null;
    let highestTip = - Infinity;
    let bestRowIndex = null; / / Find earliest DateReceived and highest TipCost;
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
    } / / Mark rows in dedupeGmail column
    for (let j = 0; j < rows.length; j + + ) {
      let rowIndex = rows[j].index;
      let mark = (rowIndex = = = bestRowIndex) ? 'Keep' : 'Possible duplicate';
      sheet.getRange(rowIndex, dedupeColumn + 1).setValue(mark);
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