/**
 * Script Name: markdown- index- files- legacy
 *
 * Script Summary:
 * Indexs markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Process and transform data
 * 5. Format output for presentation
 * 6. Write results to destination
 *
 * Script Functions:
 * - clearPreviousRuns(): Executes main process
 * - listFilesInFolder(): Checks boolean condition
 * - onOpen(): Manages files and folders
 * - processFolder(): Processes and transforms folder
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

/  / Hardcoded input for the top - level folder ID (replace with your folder ID or leave empty for My Drive);
let TOP_LEVEL_FOLDER_ID = ''; // Example: '1FM6FHK3HmkF15RIhKa8Y8oh4JYT - yL47' / *  *  * Creates custom menu items when the spreadsheet is opened * Automatically triggered by Google Sheets *// *  *  * Main function that initiates the folder indexing process * Creates a new dated sheet and starts recursive folder processing *// *  *  * Recursively processes a folder and all its contents * @param {Folder} folder - The Google Drive folder object to process * @param {Array} pathArray - Array of folder names representing the current path * @param {number} depth - Current depth level in the folder hierarchy * @param {Sheet} sheet - The Google Sheets sheet to write data to * @param {Array} processedIds - Array of already processed file / folder IDs * @returns {Array} Updated array of processed IDs *// *  *  * Clears the tracking of previously processed items * Allows for a fresh start on next run *// / Main Functions

// Main Functions

/**

 * Executes main process
 * @returns {any} The result

 */

function clearPreviousRuns() {
  let properties = PropertiesService.getScriptProperties();
  properties.deleteProperty('processedIds');
  Logger.log('Previous run tracking cleared.');
  SpreadsheetApp.getUi().alert('Previous run tracking has been cleared.');
}

/**

 * Checks boolean condition
 * @returns {any} True if condition is met, false otherwise

 */

function listFilesInFolder() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let properties = PropertiesService.getScriptProperties(); // Create or get the sheet with date stamp;
  let currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy - MM - dd');
  let newSheetName = currentDate + ' - folder and file tree';
  let sheet = spreadsheet.getSheetByName(newSheetName); // Create new sheet if it doesn't exist for today;
  if (! sheet) { // Create new sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(newSheetName); // Set headers for main sheet;
    let headers = [;
      "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", // Folder hierarchy columns
      "Name", "Date Created", "Date Revised", "Folder ID", "File ID" // Data attributes + IDs
    ];
    sheet.appendRow(headers); // Set formatting for the entire sheet;
    let range = sheet.getRange("A:DZ"); // Cover a large number of columns to ensure all are formatted;
    range.setFontFamily("Helvetica");
         .setFontSize(11);
         .setHorizontalAlignment("left");
         .setVerticalAlignment("top"); // Format date columns specifically for consistent date display;
    sheet.getRange("H:I").setNumberFormat("yyyy - MM - dd"); // Set formatting for header row;
    let headerRange = sheet.getRange("A1:K1");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1); // Keep header visible while scrolling;
  } // Get or initialize processed IDs from script properties (persists between runs)
  let processedIds = JSON.parse(properties.getProperty('processedIds') || '[]'); // Determine the top - level folder (either specified folder or root);
  let topFolder = TOP_LEVEL_FOLDER_ID ? DriveApp.getFolderById(TOP_LEVEL_FOLDER_ID) : DriveApp.getRootFolder(); // Process the top - level folder recursively;
  processFolder(topFolder, [], 0, sheet, processedIds); // Auto - resize columns for better visibility
  sheet.autoResizeColumns(1, 11); // Update processed IDs property for next run;
  properties.setProperty('processedIds', JSON.stringify(processedIds));

  Logger.log('Indexing complete.');
}

/**

 * Manages files and folders
 * @returns {any} The result

 */

function onOpen() { // Add a custom menu to the spreadsheet;
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu');
    .addItem('List Files in Folder', 'listFilesInFolder');
    .addItem('Clear Previous Runs', 'clearPreviousRuns');
    .addToUi();
}

/**

 * Processes and transforms folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @param {string} pathArray - The pathArray parameter
 * @param {any} depth - The depth parameter
 * @param {Sheet} sheet - The sheet parameter
 * @param {string} processedIds - The processedIds parameter
 * @returns {any} The result

 */

function processFolder(folder, pathArray, depth, sheet, processedIds) {
  let files = folder.getFiles();
  let subfolders = folder.getFolders();
  let fileData = [];
  let folderId = folder.getId(); // Process all files in the current folder;
  while (files.hasNext()) {
    let file = files.next();
    let fileId = file.getId(); // Skip if file was already processed in a previous run;
    if (processedIds.includes(fileId)) {
      continue; // Skip already processed files;
    }

    let fileName = file.getName(); // Skip Markdown files (customization point);
    if (fileName.toLowerCase().endsWith('.md')) {
      continue;
    } // Gather file metadata
    let fileUrl = file.getUrl();
    let createdDate = Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), 'yyyy - MM - dd');
    let lastUpdated = Utilities.formatDate(file.getLastUpdated(), Session.getScriptTimeZone(), 'yyyy - MM - dd'); // Create hyperlink formula for clickable file name;
    let hyperlinkFormula = '= HYPERLINK("' + fileUrl + '","' + fileName + '")'; // Create row with folder hierarchy first, then data attributes, then IDs;
    let row = new Array(11).fill(''); // Initialize with empty strings for all columns // Fill in folder hierarchy (columns 1 - 6);
    for (let i = 0; i < pathArray.length; i + + ) {
      row[i] = pathArray[i]; // Add folder hierarchy in columns 1 - 6;
    } // Fill in file data (columns 7 - 11)
    row[6] = hyperlinkFormula; // Name (with hyperlink) in column 7;
    row[7] = createdDate; // Date Created in column 8;
    row[8] = lastUpdated; // Date Revised in column 9;
    row[9] = folderId; // Folder ID in column 10;
    row[10] = fileId; // File ID in column 11 // Add the row to sheet;
    sheet.appendRow(row); // Mark file as processed;
    processedIds.push(fileId);
  } // Process subfolders recursively
  while (subfolders.hasNext() && depth < 5) { // Limit depth to 5 levels;
    let subfolder = subfolders.next();
    let newPath = pathArray.concat([subfolder.getName()]);
    processFolder(subfolder, newPath, depth + 1, sheet, processedIds);
  }

  return processedIds;
}