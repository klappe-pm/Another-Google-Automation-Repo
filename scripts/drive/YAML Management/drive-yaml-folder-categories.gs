function addYamlFrontmatter() {
  const folderId = '';
  const folder = DriveApp.getFolderById(folderId);

  const filesIterator = folder.getFiles();

  while (filesIterator.hasNext()) {
    const file = filesIterator.next();

    if    (file.getName().endsWith('.md')) {
      try {
        console.log(`Processing file: ${file.getName()}`);

        const dateCreated = file.getDateCreated().toISOString().split('T')[0];
        const dateModified = file.getLastUpdated().toISOString().split('T')[0];
        const person = file.getName().replace('.md', '');

        // Extract filename as subCategory
        const subCategory = file.getName().replace('.md', ''); 

        const yaml = `---
category: diagrams
dateCreated: ${dateCreated}
dateModified: ${dateModified}
diagramType: ${person}
subCategory: ${subCategory} // Add subCategory
alias: 
tags: 
---

`;

        const content = file.getBlob().getDataAsString();
        const newContent = yaml + content;

        file.setContent(newContent);
        console.log(`YAML added to ${file.getName()}`);
      } catch (error) {
        console.error(`Error processing ${file.getName()}: ${error}`);
      }
    }
  }
}
