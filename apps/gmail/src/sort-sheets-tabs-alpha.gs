/ * *
 * Script Name: sort- sheets- tabs- alpha
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Process and transform data
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
 * - SpreadsheetApp: For spreadsheet operations
 * /

/ / Main Functions

/ * *

 * Works with spreadsheet data
 * @returns {any} The result

 * /

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Sheet Tools')
    .addItem('Sort Sheets Alphabetically', 'sortSheetsAlphabetically')
    .addToUi();
}

/ * *

 * Sorts and orders sheets alphabetically
 * @returns {any} The result

 * /

function sortSheetsAlphabetically() {
  try {
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheets = spreadsheet.getSheets();
    let sheetInfo = [];
    let fixedSheets = {
      "gmail labels": null,
      "labels to process": null,
      "processed": null,
      "requirements": null
    };

    / / Collect all sheets and identify fixed sheets (case- insensitive)
    for (let i = 0; i < sheets.length; i+ + ) {
      let sheetName = sheets[i].getName();
      let sheetNameLower = sheetName.toLowerCase();
      if (sheetNameLower in fixedSheets) {
        fixedSheets[sheetNameLower] = sheets[i];
      } else {
        sheetInfo.push({
          name: sheetName,
          sheet: sheets[i]
        });
      }
    }

    / / Sort non- fixed sheets alphabetically
    sheetInfo.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    / / Move fixed sheets to positions 1- 4
    let fixedOrder = [
      { name: "gmail labels", position: 1 },
      { name: "labels to process", position: 2 },
      { name: "processed", position: 3 },
      { name: "requirements", position: 4 }
    ];
    let missingSheets = [];

    fixedOrder.forEach(function(fixed) {
      let sheet = fixedSheets[fixed.name];
      if (sheet) {
        spreadsheet.setActiveSheet(sheet);
        spreadsheet.moveActiveSheet(fixed.position);
      } else {
        missingSheets.push(fixed.name.charAt(0).toUpperCase() + fixed.name.slice(1));
      }
    });

    / / Notify user of missing fixed sheets
    if (missingSheets.length > 0) {
      SpreadsheetApp.getUi().alert(
        'Missing Sheets',
        'The following fixed sheets were not found: ' + missingSheets.join(', ') +
        '. Sorting will proceed without them.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }

    / / Move sorted sheets starting at position 5
    for (let i = 0; i < sheetInfo.length; i+ + ) {
      spreadsheet.setActiveSheet(sheetInfo[i].sheet);
      spreadsheet.moveActiveSheet(i + 5);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert(
      'Error',
      'An error occurred while sorting sheets: ' + e.message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}