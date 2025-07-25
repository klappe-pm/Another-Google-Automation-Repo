/**
 * Script Title: Gmail Email Processor
 * 
 * GitHub: https://github.com/klappe-pm/GMail-Label-Management-Suite/blob/main/gmail-labels-date-processor
 *
 * Script Summary:
 * This script processes Gmail emails within a specified date range, organizing them by applying labels based on the sender's name.
 *
 * Purpose:
 * The purpose of this script is to automate the organization of emails by categorizing them using labels derived from the sender's name.
 *
 * Description:
 * The script iterates through each month within a specified date range, searches for emails within that month, and applies a label to each email thread based on the sender's name. It sanitizes the sender's name to create valid label names and either uses existing labels or creates new ones as needed.
 *
 * Problem Solved:
 * This script addresses the issue of email clutter by automatically categorizing emails, making it easier to manage and find specific emails.
 *
 * Successful Execution:
 * A successful execution of this script results in all emails within the specified date range being labeled according to the sender's name, with logs indicating the labels applied and any errors encountered.
 *
 * Functions-Alphabetical:
 * - applySenderLabels(thread): Applies a label to a Gmail thread based on the sender's name.
 * - extractAndSanitizeSender(from): Extracts and sanitizes the sender's name from the 'From' field.
 * - getMonthDates(year, month): Generates start and end dates for a given month.
 * - getMonthsToProcess(startDate, endDate): Generates an array of month dates from start to end.
 * - getOrCreateLabel(labelName): Gets an existing label or creates a new one if it doesn't exist.
 * - isValidLabelName(name): Checks if a label name is valid.
 * - processGmailEmails(): Main function to process Gmail emails within a date range.
 * - processMonth(monthDate): Processes emails for a given month.
 * - sanitizeLabelName(name): Sanitizes a label name to ensure it is valid.
 *
 * Functions-Ordered:
 * 1. processGmailEmails(): Main function to process Gmail emails within a date range.
 * 2. getMonthsToProcess(startDate, endDate): Generates an array of month dates from start to end.
 * 3. processMonth(monthDate): Processes emails for a given month.
 * 4. getMonthDates(year, month): Generates start and end dates for a given month.
 * 5. applySenderLabels(thread): Applies a label to a Gmail thread based on the sender's name.
 * 6. extractAndSanitizeSender(from): Extracts and sanitizes the sender's name from the 'From' field.
 * 7. getOrCreateLabel(labelName): Gets an existing label or creates a new one if it doesn't exist.
 * 8. sanitizeLabelName(name): Sanitizes a label name to ensure it is valid.
 * 9. isValidLabelName(name): Checks if a label name is valid.
 *
 * Script-Steps:
 * 1. Define the date range for processing emails.
 * 2. Generate an array of month dates within the specified date range.
 * 3. For each month, generate the start and end dates.
 * 4. Search for emails within the month's date range.
 * 5. For each email thread, extract and sanitize the sender's name.
 * 6. Get or create a label based on the sender's name.
 * 7. Apply the label to the email thread.
 * 8. Log the actions performed and any errors encountered.
 *
 * Helper Functions:
 * - extractAndSanitizeSender(from): Extracts and sanitizes the sender's name from the 'From' field.
 * - getOrCreateLabel(labelName): Gets an existing label or creates a new one if it doesn't exist.
 * - isValidLabelName(name): Checks if a label name is valid.
 * - sanitizeLabelName(name): Sanitizes a label name to ensure it is valid.
 */

function processGmailEmails() {
  Logger.log('Starting email processing...');

  // Define the date range
  var startDate = new Date(2023, 9, 1); // October 1, 2023 (months are 0-indexed)
  var endDate = new Date(2025, 0, 16); // January 16, 2025

  // Get the list of months to process within the date range
  var monthsToProcess = getMonthsToProcess(startDate, endDate);

  // Process each month
  for (var i = 0; i < monthsToProcess.length; i++) {
    var monthDate = monthsToProcess[i];
    processMonth(monthDate);
  }

  Logger.log('Email processing completed successfully.');
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