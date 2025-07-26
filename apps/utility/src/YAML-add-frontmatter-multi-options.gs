/**
 * YAML Adder for Google Drive Markdown Files
 * 
 * This script adds YAML frontmatter to markdown files in Google Drive.
 * It provides a custom menu in Google Sheets to launch a dialog for user input.
 * Users can add YAML to a single file, a list of files, or all markdown files in a folder.
 * The script logs results to a 'YAML Logs' sheet in the active spreadsheet.
 */

/**
 * Creates a custom menu in the Google Sheets UI when the spreadsheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Automations')
    .addItem('YAML - Make it so!', 'showYamlDialog')
    .addToUi();
}

/**
 * Displays a dialog for user input to control YAML addition.
 */
function showYamlDialog() {
  var html = HtmlService.createHtmlOutputFromFile('YamlDialog')
    .setWidth(400)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'YAML Controls');
}

/**
 * Processes the user's YAML addition request based on form data.
 * @param {Object} formData - The form data submitted by the user.
 * @return {Object} An object indicating success or failure and a message.
 */
function processYamlRequest(formData) {
  var changeType = formData.changeType;
  if (changeType !== 'add') {
    return {success: false, message: "This option isn't currently supported"};
  }

  var targetType = formData.targetType;
  var targets = [];

  switch (targetType) {
    case 'single':
      targets.push(getIdFromUrl(formData.fileInput));
      break;
    case 'list':
      targets = formData.fileInput.split(',').map(url => getIdFromUrl(url.trim()));
      break;
    case 'folder':
      targets = getMarkdownFilesInFolder(getIdFromUrl(formData.fileInput));
      break;
  }

  var results = targets.map(target => addYamlToFile(target, formData));
  logResults(results);

  var successCount = results.filter(r => r.success).length;
  var totalCount = results.length;
  return {
    success: true,
    message: `YAML added to ${successCount} out of ${totalCount} files. Check logs for details.`
  };
}

/**
 * Extracts the file ID from a Google Drive URL.
 * @param {string} url - The Google Drive URL.
 * @return {string|null} The extracted file ID or null if not found.
 */
function getIdFromUrl(url) {
  var match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

/**
 * Adds YAML frontmatter to a file if it doesn't already exist.
 * @param {string} fileId - The ID of the file to process.
 * @param {Object} formData - The form data containing YAML information.
 * @return {Object} An object indicating success or failure and a message.
 */
function addYamlToFile(fileId, formData) {
  try {
    var file = DriveApp.getFileById(fileId);
    
    // Check if the file is a markdown file and owned by the user
    if (!file.getName().toLowerCase().endsWith('.md')) {
      return {fileId: fileId, success: false, message: 'Not a markdown file'};
    }
    if (file.getOwner().getEmail() !== Session.getActiveUser().getEmail()) {
      return {fileId: fileId, success: false, message: 'File not owned by you'};
    }
    
    var content = file.getBlob().getDataAsString();
    
    if (!content.startsWith('---')) {
      var yaml = generateYaml(file, formData);
      content = yaml + content;
      file.setContent(content);
      return {fileId: fileId, success: true, message: 'YAML added successfully'};
    }
    
    return {fileId: fileId, success: false, message: 'YAML already exists'};
  } catch (error) {
    return {fileId: fileId, success: false, message: 'Error: ' + error.toString()};
  }
}

/**
 * Generates YAML frontmatter based on file properties and form data.
 * @param {File} file - The Google Drive file object.
 * @param {Object} formData - The form data containing YAML information.
 * @return {string} The generated YAML frontmatter.
 */
function generateYaml(file, formData) {
  var yaml = '---\n';
  yaml += `category: ${formData.category}\n`;
  yaml += `dateCreated: ${Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}\n`;
  yaml += `namePath: ${file.getParents().next().getName()}/${file.getName()}\n`;
  yaml += `nameFolder: ${file.getParents().next().getName()}\n`;
  yaml += `aliases: ${formData.aliases}\n`;
  yaml += `tags: ${formData.tags}\n`;
  
  // Add custom metadata
  for (var i = 1; i <= 7; i++) {
    var key = formData['customKey' + i];
    var value = formData['customValue' + i];
    if (key && value) {
      yaml += `${key}: ${value}\n`;
    }
  }
  
  yaml += '---\n\n';
  return yaml;
}

/**
 * Retrieves all markdown files in a given folder that are owned by the current user.
 * @param {string} folderId - The ID of the folder to search.
 * @return {Array} An array of file IDs for markdown files in the folder.
 */
function getMarkdownFilesInFolder(folderId) {
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var markdownFiles = [];
  var userEmail = Session.getActiveUser().getEmail();
  
  while (files.hasNext()) {
    var file = files.next();
    if (file.getName().toLowerCase().endsWith('.md') && file.getOwner().getEmail() === userEmail) {
      markdownFiles.push(file.getId());
    }
  }
  
  return markdownFiles;
}

/**
 * Logs the results of YAML addition to a 'YAML Logs' sheet in the active spreadsheet.
 * @param {Array} results - An array of result objects from YAML addition attempts.
 */
function logResults(results) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('YAML Logs');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('YAML Logs');
    sheet.appendRow(['File Name', 'Status', 'Message', 'Category', 'Date Created', 'File Path', 'Folder Name', 'Aliases', 'Tags']);
  }
  
  results.forEach(result => {
    try {
      var file = DriveApp.getFileById(result.fileId);
      var folder = file.getParents().next();
      sheet.appendRow([
        file.getName(),
        result.success ? 'Success' : 'Failed',
        result.message,
        file.getDescription() || 'N/A',
        Utilities.formatDate(file.getDateCreated(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        folder.getName() + '/' + file.getName(),
        folder.getName(),
        file.getDescription() || 'N/A',
        file.getTags().join(', ') || 'N/A'
      ]);
    } catch (error) {
      sheet.appendRow([
        'Unknown',
        'Failed',
        'Error accessing file: ' + error.toString(),
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'N/A',
        'N/A'
      ]);
    }
  });
}
