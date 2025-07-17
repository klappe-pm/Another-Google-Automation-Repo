/**
 * Markdown File Processor
 *
 * Script Summary:
 * This script processes Markdown files in a specified Google Drive folder and its subfolders.
 * It removes extra blank lines after headers, ensuring a consistent format across all files.
 *
 * Purpose:
 * The purpose of this script is to automate the formatting of Markdown files by removing unnecessary blank lines after headers.
 *
 * Description:
 * The script processes all Markdown files in a specified Google Drive folder and its subfolders.
 * It removes extra blank lines after headers and maintains a single blank line between content sections.
 *
 * Problem Solved:
 * The script addresses the issue of inconsistent spacing in Markdown files, making them easier to read and maintain.
 *
 * Successful Execution:
 * A successful execution of the script involves processing all specified files, removing extra blank lines after headers,
 * and logging all actions and changes made.
 *
 * Functions-Alphabetical:
 * - getFolderFromInput(input): Attempts to find a folder based on the user's input.
 * - isMarkdownHeader(line): Checks if a line is a Markdown header.
 * - processFilesInFolder(folder): Processes all Markdown files in a given folder.
 * - processFolderRecursively(folder): Recursively processes a folder and its subfolders.
 * - processMarkdownFile(file): Processes a single Markdown file by removing extra blank lines after headers.
 * - promptForFolderInput(): Prompts the user to enter a folder name or ID.
 * - removeBlankLinesAfterHeaders(): Main function to remove blank lines after headers in Markdown files.
 *
 * Functions-Ordered:
 * 1. removeBlankLinesAfterHeaders(): Main function to remove blank lines after headers in Markdown files.
 * 2. promptForFolderInput(): Prompts the user to enter a folder name or ID.
 * 3. getFolderFromInput(input): Attempts to find a folder based on the user's input.
 * 4. processFolderRecursively(folder): Recursively processes a folder and its subfolders.
 * 5. processFilesInFolder(folder): Processes all Markdown files in a given folder.
 * 6. processMarkdownFile(file): Processes a single Markdown file by removing extra blank lines after headers.
 * 7. isMarkdownHeader(line): Checks if a line is a Markdown header.
 *
 * Script-Steps:
 * 1. Prompt the user for folder input.
 * 2. Find the folder based on the user's input.
 * 3. Recursively process the folder and its subfolders.
 * 4. Process all Markdown files in each folder.
 * 5. Remove extra blank lines after headers in each Markdown file.
 * 6. Log all actions and changes made during the processing.
 *
 * Helper Functions:
 * - getFolderFromInput(input): Attempts to find a folder based on the user's input.
 * - isMarkdownHeader(line): Checks if a line is a Markdown header.
 */

/**
 * Main function to remove blank lines after headers in Markdown files.
 * Prompts the user for a folder input, finds the folder, and processes all Markdown files within.
 */
function removeBlankLinesAfterHeaders() {
  try {
    const folderInput = promptForFolderInput();
    if (!folderInput) {
      Logger.log("No folder input provided. Exiting script.");
      return;
    }

    const folder = getFolderFromInput(folderInput);
    if (!folder) {
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

/**
 * Prompts the user to enter a folder name or ID.
 *
 * @return {string|null} The user's input, or null if cancelled.
 */
function promptForFolderInput() {
  try {
    const ui = SpreadsheetApp.getUi();
    const result = ui.prompt(
      'Enter Folder Details',
      'Please enter the folder name or ID:',
      ui.ButtonSet.OK_CANCEL
    );

    return result.getSelectedButton() === ui.Button.OK ? result.getResponseText() : null;
  } catch (e) {
    Logger.log("Error in promptForFolderInput: " + e.toString());
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
  try {
    return DriveApp.getFolderById(input);
  } catch (e) {
    Logger.log("Error finding folder by ID, trying by name: " + e.toString());
    const folders = DriveApp.getFoldersByName(input);
    return folders.hasNext() ? folders.next() : null;
  }
}

/**
 * Recursively processes a folder and its subfolders.
 * Finds all Markdown files and processes them.
 *
 * @param {Folder} folder - The Google Drive folder to process.
 */
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

/**
 * Processes all Markdown files in a given folder.
 *
 * @param {Folder} folder - The folder containing Markdown files.
 */
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

/**
 * Processes a single Markdown file by removing extra blank lines after headers.
 *
 * @param {File} file - The Markdown file to process.
 */
function processMarkdownFile(file) {
  try {
    const content = file.getBlob().getDataAsString();
    const lines = content.split("\n");
    const modifiedLines = [];
    let previousLineWasHeader = false;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      const isHeader = isMarkdownHeader(trimmedLine);

      if (isHeader) {
        if (modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] !== "") {
          modifiedLines.push("");
        }
        modifiedLines.push(trimmedLine);
        previousLineWasHeader = true;
      } else if (trimmedLine !== "" || !previousLineWasHeader) {
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

/**
 * Checks if a line is a Markdown header.
 *
 * @param {string} line - The line to check.
 * @return {boolean} True if the line is a header, false otherwise.
 */
function isMarkdownHeader(line) {
  try {
    // Matches ATX headers: # Header, ## Header, etc.
    // Does not match setext headers (underlined with = or -)
    return /^#{1,6} /.test(line);
  } catch (e) {
    Logger.log("Error in isMarkdownHeader: " + e.toString());
    return false;
  }
}
