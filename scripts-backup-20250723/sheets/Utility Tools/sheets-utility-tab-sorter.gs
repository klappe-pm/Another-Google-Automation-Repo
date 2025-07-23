/*
Script Name: GenericSheetSorter

Summary:
This script organizes Google Sheets tabs alphabetically, while keeping user-specified sheets in fixed positions.
Users define pinned sheets and their positions in the `pinnedSheets` array.
All other sheets are sorted alphabetically after the pinned sheets.
*/

var pinnedSheets = [
  { name: "Sheet1", position: 1 },
  { name: "Sheet2", position: 2 }
  // Add more as needed: { name: "SheetName", position: X }
];

function sortSheetsAlphabetically() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var totalSheets = sheets.length;
  var sortableSheets = [];

  // Collect non-pinned sheets for sorting
  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    var isPinned = pinnedSheets.some(function(pinned) {
      return sheetName.toLowerCase() === pinned.name.toLowerCase();
    });
    if (!isPinned) {
      sortableSheets.push({ name: sheetName, sheet: sheets[i] });
    }
  }

  // Sort non-pinned sheets alphabetically
  sortableSheets.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  // Move pinned sheets to their specified positions
  pinnedSheets.forEach(function(pinned) {
    var sheet = spreadsheet.getSheetByName(pinned.name);
    // Validate position: must be positive and within total sheets
    if (sheet && pinned.position > 0 && pinned.position <= totalSheets) {
      spreadsheet.setActiveSheet(sheet);
      spreadsheet.moveActiveSheet(pinned.position);
    } else if (sheet) {
      Logger.log('Invalid position for pinned sheet "' + pinned.name + '": ' + pinned.position);
    }
  });

  // Calculate start position for sorted sheets
  var maxPinnedPosition = pinnedSheets.length > 0 
    ? Math.max(...pinnedSheets.map(p => p.position).filter(p => p > 0), 0) 
    : 0;
  var startPosition = maxPinnedPosition + 1;
  
  // Ensure startPosition is at least 1
  if (startPosition < 1) startPosition = 1;
  
  // Log for debugging
  Logger.log('Start position for sorted sheets: ' + startPosition);
  Logger.log('Total sheets: ' + totalSheets);

  // Move sorted sheets after the last pinned position
  for (var i = 0; i < sortableSheets.length; i++) {
    var targetPosition = startPosition + i;
    // Validate target position
    if (targetPosition >= 1 && targetPosition <= totalSheets) {
      spreadsheet.setActiveSheet(sortableSheets[i].sheet);
      spreadsheet.moveActiveSheet(targetPosition);
    } else {
      Logger.log('Invalid target position for sheet "' + sortableSheets[i].name + '": ' + targetPosition);
    }
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Sheet Tools')
    .addItem('Sort Sheets', 'sortSheetsAlphabetically')
    .addToUi();
}