/**
  * Script Name: markdown- gmail- analysis- yaml
  *
  * Script Summary:
  * Gmails markdown content for documentation and note- taking workflows.
  *
  * Script Purpose:
  * - Generate markdown documentation
  * - Format content for note- taking systems
  * - Maintain consistent documentation structure
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Connect to Gmail service
  * 3. Access Drive file system
  * 4. Fetch source data
  * 5. Validate input data
  * 6. Process and transform data
  * 7. Format output for presentation
  * 8. Write results to destination
  *
  * Script Functions:
  * - createBracketedMarkdownFile_(): Creates new bracketed markdown file_ or resources
  * - createMarkdown_(): Creates new markdown_ or resources
  * - createMarkdownFile_(): Creates new markdown file_ or resources
  * - createPDF_(): Creates new p d f_ or resources
  * - debug(): Performs specialized operations
  * - getExistingMessageIds(): Gets specific existing message ids or configuration
  * - getOrCreateFolder_(): Gets specific or create folder_ or configuration
  * - getOrCreateSheet_(): Gets specific or create sheet_ or configuration
  * - processEmails(): Processes and transforms emails
  * - processEmailsByIds(): Processes and transforms emails by ids
  * - processMessage(): Processes and transforms message
  *
  * Script Helper Functions:
  * - parseEmailBody_(): Parses and extracts email body_
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - DriveApp: For file and folder management
  * - GmailApp: For accessing email messages and labels
  * - Logger: For logging and debugging
  * - SpreadsheetApp: For spreadsheet operations
  * - Utilities: For utility functions and encoding
  */

const DEBUG = true;

/**
  * Processes emails based on a search query
  *// * *
  * Processes specific emails by their IDs
  *// * *
  * Processes a single email message
  *// * *
  * Gets or creates a folder in Google Drive
  * @param {Folder} parentFolder - The parent folder
  * @param {string} folderName - The name of the folder to get or create
  * @returns {Folder} The existing or newly created folder
  *// * *
  * Gets or creates a sheet in the active spreadsheet
  * @param {string} sheetName - The name of the sheet to get or create
  * @returns {Sheet} The existing or newly created sheet
  *// * *
  * Gets existing message IDs from the sheet
  * @param {Sheet} sheet - The sheet to check for existing message IDs
  * @returns {Set} A set of existing message IDs
  *// * *
  * Creates a PDF file from HTML content
  * @param {string} htmlBody - The HTML content to convert to PDF
  * @param {string} filename - The name for the PDF file
  * @param {Folder} folder - The folder to save the PDF in
  * @returns {File} The created PDF file
  *// * *
  * Parses the email body and extracts relevant information
  * @param {string} body - The plain text body of the email
  * @param {Date} emailDate - The date of the email
  * @param {string} sender - The sender of the email
  * @param {string} subject - The subject of the email
  * @param {Date} dateProcessed - The date when the email was processed
  * @returns {Array} An array containing the parsed email data
  *// * *
  * Creates Markdown content from the email data
  * @param {Array} rowData - The parsed email data
  * @param {string} body - The full body of the email
  * @param {string} query - The search query used to find this email
  * @returns {string} The Markdown content
  *// * *
  * Creates a Markdown file in Google Drive
  * @param {string} markdownContent - The Markdown content
  * @param {string} filename - The name for the Markdown file
  * @param {Folder} folder - The folder to save the Markdown file in
  * @returns {File} The created Markdown file
  *// * *
  * Creates a bracketed Markdown file in Google Drive
  * @param {string} markdownContent - The Markdown content
  * @param {string} filename - The name for the Markdown file (without extension)
  * @param {Folder} folder - The folder to save the Markdown file in
  * @returns {File} The created bracketed Markdown file
  *// / Main Functions

// Main Functions

/**

  * Creates new bracketed markdown file_ or resources
  * @param
  * @param {string} markdownContent - The markdownContent for creation
  * @param {string} filename - The filename for creation
  * @param {Folder} folder - The folder for creation
  * @returns {any} The newly created any

  */

function createBracketedMarkdownFile_(markdownContent, filename, folder) {
  try {
    debug(`Creating bracketed Markdown file: [[${filename}]]`);
    let bracketedFilename = '[[' + filename + ']]';
    let file = folder.createFile(bracketedFilename + '.md', markdownContent, MimeType.PLAIN_TEXT);
    debug(`Bracketed Markdown file created successfully: [[${filename}]]`);
    return file;
  } catch (error) {
    Logger.log(`Error in createBracketedMarkdownFile_: ${error.message}`);
    throw error;
  }
}

/**

  * Creates new markdown_ or resources
  * @param
  * @param {Object} rowData - The rowData for creation
  * @param {string} body - The body content
  * @param {string} query - The search query
  * @returns {any} The newly created any

  */

function createMarkdown_(rowData, body, query) {
  try {
    debug("Creating Markdown content");
    let markdown = "- - - \n";
    markdown + = "date: " + rowData[0] + "\n";
    markdown + = "sender: " + rowData[1] + "\n";
    markdown + = "subject: " + rowData[2] + "\n";
    markdown + = "query: " + query + "\n";
    markdown + = "- - - \n\n";
    markdown + = body;
    return markdown;
  } catch (error) {
    Logger.log(`Error in createMarkdown_: ${error.message}`);
    throw error;
  }
}

/**

  * Creates new markdown file_ or resources
  * @param
  * @param {string} markdownContent - The markdownContent for creation
  * @param {string} filename - The filename for creation
  * @param {Folder} folder - The folder for creation
  * @returns {any} The newly created any

  */

function createMarkdownFile_(markdownContent, filename, folder) {
  try {
    debug(`Creating Markdown file: ${filename}`);
    let file = folder.createFile(filename + '.md', markdownContent, MimeType.PLAIN_TEXT);
    debug(`Markdown file created successfully: ${filename}`);
    return file;
  } catch (error) {
    Logger.log(`Error in createMarkdownFile_: ${error.message}`);
    throw error;
  }
}

/**

  * Creates new p d f_ or resources
  * @param
  * @param {string} htmlBody - The htmlBody for creation
  * @param {string} filename - The filename for creation
  * @param {Folder} folder - The folder for creation
  * @returns {any} The newly created any

  */

function createPDF_(htmlBody, filename, folder) {
  try {
    debug(`Creating PDF: ${filename}`);
    let blob = Utilities.newBlob(htmlBody, 'text/ html', filename + '.html');
    let pdf = folder.createFile(blob.getAs('application/ pdf')).setName(filename + '.pdf');
    debug(`PDF created successfully: ${filename}`);
    return pdf;
  } catch (error) {
    Logger.log(`Error in createPDF_: ${error.message}`);
    throw error;
  }
}

/**

  * Performs specialized operations
  * @param
  * @param {string} message - The message content
  * @returns {any} The result

  */

function debug(message) {
  if (DEBUG) {
    Logger.log(`DEBUG: ${message}`);
  }
}

/**

  * Gets specific existing message ids or configuration
  * @param
  * @param {Sheet} sheet - The sheet to retrieve
  * @returns {any} The requested any

  */

function getExistingMessageIds(sheet) {
  try {
    debug("Getting existing message IDs from sheet");
    let data = sheet.getDataRange().getValues();
    let existingIds = new Set();
    for (let i = 1; i < data.length; i+ + ) { // Start from 1 to skip header row
      existingIds.add(data[i][0]); // Assuming Message ID is in the first column
    }
    debug(`Found ${existingIds.size} existing message IDs`);
    return existingIds;
  } catch (error) {
    Logger.log(`Error in getExistingMessageIds: ${error.message}`);
    throw error;
  }
}

/**

  * Gets specific or create folder_ or configuration
  * @param
  * @param {Folder} parentFolder - The parentFolder to retrieve
  * @param {string} folderName - The folderName to retrieve
  * @returns {any} The requested any

  */

function getOrCreateFolder_(parentFolder, folderName) {
  try {
    debug(`Attempting to get or create folder: ${folderName}`);
    let folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      debug(`Existing folder found: ${folderName}`);
      return folders.next();
    } else {
      debug(`Creating new folder: ${folderName}`);
      return parentFolder.createFolder(folderName);
    }
  } catch (error) {
    Logger.log(`Error in getOrCreateFolder_: ${error.message}`);
    throw error;
  }
}

/**

  * Gets specific or create sheet_ or configuration
  * @param
  * @param {string} sheetName - The sheetName to retrieve
  * @returns {any} The requested any

  */

function getOrCreateSheet_(sheetName) {
  try {
    debug(`Attempting to get or create sheet: ${sheetName}`);
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (! sheet) {
      debug(`Creating new sheet: ${sheetName}`);
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(["Message ID", "Date", "Sender", "Subject", "Body", "Date Processed", "PDF Link", "Markdown Link", "Obsidian Link"]);
    } else {
      debug(`Existing sheet found: ${sheetName}`);
    }
    return sheet;
  } catch (error) {
    Logger.log(`Error in getOrCreateSheet_: ${error.message}`);
    throw error;
  }
}

/**

  * Processes and transforms emails
  * @param
  * @param {string} query - The search query
  * @returns {any} The result

  */

function processEmails(query) {
  try {
    if (! query) {
      throw new Error("Query is undefined");
    }
    debug(`Processing emails with query: ${query}`);

    let searchTerm = query.replace(/ [:/ ]/ g, '- '); // Replace characters not suitable for folder names
    let threads = GmailApp.search(query);
    debug(`Found ${threads.length} threads matching the query`);

    let parentFolder = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next();
    let folder = getOrCreateFolder_(parentFolder, searchTerm);
    let dateProcessed = new Date();
    let sheet = getOrCreateSheet_(searchTerm);
    let existingMessageIds = getExistingMessageIds(sheet);
    let markdownFiles = [];

    threads.forEach(function(thread, index) {
      debug(`Processing thread ${index + 1} of ${threads.length}`);
      let messages = thread.getMessages();
      messages.forEach(function(message, msgIndex) {
        debug(`Processing message ${msgIndex + 1} of ${messages.length} in thread ${index + 1}`);
        processMessage(message, existingMessageIds, dateProcessed, folder, sheet, markdownFiles, query);
      });
    });

    debug("Email processing completed successfully");
  } catch (error) {
    Logger.log(`Error in processEmails: ${error.message}`);
    throw error; // Re- throw the error for higher- level error handling
  }
}

/**

  * Processes and transforms emails by ids
  * @param
  * @param {string} messageIds - The messageIds parameter
  * @returns {any} The result

  */

function processEmailsByIds(messageIds) {
  try {
    if (! Array.isArray(messageIds) || messageIds.length = = = 0) {
      throw new Error("Invalid or empty messageIds array");
    }
    debug(`Processing ${messageIds.length} emails by IDs`);

    let searchTerm = 'selected- emails'; // Use a generic name for the folder and sheet
    let parentFolder = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next();
    let folder = getOrCreateFolder_(parentFolder, searchTerm);
    let dateProcessed = new Date();
    let sheet = getOrCreateSheet_(searchTerm);
    let existingMessageIds = getExistingMessageIds(sheet);
    let markdownFiles = [];

    messageIds.forEach(function(messageId, index) {
      debug(`Processing message ${index + 1} of ${messageIds.length}`);
      let message = GmailApp.getMessageById(messageId);
      if (! message) {
        Logger.log(`Warning: Message with ID ${messageId} not found`);
        return;
      }
      processMessage(message, existingMessageIds, dateProcessed, folder, sheet, markdownFiles, 'selected- emails');
    });

    debug("Email processing by IDs completed successfully");
  } catch (error) {
    Logger.log(`Error in processEmailsByIds: ${error.message}`);
    throw error; // Re- throw the error for higher- level error handling
  }
}

/**

  * Processes and transforms message
  * @param
  * @param {string} message - The message content
  * @param {string} existingMessageIds - The existingMessageIds parameter
  * @param {any} dateProcessed - The dateProcessed parameter
  * @param {Folder} folder - The folder parameter
  * @param {Sheet} sheet - The sheet parameter
  * @param {File} markdownFiles - The markdownFiles parameter
  * @param {string} query - The search query
  * @returns {any} The result

  */

function processMessage(message, existingMessageIds, dateProcessed, folder, sheet, markdownFiles, query) {
  try {
    let messageId = message.getId();
    if (existingMessageIds.has(messageId)) {
      debug(`Skipping already processed message: ${messageId}`);
      return; // Skip this message if it has already been processed
    }

    let emailDate = message.getDate();
    let sender = message.getFrom();
    let subject = message.getSubject();
    let body = message.getPlainBody();
    let htmlBody = message.getBody();

    if (! body || ! htmlBody) {
      throw new Error(`Email body is undefined for subject: ${subject}`);
    }

    let filename = Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy- MM- dd') + ' - Kevin Lappe - ' + sender + ' - ' + subject + ' - ' + Utilities.formatDate(dateProcessed, Session.getScriptTimeZone(), 'yyyy- MM- dd');

    debug(`Creating PDF for message: ${messageId}`);
    let pdfFile = createPDF_(htmlBody, filename, folder);

    debug(`Parsing email body for message: ${messageId}`);
    let rowData = parseEmailBody_(body, emailDate, sender, subject, dateProcessed);

    debug(`Creating Markdown content for message: ${messageId}`);
    let markdownContent = createMarkdown_(rowData, body, query);

    debug(`Creating Markdown file for message: ${messageId}`);
    let markdownFile = createMarkdownFile_(markdownContent, filename, folder);

    debug(`Creating bracketed Markdown file for message: ${messageId}`);
    let bracketedFilename = filename.replace('.md', '');
    let bracketedMarkdownFile = createBracketedMarkdownFile_(markdownContent, bracketedFilename, folder);

    markdownFiles.push(markdownFile);

    rowData.push('= HYPERLINK("' + pdfFile.getUrl() + '", "PDF link")');
    rowData.push('= HYPERLINK("' + markdownFile.getUrl() + '", "Markdown file link")');
    rowData.push('[[' + bracketedFilename + ']]');
    rowData.unshift(messageId);

    debug(`Appending row to sheet for message: ${messageId}`);
    sheet.appendRow(rowData);

    debug(`Successfully processed message: ${messageId}`);
  } catch (error) {
    Logger.log(`Error processing message ${message.getId()}: ${error.message}`);
    // Continue processing other messages
  }
}

// Helper Functions

/**

  * Parses and extracts email body_
  * @param
  * @param {string} body - The body content
  * @param {string} emailDate - The emailDate parameter
  * @param {any} sender - The sender parameter
  * @param {string} subject - The subject line
  * @param {any} dateProcessed - The dateProcessed parameter
  * @returns {any} The result

  */

function parseEmailBody_(body, emailDate, sender, subject, dateProcessed) {
  try {
    debug("Parsing email body");
    // Implement your parsing logic here
    // This is a placeholder implementation
    return [
      Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy- MM- dd HH:mm:ss'),
      sender,
      subject,
      body.substring(0, 100) + "...", // First 100 characters of the body
      Utilities.formatDate(dateProcessed, Session.getScriptTimeZone(), 'yyyy- MM- dd HH:mm:ss')
    ];
  } catch (error) {
    Logger.log(`Error in parseEmailBody_: ${error.message}`);
    throw error;
  }
}