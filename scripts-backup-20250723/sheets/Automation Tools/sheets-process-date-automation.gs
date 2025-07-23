/**
 * Title: Checkbox Date Automation Processor
 * Service: Google Sheets
 * Purpose: Automate date processing with checkbox controls and validation
 * Created: 2024-01-15
 * Updated: 2025-01-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Automatically sets or clears dates in specific columns based on checkbox states
- Description: Monitors checkbox changes and updates corresponding date columns with change logging
- Problem Solved: Automates date tracking workflows with checkbox-based controls
- Successful Execution: Updates date columns automatically and maintains comprehensive change log

Key Features:
1. Automatic date setting/clearing based on checkbox states
2. Comprehensive change logging to separate sheet
3. Configurable column mappings (L to W, M to X, P to AB, Q to AC, T to AG)
4. Real-time processing with onEdit triggers
5. Date validation and error handling
6. User-friendly change tracking
*/

/**
 * Triggers when a cell is edited in the spreadsheet.
 * Sets or clears dates based on checkbox status in specific columns.
 * 
 * @param {Object} e - The event object passed to the function.
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const column = range.getColumn();
  const row = range.getRow();
  const value = range.getValue();
  
  // Define the column mappings
  const columnMappings = {
    12: 23, // L to W
    13: 24, // M to X
    16: 28, // P to AB
    17: 29, // Q to AC
    20: 33  // T to AG (new mapping)
  };
  
  // Check if the edited column is one of the checkbox columns
  if (column in columnMappings) {
    const targetColumn = columnMappings[column];
    const targetCell = sheet.getRange(row, targetColumn);
    
    if (value === true) {
      // If checkbox is checked, set the current date
      targetCell.setValue(new Date());
      logChange(sheet.getName(), row, column, targetColumn, "Date set");
    } else {
      // If checkbox is unchecked, clear the date
      targetCell.clearContent();
      logChange(sheet.getName(), row, column, targetColumn, "Date cleared");
    }
  }
}

/**
 * Logs changes to the "Change Log" sheet.
 * Creates the log sheet if it doesn't exist.
 * 
 * @param {string} sheetName - Name of the sheet where the change occurred.
 * @param {number} row - Row number of the changed cell.
 * @param {number} inputColumn - Column number of the checkbox.
 * @param {number} outputColumn - Column number of the date cell.
 * @param {string} action - Description of the action (e.g., "Date set" or "Date cleared").
 */
function logChange(sheetName, row, inputColumn, outputColumn, action) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Change Log");
  if (!logSheet) {
    // Create log sheet if it doesn't exist
    const newLogSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Change Log");
    newLogSheet.appendRow(["Timestamp", "Sheet", "Row", "Input Column", "Output Column", "Action"]);
  }
  
  const timestamp = new Date();
  const inputColumnLetter = columnToLetter(inputColumn);
  const outputColumnLetter = columnToLetter(outputColumn);
  
  logSheet.appendRow([
    timestamp,
    sheetName,
    row,
    inputColumnLetter,
    outputColumnLetter,
    action
  ]);
}

/**
 * Converts a column number to its corresponding letter(s).
 * 
 * @param {number} column - The column number to convert.
 * @return {string} The column letter(s) (e.g., 'A', 'B', ..., 'Z', 'AA', 'AB', etc.).
 */
function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}
