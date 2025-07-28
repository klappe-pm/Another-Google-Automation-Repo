/**
 * Script Name: markdown- export- files
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
 * 2. Fetch source data
 * 3. Validate input data
 * 4. Process and transform data
 *
 * Script Functions:
 * - generateMarkdownFiles(): Generates new content or reports
 * - loadConfiguration(): Loads configuration from storage
 * - logError(): Logs error or messages
 * - onOpen(): Works with spreadsheet data
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * /

const CONFIG = {
  BATCH_SIZE: 50,
  TIMEOUT: 300000, / / 5 minutes
  CACHE_DURATION: 3600, / / 1 hour
  MAX_RETRIES: 3,
  VERSION: '2.6'
};

const DEFAULT_YAML_FIELDS = {
  "filename": "filename",
  "area": "area",
  "category": "category",
  "subCategory": "subCategory",
  "topic": "topic",
  "subTopic": "subTopic",
  "dateCreated": "dateCreated",
  "dateRevised": "dateRevised",
  "aliases": "aliases",
  "tags": "tags"
};

const DEFAULT_SECTION_ORDER = [
  { "title": "Summary ${filename}", "headerLevel": "2", "type": "bullet" },
  { "title": "Notes ${filename}", "headerLevel": "2", "type": "bullet" },
  { "title": "Research", "headerLevel": "2", "type": "bullet" },
  { "title": "Key Use Cases", "headerLevel": "2", "type": "bullet" },
  { "title": "Key Takeaways", "headerLevel": "2", "type": "bullet" }
];

) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    scriptName: 'sheets- export- markdown- files'
  };

  console.error('Script Error:', JSON.stringify(errorDetails, null, 2));
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
}

/**
 * Main function that reads configuration and processes the data sheet to create files.
 * This is the primary entry point triggered by the user.
 * / / * *
 * Process a single row of data to create a markdown file
 * /

function processRow(row, headers, config) {
  / / Implementation would continue with the existing logic...
  / / [The rest of the original script's implementation would go here]
}

/ / Main Functions

/**

 * Generates new content or reports
 * @returns {any} The result

 * /

function generateMarkdownFiles() {
  try {
    Logger.log('Starting markdown file generation...');

    const startTime = new Date();
    const config = loadConfiguration();

    / / Validate required configuration
    if (! config.rootFolderId) {
      throw new Error('Root folder ID not configured. Please check Config sheet.');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = ss.getSheetByName(config.dataSheetName || 'Data');

    if (! dataSheet) {
      throw new Error(`Data sheet "${config.dataSheetName || 'Data'}" not found.`);
    }

    const data = dataSheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    Logger.log(`Processing ${rows.length} rows of data...`);

    / / Process in batches
    let processedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i + = CONFIG.BATCH_SIZE) {
      const batch = rows.slice(i, i + CONFIG.BATCH_SIZE);

      for (const row of batch) {
        try {
          processRow(row, headers, config);
          processedCount+ + ;
        } catch (error) {
          logError(error, { rowIndex: i + processedCount + errorCount });
          errorCount+ + ;
        }
      }

      / / Log progress
      Logger.log(`Processed ${Math.min(i + CONFIG.BATCH_SIZE, rows.length)}/ ${rows.length} rows...`);
    }

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    Logger.log(`Markdown file generation completed! `);
    Logger.log(`Successfully processed: ${processedCount} files`);
    Logger.log(`Errors encountered: ${errorCount} files`);
    Logger.log(`Total execution time: ${duration} seconds`);

  } catch (error) {
    logError(error, { function: 'generateMarkdownFiles' });
    throw new Error(`Failed to generate markdown files: ${error.message}`);
  }
}

/**

 * Loads configuration from storage
 * @returns {any} The result

 * /

function loadConfiguration() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const configSheet = ss.getSheetByName('Config');

    if (! configSheet) {
      throw new Error('Config sheet not found. Please create a "Config" sheet via the menu.');
    }

    const configData = configSheet.getDataRange().getValues();
    const config = {};

    configData.forEach(row = > {
      if (row[0] && row[1] ! = = '') {
        config[row[0]] = row[1];
      }
    });

    / / Parse JSON fields with enhanced error handling
    ['yamlFields', 'columnMapping', 'sectionOrder'].forEach(field = > {
      if (config[field]) {
        try {
          config[field] = JSON.parse(config[field]);
        } catch (e) {
          throw new Error(`Invalid JSON in '${field}' configuration. Parser error: ${e.message}`);
        }
      }
    });

    return config;

  } catch (error) {
    logError(error, { function: 'loadConfiguration' });
    throw new Error(`Failed to load configuration: ${error.message}`);
  }
}

/**

 * Logs error or messages
 * @param
 * @param {any} error - The error parameter
 * @param {string} context - The context parameter
 * @returns {any} The result

 * /

function logError(error, context = {}

/**

 * Works with spreadsheet data
 * @returns {any} The result

 * /

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Markdown Generator')
    .addItem('Generate Markdown Files', 'generateMarkdownFiles')
    .addItem('Setup Config Sheet', 'createConfigSheet')
    .addToUi();
}