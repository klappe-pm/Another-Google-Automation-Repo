/**
 * Title: Gmail Label Analysis
 * Service: Gmail + Google Sheets
 * Purpose: Analyze Gmail labels and provide statistics about threads and messages
 * Created: 2023-01-01
 * Updated: 2025-07-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 *
 * Script Summary:
 * - This script analyzes Gmail labels to provide statistics, summarizing key metrics such as the number of threads, messages, and various statistical measures.
 * - It provides insights into email organization and supports further analysis by exporting data to a Google Sheet named 'LabelStats'.
 * - Solves the problem of manual counting and analyzing email data.
 *
 * Key Features:
 * 1. Comprehensive Gmail label analysis.
 * 2. Statistical measures: average, min, max, median.
 * 3. Google Sheet export for further analysis.
 * 4. Log progress and results for debugging and verification.
 *
 * Functions:
 * - analyzeGmailLabels(): Analyze labels and export data.
 * - calculateAverage(array): Calculate the average number.
 * - calculateMax(array): Determine the maximum value.
 * - calculateMedian(array): Find the median value.
 * - calculateMin(array): Identify the minimum value.
 *
 * Processing Logic:
 * 1. Fetch all Gmail labels.
 * 2. Process each label and gather statistics.
 * 3. Export data to 'LabelStats' sheet.
 */

function analyzeGmailLabels() {
  Logger.log('Starting Gmail label analysis...');

  // Fetch all labels
  var labels = GmailApp.getLabels();
  Logger.log('Fetched ' + labels.length + ' labels.');

  // Initialize an array to hold data for each label
  var labelData = [];

  // Process each label
  for (var i = 0; i < labels.length; i++) {
    var label = labels[i];
    var labelName = label.getName();
    Logger.log('Processing label: ' + labelName);

    // Get all threads in the label
    var threads = label.getThreads();
    Logger.log('Found ' + threads.length + ' threads in label: ' + labelName);

    // Initialize counters
    var totalThreads = threads.length;
    var totalMessages = 0;
    var threadsWithAttachments = 0;
    var totalAttachments = 0;
    var messagesPerThread = [];

    // Process each thread
    for (var j = 0; j < threads.length; j++) {
      var thread = threads[j];
      var messages = thread.getMessages();
      var messageCount = messages.length;
      totalMessages += messageCount;
      messagesPerThread.push(messageCount);

      // Check for attachments
      var hasAttachment = false;
      var attachmentsInThread = 0;
      for (var k = 0; k < messages.length; k++) {
        var message = messages[k];
        if (message.hasAttachments()) {
          hasAttachment = true;
          attachmentsInThread += message.getAttachments().length;
        }
      }
      if (hasAttachment) {
        threadsWithAttachments++;
      }
      totalAttachments += attachmentsInThread;
    }

    // Calculate statistics
    var averageMessages = calculateAverage(messagesPerThread);
    var minMessages = calculateMin(messagesPerThread);
    var maxMessages = calculateMax(messagesPerThread);
    var medianMessages = calculateMedian(messagesPerThread);

    // Collect data for this label
    var rowData = [
      labelName,
      totalThreads,
      totalMessages,
      averageMessages,
      minMessages,
      maxMessages,
      medianMessages,
      threadsWithAttachments,
      totalAttachments
    ];

    // Append data to the array
    labelData.push(rowData);

    Logger.log('Processed label: ' + labelName);
  }

  // Prepare the headers
  var headers = [
    'Label Name',
    'Total Threads',
    'Total Messages',
    'Average Messages per Thread',
    'Min Messages per Thread',
    'Max Messages per Thread',
    'Median Messages per Thread',
    'Threads with Attachments',
    'Total Attachments'
  ];

  // Output data to Google Sheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('LabelStats');
  if (!sheet) {
    sheet = spreadsheet.insertSheet('LabelStats');
  }
  sheet.clear();
  sheet.appendRow(headers);
  sheet.appendRows(labelData);
  sheet.freezeRows(1);

  Logger.log('Data exported to sheet: LabelStats');
  Logger.log('Gmail label analysis completed successfully.');
}

// Helper function to calculate average
function calculateAverage(array) {
  if (array.length === 0) return 0;
  var sum = array.reduce(function(a, b){ return a + b; }, 0);
  return sum / array.length;
}

// Helper function to calculate minimum
function calculateMin(array) {
  return Math.min.apply(null, array);
}

// Helper function to calculate maximum
function calculateMax(array) {
  return Math.max.apply(null, array);
}

// Helper function to calculate median
function calculateMedian(array) {
  array.sort(function(a, b){ return a - b; });
  var mid = Math.floor(array.length / 2);
  if (array.length % 2 === 0) {
    return (array[mid - 1] + array[mid]) / 2;
  } else {
    return array[mid];
  }
}