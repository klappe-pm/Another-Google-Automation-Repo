# Chat Automation Scripts

## Overview
Google Apps Scripts for Google Chat automation, message archival, and communication analysis. These scripts help you export chat messages, analyze communication patterns, and integrate with documentation systems.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| chat-export-daily.gs | Export daily chat messages | 2025-07-19 |
| chat-analysis-patterns.gs | Analyze communication patterns | 2025-07-19 |
| chat-archive-messages.gs | Archive messages to storage | 2025-07-19 |

## Primary Functions
- **Message Export**: Export chat messages to various formats
- **Communication Analysis**: Pattern analysis and reporting
- **Message Archival**: Long-term storage and organization
- **Integration Tools**: Documentation and note-taking compatibility

## Installation
1. Copy desired script to Google Apps Script project
2. Enable Google Chat API in Google Cloud Console
3. Configure chat spaces and export settings
4. Authorize chat read permissions
5. Run the script functions as needed

## Prerequisites
- Google Chat access (Workspace account)
- Google Drive for output storage
- Chat API enabled
- Apps Script project setup

## Common Configuration
```javascript
// Update these variables in scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const SPACE_ID = 'your-chat-space-id'; // or 'all' for all spaces
const EXPORT_FORMAT = 'markdown'; // or 'json', 'csv'
```

## Usage Examples

### Export Messages
```javascript
// Export daily messages
exportDailyMessages('2025-01-19');

// Export messages from specific space
exportSpaceMessages('space-id-here', {
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});
```

### Analyze Communication
```javascript
// Analyze message patterns
analyzeCommunicationPatterns({
  period: 'monthly',
  includeGraphs: true
});

// Generate team activity report
generateActivityReport('space-id-here');
```

## Features
- **Daily Export**: Automated daily message archival
- **Space Management**: Export from specific spaces or all spaces
- **Format Options**: Markdown, JSON, CSV export formats
- **Pattern Analysis**: Communication frequency and timing analysis
- **Search Integration**: Advanced message search and filtering
- **Privacy Compliant**: Respects user permissions and privacy settings

## Supported Operations
- **Message Export**: Individual or bulk message export
- **Space Analysis**: Activity patterns by chat space
- **User Analytics**: Individual contribution analysis
- **Time-based Filtering**: Export by date ranges and time periods
- **Content Search**: Find and export specific message content

## Export Formats
- **Markdown**: Formatted for documentation systems
- **JSON**: Structured data for further processing
- **CSV**: Tabular format for spreadsheet analysis
- **HTML**: Web-ready formatted output

## Privacy & Permissions
- Respects Google Chat permission model
- Only exports messages user has access to
- Follows workspace data retention policies
- Includes privacy-conscious filtering options

## Contributing
1. Follow the standard script header format
2. Include comprehensive error handling
3. Respect privacy and permissions
4. Test with various workspace configurations
5. Document any new API permissions required

## License
MIT License - See main repository LICENSE file for details.

## Contact
kevin@averageintelligence.ai

## Integration Date
2025-07-19

## Repository
Part of Workspace Automation (AGAR) project.
