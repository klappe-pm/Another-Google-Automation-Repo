/**
 * Script Name: export-docs-file-list-to-sheets
 * 
 * Script Summary:
 * Processes spreadsheet data for automated workflow processing.
 * 
 * Script Purpose:
 * - Extract docs file list to sheets data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 * 
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Process and transform data
 * 
 * Script Functions:
 * - listFilesInFolder(): Checks boolean condition
 * 
 * Script Dependencies:
 * - None (standalone script)
 * 
 * Google Services:
 * - DocumentApp: For document manipulation
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 */

// Main Functions

/**

 * Checks boolean condition

 */

/**

 * Checks boolean condition

 */

function listFilesInFolder() { //  --- Configuration --- const folderId = 'folder id here'; // ID of the Drive folder;
  const spreadsheetId = 'sheet id here'; // ID of the Google Sheet;
  const sheetName = 'mendel - docs'; // Name of the tab in the Google Sheet //  --- Get the folder --- const folder = DriveApp.getFolderById(folderId); //  --- Get the files --- const files = folder.getFiles(); //  --- Prepare the output array --- const output = [];
  output.push(['File Name', 'File Name with Brackets', 'Link', 'URL', 'Word Count', 'Character Count']); // Add headers //  --- Iterate through the files --- while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    const fileUrl = file.getUrl(); //  --- Get the document content --- let wordCount = 0;
    let characterCount = 0;
    if (file.getMimeType() === MimeType.GOOGLE_DOCS) {
      try {
        const doc = DocumentApp.openById(file.getId());
        const body = doc.getBody();
        wordCount = body.getText().split( / \s +  / ).length;
        characterCount = body.getText().length;
      } catch (e) { // Handle errors opening the document (e.g., if it's not a Google Doc);
        Logger.log(`Error processing file ${fileName}: ${e.message}`);
      }
    }

    output.push([fileName, `[[${fileName}]]`, `=HYPERLINK("${fileUrl}", "${fileName}")`, fileUrl, wordCount, characterCount]);
  } //  --- Write to the sheet --- const ss = SpreadsheetApp.openById(spreadsheetId);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clearContents();
  sheet.getRange(1, 1, output.length, output[0].length).setValues(output);
}