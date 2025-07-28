/**
 * Script Name: find- docs- by- alias
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Fetch source data
 * 3. Validate input data
 * 4. Apply filters and criteria
 * 5. Format output for presentation
 * 6. Send notifications or reports
 *
 * Script Functions:
 * - checkDriveApiAuthorization(): Checks conditions or status
 * - checkIfFilesFound(): Checks conditions or status
 * - createOrGetOutputSheet(): Gets specific create or output sheet or configuration
 * - findAndPrintDocs(): Finds matching and print docs
 * - printResultsToSheet(): Manages files and folders
 * - promptForOwnerEmail(): Performs specialized operations
 * - searchOwnedFiles(): Searches for specific owned files
 * - searchSharedFiles(): Searches for specific shared files
 *
 * Script Helper Functions:
 * - filterFilesByOwner(): Filters files by owner by criteria
 * - getCharacterCount(): Gets specific character count or configuration
 * - getWordCount(): Gets specific word count or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DocumentApp: For document manipulation
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

// Main Functions

/**

 * Checks conditions or status
 * @returns {string} The formatted string

 */

/**

 * Checks conditions or status
 * @returns {string} The formatted string

 */

function checkDriveApiAuthorization() {
  if (! Drive.Files) {
    throw new Error("Drive API is not authorized. Please enable it in the project settings.");
  }
}

/**

 * Checks conditions or status
 * @param
 * @param {File} filteredFiles - The filteredFiles parameter
 * @returns {string} The formatted string

 */

/**

 * Checks conditions or status
 * @param
 * @param {File} filteredFiles - The filteredFiles parameter
 * @returns {string} The formatted string

 */

function checkIfFilesFound(filteredFiles) {
  if (filteredFiles.length = = = 0) {
    Browser.msgBox("No Google Docs found matching the criteria.");
    throw new Error("No files found."); // Throw an error to stop execution;
  }
}

/**

 * Gets specific create or output sheet or configuration
 * @param
 * @param {string} ownerEmails - The ownerEmails to retrieve
 * @returns {string} The requested string

 */

/**

 * Gets specific create or output sheet or configuration
 * @param
 * @param {string} ownerEmails - The ownerEmails to retrieve
 * @returns {string} The requested string

 */

function createOrGetOutputSheet(ownerEmails) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (! ss) {
    ss = SpreadsheetApp.create("Doc Finder Results");
  }

  let usernames = ownerEmails.map(function (email) {
    return email.split("@")[0];
  }).join(", ");

  let sheetName = Utilities.formatDate(new Date(), "GMT", "yyyy - MM - dd") + " - " + usernames;
  let sheet = ss.getSheetByName(sheetName);
  if (! sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["File Name", "Link", "Owner(s)", "Created Date", "Modified Date", "Word Count", "Character Count"]);
  }

  return sheet;
}

/**

 * Finds matching and print docs
 * @returns {string} The formatted string

 */

/**

 * Finds matching and print docs
 * @returns {string} The formatted string

 */

function findAndPrintDocs() {
  try { // 1. Prompt for the owner's email addresses
    let ownerEmails = promptForOwnerEmail(); // 2. Check if the Drive API is authorized;
    checkDriveApiAuthorization(); // 3. Perform separate searches for owned and shared files;
    let ownedFiles = searchOwnedFiles(ownerEmails);
    let sharedFiles = searchSharedFiles(); // 4. Combine and filter results;
    let filteredFiles = filterFilesByOwner(ownedFiles.files, sharedFiles.files, ownerEmails); // 5. Create or get the output spreadsheet;
    let sheet = createOrGetOutputSheet(ownerEmails); // 6. Check if any files were found after filtering;
    checkIfFilesFound(filteredFiles); // 7. Iterate through the filtered files and output to the spreadsheet;
    printResultsToSheet(filteredFiles, sheet);

    Browser.msgBox("Results have been printed to the sheet: " + sheet.getName());

  } catch (error) {
    Browser.msgBox("An error occurred: " + error.message);
    console.error(error);
  }
}

/**

 * Manages files and folders
 * @param
 * @param {File} filteredFiles - The filteredFiles parameter
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 */

/**

 * Manages files and folders
 * @param
 * @param {File} filteredFiles - The filteredFiles parameter
 * @param {Sheet} sheet - The sheet parameter
 * @returns {string} The formatted string

 */

function printResultsToSheet(filteredFiles, sheet) {
  for (let i = 0; i < filteredFiles.length; i + + ) {
    let file = filteredFiles[i];
    let fileName = file.name;
    let fileUrl = file.webViewLink;

    let ownerAliases = file.owners.map(function (owner) {
      return owner.displayName;
    }).join(", ");

    let formattedCreatedDate = Utilities.formatDate(new Date(file.createdTime), "GMT", "yyyy - MM - dd");
    let formattedModifiedDate = Utilities.formatDate(new Date(file.modifiedTime), "GMT", "yyyy - MM - dd");

    let doc = DocumentApp.openById(file.id);
    let docContent = doc.getBody().getText();

    let wordCount = getWordCount(docContent);
    let charCount = getCharacterCount(docContent);

    sheet.appendRow([fileName, fileUrl, ownerAliases, formattedCreatedDate, formattedModifiedDate, wordCount, charCount]);
  }
}

/**

 * Performs specialized operations
 * @returns {string} The formatted string

 */

/**

 * Performs specialized operations
 * @returns {string} The formatted string

 */

function promptForOwnerEmail() {
  let ownerEmailsInput = Browser.inputBox("Enter the owner's email addresses (comma - separated):"); // Validate and split email input;
  if (! ownerEmailsInput) {
    throw new Error("Please enter at least one email address.");
  }

  let ownerEmails = ownerEmailsInput.split(",").map(function (email) {
    return email.trim();
  }); // Validate each email
  for (let i = 0; i < ownerEmails.length; i + + ) {
    if (! ownerEmails[i].includes("@")) {
      throw new Error("Please enter valid email addresses, separated by commas.");
    }
  }

  return ownerEmails;
}

/**

 * Searches for specific owned files
 * @param
 * @param {string} ownerEmails - The ownerEmails parameter
 * @returns {string} The formatted string

 */

/**

 * Searches for specific owned files
 * @param
 * @param {string} ownerEmails - The ownerEmails parameter
 * @returns {string} The formatted string

 */

function searchOwnedFiles(ownerEmails) { // Construct the query to search for files owned by any of the provided emails
  let queryParts = ownerEmails.map(function (email) {
    return "'" + email + "' in owners";
  });
  let query = "mimeType = 'application / vnd.google - apps.document' and (" + queryParts.join(" or ") + ")";
  Logger.log("Drive API Query (owned files):", query);

  let files = Drive.Files.list({
    q: query,
    fields: "nextPageToken, files(id, name, owners, webViewLink, createdTime, modifiedTime)"
  });

  if (files.error) {
    throw new Error("Drive API Error (owned files): " + files.error.message);
  }

  return files;
}

/**

 * Searches for specific shared files
 * @returns {string} The formatted string

 */

/**

 * Searches for specific shared files
 * @returns {string} The formatted string

 */

function searchSharedFiles() { // Use 'sharedWithMe' to find files shared with the user
  let query = "mimeType = 'application / vnd.google - apps.document' and sharedWithMe";
  Logger.log("Drive API Query (shared files):", query);

  try {
    let files = Drive.Files.list({
      q: query,
      fields: "nextPageToken, files(id, name, owners, webViewLink, createdTime, modifiedTime)"
    }); // Log the raw API response for deeper inspection if needed
    Logger.log("Raw API Response (shared files):", files);

    if (files.error) {
      throw new Error("Drive API Error (shared files): " + files.error.message);
    }

    return files;
  } catch (error) { // Handle potential errors during the API call itself
    console.error("Error while searching for shared files:", error);
    throw error; // Re - throw the error to be handled by the main try...catch;
  }
}

// Helper Functions

/**

 * Filters files by owner by criteria
 * @param
 * @param {File} ownedFiles - The ownedFiles parameter
 * @param {File} sharedFiles - The sharedFiles parameter
 * @param {string} ownerEmails - The ownerEmails parameter
 * @returns {string} The formatted string

 */

/**

 * Filters files by owner by criteria
 * @param
 * @param {File} ownedFiles - The ownedFiles parameter
 * @param {File} sharedFiles - The sharedFiles parameter
 * @param {string} ownerEmails - The ownerEmails parameter
 * @returns {string} The formatted string

 */

function filterFilesByOwner(ownedFiles, sharedFiles, ownerEmails) {
  let allFiles = ownedFiles.concat(sharedFiles);
  return allFiles.filter(function (file) {
    return file.owners.some(function (owner) {
      return ownerEmails.includes(owner.emailAddress);
    });
  });
}

/**

 * Gets specific character count or configuration
 * @param
 * @param {string} text - The text content
 * @returns {string} The requested string

 */

/**

 * Gets specific character count or configuration
 * @param
 * @param {string} text - The text content
 * @returns {string} The requested string

 */

function getCharacterCount(text) {
  return text.length;
}

/**

 * Gets specific word count or configuration
 * @param
 * @param {string} text - The text content
 * @returns {string} The requested string

 */

/**

 * Gets specific word count or configuration
 * @param
 * @param {string} text - The text content
 * @returns {string} The requested string

 */

function getWordCount(text) {
  return text.split( / \s +  / ).filter(function (word) { return word ! = = ""; }).length;
}