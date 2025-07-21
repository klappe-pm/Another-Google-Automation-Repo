/**
 * Title: Sheets Comprehensive Formatting
 * Service: Google Sheets
 * Purpose: Apply standardized formatting to all sheets in a spreadsheet
 * Created: 2024-03-30
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Automatically format all sheets with standardized styling and layout
- Description: Applies consistent fonts, alignment, column widths, and header formatting across all sheets
- Problem Solved: Eliminates manual formatting work and ensures visual consistency across spreadsheets
- Successful Execution: All sheets formatted with professional appearance and improved readability
*/

/**
 * Main formatting function that applies all formatting rules to every sheet
 * in the active spreadsheet. It formats font to Helvetica Neue size 11,
 * aligns cells left and top, makes the top row bold, sets text wrapping to clip,
 * freezes the top row, and resizes all columns to 100 pixels.
 */
function formatAllSheets() {
  // Get the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get all sheets in the spreadsheet
  var sheets = spreadsheet.getSheets();
  
  // Loop through each sheet
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    
    // Get the data range of the current sheet
    var dataRange = sheet.getDataRange();
    
    // Set font to Helvetica Neue, size 11 for all cells
    dataRange.setFontFamily("Helvetica Neue")
             .setFontSize(11);
    
    // Set horizontal alignment to left and vertical alignment to top for all cells
    dataRange.setHorizontalAlignment("left")
             .setVerticalAlignment("top");
    
    // Make the top row bold
    var topRow = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    topRow.setFontWeight("bold");
    
    // Set text wrapping to clip for all cells (truncates text that doesn't fit)
    dataRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
    
    // Freeze the top row so it remains visible while scrolling
    sheet.setFrozenRows(1);
    
    // Resize all columns to 100 pixels
    var numColumns = sheet.getLastColumn();
    for (var j = 1; j <= numColumns; j++) {
      sheet.setColumnWidth(j, 100);
    }
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
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Formatting')
    .addItem('Format All Sheets', 'formatAllSheets')
    .addToUi();
}