/**
 * Google Drive Folder Tree Indexer
 * 
 * Script Name: Drive Folder Tree Generator
 * Purpose: Recursively indexes files and folders from Google Drive into a Google Sheets spreadsheet
 * 
 * Summary:
 * This script creates a hierarchical view of files in Google Drive, displaying folder structure
 * up to 6 levels deep. It generates a dated sheet with file information including names (as hyperlinks),
 * creation dates, revision dates, and IDs. The script tracks processed items to avoid duplicates
 * and excludes Markdown (.md) files.
 * 
 * Functions (Alphabetical):
 * - clearPreviousRuns(): Clears the tracking of previously processed items
 * - listFilesInFolder(): Main function that initiates the indexing process
 * - onOpen(): Creates custom menu items when the spreadsheet is opened
 * - processFolder(): Recursive function that processes folders and their contents
 * 
 * Functions (Execution Order):
 * 1. onOpen() - Automatically runs when spreadsheet opens
 * 2. listFilesInFolder() - Called when user selects menu item
 * 3. processFolder() - Called recursively by listFilesInFolder()
 * 4. clearPreviousRuns() - Called independently via menu
 * 
 * Customizations:
 * - TOP_LEVEL_FOLDER_ID: Set to specific folder ID or leave empty for My Drive
 * - Sheet naming format: 'yyyy-MM-dd-folder and file tree'
 * - Excludes .md files from indexing
 * - Tracks processed items to allow incremental updates
 * - Custom formatting with Helvetica font and frozen header row
 */

// Hardcoded input for the top-level folder ID (replace with your folder ID or leave empty for My Drive)
var TOP_LEVEL_FOLDER_ID = ''; // Example: '1FM6FHK3HmkF15RIhKa8Y8oh4JYT-yL47'

/**
 * Creates custom menu items when the spreadsheet is opened
 * Automatically triggered by Google Sheets
 */
function onOpen() {
  // Add a custom menu to the spreadsheet
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
    .addItem('List Files in Folder', 'listFilesInFolder')
    .addItem('Clear Previous Runs', 'clearPreviousRuns')
    .addToUi();
}

/**
 * Main function that initiates the folder indexing process
 * Creates a new dated sheet and starts recursive folder processing
 */
function listFilesInFolder() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var properties = PropertiesService.getScriptProperties();
  
  // Create or get the sheet with date stamp
  var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var newSheetName = currentDate + '-folder and file tree';
  var sheet = spreadsheet.getSheetByName(newSheetName);
  
  // Create new sheet if it doesn't exist for today
  if (!sheet) {
    // Create new sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(newSheetName);

    // Set headers for main sheet
    var headers = [
      "Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", // Folder hierarchy columns
      "Name", "Date Created", "Date Revised", "Folder ID", "File ID" // Data attributes + IDs
    ];
    sheet.appendRow(headers);

    // Set formatting for the entire sheet
    var range = sheet.getRange("A:DZ"); // Cover a large number of columns to ensure all are formatted
    range.setFontFamily("Helvetica")
         .setFontSize(11)
         .setHorizontalAlignment("left")
         .setVerticalAlignment("top");

    // Format date columns specifically for consistent date display
    sheet.getRange("H:I").setNumberFormat("yyyy-MM-dd");

    // Set formatting for header row
    var headerRange = sheet.getRange("A1:K1");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1); // Keep header visible while scrolling
  }

  // Get or initialize processed IDs from script properties (persists between runs)
  var processedIds = JSON.parse(properties.getProperty('processedIds') || '[]');

  // Determine the top-level folder (either specified folder or root)
  var topFolder = TOP_LEVEL_FOLDER_ID ? DriveApp.getFolderById(TOP_LEVEL_FOLDER_ID) : DriveApp.getRootFolder();

  // Process the top-level folder recursively
  processFolder(topFolder, [], 0, sheet, processedIds);

  // Auto-resize columns for better visibility
  sheet.autoResizeColumns(1, 11);

  // Update processed IDs property for next run
  properties.setProperty('processedIds', JSON.stringify(processedIds));

  Logger.log('Indexing complete.');
}

/**
 * Recursively processes a folder and all its contents
 * @param {Folder} folder - The Google Drive folder object to process
 * @param {Array} pathArray - Array of folder names representing the current path
 * @param {number} depth - Current depth level in the folder hierarchy
 * @param {Sheet} sheet - The Google Sheets sheet to write data to
 * @param {Array} processedIds - Array of already processed file/folder IDs
 * @returns {Array} Updated array of processed IDs
 */
function processFolder(folder, pathArray, depth, sheet, processedIds) {
  var files = folder.getFiles();
  var subfolders = folder.getFolders();
  var fileData = [];
  var folderId = folder.getId();

  // Process all files in the current folder
  while (files.hasNext()) {
    var file = files.next();
    var fileId = file.getId();
    
    // Skip if file was already processed in a previous run
    if (processedIds.includes(fileId)) {
      continue; // Skip already processed files
    }

    var fileName = file.getName();
    
    // Skip Markdown files (customization point)
    if (fileName.toLowerCase().endsWith('.md')) {
      continue;
    }

    // Gather file metadata
    var fileUrl = file.getUrl();
    var createdDate = Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var lastUpdated = Utilities.formatDate(file.getLastUpdated(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    // Create hyperlink formula for clickable file name
    var hyperlinkFormula = '=HYPERLINK("' + fileUrl + '","' + fileName + '")';
    
    // Create row with folder hierarchy first, then data attributes, then IDs
    var row = new Array(11).fill(''); // Initialize with empty strings for all columns
    
    // Fill in folder hierarchy (columns 1-6)
    for (var i = 0; i < pathArray.length; i++) {
      row[i] = pathArray[i]; // Add folder hierarchy in columns 1-6
    }
    
    // Fill in file data (columns 7-11)
    row[6] = hyperlinkFormula; // Name (with hyperlink) in column 7
    row[7] = createdDate;      // Date Created in column 8
    row[8] = lastUpdated;      // Date Revised in column 9
    row[9] = folderId;         // Fo
