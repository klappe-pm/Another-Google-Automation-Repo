/**
 * Script Name: markdown- export- emails
 *
 * Script Summary:
 * Exports markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Access Drive file system
 * 4. Fetch source data
 * 5. Validate input data
 * 6. Process and transform data
 * 7. Apply filters and criteria
 * 8. Format output for presentation
 *
 * Script Functions:
 * - getExistingMessageIds(): Gets specific existing message ids or configuration
 * - getOrCreateSheet(): Gets specific or create sheet or configuration
 * - loadConfig(): Loads config from storage
 * - logMessage(): Logs message or messages
 * - onOpen(): Performs specialized operations
 * - processEmails(): Processes and transforms emails
 * - processMessage(): Processes and transforms message
 * - processTransportationEmails(): Processes and transforms transportation emails
 *
 * Script Helper Functions:
 * - convertTo24HourFormat(): Formats convert to24 hour for display
 * - createMarkdownContent(): Creates new markdown content or resources
 * - createMarkdownFile(): Creates new markdown file or resources
 * - extractValue(): Extracts specific information
 * - formatCurrency(): Formats currency for display
 * - getOrCreateFolder(): Gets specific or create folder or configuration
 * - parseEmailBody(): Parses and extracts email body
 * - validateRowData(): Validates row data integrity
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

/  / Hardcoded regex parsers for Uber and Lyft (extensible for other services);
const PARSERS = {
  'uber.com': {
    costTotal: / Total\s\$(\d + (\.\d + )?) / i,
    tripDistance: / \b(\d{1,2}\.\d{1,2})\s + miles\b / i,
    tripDuration: / \|\s + (\d{1,2})\s + min\b / i,
    startTime: / \b(\d{1,2}:\d{2}\s * (?:AM|PM))\b / i,
    startLocation: (startTime) = > new RegExp(startTime + '\\s + ([^\\n] + )', 'i'),
    endTime: (startLocation) = > new RegExp(startLocation.replace( / [. *  + ?^${}()|[\]\\] / g, '\\$&') + '\\s + ([\\d{1,2}:\\d{2}\\s * (?:AM|PM)])', 'i'),
    endLocation: (endTime) = > new RegExp(endTime + '\\s + ([^\\n] + )', 'i');
  },
  'lyft.com': {
    costTotal: / American Express \ * 1005 \$(\d{1,3}\.\d{2}) / i,
    tripDistance: / Lyft Fare \((\d{1,2}\.\d{2})mi\) / i,
    tripDuration: / ,\s * (\d{1,3})m\b / i,
    startTime: / \bPickup\s + (\d{1,2}:\d{2}\s * (?:AM|PM))\b / i,
    startLocation: (startTime) = > new RegExp(startTime + '\\s + ([^\\n] + )', 'i'),
    endTime: (startLocation) = > new RegExp('Drop - off\\s + ' + startLocation.replace( / [. *  + ?^${}()|[\]\\] / g, '\\$&') + '\\s + ([\\d{1,2}:\\d{2}\\s * (?:AM|PM)])', 'i'),
    endLocation: (endTime) = > new RegExp(endTime + '\\s + ([^\\n] + )', 'i');
  }
}; / *  *  * Adds a custom menu to Google Sheets when the spreadsheet is opened. *// *  *  * Processes emails with labels specified in the "Config" sheet. *// *  *  * Loads and validates configuration from the "Config" sheet. * @returns {Object} Configuration object. * @throws {Error} If the "Config" sheet is missing or invalid. *// *  *  * Processes emails for a specific label in batches. * @param {string} label - The Gmail label to search (e.g., 'lyft'). * @param {Object} config - Configuration object from "Config" sheet. * @param {Set} existingMessageIds - Set of already processed message IDs. * @param {Date} dateProcessed - The date of processing. * @param {Folder} folder - The Google Drive folder for Markdown files. * @param {Sheet} sheet - The Google Sheet for summary data. * @returns {number} Number of new emails processed. *// *  *  * Processes a single email, extracting ride details and creating a Markdown file. * @param {GmailMessage} message - The Gmail message to process. * @param {Set} existingMessageIds - Set of already processed message IDs. * @param {Date} dateProcessed - The date of processing. * @param {Folder} folder - The Google Drive folder for Markdown files. * @param {Sheet} sheet - The Google Sheet for summary data. * @param {string} label - The label being processed. * @param {Object} config - Configuration object. * @returns {boolean} True if the message was processed, false if skipped. *// *  *  * Parses an email body to extract ride details using sender - specific regex patterns. * @param {string} body - The email body. * @param {Date} emailDate - The email date. * @param {string} sender - The sender email address. * @param {string} subject - The email subject. * @param {Date} dateProcessed - The processing date. * @param {string} parserKey - The key for the parser config ('uber.com' or 'lyft.com'). * @returns {Object} Parsed ride details. *// *  *  * Validates parsed email data against required fields. * @param {Object} data - Parsed email data. * @param {string[]} requiredFields - Array of required field names. * @returns {boolean} True if valid, false otherwise. *// *  *  * Creates Markdown content with YAML front matter and cleaned email body. * @param {Object} data - Parsed email data. * @param {string} body - Original email body. * @returns {string} Markdown content. *// *  *  * Creates a Markdown file in the specified Google Drive folder. * @param {string} content - Markdown content. * @param {string} filename - File name (without extension). * @param {Folder} folder - Target folder. * @returns {string} URL of the created file. *// *  *  * Gets or creates a folder in Google Drive. * @param {Folder} parentFolder - Parent folder. * @param {string} folderName - Folder name to get or create. * @returns {Folder} The folder. *// *  *  * Gets or creates a sheet in the active spreadsheet. * @param {string} sheetName - Name of the sheet. * @returns {Sheet} The sheet. *// *  *  * Retrieves existing message IDs from the sheet to avoid duplicates. * @param {Sheet} sheet - The sheet. * @returns {Set} Set of message IDs. *// *  *  * Extracts a value from text using a regex. * @param {string} body - Text to search. * @param {RegExp} regex - Regex to use. * @returns {string} Extracted value or empty string. *// *  *  * Formats a numeric value as USD currency. * @param {string|number} value - Value to format. * @returns {string} Formatted currency or empty string. *// *  *  * Converts 12 - hour time to 24 - hour format. * @param {string} time - Time string (e.g., "1:30 PM"). * @returns {string} 24 - hour format (e.g., "13:30") or empty string. *// *  *  * Logs messages with specified verbosity level and context. * @param {string} message - Message to log. * @param {string} level - Log level ('DEBUG', 'INFO', 'ERROR'). * @param {Object} context - Additional context for the log. * @param {string} logLevel - Configured log level from "Config" sheet. *// * Configurable Fields (stored in the "Config" sheet): - PARENT_FOLDER: The Google Drive parent folder name for storing Markdown files (e.g., 'Kevin Lappe vs. Anton LLC Expenses'). - TARGET_FOLDER: The subfolder name for Markdown files (e.g., 'Transportation Expenses'). - SHEET_NAME: The name of the sheet for summarizing email data (e.g., 'Transportation'). - LABELS: Comma - separated list of Gmail labels to process (e.g., 'lyft,uber,taxi'). - SUPPORTED_SENDERS: Comma - separated list of sender domains to process (e.g., 'uber.com,lyft.com'). - LOG_LEVEL: Logging verbosity level ('DEBUG', 'INFO', or 'ERROR'). - BATCH_SIZE: Number of email threads to process per batch (e.g., '50'). - REQUIRED_FIELDS: Comma - separated list of fields required in parsed data (e.g., 'costTotal,startLocation,endLocation'). */ ; // Main Functions

// Main Functions

/**

 * Gets specific existing message ids or configuration
 * @param
 * @param {Sheet} sheet - The sheet to retrieve
 * @returns {Object} The requested object

 */

function getExistingMessageIds(sheet) {
  if (sheet.getLastRow() < 2) return new Set();
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  return new Set(data.flat());
}

/**

 * Gets specific or create sheet or configuration
 * @param
 * @param {string} sheetName - The sheetName to retrieve
 * @returns {Object} The requested object

 */

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (! sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      'messageId', 'dateEmail', 'sender', 'subject', 'costTotal', 'startTime', 'endTime',
      'tripDuration', 'startLocation', 'endLocation', 'tripDistance', 'tripSpeed',
      'tripMileCostTotal', 'tripCostMinuteTotal', 'markdownLink', 'fileUrl'
    ]);
  }
  return sheet;
}

/**

 * Loads config from storage
 * @returns {Object} The result object

 */

function loadConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  if (! configSheet) {
    throw new Error('Missing "Config" sheet in the spreadsheet.');
  }

  const data = configSheet.getDataRange().getValues();
  if (data.length < 2) {
    throw new Error('Empty or invalid "Config" sheet.');
  }

  const config = {};
  data.slice(1).forEach(row = > {
    const key = row[0]?.toString().trim();
    const value = row[1]?.toString().trim();
    if (key && value) {
      config[key] = value;
    }
  }); // Required configuration fields
  const requiredFields = [;
    'PARENT_FOLDER', 'TARGET_FOLDER', 'SHEET_NAME', 'LABELS',
    'SUPPORTED_SENDERS', 'LOG_LEVEL', 'BATCH_SIZE', 'REQUIRED_FIELDS'
  ];
  const missingFields = requiredFields.filter(field = > ! config[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required config fields: ${missingFields.join(', ')}`);
  } // Parse comma - separated fields
  config.LABELS = config.LABELS.split(',').map(label = > label.trim()).filter(label = > label);
  config.SUPPORTED_SENDERS = config.SUPPORTED_SENDERS.split(',').map(sender = > sender.trim()).filter(sender = > sender);
  config.REQUIRED_FIELDS = config.REQUIRED_FIELDS.split(',').map(field = > field.trim()).filter(field = > field); // Validate specific fields;
  if (! ['DEBUG', 'INFO', 'ERROR'].includes(config.LOG_LEVEL)) {
    throw new Error(`Invalid LOG_LEVEL: ${config.LOG_LEVEL}. Must be DEBUG, INFO, or ERROR.`);
  }
  config.BATCH_SIZE = parseInt(config.BATCH_SIZE, 10);
  if (isNaN(config.BATCH_SIZE) || config.BATCH_SIZE < = 0) {
    throw new Error(`Invalid BATCH_SIZE: ${config.BATCH_SIZE}. Must be a positive integer.`);
  }
  if (! config.LABELS.length) {
    throw new Error('No valid labels specified in LABELS.');
  }

  return config;
}

/**

 * Logs message or messages
 * @param
 * @param {string} message - The message content
 * @param {any} level - The level parameter
 * @param {string} context - The context parameter
 * @param {any} logLevel - The logLevel parameter
 * @returns {Object} The result object

 */

function logMessage(message, level, context, logLevel) {
  const levels = { DEBUG: 0, INFO: 1, ERROR: 2 };
  if (levels[level] > = levels[logLevel]) {
    const contextStr = Object.entries(context).map(([k, v]) = > `${k}= ${v}`).join(', ');
    Logger.log(`[${level}] ${message}${contextStr ? ` [${contextStr}]` : ''}`);
  }
}

/**

 * Performs specialized operations
 * @returns {Object} The result object

 */

function onOpen() {
  SpreadsheetApp.getUi();
    .createMenu('Automations');
    .addItem('Process Transportation Emails', 'processTransportationEmails');
    .addToUi();
}

/**

 * Processes and transforms emails
 * @param
 * @param {GmailLabel} label - The label parameter
 * @param {Object} config - Configuration settings
 * @param {string} existingMessageIds - The existingMessageIds parameter
 * @param {any} dateProcessed - The dateProcessed parameter
 * @param {Folder} folder - The folder parameter
 * @param {Sheet} sheet - The sheet parameter
 * @returns {Object} The result object

 */

function processEmails(label, config, existingMessageIds, dateProcessed, folder, sheet) {
  let start = 0;
  let processedCount = 0;
  const query = `label:${label}`;

  while (true) {
    const threads = GmailApp.search(query, start, config.BATCH_SIZE);
    if (! threads.length) break;

    threads.forEach(thread = > {
      thread.getMessages().forEach(message = > {
        if (processMessage(message, existingMessageIds, dateProcessed, folder, sheet, label, config)) {
          processedCount + + ; }
      });
    });

    start + = config.BATCH_SIZE;
    logMessage(`Processed batch of ${threads.length} threads for label: ${label}`, 'DEBUG', { start }, config.LOG_LEVEL);
  }

  logMessage(`Finished processing ${processedCount} new emails for label: ${label}`, 'INFO', {}, config.LOG_LEVEL);
  return processedCount;
}

/**

 * Processes and transforms message
 * @param
 * @param {string} message - The message content
 * @param {string} existingMessageIds - The existingMessageIds parameter
 * @param {any} dateProcessed - The dateProcessed parameter
 * @param {Folder} folder - The folder parameter
 * @param {Sheet} sheet - The sheet parameter
 * @param {GmailLabel} label - The label parameter
 * @param {Object} config - Configuration settings
 * @returns {Object} The result object

 */

function processMessage(message, existingMessageIds, dateProcessed, folder, sheet, label, config) {
  const messageId = message.getId();
  if (existingMessageIds.has(messageId)) {
    logMessage(`Skipping already processed message: ${messageId}`, 'DEBUG', { label, messageId }, config.LOG_LEVEL);
    return false;
  }

  const emailDate = message.getDate();
  const sender = message.getFrom();
  const subject = message.getSubject();
  const body = message.getPlainBody();

  if (! body) {
    logMessage(`Empty body for message: ${subject}`, 'ERROR', { label, messageId }, config.LOG_LEVEL);
    return false;
  }

  const parserKey = config.SUPPORTED_SENDERS.find(key = > sender.includes(key));
  if (! parserKey) {
    logMessage(`Unsupported sender: ${sender}`, 'ERROR', { label, messageId }, config.LOG_LEVEL);
    return false;
  }

  const rowData = parseEmailBody(body, emailDate, sender, subject, dateProcessed, parserKey);
  if (! validateRowData(rowData, config.REQUIRED_FIELDS)) {
    logMessage(`Invalid data for message: ${subject}`, 'ERROR', { label, messageId, data: JSON.stringify(rowData) }, config.LOG_LEVEL);
    return false;
  }

  const markdownContent = createMarkdownContent(rowData, body);
  const filename = `${Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy - MM - dd')} - ${subject}`;
  const markdownFileLink = createMarkdownFile(markdownContent, filename, folder);

  sheet.appendRow([
    messageId, rowData.dateEmail, rowData.sender, rowData.subject, rowData.costTotal,
    rowData.startTime, rowData.endTime, rowData.tripDuration, rowData.startLocation,
    rowData.endLocation, rowData.tripDistance, rowData.tripSpeed, rowData.tripMileCostTotal,
    rowData.tripCostMinuteTotal, `[[${filename}]]`, markdownFileLink
  ]);

  logMessage(`Processed message: ${subject}`, 'INFO', { label, messageId }, config.LOG_LEVEL);
  return true;
}

/**

 * Processes and transforms transportation emails
 * @returns {Object} The result object

 */

function processTransportationEmails() {
  try {
    const config = loadConfig();
    let parentFolder;
    try {
      parentFolder = DriveApp.getFoldersByName(config.PARENT_FOLDER).next();
    } catch (error) {
      throw new Error(`Parent folder "${config.PARENT_FOLDER}" not found: ${error.message}`);
    }

    const folder = getOrCreateFolder(parentFolder, config.TARGET_FOLDER);
    const sheet = getOrCreateSheet(config.SHEET_NAME);
    const existingMessageIds = getExistingMessageIds(sheet);
    const dateProcessed = new Date();

    let processedCount = 0;
    config.LABELS.forEach(label = > {
      processedCount + = processEmails(label, config, existingMessageIds, dateProcessed, folder, sheet);
    });

    logMessage(`Processing complete. Processed ${processedCount} new emails.`, 'INFO', {}, config.LOG_LEVEL);
  } catch (error) {
    logMessage(`Error in processTransportationEmails: ${error.message}`, 'ERROR', {}, 'ERROR');
  }
}

// Helper Functions

/**

 * Formats convert to24 hour for display
 * @param
 * @param {any} time - The time parameter
 * @returns {Object} The result object

 */

function convertTo24HourFormat(time) {
  const match = time.match( / (\d{1,2}):(\d{2})\s * (AM|PM) / i);
  if (! match) return '';

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period = = = 'PM' && hours ! = = 12) hours + = 12;
  if (period = = = 'AM' && hours = = = 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

/**

 * Creates new markdown content or resources
 * @param
 * @param {Object} data - The data object to process
 * @param {string} body - The body content
 * @returns {Object} The newly created object

 */

function createMarkdownContent(data, body) {
  const yamlFrontMatter = ` - - - ${Object.entries(data).map(([key, value]) = > `${key}: ${value}`).join('\n')} - - - `;
  const cleanedBody = body.replace( / https?:\ / \ / [^\s] +  / g, '');
  return `${yamlFrontMatter}${cleanedBody}`;
}

/**

 * Creates new markdown file or resources
 * @param
 * @param {string} content - The content to process
 * @param {string} filename - The filename for creation
 * @param {Folder} folder - The folder for creation
 * @returns {Object} The newly created object

 */

function createMarkdownFile(content, filename, folder) {
  const blob = Utilities.newBlob(content, 'text / markdown', `${filename}.md`);
  const file = folder.createFile(blob);
  return file.getUrl();
}

/**

 * Extracts specific information
 * @param
 * @param {string} body - The body content
 * @param {any} regex - The regex parameter
 * @returns {Object} The result object

 */

function extractValue(body, regex) {
  const match = body.match(regex);
  return match ? match[1] : '';
}

/**

 * Formats currency for display
 * @param
 * @param {string|any} value - The value to set
 * @returns {Object} The result object

 */

function formatCurrency(value) {
  if (! value) return '';
  return parseFloat(value).toLocaleString('en - US', { style: 'currency', currency: 'USD' });
}

/**

 * Gets specific or create folder or configuration
 * @param
 * @param {Folder} parentFolder - The parentFolder to retrieve
 * @param {string} folderName - The folderName to retrieve
 * @returns {Object} The requested object

 */

function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

/**

 * Parses and extracts email body
 * @param
 * @param {string} body - The body content
 * @param {string} emailDate - The emailDate parameter
 * @param {any} sender - The sender parameter
 * @param {string} subject - The subject line
 * @param {any} dateProcessed - The dateProcessed parameter
 * @param {string} parserKey - The parserKey parameter
 * @returns {Object} The result object

 */

function parseEmailBody(body, emailDate, sender, subject, dateProcessed, parserKey) {
  const data = {
    dateEmail: Utilities.formatDate(emailDate, Session.getScriptTimeZone(), 'yyyy - MM - dd'),
    sender, subject,
    dateProcessed: Utilities.formatDate(dateProcessed, Session.getScriptTimeZone(), 'yyyy - MM - dd'),
    costTotal: '', tripDistance: '', tripDuration: '', startTime: '', startLocation: '',
    endTime: '', endLocation: '', tripSpeed: '', tripMileCostTotal: '', tripCostMinuteTotal: ''
  };

  const parser = PARSERS[parserKey];
  if (! parser) return data;

  data.costTotal = formatCurrency(extractValue(body, parser.costTotal));
  data.tripDistance = extractValue(body, parser.tripDistance);
  data.tripDuration = extractValue(body, parser.tripDuration);
  data.startTime = convertTo24HourFormat(extractValue(body, parser.startTime));

  if (data.startTime) {
    data.startLocation = extractValue(body, parser.startLocation(data.startTime));
  }
  if (data.startLocation) {
    data.endTime = convertTo24HourFormat(extractValue(body, parser.endTime(data.startLocation)));
  }
  if (data.endTime) {
    data.endLocation = extractValue(body, parser.endLocation(data.endTime));
  }

  if (data.tripDistance && data.tripDuration) {
    data.tripSpeed = (parseFloat(data.tripDistance) / parseFloat(data.tripDuration) * 60).toFixed(2);
  }
  if (data.tripDistance && data.costTotal) {
    data.tripMileCostTotal = formatCurrency(;
      parseFloat(data.costTotal.replace( / [^0 - 9.] +  / g, '')) / parseFloat(data.tripDistance);
    );
  }
  if (data.tripDuration && data.costTotal) {
    data.tripCostMinuteTotal = formatCurrency(;
      parseFloat(data.costTotal.replace( / [^0 - 9.] +  / g, '')) / parseFloat(data.tripDuration);
    );
  }

  return data;
}

/**

 * Validates row data integrity
 * @param
 * @param {Object} data - The data object to process
 * @param {any} requiredFields - The requiredFields parameter
 * @returns {Object} The result object

 */

function validateRowData(data, requiredFields) {
  return requiredFields.every(field = > data[field] && data[field] ! = = '');
}