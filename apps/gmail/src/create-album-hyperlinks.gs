/**
 * Script Name: create-album-hyperlinks
 * 
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * - Generate new album hyperlinks items
 * - Set up required structure and metadata
 * - Apply formatting and organization
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Format output for presentation
 * 
 * Script Functions:
 * - addPhotoAlbumLinks(): Works with spreadsheet data
 * - onOpen(): Performs specialized operations
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

/*  *  * Main function that adds hyperlinks to Google Photos albums in the spreadsheet. * The function uses album IDs in column B to create links to the corresponding albums. *//*  *  * Creates a custom menu in the Google Sheets UI when the spreadsheet opens. * This function adds a menu item to run the photo album linking function. */// Main Functions

// Main Functions

/**

 * Works with spreadsheet data

 */

function addPhotoAlbumLinks() { // Get the active spreadsheet;
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); // Get all sheets in the spreadsheet;
  var sheets = spreadsheet.getSheets(); // Define tabs to skip;
  var tabsToSkip = ["gmail labels", "labels to reprocess", "labels to process", "processed"]; // Track statistics;
  var totalLinks = 0; // Loop through each sheet;
  for (var i = 0; i < sheets.length; i ++ ) {
    var sheet = sheets[i];
    var sheetName = sheet.getName(); // Skip specified tabs;
    if (tabsToSkip.indexOf(sheetName.toLowerCase()) ! = = - 1) {
      continue;
    } // Check if sheet has data
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) { // Skip empty sheets or sheets with only headers
      continue;
    } // Get range for column B (album IDs)
    var albumIdRange = sheet.getRange(2, 2, lastRow - 1, 1); // B2:B[lastRow];
    var albumIds = albumIdRange.getValues(); // Get range for column where we'll add hyperlinks (assuming column E);
    var hyperlinkColumn = 5; // Column E;
    var hyperlinkRange = sheet.getRange(2, hyperlinkColumn, lastRow - 1, 1); // Create an array to hold hyperlink formulas;
    var hyperlinkFormulas = []; // Process each album ID;
    for (var j = 0; j < albumIds.length; j ++ ) {
      var albumId = albumIds[j][0].toString().trim(); // Skip empty album IDs;
      if (!albumId) {
        hyperlinkFormulas.push([""]);
        continue;
      } // Create the Google Photos album URL - using the correct format // The correct format for Google Photos album URLs is: // https: // photos.google.com / share / {albumId}
      var albumUrl = "https: // photos.google.com / share / " + albumId; // Create a hyperlink formula: =HYPERLINK("url", "display text");
      var formula = '=HYPERLINK("' + albumUrl + '", "Open Album")';
      hyperlinkFormulas.push([formula]);
      totalLinks ++; } // Apply the hyperlink formulas to the sheet
    if (hyperlinkFormulas.length > 0) {
      hyperlinkRange.setFormulas(hyperlinkFormulas);
    }
  } // Show a message when complete
  SpreadsheetApp.getUi().alert('Added hyperlinks to ' + totalLinks + ' Google Photos albums successfully!');
}

/**

 * Performs specialized operations

 */

function onOpen() {
  var ui = SpreadsheetApp.getUi(); // Create a menu entry;
  ui.createMenu('Photo Albums');
    .addItem('Add Google Photos Links', 'addPhotoAlbumLinks');
    .addToUi();
}