////
// Summary: This Google Apps Script indexes Markdown and other text-based files (e.g., `.md`, `.txt`, `.csv`, `.json`, etc.) in a specified Google Drive folder and its subfolders, organizing them into a dedicated "Markdown" sheet in a Google Sheets document. The script records details such as file name, URL, creation date, last modified date, file age, and file path. It ensures that files are not reprocessed by tracking processed file IDs.
//
// Success: The script successfully indexes Markdown and related files into the "Markdown" sheet, organizes them, and sorts them by creation date. It also avoids reprocessing previously indexed files.
//
// Outputs: A Google Sheets document with a "Markdown" sheet containing indexed file details. The sheet includes headers and checkboxes for clean-up purposes.
//
// Functions:
// - markdownIndex(): Main function that initializes the script, processes the folder, and finalizes the "Markdown" sheet.
// - Helper Functions:
//   - getOrCreateSheet(ss, sheetName): Retrieves or creates a sheet with the specified name.
//   - setHeaders(sheet): Sets headers for the sheet if it is empty.
//   - addToSheet(sheet, file, type): Adds file details to the "Markdown" sheet.
//   - finalizeSheet(sheet): Sorts data in the sheet by creation date (newest to oldest).
//   - getFilePath(file): Constructs the file path by traversing parent folders.
//   - formatDate(date): Formats a date object into a 'yyyy-MM-dd' string.
//
// Dependencies: Google Drive and Google Sheets services must be enabled in the script.
//
// Link to the Google Apps Script: [Insert Link Here]
//
// Last Revised: 2023-10-15
////

function markdownIndex() {
  // Get the active spreadsheet and define the sheet name for Markdown files
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Markdown';

  // Define the file extensions to be indexed as Markdown files
  const extensions = ['md', 'txt', 'log', 'csv', 'json', 'xml', 'html', 'js', 'css'];

  // Log the start time of the indexing process
  console.log('Markdown indexing started at: ' + new Date().toISOString());

  // Define the folder ID to be indexed (replace with your folder ID)
  const folderId = '1VdMQjZpl8t6X_t20dyliX94iAJtOh4sV';
  const folder = DriveApp.getFolderById(folderId);

  // Retrieve or initialize the set of processed file IDs from script properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedMarkdown') || '[]'));

  // Get or create the "Markdown" sheet and set headers if the sheet is empty
  const sheet = getOrCreateSheet(ss, sheetName);
  if (sheet.getLastRow() === 0) {
    setHeaders(sheet);
  }

  // Initialize a queue with the root folder to process folders recursively
  const queue = [folder];
  while (queue.length > 0) {
    // Process the current folder
    const currentFolder = queue.shift();
    const files = currentFolder.getFiles();

    // Iterate through all files in the current folder
    while (files.hasNext()) {
      const file = files.next();
      // Extract the file extension and convert it to lowercase
      const fileExtension = file.getName().split('.').pop().toLowerCase();

      // Check if the file extension matches and if the file has not been processed
      if (extensions.includes(fileExtension) && !processedFiles.has(file.getId())) {
        // Add the file details to the sheet and mark it as processed
        addToSheet(sheet, file, 'Markdown');
        processedFiles.add(file.getId());
        console.log(`Indexed Markdown file: ${file.getName()}`);
      }
    }

    // Add subfolders to the queue for further processing
    const subFolders = currentFolder.getFolders();
    while (subFolders.hasNext()) {
      queue.push(subFolders.next());
    }
  }

  // Save the updated set of processed file IDs to script properties
  scriptProperties.setProperty('processedMarkdown', JSON.stringify([...processedFiles]));

  // Finalize the sheet by sorting the data
  finalizeSheet(sheet);

  // Log the completion time of the indexing process
  console.log('Markdown indexing completed at: ' + new Date().toISOString());
}

// Helper function to get or create a sheet with the specified name
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // If the sheet does not exist, create it at the end of the spreadsheet
    sheet = ss.insertSheet(sheetName, ss.getSheets().length);
  }
  return sheet;
}

// Helper function to set headers for the sheet if it is empty
function setHeaders(sheet) {
  const headers = ['Clean-up', 'File Link', 'File Name', 'Created Date', 'Last Modified', 'File Age', 'Modified Age', 'File Type', 'File Path'];
  // Set headers in the first row and apply formatting
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica');
  // Freeze the header row for easier navigation
  sheet.setFrozenRows(1);
}

// Helper function to add file details to the sheet
function addToSheet(sheet, file, type) {
  // Get the file path, creation date, and last modified date
  const filePath = getFilePath(file);
  const createdDate = file.getDateCreated();
  const lastModified = file.getLastUpdated();
  const today = new Date();

  // Calculate the age of the file in days
  const fileAge = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
  const modifiedAge = Math.floor((today - lastModified) / (1000 * 60 * 60 * 24));

  // Prepare the row data to be added to the sheet
  const rowData = [
    false, // Clean-up checkbox (initially unchecked)
    file.getUrl(), // File URL
    file.getName(), // File name
    formatDate(createdDate), // Formatted creation date
    formatDate(lastModified), // Formatted last modified date
    fileAge, // Age of the file in days
    modifiedAge, // Age since last modification in days
    type, // File type (e.g., 'Markdown')
    filePath, // Full file path
  ];

  // Append the row data to the sheet and add a checkbox in the first column
  sheet.appendRow(rowData);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).insertCheckboxes().setHorizontalAlignment('center');
}

// Helper function to finalize the sheet by sorting the data
function finalizeSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    // Sort the data range by the "Created Date" column (column 4) in descending order
    const range = sheet.getDataRange();
    range.sort({ column: 4, ascending: false });
  }
}

// Helper function to construct the file path by traversing parent folders
function getFilePath(file) {
  const pathParts = [];
  let parent = file.getParents().hasNext() ? file.getParents().next() : null;
  while (parent) {
    // Add parent folder names to the beginning of the path
    pathParts.unshift(parent.getName());
    parent = parent.getParents().hasNext() ? parent.getParents().next() : null;
  }
  // Join the path parts and append the file name
  return pathParts.join('/') + '/' + file.getName();
}

// Helper function to format a date object into a 'yyyy-MM-dd' string
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
