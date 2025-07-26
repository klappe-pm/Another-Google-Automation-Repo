/**
 * Script Name: analyze-label-statistics
 * 
 * Script Summary:
 * Exports Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * - Analyze label statistics patterns and trends
 * - Calculate statistics and metrics
 * - Generate insights and recommendations
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Sort data by relevant fields
 * 
 * Script Functions:
 * - analyzeGmailLabels(): Analyzes gmail labels and generates insights
 * - calculateAverage(): Performs calculations on average
 * - calculateMedian(): Performs calculations on median
 * 
 * Script Helper Functions:
 * - calculateMax(): Performs calculations on max
 * - calculateMin(): Performs calculations on min
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 */

/  / Helper function to calculate average
 // Helper function to calculate minimum
 // Helper function to calculate maximum
 // Helper function to calculate median

// Main Functions

/**

 * Analyzes gmail labels and generates insights
 * @returns {number} The calculated value

 */

function analyzeGmailLabels() {
  Logger.log('Starting Gmail label analysis...'); // Fetch all labels;
  var labels = GmailApp.getLabels();
  Logger.log('Fetched ' + labels.length + ' labels.'); // Initialize an array to hold data for each label;
  var labelData = []; // Process each label;
  for (var i = 0; i < labels.length; i ++ ) {
    var label = labels[i];
    var labelName = label.getName();
    Logger.log('Processing label: ' + labelName); // Get all threads in the label;
    var threads = label.getThreads();
    Logger.log('Found ' + threads.length + ' threads in label: ' + labelName); // Initialize counters;
    var totalThreads = threads.length;
    var totalMessages = 0;
    var threadsWithAttachments = 0;
    var totalAttachments = 0;
    var messagesPerThread = []; // Process each thread;
    for (var j = 0; j < threads.length; j ++ ) {
      var thread = threads[j];
      var messages = thread.getMessages();
      var messageCount = messages.length;
      totalMessages += messageCount;
      messagesPerThread.push(messageCount); // Check for attachments;
      var hasAttachment = false;
      var attachmentsInThread = 0;
      for (var k = 0; k < messages.length; k ++ ) {
        var message = messages[k];
        if (message.hasAttachments()) {
          hasAttachment = true;
          attachmentsInThread += message.getAttachments().length;
        }
      }
      if (hasAttachment) {
        threadsWithAttachments ++; }
      totalAttachments += attachmentsInThread;
    } // Calculate statistics
    var averageMessages = calculateAverage(messagesPerThread);
    var minMessages = calculateMin(messagesPerThread);
    var maxMessages = calculateMax(messagesPerThread);
    var medianMessages = calculateMedian(messagesPerThread); // Collect data for this label;
    var rowData = [;
      labelName,
      totalThreads,
      totalMessages,
      averageMessages,
      minMessages,
      maxMessages,
      medianMessages,
      threadsWithAttachments,
      totalAttachments
    ]; // Append data to the array
    labelData.push(rowData);

    Logger.log('Processed label: ' + labelName);
  } // Prepare the headers
  var headers = [;
    'Label Name',
    'Total Threads',
    'Total Messages',
    'Average Messages per Thread',
    'Min Messages per Thread',
    'Max Messages per Thread',
    'Median Messages per Thread',
    'Threads with Attachments',
    'Total Attachments'
  ]; // Output data to Google Sheet
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

/**

 * Performs calculations on average
 * @param
 * @param {Array} array - Array of elements
 * @returns {number} The calculated value

 */

function calculateAverage(array) {
  if (array.length === 0) return 0;
  var sum = array.reduce(function (a, b) { return a + b; }, 0);
  return sum / array.length;
}

/**

 * Performs calculations on median
 * @param
 * @param {Array} array - Array of elements
 * @returns {number} The calculated value

 */

function calculateMedian(array) {
  array.sort(function (a, b) { return a - b; });
  var mid = Math.floor(array.length / 2);
  if (array.length % 2 === 0) {
    return (array[mid - 1] + array[mid]) / 2;
  } else {
    return array[mid];
  }
}

// Helper Functions

/**

 * Performs calculations on max
 * @param
 * @param {Array} array - Array of elements
 * @returns {number} The calculated value

 */

function calculateMax(array) {
  return Math.max.apply(null, array);
}

/**

 * Performs calculations on min
 * @param
 * @param {Array} array - Array of elements
 * @returns {number} The calculated value

 */

function calculateMin(array) {
  return Math.min.apply(null, array);
}