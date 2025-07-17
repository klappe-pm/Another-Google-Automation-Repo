/**
 * Title: Google Docs to Obsidian Markdown Exporter
 * Service: Google Docs
 * Purpose: Convert Google Docs to Obsidian-compatible Markdown with backlink generation
 * Created: 2024-01-15
 * Updated: 2024-01-15
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Convert Google Documents to Markdown format optimized for Obsidian with automatic backlink creation
- Description: Exports docs to markdown, extracts all links, creates backlink files, and logs document details in spreadsheet
- Problem Solved: Manual conversion of Google Docs to Obsidian-compatible format with proper linking structure
- Successful Execution: Document converted to markdown, all links extracted, backlink files created, metadata logged
- Key Features:
  - Converts Google Docs to Markdown format
  - Extracts and lists all links from the document
  - Creates a Markdown file in a specified Obsidian folder
  - Logs document details in a "Doc Backlinks" spreadsheet
  - Creates backlink Markdown files for each link in the document
- Google Workspace Services Used:
  - Google Drive API (DriveApp)
  - Google Docs API (DocumentApp)
  - Google Sheets API (SpreadsheetApp)
  - Apps Script Logger
*/

/**
 * Creates a custom menu in Google Docs UI to send the document to Obsidian.
 */
function onOpen() {
  DocumentApp.getUi().createMenu('Send to Obsidian')
      .addItem('Obsidianize This Doc', 'sendToObsidian')
      .addToUi();
}

/**
 * Main function to convert the document to Markdown and send it to Obsidian.
 */
function sendToObsidian() {
  const doc = DocumentApp.getActiveDocument();
  const docId = doc.getId();
  const docName = doc.getName();
  const docUrl = doc.getUrl();

  // Get the File object to access creation and last updated dates
  const file = DriveApp.getFileById(docId);
  const docCreatedDate = file.getDateCreated();
  const docLastUpdated = file.getLastUpdated();

  // Convert the doc's content to Markdown
  const markdownContent = convertDocToMarkdown(doc);

  // Extract all links from the document
  const allLinks = extractLinksFromDoc(doc);

  // Add "Links in Document" section to the Markdown content
  const linksSection = `\n## Links in Document\n\n${allLinks.map(link => `- ${link}`).join('\n')}\n`;
  const finalMarkdownContent = markdownContent + linksSection;

  // Create the Markdown file in the specified folder with the new naming convention
  const obsidianFolderId = '1_OObzgxPbqo023fWtD8trioJoSb1MYCy';
  const obsidianFolder = DriveApp.getFolderById(obsidianFolderId);
  const currentDate = new Date();
  const formattedDate = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const markdownFileName = `${formattedDate} - ${docName}.md`;
  const markdownFile = obsidianFolder.createFile(markdownFileName, finalMarkdownContent);

  // Get or create the "Doc Backlinks" spreadsheet
  const backlinksSpreadsheetId = getOrCreateBacklinksSpreadsheet();
  const backlinksSpreadsheet = SpreadsheetApp.openById(backlinksSpreadsheetId);
  const backlinksSheetName = "Doc Backlinks";
  let backlinksSheet = backlinksSpreadsheet.getSheetByName(backlinksSheetName);
  if (!backlinksSheet) {
    backlinksSheet = backlinksSpreadsheet.insertSheet(backlinksSheetName);
    backlinksSheet.appendRow(["Doc Created Date", "Last Update", "Doc Title", "Docs Link", "Obsidian URL"]);
  }

  // Add the doc information to the backlinks sheet
  const formattedCreatedDate = Utilities.formatDate(docCreatedDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const formattedLastUpdated = Utilities.formatDate(docLastUpdated, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const obsidianUrl = `[[${docName}]](${markdownFile.getUrl()})`;
  backlinksSheet.appendRow([formattedCreatedDate, formattedLastUpdated, `[[${docName}]]`, docUrl, obsidianUrl]);

  // Create or get the "Doc Backlinks - Obsidian Files" folder using the specified ID
  const backlinksObsidianFolderId = '1RnPNjeK1z31jbD0oOuIn88Qb1rnIsfCi'; // Update with the new ID
  const backlinksObsidianFolder = DriveApp.getFolderById(backlinksObsidianFolderId);

  // Create Markdown files for each link
  allLinks.forEach(link => {
    const fileType = getFileTypeFromUrl(link);
    let backlinkFileName;

    if (fileType === "docs" || fileType === "sheets" || fileType === "slides") {
      backlinkFileName = `[[${getFileNameFromUrl(link)}]]`;
    } else {
      backlinkFileName = `[[${link}]]`;
    }

    backlinkFileName += ".md";

    const backlinkFileContent = `[[${docName}]]\n\nParent: ${docName}\nParent URL: ${docUrl}\nObsidian Parent Doc: [[${docName}]]\nExternal Doc Link: [[${docName}]](${docUrl})`;
    backlinksObsidianFolder.createFile(backlinkFileName, backlinkFileContent);
  });

  Logger.log("Script completed successfully.");
}

/**
 * Converts the content of a Google Document to Markdown format.
 * @param {Document} doc - The Google Document to convert.
 * @return {string} The Markdown content.
 */
function convertDocToMarkdown(doc) {
  let markdown = "";
  const body = doc.getBody();
  const numChildren = body.getNumChildren();

  for (let i = 0; i < numChildren; i++) {
    const child = body.getChild(i);
    const childType = child.getType();

    if (childType === DocumentApp.ElementType.PARAGRAPH) {
      const heading = child.getHeading();
      if (heading === DocumentApp.ParagraphHeading.NORMAL) {
        markdown += child.getText() + "\n\n";
      } else {
        const headingLevel = getHeadingLevelFromEnum(heading);
        const hashes = "#".repeat(headingLevel);
        markdown += `${hashes} ${child.getText()}\n\n`;
      }
    } else if (childType === DocumentApp.ElementType.LIST_ITEM) {
      const listItem = child.asListItem();
      const nestingLevel = listItem.getNestingLevel();
      const glyphType = listItem.getGlyphType();
      const prefix = glyphType === DocumentApp.GlyphType.BULLET ? "- " : `${nestingLevel + 1}. `;
      markdown += "  ".repeat(nestingLevel) + prefix + listItem.getText() + "\n";
    } else if (childType === DocumentApp.ElementType.TEXT) {
      const text = child.asText();
      const textContent = text.getText();
      let currentLink = null;
      let markdownText = "";

      for (let j = 0; j < textContent.length; j++) {
        const linkUrl = text.getLinkUrl(j);

        if (linkUrl) {
          if (!currentLink) {
            currentLink = linkUrl;
          }
        } else {
          if (currentLink) {
            markdownText += `[${doc.getName()}](${currentLink})`;
            currentLink = null;
          }
          markdownText += textContent[j];
        }
      }

      if (currentLink) {
        markdownText += `[${doc.getName()}](${currentLink})`;
      }

      markdown += markdownText;
    } else {
      markdown += convertDocToMarkdown(child.copy());
    }
  }

  return markdown;
}

/**
 * Maps the heading enum to a Markdown heading level.
 * @param {DocumentApp.ParagraphHeading} headingEnum - The heading enum value.
 * @return {number} The Markdown heading level.
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
 * Extracts all links from a Google Document.
 * @param {Document} doc - The Google Document to extract links from.
 * @return {string[]} An array of links.
 */
function extractLinksFromDoc(doc) {
  const body = doc.getBody();
  return extractLinksFromElement(body);
}

/**
 * Recursively extracts links from a document element.
 * @param {Element} element - The document element to extract links from.
 * @return {string[]} An array of links.
 */
function extractLinksFromElement(element) {
  let allLinks = [];
  const numChildren = element.getNumChildren();

  for (let i = 0; i < numChildren; i++) {
    const child = element.getChild(i);
    const childType = child.getType();

    if (childType === DocumentApp.ElementType.TEXT) {
      const text = child.asText();
      const textContent = text.getText();
      let currentLink = null;

      for (let j = 0; j < textContent.length; j++) {
        const linkUrl = text.getLinkUrl(j);

        if (linkUrl) {
          if (!currentLink) {
            currentLink = linkUrl;
          }
        } else {
          if (currentLink) {
            allLinks.push(currentLink);
            currentLink = null;
          }
        }
      }

      // Handle the case where the link is at the very end of the text
      if (currentLink) {
        allLinks.push(currentLink);
      }
    } else if (childType === DocumentApp.ElementType.IMAGE) {
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
 * Normalizes a URL by removing hidden characters and trimming whitespace.
 * @param {string} url - The URL to normalize.
 * @return {string} The normalized URL.
 */
function normalizeUrl(url) {
  // Remove potential hidden characters and trim whitespace
  return url.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

/**
 * Gets or creates the "Doc Backlinks" spreadsheet.
 * @return {string} The ID of the "Doc Backlinks" spreadsheet.
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
 * Extracts the file name from a URL.
 * @param {string} url - The URL to extract the file name from.
 * @return {string} The file name.
 */
function getFileNameFromUrl(url) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

/**
 * Determines the file type from a URL.
 * @param {string} url - The URL to determine the file type from.
 * @return {string} The file type ("docs", "sheets", "slides", or "other").
 */
function getFileTypeFromUrl(url) {
  const match = url.match(/\/(d|spreadsheets|presentation)\//);
  if (match) {
    return match[1];
  } else {
    return "other";
  }
}
