# Docs Automation Scripts

## Overview
Google Apps Scripts for Google Docs automation, content conversion, and document management. These scripts help you convert documents to markdown, extract content, and integrate with knowledge management systems.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| docs-export-markdown.gs | Convert Google Docs to Markdown | 2025-07-19 |
| docs-export-obsidian.gs | Export docs with Obsidian formatting | 2025-07-19 |
| docs-extract-comments.gs | Extract and analyze document comments | 2025-07-19 |
| docs-content-embed.gs | Dynamic content embedding between docs | 2025-07-19 |

## Primary Functions
- **Format Conversion**: Convert Google Docs to Markdown, HTML, and other formats
- **Content Extraction**: Extract comments, images, and metadata
- **Dynamic Embedding**: Live content updates between documents
- **Knowledge Integration**: Obsidian and note-taking system compatibility

## Installation
1. Copy desired script to Google Apps Script project
2. Enable Google Docs API in Google Cloud Console
3. Configure document IDs and output settings
4. Authorize document read permissions
5. Run the script functions as needed

## Prerequisites
- Google Docs access
- Google Drive for output storage
- Docs API enabled
- Apps Script project setup

## Common Configuration
```javascript
// Update these variables in scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const DOCUMENT_ID = 'your-google-doc-id-here';
const EXPORT_FORMAT = 'markdown'; // or 'html', 'pdf'
```

## Usage Examples

### Convert to Markdown
```javascript
// Convert single document
convertDocToMarkdown('doc-id-here');

// Batch convert multiple documents
batchConvertDocs(['doc1-id', 'doc2-id', 'doc3-id']);
```

### Extract Content
```javascript
// Extract all comments
const comments = extractDocumentComments('doc-id-here');

// Extract images with metadata
const images = extractDocumentImages('doc-id-here');
```

### Obsidian Integration
```javascript
// Export with Obsidian-compatible formatting
exportToObsidian('doc-id-here', {
  includeMetadata: true,
  linkFormat: 'wikilink',
  imageHandling: 'download'
});
```

## Features
- **Advanced Markdown Conversion**: Preserves formatting, links, and structure
- **Image Handling**: Download and embed images in exports
- **Metadata Preservation**: Maintain document properties and timestamps
- **Comment Analysis**: Extract and organize collaborative feedback
- **Template Support**: Customizable export templates
- **Batch Processing**: Handle multiple documents efficiently

## Supported Export Formats
- **Markdown**: With GitHub Flavored Markdown support
- **HTML**: Clean, semantic HTML output
- **PDF**: Direct PDF export with formatting
- **JSON**: Structured data for further processing

## Contributing
1. Follow the standard script header format
2. Include comprehensive error handling
3. Test with various document types and formatting
4. Document any new API permissions required

## License
MIT License - See main repository LICENSE file for details.

## Contact
kevin@averageintelligence.ai

## Integration Date
2025-07-19

## Repository
Part of Workspace Automation (AGAR) project.
