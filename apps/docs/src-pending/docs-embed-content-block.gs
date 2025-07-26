/*  
* Purpose: This script automatically updates a Google Doc by replacing a placeholder with content extracted from another Google Doc.  
* Services Used: Google Apps Script (DocumentApp)  
* Key Features:  
    * Extracts content from a source document based on a header.  
    * Dynamically finds the end of the relevant content by looking for the next header or the end of the document.  
    * Replaces a placeholder in a destination document with the extracted content.  
*/  
function updateDocument() {  
// Source document details  
var sourceDocId = 'YOUR_SOURCE_DOCUMENT_ID'; // Replace with your source document ID  
var sourceHeader = 'YOUR_HEADER_TEXT'; // Replace with your header text  
  
// Destination document details  
var destDocId = 'YOUR_DESTINATION_DOCUMENT_ID'; // Replace with your destination document ID  
var placeholder = 'PLACEHOLDER_TEXT'; // Replace with your placeholder text  
  
// Open source document  
var sourceDoc = DocumentApp.openById(sourceDocId);  
var sourceBody = sourceDoc.getBody();  
  
// Find the header element  
var headerElement = sourceBody.findText(sourceHeader);  
  
// Extract content after the header  
var contentToEmbed = '';  
if (headerElement) {  
var headerIndex = headerElement.getElement().asRenderedString().indexOf(sourceHeader);  
var contentStartIndex = headerIndex + headerElement.getElement().asRenderedString().length;  
contentToEmbed = sourceBody.getText().substring(contentStartIndex);  
  
// Find the next header of the same level or end of document  
var nextHeader = sourceBody.findText(sourceHeader, headerElement);  
if (nextHeader) {  
var nextHeaderIndex = nextHeader.getElement().asRenderedString().indexOf(sourceHeader);  
contentToEmbed = contentToEmbed.substring(0, nextHeaderIndex - contentStartIndex);  
}  
}  
  
// Open destination document  
var destDoc = DocumentApp.openById(destDocId);  
var destBody = destDoc.getBody();  
  
// Replace placeholder with extracted content  
destBody.replaceText(placeholder, contentToEmbed);  
}
