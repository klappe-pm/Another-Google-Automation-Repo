/**
 * Script Name: markdown-process-yaml
 * 
 * Script Summary:
 * Processs markdown content for documentation and note-taking workflows.
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
 * 4. Format output for presentation
 * 
 * Script Functions:
 * - applyMarkdownFormatting(): Formats apply markdownting for display
 * - processFolder(): Processes and transforms folder
 * - updateYamlCategory(): Updates existing yaml category
 * 
 * Script Helper Functions:
 * - formatMarkdownFile(): Formats markdown file for display
 * - formatMarkdownFiles(): Formats markdown files for display
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 */

// Main Functions

/**

 * Formats apply markdownting for display
 * @param
 * @param {string} content - The content to process
 * @returns {any} The result

 */

function applyMarkdownFormatting(content) {
  let formattedContent = content.replace(/\n{3,}/g, '\n\n');

  formattedContent = formattedContent.replace(/([^`]```[^`]+```)/g, '\n\n$1\n\n');
  formattedContent = formattedContent.replace(/^\n+```[^`]+`\n+/g, '`[^`]+```\n');
  formattedContent = formattedContent.replace(/\n+```[^`]+`\n+$/g, '\n`[^`]+```');

  formattedContent = formattedContent.replace(/\n+$/g, '\n');

  const lines = formattedContent.split('\n');
  const formattedLines = [];
  let inParagraph = false;
  for (const line of lines) {
    if (line.trim() === '') {
      if (inParagraph) {
        formattedLines.push('');
        inParagraph = false;
      }
    } else if (!line.startsWith('- ') && !line.startsWith('* ') && 
               !line.startsWith('[ ] ') && !line.startsWith('[x] ')) {
      if (!inParagraph) {
        formattedLines.push('');
      }
      formattedLines.push(line);
      inParagraph = true;
    } else {
      formattedLines.push(line);
      inParagraph = false; 
    }
  }
  formattedContent = formattedLines.join('\n');

  formattedContent = formattedContent.replace(/(\n\s*)- /g, '\n- ');
  formattedContent = formattedContent.replace(/(\n\s*)\*/g, '\n* ');
  formattedContent = formattedContent.replace(/(\n\s*)\[[ x]\] /g, '\n[ x] ');

  formattedContent = formattedContent.replace(/ +\n/g, '\n');

  formattedContent = formattedContent.replace(/^\n+/, '');

  return formattedContent;
}

/**

 * Processes and transforms folder
 * @param
 * @param {Folder} folder - The folder parameter
 * @returns {any} The result

 */

function processFolder(folder) { 
  const filesIterator = folder.getFiles();
  while (filesIterator.hasNext()) {
    const file = filesIterator.next();
    if (file.getName().endsWith('.md')) {
      Logger.log(`Processing file: ${file.getName()}`); 
      const originalContent = file.getBlob().getDataAsString();
      const formattedContent = applyMarkdownFormatting(originalContent);

      if (originalContent !== formattedContent) {
        Logger.log(`Spacing changes made to ${file.getName()}`);
      }

      const updatedContent = updateYamlCategory(formattedContent, folder.getName());
      file.setContent(updatedContent); 
    }
  }

  const subfoldersIterator = folder.getFolders();
  while (subfoldersIterator.hasNext()) {
    const subfolder = subfoldersIterator.next();
    processFolder(subfolder); 
  }
}

/**

 * Updates existing yaml category
 * @param
 * @param {string} content - The content to process
 * @param {string} folderName - The folderName to update
 * @returns {any} The result

 */

function updateYamlCategory(content, folderName) {
  const yamlRegex = /^---\n([\s\S]*?)---\n/;
  const yamlMatch = content.match(yamlRegex);

  if (yamlMatch) {
    let yamlContent = yamlMatch[1];
    const categoryRegex = /^category:\s*.*$/m;
    if (categoryRegex.test(yamlContent)) {
      yamlContent = yamlContent.replace(categoryRegex, `category: ${folderName}`);
      Logger.log(`Updated YAML category to: ${folderName}`); 
    } else {
      yamlContent += `\ncategory: ${folderName}`;
      Logger.log(`Added YAML category: ${folderName}`); 
    }
    return content.replace(yamlRegex, `---\n${yamlContent}---\n`);
  } else {
    Logger.log(`No YAML frontmatter found. Skipping category update.`);
    return content;
  }
}

// Helper Functions

/**

 * Formats markdown file for display
 * @param
 * @param {File} file - The file parameter
 * @param {string} folderName - The folderName parameter
 * @returns {any} The result

 */

function formatMarkdownFile(file, folderName) {
  const content = file.getBlob().getDataAsString();
  const formattedContent = applyMarkdownFormatting(content);
  const updatedContent = updateYamlCategory(formattedContent, folderName);
  file.setContent(updatedContent);
}

/**

 * Formats markdown files for display
 * @returns {any} The result

 */

function formatMarkdownFiles() {
  const folderId = '';
  const folder = DriveApp.getFolderById(folderId);

  Logger.log('Markdown formatting process started.');

  processFolder(folder);

  const subfoldersIterator = folder.getFolders();
  while (subfoldersIterator.hasNext()) {
    const subfolder = subfoldersIterator.next();
    Logger.log(`Processing subfolder: ${subfolder.getName()}`);
    processFolder(subfolder);
  }

  Logger.log('Markdown formatting completed successfully.');
}