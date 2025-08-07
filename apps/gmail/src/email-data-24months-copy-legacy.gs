/**
 * Title: Gmail Email Count Analysis (Legacy Copy)
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
 * - Description: Searches Gmail for emails within date range, counts by sender, creates sorted spreadsheet
 * - Problem Solved: Manual email volume analysis and sender frequency tracking
 * - Successful Execution: Creates spreadsheet with sender email counts sorted by frequency
 * - Dependencies: Gmail API, Sheets API
 * 
 * Key Features:
 * 1. 180-day lookback period for email analysis
 * 2. Email count aggregation by sender address
 * 3. Automatic spreadsheet creation with sorted results
 * 4. Thread-based email processing for accuracy
 * 5. Column width auto-adjustment for readability
 * 
 * Functions:
 * - createEmailCountSpreadsheet(): Main function to create email count analysis
 * 
 * Processing Logic:
 * 1. Calculate cutoff date (180 days ago)
 * 2. Search Gmail for emails after cutoff date
 * 3. Iterate through threads and count emails by sender
 * 4. Create new spreadsheet with headers
 * 5. Populate data and sort by count (descending)
 * 6. Format spreadsheet for readability
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
