/**
 * Script Name: markdown- export- pdf
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
 * 5. Validate input data
 * 6. Process and transform data
 * 7. Apply filters and criteria
 * 8. Format output for presentation
 *
 * Script Functions:
 * - exportEmailsToPDF(): Exports emails to p d f to external format
 * - insertDataIntoSheet(): Inserts data into sheet at specific position
 *
 * Script Helper Functions:
 * - getOrCreateFolder(): Gets specific or create folder or configuration
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DocumentApp: For document manipulation
 * - DriveApp: For file and folder management
 * - GmailApp: For accessing email messages and labels
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - UrlFetchApp: For HTTP requests to external services
 * - Utilities: For utility functions and encoding
 */

/  / Summary: // This Google Apps Script is designed to export emails from Gmail to PDF format and store them in Google Drive. // It also logs relevant email data into a Google Sheet. The script utilizes the GmailUtils library to handle // email processing, including converting emails to HTML and PDF, embedding images, and handling attachments. // Successfully using this script enables users to automate the process of archiving emails as PDFs and maintaining // a structured log of email data in a Google Sheet. // Import GmailUtils library
const GmailUtils = {
  eachMessage: function (query, limit, callback) {
    if (typeof query = = 'function') {
      callback = query;
      query = null;
      limit = null;
    }
    if (typeof limit = = 'function') {
      callback = limit;
      limit = null;
    }
    if (typeof callback ! = 'function') {
      throw "No callback provided";
    }
    limit = parseInt(limit) || 10;
    query = query || 'in:inbox';

    let threads = GmailApp.search(query, 0, limit);
    for (let t = 0; t < threads.length; t + + ) {
      let messages = threads[t].getMessages();
      if (! messages || messages.length = = = 0) {
        Logger.log(`Thread ${threads[t].getId()} has no messages.`);
        continue;
      }
      for (let m = 0; m < messages.length; m + + ) {
        callback(messages[m]);
      }
    }
  },
  messageToPdf: function (messages, opts) {
    return this.messageToHtml(messages, opts).getAs('application / pdf');
  },
  messageToHtml: function (messages, opts) {
    opts = opts || {};
    const defaults = {
      includeHeader: true,
      includeAttachments: true,
      embedAttachments: true,
      embedRemoteImages: true,
      embedInlineImages: true,
      embedAvatar: true,
      width: 700,
      filename: null
    };
    for (const key in defaults) {
      if (! opts.hasOwnProperty(key)) {
        opts[key] = defaults[key];
      }
    }

    if (! Array.isArray(messages)) {
      messages = this.isa(messages, 'GmailThread') ? messages.getMessages() : [messages];
    }
    if (! messages.every((obj) = > this.isa(obj, 'GmailMessage'))) {
      throw "Argument must be of type GmailMessage or GmailThread.";
    }

    if (! messages || messages.length = = = 0) {
      throw new Error("No messages provided for HTML conversion.");
    }

    const name = opts.filename || this.sanitizeFilename(messages[messages.length - 1].getSubject()) + '.html';
    let html = ` < html >  < style type= "text / css" > body { padding: 0 10px; min - width: ${opts.width}px; - webkit - print - color - adjust: exact; }
        body > dl.email - meta { font - family: "Helvetica Neue", Helvetica, Arial, sans - serif; font - size: 14px; padding: 0 0 10px; margin: 0 0 5px; border - bottom: 1px solid #ddd; page - break - before: always; }
        body > dl.email - meta:first - child { page - break - before: auto; }
        body > dl.email - meta dt { color: #808080; float: left; width: 60px; clear: left; text - align: right; overflow: hidden; text - overflow: ellipsis; white - space: nowrap; font - style: normal; font - weight: 700; line - height: 1.4; }
        body > dl.email - meta dd { margin - left: 70px; line - height: 1.4; }
        body > dl.email - meta dd a { color: #808080; font - size: 0.85em; text - decoration: none; font - weight: normal; }
        body > dl.email - meta dd.avatar { float: right; }
        body > dl.email - meta dd.avatar img { max - height: 72px; max - width: 72px; border - radius: 36px; }
        body > dl.email - meta dd.strong { font - weight: bold; }
        body > div.email - attachments { font - size: 0.85em; color: #999; } < / style >  < body > `;

    for (let m = 0; m < messages.length; m + + ) {
      const message = messages[m];
      const subject = message.getSubject();
      const date = this.formatDate(message);
      const from = this.formatEmails(message.getFrom());
      const to = this.formatEmails(message.getTo());
      let body = message.getBody() || "No email content available.";

      if (opts.includeHeader) {
        let avatar = '';
        if (opts.embedAvatar) {
          const avatarBlob = this.emailGetAvatar(from);
          if (avatarBlob) {
            avatar = ` < dd class= "avatar" >  < img src= "${this.renderDataUri(avatarBlob)}" / >  < / dd > `;
          }
        }
        html + = ` < dl class= "email - meta" >  < dt > From: < / dt > ${avatar} < dd class= "strong" > ${from} < / dd >  < dt > Subject: < / dt >  < dd > ${subject} < / dd >  < dt > Date: < / dt >  < dd > ${date} < / dd >  < dt > To: < / dt >  < dd > ${to} < / dd >  < / dl > `;
      }

      if (opts.embedRemoteImages) {
        body = this.embedHtmlImages(body);
      }
      if (opts.embedInlineImages) {
        body = this.embedInlineImages(body, message.getRawContent());
      }

      if (opts.includeAttachments) {
        const attachments = message.getAttachments();
        if (attachments.length > 0) {
          body + = ` < br / >  < strong > Attachments: < / strong >  < div class= "email - attachments" > `;
          for (let a = 0; a < attachments.length; a + + ) {
            const filename = attachments[a].getName();
            const imageData = opts.embedAttachments ? this.renderDataUri(attachments[a]) : null;
            body + = imageData;
              ? ` < img src= "${imageData}" alt= "&lt;${filename}&gt;" / >  < br / > `;
              : `&lt;${filename}&gt; < br / > `;
          }
          body + = ` < / div > `;
        }
      }

      html + = body;
    }

    html + = ` < / body >  < / html > `;
    return Utilities.newBlob(html, 'text / html', name);
  },
  formatDate: function (message, format, timezone) {
    timezone = timezone || Session.getScriptTimeZone();
    format = format || "MMMMM dd, yyyy 'at' h:mm a";
    return Utilities.formatDate(message.getDate(), timezone, format);
  },
  emailGetAvatar: function (email) {
    const re = / [a - z0 - 9! #$ % &' *  +  / = ?^_`{|}~ - ] + (?:\.[a - z0 - 9! #$ % &' *  +  / = ?^_`{|}~ - ] + ) * @(?:[a - z0 - 9](?:[a - z0 - 9 - ] * [a - z0 - 9])?\.) + [a - z0 - 9](?:[a - z0 - 9 - ] * [a - z0 - 9])? / gi;
    if (! (email = email.match(re)) || ! (email = email[0].toLowerCase())) {
      return false;
    }
    const domain = email.split('@')[1];
    let avatar = this.fetchRemoteFile(`https: // www.gravatar.com / avatar / ${this.md5(email)}?s= 128&d= 404`);
    if (! avatar && ['gmail', 'hotmail', 'yahoo'].every((s) = > domain.indexOf(s) = = = - 1)) {
      avatar = this.fetchRemoteFile(`http: // ${domain} / apple - touch - icon.png`) || this.fetchRemoteFile(`http: // ${domain} / apple - touch - icon - precomposed.png`);
    }
    return avatar;
  },
  embedHtmlImages: function (html) {
    return html.replace( / ( < img[^ > ] + src= )(["'])((?:(?! \2)[^\\]|\\.) * )\2 / gi, (m, tag, q, src) = > {
      return tag + q + (this.renderDataUri(src) || src) + q;
    });
  },
  embedInlineImages: function (html, raw) {
    const images = [];
    raw.replace( / < img[^ > ] + src= (?:3D)?(["'])cid:((?:(?! \1)[^\\]|\\.) * )\1 / gi, (m, q, cid) = > {
      images.push(cid);
      return m;
    });

    const inlineImages = images.map((cid) = > {
      const cidIndex = raw.search(new RegExp(`Content - ID ?:. * ?${cid}`, 'i'));
      if (cidIndex = = = - 1) return null;

      const prevBoundaryIndex = raw.lastIndexOf("\r\n -  - ", cidIndex);
      const nextBoundaryIndex = raw.indexOf("\r\n -  - ", prevBoundaryIndex + 1);
      const part = raw.substring(prevBoundaryIndex, nextBoundaryIndex);

      const encodingLine = part.match( / Content - Transfer - Encoding:. * ?\r\n / i)[0];
      const encoding = encodingLine.split(":")[1].trim();
      if (encoding ! = = "base64") return null;

      const contentTypeLine = part.match( / Content - Type:. * ?\r\n / i)[0];
      const contentType = contentTypeLine.split(":")[1].split(";")[0].trim();

      const startOfBlob = part.indexOf("\r\n\r\n");
      const blobText = part.substring(startOfBlob).replace("\r\n", "");

      return Utilities.newBlob(Utilities.base64Decode(blobText), contentType, cid);
    }).filter((i) = > i);

    return html.replace( / ( < img[^ > ] + src= )(["'])(\?view= att(?:(?! \2)[^\\]|\\.) * )\2 / gi, (m, tag, q, src) = > {
      return tag + q + (this.renderDataUri(inlineImages.shift()) || src) + q;
    });
  },
  renderDataUri: function (image) {
    if (typeof image = = = 'string' && ! (this.isValidUrl(image) && (image = this.fetchRemoteFile(image)))) {
      return null;
    }
    if (this.isa(image, 'Blob') || this.isa(image, 'GmailAttachment')) {
      const type = image.getContentType().toLowerCase();
      const data = Utilities.base64Encode(image.getBytes());
      if (type.indexOf('image') = = = 0) {
        return `data:${type};base64,${data}`;
      }
    }
    return null;
  },
  fetchRemoteFile: function (url) {
    try {
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      return response.getResponseCode() = = = 200 ? response.getBlob() : null;
    } catch (e) {
      return null;
    }
  },
  isValidUrl: function (url) {
    return / ^(https?|ftp):\ / \ / (([a - z]|\d| - |\.|_|~|[\u00A0 - \uD7FF\uF900 - \uFDCF\uFDF0 - \uFFEF]) + (:\d + )?(\ / (([a - z]|\d| - |\.|_|~|[\u00A0 - \uD7FF\uF900 - \uFDCF\uFDF0 - \uFFEF])|( % [\da - f]{2})|[! \$&'\(\)\ * \ + ,;= ]|:|@) * ) * )?(\?((([a - z]|\d| - |\.|_|~|[\u00A0 - \uD7FF\uF900 - \uFDCF\uFDF0 - \uFFEF])|( % [\da - f]{2})|[! \$&'\(\)\ * \ + ,;= ]|:|@)|\ / |\?) * )?(\#((([a - z]|\d| - |\.|_|~|[\u00A0 - \uD7FF\uF900 - \uFDCF\uFDF0 - \uFFEF])|( % [\da - f]{2})|[! \$&'\(\)\ * \ + ,;= ]|:|@)|\ / |\?) * )?$ / i.test(url);
  },
  sanitizeFilename: function (filename) {
    return filename.replace( / [\ / \? <  > \\:\ * \|":\x00 - \x1f\x80 - \x9f] / g, '');
  },
  formatEmails: function (emails) {
    const pattern = / < (([a - z0 - 9! #$ % &' *  +  / = ?^_`{|}~ - ] + (?:\.[a - z0 - 9! #$ % &' *  +  / = ?^_`{|}~ - ] + ) * @(?:[a - z0 - 9](?:[a - z0 - 9 - ] * [a - z0 - 9])?\.) + [a - z0 - 9](?:[a - z0 - 9 - ] * [a - z0 - 9])?)) > / gi;
    return emails.replace(pattern, ' < a href= "mailto:$1" > $1 < / a > ');
  },
  isa: function (obj, className) {
    return typeof obj = = = 'object' && obj.toString() = = = className;
  },
  md5: function (str) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, str);
      .reduce((str, chr) = > str + (chr < 0 ? chr + 256 : chr).toString(16).padStart(2, '0'), '');
  }
}; // Main function to export emails as PDFs
 // Helper function to get or create a folder
 // Helper function to insert data into Google Sheet

// Main Functions

/**

 * Exports emails to p d f to external format
 * @returns {string} The formatted string

 */

function exportEmailsToPDF() {
  try {
    const labelName = "rebecca - york"; // Replace with your label or query;
    const rootFolderName = "Lappe vs. Door";
    const pdfFolderName = "pdf - emails";
    const docsToConvertFolderName = "docs to convert";
    const spreadsheetId = "1lgCbP -  - CvUOY3U06lHi_JiMe1hYqSzfnsOo8a - oyqKI"; // Replace with your Google Sheet ID;
    const sheetName = "Inbox"; // Step 1: Fetch threads with the label;
    const threads = GmailApp.search(`label:${labelName}`);
    if (threads.length = = = 0) {
      Logger.log(`No emails found with the label "${labelName}".`);
      return;
    }
    Logger.log(`Found ${threads.length} thread(s) with the label "${labelName}".`); // Step 2: Get or create the root folder;
    const rootFolder = getOrCreateFolder(rootFolderName);
    const pdfFolder = getOrCreateFolder(pdfFolderName, rootFolder);
    const labelFolder = getOrCreateFolder(labelName, pdfFolder);
    const attachmentsFolder = getOrCreateFolder("attachments", labelFolder);
    const docsToConvertFolder = getOrCreateFolder(docsToConvertFolderName, rootFolder); // Step 3: Process each thread;
    const emailData = [];
    GmailUtils.eachMessage(`label:${labelName}`, (message) = > {
      Logger.log(`Processing message: ${message.getId()}`);

      const threadSubject = message.getThread().getFirstMessageSubject().replace( / ^(Re:|Fwd:)\s */ i, '');
      const dateReceived = GmailUtils.formatDate(message, "yyyy - MM - dd");
      const timeReceived = GmailUtils.formatDate(message, "HH:mm");
      const body = GmailUtils.messageToHtml([message], {
        includeHeader: true,
        includeAttachments: true,
        embedAttachments: true,
        embedRemoteImages: true,
        embedInlineImages: true,
        embedAvatar: true
      }).getDataAsString();

      const docTitle = `${dateReceived} - ${labelName} - ${threadSubject}`;
      const doc = DocumentApp.create(docTitle);
      const bodyElement = doc.getBody();
      bodyElement.appendParagraph(body);
      doc.saveAndClose(); // Save the Google Doc in the "Docs to Convert" folder;
      const docFile = DriveApp.getFileById(doc.getId());
      docsToConvertFolder.addFile(docFile);
      rootFolder.removeFile(docFile);

      const pdfFile = GmailUtils.messageToPdf([message], {
        includeHeader: true,
        includeAttachments: true,
        embedAttachments: true,
        embedRemoteImages: true,
        embedInlineImages: true,
        embedAvatar: true
      });
      const pdfLink = labelFolder.createFile(pdfFile.setName(`${docTitle}.pdf`)).getUrl(); // Updated Gmail link generation;
        const rfc822MessageId = message.getHeader("Message - ID"); // Fetch the RFC822 Message ID;
        Logger.log(`RFC822 Message ID: ${rfc822MessageId}`);

        if (! rfc822MessageId) {
          Logger.log(`Message ID not found for email: ${message.getId()}`);
          return;
        }

        const gmailLink = `https: // mail.google.com / mail / u / 0 / #search / rfc822msgid:${encodeURIComponent(rfc822MessageId)}`;
        Logger.log(`Generated Gmail Link: ${gmailLink}`);

      const attachments = message.getAttachments() || [];
      const attachmentLinks = [];
      if (attachments.length = = = 0) {
        Logger.log(`No attachments found for message: ${message.getId()}`);
      }
      attachments.forEach((attachment, index) = > {
        const attachmentFileName = `${dateReceived} - ${threadSubject} - attachment - ${index + 1}`;
        const attachmentFile = attachmentsFolder.createFile(attachment.copyBlob().setName(attachmentFileName));
        attachmentLinks.push({ name: attachmentFileName, url: attachmentFile.getUrl() });
      });

      emailData.push({
        dateReceived,
        timeReceived,
        subject: threadSubject,
        gmailLink,
        pdfLink,
        attachmentLinks,
        threadId: message.getThread().getId(),
        emailId: message.getId();
      });
    }); // Step 4: Insert data into Google Sheet
    insertDataIntoSheet(emailData, spreadsheetId, sheetName);

    Logger.log("All emails exported as PDFs and data inserted into Google Sheet successfully.");
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
  }
}

/**

 * Inserts data into sheet at specific position
 * @param
 * @param {string} emailData - The emailData parameter
 * @param {string} spreadsheetId - The spreadsheetId parameter
 * @param {string} sheetName - The sheetName parameter
 * @returns {string} The formatted string

 */

function insertDataIntoSheet(emailData, spreadsheetId, sheetName) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(sheetName); // Create the sheet if it doesn't exist;
  if (! sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    Logger.log(`Created new sheet: ${sheetName}`);
  }

  const headers = [;
    "Thread ID",
    "Email ID",
    "Convert MD",
    "To Reply",
    "Processed",
    "Tasks",
    "Metadata",
    "Date Received",
    "Time Received",
    "Subject",
    "Links",
    "Gmail Link",
    "PDF Link",
    "MD Link"
  ];
  const maxAttachments = emailData.reduce((max, data) = > Math.max(max, data.attachmentLinks.length), 0);
  for (let i = 1; i < = maxAttachments; i + + ) {
    headers.push(`Attachment Link ${i}`);
  } // Ensure headers are present
  if (sheet.getLastRow() = = = 0) {
    sheet.appendRow(headers);
  } // Check for existing email IDs to avoid duplicates
  const lastRow = sheet.getLastRow();
  const existingEmailIds = lastRow > 1;
    ? sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
    : []; // Insert data at the top of the sheet
  emailData.forEach((data) = > {
    if (! existingEmailIds.includes(data.emailId)) {
      const row = [;
        data.threadId,
        data.emailId,
        false, // Checkbox for Convert MD
        false, // Checkbox for To Reply
        false, // Checkbox for Processed
        "", // Tasks
        "", // Metadata
        data.dateReceived,
        data.timeReceived,
        data.subject,
        "", // Links column is blank
        `= HYPERLINK("${data.gmailLink}", "Gmail Link")`, // Gmail Link;
        `= HYPERLINK("${data.pdfLink}", "PDF Link")`,
        "", // Leave MD Link blank for now
        ...data.attachmentLinks.map((link) = > `= HYPERLINK("${link.url}", "${link.name}")`);
      ];
      sheet.insertRowBefore(2);
      sheet.getRange(2, 1, 1, row.length).setValues([row]);
    }
  }); // Format the sheet
  const range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  range.setHorizontalAlignment("left");
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
  sheet.setFrozenRows(1); // Add checkboxes to the "Convert MD", "To Reply", and "Processed" columns;
  const checkboxRangeConvertMD = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1);
  checkboxRangeConvertMD.insertCheckboxes();

  const checkboxRangeToReply = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1);
  checkboxRangeToReply.insertCheckboxes();

  const checkboxRangeProcessed = sheet.getRange(2, 5, sheet.getLastRow() - 1, 1);
  checkboxRangeProcessed.insertCheckboxes();
}

// Helper Functions

/**

 * Gets specific or create folder or configuration
 * @param
 * @param {string} folderName - The folderName to retrieve
 * @param {Folder} parentFolder - The parentFolder to retrieve
 * @returns {string} The requested string

 */

function getOrCreateFolder(folderName, parentFolder) {
  const folders = (parentFolder || DriveApp).getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : (parentFolder || DriveApp).createFolder(folderName);
}