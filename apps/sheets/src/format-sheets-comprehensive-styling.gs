/**
  * Script Name: format- sheets- comprehensive- styling
  *
  * Script Summary:
  * Creates spreadsheet data for automated workflow processing.
  *
  * Script Purpose:
  * - Apply formatting to sheets comprehensive styling
  * - Standardize appearance and structure
  * - Improve readability and organization
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Fetch source data
  * 3. Format output for presentation
  *
  * Script Functions:
  * - onOpen(): Works with spreadsheet data
  *
  * Script Helper Functions:
  * - formatAllSheets(): Formats all sheets for display
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - SpreadsheetApp: For spreadsheet operations
  */

/**
  * Main formatting function that applies all formatting rules to every sheet
  * in the active spreadsheet. It formats font to Helvetica Neue size 11,
  * aligns cells left and top, makes the top row bold, sets text wrapping to clip,
  * freezes the top row, and resizes all columns to 100 pixels.
  *// * *
  * Creates a custom menu in the Google Sheets UI when the spreadsheet opens.
  * This function adds a new menu item "Custom Formatting" with a sub- item
  * that runs the formatAllSheets function when clicked.
  *// / Main Functions

// Main Functions

/**

  * Works with spreadsheet data

  */

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Formatting')
    .addItem('Format All Sheets', 'formatAllSheets')
    .addToUi();
}

// Helper Functions

/**

  * Formats all sheets for display

  */

function formatAllSheets() {
  // Get the active spreadsheet
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Get all sheets in the spreadsheet
  let sheets = spreadsheet.getSheets();

  // Loop through each sheet
  for (let i = 0; i < sheets.length; i+ + ) {
    let sheet = sheets[i];

    // Get the data range of the current sheet
    let dataRange = sheet.getDataRange();

    // Set font to Helvetica Neue, size 11 for all cells
    dataRange.setFontFamily("Helvetica Neue")
              .setFontSize(11);

    // Set horizontal alignment to left and vertical alignment to top for all cells
    dataRange.setHorizontalAlignment("left")
              .setVerticalAlignment("top");

    // Make the top row bold
    let topRow = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    topRow.setFontWeight("bold");

    // Set text wrapping to clip for all cells (truncates text that doesn't fit)
    dataRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    // Freeze the top row so it remains visible while scrolling
    sheet.setFrozenRows(1);

    // Resize all columns to 100 pixels
    let numColumns = sheet.getLastColumn();
    for (let j = 1; j < = numColumns; j+ + ) {
      sheet.setColumnWidth(j, 100);
    }
  }

  // Show a message when complete
  SpreadsheetApp.getUi().alert('All sheets have been formatted successfully! ');
}