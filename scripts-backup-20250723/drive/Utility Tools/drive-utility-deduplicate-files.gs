/**
 * Main function to process folders from the 'folderIDs' tab
 */
function removeDuplicateFiles() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const folderSheet = ss.getSheetByName('folderIDs');
    if (!folderSheet) {
      console.error('Sheet "folderIDs" not found.');
      SpreadsheetApp.getUi().alert('Error', 'Sheet "folderIDs" not found.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }

    const logSheet = ss.getSheetByName('Log') || ss.insertSheet('Log');
    logSheet.clear();
    logSheet.appendRow(['Timestamp', 'Action', 'File Name', 'File ID', 'File Size (Bytes)']);

    // Get folder data from folderIDs sheet
    const data = folderSheet.getDataRange().getValues();
    const TIME_LIMIT = 6 * 60 * 1000; // 6 minutes in milliseconds
    const BUFFER = 30 * 1000; // 30 seconds buffer
    const startTime = Date.now();
    let foldersProcessed = 0;

    // Process each folder with unchecked status
    for (let i = 1; i < data.length; i++) { // Skip header row
      if (Date.now() - startTime > TIME_LIMIT - BUFFER) {
        console.log('Approaching time limit. Scheduling trigger for remaining folders.');
        createTrigger();
        break;
      }

      const isChecked = data[i][0]; // Checkbox in Column A
      if (isChecked === false) { // Process only unchecked folders
        const folderName = data[i][1]; // Column B
        const folderId = data[i][2]; // Column C
        if (!folderId) {
          console.warn(`Skipping row ${i + 1}: Invalid folder ID.`);
          continue;
        }

        console.log(`Processing folder: ${folderName} (ID: ${folderId})`);
        const duplicatesCount = processFolder(folderId, logSheet);

        // Update folderIDs sheet
        folderSheet.getRange(i + 1, 1).setValue(true); // Check the box
        folderSheet.getRange(i + 1, 4).setValue(duplicatesCount); // Column D: duplicates removed
        console.log(`Completed folder: ${folderName}. Duplicates removed: ${duplicatesCount}`);

        foldersProcessed++;
      }
    }

    // Log completion
    const summary = foldersProcessed > 0 
      ? `Processed ${foldersProcessed} folder(s).`
      : 'No unprocessed folders found.';
    console.log(summary);
    logSheet.getRange(logSheet.getLastRow() + 1, 1, 1, 3).setValues([[new Date(), 'Summary', summary]]);
    SpreadsheetApp.getUi().alert('Process Complete', summary, SpreadsheetApp.getUi().ButtonSet.OK);

  } catch (e) {
    console.error(`Error: ${e.message}`);
    SpreadsheetApp.getUi().alert('Error', `An error occurred: ${e.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Process a single folder and return the number of duplicates removed
 * @param {string} folderId - The ID of the folder to process
 * @param {Sheet} logSheet - The sheet to log results
 * @returns {number} - Number of duplicates removed
 */
function processFolder(folderId, logSheet) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileMap = new Map();
    const duplicates = [];
    const logRows = [];

    // Collect file metadata
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const fileSize = file.getSize();
      const fileId = file.getId();
      const key = `${fileName}|${fileSize}`;

      if (fileMap.has(key)) {
        duplicates.push({ fileId, fileName, fileSize });
      } else {
        fileMap.set(key, { fileId, fileName, fileSize });
      }
    }

    // Log duplicates
    const timestamp = new Date();
    duplicates.forEach(duplicate => {
      logRows.push([
        timestamp,
        'Deleted Duplicate',
        duplicate.fileName,
        duplicate.fileId,
        duplicate.fileSize
      ]);
    });

    // Batch trash duplicates
    duplicates.forEach(duplicate => {
      try {
        DriveApp.getFileById(duplicate.fileId).setTrashed(true);
      } catch (e) {
        logRows.push([
          timestamp,
          'Error Deleting',
          duplicate.fileName,
          duplicate.fileId,
          `Error: ${e.message}`
        ]);
      }
    });

    // Write logs to sheet
    if (logRows.length > 0) {
      logSheet.getRange(logSheet.getLastRow() + 1, 1, logRows.length, logRows[0].length).setValues(logRows);
    }

    return duplicates.length;

  } catch (e) {
    console.error(`Error processing folder ${folderId}: ${e.message}`);
    logSheet.getRange(logSheet.getLastRow() + 1, 1, 1, 3).setValues([
      [new Date(), 'Error', `Folder ${folderId}: ${e.message}`]
    ]);
    return 0;
  }
}

/**
 * Create a one-time trigger to resume processing
 */
function createTrigger() {
  // Delete existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Create a new trigger to run in 5 minutes
  ScriptApp.newTrigger('removeDuplicateFiles')
    .timeBased()
    .after(5 * 60 * 1000) // 5 minutes
    .create();
}