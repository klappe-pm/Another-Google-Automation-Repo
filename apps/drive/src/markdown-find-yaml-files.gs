/**
 * Script Name: markdown-find-yaml-files
 * 
 * Script Summary:
 * Finds markdown content for documentation and note-taking workflows.
 * 
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note-taking systems
 * - Maintain consistent documentation structure
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 
 * Script Functions:
 * - extractYamlFrontmatter(): Extracts specific information
 * - findFolderByName(): Finds matching folder by name
 * - findYamlFrontmatterInFolder(): Finds matching yaml frontmatter in folder
 * - findYamlFrontmatterInFolderById(): Finds matching yaml frontmatter in folder by id
 * - onOpen(): Manages files and folders
 * - processFolderInput(): Processes and transforms folder input
 * - showFolderInputForm(): Manages files and folders
 * - YAML(): Performs specialized operations
 * 
 * Script Helper Functions:
 * - parseYaml(): Parses and extracts yaml
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - DriveApp: For file and folder management
 * - HtmlService: For serving HTML content
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 */

// Main Functions

/**

 * Extracts specific information
 * @param
 * @param {string} content - The content to process
 * @returns {any} The result

 */

function extractYamlFrontmatter(content) {
  Logger.log('Entering extractYamlFrontmatter function');
  var yamlStart = content.indexOf(' --- ');
  if (yamlStart === - 1) {
    Logger.log('No YAML frontmatter found (missing opening --- )');
    Logger.log('Exiting extractYamlFrontmatter function');
    return null;
  }

  var yamlEnd = content.indexOf(' --- ', yamlStart + 3);
  if (yamlEnd === - 1) {
    Logger.log('No YAML frontmatter found (missing closing --- )');
    Logger.log('Exiting extractYamlFrontmatter function');
    return null;
  }

  var yamlContent = content.substring(yamlStart + 3, yamlEnd).trim();
  Logger.log('YAML content extracted:', yamlContent);
  var parsedYaml = parseYaml(yamlContent);
  Logger.log('Parsed YAML:', parsedYaml);
  Logger.log('Exiting extractYamlFrontmatter function');
  return parsedYaml;
}

/**

 * Finds matching folder by name
 * @param
 * @param {string} folderName - The folderName parameter
 * @returns {any} The result

 */

function findFolderByName(folderName) {
  Logger.log('Entering findFolderByName function');
  Logger.log('Searching for folder:', folderName);
  var folder = null;
  try {
    var folders = DriveApp.getFoldersByName(folderName);
    folder = folders.hasNext() ? folders.next() : null;
    Logger.log('Folder found:', folder ? 'Yes' : 'No');
  } catch (error) {
    console.error('Error in findFolderByName:', error);
  }
  Logger.log('Exiting findFolderByName function');
  return folder;
}

/**

 * Finds matching yaml frontmatter in folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {any} The result

 */

function findYamlFrontmatterInFolder(folder) {
  Logger.log('Entering findYamlFrontmatterInFolder function');
  if (!folder) {
    console.warn('Folder is undefined.');
    return;
  }
  Logger.log('Processing folder:', folder.getName());

  var files = folder.getFiles();
  var yamlFrontmatter = {};
  var fileCount = 0;
  var yamlCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    fileCount ++; Logger.log('Processing file:', file.getName());
    if (file.getMimeType() === MimeType.PLAIN_TEXT) {
      var content = file.getBlob().getDataAsString();
      var frontmatter = extractYamlFrontmatter(content);
      if (frontmatter) {
        yamlFrontmatter[file.getName()] = frontmatter;
        yamlCount ++; Logger.log('YAML frontmatter found in file:', file.getName());
      } else {
        Logger.log('No YAML frontmatter found in file:', file.getName());
      }
    } else {
      Logger.log('Skipping non - text file:', file.getName());
    }
  }

  Logger.log('Total files processed:', fileCount);
  Logger.log('Files with YAML frontmatter:', yamlCount);
  Logger.log('YAML frontmatter results:', yamlFrontmatter);
  Logger.log('Exiting findYamlFrontmatterInFolder function');
}

/**

 * Finds matching yaml frontmatter in folder by id
 * @param
 * @param {string} folderId - The folderId parameter
 * @returns {any} The result

 */

function findYamlFrontmatterInFolderById(folderId) {
  Logger.log('Entering findYamlFrontmatterInFolderById function');
  Logger.log('Folder ID:', folderId);
  try {
    var folder = DriveApp.getFolderById(folderId);
    Logger.log('Folder found:', folder.getName());
    findYamlFrontmatterInFolder(folder);
  } catch (error) {
    console.error('Error finding folder by ID:', error);
    SpreadsheetApp.getUi().alert('Error finding folder by ID: ' + error.message);
  }
  Logger.log('Exiting findYamlFrontmatterInFolderById function');
}

/**

 * Manages files and folders
 * @returns {any} The result

 */

function onOpen() {
  Logger.log('Entering onOpen function');
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Markdown Tools');
      .addItem('YAML Finder', 'showFolderInputForm');
      .addToUi();
    Logger.log('Custom menu "Markdown Tools" created successfully');
  } catch (error) {
    console.error('Error in onOpen function:', error);
  }
  Logger.log('Exiting onOpen function');
}

/**

 * Processes and transforms folder input
 * @param
 * @param {string} folderId - The folderId parameter
 * @param {string} folderName - The folderName parameter
 * @returns {any} The result

 */

function processFolderInput(folderId, folderName) {
  Logger.log('Entering processFolderInput function');
  Logger.log('Inputs - folderId:', folderId, 'folderName:', folderName);
  try {
    if (folderId) {
      Logger.log('Processing folder by ID:', folderId);
      findYamlFrontmatterInFolderById(folderId);
    } else if (folderName) {
      Logger.log('Processing folder by name:', folderName);
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
  Logger.log('Exiting processFolderInput function');
}

/**

 * Manages files and folders
 * @returns {any} The result

 */

function showFolderInputForm() {
  Logger.log('Entering showFolderInputForm function');
  try {
    var html = HtmlService.createHtmlOutputFromFile('Index');
        .setWidth(400);
        .setHeight(300);
    SpreadsheetApp.getUi().showModalDialog(html, 'Enter Folder ID or Name');
    Logger.log('Folder input form displayed successfully');
  } catch (error) {
    console.error('Error in showFolderInputForm function:', error);
  }
  Logger.log('Exiting showFolderInputForm function');
}

/**

 * Performs specialized operations
 * @returns {any} The result

 */

function YAML() {
  this.parse = function (yamlString) {
    Logger.log('Entering YAML.parse function');
    var lines = yamlString.split('\n');
    var result = {};
    lines.forEach(function (line, index) {
      Logger.log(`Processing line ${index + 1}:`, line);
      var parts = line.split(':');
      if (parts.length > = 2) {
        var key = parts.shift().trim();
        var value = parts.join(':').trim();
        result[key] = value;
        Logger.log('Parsed key - value pair:', key, ':', value);
      } else {
        Logger.log('Skipping line (not a key - value pair):', line);
      }
    });
    Logger.log('Parsed YAML result:', result);
    Logger.log('Exiting YAML.parse function');
    return result;
  };
}

// Helper Functions

/**

 * Parses and extracts yaml
 * @param
 * @param {any} yamlString - The yamlString parameter
 * @returns {any} The result

 */

function parseYaml(yamlString) {
  Logger.log('Entering parseYaml function');
  try {
    var yaml = new YAML();
    var result = yaml.parse(yamlString);
    Logger.log('YAML parsed successfully');
    Logger.log('Exiting parseYaml function');
    return result;
  } catch (e) {
    console.error('Failed to parse YAML:', e);
    Logger.log('Exiting parseYaml function');
    return null;
  }
}