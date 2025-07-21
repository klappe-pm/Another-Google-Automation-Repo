/**
 * Title: Gmail Automatic Sender-Based Labeling
 * Service: Gmail
 * Purpose: Automatically apply labels to Gmail threads based on sender names within date ranges
 * Created: 2024-01-01
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * Usage: https://github.com/kevinlappe/workspace-automation/docs/gmail/gmail-labels-auto-sender.md
 * Timeout Strategy: Batch processing with monthly chunks
 * Batch Processing: Process emails month by month to avoid timeouts
 * Cache Strategy: Cache label lookups for performance
 * Security: Validates label names and handles permissions
 * Performance: Optimized for large date ranges with monthly processing
 */

/*
Script Summary:
- Purpose: Automate Gmail organization by labeling emails based on sender names
- Description: Processes emails within specified date ranges, creating and applying labels derived from sender names
- Problem Solved: Manual email categorization and organization across large inboxes
- Successful Execution: All emails in date range labeled by sender with progress logging
- Dependencies: Gmail API
- Key Features:
  1. Date range processing (October 2023 - January 2025)
  2. Monthly batch processing to prevent timeouts
  3. Automatic label creation and sanitization
  4. Sender name extraction and validation
  5. Comprehensive error handling and logging
  6. Skip spam and trash emails
*/

// ========================================
// Configuration Settings
// ========================================

const CONFIG = {
  BATCH_SIZE: 50, // Threads per batch
  TIMEOUT: 300000, // 5 minutes
  CACHE_DURATION: 3600, // 1 hour
  MAX_MONTHS: 100, // Safety limit
  LABEL_CACHE: new Map() // In-memory label cache
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
    scriptName: 'gmail-labels-auto-sender'
  };
  
  console.error('Script Error:', JSON.stringify(errorDetails, null, 2));
  Logger.log(`ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
}

// ========================================
// Main Functions
// ========================================

function processGmailEmails() {
  try {
    Logger.log('Starting automated sender-based email labeling...');

    // Define the date range
    const startDate = new Date(2023, 9, 1); // October 1, 2023 (months are 0-indexed)
    const endDate = new Date(2025, 0, 16); // January 16, 2025

    // Get the list of months to process within the date range
    const monthsToProcess = getMonthsToProcess(startDate, endDate);
    Logger.log(`Processing ${monthsToProcess.length} months from ${startDate.toDateString()} to ${endDate.toDateString()}`);

    let totalThreadsProcessed = 0;
    let totalLabelsApplied = 0;

    // Process each month
    for (let i = 0; i < monthsToProcess.length; i++) {
      const monthDate = monthsToProcess[i];
      try {
        const monthStats = processMonth(monthDate);
        totalThreadsProcessed += monthStats.threadsProcessed;
        totalLabelsApplied += monthStats.labelsApplied;
        
        Logger.log(`Month ${i + 1}/${monthsToProcess.length} completed: ${monthStats.threadsProcessed} threads, ${monthStats.labelsApplied} labels applied`);
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

// Function to generate an array of month dates from start to end
function getMonthsToProcess(startDate, endDate) {
  const months = [];
  const month = new Date(startDate);
  month.setDate(1);
  
  while (month <= endDate && months.length < CONFIG.MAX_MONTHS) {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1);
  }
  
  return months;
}

// Function to process emails for a given month
function processMonth(monthDate) {
  const dates = getMonthDates(monthDate.getFullYear(), monthDate.getMonth());
  const query = `after:${Utilities.formatDate(dates.start, Session.getTimeZone(), 'yyyy/MM/dd')} before:${Utilities.formatDate(dates.end, Session.getTimeZone(), 'yyyy/MM/dd')} -in:spam -in:trash`;
  
  const threads = GmailApp.search(query);
  let labelsApplied = 0;

  Logger.log(`Processing ${threads.length} threads for ${monthDate.toDateString().substring(4, 7)} ${monthDate.getFullYear()}`);

  // Process threads in batches
  for (let i = 0; i < threads.length; i += CONFIG.BATCH_SIZE) {
    const batch = threads.slice(i, i + CONFIG.BATCH_SIZE);
    
    for (const thread of batch) {
      try {
        if (applySenderLabels(thread)) {
          labelsApplied++;
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

// Function to generate start and end dates for a given month
function getMonthDates(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);
  endDate.setDate(endDate.getDate() - 1);
  
  return {
    start: startDate,
    end: endDate
  };
}

// Function to apply labels based on sender name
function applySenderLabels(thread) {
  try {
    const messages = thread.getMessages();
    if (messages.length === 0) return false;

    const firstMessage = messages[0];
    const from = firstMessage.getFrom();
    const senderName = extractAndSanitizeSender(from);

    if (!senderName) {
      Logger.log(`Invalid sender name for email: ${from}`);
      return false;
    }

    const label = getOrCreateLabel(senderName);
    if (label) {
      thread.addLabel(label);
      Logger.log(`Applied label "${label.getName()}" to thread from "${senderName}"`);
      return true;
    } else {
      Logger.log(`Failed to create/get label for sender: ${senderName}`);
      return false;
    }
    
  } catch (error) {
    logError(error, { function: 'applySenderLabels' });
    return false;
  }
}

// ========================================
// Label Management Functions
// ========================================

function extractAndSanitizeSender(from) {
  try {
    // Extract the sender's name from the 'From' field
    const nameMatch = from.match(/^.*?(?=<)/);
    const senderName = nameMatch ? nameMatch[0].trim() : from;
    return sanitizeLabelName(senderName);
  } catch (error) {
    logError(error, { function: 'extractAndSanitizeSender', from });
    return null;
  }
}

function sanitizeLabelName(name) {
  if (!name) return null;
  
  // Replace invalid characters with '-'
  name = name.replace(/[^a-zA-Z0-9_.-]/g, '-');
  // Remove leading/trailing invalid characters
  name = name.replace(/^[.-]+|[.-]+$/g, '');
  // Truncate to 40 characters
  name = name.substring(0, 40);
  
  if (name === '') {
    name = 'default-label'; // Assign a default label if sanitization results in an empty string
  }
  
  return name;
}

function getOrCreateLabel(labelName) {
  if (!isValidLabelName(labelName)) {
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
    if (label.getName() === labelName) {
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

function isValidLabelName(name) {
  if (!name || name.length > 40) {
    return false;
  }

  if (name.startsWith('.') || name.endsWith('.') ||
      name.startsWith('_') || name.endsWith('_') ||
      name.startsWith('-') || name.endsWith('-') ||
      name.startsWith('/') || name.endsWith('/')) {
    return false;
  }

  return /^[a-zA-Z0-9 _\-\.\/]+$/.test(name);
}

// ========================================
// Menu Integration
// ========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gmail Auto-Labeling')
    .addItem('Process Emails by Sender', 'processGmailEmails')
    .addToUi();
}
