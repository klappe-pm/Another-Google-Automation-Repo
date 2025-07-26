/ * *
 * Script Name: rename- tabs
 *
 * Script Summary:
 * Processes Gmail labels for automated workflow processing.
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
 * - renameTabs(): Works with spreadsheet data
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

 * /

function renameTabs() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheets = spreadsheet.getSheets();
  let excludedSheets = ["1- Table of Contents", "2- GMail Labels", "3- Labels to Process"];

  / / Iterate through all sheets
  sheets.forEach(function(sheet) {
    let sheetName = sheet.getName();

    / / Process only sheets that are not in the excluded list
    if (! excludedSheets.includes(sheetName)) {
      / / Remove 'MTBI/ ' or 'MTBI' from the sheet name
      let newSheetName = sheetName.replace(/ MTBI\/ |MTBI/ g, '');

      / / Only rename if the name has changed
      if (newSheetName ! = = sheetName) {
        sheet.setName(newSheetName);
      }
    }
  });
}