/**
 * Markdown File Mover and Metadata Updater
 *
 * This script moves Markdown files from the root of Google Drive to a specified folder and updates their YAML frontmatter with metadata.
 * It processes all Markdown files, checks for existing YAML frontmatter, and updates or adds new metadata as needed.
 */

/**
 * Main function to move Markdown files and update their YAML frontmatter.
 */
function moveMarkdownFiles() {
  const folderIdToMoveInto = ""; // Target folder ID (add the target folder ID here)

  const drive = DriveApp;
  const filesIterator = drive.getFilesByType("text/markdown"); // Get all markdown files

  while (filesIterator.hasNext()) {
    const file = filesIterator.next(); // This might be a Blob, not a File
    const fileName = file.getName(); // Assuming Blob has a getName method

    try {
      // Check if it's a Blob, then get the File object
      if (file.hasOwnProperty('getAs')) { // Blobs have getAs method
        file = file.getAs(MimeType.GOOGLE_DOCS); // Convert to File
      }

      // Now you can safely call getType
      if (file.getType() === DriveApp.FileType.FILE && fileName.includes("@google.com")) {
        const targetFolder = drive.getFolderById(folderIdToMoveInto);
        file.moveTo(targetFolder); // Move the file

        // Update YAML frontmatter (handle existing metadata)
        updateYamlFrontmatterToFile(file);

        console.log(`Moved file: ${fileName} to folder and updated YAML frontmatter`);
      }
    } catch (error) {
      console.error(`Error processing file ${fileName}: ${error}`);
    }
  }
  console.log("Script completed successfully.");
}

/**
 * Enhanced function to handle existing metadata and update YAML frontmatter.
 * @param {File} file - The Google Drive file to process.
 */
function updateYamlFrontmatterToFile(file) {
  const fileName = file.getName();
  let fileContent = file.getBlob().getDataAsString();

  try {
    // Get file creation and modification dates
    const fileMetadata = file.getMetadata();
    const dateCreated = fileMetadata.createdDate;
    const dateModified = fileMetadata.lastModifiedDate;

    // Create new YAML frontmatter
    const newYamlFrontmatter = `---
category: people
dateCreated: ${dateCreated}
dateModified: ${dateModified}
person: ${fileName}
alias:
tags:
---

`;

    // Check for existing YAML frontmatter
    const yamlRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = fileContent.match(yamlRegex);

    if (match) {
      // Replace existing YAML
      fileContent = fileContent.replace(yamlRegex, newYamlFrontmatter);
      console.log(`Replaced existing YAML frontmatter in file: ${fileName}`);
    } else {
      // Add new YAML to the beginning
      fileContent = newYamlFrontmatter + fileContent;
      console.log(`Added new YAML frontmatter to file: ${fileName}`);
    }

    file.setContent(fileContent);

  } catch (error) {
    console.error(`Error processing file ${fileName}: ${error}`);
  }
}
