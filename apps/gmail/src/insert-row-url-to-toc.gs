/**
 * Script Name: insert-row-url-to-toc
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
 * - insertHyperlinkToTOC(): Inserts hyperlink to t o c at specific position
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

// Main Functions

/**

 * Inserts hyperlink to t o c at specific position

 */

function insertHyperlinkToTOC() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var excludedSheets = ["1 - Table of Contents", "2 - GMail Labels", "3 - Labels to Process"]; // Get the Table of Contents sheet;
  var tocSheet = spreadsheet.getSheetByName("1 - Table of Contents");
  if (!tocSheet) {
    SpreadsheetApp.getUi().alert("1 - Table of Contents sheet not found!");
    return;
  } // Iterate through all sheets
  sheets.forEach(function (sheet) {
    var sheetName = sheet.getName(); // Process only sheets that are not in the excluded list;
    if (!excludedSheets.includes(sheetName)) { // Insert a new row at the top;
      sheet.insertRowBefore(1); // Find the cell in column A of Table of Contents that matches the sheet name;
      var tocData = tocSheet.getRange("A:A").getValues();
      var targetCell = null;

      for (var i = 0; i < tocData.length; i ++ ) {
        if (tocData[i][0] === sheetName) {
          targetCell = "A" + (i + 1);
          break;
        }
      }

      if (targetCell) { // Create the hyperlink formula
        var hyperlinkFormula = '=HYPERLINK("#gid=' + tocSheet.getSheetId() + '&range=' + targetCell + '","Return to Table of Contents")'; // Set the hyperlink in cell A1;
        sheet.getRange("A1").setFormula(hyperlinkFormula);
      } else {
        SpreadsheetApp.getUi().alert("Sheet name '" + sheetName + "' not found in Table of Contents!"); // Remove the inserted row if no match is found;
        sheet.deleteRow(1);
      }
    }
  });
}