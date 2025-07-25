/**
 * Script Title: Email Label Counter
 *
 * GitHub: https://github.com/klappe-pm/GMail-Label-Management-Suite/blob/main/gmail-labels-labeled-not-labeled-count
 * Script Summary:
 * This script counts the number of emails with and without labels in a Gmail account
 * within a specified date range. It helps users understand the organization of their
 * emails by identifying how many emails have been categorized with labels.
 *
 * Purpose:
 * The purpose of this script is to provide insights into email management by
 * counting labeled and unlabeled emails. This can help users assess their email
 * organization practices and identify areas for improvement.
 *
 * Description:
 * The script searches for emails received after a specified start date, excluding
 * those in spam and trash. It then counts how many of these emails have labels
 * and how many do not.
 *
 * Problem Solved:
 * This script addresses the need to understand email organization by quantifying
 * the use of labels, helping users to manage their inbox more effectively.
 *
 * Successful Execution:
 * A successful execution of this script will log the count of emails with labels
 * and without labels to the Google Apps Script IDE, providing a clear summary
 * of email organization.
 *
 * Functions-Alphabetical:
 * - countEmailsWithAndWithoutLabels(): Main function to count emails with and without labels.
 *
 * Functions-Ordered:
 * 1. countEmailsWithAndWithoutLabels(): Main function to count emails with and without labels.
 *
 * Script-Steps:
 * 1. Set the start date for the email search.
 * 2. Generate a date range query to search for emails after the start date, excluding spam and trash.
 * 3. Search for email threads matching the query.
 * 4. Initialize counters for emails with labels and without labels.
 * 5. Process each thread to check for labels and update the counters accordingly.
 * 6. Log the results to the Google Apps Script IDE.
 * 7. Print a success message upon completion.
 *
 * Helper Functions:
 * - None (This script does not use any helper functions)
 */

function countEmailsWithAndWithoutLabels() {
  // Set the start date
  var startDate = new Date('2023-10-01');
  startDate.setHours(0, 0, 0, 0);

  // Generate date range query
  var query = `after:${Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'yyyy/MM/dd')} -in:spam -in:trash`;

  // Search for threads matching the query
  var threads = GmailApp.search(query);

  // Initialize counters
  var emailsWithLabel = 0;
  var emailsWithoutLabel = 0;

  // Process each thread
  threads.forEach(function(thread) {
    var labels = thread.getLabels();
    if (labels.length > 0) {
      emailsWithLabel++;
    } else {
      emailsWithoutLabel++;
    }
  });

  // Log the results
  Logger.log('Emails with a label: ' + emailsWithLabel);
  Logger.log('Emails without a label: ' + emailsWithoutLabel);

  // Print success message
  Logger.log('Script executed successfully.');
}