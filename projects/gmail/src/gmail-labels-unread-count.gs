// =================
// SCRIPT TITLE
// =================
// Gmail Label Statistics to Google Sheets

// =================
// SCRIPT SUMMARY
// =================
// This script processes Gmail labels and counts the total and unread emails
// within a specified date range, then outputs the results to a Google Sheet.

// Purpose:
// The purpose of this script is to provide a summary of email activity
// categorized by Gmail labels for a given time period.

// Description:
// The script retrieves all user-defined Gmail labels, searches for emails
// within a specified date range, counts the total and unread emails for each
// label, and writes the results to a Google Sheet named 'Labels'.

// Problem Solved:
// This script addresses the need to quickly summarize email activity by label,
// which can be useful for tracking and analyzing communication trends or
// productivity metrics.

// Successful Execution:
// A successful execution of this script results in a Google Sheet named 'Labels'
// containing a list of all user-defined Gmail labels, along with the count of
// total and unread emails for each label within the specified date range.

// =================
// FUNCTIONS - ALPHABETICAL
// =================
// listGmailLabelsToSheet() - Main function to process Gmail labels and output to Google Sheets.

// =================
// FUNCTIONS - ORDERED
// =================
// listGmailLabelsToSheet() - Main function to process Gmail labels and output to Google Sheets.

// =================
// SCRIPT STEPS
// =================
// 1. Define the date range for the email search.
// 2. Format the start and end dates for use in Gmail search queries.
// 3. Get the active spreadsheet and the 'Labels' sheet, creating it if it doesn't exist.
// 4. Clear any existing content in the 'Labels' sheet.
// 5. Add headers and date range information to the sheet.
// 6. Retrieve all user-defined Gmail labels.
// 7. For each label, build a search query to count total and unread emails within the date range.
// 8. Store the label name, total email count, and unread email count in an array.
// 9. Sort the array by label name.
// 10. Write the sorted data to the 'Labels' sheet.
// 11. Auto-resize columns and format numbers in the sheet.
// 12. Log the completion of the script and the number of labels processed.

// =================
// HELPER FUNCTIONS
// =================
// None

// =================
// CONFIGURATION
// =================
const START_DATE = '2023-10-01'; // Format: yyyy-MM-dd
const END_DATE = '2023-10-31';   // Format: yyyy-MM-dd

function listGmailLabelsToSheet() {
  try {
    // Format dates for Gmail search
    const formattedStartDate = Utilities.formatDate(new Date(START_DATE), Session.getTimeZone(), 'yyyy/MM/dd');
    const formattedEndDate = Utilities.formatDate(new Date(END_DATE), Session.getTimeZone(), 'yyyy/MM/dd');

    // Get the active spreadsheet
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    // Get or create 'Labels' sheet
    var sheet = spreadsheet.getSheetByName('Labels');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Labels');
    }

    // Clear existing content
    sheet.clear();

    // Add headers and date range info
    var headers = [['Label Name', 'Total Emails', 'Unread Emails']];
    sheet.getRange(1, 1, 1, 3).setValues(headers);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    sheet.getRange('A2').setValue(`Date Range: ${START_DATE} to ${END_DATE}`);
    sheet.getRange('A2:C2').mergeAcross();

    // Get all user labels
    var labels = GmailApp.getUserLabels();
    var labelData = labels.map(function(label) {
      var labelName = label.getName();

      // Build search query with date range
      var baseQuery = `label:${labelName} after:${formattedStartDate} before:${formattedEndDate}`;

      // Count total threads with this label in date range
      var totalThreads = GmailApp.search(baseQuery).length;

      // Count unread threads with this label in date range
      var unreadThreads = GmailApp.search(baseQuery + ' is:unread').length;

      return [labelName, totalThreads, unreadThreads];
    });

    // Sort by label name
    labelData.sort(function(a, b) {
      return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
    });

    // Write data to sheet starting at A3 (after date range row)
    if (labelData.length > 0) {
      sheet.getRange(3, 1, labelData.length, 3).setValues(labelData);
    }

    // Autosize columns and format numbers
    sheet.autoResizeColumns(1, 3);
    if (labelData.length > 0) {
      sheet.getRange(3, 2, labelData.length, 2).setNumberFormat('#,##0');
    }

    Logger.log(`Completed: ${labelData.length} labels processed`);
    SpreadsheetApp.getUi().alert('Script executed successfully!');
  } catch (error) {
    Logger.log('Error: ' + error.message);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}
