/**
  * Script Name: folderids
  *
  * Script Summary:
  * Manages spreadsheet data for automated workflow processing.
  *
  * Script Purpose:
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Access Drive file system
  * 3. Fetch source data
  *
  * Script Functions:
  * - getFoldersRecursively(): Gets specific folders recursively or configuration
  * - listFolderIds(): Checks boolean condition
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - DriveApp: For file and folder management
  * - SpreadsheetApp: For spreadsheet operations
  */

// Main Functions

/**

  * Gets specific folders recursively or configuration
  * @param
  * @param {Folder} folder - The folder to retrieve
  * @param {Object} folderData - The folderData to retrieve

  */

/**

  * Gets specific folders recursively or configuration
  * @param
  * @param {Folder} folder - The folder to retrieve
  * @param {Object} folderData - The folderData to retrieve

  */

function getFoldersRecursively(folder, folderData) { // Add current folder to the data array
  folderData.push([folder.getName(), folder.getId()]); // Get subfolders;
  const subFolders = folder.getFolders(); // Iterate through subfolders;
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next(); // Recursively call for each subfolder;
    getFoldersRecursively(subFolder, folderData);
  }
}

/**

  * Checks boolean condition

  */

/**

  * Checks boolean condition

  */

function listFolderIds() { // Get the active spreadsheet and the sheet named "folderIDs"
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("folderIDs"); // Clear existing content in the sheet;
  sheet.clear(); // Set headers;
  sheet.getRange("A1:B1").setValues([["Folder Name", "Folder ID"]]); // Replace 'YOUR_ROOT_FOLDER_ID' with the actual folder ID you want to start from;
  const rootFolderId = '1WClFwQ5wBWZvvRehwgSY9pb79UciYrg5'; // Update this with the actual folder ID;
  const rootFolder = DriveApp.getFolderById(rootFolderId); // Array to store folder data;
  let folderData = []; // Recursively get all folder IDs;
  getFoldersRecursively(rootFolder, folderData); // Write data to the sheet
  if (folderData.length > 0) {
    sheet.getRange(2, 1, folderData.length, 2).setValues(folderData);
  }
}