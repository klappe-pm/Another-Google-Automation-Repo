////
// Summary: This Google Apps Script indexes Google Docs files in a specified Google Drive folder and its subfolders, organizing them into a dedicated sheet in a Google Sheets document. The script records details such as file name, URL, creation date, last modified date, file age, and file path. It ensures that files are not reprocessed by tracking processed file IDs.
//
// Success: The script successfully indexes Google Docs files into the "Docs" sheet, organizes them, and sorts them by creation date. It also avoids reprocessing previously indexed files.
//
// Outputs: A Google Sheets document with a "Docs" sheet containing indexed file details. The sheet includes headers and checkboxes for clean-up purposes.
//
// Functions:
// - docsIndex(): Main function that initializes the script, processes the folder, and finalizes the "Docs" sheet.
// - Helper Functions:
//   - getOrCreateSheet(ss, sheetName): Retrieves or creates a sheet with the specified name.
//   - setHeaders(sheet): Sets headers for the sheet if it is empty.
//   - addToSheet(sheet, file, type): Adds file details to the "Docs" sheet.
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

function docsIndex() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Docs';
  const mimeType = 'application/vnd.google-apps.document';

  console.log('Docs indexing started at: ' + new Date().toISOString());

  const folderId = '1VdMQjZpl8t6X_t20dyliX94iAJtOh4sV'; // Replace with your folder ID
  const folder = DriveApp.getFolderById(folderId);

  const scriptProperties = PropertiesService.getScriptProperties();
  const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedDocs') || '[]'));

  const sheet = getOrCreateSheet(ss, sheetName);
  if (sheet.getLastRow() === 0) {
    setHeaders(sheet); // Set headers only if the sheet is empty
  }

  const queue = [folder];
  while (queue.length > 0) {
    const currentFolder = queue.shift();
    const files = currentFolder.getFilesByType(mimeType);

    while (files.hasNext()) {
      const file = files.next();
      if (!processedFiles.has(file.getId())) {
        addToSheet(sheet, file, 'Docs');
        processedFiles.add(file.getId());
        console.log(`Indexed Docs file: ${file.getName()}`);
      }
    }

    const subFolders = currentFolder.getFolders();
    while (subFolders.hasNext()) {
      queue.push(subFolders.next());
    }
  }

  scriptProperties.setProperty('processedDocs', JSON.stringify([...processedFiles]));

  finalizeSheet(sheet);

  console.log('Docs indexing completed at: ' + new Date().toISOString());
}

// Helper functions
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName, ss.getSheets().length);
  }
  return sheet;
}

function setHeaders(sheet) {
  const headers = ['Clean-up', 'File Link', 'File Name', 'Created Date', 'Last Modified', 'File Age', 'Modified Age', 'File Type', 'File Path'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica');
  sheet.setFrozenRows(1);
}

function addToSheet(sheet, file, type) {
  const filePath = getFilePath(file);
  const createdDate = file.getDateCreated();
  const lastModified = file.getLastUpdated();
  const today = new Date();

  const fileAge = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
  const modifiedAge = Math.floor((today - lastModified) / (1000 * 60 * 60 * 24));

  const rowData = [
    false, // Clean-up checkbox
    file.getUrl(),
    file.getName(),
    formatDate(createdDate),
    formatDate(lastModified),
    fileAge,
    modifiedAge,
    type,
    filePath,
  ];

  sheet.appendRow(rowData);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).insertCheckboxes().setHorizontalAlignment('center');
}

function finalizeSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const range = sheet.getDataRange();
    range.sort({ column: 4, ascending: false }); // Sort by Created Date
  }
}

function getFilePath(file) {
  const pathParts = [];
  let parent = file.getParents().hasNext() ? file.getParents().next() : null;
  while (parent) {
    pathParts.unshift(parent.getName());
    parent = parent.getParents().hasNext() ? parent.getParents().next() : null;
  }
  return pathParts.join('/') + '/' + file.getName();
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
