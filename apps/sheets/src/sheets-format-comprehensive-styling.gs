/**
 * Title: Sheets Comprehensive Formatting (Refactored)
 * Service: Google Sheets
 * Purpose: Apply standardized formatting to all non-empty sheets in a spreadsheet, optimized for performance.
 * Created: 2024-03-30
 * Updated: 2025-08-15
 * Author: Kevin Lappe (Refactored by AI)
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Automatically format all sheets with standardized styling and layout.
- Description: Applies consistent fonts, alignment, column widths, and header formatting. This version skips empty sheets to prevent errors and uses batch operations for better performance on sheets with many columns.
- Problem Solved: Eliminates manual formatting, ensures visual consistency, and prevents errors on empty sheets.
- Successful Execution: All non-empty sheets are formatted with a professional appearance and improved readability.
*/

/**
 * Main formatting function that applies all formatting rules to every non-empty sheet
 * in the active spreadsheet. It formats font to Helvetica Neue size 11,
 * aligns cells, makes the header bold, sets text wrapping to wrap,
 * freezes the top row, and efficiently resizes all columns.
 */
function formatAllSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  
  // Loop through each sheet in the spreadsheet
  for (const sheet of sheets) {
    const sheetName = sheet.getName();
    
    // **FIX:** Check if the sheet has any columns. If it's empty, getLastColumn() returns 0,
    // which causes an error. This 'if' block skips empty sheets.
    if (sheet.getLastColumn() < 1) {
      Logger.log(`Skipping empty sheet: "${sheetName}"`);
      continue; // Move to the next sheet
    }
    
    Logger.log(`Formatting sheet: "${sheetName}"`);
    
    const dataRange = sheet.getDataRange();
    const numColumns = sheet.getLastColumn();
    
    // Set font, alignment, and wrapping strategy for all cells
    dataRange.setFontFamily("Helvetica Neue")
             .setFontSize(11)
             .setHorizontalAlignment("left")
             .setVerticalAlignment("top")
             .setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
    
    // Make the top row bold
    const topRow = sheet.getRange(1, 1, 1, numColumns);
    topRow.setFontWeight("bold");
    
    // Freeze the top row so it remains visible while scrolling
    sheet.setFrozenRows(1);
    
    // **REFACTOR:** Instead of resizing columns one-by-one in a loop,
    // this single command resizes all columns at once, which is much faster
    // for sheets with 100+ columns.
    sheet.setColumnWidths(1, numColumns, 300);
  }
  
  // Show a message when complete
  SpreadsheetApp.getUi().alert('All sheets have been formatted successfully!');
}

/**
 * Creates a custom menu in the Google Sheets UI when the spreadsheet opens.
 * This function adds a new menu item "Custom Formatting" with a sub-item
 * that runs the formatAllSheets function when clicked.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Custom Formatting')
    .addItem('Format All Sheets', 'formatAllSheets')
    .addToUi();
}

