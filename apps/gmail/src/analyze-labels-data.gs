/**
 * Script Name: analyze- labels- data
 *
 * Script Summary:
 * Exports Gmail labels for automated workflow processing.
 *
 * Script Purpose:
 * - Analyze labels data patterns and trends
 * - Calculate statistics and metrics
 * - Generate insights and recommendations
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Format output for presentation
 * 7. Write results to destination
 * 8. Send notifications or reports
 *
 * Script Functions:
 * - exportGmailLabelsToSheet(): Exports gmail labels to sheet to external format
 * - performLabelsExport(): Exports perform labels to external format
 * - resetConfiguration(): Sets re configuration or configuration values
 * - setupGmailLabelsExport(): Exports setup gmail labels to external format
 * - viewCurrentConfiguration(): Works with spreadsheet data
 *
 * Script Helper Functions:
 * - isValidGoogleId(): Checks boolean condition
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - PropertiesService: For storing script properties
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

GOOGLE_IDS: { / / External spreadsheet ID - HIGH SECURITY RISK if hardcoded
    SPREADSHEET_ID: PropertiesService.getScriptProperties().getProperty('GMAIL_LABELS_SPREADSHEET_ID'),
  }, / / USER_CONFIGURABLE: Names and labels that users might want to customize
  NAMES: {
    SHEET_NAME: 'GMail Labels', / / User can modify this
    TIMESTAMP_FORMAT: 'yyyy - MM - dd HH:mm:ss',
  }, / / BUSINESS_LOGIC: Processing parameters that might need adjustment
  PROCESSING: {
    INCLUDE_SYSTEM_LABELS: false, / / Only user - created labels by default
    ADD_TIMESTAMP: true, / / Add last updated timestamp
    MAX_RETRIES: 3, / / For handling API rate limits
  }, / / SYSTEM: Headers and constants
  HEADERS: ['Labels', 'Total Threads', 'Total Emails', 'Last Updated']
}; / *  *  * Setup function to configure the script for first - time use * This replaces hardcoded values with user - prompted configuration * / / *  *  * Main function to export Gmail labels information to a Google Sheet * Now uses secure configuration instead of hardcoded values * / / *  *  * Core export logic separated for better error handling and testing * / / *  *  * Utility function to validate Google ID format * / / *  *  * Configuration management functions * / / / Main Functions

/ / Main Functions

/**

 * Exports gmail labels to sheet to external format
 * @returns {number} The calculated value

 * /

function exportGmailLabelsToSheet() {
  Logger.log('Starting Gmail Labels Export...'); / / Validate configuration exists;
  if (! CONFIG.GOOGLE_IDS.SPREADSHEET_ID) {
    Browser.msgBox(
      'Configuration Required',
      'Gmail Labels Export is not configured yet.\n\n' + 'Please run setupGmailLabelsExport() first to configure the destination spreadsheet.',
      Browser.Buttons.OK
    );
    console.error('No spreadsheet ID configured. Run setupGmailLabelsExport() first.');
    return;
  }

  Logger.log('Configuration validated. Starting export...');

  let attempt = 0;
  const maxRetries = CONFIG.PROCESSING.MAX_RETRIES;

  while (attempt < = maxRetries) {
    try {
      attempt + + ; Logger.log(`Export attempt ${attempt} of ${maxRetries + 1}`); / / Execute the export;
      const result = performLabelsExport();

      if (result.success) {
        Browser.msgBox(
          'Export Complete',
          `Gmail Labels Export completed successfully! \n\n` + `Labels processed: ${result.labelsCount}\n` + `Sheet: ${CONFIG.NAMES.SHEET_NAME}\n` + `Timestamp: ${result.timestamp}`,
          Browser.Buttons.OK
        );
        Logger.log('Export completed successfully');
        return;
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt > maxRetries) {
        Browser.msgBox(
          'Export Failed',
          `Gmail Labels Export failed after ${maxRetries + 1} attempts.\n\n` + `Error: ${error.message}\n\n` + 'Please check your configuration and try again.',
          Browser.Buttons.OK
        );
        console.error('Export failed after all retries');
        return;
      } / / Wait before retry (exponential backoff)
      Utilities.sleep(Math.pow(2, attempt) * 1000);
    }
  }
}

/**

 * Exports perform labels to external format
 * @returns {number} The calculated value

 * /

function performLabelsExport() {
  Logger.log('Performing labels export...'); / / Open the spreadsheet;
  const spreadsheet = SpreadsheetApp.openById(CONFIG.GOOGLE_IDS.SPREADSHEET_ID);
  Logger.log('Spreadsheet opened:', spreadsheet.getName()); / / Get or create the sheet;
  let sheet = spreadsheet.getSheetByName(CONFIG.NAMES.SHEET_NAME);
  if (! sheet) {
    Logger.log('Creating new sheet:', CONFIG.NAMES.SHEET_NAME);
    sheet = spreadsheet.insertSheet(CONFIG.NAMES.SHEET_NAME);
  } else {
    Logger.log('Using existing sheet:', CONFIG.NAMES.SHEET_NAME);
  } / / Clear existing data
  sheet.clear();
  Logger.log('Sheet cleared'); / / Set headers (conditionally include timestamp column);
  const headers = CONFIG.PROCESSING.ADD_TIMESTAMP ?;
    CONFIG.HEADERS :
    CONFIG.HEADERS.slice(0, - 1); / / Remove last column (timestamp);

  sheet.appendRow(headers);
  Logger.log('Headers set:', headers); / / Get Gmail labels;
  const labels = CONFIG.PROCESSING.INCLUDE_SYSTEM_LABELS ?;
    GmailApp.getInboxLabel().getParent().getChildLabels().concat(GmailApp.getUserLabels()) :;
    GmailApp.getUserLabels();

  Logger.log(`Processing ${labels.length} labels...`);

  const timestamp = CONFIG.PROCESSING.ADD_TIMESTAMP ?;
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), CONFIG.NAMES.TIMESTAMP_FORMAT) :;
    null; / / Process each label
  const labelData = [];
  labels.forEach((label, index) = > {
    Logger.log(`Processing label ${index + 1} / ${labels.length}: ${label.getName()}`);

    const labelName = label.getName();
    const threads = label.getThreads();
    const totalThreads = threads.length; / / Calculate total emails;
    let totalEmails = 0;
    threads.forEach(thread = > {
      totalEmails + = thread.getMessages().length;
    }); / / Build row data
    const rowData = [labelName, totalThreads, totalEmails];
    if (CONFIG.PROCESSING.ADD_TIMESTAMP) {
      rowData.push(timestamp);
    }

    labelData.push(rowData);
    Logger.log(`Label processed: ${labelName} (${totalThreads} threads, ${totalEmails} emails)`);
  }); / / Write all data at once for better performance
  if (labelData.length > 0) {
    sheet.getRange(2, 1, labelData.length, labelData[0].length).setValues(labelData);
    Logger.log(`${labelData.length} rows written to sheet`);
  }

  Logger.log('Export completed successfully');

  return {
    success: true,
    labelsCount: labels.length,
    timestamp: timestamp || 'No timestamp',
    sheetName: CONFIG.NAMES.SHEET_NAME
  };
}

/**

 * Sets re configuration or configuration values
 * @returns {number} The calculated value

 * /

function resetConfiguration() {
  const confirm = Browser.msgBox(;
    'Reset Configuration',
    'Are you sure you want to reset the Gmail Labels Export configuration?\n\nThis will remove the stored spreadsheet ID.',
    Browser.Buttons.YES_NO
  );

  if (confirm = = = 'yes') {
    PropertiesService.getScriptProperties().deleteProperty('GMAIL_LABELS_SPREADSHEET_ID');
    Browser.msgBox('Configuration reset successfully. Run setupGmailLabelsExport() to reconfigure.');
  }
}

/**

 * Exports setup gmail labels to external format
 * @returns {number} The calculated value

 * /

function setupGmailLabelsExport() {
  Logger.log('Setting up Gmail Labels Export configuration...'); / / Check if configuration already exists;
  const existingSpreadsheetId = PropertiesService.getScriptProperties().getProperty('GMAIL_LABELS_SPREADSHEET_ID');

  if (existingSpreadsheetId) {
    const reconfigure = Browser.msgBox(;
      'Configuration Exists',
      'Gmail Labels Export is already configured.\nDo you want to reconfigure it?',
      Browser.Buttons.YES_NO
    );

    if (reconfigure ! = = 'yes') {
      Browser.msgBox('Setup cancelled. Using existing configuration.');
      return;
    }
  } / / Get spreadsheet ID from user
  const spreadsheetId = Browser.inputBox(;
    'Gmail Labels Export Setup',
    'Enter the Google Spreadsheet ID where you want to export Gmail label data:\n\n' + 'You can find this in the URL of your Google Sheet:\n' + 'https: / / docs.google.com / spreadsheets / d / [SPREADSHEET_ID] / edit\n\n' + 'Spreadsheet ID:',
    Browser.Buttons.OK_CANCEL
  );

  if (spreadsheetId = = = 'cancel' || ! spreadsheetId.trim()) {
    Browser.msgBox('Setup cancelled. No configuration saved.');
    return;
  } / / Validate spreadsheet ID format
  if (! isValidGoogleId(spreadsheetId.trim())) {
    Browser.msgBox(
      'Invalid Spreadsheet ID',
      'The spreadsheet ID format is invalid. Please check and try again.',
      Browser.Buttons.OK
    );
    return;
  } / / Test access to the spreadsheet
  try {
    const testSpreadsheet = SpreadsheetApp.openById(spreadsheetId.trim());
    Logger.log('Successfully validated access to spreadsheet:', testSpreadsheet.getName());
  } catch (error) {
    Browser.msgBox(
      'Access Error',
      'Cannot access the specified spreadsheet. Please check:\n' + '1. The spreadsheet ID is correct\n' + '2. You have edit access to the spreadsheet\n' + '3. The spreadsheet exists\n\n' + 'Error: ' + error.message,
      Browser.Buttons.OK
    );
    return;
  } / / Save configuration
  PropertiesService.getScriptProperties().setProperty('GMAIL_LABELS_SPREADSHEET_ID', spreadsheetId.trim());

  Browser.msgBox(
    'Setup Complete',
    'Gmail Labels Export has been configured successfully! \n\n' + 'You can now run exportGmailLabelsToSheet() to export your label data.',
    Browser.Buttons.OK
  );

  Logger.log('Setup completed successfully');
}

/**

 * Works with spreadsheet data
 * @returns {number} The calculated value

 * /

function viewCurrentConfiguration() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('GMAIL_LABELS_SPREADSHEET_ID');

  if (spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      Browser.msgBox(
        'Current Configuration',
        `Gmail Labels Export Configuration:\n\n` + `Spreadsheet: ${spreadsheet.getName()}\n` + `Spreadsheet ID: ${spreadsheetId}\n` + `Sheet Name: ${CONFIG.NAMES.SHEET_NAME}\n` + `Include Timestamp: ${CONFIG.PROCESSING.ADD_TIMESTAMP}`,
        Browser.Buttons.OK
      );
    } catch (error) {
      Browser.msgBox(
        'Configuration Error',
        `Stored spreadsheet ID is invalid or inaccessible:\n${spreadsheetId}\n\nPlease run setupGmailLabelsExport() to reconfigure.`,
        Browser.Buttons.OK
      );
    }
  } else {
    Browser.msgBox(
      'No Configuration',
      'Gmail Labels Export is not configured yet.\n\nPlease run setupGmailLabelsExport() to set up the configuration.',
      Browser.Buttons.OK
    );
  }
}

/ / Helper Functions

/**

 * Checks boolean condition
 * @param
 * @param {string} id - The unique identifier
 * @returns {number} True if condition is met, false otherwise

 * /

function isValidGoogleId(id) { / / Google IDs are typically 44 characters of alphanumeric, hyphens, and underscores
  const googleIdPattern = / ^[a - zA - Z0 - 9_ - ]{25,}$ / ; return googleIdPattern.test(id);
}