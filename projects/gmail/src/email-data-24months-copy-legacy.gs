/**
 * Creates a spreadsheet with email counts for the last 180 days
 * This function searches Gmail, counts emails by sender, and creates a sorted spreadsheet of the results
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
