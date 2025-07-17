/**
 * Google Apps Script for Comprehensive Spreadsheet Formatting
 * 
 * This script automatically formats all sheets in a Google Sheets file
 * according to a standardized template. It applies consistent formatting
 * across all sheets, including font styles, text alignment, column widths,
 * and special formatting for headers.
 * 
 * Functions:
 * - formatAllSheets(): The main function that applies all formatting to every sheet
 * - onOpen(): Creates a custom menu item to easily run the formatting function
 * 
 * Version: 1.0
 * Last Updated: March 30, 2025
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