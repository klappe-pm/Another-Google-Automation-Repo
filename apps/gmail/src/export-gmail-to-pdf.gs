/**
 * Script Name: export- gmail- to- pdf
 *
 * Script Summary:
 * Exports Gmail labels for automated workflow processing.
 *
 * Script Purpose:
 * - Extract gmail to pdf data from Google services
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
 * - getProcessedIds(): Gets specific processed ids or configuration
 * - grokExportEmailsToPDF(): Exports grok emails to p d f to external format
 * - insertDataIntoSheet(): Inserts data into sheet at specific position
 * - processEmailBatches(): Processes and transforms email batches
 * - processSingleEmail(): Processes and transforms single email
 * - safeOperation(): Performs specialized operations
 * - setupLabelsSheet(): Sets up labels sheet or configuration values
 * - setupOutputSheet(): Sets up output sheet or configuration values
 * - setupProcessedSheet(): Sets up processed sheet or configuration values
 * - updateLabelsSheet(): Updates existing labels sheet
 * - updateProcessedSheet(): Updates existing processed sheet
 *
 * Script Helper Functions:
 * - createFolderStructure(): Creates new folder structure or resources
 * - getNextLabelToProcess(): Gets specific next label to process or configuration
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

/  / Constants
const ROOT_FOLDER_NAME = "Lappe vs. Anton LLC - Lappe Files";
const PDF_FOLDER_NAME = "GMail";
const ATTACHMENTS_FOLDER_SUFFIX = "GMail - Attachments";
const BATCH_SIZE = 10;
const MAX_RUNTIME = 5 * 60 * 1000; // 5 minutes;
const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB;
const PROCESSED_LABEL_NAME = "0processed";
const THREAD_FETCH_LIMIT = 100;
const SLEEP_INTERVAL = 500; // 0.5s // Main function with progress logging and status update;

 // Fixed setupOutputSheet function

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
  const labelsSheet = spreadsheet.getSheetByName("Labels to Process");
  const processedSheet = spreadsheet.getSheetByName("Processed") || spreadsheet.insertSheet("Processed", 0);
  const executionDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy - MM - dd HH:mm:ss");

  Logger.log(`Starting execution at ${new Date().toLocaleTimeString()}`);
  SpreadsheetApp.flush();

  try {
    setupProcessedSheet(processedSheet);
    setupLabelsSheet(labelsSheet);

    const { labelToProcess, statusRow } = getNextLabelToProcess(labelsSheet);
    if (! labelToProcess) {
      Logger.log("No unprocessed labels found");
      return;
    }
    Logger.log(`Processing label: ${labelToProcess}`);

    const folderStructure = createFolderStructure(labelToProcess);
    const outputSheet = setupOutputSheet(spreadsheet, labelToProcess);
    const processedIds = getProcessedIds(processedSheet);
    const processedLabel = getOrCreateGmailLabel(PROCESSED_LABEL_NAME);

    const totalThreads = GmailApp.search(`label:${labelToProcess}`).length;
    Logger.log(`Total threads for label ${labelToProcess}: ${totalThreads}`);
    SpreadsheetApp.flush();

    const { emailDataBatch, processedBatch, processedCount, processedThreads } = processEmailBatches(;
      labelToProcess, processedIds, folderStructure, startTime, processedLabel
    );

    Logger.log(`Batch processing complete. Emails processed: ${processedCount}`);
    if (emailDataBatch.length > 0) {
      insertDataIntoSheet(emailDataBatch, labelToProcess, outputSheet);
      updateProcessedSheet(processedSheet, processedBatch);

      const totalProcessed = processedIds.emailIds.size + processedCount;
      const allProcessed = totalProcessed > = totalThreads;
      updateLabelsSheet(labelsSheet, statusRow, labelToProcess, folderStructure.labelFolder, processedCount, allProcessed, executionDate); // Set Status to true if all emails are processed;
      if (allProcessed) {
        labelsSheet.getRange(statusRow, 1).setValue(true);
        Logger.log(`Set Status to true for label ${labelToProcess}`);
      }

      processedThreads.forEach(thread = > safeOperation(() = > thread.addLabel(processedLabel)));
      Logger.log(`Processed ${processedCount} emails for ${labelToProcess}. Total: ${totalProcessed} / ${totalThreads}`);
    } else {
      const allProcessed = processedIds.emailIds.size > = totalThreads;
      updateLabelsSheet(labelsSheet, statusRow, labelToProcess, folderStructure.labelFolder, 0, allProcessed, executionDate); // Set Status to true if no new emails and all are processed;
      if (allProcessed) {
        labelsSheet.getRange(statusRow, 1).setValue(true);
        Logger.log(`Set Status to true for label ${labelToProcess} (no new emails)`);
      }
      Logger.log(`No new emails for ${labelToProcess}. Total: ${processedIds.emailIds.size} / ${totalThreads}`);
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
 * @param {GmailLabel} label - The label parameter
 * @param {string} processedIds - The processedIds parameter
 * @param {Folder} folders - The folders parameter
 * @param {any} startTime - The startTime parameter
 * @param {GmailLabel} processedLabel - The processedLabel parameter
 * @returns {string} The formatted string

 */

function processEmailBatches(label, processedIds, folders, startTime, processedLabel) {
  const emailDataBatch = [];
  const processedBatch = [];
  const processedThreads = new Set();
  let processedCount = 0;
  const threads = GmailApp.search(`label:${label}`, 0, THREAD_FETCH_LIMIT);

  Logger.log(`Starting batch processing for ${threads.length} threads`);
  SpreadsheetApp.flush();

  for (let i = 0; i < threads.length; i + = BATCH_SIZE) {
    const batchStartTime = Date.now();
    if (Date.now() - startTime > MAX_RUNTIME) {
      Logger.log("Approaching max execution time, stopping");
      break;
    }

    const batch = threads.slice(i, i + BATCH_SIZE);
    Logger.log(`Processing batch ${i / BATCH_SIZE + 1} (${batch.length} threads) at ${new Date().toLocaleTimeString()}`);

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
        const result = processSingleEmail(message, folders);
        if (result) {
          emailDataBatch.push(result.emailData);
          processedBatch.push(result.processedEntry);
          processedIds.emailIds.add(emailId);
          processedCount + + ; Logger.log(`Successfully processed email ${emailId}`);
        } else {
          threadFullyProcessed = false;
          Logger.log(`Failed to process email ${emailId}`);
        }
        Utilities.sleep(SLEEP_INTERVAL);
      }

      if (threadFullyProcessed) processedThreads.add(thread);
    }
    Logger.log(`Batch ${i / BATCH_SIZE + 1} completed in ${(Date.now() - batchStartTime) / 1000} seconds`);
    SpreadsheetApp.flush();
  }
  return { emailDataBatch, processedBatch, processedCount, processedThreads: Array.from(processedThreads) };
}

/**

 * Processes and transforms single email
 * @param
 * @param {string} message - The message content
 * @param {Folder} folders - The folders parameter
 * @returns {string} The formatted string

 */

function processSingleEmail(message, folders) {
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

    const pdfFile = safeOperation(() = > folders.labelFolder.createFile(pdfBlob));
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
      if (attachment.getSize() > MAX_ATTACHMENT_SIZE) {
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

 * Sets up labels sheet or configuration values
 * @param
 * @param {Sheet} sheet - The sheet to set
 * @returns {string} The formatted string

 */

function setupLabelsSheet(sheet) {
  if (sheet.getLastRow() = = = 0) {
    sheet.getRange("A1:G1").setValues([["Status", "Labels", "Folder Link", "Count Emails", "Last Export Date", "New Emails", "Date"]]);
      .setFontWeight("bold");
    sheet.getRange("A2:A2").insertCheckboxes();
  }
  sheet.setColumnWidths(1, 7, 150).getRange(1, 1, sheet.getMaxRows(), 7);
    .setFontSize(11).setFontFamily("Helvetica Neue").setHorizontalAlignment("left");
    .setVerticalAlignment("top").setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sheet.getRange("A2:A" + sheet.getLastRow()).insertCheckboxes();
  sheet.autoResizeColumns(1, 7);
}

/**

 * Sets up output sheet or configuration values
 * @param
 * @param {Sheet} spreadsheet - The spreadsheet to set
 * @param {GmailLabel} label - The label to set
 * @returns {string} The formatted string

 */

function setupOutputSheet(spreadsheet, label) {
  let sheet = spreadsheet.getSheetByName(label);
  if (! sheet) {
    sheet = spreadsheet.insertSheet(label, 0);
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

 * Updates existing labels sheet
 * @param
 * @param {Sheet} sheet - The sheet to update
 * @param {any} row - The row to update
 * @param {GmailLabel} label - The label to update
 * @param {Folder} folder - The folder to update
 * @param {number} count - The number of items
 * @param {any} allProcessed - The allProcessed to update
 * @param {any} executionDate - The executionDate to update
 * @returns {string} The formatted string

 */

function updateLabelsSheet(sheet, row, label, folder, count, allProcessed, executionDate) {
  const folderLink = `= HYPERLINK("${folder.getUrl()}", "Export Folder")`;
  const exportDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy - MM - dd HH:mm:ss");
  sheet.getRange(row, 1, 1, 7).setValues([[allProcessed, label, folderLink, count, exportDate, count, executionDate]]);
  Logger.log(`Updated Labels to Process sheet for ${label}`);
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
 * @param {GmailLabel} label - The label for creation
 * @returns {string} The newly created string

 */

function createFolderStructure(label) {
  const rootFolder = getOrCreateFolder(ROOT_FOLDER_NAME);
  const pdfFolder = getOrCreateFolder(PDF_FOLDER_NAME, rootFolder);
  const labelFolder = getOrCreateFolder(label, pdfFolder);
  const attachmentsFolder = getOrCreateFolder(`${label}${ATTACHMENTS_FOLDER_SUFFIX}`, labelFolder);
  return { rootFolder, pdfFolder, labelFolder, attachmentsFolder };
}

/**

 * Gets specific next label to process or configuration
 * @param
 * @param {Sheet} sheet - The sheet to retrieve
 * @returns {string} The requested string

 */

function getNextLabelToProcess(sheet) {
  const labelsData = sheet.getRange("A2:G" + sheet.getLastRow()).getValues();
  const index = labelsData.findIndex(row = > row[0] ! = = true && row[1]);
  return index = = = - 1 ? { labelToProcess: null, statusRow: - 1 } : { labelToProcess: labelsData[index][1], statusRow: index + 2 };
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