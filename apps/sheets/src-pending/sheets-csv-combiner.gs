/**
 * @summary Processes CSV files from a specified folder, imports their data into a Google Sheet,
 * and moves the processed files to a 'processed' folder.
 *
 * This script automates the following tasks:
 * 1. Retrieves all CSV files from a folder named '%%%%%' in Google Drive.
 * 2. Parses the CSV data using Utilities.parseCsv().
 * 3. Creates a new sheet in the active spreadsheet for each CSV file, named after the file.
 * 4. Imports the CSV data into the respective sheet.
 * 5. Moves the processed CSV files from '%%%%%' to a folder named 'processed'.
 * 6. Includes error handling for empty or malformed CSV files, and parsing errors.
 *
 * Functions:
 * - processCSVFiles(): Main function to process CSV files.
 */

/**
 * processCSVFiles()
 *
 * This function retrieves CSV files from the '%%%%%' folder, parses their data,
 * creates new sheets in the active spreadsheet, and moves the processed files to the
 * 'processed' folder. It includes error handling for empty or malformed CSV files and
 * parsing errors.
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
