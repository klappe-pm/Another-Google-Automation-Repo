/**
  * Script Name: process- main
  *
  * Script Summary:
  * Creates spreadsheet data for automated workflow processing.
  *
  * Script Purpose:
  * - Process main data transformations
  * - Apply business rules and logic
  * - Ensure data consistency
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
  * - createDriveIndex(): Creates new drive index or resources
  * - finalizeSheet(): Works with spreadsheet data
  * - getFilePath(): Gets specific file path or configuration
  * - getFileType(): Gets specific file type or configuration
  * - getOrCreateSheet(): Gets specific or create sheet or configuration
  * - processFolder(): Processes and transforms folder
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

/**  * Main function to create a Drive index in the bound Google Sheets spreadsheet. *// *  *  * Processes a folder and its subfolders to index files in the bound spreadsheet. * @param {object} folder - The folder to process. * @param {array} allowedTypes - The types of files to process. * @param {object} sheet - The sheet to add files to. * @param {Set} processedFiles - A set of processed file IDs. * @param {array} queue - A queue of folders to process. *// *  *  * Determines the type of a file based on allowed types. * @param {object} file - The file to check. * @param {array} allowedTypes - The allowed file types. * @returns {string|null} - The file type if allowed, null otherwise. *// *  *  * Adds file information to a sheet in the bound spreadsheet. * @param {object} sheet - The sheet to add the file information to. * @param {object} file - The file to add. * @param {string} type - The type of the file. *// *  *  * Finalizes the sheet by sorting it in the bound spreadsheet. * @param {object} sheet - The sheet to finalize. *//  / Helper functions / *  *  * Gets or creates a sheet with the specified name in the bound spreadsheet. * @param {object} ss - The bound spreadsheet. * @param {string} sheetName - The name of the sheet. * @returns {object} - The sheet object. *// *  *  * Sets up the headers for a sheet in the bound spreadsheet. * @param {object} sheet - The sheet to set up headers for. *// *  *  * Gets the file path for a given file. * @param {object} file - The file to get the path for. * @returns {string} - The file path. *// *  *  * Formats a date object into a string. * @param {Date} date - The date to format. * @returns {string} - The formatted date string. *// / Main Functions

// Main Functions

/**

  * Works with spreadsheet data
  * @param
  * @param {Sheet} sheet - The sheet parameter
  * @param {File} file - The file parameter
  * @param {any} type - The type parameter
  * @returns {string} The formatted string

  */

function addToSheet(sheet, file, type) {
  try {
    const filePath = getFilePath(file);
    const createdDate = file.getDateCreated();
    const lastModified = file.getLastUpdated();
    const today = new Date();

    const fileAge = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    const modifiedAge = Math.floor((today - lastModified) / (1000 * 60 * 60 * 24));

    const owner = file.getOwner().getEmail();
    const userEmail = Session.getActiveUser().getEmail();
    const access = file.getAccess(userEmail);
    let accessString;
    switch (access) {
      case DriveApp.Permission.OWNER:
        accessString = 'Owner';
        break;
      case DriveApp.Permission.EDIT:
        accessString = 'Editor';
        break;
      case DriveApp.Permission.COMMENT:
        accessString = 'Commenter';
        break;
      case DriveApp.Permission.VIEW:
        accessString = 'Viewer';
        break;
      default:
        accessString = 'No Access';
    }

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
      owner,
      accessString,
    ];

    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).insertCheckboxes().setHorizontalAlignment('center');
  } catch (error) {
    console.error(`Error adding file to sheet: ${file.getName()}`, error.message);
  }
}

/**

  * Creates new drive index or resources
  * @returns {string} The newly created string

  */

function createDriveIndex() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Refers to the bound spreadsheet;
    const allowedTypes = [;
      { type: 'Docs', mimeType: 'application / vnd.google - apps.document' },
      { type: 'Markdown', extensions: ['md'] },
      { type: 'Plain Text', extensions: ['txt'] },
      { type: 'Other Text', extensions: ['log', 'csv', 'json', 'xml', 'html', 'js', 'css'] },
      { type: 'PDFs', mimeType: 'application / pdf' },
      { type: 'Sheets', mimeType: 'application / vnd.google - apps.spreadsheet' },
      { type: 'Slides', mimeType: 'application / vnd.google - apps.presentation' },
    ];

    Logger.log('Process started at: ' + new Date().toISOString()); // Read the folder ID from the specified cell in the bound spreadsheet;
    const folderIdCell = ss.getSheets()[0].getRange('A1'); // Change 'A1' to the desired cell;
    const folderId = folderIdCell.getValue();
    if (! folderId) {
      throw new Error('Folder ID is missing in the specified cell.');
    }

    const folder = DriveApp.getFolderById(folderId);

    const scriptProperties = PropertiesService.getScriptProperties();
    const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedFiles') || '[]')); // Set up the single dated sheet in the bound spreadsheet;
    const today = new Date();
    const sheetName = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy - MM - dd');
    const sheet = getOrCreateSheet(ss, sheetName);
    if (sheet.getLastRow() = = = 0) {
      setHeaders(sheet); // Set headers only if the sheet is empty
    } // Process folder and its subfolders
    const queue = [folder];
    while (queue.length > 0) {
      const currentFolder = queue.shift();
      processFolder(currentFolder, allowedTypes, sheet, processedFiles, queue);
    } // Save processed file IDs
    scriptProperties.setProperty('processedFiles', JSON.stringify([...processedFiles])); // Finalize the sheet in the bound spreadsheet;
    finalizeSheet(sheet);

    Logger.log('Process completed at: ' + new Date().toISOString());
  } catch (error) {
    console.error('Error in createDriveIndex:', error.message);
  }
}

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

  * Gets specific file type or configuration
  * @param
  * @param {File} file - The file to retrieve
  * @param {any} allowedTypes - The allowedTypes to retrieve
  * @returns {string} The requested string

  */

function getFileType(file, allowedTypes) {
  const mimeType = file.getMimeType();
  const fileExtension = file.getName().split('.').pop().toLowerCase();

  for (const { type, mimeType: allowedMime, extensions } of allowedTypes) {
    if (allowedMime && mimeType = = = allowedMime) {
      return type;
    } else if (extensions && extensions.includes(fileExtension)) {
      return type;
    }
  }
  return null;
}

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

  * Processes and transforms folder
  * @param
  * @param {Folder} folder - The folder parameter
  * @param {any} allowedTypes - The allowedTypes parameter
  * @param {Sheet} sheet - The sheet parameter
  * @param {File} processedFiles - The processedFiles parameter
  * @param {any} queue - The queue parameter
  * @returns {string} The formatted string

  */

function processFolder(folder, allowedTypes, sheet, processedFiles, queue) {
  Logger.log(`Processing files in folder: ${folder.getName()}`);
  const files = folder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    if (processedFiles.has(file.getId())) continue;

    const fileType = getFileType(file, allowedTypes);
    if (fileType) {
      addToSheet(sheet, file, fileType);
      processedFiles.add(file.getId());
      Logger.log(`Indexed file: ${file.getName()}`);
    }
  }

  const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    queue.push(subFolders.next());
  }
}

/**

  * Sets headers or configuration values
  * @param
  * @param {Sheet} sheet - The sheet to set
  * @returns {string} The formatted string

  */

function setHeaders(sheet) {
  const headers = ['Clean - up', 'File Link', 'File Name', 'Created Date', 'Last Revised Date', 'File Age', 'Modified Age', 'File Type', 'File Path', 'File Owner', 'User Access'];
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

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy - MM - dd');
}