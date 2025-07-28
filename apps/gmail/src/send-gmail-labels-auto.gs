/**
  * Script Name: send- gmail- labels- auto
  *
  * Script Summary:
  * Creates Gmail labels for automated workflow processing.
  *
  * Script Purpose:
  * - Handle bulk operations efficiently
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Connect to Gmail service
  * 3. Fetch source data
  * 4. Process and transform data
  * 5. Format output for presentation
  * 6. Send notifications or reports
  *
  * Script Functions:
  * - applySenderLabels(): Sends applyer labels or communications
  * - extractAndSanitizeSender(): Extracts specific information
  * - getMonthDates(): Gets specific month dates or configuration
  * - getMonthsToProcess(): Gets specific months to process or configuration
  * - getOrCreateLabel(): Gets specific or create label or configuration
  * - logError(): Logs error or messages
  * - onOpen(): Processes email data
  * - processMonth(): Processes and transforms month
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
  * - SpreadsheetApp: For spreadsheet operations
  * - Utilities: For utility functions and encoding
  */

const CONFIG = {
  BATCH_SIZE: 50, // Threads per batch
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 3600, // 1 hour
  MAX_MONTHS: 100, // Safety limit
  LABEL_CACHE: new Map() // In- memory label cache
};

) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    scriptName: 'gmail- labels- auto- sender'
  };

  console.error('Script Error:', JSON.stringify(errorDetails, null, 2));
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
}

/**

  * Processes gmail emails

  */

function processGmailEmails() {
  try {
    Logger.log('Starting automated sender- based email labeling...');

    // Define the date range
    const startDate = new Date(2023, 9, 1); // October 1, 2023 (months are 0- indexed)
    const endDate = new Date(2025, 0, 16); // January 16, 2025

    // Get the list of months to process within the date range
    const monthsToProcess = getMonthsToProcess(startDate, endDate);
    Logger.log(`Processing ${monthsToProcess.length} months from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    let totalThreadsProcessed = 0;
    let totalLabelsApplied = 0;

    // Process each month
    for (let i = 0; i < monthsToProcess.length; i+ + ) {
      const monthDate = monthsToProcess[i];
      try {
        const monthStats = processMonth(monthDate);
        totalThreadsProcessed + = monthStats.threadsProcessed;
        totalLabelsApplied + = monthStats.labelsApplied;

        Logger.log(`Month ${i + 1}/ ${monthsToProcess.length} completed: ${monthStats.threadsProcessed} threads, ${monthStats.labelsApplied} labels applied`);
      } catch (error) {
        logError(error, { month: monthDate.toDateString() });
      }
    }

    Logger.log(`Email processing completed successfully. Total: ${totalThreadsProcessed} threads processed, ${totalLabelsApplied} labels applied.`);

  } catch (error) {
    logError(error, { function: 'processGmailEmails' });
    throw new Error(`Failed to process Gmail emails: ${error.message}`);
  }
}

// Main Functions

/**

  * Sends applyer labels or communications
  * @param
  * @param {GmailThread} thread - The thread parameter
  * @returns {boolean} True if successful, false otherwise

  */

function applySenderLabels(thread) {
  try {
    const messages = thread.getMessages();
    if (messages.length = = = 0) return false;

    const firstMessage = messages[0];
    const from = firstMessage.getFrom();
    const senderName = extractAndSanitizeSender(from);

    if (! senderName) {
      Logger.log(`Invalid sender name for email: ${from}`);
      return false;
    }

    const label = getOrCreateLabel(senderName);
    if (label) {
      thread.addLabel(label);
      Logger.log(`Applied label "${label.getName()}" to thread from "${senderName}"`);
      return true;
    } else {
      Logger.log(`Failed to create/ get label for sender: ${senderName}`);
      return false;
    }

  } catch (error) {
    logError(error, { function: 'applySenderLabels' });
    return false;
  }
}

/**

  * Extracts specific information
  * @param
  * @param {any} from - The from parameter
  * @returns {boolean} True if successful, false otherwise

  */

function extractAndSanitizeSender(from) {
  try {
    // Extract the sender's name from the 'From' field
    const nameMatch = from.match(/ ^.* ?(?= < )/ );
    const senderName = nameMatch ? nameMatch[0].trim() : from;
    return sanitizeLabelName(senderName);
  } catch (error) {
    logError(error, { function: 'extractAndSanitizeSender', from });
    return null;
  }
}

/**

  * Gets specific month dates or configuration
  * @param
  * @param {any} year - The year to retrieve
  * @param {any} month - The month to retrieve
  * @returns {boolean} True if found, false otherwise

  */

function getMonthDates(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);
  endDate.setDate(endDate.getDate() - 1);

  return {
    start: startDate,
    end: endDate
  };
}

/**

  * Gets specific months to process or configuration
  * @param
  * @param {any} startDate - The startDate to retrieve
  * @param {any} endDate - The endDate to retrieve
  * @returns {boolean} True if found, false otherwise

  */

function getMonthsToProcess(startDate, endDate) {
  const months = [];
  const month = new Date(startDate);
  month.setDate(1);

  while (month < = endDate && months.length < CONFIG.MAX_MONTHS) {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1);
  }

  return months;
}

/**

  * Gets specific or create label or configuration
  * @param
  * @param {string} labelName - The labelName to retrieve
  * @returns {boolean} True if found, false otherwise

  */

function getOrCreateLabel(labelName) {
  if (! isValidLabelName(labelName)) {
    Logger.log(`Invalid label name: ${labelName}`);
    return null;
  }

  // Check cache first
  if (CONFIG.LABEL_CACHE.has(labelName)) {
    return CONFIG.LABEL_CACHE.get(labelName);
  }

  // Check existing labels
  const labels = GmailApp.getUserLabels();
  for (const label of labels) {
    if (label.getName() = = = labelName) {
      Logger.log(`Found existing label: ${labelName}`);
      CONFIG.LABEL_CACHE.set(labelName, label);
      return label;
    }
  }

  // Create new label
  try {
    const newLabel = GmailApp.createLabel(labelName);
    Logger.log(`Created new label: ${labelName}`);
    CONFIG.LABEL_CACHE.set(labelName, newLabel);
    return newLabel;
  } catch (error) {
    logError(error, { function: 'getOrCreateLabel', labelName });
    return null;
  }
}

/**

  * Logs error or messages
  * @param
  * @param {any} error - The error parameter
  * @param {string} context - The context parameter
  * @returns {boolean} True if successful, false otherwise

  */

function logError(error, context = {}

/**

  * Processes email data
  * @returns {boolean} True if successful, false otherwise

  */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gmail Auto- Labeling')
    .addItem('Process Emails by Sender', 'processGmailEmails')
    .addToUi();
}

/**

  * Processes and transforms month
  * @param
  * @param {any} monthDate - The monthDate parameter
  * @returns {boolean} True if successful, false otherwise

  */

function processMonth(monthDate) {
  const dates = getMonthDates(monthDate.getFullYear(), monthDate.getMonth());
  const query = `after:${Utilities.formatDate(dates.start, Session.getTimeZone(), 'yyyy/ MM/ dd')} before:${Utilities.formatDate(dates.end, Session.getTimeZone(), 'yyyy/ MM/ dd')} - in:spam - in:trash`;

  const threads = GmailApp.search(query);
  let labelsApplied = 0;

  Logger.log(`Processing ${threads.length} threads for ${monthDate.toDateString().substring(4, 7)} ${monthDate.getFullYear()}`);

  // Process threads in batches
  for (let i = 0; i < threads.length; i + = CONFIG.BATCH_SIZE) {
    const batch = threads.slice(i, i + CONFIG.BATCH_SIZE);

    for (const thread of batch) {
      try {
        if (applySenderLabels(thread)) {
          labelsApplied+ + ;
        }
      } catch (error) {
        logError(error, { threadId: thread.getId() });
      }
    }
  }

  return {
    threadsProcessed: threads.length,
    labelsApplied: labelsApplied
  };
}

// Helper Functions

/**

  * Checks boolean condition
  * @param
  * @param {string} name - The name to use
  * @returns {boolean} True if condition is met, false otherwise

  */

function isValidLabelName(name) {
  if (! name || name.length > 40) {
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
  * @returns {boolean} True if successful, false otherwise

  */

function sanitizeLabelName(name) {
  if (! name) return null;

  // Replace invalid characters with '- '
  name = name.replace(/ [^a- zA- Z0- 9_.- ]/ g, '- ');
  // Remove leading/ trailing invalid characters
  name = name.replace(/ ^[.- ]+ |[.- ]+ $/ g, '');
  // Truncate to 40 characters
  name = name.substring(0, 40);

  if (name = = = '') {
    name = 'default- label'; // Assign a default label if sanitization results in an empty string
  }

  return name;
}