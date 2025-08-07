/**
 * Title: Gmail Email Processing with Markdown & PDF Export (V2)
 * Service: Gmail + Google Drive + Google Sheets
 * Purpose: Process Gmail messages to create PDF/Markdown files and log metadata
 * Created: 2023-01-01
 * Updated: 2025-07-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 *
 * Script Summary:
 * - This script processes Gmail messages based on search queries or specific message IDs
 * - Creates PDF and Markdown versions of emails with YAML frontmatter
 * - Stores files in Google Drive and logs metadata in Google Sheets
 * - Supports both query-based and ID-based email processing
 *
 * Key Features:
 * 1. Dual processing modes: query-based and ID-based email selection
 * 2. PDF generation from HTML email content
 * 3. Markdown files with YAML frontmatter
 * 4. Bracketed markdown files for Obsidian compatibility
 * 5. Comprehensive error handling and debug logging
 * 6. Duplicate message detection and skipping
 * 7. Organized file storage in Drive folders
 * 8. Spreadsheet logging with hyperlinks
 *
 * Functions:
 * - processEmails(query): Process emails matching search query
 * - processEmailsByIds(messageIds): Process specific emails by IDs
 * - processMessage(): Core message processing logic
 * - createPDF_(): Generate PDF from HTML content
 * - createMarkdown_(): Create Markdown with YAML frontmatter
 * - parseEmailBody_(): Extract and format email data
 *
 * Processing Logic:
 * 1. Search for emails using query or retrieve by IDs
 * 2. Create organized folder structure in Drive
 * 3. Process each message: PDF, Markdown, metadata extraction
 * 4. Log results in spreadsheet with file links
 * 5. Skip already processed messages to avoid duplicates
 */

// Enable advanced logging
const DEBUG = true;

/**
 * Logs debug messages if DEBUG is true
 * @param {string} message - The message to log
 */
function debug(message) {
  if (DEBUG) {
    Logger.log(`DEBUG: ${message}`);
  }
}

/**
 * Processes emails based on a search query
 * @param {string} query - The Gmail search query
 */
function processEmails(query) {
  try {
    if (!query) {
      throw new Error("Query is undefined");
    }
    debug(`Processing emails with query: ${query}`);

    var searchTerm = query.replace(/[:/]/g, '-'); // Replace characters not suitable for folder names
    var threads = GmailApp.search(query);
    debug(`Found ${threads.length} threads matching the query`);

    var parentFolder = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next();
    var folder = getOrCreateFolder_(parentFolder, searchTerm);
    var dateProcessed = new Date();
    var sheet = getOrCreateSheet_(searchTerm);
    var existingMessageIds = getExistingMessageIds(sheet);
    var markdownFiles = [];

    threads.forEach(function(thread, index) {
      debug(`Processing thread ${index + 1} of ${threads.length}`);
      var messages = thread.getMessages();
      messages.forEach(function(message, msgIndex) {
        debug(`Processing message ${msgIndex + 1} of ${messages.length} in thread ${index + 1}`);
        processMessage(message, existingMessageIds, dateProcessed, folder, sheet, markdownFiles, query);
      });
    });

    debug("Email processing completed successfully");
  } catch (error) {
    Logger.log(`Error in processEmails: ${error.message}`);
    throw error; // Re-throw the error for higher-level error handling
  }
}

/**
 * Processes specific emails by their IDs
 * @param {string[]} messageIds - Array of message IDs to process
 */
function processEmailsByIds(messageIds) {
  try {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new Error("Invalid or empty messageIds array");
    }
    debug(`Processing ${messageIds.length} emails by IDs`);

    var searchTerm = 'selected-emails'; // Use a generic name for the folder and sheet
    var parentFolder = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()).getParents().next();
    var folder = getOrCreateFolder_(parentFolder, searchTerm);
    var dateProcessed = new Date();
    var sheet = getOrCreateSheet_(searchTerm);
    var existingMessageIds = getExistingMessageIds(sheet);
    var markdownFiles = [];

    messageIds.forEach(function(messageId, index) {
      debug(`Processing message ${index + 1} of ${messageIds.length}`);
      var message = GmailApp.getMessageById(messageId);
      if (!message) {
        Logger.log(`Warning: Message with ID ${messageId} not found`);
        return;
      }
      processMessage(message, existingMessageIds, dateProcessed, folder, sheet, markdownFiles, 'selected-emails');
    });

    debug("Email processing by IDs completed successfully");
  } catch (error) {
    Logger.log(`Error in processEmailsByIds: ${error.message}`);
    throw error; // Re-throw the error for higher-level error handling
  }
}

/**
 * Processes a single email message
 * @param {GmailMessage} message - The email message to process
 * @param {Set} existingMessageIds - Set of already processed message IDs
 * @param {Date} dateProcessed - The date when the processing is occurring
 * @param {Folder} folder - The Google Drive folder to save files in
 * @param {Sheet} sheet - The Google Sheets spreadsheet to log data in
 * @param {File[]} markdownFiles - Array to store created markdown files
 * @param {string} query - The original search query or 'selected-emails'
 */
function processMessage(message, existingMessageIds, dateProcessed, folder, sheet, markdownFiles, query) {
  try {
    var messageId = message.getId();
    if (existingMessageIds.has(messageId)) {
      debug(`Skipping already processed message: ${messageId}`);
      return; // Skip this message if it has already been processed
    }

    var emailDate = message.getDate();
    var sender = message.getFrom();
    var subject = message.getSubject();
    var body = message.getPlainBody();
    var htmlBody = message.getBody();

    if (!body || !htmlBody) {
      throw new Error(`Email body is undefined for subject: ${subject}`);
    }

    var filename = Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') + ' - Kevin Lappe - ' + sender + ' - ' + subject + ' - ' + Utilities.formatDate(dateProcessed, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    debug(`Creating PDF for message: ${messageId}`);
    var pdfFile = createPDF_(htmlBody, filename, folder);
    
    debug(`Parsing email body for message: ${messageId}`);
    var rowData = parseEmailBody_(body, emailDate, sender, subject, dateProcessed);
    
    debug(`Creating Markdown content for message: ${messageId}`);
    var markdownContent = createMarkdown_(rowData, body, query);
    
    debug(`Creating Markdown file for message: ${messageId}`);
    var markdownFile = createMarkdownFile_(markdownContent, filename, folder);
    
    debug(`Creating bracketed Markdown file for message: ${messageId}`);
    var bracketedFilename = filename.replace('.md', '');
    var bracketedMarkdownFile = createBracketedMarkdownFile_(markdownContent, bracketedFilename, folder);

    markdownFiles.push(markdownFile);

    rowData.push('=HYPERLINK("' + pdfFile.getUrl() + '", "PDF link")');
    rowData.push('=HYPERLINK("' + markdownFile.getUrl() + '", "Markdown file link")');
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

/**
 * Gets or creates a folder in Google Drive
 * @param {Folder} parentFolder - The parent folder
 * @param {string} folderName - The name of the folder to get or create
 * @returns {Folder} The existing or newly created folder
 */
function getOrCreateFolder_(parentFolder, folderName) {
  try {
    debug(`Attempting to get or create folder: ${folderName}`);
    var folders = parentFolder.getFoldersByName(folderName);
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
 * Gets or creates a sheet in the active spreadsheet
 * @param {string} sheetName - The name of the sheet to get or create
 * @returns {Sheet} The existing or newly created sheet
 */
function getOrCreateSheet_(sheetName) {
  try {
    debug(`Attempting to get or create sheet: ${sheetName}`);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
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
 * Gets existing message IDs from the sheet
 * @param {Sheet} sheet - The sheet to check for existing message IDs
 * @returns {Set} A set of existing message IDs
 */
function getExistingMessageIds(sheet) {
  try {
    debug("Getting existing message IDs from sheet");
    var data = sheet.getDataRange().getValues();
    var existingIds = new Set();
    for (var i = 1; i < data.length; i++) { // Start from 1 to skip header row
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
 * Creates a PDF file from HTML content
 * @param {string} htmlBody - The HTML content to convert to PDF
 * @param {string} filename - The name for the PDF file
 * @param {Folder} folder - The folder to save the PDF in
 * @returns {File} The created PDF file
 */
function createPDF_(htmlBody, filename, folder) {
  try {
    debug(`Creating PDF: ${filename}`);
    var blob = Utilities.newBlob(htmlBody, 'text/html', filename + '.html');
    var pdf = folder.createFile(blob.getAs('application/pdf')).setName(filename + '.pdf');
    debug(`PDF created successfully: ${filename}`);
    return pdf;
  } catch (error) {
    Logger.log(`Error in createPDF_: ${error.message}`);
    throw error;
  }
}

/**
 * Parses the email body and extracts relevant information
 * @param {string} body - The plain text body of the email
 * @param {Date} emailDate - The date of the email
 * @param {string} sender - The sender of the email
 * @param {string} subject - The subject of the email
 * @param {Date} dateProcessed - The date when the email was processed
 * @returns {Array} An array containing the parsed email data
 */
function parseEmailBody_(body, emailDate, sender, subject, dateProcessed) {
  try {
    debug("Parsing email body");
    // Implement your parsing logic here
    // This is a placeholder implementation
    return [
      Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
      sender,
      subject,
      body.substring(0, 100) + "...", // First 100 characters of the body
      Utilities.formatDate(dateProcessed, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
    ];
  } catch (error) {
    Logger.log(`Error in parseEmailBody_: ${error.message}`);
    throw error;
  }
}

/**
 * Creates Markdown content from the email data
 * @param {Array} rowData - The parsed email data
 * @param {string} body - The full body of the email
 * @param {string} query - The search query used to find this email
 * @returns {string} The Markdown content
 */
function createMarkdown_(rowData, body, query) {
  try {
    debug("Creating Markdown content");
    var markdown = "---\n";
    markdown += "date: " + rowData[0] + "\n";
    markdown += "sender: " + rowData[1] + "\n";
    markdown += "subject: " + rowData[2] + "\n";
    markdown += "query: " + query + "\n";
    markdown += "---\n\n";
    markdown += body;
    return markdown;
  } catch (error) {
    Logger.log(`Error in createMarkdown_: ${error.message}`);
    throw error;
  }
}

/**
 * Creates a Markdown file in Google Drive
 * @param {string} markdownContent - The Markdown content
 * @param {string} filename - The name for the Markdown file
 * @param {Folder} folder - The folder to save the Markdown file in
 * @returns {File} The created Markdown file
 */
function createMarkdownFile_(markdownContent, filename, folder) {
  try {
    debug(`Creating Markdown file: ${filename}`);
    var file = folder.createFile(filename + '.md', markdownContent, MimeType.PLAIN_TEXT);
    debug(`Markdown file created successfully: ${filename}`);
    return file;
  } catch (error) {
    Logger.log(`Error in createMarkdownFile_: ${error.message}`);
    throw error;
  }
}

/**
 * Creates a bracketed Markdown file in Google Drive
 * @param {string} markdownContent - The Markdown content
 * @param {string} filename - The name for the Markdown file (without extension)
 * @param {Folder} folder - The folder to save the Markdown file in
 * @returns {File} The created bracketed Markdown file
 */
function createBracketedMarkdownFile_(markdownContent, filename, folder) {
  try {
    debug(`Creating bracketed Markdown file: [[${filename}]]`);
    var bracketedFilename = '[[' + filename + ']]';
    var file = folder.createFile(bracketedFilename + '.md', markdownContent, MimeType.PLAIN_TEXT);
    debug(`Bracketed Markdown file created successfully: [[${filename}]]`);
    return file;
  } catch (error) {
    Logger.log(`Error in createBracketedMarkdownFile_: ${error.message}`);
    throw error;
  }
}
