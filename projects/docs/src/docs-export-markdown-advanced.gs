/**
 * Title: Advanced Google Docs to Markdown Exporter
 * Service: Google Docs
 * Purpose: Batch export Google Docs to Markdown with YAML frontmatter and image handling
 * Created: 2024-01-15
 * Updated: 2024-01-15
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Automate bulk export of Google Docs from a folder to markdown format
- Description: Converts document content to markdown, extracts metadata, adds YAML frontmatter, handles images and various document elements
- Problem Solved: Manual document conversion and metadata extraction
- Successful Execution: All Google Docs in specified folder converted to markdown files with proper formatting and metadata
- Key Features:
  1. Batch processing of Google Docs in a specified folder
  2. Conversion of Google Docs content to markdown format
  3. Extraction and inclusion of document metadata as YAML front matter
  4. Handling of various document elements (headings, lists, images, code blocks, links)
  5. Creation of a separate folder for exported markdown files
  6. Image extraction and saving with appropriate linking in markdown
*/

/**
 * Main function to export all Google Docs in a folder to markdown.
 */
function exportAllDocsInFolderToMarkdown() {
  var sourceFolderId = 'YOUR_SOURCE_FOLDER_ID'; // Replace with your source folder ID
  var targetFolderName = 'MTDR Map';

  var sourceFolder = DriveApp.getFolderById(sourceFolderId);
  var targetFolder = getOrCreateFolder(targetFolderName);

  var files = sourceFolder.getFilesByType(MimeType.GOOGLE_DOCS);

  while (files.hasNext()) {
    var file = files.next();
    var doc = DocumentApp.openById(file.getId());
    var body = doc.getBody();
    var metadata = getDocMetadata(doc, file);

    // Initialize markdown content
    var markdownContent = convertBodyToMarkdown(body);
    markdownContent = addYamlFrontmatter(metadata, markdownContent);

    // Save markdown to a file
    saveMarkdownToFile(markdownContent, file.getName(), targetFolder);
  }
  Logger.log("Script completed successfully.");
}

/**
 * Extracts metadata from a Google Doc.
 * @param {Document} doc - The Google Document to extract metadata from.
 * @param {File} file - The Google Drive file object.
 * @return {Object} The extracted metadata.
 */
function getDocMetadata(doc, file) {
  var owner = DriveApp.getFileById(doc.getId()).getOwner().getName();
  var createdDate = file.getDateCreated().toISOString().split('T')[0];
  var lastUpdatedDate = file.getLastUpdated().toISOString().split('T')[0];
  var wordCount = doc.getBody().getText().split(/\s+/).length;
  var title = file.getName();

  return {
    category: 'design-docs',
    dateCreated: createdDate,
    dateRevised: lastUpdatedDate,
    noteTitle: title,
    docAuthor: owner,
    wordCount: wordCount,
    aliases: '',
    tags: ''
  };
}

/**
 * Adds YAML front matter to the markdown content.
 * @param {Object} metadata - The metadata to include in the YAML front matter.
 * @param {string} content - The markdown content.
 * @return {string} The markdown content with YAML front matter.
 */
function addYamlFrontmatter(metadata, content) {
  var yaml = '---\n';
  yaml += 'category: ' + metadata.category + '\n';
  yaml += 'dateCreated: ' + metadata.dateCreated + '\n';
  yaml += 'dateRevised: ' + metadata.dateRevised + '\n';
  yaml += 'noteTitle: ' + metadata.noteTitle + '\n';
  yaml += 'docAuthor: ' + metadata.docAuthor + '\n';
  yaml += 'wordCount: ' + metadata.wordCount + '\n';
  yaml += 'aliases: ' + metadata.aliases + '\n';
  yaml += 'tags: ' + metadata.tags + '\n';
  yaml += '---\n\n';

  return yaml + content;
}

/**
 * Converts the body of a Google Doc to markdown.
 * @param {Body} body - The body of the Google Document.
 * @return {string} The markdown content.
 */
function convertBodyToMarkdown(body) {
  var markdown = '';
  var numChildren = body.getNumChildren();

  for (var i = 0; i < numChildren; i++) {
    var element = body.getChild(i);
    markdown += processElement(element);
  }

  // Ensure no more than one blank line between paragraphs
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  return markdown;
}

/**
 * Processes individual elements of a Google Doc.
 * @param {Element} element - The document element to process.
 * @return {string} The markdown representation of the element.
 */
function processElement(element) {
  var markdown = '';

  if (element.getType() == DocumentApp.ElementType.PARAGRAPH) {
    var paragraph = element.asParagraph();
    var heading = paragraph.getHeading();

    switch (heading) {
      case DocumentApp.ParagraphHeading.HEADING1:
        markdown += '\n# ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING2:
        markdown += '\n## ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING3:
        markdown += '\n### ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING4:
        markdown += '\n#### ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING5:
        markdown += '\n##### ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING6:
        markdown += '\n###### ' + paragraph.getText() + '\n';
        break;
      default:
        markdown += paragraph.getText() + '\n';
    }
  } else if (element.getType() == DocumentApp.ElementType.TEXT) {
    markdown += element.asText().getText();
  } else if (element.getType() == DocumentApp.ElementType.LIST_ITEM) {
    var listItem = element.asListItem();
    var nestingLevel = listItem.getNestingLevel();
    var bullet = listItem.getGlyphType() == DocumentApp.GlyphType.BULLET ? '*' : '1.';

    markdown += Array(nestingLevel + 1).join('    ') + bullet + ' ' + listItem.getText() + '\n';
  } else if (element.getType() == DocumentApp.ElementType.INLINE_IMAGE) {
    var inlineImage = element.asInlineImage();
    var blob = inlineImage.getBlob();
    var contentType = blob.getContentType();
    var extension = contentType.split('/')[1];
    var fileName = 'image_' + (new Date()).getTime() + '.' + extension;

    var imageUrl = saveImage(blob, fileName);
    markdown += '![](' + imageUrl + ')\n';
  } else if (element.getType() == DocumentApp.ElementType.CODE) {
    var code = element.asText().getText();
    markdown += '```\n' + code + '\n```\n';
  } else if (element.getType() == DocumentApp.ElementType.LINK) {
    var link = element.asText();
    var url = link.getLinkUrl();
    var text = link.getText();

    markdown += '[' + text + '](' + url + ')\n';
  }

  return markdown;
}

/**
 * Saves markdown content to a file.
 * @param {string} markdownContent - The markdown content to save.
 * @param {string} fileName - The name of the file.
 * @param {Folder} folder - The folder to save the file in.
 */
function saveMarkdownToFile(markdownContent, fileName, folder) {
  var file = folder.createFile(fileName + '.md', markdownContent);
  Logger.log('File created: ' + file.getUrl());
}

/**
 * Gets or creates a folder in Google Drive.
 * @param {string} folderName - The name of the folder.
 * @return {Folder} The folder object.
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**
 * Saves an image and returns its URL.
 * @param {Blob} blob - The image blob to save.
 * @param {string} fileName - The name of the image file.
 * @return {string} The URL of the saved image.
 */
function saveImage(blob, fileName) {
  var folder = getOrCreateFolder('MTDR Map');
  var file = folder.createFile(blob.setName(fileName));
  return file.getUrl();
}
