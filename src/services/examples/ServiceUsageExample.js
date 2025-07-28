/**
 * Service Usage Examples
 * Demonstrates how to use the new service wrapper classes
 * 
 * This example shows how the old consolidated .gs files can be refactored
 * to use the new service classes for better organization and reusability.
 */

// Ensure dependencies are loaded
if (typeof WorkspaceAutomation === 'undefined' || !WorkspaceAutomation.Services) {
  throw new Error('WorkspaceAutomation.Services not loaded. Ensure service files are included.');
}

/**
 * Example: Gmail Label Export (refactored from export-gmail-labels-to-sheets.gs)
 */
function exportGmailLabelsToSheetsExample() {
  try {
    // Create service instances
    var gmailService = WorkspaceAutomation.Services.getGmailService();
    var sheetsService = WorkspaceAutomation.Services.getSheetsService();
    
    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var spreadsheetId = spreadsheet.getId();
    var sheetName = "Gmail Labels";
    
    // Setup the sheet with headers
    var headers = ["Label Name", "Thread Count", "Email Count"];
    sheetsService.setupSheet(spreadsheetId, sheetName, headers);
    
    // Get Gmail label statistics
    var labelStats = gmailService.getLabelStats();
    
    // Convert to sheet data format
    var sheetData = labelStats.map(function(stat) {
      return [stat.name, stat.threadCount, stat.emailCount];
    });
    
    // Insert data into sheet
    sheetsService.insertDataIntoSheet(spreadsheetId, sheetName, sheetData, headers, {
      clearExisting: true,
      autoResize: true
    });
    
    Logger.log('Gmail labels exported successfully to sheet: ' + sheetName);
    return { success: true, rowCount: sheetData.length };
    
  } catch (error) {
    Logger.log('Error in exportGmailLabelsToSheetsExample: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Example: Drive File Index (demonstrates Drive service usage)
 */
function createDriveFileIndexExample() {
  try {
    // Create service instances
    var driveService = WorkspaceAutomation.Services.getDriveService();
    var sheetsService = WorkspaceAutomation.Services.getSheetsService();
    
    // Configuration
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var spreadsheetId = spreadsheet.getId();
    var sheetName = "Drive Files";
    var searchQuery = "pdf"; // Example: search for PDF files
    
    // Setup the sheet
    var headers = ["File ID", "File Name", "File URL"];
    sheetsService.setupSheet(spreadsheetId, sheetName, headers);
    
    // Search for files
    var files = driveService.searchFiles(searchQuery);
    
    // Convert to sheet data format
    var sheetData = files.map(function(file) {
      return [file.id, file.name, file.url];
    });
    
    // Insert data into sheet
    sheetsService.insertDataIntoSheet(spreadsheetId, sheetName, sheetData, headers, {
      clearExisting: true,
      autoResize: true
    });
    
    Logger.log('Drive file index created successfully: ' + files.length + ' files found');
    return { success: true, fileCount: files.length };
    
  } catch (error) {
    Logger.log('Error in createDriveFileIndexExample: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Example: Document Export to Markdown (demonstrates Docs service usage)
 */
function exportDocumentToMarkdownExample(docId) {
  try {
    // Create service instance
    var docsService = WorkspaceAutomation.Services.getDocsService();
    var driveService = WorkspaceAutomation.Services.getDriveService();
    
    if (!docId) {
      throw new Error('Document ID is required');
    }
    
    // Get document metadata
    var metadata = docsService.getDocMetadata(docId);
    Logger.log('Processing document: ' + metadata.name);
    
    // Export to markdown
    var markdownData = docsService.exportToMarkdown(docId);
    
    if (!markdownData) {
      throw new Error('Failed to export document to markdown');
    }
    
    // Create a markdown file in Drive (as text file)
    var fileName = metadata.name + '.md';
    var blob = Utilities.newBlob(markdownData.content, 'text/plain', fileName);
    var file = DriveApp.createFile(blob);
    
    Logger.log('Document exported to markdown: ' + file.getUrl());
    return {
      success: true,
      originalDoc: metadata,
      markdownFile: {
        id: file.getId(),
        name: file.getName(),
        url: file.getUrl()
      }
    };
    
  } catch (error) {
    Logger.log('Error in exportDocumentToMarkdownExample: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Example: Batch Email Processing (demonstrates batch operations and rate limiting)
 */
function batchEmailProcessingExample() {
  try {
    // Create service instances
    var gmailService = WorkspaceAutomation.Services.getGmailService();
    var sheetsService = WorkspaceAutomation.Services.getSheetsService();
    
    // Configuration
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var spreadsheetId = spreadsheet.getId();
    var sheetName = "Email Export";
    var searchQuery = "is:unread";
    var maxResults = 50;
    
    // Setup the sheet
    var headers = [
      "Message ID", "Thread ID", "Date", "Subject", "From", "From Name", 
      "From Domain", "Has Attachments", "Labels", "Snippet"
    ];
    sheetsService.setupSheet(spreadsheetId, sheetName, headers);
    
    // Export emails (this uses batch processing internally)
    var emails = gmailService.exportEmails(searchQuery, maxResults);
    
    // Convert to sheet data format
    var sheetData = emails.map(function(email) {
      return [
        email.id,
        email.threadId,
        email.date,
        email.subject,
        email.from,
        email.fromName,
        email.fromDomain,
        email.hasAttachments,
        email.labels.join(', '),
        email.snippet
      ];
    });
    
    // Insert data using batch operations
    sheetsService.insertDataIntoSheet(spreadsheetId, sheetName, sheetData, headers, {
      clearExisting: true,
      autoResize: true
    });
    
    Logger.log('Batch email processing completed: ' + emails.length + ' emails processed');
    return { success: true, emailCount: emails.length };
    
  } catch (error) {
    Logger.log('Error in batchEmailProcessingExample: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Example: Service Health Check (demonstrates monitoring)
 */
function serviceHealthCheckExample() {
  try {
    // Create all services
    var services = WorkspaceAutomation.Services.ServiceFactory.createAllServices();
    
    var healthReport = {
      timestamp: new Date().toISOString(),
      services: {}
    };
    
    // Check health of each service
    for (var serviceName in services) {
      var service = services[serviceName];
      healthReport.services[serviceName] = service.getHealthStatus();
    }
    
    Logger.log('Service health check completed');
    Logger.log(JSON.stringify(healthReport, null, 2));
    
    return healthReport;
    
  } catch (error) {
    Logger.log('Error in serviceHealthCheckExample: ' + error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Example: Migration Helper - Convert old script to use new services
 * This demonstrates how to refactor existing consolidated scripts
 */
function migrationHelperExample() {
  // OLD WAY (consolidated script approach):
  /*
  function oldExportGmailLabels() {
    var labels = GmailApp.getUserLabels();
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("Gmail Labels") || spreadsheet.insertSheet("Gmail Labels");
    
    sheet.clear();
    sheet.appendRow(["Labels", "Total Threads", "Total Emails"]);
    
    labels.forEach(function(label) {
      var threads = label.getThreads();
      var totalEmails = 0;
      threads.forEach(function(thread) {
        totalEmails += thread.getMessages().length;
      });
      sheet.appendRow([label.getName(), threads.length, totalEmails]);
    });
  }
  */
  
  // NEW WAY (using service classes):
  try {
    // Services handle error management, logging, rate limiting, and batch processing
    var result = exportGmailLabelsToSheetsExample();
    
    Logger.log('Migration example completed');
    Logger.log('Benefits of new approach:');
    Logger.log('- Automatic error handling and logging');
    Logger.log('- Built-in rate limiting');
    Logger.log('- Batch processing capabilities'); 
    Logger.log('- Consistent API across all services');
    Logger.log('- Better code organization and reusability');
    
    return result;
    
  } catch (error) {
    Logger.log('Error in migrationHelperExample: ' + error.message);
    return { success: false, error: error.message };
  }
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exportGmailLabelsToSheetsExample: exportGmailLabelsToSheetsExample,
    createDriveFileIndexExample: createDriveFileIndexExample,
    exportDocumentToMarkdownExample: exportDocumentToMarkdownExample,
    batchEmailProcessingExample: batchEmailProcessingExample,
    serviceHealthCheckExample: serviceHealthCheckExample,
    migrationHelperExample: migrationHelperExample
  };
}
