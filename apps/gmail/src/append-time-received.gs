/**
 * Script Name: append- time- received
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
 * 5. Format output for presentation
 *
 * Script Functions:
 * - addTimeForSingleRow(): Works with spreadsheet data
 * - addTimeReceivedColumn(): Works with spreadsheet data
 * - addTimeReceivedInChunks(): Works with spreadsheet data
 * - columnToLetter(): Performs specialized operations
 * - getMessageReceivedTime(): Gets specific message received time or configuration
 * - resetTimeReceivedProcessing(): Sets re time received processing or configuration values
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

// Main Functions

/**

 * Works with spreadsheet data
 * @param
 * @param {any} rowNumber - The rowNumber parameter
 * @returns {any} The result

 */

function addTimeForSingleRow(rowNumber) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RideReceipts');

    if (! sheet) {
      Logger.log('Error: RideReceipts sheet not found');
      return;
    }

    // Check if Time Received column exists (column M)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let timeReceivedColumnIndex = headers.indexOf('Time Received') + 1;

    // If Time Received column doesn't exist, add it
    if (timeReceivedColumnIndex = = = 0) {
      timeReceivedColumnIndex = sheet.getLastColumn() + 1;
      sheet.getRange(1, timeReceivedColumnIndex).setValue('Time Received');
      sheet.getRange(1, timeReceivedColumnIndex).setFontWeight('bold');
      Logger.log(`Added "Time Received" header in column ${columnToLetter(timeReceivedColumnIndex)}`);
    }

    // Get the message ID from column B for the specified row
    const messageId = sheet.getRange(rowNumber, 2).getValue();

    if (! messageId) {
      Logger.log(`No message ID found in row ${rowNumber}`);
      return;
    }

    // Get the received time for this message ID
    const receivedTime = getMessageReceivedTime(messageId);

    // Update the cell with the received time
    sheet.getRange(rowNumber, timeReceivedColumnIndex).setValue(receivedTime);

    Logger.log(`Updated row ${rowNumber} with received time: ${receivedTime}`);

  } catch (e) {
    Logger.log(`Error processing single row: ${e.message}`);
  }
}

/**

 * Works with spreadsheet data
 * @returns {any} The result

 */

function addTimeReceivedColumn() {
  const startTime = Date.now();

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('RideReceipts');

    if (! sheet) {
      Logger.log('Error: RideReceipts sheet not found');
      return;
    }

    // Get the current number of columns and last row
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    if (lastRow < = 1) {
      Logger.log('No data found in RideReceipts sheet');
      return;
    }

    // Add Time Received header in column M (or the next available column)
    const newColumnIndex = lastColumn + 1;
    sheet.getRange(1, newColumnIndex).setValue('Time Received');
    sheet.getRange(1, newColumnIndex).setFontWeight('bold');

    Logger.log(`Added "Time Received" header in column ${columnToLetter(newColumnIndex)}`);

    // Get all Message IDs from column B
    const messageIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues();

    // Process in batches to avoid timeouts
    const batchSize = 50;
    let processedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < messageIds.length; i + = batchSize) {
      const currentBatchSize = Math.min(batchSize, messageIds.length - i);
      const timeValues = [];

      for (let j = 0; j < currentBatchSize; j+ + ) {
        const messageId = messageIds[i + j][0];

        if (! messageId) {
          timeValues.push(['']);
          continue;
        }

        try {
          // Get the received time for this message ID
          const receivedTime = getMessageReceivedTime(messageId);
          timeValues.push([receivedTime]);
          processedCount+ + ;

          if (receivedTime) {
            updatedCount+ + ;
          }
        } catch (err) {
          Logger.log(`Error processing message ID ${messageId}: ${err.message}`);
          timeValues.push(['Error']);
        }
      }

      // Update the sheet with this batch of time values
      sheet.getRange(i + 2, newColumnIndex, currentBatchSize, 1).setValues(timeValues);

      // Log progress
      Logger.log(`Processed ${i + currentBatchSize} of ${messageIds.length} message IDs`);

      // Add a brief pause to avoid hitting quotas
      Utilities.sleep(100);
    }

    // Auto- resize the new column
    sheet.autoResizeColumn(newColumnIndex);

    Logger.log(`Completed in ${(Date.now() - startTime) / 1000} seconds`);
    Logger.log(`Processed ${processedCount} message IDs, updated ${updatedCount} with time values`);

  } catch (e) {
    Logger.log(`Error adding Time Received column: ${e.message}`);
  }
}

/**

 * Works with spreadsheet data
 * @returns {any} The result

 */

function addTimeReceivedInChunks() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('RideReceipts');

  if (! sheet) {
    Logger.log('Error: RideReceipts sheet not found');
    return;
  }

  const lastRow = sheet.getLastRow();

  // Check if Time Received column exists (look for it in all headers)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let timeReceivedColumnIndex = headers.indexOf('Time Received') + 1;

  // If Time Received column doesn't exist, add it
  if (timeReceivedColumnIndex = = = 0) {
    timeReceivedColumnIndex = sheet.getLastColumn() + 1;
    sheet.getRange(1, timeReceivedColumnIndex).setValue('Time Received');
    sheet.getRange(1, timeReceivedColumnIndex).setFontWeight('bold');
    Logger.log(`Added "Time Received" header in column ${columnToLetter(timeReceivedColumnIndex)}`);
  }

  // Get the script properties to track progress
  const scriptProperties = PropertiesService.getScriptProperties();
  let startRow = parseInt(scriptProperties.getProperty('timeReceivedStartRow') || '2');

  // Define chunk size and limit processing time
  const chunkSize = 50;
  const endRow = Math.min(startRow + chunkSize - 1, lastRow);
  const startTime = Date.now();
  const maxExecutionTime = 5 * 60 * 1000; // 5 minutes

  Logger.log(`Processing rows ${startRow} to ${endRow} (out of ${lastRow} total rows)`);

  // Process current chunk
  for (let row = startRow; row < = endRow; row+ + ) {
    // Check if we're approaching time limit
    if (Date.now() - startTime > maxExecutionTime) {
      Logger.log(`Approaching execution time limit. Processed rows ${startRow} to ${row- 1}`);
      scriptProperties.setProperty('timeReceivedStartRow', row.toString());
      return;
    }

    // Get the message ID from column B
    const messageId = sheet.getRange(row, 2).getValue();

    if (! messageId) {
      continue;
    }

    try {
      // Get the received time for this message ID
      const receivedTime = getMessageReceivedTime(messageId);

      // Update the cell with the received time
      sheet.getRange(row, timeReceivedColumnIndex).setValue(receivedTime);

      if (row % 10 = = = 0) {
        Logger.log(`Processed ${row - startRow + 1} rows in current chunk`);
      }
    } catch (e) {
      Logger.log(`Error processing row ${row}: ${e.message}`);
    }

    // Add a brief pause to avoid hitting quotas
    if (row % 10 = = = 0) {
      Utilities.sleep(100);
    }
  }

  // Update the next starting point
  if (endRow < lastRow) {
    scriptProperties.setProperty('timeReceivedStartRow', (endRow + 1).toString());
    Logger.log(`Chunk complete. Next starting row will be ${endRow + 1}`);
  } else {
    scriptProperties.deleteProperty('timeReceivedStartRow');
    Logger.log('All rows processed. Completed! ');
  }

  Logger.log(`Processed rows ${startRow} to ${endRow} in ${(Date.now() - startTime) / 1000} seconds`);
}

/**

 * Performs specialized operations
 * @param
 * @param {any} column - The column parameter
 * @returns {any} The result

 */

function columnToLetter(column) {
  let letter = '';
  while (column > 0) {
    const remainder = (column - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    column = Math.floor((column - 1) / 26);
  }
  return letter;
}

/**

 * Gets specific message received time or configuration
 * @param
 * @param {string} messageId - The messageId to retrieve
 * @returns {any} The requested any

 */

function getMessageReceivedTime(messageId) {
  try {
    // Try to find the message by ID
    const message = GmailApp.getMessageById(messageId);

    if (! message) {
      Logger.log(`Message not found: ${messageId}`);
      return '';
    }

    // Get the date the message was received
    const date = message.getDate();

    // Format as HH:MM in 24- hour format
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;

  } catch (e) {
    Logger.log(`Error retrieving message ${messageId}: ${e.message}`);
    return '';
  }
}

/**

 * Sets re time received processing or configuration values
 * @returns {any} The result

 */

function resetTimeReceivedProcessing() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('timeReceivedStartRow');
  Logger.log('Reset the Time Received processing state. Will start from row 2 next time.');
}