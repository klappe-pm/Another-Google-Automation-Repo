/**
 * Script Name: process-labels-by-date
 * 
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * - Process labels by date data transformations
 * - Apply business rules and logic
 * - Ensure data consistency
 * 
 * Script Steps:
 * 1. Connect to Gmail service
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Format output for presentation
 * 5. Send notifications or reports
 * 
 * Script Functions:
 * - applySenderLabels(): Sends applyer labels or communications
 * - extractAndSanitizeSender(): Extracts specific information
 * - getMonthsToProcess(): Gets specific months to process or configuration
 * - getOrCreateLabel(): Gets specific or create label or configuration
 * - processGmailEmails(): Processes and transforms gmail emails
 * - processMonth(): Processes and transforms month
 * 
 * Script Helper Functions:
 * - getMonthDates(): Gets specific month dates or configuration
 * - isValidLabelName(): Checks boolean condition
 * - sanitizeLabelName(): Cleans and sanitizes input
 * 
 * Script Dependencies:
 * - Underscore.js library
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - Utilities: For utility functions and encoding
 */

/  / Function to generate an array of month dates from start to end
 // Function to process emails for a given month
 // Function to generate start and end dates for a given month
 // Function to apply labels based on sender name
 // Existing labeling functions remain unchanged

// Main Functions

/**

 * Sends applyer labels or communications
 * @param
 * @param {GmailThread} thread - The thread parameter
 * @returns {any} The result

 */

function applySenderLabels(thread) {
  var messages = thread.getMessages();
  if (messages.length > 0) {
    var firstMessage = messages[0];
    var from = firstMessage.getFrom();
    var senderName = extractAndSanitizeSender(from);

    if (senderName) {
      var label = getOrCreateLabel(senderName);
      if (label) {
        thread.addLabel(label);
        Logger.log('Applied label ' + label.getName() + ' to thread from ' + senderName);
      } else {
        Logger.log('Failed to apply label for thread from ' + senderName);
      }
    } else {
      Logger.log('Invalid sender name for email: ' + from);
    }
  }
}

/**

 * Gets specific months to process or configuration
 * @param
 * @param {any} startDate - The startDate to retrieve
 * @param {any} endDate - The endDate to retrieve
 * @returns {any} The requested any

 */

function getMonthsToProcess(startDate, endDate) {
  var months = [];
  var month = new Date(startDate);
  month.setDate(1);
  while (month < = endDate) {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1); // Prevent infinite loop;
    if (months.length > 100) break;
  }
  return months;
}

/**

 * Gets specific or create label or configuration
 * @param
 * @param {string} labelName - The labelName to retrieve
 * @returns {any} The requested any

 */

function getOrCreateLabel(labelName) {
  if (!isValidLabelName(labelName)) {
    Logger.log('Invalid label name: ' + labelName);
    return null;
  }

  var labels = GmailApp.getUserLabels();
  for (var i = 0; i < labels.length; i ++ ) {
    if (labels[i].getName() === labelName) {
      Logger.log('Found existing label: ' + labelName);
      return labels[i];
    }
  }

  try {
    var newLabel = GmailApp.createLabel(labelName);
    Logger.log('Created new label: ' + labelName);
    return newLabel;
  } catch (e) {
    Logger.log('Error creating label ' + labelName + ': ' + e.message);
    return null;
  }
}

/**

 * Processes and transforms gmail emails
 * @returns {any} The result

 */

function processGmailEmails() {
  Logger.log('Starting email processing...'); // Define the date range;
  var startDate = new Date(2023, 9, 1); // October 1, 2023 (months are 0 - indexed);
  var endDate = new Date(2025, 0, 16); // January 16, 2025 // Get the list of months to process within the date range;
  var monthsToProcess = getMonthsToProcess(startDate, endDate); // Process each month;
  for (var i = 0; i < monthsToProcess.length; i ++ ) {
    var monthDate = monthsToProcess[i];
    processMonth(monthDate);
  }

  Logger.log('Email processing completed successfully.');
}

/**

 * Processes and transforms month
 * @param
 * @param {any} monthDate - The monthDate parameter
 * @returns {any} The result

 */

function processMonth(monthDate) {
  var dates = getMonthDates(monthDate.getFullYear(), monthDate.getMonth());
  var query = `after:${Utilities.formatDate(dates.start, Session.getTimeZone(), 'yyyy / MM / dd')} before:${Utilities.formatDate(dates.end, Session.getTimeZone(), 'yyyy / MM / dd')} - in:spam - in:trash`;
  var threads = GmailApp.search(query);

  for (var i = 0; i < threads.length; i ++ ) {
    var thread = threads[i]; // Process the thread by applying labels based on sender name;
    applySenderLabels(thread);
  }
}

// Helper Functions

/**

 * Extracts specific information
 * @param
 * @param {any} from - The from parameter
 * @returns {any} The result

 */

function extractAndSanitizeSender(from) { // Extract the sender's name from the 'From' field
  var nameMatch = from.match( / ^. * ?(?= < ) / );
  var senderName = nameMatch ? nameMatch[0].trim() : from;
  return sanitizeLabelName(senderName);
}

/**

 * Gets specific month dates or configuration
 * @param
 * @param {any} year - The year to retrieve
 * @param {any} month - The month to retrieve
 * @returns {any} The requested any

 */

function getMonthDates(year, month) {
  var startDate = new Date(year, month, 1);
  var endDate = new Date(year, month + 1, 1);
  endDate.setDate(endDate.getDate() - 1);
  return {
    start: startDate,
    end: endDate
  };
}

/**

 * Checks boolean condition
 * @param
 * @param {string} name - The name to use
 * @returns {any} True if condition is met, false otherwise

 */

function isValidLabelName(name) {
  if (name.length > 40) {
    return false;
  }

  if (name.startsWith('.') || name.endsWith('.') || name.startsWith('_') || name.endsWith('_') || name.startsWith(' - ') || name.endsWith(' - ') || name.startsWith(' / ') || name.endsWith(' / ')) {
    return false;
  }

  return / ^[a - zA - Z0 - 9 _\ - \.\ / ] + $ / .test(name);
}

/**

 * Cleans and sanitizes input
 * @param
 * @param {string} name - The name to use
 * @returns {any} The result

 */

function sanitizeLabelName(name) { // Replace invalid characters with ' - '
  name = name.replace( / [^a - zA - Z0 - 9_. - ] / g, ' - '); // Remove leading / trailing invalid characters;
  name = name.replace( / ^[. - ] + |[. - ] + $ / g, ''); // Truncate to 40 characters;
  name = name.substring(0, 40);
  if (name === '') {
    name = 'default - label'; // Assign a default label if sanitization results in an empty string;
  }
  return name;
}