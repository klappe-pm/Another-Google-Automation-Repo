/**
 * Script Name: extract- subject
 *
 * Script Summary:
 * Processes spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Process and transform data
 *
 * Script Functions:
 * - addEmailSubjectColumn(): Works with spreadsheet data
 * - getMessageSubject(): Gets specific message subject or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/ / Main Functions

/**

 * Works with spreadsheet data
 * @returns {string} The formatted string

 * /

function addEmailSubjectColumn() {
  const startTime = Date.now();

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RideReceipts');

    if (! sheet) {
      Logger.log('Error: RideReceipts sheet not found');
      return;
    } / / Get the last row with data
    const lastRow = sheet.getLastRow();

    if (lastRow < = 1) {
      Logger.log('No data found in RideReceipts sheet');
      return;
    } / / Target column S (19) for Email Subject
    const subjectColumn = 19; / / Column S;
    const messageIdColumn = 6; / / Column F for Message IDs / / Add the header for Email Subject;
    sheet.getRange(1, subjectColumn).setValue('Email Subject');
    sheet.getRange(1, subjectColumn).setFontWeight('bold');

    Logger.log(`Added "Email Subject" header in column S (${subjectColumn})`); / / Get all Message IDs from column F;
    const messageIds = sheet.getRange(2, messageIdColumn, lastRow - 1, 1).getValues(); / / Process in batches to avoid timeouts;
    const batchSize = 50;
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < messageIds.length; i + = batchSize) {
      const currentBatchSize = Math.min(batchSize, messageIds.length - i);
      const subjectValues = [];

      for (let j = 0; j < currentBatchSize; j + + ) {
        const messageId = messageIds[i + j][0];

        if (! messageId) {
          subjectValues.push(['']);
          continue;
        }

        try { / / Get the subject for this message ID
          const subject = getMessageSubject(messageId);
          subjectValues.push([subject]);
          processedCount + + ; if (subject) {
            updatedCount + + ; }
        } catch (err) {
          Logger.log(`Error processing message ID ${messageId}: ${err.message}`);
          subjectValues.push(['Error']);
          errorCount + + ; }
      } / / Update the sheet with this batch of subject values
      sheet.getRange(i + 2, subjectColumn, currentBatchSize, 1).setValues(subjectValues); / / Log progress;
      Logger.log(`Processed ${i + currentBatchSize} of ${messageIds.length} message IDs`); / / Add a brief pause to avoid hitting quotas;
      Utilities.sleep(100);
    } / / Auto - resize the column
    sheet.autoResizeColumn(subjectColumn);

    Logger.log(`Completed in ${(Date.now() - startTime) / 1000} seconds`);
    Logger.log(`Processed ${processedCount} message IDs, updated ${updatedCount} with subject values, encountered ${errorCount} errors`);

  } catch (e) {
    Logger.log(`Error adding Email Subject column: ${e.message}`);
  }
}

/**

 * Gets specific message subject or configuration
 * @param
 * @param {string} messageId - The messageId to retrieve
 * @returns {string} The requested string

 * /

function getMessageSubject(messageId) {
  try { / / Try to find the message by ID
    const message = GmailApp.getMessageById(messageId);

    if (! message) {
      Logger.log(`Message not found: ${messageId}`);
      return '';
    } / / Get the subject of the message
    const subject = message.getSubject();
    return subject || ''; / / Return empty string if subject is null or undefined;

  } catch (e) {
    Logger.log(`Error retrieving message ${messageId}: ${e.message}`);
    return '';
  }
}