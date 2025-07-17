/**
 * Title: Drive File Indexer - All Files
 * Service: Google Drive
 * Purpose: Indexes all file types in a Drive folder into categorized sheets
 * Created: 2023-10-15
 * Updated: 2025-07-16
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Automatically index and categorize files from Google Drive folders
- Description: Scans specified Drive folder and subfolders, categorizing files by type (Docs, Markdown, PDFs, Sheets, Slides) into separate sheets with metadata
- Problem Solved: Manual file organization and tracking across large Drive folder structures
- Successful Execution: Creates organized Google Sheets with categorized file listings including names, URLs, dates, and paths
- Dependencies: Google Drive API, Google Sheets API
- Functions:
  - createDriveIndex(): Main function that initializes the script, processes the folder, and finalizes the sheets
  - setupSheets(ss, allowedTypes): Sets up or retrieves sheets for each file type and sets headers if the sheet is empty
  - processFolder(folder, allowedTypes, sheets, processedFiles, queue): Processes files in the current folder and adds subfolders to the queue
  - shouldProcessFile(file, extensions, processedFiles): Determines if a file should be processed based on its extension and previous processing
  - addToSheet(sheet, file, type): Adds file details to the appropriate sheet
  - finalizeSheets(ss): Reorders sheets based on a specified tab order and sorts data within each sheet by creation date
  - Helper functions for sheet management, path construction, and date formatting
*/

function createDriveIndex() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allowedTypes = [
    { type: 'Docs', mimeType: 'application/vnd.google-apps.document' },
    { type: 'Markdown', extensions: ['md', 'txt', 'log', 'csv', 'json', 'xml', 'html', 'js', 'css'] },
    { type: 'PDFs', mimeType: 'application/pdf' },
    { type: 'Sheets', mimeType: 'application/vnd.google-apps.spreadsheet' },
    { type: 'Slides', mimeType: 'application/vnd.google-apps.presentation' },
  ];

  console.log('Process started at: ' + new Date().toISOString());

  const folderId = '1VdMQjZpl8t6X_t20dyliX94iAJtOh4sV'; // Replace with your folder ID
  const folder = DriveApp.getFolderById(folderId);

  const scriptProperties = PropertiesService.getScriptProperties();
  const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedFiles') || '[]'));

  // Set up sheets for file types
  const sheets = setupSheets(ss, allowedTypes);

  // Process folder and its subfolders
  const queue = [folder];
  while (queue.length > 0) {
    const currentFolder = queue.shift();
    processFolder(currentFolder, allowedTypes, sheets, processedFiles, queue);
  }

  // Save processed file IDs
  scriptProperties.setProperty('processedFiles', JSON.stringify([...processedFiles]));

  // Finalize sheets
  finalizeSheets(ss);

  console.log('Process completed at: ' + new Date().toISOString());
}

function setupSheets(ss, allowedTypes) {
  const sheets = {};
  allowedTypes.forEach(({ type }) => {
    const sheet = getOrCreateSheet(ss, type);
    if (sheet.getLastRow() === 0) {
      setHeaders(sheet); // Set headers only if the sheet is empty
    }
    sheets[type] = sheet;
  });
  return sheets;
}

function processFolder(folder, allowedTypes, sheets, processedFiles, queue) {
  allowedTypes.forEach(({ type, mimeType, extensions }) => {
    console.log(`Processing ${type} files in folder: ${folder.getName()}`);
    const files = mimeType ? folder.getFilesByType(mimeType) : folder.getFiles();

    while (files.hasNext()) {
      const file = files.next();
      if (shouldProcessFile(file, extensions, processedFiles)) {
        const sheet = sheets[type];
        addToSheet(sheet, file, type);
        processedFiles.add(file.getId());
        console.log(`Indexed file: ${file.getName()}`);
      }
    }
  });

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    queue.push(subFolders.next());
  }
}

function shouldProcessFile(file, extensions, processedFiles) {
  if (processedFiles.has(file.getId())) return false;

  const fileExtension = file.getName().split('.').pop().toLowerCase();
  return !extensions || extensions.includes(fileExtension);
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

function finalizeSheets(ss) {
  const tabOrder = ['Docs', 'Markdown', 'PDFs', 'Sheets', 'Slides'];
  const sheets = ss.getSheets();

  // Reorder sheets based on the specified tab order
  tabOrder.forEach((type, index) => {
    const sheet = ss.getSheetByName(type);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    }
  });

  // Sort data within each sheet by Created Date (newest to oldest)
  sheets.forEach(sheet => {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const range = sheet.getDataRange();
      range.sort({ column: 4, ascending: false }); // Sort by Created Date
    }
  });
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
