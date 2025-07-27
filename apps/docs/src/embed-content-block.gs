/**
 * Script Name: embed- content- block
 *
 * Script Summary:
 * Manages data for automated workflow processing.
 *
 * Script Purpose:
 *
 * Script Steps:
 * 1. Fetch source data
 * 2. Execute main operation
 * 3. Handle errors and edge cases
 * 4. Log completion status
 *
 * Script Functions:
 * - updateDocument(): Updates existing document
 *
 * Script Dependencies:
 * - None (standalone script)
 *
 * Google Services:
 * - DocumentApp: For document manipulation
 * /

/ / Main Functions

/**

 * Updates existing document

 * /

/**

 * Updates existing document

 * /

function updateDocument() { / / Source document details;
let sourceDocId = 'YOUR_SOURCE_DOCUMENT_ID'; / / Replace with your source document ID;
let sourceHeader = 'YOUR_HEADER_TEXT'; / / Replace with your header text / / Destination document details;
let destDocId = 'YOUR_DESTINATION_DOCUMENT_ID'; / / Replace with your destination document ID;
let placeholder = 'PLACEHOLDER_TEXT'; / / Replace with your placeholder text / / Open source document;
let sourceDoc = DocumentApp.openById(sourceDocId);
let sourceBody = sourceDoc.getBody(); / / Find the header element;
let headerElement = sourceBody.findText(sourceHeader); / / Extract content after the header;
let contentToEmbed = '';
if (headerElement) {
let headerIndex = headerElement.getElement().asRenderedString().indexOf(sourceHeader);
let contentStartIndex = headerIndex + headerElement.getElement().asRenderedString().length;
contentToEmbed = sourceBody.getText().substring(contentStartIndex); / / Find the next header of the same level or end of document;
let nextHeader = sourceBody.findText(sourceHeader, headerElement);
if (nextHeader) {
let nextHeaderIndex = nextHeader.getElement().asRenderedString().indexOf(sourceHeader);
contentToEmbed = contentToEmbed.substring(0, nextHeaderIndex - contentStartIndex);
}
} / / Open destination document
let destDoc = DocumentApp.openById(destDocId);
let destBody = destDoc.getBody(); / / Replace placeholder with extracted content;
destBody.replaceText(placeholder, contentToEmbed);
}