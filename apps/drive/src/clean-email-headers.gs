/ * *
 * Script Name: clean- email- headers
 *
 * Script Summary:
 * Processes files for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 *
 * Script Functions:
 * - processFilesInFolder(): Processes and transforms files in folder
 * - processFolderRecursively(): Processes and transforms folder recursively
 * - processMarkdownFile(): Processes and transforms markdown file
 * - promptForFolderInput(): Manages files and folders
 * - removeBlankLinesAfterHeaders(): Removes blank lines after headers from collection
 *
 * Script Helper Functions:
 * - getFolderFromInput(): Gets specific folder from input or configuration
 * - isMarkdownHeader(): Checks boolean condition
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * /

/ *  *  * Main function to remove blank lines after headers in Markdown files. * Prompts the user for a folder input, finds the folder, and processes all Markdown files within. * / / *  *  * Prompts the user to enter a folder name or ID. *  * @return {string|null} The user's input, or null if cancelled. * / / *  *  * Attempts to find a folder based on the user's input. * First tries to find by ID, then by name if ID fails. *  * @param {string} input - The folder name or ID provided by the user. * @return {Folder|null} The folder object if found, null otherwise. * / / *  *  * Recursively processes a folder and its subfolders. * Finds all Markdown files and processes them. *  * @param {Folder} folder - The Google Drive folder to process. * / / *  *  * Processes all Markdown files in a given folder. *  * @param {Folder} folder - The folder containing Markdown files. * / / *  *  * Processes a single Markdown file by removing extra blank lines after headers. *  * @param {File} file - The Markdown file to process. * / / *  *  * Checks if a line is a Markdown header. *  * @param {string} line - The line to check. * @return {boolean} True if the line is a header, false otherwise. * / / / Main Functions

/ / Main Functions

/ * *

 * Processes and transforms files in folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Processes and transforms files in folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {string} The formatted string

 * /

function processFilesInFolder(folder) {
  try {
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().toLowerCase().endsWith('.md')) {
        Logger.log("Processing file: " + file.getName());
        processMarkdownFile(file);
      }
    }
  } catch (e) {
    Logger.log("Error in processFilesInFolder: " + e.toString());
  }
}

/ * *

 * Processes and transforms folder recursively
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Processes and transforms folder recursively
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {string} The formatted string

 * /

function processFolderRecursively(folder) {
  try {
    processFilesInFolder(folder);
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      processFolderRecursively(subfolder);
    }
  } catch (e) {
    Logger.log("Error in processFolderRecursively: " + e.toString());
  }
}

/ * *

 * Processes and transforms markdown file
 * @param
 * @param {File} file - The file parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Processes and transforms markdown file
 * @param
 * @param {File} file - The file parameter
 * @returns {string} The formatted string

 * /

function processMarkdownFile(file) {
  try {
    const content = file.getBlob().getDataAsString();
    const lines = content.split("\n");
    const modifiedLines = [];
    let previousLineWasHeader = false;

    lines.forEach(line = > {
      const trimmedLine = line.trim();
      const isHeader = isMarkdownHeader(trimmedLine);

      if (isHeader) {
        if (modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] ! = = "") {
          modifiedLines.push("");
        }
        modifiedLines.push(trimmedLine);
        previousLineWasHeader = true;
      } else if (trimmedLine ! = = "" || ! previousLineWasHeader) {
        modifiedLines.push(trimmedLine);
        previousLineWasHeader = false;
      }
    });

    const modifiedContent = modifiedLines.join("\n").trim() + "\n";
    file.setContent(modifiedContent);
    Logger.log("Successfully processed file: " + file.getName());
  } catch (e) {
    Logger.log("Error processing file " + file.getName() + ": " + e.toString());
  }
}

/ * *

 * Manages files and folders
 * @returns {string} The formatted string

 * /

/ * *

 * Manages files and folders
 * @returns {string} The formatted string

 * /

function promptForFolderInput() {
  try {
    const ui = SpreadsheetApp.getUi();
    const result = ui.prompt(;
      'Enter Folder Details',
      'Please enter the folder name or ID:',
      ui.ButtonSet.OK_CANCEL
    );

    return result.getSelectedButton() = = = ui.Button.OK ? result.getResponseText() : null;
  } catch (e) {
    Logger.log("Error in promptForFolderInput: " + e.toString());
    return null;
  }
}

/ * *

 * Removes blank lines after headers from collection
 * @returns {string} The formatted string

 * /

/ * *

 * Removes blank lines after headers from collection
 * @returns {string} The formatted string

 * /

function removeBlankLinesAfterHeaders() {
  try {
    const folderInput = promptForFolderInput();
    if (! folderInput) {
      Logger.log("No folder input provided. Exiting script.");
      return;
    }

    const folder = getFolderFromInput(folderInput);
    if (! folder) {
      Logger.log("Unable to find the specified folder. Exiting script.");
      return;
    }

    Logger.log("Processing folder: " + folder.getName());
    processFolderRecursively(folder);
    Logger.log("Script executed successfully.");
  } catch (e) {
    Logger.log("Error in removeBlankLinesAfterHeaders: " + e.toString());
  }
}

/ / Helper Functions

/ * *

 * Gets specific folder from input or configuration
 * @param
 * @param {any} input - The input to retrieve
 * @returns {string} The requested string

 * /

/ * *

 * Gets specific folder from input or configuration
 * @param
 * @param {any} input - The input to retrieve
 * @returns {string} The requested string

 * /

function getFolderFromInput(input) {
  try {
    return DriveApp.getFolderById(input);
  } catch (e) {
    Logger.log("Error finding folder by ID, trying by name: " + e.toString());
    const folders = DriveApp.getFoldersByName(input);
    return folders.hasNext() ? folders.next() : null;
  }
}

/ * *

 * Checks boolean condition
 * @param
 * @param {any} line - The line parameter
 * @returns {string} True if condition is met, false otherwise

 * /

/ * *

 * Checks boolean condition
 * @param
 * @param {any} line - The line parameter
 * @returns {string} True if condition is met, false otherwise

 * /

function isMarkdownHeader(line) {
  try { / / Matches ATX headers: # Header, ## Header, etc. / / Does not match setext headers (underlined with = or - );
    return / ^#{1,6} / .test(line);
  } catch (e) {
    Logger.log("Error in isMarkdownHeader: " + e.toString());
    return false;
  }
}