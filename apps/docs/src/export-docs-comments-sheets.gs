/ * *
 * Script Name: export- docs- comments- sheets
 *
 * Script Summary:
 * Exports spreadsheet data for automated workflow processing.
 *
 * Script Purpose:
 * - Extract docs comments sheets data from Google services
 * - Convert data to portable formats
 * - Generate reports and summaries
 *
 * Script Steps:
 * 1. Initialize spreadsheet connection
 * 2. Access Drive file system
 * 3. Fetch source data
 * 4. Validate input data
 * 5. Process and transform data
 * 6. Format output for presentation
 * 7. Write results to destination
 *
 * Script Functions:
 * - exportComments(): Exports comments to external format
 * - processComment(): Processes and transforms comment
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DriveApp: For file and folder management
 * - Logger: For logging and debugging
 * - SpreadsheetApp: For spreadsheet operations
 * - Utilities: For utility functions and encoding
 * /

/ / Main Functions

/ * *

 * Exports comments to external format
 * @returns {Array} Array of results

 * /

/ * *

 * Exports comments to external format
 * @returns {Array} Array of results

 * /

function exportComments() {
  try { / / Get document ID from user input
    let docId = Browser.inputBox("Enter the document ID:"); / / Get folder ID from user input;
    let folderId = Browser.inputBox("Enter the folder ID to save the spreadsheet:"); / / Get comments from the document (fetch only the IDs initially);
    let comments = Drive.Comments.list(docId, { fields: 'items(id)' }); / / Prepare data for the spreadsheet;
    let sheetData = [];
    if (comments.items && comments.items.length > 0) {
      for (let i = 0; i < comments.items.length; i + + ) {
        let commentId = comments.items[i].id; / / Get the full comment object using get();
        let comment = Drive.Comments.get(docId, commentId); / / Process the original comment;
        sheetData.push(processComment(comment)); / / Fetch and process replies for this comment;
        if (comment.replies && comment.replies.length > 0) {
          for (let j = 0; j < comment.replies.length; j + + ) {
            let replyId = comment.replies[j].id; / / Get the full reply object using get();
            let reply = Drive.Replies.get(docId, commentId, replyId);
            sheetData.push(processComment(reply));
          }
        }
      }
    } / / Create a new spreadsheet in the specified folder
    let today = new Date();
    let spreadsheetName = "Comment Export - " + Utilities.formatDate(today, "GMT", "yyyy - MM - dd") + ".xlsx";
    let newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
    DriveApp.getFileById(newSpreadsheet.getId()).moveTo(DriveApp.getFolderById(folderId)); / / Get the first sheet in the new spreadsheet;
    let sheet = newSpreadsheet.getSheets()[0]; / / Set headers;
    sheet.appendRow(["Created Date", "Comment Author", "Status", "Elapsed Time", "Word Count", "Character Count", "Comment"]); / / Append data to the sheet;
    sheet.getRange(2, 1, sheetData.length, sheetData[0].length).setValues(sheetData);

  } catch (error) {
    Logger.log("Error in exportComments: " + error);
    Browser.msgBox("An error occurred. Please check the execution logs for details.");
  }
}

/ * *

 * Processes and transforms comment
 * @param
 * @param {any} comment - The comment parameter
 * @returns {Array} Array of results

 * /

/ * *

 * Processes and transforms comment
 * @param
 * @param {any} comment - The comment parameter
 * @returns {Array} Array of results

 * /

function processComment(comment) {
  let createdDate = new Date(comment.createdDate); / / We can't calculate elapsed time here anymore since we fetch replies separately;
  return [;
    Utilities.formatDate(createdDate, "GMT", "yyyy - MM - dd"),
    comment.author.displayName,
    comment.status,
    "", / / Placeholder for elapsed time, we'll calculate it later
    comment.content.split( / \s +  / ).length,
    comment.content.length,
    comment.content
  ];
}