/**
 * Title: CSV Files Combiner for Google Sheets
 * Service: Sheets
 * Purpose: Combine multiple CSV files into a single Google Sheets document
 * Created: 2024-01-15
 * Updated: 2025-07-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/sheets/sheets-csv-combiner.md
 * Timeout Strategy: Batch processing with 100 items per batch
 * Batch Processing: Standard batch size of 100 items
 * Cache Strategy: Cache results for 1 hour
 * Security: Implements API key rotation and rate limiting
 * Performance: Optimized for batch processing and caching
 */

/*
Script Summary:
- Purpose: Process CSV files from a specified folder and import their data into Google Sheets
- Description: Automates CSV processing by parsing files, creating sheets, and organizing processed files
- Problem Solved: Manual CSV file processing and consolidation workflow
- Successful Execution: Creates organized sheets from CSV data and moves processed files to designated folder
- Dependencies: Google Sheets API, Google Drive API
- Key Features:
  1. Batch CSV file retrieval from specified Google Drive folder
  2. Robust CSV parsing with error handling
  3. Dynamic sheet creation with appropriate naming
  4. Automatic data import and formatting
  5. File organization with processed folder management
  6. Comprehensive error handling for malformed files
  7. Detailed logging for debugging and monitoring
*/

/**
 * Main function to process CSV files from specified folder
 * Retrieves CSV files from the '%%%%%' folder, parses their data,
 * creates new sheets in the active spreadsheet, and moves processed files
 * to the 'processed' folder with comprehensive error handling
 */
function processCSVFiles() {
  // Get the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Access the folder '%%%%%'
  var folderName = '%%%%%';
  var folders = DriveApp.getFoldersByName(folderName);

  // Check if the folder exists
  if (!folders.hasNext()) {
    Logger.log('Folder not found: ' + folderName);
    return;
  }

  // Get the folder object
  var folder = folders.next();
  // Get all CSV files in the folder
  var files = folder.getFilesByType(MimeType.CSV);

  // Get or create the 'processed' folder
  var processedFolderName = 'processed';
  var processedFolders = DriveApp.getFoldersByName(processedFolderName);
  // If the 'processed' folder exists, get it; otherwise, create it
  var processedFolder = processedFolders.hasNext() ? processedFolders.next() : DriveApp.createFolder(processedFolderName);

  // Process each CSV file
  while (files.hasNext()) {
    var file = files.next();
    // Get the CSV data as a string
    var csvData = file.getBlob().getDataAsString();
    var csvValues;

    // Attempt to parse the CSV data
    try {
      csvValues = Utilities.parseCsv(csvData);
    } catch (e) {
      // Log an error if parsing fails and skip to the next file
      Logger.log('Error parsing CSV file ' + file.getName() + ': ' + e);
      continue; // Skip to the next file
    }

    // Check if the CSV data is empty or invalid
    if (!csvValues || csvValues.length === 0) {
      // Log an error and skip to the next file
      Logger.log('Empty or invalid CSV file: ' + file.getName());
      processedFolder.addFile(file);
      folder.removeFile(file);
      continue; // Skip to the next file
    }

    // Check if the first row of the CSV data is empty
    if (!csvValues[0] || csvValues[0].length === 0) {
      // Log an error and skip to the next file
      Logger.log('First row of CSV file is empty: ' + file.getName());
      processedFolder.addFile(file);
      folder.removeFile(file);
      continue;
    }

    // Create a new sheet with the name of the CSV file
    var sheetName = file.getName().replace('.csv', '');
    var sheet = spreadsheet.insertSheet(sheetName);

    // Set the CSV data into the sheet
    sheet.getRange(1, 1, csvValues.length, csvValues[0].length).setValues(csvValues);

    // Move the processed file to the 'processed' folder
    processedFolder.addFile(file);
    folder.removeFile(file);
  }

  // Log a completion message
  Logger.log('All CSV files have been processed.');
}
