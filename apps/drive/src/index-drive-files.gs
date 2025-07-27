/ * *
 * Script Name: index- drive- files
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Apply filters and criteria
 * 6. Sort data by relevant fields
 * 7. Write results to destination
 *
 * Script Functions:
 * - doGet(): Gets specific do or configuration
 * - getLastIndexedTime(): Gets specific last indexed time or configuration
 * - handleError(): Handles events or errors
 * - indexDrive(): Works with spreadsheet data
 * - logErrorToSheet(): Logs error to sheet or messages
 * - searchFiles(): Searches for specific files
 * - setupSpreadsheet(): Sets up spreadsheet or configuration values
 * - traverseFolder(): Works with spreadsheet data
 * - triggerIndexing(): Triggers actions or events
 * - writeBatchToSheet(): Writes batch to sheet to destination
 *
 * Script Dependencies:
 * - OAuth2 library
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - HtmlService: For serving HTML content
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/  / Google Apps Script: Google Drive Folder Indexer / / Indexes Google Drive files / folders and provides a search UI. / / Configuration constants
const SPREADSHEET_ID = '1k_ZARwFOi2kdHskPB3OIMkrXz6aXcbzX'; / / Replace with your Google Sheet ID;
const SHEET_NAME = 'DriveIndex'; / / Sheet for storing index data;
const ERROR_SHEET_NAME = 'Errors'; / / Sheet for error logs;
const LAST_INDEXED_KEY = 'lastIndexedTime'; / / Key for storing last indexed timestamp;
const BATCH_SIZE = 100; / / Number of rows to write per batch to optimize performance;
const RESULTS_PER_PAGE = 10; / / Number of search results per page;
const DEBUG_LOG = true; / / Enable detailed debugging logs / *  *  * Serves the web UI for the indexer. * @returns {GoogleAppsScript.HTML.HtmlOutput} The HTML content for the web app. * / / *  *  * Triggers full or incremental indexing of Google Drive. * @param {boolean} isIncremental - True for incremental indexing, false for full. * / / *  *  * Sets up the Google Sheet with headers for metadata storage. * @returns {GoogleAppsScript.Spreadsheet.Sheet} The index sheet. * / / *  *  * Recursively traverses a folder and indexes its contents. * @param {GoogleAppsScript.Drive.Folder} folder - The folder to traverse. * @param {string} path - The current folder path (e.g., ' / Folder1 / Subfolder'). * @param {string|null} lastIndexed - ISO timestamp for incremental indexing. * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The index sheet. * @returns {number} Number of files indexed. * / / *  *  * Writes a batch of metadata to the Google Sheet. * @param {Array < Array > } data - Array of metadata rows. * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The index sheet. * / / *  *  * Retrieves the last indexed timestamp. * @returns {string|null} ISO timestamp or null if not set. * / / *  *  * Searches the index for files / folders matching the query. * @param {Object} params - Search parameters: {query, mimeType, dateFrom, dateTo, page}. * @returns {Object} Search results and metadata. * / / *  *  * Triggers indexing via the UI. * @param {boolean} isIncremental - True for incremental indexing. * @returns {Object} Indexing status. * / / *  *  * Handles errors with retries for rate limits and logs to Logger and Sheet. * @param {Error} error - The error object. * @param {string} functionName - Name of the function where error occurred. * / / *  *  * Logs errors to a dedicated sheet for debugging. * @param {Error} error - The error object. * @param {string} functionName - Name of the function where error occurred. * / / / Main Functions

/ / Main Functions

/ * *

 * Gets specific do or configuration
 * @returns {string} The requested string

 * /

/ * *

 * Gets specific do or configuration
 * @returns {string} The requested string

 * /

function doGet() {
  if (DEBUG_LOG) Logger.log('[doGet] Serving web UI');
  return HtmlService.createHtmlOutputFromFile('index');
    .setTitle('Google Drive Folder Indexer');
}

/ * *

 * Gets specific last indexed time or configuration
 * @returns {string} The requested string

 * /

/ * *

 * Gets specific last indexed time or configuration
 * @returns {string} The requested string

 * /

function getLastIndexedTime() {
  if (DEBUG_LOG) Logger.log('[getLastIndexedTime] Fetching last indexed timestamp');
  const timestamp = PropertiesService.getScriptProperties().getProperty(LAST_INDEXED_KEY);
  if (DEBUG_LOG && timestamp) Logger.log(`[getLastIndexedTime] Timestamp: ${timestamp}`);
  return timestamp;
}

/ * *

 * Handles events or errors
 * @param
 * @param {any} error - The error parameter
 * @param {string} functionName - The functionName parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Handles events or errors
 * @param
 * @param {any} error - The error parameter
 * @param {string} functionName - The functionName parameter
 * @returns {string} The formatted string

 * /

function handleError(error, functionName) {
  if (DEBUG_LOG) Logger.log(`[handleError] Error in ${functionName}: ${error.message}`); / / Handle specific error types;
  if (error.message.includes('Quota exceeded') || error.message.includes('Rate Limit')) {
    if (DEBUG_LOG) Logger.log('[handleError] Rate limit detected, applying backoff');
    Utilities.sleep(1000 * Math.pow(2, 2)); / / Exponential backoff (4 seconds);
  } else if (error.message.includes('Network error')) {
    if (DEBUG_LOG) Logger.log('[handleError] Network error detected');
  } else if (error.message.includes('Insufficient permissions')) {
    if (DEBUG_LOG) Logger.log('[handleError] Permission error, check OAuth scopes');
  } / / Log error to sheet
  logErrorToSheet(error, functionName);
}

/ * *

 * Works with spreadsheet data
 * @param
 * @param {any} isIncremental - The isIncremental parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Works with spreadsheet data
 * @param
 * @param {any} isIncremental - The isIncremental parameter
 * @returns {string} The formatted string

 * /

function indexDrive(isIncremental = false) {
  if (DEBUG_LOG) Logger.log(`[indexDrive] Starting ${isIncremental ? 'incremental' : 'full'} indexing`);
  const startTime = Date.now();
  try { / / Setup the spreadsheet for indexing
    const sheet = setupSpreadsheet();
    const lastIndexed = isIncremental ? getLastIndexedTime() : null;
    if (DEBUG_LOG) Logger.log(`[indexDrive] Last indexed time: ${lastIndexed || 'None'}`); / / Clear existing index for full indexing;
    if (! isIncremental && sheet.getLastRow() > 1) {
      if (DEBUG_LOG) Logger.log('[indexDrive] Clearing existing index');
      sheet.getRange('A2:G' + sheet.getLastRow()).clearContent();
    } / / Start indexing from the root folder
    const rootFolder = DriveApp.getRootFolder();
    const indexedFiles = traverseFolder(rootFolder, '', lastIndexed, sheet); / / Store the current timestamp for incremental indexing;
    const timestamp = new Date().toISOString();
    PropertiesService.getScriptProperties().setProperty(LAST_INDEXED_KEY, timestamp);
    if (DEBUG_LOG) Logger.log(`[indexDrive] Indexed ${indexedFiles} files in ${(Date.now() - startTime) / 1000} seconds`);
  } catch (error) {
    handleError(error, 'indexDrive');
    throw error; / / Re - throw for UI feedback;
  }
}

/ * *

 * Logs error to sheet or messages
 * @param
 * @param {any} error - The error parameter
 * @param {string} functionName - The functionName parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Logs error to sheet or messages
 * @param
 * @param {any} error - The error parameter
 * @param {string} functionName - The functionName parameter
 * @returns {string} The formatted string

 * /

function logErrorToSheet(error, functionName) {
  if (DEBUG_LOG) Logger.log(`[logErrorToSheet] Logging error for ${functionName}`);
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let errorSheet = ss.getSheetByName(ERROR_SHEET_NAME); / / Create error sheet if it doesn't exist;
    if (! errorSheet) {
      if (DEBUG_LOG) Logger.log('[logErrorToSheet] Creating error sheet');
      errorSheet = ss.insertSheet(ERROR_SHEET_NAME);
      errorSheet.getRange('A1:C1').setValues([['Timestamp', 'Function', 'Error Message']]);
      errorSheet.getRange('A1:C1').setFontWeight('bold');
    } / / Append error details
    errorSheet.appendRow([new Date().toISOString(), functionName, error.message]);
    if (DEBUG_LOG) Logger.log('[logErrorToSheet] Error logged successfully');
  } catch (e) {
    if (DEBUG_LOG) Logger.log(`[logErrorToSheet] Failed to log error: ${e.message}`);
  }
}

/ * *

 * Searches for specific files
 * @param
 * @param {Object} params - Parameters for the operation
 * @returns {string} The formatted string

 * /

/ * *

 * Searches for specific files
 * @param
 * @param {Object} params - Parameters for the operation
 * @returns {string} The formatted string

 * /

function searchFiles(params) {
  if (DEBUG_LOG) Logger.log(`[searchFiles] Searching with params: ${JSON.stringify(params)}`);
  const startTime = Date.now();
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (! sheet) throw new Error('Index sheet not found.'); / / Read all data from the sheet;
    const data = sheet.getRange('A2:G' + sheet.getLastRow()).getValues();
    if (DEBUG_LOG) Logger.log(`[searchFiles] Read ${data.length} rows from sheet`); / / Filter data based on query parameters;
    const query = (params.query || '').toLowerCase();
    const mimeType = params.mimeType || '';
    const dateFrom = params.dateFrom ? new Date(params.dateFrom) : null;
    const dateTo = params.dateTo ? new Date(params.dateTo) : null;

    const results = data.filter(row = > {
      const name = row[1].toString().toLowerCase();
      const path = row[6].toString().toLowerCase();
      const rowMimeType = row[2].toString();
      const modifiedTime = new Date(row[4]); / / Match query on name or path;
      const matchesQuery = ! query || name.includes(query) || path.includes(query); / / Match MIME type;
      const matchesMimeType = ! mimeType || rowMimeType.includes(mimeType); / / Match date range;
      const matchesDate = (! dateFrom || modifiedTime > = dateFrom) && (! dateTo || modifiedTime < = dateTo);

      return matchesQuery && matchesMimeType && matchesDate;
    }); / / Sort by name relevance (exact matches first)
    results.sort((a, b) = > {
      const aName = a[1].toString().toLowerCase();
      const bName = b[1].toString().toLowerCase();
      if (aName = = = query) return - 1;
      if (bName = = = query) return 1;
      return aName.localeCompare(bName);
    }); / / Paginate results
    const page = parseInt(params.page) || 1;
    const start = (page - 1) * RESULTS_PER_PAGE;
    const paginatedResults = results.slice(start, start + RESULTS_PER_PAGE);

    const response = {
      results: paginatedResults.map(row = > ({
        fileId: row[0],
        name: row[1],
        mimeType: row[2],
        size: row[3],
        modifiedTime: row[4],
        path: row[6]
      })),
      totalResults: results.length,
      currentPage: page,
      totalPages: Math.ceil(results.length / RESULTS_PER_PAGE);
    };

    if (DEBUG_LOG) Logger.log(`[searchFiles] Found ${results.length} results in ${(Date.now() - startTime) / 1000} seconds`);
    return response;
  } catch (error) {
    handleError(error, 'searchFiles');
    return { results: [], totalResults: 0, currentPage: 1, totalPages: 0, error: error.message };
  }
}

/ * *

 * Sets up spreadsheet or configuration values
 * @returns {string} The formatted string

 * /

/ * *

 * Sets up spreadsheet or configuration values
 * @returns {string} The formatted string

 * /

function setupSpreadsheet() {
  if (DEBUG_LOG) Logger.log('[setupSpreadsheet] Initializing spreadsheet');
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME); / / Create sheet if it doesn't exist;
    if (! sheet) {
      if (DEBUG_LOG) Logger.log('[setupSpreadsheet] Creating new sheet: ' + SHEET_NAME);
      sheet = ss.insertSheet(SHEET_NAME); / / Define headers for metadata;
      const headers = [;
        'File ID', 'Name', 'MIME Type', 'Size', 'Modified Time', 'Parent ID', 'Path'
      ];
      sheet.getRange('A1:G1').setValues([headers]).setFontWeight('bold');
    }

    return sheet;
  } catch (error) {
    handleError(error, 'setupSpreadsheet');
    throw error;
  }
}

/ * *

 * Works with spreadsheet data
 * @param
 * @param {Folder} folder - The folder parameter
 * @param {string} path - The file path
 * @param {number} lastIndexed - The lastIndexed parameter
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Works with spreadsheet data
 * @param
 * @param {Folder} folder - The folder parameter
 * @param {string} path - The file path
 * @param {number} lastIndexed - The lastIndexed parameter
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 * /

function traverseFolder(folder, path, lastIndexed, sheet) {
  if (DEBUG_LOG) Logger.log(`[traverseFolder] Processing folder: ${folder.getName()}`);
  let indexedFiles = 0;
  const batchData = [];
  let apiCalls = 0;

  try { / / Construct the current folder path
    const currentPath = path ? `${path} / ${folder.getName()}` : folder.getName(); / / Index files in the current folder;
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      apiCalls + + ; const modifiedTime = file.getLastUpdated().toISOString(); / / Skip unmodified files for incremental indexing;
      if (lastIndexed && modifiedTime < = lastIndexed) continue; / / Collect metadata for the file;
      batchData.push([
        file.getId(),
        file.getName(),
        file.getMimeType(),
        file.getSize(),
        modifiedTime,
        folder.getId(),
        currentPath
      ]);
      indexedFiles + + ; / / Write batch to sheet if size is reached
      if (batchData.length > = BATCH_SIZE) {
        if (DEBUG_LOG) Logger.log(`[traverseFolder] Writing batch of ${batchData.length} files`);
        writeBatchToSheet(batchData, sheet);
        batchData.length = 0; / / Clear batch;
      }
    } / / Write any remaining batch
    if (batchData.length > 0) {
      if (DEBUG_LOG) Logger.log(`[traverseFolder] Writing final batch of ${batchData.length} files`);
      writeBatchToSheet(batchData, sheet);
    } / / Recursively index subfolders
    const folders = folder.getFolders();
    while (folders.hasNext()) {
      const subFolder = folders.next();
      apiCalls + + ; indexedFiles + = traverseFolder(subFolder, currentPath, lastIndexed, sheet);
    }

    if (DEBUG_LOG) Logger.log(`[traverseFolder] Completed folder: ${folder.getName()}, API calls: ${apiCalls}`);
    return indexedFiles;
  } catch (error) {
    handleError(error, 'traverseFolder');
    return indexedFiles;
  }
}

/ * *

 * Triggers actions or events
 * @param
 * @param {any} isIncremental - The isIncremental parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Triggers actions or events
 * @param
 * @param {any} isIncremental - The isIncremental parameter
 * @returns {string} The formatted string

 * /

function triggerIndexing(isIncremental) {
  if (DEBUG_LOG) Logger.log(`[triggerIndexing] Triggering ${isIncremental ? 'incremental' : 'full'} indexing`);
  try {
    indexDrive(isIncremental);
    return { status: 'success', message: `Indexing ${isIncremental ? 'incremental' : 'full'} completed.` };
  } catch (error) {
    handleError(error, 'triggerIndexing');
    return { status: 'error', message: error.message };
  }
}

/ * *

 * Writes batch to sheet to destination
 * @param
 * @param {Object} data - The data object to process
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Writes batch to sheet to destination
 * @param
 * @param {Object} data - The data object to process
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 * /

function writeBatchToSheet(data, sheet) {
  if (DEBUG_LOG) Logger.log(`[writeBatchToSheet] Writing ${data.length} rows`);
  try {
    if (data.length = = = 0) return; / / Use LockService to prevent concurrent writes;
    const lock = LockService.getScriptLock();
    lock.waitLock(30000); / / Wait up to 30 seconds;
    if (DEBUG_LOG) Logger.log('[writeBatchToSheet] Acquired lock');

    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, data.length, 7).setValues(data);

    lock.releaseLock();
    if (DEBUG_LOG) Logger.log('[writeBatchToSheet] Released lock');
  } catch (error) {
    handleError(error, 'writeBatchToSheet');
    throw error;
  }
}