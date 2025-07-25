/**
 * Title: General Sheets Indexer
 * Service: Google Sheets
 * Purpose: General-purpose indexing tool for various content types
 * Created: 2024-01-15
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Creates a tree-like index of all tabs (sheets) in a Google Sheets file
- Description: Organizes tabs alphabetically, reorders them, and creates clickable hyperlinks for navigation
- Problem Solved: Provides organized navigation system for complex spreadsheets with multiple tabs
- Successful Execution: Creates formatted index sheet with clickable navigation and uniform formatting

Key Features:
1. Creates tree-like index of all tabs in Google Sheets file
2. Organizes tabs alphabetically and reorders them accordingly
3. Creates clickable hyperlinks for each tab directing to cell A1
4. Places index on new "Index" sheet moved to first position
5. Extracts categories from tab names using PascalCase analysis
6. Places categories in Column A and sheet links in Column B
7. Applies uniform formatting to ALL sheets (Helvetica 10pt, bold headers, frozen rows)

Version 2 Updates:
- Category extraction from PascalCase tab names
- Two-column layout (categories and links)
- Comprehensive formatting application
 *    - All cells aligned to the left and top.
 */

function createIndexV2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet(); // Get the active spreadsheet
  const sheets = ss.getSheets(); // Get all sheets in the spreadsheet

  // Sort sheets alphabetically by name
  sheets.sort((a, b) => a.getName().localeCompare(b.getName()));

  // Reorder the sheets in the spreadsheet to match the sorted order
  sheets.forEach((sheet, index) => {
    ss.setActiveSheet(sheet); // Set the current sheet as active
    ss.moveActiveSheet(index + 1); // Move the sheet to its new position
  });

  // Create or clear the "Index" sheet
  let indexSheet = ss.getSheetByName("Index");
  if (indexSheet) {
    indexSheet.clear(); // Clear the sheet if it already exists
  } else {
    indexSheet = ss.insertSheet("Index"); // Create a new sheet named "Index"
  }

  // Set up the index sheet
  indexSheet.getRange("B1").setValue("Sheet Index").setFontWeight("bold"); // Add a title to the index sheet in Column B
  indexSheet.getRange("A1").setValue("Category").setFontWeight("bold"); // Add a category header in Column A

  // Add categories and hyperlinks to each sheet
  sheets.forEach((sheet, index) => {
    const sheetName = sheet.getName(); // Get the name of the current sheet
    const category = extractCategory(sheetName); // Extract the category from the sheet name
    const row = index + 2; // Start from row 2 (row 1 is the header)
    const hyperlink = `=HYPERLINK("#gid=${sheet.getSheetId()}", "${sheetName}")`; // Create a hyperlink formula

    // Add category and hyperlink to the index sheet
    indexSheet.getRange(`A${row}`).setValue(category); // Add category to Column A
    indexSheet.getRange(`B${row}`).setFormula(hyperlink); // Add hyperlink to Column B
  });

  // Format the index sheet
  indexSheet.autoResizeColumn(1); // Resize Column A to fit the content
  indexSheet.autoResizeColumn(2); // Resize Column B to fit the content

  // Apply uniform formatting to ALL sheets in the file
  sheets.forEach((sheet) => {
    formatSheet(sheet); // Format each sheet
  });
  formatSheet(indexSheet); // Apply formatting to the Index sheet as well

  // Move the "Index" sheet to the first position
  ss.setActiveSheet(indexSheet); // Set the "Index" sheet as active
  ss.moveActiveSheet(1); // Move it to the first position in the spreadsheet

  SpreadsheetApp.flush(); // Apply all changes
  SpreadsheetApp.getUi().alert("Sheet index created successfully!"); // Notify the user
}

/**
 * Extracts the category from the sheet name (lowercase values preceding the first capital letter in PascalCase).
 * For example, "salesData" will return "sales".
 * @param {string} sheetName - The name of the sheet.
 * @returns {string} - The extracted category.
 */
function extractCategory(sheetName) {
  const match = sheetName.match(/^[a-z]+/); // Match lowercase letters at the start of the string
  return match ? match[0] : ""; // Return the matched category or an empty string if no match
}

/**
 * Applies uniform formatting to a sheet:
 * - Sets the font to Helvetica, size 10.
 * - Makes the first row bold and wraps its text.
 * - Freezes the first row.
 * - Aligns all cells to the left and top.
 * @param {Sheet} sheet - The sheet to format.
 */
function formatSheet(sheet) {
  // Set font to Helvetica, size 10 for the entire sheet
  sheet.getDataRange().setFontFamily("Helvetica").setFontSize(10);

  // Set the first row to bold and wrap its text
  sheet.getRange("1:1").setFontWeight("bold").setWrap(true);

  // Freeze the first row
  sheet.setFrozenRows(1);

  // Align all cells to the left and top
  sheet.getDataRange().setHorizontalAlignment("left").setVerticalAlignment("top");
}
