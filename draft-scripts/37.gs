/**
 * Script Title: Google Drive Folder Index Generator
 *
 * Script Summary:
 * This script generates a hierarchical index of folders from the root of Google Drive and outputs it into a new tab in the active spreadsheet.
 * It provides a structured overview of the folder hierarchy with hyperlinks for easy navigation.
 * Robust logging and debugging have been added to track execution and diagnose issues.
 *
 * Script-Steps:
 * 1. Create a new tab with a unique name and set headers.
 * 2. Process folders from the root of Google Drive up to a specified depth.
 * 3. Log key actions and errors throughout execution.
 * 4. Output the folder hierarchy with hyperlinks to the new tab.
 * 5. Add a timestamp and set column widths.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Folder Index')
    .addItem('Generate Folder Index', 'generateFolderIndex')
    .addToUi();
}

function generateFolderIndex() {
  Logger.log('Script started: generateFolderIndex');
  
  // Get the active spreadsheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Active spreadsheet: ' + spreadsheet.getName());
  
  // Create a unique sheet name
  const scriptName = 'FolderIndex';
  const dateString = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  let sheetName = `${scriptName}_${dateString}`;
  let counter = 1;
  while (spreadsheet.getSheetByName(sheetName)) {
    sheetName = `${scriptName}_${dateString}_${counter++}`;
  }
  Logger.log('Creating new sheet: ' + sheetName);
  
  // Insert the new sheet
  const sheet = spreadsheet.insertSheet(sheetName);
  
  // Configurable settings
  const COLUMN_WIDTH = 300;
  const maxDepth = PropertiesService.getScriptProperties().getProperty('MAX_DEPTH') || 4;
  const excludedFolders = PropertiesService.getScriptProperties().getProperty('EXCLUDED_FOLDERS') 
    ? PropertiesService.getScriptProperties().getProperty('EXCLUDED_FOLDERS').split(',') 
    : ['Trash', 'SharedFolder'];
  Logger.log('Settings - Max depth: ' + maxDepth + ', Excluded folders: ' + excludedFolders.join(', '));
  
  // Set headers
  const headers = ['Top Level Folder', 'Subfolder', 'Sub-subfolder', 'Sub-sub-subfolder'];
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeights([['bold', 'bold', 'bold', 'bold']])
    .setFontSizes([[12, 12, 12, 12]]);
  Logger.log('Headers set in sheet');
  
  // Initialize folder storage
  const folderMap = new Map();
  
  // Process the root folder
  try {
    const rootFolder = DriveApp.getRootFolder();
    Logger.log('Root folder accessed: ' + rootFolder.getName());
    processFolderBatch(rootFolder, [], folderMap, maxDepth, excludedFolders);
  } catch (e) {
    Logger.log('Error accessing root folder: ' + e.message);
    SpreadsheetApp.getUi().alert('Error accessing root folder: ' + e.message);
    return;
  }
  
  Logger.log('Folders processed. folderMap size: ' + folderMap.size);
  
  // Output folder data to sheet
  const output = Array.from(folderMap.values());
  if (output.length > 0) {
    Logger.log('Writing ' + output.length + ' rows to sheet');
    const formattedOutput = output.map(row => {
      const padded = [...row];
      while (padded.length < maxDepth) padded.push(null);
      return padded.map(item => {
        if (item) {
          const safeName = item.name.replace(/"/g, '""'); // Escape quotes
          return `=HYPERLINK("https://drive.google.com/drive/folders/${item.id}", "${safeName}")`;
        }
        return '';
      });
    });
    
    try {
      sheet.getRange(2, 1, formattedOutput.length, maxDepth).setValues(formattedOutput);
      Logger.log('Data written to sheet');
    } catch (e) {
      Logger.log('Error writing data to sheet: ' + e.message);
      SpreadsheetApp.getUi().alert('Error writing data to sheet: ' + e.message);
      return;
    }
    
    // Add timestamp
    sheet.getRange(1, maxDepth + 1).setValue(`Last updated: ${new Date().toLocaleString()}`);
    Logger.log('Timestamp added');
  } else {
    sheet.getRange(2, 1).setValue('No folders found in the root.');
    Logger.log('No folders found in the root');
  }
  
  // Set column widths
  sheet.setColumnWidths(1, maxDepth, COLUMN_WIDTH);
  Logger.log('Column widths set');
  
  // Log completion
  Logger.log(`Script completed. Processed ${folderMap.size} folders.`);
  SpreadsheetApp.getUi().alert('Folder index generation completed successfully.');
}

function processFolderBatch(folder, path, folderMap, maxDepth, excludedFolders) {
  const folderId = folder.getId();
  const folderName = folder.getName();
  Logger.log('Processing folder: ' + folderName + ' (ID: ' + folderId + ')');
  
  // Build current path
  const currentPath = [...path, { name: folderName, id: folderId }];
  
  // Skip if max depth reached or folder excluded
  if (currentPath.length > maxDepth || excludedFolders.includes(folderName)) {
    Logger.log(`Skipping folder: ${folderName} (Depth: ${currentPath.length}, Excluded: ${excludedFolders.includes(folderName)})`);
    return;
  }
  
  // Store folder path
  folderMap.set(folderId, currentPath);
  Logger.log('Added to folderMap: ' + folderName);
  
  // Progress feedback
  if (folderMap.size % 100 === 0) {
    Logger.log(`Processed ${folderMap.size} folders...`);
    SpreadsheetApp.getUi().showToast(`Processed ${folderMap.size} folders...`, 'Progress', 3000);
  }
  
  // Process subfolders
  try {
    const subFoldersIterator = folder.getFolders();
    let subFolderCount = 0;
    while (subFoldersIterator.hasNext()) {
      const subFolder = subFoldersIterator.next();
      subFolderCount++;
      processFolderBatch(subFolder, currentPath, folderMap, maxDepth, excludedFolders);
    }
    Logger.log('Processed ' + subFolderCount + ' subfolders in ' + folderName);
  } catch (e) {
    Logger.log(`Error processing "${folderName}" (ID: ${folderId}): ${e.message}`);
  }
}