/**
 * YAML Finder Script
 * 
 * This script provides functionality to search for YAML frontmatter in text files
 * within a specified Google Drive folder. It creates a custom menu in Google Sheets
 * for easy access and provides a user interface for inputting folder details.
 * 
 * Key features:
 * 1. Custom UI menu in Google Sheets
 * 2. Dialog box for inputting folder ID or name
 * 3. Searching for text files in a specified folder
 * 4. Extracting and parsing YAML frontmatter from text files
 * 5. Logging extracted YAML data
 * 6. Basic error handling and user feedback
 * 7. Extensive debugging logs
 * 
 * Note: This script uses a simple custom YAML parser. For more complex YAML structures,
 * consider using a more robust external library.
 */

/**
 * Adds a custom menu to the Google Sheets UI.
 */
function onOpen() {
  console.log('Entering onOpen function');
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Markdown Tools')
      .addItem('YAML Finder', 'showFolderInputForm')
      .addToUi();
    console.log('Custom menu "Markdown Tools" created successfully');
  } catch (error) {
    console.error('Error in onOpen function:', error);
  }
  console.log('Exiting onOpen function');
}

/**
 * Shows the HTML form to accept folder input from the user.
 */
function showFolderInputForm() {
  console.log('Entering showFolderInputForm function');
  try {
    var html = HtmlService.createHtmlOutputFromFile('Index')
        .setWidth(400)
        .setHeight(300);
    SpreadsheetApp.getUi().showModalDialog(html, 'Enter Folder ID or Name');
    console.log('Folder input form displayed successfully');
  } catch (error) {
    console.error('Error in showFolderInputForm function:', error);
  }
  console.log('Exiting showFolderInputForm function');
}

/**
 * Processes the folder input from the user and finds YAML frontmatter properties.
 * @param {string} folderId - The folder ID input by the user.
 * @param {string} folderName - The folder name input by the user.
 */
function processFolderInput(folderId, folderName) {
  console.log('Entering processFolderInput function');
  console.log('Inputs - folderId:', folderId, 'folderName:', folderName);
  try {
    if (folderId) {
      console.log('Processing folder by ID:', folderId);
      findYamlFrontmatterInFolderById(folderId);
    } else if (folderName) {
      console.log('Processing folder by name:', folderName);
      var folder = findFolderByName(folderName);
      if (folder) {
        findYamlFrontmatterInFolder(folder);
      } else {
        console.warn('Folder not found:', folderName);
        SpreadsheetApp.getUi().alert('Folder not found. Please check the name and try again.');
      }
    } else {
      console.warn('No valid folder input provided');
      SpreadsheetApp.getUi().alert('No valid folder input provided. Please enter either a Folder ID or Folder Name.');
    }
  } catch (error) {
    console.error('Error processing folder input:', error);
    SpreadsheetApp.getUi().alert('Error processing folder input: ' + error.message);
  }
  console.log('Exiting processFolderInput function');
}

/**
 * Finds a folder by name.
 * @param {string} folderName - The name of the folder.
 * @return {Folder} The folder with the specified name, or null if not found.
 */
function findFolderByName(folderName) {
  console.log('Entering findFolderByName function');
  console.log('Searching for folder:', folderName);
  var folder = null;
  try {
    var folders = DriveApp.getFoldersByName(folderName);
    folder = folders.hasNext() ? folders.next() : null;
    console.log('Folder found:', folder ? 'Yes' : 'No');
  } catch (error) {
    console.error('Error in findFolderByName:', error);
  }
  console.log('Exiting findFolderByName function');
  return folder;
}

/**
 * Finds and logs all YAML frontmatter properties in text files within a specified folder.
 * @param {Folder} folder - The folder to search for YAML frontmatter properties.
 */
function findYamlFrontmatterInFolder(folder) {
  console.log('Entering findYamlFrontmatterInFolder function');
  if (!folder) {
    console.warn('Folder is undefined.');
    return;
  }
  console.log('Processing folder:', folder.getName());

  var files = folder.getFiles();
  var yamlFrontmatter = {};
  var fileCount = 0;
  var yamlCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    fileCount++;
    console.log('Processing file:', file.getName());
    if (file.getMimeType() === MimeType.PLAIN_TEXT) {
      var content = file.getBlob().getDataAsString();
      var frontmatter = extractYamlFrontmatter(content);
      if (frontmatter) {
        yamlFrontmatter[file.getName()] = frontmatter;
        yamlCount++;
        console.log('YAML frontmatter found in file:', file.getName());
      } else {
        console.log('No YAML frontmatter found in file:', file.getName());
      }
    } else {
      console.log('Skipping non-text file:', file.getName());
    }
  }

  console.log('Total files processed:', fileCount);
  console.log('Files with YAML frontmatter:', yamlCount);
  console.log('YAML frontmatter results:', yamlFrontmatter);
  console.log('Exiting findYamlFrontmatterInFolder function');
}

/**
 * Finds and logs all YAML frontmatter properties in text files within a folder specified by ID.
 * @param {string} folderId - The ID of the folder to search.
 */
function findYamlFrontmatterInFolderById(folderId) {
  console.log('Entering findYamlFrontmatterInFolderById function');
  console.log('Folder ID:', folderId);
  try {
    var folder = DriveApp.getFolderById(folderId);
    console.log('Folder found:', folder.getName());
    findYamlFrontmatterInFolder(folder);
  } catch (error) {
    console.error('Error finding folder by ID:', error);
    SpreadsheetApp.getUi().alert('Error finding folder by ID: ' + error.message);
  }
  console.log('Exiting findYamlFrontmatterInFolderById function');
}

/**
 * Extracts YAML frontmatter from the content of a text file.
 * @param {string} content - The content of the text file.
 * @return {Object} An object containing the YAML frontmatter properties.
 */
function extractYamlFrontmatter(content) {
  console.log('Entering extractYamlFrontmatter function');
  var yamlStart = content.indexOf('---');
  if (yamlStart === -1) {
    console.log('No YAML frontmatter found (missing opening ---)');
    console.log('Exiting extractYamlFrontmatter function');
    return null;
  }

  var yamlEnd = content.indexOf('---', yamlStart + 3);
  if (yamlEnd === -1) {
    console.log('No YAML frontmatter found (missing closing ---)');
    console.log('Exiting extractYamlFrontmatter function');
    return null;
  }

  var yamlContent = content.substring(yamlStart + 3, yamlEnd).trim();
  console.log('YAML content extracted:', yamlContent);
  var parsedYaml = parseYaml(yamlContent);
  console.log('Parsed YAML:', parsedYaml);
  console.log('Exiting extractYamlFrontmatter function');
  return parsedYaml;
}

/**
 * Parses a YAML string into an object.
 * @param {string} yamlString - The YAML string.
 * @return {Object} The parsed YAML object.
 */
function parseYaml(yamlString) {
  console.log('Entering parseYaml function');
  try {
    var yaml = new YAML();
    var result = yaml.parse(yamlString);
    console.log('YAML parsed successfully');
    console.log('Exiting parseYaml function');
    return result;
  } catch (e) {
    console.error('Failed to parse YAML:', e);
    console.log('Exiting parseYaml function');
    return null;
  }
}

/**
 * A simple YAML parser.
 * Note: For more complex YAML, consider using an external library.
 */
function YAML() {
  this.parse = function (yamlString) {
    console.log('Entering YAML.parse function');
    var lines = yamlString.split('\n');
    var result = {};
    lines.forEach(function (line, index) {
      console.log(`Processing line ${index + 1}:`, line);
      var parts = line.split(':');
      if (parts.length >= 2) {
        var key = parts.shift().trim();
        var value = parts.join(':').trim();
        result[key] = value;
        console.log('Parsed key-value pair:', key, ':', value);
      } else {
        console.log('Skipping line (not a key-value pair):', line);
      }
    });
    console.log('Parsed YAML result:', result);
    console.log('Exiting YAML.parse function');
    return result;
  };
}
