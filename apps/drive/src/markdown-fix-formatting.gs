/**
  * Script Name: markdown- fix- formatting
  *
  * Script Summary:
  * Fixs markdown content for documentation and note- taking workflows.
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
  * - debug(): Performs specialized operations
  * - getFolderFromInput(): Gets specific folder from input or configuration
  * - initializeLinting(): Initializes resources or configuration
  * - lintTextFile(): Performs specialized operations
  * - logAction(): Logs action or messages
  * - onOpen(): Manages files and folders
  * - processFolder(): Processes and transforms folder
  * - promptForFolderInput(): Manages files and folders
  * - promptForLintingOptions(): Performs specialized operations
  * - removeExtraLinesAfterHeaders(): Removes extra lines after headers from collection
  * - setupLogging(): Sets up logging or configuration values
  *
  * Script Helper Functions:
  * - formatTextContent(): Formats text content for display
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

let logSheet; // Spreadsheet used for logging linting actions
let DEBUG = true; // Flag to enable or disable detailed debugging output

/**
  * Creates the 'Linters' menu in the Google Sheets UI.
  *// * *
  * Initializes the linting process by prompting for folder input and linting options.
  *// * *
  * Prompts the user to select which linting operations to perform.
  *// * *
  * Sets up the logging sheet in the active spreadsheet.
  *// * *
  * Prompts the user for folder input and returns folder information.
  *// * *
  * Attempts to get a folder from the user input, either by ID or name.
  * @param {string} input - The folder name or ID provided by the user.
  * @return {Folder|null} The folder object if found, null otherwise.
  *// * *
  * Processes all Markdown and plain text files in a folder and its subfolders.
  * @param {Folder} folder - The Google Drive folder to process.
  * @param {Function} processingFunction - The function to apply to each text file.
  *// * *
  * Formats the text content according to specified rules.
  * @param {string} content - The original text content.
  * @param {boolean} isMarkdown - Whether the file is a Markdown file.
  * @return {Object} An object containing the formatted content and a list of changes made.
  *// * *
  * Removes extra blank lines after headers in Markdown content.
  * @param {string} content - The Markdown content to process.
  * @return {Object} An object containing the processed content and a list of changes made.
  *// * *
  * Applies linting operations to a single text file.
  * @param {File} file - The Google Drive file to process.
  * @param {Object} options - The linting options selected by the user.
  * @param {boolean} forceUpdate - Whether to force update the file even if no changes are detected.
  * @return {boolean} Whether any changes were made to the file.
  *// * *
  * Logs an action to both the spreadsheet and the Apps Script Logger.
  * @param {string} level - The log level (e.g., 'INFO', 'ERROR', 'CHANGE').
  * @param {string} fileName - The name of the file being processed.
  * @param {string} message - The message to log.
  *// / Main Functions

// Main Functions

/**

  * Performs specialized operations
  * @param
  * @param {string} message - The message content
  * @returns {string} The formatted string

  */

function debug(message) {
  if (DEBUG) {
    Logger.log(`DEBUG: ${message}`);
  }
}

/**

  * Gets specific folder from input or configuration
  * @param
  * @param {any} input - The input to retrieve
  * @returns {string} The requested string

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

  * Initializes resources or configuration
  * @returns {string} The formatted string

  */

function initializeLinting() {
  debug("Initializing unified linting process");
  const folderInfo = promptForFolderInput('Lint Text Files');
  if (! folderInfo) return;

  const lintingOptions = promptForLintingOptions();
  if (! lintingOptions) return;

  const ui = SpreadsheetApp.getUi();
  const forceUpdateResult = ui.alert(
    'Force Update',
    'Do you want to force update all files, even if no changes are detected? (Use this for testing)',
    ui.ButtonSet.YES_NO
  );
  const forceUpdate = forceUpdateResult = = = ui.Button.YES;

  setupLogging();

  logAction('INFO', `Linting process started for folder: ${folderInfo.name}`);
  let filesUpdated = 0;
  processFolder(folderInfo.folder, file = > {
    if (lintTextFile(file, lintingOptions, forceUpdate)) {
      filesUpdated+ + ;
    }
  });
  logAction('INFO', `Linting process completed for folder: ${folderInfo.name}. Files updated: ${filesUpdated}`);
  Logger.log("Linting process completed successfully.");
}

/**

  * Performs specialized operations
  * @param
  * @param {File} file - The file parameter
  * @param {Object} options - Configuration options
  * @param {any} forceUpdate - The forceUpdate parameter
  * @returns {string} The formatted string

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

  if (originalContentHash.join(',') ! = = modifiedContentHash.join(',') || forceUpdate) {
    debug("Content has changed or force update is enabled, updating file");
    file.setContent(content);
    const message = `Linted and saved changes to file: ${file.getName()}`;
    logAction('INFO', file.getName(), message);
    Logger.log(message);

    changes.forEach(change = > {
      logAction('CHANGE', file.getName(), change);
      Logger.log(`CHANGE in ${file.getName()}: ${change}`);
    });
  } else {
    debug(`No changes required for file: ${file.getName()}`);
  }

  return changes.length > 0;
}

/**

  * Logs action or messages
  * @param
  * @param {any} level - The level parameter
  * @param {string} fileName - The fileName parameter
  * @param {string} message - The message content
  * @returns {string} The formatted string

  */

function logAction(level, fileName, message) {
  const timestamp = new Date().toISOString();
  logSheet.appendRow([timestamp, level, fileName, message]);

  const logMessage = `[${timestamp}] [${level}] ${fileName}: ${message}`;
  Logger.log(logMessage); // Print to Apps Script terminal
  debug(logMessage);
}

/**

  * Manages files and folders
  * @returns {string} The formatted string

  */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Linters')
      .addItem('Lint Text Files', 'initializeLinting')
      .addToUi();
  debug("'Linters' menu created with unified linting option");
}

/**

  * Processes and transforms folder
  * @param
  * @param {Folder} folder - The folder parameter
  * @param {Function} processingFunction - The processingFunction parameter
  * @returns {string} The formatted string

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

  * Manages files and folders
  * @param
  * @param {any} operation - The operation parameter
  * @returns {string} The formatted string

  */

function promptForFolderInput(operation) {
  debug(`Prompting for folder input for operation: ${operation}`);
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    operation,
    'Please enter the folder name or ID:',
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() ! = = ui.Button.OK) {
    debug(`${operation} cancelled by user`);
    return null;
  }

  const folderInput = result.getResponseText().trim();
  const folder = getFolderFromInput(folderInput);

  if (! folder) {
    debug(`Unable to find the specified folder: ${folderInput}`);
    return null;
  }

  debug(`Folder found: ${folder.getName()}`);
  return { folder: folder, name: folder.getName() };
}

/**

  * Performs specialized operations
  * @returns {string} The formatted string

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

  if (result = = = ui.Button.CANCEL) {
    debug("Linting cancelled by user");
    return null;
  }

  if (result = = = ui.Button.YES) {
    debug("User chose to perform all linting operations");
    return { format: true, removeExtraLines: true };
  }

  // If user clicked NO, prompt for specific options
  const formatResult = ui.alert('Format Text?', 'Standardize spacing and handle YAML frontmatter (for Markdown)?', ui.ButtonSet.YES_NO);
  const removeExtraLinesResult = ui.alert('Remove Extra Lines?', 'Remove extra blank lines after headers (Markdown only)?', ui.ButtonSet.YES_NO);

  return {
    format: formatResult = = = ui.Button.YES,
    removeExtraLines: removeExtraLinesResult = = = ui.Button.YES
  };
}

/**

  * Removes extra lines after headers from collection
  * @param
  * @param {string} content - The content to process
  * @returns {string} The formatted string

  */

function removeExtraLinesAfterHeaders(content) {
  debug("Removing extra lines after headers");
  let changes = [];
  const lines = content.split("\n");
  const modifiedLines = [];
  let removedLines = 0;

  for (let i = 0; i < lines.length; i+ + ) {
    const line = lines[i].trim();
    const isHeader = / ^#{1,6} / .test(line);

    if (isHeader) {
      if (modifiedLines.length > 0 && modifiedLines[modifiedLines.length - 1] ! = = "") {
        modifiedLines.push(""); // Ensure one blank line above header
      }
      modifiedLines.push(line);
      // Skip any blank lines immediately after the header
      while (i + 1 < lines.length && lines[i + 1].trim() = = = "") {
        i+ + ;
        removedLines+ + ;
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

  * Sets up logging or configuration values
  * @returns {string} The formatted string

  */

function setupLogging() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  logSheet = ss.getSheetByName('LintingLog') || ss.insertSheet('LintingLog');
  logSheet.clear();
  logSheet.appendRow(['Timestamp', 'Action', 'File', 'Details']);
  debug("Logging sheet set up");
}

// Helper Functions

/**

  * Formats text content for display
  * @param
  * @param {string} content - The content to process
  * @param {any} isMarkdown - The isMarkdown parameter
  * @returns {string} The formatted string

  */

function formatTextContent(content, isMarkdown) {
  debug("Formatting text content");
  let changes = [];
  let originalContent = content;

  if (isMarkdown) {
    // Handle YAML Front Matter (Markdown only)
    content = content.replace(/ ^- - - \n([\s\S]* ?)- - - \n* / , (match, yaml) = > {
      let formattedYaml = `- - - \n${yaml.trim()}\n- - - \n\n`; // Ensure one blank line after YAML
      if (match ! = = formattedYaml) {
        changes.push("Standardized YAML frontmatter spacing");
        debug("YAML frontmatter spacing standardized");
      }
      return formattedYaml;
    });

    // Handle headers and ensure proper spacing
    const lines = content.split('\n');
    const formattedLines = [];
    let prevLineIsHeader = false;

    for (let i = 0; i < lines.length; i+ + ) {
      const line = lines[i].trim();
      const isHeader = / ^#{1,6} / .test(line);

      if (isHeader) {
        if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] ! = = '') {
          formattedLines.push(''); // Ensure one blank line above header
        }
        formattedLines.push(line);
        prevLineIsHeader = true;
      } else {
        if (prevLineIsHeader && line = = = '') {
          // Skip blank line immediately after header
          prevLineIsHeader = false;
        } else {
          formattedLines.push(line);
          prevLineIsHeader = false;
        }
      }
    }

    content = formattedLines.join('\n');
    if (content ! = = originalContent) {
      changes.push("Standardized header spacing");
      debug("Header spacing standardized");
    }
  }

  // Standardize multiple blank lines to single blank lines
  let originalLineCount = content.split('\n').length;
  content = content.replace(/ \n{3,}/ g, '\n\n');
  let newLineCount = content.split('\n').length;
  if (originalLineCount ! = = newLineCount) {
    changes.push(`Reduced ${originalLineCount - newLineCount} excess blank lines`);
    debug(`Reduced ${originalLineCount - newLineCount} excess blank lines`);
  }

  return { content, changes };
}