/**
 * Script Name: count- labels
 *
 * Script Summary:
 * Processes Gmail labels for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Connect to Gmail service
 * 2. Fetch source data
 * 3. Format output for presentation
 * 4. Send notifications or reports
 *
 * Script Functions:
 * - countEmailsWithAndWithoutLabels(): Counts emails with and without labels or occurrences
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - Utilities: For utility functions and encoding
 */

// Main Functions

/**

 * Counts emails with and without labels or occurrences

 */

function countEmailsWithAndWithoutLabels() { // Set the start date;
  let startDate = new Date('2023 - 10 - 01');
  startDate.setHours(0, 0, 0, 0); // Generate date range query;
  let query = `after:${Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy / MM / dd')} - in:spam - in:trash`; // Search for threads matching the query;
  let threads = GmailApp.search(query); // Initialize counters;
  let emailsWithLabel = 0;
  let emailsWithoutLabel = 0; // Process each thread;
  threads.forEach(function (thread) {
    let labels = thread.getLabels();
    if (labels.length > 0) {
      emailsWithLabel + + ; } else {
      emailsWithoutLabel + + ; }
  }); // Log the results
  Logger.log('Emails with a label: ' + emailsWithLabel);
  Logger.log('Emails without a label: ' + emailsWithoutLabel); // Print success message;
  Logger.log('Script executed successfully.');
}