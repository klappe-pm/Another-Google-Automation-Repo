function findAndPrintDocs() {
  try {
    // 1. Prompt for the owner's email addresses
    var ownerEmails = promptForOwnerEmail();

    // 2. Check if the Drive API is authorized
    checkDriveApiAuthorization();

    // 3. Perform separate searches for owned and shared files
    var ownedFiles = searchOwnedFiles(ownerEmails);
    var sharedFiles = searchSharedFiles();

    // 4. Combine and filter results
    var filteredFiles = filterFilesByOwner(ownedFiles.files, sharedFiles.files, ownerEmails);

    // 5. Create or get the output spreadsheet
    var sheet = createOrGetOutputSheet(ownerEmails);

    // 6. Check if any files were found after filtering
    checkIfFilesFound(filteredFiles);

    // 7. Iterate through the filtered files and output to the spreadsheet
    printResultsToSheet(filteredFiles, sheet);

    Browser.msgBox("Results have been printed to the sheet: " + sheet.getName());

  } catch (error) {
    Browser.msgBox("An error occurred: " + error.message);
    console.error(error);
  }
}

function promptForOwnerEmail() {
  var ownerEmailsInput = Browser.inputBox("Enter the owner's email addresses (comma-separated):");

  // Validate and split email input 
  if (!ownerEmailsInput) {
    throw new Error("Please enter at least one email address.");
  }

  var ownerEmails = ownerEmailsInput.split(",").map(function(email) {
    return email.trim(); 
  });

  // Validate each email 
  for (var i = 0; i < ownerEmails.length; i++) {
    if (!ownerEmails[i].includes("@")) {
      throw new Error("Please enter valid email addresses, separated by commas.");
    }
  }

  return ownerEmails; 
}

function checkDriveApiAuthorization() {
  if (!Drive.Files) {
    throw new Error("Drive API is not authorized. Please enable it in the project settings.");
  }
}

function searchOwnedFiles(ownerEmails) {
  // Construct the query to search for files owned by any of the provided emails
  var queryParts = ownerEmails.map(function(email) {
    return "'" + email + "' in owners";
  });
  var query = "mimeType = 'application/vnd.google-apps.document' and (" + queryParts.join(" or ") + ")";
  console.log("Drive API Query (owned files):", query); 

  var files = Drive.Files.list({
    q: query,
    fields: "nextPageToken, files(id, name, owners, webViewLink, createdTime, modifiedTime)" 
  });

  if (files.error) {
    throw new Error("Drive API Error (owned files): " + files.error.message);
  }

  return files;
}

function searchSharedFiles() {
  // Use 'sharedWithMe' to find files shared with the user
  var query = "mimeType = 'application/vnd.google-apps.document' and sharedWithMe"; 
  console.log("Drive API Query (shared files):", query); 

  try {
    var files = Drive.Files.list({
      q: query,
      fields: "nextPageToken, files(id, name, owners, webViewLink, createdTime, modifiedTime)" 
    });

    // Log the raw API response for deeper inspection if needed
    console.log("Raw API Response (shared files):", files);

    if (files.error) {
      throw new Error("Drive API Error (shared files): " + files.error.message);
    }

    return files;
  } catch (error) {
    // Handle potential errors during the API call itself
    console.error("Error while searching for shared files:", error);
    throw error; // Re-throw the error to be handled by the main try...catch
  }
}

function filterFilesByOwner(ownedFiles, sharedFiles, ownerEmails) {
  var allFiles = ownedFiles.concat(sharedFiles);
  return allFiles.filter(function(file) {
    return file.owners.some(function(owner) {
      return ownerEmails.includes(owner.emailAddress); 
    });
  });
}

function createOrGetOutputSheet(ownerEmails) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.create("Doc Finder Results");
  }

  var usernames = ownerEmails.map(function(email) {
    return email.split("@")[0]; 
  }).join(", "); 

  var sheetName = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd") + " - " + usernames;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["File Name", "Link", "Owner(s)", "Created Date", "Modified Date", "Word Count", "Character Count"]);
  }

  return sheet;
}

function getWordCount(text) {
  return text.split(/\s+/).filter(function(word) { return word !== ""; }).length;
}

function getCharacterCount(text) {
  return text.length;
}

function checkIfFilesFound(filteredFiles) {
  if (filteredFiles.length === 0) {
    Browser.msgBox("No Google Docs found matching the criteria.");
    throw new Error("No files found."); // Throw an error to stop execution
  }
}

function printResultsToSheet(filteredFiles, sheet) {
  for (var i = 0; i < filteredFiles.length; i++) {
    var file = filteredFiles[i];
    var fileName = file.name;
    var fileUrl = file.webViewLink;

    var ownerAliases = file.owners.map(function(owner) {
      return owner.displayName;
    }).join(", "); 

    var formattedCreatedDate = Utilities.formatDate(new Date(file.createdTime), "GMT", "yyyy-MM-dd");
    var formattedModifiedDate = Utilities.formatDate(new Date(file.modifiedTime), "GMT", "yyyy-MM-dd");

    var doc = DocumentApp.openById(file.id);
    var docContent = doc.getBody().getText();

    var wordCount = getWordCount(docContent);
    var charCount = getCharacterCount(docContent);

    sheet.appendRow([fileName, fileUrl, ownerAliases, formattedCreatedDate, formattedModifiedDate, wordCount, charCount]);
  }
}
