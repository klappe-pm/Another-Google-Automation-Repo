/**
 * Script Name: list- folder- ids
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
 * 4. Process and transform data
 * 5. Format output for presentation
 *
 * Script Functions:
 * - getFoldersRecursively(): Gets specific folders recursively or configuration
 * - listFolderIds(): Checks boolean condition
 * - logError(): Logs error or messages
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

1. Recursive folder traversal from specified root
  2. Automatic spreadsheet generation with headers
  3. Clear data organization in folderIDs sheet
  4. Error handling for permission issues *// / = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = // Configuration Settings // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ;

const CONFIG = {
  BATCH_SIZE: 100,
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 1800, // 30 minutes
  ROOT_FOLDER_ID: '1WClFwQ5wBWZvvRehwgSY9pb79UciYrg5' // Update this ID
}; // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = // Error Handling // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ;

) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    scriptName: 'drive - utility - folder - ids'
  };

  console.error('Script Error:', JSON.stringify(errorDetails, null, 2));
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
} // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = // Main Functions // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ;

 // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = // Menu Integration // = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ;

/**

 * Performs a specific operation

 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Drive Utilities');
    .addItem('List Folder IDs', 'listFolderIds');
    .addToUi();
}

// Main Functions

/**

 * Gets specific folders recursively or configuration
 * @param
 * @param {Folder} folder - The folder to retrieve
 * @param {Object} folderData - The folderData to retrieve
 * @param {string} parentPath - The parentPath to retrieve

 */

/**

 * Gets specific folders recursively or configuration
 * @param
 * @param {Folder} folder - The folder to retrieve
 * @param {Object} folderData - The folderData to retrieve
 * @param {string} parentPath - The parentPath to retrieve

 */

function getFoldersRecursively(folder, folderData, parentPath = '') {
  try { // Add current folder to the data array
    const folderInfo = [;
      folder.getName(),
      folder.getId(),
      parentPath,
      folder.getLastUpdated().toLocaleDateString();
    ];
    folderData.push(folderInfo); // Get subfolders;
    const subFolders = folder.getFolders();
    const currentPath = parentPath ? `${parentPath} / ${folder.getName()}` : folder.getName(); // Iterate through subfolders;
    while (subFolders.hasNext()) {
      try {
        const subFolder = subFolders.next(); // Recursively call for each subfolder;
        getFoldersRecursively(subFolder, folderData, currentPath);
      } catch (subError) {
        logError(subError, {
          function: 'getFoldersRecursively',
          parentFolder: folder.getName();
        }); // Continue with other folders even if one fails
      }
    }

  } catch (error) {
    logError(error, {
      function: 'getFoldersRecursively',
      folderName: folder ? folder.getName() : 'unknown';
    });
  }
}

/**

 * Checks boolean condition

 */

/**

 * Checks boolean condition

 */

function listFolderIds() {
  try { // Get the active spreadsheet and the sheet named "folderIDs"
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName("folderIDs"); // Create sheet if it doesn't exist;
    if (! sheet) {
      sheet = spreadsheet.insertSheet("folderIDs");
    } // Clear existing content in the sheet
    sheet.clear(); // Set headers with formatting;
    const headers = [["Folder Name", "Folder ID", "Parent Path", "Last Modified"]];
    sheet.getRange("A1:D1").setValues(headers);
    sheet.getRange("A1:D1").setFontWeight("bold"); // Get root folder;
    const rootFolder = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID); // Array to store folder data;
    let folderData = []; // Recursively get all folder IDs;
    getFoldersRecursively(rootFolder, folderData, rootFolder.getName()); // Write data to the sheet in batches;
    if (folderData.length > 0) {
      const batchSize = CONFIG.BATCH_SIZE;
      for (let i = 0; i < folderData.length; i + = batchSize) {
        const batch = folderData.slice(i, i + batchSize);
        const startRow = i + 2; //  + 2 because row 1 is headers and sheets are 1 - indexed;
        sheet.getRange(startRow, 1, batch.length, 4).setValues(batch);
      }
    } // Auto - resize columns
    sheet.autoResizeColumns(1, 4);

    Logger.log(`Successfully processed ${folderData.length} folders`);

  } catch (error) {
    logError(error, { function: 'listFolderIds' });
    throw new Error(`Failed to list folder IDs: ${error.message}`);
  }
}

function logError(error, context = {}