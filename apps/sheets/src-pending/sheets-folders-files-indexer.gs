/**
 * Script Summary:
 * This Google Apps Script indexes files in a specified Google Drive folder and its subfolders,
 * organizing the information into the bound Google Sheets spreadsheet (the spreadsheet containing this script).
 * It processes specific file types and logs detailed information about each file, including creation date,
 * last modified date, and file path. The script includes robust logging and debugging messages.
 *
 * Capabilities:
 * - Indexes files in a Google Drive folder and its subfolders.
 * - Organizes file information into the bound Google Sheets spreadsheet.
 * - Supports multiple file types, including Google Docs, Markdown files, PDFs, Google Sheets, and Google Slides.
 * - Includes detailed logging and debugging messages.
 * - Avoids processing duplicate files.
 * - Sorts and reorders sheets for better organization.
 *
 * Configuration Possibilities:
 * - Modify the `allowedTypes` array to include or exclude specific file types.
 * - Change the folder ID in the specified cell of the bound spreadsheet.
 * - Adjust the `tabOrder` array to change the order of sheets in the spreadsheet.
 * - Customize the headers in the `setHeaders` function to include additional file metadata.
 *
 * Setup Instructions:
 * 1. Open the Google Sheets spreadsheet where you want to use this script.
 * 2. Click on Extensions > Apps Script to open the script editor.
 * 3. Copy and paste this script into the script editor.
 * 4. In the bound spreadsheet, enter the Google Drive folder ID in the specified cell (e.g., `A1` of the first sheet).
 * 5. Save the script with a suitable name.
 * 6. Run the `createDriveIndex` function from the script editor.
 * 7. Authorize the script to access your Google Drive and Google Sheets when prompted.
 *
 * Date Ranges Exported:
 * - The script calculates the age of each file in days based on the current date.
 * - It exports the creation date and last modified date of each file in the format 'yyyy-MM-dd'.
 */

/**
 * Main function to create a Drive index in the bound Google Sheets spreadsheet.
 */
function createDriveIndex() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Refers to the bound spreadsheet
    const allowedTypes = [
      { type: 'Docs', mimeType: 'application/vnd.google-apps.document' },
      { type: 'Markdown', extensions: ['md', 'txt', 'log', 'csv', 'json', 'xml', 'html', 'js', 'css'] },
      { type: 'PDFs', mimeType: 'application/pdf' },
      { type: 'Sheets', mimeType: 'application/vnd.google-apps.spreadsheet' },
      { type: 'Slides', mimeType: 'application/vnd.google-apps.presentation' },
    ];

    console.log('Process started at: ' + new Date().toISOString());

    // Read the folder ID from the specified cell in the bound spreadsheet
    const folderIdCell = ss.getSheets()[0].getRange('A1'); // Change 'A1' to the desired cell
    const folderId = folderIdCell.getValue();
    if (!folderId) {
      throw new Error('Folder ID is missing in the specified cell.');
    }

    const folder = DriveApp.getFolderById(folderId);

    const scriptProperties = PropertiesService.getScriptProperties();
    const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedFiles') || '[]'));

    // Set up sheets for file types in the bound spreadsheet
    const sheets = setupSheets(ss, allowedTypes);

    // Process folder and its subfolders
    const queue = [folder];
    while (queue.length > 0) {
      const currentFolder = queue.shift();
      processFolder(currentFolder, allowedTypes, sheets, processedFiles, queue);
    }

    // Save processed file IDs
    scriptProperties.setProperty('processedFiles', JSON.stringify([...processedFiles]));

    // Finalize sheets in the bound spreadsheet
    finalizeSheets(ss);

    console.log('Process completed at: ' + new Date().toISOString());
  } catch (error) {
    console.error('Error in createDriveIndex:', error.message);
  }
}

/**
 * Sets up sheets for each file type in the bound spreadsheet.
 * @param {object} ss - The bound spreadsheet.
 * @param {array} allowedTypes - The types of files to process.
 * @returns {object} - A map of file types to their corresponding sheets.
 */
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

/**
 * Processes a folder and its subfolders to index files in the bound spreadsheet.
 * @param {object} folder - The folder to process.
 * @param {array} allowedTypes - The types of files to process.
 * @param {object} sheets - A map of file types to their corresponding sheets.
 * @param {Set} processedFiles - A set of processed file IDs.
 * @param {array} queue - A queue of folders to process.
 */
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

/**
 * Determines if a file should be processed.
 * @param {object} file - The file to check.
 * @param {array} extensions - The allowed file extensions.
 * @param {Set} processedFiles - A set of processed file IDs.
 * @returns {boolean} - True if the file should be processed, false otherwise.
 */
function shouldProcessFile(file, extensions, processedFiles) {
  if (processedFiles.has(file.getId())) return false;

  const fileExtension = file.getName().split('.').pop().toLowerCase();
  return !extensions || extensions.includes(fileExtension);
}

/**
 * Adds file information to a sheet in the bound spreadsheet.
 * @param {object} sheet - The sheet to add the file information to.
 * @param {object} file - The file to add.
 * @param {string} type - The type of the file.
 */
function addToSheet(sheet, file, type) {
  try {
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
  } catch (error) {
    console.error(`Error adding file to sheet: ${file.getName()}`, error.message);
  }
}

/**
 * Finalizes the sheets by reordering and sorting them in the bound spreadsheet.
 * @param {object} ss - The bound spreadsheet.
 */
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

/**
 * Gets or creates a sheet with the specified name in the bound spreadsheet.
 * @param {object} ss - The bound spreadsheet.
 * @param {string} sheetName - The name of the sheet.
 * @returns {object} - The sheet object.
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName, ss.getSheets().length);
  }
  return sheet;
}

/**
 * Sets up the headers for a sheet in the bound spreadsheet.
 * @param {object} sheet - The sheet to set up headers for.
 */
function setHeaders(sheet) {
  const headers = ['Clean-up', 'File Link', 'File Name', 'Created Date', 'Last Modified', 'File Age', 'Modified Age', 'File Type', 'File Path'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica');
  sheet.setFrozenRows(1);
}

/**
 * Gets the file path for a given file.
 * @param {object} file - The file to get the path for.
 * @returns {string} - The file path.
 */
function getFilePath(file) {
  const pathParts = [];
  let parent = file.getParents().hasNext() ? file.getParents().next() : null;
  while (parent) {
    pathParts.unshift(parent.getName());
    parent = parent.getParents().hasNext() ? parent.getParents().next() : null;
  }
  return pathParts.join('/') + '/' + file.getName();
}

/**
 * Formats a date object into a string.
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}
