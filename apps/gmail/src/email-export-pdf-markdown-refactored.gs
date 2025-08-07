/**
 * Email Export to PDF and Markdown
 * 
 * Service: Gmail + Google Drive + Google Sheets
 * Version: 2.0.0
 * Created: 2023-01-01
 * Updated: 2025-08-07
 * License: MIT
 * 
 * PURPOSE:
 * Exports Gmail emails to PDF and Markdown formats with comprehensive metadata
 * tracking in a spreadsheet. Supports batch processing, multiple export formats,
 * and configurable search criteria.
 * 
 * FEATURES:
 * - Export emails to PDF, Markdown, or both formats
 * - Configurable search criteria (labels, keywords, date ranges)
 * - Automatic folder organization by date/label
 * - Metadata extraction and spreadsheet tracking
 * - Attachment handling and archiving
 * - Batch processing with timeout protection
 * - Checkpoint/resume for large exports
 * - HTML to Markdown conversion
 * - Charge amount extraction from financial emails
 * 
 * CONFIGURATION:
 * All settings managed via Config sheet or Properties Service.
 * No personal information or credentials are hardcoded.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Run initializeEmailExport() to create configuration
 * 2. Configure search criteria and export settings
 * 3. Run exportEmails() or use the custom menu
 * 
 * REQUIRED PERMISSIONS:
 * - Gmail (read): Access email content
 * - Drive (write): Create folders and files
 * - Sheets (write): Track metadata
 * - Script Properties: Store configuration
 * 
 * @OnlyCurrentDoc
 */

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * Get email export configuration
 * @return {Object} Configuration object with all settings
 */
function getEmailExportConfig() {
  const userProperties = PropertiesService.getUserProperties();
  const scriptProperties = PropertiesService.getScriptProperties();
  
  return {
    // Search settings
    search: {
      defaultQuery: userProperties.getProperty('DEFAULT_SEARCH_QUERY') || '',
      maxThreads: Number(userProperties.getProperty('MAX_THREADS') || 500),
      includeSpam: userProperties.getProperty('INCLUDE_SPAM') === 'true',
      includeTrash: userProperties.getProperty('INCLUDE_TRASH') === 'true',
      dateRangeEnabled: userProperties.getProperty('DATE_RANGE_ENABLED') === 'true',
      daysBack: Number(userProperties.getProperty('DAYS_BACK') || 30),
      labels: (userProperties.getProperty('SEARCH_LABELS') || '').split(',').filter(Boolean),
      excludeLabels: (userProperties.getProperty('EXCLUDE_LABELS') || '').split(',').filter(Boolean)
    },
    
    // Export settings
    export: {
      formats: (userProperties.getProperty('EXPORT_FORMATS') || 'pdf,markdown').split(','),
      folderStructure: userProperties.getProperty('FOLDER_STRUCTURE') || 'YYYY/MM/Label',
      rootFolderName: userProperties.getProperty('ROOT_FOLDER_NAME') || 'Email Exports',
      fileNaming: userProperties.getProperty('FILE_NAMING') || '[date]_[sender]_[subject]',
      includeAttachments: userProperties.getProperty('INCLUDE_ATTACHMENTS') !== 'false',
      attachmentFolder: userProperties.getProperty('ATTACHMENT_FOLDER') || 'Attachments',
      maxAttachmentSize: Number(userProperties.getProperty('MAX_ATTACHMENT_SIZE') || 10485760), // 10MB
      sanitizeFilenames: userProperties.getProperty('SANITIZE_FILENAMES') !== 'false'
    },
    
    // Spreadsheet settings
    spreadsheet: {
      trackExports: userProperties.getProperty('TRACK_EXPORTS') !== 'false',
      sheetName: userProperties.getProperty('EXPORT_SHEET_NAME') || 'Email Exports',
      includeLinks: userProperties.getProperty('INCLUDE_LINKS') !== 'false',
      extractCharges: userProperties.getProperty('EXTRACT_CHARGES') === 'true',
      customFields: (userProperties.getProperty('CUSTOM_FIELDS') || '').split(',').filter(Boolean),
      dateFormat: userProperties.getProperty('DATE_FORMAT') || 'yyyy-MM-dd HH:mm:ss',
      timezone: userProperties.getProperty('TIMEZONE') || Session.getScriptTimeZone()
    },
    
    // Processing settings
    processing: {
      batchSize: Number(userProperties.getProperty('BATCH_SIZE') || 50),
      maxExecutionTime: Number(userProperties.getProperty('MAX_EXECUTION_TIME') || 300000), // 5 minutes
      enableCheckpoint: userProperties.getProperty('ENABLE_CHECKPOINT') !== 'false',
      resumeFromCheckpoint: userProperties.getProperty('RESUME_FROM_CHECKPOINT') === 'true',
      parallelProcessing: userProperties.getProperty('PARALLEL_PROCESSING') === 'true',
      retryFailedExports: userProperties.getProperty('RETRY_FAILED') !== 'false'
    },
    
    // Sharing settings
    sharing: {
      autoShare: userProperties.getProperty('AUTO_SHARE') === 'true',
      shareWith: (userProperties.getProperty('SHARE_WITH_EMAILS') || '').split(',').filter(Boolean),
      sharePermission: userProperties.getProperty('SHARE_PERMISSION') || 'VIEW', // VIEW, COMMENT, EDIT
      notifyOnShare: userProperties.getProperty('NOTIFY_ON_SHARE') === 'true'
    },
    
    // Advanced settings
    advanced: {
      htmlToPdfOptions: {
        landscape: userProperties.getProperty('PDF_LANDSCAPE') === 'true',
        printBackground: userProperties.getProperty('PDF_PRINT_BACKGROUND') !== 'false',
        displayHeaderFooter: userProperties.getProperty('PDF_HEADER_FOOTER') === 'true',
        scale: Number(userProperties.getProperty('PDF_SCALE') || 1)
      },
      markdownOptions: {
        preserveFormatting: userProperties.getProperty('MD_PRESERVE_FORMAT') !== 'false',
        includeImages: userProperties.getProperty('MD_INCLUDE_IMAGES') === 'true',
        wrapWidth: Number(userProperties.getProperty('MD_WRAP_WIDTH') || 80)
      },
      deduplication: userProperties.getProperty('DEDUPE_EXPORTS') !== 'false',
      preserveThreading: userProperties.getProperty('PRESERVE_THREADING') === 'true'
    },
    
    // Logging settings
    logging: {
      logLevel: userProperties.getProperty('LOG_LEVEL') || 'INFO',
      logToSheet: userProperties.getProperty('LOG_TO_SHEET') === 'true',
      logExportDetails: userProperties.getProperty('LOG_EXPORT_DETAILS') !== 'false',
      sendSummaryEmail: userProperties.getProperty('SEND_SUMMARY_EMAIL') === 'true',
      summaryEmailTo: userProperties.getProperty('SUMMARY_EMAIL_TO') || Session.getActiveUser().getEmail()
    }
  };
}

/**
 * Initialize email export configuration
 */
function initializeEmailExport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Email Export Configuration');
  
  // Create Config sheet
  let configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
  } else {
    configSheet.clear();
  }
  
  // Configuration template
  const configData = [
    ['Category', 'Setting', 'Value', 'Default', 'Description'],
    
    // Search settings
    ['Search', 'DEFAULT_SEARCH_QUERY', '', '', 'Default Gmail search query'],
    ['Search', 'MAX_THREADS', '500', '500', 'Maximum email threads to export'],
    ['Search', 'INCLUDE_SPAM', 'false', 'false', 'Include spam folder'],
    ['Search', 'INCLUDE_TRASH', 'false', 'false', 'Include trash folder'],
    ['Search', 'DATE_RANGE_ENABLED', 'false', 'false', 'Enable date range filtering'],
    ['Search', 'DAYS_BACK', '30', '30', 'Days to look back if date range enabled'],
    ['Search', 'SEARCH_LABELS', '', '', 'Comma-separated labels to search'],
    ['Search', 'EXCLUDE_LABELS', '', '', 'Comma-separated labels to exclude'],
    
    ['', '', '', '', ''],
    
    // Export settings
    ['Export', 'EXPORT_FORMATS', 'pdf,markdown', 'pdf,markdown', 'Export formats (pdf,markdown,html)'],
    ['Export', 'FOLDER_STRUCTURE', 'YYYY/MM/Label', 'YYYY/MM/Label', 'Folder organization pattern'],
    ['Export', 'ROOT_FOLDER_NAME', 'Email Exports', 'Email Exports', 'Root folder for exports'],
    ['Export', 'FILE_NAMING', '[date]_[sender]_[subject]', '[date]_[sender]_[subject]', 'File naming pattern'],
    ['Export', 'INCLUDE_ATTACHMENTS', 'true', 'true', 'Export email attachments'],
    ['Export', 'ATTACHMENT_FOLDER', 'Attachments', 'Attachments', 'Subfolder for attachments'],
    ['Export', 'MAX_ATTACHMENT_SIZE', '10485760', '10485760', 'Max attachment size in bytes'],
    ['Export', 'SANITIZE_FILENAMES', 'true', 'true', 'Remove special characters from filenames'],
    
    ['', '', '', '', ''],
    
    // Spreadsheet settings
    ['Spreadsheet', 'TRACK_EXPORTS', 'true', 'true', 'Track exports in spreadsheet'],
    ['Spreadsheet', 'EXPORT_SHEET_NAME', 'Email Exports', 'Email Exports', 'Sheet name for tracking'],
    ['Spreadsheet', 'INCLUDE_LINKS', 'true', 'true', 'Include Drive links in sheet'],
    ['Spreadsheet', 'EXTRACT_CHARGES', 'false', 'false', 'Extract charge amounts from emails'],
    ['Spreadsheet', 'CUSTOM_FIELDS', '', '', 'Additional fields to extract'],
    ['Spreadsheet', 'DATE_FORMAT', 'yyyy-MM-dd HH:mm:ss', 'yyyy-MM-dd HH:mm:ss', 'Date format pattern'],
    
    ['', '', '', '', ''],
    
    // Processing settings
    ['Processing', 'BATCH_SIZE', '50', '50', 'Emails to process per batch'],
    ['Processing', 'MAX_EXECUTION_TIME', '300000', '300000', 'Max runtime in milliseconds'],
    ['Processing', 'ENABLE_CHECKPOINT', 'true', 'true', 'Enable checkpoint saving'],
    ['Processing', 'RESUME_FROM_CHECKPOINT', 'false', 'false', 'Resume from last checkpoint'],
    ['Processing', 'PARALLEL_PROCESSING', 'false', 'false', 'Process emails in parallel'],
    ['Processing', 'RETRY_FAILED', 'true', 'true', 'Retry failed exports'],
    
    ['', '', '', '', ''],
    
    // Sharing settings
    ['Sharing', 'AUTO_SHARE', 'false', 'false', 'Automatically share exported folders'],
    ['Sharing', 'SHARE_WITH_EMAILS', '', '', 'Comma-separated emails to share with'],
    ['Sharing', 'SHARE_PERMISSION', 'VIEW', 'VIEW', 'Permission level: VIEW, COMMENT, EDIT'],
    ['Sharing', 'NOTIFY_ON_SHARE', 'false', 'false', 'Send notification when sharing'],
    
    ['', '', '', '', ''],
    
    // Advanced settings
    ['Advanced', 'PDF_LANDSCAPE', 'false', 'false', 'PDF in landscape orientation'],
    ['Advanced', 'PDF_PRINT_BACKGROUND', 'true', 'true', 'Include background in PDF'],
    ['Advanced', 'PDF_HEADER_FOOTER', 'false', 'false', 'Add header/footer to PDF'],
    ['Advanced', 'PDF_SCALE', '1', '1', 'PDF scale factor (0.1-2)'],
    ['Advanced', 'MD_PRESERVE_FORMAT', 'true', 'true', 'Preserve formatting in Markdown'],
    ['Advanced', 'MD_INCLUDE_IMAGES', 'false', 'false', 'Include images in Markdown'],
    ['Advanced', 'MD_WRAP_WIDTH', '80', '80', 'Markdown line wrap width'],
    ['Advanced', 'DEDUPE_EXPORTS', 'true', 'true', 'Skip already exported emails'],
    ['Advanced', 'PRESERVE_THREADING', 'false', 'false', 'Maintain email thread structure'],
    
    ['', '', '', '', ''],
    
    // Logging settings
    ['Logging', 'LOG_LEVEL', 'INFO', 'INFO', 'Log level: DEBUG, INFO, WARN, ERROR'],
    ['Logging', 'LOG_TO_SHEET', 'false', 'false', 'Log to spreadsheet'],
    ['Logging', 'LOG_EXPORT_DETAILS', 'true', 'true', 'Log detailed export information'],
    ['Logging', 'SEND_SUMMARY_EMAIL', 'false', 'false', 'Send summary email after export'],
    ['Logging', 'SUMMARY_EMAIL_TO', Session.getActiveUser().getEmail(), '', 'Email for summary reports']
  ];
  
  // Write configuration
  configSheet.getRange(1, 1, configData.length, 5).setValues(configData);
  
  // Format headers
  configSheet.getRange(1, 1, 1, 5)
    .setFontWeight('bold')
    .setBackground('#ea4335')
    .setFontColor('white');
  
  // Auto-resize columns
  configSheet.autoResizeColumns(1, 5);
  
  // Create search templates sheet
  createSearchTemplates(ss);
  
  // Show completion message
  SpreadsheetApp.getUi().alert(
    'Email Export Initialized',
    'Configuration created. Review settings and run exportEmails() to start.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  
  logExport('INFO', 'Email export initialized successfully');
}

/**
 * Create search templates sheet
 * @param {Spreadsheet} ss - Spreadsheet
 */
function createSearchTemplates(ss) {
  let sheet = ss.getSheetByName('Search Templates') || ss.insertSheet('Search Templates');
  sheet.clear();
  
  const templates = [
    ['Template Name', 'Search Query', 'Description'],
    ['Unread Important', 'is:unread is:important', 'Unread important emails'],
    ['Last Week', 'newer_than:7d', 'Emails from the last 7 days'],
    ['With Attachments', 'has:attachment', 'Emails with attachments'],
    ['From Specific Sender', 'from:sender@example.com', 'Emails from specific sender'],
    ['Subject Contains', 'subject:"keyword"', 'Emails with keyword in subject'],
    ['Label Filter', 'label:work OR label:personal', 'Emails with specific labels'],
    ['Date Range', 'after:2025/1/1 before:2025/12/31', 'Emails within date range'],
    ['Large Emails', 'larger:5M', 'Emails larger than 5MB'],
    ['Starred', 'is:starred', 'Starred emails'],
    ['Sent Mail', 'in:sent', 'Sent emails']
  ];
  
  sheet.getRange(1, 1, templates.length, 3).setValues(templates);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#ea4335').setFontColor('white');
  sheet.autoResizeColumns(1, 3);
}

// ============================================================================
// LOGGING SYSTEM
// ============================================================================

/**
 * Export-specific logging
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 */
function logExport(level, message, context = {}) {
  const config = getEmailExportConfig();
  const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  
  if (levels.indexOf(level) < levels.indexOf(config.logging.logLevel)) {
    return;
  }
  
  const timestamp = Utilities.formatDate(new Date(), config.spreadsheet.timezone, 'yyyy-MM-dd HH:mm:ss');
  console.log(`[${timestamp}] [${level}] ${message}`, context);
  
  if (config.logging.logToSheet) {
    logToExportSheet(timestamp, level, message, context);
  }
}

/**
 * Log to export sheet
 * @param {string} timestamp - Timestamp
 * @param {string} level - Log level
 * @param {string} message - Message
 * @param {Object} context - Context
 */
function logToExportSheet(timestamp, level, message, context) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Export Logs') || ss.insertSheet('Export Logs');
    
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Level', 'Message', 'Context']]);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }
    
    sheet.appendRow([timestamp, level, message, JSON.stringify(context)]);
  } catch (error) {
    console.error('Failed to log to sheet:', error);
  }
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

/**
 * Main entry point - Export emails based on configuration
 * @param {Object} searchParams - Optional search parameters to override config
 */
function exportEmails(searchParams = {}) {
  const startTime = new Date().getTime();
  const config = getEmailExportConfig();
  
  logExport('INFO', 'Starting email export');
  
  try {
    // Check for resume from checkpoint
    let state = null;
    if (config.processing.resumeFromCheckpoint) {
      state = loadEmailCheckpoint();
      if (state) {
        logExport('INFO', 'Resuming from checkpoint', { 
          processed: state.processedCount 
        });
      }
    }
    
    // Initialize state if not resuming
    if (!state) {
      state = {
        threads: [],
        processedCount: 0,
        exportedFiles: [],
        failedExports: [],
        startTime: startTime,
        exportFolder: null,
        spreadsheetData: []
      };
      
      // Build search query
      const searchQuery = buildSearchQuery(config, searchParams);
      logExport('DEBUG', 'Search query', { query: searchQuery });
      
      // Search for emails
      state.threads = searchEmails(searchQuery, config);
      logExport('INFO', `Found ${state.threads.length} threads to export`);
      
      // Create export folder
      state.exportFolder = createExportFolder(config);
    }
    
    // Process emails in batches
    processEmailBatches(state, config);
    
    // Create tracking spreadsheet
    if (config.spreadsheet.trackExports && state.spreadsheetData.length > 0) {
      createTrackingSpreadsheet(state, config);
    }
    
    // Share folder if configured
    if (config.sharing.autoShare && state.exportFolder) {
      shareExportFolder(state.exportFolder, config);
    }
    
    // Send summary email if configured
    if (config.logging.sendSummaryEmail) {
      sendSummaryEmail(state, config);
    }
    
    // Clear checkpoint on success
    clearEmailCheckpoint();
    
    // Log completion
    const duration = new Date().getTime() - startTime;
    logExport('INFO', 'Email export completed', {
      duration: duration,
      processed: state.processedCount,
      exported: state.exportedFiles.length,
      failed: state.failedExports.length
    });
    
    // Show completion message
    SpreadsheetApp.getUi().alert(
      'Export Complete',
      `Exported ${state.exportedFiles.length} emails.\nFailed: ${state.failedExports.length}\nFolder: ${state.exportFolder.getUrl()}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return state;
    
  } catch (error) {
    logExport('ERROR', 'Export failed', { 
      error: error.toString(), 
      stack: error.stack 
    });
    
    // Save checkpoint for resume
    if (state && config.processing.enableCheckpoint) {
      saveEmailCheckpoint(state);
    }
    
    throw error;
  }
}

/**
 * Build search query from configuration and parameters
 * @param {Object} config - Configuration
 * @param {Object} params - Search parameters
 * @return {string} Gmail search query
 */
function buildSearchQuery(config, params = {}) {
  const parts = [];
  
  // Base query
  const baseQuery = params.query || config.search.defaultQuery;
  if (baseQuery) {
    parts.push(baseQuery);
  }
  
  // Date range
  if (config.search.dateRangeEnabled || params.dateRange) {
    const daysBack = params.daysBack || config.search.daysBack;
    parts.push(`newer_than:${daysBack}d`);
  }
  
  // Labels
  const labels = params.labels || config.search.labels;
  if (labels.length > 0) {
    parts.push(labels.map(label => `label:${label}`).join(' OR '));
  }
  
  // Exclude labels
  const excludeLabels = params.excludeLabels || config.search.excludeLabels;
  excludeLabels.forEach(label => {
    parts.push(`-label:${label}`);
  });
  
  // Spam and trash
  if (!config.search.includeSpam && !params.includeSpam) {
    parts.push('-in:spam');
  }
  if (!config.search.includeTrash && !params.includeTrash) {
    parts.push('-in:trash');
  }
  
  return parts.join(' ');
}

/**
 * Search for emails matching criteria
 * @param {string} query - Gmail search query
 * @param {Object} config - Configuration
 * @return {Array} Email threads
 */
function searchEmails(query, config) {
  const threads = [];
  let start = 0;
  const batchSize = 500; // Gmail API limit
  
  while (start < config.search.maxThreads) {
    const batch = GmailApp.search(query, start, Math.min(batchSize, config.search.maxThreads - start));
    
    if (batch.length === 0) {
      break;
    }
    
    threads.push(...batch);
    start += batch.length;
    
    logExport('DEBUG', `Fetched ${threads.length} threads`);
    
    if (threads.length >= config.search.maxThreads) {
      break;
    }
  }
  
  return threads;
}

/**
 * Create export folder structure
 * @param {Object} config - Configuration
 * @return {Folder} Root export folder
 */
function createExportFolder(config) {
  const rootFolder = getOrCreateFolder(config.export.rootFolderName);
  
  // Create timestamp subfolder
  const timestamp = Utilities.formatDate(
    new Date(), 
    config.spreadsheet.timezone, 
    'yyyy-MM-dd_HH-mm-ss'
  );
  
  const exportFolder = rootFolder.createFolder(`Export_${timestamp}`);
  
  logExport('INFO', 'Created export folder', { 
    name: exportFolder.getName(),
    id: exportFolder.getId() 
  });
  
  return exportFolder;
}

/**
 * Process email batches
 * @param {Object} state - Current state
 * @param {Object} config - Configuration
 */
function processEmailBatches(state, config) {
  const batchSize = config.processing.batchSize;
  
  for (let i = state.processedCount; i < state.threads.length; i += batchSize) {
    // Check timeout
    if (isTimeoutApproaching(state.startTime, config)) {
      state.processedCount = i;
      saveEmailCheckpoint(state);
      throw new Error('Approaching timeout - checkpoint saved. Run again to resume.');
    }
    
    const batch = state.threads.slice(i, Math.min(i + batchSize, state.threads.length));
    
    batch.forEach(thread => {
      try {
        processThread(thread, state, config);
        state.processedCount++;
      } catch (error) {
        logExport('WARN', `Failed to process thread: ${thread.getFirstMessageSubject()}`, {
          error: error.toString()
        });
        state.failedExports.push({
          subject: thread.getFirstMessageSubject(),
          error: error.toString()
        });
      }
    });
    
    // Log progress
    if (state.processedCount % 10 === 0) {
      logExport('INFO', `Progress: ${state.processedCount}/${state.threads.length} threads processed`);
    }
  }
}

/**
 * Process individual email thread
 * @param {GmailThread} thread - Email thread
 * @param {Object} state - Current state
 * @param {Object} config - Configuration
 */
function processThread(thread, state, config) {
  const messages = thread.getMessages();
  
  messages.forEach((message, index) => {
    // Check deduplication
    if (config.advanced.deduplication && isAlreadyExported(message, state)) {
      logExport('DEBUG', 'Skipping duplicate', { 
        subject: message.getSubject() 
      });
      return;
    }
    
    // Create folder structure
    const messageFolder = createMessageFolder(message, state.exportFolder, config);
    
    // Export in requested formats
    const exportedFiles = {};
    
    if (config.export.formats.includes('pdf')) {
      exportedFiles.pdf = exportToPDF(message, messageFolder, config);
    }
    
    if (config.export.formats.includes('markdown')) {
      exportedFiles.markdown = exportToMarkdown(message, messageFolder, config);
    }
    
    if (config.export.formats.includes('html')) {
      exportedFiles.html = exportToHTML(message, messageFolder, config);
    }
    
    // Export attachments
    if (config.export.includeAttachments) {
      exportedFiles.attachments = exportAttachments(message, messageFolder, config);
    }
    
    // Track in spreadsheet
    if (config.spreadsheet.trackExports) {
      const rowData = createSpreadsheetRow(message, exportedFiles, config);
      state.spreadsheetData.push(rowData);
    }
    
    // Add to exported files list
    state.exportedFiles.push({
      messageId: message.getId(),
      subject: message.getSubject(),
      files: exportedFiles
    });
  });
}

/**
 * Check if message is already exported
 * @param {GmailMessage} message - Email message
 * @param {Object} state - Current state
 * @return {boolean} True if already exported
 */
function isAlreadyExported(message, state) {
  return state.exportedFiles.some(exp => exp.messageId === message.getId());
}

/**
 * Create folder structure for message
 * @param {GmailMessage} message - Email message
 * @param {Folder} rootFolder - Root folder
 * @param {Object} config - Configuration
 * @return {Folder} Message folder
 */
function createMessageFolder(message, rootFolder, config) {
  const date = message.getDate();
  const labels = message.getThread().getLabels();
  
  // Parse folder structure pattern
  let folderPath = config.export.folderStructure;
  
  // Replace date tokens
  folderPath = folderPath.replace('YYYY', date.getFullYear());
  folderPath = folderPath.replace('MM', String(date.getMonth() + 1).padStart(2, '0'));
  folderPath = folderPath.replace('DD', String(date.getDate()).padStart(2, '0'));
  
  // Replace label token
  const labelName = labels.length > 0 ? labels[0].getName() : 'Inbox';
  folderPath = folderPath.replace('Label', sanitizeFolderName(labelName));
  
  // Create nested folders
  const pathParts = folderPath.split('/');
  let currentFolder = rootFolder;
  
  pathParts.forEach(part => {
    if (part) {
      currentFolder = getOrCreateSubfolder(currentFolder, part);
    }
  });
  
  return currentFolder;
}

/**
 * Export message to PDF
 * @param {GmailMessage} message - Email message
 * @param {Folder} folder - Destination folder
 * @param {Object} config - Configuration
 * @return {File} PDF file
 */
function exportToPDF(message, folder, config) {
  const subject = message.getSubject() || 'No Subject';
  const fileName = createFileName(message, 'pdf', config);
  
  // Create HTML content
  const html = createEmailHTML(message, config);
  
  // Convert to PDF
  const blob = Utilities.newBlob(html, 'text/html', 'temp.html');
  const pdf = blob.getAs('application/pdf').setName(fileName);
  
  const file = folder.createFile(pdf);
  
  logExport('DEBUG', 'Exported to PDF', { 
    fileName: fileName,
    fileId: file.getId() 
  });
  
  return file;
}

/**
 * Export message to Markdown
 * @param {GmailMessage} message - Email message
 * @param {Folder} folder - Destination folder
 * @param {Object} config - Configuration
 * @return {File} Markdown file
 */
function exportToMarkdown(message, folder, config) {
  const fileName = createFileName(message, 'md', config);
  
  // Convert to Markdown
  const markdown = createEmailMarkdown(message, config);
  
  const file = folder.createFile(fileName, markdown, MimeType.PLAIN_TEXT);
  
  logExport('DEBUG', 'Exported to Markdown', { 
    fileName: fileName,
    fileId: file.getId() 
  });
  
  return file;
}

/**
 * Export message to HTML
 * @param {GmailMessage} message - Email message
 * @param {Folder} folder - Destination folder
 * @param {Object} config - Configuration
 * @return {File} HTML file
 */
function exportToHTML(message, folder, config) {
  const fileName = createFileName(message, 'html', config);
  
  const html = createEmailHTML(message, config);
  
  const file = folder.createFile(fileName, html, MimeType.HTML);
  
  logExport('DEBUG', 'Exported to HTML', { 
    fileName: fileName,
    fileId: file.getId() 
  });
  
  return file;
}

/**
 * Export message attachments
 * @param {GmailMessage} message - Email message
 * @param {Folder} folder - Destination folder
 * @param {Object} config - Configuration
 * @return {Array} Attachment files
 */
function exportAttachments(message, folder, config) {
  const attachments = message.getAttachments();
  const attachmentFiles = [];
  
  if (attachments.length === 0) {
    return attachmentFiles;
  }
  
  // Create attachments subfolder
  const attachFolder = getOrCreateSubfolder(folder, config.export.attachmentFolder);
  
  attachments.forEach(attachment => {
    // Check size limit
    if (attachment.getSize() > config.export.maxAttachmentSize) {
      logExport('WARN', 'Attachment too large', { 
        name: attachment.getName(),
        size: attachment.getSize() 
      });
      return;
    }
    
    try {
      const file = attachFolder.createFile(attachment);
      attachmentFiles.push(file);
      
      logExport('DEBUG', 'Exported attachment', { 
        name: attachment.getName() 
      });
    } catch (error) {
      logExport('WARN', 'Failed to export attachment', { 
        name: attachment.getName(),
        error: error.toString() 
      });
    }
  });
  
  return attachmentFiles;
}

/**
 * Create HTML representation of email
 * @param {GmailMessage} message - Email message
 * @param {Object} config - Configuration
 * @return {string} HTML content
 */
function createEmailHTML(message, config) {
  const subject = message.getSubject() || 'No Subject';
  const from = message.getFrom();
  const to = message.getTo();
  const date = Utilities.formatDate(message.getDate(), config.spreadsheet.timezone, config.spreadsheet.dateFormat);
  const body = message.getBody();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
        .header h1 { margin: 0 0 10px 0; font-size: 20px; }
        .metadata { font-size: 14px; color: #666; }
        .metadata div { margin: 5px 0; }
        .content { margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${subject}</h1>
        <div class="metadata">
          <div><strong>From:</strong> ${from}</div>
          <div><strong>To:</strong> ${to}</div>
          <div><strong>Date:</strong> ${date}</div>
        </div>
      </div>
      <div class="content">
        ${body}
      </div>
    </body>
    </html>
  `;
}

/**
 * Create Markdown representation of email
 * @param {GmailMessage} message - Email message
 * @param {Object} config - Configuration
 * @return {string} Markdown content
 */
function createEmailMarkdown(message, config) {
  const subject = message.getSubject() || 'No Subject';
  const from = message.getFrom();
  const to = message.getTo();
  const date = Utilities.formatDate(message.getDate(), config.spreadsheet.timezone, config.spreadsheet.dateFormat);
  const body = message.getPlainBody() || htmlToMarkdown(message.getBody());
  
  return `# ${subject}

**From:** ${from}  
**To:** ${to}  
**Date:** ${date}  

---

${body}
`;
}

/**
 * Convert HTML to Markdown (basic conversion)
 * @param {string} html - HTML content
 * @return {string} Markdown content
 */
function htmlToMarkdown(html) {
  // Remove HTML tags and convert basic formatting
  let markdown = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p>/gi, '')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a\s+href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<ul>/gi, '')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<[^>]+>/g, ''); // Remove remaining HTML tags
  
  return markdown;
}

/**
 * Create filename for export
 * @param {GmailMessage} message - Email message
 * @param {string} extension - File extension
 * @param {Object} config - Configuration
 * @return {string} Filename
 */
function createFileName(message, extension, config) {
  let fileName = config.export.fileNaming;
  
  // Replace tokens
  const date = Utilities.formatDate(message.getDate(), config.spreadsheet.timezone, 'yyyy-MM-dd');
  const sender = extractSenderName(message.getFrom());
  const subject = message.getSubject() || 'No Subject';
  
  fileName = fileName.replace('[date]', date);
  fileName = fileName.replace('[sender]', sender);
  fileName = fileName.replace('[subject]', subject);
  fileName = fileName.replace('[id]', message.getId());
  
  // Sanitize if configured
  if (config.export.sanitizeFilenames) {
    fileName = sanitizeFileName(fileName);
  }
  
  return `${fileName}.${extension}`;
}

/**
 * Extract sender name from email string
 * @param {string} from - From field
 * @return {string} Sender name
 */
function extractSenderName(from) {
  const match = from.match(/^([^<]+)</);
  if (match) {
    return match[1].trim();
  }
  
  const emailMatch = from.match(/([^@]+)@/);
  if (emailMatch) {
    return emailMatch[1];
  }
  
  return 'Unknown';
}

/**
 * Sanitize filename
 * @param {string} fileName - Original filename
 * @return {string} Sanitized filename
 */
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200); // Limit length
}

/**
 * Sanitize folder name
 * @param {string} folderName - Original folder name
 * @return {string} Sanitized folder name
 */
function sanitizeFolderName(folderName) {
  return folderName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 100);
}

/**
 * Create spreadsheet row for tracking
 * @param {GmailMessage} message - Email message
 * @param {Object} exportedFiles - Exported file references
 * @param {Object} config - Configuration
 * @return {Array} Row data
 */
function createSpreadsheetRow(message, exportedFiles, config) {
  const row = [
    Utilities.formatDate(new Date(), config.spreadsheet.timezone, config.spreadsheet.dateFormat),
    Utilities.formatDate(message.getDate(), config.spreadsheet.timezone, config.spreadsheet.dateFormat),
    message.getFrom(),
    message.getTo(),
    message.getSubject() || 'No Subject',
    message.getThread().getLabels().map(l => l.getName()).join(', ')
  ];
  
  // Add file links if configured
  if (config.spreadsheet.includeLinks) {
    if (exportedFiles.pdf) {
      row.push(exportedFiles.pdf.getUrl());
    } else {
      row.push('');
    }
    
    if (exportedFiles.markdown) {
      row.push(exportedFiles.markdown.getUrl());
    } else {
      row.push('');
    }
    
    if (exportedFiles.attachments && exportedFiles.attachments.length > 0) {
      row.push(exportedFiles.attachments.length + ' attachments');
    } else {
      row.push('');
    }
  }
  
  // Extract charge amount if configured
  if (config.spreadsheet.extractCharges) {
    const chargeAmount = extractChargeAmount(message.getPlainBody());
    row.push(chargeAmount || '');
  }
  
  // Add custom fields
  config.spreadsheet.customFields.forEach(field => {
    row.push(extractCustomField(message, field));
  });
  
  return row;
}

/**
 * Extract charge amount from email body
 * @param {string} body - Email body
 * @return {string} Charge amount or null
 */
function extractChargeAmount(body) {
  // Look for common charge patterns
  const patterns = [
    /\$[\d,]+\.?\d*/,
    /USD\s*[\d,]+\.?\d*/,
    /Total:\s*\$?[\d,]+\.?\d*/i,
    /Amount:\s*\$?[\d,]+\.?\d*/i,
    /Charged:\s*\$?[\d,]+\.?\d*/i
  ];
  
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      return match[0].replace(/[^\d.]/g, '');
    }
  }
  
  return null;
}

/**
 * Extract custom field from message
 * @param {GmailMessage} message - Email message
 * @param {string} field - Field name
 * @return {string} Field value
 */
function extractCustomField(message, field) {
  // Implement custom field extraction logic
  // This is a placeholder that can be extended
  return '';
}

/**
 * Create tracking spreadsheet
 * @param {Object} state - Export state
 * @param {Object} config - Configuration
 */
function createTrackingSpreadsheet(state, config) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(config.spreadsheet.sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(config.spreadsheet.sheetName);
  }
  
  // Create headers
  const headers = [
    'Export Date',
    'Email Date',
    'From',
    'To',
    'Subject',
    'Labels'
  ];
  
  if (config.spreadsheet.includeLinks) {
    headers.push('PDF Link', 'Markdown Link', 'Attachments');
  }
  
  if (config.spreadsheet.extractCharges) {
    headers.push('Charge Amount');
  }
  
  config.spreadsheet.customFields.forEach(field => {
    headers.push(field);
  });
  
  // Write headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#ea4335')
      .setFontColor('white');
  }
  
  // Write data
  if (state.spreadsheetData.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, state.spreadsheetData.length, state.spreadsheetData[0].length)
      .setValues(state.spreadsheetData);
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  logExport('INFO', 'Created tracking spreadsheet', { 
    rows: state.spreadsheetData.length 
  });
}

/**
 * Share export folder
 * @param {Folder} folder - Export folder
 * @param {Object} config - Configuration
 */
function shareExportFolder(folder, config) {
  config.sharing.shareWith.forEach(email => {
    try {
      if (config.sharing.sharePermission === 'EDIT') {
        folder.addEditor(email);
      } else if (config.sharing.sharePermission === 'COMMENT') {
        folder.addCommenter(email);
      } else {
        folder.addViewer(email);
      }
      
      logExport('INFO', `Shared folder with ${email}`);
      
    } catch (error) {
      logExport('WARN', `Failed to share with ${email}`, { 
        error: error.toString() 
      });
    }
  });
  
  if (config.sharing.notifyOnShare) {
    // Send notification email
    const recipients = config.sharing.shareWith.join(', ');
    MailApp.sendEmail({
      to: recipients,
      subject: 'Email Export Folder Shared',
      body: `An email export folder has been shared with you:\n\n${folder.getUrl()}`
    });
  }
}

/**
 * Send summary email
 * @param {Object} state - Export state
 * @param {Object} config - Configuration
 */
function sendSummaryEmail(state, config) {
  const subject = `Email Export Summary - ${new Date().toLocaleDateString()}`;
  
  const body = `
Email Export Summary
====================

Export Statistics:
- Total Threads Processed: ${state.processedCount}
- Successfully Exported: ${state.exportedFiles.length}
- Failed Exports: ${state.failedExports.length}
- Export Folder: ${state.exportFolder ? state.exportFolder.getUrl() : 'N/A'}

${state.failedExports.length > 0 ? `
Failed Exports:
${state.failedExports.map(f => `- ${f.subject}: ${f.error}`).join('\n')}
` : ''}

Export completed at: ${new Date().toLocaleString()}
  `;
  
  MailApp.sendEmail({
    to: config.logging.summaryEmailTo,
    subject: subject,
    body: body
  });
  
  logExport('INFO', 'Summary email sent');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get or create folder
 * @param {string} folderName - Folder name
 * @return {Folder} Folder object
 */
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  }
  
  return DriveApp.createFolder(folderName);
}

/**
 * Get or create subfolder
 * @param {Folder} parent - Parent folder
 * @param {string} folderName - Folder name
 * @return {Folder} Subfolder
 */
function getOrCreateSubfolder(parent, folderName) {
  const folders = parent.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  }
  
  return parent.createFolder(folderName);
}

/**
 * Check if timeout is approaching
 * @param {number} startTime - Start timestamp
 * @param {Object} config - Configuration
 * @return {boolean} True if timeout approaching
 */
function isTimeoutApproaching(startTime, config) {
  const elapsed = new Date().getTime() - startTime;
  const buffer = 30000; // 30 second buffer
  
  return elapsed > (config.processing.maxExecutionTime - buffer);
}

// ============================================================================
// CHECKPOINT MANAGEMENT
// ============================================================================

/**
 * Save export checkpoint
 * @param {Object} state - Current state
 */
function saveEmailCheckpoint(state) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  const checkpoint = {
    threads: state.threads.map(t => t.getId()),
    processedCount: state.processedCount,
    exportedFiles: state.exportedFiles,
    failedExports: state.failedExports,
    exportFolderId: state.exportFolder ? state.exportFolder.getId() : null,
    spreadsheetData: state.spreadsheetData,
    timestamp: new Date().toISOString()
  };
  
  // Compress if too large
  const json = JSON.stringify(checkpoint);
  if (json.length > 9000) {
    // Save in chunks
    const chunks = Math.ceil(json.length / 9000);
    for (let i = 0; i < chunks; i++) {
      scriptProperties.setProperty(
        `emailCheckpoint_${i}`,
        json.substring(i * 9000, (i + 1) * 9000)
      );
    }
    scriptProperties.setProperty('emailCheckpoint_chunks', chunks.toString());
  } else {
    scriptProperties.setProperty('emailCheckpoint', json);
  }
  
  logExport('DEBUG', 'Checkpoint saved');
}

/**
 * Load export checkpoint
 * @return {Object} Checkpoint or null
 */
function loadEmailCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  try {
    // Check for chunked checkpoint
    const chunks = scriptProperties.getProperty('emailCheckpoint_chunks');
    let json;
    
    if (chunks) {
      json = '';
      for (let i = 0; i < parseInt(chunks); i++) {
        json += scriptProperties.getProperty(`emailCheckpoint_${i}`);
      }
    } else {
      json = scriptProperties.getProperty('emailCheckpoint');
    }
    
    if (json) {
      const checkpoint = JSON.parse(json);
      
      // Reconstruct state
      const state = {
        threads: checkpoint.threads.map(id => GmailApp.getThreadById(id)),
        processedCount: checkpoint.processedCount,
        exportedFiles: checkpoint.exportedFiles,
        failedExports: checkpoint.failedExports,
        exportFolder: checkpoint.exportFolderId ? DriveApp.getFolderById(checkpoint.exportFolderId) : null,
        spreadsheetData: checkpoint.spreadsheetData,
        startTime: new Date().getTime()
      };
      
      return state;
    }
  } catch (error) {
    logExport('WARN', 'Failed to load checkpoint', { error: error.toString() });
  }
  
  return null;
}

/**
 * Clear saved checkpoint
 */
function clearEmailCheckpoint() {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  // Clear main checkpoint
  scriptProperties.deleteProperty('emailCheckpoint');
  
  // Clear chunked checkpoint
  const chunks = scriptProperties.getProperty('emailCheckpoint_chunks');
  if (chunks) {
    for (let i = 0; i < parseInt(chunks); i++) {
      scriptProperties.deleteProperty(`emailCheckpoint_${i}`);
    }
    scriptProperties.deleteProperty('emailCheckpoint_chunks');
  }
  
  logExport('DEBUG', 'Checkpoint cleared');
}

// ============================================================================
// UI FUNCTIONS
// ============================================================================

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📧 Email Export')
    .addItem('⚙️ Initialize Configuration', 'initializeEmailExport')
    .addItem('💾 Save Configuration', 'saveEmailConfig')
    .addSeparator()
    .addItem('▶️ Export Emails', 'showExportDialog')
    .addItem('🔍 Quick Search & Export', 'quickSearchExport')
    .addItem('⏸️ Resume from Checkpoint', 'resumeEmailExport')
    .addSeparator()
    .addItem('📊 View Export History', 'viewExportHistory')
    .addItem('🗑️ Clear Checkpoint', 'clearEmailCheckpoint')
    .addSeparator()
    .addItem('❓ Help', 'showEmailExportHelp')
    .addToUi();
}

/**
 * Save configuration from sheet
 */
function saveEmailConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    throw new Error('Config sheet not found. Run initializeEmailExport() first.');
  }
  
  const data = configSheet.getDataRange().getValues();
  const userProperties = PropertiesService.getUserProperties();
  
  // Process configuration (skip header)
  for (let i = 1; i < data.length; i++) {
    const [category, setting, value] = data[i];
    
    if (setting && value !== '') {
      userProperties.setProperty(setting, value);
      logExport('DEBUG', `Saved ${setting} = ${value}`);
    }
  }
  
  SpreadsheetApp.getUi().alert('Configuration saved successfully!');
}

/**
 * Show export dialog
 */
function showExportDialog() {
  const html = HtmlService.createHtmlOutputFromFile('export-dialog')
    .setWidth(500)
    .setHeight(400)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Export Emails');
}

/**
 * Quick search and export
 */
function quickSearchExport() {
  const ui = SpreadsheetApp.getUi();
  
  const response = ui.prompt(
    'Quick Search & Export',
    'Enter Gmail search query:\n\n' +
    'Examples:\n' +
    '• from:sender@example.com\n' +
    '• subject:"invoice"\n' +
    '• has:attachment larger:5M\n' +
    '• label:important newer_than:7d',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const query = response.getResponseText();
    if (query) {
      exportEmails({ query: query });
    }
  }
}

/**
 * Resume export from checkpoint
 */
function resumeEmailExport() {
  const config = getEmailExportConfig();
  config.processing.resumeFromCheckpoint = true;
  
  const userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('RESUME_FROM_CHECKPOINT', 'true');
  
  exportEmails();
  
  // Reset flag
  userProperties.setProperty('RESUME_FROM_CHECKPOINT', 'false');
}

/**
 * View export history
 */
function viewExportHistory() {
  const config = getEmailExportConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.spreadsheet.sheetName);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('No export history found. Run an export first.');
    return;
  }
  
  // Activate the sheet
  sheet.activate();
  
  const lastRow = sheet.getLastRow();
  SpreadsheetApp.getUi().alert(`Export History: ${lastRow - 1} emails exported`);
}

/**
 * Show help dialog
 */
function showEmailExportHelp() {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-height: 500px; overflow-y: auto;">
      <h2>Email Export - Help</h2>
      
      <h3>Features</h3>
      <ul>
        <li>Export emails to PDF, Markdown, or HTML</li>
        <li>Automatic folder organization by date/label</li>
        <li>Attachment extraction and archiving</li>
        <li>Metadata tracking in spreadsheet</li>
        <li>Batch processing with checkpoint/resume</li>
        <li>Configurable search criteria</li>
      </ul>
      
      <h3>Search Query Examples</h3>
      <pre>
from:sender@example.com
subject:"invoice"
has:attachment
label:important
newer_than:7d
larger:5M
is:unread
      </pre>
      
      <h3>Folder Structure Patterns</h3>
      <ul>
        <li><code>YYYY/MM/DD</code> - Organize by date</li>
        <li><code>Label/YYYY/MM</code> - Organize by label then date</li>
        <li><code>YYYY/Label</code> - Organize by year then label</li>
      </ul>
      
      <h3>File Naming Patterns</h3>
      <ul>
        <li><code>[date]</code> - Email date</li>
        <li><code>[sender]</code> - Sender name</li>
        <li><code>[subject]</code> - Email subject</li>
        <li><code>[id]</code> - Unique message ID</li>
      </ul>
      
      <h3>Performance Tips</h3>
      <ul>
        <li>Use specific search queries to limit results</li>
        <li>Enable checkpointing for large exports</li>
        <li>Adjust batch size based on email complexity</li>
        <li>Exclude large attachments if not needed</li>
      </ul>
      
      <p style="margin-top: 20px; color: #666;">
        Version 2.0.0 | Fully configurable | No hardcoded values
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(600)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Email Export Help');
}

// ============================================================================
// HTML DIALOG SUPPORT
// ============================================================================

/**
 * Process form submission from dialog
 * @param {Object} formData - Form data from dialog
 */
function processExportForm(formData) {
  try {
    const params = {
      query: formData.searchQuery,
      labels: formData.labels ? formData.labels.split(',').map(l => l.trim()) : [],
      dateRange: formData.dateRange,
      daysBack: formData.daysBack ? Number(formData.daysBack) : undefined
    };
    
    const result = exportEmails(params);
    
    return {
      success: true,
      message: `Exported ${result.exportedFiles.length} emails successfully`,
      folderUrl: result.exportFolder ? result.exportFolder.getUrl() : null
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}