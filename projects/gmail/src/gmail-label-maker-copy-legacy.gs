function processGmailEmails() {
  // Retrieve the last processed month
  var lastProcessedMonth = getLastProcessedMonth();
  
  // Directly set the start and end dates for processing
  // UPDATE_DATES_HERE
  var startDate = new Date('2024-02-01'); // Set your start date here
  var endDate = new Date('2024-02-29');   // Set your end date here
  
  // Ensure dates are set to the beginning and end of the day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  // Generate date range query
  var query = `after:${Utilities.formatDate(startDate, Session.getTimeZone(), 'yyyy/MM/dd')} before:${Utilities.formatDate(endDate, Session.getTimeZone(), 'yyyy/MM/dd')} -in:spam -in:trash`;
  
  var threads = GmailApp.search(query);
  
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    // Process the thread by applying labels based on sender name
    applySenderLabels(thread);
  }
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
