/**
 * Script Name: send- gmail- labels- create
 *
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 *
 * Script Purpose:
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
 * - getMonthsToProcess(): Gets specific months to process or configuration
 * - getOrCreateLabel(): Gets specific or create label or configuration
 * - processGmailEmails(): Processes and transforms gmail emails
 * - processMonth(): Processes and transforms month
 * - setLastProcessedMonth(): Sets last processed month or configuration values
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
 * - PropertiesService: For storing script properties
 * - Utilities: For utility functions and encoding
 * /

/ / Main Functions

/**

 * Sends applyer labels or communications
 * @param
 * @param {GmailThread} thread - The thread parameter
 * @returns {Object} The result object

 * /

function applySenderLabels(thread) {
  let messages = thread.getMessages();
  if (messages.length > 0) {
    let firstMessage = messages[0];
    let from = firstMessage.getFrom();
    let senderName = extractAndSanitizeSender(from);

    if (senderName) {
      let label = getOrCreateLabel(senderName);
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

 * /

function getLastProcessedMonth() {
  let properties = PropertiesService.getUserProperties();
  let lastMonthString = properties.getProperty('lastProcessedMonth');
  if (lastMonthString) {
    return new Date(lastMonthString);
  } else {
    return null;
  }
}

/**

 * Gets specific months to process or configuration
 * @param
 * @param {any} startDate - The startDate to retrieve
 * @param {any} endDate - The endDate to retrieve
 * @returns {Object} The requested object

 * /

function getMonthsToProcess(startDate, endDate) {
  let months = [];
  let month = new Date(startDate);
  month.setDate(1);
  while (month < = endDate) {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1);
    / / Prevent infinite loop
    if (months.length > 100) break;
  }
  return months;
}

/**

 * Gets specific or create label or configuration
 * @param
 * @param {string} labelName - The labelName to retrieve
 * @returns {Object} The requested object

 * /

function getOrCreateLabel(labelName) {
  if (! isValidLabelName(labelName)) {
    Logger.log('Invalid label name: ' + labelName);
    return null;
  }

  let labels = GmailApp.getUserLabels();
  for (let i = 0; i < labels.length; i+ + ) {
    if (labels[i].getName() = = = labelName) {
      Logger.log('Found existing label: ' + labelName);
      return labels[i];
    }
  }

  try {
    let newLabel = GmailApp.createLabel(labelName);
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

 * /

function processGmailEmails() {
  Logger.log('Starting Gmail email processing...');

  / / Retrieve the last processed month
  let lastProcessedMonth = getLastProcessedMonth();
  Logger.log('Last processed month: ' + lastProcessedMonth);

  / / Determine the start month for this run
  let startMonthDate;
  if (lastProcessedMonth) {
    startMonthDate = new Date(lastProcessedMonth);
    startMonthDate.setMonth(startMonthDate.getMonth() + 1);
  } else {
    startMonthDate = new Date(2023, 10, 01); / / Start from October 2023
  }
  Logger.log('Start month: ' + startMonthDate);

  / / Set the current month
  let currentMonthDate = new Date();
  currentMonthDate.setDate(1);
  Logger.log('Current month: ' + currentMonthDate);

  / / Get the list of months to process
  let monthsToProcess = getMonthsToProcess(startMonthDate, currentMonthDate);
  Logger.log('Months to process: ' + monthsToProcess.length);

  / / Process each month
  for (let i = 0; i < monthsToProcess.length; i+ + ) {
    let monthDate = monthsToProcess[i];
    processMonth(monthDate);
    setLastProcessedMonth(monthDate);
  }

  Logger.log('Gmail email processing completed successfully.');
}

/**

 * Processes and transforms month
 * @param
 * @param {any} monthDate - The monthDate parameter
 * @returns {Object} The result object

 * /

function processMonth(monthDate) {
  Logger.log('Processing month: ' + monthDate);
  let dates = getMonthDates(monthDate.getFullYear(), monthDate.getMonth());
  let query = `after:${Utilities.formatDate(dates.start, Session.getTimeZone(), 'yyyy/ MM/ dd')} before:${Utilities.formatDate(dates.end, Session.getTimeZone(), 'yyyy/ MM/ dd')} - in:spam - in:trash`;
  let threads = GmailApp.search(query);

  for (let i = 0; i < threads.length; i+ + ) {
    let thread = threads[i];
    / / Process the thread by applying labels based on sender name
    applySenderLabels(thread);
  }
}

/**

 * Sets last processed month or configuration values
 * @param
 * @param {any} monthDate - The monthDate to set
 * @returns {Object} The result object

 * /

function setLastProcessedMonth(monthDate) {
  let properties = PropertiesService.getUserProperties();
  properties.setProperty('lastProcessedMonth', Utilities.formatDate(monthDate, Session.getTimeZone(), 'yyyy- MM'));
}

/ / Helper Functions

/**

 * Extracts specific information
 * @param
 * @param {any} from - The from parameter
 * @returns {Object} The result object

 * /

function extractAndSanitizeSender(from) {
  / / Extract the sender's name from the 'From' field
  let nameMatch = from.match(/ ^.* ?(?= < )/ );
  let senderName = nameMatch ? nameMatch[0].trim() : from;
  return sanitizeLabelName(senderName);
}

/**

 * Gets specific month dates or configuration
 * @param
 * @param {any} year - The year to retrieve
 * @param {any} month - The month to retrieve
 * @returns {Object} The requested object

 * /

function getMonthDates(year, month) {
  let startDate = new Date(year, month, 1);
  let endDate = new Date(year, month + 1, 1);
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
 * @returns {Object} True if condition is met, false otherwise

 * /

function isValidLabelName(name) {
  if (name.length > 40) {
    return false;
  }

  if (name.startsWith('.') || name.endsWith('.') ||
      name.startsWith('_') || name.endsWith('_') ||
      name.startsWith('- ') || name.endsWith('- ') ||
      name.startsWith('/ ') || name.endsWith('/ ')) {
    return false;
  }

  return / ^[a- zA- Z0- 9 _\- \.\/ ]+ $/ .test(name);
}

/**

 * Cleans and sanitizes input
 * @param
 * @param {string} name - The name to use
 * @returns {Object} The result object

 * /

function sanitizeLabelName(name) {
  / / Replace invalid characters with '- '
  name = name.replace(/ [^a- zA- Z0- 9_.- ]/ g, '- ');
  / / Remove leading/ trailing invalid characters
  name = name.replace(/ ^[.- ]+ |[.- ]+ $/ g, '');
  / / Truncate to 40 characters
  name = name.substring(0, 40);
  if (name = = = '') {
    name = 'default- label'; / / Assign a default label if sanitization results in an empty string
  }
  return name;
}