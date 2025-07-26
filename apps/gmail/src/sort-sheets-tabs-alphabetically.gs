/**
 * Script Name: sort-sheets-tabs-alphabetically
 * 
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Sort data by relevant fields
 * 5. Format output for presentation
 * 
 * Script Functions:
 * - onOpen(): Works with spreadsheet data
 * - sortSheetsAlphabetically(): Sorts and orders sheets alphabetically
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

// Main Functions

/**

 * Works with spreadsheet data
 * @returns {any} The result

 */

function onOpen() {
  // Get the UI object for the spreadsheet
  var ui = SpreadsheetApp.getUi();
  // Create a custom menu called "Sheet Tools"
  ui.createMenu('Sheet Tools')
    // Add menu item to trigger sorting function
    .addItem('Sort Sheets Alphabetically', 'sortSheetsAlphabetically')
    // Add the menu to the spreadsheet UI
    .addToUi();
}

/**

 * Sorts and orders sheets alphabetically
 * @returns {any} The result

 */

function sortSheetsAlphabetically() {
  // Get the active spreadsheet object
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // Get array of all sheets in the spreadsheet
  var sheets = spreadsheet.getSheets();
  
  // Create an array to store sheet information for sortable sheets
  var sheetInfo = [];
  
  // Iterate through all sheets and collect info, excluding fixed tabs
  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName();
    // Check if sheet is not one of the fixed tabs (case-insensitive)
    if (sheetName.toLowerCase() !== "gmail labels" && 
        sheetName.toLowerCase() !== "labels to process" && 
        sheetName.toLowerCase() !== "processed" && 
        sheetName.toLowerCase() !== "requirements") {
      sheetInfo.push({
        name: sheetName,    // Store sheet name
        sheet: sheets[i]    // Store sheet object
      });
    }
  }
  
  // Sort sheets alphabetically using locale-aware comparison
  sheetInfo.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
  
  // Handle "GMail Labels" sheet if it exists - move to first position
  var gmailSheet = spreadsheet.getSheetByName("GMail Labels");
  if (gmailSheet) {
    // Set "GMail Labels" as active
    spreadsheet.setActiveSheet(gmailSheet);
    // Move it to the first position (position 1)
    spreadsheet.moveActiveSheet(1);
  }
  
  // Handle "Labels to Process" sheet if it exists - move to second position
  var labelsSheet = spreadsheet.getSheetByName("Labels to Process");
  if (labelsSheet) {
    // Set "Labels to Process" as active
    spreadsheet.setActiveSheet(labelsSheet);
    // Move it to the second position (position 2)
    spreadsheet.moveActiveSheet(2);
  }
  
  // Handle "Processed" sheet if it exists - move to third position
  var processedSheet = spreadsheet.getSheetByName("Processed");
  if (processedSheet) {
    // Set "Processed" as active
    spreadsheet.setActiveSheet(processedSheet);
    // Move it to the third position (position 3)
    spreadsheet.moveActiveSheet(3);
  }
  
  // Handle "Requirements" sheet if it exists - move to fourth position
  var requirementsSheet = spreadsheet.getSheetByName("Requirements");
  if (requirementsSheet) {
    // Set "Requirements" as active
    spreadsheet.setActiveSheet(requirementsSheet);
    // Move it to the fourth position (position 4)
    spreadsheet.moveActiveSheet(4);
  }
  
  // Reorder remaining sheets starting at position 5 (after fixed tabs)
  for (var i = 0; i < sheetInfo.length; i++) {
    // Set each sheet as active
    spreadsheet.setActiveSheet(sheetInfo[i].sheet);
    // Move active sheet to position i+5 (1-based indexing, after positions 1-4)
    spreadsheet.moveActiveSheet(i + 5);
  }
}