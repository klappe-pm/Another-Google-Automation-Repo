/**
 * Script Name: count- unread- labels
 *
 * Script Summary:
 * Creates Gmail labels for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Connect to Gmail service
 * 3. Fetch source data
 * 4. Process and transform data
 * 5. Sort data by relevant fields
 * 6. Format output for presentation
 *
 * Script Functions:
 * - listGmailLabelsToSheet(): Checks boolean condition
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

const END_DATE = '2023 - 10 - 31'; / / Format: yyyy - MM - dd;

/ / Main Functions

/**

 * Checks boolean condition
 * @returns {Array} True if condition is met, false otherwise

 * /

function listGmailLabelsToSheet() {
  try { / / Format dates for Gmail search
    const formattedStartDate = Utilities.formatDate(new Date(START_DATE), Session.getTimeZone(), 'yyyy / MM / dd');
    const formattedEndDate = Utilities.formatDate(new Date(END_DATE), Session.getTimeZone(), 'yyyy / MM / dd'); / / Get the active spreadsheet;
    let spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); / / Get or create 'Labels' sheet;
    let sheet = spreadsheet.getSheetByName('Labels');
    if (! sheet) {
      sheet = spreadsheet.insertSheet('Labels');
    } / / Clear existing content
    sheet.clear(); / / Add headers and date range info;
    let headers = [['Label Name', 'Total Emails', 'Unread Emails']];
    sheet.getRange(1, 1, 1, 3).setValues(headers);
    sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    sheet.getRange('A2').setValue(`Date Range: ${START_DATE} to ${END_DATE}`);
    sheet.getRange('A2:C2').mergeAcross(); / / Get all user labels;
    let labels = GmailApp.getUserLabels();
    let labelData = labels.map(function (label) {
      let labelName = label.getName(); / / Build search query with date range;
      let baseQuery = `label:${labelName} after:${formattedStartDate} before:${formattedEndDate}`; / / Count total threads with this label in date range;
      let totalThreads = GmailApp.search(baseQuery).length; / / Count unread threads with this label in date range;
      let unreadThreads = GmailApp.search(baseQuery + ' is:unread').length;

      return [labelName, totalThreads, unreadThreads];
    }); / / Sort by label name
    labelData.sort(function (a, b) {
      return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
    }); / / Write data to sheet starting at A3 (after date range row)
    if (labelData.length > 0) {
      sheet.getRange(3, 1, labelData.length, 3).setValues(labelData);
    } / / Autosize columns and format numbers
    sheet.autoResizeColumns(1, 3);
    if (labelData.length > 0) {
      sheet.getRange(3, 2, labelData.length, 2).setNumberFormat('#,##0');
    }

    Logger.log(`Completed: ${labelData.length} labels processed`);
    SpreadsheetApp.getUi().alert('Script executed successfully! ');
  } catch (error) {
    Logger.log('Error: ' + error.message);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}