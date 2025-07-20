# Calendar Automation Scripts

## Overview
Google Apps Scripts for Google Calendar automation, event analysis, and workflow integration. These scripts help you export calendar data, analyze meeting patterns, and integrate with note-taking systems.

## Scripts Overview
| Script Name | Purpose | Last Updated |
|-------------|---------|--------------|
| calendar-export-events.gs | Export calendar events to various formats | 2025-07-19 |
| calendar-analysis-duration.gs | Analyze meeting duration patterns | 2025-07-19 |
| calendar-integration-obsidian.gs | Export events to Obsidian markdown | 2025-07-19 |

## Primary Functions
- **Event Export**: Export calendar events to PDF, Markdown, and structured formats
- **Data Analysis**: Meeting duration, frequency, and location analysis
- **Integration Tools**: Obsidian and note-taking system integration
- **Workflow Automation**: Automated daily/weekly note generation

## Installation
1. Copy desired script to Google Apps Script project
2. Enable Calendar API in Google Cloud Console
3. Configure date ranges and output folder IDs
4. Authorize calendar read permissions
5. Run the script functions as needed

## Prerequisites
- Google Calendar access
- Google Drive for output storage
- Calendar API enabled
- Apps Script project setup

## Common Configuration
```javascript
// Update these variables in scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const DATE_RANGE = {
  start: '2025-01-01',
  end: '2025-12-31'
};
const CALENDAR_ID = 'primary'; // or specific calendar ID
```

## Usage Examples

### Export Calendar Events
```javascript
// Export events for a date range
exportCalendarEvents('2025-01-01', '2025-01-31');

// Export to Obsidian format
exportToObsidianDaily('2025-01-19');
```

### Analyze Meeting Patterns
```javascript
// Analyze meeting duration trends
analyzeMeetingDurations('2024-01-01', '2024-12-31');

// Calculate travel time between meetings
analyzeLocationMetrics();
```

## Features
- **Flexible Date Ranges**: Export events for any time period
- **Multiple Export Formats**: Markdown, PDF, JSON, and CSV
- **Location Analysis**: Distance and travel time calculations
- **Template Support**: Customizable output templates
- **Obsidian Integration**: Direct export to daily notes

## Contributing
1. Follow the standard script header format
2. Include comprehensive error handling
3. Test with various calendar configurations
4. Document any new API permissions required

## License
MIT License - See main repository LICENSE file for details.

## Contact
kevin@averageintelligence.ai

## Integration Date
2025-07-19

## Repository
Part of Workspace Automation (AGAR) project.
