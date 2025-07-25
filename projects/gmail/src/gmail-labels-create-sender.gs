/**
 * Script Title: gmail-labels-maker-sender
 *
 * Script Summary:
 * This script processes Gmail emails by applying labels based on the sender's name. It retrieves emails from the last processed month to the current month,
 * and applies a label corresponding to the sender's name for each email thread. The script ensures that each sender has a unique label, creating new labels
 * as needed. It helps in organizing emails by sender, making it easier to manage and search through emails.
 *
 * Purpose:
 * The purpose of this script is to automate the organization of Gmail emails by labeling them based on the sender's name. This helps users quickly identify
 * and manage emails from specific senders.
 *
 * What the Script Does:
 * - Retrieves the last processed month from user properties.
 * - Determines the range of months to process from the last processed month to the current month.
 * - Searches for email threads within each month.
 * - Applies labels to email threads based on the sender's name.
 * - Logs the actions performed and any errors encountered.
 *
 * Problem Solved:
 * The script solves the problem of manually organizing emails by sender, which can be time-consuming and error-prone. By automating this process, users can
 * focus on other tasks while ensuring their emails are organized efficiently.
 *
 * Successful Script Execution:
 * A successful script execution involves processing all email threads from the last processed month to the current month, applying the correct labels based
 * on the sender's name, and logging the actions without encountering any errors.
 *
 * Functions-Alphabetical:
 * - applySenderLabels(thread): Applies labels to email threads based on the sender's name.
 * - extractAndSanitizeSender(from): Extracts and sanitizes the sender's name from the 'From' field.
 * - getLastProcessedMonth(): Retrieves the last processed month from user properties.
 * - getMonthDates(year, month): Generates start and end dates for a given month.
 * - getMonthsToProcess(startDate, endDate): Generates an array of month dates from start to end.
 * - getOrCreateLabel(labelName): Retrieves an existing label or creates a new one.
 * - isValidLabelName(name): Checks if a label name is valid.
 * - processGmailEmails(): Main function to process Gmail emails.
 * - processMonth(monthDate): Processes emails for a given month.
 * - sanitizeLabelName(name): Sanitizes a label name by replacing invalid characters.
 * - setLastProcessedMonth(monthDate): Sets the last processed month in user properties.
 *
 * Functions-Ordered:
 * 1. processGmailEmails(): Main function to process Gmail emails.
 * 2. getLastProcessedMonth(): Retrieves the last processed month from user properties.
 * 3. getMonthsToProcess(startDate, endDate): Generates an array of month dates from start to end.
 * 4. processMonth(monthDate): Processes emails for a given month.
 * 5. getMonthDates(year, month): Generates start and end dates for a given month.
 * 6. applySenderLabels(thread): Applies labels to email threads based on the sender's name.
 * 7. extractAndSanitizeSender(from): Extracts and sanitizes the sender's name from the 'From' field.
 * 8. getOrCreateLabel(labelName): Retrieves an existing label or creates a new one.
 * 9. isValidLabelName(name): Checks if a label name is valid.
 * 10. sanitizeLabelName(name): Sanitizes a label name by replacing invalid characters.
 * 11. setLastProcessedMonth(monthDate): Sets the last processed month in user properties.
 *
 * Script-Steps:
 * 1. Retrieve the last processed month from user properties.
 * 2. Determine the start month for this run.
 * 3. Set the current month.
 * 4. Get the list of months to process.
 * 5. For each month, process the emails.
 * 6. For each email thread, apply labels based on the sender's name.
 * 7. Log the actions performed and any errors encountered.
 * 8. Print a success message to the Google Apps Script IDE.
 *
 * Helper Functions:
 * - extractAndSanitizeSender(from): Extracts and sanitizes the sender's name from the 'From' field.
 * - getOrCreateLabel(labelName): Retrieves an existing label or creates a new one.
 * - isValidLabelName(name): Checks if a label name is valid.
 * - sanitizeLabelName(name): Sanitizes a label name by replacing invalid characters.
 */

function processGmailEmails() {
  Logger.log('Starting Gmail email processing...');

  // Retrieve the last processed month
  var lastProcessedMonth = getLastProcessedMonth();
  Logger.log('Last processed month: ' + lastProcessedMonth);

  // Determine the start month for this run
  var startMonthDate;
  if (lastProcessedMonth) {
    startMonthDate = new Date(lastProcessedMonth);
    startMonthDate.setMonth(startMonthDate.getMonth() + 1);
  } else {
    startMonthDate = new Date(2023, 10, 01); // Start from October 2023
  }
  Logger.log('Start month: ' + startMonthDate);

  // Set the current month
  var currentMonthDate = new Date();
  currentMonthDate.setDate(1);
  Logger.log('Current month: ' + currentMonthDate);

  // Get the list of months to process
  var monthsToProcess = getMonthsToProcess(startMonthDate, currentMonthDate);
  Logger.log('Months to process: ' + monthsToProcess.length);

  // Process each month
  for (var i = 0; i < monthsToProcess.length; i++) {
    var monthDate = monthsToProcess[i];
    processMonth(monthDate);
    setLastProcessedMonth(monthDate);
  }

  Logger.log('Gmail email processing completed successfully.');
}

// Function to retrieve the last processed month
function getLastProcessedMonth() {
  var properties = PropertiesService.getUserProperties();
  var lastMonthString = properties.getProperty('lastProcessedMonth');
  if (lastMonthString) {
    return new Date(lastMonthString);
  } else {
    return null;
  }
}

// Function to set the last processed month
function setLastProcessedMonth(monthDate) {
  var properties = PropertiesService.getUserProperties();
  properties.setProperty('lastProcessedMonth', Utilities.formatDate(monthDate, Session.getTimeZone(), 'yyyy-MM'));
}

// Function to generate an array of month dates from start to end
function getMonthsToProcess(startDate, endDate) {
  var months = [];
  var month = new Date(startDate);
  month.setDate(1);
  while (month <= endDate) {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1);
    // Prevent infinite loop
    if (months.length > 100) break;
  }
  return months;
}

// Function to process emails for a given month
function processMonth(monthDate) {
  Logger.log('Processing month: ' + monthDate);
  var dates = getMonthDates(monthDate.getFullYear(), monthDate.getMonth());
  var query = `after:${Utilities.formatDate(dates.start, Session.getTimeZone(), 'yyyy/MM/dd')} before:${Utilities.formatDate(dates.end, Session.getTimeZone(), 'yyyy/MM/dd')} -in:spam -in:trash`;
  var threads = GmailApp.search(query);

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    // Process the thread by applying labels based on sender name
    applySenderLabels(thread);
  }
}

// Function to generate start and end dates for a given month
function getMonthDates(year, month) {
  var startDate = new Date(year, month, 1);
  var endDate = new Date(year, month + 1, 1);
  endDate.setDate(endDate.getDate() - 1);
  return {
    start: startDate,
    end: endDate
  };
}

// Function to apply labels based on sender name
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

// Existing labeling functions remain unchanged
function extractAndSanitizeSender(from) {
  // Extract the sender's name from the 'From' field
  var nameMatch = from.match(/^.*?(?=<)/);
  var senderName = nameMatch ? nameMatch[0].trim() : from;
  return sanitizeLabelName(senderName);
}

function sanitizeLabelName(name) {
  // Replace invalid characters with '-'
  name = name.replace(/[^a-zA-Z0-9_.-]/g, '-');
  // Remove leading/trailing invalid characters
  name = name.replace(/^[.-]+|[.-]+$/g, '');
  // Truncate to 40 characters
  name = name.substring(0, 40);
  if (name === '') {
    name = 'default-label'; // Assign a default label if sanitization results in an empty string
  }
  return name;
}

function getOrCreateLabel(labelName) {
  if (!isValidLabelName(labelName)) {
    Logger.log('Invalid label name: ' + labelName);
    return null;
  }

  var labels = GmailApp.getUserLabels();
  for (var i = 0; i < labels.length; i++) {
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

function isValidLabelName(name) {
  if (name.length > 40) {
    return false;
  }

  if (name.startsWith('.') || name.endsWith('.') ||
      name.startsWith('_') || name.endsWith('_') ||
      name.startsWith('-') || name.endsWith('-') ||
      name.startsWith('/') || name.endsWith('/')) {
    return false;
  }

  return /^[a-zA-Z0-9 _\-\.\/]+$/.test(name);
}
