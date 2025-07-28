/**
 * Script Name: markdown- export- docs- advanced
 *
 * Script Summary:
 * Exports markdown content for documentation and note- taking workflows.
 *
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note- taking systems
 * - Maintain consistent documentation structure
 * - Handle bulk operations efficiently
 *
 * Script Steps:
 * 1. Access Drive file system
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Format output for presentation
 * 5. Write results to destination
 *
 * Script Functions:
 * - addYamlFrontmatter(): Performs specialized operations
 * - exportAllDocsInFolderToMarkdown(): Exports all docs in folder to markdown to external format
 * - getDocMetadata(): Gets specific doc metadata or configuration
 * - getOrCreateFolder(): Gets specific or create folder or configuration
 * - processElement(): Processes and transforms element
 * - saveMarkdownToFile(): Saves markdown to file persistently
 *
 * Script Helper Functions:
 * - convertBodyToMarkdown(): Converts between formats
 * - saveImage(): Saves image persistently
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DocumentApp: For document manipulation
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * /

1. Batch processing of Google Docs in a specified folder
  2. Conversion of Google Docs content to markdown format
  3. Extraction and inclusion of document metadata as YAML front matter
  4. Handling of various document elements (headings, lists, images, code blocks, links);
  5. Creation of a separate folder for exported markdown files

/ / Main Functions

/**

 * Performs specialized operations
 * @param
 * @param {Object} metadata - The metadata parameter
 * @param {string} content - The content to process
 * @returns {any} The result

 * /

/**

 * Performs specialized operations
 * @param
 * @param {Object} metadata - The metadata parameter
 * @param {string} content - The content to process
 * @returns {any} The result

 * /

function addYamlFrontmatter(metadata, content) {
  let yaml = ' - - - \n';
  yaml + = 'category: ' + metadata.category + '\n';
  yaml + = 'dateCreated: ' + metadata.dateCreated + '\n';
  yaml + = 'dateRevised: ' + metadata.dateRevised + '\n';
  yaml + = 'noteTitle: ' + metadata.noteTitle + '\n';
  yaml + = 'docAuthor: ' + metadata.docAuthor + '\n';
  yaml + = 'wordCount: ' + metadata.wordCount + '\n';
  yaml + = 'aliases: ' + metadata.aliases + '\n';
  yaml + = 'tags: ' + metadata.tags + '\n';
  yaml + = ' - - - \n\n';

  return yaml + content;
}

/**

 * Exports all docs in folder to markdown to external format
 * @returns {any} The result

 * /

/**

 * Exports all docs in folder to markdown to external format
 * @returns {any} The result

 * /

function exportAllDocsInFolderToMarkdown() {
  let sourceFolderId = 'YOUR_SOURCE_FOLDER_ID'; / / Replace with your source folder ID;
  let targetFolderName = 'MTDR Map';

  let sourceFolder = DriveApp.getFolderById(sourceFolderId);
  let targetFolder = getOrCreateFolder(targetFolderName);

  let files = sourceFolder.getFilesByType(MimeType.GOOGLE_DOCS);

  while (files.hasNext()) {
    let file = files.next();
    let doc = DocumentApp.openById(file.getId());
    let body = doc.getBody();
    let metadata = getDocMetadata(doc, file); / / Initialize markdown content;
    let markdownContent = convertBodyToMarkdown(body);
    markdownContent = addYamlFrontmatter(metadata, markdownContent); / / Save markdown to a file;
    saveMarkdownToFile(markdownContent, file.getName(), targetFolder);
  }
  Logger.log("Script completed successfully.");
}

/**

 * Gets specific doc metadata or configuration
 * @param
 * @param {any} doc - The doc to retrieve
 * @param {File} file - The file to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific doc metadata or configuration
 * @param
 * @param {any} doc - The doc to retrieve
 * @param {File} file - The file to retrieve
 * @returns {any} The requested any

 * /

function getDocMetadata(doc, file) {
  let owner = DriveApp.getFileById(doc.getId()).getOwner().getName();
  let createdDate = file.getDateCreated().toISOString().split('T')[0];
  let lastUpdatedDate = file.getLastUpdated().toISOString().split('T')[0];
  let wordCount = doc.getBody().getText().split( / \s +  / ).length;
  let title = file.getName();

  return {
    category: 'design - docs',
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

 * Gets specific or create folder or configuration
 * @param
 * @param {string} folderName - The folderName to retrieve
 * @returns {any} The requested any

 * /

/**

 * Gets specific or create folder or configuration
 * @param
 * @param {string} folderName - The folderName to retrieve
 * @returns {any} The requested any

 * /

function getOrCreateFolder(folderName) {
  let folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**

 * Processes and transforms element
 * @param
 * @param {any} element - The element parameter
 * @returns {any} The result

 * /

/**

 * Processes and transforms element
 * @param
 * @param {any} element - The element parameter
 * @returns {any} The result

 * /

function processElement(element) {
  let markdown = '';

  if (element.getType() = = DocumentApp.ElementType.PARAGRAPH) {
    let paragraph = element.asParagraph();
    let heading = paragraph.getHeading();

    switch (heading) {
      case DocumentApp.ParagraphHeading.HEADING1:
        markdown + = '\n# ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING2:
        markdown + = '\n## ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING3:
        markdown + = '\n### ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING4:
        markdown + = '\n#### ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING5:
        markdown + = '\n##### ' + paragraph.getText() + '\n';
        break;
      case DocumentApp.ParagraphHeading.HEADING6:
        markdown + = '\n###### ' + paragraph.getText() + '\n';
        break;
      default:
        markdown + = paragraph.getText() + '\n';
    }
  } else if (element.getType() = = DocumentApp.ElementType.TEXT) {
    markdown + = element.asText().getText();
  } else if (element.getType() = = DocumentApp.ElementType.LIST_ITEM) {
    let listItem = element.asListItem();
    let nestingLevel = listItem.getNestingLevel();
    let bullet = listItem.getGlyphType() = = DocumentApp.GlyphType.BULLET ? ' * ' : '1.';

    markdown + = Array(nestingLevel + 1).join('    ') + bullet + ' ' + listItem.getText() + '\n';
  } else if (element.getType() = = DocumentApp.ElementType.INLINE_IMAGE) {
    let inlineImage = element.asInlineImage();
    let blob = inlineImage.getBlob();
    let contentType = blob.getContentType();
    let extension = contentType.split(' / ')[1];
    let fileName = 'image_' + (new Date()).getTime() + '.' + extension;

    let imageUrl = saveImage(blob, fileName);
    markdown + = '! [](' + imageUrl + ')\n';
  } else if (element.getType() = = DocumentApp.ElementType.CODE) {
    let code = element.asText().getText();
    markdown + = '```\n' + code + '\n```\n';
  } else if (element.getType() = = DocumentApp.ElementType.LINK) {
    let link = element.asText();
    let url = link.getLinkUrl();
    let text = link.getText();

    markdown + = '[' + text + '](' + url + ')\n';
  }

  return markdown;
}

/**

 * Saves markdown to file persistently
 * @param
 * @param {string} markdownContent - The markdownContent parameter
 * @param {string} fileName - The fileName parameter
 * @param {Folder} folder - The folder parameter
 * @returns {any} The result

 * /

/**

 * Saves markdown to file persistently
 * @param
 * @param {string} markdownContent - The markdownContent parameter
 * @param {string} fileName - The fileName parameter
 * @param {Folder} folder - The folder parameter
 * @returns {any} The result

 * /

function saveMarkdownToFile(markdownContent, fileName, folder) {
  let file = folder.createFile(fileName + '.md', markdownContent);
  Logger.log('File created: ' + file.getUrl());
}

/ / Helper Functions

/**

 * Converts between formats
 * @param
 * @param {string} body - The body content
 * @returns {any} The result

 * /

/**

 * Converts between formats
 * @param
 * @param {string} body - The body content
 * @returns {any} The result

 * /

function convertBodyToMarkdown(body) {
  let markdown = '';
  let numChildren = body.getNumChildren();

  for (let i = 0; i < numChildren; i + + ) {
    let element = body.getChild(i);
    markdown + = processElement(element);
  } / / Ensure no more than one blank line between paragraphs
  markdown = markdown.replace( / \n{3,} / g, '\n\n');
  return markdown;
}

/**

 * Saves image persistently
 * @param
 * @param {any} blob - The blob parameter
 * @param {string} fileName - The fileName parameter
 * @returns {any} The result

 * /

/**

 * Saves image persistently
 * @param
 * @param {any} blob - The blob parameter
 * @param {string} fileName - The fileName parameter
 * @returns {any} The result

 * /

function saveImage(blob, fileName) {
  let folder = getOrCreateFolder('MTDR Map');
  let file = folder.createFile(blob.setName(fileName));
  return file.getUrl();
}