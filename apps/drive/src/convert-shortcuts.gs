/**
  * Script Name: convert- shortcuts
  *
  * Script Summary:
  * Creates files for automated workflow processing.
  *
  * Script Purpose:
  *
  * Script Steps:
  * 1. Access Drive file system
  * 2. Fetch source data
  * 3. Execute main operation
  * 4. Handle errors and edge cases
  * 5. Log completion status
  *
  * Script Functions:
  * - organizeShortcuts(): Manages files and folders
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - DriveApp: For file and folder management
  * - Logger: For logging and debugging
  */

// Main Functions

/**

  * Manages files and folders

  */

/**

  * Manages files and folders

  */

function organizeShortcuts() {
  const shortcutMimeType = 'application / vnd.google - apps.shortcut';
  const shortcutsFolderName = '_shortcuts';

  let shortcutsFolder;
  try {
    shortcutsFolder = DriveApp.getFoldersByName(shortcutsFolderName).next();
  } catch (error) {
    if (error.message = = = 'Cannot retrieve the next object: iterator has reached the end.') {
      Logger.log('Creating "_shortcuts" folder as it does not exist.');
      shortcutsFolder = DriveApp.createFolder(shortcutsFolderName);
    } else {
      Logger.log('An error occurred while getting the "_shortcuts" folder: ' + error);
      return; // Stop execution if there's another unexpected error;
    }
  }

  const filesIterator = DriveApp.getFilesByType(shortcutMimeType);
  while (filesIterator.hasNext()) {
    const file = filesIterator.next();
    if (file.getParents().hasNext()) {
      file.moveTo(shortcutsFolder);
      Logger.log('Moved shortcut: ' + file.getName());
    } else {
      Logger.log('Shortcut already in "_shortcuts" folder: ' + file.getName());
    }
  }

  Logger.log('Shortcut organization completed.');
}