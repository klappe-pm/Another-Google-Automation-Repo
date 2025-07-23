/**
 * @OnlyCurrentDoc
 *
 * GOOGLE DRIVE MANAGER FOR SHEETS
 *
 * PURPOSE:
 * This script provides comprehensive Google Drive management functionalities within Google Sheets,
 * enabling users to index files and list folder hierarchies in a structured spreadsheet.
 * Settings are managed via a 'Config' sheet for a data-driven approach.
 *
 * KEY FEATURES:
 * - Indexes Drive files (Docs, PDFs, Markdown, Sheets, Slides) with metadata into categorized sheets.
 * - Lists Drive folder hierarchy in a columnar format up to a configurable depth.
 * - Configurable via a 'Config' sheet for file types, sheet order, and folder depth.
 * - Handles large Drives with queue-based processing and state persistence.
 * - Provides user-friendly UI with custom menus and error alerts.
 *
 * REQUIRED OAUTH SCOPES:
 * - https://www.googleapis.com/auth/spreadsheets (for reading/writing to Google Sheets)
 * - https://www.googleapis.com/auth/drive (for accessing Google Drive files and folders)
 * - https://www.googleapis.com/auth/script.storage (for storing script properties)
 *
 * FUNCTIONS OVERVIEW:
 *
 * UI Functions:
 * - onOpen(): Creates the custom 'Drive Tools' menu in Google Sheets.
 *
 * Configuration Functions:
 * - loadConfig(): Loads settings from the 'Config' sheet with JSON validation.
 * - createConfigTemplate(): Creates or resets the 'Config' sheet with default settings.
 *
 * Drive Indexer Functions:
 * - createDriveIndexMerged(): Indexes all Drive files into categorized sheets.
 * - setupSheets(ss, allowedTypes, config): Prepares sheets for file indexing.
 * - processFolder(folder, allowedTypes, sheets, processedFiles, queue, config, startTime, maxExecutionTimeMs): Recursively processes folders.
 * - shouldProcessFile(file, extensions, processedFiles, debugMode, mimeType): Checks if a file should be indexed.
 * - addToSheet(sheet, file, type): Adds file metadata to a sheet.
 * - finalizeSheets(ss, tabOrder): Reorders and sorts sheets.
 * - clearProcessedFilesCache(): Clears cached file IDs and folder queue.
 *
 * Folder Tree Functions:
 * - listFolderTreeMerged(): Lists Drive folder hierarchy in the 'FolderTree' sheet.
 * - buildFolderHierarchy(folder, maxDepth, currentPath, currentLevel, allFolderData): Builds folder hierarchy data.
 *
 * Utility Functions:
 * - getOrCreateSheet(ss, sheetName): Gets or creates a sheet.
 * - setHeaders(range, headersArray): Sets sheet headers with styling.
 * - getFilePath(file): Constructs a file’s full path with caching.
 * - formatDate(date): Formats a Date to 'yyyy-MM-dd'.
 * - logStatus(sheet, message, isError): Logs status messages to a sheet.
 * - showAlert(title, message, buttonSet): Displays a UI alert.
 * - logDebug(message, debugMode): Logs debug messages to the 'Log' sheet.
 *
 * USAGE:
 * 1. Open a Google Sheets spreadsheet.
 * 2. Go to Extensions > Apps Script and paste this script.
 * 3. Save the script and refresh the spreadsheet to see the 'Drive Tools' menu.
 * 4. Run 'Drive Tools' > 'Setup Configuration' to create the 'Config' sheet.
 * 5. Adjust settings in the 'Config' sheet (e.g., file types, folder depth).
 * 6. Run 'Drive Tools' > 'Index All Files' to index Drive files.
 * 7. Run 'Drive Tools' > 'List Folder Structure' to map folder hierarchy.
 *
 * VERSION: 1.1
 * LAST UPDATED: 2025
 */

// ======== GLOBAL CONSTANTS ========
const CONFIG_SHEET_NAME = 'Config';
const FOLDER_TREE_SHEET_NAME = 'FolderTree';
const DEFAULT_ALLOWED_FILE_TYPES = JSON.stringify([
  { type: 'Docs', mimeType: 'application/vnd.google-apps.document' },
  { type: 'Markdown', extensions: ['md', 'txt', 'log', 'csv', 'json', 'xml', 'html', 'js', 'css'] },
  { type: 'PDFs', mimeType: 'application/pdf' },
  { type: 'Sheets', mimeType: 'application/vnd.google-apps.spreadsheet' },
  { type: 'Slides', mimeType: 'application/vnd.google-apps.presentation' },
]);
const DEFAULT_TAB_ORDER = JSON.stringify(['Docs', 'Markdown', 'PDFs', 'Sheets', 'Slides', FOLDER_TREE_SHEET_NAME]);
const DEFAULT_MAX_FOLDER_DEPTH = 5;
const DEFAULT_DEBUG_MODE = false;
const DEFAULT_MAX_EXECUTION_TIME_MINUTES = 5;

// ======== UI FUNCTIONS ========

/**
 * Creates a custom 'Drive Tools' menu in Google Sheets for triggering Drive operations.
 * Adds menu items for configuration, indexing, cache clearing, and folder listing.
 * @returns {void}
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Drive Tools')
    .addItem('Setup Configuration', 'createConfigTemplate')
    .addSeparator()
    .addItem('Index All Files', 'createDriveIndexMerged')
    .addItem('Clear Indexed Files Cache', 'clearProcessedFilesCache')
    .addSeparator()
    .addItem('List Folder Structure', 'listFolderTreeMerged')
    .addToUi();
}

// ======== CONFIGURATION FUNCTIONS ========

/**
 * Loads configuration settings from the 'Config' sheet.
 * Validates JSON fields and ensures mandatory settings are present.
 * @returns {Object} Configuration object with settings
 * @throws {Error} If 'Config' sheet is missing or contains invalid JSON
 */
function loadConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);

  // Validate Config sheet exists
  if (!configSheet) {
    showAlert('Configuration Error', `"${CONFIG_SHEET_NAME}" sheet not found. Please run "Drive Tools" > "Setup Configuration".`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw new Error(`"${CONFIG_SHEET_NAME}" sheet not found.`);
  }

  const configData = configSheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < configData.length; i++) {
    const key = configData[i][0];
    let value = configData[i][1];
    if (key && value !== undefined) {
      try {
        if (typeof value === 'string' && (key === 'allowedFileTypes' || key === 'tabOrder')) {
          try {
            config[key] = JSON.parse(value);
          } catch (e) {
            throw new Error(`Invalid JSON in "${key}" (row ${i + 1}): ${value}`);
          }
        } else {
          config[key] = value;
        }
      } catch (e) {
        showAlert('Configuration Error', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
        throw e;
      }
    }
  }

  // Validate mandatory fields
  if (!config.allowedFileTypes || !Array.isArray(config.allowedFileTypes)) {
    throw new Error('Invalid or missing "allowedFileTypes" in Config sheet.');
  }
  if (!config.tabOrder || !Array.isArray(config.tabOrder)) {
    throw new Error('Invalid or missing "tabOrder" in Config sheet.');
  }
  if (typeof config.maxFolderDepth !== 'number') {
    config.maxFolderDepth = DEFAULT_MAX_FOLDER_DEPTH;
  }
  if (typeof config.debugMode !== 'boolean') {
    config.debugMode = DEFAULT_DEBUG_MODE;
  }
  if (typeof config.maxExecutionTimeMinutes !== 'number') {
    config.maxExecutionTimeMinutes = DEFAULT_MAX_EXECUTION_TIME_MINUTES;
  }

  return config;
}

/**
 * Creates or resets the 'Config' sheet with default settings.
 * Sets up headers and default values for user customization.
 * @returns {void}
 * @throws {Error} If sheet creation or update fails
 */
function createConfigTemplate() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let configSheet = ss.getSheetByName(CONFIG_SHEET_NAME);

    // Clear or create Config sheet
    if (configSheet) {
      configSheet.clear();
    } else {
      configSheet = ss.insertSheet(CONFIG_SHEET_NAME, 0);
    }

    const headers = ['Setting', 'Value', 'Description'];
    const configValues = [
      ['allowedFileTypes', DEFAULT_ALLOWED_FILE_TYPES, 'JSON array of file types to index (type, mimeType/extensions)'],
      ['tabOrder', DEFAULT_TAB_ORDER, 'JSON array of sheet names in desired tab order'],
      ['maxFolderDepth', DEFAULT_MAX_FOLDER_DEPTH, 'Maximum depth for folder tree listing (e.g., 5 for 5 levels)'],
      ['debugMode', DEFAULT_DEBUG_MODE, 'Set to true for verbose logging to Log sheet'],
      ['maxExecutionTimeMinutes', DEFAULT_MAX_EXECUTION_TIME_MINUTES, 'Maximum time in minutes for script execution before warning'],
    ];

    configSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica');
    configSheet.setFrozenRows(1);
    configSheet.getRange(2, 1, configValues.length, configValues[0].length).setValues(configValues);

    configSheet.autoResizeColumns(1, headers.length);

    ss.setActiveSheet(configSheet);
    showAlert('Setup Complete', `"${CONFIG_SHEET_NAME}" sheet has been created/updated. Please review and adjust as needed.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Error in createConfigTemplate:', error.message);
    showAlert('Error', `Failed to create/update "${CONFIG_SHEET_NAME}" sheet: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// ======== DRIVE INDEXER FUNCTIONS ========

/**
 * Indexes all Google Drive files into categorized sheets in the active spreadsheet.
 * Processes files in batches and persists state for resumption if time limits are reached.
 * @returns {void}
 * @throws {Error} If configuration is invalid or indexing fails
 */
function createDriveIndexMerged() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = getOrCreateSheet(ss, 'Log');
  logStatus(logSheet, 'Process started at: ' + new Date().toISOString());

  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error('Configuration loading failed:', error.message);
    logStatus(logSheet, `Error loading config: ${error.message}`, true);
    return;
  }

  try {
    const { allowedFileTypes, debugMode, maxExecutionTimeMinutes } = config;
    const folder = DriveApp.getRootFolder();
    const scriptProperties = PropertiesService.getScriptProperties();
    const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedFiles') || '[]'));
    const foldersQueue = JSON.parse(scriptProperties.getProperty('foldersQueue') || '[]');
    const queue = foldersQueue.length > 0 ? foldersQueue.map(id => DriveApp.getFolderById(id)) : [folder];

    const sheets = setupSheets(ss, allowedFileTypes, config);
    const MAX_EXECUTION_TIME_MS = maxExecutionTimeMinutes * 60 * 1000;
    const startTime = Date.now();

    while (queue.length > 0 && (Date.now() - startTime < MAX_EXECUTION_TIME_MS)) {
      const currentFolder = queue.shift();
      processFolder(currentFolder, allowedFileTypes, sheets, processedFiles, queue, config, startTime, MAX_EXECUTION_TIME_MS);
    }

    scriptProperties.setProperty('processedFiles', JSON.stringify([...processedFiles]));
    scriptProperties.setProperty('foldersQueue', JSON.stringify(queue.map(f => f.getId())));

    if (queue.length > 0) {
      logStatus(logSheet, 'Time limit reached. Script paused. Run again to resume.', true);
      showAlert('Script Paused', 'Execution time limit reached. Run again to resume.', SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      finalizeSheets(ss, config.tabOrder);
      scriptProperties.deleteProperty('processedFiles');
      scriptProperties.deleteProperty('foldersQueue');
      logStatus(logSheet, 'Process completed at: ' + new Date().toISOString());
      showAlert('Indexing Complete', 'Google Drive files indexed successfully.', SpreadsheetApp.getUi().ButtonSet.OK);
    }
  } catch (error) {
    console.error('Error in createDriveIndexMerged:', error.message);
    logStatus(logSheet, `Error: ${error.message}`, true);
    showAlert('Error', `Indexing failed: ${error.message}. Check "Log" sheet.`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Clears cached processed file IDs and folder queue, allowing a fresh index run.
 * Prompts user for confirmation before clearing.
 * @returns {void}
 * @throws {Error} If cache clearing fails
 */
function clearProcessedFilesCache() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Confirm Clear Cache',
    'This will clear the cache of processed files and folder queue, resetting the indexing process. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    showAlert('Operation Cancelled', 'Cache was not cleared.', ui.ButtonSet.OK);
    return;
  }

  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.deleteProperty('processedFiles');
    scriptProperties.deleteProperty('foldersQueue');
    showAlert('Cache Cleared', 'Cache cleared. Next index run will start from scratch.', ui.ButtonSet.OK);
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    showAlert('Error', `Failed to clear cache: ${error.message}`, ui.ButtonSet.OK);
    throw error;
  }
}

/**
 * Sets up sheets for each file type in the active spreadsheet.
 * Creates sheets if needed and sets headers for empty sheets.
 * @param {Spreadsheet} ss - The active spreadsheet
 * @param {Array<Object>} allowedTypes - File types to process
 * @param {Object} config - Configuration object
 * @returns {Object} Map of file types to corresponding sheets
 * @throws {Error} If sheet setup fails
 */
function setupSheets(ss, allowedTypes, config) {
  const sheets = {};
  const { debugMode } = config;
  allowedTypes.forEach(({ type }) => {
    try {
      const sheet = getOrCreateSheet(ss, type);
      if (sheet.getLastRow() === 0) {
        setHeaders(sheet.getRange(1, 1, 1, 9), [
          'Clean-up', 'File Link', 'File Name', 'Created Date', 'Last Modified',
          'File Age (Days)', 'Modified Age (Days)', 'File Type', 'File Path'
        ]);
      }
      sheets[type] = sheet;
      logDebug(`Sheet "${type}" prepared.`, debugMode);
    } catch (error) {
      console.error(`Error setting up sheet "${type}": ${error.message}`);
    }
  });
  return sheets;
}

/**
 * Processes a folder and its files, indexing them into appropriate sheets.
 * Fetches files once and filters by type to minimize API calls.
 * @param {Folder} folder - The folder to process
 * @param {Array<Object>} allowedTypes - File types to process
 * @param {Object} sheets - Map of file types to sheets
 * @param {Set<string>} processedFiles - Set of processed file IDs
 * @param {Array<Folder>} queue - Queue of folders to process
 * @param {Object} config - Configuration object
 * @param {number} startTime - Start time of indexing
 * @param {number} maxExecutionTimeMs - Maximum execution time in milliseconds
 * @returns {void}
 * @throws {Error} If file or folder processing fails
 */
function processFolder(folder, allowedTypes, sheets, processedFiles, queue, config, startTime, maxExecutionTimeMs) {
  const { debugMode } = config;
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  let fileCount = 0;

  logDebug(`Processing folder: ${folder.getName()} (${folder.getId()})`, debugMode);

  // Fetch all files once
  const filesIterator = folder.getFiles();
  const files = [];
  while (filesIterator.hasNext() && (Date.now() - startTime < maxExecutionTimeMs)) {
    files.push(filesIterator.next());
  }

  for (const { type, mimeType, extensions } of allowedTypes) {
    if (Date.now() - startTime >= maxExecutionTimeMs) {
      return;
    }

    const sheet = sheets[type];
    if (!sheet) {
      logDebug(`No sheet found for type "${type}".`, debugMode);
      continue;
    }

    for (const file of files) {
      if (Date.now() - startTime >= maxExecutionTimeMs) {
        return;
      }

      try {
        if (shouldProcessFile(file, extensions, processedFiles, debugMode, mimeType)) {
          addToSheet(sheet, file, type);
          processedFiles.add(file.getId());
          fileCount++;
          if (fileCount % 100 === 0) {
            logStatus(logSheet, `Processed ${fileCount} files in folder: ${folder.getName()}`);
          }
          logDebug(`Indexed file: ${file.getName()} (${file.getId()}) into "${type}" sheet.`, debugMode);
        }
      } catch (error) {
        console.error(`Error processing file ${file.getName()} (${file.getId()}): ${error.message}`);
      }
    }
  }

  logStatus(logSheet, `Completed folder: ${folder.getName()} (${fileCount} files processed)`);

  const subFoldersIterator = folder.getFolders();
  while (subFoldersIterator.hasNext() && (Date.now() - startTime < maxExecutionTimeMs)) {
    queue.push(subFoldersIterator.next());
  }
}

/**
 * Checks if a file should be indexed based on its ID, mimeType, and extensions.
 * Skips duplicates and files not matching criteria.
 * @param {File} file - The file to check
 * @param {Array<string>} extensions - Allowed file extensions (optional)
 * @param {Set<string>} processedFiles - Set of processed file IDs
 * @param {boolean} debugMode - Whether debug logging is enabled
 * @param {string} mimeType - Required mimeType (optional)
 * @returns {boolean} True if the file should be processed
 */
function shouldProcessFile(file, extensions, processedFiles, debugMode, mimeType) {
  if (processedFiles.has(file.getId())) {
    logDebug(`Skipping duplicate file: ${file.getName()}`, debugMode);
    return false;
  }

  if (mimeType && file.getMimeType() !== mimeType) {
    logDebug(`Skipping file with non-matching mimeType: ${file.getName()}`, debugMode);
    return false;
  }

  if (extensions) {
    const fileName = file.getName();
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    if (!extensions.includes(fileExtension)) {
      logDebug(`Skipping file with disallowed extension: ${fileName} (${fileExtension})`, debugMode);
      return false;
    }
  }

  return true;
}

/**
 * Adds a file’s metadata to the specified sheet.
 * Includes a cleanup checkbox and calculated file ages.
 * @param {Sheet} sheet - The sheet to add data to
 * @param {File} file - The file to index
 * @param {string} type - The file type category
 * @returns {void}
 * @throws {Error} If appending to sheet fails
 */
function addToSheet(sheet, file, type) {
  try {
    const filePath = getFilePath(file);
    const createdDate = file.getDateCreated();
    const lastModified = file.getLastUpdated();
    const today = new Date();

    const fileAge = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const modifiedAge = Math.floor((today.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24));

    const rowData = [
      false, file.getUrl(), file.getName(), formatDate(createdDate), formatDate(lastModified),
      fileAge, modifiedAge, type, filePath
    ];

    sheet.appendRow(rowData);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).insertCheckboxes().setHorizontalAlignment('center');
  } catch (error) {
    console.error(`Error adding file to sheet: ${file.getName()} - ${error.message}`);
  }
}

/**
 * Reorders sheets and sorts data by 'Created Date' (newest first).
 * Clears path cache after completion.
 * @param {Spreadsheet} ss - The active spreadsheet
 * @param {Array<string>} tabOrder - Desired sheet order
 * @returns {void}
 * @throws {Error} If sheet reordering or sorting fails
 */
function finalizeSheets(ss, tabOrder) {
  try {
    // Reorder sheets
    for (let i = tabOrder.length - 1; i >= 0; i--) {
      const type = tabOrder[i];
      const sheet = ss.getSheetByName(type);
      if (sheet) {
        ss.setActiveSheet(sheet);
        ss.moveActiveSheet(i + 1);
      }
    }

    // Sort sheets by Created Date
    const sheets = ss.getSheets();
    sheets.forEach(sheet => {
      if (sheet.getName() === CONFIG_SHEET_NAME || sheet.getName() === 'Log' || sheet.getName() === FOLDER_TREE_SHEET_NAME) {
        return;
      }
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
        range.sort({ column: 4, ascending: false });
      }
    });

    // Clear path cache
    PropertiesService.getScriptProperties().deleteProperty('path_*');
  } catch (error) {
    console.error(`Error finalizing sheets: ${error.message}`);
  }
}

// ======== FOLDER TREE FUNCTIONS ========

/**
 * Lists Google Drive folder hierarchy in the 'FolderTree' sheet.
 * Generates a columnar representation up to the configured depth.
 * @returns {void}
 * @throws {Error} If configuration is invalid or listing fails
 */
function listFolderTreeMerged() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error('Configuration loading failed:', error.message);
    return;
  }

  const { maxFolderDepth, debugMode } = config;
  const sheet = getOrCreateSheet(ss, FOLDER_TREE_SHEET_NAME);
  logStatus(sheet, 'Status: Script started at ' + new Date().toISOString());

  try {
    sheet.clearContents();
    sheet.getRange('A1').setValue('Google Drive Folder Hierarchy').setFontSize(14).setFontWeight('bold');

    const headers = [];
    for (let j = 0; j < maxFolderDepth; j++) {
      headers.push(`Level ${j} Folder Name`, `Level ${j} Folder URL`);
    }
    setHeaders(sheet.getRange(2, 1, 1, headers.length), headers);

    const rootFoldersIterator = DriveApp.getRootFolder().getFolders();
    const allFolderData = [];

    while (rootFoldersIterator.hasNext()) {
      const rootFolder = rootFoldersIterator.next();
      logDebug(`Processing root folder: ${rootFolder.getName()}`, debugMode);
      buildFolderHierarchy(rootFolder, maxFolderDepth, [], 0, allFolderData);
    }

    if (allFolderData.length > 0) {
      sheet.getRange(3, 1, allFolderData.length, allFolderData[0].length).setValues(allFolderData);
      logStatus(sheet, 'Script completed successfully at ' + new Date().toISOString());
      showAlert('Success', `Folder hierarchy listed in "${FOLDER_TREE_SHEET_NAME}" tab.`, SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      logStatus(sheet, 'No folders found in Google Drive');
      showAlert('Success', `No folders found. Check "${FOLDER_TREE_SHEET_NAME}" tab.`, SpreadsheetApp.getUi().ButtonSet.OK);
    }

    sheet.autoResizeColumns(1, headers.length);
    ss.setActiveSheet(sheet);
  } catch (error) {
    console.error('Error in listFolderTreeMerged:', error.message);
    logStatus(sheet, `Status: Error - ${error.message}`, true);
    showAlert('Error', `Script failed: ${error.message}. Check "${FOLDER_TREE_SHEET_NAME}" tab.`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Recursively builds folder hierarchy data for the 'FolderTree' sheet.
 * Populates rows with folder names and URLs up to maxDepth.
 * @param {Folder} folder - Current folder
 * @param {number} maxDepth - Maximum depth to traverse
 * @param {Array<string>} currentPath - Current folder path
 * @param {number} currentLevel - Current recursion level
 * @param {Array<Array<string>>} allFolderData - Accumulated row data
 * @returns {void}
 * @throws {Error} If folder access fails
 */
function buildFolderHierarchy(folder, maxDepth, currentPath, currentLevel, allFolderData) {
  const config = loadConfig();
  const { debugMode } = config;

  if (currentLevel >= maxDepth) {
    logDebug(`Max depth reached for folder: ${folder.getName()}`, debugMode);
    return;
  }

  const folderName = folder.getName();
  const folderUrl = folder.getUrl();

  const row = new Array(maxDepth * 2).fill('');
  const columnIndex = currentLevel * 2;
  row[columnIndex] = folderName;
  row[columnIndex + 1] = folderUrl;
  allFolderData.push(row);

  try {
    const subFolders = folder.getFolders();
    while (subFolders.hasNext()) {
      const subFolder = subFolders.next();
      buildFolderHierarchy(subFolder, maxDepth, currentPath.concat([`${folderName} | ${folderUrl}`]), currentLevel + 1, allFolderData);
    }
  } catch (error) {
    console.error(`Error getting subfolders for ${folderName}: ${error.message}`);
  }
}

// ======== UTILITY FUNCTIONS ========

/**
 * Gets an existing sheet or creates a new one in the active spreadsheet.
 * @param {Spreadsheet} ss - The active spreadsheet
 * @param {string} sheetName - Name of the sheet
 * @returns {Sheet} The sheet object
 * @throws {Error} If sheet creation fails
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Sets headers for a sheet with consistent styling.
 * Freezes the header row for usability.
 * @param {Range} range - Range for headers
 * @param {Array<string>} headersArray - Header names
 * @returns {void}
 * @throws {Error} If header setting fails
 */
function setHeaders(range, headersArray) {
  range.setValues([headersArray])
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontFamily('Helvetica');
  range.getSheet().setFrozenRows(range.getRow());
}

/**
 * Constructs a file’s full path, caching results to minimize API calls.
 * Traverses parent folders up to the root.
 * @param {File} file - The file to get the path for
 * @returns {string} The full file path
 * @throws {Error} If path construction fails
 */
function getFilePath(file) {
  const cache = PropertiesService.getScriptProperties();
  const cacheKey = `path_${file.getId()}`;
  let cachedPath = cache.getProperty(cacheKey);

  if (cachedPath) {
    return cachedPath;
  }

  const pathParts = [];
  try {
    let parents = file.getParents();
    let parent = parents.hasNext() ? parents.next() : null;

    while (parent && parent.getId() !== DriveApp.getRootFolder().getId()) {
      pathParts.unshift(parent.getName());
      parents = parent.getParents();
      parent = parents.hasNext() ? parents.next() : null;
    }

    if (parent && parent.getId() === DriveApp.getRootFolder().getId()) {
      pathParts.unshift(DriveApp.getRootFolder().getName());
    }

    const fullPath = pathParts.join('/') + '/' + file.getName();
    cache.setProperty(cacheKey, fullPath);
    return fullPath;
  } catch (error) {
    console.error(`Error getting path for ${file.getName()}: ${error.message}`);
    return `Error getting path for ${file.getName()}`;
  }
}

/**
 * Formats a Date object to 'yyyy-MM-dd' using the script’s timezone.
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string, or empty string if invalid
 */
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return '';
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Logs a status message to a sheet, with error styling for errors.
 * @param {Sheet} sheet - The sheet to log to
 * @param {string} message - The message to log
 * @param {boolean} isError - True if the message is an error
 * @returns {void}
 * @throws {Error} If logging fails
 */
function logStatus(sheet, message, isError = false) {
  try {
    const row = sheet.appendRow([message]);
    const range = sheet.getRange(sheet.getLastRow(), 1);
    range.setFontColor(isError ? 'red' : 'black');
  } catch (error) {
    console.error(`Failed to log status: ${error.message}`);
  }
}

/**
 * Displays a UI alert to the user.
 * Falls back to console logging if UI is unavailable.
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {ButtonSet} buttonSet - Buttons to display
 * @returns {void}
 * @throws {Error} If alert display fails
 */
function showAlert(title, message, buttonSet) {
  try {
    SpreadsheetApp.getUi().alert(title, message, buttonSet);
  } catch (error) {
    console.error(`Failed to show alert: ${title} - ${message}. Error: ${error.message}`);
  }
}

/**
 * Logs a debug message to the 'Log' sheet if debugMode is enabled.
 * @param {string} message - The debug message
 * @param {boolean} debugMode - Whether debug logging is enabled
 * @returns {void}
 * @throws {Error} If logging fails
 */
function logDebug(message, debugMode) {
  if (debugMode) {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log') || getOrCreateSheet(SpreadsheetApp.getActiveSpreadsheet(), 'Log');
    logStatus(logSheet, `DEBUG: ${message}`);
  }
}