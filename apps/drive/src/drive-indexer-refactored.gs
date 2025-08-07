/**
 * Google Drive Comprehensive Indexer
 * 
 * Service: Google Drive + Google Sheets
 * Version: 2.0.0
 * Created: 2024-01-01  
 * Updated: 2025-08-06
 * License: MIT
 * 
 * PURPOSE:
 * Creates a comprehensive index of Google Drive files and folders with metadata,
 * organization, and search capabilities. Supports large Drive structures with
 * checkpoint/resume functionality and configurable filtering.
 * 
 * FEATURES:
 * - Indexes all file types with detailed metadata
 * - Builds hierarchical folder tree visualization
 * - Configurable file type filtering and depth limits
 * - Batch processing with timeout protection
 * - Checkpoint/resume for large Drives
 * - Cross-account portability (no hardcoded values)
 * - Automatic categorization by file type
 * - Export to multiple formats
 * 
 * CONFIGURATION:
 * All settings managed via Config sheet or Properties Service.
 * No personal information or account-specific data is hardcoded.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Script Editor (Extensions > Apps Script)
 * 2. Run initializeDriveIndexer() to set up configuration
 * 3. Customize settings in Config sheet
 * 4. Run createDriveIndex() to generate index
 * 
 * REQUIRED PERMISSIONS:
 * - Drive (read): Access files and folders
 * - Sheets (write): Create and modify spreadsheets
 * - Script Properties: Store configuration and state
 * 
 * @OnlyCurrentDoc
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * File type definitions and categorization
 * Maps MIME types to categories and extensions
 */
const FILE_TYPE_CONFIG = {
  documents: {
    name: 'Documents',
    mimeTypes: [
      'application/vnd.google-apps.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/plain'
    ],
    extensions: ['.doc', '.docx', '.txt', '.rtf', '.odt'],
    icon: '📄'
  },
  spreadsheets: {
    name: 'Spreadsheets',
    mimeTypes: [
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    extensions: ['.xls', '.xlsx', '.csv', '.ods'],
    icon: '📊'
  },
  presentations: {
    name: 'Presentations',
    mimeTypes: [
      'application/vnd.google-apps.presentation',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    extensions: ['.ppt', '.pptx', '.odp'],
    icon: '📽️'
  },
  pdfs: {
    name: 'PDFs',
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    icon: '📕'
  },
  images: {
    name: 'Images',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'image/bmp'
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'],
    icon: '🖼️'
  },
  videos: {
    name: 'Videos',
    mimeTypes: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm'
    ],
    extensions: ['.mp4', '.mpeg', '.mov', '.avi', '.webm', '.mkv'],
    icon: '🎬'
  },
  audio: {
    name: 'Audio',
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/aac',
      'audio/ogg'
    ],
    extensions: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
    icon: '🎵'
  },
  code: {
    name: 'Code',
    mimeTypes: [
      'text/javascript',
      'text/html',
      'text/css',
      'application/json',
      'application/xml'
    ],
    extensions: ['.js', '.html', '.css', '.json', '.xml', '.py', '.java', '.cpp', '.sh'],
    icon: '💻'
  },
  archives: {
    name: 'Archives',
    mimeTypes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip'
    ],
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
    icon: '📦'
  },
  forms: {
    name: 'Forms',
    mimeTypes: ['application/vnd.google-apps.form'],
    extensions: [],
    icon: '📋'
  },
  drawings: {
    name: 'Drawings',
    mimeTypes: ['application/vnd.google-apps.drawing'],
    extensions: [],
    icon: '🎨'
  },
  sites: {
    name: 'Sites',
    mimeTypes: ['application/vnd.google-apps.site'],
    extensions: [],
    icon: '🌐'
  },
  scripts: {
    name: 'Scripts',
    mimeTypes: ['application/vnd.google-apps.script'],
    extensions: ['.gs'],
    icon: '⚙️'
  },
  shortcuts: {
    name: 'Shortcuts',
    mimeTypes: ['application/vnd.google-apps.shortcut'],
    extensions: [],
    icon: '🔗'
  }
};

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Get drive indexer configuration
 * Merges defaults with user settings
 * 
 * @return {Object} Complete configuration object
 */
function getDriveConfig() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Default configuration
  const defaults = {
    // Indexing settings
    indexing: {
      maxDepth: Number(userProperties.getProperty('MAX_DEPTH') || 5),
      maxFiles: Number(userProperties.getProperty('MAX_FILES') || 10000),
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 100),
      includeSharedDrives: userProperties.getProperty('INCLUDE_SHARED_DRIVES') === 'true',
      includeSharedWithMe: userProperties.getProperty('INCLUDE_SHARED_WITH_ME') === 'true',
      includeTrashed: userProperties.getProperty('INCLUDE_TRASHED') === 'true',
      includeHidden: userProperties.getProperty('INCLUDE_HIDDEN') === 'true',
      fileTypes: (userProperties.getProperty('FILE_TYPES') || 'all').split(','),
      excludeFolders: (userProperties.getProperty('EXCLUDE_FOLDERS') || '').split(',').filter(Boolean),
      excludePatterns: (userProperties.getProperty('EXCLUDE_PATTERNS') || '').split(',').filter(Boolean)
    },
    
    // Output settings
    output: {
      spreadsheetName: userProperties.getProperty('SPREADSHEET_NAME') || 'Drive Index',
      createFolderTree: userProperties.getProperty('CREATE_FOLDER_TREE') !== 'false',
      createFileSheets: userProperties.getProperty('CREATE_FILE_SHEETS') !== 'false',
      includeMetadata: userProperties.getProperty('INCLUDE_METADATA') !== 'false',
      includePermissions: userProperties.getProperty('INCLUDE_PERMISSIONS') === 'true',
      includePath: userProperties.getProperty('INCLUDE_PATH') !== 'false',
      dateFormat: userProperties.getProperty('DATE_FORMAT') || 'yyyy-MM-dd HH:mm:ss',
      sortBy: userProperties.getProperty('SORT_BY') || 'name', // name, date, size, type
      sortOrder: userProperties.getProperty('SORT_ORDER') || 'asc'
    },
    
    // Performance settings
    performance: {
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 300000), // 5 minutes
      checkpointInterval: Number(userProperties.getProperty('CHECKPOINT_INTERVAL') || 50),
      enableCaching: userProperties.getProperty('ENABLE_CACHING') !== 'false',
      cacheExpiration: Number(userProperties.getProperty('CACHE_EXPIRATION') || 3600000), // 1 hour
      resumeFromCheckpoint: userProperties.getProperty('RESUME_FROM_CHECKPOINT') === 'true'
    },
    
    // Logging settings
    logging: {
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO',
      logToSheet: userProperties.getProperty('LOG_TO_SHEET') === 'true',
      logToConsole: userProperties.getProperty('LOG_TO_CONSOLE') !== 'false',
      trackProgress: userProperties.getProperty('TRACK_PROGRESS') !== 'false'
    }
  };
  
  return defaults;
}

/**
 * Initialize Drive Indexer configuration
 * Creates Config sheet with all available settings
 */
function initializeDriveIndexer() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Drive Indexer Configuration');
  
  // Create Config sheet
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
  } else {
    configSheet.clear();
  }
  
  // Configuration template
  const configData = [
    ['Category', 'Setting', 'Current Value', 'Default', 'Description'],
    
    // Indexing settings
    ['Indexing', 'MAX_DEPTH', '5', '5', 'Maximum folder depth to traverse (1-10)'],
    ['Indexing', 'MAX_FILES', '10000', '10000', 'Maximum files to index'],
    ['Indexing', 'BATCH_SIZE', '100', '100', 'Files to process per batch'],
    ['Indexing', 'INCLUDE_SHARED_DRIVES', 'false', 'false', 'Include shared drives'],
    ['Indexing', 'INCLUDE_SHARED_WITH_ME', 'false', 'false', 'Include files shared with you'],
    ['Indexing', 'INCLUDE_TRASHED', 'false', 'false', 'Include trashed files'],
    ['Indexing', 'INCLUDE_HIDDEN', 'false', 'false', 'Include hidden files'],
    ['Indexing', 'FILE_TYPES', 'all', 'all', 'File types to index (all or comma-separated)'],
    ['Indexing', 'EXCLUDE_FOLDERS', '', '', 'Folder names to exclude (comma-separated)'],
    ['Indexing', 'EXCLUDE_PATTERNS', '', '', 'Patterns to exclude (comma-separated regex)'],
    
    ['', '', '', '', ''],
    
    // Output settings
    ['Output', 'SPREADSHEET_NAME', 'Drive Index', 'Drive Index', 'Name for output spreadsheet'],
    ['Output', 'CREATE_FOLDER_TREE', 'true', 'true', 'Create folder hierarchy sheet'],
    ['Output', 'CREATE_FILE_SHEETS', 'true', 'true', 'Create categorized file sheets'],
    ['Output', 'INCLUDE_METADATA', 'true', 'true', 'Include file metadata'],
    ['Output', 'INCLUDE_PERMISSIONS', 'false', 'false', 'Include sharing permissions'],
    ['Output', 'INCLUDE_PATH', 'true', 'true', 'Include full file path'],
    ['Output', 'DATE_FORMAT', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss', 'Date display format'],
    ['Output', 'SORT_BY', 'name', 'name', 'Sort by: name, date, size, type'],
    ['Output', 'SORT_ORDER', 'asc', 'asc', 'Sort order: asc or desc'],
    
    ['', '', '', '', ''],
    
    // Performance settings
    ['Performance', 'MAX_EXECUTION_TIME', '300000', '300000', 'Max runtime in milliseconds'],
    ['Performance', 'CHECKPOINT_INTERVAL', '50', '50', 'Save checkpoint every N files'],
    ['Performance', 'ENABLE_CACHING', 'true', 'true', 'Cache folder paths'],
    ['Performance', 'CACHE_EXPIRATION', '3600000', '3600000', 'Cache expiration in ms'],
    ['Performance', 'RESUME_FROM_CHECKPOINT', 'false', 'false', 'Resume from last checkpoint'],
    
    ['', '', '', '', ''],
    
    // Logging settings
    ['Logging', 'LOG_LEVEL', 'INFO', 'INFO', 'Log level: DEBUG, INFO, WARN, ERROR'],
    ['Logging', 'LOG_TO_SHEET', 'false', 'false', 'Log to spreadsheet'],
    ['Logging', 'LOG_TO_CONSOLE', 'true', 'true', 'Log to console'],
    ['Logging', 'TRACK_PROGRESS', 'true', 'true', 'Show progress updates']
  ];
  
  // Write configuration
  configSheet.getRange(1, 1, configData.length, 5).setValues(configData);
  
  // Format headers
  configSheet.getRange(1, 1, 1, 5)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  // Auto-resize columns
  configSheet.autoResizeColumns(1, 5);
  
  // Create instructions sheet
  createInstructionsSheet(ss);
  
  // Show completion message
  SpreadsheetApp.getUi().alert(
    'Drive Indexer Initialized',
    'Configuration created. Review settings in Config sheet, then run createDriveIndex() to start.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  logMessage('INFO', 'Drive Indexer initialized successfully');
}

/**
 * Create instructions sheet
 * 
 * @param {Spreadsheet} ss - Target spreadsheet
 */
function createInstructionsSheet(ss) {
  let sheet = ss.getSheetByName('Instructions') || ss.insertSheet('Instructions');
  sheet.clear();
  
  const instructions = [
    ['Drive Indexer - Instructions'],
    [''],
    ['SETUP:'],
    ['1. Review configuration in Config sheet'],
    ['2. Modify "Current Value" column as needed'],
    ['3. Run saveDriveConfig() to apply changes'],
    [''],
    ['USAGE:'],
    ['• Run createDriveIndex() to index your Drive'],
    ['• Run createFolderTree() for folder structure only'],
    ['• Run resumeIndexing() to continue from checkpoint'],
    [''],
    ['FILE TYPE OPTIONS:'],
    ['• all - Index all file types'],
    ['• documents,spreadsheets,presentations - Specific types'],
    ['• Available types: ' + Object.keys(FILE_TYPE_CONFIG).join(', ')],
    [''],
    ['PERFORMANCE TIPS:'],
    ['• Reduce MAX_DEPTH for faster indexing'],
    ['• Decrease BATCH_SIZE if experiencing timeouts'],
    ['• Enable RESUME_FROM_CHECKPOINT for large Drives'],
    ['• Use EXCLUDE_FOLDERS to skip large directories'],
    [''],
    ['TROUBLESHOOTING:'],
    ['• Set LOG_LEVEL to DEBUG for detailed output'],
    ['• Check execution transcript for errors'],
    ['• Enable LOG_TO_SHEET for persistent logs'],
    ['• Clear checkpoint with clearDriveCheckpoint()']
  ];
  
  sheet.getRange(1, 1, instructions.length, 1).setValues(instructions);
  sheet.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  sheet.autoResizeColumn(1);
}

/**
 * Save configuration from Config sheet
 */
function saveDriveConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    throw new Error('Config sheet not found. Run initializeDriveIndexer() first.');
  }
  
  const data = configSheet.getDataRange().getValues();
  const userProperties = PropertiesService.getUserProperties();
  
  // Process configuration (skip header)
  for (let i = 1; i < data.length; i++) {
    const [category, name, value] = data[i];
    
    if (name && value !== '') {
      userProperties.setProperty(name, value);
      logMessage('DEBUG', `Saved ${name} = ${value}`);
    }
  }
  
  SpreadsheetApp.getUi().alert('Configuration saved successfully!');
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

/**
 * Centralized logging function
 * 
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
function logMessage(level, message, context = {}) {
  const config = getDriveConfig();
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  
  // Check log level
  if (levels.indexOf(level) < levels.indexOf(config.logging.logLevel)) {
    return;
  }
  
  // Format log entry
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  // Console logging
  if (config.logging.logToConsole) {
    console.log(logEntry, context);
  }
  
  // Sheet logging
  if (config.logging.logToSheet) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let logSheet = ss.getSheetByName('Logs');
      
      if (!logSheet) {
        logSheet = ss.insertSheet('Logs');
        logSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Message', 'Context']]);
        logSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      }
      
      logSheet.appendRow([timestamp, level, message, JSON.stringify(context)]);
    } catch (error) {
      console.error('Failed to log to sheet:', error);
    }
  }
}

// ============================================================================
// MAIN INDEXING FUNCTIONS
// ============================================================================

/**
 * Main entry point - Create comprehensive Drive index
 */
function createDriveIndex() {
  const startTime = new Date().getTime();
  const config = getDriveConfig();
  
  logMessage('INFO', 'Starting Drive index creation', { config: config.indexing });
  
  try {
    // Initialize or resume from checkpoint
    const state = config.performance.resumeFromCheckpoint 
      ? loadDriveCheckpoint() 
      : initializeIndexState();
    
    if (state.checkpoint) {
      logMessage('INFO', 'Resuming from checkpoint', { 
        filesProcessed: state.processedFiles.size,
        foldersProcessed: state.processedFolders.size 
      });
    }
    
    // Create or get output spreadsheet
    const spreadsheet = getOrCreateIndexSpreadsheet(config);
    state.spreadsheet = spreadsheet;
    
    // Initialize sheets
    const sheets = initializeSheets(spreadsheet, config);
    state.sheets = sheets;
    
    // Get root folder or resume point
    const rootFolder = state.checkpoint 
      ? DriveApp.getFolderById(state.checkpoint.currentFolderId)
      : DriveApp.getRootFolder();
    
    // Process Drive recursively
    const results = indexDriveRecursively(rootFolder, state, config);
    
    // Finalize output
    finalizeIndex(spreadsheet, results, config);
    
    // Clear checkpoint on success
    if (state.checkpoint) {
      clearDriveCheckpoint();
    }
    
    // Log completion
    const duration = new Date().getTime() - startTime;
    logMessage('INFO', 'Drive index completed', {
      duration: duration,
      filesIndexed: results.totalFiles,
      foldersIndexed: results.totalFolders,
      spreadsheetUrl: spreadsheet.getUrl()
    });
    
    // Show completion message
    SpreadsheetApp.getUi().alert(
      'Index Complete',
      `Indexed ${results.totalFiles} files in ${results.totalFolders} folders.\n\nView index: ${spreadsheet.getUrl()}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    logMessage('ERROR', 'Index creation failed', { 
      error: error.toString(), 
      stack: error.stack 
    });
    
    // Save checkpoint for resume
    if (config.performance.enableCaching) {
      saveDriveCheckpoint(state);
    }
    
    throw error;
  }
}

/**
 * Initialize indexing state
 * 
 * @return {Object} Initial state object
 */
function initializeIndexState() {
  return {
    processedFiles: new Set(),
    processedFolders: new Set(),
    folderCache: new Map(),
    filesByType: {},
    folderTree: [],
    totalFiles: 0,
    totalFolders: 0,
    startTime: new Date().getTime(),
    checkpoint: null
  };
}

/**
 * Get or create index spreadsheet
 * 
 * @param {Object} config - Configuration
 * @return {Spreadsheet} Spreadsheet object
 */
function getOrCreateIndexSpreadsheet(config) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH-mm-ss');
  const name = `${config.output.spreadsheetName} - ${timestamp}`;
  
  const spreadsheet = SpreadsheetApp.create(name);
  logMessage('INFO', 'Created index spreadsheet', { name: name, id: spreadsheet.getId() });
  
  return spreadsheet;
}

/**
 * Initialize sheets for different file types
 * 
 * @param {Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Object} config - Configuration
 * @return {Object} Sheet references
 */
function initializeSheets(spreadsheet, config) {
  const sheets = {};
  
  // Remove default sheet
  const defaultSheet = spreadsheet.getSheets()[0];
  
  // Create summary sheet
  sheets.summary = spreadsheet.insertSheet('Summary');
  
  // Create folder tree sheet if requested
  if (config.output.createFolderTree) {
    sheets.folderTree = spreadsheet.insertSheet('Folder Tree');
    setupFolderTreeHeaders(sheets.folderTree);
  }
  
  // Create file type sheets if requested
  if (config.output.createFileSheets) {
    const fileTypes = config.indexing.fileTypes.includes('all') 
      ? Object.keys(FILE_TYPE_CONFIG)
      : config.indexing.fileTypes;
    
    fileTypes.forEach(type => {
      if (FILE_TYPE_CONFIG[type]) {
        const sheetName = FILE_TYPE_CONFIG[type].name;
        sheets[type] = spreadsheet.insertSheet(sheetName);
        setupFileSheetHeaders(sheets[type], config);
      }
    });
  }
  
  // Remove default sheet
  spreadsheet.deleteSheet(defaultSheet);
  
  return sheets;
}

/**
 * Set up folder tree sheet headers
 * 
 * @param {Sheet} sheet - Target sheet
 */
function setupFolderTreeHeaders(sheet) {
  const headers = [
    'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5',
    'Folder ID', 'Files', 'Size (MB)', 'Created', 'Modified', 'Owner'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
}

/**
 * Set up file sheet headers
 * 
 * @param {Sheet} sheet - Target sheet
 * @param {Object} config - Configuration
 */
function setupFileSheetHeaders(sheet, config) {
  const headers = ['Name', 'Type'];
  
  if (config.output.includePath) {
    headers.push('Path');
  }
  
  headers.push('Size', 'Created', 'Modified', 'Owner');
  
  if (config.output.includeMetadata) {
    headers.push('Description', 'Starred', 'Trashed');
  }
  
  if (config.output.includePermissions) {
    headers.push('Sharing', 'Viewers', 'Editors');
  }
  
  headers.push('URL', 'ID');
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  sheet.setFrozenRows(1);
}

/**
 * Index Drive recursively
 * 
 * @param {Folder} folder - Current folder
 * @param {Object} state - Indexing state
 * @param {Object} config - Configuration
 * @param {number} depth - Current depth
 * @param {Array} path - Current path
 * @return {Object} Indexing results
 */
function indexDriveRecursively(folder, state, config, depth = 0, path = []) {
  // Check depth limit
  if (depth > config.indexing.maxDepth) {
    return state;
  }
  
  // Check if already processed
  const folderId = folder.getId();
  if (state.processedFolders.has(folderId)) {
    return state;
  }
  
  // Check exclusions
  const folderName = folder.getName();
  if (config.indexing.excludeFolders.includes(folderName)) {
    logMessage('DEBUG', `Skipping excluded folder: ${folderName}`);
    return state;
  }
  
  // Mark as processed
  state.processedFolders.add(folderId);
  state.totalFolders++;
  
  // Update path
  const currentPath = [...path, folderName];
  
  // Log progress
  if (config.logging.trackProgress && state.totalFolders % 10 === 0) {
    logMessage('INFO', `Progress: ${state.totalFolders} folders, ${state.totalFiles} files processed`);
  }
  
  // Add to folder tree
  if (config.output.createFolderTree) {
    addToFolderTree(state, folder, currentPath, depth);
  }
  
  try {
    // Process files in folder
    const files = folder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      
      // Check file limit
      if (state.totalFiles >= config.indexing.maxFiles) {
        logMessage('WARN', `File limit reached: ${config.indexing.maxFiles}`);
        return state;
      }
      
      // Check timeout
      if (isTimeoutApproaching(state.startTime, config)) {
        logMessage('WARN', 'Approaching timeout, saving checkpoint');
        state.checkpoint = {
          currentFolderId: folderId,
          currentPath: currentPath,
          timestamp: new Date().toISOString()
        };
        throw new Error('Timeout approaching - checkpoint saved');
      }
      
      // Process file
      processFile(file, state, config, currentPath);
      
      // Save checkpoint periodically
      if (state.totalFiles % config.performance.checkpointInterval === 0) {
        saveDriveCheckpoint(state);
        logMessage('DEBUG', 'Checkpoint saved', { files: state.totalFiles });
      }
    }
    
    // Process subfolders
    const subfolders = folder.getFolders();
    while (subfolders.hasNext()) {
      const subfolder = subfolders.next();
      indexDriveRecursively(subfolder, state, config, depth + 1, currentPath);
    }
    
  } catch (error) {
    logMessage('ERROR', `Error processing folder: ${folderName}`, { 
      error: error.toString(),
      folderId: folderId 
    });
  }
  
  return state;
}

/**
 * Process individual file
 * 
 * @param {File} file - File to process
 * @param {Object} state - Indexing state
 * @param {Object} config - Configuration
 * @param {Array} path - File path
 */
function processFile(file, state, config, path) {
  try {
    // Check if already processed
    const fileId = file.getId();
    if (state.processedFiles.has(fileId)) {
      return;
    }
    
    // Check file type filter
    const fileType = getFileType(file);
    if (!config.indexing.fileTypes.includes('all') && !config.indexing.fileTypes.includes(fileType)) {
      return;
    }
    
    // Check exclusion patterns
    const fileName = file.getName();
    for (const pattern of config.indexing.excludePatterns) {
      if (pattern && fileName.match(new RegExp(pattern))) {
        logMessage('DEBUG', `Skipping file matching exclusion pattern: ${fileName}`);
        return;
      }
    }
    
    // Check if trashed
    if (!config.indexing.includeTrashed && file.isTrashed()) {
      return;
    }
    
    // Mark as processed
    state.processedFiles.add(fileId);
    state.totalFiles++;
    
    // Add to appropriate sheet
    if (config.output.createFileSheets && state.sheets[fileType]) {
      addFileToSheet(file, state.sheets[fileType], config, path);
    }
    
    // Track by type
    if (!state.filesByType[fileType]) {
      state.filesByType[fileType] = 0;
    }
    state.filesByType[fileType]++;
    
  } catch (error) {
    logMessage('WARN', `Error processing file: ${file.getName()}`, { 
      error: error.toString() 
    });
  }
}

/**
 * Get file type category
 * 
 * @param {File} file - File object
 * @return {string} File type category
 */
function getFileType(file) {
  const mimeType = file.getMimeType();
  const fileName = file.getName().toLowerCase();
  
  // Check by MIME type
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (config.mimeTypes.includes(mimeType)) {
      return type;
    }
  }
  
  // Check by extension
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    for (const ext of config.extensions) {
      if (fileName.endsWith(ext)) {
        return type;
      }
    }
  }
  
  return 'other';
}

/**
 * Add file to sheet
 * 
 * @param {File} file - File to add
 * @param {Sheet} sheet - Target sheet
 * @param {Object} config - Configuration
 * @param {Array} path - File path
 */
function addFileToSheet(file, sheet, config, path) {
  const row = [file.getName(), file.getMimeType()];
  
  if (config.output.includePath) {
    row.push(path.join('/'));
  }
  
  // Basic metadata
  row.push(
    formatFileSize(file.getSize()),
    formatDate(file.getDateCreated(), config),
    formatDate(file.getLastUpdated(), config),
    file.getOwner() ? file.getOwner().getEmail() : 'Unknown'
  );
  
  // Extended metadata
  if (config.output.includeMetadata) {
    row.push(
      file.getDescription() || '',
      file.isStarred() ? 'Yes' : 'No',
      file.isTrashed() ? 'Yes' : 'No'
    );
  }
  
  // Permissions
  if (config.output.includePermissions) {
    const access = file.getSharingAccess();
    const viewers = file.getViewers().map(u => u.getEmail()).join(', ');
    const editors = file.getEditors().map(u => u.getEmail()).join(', ');
    
    row.push(access, viewers, editors);
  }
  
  // File links
  row.push(file.getUrl(), file.getId());
  
  sheet.appendRow(row);
}

/**
 * Add folder to tree structure
 * 
 * @param {Object} state - Indexing state
 * @param {Folder} folder - Folder to add
 * @param {Array} path - Folder path
 * @param {number} depth - Current depth
 */
function addToFolderTree(state, folder, path, depth) {
  if (!state.sheets.folderTree) return;
  
  const row = [];
  
  // Add path levels (up to 5)
  for (let i = 0; i < 5; i++) {
    row.push(i < path.length ? path[i] : '');
  }
  
  // Add folder metadata
  try {
    const files = folder.getFiles();
    let fileCount = 0;
    let totalSize = 0;
    
    while (files.hasNext() && fileCount < 100) { // Limit to prevent timeout
      const file = files.next();
      fileCount++;
      totalSize += file.getSize();
    }
    
    row.push(
      folder.getId(),
      fileCount,
      (totalSize / 1048576).toFixed(2), // Convert to MB
      formatDate(folder.getDateCreated(), getDriveConfig()),
      formatDate(folder.getLastUpdated(), getDriveConfig()),
      folder.getOwner() ? folder.getOwner().getEmail() : 'Unknown'
    );
  } catch (error) {
    row.push(folder.getId(), 'Error', 0, '', '', '');
  }
  
  state.sheets.folderTree.appendRow(row);
}

/**
 * Finalize index with summary and formatting
 * 
 * @param {Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Object} results - Indexing results
 * @param {Object} config - Configuration
 */
function finalizeIndex(spreadsheet, results, config) {
  const summarySheet = spreadsheet.getSheetByName('Summary');
  
  // Create summary data
  const summaryData = [
    ['Drive Index Summary'],
    [''],
    ['Generated', formatDate(new Date(), config)],
    ['Total Files', results.totalFiles],
    ['Total Folders', results.totalFolders],
    ['Index Depth', config.indexing.maxDepth],
    [''],
    ['Files by Type']
  ];
  
  // Add file type breakdown
  for (const [type, count] of Object.entries(results.filesByType)) {
    const icon = FILE_TYPE_CONFIG[type] ? FILE_TYPE_CONFIG[type].icon : '📎';
    const name = FILE_TYPE_CONFIG[type] ? FILE_TYPE_CONFIG[type].name : type;
    summaryData.push([`${icon} ${name}`, count]);
  }
  
  // Write summary
  summarySheet.getRange(1, 1, summaryData.length, 2).setValues(summaryData);
  
  // Format summary
  summarySheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');
  summarySheet.getRange(3, 1, summaryData.length - 2, 1).setFontWeight('bold');
  summarySheet.autoResizeColumns(1, 2);
  
  // Sort sheets if configured
  if (config.output.sortBy !== 'none') {
    sortSheets(spreadsheet, config);
  }
  
  logMessage('INFO', 'Index finalized successfully');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format file size for display
 * 
 * @param {number} bytes - Size in bytes
 * @return {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format date for display
 * 
 * @param {Date} date - Date to format
 * @param {Object} config - Configuration
 * @return {string} Formatted date
 */
function formatDate(date, config) {
  if (!date) return '';
  
  try {
    return Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      config.output.dateFormat
    );
  } catch (error) {
    return date.toString();
  }
}

/**
 * Check if timeout is approaching
 * 
 * @param {number} startTime - Start timestamp
 * @param {Object} config - Configuration
 * @return {boolean} True if timeout approaching
 */
function isTimeoutApproaching(startTime, config) {
  const elapsed = new Date().getTime() - startTime;
  const buffer = 30000; // 30 second buffer
  
  return elapsed > (config.performance.maxExecutionTime - buffer);
}

/**
 * Sort sheets in spreadsheet
 * 
 * @param {Spreadsheet} spreadsheet - Target spreadsheet
 * @param {Object} config - Configuration
 */
function sortSheets(spreadsheet, config) {
  const sheets = spreadsheet.getSheets();
  
  sheets.forEach(sheet => {
    if (sheet.getName() !== 'Summary' && sheet.getName() !== 'Folder Tree') {
      const range = sheet.getDataRange();
      if (range.getNumRows() > 1) {
        let sortColumn = 1; // Default to name
        
        if (config.output.sortBy === 'date') {
          sortColumn = config.output.includePath ? 5 : 4; // Created date column
        } else if (config.output.sortBy === 'size') {
          sortColumn = config.output.includePath ? 4 : 3; // Size column
        } else if (config.output.sortBy === 'type') {
          sortColumn = 2; // Type column
        }
        
        range.sort({
          column: sortColumn,
          ascending: config.output.sortOrder === 'asc'
        });
      }
    }
  });
}

// ============================================================================
// CHECKPOINT MANAGEMENT
// ============================================================================

/**
 * Save indexing checkpoint
 * 
 * @param {Object} state - Current state
 */
function saveDriveCheckpoint(state) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  const checkpoint = {
    processedFiles: Array.from(state.processedFiles),
    processedFolders: Array.from(state.processedFolders),
    filesByType: state.filesByType,
    totalFiles: state.totalFiles,
    totalFolders: state.totalFolders,
    timestamp: new Date().toISOString()
  };
  
  // Save in chunks if too large
  const json = JSON.stringify(checkpoint);
  if (json.length > 9000) {
    // Properties have a 9KB limit per property
    scriptProperties.setProperty('driveCheckpoint_1', json.substring(0, 9000));
    scriptProperties.setProperty('driveCheckpoint_2', json.substring(9000));
  } else {
    scriptProperties.setProperty('driveCheckpoint', json);
  }
  
  logMessage('DEBUG', 'Checkpoint saved');
}

/**
 * Load indexing checkpoint
 * 
 * @return {Object} Checkpoint data or initial state
 */
function loadDriveCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  try {
    let json = scriptProperties.getProperty('driveCheckpoint');
    
    // Check for multi-part checkpoint
    if (!json) {
      const part1 = scriptProperties.getProperty('driveCheckpoint_1');
      const part2 = scriptProperties.getProperty('driveCheckpoint_2');
      if (part1) {
        json = part1 + (part2 || '');
      }
    }
    
    if (json) {
      const checkpoint = JSON.parse(json);
      
      // Reconstruct state
      const state = initializeIndexState();
      state.processedFiles = new Set(checkpoint.processedFiles);
      state.processedFolders = new Set(checkpoint.processedFolders);
      state.filesByType = checkpoint.filesByType;
      state.totalFiles = checkpoint.totalFiles;
      state.totalFolders = checkpoint.totalFolders;
      state.checkpoint = checkpoint;
      
      return state;
    }
  } catch (error) {
    logMessage('WARN', 'Failed to load checkpoint', { error: error.toString() });
  }
  
  return initializeIndexState();
}

/**
 * Clear saved checkpoint
 */
function clearDriveCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty('driveCheckpoint');
  scriptProperties.deleteProperty('driveCheckpoint_1');
  scriptProperties.deleteProperty('driveCheckpoint_2');
  
  logMessage('INFO', 'Checkpoint cleared');
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📁 Drive Indexer')
    .addItem('⚙️ Initialize Configuration', 'initializeDriveIndexer')
    .addItem('💾 Save Configuration', 'saveDriveConfig')
    .addSeparator()
    .addItem('▶️ Create Full Index', 'createDriveIndex')
    .addItem('🌳 Create Folder Tree Only', 'createFolderTreeOnly')
    .addItem('⏸️ Resume from Checkpoint', 'resumeIndexing')
    .addSeparator()
    .addItem('🗑️ Clear Checkpoint', 'clearDriveCheckpoint')
    .addItem('📊 View Statistics', 'showStatistics')
    .addSeparator()
    .addItem('❓ Help', 'showDriveHelp')
    .addToUi();
}

/**
 * Create folder tree only
 */
function createFolderTreeOnly() {
  const config = getDriveConfig();
  config.output.createFileSheets = false;
  config.output.createFolderTree = true;
  
  createDriveIndex();
}

/**
 * Resume indexing from checkpoint
 */
function resumeIndexing() {
  const config = getDriveConfig();
  config.performance.resumeFromCheckpoint = true;
  
  createDriveIndex();
}

/**
 * Show statistics dialog
 */
function showStatistics() {
  const state = loadDriveCheckpoint();
  
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h3>Indexing Statistics</h3>
      <p><strong>Files Processed:</strong> ${state.totalFiles}</p>
      <p><strong>Folders Processed:</strong> ${state.totalFolders}</p>
      <p><strong>Checkpoint Available:</strong> ${state.checkpoint ? 'Yes' : 'No'}</p>
      
      <h4>Files by Type:</h4>
      <ul>
        ${Object.entries(state.filesByType)
          .map(([type, count]) => `<li>${type}: ${count}</li>`)
          .join('')}
      </ul>
      
      ${state.checkpoint ? `
        <p style="margin-top: 20px;">
          <strong>Last Checkpoint:</strong> ${state.checkpoint.timestamp}
        </p>
      ` : ''}
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(400)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Drive Index Statistics');
}

/**
 * Show help dialog
 */
function showDriveHelp() {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-height: 500px; overflow-y: auto;">
      <h2>Drive Indexer - Help</h2>
      
      <h3>Quick Start</h3>
      <ol>
        <li>Run <strong>Initialize Configuration</strong></li>
        <li>Review settings in Config sheet</li>
        <li>Run <strong>Save Configuration</strong></li>
        <li>Run <strong>Create Full Index</strong></li>
      </ol>
      
      <h3>Features</h3>
      <ul>
        <li>Index all Drive files with metadata</li>
        <li>Create hierarchical folder tree</li>
        <li>Categorize files by type</li>
        <li>Resume from checkpoint if interrupted</li>
        <li>Export sharing permissions</li>
      </ul>
      
      <h3>Configuration Options</h3>
      <dl>
        <dt><strong>MAX_DEPTH</strong></dt>
        <dd>Maximum folder depth to traverse (1-10)</dd>
        
        <dt><strong>FILE_TYPES</strong></dt>
        <dd>Comma-separated list or "all"</dd>
        
        <dt><strong>EXCLUDE_FOLDERS</strong></dt>
        <dd>Folder names to skip</dd>
        
        <dt><strong>BATCH_SIZE</strong></dt>
        <dd>Files per batch (affects performance)</dd>
      </dl>
      
      <h3>Performance Tips</h3>
      <ul>
        <li>Reduce MAX_DEPTH for faster indexing</li>
        <li>Use FILE_TYPES to limit scope</li>
        <li>Enable checkpointing for large Drives</li>
        <li>Exclude large folders like backups</li>
      </ul>
      
      <h3>File Type Categories</h3>
      <p>${Object.entries(FILE_TYPE_CONFIG)
        .map(([key, config]) => `${config.icon} <strong>${config.name}</strong>`)
        .join(', ')}</p>
      
      <h3>Troubleshooting</h3>
      <ul>
        <li>Set LOG_LEVEL to DEBUG for details</li>
        <li>Check execution transcript for errors</li>
        <li>Use Resume from Checkpoint after timeout</li>
        <li>Clear checkpoint if index is corrupted</li>
      </ul>
      
      <p style="margin-top: 20px; color: #666;">
        Version 2.0.0 | MIT License
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Drive Indexer Help');
}