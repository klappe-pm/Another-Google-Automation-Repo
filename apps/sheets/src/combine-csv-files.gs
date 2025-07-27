/ * *
 * Script Name: combine- csv- files
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Process and transform data
 *
 * Script Functions:
 * - processCSVFiles(): Processes and transforms c s v files
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/ * *
 * processCSVFiles()
 *
 * This function retrieves CSV files from the '% % % % % ' folder, parses their data,
 * creates new sheets in the active spreadsheet, and moves the processed files to the
 * 'processed' folder. It includes error handling for empty or malformed CSV files and
 * parsing errors.
 * / / / Main Functions

/ / Main Functions

/ * *

 * Processes and transforms c s v files

 * /

function processCSVFiles() {
  / / Get the active spreadsheet
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  / / Access the folder '% % % % % '
  let folderName = '% % % % % ';
  let folders = DriveApp.getFoldersByName(folderName);

  / / Check if the folder exists
  if (! folders.hasNext()) {
    Logger.log('Folder not found: ' + folderName);
    return;
  }

  / / Get the folder object
  let folder = folders.next();
  / / Get all CSV files in the folder
  let files = folder.getFilesByType(MimeType.CSV);

  / / Get or create the 'processed' folder
  let processedFolderName = 'processed';
  let processedFolders = DriveApp.getFoldersByName(processedFolderName);
  / / If the 'processed' folder exists, get it; otherwise, create it
  let processedFolder = processedFolders.hasNext() ? processedFolders.next() : DriveApp.createFolder(processedFolderName);

  / / Process each CSV file
  while (files.hasNext()) {
    let file = files.next();
    / / Get the CSV data as a string
    let csvData = file.getBlob().getDataAsString();
    let csvValues;

    / / Attempt to parse the CSV data
    try {
      csvValues = Utilities.parseCsv(csvData);
    } catch (e) {
      / / Log an error if parsing fails and skip to the next file
      Logger.log('Error parsing CSV file ' + file.getName() + ': ' + e);
      continue; / / Skip to the next file
    }

    / / Check if the CSV data is empty or invalid
    if (! csvValues || csvValues.length = = = 0) {
      / / Log an error and skip to the next file
      Logger.log('Empty or invalid CSV file: ' + file.getName());
      processedFolder.addFile(file);
      folder.removeFile(file);
      continue; / / Skip to the next file
    }

    / / Check if the first row of the CSV data is empty
    if (! csvValues[0] || csvValues[0].length = = = 0) {
      / / Log an error and skip to the next file
      Logger.log('First row of CSV file is empty: ' + file.getName());
      processedFolder.addFile(file);
      folder.removeFile(file);
      continue;
    }

    / / Create a new sheet with the name of the CSV file
    let sheetName = file.getName().replace('.csv', '');
    let sheet = spreadsheet.insertSheet(sheetName);

    / / Set the CSV data into the sheet
    sheet.getRange(1, 1, csvValues.length, csvValues[0].length).setValues(csvValues);

    / / Move the processed file to the 'processed' folder
    processedFolder.addFile(file);
    folder.removeFile(file);
  }

  / / Log a completion message
  Logger.log('All CSV files have been processed.');
}