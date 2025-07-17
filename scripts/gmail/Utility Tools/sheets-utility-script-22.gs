/**
 * Script Title: Gmail Label Analysis
 * 
 * GitHub: https://github.com/klappe-pm/GMail-Label-Management-Suite/blob/main/gmail-labels-analysis
 *
 * Script Summary:
 * This script analyzes Gmail labels to provide statistics about the threads and messages within each label.
 * The purpose of the script is to give users insights into their email organization by summarizing key metrics
 * such as the number of threads, messages, attachments, and various statistical measures (average, min, max, median)
 * of messages per thread for each label.
 *
 * The script solves the problem of manually counting and analyzing email threads and messages, providing an automated
 * way to gather this information and export it to a Google Sheet for further analysis.
 *
 * A successful script execution involves fetching all Gmail labels, processing each label to gather the required
 * statistics, and exporting the data to a Google Sheet named 'LabelStats'. The script logs progress and results to
 * the Google Apps Script IDE for debugging and verification.
 *
 * Functions-Alphabetical:
 * - analyzeGmailLabels(): Main function to analyze Gmail labels and export data to a Google Sheet.
 * - calculateAverage(array): Calculates the average of an array of numbers.
 * - calculateMax(array): Calculates the maximum value in an array of numbers.
 * - calculateMedian(array): Calculates the median of an array of numbers.
 * - calculateMin(array): Calculates the minimum value in an array of numbers.
 *
 * Functions-Ordered:
 * 1. analyzeGmailLabels(): Main function to analyze Gmail labels and export data to a Google Sheet.
 * 2. calculateAverage(array): Calculates the average of an array of numbers.
 * 3. calculateMax(array): Calculates the maximum value in an array of numbers.
 * 4. calculateMedian(array): Calculates the median of an array of numbers.
 * 5. calculateMin(array): Calculates the minimum value in an array of numbers.
 *
 * Script-Steps:
 * 1. Fetch all Gmail labels.
 * 2. Initialize an array to hold data for each label.
 * 3. Process each label to gather statistics about threads and messages.
 * 4. For each label, get all threads and initialize counters for threads, messages, and attachments.
 * 5. Process each thread to count messages and check for attachments.
 * 6. Calculate statistical measures (average, min, max, median) for messages per thread.
 * 7. Collect data for each label and append it to the data array.
 * 8. Prepare headers for the Google Sheet.
 * 9. Output data to a Google Sheet named 'LabelStats'.
 * 10. Log progress and results to the Google Apps Script IDE.
 *
 * Helper Functions:
 * - calculateAverage(array): Calculates the average of an array of numbers.
 * - calculateMax(array): Calculates the maximum value in an array of numbers.
 * - calculateMedian(array): Calculates the median of an array of numbers.
 * - calculateMin(array): Calculates the minimum value in an array of numbers.
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