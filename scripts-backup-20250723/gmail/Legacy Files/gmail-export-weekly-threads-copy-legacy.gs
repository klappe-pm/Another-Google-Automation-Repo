/**
 * This script lists emails received in the past week, along with their details,
 * in a Google Sheet with the specified file ID.
 * The sheet is named using the 'yyyy-WW' format (e.g., 2024-42).
 * The script also logs information about each processed email to the IDE.
 */

function listEmails() {
  // Get the current date and the date 7 days ago.
  var today = new Date();
  var startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Log the start and end dates for email retrieval.
  Logger.log('Retrieving emails from: ' + startDate + ' to: ' + today);

  // Get the Gmail threads.
  var threads = GmailApp.search('after:' + startDate.toISOString().slice(0, 10));

  // Get the week number.
  var weekNumber = getWeekNumber(today);

  // Get the spreadsheet with the specified file ID.
  var ss = SpreadsheetApp.openById('1_9j6gUp-lIIWLQdVGDKWWuwntKvT4m9eIpW3dsDe1kc');

  // Create a new sheet tab named in 'yyyy-WW' format.
  var sheetName = today.getFullYear() + '-' + weekNumber;
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

  // Add headers to the sheet.
  sheet.appendRow(["Thread ID", "Email ID", "Date", "Sender", "Recipients", "Subject", "Read Status"]);

  // Prepare an array to store email data for sorting.
  var emailData = [];

  // Iterate through the threads and extract email data.
  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();
    
    // Log the thread being processed.
    Logger.log('Processing thread: ' + thread.getId());

    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      var threadId = thread.getId();
      var emailId = message.getId();
      var date = message.getDate();
      var sender = message.getFrom();
      var recipients = message.getTo(); // Get recipients
      var subject = message.getSubject();
      
      // Get the read/unread status using the thread.
      var isRead = thread.isUnread() ? "Unread" : "Read"; 

      // Log the email being processed.
      Logger.log('Processing email: ' + emailId);

      // Add email data to the array.
      emailData.push([threadId, emailId, date, sender, recipients, subject, isRead]);
    }
  }

  // Sort the email data by thread ID and then by date in chronological order.
  emailData.sort(function(a, b) {
    if (a[0] !== b[0]) {
      return a[0] > b[0] ? 1 : -1; // Sort by thread ID
    } else {
      return a[2] - b[2]; // Sort by date
    }
  });

  // Append the sorted email data to the sheet.
  sheet.getRange(sheet.getLastRow() + 1, 1, emailData.length, emailData[0].length).setValues(emailData);

  // Log the completion of the script.
  Logger.log('Email listing completed.');
}

/**
 * Gets the ISO week number of the given date.
 * @param {Date} date The date for which to get the week number.
 * @return {string} The ISO week number in 'WW' format.
 */
function getWeekNumber(date) {
  var d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo.toString().padStart(2, '0');
}
