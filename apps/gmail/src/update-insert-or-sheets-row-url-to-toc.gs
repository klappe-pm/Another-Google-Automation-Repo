/**
 * Script Name: update- insert- or- sheets- row- url- to- toc
 *
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
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
 * - updateHyperlinkToTOC(): Updates existing hyperlink to t o c
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 * /

/ / Main Functions

/**

 * Updates existing hyperlink to t o c

 * /

function updateHyperlinkToTOC() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheets = spreadsheet.getSheets();
  let excludedSheets = ["1- Table of Contents", "2- GMail Labels", "3- Labels to Process"];

  / / Get the Table of Contents sheet
  let tocSheet = spreadsheet.getSheetByName("1- Table of Contents");
  if (! tocSheet) {
    SpreadsheetApp.getUi().alert("1- Table of Contents sheet not found! ");
    return;
  }

  / / Iterate through all sheets
  sheets.forEach(function(sheet) {
    let sheetName = sheet.getName();

    / / Process only sheets that are not in the excluded list
    if (! excludedSheets.includes(sheetName)) {
      / / Find the cell in column A of Table of Contents that matches the sheet name
      let tocData = tocSheet.getRange("A:A").getValues();
      let targetCell = null;

      for (let i = 0; i < tocData.length; i+ + ) {
        if (tocData[i][0] = = = sheetName) {
          targetCell = "A" + (i + 1);
          break;
        }
      }

      if (targetCell) {
        / / Create the hyperlink formula
        let hyperlinkFormula = '= HYPERLINK("#gid= ' + tocSheet.getSheetId() + '&range= ' + targetCell + '","Return to Table of Contents")';

        / / Update the hyperlink in cell A1
        sheet.getRange("A1").setFormula(hyperlinkFormula);
      } else {
        SpreadsheetApp.getUi().alert("Sheet name '" + sheetName + "' not found in Table of Contents! ");
      }
    }
  });
}