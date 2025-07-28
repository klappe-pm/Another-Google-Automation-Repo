/**
  * Script Name: export- gmail- weekly- threads
  *
  * Script Summary:
  * Creates spreadsheet data for automated workflow processing.
  *
  * Script Purpose:
  * - Extract gmail weekly threads data from Google services
  * - Convert data to portable formats
  * - Generate reports and summaries
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Connect to Gmail service
  * 3. Fetch source data
  * 4. Process and transform data
  * 5. Sort data by relevant fields
  * 6. Format output for presentation
  * 7. Send notifications or reports
  *
  * Script Functions:
  * - listEmails(): Checks boolean condition
  *
  * Script Helper Functions:
  * - getWeekNumber(): Gets specific week number or configuration
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - GmailApp: For accessing email messages and labels
  * - Logger: For logging and debugging
  * - SpreadsheetApp: For spreadsheet operations
  */

/**  * Gets the ISO week number of the given date. * @param {Date} date The date for which to get the week number. * @return {string} The ISO week number in 'WW' format. *// / Main Functions

// Main Functions

/**

  * Checks boolean condition
  * @returns {string} True if condition is met, false otherwise

  */

function listEmails() { // Get the current date and the date 7 days ago.;
  let today = new Date();
  let startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Log the start and end dates for email retrieval.;
  Logger.log('Retrieving emails from: ' + startDate + ' to: ' + today); // Get the Gmail threads.;
  let threads = GmailApp.search('after:' + startDate.toISOString().slice(0, 10)); // Get the week number.;
  let weekNumber = getWeekNumber(today); // Get the spreadsheet with the specified file ID.;
  let ss = SpreadsheetApp.openById('1_9j6gUp - lIIWLQdVGDKWWuwntKvT4m9eIpW3dsDe1kc'); // Create a new sheet tab named in 'yyyy - WW' format.;
  let sheetName = today.getFullYear() + ' - ' + weekNumber;
  let sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName); // Add headers to the sheet.;
  sheet.appendRow(["Thread ID", "Email ID", "Date", "Sender", "Recipients", "Subject", "Read Status"]); // Prepare an array to store email data for sorting.;
  let emailData = []; // Iterate through the threads and extract email data.;
  for (let i = 0; i < threads.length; i + + ) {
    let thread = threads[i];
    let messages = thread.getMessages(); // Log the thread being processed.;
    Logger.log('Processing thread: ' + thread.getId());

    for (let j = 0; j < messages.length; j + + ) {
      let message = messages[j];
      let threadId = thread.getId();
      let emailId = message.getId();
      let date = message.getDate();
      let sender = message.getFrom();
      let recipients = message.getTo(); // Get recipients;
      let subject = message.getSubject(); // Get the read / unread status using the thread.;
      let isRead = thread.isUnread() ? "Unread" : "Read"; // Log the email being processed.;
      Logger.log('Processing email: ' + emailId); // Add email data to the array.;
      emailData.push([threadId, emailId, date, sender, recipients, subject, isRead]);
    }
  } // Sort the email data by thread ID and then by date in chronological order.
  emailData.sort(function (a, b) {
    if (a[0] ! = = b[0]) {
      return a[0] > b[0] ? 1 : - 1; // Sort by thread ID;
    } else {
      return a[2] - b[2]; // Sort by date;
    }
  }); // Append the sorted email data to the sheet.
  sheet.getRange(sheet.getLastRow() + 1, 1, emailData.length, emailData[0].length).setValues(emailData); // Log the completion of the script.;
  Logger.log('Email listing completed.');
}

// Helper Functions

/**

  * Gets specific week number or configuration
  * @param
  * @param {any} date - The date to retrieve
  * @returns {string} The requested string

  */

function getWeekNumber(date) {
  let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo.toString().padStart(2, '0');
}