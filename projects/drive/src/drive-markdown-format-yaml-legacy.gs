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

function formatMarkdownFile(file, folderName) {
  const content = file.getBlob().getDataAsString();
  const formattedContent = applyMarkdownFormatting(content);
  const updatedContent = updateYamlCategory(formattedContent, folderName);
  file.setContent(updatedContent);
}

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
  formattedContent = formattedContent.replace(/(\n\s*)\* /g, '\n* ');
  formattedContent = formattedContent.replace(/(\n\s*)\[[ x]\] /g, '\n[ x] ');

  formattedContent = formattedContent.replace(/ +\n/g, '\n');

  formattedContent = formattedContent.replace(/^\n+/, '');

  return formattedContent;
}

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
