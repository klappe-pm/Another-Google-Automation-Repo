/**
 * Script Name: add- yaml- frontmatter
 *
 * Script Summary:
 * Creates files for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Access Drive file system
 * 2. Fetch source data
 * 3. Format output for presentation
 *
 * Script Functions:
 * - addYamlToFile(): Manages files and folders
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * /

/ / Main Functions

/**

 * Manages files and folders
 * @param
 * @param {File} file - The file parameter
 * @param {string|any} yamlValues - The yamlValues parameter

 * /

function addYamlToFile(file, yamlValues) {
  debug(`Starting addYamlToFile function for file: ${file.getName()}`);
  try {
    const content = file.getBlob().getDataAsString();
    const createdDate = formatDate(file.getDateCreated());

    const yaml = `- - -
category: ${yamlValues.category || ''}
sub- category: ${yamlValues.subcategory || ''}
dateCreated: ${createdDate}
aliases:
tags:
- - -

`;

    const updatedContent = yaml + content;

    / / Debugging: Print the updated content to the logs
    console.log("Updated content for file " + file.getName() + ":\n" + updatedContent);

    / / Attempt to update the file content using the provided snippet approach
    try {
      file.setContent(updatedContent);
      debug(`Updated content for file: ${file.getName()}`);
    } catch (setContentError) {
      debug(`Error updating content using setContent: ${setContentError.message}`);

      / / If setContent fails, try the alternative approach (if available)
      try {
        const fileId = file.getId();
        const fileToUpdate = DriveApp.getFileById(fileId);
        fileToUpdate.setContent(updatedContent);
        debug(`Updated content for file (alternative approach): ${file.getName()}`);
      } catch (alternativeUpdateError) {
        debug(`Error updating content using alternative approach: ${alternativeUpdateError.message}`);
        / / If both approaches fail, throw an error with combined messages
        throw new Error(`Failed to add YAML to file ${file.getName()}: ${setContentError.message}, ${alternativeUpdateError.message}`);
      }
    }

  } catch (e) {
    debug(`Error in addYamlToFile for ${file.getName()}: ${e.message}`);
    throw new Error(`Failed to add YAML to file ${file.getName()}: ${e.message}`);
  }
}