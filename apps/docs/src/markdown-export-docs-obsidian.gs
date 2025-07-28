/**
 * Script Name: markdown- export- docs- obsidian
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
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Format output for presentation
 * 5. Send notifications or reports
 *
 * Script Functions:
 * - extractLinksFromElement(): Extracts specific information
 * - getFileTypeFromUrl(): Gets specific file type from url or configuration
 * - getHeadingLevelFromEnum(): Gets specific heading level from enum or configuration
 * - getOrCreateBacklinksSpreadsheet(): Gets specific or create backlinks spreadsheet or configuration
 * - onOpen(): Performs specialized operations
 * - sendToObsidian(): Sends to obsidian or communications
 *
 * Script Helper Functions:
 * - convertDocToMarkdown(): Converts between formats
 * - extractLinksFromDoc(): Extracts specific information
 * - getFileNameFromUrl(): Gets specific file name from url or configuration
 * - normalizeUrl(): Normalizes url format
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DocumentApp: For document manipulation
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 */

// Main Functions

/**

 * Extracts specific information
 * @param
 * @param {any} element - The element parameter
 * @returns {any} The result

 */

/**

 * Extracts specific information
 * @param
 * @param {any} element - The element parameter
 * @returns {any} The result

 */

function extractLinksFromElement(element) {
  let allLinks = [];
  const numChildren = element.getNumChildren();

  for (let i = 0; i < numChildren; i + + ) {
    const child = element.getChild(i);
    const childType = child.getType();

    if (childType = = = DocumentApp.ElementType.TEXT) {
      const text = child.asText();
      const textContent = text.getText();
      let currentLink = null;

      for (let j = 0; j < textContent.length; j + + ) {
        const linkUrl = text.getLinkUrl(j);

        if (linkUrl) {
          if (! currentLink) {
            currentLink = linkUrl;
          }
        } else {
          if (currentLink) {
            allLinks.push(currentLink);
            currentLink = null;
          }
        }
      } // Handle the case where the link is at the very end of the text
      if (currentLink) {
        allLinks.push(currentLink);
      }
    } else if (childType = = = DocumentApp.ElementType.IMAGE) {
      const image = child.asImage();
      const imageUrl = image.getLinkUrl();
      if (imageUrl) {
        const normalizedUrl = normalizeUrl(imageUrl);
        allLinks.push(imageUrl);
      }
    } else {
      allLinks = allLinks.concat(extractLinksFromElement(child));
    }
  }

  return allLinks;
}

/**

 * Gets specific file type from url or configuration
 * @param
 * @param {string} url - The URL to access
 * @returns {any} The requested any

 */

/**

 * Gets specific file type from url or configuration
 * @param
 * @param {string} url - The URL to access
 * @returns {any} The requested any

 */

function getFileTypeFromUrl(url) {
  const match = url.match( / \ / (d|spreadsheets|presentation)\ // );
  if (match) {
    return match[1];
  } else {
    return "other";
  }
}

/**

 * Gets specific heading level from enum or configuration
 * @param
 * @param {any} headingEnum - The headingEnum to retrieve
 * @returns {any} The requested any

 */

/**

 * Gets specific heading level from enum or configuration
 * @param
 * @param {any} headingEnum - The headingEnum to retrieve
 * @returns {any} The requested any

 */

function getHeadingLevelFromEnum(headingEnum) {
  switch (headingEnum) {
    case DocumentApp.ParagraphHeading.HEADING1:
      return 1;
    case DocumentApp.ParagraphHeading.HEADING2:
      return 2;
    case DocumentApp.ParagraphHeading.HEADING3:
      return 3;
    case DocumentApp.ParagraphHeading.HEADING4:
      return 4;
    case DocumentApp.ParagraphHeading.HEADING5:
      return 5;
    case DocumentApp.ParagraphHeading.HEADING6:
      return 6;
    default:
      return 0;
  }
}

/**

 * Gets specific or create backlinks spreadsheet or configuration
 * @returns {any} The requested any

 */

/**

 * Gets specific or create backlinks spreadsheet or configuration
 * @returns {any} The requested any

 */

function getOrCreateBacklinksSpreadsheet() {
  const backlinksSpreadsheetName = "Doc Backlinks";
  const existingSpreadsheets = DriveApp.getFilesByName(backlinksSpreadsheetName);

  if (existingSpreadsheets.hasNext()) {
    return existingSpreadsheets.next().getId();
  } else {
    const newSpreadsheet = SpreadsheetApp.create(backlinksSpreadsheetName);
    return newSpreadsheet.getId();
  }
}

/**

 * Performs specialized operations
 * @returns {any} The result

 */

/**

 * Performs specialized operations
 * @returns {any} The result

 */

function onOpen() {
  DocumentApp.getUi().createMenu('Send to Obsidian');
      .addItem('Obsidianize This Doc', 'sendToObsidian');
      .addToUi();
}

/**

 * Sends to obsidian or communications
 * @returns {any} The result

 */

/**

 * Sends to obsidian or communications
 * @returns {any} The result

 */

function sendToObsidian() {
  const doc = DocumentApp.getActiveDocument();
  const docId = doc.getId();
  const docName = doc.getName();
  const docUrl = doc.getUrl(); // Get the File object to access creation and last updated dates;
  const file = DriveApp.getFileById(docId);
  const docCreatedDate = file.getDateCreated();
  const docLastUpdated = file.getLastUpdated(); // Convert the doc's content to Markdown;
  const markdownContent = convertDocToMarkdown(doc); // Extract all links from the document;
  const allLinks = extractLinksFromDoc(doc); // Add "Links in Document" section to the Markdown content;
  const linksSection = `\n## Links in Document\n\n${allLinks.map(link = > ` - ${link}`).join('\n')}\n`;
  const finalMarkdownContent = markdownContent + linksSection; // Create the Markdown file in the specified folder with the new naming convention;
  const obsidianFolderId = '1_OObzgxPbqo023fWtD8trioJoSb1MYCy';
  const obsidianFolder = DriveApp.getFolderById(obsidianFolderId);
  const currentDate = new Date();
  const formattedDate = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), "yyyy - MM - dd");
  const markdownFileName = `${formattedDate} - ${docName}.md`;
  const markdownFile = obsidianFolder.createFile(markdownFileName, finalMarkdownContent); // Get or create the "Doc Backlinks" spreadsheet;
  const backlinksSpreadsheetId = getOrCreateBacklinksSpreadsheet();
  const backlinksSpreadsheet = SpreadsheetApp.openById(backlinksSpreadsheetId);
  const backlinksSheetName = "Doc Backlinks";
  let backlinksSheet = backlinksSpreadsheet.getSheetByName(backlinksSheetName);
  if (! backlinksSheet) {
    backlinksSheet = backlinksSpreadsheet.insertSheet(backlinksSheetName);
    backlinksSheet.appendRow(["Doc Created Date", "Last Update", "Doc Title", "Docs Link", "Obsidian URL"]);
  } // Add the doc information to the backlinks sheet
  const formattedCreatedDate = Utilities.formatDate(docCreatedDate, Session.getScriptTimeZone(), "yyyy - MM - dd");
  const formattedLastUpdated = Utilities.formatDate(docLastUpdated, Session.getScriptTimeZone(), "yyyy - MM - dd");
  const obsidianUrl = `[[${docName}]](${markdownFile.getUrl()})`;
  backlinksSheet.appendRow([formattedCreatedDate, formattedLastUpdated, `[[${docName}]]`, docUrl, obsidianUrl]); // Create or get the "Doc Backlinks - Obsidian Files" folder using the specified ID;
  const backlinksObsidianFolderId = '1RnPNjeK1z31jbD0oOuIn88Qb1rnIsfCi'; // Update with the new ID;
  const backlinksObsidianFolder = DriveApp.getFolderById(backlinksObsidianFolderId); // Create Markdown files for each link;
  allLinks.forEach(link = > {
    const fileType = getFileTypeFromUrl(link);
    let backlinkFileName;

    if (fileType = = = "docs" || fileType = = = "sheets" || fileType = = = "slides") {
      backlinkFileName = `[[${getFileNameFromUrl(link)}]]`;
    } else {
      backlinkFileName = `[[${link}]]`;
    }

    backlinkFileName + = ".md";

    const backlinkFileContent = `[[${docName}]]\n\nParent: ${docName}\nParent URL: ${docUrl}\nObsidian Parent Doc: [[${docName}]]\nExternal Doc Link: [[${docName}]](${docUrl})`;
    backlinksObsidianFolder.createFile(backlinkFileName, backlinkFileContent);
  });

  Logger.log("Script completed successfully.");
}

// Helper Functions

/**

 * Converts between formats
 * @param
 * @param {any} doc - The doc parameter
 * @returns {any} The result

 */

/**

 * Converts between formats
 * @param
 * @param {any} doc - The doc parameter
 * @returns {any} The result

 */

function convertDocToMarkdown(doc) {
  let markdown = "";
  const body = doc.getBody();
  const numChildren = body.getNumChildren();

  for (let i = 0; i < numChildren; i + + ) {
    const child = body.getChild(i);
    const childType = child.getType();

    if (childType = = = DocumentApp.ElementType.PARAGRAPH) {
      const heading = child.getHeading();
      if (heading = = = DocumentApp.ParagraphHeading.NORMAL) {
        markdown + = child.getText() + "\n\n";
      } else {
        const headingLevel = getHeadingLevelFromEnum(heading);
        const hashes = "#".repeat(headingLevel);
        markdown + = `${hashes} ${child.getText()}\n\n`;
      }
    } else if (childType = = = DocumentApp.ElementType.LIST_ITEM) {
      const listItem = child.asListItem();
      const nestingLevel = listItem.getNestingLevel();
      const glyphType = listItem.getGlyphType();
      const prefix = glyphType = = = DocumentApp.GlyphType.BULLET ? " - " : `${nestingLevel + 1}. `;
      markdown + = "  ".repeat(nestingLevel) + prefix + listItem.getText() + "\n";
    } else if (childType = = = DocumentApp.ElementType.TEXT) {
      const text = child.asText();
      const textContent = text.getText();
      let currentLink = null;
      let markdownText = "";

      for (let j = 0; j < textContent.length; j + + ) {
        const linkUrl = text.getLinkUrl(j);

        if (linkUrl) {
          if (! currentLink) {
            currentLink = linkUrl;
          }
        } else {
          if (currentLink) {
            markdownText + = `[${doc.getName()}](${currentLink})`;
            currentLink = null;
          }
          markdownText + = textContent[j];
        }
      }

      if (currentLink) {
        markdownText + = `[${doc.getName()}](${currentLink})`;
      }

      markdown + = markdownText;
    } else {
      markdown + = convertDocToMarkdown(child.copy());
    }
  }

  return markdown;
}

/**

 * Extracts specific information
 * @param
 * @param {any} doc - The doc parameter
 * @returns {any} The result

 */

/**

 * Extracts specific information
 * @param
 * @param {any} doc - The doc parameter
 * @returns {any} The result

 */

function extractLinksFromDoc(doc) {
  const body = doc.getBody();
  return extractLinksFromElement(body);
}

/**

 * Gets specific file name from url or configuration
 * @param
 * @param {string} url - The URL to access
 * @returns {any} The requested any

 */

/**

 * Gets specific file name from url or configuration
 * @param
 * @param {string} url - The URL to access
 * @returns {any} The requested any

 */

function getFileNameFromUrl(url) {
  const parts = url.split(" / ");
  return parts[parts.length - 1];
}

/**

 * Normalizes url format
 * @param
 * @param {string} url - The URL to access
 * @returns {any} The result

 */

/**

 * Normalizes url format
 * @param
 * @param {string} url - The URL to access
 * @returns {any} The result

 */

function normalizeUrl(url) { // Remove potential hidden characters and trim whitespace;
  return url.replace( / [\u200B - \u200D\uFEFF] / g, '').trim();
}