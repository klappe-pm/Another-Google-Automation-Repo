/**
 * Script Name: sort- sheets- columns
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
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
 * - onOpen(): Processes email data
 * - sortTabs(): Sorts and orders tabs
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - SpreadsheetApp: For spreadsheet operations
 */

/**
 * Creates a custom menu in the Google Sheets UI when the spreadsheet opens.
 * This function adds a new menu item "Sort Tabs" with a sub- item
 * that runs the sortTabs function when clicked.
 *// / Main Functions

// Main Functions

/**

 * Processes email data
 * @returns {any} The result

 */

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Tab Management')
    .addItem('Sort Tabs by Thread ID, Date & Time', 'sortTabs')
    .addToUi();
}

/**

 * Sorts and orders tabs
 * @returns {any} The result

 */

function sortTabs() {
  // Get the active spreadsheet
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Get all sheets in the spreadsheet
  let sheets = spreadsheet.getSheets();

  // Define tabs to skip
  let tabsToSkip = ["gmail labels", "labels to reprocess", "labels to process", "processed"];

  // Create an array to store sheet data for sorting
  let sheetData = [];

  // Loop through each sheet to get sorting data
  for (let i = 0; i < sheets.length; i+ + ) {
    let sheet = sheets[i];
    let sheetName = sheet.getName();

    // Skip specified tabs
    if (tabsToSkip.indexOf(sheetName.toLowerCase()) ! = = - 1) {
      continue;
    }

    // Check if sheet has data
    let lastRow = sheet.getLastRow();
    if (lastRow < 2) {  // Skip empty sheets or sheets with only headers
      continue;
    }

    // Get sorting values (assuming row 2 contains the relevant data - first row after header)
    let threadId = sheet.getRange("A2").getValue().toString();
    let dateReceived = sheet.getRange("C2").getValue();
    let timeReceived = sheet.getRange("D2").getValue();

    // Convert date and time to a single Date object for comparison if they are date objects
    let dateTimeValue;
    if (dateReceived instanceof Date && timeReceived instanceof Date) {
      dateTimeValue = new Date(
        dateReceived.getFullYear(),
        dateReceived.getMonth(),
        dateReceived.getDate(),
        timeReceived.getHours(),
        timeReceived.getMinutes(),
        timeReceived.getSeconds()
      );
    } else {
      // Handle case where date/ time might be in text format
      dateTimeValue = new Date(0); // Default to epoch if dates are invalid
    }

    // Store sheet and its sorting values
    sheetData.push({
      sheet: sheet,
      threadId: threadId,
      dateTime: dateTimeValue,
      index: i // Original position
    });
  }

  // Sort the sheet data (old to new)
  sheetData.sort(function(a, b) {
    // Primary sort by threadId
    if (a.threadId < b.threadId) return - 1;
    if (a.threadId > b.threadId) return 1;

    // Secondary sort by dateTime (if threadIds are equal)
    if (a.dateTime < b.dateTime) return - 1;
    if (a.dateTime > b.dateTime) return 1;

    // If everything is equal, maintain original order
    return a.index - b.index;
  });

  // Rearrange the sheets based on the sorted data
  for (let i = 0; i < sheetData.length; i+ + ) {
    spreadsheet.setActiveSheet(sheetData[i].sheet);
    spreadsheet.moveActiveSheet(i + 1); // + 1 because sheet positions are 1- based
  }

  // Show a message when complete
  SpreadsheetApp.getUi().alert('Tabs have been sorted successfully! ');
}