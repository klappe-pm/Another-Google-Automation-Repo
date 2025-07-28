/**
  * Script Name: append- date- received
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
  * - addDateReceivedColumn(): Works with spreadsheet data
  * - getMessageReceivedDate(): Gets specific message received date or configuration
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - GmailApp: For accessing email messages and labels
  * - Logger: For logging and debugging
  * - SpreadsheetApp: For spreadsheet operations
  * - Utilities: For utility functions and encoding
  */

// Main Functions

/**

  * Works with spreadsheet data
  * @returns {string} The formatted string

  */

function addDateReceivedColumn() {
  const startTime = Date.now();

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RideReceipts');

    if (! sheet) {
      Logger.log('Error: RideReceipts sheet not found');
      return;
    }

    // Get the last row with data
    const lastRow = sheet.getLastRow();

    if (lastRow < = 1) {
      Logger.log('No data found in RideReceipts sheet');
      return;
    }

    // Target column R (18) for Date Received
    const dateReceivedColumn = 18; // Column R
    const messageIdColumn = 4;     // Column D for Message IDs

    // Add the header for Date Received
    sheet.getRange(1, dateReceivedColumn).setValue('Date Received');
    sheet.getRange(1, dateReceivedColumn).setFontWeight('bold');

    Logger.log(`Added "Date Received" header in column R (${dateReceivedColumn})`);

    // Get all Message IDs from column D
    const messageIds = sheet.getRange(2, messageIdColumn, lastRow - 1, 1).getValues();

    // Process in batches to avoid timeouts
    const batchSize = 50;
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < messageIds.length; i + = batchSize) {
      const currentBatchSize = Math.min(batchSize, messageIds.length - i);
      const dateValues = [];

      for (let j = 0; j < currentBatchSize; j+ + ) {
        const messageId = messageIds[i + j][0];

        if (! messageId) {
          dateValues.push(['']);
          continue;
        }

        try {
          // Get the received date for this message ID
          const receivedDate = getMessageReceivedDate(messageId);
          dateValues.push([receivedDate]);
          processedCount+ + ;

          if (receivedDate) {
            updatedCount+ + ;
          }
        } catch (err) {
          Logger.log(`Error processing message ID ${messageId}: ${err.message}`);
          dateValues.push(['Error']);
          errorCount+ + ;
        }
      }

      // Update the sheet with this batch of date values
      sheet.getRange(i + 2, dateReceivedColumn, currentBatchSize, 1).setValues(dateValues);

      // Log progress
      Logger.log(`Processed ${i + currentBatchSize} of ${messageIds.length} message IDs`);

      // Add a brief pause to avoid hitting quotas
      Utilities.sleep(100);
    }

    // Auto- resize the column
    sheet.autoResizeColumn(dateReceivedColumn);

    Logger.log(`Completed in ${(Date.now() - startTime) / 1000} seconds`);
    Logger.log(`Processed ${processedCount} message IDs, updated ${updatedCount} with date values, encountered ${errorCount} errors`);

  } catch (e) {
    Logger.log(`Error adding Date Received column: ${e.message}`);
  }
}

/**

  * Gets specific message received date or configuration
  * @param
  * @param {string} messageId - The messageId to retrieve
  * @returns {string} The requested string

  */

function getMessageReceivedDate(messageId) {
  try {
    // Try to find the message by ID
    const message = GmailApp.getMessageById(messageId);

    if (! message) {
      Logger.log(`Message not found: ${messageId}`);
      return '';
    }

    // Get the date the message was received
    const date = message.getDate();

    // Format as MM/ DD/ YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/ ${day}/ ${year}`;

  } catch (e) {
    Logger.log(`Error retrieving message ${messageId}: ${e.message}`);
    return '';
  }
}