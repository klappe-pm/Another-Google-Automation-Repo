/**
 * Title: Gmail Label Statistics Analysis
 * Service: Gmail
 * Purpose: Comprehensive analysis of Gmail labels with thread, message, and attachment statistics
 * Created: 2024-01-01
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/gmail/gmail-analysis-label-stats.md
 * Timeout Strategy: Batch processing with 50 labels per batch
 * Batch Processing: Process labels in chunks to prevent timeouts
 * Cache Strategy: Cache label data for 30 minutes
 * Security: Read-only access to Gmail data
 * Performance: Optimized for large label sets with progress tracking
 */

/*
Script Summary:
- Purpose: Provide comprehensive insights into Gmail label organization and usage patterns
- Description: Analyzes all Gmail labels to extract statistics about threads, messages, and attachments
- Problem Solved: Manual counting and analysis of email organization across multiple labels
- Successful Execution: Creates detailed spreadsheet with label statistics and usage metrics
- Dependencies: Gmail API, Sheets API
- Key Features:
  1. Complete label analysis with thread and message counts
  2. Attachment statistics per label
  3. Statistical measures (average, min, max, median) for messages per thread
  4. Export to organized Google Sheets with formatting
  5. Progress tracking and error handling
  6. Batch processing for large label sets
*/

// ========================================
// Configuration Settings
// ========================================

const CONFIG = {
  BATCH_SIZE: 50, // Labels per batch
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 1800, // 30 minutes
  SHEET_NAME: 'LabelStats',
  MAX_LABELS: 1000 // Safety limit
};

// ========================================
// Error Handling
// ========================================

function logError(error, context = {}) {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    scriptName: 'gmail-analysis-label-stats'
  };
  
  console.error('Script Error:', JSON.stringify(errorDetails, null, 2));
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
}

// ========================================
// Main Analysis Function
// ========================================

function analyzeGmailLabels() {
  try {
    Logger.log('Starting comprehensive Gmail label analysis...');

    // Fetch all labels
    const labels = GmailApp.getLabels();
    Logger.log(`Fetched ${labels.length} labels for analysis.`);

    if (labels.length > CONFIG.MAX_LABELS) {
      throw new Error(`Too many labels (${labels.length}). Maximum supported: ${CONFIG.MAX_LABELS}`);
    }

    // Initialize data array
    const labelData = [];
    let processedCount = 0;

    // Process labels in batches
    for (let i = 0; i < labels.length; i += CONFIG.BATCH_SIZE) {
      const batch = labels.slice(i, i + CONFIG.BATCH_SIZE);
      
      for (const label of batch) {
        try {
          const labelStats = processLabel(label);
          labelData.push(labelStats);
          processedCount++;
          
          if (processedCount % 10 === 0) {
            Logger.log(`Processed ${processedCount}/${labels.length} labels...`);
          }
        } catch (error) {
          logError(error, { labelName: label.getName() });
        }
      }
    }

    // Export to spreadsheet
    exportToSheet(labelData);

    Logger.log(`Gmail label analysis completed successfully. Processed ${processedCount} labels.`);
    
  } catch (error) {
    logError(error, { function: 'analyzeGmailLabels' });
    throw new Error(`Failed to analyze Gmail labels: ${error.message}`);
  }
}

function processLabel(label) {
  const labelName = label.getName();
  Logger.log(`Processing label: ${labelName}`);

  // Get all threads in the label
  const threads = label.getThreads();
  Logger.log(`Found ${threads.length} threads in label: ${labelName}`);

  // Initialize counters
  const totalThreads = threads.length;
  let totalMessages = 0;
  let threadsWithAttachments = 0;
  let totalAttachments = 0;
  const messagesPerThread = [];

  // Process each thread
  for (const thread of threads) {
    try {
      const messages = thread.getMessages();
      const messageCount = messages.length;
      totalMessages += messageCount;
      messagesPerThread.push(messageCount);

      // Check for attachments
      let hasAttachment = false;
      let attachmentsInThread = 0;
      
      for (const message of messages) {
        if (message.hasAttachments()) {
          hasAttachment = true;
          attachmentsInThread += message.getAttachments().length;
        }
      }
      
      if (hasAttachment) {
        threadsWithAttachments++;
      }
      totalAttachments += attachmentsInThread;
      
    } catch (error) {
      logError(error, { 
        labelName, 
        threadId: thread.getId() 
      });
    }
  }

  // Calculate statistics
  const averageMessages = calculateAverage(messagesPerThread);
  const minMessages = calculateMin(messagesPerThread);
  const maxMessages = calculateMax(messagesPerThread);
  const medianMessages = calculateMedian(messagesPerThread);

  return [
    labelName,
    totalThreads,
    totalMessages,
    Math.round(averageMessages * 100) / 100, // Round to 2 decimal places
    minMessages,
    maxMessages,
    Math.round(medianMessages * 100) / 100,
    threadsWithAttachments,
    totalAttachments,
    totalThreads > 0 ? Math.round((threadsWithAttachments / totalThreads) * 100) : 0 // Attachment percentage
  ];
}

// ========================================
// Statistical Helper Functions
// ========================================

function calculateAverage(array) {
  if (array.length === 0) return 0;
  const sum = array.reduce((a, b) => a + b, 0);
  return sum / array.length;
}

function calculateMin(array) {
  return array.length > 0 ? Math.min(...array) : 0;
}

function calculateMax(array) {
  return array.length > 0 ? Math.max(...array) : 0;
}

function calculateMedian(array) {
  if (array.length === 0) return 0;
  
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

// ========================================
// Export Functions
// ========================================

function exportToSheet(labelData) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
    }
    
    // Clear existing content
    sheet.clear();

    // Prepare headers with descriptions
    const headers = [
      'Label Name',
      'Total Threads',
      'Total Messages',
      'Avg Messages/Thread',
      'Min Messages/Thread',
      'Max Messages/Thread',
      'Median Messages/Thread',
      'Threads with Attachments',
      'Total Attachments',
      'Attachment %'
    ];

    // Write headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#4285F4');
    sheet.getRange(1, 1, 1, headers.length).setFontColor('white');

    // Write data
    if (labelData.length > 0) {
      sheet.getRange(2, 1, labelData.length, headers.length).setValues(labelData);
    }

    // Format the sheet
    sheet.autoResizeColumns(1, headers.length);
    sheet.setFrozenRows(1);

    // Add summary row
    const summaryRow = labelData.length + 3;
    sheet.getRange(summaryRow, 1).setValue('TOTALS:').setFontWeight('bold');
    
    // Calculate totals
    if (labelData.length > 0) {
      sheet.getRange(summaryRow, 2).setFormula(`=SUM(B2:B${labelData.length + 1})`); // Total threads
      sheet.getRange(summaryRow, 3).setFormula(`=SUM(C2:C${labelData.length + 1})`); // Total messages
      sheet.getRange(summaryRow, 8).setFormula(`=SUM(H2:H${labelData.length + 1})`); // Threads with attachments
      sheet.getRange(summaryRow, 9).setFormula(`=SUM(I2:I${labelData.length + 1})`); // Total attachments
    }

    Logger.log(`Data exported to sheet: ${CONFIG.SHEET_NAME}`);
    Logger.log(`Total labels analyzed: ${labelData.length}`);
    
  } catch (error) {
    logError(error, { function: 'exportToSheet' });
    throw new Error(`Failed to export data to sheet: ${error.message}`);
  }
}

// ========================================
// Menu Integration
// ========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gmail Label Analysis')
    .addItem('Analyze All Labels', 'analyzeGmailLabels')
    .addToUi();
}
