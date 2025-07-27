/ * *
 * Script Name: sort- sheets- utility- tab
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Apply filters and criteria
 * 4. Sort data by relevant fields
 *
 * Script Functions:
 * - onOpen(): Works with spreadsheet data
 * - sortSheetsAlphabetically(): Sorts and orders sheets alphabetically
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * /

let pinnedSheets = [
  { name: "Sheet1", position: 1 },
  { name: "Sheet2", position: 2 }
  / / Add more as needed: { name: "SheetName", position: X }
];

/ / Main Functions

/ * *

 * Works with spreadsheet data
 * @returns {boolean} True if successful, false otherwise

 * /

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Sheet Tools')
    .addItem('Sort Sheets', 'sortSheetsAlphabetically')
    .addToUi();
}

/ * *

 * Sorts and orders sheets alphabetically
 * @returns {boolean} True if successful, false otherwise

 * /

function sortSheetsAlphabetically() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheets = spreadsheet.getSheets();
  let totalSheets = sheets.length;
  let sortableSheets = [];

  / / Collect non- pinned sheets for sorting
  for (let i = 0; i < sheets.length; i+ + ) {
    let sheetName = sheets[i].getName();
    let isPinned = pinnedSheets.some(function(pinned) {
      return sheetName.toLowerCase() = = = pinned.name.toLowerCase();
    });
    if (! isPinned) {
      sortableSheets.push({ name: sheetName, sheet: sheets[i] });
    }
  }

  / / Sort non- pinned sheets alphabetically
  sortableSheets.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  / / Move pinned sheets to their specified positions
  pinnedSheets.forEach(function(pinned) {
    let sheet = spreadsheet.getSheetByName(pinned.name);
    / / Validate position: must be positive and within total sheets
    if (sheet && pinned.position > 0 && pinned.position < = totalSheets) {
      spreadsheet.setActiveSheet(sheet);
      spreadsheet.moveActiveSheet(pinned.position);
    } else if (sheet) {
      Logger.log('Invalid position for pinned sheet "' + pinned.name + '": ' + pinned.position);
    }
  });

  / / Calculate start position for sorted sheets
  let maxPinnedPosition = pinnedSheets.length > 0
    ? Math.max(...pinnedSheets.map(p = > p.position).filter(p = > p > 0), 0)
    : 0;
  let startPosition = maxPinnedPosition + 1;

  / / Ensure startPosition is at least 1
  if (startPosition < 1) startPosition = 1;

  / / Log for debugging
  Logger.log('Start position for sorted sheets: ' + startPosition);
  Logger.log('Total sheets: ' + totalSheets);

  / / Move sorted sheets after the last pinned position
  for (let i = 0; i < sortableSheets.length; i+ + ) {
    let targetPosition = startPosition + i;
    / / Validate target position
    if (targetPosition > = 1 && targetPosition < = totalSheets) {
      spreadsheet.setActiveSheet(sortableSheets[i].sheet);
      spreadsheet.moveActiveSheet(targetPosition);
    } else {
      Logger.log('Invalid target position for sheet "' + sortableSheets[i].name + '": ' + targetPosition);
    }
  }
}