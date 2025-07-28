/**
 * Script Name: markdown- find- yaml
 *
 * Script Summary:
 * Finds markdown content for documentation and note- taking workflows.
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
 * - SpreadsheetApp: For spreadsheet operations
 */

/**
 * Shows the HTML form to accept folder input from the user.
 *// * *
 * Processes the folder input from the user and finds YAML frontmatter properties.
 * @param {string} folderId - The folder ID input by the user.
 * @param {string} folderName - The folder name input by the user.
 *// * *
 * Finds a folder by name.
 * @param {string} folderName - The name of the folder.
 * @return {Folder} The folder with the specified name, or null if not found.
 *// * *
 * Finds and logs all YAML frontmatter properties in text files within a specified folder.
 * @param {Folder} folder - The folder to search for YAML frontmatter properties.
 *// * *
 * Finds and logs all YAML frontmatter properties in text files within a folder specified by ID.
 * @param {string} folderId - The ID of the folder to search.
 *// * *
 * Extracts YAML frontmatter from the content of a text file.
 * @param {string} content - The content of the text file.
 * @return {Object} An object containing the YAML frontmatter properties.
 *// * *
 * Parses a YAML string into an object.
 * @param {string} yamlString - The YAML string.
 * @return {Object} The parsed YAML object.
 *// * *
 * A simple YAML parser.
 * Note: For more complex YAML, consider using an external library.
 *// / Main Functions

// Main Functions

/**

 * Extracts specific information
 * @param
 * @param {string} content - The content to process
 * @returns {string} The formatted string

 */

function extractYamlFrontmatter(content) {
  console.log('Entering extractYamlFrontmatter function');
  let yamlStart = content.indexOf('- - - ');
  if (yamlStart = = = - 1) {
    console.log('No YAML frontmatter found (missing opening - - - )');
    console.log('Exiting extractYamlFrontmatter function');
    return null;
  }

  let yamlEnd = content.indexOf('- - - ', yamlStart + 3);
  if (yamlEnd = = = - 1) {
    console.log('No YAML frontmatter found (missing closing - - - )');
    console.log('Exiting extractYamlFrontmatter function');
    return null;
  }

  let yamlContent = content.substring(yamlStart + 3, yamlEnd).trim();
  console.log('YAML content extracted:', yamlContent);
  let parsedYaml = parseYaml(yamlContent);
  console.log('Parsed YAML:', parsedYaml);
  console.log('Exiting extractYamlFrontmatter function');
  return parsedYaml;
}

/**

 * Finds matching folder by name
 * @param
 * @param {string} folderName - The folderName parameter
 * @returns {string} The formatted string

 */

function findFolderByName(folderName) {
  console.log('Entering findFolderByName function');
  console.log('Searching for folder:', folderName);
  let folder = null;
  try {
    let folders = DriveApp.getFoldersByName(folderName);
    folder = folders.hasNext() ? folders.next() : null;
    console.log('Folder found:', folder ? 'Yes' : 'No');
  } catch (error) {
    console.error('Error in findFolderByName:', error);
  }
  console.log('Exiting findFolderByName function');
  return folder;
}

/**

 * Finds matching yaml frontmatter in folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {string} The formatted string

 */

function findYamlFrontmatterInFolder(folder) {
  console.log('Entering findYamlFrontmatterInFolder function');
  if (! folder) {
    console.warn('Folder is undefined.');
    return;
  }
  console.log('Processing folder:', folder.getName());

  let files = folder.getFiles();
  let yamlFrontmatter = {};
  let fileCount = 0;
  let yamlCount = 0;

  while (files.hasNext()) {
    let file = files.next();
    fileCount+ + ;
    console.log('Processing file:', file.getName());
    if (file.getMimeType() = = = MimeType.PLAIN_TEXT) {
      let content = file.getBlob().getDataAsString();
      let frontmatter = extractYamlFrontmatter(content);
      if (frontmatter) {
        yamlFrontmatter[file.getName()] = frontmatter;
        yamlCount+ + ;
        console.log('YAML frontmatter found in file:', file.getName());
      } else {
        console.log('No YAML frontmatter found in file:', file.getName());
      }
    } else {
      console.log('Skipping non- text file:', file.getName());
    }
  }

  console.log('Total files processed:', fileCount);
  console.log('Files with YAML frontmatter:', yamlCount);
  console.log('YAML frontmatter results:', yamlFrontmatter);
  console.log('Exiting findYamlFrontmatterInFolder function');
}

/**

 * Finds matching yaml frontmatter in folder by id
 * @param
 * @param {string} folderId - The folderId parameter
 * @returns {string} The formatted string

 */

function findYamlFrontmatterInFolderById(folderId) {
  console.log('Entering findYamlFrontmatterInFolderById function');
  console.log('Folder ID:', folderId);
  try {
    let folder = DriveApp.getFolderById(folderId);
    console.log('Folder found:', folder.getName());
    findYamlFrontmatterInFolder(folder);
  } catch (error) {
    console.error('Error finding folder by ID:', error);
    SpreadsheetApp.getUi().alert('Error finding folder by ID: ' + error.message);
  }
  console.log('Exiting findYamlFrontmatterInFolderById function');
}

/**

 * Manages files and folders
 * @returns {string} The formatted string

 */

function onOpen() {
  console.log('Entering onOpen function');
  try {
    let ui = SpreadsheetApp.getUi();
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

 * Processes and transforms folder input
 * @param
 * @param {string} folderId - The folderId parameter
 * @param {string} folderName - The folderName parameter
 * @returns {string} The formatted string

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
      let folder = findFolderByName(folderName);
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

 * Manages files and folders
 * @returns {string} The formatted string

 */

function showFolderInputForm() {
  console.log('Entering showFolderInputForm function');
  try {
    let html = HtmlService.createHtmlOutputFromFile('Index')
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

 * Performs specialized operations
 * @returns {string} The formatted string

 */

function YAML() {
  this.parse = function (yamlString) {
    console.log('Entering YAML.parse function');
    let lines = yamlString.split('\n');
    let result = {};
    lines.forEach(function (line, index) {
      console.log(`Processing line ${index + 1}:`, line);
      let parts = line.split(':');
      if (parts.length > = 2) {
        let key = parts.shift().trim();
        let value = parts.join(':').trim();
        result[key] = value;
        console.log('Parsed key- value pair:', key, ':', value);
      } else {
        console.log('Skipping line (not a key- value pair):', line);
      }
    });
    console.log('Parsed YAML result:', result);
    console.log('Exiting YAML.parse function');
    return result;
  };
}

// Helper Functions

/**

 * Parses and extracts yaml
 * @param
 * @param {any} yamlString - The yamlString parameter
 * @returns {string} The formatted string

 */

function parseYaml(yamlString) {
  console.log('Entering parseYaml function');
  try {
    let yaml = new YAML();
    let result = yaml.parse(yamlString);
    console.log('YAML parsed successfully');
    console.log('Exiting parseYaml function');
    return result;
  } catch (e) {
    console.error('Failed to parse YAML:', e);
    console.log('Exiting parseYaml function');
    return null;
  }
}