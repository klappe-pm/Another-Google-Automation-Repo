/ * *
 * Script Name: analyze- emails- 24months
 *
 * Script Summary:
 * Creates spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Analyze emails 24months patterns and trends
 * - Calculate statistics and metrics
 * - Generate insights and recommendations
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Sort data by relevant fields
 * 5. Send notifications or reports
 *
 * Script Functions:
 * - createEmailCountSpreadsheet(): Creates new email count spreadsheet or resources
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * /

/ / Main Functions

/ * *

 * Creates new email count spreadsheet or resources

 * /

function createEmailCountSpreadsheet() { / / Calculate the date 180 days ago
  let cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 180); / / Search for emails received in the last 180 days;
  let threads = GmailApp.search('after:' + cutoffDate.toISOString().split('T')[0]); / / Create an object to store email counts;
  let emailCounts = {}; / / Iterate through threads and count emails;
  threads.forEach(function (thread) {
    let messages = thread.getMessages();
    messages.forEach(function (message) {
      let sender = message.getFrom();
      emailCounts[sender] = (emailCounts[sender] || 0) + 1;
    });
  }); / / Create a new spreadsheet
  let spreadsheet = SpreadsheetApp.create('Email Counts - Last 180 Days');
  let sheet = spreadsheet.getActiveSheet(); / / Set headers;
  sheet.getRange('A1').setValue('Email Address');
  sheet.getRange('B1').setValue('Count'); / / Populate data;
  let row = 2;
  for (let email in emailCounts) {
    sheet.getRange('A' + row).setValue(email);
    sheet.getRange('B' + row).setValue(emailCounts[email]);
    row + + ; } / / Sort the data by count in descending order
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).sort({column: 2, ascending: false}); / / Adjust column widths;
  sheet.autoResizeColumns(1, 2);

  Logger.log('Spreadsheet created: ' + spreadsheet.getUrl());
}