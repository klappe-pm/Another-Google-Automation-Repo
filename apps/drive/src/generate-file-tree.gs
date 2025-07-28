/**
 * Script Name: generate- file- tree
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Sort data by relevant fields
 * 7. Format output for presentation
 * 8. Write results to destination
 *
 * Script Functions:
 * - generateTree(): Generates new content or reports
 * - onOpen(): Manages files and folders
 * - processFolder(): Processes and transforms folder
 * - runFileTreeGenerator(): Executes main process
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/**  * Main function to initiate the file tree generation process. * Prompts the user for the root folder ID and starts the recursive processing. * / / *  *  * Generates the file tree structure in the active sheet starting from the given root folder. * @param {Folder} rootFolder The Google Drive Folder object to start from. * / / *  *  * Recursively processes a folder, adding file information to the output array, * and then calling itself for subfolders. *  * @param {GoogleAppsScript.Drive.Folder} folder The current folder to process. * @param {Array < GoogleAppsScript.Drive.Folder > } pathArray An array of FOLDER objects representing the path from the root to the current 'folder'. * @param {Array < Array < Object >  > } outputData The main array collecting row data (as RichTextValue objects). * @param {string} timezone The timezone string for date formatting. * @param {string} dateFormat The desired date format string. * / / / Main Functions

/ / Main Functions

/**

 * Generates new content or reports
 * @param
 * @param {Folder} rootFolder - The rootFolder parameter

 * /

/**

 * Generates new content or reports
 * @param
 * @param {Folder} rootFolder - The rootFolder parameter

 * /

function generateTree(rootFolder) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const timezone = ss.getSpreadsheetTimeZone(); / / Get timezone from spreadsheet settings;
  const dateFormat = 'yyyy - MM - dd'; / / Clear previous content and formatting;
  sheet.clearContents().clearFormats(); / / Array to hold all row data (as RichTextValue objects);
  const outputData = [];
  let maxColumns = 1; / / Start with 1 for the full path column / /  - - - Start Recursive Processing - - -  / / The path array stores FOLDER objects;
  processFolder(rootFolder, [rootFolder], outputData, timezone, dateFormat); / /  - - -  - - -  - - -  - - -  - - -  - - -  - - -  - - -  - - -  - - -  - - -  - if (outputData.length = = = 0) {
    sheet.getRange("A1").setValue("No files found in the specified folder or its subfolders.");
    return;
  } / /  - - - Determine Maximum Columns Needed - - -  / / Path Col + Max Folder Cols + File Col + Created Col + Updated Col
  outputData.forEach(row = > { / / The number of folder links is row.length - 4 (Full Path, File Link, Created, Updated) / / Total columns needed for this row is (row.length - 4) + 1 (Full Path) + 1 (File) + 1 (Created) + 1 (Updated) = row.length;
    if (row.length > maxColumns) {
      maxColumns = row.length;
    }
  }); / /  - - - Create Header Row - - - const headerRow = [SpreadsheetApp.newRichTextValue().setText("Full Path").build()]; / / Calculate number of folder columns needed;
  const maxFolderDepth = maxColumns - 4; / / Max Cols - Path - File - Created - Updated;
  for (let i = 1; i < = maxFolderDepth; i + + ) {
      headerRow.push(SpreadsheetApp.newRichTextValue().setText(`Folder Level ${i}`).build());
  }
  headerRow.push(SpreadsheetApp.newRichTextValue().setText("File").build());
  headerRow.push(SpreadsheetApp.newRichTextValue().setText("Date Created").build());
  headerRow.push(SpreadsheetApp.newRichTextValue().setText("Date Updated").build()); / /  - - - Prepare Data for Writing - - -  / / Ensure all rows have the same number of columns (padding with empty values if needed) / / and convert all simple values to RichTextValue;
  const finalOutput = [headerRow]; / / Start with the header;
  outputData.forEach(rowData = > {
    const paddedRow = [];
    let currentColumnIndex = 0; / / 1. Full Path (already RichTextValue);
    paddedRow.push(rowData[currentColumnIndex + + ]); / / 2. Folder Links (already RichTextValue) - calculate how many there are;
    const numFolderLinks = rowData.length - 4; / / Path, File, Created, Updated;
    for (let i = 0; i < numFolderLinks; i + + ) {
        paddedRow.push(rowData[currentColumnIndex + + ]);
    } / / Pad remaining folder columns if this path is shorter than the max depth
    for (let i = numFolderLinks; i < maxFolderDepth; i + + ) {
        paddedRow.push(SpreadsheetApp.newRichTextValue().setText("").build());
    } / / 3. File Link (already RichTextValue);
    paddedRow.push(rowData[currentColumnIndex + + ]); / / 4. Created Date (already RichTextValue);
    paddedRow.push(rowData[currentColumnIndex + + ]); / / 5. Updated Date (already RichTextValue);
    paddedRow.push(rowData[currentColumnIndex + + ]);

    finalOutput.push(paddedRow);
  }); / /  - - - Write Data to Sheet - - - if (finalOutput.length > 1) { / / Check if there's data beyond the header;
    sheet.getRange(1, 1, finalOutput.length, maxColumns);
         .setRichTextValues(finalOutput); / / Use setRichTextValues for hyperlinks / /  - - - Formatting (Optional) - - -  / / Autofit columns for better readability (can be slow on very large datasets);
     try { / / Wrap in try - catch as autofit can sometimes fail
       sheet.autoResizeColumns(1, maxColumns);
     } catch (e) {
       Logger.log("Could not auto - resize columns: " + e);
     } / / Set date columns to Date format (helps with sorting)
     sheet.getRange(2, maxColumns - 1, sheet.getLastRow() - 1 , 2).setNumberFormat(dateFormat); / / Freeze Header row;
     sheet.setFrozenRows(1);

  } else { / / Only write header if no files were found but processing happened
     sheet.getRange(1, 1, 1, headerRow.length).setRichTextValues([headerRow]);
     sheet.getRange("A2").setValue("No files found in the specified folder or its subfolders.");
  }

}

/**

 * Manages files and folders

 * /

/**

 * Manages files and folders

 * /

function onOpen() {
  SpreadsheetApp.getUi();
      .createMenu('File Tree');
      .addItem('Generate File Tree', 'runFileTreeGenerator');
      .addToUi();
}

/**

 * Processes and transforms folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @param {string} pathArray - The pathArray parameter
 * @param {Object} outputData - The outputData parameter
 * @param {any} timezone - The timezone parameter
 * @param {any} dateFormat - The dateFormat parameter

 * /

/**

 * Processes and transforms folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @param {string} pathArray - The pathArray parameter
 * @param {Object} outputData - The outputData parameter
 * @param {any} timezone - The timezone parameter
 * @param {any} dateFormat - The dateFormat parameter

 * /

function processFolder(folder, pathArray, outputData, timezone, dateFormat) {
  const currentFolderName = folder.getName();
  const currentFolderUrl = folder.getUrl();
  const fullPathPrefix = pathArray.map(f = > f.getName()).join(' > '); / / Build path string / /  - - - Process Files in the current folder - - - const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const fileUrl = file.getUrl();
    const createdDate = Utilities.formatDate(file.getDateCreated(), timezone, dateFormat);
    const updatedDate = Utilities.formatDate(file.getLastUpdated(), timezone, dateFormat);

    const rowData = []; / / Column A: Full Path (String - > RichTextValue);
    rowData.push(SpreadsheetApp.newRichTextValue().setText(`${fullPathPrefix} > ${fileName}`).build()); / / Columns B, C, ...: Folder Links (RichTextValue);
    pathArray.forEach(pathFolder = > {
      rowData.push(
          SpreadsheetApp.newRichTextValue();
              .setText(pathFolder.getName());
              .setLinkUrl(pathFolder.getUrl());
              .build();
      );
    }); / / Next Column: File Link (RichTextValue)
    rowData.push(
        SpreadsheetApp.newRichTextValue();
            .setText(fileName);
            .setLinkUrl(fileUrl);
            .build();
    ); / / Next Column: Created Date (String - > RichTextValue)
    rowData.push(SpreadsheetApp.newRichTextValue().setText(createdDate).build()); / / Next Column: Updated Date (String - > RichTextValue);
    rowData.push(SpreadsheetApp.newRichTextValue().setText(updatedDate).build()); / / Add the completed row to the output;
    outputData.push(rowData);
  } / /  - - - Process Subfolders (Recursion) - - - const subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    const subFolder = subFolders.next(); / / IMPORTANT: Create a * new * path array for the recursive call;
    const newPathArray = pathArray.concat([subFolder]); / / Recursive call;
    processFolder(subFolder, newPathArray, outputData, timezone, dateFormat);
  }
}

/**

 * Executes main process

 * /

/**

 * Executes main process

 * /

function runFileTreeGenerator() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(;
      'Generate File Tree',
      'Enter the ID of the root Google Drive Folder:',
      ui.ButtonSet.OK_CANCEL); / / Process the user's response.
  if (result.getSelectedButton() = = ui.Button.OK) {
    const folderId = result.getResponseText().trim();
    if (! folderId) {
      ui.alert('Error', 'Folder ID cannot be empty.', ui.ButtonSet.OK);
      return;
    }

    try {
      const rootFolder = DriveApp.getFolderById(folderId);
      generateTree(rootFolder);
      ui.alert('Success', 'File tree generated successfully! ', ui.ButtonSet.OK);
    } catch (e) {
      Logger.log(e); / / Log the error for debugging / / Try to provide a more user - friendly error message;
      if (e.message.includes("Access denied") || e.message.includes("not found")) {
         ui.alert('Error', `Could not access folder with ID "${folderId}". Please check the ID and your permissions.`, ui.ButtonSet.OK);
      } else {
         ui.alert('Error', `An error occurred: ${e.message}`, ui.ButtonSet.OK);
      }
    }
  } else {
    ui.alert('Info', 'File tree generation cancelled.', ui.ButtonSet.OK);
  }
}