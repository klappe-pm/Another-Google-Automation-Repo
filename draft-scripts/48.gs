/*
Script Name: SheetSorter

Summary:
This script organizes Google Sheets tabs alphabetically from A to Z (left to right),
while keeping specific sheets in fixed positions:
- "GMail Labels" as the first tab
- "Labels to Process" as the second tab
- "Processed" as the third tab
- "Requirements" as the fourth tab
All other sheets are sorted alphabetically following these four fixed tabs.

Functions:
1. sortSheetsAlphabetically() 
   - Main function that sorts all sheets alphabetically after fixed tabs
   - Ensures "GMail Labels", "Labels to Process", "Processed", and "Requirements" 
     remain in positions 1, 2, 3, and 4 respectively

2. onOpen()
   - Creates a custom menu in the Google Sheets UI
   - Adds "Sort Sheets Alphabetically" option to run the sorting function
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