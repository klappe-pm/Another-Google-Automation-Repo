/**
  * Script Name: markdown- export- gmail- pdf
  *
  * Script Summary:
  * Exports markdown content for documentation and note- taking workflows.
  *
  * Script Purpose:
  * - Generate markdown documentation
  * - Format content for note- taking systems
  * - Maintain consistent documentation structure
  *
  * Script Steps:
  * 1. Initialize spreadsheet connection
  * 2. Connect to Gmail service
  * 3. Access Drive file system
  * 4. Fetch source data
  * 5. Sort data by relevant fields
  * 6. Format output for presentation
  * 7. Send notifications or reports
  *
  * Script Functions:
  * - onOpen(): Performs specialized operations
  * - searchAndExportEmails(): Exports search and emails to external format
  * - showDialog(): Logs show dia or messages
  *
  * Script Helper Functions:
  * - formatDate(): Formats date for display
  *
  * Script Dependencies:
  * - None (standalone script)
  *
  * Google Services:
  * - DriveApp: For file and folder management
  * - GmailApp: For accessing email messages and labels
  * - HtmlService: For serving HTML content
  * - SpreadsheetApp: For spreadsheet operations
  * - Utilities: For utility functions and encoding
  */

/**
  * Creates a custom menu in the Google Sheets UI
  * This function runs automatically when the spreadsheet is opened
  *// * *
  * Displays a dialog box for email search and export
  * This function is triggered when the user clicks the custom menu item
  *// * *
  * Searches for emails based on criteria and exports them to PDF and Markdown
  * This is the main function that performs the email search and export operations
  *
  * @param {string} searchTerm - The general search term for emails
  * @param {string} label - The Gmail label to search within
  * @param {string} keyword - A specific keyword to search for in emails
  * @param {string} startDate - The start date for the date range search
  * @param {string} endDate - The end date for the date range search
  *// * *
  * Formats a date string to 'yyyy/ MM/ dd' format
  *
  * @param {string} date - The date string to format
  * @returns {string} The formatted date string
  *// / Main Functions

// Main Functions

/**

  * Performs specialized operations
  * @returns {any} The result

  */

function onOpen() {
  console.log('Entering onOpen function');
  try {
    // Get the UI object for the active spreadsheet
    const ui = SpreadsheetApp.getUi();

    // Create a custom menu with one item
    ui.createMenu('Automations')
      .addItem('Convert E- Mail to PDF and Markdown', 'showDialog')
      .addToUi();
    console.log('Custom menu created successfully');
  } catch (error) {
    console.error('Error in onOpen function:', error);
  }
  console.log('Exiting onOpen function');
}

/**

  * Exports search and emails to external format
  * @param
  * @param {any} searchTerm - The searchTerm parameter
  * @param {GmailLabel} label - The label parameter
  * @param {string} keyword - The keyword parameter
  * @param {any} startDate - The startDate parameter
  * @param {any} endDate - The endDate parameter
  * @returns {any} The result

  */

function searchAndExportEmails(searchTerm, label, keyword, startDate, endDate) {
  console.log('Entering searchAndExportEmails function');
  console.log('Parameters:', { searchTerm, label, keyword, startDate, endDate });

  try {
    // Construct the search query
    const queryParts = [];
    if (searchTerm) queryParts.push(searchTerm);
    if (label) queryParts.push('label:' + label);
    if (keyword) queryParts.push(keyword);
    if (startDate) queryParts.push('after:' + formatDate(startDate));
    if (endDate) queryParts.push('before:' + formatDate(endDate));

    const query = queryParts.join(' ');
    console.log('Constructed query:', query);

    const folderName = 'Charges Test';
    const sheetName = 'Charges Test Spreadsheet';

    // Create or get the folder for storing exported files
    let folder = DriveApp.getFoldersByName(folderName).hasNext()
                  ? DriveApp.getFoldersByName(folderName).next()
                  : DriveApp.createFolder(folderName);
    console.log(`Folder ID: ${folder.getId()}`);

    // Create or get the spreadsheet for the summary
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    if (! ss) {
      ss = SpreadsheetApp.create(sheetName);
      console.log(`New spreadsheet created with ID: ${ss.getId()}`);
    } else {
      console.log(`Using existing spreadsheet with ID: ${ss.getId()}`);
    }
    let sheet = ss.getActiveSheet();
    sheet.clear(); // Clear existing content
    console.log('Spreadsheet cleared.');

    // Setup header row in the spreadsheet
    const headers = ['Date', 'Email Subject', 'PDF Link', 'Markdown Link', 'Extracted Amount'];
    sheet.appendRow(headers);
    console.log('Headers appended to the spreadsheet.');

    // Search emails using the constructed query
    const threads = GmailApp.search(query);
    console.log(`Found ${threads.length} threads.`);

    let rows = [];

    // Process each email thread
    threads.forEach((thread, threadIndex) = > {
      console.log(`Processing thread ${threadIndex + 1} of ${threads.length}`);
      const messages = thread.getMessages();
      messages.forEach((message, messageIndex) = > {
        console.log(`Processing message ${messageIndex + 1} of ${messages.length} in thread ${threadIndex + 1}`);
        const date = message.getDate();
        const subject = message.getSubject();
        const body = message.getBody();

        // Create PDF from email content
        const pdfBlob = Utilities.newBlob(body, 'application/ pdf', subject + '.pdf');
        const pdfFile = folder.createFile(pdfBlob);
        console.log(`PDF file created: ${pdfFile.getUrl()}`);

        // Create Markdown from email content
        const markdownContent = body.replace(/ < [^> ]* > / g, ''); // Convert HTML to plain text for Markdown
        const markdownBlob = Utilities.newBlob(`[[${markdownContent}]]`, 'text/ markdown', subject + '.md');
        const markdownFile = folder.createFile(markdownBlob);
        console.log(`Markdown file created: ${markdownFile.getUrl()}`);

        // Extract potential charge amount from email body
        const amountMatch = body.match(/ \$[0- 9,.]+ |total\s* [0- 9,.]+ / i);
        const amount = amountMatch ? amountMatch[0] : '';
        console.log(`Extracted amount: ${amount}`);

        // Add row data for the summary spreadsheet
        rows.push([date, subject, pdfFile.getUrl(), markdownFile.getUrl(), amount]);
        console.log(`Row added: Date - ${date}, Subject - ${subject}, Amount - ${amount}`);
      });
    });

    // Sort rows by date in reverse order (most recent first)
    rows.sort((a, b) = > b[0] - a[0]);
    console.log('Rows sorted in reverse date order.');

    // Append sorted rows to the spreadsheet
    rows.forEach((row, index) = > {
      sheet.appendRow(row);
      console.log(`Appended row ${index + 1} of ${rows.length} to the spreadsheet.`);
    });

    // Share the export folder with anyone who has the link
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    console.log('Folder shared with anyone with the link.');

  } catch (error) {
    console.error('Error in searchAndExportEmails function:', error);
  }

  console.log('Exiting searchAndExportEmails function');
}

/**

  * Logs show dia or messages
  * @returns {any} The result

  */

function showDialog() {
  console.log('Entering showDialog function');
  try {
    // Create an HTML output object from the dialog.html file
    const html = HtmlService.createHtmlOutputFromFile('dialog.html')
      .setWidth(400)
      .setHeight(300);

    // Display the dialog box
    SpreadsheetApp.getUi().showModalDialog(html, 'Search and Export Emails');
    console.log('Dialog box displayed successfully');
  } catch (error) {
    console.error('Error in showDialog function:', error);
  }
  console.log('Exiting showDialog function');
}

// Helper Functions

/**

  * Formats date for display
  * @param
  * @param {any} date - The date parameter
  * @returns {any} The result

  */

function formatDate(date) {
  console.log('Entering formatDate function');
  try {
    // Convert the input string to a Date object and format it
    const formattedDate = Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy/ MM/ dd');
    console.log(`Formatted date: ${formattedDate}`);
    return formattedDate;
  } catch (error) {
    console.error('Error in formatDate function:', error);
    return null;
  } finally {
    console.log('Exiting formatDate function');
  }
}