function exportComments() {
  try {
    // Get document ID from user input
    var docId = Browser.inputBox("Enter the document ID:"); 

    // Get folder ID from user input
    var folderId = Browser.inputBox("Enter the folder ID to save the spreadsheet:");

    // Get comments from the document (fetch only the IDs initially)
    var comments = Drive.Comments.list(docId, { fields: 'items(id)' }); 

    // Prepare data for the spreadsheet
    var sheetData = [];
    if (comments.items && comments.items.length > 0) {
      for (var i = 0; i < comments.items.length; i++) {
        var commentId = comments.items[i].id;

        // Get the full comment object using get()
        var comment = Drive.Comments.get(docId, commentId); 

        // Process the original comment
        sheetData.push(processComment(comment));

        // Fetch and process replies for this comment
        if (comment.replies && comment.replies.length > 0) {
          for (var j = 0; j < comment.replies.length; j++) {
            var replyId = comment.replies[j].id;

            // Get the full reply object using get()
            var reply = Drive.Replies.get(docId, commentId, replyId);
            sheetData.push(processComment(reply));
          }
        }
      }
    }

    // Create a new spreadsheet in the specified folder
    var today = new Date();
    var spreadsheetName = "Comment Export - " + Utilities.formatDate(today, "GMT", "yyyy-MM-dd") + ".xlsx";
    var newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
    DriveApp.getFileById(newSpreadsheet.getId()).moveTo(DriveApp.getFolderById(folderId));

    // Get the first sheet in the new spreadsheet
    var sheet = newSpreadsheet.getSheets()[0];

    // Set headers
    sheet.appendRow(["Created Date", "Comment Author", "Status", "Elapsed Time", "Word Count", "Character Count", "Comment"]);

    // Append data to the sheet
    sheet.getRange(2, 1, sheetData.length, sheetData[0].length).setValues(sheetData);

  } catch (error) {
    Logger.log("Error in exportComments: " + error);
    Browser.msgBox("An error occurred. Please check the execution logs for details.");
  }
}

function processComment(comment) {
  var createdDate = new Date(comment.createdDate);
  // We can't calculate elapsed time here anymore since we fetch replies separately
  return [
    Utilities.formatDate(createdDate, "GMT", "yyyy-MM-dd"),
    comment.author.displayName,
    comment.status,
    "", // Placeholder for elapsed time, we'll calculate it later
    comment.content.split(/\s+/).length, 
    comment.content.length,
    comment.content
  ];
}
