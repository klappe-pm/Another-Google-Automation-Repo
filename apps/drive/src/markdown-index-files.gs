/**
 * Script Name: markdown- index- files
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
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Sort data by relevant fields
 * 7. Format output for presentation
 *
 * Script Functions:
 * - addToSheet(): Works with spreadsheet data
 * - finalizeSheet(): Works with spreadsheet data
 * - getFilePath(): Gets specific file path or configuration
 * - getOrCreateSheet(): Gets specific or create sheet or configuration
 * - markdownIndex(): Works with spreadsheet data
 * - setHeaders(): Sets headers or configuration values
 *
 * Script Helper Functions:
 * - formatDate(): Formats date for display
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

/  / Helper function to set headers for the sheet if it is empty
 // Helper function to add file details to the sheet
 // Helper function to finalize the sheet by sorting the data
 // Helper function to construct the file path by traversing parent folders
 // Helper function to format a date object into a 'yyyy - MM - dd' string

// Main Functions

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @param {File} file - The file parameter
 * @param {any} type - The type parameter
 * @returns {string} The formatted string

 */

function addToSheet(sheet, file, type) { // Get the file path, creation date, and last modified date
  const filePath = getFilePath(file);
  const createdDate = file.getDateCreated();
  const lastModified = file.getLastUpdated();
  const today = new Date(); // Calculate the age of the file in days;
  const fileAge = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
  const modifiedAge = Math.floor((today - lastModified) / (1000 * 60 * 60 * 24)); // Prepare the row data to be added to the sheet;
  const rowData = [;
    false, // Clean - up checkbox (initially unchecked)
    file.getUrl(), // File URL;
    file.getName(), // File name;
    formatDate(createdDate), // Formatted creation date
    formatDate(lastModified), // Formatted last modified date
    fileAge, // Age of the file in days
    modifiedAge, // Age since last modification in days
    type, // File type (e.g., 'Markdown');
    filePath, // Full file path
  ]; // Append the row data to the sheet and add a checkbox in the first column
  sheet.appendRow(rowData);
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1).insertCheckboxes().setHorizontalAlignment('center');
}

/**

 * Works with spreadsheet data
 * @param
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 */

function finalizeSheet(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) { // Sort the data range by the "Created Date" column (column 4) in descending order
    const range = sheet.getDataRange();
    range.sort({ column: 4, ascending: false });
  }
}

/**

 * Gets specific file path or configuration
 * @param
 * @param {File} file - The file to retrieve
 * @returns {string} The requested string

 */

function getFilePath(file) {
  const pathParts = [];
  let parent = file.getParents().hasNext() ? file.getParents().next() : null;
  while (parent) { // Add parent folder names to the beginning of the path
    pathParts.unshift(parent.getName());
    parent = parent.getParents().hasNext() ? parent.getParents().next() : null;
  } // Join the path parts and append the file name
  return pathParts.join(' / ') + ' / ' + file.getName();
}

/**

 * Gets specific or create sheet or configuration
 * @param
 * @param {any} ss - The ss to retrieve
 * @param {string} sheetName - The sheetName to retrieve
 * @returns {string} The requested string

 */

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (! sheet) { // If the sheet does not exist, create it at the end of the spreadsheet
    sheet = ss.insertSheet(sheetName, ss.getSheets().length);
  }
  return sheet;
}

/**

 * Works with spreadsheet data
 * @returns {string} The formatted string

 */

function markdownIndex() { // Get the active spreadsheet and define the sheet name for Markdown files;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Markdown'; // Define the file extensions to be indexed as Markdown files;
  const extensions = ['md', 'txt', 'log', 'csv', 'json', 'xml', 'html', 'js', 'css']; // Log the start time of the indexing process;
  Logger.log('Markdown indexing started at: ' + new Date().toISOString()); // Define the folder ID to be indexed (replace with your folder ID);
  const folderId = '1VdMQjZpl8t6X_t20dyliX94iAJtOh4sV';
  const folder = DriveApp.getFolderById(folderId); // Retrieve or initialize the set of processed file IDs from script properties;
  const scriptProperties = PropertiesService.getScriptProperties();
  const processedFiles = new Set(JSON.parse(scriptProperties.getProperty('processedMarkdown') || '[]')); // Get or create the "Markdown" sheet and set headers if the sheet is empty;
  const sheet = getOrCreateSheet(ss, sheetName);
  if (sheet.getLastRow() = = = 0) {
    setHeaders(sheet);
  } // Initialize a queue with the root folder to process folders recursively
  const queue = [folder];
  while (queue.length > 0) { // Process the current folder;
    const currentFolder = queue.shift();
    const files = currentFolder.getFiles(); // Iterate through all files in the current folder;
    while (files.hasNext()) {
      const file = files.next(); // Extract the file extension and convert it to lowercase;
      const fileExtension = file.getName().split('.').pop().toLowerCase(); // Check if the file extension matches and if the file has not been processed;
      if (extensions.includes(fileExtension) && ! processedFiles.has(file.getId())) { // Add the file details to the sheet and mark it as processed;
        addToSheet(sheet, file, 'Markdown');
        processedFiles.add(file.getId());
        Logger.log(`Indexed Markdown file: ${file.getName()}`);
      }
    } // Add subfolders to the queue for further processing
    const subFolders = currentFolder.getFolders();
    while (subFolders.hasNext()) {
      queue.push(subFolders.next());
    }
  } // Save the updated set of processed file IDs to script properties
  scriptProperties.setProperty('processedMarkdown', JSON.stringify([...processedFiles])); // Finalize the sheet by sorting the data;
  finalizeSheet(sheet); // Log the completion time of the indexing process
  Logger.log('Markdown indexing completed at: ' + new Date().toISOString());
}

/**

 * Sets headers or configuration values
 * @param
 * @param {Sheet} sheet - The sheet to set
 * @returns {string} The formatted string

 */

function setHeaders(sheet) {
  const headers = ['Clean - up', 'File Link', 'File Name', 'Created Date', 'Last Modified', 'File Age', 'Modified Age', 'File Type', 'File Path']; // Set headers in the first row and apply formatting;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontSize(10).setFontWeight('bold').setFontFamily('Helvetica'); // Freeze the header row for easier navigation;
  sheet.setFrozenRows(1);
}

// Helper Functions

/**

 * Formats date for display
 * @param
 * @param {any} date - The date parameter
 * @returns {string} The formatted string

 */

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy - MM - dd');
}