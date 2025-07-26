/**
 * Markdown File Processor
 * 
 * This script processes Markdown files in a specified Google Drive folder and its subfolders.
 * It removes extra blank lines after headers, ensuring a consistent format across all files.
 * 
 * Features:
 * - User input for folder selection (by name or ID)
 * - Processes all .md files in the selected folder and its subfolders
 * - Removes extra blank lines after headers
 * - Maintains a single blank line between content sections
 * 
 * Google Workspace Services Used:
 * - Google Drive API (DriveApp)
 * - Google Sheets API (SpreadsheetApp) - for UI prompts
 * - Apps Script Logger
 */

/**
 * Main function to remove blank lines after headers in Markdown files.
 * Prompts the user for a folder input, finds the folder, and processes all Markdown files within.
 */
function removeBlankLinesAfterHeaders() {
  var folderInput = promptForFolderInput();
  if (!folderInput) {
    Logger.log("No folder input provided. Exiting script.");
    return;
  }

  var folder = getFolderFromInput(folderInput);
  if (!folder) {
    Logger.log("Unable to find the specified folder. Exiting script.");
    return;
  }

  Logger.log("Processing folder: " + folder.getName());
  processFolder(folder);
}

/**
 * Prompts the user to enter a folder name or ID.
 * 
 * @return {string|null} The user's input, or null if cancelled.
 */
function promptForFolderInput() {
  var ui = SpreadsheetApp.getUi(); // Or DocumentApp or FormApp.
  var result = ui.prompt(
      'Enter Folder Details',
      'Please enter the folder name or ID:',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) {
    return text;
  } else if (button == ui.Button.CANCEL) {
    Logger.log('The user canceled the dialog.');
    return null;
  } else {
    Logger.log('The user closed the dialog.');
    return null;
  }
}

/**
 * Attempts to find a folder based on the user's input.
 * First tries to find by ID, then by name if ID fails.
 * 
 * @param {string} input - The folder name or ID provided by the user.
 * @return {Folder|null} The folder object if found, null otherwise.
 */
function getFolderFromInput(input) {
  var folder;
  
  // Try to get folder by ID first
  try {
    folder = DriveApp.getFolderById(input);
    return folder;
  } catch (e) {
    // If not found by ID, search by name
    var folders = DriveApp.getFoldersByName(input);
    if (folders.hasNext()) {
      return folders.next();
    }
  }
  
  return null;
}

/**
 * Recursively processes a folder and its subfolders.
 * Finds all Markdown files and processes them.
 * 
 * @param {Folder} folder - The Google Drive folder to process.
 */
function processFolder(folder) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().toLowerCase().endsWith('.md')) {
      Logger.log("Processing file: " + file.getName());
      processFile(file);
    }
  }

  var subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    var subfolder = subfolders.next();
    if (subfolder.getParents().next().getId() === folder.getId()) {
      Logger.log("Processing subfolder: " + subfolder.getName());
      processFolder(subfolder);
    }
  }
}

/**
 * Processes a single Markdown file.
 * Removes extra blank lines after headers and ensures consistent formatting.
 * 
 * @param {File} file - The Google Drive file to process.
 */
function processFile(file) {
  var content = file.getBlob().getDataAsString();
  var lines = content.split("\n");
  var modifiedLines = [];
  var previousLineWasHeader = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var isHeader = /^#{1,6} /.test(line);

    if (isHeader) {
      // Ensure there's a blank line before headers (except at the start of the file)
      if (modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] !== "") {
        modifiedLines.push("");
      }
      modifiedLines.push(line);
      previousLineWasHeader = true;
    } else if (line !== "" || !previousLineWasHeader) {
      // Add non-blank lines, or blank lines not immediately following a header
      modifiedLines.push(line);
      previousLineWasHeader = false;
    }
  }

  // Ensure the file ends with a single newline
  var modifiedContent = modifiedLines.join("\n").trim() + "\n";
  file.setContent(modifiedContent);
  Logger.log("File processed: " + file.getName());
}
