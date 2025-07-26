/**
 * Script Name: create-labels
 * 
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 * 
 * Script Purpose:
 * - Generate new labels items
 * - Set up required structure and metadata
 * - Apply formatting and organization
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
 * - getLastProcessedMonth(): Gets specific last processed month or configuration
 * - getOrCreateLabel(): Gets specific or create label or configuration
 * - processGmailEmails(): Processes and transforms gmail emails
 * - setLastProcessedMonth(): Sets last processed month or configuration values
 * 
 * Script Helper Functions:
 * - isValidLabelName(): Checks boolean condition
 * - sanitizeLabelName(): Cleans and sanitizes input
 * 
 * Script Dependencies:
 * - Underscore.js library
 * 
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - Utilities: For utility functions and encoding
 */

/  / Function to retrieve the last processed month
 // Function to set the last processed month
 // Function to apply labels based on sender name
 // Existing labeling functions remain unchanged

// Main Functions

/**

 * Sends applyer labels or communications
 * @param
 * @param {GmailThread} thread - The thread parameter
 * @returns {Object} The result object

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

 * Gets specific last processed month or configuration
 * @returns {Object} The requested object

 */

function getLastProcessedMonth() {
  var properties = PropertiesService.getUserProperties();
  var lastMonthString = properties.getProperty('lastProcessedMonth');
  if (lastMonthString) {
    return new Date(lastMonthString);
  } else {
    return null;
  }
}

/**

 * Gets specific or create label or configuration
 * @param
 * @param {string} labelName - The labelName to retrieve
 * @returns {Object} The requested object

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
 * @returns {Object} The result object

 */

function processGmailEmails() { // Retrieve the last processed month
  var lastProcessedMonth = getLastProcessedMonth(); // Directly set the start and end dates for processing // UPDATE_DATES_HERE;
  var startDate = new Date('2024 - 02 - 01'); // Set your start date here;
  var endDate = new Date('2024 - 02 - 29'); // Set your end date here // Ensure dates are set to the beginning and end of the day;
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999); // Generate date range query;
  var query = `after:${Utilities.formatDate(startDate, Session.getTimeZone(), 'yyyy / MM / dd')} before:${Utilities.formatDate(endDate, Session.getTimeZone(), 'yyyy / MM / dd')} - in:spam - in:trash`;

  var threads = GmailApp.search(query);

  for (var i = 0; i < threads.length; i ++ ) {
    var thread = threads[i]; // Process the thread by applying labels based on sender name;
    applySenderLabels(thread);
  }
}

/**

 * Sets last processed month or configuration values
 * @param
 * @param {any} monthDate - The monthDate to set
 * @returns {Object} The result object

 */

function setLastProcessedMonth(monthDate) {
  var properties = PropertiesService.getUserProperties();
  properties.setProperty('lastProcessedMonth', Utilities.formatDate(monthDate, Session.getTimeZone(), 'yyyy - MM'));
}

// Helper Functions

/**

 * Extracts specific information
 * @param
 * @param {any} from - The from parameter
 * @returns {Object} The result object

 */

function extractAndSanitizeSender(from) { // Extract the sender's name from the 'From' field
  var nameMatch = from.match( / ^. * ?(?= < ) / );
  var senderName = nameMatch ? nameMatch[0].trim() : from;
  return sanitizeLabelName(senderName);
}

/**

 * Checks boolean condition
 * @param
 * @param {string} name - The name to use
 * @returns {Object} True if condition is met, false otherwise

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
 * @returns {Object} The result object

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