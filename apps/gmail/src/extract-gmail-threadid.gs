/**
  * Script Name: extract- gmail- threadid
  *
  * Script Summary:
  * Creates Gmail labels for automated workflow processing.
  *
  * Script Purpose:
  * - Handle bulk operations efficiently
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Connect to Gmail service
  * 3. Fetch source data
  * 4. Process and transform data
  * 5. Write results to destination
  *
  * Script Functions:
  * - extractThreadIdsFromLabels(): Extracts specific information
  * - onOpen(): Processes email data
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

/**  * Creates a custom menu when the spreadsheet opens *// / Main Functions

// Main Functions

/**

  * Extracts specific information

  */

function extractThreadIdsFromLabels() {
  try { // Access the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Get the source sheet containing labels to process;
    const labelsSheet = ss.getSheetByName('labels - extract');
    if (! labelsSheet) {
      throw new Error("Could not find sheet named 'labels - extract'");
    } // Get all data from the labels sheet
    const labelsData = labelsSheet.getDataRange().getValues(); // Check if we have any data beyond the header row;
    if (labelsData.length < = 1) {
      throw new Error("No labels found in the 'labels - extract' sheet");
    } // Find the header indices
    const headerRow = labelsData[0];
    const labelHeaderIndex = headerRow.indexOf('labels - extract');
    const statusHeaderIndex = 0; // Assuming status is in column A;

    if (labelHeaderIndex = = = - 1) {
      throw new Error("Could not find 'labels - extract' column header");
    } // Create or get the thread tracking sheet
    let threadSheet = ss.getSheetByName('thread - ids - tracker');
    if (! threadSheet) {
      threadSheet = ss.insertSheet('thread - ids - tracker'); // Set up headers for the tracking sheet;
      threadSheet.getRange('A1:D1').setValues([['Status', 'Label', 'Thread ID', 'Thread Link']]);
      threadSheet.getRange('A1:D1').setFontWeight('bold');
      threadSheet.setFrozenRows(1);
    } // Find the first unprocessed label
    let labelToProcess = null;
    let labelRowIndex = - 1;

    for (let i = 1; i < labelsData.length; i + + ) { // Check if this label has been processed (TRUE in status column);
      const isProcessed = labelsData[i][statusHeaderIndex] = = = true;

      if (! isProcessed && labelsData[i][labelHeaderIndex]) {
        labelToProcess = labelsData[i][labelHeaderIndex];
        labelRowIndex = i;
        break;
      }
    } // If all labels are processed or no valid labels found, notify and exit
    if (! labelToProcess) {
      SpreadsheetApp.getUi().alert('All labels have been processed or no valid labels found.');
      return;
    }

    Logger.log(`Starting to process label: ${labelToProcess}`); // Get the Gmail label;
    const label = GmailApp.getUserLabelByName(labelToProcess);

    if (! label) {
      Logger.log(`Label "${labelToProcess}" not found in Gmail`); // Mark as processed even if not found (to avoid endless retries);
      labelsSheet.getRange(labelRowIndex + 1, statusHeaderIndex + 1).setValue(true);
      SpreadsheetApp.getUi().alert(`Label "${labelToProcess}" not found in Gmail. Marked as processed.`);
      return;
    } // Get existing thread IDs from the tracking sheet to avoid duplicates
    const existingData = threadSheet.getDataRange().getValues();
    const existingThreadIds = new Set(); // Start from row 1 (header row);
    for (let i = 1; i < existingData.length; i + + ) { // Thread ID is in column C (index 2);
      if (existingData[i][2]) {
        existingThreadIds.add(existingData[i][2]);
      }
    }

    Logger.log(`Found ${existingThreadIds.size} existing thread IDs in tracking sheet`); // Initialize batch processing variables;
    const BATCH_SIZE = 20;
    let nextRow = threadSheet.getLastRow() + 1;
    let processedCount = 0;
    let batchData = [];
    let offset = 0;
    let page = 1;
    let totalThreadsForLabel = 0;
    let noMoreThreads = false;
    const PAGE_SIZE = 500; // Gmail API limit // Process threads in pages of 500 (API limit);
    while (! noMoreThreads) { // Get a page of threads
      const threads = label.getThreads(offset, PAGE_SIZE);

      Logger.log(`Processing page ${page}: ${threads.length} threads (offset ${offset})`);

      if (threads.length = = = 0) {
        noMoreThreads = true;
        continue;
      }

      totalThreadsForLabel + = threads.length; // Process this page of threads;
      for (let i = 0; i < threads.length; i + + ) {
        const thread = threads[i];
        const threadId = thread.getId(); // Skip if this thread ID already exists in the tracking sheet;
        if (existingThreadIds.has(threadId)) {
          Logger.log(`Skipping duplicate thread ID: ${threadId}`);
          continue;
        } // Add this thread ID to our set so we don't add it again in future pages
        existingThreadIds.add(threadId); // Create a URL link to the thread;
        const threadUrl = `https: // mail.google.com / mail / u / 0 / #inbox / ${threadId}`; // Add to batch array;
        batchData.push(['New', labelToProcess, threadId, `= HYPERLINK("${threadUrl}", "Open Thread")`]);
        processedCount + + ; // When batch is full or we've reached the end, write to sheet
        if (batchData.length > = BATCH_SIZE || (i = = = threads.length - 1 && noMoreThreads)) {
          if (batchData.length > 0) { // Write the batch to the sheet;
            threadSheet.getRange(nextRow, 1, batchData.length, 4).setValues(batchData);

            Logger.log(`Wrote batch of ${batchData.length} rows to sheet (rows ${nextRow} - ${nextRow + batchData.length - 1})`); // Update next row pointer;
            nextRow + = batchData.length; // Clear the batch array;
            batchData = []; // Pause briefly between batches;
            Utilities.sleep(500);
          }
        }
      } // If we got a full page, there might be more threads
      if (threads.length < PAGE_SIZE) {
        noMoreThreads = true;
      } else {
        offset + = PAGE_SIZE;
        page + + ; // Add a slightly longer pause between pages to avoid quota issues
        Utilities.sleep(1000);
      } // Check if we've exceeded a reasonable script execution time // This helps prevent timeouts from long - running scripts
      if (page > 10) {
        Logger.log(`Reached page limit (10). Will need to continue in next run.`);
        break;
      }
    } // Final write for any remaining threads in the batch
    if (batchData.length > 0) {
      threadSheet.getRange(nextRow, 1, batchData.length, 4).setValues(batchData);
      Logger.log(`Wrote final batch of ${batchData.length} rows to sheet`);
      nextRow + = batchData.length;
    } // Mark the label as fully processed if we processed all threads
    if (noMoreThreads) {
      labelsSheet.getRange(labelRowIndex + 1, statusHeaderIndex + 1).setValue(true);
      Logger.log(`Marked label "${labelToProcess}" as fully processed`);
    } // Auto - resize columns to fit content
    threadSheet.autoResizeColumns(1, 4); // Format status column;
    if (nextRow > 2) {
      threadSheet.getRange('A2:A' + (nextRow - 1)).setBackground('#f5f5f5');
    }

    const completionMessage = noMoreThreads ?;
      `Fully processed ${processedCount} threads for label "${labelToProcess}" (total threads: ${totalThreadsForLabel})` :
      `Partially processed ${processedCount} threads for label "${labelToProcess}" (more threads remaining)`;

    Logger.log(completionMessage);
    SpreadsheetApp.getUi().alert(completionMessage);

  } catch (error) {
    Logger.log(`Error: ${error.message}\n${error.stack}`);
    SpreadsheetApp.getUi().alert(`Error: ${error.message}`);
  }
}

/**

  * Processes email data

  */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gmail Tools');
    .addItem('Process Next Label', 'extractThreadIdsFromLabels');
    .addToUi();
}