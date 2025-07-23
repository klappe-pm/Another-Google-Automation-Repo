/*
Summary:
This Google Apps Script adds YAML frontmatter to markdown files stored in a Google Drive folder.
It creates a custom menu in Google Sheets to trigger the functionality, prompts the user for
necessary information, and processes the files. The script includes debug logging capabilities
and error handling to ensure smooth execution and troubleshooting.

Key features:
1. Custom menu creation in Google Sheets UI
2. Folder selection via folder ID input
3. YAML frontmatter generation with user-defined category and subcategory
4. Batch processing of markdown files in the selected folder
5. Debug logging with sheet-based and in-memory options
6. Error handling and user feedback
*/

const DEBUG = true;
let debugLog = [];

// Function to create and add the custom menu to the Google Sheets UI
function onOpen(e) {
  debug("onOpen function started");
  try {
    const ui = SpreadsheetApp.getUi();
    debug("SpreadsheetApp.getUi() successful");
    
    const menu = ui.createMenu('Obsidian YAML');
    debug("Menu created");
    
    menu.addItem('Add new YAML', 'addYamlFrontmatter');
    debug("'Add new YAML' item added");
    
    menu.addItem('View Debug Log', 'viewDebugLog');
    debug("'View Debug Log' item added");
    
    menu.addToUi();
    debug("Menu added to UI");
    
    // Log the trigger source
    if (e && e.authMode) {
      debug(`Trigger source: ${e.authMode}`);
    } else {
      debug("No trigger information available");
    }
  } catch (error) {
    debug(`Error in onOpen: ${error.message}`);
    debug(`Error stack: ${error.stack}`);
  }
}

// Main function to add YAML frontmatter to markdown files
function addYamlFrontmatter() {
  debug('Starting addYamlFrontmatter function');
  const ui = SpreadsheetApp.getUi();
  
  // Prompt for folder ID
  let folderId;
  try {
    const folderIdResponse = ui.prompt(
      'Enter Folder ID',
      'Please enter the ID of the folder containing markdown files:',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (folderIdResponse.getSelectedButton() == ui.Button.CANCEL) {
      debug('User cancelled folder ID input');
      return;
    }
    
    folderId = folderIdResponse.getResponseText();
    debug(`Folder ID entered: ${folderId}`);
  } catch (e) {
    debug(`Error in folder ID prompt: ${e.message}`);
    ui.alert('Error', `An error occurred while getting folder ID: ${e.message}`, ui.ButtonSet.OK);
    return;
  }
  
  // Get the folder by ID
  let folder;
  try {
    folder = DriveApp.getFolderById(folderId);
    debug(`Successfully got folder with name: ${folder.getName()}`);
  } catch (e) {
    debug(`Error getting folder: ${e.message}`);
    ui.alert('Error', `Could not find folder with ID: ${folderId}. Error: ${e.message}`, ui.ButtonSet.OK);
    return;
  }
  
  // Prompt for YAML values
  let yamlValues;
  try {
    yamlValues = promptForYamlValues(ui);
    debug(`YAML values entered: ${JSON.stringify(yamlValues)}`);
  } catch (e) {
    debug(`Error in YAML values prompt: ${e.message}`);
    ui.alert('Error', `An error occurred while getting YAML values: ${e.message}`, ui.ButtonSet.OK);
    return;
  }
  
  // Process files in the folder
  let files;
  try {
    files = folder.getFilesByType(MimeType.PLAIN_TEXT);
  } catch (e) {
    debug(`Error getting files from folder: ${e.message}`);
    ui.alert('Error', `Could not access files in the folder. Error: ${e.message}`, ui.ButtonSet.OK);
    return;
  }
  
  let processedCount = 0;
  let errorCount = 0;
  
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().endsWith('.md')) {
      debug(`Processing file: ${file.getName()}`);
      try {
        addYamlToFile(file, yamlValues);
        processedCount++;
      } catch (e) {
        debug(`Error processing file ${file.getName()}: ${e.message}`);
        errorCount++;
      }
    }
  }
  
  debug(`Processed ${processedCount} files with ${errorCount} errors`);
  ui.alert('YAML Frontmatter Added', `Processed ${processedCount} markdown files. ${errorCount} errors occurred. Check the debug log for details.`, ui.ButtonSet.OK);
}

// Function to prompt the user for YAML values
function promptForYamlValues(ui) {
  debug('Starting promptForYamlValues function');
  const yamlValues = {};
  
  try {
    const categoryResponse = ui.prompt('Enter YAML values', 'Category:', ui.ButtonSet.OK_SKIP);
    if (categoryResponse.getSelectedButton() == ui.Button.OK) {
      yamlValues.category = categoryResponse.getResponseText();
      debug(`Category entered: ${yamlValues.category}`);
    } else {
      debug('Category skipped');
    }
    
    const subcategoryResponse = ui.prompt('Enter YAML values', 'Sub-category:', ui.ButtonSet.OK_SKIP);
    if (subcategoryResponse.getSelectedButton() == ui.Button.OK) {
      yamlValues.subcategory = subcategoryResponse.getResponseText();
      debug(`Sub-category entered: ${yamlValues.subcategory}`);
    } else {
      debug('Sub-category skipped');
    }
  } catch (e) {
    debug(`Error in promptForYamlValues: ${e.message}`);
    throw new Error(`Failed to get YAML values: ${e.message}`);
  }
  
  return yamlValues;
}

// Function to add YAML frontmatter to a single file
function addYamlToFile(file, yamlValues) {
  debug(`Starting addYamlToFile function for file: ${file.getName()}`);
  try {
    const content = file.getBlob().getDataAsString();
    const createdDate = formatDate(file.getDateCreated());
    
    const yaml = `---
category: ${yamlValues.category || ''}
sub-category: ${yamlValues.subcategory || ''}
dateCreated: ${createdDate}
aliases:
tags:
---

`;
    
    const updatedContent = yaml + content;
    file.setContent(updatedContent);
    debug(`Updated content for file: ${file.getName()}`);
  } catch (e) {
    debug(`Error in addYamlToFile for ${file.getName()}: ${e.message}`);
    throw new Error(`Failed to add YAML to file ${file.getName()}: ${e.message}`);
  }
}

// Helper function to format dates for YAML frontmatter
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Debug logging function
function debug(message) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    debugLog.push(`${timestamp}: ${message}`);
    console.log(message);
    
    // Attempt to log to a sheet for persistent debugging
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DebugLog");
      if (!sheet) {
        SpreadsheetApp.getActiveSpreadsheet().insertSheet("DebugLog");
      }
      sheet.appendRow([timestamp, message]);
    } catch (e) {
      console.log(`Failed to log to sheet: ${e.message}`);
    }
  }
}

// Function to display the debug log in the UI
function viewDebugLog() {
  const ui = SpreadsheetApp.getUi();
  if (debugLog.length === 0) {
    ui.alert('Debug Log', 'No debug information available.', ui.ButtonSet.OK);
  } else {
    const logContent = debugLog.join('\n');
    const htmlOutput = HtmlService
      .createHtmlOutput('<pre>' + logContent + '</pre>')
      .setWidth(600)
      .setHeight(400);
    ui.showModalDialog(htmlOutput, 'Debug Log');
  }
}
