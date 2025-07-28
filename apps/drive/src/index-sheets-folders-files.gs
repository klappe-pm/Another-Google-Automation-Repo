/**
  * Script Name: index- sheets- folders- files
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
  * - createDriveIndex(): Creates new drive index or resources
  * - finalizeSheets(): Works with spreadsheet data
  * - getFilePath(): Gets specific file path or configuration
  * - getOrCreateSheet(): Gets specific or create sheet or configuration
  * - processFolder(): Processes and transforms folder
  * - setHeaders(): Sets headers or configuration values
  * - setupSheets(): Sets up sheets or configuration values
  * - shouldProcessFile(): Processes and transforms should file
  *
  * Script Helper Functions:
  * - formatDate(): Formats date for display
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - DriveApp: For file and folder management
  * - PropertiesService: For storing script properties
  * - SpreadsheetApp: For spreadsheet operations
  * - Utilities: For utility functions and encoding
  */

/**
  * Sets up sheets for each file type in the bound spreadsheet.
  * @param {object} ss - The bound spreadsheet.
  * @param {array} allowedTypes - The types of files to process.
  * @returns {object} - A map of file types to their corresponding sheets.
  *// * *
  * Processes a folder and its subfolders to index files in the bound spreadsheet.
  * @param {object} folder - The folder to process.
  * @param {array} allowedTypes - The types of files to process.
  * @param {object} sheets - A map of file types to their corresponding sheets.
  * @param {Set} processedFiles - A set of processed file IDs.
  * @param {array} queue - A queue of folders to process.
  *// * *
  * Determines if a file should be processed.
  * @param {object} file - The file to check.
  * @param {array} extensions - The allowed file extensions.
  * @param {Set} processedFiles - A set of processed file IDs.
  * @returns {boolean} - True if the file should be processed, false otherwise.
  *// * *
  * Adds file information to a sheet in the bound spreadsheet.
  * @param {object} sheet - The sheet to add the file information to.
  * @param {object} file - The file to add.
  * @param {string} type - The type of the file.
  *// * *
  * Finalizes the sheets by reordering and sorting them in the bound spreadsheet.
  * @param {object} ss - The bound spreadsheet.
  *// * *
  * Gets or creates a sheet with the specified name in the bound spreadsheet.
  * @param {object} ss - The bound spreadsheet.
  * @param {string} sheetName - The name of the sheet.
  * @returns {object} - The sheet object.
  *// * *
  * Sets up the headers for a sheet in the bound spreadsheet.
  * @param {object} sheet - The sheet to set up headers for.
  *// * *
  * Gets the file path for a given file.
  * @param {object} file - The file to get the path for.
  * @returns {string} - The file path.
  *// * *
  * Formats a date object into a string.
  * @param {Date} date - The date to format.
  * @returns {string} - The formatted date string.
  *// / Main Functions

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
  try {
    const filePath = getFilePath(file);
    const createdDate = file.getDateCreated();
    const lastModified = file.getLastUpdated();
    const today = new Date();

    const fileAge = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    const modifiedAge = Math.floor((today - lastModified) / (1000 * 60 * 60 * 24));

    const rowData = [
      false, // Clean- up checkbox
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

  * Creates new drive index or resources
  * @returns {string} The newly created string

  */

/**

  * Creates new drive index or resources
  * @returns {string} The newly created string

  */

function createDriveIndex() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Refers to the bound spreadsheet
    const allowedTypes = [
      { type: 'Docs', mimeType: 'application/ vnd.google- apps.document' },
      { type: 'Markdown', extensions: ['md', 'txt', 'log', 'csv', 'json', 'xml', 'html', 'js', 'css'] },
      { type: 'PDFs', mimeType: 'application/ pdf' },
      { type: 'Sheets', mimeType: 'application/ vnd.google- apps.spreadsheet' },
      { type: 'Slides', mimeType: 'application/ vnd.google- apps.presentation' },
    ];

    console.log('Process started at: ' + new Date().toISOString());

    // Read the folder ID from the specified cell in the bound spreadsheet
    const folderIdCell = ss.getSheets()[0].getRange('A1'); // Change 'A1' to the desired cell
    const folderId = folderIdCell.getValue();
    if (! folderId) {
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

  * Works with spreadsheet data
  * @param
  * @param {any} ss - The ss parameter
  * @returns {string} The formatted string

  */

/**

  * Works with spreadsheet data
  * @param
  * @param {any} ss - The ss parameter
  * @returns {string} The formatted string

  */

function finalizeSheets(ss) {
  const tabOrder = ['Docs', 'Markdown', 'PDFs', 'Sheets', 'Slides'];
  const sheets = ss.getSheets();

  // Reorder sheets based on the specified tab order
  tabOrder.forEach((type, index) = > {
    const sheet = ss.getSheetByName(type);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    }
  });

  // Sort data within each sheet by Created Date (newest to oldest)
  sheets.forEach(sheet = > {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const range = sheet.getDataRange();
      range.sort({ column: 4, ascending: false }); // Sort by Created Date
    }
  });
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
  return pathParts.join('/ ') + '/ ' + file.getName();
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

  * Processes and transforms folder
  * @param
  * @param {Folder} folder - The folder parameter
  * @param {any} allowedTypes - The allowedTypes parameter
  * @param {Sheet} sheets - The sheets parameter
  * @param {File} processedFiles - The processedFiles parameter
  * @param {any} queue - The queue parameter
  * @returns {string} The formatted string

  */

/**

  * Processes and transforms folder
  * @param
  * @param {Folder} folder - The folder parameter
  * @param {any} allowedTypes - The allowedTypes parameter
  * @param {Sheet} sheets - The sheets parameter
  * @param {File} processedFiles - The processedFiles parameter
  * @param {any} queue - The queue parameter
  * @returns {string} The formatted string

  */

function processFolder(folder, allowedTypes, sheets, processedFiles, queue) {
  allowedTypes.forEach(({ type, mimeType, extensions }) = > {
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
  const headers = ['Clean- up', 'File Link', 'File Name', 'Created Date', 'Last Modified', 'File Age', 'Modified Age', 'File Type', 'File Path'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica');
  sheet.setFrozenRows(1);
}

/**

  * Sets up sheets or configuration values
  * @param
  * @param {any} ss - The ss to set
  * @param {any} allowedTypes - The allowedTypes to set
  * @returns {string} The formatted string

  */

/**

  * Sets up sheets or configuration values
  * @param
  * @param {any} ss - The ss to set
  * @param {any} allowedTypes - The allowedTypes to set
  * @returns {string} The formatted string

  */

function setupSheets(ss, allowedTypes) {
  const sheets = {};
  allowedTypes.forEach(({ type }) = > {
    const sheet = getOrCreateSheet(ss, type);
    if (sheet.getLastRow() = = = 0) {
      setHeaders(sheet); // Set headers only if the sheet is empty
    }
    sheets[type] = sheet;
  });
  return sheets;
}

/**

  * Processes and transforms should file
  * @param
  * @param {File} file - The file parameter
  * @param {any} extensions - The extensions parameter
  * @param {File} processedFiles - The processedFiles parameter
  * @returns {string} The formatted string

  */

/**

  * Processes and transforms should file
  * @param
  * @param {File} file - The file parameter
  * @param {any} extensions - The extensions parameter
  * @param {File} processedFiles - The processedFiles parameter
  * @returns {string} The formatted string

  */

function shouldProcessFile(file, extensions, processedFiles) {
  if (processedFiles.has(file.getId())) return false;

  const fileExtension = file.getName().split('.').pop().toLowerCase();
  return ! extensions || extensions.includes(fileExtension);
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
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy- MM- dd');
}