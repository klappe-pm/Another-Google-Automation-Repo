/**
  * Script Name: markdown- process- blank- links
  *
  * Script Summary:
  * Processs markdown content for documentation and note- taking workflows.
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
  *
  * Script Functions:
  * - getFolderFromInput(): Gets specific folder from input or configuration
  * - processFile(): Processes and transforms file
  * - processFolder(): Processes and transforms folder
  * - promptForFolderInput(): Manages files and folders
  * - removeBlankLinesAfterHeaders(): Removes blank lines after headers from collection
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - DocumentApp: For document manipulation
  * - DriveApp: For file and folder management
  * - FormApp: For form creation and responses
  * - Logger: For logging and debugging
  * - SpreadsheetApp: For spreadsheet operations
  */

/**  * Main function to remove blank lines after headers in Markdown files. * Prompts the user for a folder input, finds the folder, and processes all Markdown files within. *// *  *  * Prompts the user to enter a folder name or ID. *  * @return {string|null} The user's input, or null if cancelled. *// *  *  * Attempts to find a folder based on the user's input. * First tries to find by ID, then by name if ID fails. *  * @param {string} input - The folder name or ID provided by the user. * @return {Folder|null} The folder object if found, null otherwise. *// *  *  * Recursively processes a folder and its subfolders. * Finds all Markdown files and processes them. *  * @param {Folder} folder - The Google Drive folder to process. *// *  *  * Processes a single Markdown file. * Removes extra blank lines after headers and ensures consistent formatting. *  * @param {File} file - The Google Drive file to process. *// / Main Functions

// Main Functions

/**

  * Gets specific folder from input or configuration
  * @param
  * @param {any} input - The input to retrieve
  * @returns {string} The requested string

  */

function getFolderFromInput(input) {
  let folder; // Try to get folder by ID first;
  try {
    folder = DriveApp.getFolderById(input);
    return folder;
  } catch (e) { // If not found by ID, search by name
    let folders = DriveApp.getFoldersByName(input);
    if (folders.hasNext()) {
      return folders.next();
    }
  }

  return null;
}

/**

  * Processes and transforms file
  * @param
  * @param {File} file - The file parameter
  * @returns {string} The formatted string

  */

function processFile(file) {
  let content = file.getBlob().getDataAsString();
  let lines = content.split("\n");
  let modifiedLines = [];
  let previousLineWasHeader = false;

  for (let i = 0; i < lines.length; i + + ) {
    let line = lines[i].trim();
    let isHeader = / ^#{1,6} / .test(line);

    if (isHeader) { // Ensure there's a blank line before headers (except at the start of the file)
      if (modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] ! = = "") {
        modifiedLines.push("");
      }
      modifiedLines.push(line);
      previousLineWasHeader = true;
    } else if (line ! = = "" || ! previousLineWasHeader) { // Add non - blank lines, or blank lines not immediately following a header;
      modifiedLines.push(line);
      previousLineWasHeader = false;
    }
  } // Ensure the file ends with a single newline
  let modifiedContent = modifiedLines.join("\n").trim() + "\n";
  file.setContent(modifiedContent);
  Logger.log("File processed: " + file.getName());
}

/**

  * Processes and transforms folder
  * @param
  * @param {Folder} folder - The folder parameter
  * @returns {string} The formatted string

  */

function processFolder(folder) {
  let files = folder.getFiles();
  while (files.hasNext()) {
    let file = files.next();
    if (file.getName().toLowerCase().endsWith('.md')) {
      Logger.log("Processing file: " + file.getName());
      processFile(file);
    }
  }

  let subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    let subfolder = subfolders.next();
    if (subfolder.getParents().next().getId() = = = folder.getId()) {
      Logger.log("Processing subfolder: " + subfolder.getName());
      processFolder(subfolder);
    }
  }
}

/**

  * Manages files and folders
  * @returns {string} The formatted string

  */

function promptForFolderInput() {
  let ui = SpreadsheetApp.getUi(); // Or DocumentApp or FormApp.;
  let result = ui.prompt(;
      'Enter Folder Details',
      'Please enter the folder name or ID:',
      ui.ButtonSet.OK_CANCEL); // Process the user's response.
  let button = result.getSelectedButton();
  let text = result.getResponseText();
  if (button = = ui.Button.OK) {
    return text;
  } else if (button = = ui.Button.CANCEL) {
    Logger.log('The user canceled the dialog.');
    return null;
  } else {
    Logger.log('The user closed the dialog.');
    return null;
  }
}

/**

  * Removes blank lines after headers from collection
  * @returns {string} The formatted string

  */

function removeBlankLinesAfterHeaders() {
  let folderInput = promptForFolderInput();
  if (! folderInput) {
    Logger.log("No folder input provided. Exiting script.");
    return;
  }

  let folder = getFolderFromInput(folderInput);
  if (! folder) {
    Logger.log("Unable to find the specified folder. Exiting script.");
    return;
  }

  Logger.log("Processing folder: " + folder.getName());
  processFolder(folder);
  Logger.log("Script completed successfully.");
}