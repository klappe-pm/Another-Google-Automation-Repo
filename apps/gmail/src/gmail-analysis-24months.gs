/**
 * Title: Gmail 24-Month Email Analysis
 * Service: Gmail + Google Sheets
 * Purpose: Generate email count statistics by sender for the last 180 days
 * Created: 2024-01-01
 * Updated: 2025-01-29
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 * 
 * Script Summary:
 * - Purpose: Analyze email volume by sender over the last 180 days
 * - Description: Searches Gmail within date range, aggregates by sender, creates sorted spreadsheet
 * - Problem Solved: Manual email volume analysis and sender frequency tracking
 * - Successful Execution: Creates new spreadsheet with sender counts sorted by frequency
 * - Dependencies: Gmail API, Sheets API
 * 
 * Key Features:
 * 1. 180-day lookback period for email analysis
 * 2. Email count aggregation by sender address
 * 3. Automatic spreadsheet creation with descriptive title
 * 4. Thread-based email processing for accuracy
 * 5. Descending sort by email count for priority insights
 * 6. Auto-resized columns for readability
 * 7. URL logging for easy spreadsheet access
 * 
 * Functions:
 * - createEmailCountSpreadsheet(): Main function to create email count analysis
 * 
 * Processing Logic:
 * 1. Calculate cutoff date (180 days ago)
 * 2. Search Gmail for emails after cutoff date using ISO date format
 * 3. Iterate through threads and messages to count by sender
 * 4. Create new spreadsheet with descriptive title
 * 5. Set headers and populate sender data
 * 6. Sort by count (descending) and format for readability
 */
function createEmailCountSpreadsheet() {
  // Calculate the date 180 days ago
  var cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 180);
  
  // Search for emails received in the last 180 days
  var threads = GmailApp.search('after:' + cutoffDate.toISOString().split('T')[0]);
  
  // Create an object to store email counts
  var emailCounts = {};
  
  // Iterate through threads and count emails
  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      var sender = message.getFrom();
      emailCounts[sender] = (emailCounts[sender] || 0) + 1;
    });
  });
  
  // Create a new spreadsheet
  var spreadsheet = SpreadsheetApp.create('Email Counts - Last 180 Days');
  var sheet = spreadsheet.getActiveSheet();
  
  // Set headers
  sheet.getRange('A1').setValue('Email Address');
  sheet.getRange('B1').setValue('Count');
  
  // Populate data
  var row = 2;
  for (var email in emailCounts) {
    sheet.getRange('A' + row).setValue(email);
    sheet.getRange('B' + row).setValue(emailCounts[email]);
    row++;
  }
  
  // Sort the data by count in descending order
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).sort({column: 2, ascending: false});
  
  // Adjust column widths
  sheet.autoResizeColumns(1, 2);
  
  Logger.log('Spreadsheet created: ' + spreadsheet.getUrl());
}
