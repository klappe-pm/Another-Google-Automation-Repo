# Calendar Automation Scripts

> **✅ STANDARDIZATION COMPLETE** - This folder has been fully standardized according to the repository guidelines (July 17, 2025)

## Overview

The Calendar automation scripts provide comprehensive tools for exporting, analyzing, and processing Google Calendar events. These scripts are designed to integrate with various productivity workflows, including Obsidian note-taking, data analysis, and event management systems.

## Scripts Overview

| Script Name | Category | Purpose | Last Updated |
|-------------|----------|---------|--------------|
| calendar-export-obsidian.gs | Content Export | Export calendar events to Obsidian markdown files with YAML frontmatter | 2025-07-17 |
| calendar-export-date-range.gs | Data Export | Export events from all calendars within specified date range to Google Sheets | 2025-07-17 |
| calendar-export-daily.gs | Content Export | Create daily notes for upcoming work week with calendar events | 2025-07-17 |
| calendar-export-distance-time.gs | Data Export | Export events with Google Maps distance/time calculations | 2025-07-17 |
| calendar-analysis-duration-distance.gs | Data Analysis | Analyze events with duration, time, and distance metrics | 2025-07-17 |

**Total Scripts**: 5  
**Categories**: Content Export (2), Data Export (2), Data Analysis (1)  
**Last Updated**: July 17, 2025

## Quick Start

1. **Choose a Script**: Select the calendar automation that fits your needs
2. **Open Apps Script**: Go to [script.google.com](https://script.google.com)
3. **Create Project**: Start a new Google Apps Script project
4. **Copy Code**: Paste the script code into the editor
5. **Configure**: Update calendar IDs and output settings
6. **Authorize**: Grant Calendar and Drive/Sheets permissions
7. **Run**: Execute the main function

## Prerequisites

- Google Account with Calendar access
- Google Apps Script enabled
- Appropriate calendar permissions (read access minimum)
- Google Drive access (for markdown exports)
- Google Sheets access (for data exports)
- Google Maps API key (for distance/time calculations)

## Installation & Setup

1. **Open Google Apps Script**: Navigate to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Enable Required APIs**: Go to Libraries > Services and enable Calendar, Drive, Sheets APIs
4. **Copy Code**: Paste script content and configure variables
5. **Authorize**: Run script to authorize required permissions

### Required OAuth Scopes
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/drive.file` - Create files in Drive
- `https://www.googleapis.com/auth/spreadsheets` - Create and modify spreadsheets
- `https://www.googleapis.com/auth/script.external_request` - External API calls (Maps)

## Script Documentation

### Content Export Scripts

#### calendar-export-obsidian.gs
**Purpose**: Export calendar events to Obsidian-compatible markdown files  
**Location**: `/Content/`  
**Features**:
- Creates markdown files with YAML frontmatter
- Includes event metadata (attendees, location, description)
- Generates backlinks for Obsidian vault integration
- Handles recurring events and exceptions
- Customizable date ranges and calendars

**Configuration**:
```javascript
// Update these variables
const OUTPUT_FOLDER_ID = 'your-drive-folder-id';
const START_DATE = new Date('2025-01-01');
const END_DATE = new Date('2025-12-31');
```

#### calendar-export-daily.gs
**Purpose**: Create daily notes for upcoming work week with calendar events  
**Location**: `/Exports/`  
**Features**:
- Generates daily note templates
- Includes calendar events for each day
- Customizable time ranges (work hours)
- Integration with daily planning workflows
- Markdown format for note-taking systems

**Usage**:
- Run to generate notes for next 7 days
- Automatically excludes weekends (configurable)
- Creates one file per day with events

### Data Export Scripts

#### calendar-export-date-range.gs
**Purpose**: Export events from all calendars within specified date range  
**Location**: `/Exports/`  
**Features**:
- Exports to Google Sheets with structured data
- Includes all calendar metadata
- Handles multiple calendars simultaneously
- Customizable date ranges
- Formatted output with headers and styling

**Configuration**:
```javascript
// Set date range
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-01-31');
```

#### calendar-export-distance-time.gs
**Purpose**: Export events with Google Maps distance/time calculations  
**Location**: `/Exports/`  
**Features**:
- Calculates travel time between events
- Estimates distances using Google Maps API
- Identifies potential scheduling conflicts
- Exports comprehensive travel analysis
- Helps with time management and planning

**Requirements**:
- Google Maps API key
- Events with location data
- External request permissions

### Data Analysis Scripts

#### calendar-analysis-duration-distance.gs
**Purpose**: Analyze events with duration, time, and distance metrics  
**Location**: `/Analysis/`  
**Features**:
- Statistical analysis of calendar usage
- Time block analysis and patterns
- Travel time calculations and optimization
- Meeting frequency and duration metrics
- Productivity insights and recommendations

**Output Metrics**:
- Total meeting time per period
- Average meeting duration
- Travel time analysis
- Free time identification
- Calendar efficiency scores

## Usage Examples

### Basic Event Export
```javascript
// Example: Export last 30 days of events
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);
const endDate = new Date();
exportCalendarEvents(startDate, endDate);
```

### Obsidian Integration
The Obsidian export script creates markdown files with:
- Event title as filename
- YAML frontmatter with event metadata
- Event description and details
- Attendee information
- Location and meeting links

### Distance/Time Analysis
For location-based analysis:
- Ensure events have location information
- Configure your home/office location as baseline
- API calls are made to Google Maps for calculations
- Results include travel time and distance

## Common Use Cases

### Daily Planning
- Export today's events to analyze time blocks
- Generate daily notes with calendar integration
- Create time-blocking templates

### Meeting Analysis
- Analyze meeting frequency and duration
- Export meeting metadata for reporting
- Track travel time between appointments

### Productivity Tracking
- Monitor calendar density and free time
- Analyze meeting patterns and trends
- Generate productivity reports

### Note-Taking Integration
- Create automatic meeting notes in Obsidian
- Generate pre-populated templates
- Link calendar events to project notes

## Configuration Options

### Date Range Settings
```javascript
// Last week
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);

// Next month
const endDate = new Date();
endDate.setMonth(endDate.getMonth() + 1);
```

### Calendar Selection
```javascript
// All calendars
const calendars = CalendarApp.getAllCalendars();

// Specific calendar
const calendar = CalendarApp.getCalendarById('your-calendar-id');
```

### Output Formatting
- **Markdown**: YAML frontmatter + content
- **Sheets**: Tabular data with formulas
- **JSON**: Structured data export

## Troubleshooting & Common Issues

- **Permission Errors**: Ensure all required APIs are enabled and authorized
- **API Limits**: Monitor quota usage and implement rate limiting for large exports  
- **File Access**: Verify folder/file permissions and sharing settings
- **Script Timeout**: Use batch processing for large operations
- **Empty Results**: Check date range parameters and calendar event availability
- **Maps API Errors**: Verify API key is valid and has sufficient quota

## Best Practices & Optimization

- **Test First**: Always test scripts on small datasets before full deployment
- **Backup Data**: Create backups before running bulk operations
- **Monitor Performance**: Check execution logs and optimize for large datasets
- **Follow Quotas**: Respect Google API rate limits and daily quotas
- **Incremental Processing**: Use date ranges to process data in manageable chunks

## Advanced Features

### Custom Templates
Modify markdown templates for different use cases:
- Meeting notes template
- Event summary format
- Project planning layout

### Automation Triggers
Set up time-driven triggers for:
- Daily calendar export
- Weekly summary generation
- Monthly reporting

### Integration Options
- Zapier webhooks for external systems
- Google Sheets formulas for analysis
- Drive folder organization automation

## Performance Notes

- **Large Date Ranges**: Scripts may timeout with very large date ranges (>1 year)
- **Multiple Calendars**: Processing time increases with calendar count
- **API Calls**: Distance/time scripts make external API calls which add latency
- **File Creation**: Markdown exports create multiple files which may be slow

## Contributing

Contributions are welcome! Please:
- Follow the existing code style and structure
- Add comprehensive comments and documentation
- Test thoroughly before submitting
- Update this README with any new features or changes

## License

MIT License - see repository root for full license text.

## 📞 Contact

**Primary Contact**: Kevin Lappe  
**Email**: kevin@averageintelligence.ai

## Related Resources

- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google Apps Script Calendar Service](https://developers.google.com/apps-script/reference/calendar)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix)

## 🗂️ File Organization

```
calendar/
├── README.md
├── LICENSE.md
├── Analysis/
│   └── calendar-analysis-duration-distance.gs
├── Content/
│   └── calendar-export-obsidian.gs
├── Exports/
│   ├── calendar-export-daily.gs
│   ├── calendar-export-date-range.gs
│   └── calendar-export-distance-time.gs
├── Legacy/
│   └── [Future legacy files]
└── Utilities/
    └── [Future utility scripts]
```