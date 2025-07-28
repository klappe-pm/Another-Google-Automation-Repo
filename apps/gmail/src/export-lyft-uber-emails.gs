/**
  * Script Name: export- lyft- uber- emails
  *
  * Script Summary:
  * Exports Gmail labels for automated workflow processing.
  *
  * Script Purpose:
  * - Extract lyft uber emails data from Google services
  * - Convert data to portable formats
  * - Generate reports and summaries
  * - Handle bulk operations efficiently
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Connect to Gmail service
  * 3. Access Drive file system
  * 4. Fetch source data
  * 5. Process and transform data
  * 6. Apply filters and criteria
  * 7. Format output for presentation
  * 8. Send notifications or reports
  *
  * Script Functions:
  * - createPdfFromMessage(): Creates new pdf from message or resources
  * - extractEmail(): Extracts specific information
  * - extractName(): Extracts specific information
  * - getConfig(): Gets specific config or configuration
  * - getProcessedIds(): Gets specific processed ids or configuration
  * - grokExportEmailsToPDF(): Exports grok emails to p d f to external format
  * - insertDataIntoSheet(): Inserts data into sheet at specific position
  * - processEmailBatches(): Processes and transforms email batches
  * - processSingleEmail(): Processes and transforms single email
  * - safeOperation(): Performs specialized operations
  * - setupOutputSheet(): Sets up output sheet or configuration values
  * - setupProcessedSheet(): Sets up processed sheet or configuration values
  * - updateProcessedSheet(): Updates existing processed sheet
  *
  * Script Helper Functions:
  * - createFolderStructure(): Creates new folder structure or resources
  * - getOrCreateFolder(): Gets specific or create folder or configuration
  * - getOrCreateGmailLabel(): Gets specific or create gmail label or configuration
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

/  / Main function with progress logging and status update;
  / *  *  * Creates a PDF from a Gmail message. * @param {GmailMessage} message - The Gmail message to convert to PDF. * @returns {Blob} - The PDF blob. *// *  *  * Gets or creates a Gmail label. * @param {string} labelName - The name of the label. * @returns {GmailLabel} - The Gmail label. *// *  *  * Sets up the 'Processed' sheet. * @param {Sheet} sheet - The sheet to set up. *// *  *  * Creates the necessary folder structure in Google Drive. * @param {Object} config - The configuration object. * @returns {Object} - The folder structure. *// *  *  * Sets up the output sheet for a filter. * @param {Spreadsheet} spreadsheet - The active spreadsheet. * @param {string} filter - The filter name. * @returns {Sheet} - The output sheet. *// *  *  * Gets the set of processed thread and email IDs. * @param {Sheet} sheet - The 'Processed' sheet. * @returns {Object} - The sets of processed thread and email IDs. *// *  *  * Processes emails in batches. * @param {string} filter - The filter to process. * @param {Object} processedIds - The sets of processed thread and email IDs. * @param {Object} folders - The folder structure. * @param {number} startTime - The start time of the script. * @param {GmailLabel} processedLabel - The label to apply to processed emails. * @param {Object} config - The configuration object. * @returns {Object} - The processed email data and counts. *// *  *  * Processes a single email and returns the data. * @param {GmailMessage} message - The Gmail message to process. * @param {Object} folders - The folder structure. * @param {Object} config - The configuration object. * @returns {Object} - The processed email data and entry. *// *  *  * Inserts processed email data into the output sheet. * @param {Array} emailData - The email data to insert. * @param {string} sheetName - The name of the output sheet. * @param {Sheet} sheet - The output sheet. *// *  *  * Updates the 'Processed' sheet with new entries. * @param {Sheet} sheet - The 'Processed' sheet. * @param {Array} processedBatch - The batch of processed entries. *// *  *  * Gets or creates a folder in Google Drive. * @param {string} folderName - The name of the folder. * @param {Folder} parentFolder - The parent folder. * @returns {Folder} - The folder. *// *  *  * Safely executes an operation with retries. * @param {Function} operation - The operation to execute. * @param {any} fallback - The fallback value. * @param {number} retries - The number of retries. * @returns {any} - The result of the operation or the fallback value. *// *  *  * Extracts the email address from a string. * @param {string} fromString - The string containing the email address. * @returns {string} - The extracted email address. *// *  *  * Extracts the display name from a string. * @param {string} fromString - The string containing the display name. * @returns {string} - The extracted display name. *// *  *  * Gets the configuration from the 'config' sheet. * @param {Sheet} sheet - The 'config' sheet. * @returns {Object} - The configuration object. *// / Main Functions

// Main Functions

/**

  * Creates new pdf from message or resources
  * @param
  * @param {string} message - The message content
  * @returns {string} The newly created string

  */

function createPdfFromMessage(message) {
  const subject = message.getSubject();
  const from = message.getFrom();
  const date = Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), "yyyy - MM - dd HH:mm:ss");
  const htmlBody = message.getBody() || message.getPlainBody().replace( / \n / g, ' < br > ');
  const htmlContent = ` < html >  < head >  < title > ${subject} < / title >  < / head >  < body >  < h1 > ${subject} < / h1 >  < p >  < strong > From: < / strong > ${from} < / p >  < p >  < strong > Date: < / strong > ${date} < / p >  < hr > ${htmlBody} < / body >  < / html > `;
  return Utilities.newBlob(htmlContent, 'text / html', `${subject}.html`);
    .getAs('application / pdf');
    .setName(`${subject}.pdf`);
}

/**

  * Extracts specific information
  * @param
  * @param {any} fromString - The fromString parameter
  * @returns {string} The formatted string

  */

function extractEmail(fromString) {
  const emailMatch = fromString.match( / < (. + ?) > / );
  if (emailMatch) return emailMatch[1];
  const emailOnlyMatch = fromString.match( / [\w\. - ] + @[\w\. - ] + \.\w +  / );
  return emailOnlyMatch ? emailOnlyMatch[0] : fromString;
}

/**

  * Extracts specific information
  * @param
  * @param {any} fromString - The fromString parameter
  * @returns {string} The formatted string

  */

function extractName(fromString) {
  const emailMatch = fromString.match( / < (. + ?) > / );
  if (emailMatch) return fromString.replace(emailMatch[0], '').trim() || 'No display name';
  const emailPart = fromString.match( / [\w\. - ] + @[\w\. - ] + \.\w +  / );
  return emailPart ? fromString.replace(emailPart[0], '').trim() || 'No display name' : fromString;
}

/**

  * Gets specific config or configuration
  * @param
  * @param {Sheet} sheet - The sheet to retrieve
  * @returns {string} The requested string

  */

function getConfig(sheet) {
  const configData = sheet.getDataRange().getValues();
  const config = {};
  configData.forEach(row = > {
    if (row[0]) { // Ensure the value is a string before calling trim
      let value = row[1];
      if (typeof value = = = 'string') {
        value = value.trim();
      } // Convert numeric and boolean values appropriately
      if (! isNaN(value) && value ! = = "") {
        config[row[0].trim()] = Number(value);
      } else if (value = = = "true" || value = = = "false") {
        config[row[0].trim()] = value = = = "true";
      } else {
        config[row[0].trim()] = value;
      }
    }
  });
  return config;
}

/**

  * Gets specific processed ids or configuration
  * @param
  * @param {Sheet} sheet - The sheet to retrieve
  * @returns {string} The requested string

  */

function getProcessedIds(sheet) {
  if (sheet.getLastRow() < = 1) return { threadIds: new Set(), emailIds: new Set() };
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  return { threadIds: new Set(data.map(row = > row[0])), emailIds: new Set(data.map(row = > row[1])) };
}

/**

  * Exports grok emails to p d f to external format
  * @returns {string} The formatted string

  */

function grokExportEmailsToPDF() {
  const startTime = Date.now();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = spreadsheet.getSheetByName("config");
  const processedSheet = spreadsheet.getSheetByName("Processed") || spreadsheet.insertSheet("Processed", 0);
  const executionDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy - MM - dd HH:mm:ss");

  Logger.log(`Starting execution at ${new Date().toLocaleTimeString()}`);
  SpreadsheetApp.flush();

  try {
    const config = getConfig(configSheet); // Log the configuration values;
    Logger.log(`Config values: ${JSON.stringify(config)}`);

    setupProcessedSheet(processedSheet);

    const folderStructure = createFolderStructure(config);
    const outputSheet = setupOutputSheet(spreadsheet, config.filter);
    const processedIds = getProcessedIds(processedSheet);
    const processedLabel = getOrCreateGmailLabel(config.PROCESSED_LABEL_NAME);

    const totalThreads = GmailApp.search(config.filter).length;
    Logger.log(`Total threads for filter: ${totalThreads}`);
    SpreadsheetApp.flush();

    const { emailDataBatch, processedBatch, processedCount, processedThreads } = processEmailBatches(;
      config.filter, processedIds, folderStructure, startTime, processedLabel, config
    );

    Logger.log(`Batch processing complete. Emails processed: ${processedCount}`);
    if (emailDataBatch.length > 0) {
      insertDataIntoSheet(emailDataBatch, config.filter, outputSheet);
      updateProcessedSheet(processedSheet, processedBatch);

      const totalProcessed = processedIds.emailIds.size + processedCount;
      const allProcessed = totalProcessed > = totalThreads;

      processedThreads.forEach(thread = > safeOperation(() = > thread.addLabel(processedLabel)));
      Logger.log(`Processed ${processedCount} emails. Total: ${totalProcessed} / ${totalThreads}`);
    } else {
      const allProcessed = processedIds.emailIds.size > = totalThreads;
      Logger.log(`No new emails. Total: ${processedIds.emailIds.size} / ${totalThreads}`);
    }
    Logger.log(`Execution completed at ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    Logger.log(`Critical error in grokExportEmailsToPDF: ${error.stack}`);
  } finally {
    SpreadsheetApp.flush();
  }
}

/**

  * Inserts data into sheet at specific position
  * @param
  * @param {string} emailData - The emailData parameter
  * @param {string} sheetName - The sheetName parameter
  * @param {Sheet} sheet - The sheet parameter
  * @returns {string} The formatted string

  */

function insertDataIntoSheet(emailData, sheetName, sheet) {
  const headers = ["Thread ID", "Email ID", "Date Received", "Time Received", "Metadata", "Subject", "Snippet", "Gmail Link", "PDF Link", "Sender Email", "Email Recipients", "Sender Domain", "Sender Display Name", ...Array(10).fill().map((_, i) = > `Attach Link ${i + 1}`)];
  if (sheet.getLastRow() = = = 0) sheet.appendRow(headers);

  const rowsToInsert = emailData.map(data = > {
    const attachmentLinks = data.attachmentLinks.map(link = > `= HYPERLINK("${link.url}", "${link.name}")`).concat(Array(10).fill("")).slice(0, 10);
    return [data.threadId, data.emailId, data.dateReceived, data.timeReceived, data.metadata, data.subject, data.snippet, `= HYPERLINK("${data.gmailLink}", "Gmail Link")`, `= HYPERLINK("${data.pdfLink}", "PDF Link")`, data.senderEmail, data.emailRecipients, data.senderDomain, data.senderDisplayName, ...attachmentLinks];
  });

  if (rowsToInsert.length) {
    sheet.insertRowsBefore(2, rowsToInsert.length);
    const range = sheet.getRange(2, 1, rowsToInsert.length, headers.length);
    range.setValues(rowsToInsert);

    sheet.setColumnWidths(1, headers.length, 150);
    const fullRange = sheet.getRange(1, 1, sheet.getLastRow(), headers.length);
    fullRange.setFontSize(11);
      .setFontFamily("Helvetica Neue");
      .setHorizontalAlignment("left");
      .setVerticalAlignment("top");
      .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);

    Logger.log(`Inserted ${rowsToInsert.length} rows into ${sheetName} sheet`);
  }
}

/**

  * Processes and transforms email batches
  * @param
  * @param {any} filter - The filter parameter
  * @param {string} processedIds - The processedIds parameter
  * @param {Folder} folders - The folders parameter
  * @param {any} startTime - The startTime parameter
  * @param {GmailLabel} processedLabel - The processedLabel parameter
  * @param {Object} config - Configuration settings
  * @returns {string} The formatted string

  */

function processEmailBatches(filter, processedIds, folders, startTime, processedLabel, config) {
  const emailDataBatch = [];
  const processedBatch = [];
  const processedThreads = new Set();
  let processedCount = 0;
  const threads = GmailApp.search(filter, 0, config.THREAD_FETCH_LIMIT);

  Logger.log(`Starting batch processing for ${threads.length} threads`);
  SpreadsheetApp.flush();

  for (let i = 0; i < threads.length; i + = config.BATCH_SIZE) {
    const batchStartTime = Date.now();
    if (Date.now() - startTime > config.MAX_RUNTIME) {
      Logger.log("Approaching max execution time, stopping");
      break;
    }

    const batch = threads.slice(i, i + config.BATCH_SIZE);
    Logger.log(`Processing batch ${i / config.BATCH_SIZE + 1} (${batch.length} threads) at ${new Date().toLocaleTimeString()}`);

    for (const thread of batch) {
      const threadId = thread.getId();
      if (processedIds.threadIds.has(threadId)) {
        Logger.log(`Skipping thread ${threadId} (already processed)`);
        continue;
      }

      const messages = thread.getMessages();
      Logger.log(`Thread ${threadId}: Processing ${messages.length} messages`);
      let threadFullyProcessed = true;

      for (const message of messages) {
        const emailId = message.getId();
        if (processedIds.emailIds.has(emailId)) {
          Logger.log(`Skipping email ${emailId} (already processed)`);
          continue;
        }

        Logger.log(`Processing email ${emailId} at ${new Date().toLocaleTimeString()}`);
        const result = processSingleEmail(message, folders, config);
        if (result) {
          emailDataBatch.push(result.emailData);
          processedBatch.push(result.processedEntry);
          processedIds.emailIds.add(emailId);
          processedCount + + ; Logger.log(`Successfully processed email ${emailId}`);
        } else {
          threadFullyProcessed = false;
          Logger.log(`Failed to process email ${emailId}`);
        }
        Utilities.sleep(config.SLEEP_INTERVAL);
      }

      if (threadFullyProcessed) processedThreads.add(thread);
    }
    Logger.log(`Batch ${i / config.BATCH_SIZE + 1} completed in ${(Date.now() - batchStartTime) / 1000} seconds`);
    SpreadsheetApp.flush();
  }
  return { emailDataBatch, processedBatch, processedCount, processedThreads: Array.from(processedThreads) };
}

/**

  * Processes and transforms single email
  * @param
  * @param {string} message - The message content
  * @param {Folder} folders - The folders parameter
  * @param {Object} config - Configuration settings
  * @returns {string} The formatted string

  */

function processSingleEmail(message, folders, config) {
  const emailId = message.getId();
  const threadId = message.getThread().getId();

  try {
    const threadSubject = message.getThread().getFirstMessageSubject().replace( / ^(Re:|Fwd:)\s */ i, '');
    const dateReceived = Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), "yyyy - MM - dd");
    const timeReceived = Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), "HH:mm");
    const from = message.getFrom();
    const senderEmail = extractEmail(from);
    const senderDisplayName = extractName(from);
    const senderDomain = senderEmail.split('@')[1] || '';
    const recipients = [message.getTo(), message.getCc(), message.getBcc()];
      .filter(Boolean).join(',').split(',');
      .map(email = > extractEmail(email.trim()));
      .filter(email = > email && email ! = = senderEmail);
      .join(',');

    const docTitle = `${dateReceived} - ${threadSubject}`;
    const pdfBlob = safeOperation(() = > createPdfFromMessage(message));
    if (! pdfBlob) {
      Logger.log(`PDF creation failed for ${emailId}`);
      return null;
    }

    const pdfFile = safeOperation(() = > folders.filterFolder.createFile(pdfBlob));
    if (! pdfFile) {
      Logger.log(`File creation failed for ${emailId}`);
      return null;
    }
    const pdfLink = pdfFile.getUrl();

    const rfc822MessageId = message.getHeader("Message - ID");
    const gmailLink = rfc822MessageId ? `https: // mail.google.com / mail / u / 0 / #search / rfc822msgid:${encodeURIComponent(rfc822MessageId)}` : "";
    const metadata = rfc822MessageId || "";
    const snippet = message.getPlainBody().substring(0, 100);

    const attachmentLinks = [];
    message.getAttachments().forEach((attachment, index) = > {
      if (attachment.getSize() > config.MAX_ATTACHMENT_SIZE) {
        attachmentLinks.push({ name: `${attachment.getName()} (Too large)`, url: "" });
        return;
      }
      const attachmentFileName = `${dateReceived} - ${threadSubject} - attachment - ${index + 1}`;
      const attachmentFile = safeOperation(() = > folders.attachmentsFolder.createFile(attachment.copyBlob().setName(attachmentFileName));
      );
      attachmentLinks.push(attachmentFile ? { name: attachmentFileName, url: attachmentFile.getUrl() } : { name: `${attachment.getName()} (Error)`, url: "" });
    });

    return {
      emailData: { threadId, emailId, dateReceived, timeReceived, metadata, subject: threadSubject, snippet, gmailLink, pdfLink, senderEmail, emailRecipients: recipients, senderDomain, senderDisplayName, attachmentLinks },
      processedEntry: [threadId, emailId, new Date()]
    };
  } catch (e) {
    Logger.log(`Error processing email ${emailId}: ${e.stack}`);
    return null;
  }
}

/**

  * Performs specialized operations
  * @param
  * @param {any} operation - The operation parameter
  * @param {any} fallback - The fallback parameter
  * @param {any} retries - The retries parameter
  * @returns {string} The formatted string

  */

function safeOperation(operation, fallback = null, retries = 3) {
  let delay = 500;
  for (let attempt = 0; attempt < retries; attempt + + ) {
    try {
      return operation();
    } catch (error) {
      Logger.log(`Attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt = = = retries - 1) return fallback;
      Utilities.sleep(delay);
      delay * = 2;
    }
  }
}

/**

  * Sets up output sheet or configuration values
  * @param
  * @param {Sheet} spreadsheet - The spreadsheet to set
  * @param {any} filter - The filter to set
  * @returns {string} The formatted string

  */

function setupOutputSheet(spreadsheet, filter) {
  let sheet = spreadsheet.getSheetByName(filter);
  if (! sheet) {
    sheet = spreadsheet.insertSheet(filter, 0);
  } else {
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(0);
  }
  return sheet;
}

/**

  * Sets up processed sheet or configuration values
  * @param
  * @param {Sheet} sheet - The sheet to set
  * @returns {string} The formatted string

  */

function setupProcessedSheet(sheet) {
  if (sheet.getLastRow() = = = 0) {
    sheet.appendRow(["Thread ID", "Email ID", "Processed Date"]).getRange(1, 1, 1, 3).setFontWeight("bold");
  }
  sheet.setColumnWidths(1, 3, 150).getRange(1, 1, sheet.getMaxRows(), 3);
    .setFontSize(11).setFontFamily("Helvetica Neue").setHorizontalAlignment("left");
    .setVerticalAlignment("top").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
}

/**

  * Updates existing processed sheet
  * @param
  * @param {Sheet} sheet - The sheet to update
  * @param {any} processedBatch - The processedBatch to update
  * @returns {string} The formatted string

  */

function updateProcessedSheet(sheet, processedBatch) {
  if (processedBatch.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, processedBatch.length, 3).setValues(processedBatch);
    Logger.log(`Updated Processed sheet with ${processedBatch.length} entries`);
  }
}

// Helper Functions

/**

  * Creates new folder structure or resources
  * @param
  * @param {Object} config - Configuration settings
  * @returns {string} The newly created string

  */

function createFolderStructure(config) {
  const rootFolder = getOrCreateFolder(config.ROOT_FOLDER_NAME);
  const pdfFolder = getOrCreateFolder(config.PDF_FOLDER_NAME, rootFolder);
  const filterFolder = getOrCreateFolder(config.filter, pdfFolder);
  const attachmentsFolder = getOrCreateFolder(`${config.filter}${config.ATTACHMENTS_FOLDER_SUFFIX}`, filterFolder);
  return { rootFolder, pdfFolder, filterFolder, attachmentsFolder };
}

/**

  * Gets specific or create folder or configuration
  * @param
  * @param {string} folderName - The folderName to retrieve
  * @param {Folder} parentFolder - The parentFolder to retrieve
  * @returns {string} The requested string

  */

function getOrCreateFolder(folderName, parentFolder) {
  const folders = (parentFolder || DriveApp).getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : safeOperation(() = > (parentFolder || DriveApp).createFolder(folderName));
}

/**

  * Gets specific or create gmail label or configuration
  * @param
  * @param {string} labelName - The labelName to retrieve
  * @returns {string} The requested string

  */

function getOrCreateGmailLabel(labelName) {
  return safeOperation(() = > GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName));
}