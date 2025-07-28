/**
 * Script Name: index- docs- files
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
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Sort data by relevant fields
 * 7. Format output for presentation
 *
 * Script Functions:
 * - addToSheet(): Works with spreadsheet data
 * - docsIndex(): Works with spreadsheet data
 * - finalizeSheet(): Works with spreadsheet data
 * - getFilePath(): Gets specific file path or configuration
 * - getOrCreateSheet(): Gets specific or create sheet or configuration
 * - setHeaders(): Sets headers or configuration values
 *
 * Script Helper Functions:
 * - formatDate(): Formats date for display
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

// Main Functions

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {File} file - The file parameter
 * @param {any} type - The type parameter
 * @returns {string} The formatted string

 */

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {File} file - The file parameter
 * @param {any} type - The type parameter
 * @returns {string} The formatted string

 */

function addToSheet(sheet, file, type) {
  const filePath = getFilePath(file);
  const createdDate = file.getDateCreated();
  const lastModified = file.getLastUpdated();
  const today = new Date();

  const fileAge = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
  const modifiedAge = Math.floor((today - lastModified) / (1000 * 60 * 60 * 24));

  const rowData = [;
    false, // Clean - up checkbox
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

/**

 * Works with spreadsheet data
 * @returns {string} The formatted string

 */

/**

 * Works with spreadsheet data
 * @returns {string} The formatted string

 */

function docsIndex() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Docs';
  const mimeType = 'application / vnd.google - apps.document';

  Logger.log('Docs indexing started at: ' + new Date().toISOString());

  const folderId = '1VdMQjZpl8t6X_t20dyliX94iAJtOh4sV'; // Replace with your folder ID;
  const folder = DriveApp.getFolderById(folderId);

  const scriptProperties = PropertiesService.getScriptProperties();
  const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedDocs') || '[]'));

  const sheet = getOrCreateSheet(ss, sheetName);
  if (sheet.getLastRow() = = = 0) {
    setHeaders(sheet); // Set headers only if the sheet is empty
  }

  const queue = [folder];
  while (queue.length > 0) {
    const currentFolder = queue.shift();
    const files = currentFolder.getFilesByType(mimeType);

    while (files.hasNext()) {
      const file = files.next();
      if (! processedFiles.has(file.getId())) {
        addToSheet(sheet, file, 'Docs');
        processedFiles.add(file.getId());
        Logger.log(`Indexed Docs file: ${file.getName()}`);
      }
    }

    const subFolders = currentFolder.getFolders();
    while (subFolders.hasNext()) {
      queue.push(subFolders.next());
    }
  }

  scriptProperties.setProperty('processedDocs', JSON.stringify([...processedFiles]));

  finalizeSheet(sheet);

  Logger.log('Docs indexing completed at: ' + new Date().toISOString());
}

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 */

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 */

function finalizeSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const range = sheet.getDataRange();
    range.sort({ column: 4, ascending: false }); // Sort by Created Date;
  }
}

/**

 * Gets specific file path or configuration
 * @param
 * @param {File} file - The file to retrieve
 * @returns {string} The requested string

 */

/**

 * Gets specific file path or configuration
 * @param
 * @param {File} file - The file to retrieve
 * @returns {string} The requested string

 */

function getFilePath(file) {
  const pathParts = [];
  let parent = file.getParents().hasNext() ? file.getParents().next() : null;
  while (parent) {
    pathParts.unshift(parent.getName());
    parent = parent.getParents().hasNext() ? parent.getParents().next() : null;
  }
  return pathParts.join(' / ') + ' / ' + file.getName();
}

/**

 * Gets specific or create sheet or configuration
 * @param
 * @param {any} ss - The ss to retrieve
 * @param {string} sheetName - The sheetName to retrieve
 * @returns {string} The requested string

 */

/**

 * Gets specific or create sheet or configuration
 * @param
 * @param {any} ss - The ss to retrieve
 * @param {string} sheetName - The sheetName to retrieve
 * @returns {string} The requested string

 */

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (! sheet) {
    sheet = ss.insertSheet(sheetName, ss.getSheets().length);
  }
  return sheet;
}

/**

 * Sets headers or configuration values
 * @param
 * @param {Sheet} sheet - The sheet to set
 * @returns {string} The formatted string

 */

/**

 * Sets headers or configuration values
 * @param
 * @param {Sheet} sheet - The sheet to set
 * @returns {string} The formatted string

 */

function setHeaders(sheet) {
  const headers = ['Clean - up', 'File Link', 'File Name', 'Created Date', 'Last Modified', 'File Age', 'Modified Age', 'File Type', 'File Path'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica');
  sheet.setFrozenRows(1);
}

// Helper Functions

/**

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @returns {string} The formatted string

 */

/**

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @returns {string} The formatted string

 */

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy - MM - dd');
}