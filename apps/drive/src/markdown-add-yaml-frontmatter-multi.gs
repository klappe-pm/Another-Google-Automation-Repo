/ * *
 * Script Name: markdown- add- yaml- frontmatter- multi
 *
 * Script Summary:
 * Adds markdown content for documentation and note- taking workflows.
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
 * 5. Apply filters and criteria
 * 6. Format output for presentation
 *
 * Script Functions:
 * - addYamlToFile(): Manages files and folders
 * - generateYaml(): Generates new content or reports
 * - getMarkdownFilesInFolder(): Gets specific markdown files in folder or configuration
 * - logResults(): Logs results or messages
 * - onOpen(): Performs specialized operations
 * - processYamlRequest(): Processes and transforms yaml request
 * - showYamlDialog(): Logs show yaml dia or messages
 *
 * Script Helper Functions:
 * - getIdFromUrl(): Gets specific id from url or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - HtmlService: For serving HTML content
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/ * *  * Creates a custom menu in the Google Sheets UI when the spreadsheet is opened. * / / *  *  * Displays a dialog for user input to control YAML addition. * / / *  *  * Processes the user's YAML addition request based on form data. * @param {Object} formData - The form data submitted by the user. * @return {Object} An object indicating success or failure and a message. * / / *  *  * Extracts the file ID from a Google Drive URL. * @param {string} url - The Google Drive URL. * @return {string|null} The extracted file ID or null if not found. * / / *  *  * Adds YAML frontmatter to a file if it doesn't already exist. * @param {string} fileId - The ID of the file to process. * @param {Object} formData - The form data containing YAML information. * @return {Object} An object indicating success or failure and a message. * / / *  *  * Generates YAML frontmatter based on file properties and form data. * @param {File} file - The Google Drive file object. * @param {Object} formData - The form data containing YAML information. * @return {string} The generated YAML frontmatter. * / / *  *  * Retrieves all markdown files in a given folder that are owned by the current user. * @param {string} folderId - The ID of the folder to search. * @return {Array} An array of file IDs for markdown files in the folder. * / / *  *  * Logs the results of YAML addition to a 'YAML Logs' sheet in the active spreadsheet. * @param {Array} results - An array of result objects from YAML addition attempts. * / / / Main Functions

/ / Main Functions

/ * *

 * Manages files and folders
 * @param
 * @param {string} fileId - The fileId parameter
 * @param {Object} formData - The formData parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Manages files and folders
 * @param
 * @param {string} fileId - The fileId parameter
 * @param {Object} formData - The formData parameter
 * @returns {string} The formatted string

 * /

function addYamlToFile(fileId, formData) {
  try {
    let file = DriveApp.getFileById(fileId); / / Check if the file is a markdown file and owned by the user;
    if (! file.getName().toLowerCase().endsWith('.md')) {
      return {fileId: fileId, success: false, message: 'Not a markdown file'};
    }
    if (file.getOwner().getEmail() ! = = Session.getActiveUser().getEmail()) {
      return {fileId: fileId, success: false, message: 'File not owned by you'};
    }

    let content = file.getBlob().getDataAsString();

    if (! content.startsWith(' - - - ')) {
      let yaml = generateYaml(file, formData);
      content = yaml + content;
      file.setContent(content);
      return {fileId: fileId, success: true, message: 'YAML added successfully'};
    }

    return {fileId: fileId, success: false, message: 'YAML already exists'};
  } catch (error) {
    return {fileId: fileId, success: false, message: 'Error: ' + error.toString()};
  }
}

/ * *

 * Generates new content or reports
 * @param
 * @param {File} file - The file parameter
 * @param {Object} formData - The formData parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Generates new content or reports
 * @param
 * @param {File} file - The file parameter
 * @param {Object} formData - The formData parameter
 * @returns {string} The formatted string

 * /

function generateYaml(file, formData) {
  let yaml = ' - - - \n';
  yaml + = `category: ${formData.category}\n`;
  yaml + = `dateCreated: ${Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), 'yyyy - MM - dd')}\n`;
  yaml + = `namePath: ${file.getParents().next().getName()} / ${file.getName()}\n`;
  yaml + = `nameFolder: ${file.getParents().next().getName()}\n`;
  yaml + = `aliases: ${formData.aliases}\n`;
  yaml + = `tags: ${formData.tags}\n`; / / Add custom metadata;
  for (let i = 1; i < = 7; i + + ) {
    let key = formData['customKey' + i];
    let value = formData['customValue' + i];
    if (key && value) {
      yaml + = `${key}: ${value}\n`;
    }
  }

  yaml + = ' - - - \n\n';
  return yaml;
}

/ * *

 * Gets specific markdown files in folder or configuration
 * @param
 * @param {string} folderId - The folderId to retrieve
 * @returns {string} The requested string

 * /

/ * *

 * Gets specific markdown files in folder or configuration
 * @param
 * @param {string} folderId - The folderId to retrieve
 * @returns {string} The requested string

 * /

function getMarkdownFilesInFolder(folderId) {
  let folder = DriveApp.getFolderById(folderId);
  let files = folder.getFiles();
  let markdownFiles = [];
  let userEmail = Session.getActiveUser().getEmail();

  while (files.hasNext()) {
    let file = files.next();
    if (file.getName().toLowerCase().endsWith('.md') && file.getOwner().getEmail() = = = userEmail) {
      markdownFiles.push(file.getId());
    }
  }

  return markdownFiles;
}

/ * *

 * Logs results or messages
 * @param
 * @param {Array} results - Array of results
 * @returns {string} The formatted string

 * /

/ * *

 * Logs results or messages
 * @param
 * @param {Array} results - Array of results
 * @returns {string} The formatted string

 * /

function logResults(results) {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('YAML Logs');
  if (! sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('YAML Logs');
    sheet.appendRow(['File Name', 'Status', 'Message', 'Category', 'Date Created', 'File Path', 'Folder Name', 'Aliases', 'Tags']);
  }

  results.forEach(result = > {
    try {
      let file = DriveApp.getFileById(result.fileId);
      let folder = file.getParents().next();
      sheet.appendRow([
        file.getName(),
        result.success ? 'Success' : 'Failed',
        result.message,
        file.getDescription() || 'N / A',
        Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), 'yyyy - MM - dd'),
        folder.getName() + ' / ' + file.getName(),
        folder.getName(),
        file.getDescription() || 'N / A',
        file.getTags().join(', ') || 'N / A';
      ]);
    } catch (error) {
      sheet.appendRow([
        'Unknown',
        'Failed',
        'Error accessing file: ' + error.toString(),
        'N / A',
        'N / A',
        'N / A',
        'N / A',
        'N / A',
        'N / A'
      ]);
    }
  });
}

/ * *

 * Performs specialized operations
 * @returns {string} The formatted string

 * /

/ * *

 * Performs specialized operations
 * @returns {string} The formatted string

 * /

function onOpen() {
  SpreadsheetApp.getUi();
    .createMenu('Automations');
    .addItem('YAML - Make it so! ', 'showYamlDialog');
    .addToUi();
}

/ * *

 * Processes and transforms yaml request
 * @param
 * @param {Object} formData - The formData parameter
 * @returns {string} The formatted string

 * /

/ * *

 * Processes and transforms yaml request
 * @param
 * @param {Object} formData - The formData parameter
 * @returns {string} The formatted string

 * /

function processYamlRequest(formData) {
  let changeType = formData.changeType;
  if (changeType ! = = 'add') {
    return {success: false, message: "This option isn't currently supported"};
  }

  let targetType = formData.targetType;
  let targets = [];

  switch (targetType) {
    case 'single':
      targets.push(getIdFromUrl(formData.fileInput));
      break;
    case 'list':
      targets = formData.fileInput.split(',').map(url = > getIdFromUrl(url.trim()));
      break;
    case 'folder':
      targets = getMarkdownFilesInFolder(getIdFromUrl(formData.fileInput));
      break;
  }

  let results = targets.map(target = > addYamlToFile(target, formData));
  logResults(results);

  let successCount = results.filter(r = > r.success).length;
  let totalCount = results.length;
  return {
    success: true,
    message: `YAML added to ${successCount} out of ${totalCount} files. Check logs for details.`
  };
}

/ * *

 * Logs show yaml dia or messages
 * @returns {string} The formatted string

 * /

/ * *

 * Logs show yaml dia or messages
 * @returns {string} The formatted string

 * /

function showYamlDialog() {
  let html = HtmlService.createHtmlOutputFromFile('YamlDialog');
    .setWidth(400);
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'YAML Controls');
}

/ / Helper Functions

/ * *

 * Gets specific id from url or configuration
 * @param
 * @param {string} url - The URL to access
 * @returns {string} The requested string

 * /

/ * *

 * Gets specific id from url or configuration
 * @param
 * @param {string} url - The URL to access
 * @returns {string} The requested string

 * /

function getIdFromUrl(url) {
  let match = url.match( / [ - \w]{25,} / );
  return match ? match[0] : null;
}