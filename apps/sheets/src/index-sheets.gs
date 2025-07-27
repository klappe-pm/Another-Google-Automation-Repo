/ * *
 * Script Name: index- sheets
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Sort data by relevant fields
 * 4. Format output for presentation
 *
 * Script Functions:
 * - createIndexV2(): Creates new index v2 or resources
 * - extractCategory(): Extracts specific information
 *
 * Script Helper Functions:
 * - formatSheet(): Formats sheet for display
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 * /

/ * *
 * Applies uniform formatting to a sheet:
 * - Sets the font to Helvetica, size 10.
 * - Makes the first row bold and wraps its text.
 * - Freezes the first row.
 * - Aligns all cells to the left and top.
 * @param {Sheet} sheet - The sheet to format.
 * / / / Main Functions

/ / Main Functions

/ * *

 * Creates new index v2 or resources
 * @returns {string} The newly created string

 * /

function createIndexV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); / / Get the active spreadsheet
  const sheets = ss.getSheets(); / / Get all sheets in the spreadsheet

  / / Sort sheets alphabetically by name
  sheets.sort((a, b) = > a.getName().localeCompare(b.getName()));

  / / Reorder the sheets in the spreadsheet to match the sorted order
  sheets.forEach((sheet, index) = > {
    ss.setActiveSheet(sheet); / / Set the current sheet as active
    ss.moveActiveSheet(index + 1); / / Move the sheet to its new position
  });

  / / Create or clear the "Index" sheet
  let indexSheet = ss.getSheetByName("Index");
  if (indexSheet) {
    indexSheet.clear(); / / Clear the sheet if it already exists
  } else {
    indexSheet = ss.insertSheet("Index"); / / Create a new sheet named "Index"
  }

  / / Set up the index sheet
  indexSheet.getRange("B1").setValue("Sheet Index").setFontWeight("bold"); / / Add a title to the index sheet in Column B
  indexSheet.getRange("A1").setValue("Category").setFontWeight("bold"); / / Add a category header in Column A

  / / Add categories and hyperlinks to each sheet
  sheets.forEach((sheet, index) = > {
    const sheetName = sheet.getName(); / / Get the name of the current sheet
    const category = extractCategory(sheetName); / / Extract the category from the sheet name
    const row = index + 2; / / Start from row 2 (row 1 is the header)
    const hyperlink = `= HYPERLINK("#gid= ${sheet.getSheetId()}", "${sheetName}")`; / / Create a hyperlink formula

    / / Add category and hyperlink to the index sheet
    indexSheet.getRange(`A${row}`).setValue(category); / / Add category to Column A
    indexSheet.getRange(`B${row}`).setFormula(hyperlink); / / Add hyperlink to Column B
  });

  / / Format the index sheet
  indexSheet.autoResizeColumn(1); / / Resize Column A to fit the content
  indexSheet.autoResizeColumn(2); / / Resize Column B to fit the content

  / / Apply uniform formatting to ALL sheets in the file
  sheets.forEach((sheet) = > {
    formatSheet(sheet); / / Format each sheet
  });
  formatSheet(indexSheet); / / Apply formatting to the Index sheet as well

  / / Move the "Index" sheet to the first position
  ss.setActiveSheet(indexSheet); / / Set the "Index" sheet as active
  ss.moveActiveSheet(1); / / Move it to the first position in the spreadsheet

  SpreadsheetApp.flush(); / / Apply all changes
  SpreadsheetApp.getUi().alert("Sheet index created successfully! "); / / Notify the user
}

/ * *

 * Extracts specific information
 * @param
 * @param {string} sheetName - The sheetName parameter
 * @returns {string} The formatted string

 * /

function extractCategory(sheetName) {
  const match = sheetName.match(/ ^[a- z]+ / ); / / Match lowercase letters at the start of the string
  return match ? match[0] : ""; / / Return the matched category or an empty string if no match
}

/ / Helper Functions

/ * *

 * Formats sheet for display
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 * /

function formatSheet(sheet) {
  / / Set font to Helvetica, size 10 for the entire sheet
  sheet.getDataRange().setFontFamily("Helvetica").setFontSize(10);

  / / Set the first row to bold and wrap its text
  sheet.getRange("1:1").setFontWeight("bold").setWrap(true);

  / / Freeze the first row
  sheet.setFrozenRows(1);

  / / Align all cells to the left and top
  sheet.getDataRange().setHorizontalAlignment("left").setVerticalAlignment("top");
}