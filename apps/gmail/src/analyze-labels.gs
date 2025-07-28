/**
  * Script Name: analyze- labels
  *
  * Script Summary:
  * Exports Gmail labels for automated workflow processing.
  *
  * Script Purpose:
  * - Analyze labels patterns and trends
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
  let labels = GmailApp.getLabels();
  Logger.log('Fetched ' + labels.length + ' labels.'); // Initialize an array to hold data for each label;
  let labelData = []; // Process each label;
  for (let i = 0; i < labels.length; i + + ) {
    let label = labels[i];
    let labelName = label.getName();
    Logger.log('Processing label: ' + labelName); // Get all threads in the label;
    let threads = label.getThreads();
    Logger.log('Found ' + threads.length + ' threads in label: ' + labelName); // Initialize counters;
    let totalThreads = threads.length;
    let totalMessages = 0;
    let threadsWithAttachments = 0;
    let totalAttachments = 0;
    let messagesPerThread = []; // Process each thread;
    for (let j = 0; j < threads.length; j + + ) {
      let thread = threads[j];
      let messages = thread.getMessages();
      let messageCount = messages.length;
      totalMessages + = messageCount;
      messagesPerThread.push(messageCount); // Check for attachments;
      let hasAttachment = false;
      let attachmentsInThread = 0;
      for (let k = 0; k < messages.length; k + + ) {
        let message = messages[k];
        if (message.hasAttachments()) {
          hasAttachment = true;
          attachmentsInThread + = message.getAttachments().length;
        }
      }
      if (hasAttachment) {
        threadsWithAttachments + + ; }
      totalAttachments + = attachmentsInThread;
    } // Calculate statistics
    let averageMessages = calculateAverage(messagesPerThread);
    let minMessages = calculateMin(messagesPerThread);
    let maxMessages = calculateMax(messagesPerThread);
    let medianMessages = calculateMedian(messagesPerThread); // Collect data for this label;
    let rowData = [;
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
  let headers = [;
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
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('LabelStats');
  if (! sheet) {
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
  if (array.length = = = 0) return 0;
  let sum = array.reduce(function (a, b) { return a + b; }, 0);
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
  let mid = Math.floor(array.length / 2);
  if (array.length % 2 = = = 0) {
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