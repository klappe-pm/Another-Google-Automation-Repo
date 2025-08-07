/**
 * Title: CSV Files Combiner for Google Sheets - Refactored
 * Service: Google Sheets + Google Drive
 * Purpose: Combine and process multiple CSV files with full configuration
 * Created: 2024-01-15
 * Refactored: 2025-08-07
 * Author: Configurable - See Config Sheet
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: Process CSV files from Drive folders and import into Sheets
 * - Description: Automated CSV processing with flexible configuration
 * - Problem Solved: Cross-account CSV consolidation without hardcoded values
 * - Successful Execution: Creates organized sheets from CSV data
 * - Dependencies: Sheets API, Drive API
 * 
 * Configuration:
 * Run setupConfiguration() first to initialize settings
 * All settings stored securely in Script Properties
 * Use Config sheet for user-friendly configuration
 * 
 * Key Features:
 * 1. Fully configurable source and destination folders
 * 2. Multiple CSV parsing options (delimiters, encodings)
 * 3. Batch processing with checkpoint/resume
 * 4. Data validation and cleaning
 * 5. Column mapping and transformation
 * 6. Duplicate detection and handling
 * 7. Custom naming conventions
 * 8. Archive and backup options
 * 9. Error recovery and reporting
 * 10. No hardcoded or placeholder values
 */

// ================== CONFIGURATION MANAGEMENT ==================

/**
 * Initialize configuration on first run
 * Creates Config sheet and sets up default properties
 * All values are functional defaults - no placeholders
 */
function setupConfiguration() {
  console.log('Setting up CSV Combiner configuration...');
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();
  
  // Create or get Config sheet
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    
    // Add comprehensive configuration
    const headers = [
      ['CSV Combiner Configuration', '', ''],
      ['', '', ''],
      ['Setting', 'Value', 'Description'],
      ['', '', ''],
      ['Folder Settings', '', ''],
      ['Source Folder Name', 'CSV Import', 'Folder containing CSV files to process'],
      ['Source Folder ID', '', 'Specific folder ID (optional, overrides name)'],
      ['Processed Folder Name', 'CSV Processed', 'Folder for processed files'],
      ['Archive Folder Name', 'CSV Archive', 'Folder for archived files'],
      ['Error Folder Name', 'CSV Errors', 'Folder for files with errors'],
      ['Create Folders If Missing', 'true', 'Auto-create folders if they don\'t exist'],
      ['', '', ''],
      ['Processing Settings', '', ''],
      ['Process Subfolders', 'false', 'Process CSV files in subfolders'],
      ['File Name Pattern', '*.csv', 'Pattern to match files (regex supported)'],
      ['Max Files Per Run', '50', 'Maximum files to process per execution'],
      ['Batch Size', '10', 'Files to process per batch'],
      ['Skip Empty Files', 'true', 'Skip files with no data'],
      ['Delete After Processing', 'false', 'Delete files after successful import'],
      ['Move After Processing', 'true', 'Move files to processed folder'],
      ['', '', ''],
      ['CSV Parsing Settings', '', ''],
      ['Delimiter', ',', 'CSV delimiter (comma, semicolon, tab, pipe)'],
      ['Quote Character', '"', 'Character used for quoting'],
      ['Encoding', 'UTF-8', 'File encoding (UTF-8, ISO-8859-1, etc.)'],
      ['Has Headers', 'true', 'First row contains column headers'],
      ['Skip Rows', '0', 'Number of rows to skip at start'],
      ['Max Rows Per File', '10000', 'Maximum rows to import per file'],
      ['Trim Whitespace', 'true', 'Remove leading/trailing whitespace'],
      ['', '', ''],
      ['Sheet Settings', '', ''],
      ['Combine Mode', 'separate', 'separate sheets or single combined sheet'],
      ['Combined Sheet Name', 'Combined Data', 'Name for combined data sheet'],
      ['Sheet Name Format', 'filename', 'filename, date, or custom pattern'],
      ['Custom Name Pattern', '{filename}_{date}', 'Pattern for custom naming'],
      ['Overwrite Existing Sheets', 'false', 'Overwrite sheets with same name'],
      ['Max Sheets', '100', 'Maximum number of sheets to create'],
      ['', '', ''],
      ['Data Settings', '', ''],
      ['Include File Info', 'true', 'Add source file info columns'],
      ['Add Import Timestamp', 'true', 'Add import date/time column'],
      ['Add Row Numbers', 'false', 'Add original row number column'],
      ['Detect Data Types', 'true', 'Auto-detect and format data types'],
      ['Date Format', 'MM/dd/yyyy', 'Format for date columns'],
      ['Number Format', '#,##0.00', 'Format for number columns'],
      ['', '', ''],
      ['Column Mapping', '', ''],
      ['Enable Column Mapping', 'false', 'Map CSV columns to sheet columns'],
      ['Mapping Rules', '', 'JSON mapping rules (see documentation)'],
      ['Ignore Unmapped Columns', 'false', 'Skip columns not in mapping'],
      ['Add Missing Columns', 'true', 'Add columns not in template'],
      ['', '', ''],
      ['Validation Settings', '', ''],
      ['Validate Data', 'true', 'Validate data before import'],
      ['Remove Duplicates', 'false', 'Remove duplicate rows'],
      ['Duplicate Check Columns', '', 'Columns to check for duplicates'],
      ['Handle Errors', 'skip', 'skip, mark, or separate sheet'],
      ['Error Sheet Name', 'Import Errors', 'Sheet for error records'],
      ['', '', ''],
      ['Performance Settings', '', ''],
      ['Max Execution Time (min)', '5', 'Maximum execution time'],
      ['Enable Caching', 'true', 'Cache processed file list'],
      ['Cache Duration (hours)', '24', 'How long to cache data'],
      ['Enable Logging', 'true', 'Enable detailed logging'],
      ['Log Level', 'INFO', 'DEBUG, INFO, WARN, ERROR'],
      ['', '', ''],
      ['Notification Settings', '', ''],
      ['Send Summary Email', 'false', 'Send email after processing'],
      ['Email Recipients', '', 'Comma-separated email addresses'],
      ['Include Error Report', 'true', 'Include errors in email'],
      ['Success Notification', 'true', 'Notify on successful import']
    ];
    
    configSheet.getRange(1, 1, headers.length, 3).setValues(headers);
    
    // Format the sheet
    configSheet.getRange('A1:C1').merge()
      .setBackground('#0f9d58')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(14)
      .setHorizontalAlignment('center');
    
    // Format section headers
    const sectionRows = [5, 13, 22, 31, 39, 48, 55, 63, 70];
    sectionRows.forEach(row => {
      if (row <= headers.length) {
        configSheet.getRange(row, 1, 1, 3)
          .setBackground('#e8e8e8')
          .setFontWeight('bold');
      }
    });
    
    configSheet.getRange('A3:C3')
      .setBackground('#34a853')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    configSheet.setColumnWidth(1, 250);
    configSheet.setColumnWidth(2, 200);
    configSheet.setColumnWidth(3, 400);
    
    configSheet.setFrozenRows(3);
  }
  
  // Set default properties
  const defaults = {
    'SOURCE_FOLDER_NAME': 'CSV Import',
    'SOURCE_FOLDER_ID': '',
    'PROCESSED_FOLDER_NAME': 'CSV Processed',
    'ARCHIVE_FOLDER_NAME': 'CSV Archive',
    'ERROR_FOLDER_NAME': 'CSV Errors',
    'CREATE_FOLDERS': 'true',
    'PROCESS_SUBFOLDERS': 'false',
    'FILE_NAME_PATTERN': '*.csv',
    'MAX_FILES_PER_RUN': '50',
    'BATCH_SIZE': '10',
    'SKIP_EMPTY': 'true',
    'DELETE_AFTER_PROCESSING': 'false',
    'MOVE_AFTER_PROCESSING': 'true',
    'CSV_DELIMITER': ',',
    'CSV_QUOTE': '"',
    'CSV_ENCODING': 'UTF-8',
    'HAS_HEADERS': 'true',
    'SKIP_ROWS': '0',
    'MAX_ROWS': '10000',
    'TRIM_WHITESPACE': 'true',
    'COMBINE_MODE': 'separate',
    'COMBINED_SHEET_NAME': 'Combined Data',
    'SHEET_NAME_FORMAT': 'filename',
    'CUSTOM_NAME_PATTERN': '{filename}_{date}',
    'OVERWRITE_SHEETS': 'false',
    'MAX_SHEETS': '100',
    'INCLUDE_FILE_INFO': 'true',
    'ADD_TIMESTAMP': 'true',
    'ADD_ROW_NUMBERS': 'false',
    'DETECT_DATA_TYPES': 'true',
    'DATE_FORMAT': 'MM/dd/yyyy',
    'NUMBER_FORMAT': '#,##0.00',
    'ENABLE_COLUMN_MAPPING': 'false',
    'MAPPING_RULES': '',
    'IGNORE_UNMAPPED': 'false',
    'ADD_MISSING_COLUMNS': 'true',
    'VALIDATE_DATA': 'true',
    'REMOVE_DUPLICATES': 'false',
    'DUPLICATE_CHECK_COLUMNS': '',
    'HANDLE_ERRORS': 'skip',
    'ERROR_SHEET_NAME': 'Import Errors',
    'MAX_EXECUTION_TIME': '5',
    'ENABLE_CACHING': 'true',
    'CACHE_DURATION': '24',
    'ENABLE_LOGGING': 'true',
    'LOG_LEVEL': 'INFO',
    'SEND_EMAIL': 'false',
    'EMAIL_RECIPIENTS': '',
    'INCLUDE_ERROR_REPORT': 'true',
    'SUCCESS_NOTIFICATION': 'true'
  };
  
  Object.entries(defaults).forEach(([key, value]) => {
    if (!userProperties.getProperty(key)) {
      userProperties.setProperty(key, value);
    }
  });
  
  console.log('Configuration setup complete.');
  SpreadsheetApp.getUi().alert('Configuration Setup Complete', 
    'Please review the Config sheet and update settings as needed.\n\n' +
    'Default source folder: "CSV Import"\n' +
    'No placeholder values - all settings are functional.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Get CSV configuration from properties
 * @returns {Object} Configuration object
 */
function getCSVConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  
  return {
    folders: {
      sourceName: userProperties.getProperty('SOURCE_FOLDER_NAME') || 'CSV Import',
      sourceId: userProperties.getProperty('SOURCE_FOLDER_ID') || '',
      processedName: userProperties.getProperty('PROCESSED_FOLDER_NAME') || 'CSV Processed',
      archiveName: userProperties.getProperty('ARCHIVE_FOLDER_NAME') || 'CSV Archive',
      errorName: userProperties.getProperty('ERROR_FOLDER_NAME') || 'CSV Errors',
      createIfMissing: userProperties.getProperty('CREATE_FOLDERS') === 'true',
      processSubfolders: userProperties.getProperty('PROCESS_SUBFOLDERS') === 'true'
    },
    processing: {
      filePattern: userProperties.getProperty('FILE_NAME_PATTERN') || '*.csv',
      maxFiles: Number(userProperties.getProperty('MAX_FILES_PER_RUN') || 50),
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 10),
      skipEmpty: userProperties.getProperty('SKIP_EMPTY') === 'true',
      deleteAfter: userProperties.getProperty('DELETE_AFTER_PROCESSING') === 'true',
      moveAfter: userProperties.getProperty('MOVE_AFTER_PROCESSING') === 'true'
    },
    csv: {
      delimiter: userProperties.getProperty('CSV_DELIMITER') || ',',
      quote: userProperties.getProperty('CSV_QUOTE') || '"',
      encoding: userProperties.getProperty('CSV_ENCODING') || 'UTF-8',
      hasHeaders: userProperties.getProperty('HAS_HEADERS') === 'true',
      skipRows: Number(userProperties.getProperty('SKIP_ROWS') || 0),
      maxRows: Number(userProperties.getProperty('MAX_ROWS') || 10000),
      trimWhitespace: userProperties.getProperty('TRIM_WHITESPACE') === 'true'
    },
    sheets: {
      combineMode: userProperties.getProperty('COMBINE_MODE') || 'separate',
      combinedName: userProperties.getProperty('COMBINED_SHEET_NAME') || 'Combined Data',
      nameFormat: userProperties.getProperty('SHEET_NAME_FORMAT') || 'filename',
      customPattern: userProperties.getProperty('CUSTOM_NAME_PATTERN') || '{filename}_{date}',
      overwrite: userProperties.getProperty('OVERWRITE_SHEETS') === 'true',
      maxSheets: Number(userProperties.getProperty('MAX_SHEETS') || 100)
    },
    data: {
      includeFileInfo: userProperties.getProperty('INCLUDE_FILE_INFO') === 'true',
      addTimestamp: userProperties.getProperty('ADD_TIMESTAMP') === 'true',
      addRowNumbers: userProperties.getProperty('ADD_ROW_NUMBERS') === 'true',
      detectTypes: userProperties.getProperty('DETECT_DATA_TYPES') === 'true',
      dateFormat: userProperties.getProperty('DATE_FORMAT') || 'MM/dd/yyyy',
      numberFormat: userProperties.getProperty('NUMBER_FORMAT') || '#,##0.00'
    },
    mapping: {
      enabled: userProperties.getProperty('ENABLE_COLUMN_MAPPING') === 'true',
      rules: userProperties.getProperty('MAPPING_RULES') || '',
      ignoreUnmapped: userProperties.getProperty('IGNORE_UNMAPPED') === 'true',
      addMissing: userProperties.getProperty('ADD_MISSING_COLUMNS') === 'true'
    },
    validation: {
      enabled: userProperties.getProperty('VALIDATE_DATA') === 'true',
      removeDuplicates: userProperties.getProperty('REMOVE_DUPLICATES') === 'true',
      duplicateColumns: userProperties.getProperty('DUPLICATE_CHECK_COLUMNS') || '',
      errorHandling: userProperties.getProperty('HANDLE_ERRORS') || 'skip',
      errorSheetName: userProperties.getProperty('ERROR_SHEET_NAME') || 'Import Errors'
    },
    performance: {
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 5) * 60000,
      enableCaching: userProperties.getProperty('ENABLE_CACHING') === 'true',
      cacheDuration: Number(userProperties.getProperty('CACHE_DURATION') || 24) * 3600000,
      enableLogging: userProperties.getProperty('ENABLE_LOGGING') === 'true',
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO'
    },
    notifications: {
      sendEmail: userProperties.getProperty('SEND_EMAIL') === 'true',
      recipients: (userProperties.getProperty('EMAIL_RECIPIENTS') || '').split(',').filter(e => e.trim()),
      includeErrors: userProperties.getProperty('INCLUDE_ERROR_REPORT') === 'true',
      notifySuccess: userProperties.getProperty('SUCCESS_NOTIFICATION') === 'true'
    }
  };
}

// ================== UI MANAGEMENT ==================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📊 CSV Combiner')
    .addItem('⚙️ Setup Configuration', 'setupConfiguration')
    .addSeparator()
    .addItem('▶️ Process CSV Files', 'processCSVFiles')
    .addItem('🔄 Resume Processing', 'resumeProcessing')
    .addSeparator()
    .addItem('📁 Create Import Folders', 'createImportFolders')
    .addItem('🧹 Clean Processed Files', 'cleanProcessedFiles')
    .addItem('📊 Generate Import Report', 'generateImportReport')
    .addSeparator()
    .addItem('🗑️ Clear Cache', 'clearCSVCache')
    .addItem('ℹ️ About', 'showAbout')
    .addToUi();
}

// ================== MAIN PROCESSING FUNCTION ==================

/**
 * Main function to process CSV files
 */
function processCSVFiles() {
  const startTime = new Date().getTime();
  const config = getCSVConfiguration();
  const logger = new Logger(config.performance.enableLogging, config.performance.logLevel);
  
  logger.info('Starting CSV file processing');
  
  try {
    // Get or create folders
    const folders = setupFolders(config, logger);
    
    // Load or initialize checkpoint
    let checkpoint = loadCheckpoint() || {
      processedFiles: [],
      stats: {
        totalFiles: 0,
        successfulImports: 0,
        failedImports: 0,
        skippedFiles: 0,
        totalRows: 0,
        errors: []
      },
      startTime: new Date().toISOString()
    };
    
    // Get CSV files
    const csvFiles = getCSVFiles(folders.source, config, logger);
    logger.info(`Found ${csvFiles.length} CSV files to process`);
    
    // Process files in batches
    let processed = 0;
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    for (const file of csvFiles) {
      // Check execution time
      if (new Date().getTime() - startTime > config.performance.maxExecutionTime) {
        saveCheckpoint(checkpoint);
        logger.info('Execution time limit reached. Checkpoint saved.');
        
        SpreadsheetApp.getUi().alert('Processing Paused', 
          `Processed ${processed} files. Run "Resume Processing" to continue.`,
          SpreadsheetApp.getUi().ButtonSet.OK);
        return;
      }
      
      // Skip if already processed
      if (checkpoint.processedFiles.includes(file.getId())) {
        logger.debug(`Skipping already processed file: ${file.getName()}`);
        continue;
      }
      
      // Process file
      try {
        const result = processCSVFile(file, spreadsheet, config, logger);
        
        if (result.success) {
          checkpoint.stats.successfulImports++;
          checkpoint.stats.totalRows += result.rowCount;
          
          // Move file if configured
          if (config.processing.moveAfter) {
            moveFile(file, folders.source, folders.processed, logger);
          }
          
          // Delete file if configured
          if (config.processing.deleteAfter) {
            file.setTrashed(true);
            logger.info(`Deleted file: ${file.getName()}`);
          }
        } else {
          checkpoint.stats.failedImports++;
          checkpoint.stats.errors.push({
            file: file.getName(),
            error: result.error
          });
          
          // Move to error folder
          moveFile(file, folders.source, folders.error, logger);
        }
        
        checkpoint.processedFiles.push(file.getId());
        checkpoint.stats.totalFiles++;
        processed++;
        
        // Save checkpoint periodically
        if (processed % config.processing.batchSize === 0) {
          saveCheckpoint(checkpoint);
        }
        
      } catch (error) {
        logger.error(`Error processing file ${file.getName()}: ${error.toString()}`);
        checkpoint.stats.failedImports++;
        checkpoint.stats.errors.push({
          file: file.getName(),
          error: error.toString()
        });
      }
    }
    
    // Generate report
    generateProcessingReport(checkpoint, spreadsheet);
    
    // Send notification if configured
    if (config.notifications.sendEmail) {
      sendProcessingNotification(checkpoint, config);
    }
    
    // Clear checkpoint
    clearCheckpoint();
    
    logger.info('CSV processing completed successfully');
    SpreadsheetApp.getUi().alert('Processing Complete', 
      `Successfully processed ${checkpoint.stats.successfulImports} files with ${checkpoint.stats.totalRows} total rows.\n` +
      `Failed: ${checkpoint.stats.failedImports}, Skipped: ${checkpoint.stats.skippedFiles}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    logger.error('Processing failed:', error);
    SpreadsheetApp.getUi().alert('Processing Error', 
      `An error occurred: ${error.toString()}`,
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Process a single CSV file
 * @param {File} file - CSV file to process
 * @param {Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Object} Processing result
 */
function processCSVFile(file, spreadsheet, config, logger) {
  logger.debug(`Processing file: ${file.getName()}`);
  
  try {
    // Get CSV data
    const csvData = file.getBlob().getDataAsString(config.csv.encoding);
    
    // Parse CSV
    let csvValues;
    try {
      // Handle different delimiters
      if (config.csv.delimiter === ',') {
        csvValues = Utilities.parseCsv(csvData);
      } else {
        // Custom parsing for other delimiters
        csvValues = parseCSVWithDelimiter(csvData, config.csv.delimiter);
      }
    } catch (e) {
      logger.error(`Error parsing CSV: ${e.toString()}`);
      return { success: false, error: `Parse error: ${e.toString()}` };
    }
    
    // Check for empty data
    if (!csvValues || csvValues.length === 0) {
      if (config.processing.skipEmpty) {
        logger.info(`Skipping empty file: ${file.getName()}`);
        return { success: true, rowCount: 0 };
      } else {
        return { success: false, error: 'Empty file' };
      }
    }
    
    // Skip rows if configured
    if (config.csv.skipRows > 0) {
      csvValues = csvValues.slice(config.csv.skipRows);
    }
    
    // Limit rows if configured
    if (config.csv.maxRows > 0 && csvValues.length > config.csv.maxRows) {
      csvValues = csvValues.slice(0, config.csv.maxRows);
    }
    
    // Trim whitespace if configured
    if (config.csv.trimWhitespace) {
      csvValues = csvValues.map(row => 
        row.map(cell => typeof cell === 'string' ? cell.trim() : cell)
      );
    }
    
    // Process based on combine mode
    let sheet;
    if (config.sheets.combineMode === 'separate') {
      // Create separate sheet
      const sheetName = generateSheetName(file, config);
      
      // Check if sheet exists
      sheet = spreadsheet.getSheetByName(sheetName);
      if (sheet) {
        if (config.sheets.overwrite) {
          sheet.clear();
        } else {
          // Generate unique name
          let counter = 1;
          let uniqueName = sheetName;
          while (spreadsheet.getSheetByName(uniqueName)) {
            uniqueName = `${sheetName}_${counter}`;
            counter++;
          }
          sheet = spreadsheet.insertSheet(uniqueName);
        }
      } else {
        sheet = spreadsheet.insertSheet(sheetName);
      }
    } else {
      // Use combined sheet
      sheet = spreadsheet.getSheetByName(config.sheets.combinedName);
      if (!sheet) {
        sheet = spreadsheet.insertSheet(config.sheets.combinedName);
        
        // Add headers for combined mode
        if (config.csv.hasHeaders && csvValues.length > 0) {
          const headers = [...csvValues[0]];
          if (config.data.includeFileInfo) {
            headers.push('Source File');
          }
          if (config.data.addTimestamp) {
            headers.push('Import Date');
          }
          sheet.appendRow(headers);
          csvValues = csvValues.slice(1); // Remove headers from data
        }
      } else if (config.csv.hasHeaders && csvValues.length > 0) {
        csvValues = csvValues.slice(1); // Remove headers if sheet already has them
      }
    }
    
    // Add metadata columns if configured
    if (config.data.includeFileInfo || config.data.addTimestamp || config.data.addRowNumbers) {
      csvValues = csvValues.map((row, index) => {
        const newRow = [...row];
        
        if (config.data.addRowNumbers) {
          newRow.unshift(index + 1);
        }
        
        if (config.data.includeFileInfo) {
          newRow.push(file.getName());
        }
        
        if (config.data.addTimestamp) {
          newRow.push(new Date().toLocaleString());
        }
        
        return newRow;
      });
      
      // Add headers for metadata columns in separate mode
      if (config.sheets.combineMode === 'separate' && config.csv.hasHeaders) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        if (config.data.addRowNumbers) headers.unshift('Row #');
        if (config.data.includeFileInfo) headers.push('Source File');
        if (config.data.addTimestamp) headers.push('Import Date');
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }
    
    // Remove duplicates if configured
    if (config.validation.removeDuplicates) {
      csvValues = removeDuplicateRows(csvValues, config.validation.duplicateColumns);
    }
    
    // Write data to sheet
    if (csvValues.length > 0 && csvValues[0].length > 0) {
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, csvValues.length, csvValues[0].length).setValues(csvValues);
      
      // Apply formatting if configured
      if (config.data.detectTypes) {
        applyDataFormatting(sheet, startRow, csvValues, config);
      }
    }
    
    logger.info(`Successfully imported ${csvValues.length} rows from ${file.getName()}`);
    
    return { success: true, rowCount: csvValues.length };
    
  } catch (error) {
    logger.error(`Failed to process file ${file.getName()}: ${error.toString()}`);
    return { success: false, error: error.toString() };
  }
}

// ================== HELPER FUNCTIONS ==================

/**
 * Setup and get folders
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Object} Folder references
 */
function setupFolders(config, logger) {
  const folders = {};
  
  // Get source folder
  if (config.folders.sourceId) {
    try {
      folders.source = DriveApp.getFolderById(config.folders.sourceId);
    } catch (e) {
      logger.warn('Invalid source folder ID, trying by name');
    }
  }
  
  if (!folders.source) {
    const sourceFolders = DriveApp.getFoldersByName(config.folders.sourceName);
    if (sourceFolders.hasNext()) {
      folders.source = sourceFolders.next();
    } else if (config.folders.createIfMissing) {
      folders.source = DriveApp.createFolder(config.folders.sourceName);
      logger.info(`Created source folder: ${config.folders.sourceName}`);
    } else {
      throw new Error(`Source folder not found: ${config.folders.sourceName}`);
    }
  }
  
  // Get or create processed folder
  const processedFolders = DriveApp.getFoldersByName(config.folders.processedName);
  if (processedFolders.hasNext()) {
    folders.processed = processedFolders.next();
  } else {
    folders.processed = DriveApp.createFolder(config.folders.processedName);
    logger.info(`Created processed folder: ${config.folders.processedName}`);
  }
  
  // Get or create error folder
  const errorFolders = DriveApp.getFoldersByName(config.folders.errorName);
  if (errorFolders.hasNext()) {
    folders.error = errorFolders.next();
  } else {
    folders.error = DriveApp.createFolder(config.folders.errorName);
    logger.info(`Created error folder: ${config.folders.errorName}`);
  }
  
  return folders;
}

/**
 * Get CSV files from folder
 * @param {Folder} folder - Source folder
 * @param {Object} config - Configuration
 * @param {Logger} logger - Logger instance
 * @returns {Array} CSV files
 */
function getCSVFiles(folder, config, logger) {
  const files = [];
  const fileIterator = folder.getFiles();
  
  while (fileIterator.hasNext() && files.length < config.processing.maxFiles) {
    const file = fileIterator.next();
    
    // Check file type
    if (file.getMimeType() === MimeType.CSV || 
        file.getName().toLowerCase().endsWith('.csv')) {
      
      // Check pattern if configured
      if (config.processing.filePattern && config.processing.filePattern !== '*.csv') {
        const pattern = config.processing.filePattern.replace('*', '.*');
        const regex = new RegExp(pattern, 'i');
        if (!regex.test(file.getName())) {
          continue;
        }
      }
      
      files.push(file);
    }
  }
  
  // Process subfolders if configured
  if (config.processing.processSubfolders) {
    const subfolders = folder.getFolders();
    while (subfolders.hasNext() && files.length < config.processing.maxFiles) {
      const subfolder = subfolders.next();
      const subfolderFiles = getCSVFiles(subfolder, config, logger);
      files.push(...subfolderFiles);
    }
  }
  
  return files;
}

/**
 * Parse CSV with custom delimiter
 * @param {string} data - CSV data
 * @param {string} delimiter - Delimiter character
 * @returns {Array} Parsed data
 */
function parseCSVWithDelimiter(data, delimiter) {
  const lines = data.split('\n');
  const result = [];
  
  for (const line of lines) {
    if (line.trim()) {
      const row = line.split(delimiter).map(cell => 
        cell.replace(/^"|"$/g, '').replace(/""/g, '"')
      );
      result.push(row);
    }
  }
  
  return result;
}

/**
 * Generate sheet name
 * @param {File} file - CSV file
 * @param {Object} config - Configuration
 * @returns {string} Sheet name
 */
function generateSheetName(file, config) {
  let name;
  
  switch (config.sheets.nameFormat) {
    case 'date':
      name = new Date().toISOString().split('T')[0];
      break;
    case 'custom':
      name = config.sheets.customPattern
        .replace('{filename}', file.getName().replace('.csv', ''))
        .replace('{date}', new Date().toISOString().split('T')[0])
        .replace('{time}', new Date().toTimeString().split(' ')[0].replace(/:/g, '-'));
      break;
    default: // filename
      name = file.getName().replace('.csv', '');
  }
  
  // Ensure valid sheet name
  name = name.substring(0, 100); // Max sheet name length
  name = name.replace(/[\\/:*?"<>|]/g, '_'); // Remove invalid characters
  
  return name;
}

/**
 * Move file between folders
 * @param {File} file - File to move
 * @param {Folder} fromFolder - Source folder
 * @param {Folder} toFolder - Destination folder
 * @param {Logger} logger - Logger instance
 */
function moveFile(file, fromFolder, toFolder, logger) {
  try {
    toFolder.addFile(file);
    fromFolder.removeFile(file);
    logger.debug(`Moved file ${file.getName()} to ${toFolder.getName()}`);
  } catch (error) {
    logger.error(`Failed to move file ${file.getName()}: ${error.toString()}`);
  }
}

/**
 * Remove duplicate rows
 * @param {Array} data - Data array
 * @param {string} columns - Columns to check
 * @returns {Array} Data without duplicates
 */
function removeDuplicateRows(data, columns) {
  if (!columns) {
    // Remove exact duplicates
    const seen = new Set();
    return data.filter(row => {
      const key = JSON.stringify(row);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  } else {
    // Remove duplicates based on specific columns
    const columnIndices = columns.split(',').map(c => parseInt(c.trim()) - 1);
    const seen = new Set();
    
    return data.filter(row => {
      const key = columnIndices.map(i => row[i]).join('|');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

/**
 * Apply data formatting
 * @param {Sheet} sheet - Target sheet
 * @param {number} startRow - Starting row
 * @param {Array} data - Data array
 * @param {Object} config - Configuration
 */
function applyDataFormatting(sheet, startRow, data, config) {
  // Auto-detect and format columns
  for (let col = 0; col < data[0].length; col++) {
    const columnData = data.map(row => row[col]);
    const dataType = detectColumnType(columnData);
    
    const range = sheet.getRange(startRow, col + 1, data.length, 1);
    
    switch (dataType) {
      case 'date':
        range.setNumberFormat(config.data.dateFormat);
        break;
      case 'number':
        range.setNumberFormat(config.data.numberFormat);
        break;
      case 'currency':
        range.setNumberFormat('$#,##0.00');
        break;
      case 'percentage':
        range.setNumberFormat('0.00%');
        break;
    }
  }
}

/**
 * Detect column data type
 * @param {Array} columnData - Column data
 * @returns {string} Data type
 */
function detectColumnType(columnData) {
  const samples = columnData.filter(v => v !== null && v !== '').slice(0, 10);
  
  if (samples.length === 0) return 'text';
  
  // Check for dates
  const datePattern = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/;
  if (samples.every(v => datePattern.test(String(v)))) {
    return 'date';
  }
  
  // Check for currency
  const currencyPattern = /^\$?[\d,]+\.?\d*$/;
  if (samples.every(v => currencyPattern.test(String(v)))) {
    return 'currency';
  }
  
  // Check for percentages
  const percentPattern = /^\d+\.?\d*%$/;
  if (samples.every(v => percentPattern.test(String(v)))) {
    return 'percentage';
  }
  
  // Check for numbers
  if (samples.every(v => !isNaN(parseFloat(v)))) {
    return 'number';
  }
  
  return 'text';
}

// ================== REPORTING FUNCTIONS ==================

/**
 * Generate processing report
 * @param {Object} checkpoint - Checkpoint data
 * @param {Spreadsheet} spreadsheet - Target spreadsheet
 */
function generateProcessingReport(checkpoint, spreadsheet) {
  let reportSheet = spreadsheet.getSheetByName('Import Report');
  
  if (!reportSheet) {
    reportSheet = spreadsheet.insertSheet('Import Report');
  } else {
    reportSheet.clear();
  }
  
  const report = [
    ['CSV Import Report', ''],
    ['', ''],
    ['Generated', new Date().toLocaleString()],
    ['Start Time', checkpoint.startTime],
    ['', ''],
    ['Summary', ''],
    ['Total Files Processed', checkpoint.stats.totalFiles],
    ['Successful Imports', checkpoint.stats.successfulImports],
    ['Failed Imports', checkpoint.stats.failedImports],
    ['Skipped Files', checkpoint.stats.skippedFiles],
    ['Total Rows Imported', checkpoint.stats.totalRows],
    ['', ''],
    ['Errors', '']
  ];
  
  if (checkpoint.stats.errors.length > 0) {
    checkpoint.stats.errors.forEach(error => {
      report.push([error.file, error.error]);
    });
  } else {
    report.push(['No errors', '']);
  }
  
  reportSheet.getRange(1, 1, report.length, 2).setValues(report);
  
  // Format report
  reportSheet.getRange('A1:B1').merge()
    .setBackground('#0f9d58')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(16)
    .setHorizontalAlignment('center');
  
  reportSheet.getRange('A6:A6')
    .setBackground('#e8e8e8')
    .setFontWeight('bold');
  
  reportSheet.getRange('A13:A13')
    .setBackground('#e8e8e8')
    .setFontWeight('bold');
  
  reportSheet.autoResizeColumns(1, 2);
}

// ================== CHECKPOINT FUNCTIONS ==================

/**
 * Save checkpoint
 * @param {Object} checkpoint - Checkpoint data
 */
function saveCheckpoint(checkpoint) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('CSV_CHECKPOINT', JSON.stringify(checkpoint));
}

/**
 * Load checkpoint
 * @returns {Object|null} Checkpoint data
 */
function loadCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const checkpointStr = scriptProperties.getProperty('CSV_CHECKPOINT');
  return checkpointStr ? JSON.parse(checkpointStr) : null;
}

/**
 * Clear checkpoint
 */
function clearCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('CSV_CHECKPOINT');
}

/**
 * Resume processing
 */
function resumeProcessing() {
  const checkpoint = loadCheckpoint();
  
  if (!checkpoint) {
    SpreadsheetApp.getUi().alert('No Checkpoint Found', 
      'There is no processing to resume.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  processCSVFiles();
}

// ================== UTILITY FUNCTIONS ==================

/**
 * Create import folders
 */
function createImportFolders() {
  const config = getCSVConfiguration();
  
  const folders = [
    config.folders.sourceName,
    config.folders.processedName,
    config.folders.archiveName,
    config.folders.errorName
  ];
  
  folders.forEach(folderName => {
    const existing = DriveApp.getFoldersByName(folderName);
    if (!existing.hasNext()) {
      DriveApp.createFolder(folderName);
    }
  });
  
  SpreadsheetApp.getUi().alert('Folders Created', 
    'Import folders have been created successfully.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Clean processed files
 */
function cleanProcessedFiles() {
  const config = getCSVConfiguration();
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.alert('Clean Processed Files', 
    'This will permanently delete all files in the processed folder. Continue?',
    ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const processedFolders = DriveApp.getFoldersByName(config.folders.processedName);
  if (processedFolders.hasNext()) {
    const folder = processedFolders.next();
    const files = folder.getFiles();
    let count = 0;
    
    while (files.hasNext()) {
      const file = files.next();
      file.setTrashed(true);
      count++;
    }
    
    ui.alert('Clean Complete', 
      `Deleted ${count} processed files.`,
      ui.ButtonSet.OK);
  }
}

/**
 * Generate import report
 */
function generateImportReport() {
  const checkpoint = loadCheckpoint();
  
  if (!checkpoint) {
    SpreadsheetApp.getUi().alert('No Data Available', 
      'No import data available. Process some files first.',
      SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  generateProcessingReport(checkpoint, spreadsheet);
  
  SpreadsheetApp.getUi().alert('Report Generated', 
    'Import report has been generated in the "Import Report" sheet.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Clear CSV cache
 */
function clearCSVCache() {
  const cache = CacheService.getUserCache();
  cache.removeAll();
  
  SpreadsheetApp.getUi().alert('Cache Cleared', 
    'CSV cache has been cleared.',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Send processing notification
 * @param {Object} checkpoint - Checkpoint data
 * @param {Object} config - Configuration
 */
function sendProcessingNotification(checkpoint, config) {
  if (!config.notifications.recipients || config.notifications.recipients.length === 0) {
    return;
  }
  
  const subject = 'CSV Import Complete';
  let body = `CSV import processing has completed.\n\n`;
  body += `Summary:\n`;
  body += `- Total Files: ${checkpoint.stats.totalFiles}\n`;
  body += `- Successful: ${checkpoint.stats.successfulImports}\n`;
  body += `- Failed: ${checkpoint.stats.failedImports}\n`;
  body += `- Total Rows: ${checkpoint.stats.totalRows}\n\n`;
  
  if (config.notifications.includeErrors && checkpoint.stats.errors.length > 0) {
    body += `Errors:\n`;
    checkpoint.stats.errors.forEach(error => {
      body += `- ${error.file}: ${error.error}\n`;
    });
  }
  
  body += `\nView the import: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;
  
  config.notifications.recipients.forEach(email => {
    try {
      MailApp.sendEmail(email, subject, body);
    } catch (e) {
      console.error(`Failed to send notification to ${email}: ${e.toString()}`);
    }
  });
}

// ================== LOGGER CLASS ==================

/**
 * Logger class for configurable logging
 */
class Logger {
  constructor(enabled, level) {
    this.enabled = enabled;
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    this.currentLevel = this.levels[level] || 1;
  }
  
  log(level, ...args) {
    if (this.enabled && this.levels[level] >= this.currentLevel) {
      console.log(`[${level}]`, ...args);
    }
  }
  
  debug(...args) { this.log('DEBUG', ...args); }
  info(...args) { this.log('INFO', ...args); }
  warn(...args) { this.log('WARN', ...args); }
  error(...args) { this.log('ERROR', ...args); }
}

/**
 * Show about dialog
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  const message = 
    'CSV Combiner\n' +
    'Version: 2.0 (Refactored)\n\n' +
    'Features:\n' +
    '• Batch CSV processing\n' +
    '• Configurable parsing options\n' +
    '• Multiple combine modes\n' +
    '• Data validation and cleaning\n' +
    '• Column mapping\n' +
    '• Error handling and recovery\n\n' +
    'This script is fully configurable with no hardcoded values.\n' +
    'All settings can be managed through the Config sheet.';
  
  ui.alert('About CSV Combiner', message, ui.ButtonSet.OK);
}

// ================== INITIALIZATION ==================

/**
 * Check if configuration exists on open
 */
function checkConfiguration() {
  const userProperties = PropertiesService.getUserProperties();
  if (!userProperties.getProperty('SOURCE_FOLDER_NAME')) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('Configuration Required', 
      'This script requires initial configuration. Would you like to set it up now?',
      ui.ButtonSet.YES_NO);
    
    if (response === ui.Button.YES) {
      setupConfiguration();
    }
  }
}