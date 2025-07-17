/**
 * Unified Text File Processor and Linter
 *
 * Script Summary:
 * This script processes Markdown (.md) and plain text (.txt) files in a specified Google Drive folder and its subfolders.
 * It provides comprehensive linting including formatting, spacing, and header adjustments.
 *
 * Purpose:
 * The purpose of this script is to automate the linting process for text files, ensuring consistency and readability.
 *
 * Description:
 * The script processes all Markdown and plain text files in a specified Google Drive folder and its subfolders.
 * It applies various linting operations such as formatting text, handling YAML frontmatter, and removing extra lines after headers.
 *
 * Problem Solved:
 * The script addresses the issue of inconsistent formatting and spacing in text files, making them easier to read and maintain.
 *
 * Successful Execution:
 * A successful execution of the script involves processing all specified files, applying the selected linting operations,
 * and logging all actions and changes made.
 *
 * Functions-Alphabetical:
 * - debug(message): Logs a debug message if debugging is enabled.
 * - formatTextContent(content, isMarkdown): Formats the text content according to specified rules.
 * - getFolderFromInput(input): Attempts to get a folder from the user input, either by ID or name.
 * - initializeLinting(): Initializes the linting process by prompting for folder input and linting options.
 * - lintTextFile(file, options, forceUpdate): Applies linting operations to a single text file.
 * - logAction(level, fileName, message): Logs an action to both the spreadsheet and the Apps Script Logger.
 * - onOpen(): Creates the 'Linters' menu in the Google Sheets UI.
 * - processFolder(folder, processingFunction): Processes all Markdown and plain text files in a folder and its subfolders.
 * - promptForFolderInput(operation): Prompts the user for folder input and returns folder information.
 * - promptForLintingOptions(): Prompts the user to select which linting operations to perform.
 * - removeExtraLinesAfterHeaders(content): Removes extra blank lines after headers in Markdown content.
 * - setupLogging(): Sets up the logging sheet in the active spreadsheet.
 *
 * Functions-Ordered:
 * 1. onOpen(): Creates the 'Linters' menu in the Google Sheets UI.
 * 2. initializeLinting(): Initializes the linting process by prompting for folder input and linting options.
 * 3. promptForFolderInput(operation): Prompts the user for folder input and returns folder information.
 * 4. getFolderFromInput(input): Attempts to get a folder from the user input, either by ID or name.
 * 5. promptForLintingOptions(): Prompts the user to select which linting operations to perform.
 * 6. setupLogging(): Sets up the logging sheet in the active spreadsheet.
 * 7. processFolder(folder, processingFunction): Processes all Markdown and plain text files in a folder and its subfolders.
 * 8. lintTextFile(file, options, forceUpdate): Applies linting operations to a single text file.
 * 9. formatTextContent(content, isMarkdown): Formats the text content according to specified rules.
 * 10. removeExtraLinesAfterHeaders(content): Removes extra blank lines after headers in Markdown content.
 * 11. logAction(level, fileName, message): Logs an action to both the spreadsheet and the Apps Script Logger.
 * 12. debug(message): Logs a debug message if debugging is enabled.
 *
 * Script-Steps:
 * 1. Create the 'Linters' menu in the Google Sheets UI.
 * 2. Prompt the user for folder input and linting options.
 * 3. Set up the logging sheet in the active spreadsheet.
 * 4. Process all Markdown and plain text files in the specified folder and its subfolders.
 * 5. Apply the selected linting operations to each file.
 * 6. Log all actions and changes made during the linting process.
 * 7. Print a success message to the Google Apps Script IDE upon completion.
 *
 * Helper Functions:
 * - debug(message): Logs a debug message if debugging is enabled.
 * - formatTextContent(content, isMarkdown): Formats the text content according to specified rules.
 * - getFolderFromInput(input): Attempts to get a folder from the user input, either by ID or name.
 * - logAction(level, fileName, message): Logs an action to both the spreadsheet and the Apps Script Logger.
 * - removeExtraLinesAfterHeaders(content): Removes extra blank lines after headers in Markdown content.
 */

// Global variables
var logSheet; // Spreadsheet used for logging linting actions
var DEBUG = true; // Flag to enable or disable detailed debugging output

/**
 * Logs a debug message to the Apps Script Logger if debugging is enabled.
 * @param {string} message - The debug message to log.
 */
function debug(message) {
  if (DEBUG) {
    Logger.log(`DEBUG: ${message}`);
  }
}

/**
 * Creates the 'Linters' menu in the Google Sheets UI.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Linters')
      .addItem('Lint Text Files', 'initializeLinting')
      .addToUi();
  debug("'Linters' menu created with unified linting option");
}

/**
 * Initializes the linting process by prompting for folder input and linting options.
 */
function initializeLinting() {
  debug("Initializing unified linting process");
  const folderInfo = promptForFolderInput('Lint Text Files');
  if (!folderInfo) return;

  const lintingOptions = promptForLintingOptions();
  if (!lintingOptions) return;

  const ui = SpreadsheetApp.getUi();
  const forceUpdateResult = ui.alert(
    'Force Update',
    'Do you want to force update all files, even if no changes are detected? (Use this for testing)',
    ui.ButtonSet.YES_NO
  );
  const forceUpdate = forceUpdateResult === ui.Button.YES;

  setupLogging();

  logAction('INFO', `Linting process started for folder: ${folderInfo.name}`);
  let filesUpdated = 0;
  processFolder(folderInfo.folder, file => {
    if (lintTextFile(file, lintingOptions, forceUpdate)) {
      filesUpdated++;
    }
  });
  logAction('INFO', `Linting process completed for folder: ${folderInfo.name}. Files updated: ${filesUpdated}`);
  Logger.log("Linting process completed successfully.");
}

/**
 * Prompts the user to select which linting operations to perform.
 * @return {Object|null} An object containing boolean flags for each linting option, or null if cancelled.
 */
function promptForLintingOptions() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Linting Options',
    'Choose linting operations:\n\n' +
    '- Format Text (standardize spacing, handle YAML frontmatter for Markdown)\n' +
    '- Remove extra lines after headers (Markdown only)\n\n' +
    'Click YES to perform all operations, or NO to choose specific operations.',
    ui.ButtonSet.YES_NO_CANCEL
  );

  if (result === ui.Button.CANCEL) {
    debug("Linting cancelled by user");
    return null;
  }

  if (result === ui.Button.YES) {
    debug("User chose to perform all linting operations");
    return { format: true, removeExtraLines: true };
  }

  // If user clicked NO, prompt for specific options
  const formatResult = ui.alert('Format Text?', 'Standardize spacing and handle YAML frontmatter (for Markdown)?', ui.ButtonSet.YES_NO);
  const removeExtraLinesResult = ui.alert('Remove Extra Lines?', 'Remove extra blank lines after headers (Markdown only)?', ui.ButtonSet.YES_NO);

  return {
    format: formatResult === ui.Button.YES,
    removeExtraLines: removeExtraLinesResult === ui.Button.YES
  };
}

/**
 * Sets up the logging sheet in the active spreadsheet.
 */
function setupLogging() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  logSheet = ss.getSheetByName('LintingLog') || ss.insertSheet('LintingLog');
  logSheet.clear();
  logSheet.appendRow(['Timestamp', 'Action', 'File', 'Details']);
  debug("Logging sheet set up");
}

/**
 * Prompts the user for folder input and returns folder information.
 * @param {string} operation - The name of the operation being performed.
 * @return {Object|null} An object containing the folder and its name, or null if cancelled.
 */
function promptForFolderInput(operation) {
  debug(`Prompting for folder input for operation: ${operation}`);
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    operation,
    'Please enter the folder name or ID:',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() !== ui.Button.OK) {
    debug(`${operation} cancelled by user`);
    return null;
  }

  const folderInput = result.getResponseText().trim();
  const folder = getFolderFromInput(folderInput);

  if (!folder) {
    debug(`Unable to find the specified folder: ${folderInput}`);
    return null;
  }

  debug(`Folder found: ${folder.getName()}`);
  return { folder: folder, name: folder.getName() };
}

/**
 * Attempts to get a folder from the user input, either by ID or name.
 * @param {string} input - The folder name or ID provided by the user.
 * @return {Folder|null} The folder object if found, null otherwise.
 */
function getFolderFromInput(input) {
  debug(`Attempting to get folder from input: ${input}`);
  try {
    return DriveApp.getFolderById(input);
  } catch (e) {
    debug(`Folder not found by ID, searching by name`);
    const folders = DriveApp.getFoldersByName(input);
    return folders.hasNext() ? folders.next() : null;
  }
}

/**
 * Processes all Markdown and plain text files in a folder and its subfolders.
 * @param {Folder} folder - The Google Drive folder to process.
 * @param {Function} processingFunction - The function to apply to each text file.
 */
function processFolder(folder, processingFunction) {
  debug(`Processing folder: ${folder.getName()}`);
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName().toLowerCase();
    if (fileName.endsWith('.md') || fileName.endsWith('.txt')) {
      debug(`Processing file: ${file.getName()}`);
      processingFunction(file);
    }
  }

  const subfolders = folder.getFolders();
  while (subfolders.hasNext()) {
    const subfolder = subfolders.next();
    debug(`Processing subfolder: ${subfolder.getName()}`);
    processFolder(subfolder, processingFunction);
  }
}

/**
 * Formats the text content according to specified rules.
 * @param {string} content - The original text content.
 * @param {boolean} isMarkdown - Whether the file is a Markdown file.
 * @return {Object} An object containing the formatted content and a list of changes made.
 */
function formatTextContent(content, isMarkdown) {
  debug("Formatting text content");
  let changes = [];
  let originalContent = content;

  if (isMarkdown) {
    // Handle YAML Front Matter (Markdown only)
    content = content.replace(/^---\n([\s\S]*?)---\n*/, (match, yaml) => {
      let formattedYaml = `---\n${yaml.trim()}\n---\n\n`; // Ensure one blank line after YAML
      if (match !== formattedYaml) {
        changes.push("Standardized YAML frontmatter spacing");
        debug("YAML frontmatter spacing standardized");
      }
      return formattedYaml;
    });

    // Handle headers and ensure proper spacing
    const lines = content.split('\n');
    const formattedLines = [];
    let prevLineIsHeader = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isHeader = /^#{1,6} /.test(line);

      if (isHeader) {
        if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
          formattedLines.push(''); // Ensure one blank line above header
        }
        formattedLines.push(line);
        prevLineIsHeader = true;
      } else {
        if (prevLineIsHeader && line === '') {
          // Skip blank line immediately after header
          prevLineIsHeader = false;
        } else {
          formattedLines.push(line);
          prevLineIsHeader = false;
        }
      }
    }

    content = formattedLines.join('\n');
    if (content !== originalContent) {
      changes.push("Standardized header spacing");
      debug("Header spacing standardized");
    }
  }

  // Standardize multiple blank lines to single blank lines
  let originalLineCount = content.split('\n').length;
  content = content.replace(/\n{3,}/g, '\n\n');
  let newLineCount = content.split('\n').length;
  if (originalLineCount !== newLineCount) {
    changes.push(`Reduced ${originalLineCount - newLineCount} excess blank lines`);
    debug(`Reduced ${originalLineCount - newLineCount} excess blank lines`);
  }

  return { content, changes };
}

/**
 * Removes extra blank lines after headers in Markdown content.
 * @param {string} content - The Markdown content to process.
 * @return {Object} An object containing the processed content and a list of changes made.
 */
function removeExtraLinesAfterHeaders(content) {
  debug("Removing extra lines after headers");
  let changes = [];
  const lines = content.split("\n");
  const modifiedLines = [];
  let removedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const isHeader = /^#{1,6} /.test(line);

    if (isHeader) {
      if (modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] !== "") {
        modifiedLines.push(""); // Ensure one blank line above header
      }
      modifiedLines.push(line);
      // Skip any blank lines immediately after the header
      while (i + 1 < lines.length && lines[i + 1].trim() === "") {
        i++;
        removedLines++;
      }
    } else {
      modifiedLines.push(line);
    }
  }

  if (removedLines > 0) {
    changes.push(`Removed ${removedLines} extra blank lines after headers`);
    debug(`Removed ${removedLines} extra blank lines after headers`);
  }

  return { content: modifiedLines.join("\n").trim() + "\n", changes };
}

/**
 * Applies linting operations to a single text file.
 * @param {File} file - The Google Drive file to process.
 * @param {Object} options - The linting options selected by the user.
 * @param {boolean} forceUpdate - Whether to force update the file even if no changes are detected.
 * @return {boolean} Whether any changes were made to the file.
 */
function lintTextFile(file, options, forceUpdate = false) {
  debug(`Linting file: ${file.getName()}`);
  let content = file.getBlob().getDataAsString();
  const originalContentHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, content);
  debug(`Original content hash: ${originalContentHash.join(',')}`);

  let changes = [];
  const isMarkdown = file.getName().toLowerCase().endsWith('.md');

  if (options.format) {
    debug("Applying formatting");
    const formatResult = formatTextContent(content, isMarkdown);
    content = formatResult.content;
    changes = changes.concat(formatResult.changes);
  }

  if (options.removeExtraLines && isMarkdown) {
    debug("Removing extra lines after headers");
    const removeResult = removeExtraLinesAfterHeaders(content);
    content = removeResult.content;
    changes = changes.concat(removeResult.changes);
  }

  const modifiedContentHash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, content);
  debug(`Modified content hash: ${modifiedContentHash.join(',')}`);

  if (originalContentHash.join(',') !== modifiedContentHash.join(',') || forceUpdate) {
    debug("Content has changed or force update is enabled, updating file");
    file.setContent(content);
    const message = `Linted and saved changes to file: ${file.getName()}`;
    logAction('INFO', file.getName(), message);
    Logger.log(message);

    changes.forEach(change => {
      logAction('CHANGE', file.getName(), change);
      Logger.log(`CHANGE in ${file.getName()}: ${change}`);
    });
  } else {
    debug(`No changes required for file: ${file.getName()}`);
  }

  return changes.length > 0;
}

/**
 * Logs an action to both the spreadsheet and the Apps Script Logger.
 * @param {string} level - The log level (e.g., 'INFO', 'ERROR', 'CHANGE').
 * @param {string} fileName - The name of the file being processed.
 * @param {string} message - The message to log.
 */
function logAction(level, fileName, message) {
  const timestamp = new Date().toISOString();
  logSheet.appendRow([timestamp, level, fileName, message]);

  const logMessage = `[${timestamp}] [${level}] ${fileName}: ${message}`;
  Logger.log(logMessage); // Print to Apps Script terminal
  debug(logMessage);
}
