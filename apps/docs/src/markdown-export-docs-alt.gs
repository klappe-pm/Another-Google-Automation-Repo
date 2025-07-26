/**
 * Script Name: markdown-export-docs-alt
 * 
 * Script Summary:
 * Exports markdown content for documentation and note-taking workflows.
 * 
 * Script Purpose:
 * - Generate markdown documentation
 * - Format content for note-taking systems
 * - Maintain consistent documentation structure
 * 
 * Script Steps:
 * 1. Access Drive file system
 * 2. Fetch source data
 * 3. Process and transform data
 * 4. Write results to destination
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
 */

1. Open Google Apps Script editor (script.google.com);
2. Create a new project or open existing one
3. Copy this script into the editor
4. Ensure proper Drive API permissions are granted
5. Run the script and authorize required permissions
6. Test the script with sample data

// Main Functions

/**

 * Performs specialized operations
 * @param
 * @param {Object} metadata - The metadata parameter
 * @param {string} content - The content to process
 * @returns {any} The result

 */

/**

 * Performs specialized operations
 * @param
 * @param {Object} metadata - The metadata parameter
 * @param {string} content - The content to process
 * @returns {any} The result

 */

function addYamlFrontmatter(metadata, content) {
    var yaml = ' --- \n';
    yaml += 'category: ' + metadata.category + '\n';
    yaml += 'dateCreated: ' + metadata.dateCreated + '\n';
    yaml += 'dateRevised: ' + metadata.dateRevised + '\n';
    yaml += 'noteTitle: ' + metadata.noteTitle + '\n';
    yaml += 'docAuthor: ' + metadata.docAuthor + '\n';
    yaml += 'wordCount: ' + metadata.wordCount + '\n';
    yaml += 'aliases: ' + metadata.aliases + '\n';
    yaml += 'tags: ' + metadata.tags + '\n';
    yaml += ' --- \n\n';

    return yaml + content;
  }

/**

 * Exports all docs in folder to markdown to external format
 * @returns {any} The result

 */

/**

 * Exports all docs in folder to markdown to external format
 * @returns {any} The result

 */

function exportAllDocsInFolderToMarkdown() {
  var sourceFolderId = 'YOUR_SOURCE_FOLDER_ID'; // Replace with your source folder ID;
  var targetFolderName = 'MTDR Map';

  var sourceFolder = DriveApp.getFolderById(sourceFolderId);
  var targetFolder = getOrCreateFolder(targetFolderName);

  var files = sourceFolder.getFilesByType(MimeType.GOOGLE_DOCS);

  while (files.hasNext()) {
    var file = files.next();
    var doc = DocumentApp.openById(file.getId());
    var body = doc.getBody();
    var metadata = getDocMetadata(doc, file); // Initialize markdown content;
    var markdownContent = convertBodyToMarkdown(body);
    markdownContent = addYamlFrontmatter(metadata, markdownContent); // Save markdown to a file;
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

 */

/**

 * Gets specific doc metadata or configuration
 * @param
 * @param {any} doc - The doc to retrieve
 * @param {File} file - The file to retrieve
 * @returns {any} The requested any

 */

function getDocMetadata(doc, file) {
  var owner = DriveApp.getFileById(doc.getId()).getOwner().getName();
  var createdDate = file.getDateCreated().toISOString().split('T')[0];
  var lastUpdatedDate = file.getLastUpdated().toISOString().split('T')[0];
  var wordCount = doc.getBody().getText().split( / \s +  / ).length;
  var title = file.getName();

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

 */

/**

 * Gets specific or create folder or configuration
 * @param
 * @param {string} folderName - The folderName to retrieve
 * @returns {any} The requested any

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

 * Processes and transforms element
 * @param
 * @param {any} element - The element parameter
 * @returns {any} The result

 */

/**

 * Processes and transforms element
 * @param
 * @param {any} element - The element parameter
 * @returns {any} The result

 */

function processElement(element) {
    var markdown = '';

    if (element.getType() = = DocumentApp.ElementType.PARAGRAPH) {
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
    } else if (element.getType() = = DocumentApp.ElementType.TEXT) {
      markdown += element.asText().getText();
    } else if (element.getType() = = DocumentApp.ElementType.LIST_ITEM) {
      var listItem = element.asListItem();
      var nestingLevel = listItem.getNestingLevel();
      var bullet = listItem.getGlyphType() = = DocumentApp.GlyphType.BULLET ? ' * ' : '1.';

      markdown += Array(nestingLevel + 1).join('    ') + bullet + ' ' + listItem.getText() + '\n';
    } else if (element.getType() = = DocumentApp.ElementType.INLINE_IMAGE) {
      var inlineImage = element.asInlineImage();
      var blob = inlineImage.getBlob();
      var contentType = blob.getContentType();
      var extension = contentType.split(' / ')[1];
      var fileName = 'image_' + (new Date()).getTime() + '.' + extension;

      var imageUrl = saveImage(blob, fileName);
      markdown += ' ! [](' + imageUrl + ')\n';
    } else if (element.getType() = = DocumentApp.ElementType.CODE) {
      var code = element.asText().getText();
      markdown += '```\n' + code + '\n```\n';
    } else if (element.getType() = = DocumentApp.ElementType.LINK) {
      var link = element.asText();
      var url = link.getLinkUrl();
      var text = link.getText();

      markdown += '[' + text + '](' + url + ')\n';
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

 */

/**

 * Saves markdown to file persistently
 * @param
 * @param {string} markdownContent - The markdownContent parameter
 * @param {string} fileName - The fileName parameter
 * @param {Folder} folder - The folder parameter
 * @returns {any} The result

 */

function saveMarkdownToFile(markdownContent, fileName, folder) {
    var file = folder.createFile(fileName + '.md', markdownContent);
    Logger.log('File created: ' + file.getUrl());
  }

// Helper Functions

/**

 * Converts between formats
 * @param
 * @param {string} body - The body content
 * @returns {any} The result

 */

/**

 * Converts between formats
 * @param
 * @param {string} body - The body content
 * @returns {any} The result

 */

function convertBodyToMarkdown(body) {
    var markdown = '';
    var numChildren = body.getNumChildren();

    for (var i = 0; i < numChildren; i ++ ) {
      var element = body.getChild(i);
      markdown += processElement(element);
    } // Ensure no more than one blank line between paragraphs
    markdown = markdown.replace( / \n{3,} / g, '\n\n');
    return markdown;
  }

/**

 * Saves image persistently
 * @param
 * @param {any} blob - The blob parameter
 * @param {string} fileName - The fileName parameter
 * @returns {any} The result

 */

/**

 * Saves image persistently
 * @param
 * @param {any} blob - The blob parameter
 * @param {string} fileName - The fileName parameter
 * @returns {any} The result

 */

function saveImage(blob, fileName) {
    var folder = getOrCreateFolder('MTDR Map');
    var file = folder.createFile(blob.setName(fileName));
    return file.getUrl();
  }