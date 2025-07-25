/*
Summary:
This Google Apps Script automates the process of searching for emails based on various criteria,
exporting them as both PDF and Markdown files, and recording their details in a Google Sheets 
spreadsheet. It creates a custom menu in Google Sheets to trigger a dialog box for user input,
allowing for flexible email searching and exporting.

Key features:
1. Custom menu creation in Google Sheets UI
2. Dialog box for user input on search criteria
3. Flexible email searching based on search term, label, keyword, and date range
4. Export of email threads as both PDF and Markdown files
5. Creation of a dedicated folder for exported files
6. Updating a Google Sheets spreadsheet with exported file details and extracted information
7. Sorting of exported emails by date
8. Sharing of the export folder with view access
*/

// Function to create and add the custom menu to the Google Sheets UI
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Automations')
    .addItem('Convert E-Mail to PDF and Markdown', 'showDialog')
    .addToUi();
}

// Function to display the dialog box for user input
function showDialog() {
  const html = HtmlService.createHtmlOutputFromFile('dialog.html')
    .setWidth(400)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Search and Export Emails');
}

// Main function to search and export emails based on user input
function searchAndExportEmails(searchTerm, label, keyword, startDate, endDate) {
  const queryParts = [];
  if (searchTerm) queryParts.push(searchTerm);
  if (label) queryParts.push('label:' + label);
  if (keyword) queryParts.push(keyword);
  if (startDate) queryParts.push('after:' + formatDate(startDate));
  if (endDate) queryParts.push('before:' + formatDate(endDate));
  const query = queryParts.join(' ');
  const folderName = 'Charges Test';
  const sheetName = query.replace(/[: ]/g, '-'); // Rename sheet using search operators

  // Create or get the folder
  let folder = DriveApp.getFoldersByName(folderName).hasNext() 
               ? DriveApp.getFoldersByName(folderName).next() 
               : DriveApp.createFolder(folderName);
  Logger.log(`Folder ID: ${folder.getId()}`);

  // Create or get the spreadsheet
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    ss = SpreadsheetApp.create(sheetName);
    Logger.log(`Spreadsheet created with ID: ${ss.getId()}`);
  }
  
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear(); // Clear existing content
  }
  Logger.log('Spreadsheet cleared or new sheet created.');

  // Setup header row
  const headers = ['Date', 'Email Subject', 'PDF Link', 'Markdown Link', 'Extracted Amount'];
  sheet.appendRow(headers);
  Logger.log('Headers appended to the spreadsheet.');

  // Search emails
  const threads = GmailApp.search(query);
  Logger.log(`Found ${threads.length} threads.`);
  let rows = [];

  threads.forEach(thread => {
    const messages = thread.getMessages();
    let threadBody = '';
    let threadSubject = thread.getFirstMessageSubject();
    let threadDate = thread.getLastMessageDate();

    messages.forEach(message => {
      const body = message.getBody();
      threadBody += body + '\n\n'; // Combine all messages in the thread
    });

    // Create PDF
    const pdfBlob = Utilities.newBlob(threadBody, 'application/pdf', threadSubject + '.pdf');
    const pdfFile = folder.createFile(pdfBlob);
    Logger.log(`PDF file created: ${pdfFile.getUrl()}`);

    // Create Markdown
    const markdownContent = threadBody.replace(/<[^>]*>/g, ''); // Convert HTML to plain text for Markdown
    const markdownBlob = Utilities.newBlob(markdownContent, 'text/markdown', threadSubject + '.md');
    const markdownFile = folder.createFile(markdownBlob);
    Logger.log(`Markdown file created: ${markdownFile.getUrl()}`);

    // Extract amount
    const amountMatch = threadBody.match(/Total \$\d\d\.\d\d/);
    const amount = amountMatch ? amountMatch[0] : '';

    rows.push([threadDate, threadSubject, pdfFile.getUrl(), markdownFile.getUrl(), amount]);
    Logger.log(`Row added: Date - ${threadDate}, Subject - ${threadSubject}, Amount - ${amount}`);
  });

  // Sort rows by date in reverse order
  rows.sort((a, b) => b[0] - a[0]);
  Logger.log('Rows sorted in reverse date order.');

  // Append rows to sheet
  rows.forEach(row => sheet.appendRow(row));
  Logger.log('Rows appended to the spreadsheet.');

  // Share folder with user
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  Logger.log('Folder shared with anyone with the link.');
}

// Helper function to format dates for the email search query
function formatDate(date) {
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy/MM/dd');
}
