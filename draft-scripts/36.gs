/**
 * Google Drive Folder and File Index Generator
 * Recursively indexes all folders and files in a specified Google Drive folder
 * Uses numbered columns and includes file type
 * @OnlyCurrentDoc
 * @see https://www.googleapis.com/auth/drive.readonly
 * @see https://www.googleapis.com/auth/spreadsheets
 */

const FOLDER_ID = '1g1OKSiAhipA1LpFtVDruP-kyTF6qgAVy'; // Replace with the target Google Drive folder ID

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Folder Index')
      .addItem('Generate Folder Index', 'generateFolderIndex')
      .addToUi();
    Logger.log('Custom menu created successfully');
  } catch (error) {
    Logger.log('Error in onOpen: ' + error.message);
  }
}

function generateFolderIndex() {
  Logger.log('Starting folder and file index generation');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'FolderIndex_' + new Date().toISOString().slice(0, 10);
  let sheet;

  try {
    sheet = ss.insertSheet(sheetName);
  } catch (e) {
    for (let i = 1; i <= 10; i++) {
      try {
        sheet = ss.insertSheet(sheetName + '_' + i);
        break;
      } catch (e2) {
        if (i === 10) {
          SpreadsheetApp.getUi().alert("Couldn't create a new sheet. Please delete some sheets and try again.");
          Logger.log('Failed to create sheet after 10 attempts');
          return;
        }
      }
    }
  }

  sheet.getRange("A1").setValue("Processing folders and files... started at " + new Date().toLocaleString());
  SpreadsheetApp.flush();

  const itemPaths = [];
  const COLUMN_WIDTH = 300;
  let maxDepth = 0;

  try {
    if (!DriveApp) {
      throw new Error("DriveApp service is not available");
    }
    const startFolder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log('Processing folder: ' + startFolder.getName());
    
    processFolder(startFolder, [], itemPaths);
    Logger.log('Processed folder ID: ' + FOLDER_ID);

    itemPaths.forEach(path => {
      maxDepth = Math.max(maxDepth, path.length);
    });

    const headers = Array.from({length: maxDepth}, (_, i) => (i + 1).toString()).concat(['Type']);
    sheet.getRange(2, 1, 1, headers.length).setValues([headers]);

    const output = itemPaths.map(path => {
      const row = new Array(maxDepth).fill('');
      const item = path[path.length - 1];
      path.forEach((obj, i) => {
        if (i < path.length) {
          const safeName = obj.name.replace(/"/g, '""');
          const url = obj.type === 'folder' 
            ? `https://drive.google.com/drive/folders/${obj.id}`
            : `https://drive.google.com/file/d/${obj.id}`;
          row[i] = `=HYPERLINK("${url}", "${safeName}")`;
        }
      });
      row[maxDepth] = item.type;
      return row;
    });

    if (output.length > 0) {
      sheet.getRange(3, 1, output.length, maxDepth + 1).setValues(output);
    } else {
      sheet.getRange(3, 1).setValue("No folders or files found");
    }

    for (let i = 1; i <= maxDepth; i++) {
      sheet.setColumnWidth(i, COLUMN_WIDTH);
    }
    sheet.setColumnWidth(maxDepth + 1, 100);

    sheet.getRange("A1").setValue("Folder and file index completed at " + new Date().toLocaleString() + 
                                 " - Total items: " + itemPaths.length);
    Logger.log('Index completed successfully. Total items: ' + itemPaths.length);

  } catch (error) {
    sheet.getRange("A1").setValue("ERROR: " + error.message);
    sheet.getRange("A2").setValue("Stack: " + error.stack);
    Logger.log('Error in generateFolderIndex: ' + error.message + '\nStack: ' + error.stack);
  }

  SpreadsheetApp.getUi().alert("Folder and file indexing completed. Check the new sheet for results.");
}

function processFolder(folder, currentPath, allPaths) {
  try {
    const folderObj = { 
      name: folder.getName(), 
      id: folder.getId(),
      type: 'folder'
    };
    
    const newPath = [...currentPath, folderObj];
    allPaths.push(newPath);
    
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const fileObj = {
        name: file.getName(),
        id: file.getId(),
        type: 'file'
      };
      allPaths.push([...currentPath, folderObj, fileObj]);
    }
    
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      processFolder(subfolder, newPath, allPaths);
    }
  } catch (e) {
    Logger.log('Error processing folder: ' + folder.getName() + ' - ' + e.message);
  }
}