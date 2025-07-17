/**
 * Title: Batch Google Docs Formatter
 * Service: Google Docs
 * Purpose: Apply consistent formatting styles across multiple Google Docs in a folder
 * Created: 2024-01-15
 * Updated: 2024-01-15
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Batch apply consistent typography and formatting styles across multiple Google Documents
- Description: Scans folder for Google Docs, applies predefined font families, sizes, and styling to titles and headings
- Problem Solved: Manual formatting of multiple documents to maintain visual consistency
- Successful Execution: All Google Docs in specified folder updated with consistent formatting styles
- Key Features:
  - Batch processes all Google Docs in a specified folder
  - Applies consistent font family (Helvetica Neue) across all heading levels
  - Sets appropriate font sizes for title, subtitle, and H1-H6 headings
  - Applies bold formatting to titles and major headings
  - Filters to only process Google Docs files (skips other file types)
  - Saves all documents after formatting
- Services Used: Google Drive API, Google Docs API
*/

function updateFormatting() {
  var folder = DriveApp.getFolderById('folder_id_here');
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    // Explicitly check for Google Doc mimeType
    if (file.getMimeType() === MimeType.GOOGLE_DOCS) { 
      var doc = DocumentApp.openById(file.getId());
      var body = doc.getBody();

      // Update the title style
      var title = body.getParagraphs()[0];
      title.setFontFamily('Helvetica Neue');
      title.setFontSize(22);
      title.setBold(true);

      // Update the subtitle style
      var subtitle = body.getParagraphs()[1];
      subtitle.setFontFamily('Helvetica Neue');
      subtitle.setFontSize(13);

      // Update the H1 style
      var h1s = body.getParagraphs().filter(function(p) {
        return p.getHeading() == DocumentApp.ParagraphHeading.H1;
      });
      for (var i = 0; i < h1s.length; i++) {
        var h1 = h1s[i];
        h1.setFontFamily('Helvetica Neue');
        h1.setFontSize(18);
        h1.setBold(true);
      }

      // Update the H2 style
      var h2s = body.getParagraphs().filter(function(p) {
        return p.getHeading() == DocumentApp.ParagraphHeading.H2;
      });
      for (var i = 0; i < h2s.length; i++) {
        var h2 = h2s[i];
        h2.setFontFamily('Helvetica Neue');
        h2.setFontSize(15);
        h2.setBold(true);
      }

      // Update the H3 style
      var h3s = body.getParagraphs().filter(function(p) {
        return p.getHeading() == DocumentApp.ParagraphHeading.H3;
      });
      for (var i = 0; i < h3s.length; i++) {
        var h3 = h3s[i];
        h3.setFontFamily('Helvetica Neue');
        h3.setFontSize(13);
        h3.setBold(true);
      }

      // Update the H4 style
      var h4s = body.getParagraphs().filter(function(p) {
        return p.getHeading() == DocumentApp.ParagraphHeading.H4;
      });
      for (var i = 0; i < h4s.length; i++) {
        var h4 = h4s[i];
        h4.setFontFamily('Helvetica Neue');
        h4.setFontSize(12);
      }

      // Update the H5 style
      var h5s = body.getParagraphs().filter(function(p) {
        return p.getHeading() == DocumentApp.ParagraphHeading.H5;
      });
      for (var i = 0; i < h5s.length; i++) {
        var h5 = h5s[i];
        h5.setFontFamily('Helvetica Neue');
        h5.setFontSize(11);
      }

      // Update the H6 style
      var h6s = body.getParagraphs().filter(function(p) {
        return p.getHeading() == DocumentApp.ParagraphHeading.H6;
      });
      for (var i = 0; i < h6s.length; i++) {
        var h6 = h6s[i];
        h6.setFontFamily('Helvetica Neue');
        h6.setFontSize(11);
      }

      // Save the document
      doc.save();
    } else {
      // Log the file name that caused the issue for debugging
      Logger.log('Skipped file: ' + file.getName() + ' (not a Google Doc)'); 
    }
  }
}
