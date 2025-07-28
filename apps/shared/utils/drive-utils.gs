/**
  * Script Name: drive-utils
  *
  * Script Summary:
  * Shared utility functions for Google Drive operations in Google Apps Script.
  *
  * Script Purpose:
  * - Create and manage folder structures
  * - Handle file operations with error recovery
  * - Provide consistent Drive API usage across all scripts
  *
  * Script Functions:
  * - getOrCreateFolder(): Get existing or create new folder
  * - createFolderStructure(): Create nested folder structure
  * - safeCreateFile(): Create file with retry logic
  * - findFolderByPath(): Find folder by path
  * - moveFile(): Move file between folders
  * - copyFile(): Copy file to another location
  * - getFolderPath(): Get full path of a folder
  * - deleteEmptyFolders(): Clean up empty folders
  *
  * Script Dependencies:
  * - error-utils.gs (for safeOperation function when available)
  *
  * Google Services:
  * - DriveApp: For file and folder operations
  */

/**
  * Gets an existing folder or creates it if it doesn't exist
  * @param {string} folderName - Name of the folder
  * @param {Folder} parentFolder - Parent folder (optional, defaults to root)
  * @returns {Folder} The folder object
  */
function getOrCreateFolder(folderName, parentFolder) {
  try {
    const parent = parentFolder || DriveApp.getRootFolder();
    const folders = parent.getFoldersByName(folderName);

    if (folders.hasNext()) {
      return folders.next();
    }

    // Create new folder
    return parent.createFolder(folderName);
  } catch (error) {
    Logger.log(`Error in getOrCreateFolder: ${error.toString()}`);
    throw error;
  }
}

/**
  * Creates a nested folder structure based on configuration
  * @param {Object} config - Folder structure configuration
  * @param {Folder} rootFolder - Root folder for the structure
  * @returns {Object} Object mapping folder names to Folder objects
  */
function createFolderStructure(config, rootFolder) {
  const folders = {};
  const root = rootFolder || DriveApp.getRootFolder();

  /**
    * Recursive function to create nested folders
    */
  function createNested(parentFolder, structure, path) {
    for (const folderName in structure) {
      const folder = getOrCreateFolder(folderName, parentFolder);
      const fullPath = path ? `${path}/${folderName}` : folderName;
      folders[fullPath] = folder;

      // Recursively create subfolders
      if (typeof structure[folderName] === 'object' && structure[folderName] !== null) {
        createNested(folder, structure[folderName], fullPath);
      }
    }
  }

  createNested(root, config, '');
  return folders;
}

/**
  * Creates a file with retry logic for handling errors
  * @param {Folder} folder - The folder to create the file in
  * @param {Blob} blob - The file blob to create
  * @param {number} maxRetries - Maximum number of retry attempts
  * @returns {File} The created file object
  */
function safeCreateFile(folder, blob, maxRetries = 3) {
  let lastError;
  let delay = 1000; // Start with 1 second delay

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return folder.createFile(blob);
    } catch (error) {
      lastError = error;
      Logger.log(`Attempt ${attempt + 1} failed: ${error.toString()}`);

      if (attempt < maxRetries - 1) {
        Utilities.sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw new Error(`Failed to create file after ${maxRetries} attempts: ${lastError.toString()}`);
}

/**
  * Finds a folder by its path
  * @param {string} path - The folder path (e.g., "Parent/Child/Grandchild")
  * @param {Folder} rootFolder - Starting folder (optional)
  * @returns {Folder|null} The folder if found, null otherwise
  */
function findFolderByPath(path, rootFolder) {
  try {
    const parts = path.split('/').filter(Boolean);
    let currentFolder = rootFolder || DriveApp.getRootFolder();

    for (const folderName of parts) {
      const folders = currentFolder.getFoldersByName(folderName);
      if (!folders.hasNext()) {
        return null;
      }
      currentFolder = folders.next();
    }

    return currentFolder;
  } catch (error) {
    Logger.log(`Error finding folder by path: ${error.toString()}`);
    return null;
  }
}

/**
  * Moves a file from one folder to another
  * @param {File} file - The file to move
  * @param {Folder} targetFolder - The destination folder
  * @returns {boolean} True if successful
  */
function moveFile(file, targetFolder) {
  try {
    // Get current parents
    const parents = file.getParents();

    // Add to target folder
    targetFolder.addFile(file);

    // Remove from all current parents
    while (parents.hasNext()) {
      const parent = parents.next();
      parent.removeFile(file);
    }

    return true;
  } catch (error) {
    Logger.log(`Error moving file: ${error.toString()}`);
    return false;
  }
}

/**
  * Copies a file to another folder
  * @param {File} file - The file to copy
  * @param {Folder} targetFolder - The destination folder
  * @param {string} newName - New name for the copy (optional)
  * @returns {File|null} The copied file or null if failed
  */
function copyFile(file, targetFolder, newName) {
  try {
    const copy = file.makeCopy(newName || file.getName(), targetFolder);
    return copy;
  } catch (error) {
    Logger.log(`Error copying file: ${error.toString()}`);
    return null;
  }
}

/**
  * Gets the full path of a folder
  * @param {Folder} folder - The folder to get the path for
  * @returns {string} The full path from root
  */
function getFolderPath(folder) {
  const path = [];
  let currentFolder = folder;

  while (currentFolder) {
    path.unshift(currentFolder.getName());
    const parents = currentFolder.getParents();

    if (parents.hasNext()) {
      currentFolder = parents.next();
      // Stop at root folder
      if (currentFolder.getId() === DriveApp.getRootFolder().getId()) {
        break;
      }
    } else {
      break;
    }
  }

  return path.join('/');
}

/**
  * Deletes empty folders recursively
  * @param {Folder} folder - The folder to check and potentially delete
  * @param {boolean} deleteRoot - Whether to delete the root folder if empty
  * @returns {boolean} True if folder was deleted
  */
function deleteEmptyFolders(folder, deleteRoot = false) {
  try {
    // Check subfolders first
    const subfolders = folder.getFolders();
    const subfoldersToDelete = [];

    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      if (deleteEmptyFolders(subfolder, true)) {
        subfoldersToDelete.push(subfolder);
      }
    }

    // Check if folder is empty
    const hasFiles = folder.getFiles().hasNext();
    const hasRemainingFolders = folder.getFolders().hasNext();

    if (!hasFiles && !hasRemainingFolders && deleteRoot) {
      folder.setTrashed(true);
      return true;
    }

    return false;
  } catch (error) {
    Logger.log(`Error deleting empty folders: ${error.toString()}`);
    return false;
  }
}

/**
  * Creates a folder structure configuration object
  * @param {Object} structure - The structure definition
  * @returns {Object} Formatted configuration for createFolderStructure
  */
function createFolderConfig(structure) {
  return structure;
}