/**
  * Script Name: export-gmail-simple-refactored
  *
  * Script Summary:
  * Example of a refactored Gmail export script using shared utilities.
  * This demonstrates how to use the shared utility library.
  *
  * Script Purpose:
  * - Show practical usage of shared utilities
  * - Demonstrate code reduction and improved functionality
  * - Serve as a template for refactoring other scripts
  *
  * Script Dependencies:
  * - email-utils.gs
  * - drive-utils.gs
  * - sheet-utils.gs
  * - error-utils.gs
  * - common-utils.gs
  *
  * Google Services:
  * - GmailApp: For accessing email messages
  * - DriveApp: For file operations
  * - SpreadsheetApp: For logging results
  */

// ============================================
// COPY SHARED UTILITIES HERE
// In practice, you would copy the needed utility functions
// from apps/shared/utils/ or use Google Apps Script Libraries
// ============================================

// Main export function using shared utilities
function exportGmailToSheets() {
  const startTime = Date.now();

  // Use error handling wrapper
  return withErrorHandling(() => {
    // Setup spreadsheet using sheet-utils
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = createOrGetSheet(spreadsheet, 'Email Exports', true);

    const headers = [
      'Date', 'Time', 'From', 'From Name', 'Subject',
      'Recipients', 'Has Attachments', 'Labels', 'Folder Link'
    ];

    setupSheet(sheet, headers, {
      freezeRows: 1,
      headerBackground: '#4285F4',
      fontSize: 10
    });

    // Create folder structure using drive-utils
    const folderStructure = createFolderStructure({
      'Email Exports': {
        [formatDate(new Date(), 'FILENAME')]: {
          'PDFs': {},
          'Attachments': {}
        }
      }
    });

    // Get today's export folder
    const dateFolder = formatDate(new Date(), 'FILENAME');
    const exportFolder = folderStructure[`Email Exports/${dateFolder}`];
    const pdfFolder = folderStructure[`Email Exports/${dateFolder}/PDFs`];
    const attachmentFolder = folderStructure[`Email Exports/${dateFolder}/Attachments`];

    // Process emails
    const threads = GmailApp.search('in:inbox is:unread', 0, 50);
    const exportData = [];

    Logger.log(`Processing ${threads.length} threads`);

    threads.forEach((thread, index) => {
      // Process with retry logic
      const result = safeOperation(() => {
        return processThread(thread, pdfFolder, attachmentFolder);
      }, null, 3);

      if (result) {
        exportData.push(...result);
      }

      // Log progress
      if ((index + 1) % 10 === 0) {
        Logger.log(`Processed ${index + 1}/${threads.length} threads`);
      }
    });

    // Insert data into sheet using sheet-utils
    if (exportData.length > 0) {
      insertDataIntoSheet(sheet, exportData, null, {
        startRow: 2,
        autoResize: true
      });

      Logger.log(`Exported ${exportData.length} emails`);
    }

    // Add summary row
    const summaryData = [[
      formatDate(new Date(), 'FRIENDLY_TIME'),
      'Export Complete',
      `${exportData.length} emails processed`,
      '',
      `Time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      '',
      '',
      '',
      exportFolder.getUrl()
    ]];

    appendDataToSheet(sheet, summaryData);

    return {
      success: true,
      emailsProcessed: exportData.length,
      folderUrl: exportFolder.getUrl()
    };

  }, 'exportGmailToSheets');
}

// Process a single thread
function processThread(thread, pdfFolder, attachmentFolder) {
  const messages = thread.getMessages();
  const threadData = [];

  messages.forEach(message => {
    try {
      // Parse email using email-utils
      const emailData = parseEmailData(message);

      // Create PDF with safe operation
      const pdfBlob = createEmailPdf(message);
      const pdfFile = safeCreateFile(pdfFolder, pdfBlob);

      // Process attachments
      let attachmentCount = 0;
      if (emailData.hasAttachments) {
        attachmentCount = processAttachments(
          message.getAttachments(),
          attachmentFolder,
          emailData.subject
        );
      }

      // Format row data using utilities
      const rowData = [
        formatDate(emailData.date, 'DATE_ONLY'),
        formatDate(emailData.date, 'TIME_ONLY'),
        emailData.from,
        emailData.fromName,
        truncateString(emailData.subject, 100),
        emailData.recipients.join(', '),
        emailData.hasAttachments ? `Yes (${attachmentCount})` : 'No',
        emailData.labels.join(', '),
        pdfFile ? pdfFile.getUrl() : 'Error'
      ];

      threadData.push(rowData);

    } catch (error) {
      // Log error with context
      handleError(error, 'processThread', {
        messageId: message.getId(),
        subject: message.getSubject()
      });
    }
  });

  return threadData;
}

// Create PDF from email message
function createEmailPdf(message) {
  const subject = sanitizeFileName(message.getSubject());
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background: #f0f0f0; padding: 10px; }
          .content { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${message.getSubject()}</h2>
          <p><strong>From:</strong> ${message.getFrom()}</p>
          <p><strong>Date:</strong> ${formatDate(message.getDate(), 'FRIENDLY_TIME')}</p>
          <p><strong>To:</strong> ${message.getTo()}</p>
        </div>
        <div class="content">
          ${message.getBody()}
        </div>
      </body>
    </html>
  `;

  const blob = Utilities.newBlob(html, 'text/html', `${subject}.html`);
  return blob.getAs('application/pdf').setName(`${subject}.pdf`);
}

// Process email attachments
function processAttachments(attachments, folder, emailSubject) {
  let savedCount = 0;

  attachments.forEach((attachment, index) => {
    try {
      const filename = sanitizeFileName(
        `${emailSubject}_${index + 1}_${attachment.getName()}`
      );

      const blob = attachment.copyBlob().setName(filename);

      // Check file size
      if (blob.getBytes().length > 25 * 1024 * 1024) {
        Logger.log(`Attachment too large: ${filename}`);
        return;
      }

      const file = safeCreateFile(folder, blob);
      if (file) savedCount++;

    } catch (error) {
      logError(error, ErrorSeverity.WARNING, {
        context: 'processAttachments',
        attachment: attachment.getName()
      });
    }
  });

  return savedCount;
}

// Generate export summary
function generateExportSummary() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Email Exports');

  if (!sheet) {
    Logger.log('No export data found');
    return;
  }

  // Convert sheet data to objects for analysis
  const data = getSheetDataAsObjects(sheet);

  // Analyze data
  const summary = {
    totalEmails: data.length,
    emailsByDate: {},
    emailsBySender: {},
    attachmentStats: {
      withAttachments: 0,
      totalAttachments: 0
    }
  };

  data.forEach(row => {
    // Count by date
    const date = row['Date'];
    summary.emailsByDate[date] = (summary.emailsByDate[date] || 0) + 1;

    // Count by sender
    const sender = row['From'];
    summary.emailsBySender[sender] = (summary.emailsBySender[sender] || 0) + 1;

    // Attachment stats
    if (row['Has Attachments'] && row['Has Attachments'].startsWith('Yes')) {
      summary.attachmentStats.withAttachments++;
    }
  });

  Logger.log('Export Summary:');
  Logger.log(JSON.stringify(summary, null, 2));

  return summary;
}