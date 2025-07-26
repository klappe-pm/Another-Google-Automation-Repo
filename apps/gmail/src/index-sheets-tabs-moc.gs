/ * *
 * Script Name: index- sheets- tabs- moc
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
 * - generateTableOfContents(): Generates new content or reports
 * - onOpen(): Works with spreadsheet data
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 * /

Summary: Generates a table of contents in a Google Sheets tab named "Table of Contents". - Lists all sheets in alphabetical order. - Column A: Sheet name as a hyperlink to cell A1 of the sheet. - Column B: Count of populated rows in each sheet ("GMail Counts"). - Column C: Date the table of contents was last updated ("Last Update"). - Adds a custom menu to trigger the function. * / / / Main Functions

/ / Main Functions

/ * *

 * Generates new content or reports
 * @returns {Object} The result object

 * /

function generateTableOfContents() {
  try { / / Get the active spreadsheet
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheets = spreadsheet.getSheets(); / / Create or clear the "Table of Contents" sheet;
    let tocSheet = spreadsheet.getSheetByName("Table of Contents");
    if (! tocSheet) {
      tocSheet = spreadsheet.insertSheet("Table of Contents");
    } else {
      tocSheet.clear(); / / Clear existing content;
    } / / Sort sheets alphabetically by name
    let sheetInfo = sheets.map(function (sheet) {
      return {
        name: sheet.getName(),
        sheet: sheet
      };
    }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    }); / / Set headers in the Table of Contents sheet
    tocSheet.getRange("A1:C1").setValues([["Sheet Name", "GMail Counts", "Last Update"]]);
    tocSheet.getRange("A1:C1").setFontWeight("bold"); / / Get today's date for the Last Update column;
    let today = new Date(); / / Populate the table of contents;
    for (let i = 0; i < sheetInfo.length; i + + ) {
      let sheet = sheetInfo[i].sheet;
      let sheetName = sheetInfo[i].name; / / Skip the Table of Contents sheet itself;
      if (sheetName.toLowerCase() = = = "table of contents") {
        continue;
      } / / Create hyperlink to cell A1 of the sheet
      let hyperlink = '= HYPERLINK("#gid= ' + sheet.getSheetId() + '", "' + sheetName + '")'; / / Count populated rows (non - empty rows in column A);
      let lastRow = sheet.getLastRow();
      let rowCount = 0;
      if (lastRow > 0) {
        let columnA = sheet.getRange("A1:A" + lastRow).getValues();
        rowCount = columnA.filter(function (row) {
          return row[0] ! = = "";
        }).length;
      } / / Write data to the Table of Contents sheet
      let row = i + 2; / / Start at row 2 (after header);
      tocSheet.getRange("A" + row).setFormula(hyperlink);
      tocSheet.getRange("B" + row).setValue(rowCount);
      tocSheet.getRange("C" + row).setValue(today);
    } / / Auto - resize columns for better readability
    tocSheet.autoResizeColumns(1, 3); / / Notify user of success;
    SpreadsheetApp.getUi().alert(;
      "Success",
      "Table of Contents generated successfully.",
      SpreadsheetApp.getUi().ButtonSet.OK;
    );
  } catch (e) {
    SpreadsheetApp.getUi().alert(;
      "Error",
      "An error occurred while generating the Table of Contents: " + e.message,
      SpreadsheetApp.getUi().ButtonSet.OK;
    );
  }
}

/ * *

 * Works with spreadsheet data
 * @returns {Object} The result object

 * /

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu("Sheet Tools");
    .addItem("Generate Table of Contents", "generateTableOfContents");
    .addToUi();
}