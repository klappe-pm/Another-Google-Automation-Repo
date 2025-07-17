# Chat Automation Scripts

> **✅ STANDARDIZATION COMPLETE** - This folder has been fully standardized according to the repository guidelines (July 17, 2025)

## Overview

Google Chat automation scripts for analyzing chat usage patterns, exporting conversation data, and generating insights from team communication metrics. These tools help organizations understand communication patterns and optimize team collaboration.

## Scripts Overview

| Script Name | Category | Purpose | Last Updated |
|-------------|----------|---------|--------------|
| chat-export-daily-details.gs | Data Export | Analyzes Google Chat usage data for the previous work week and exports statistics to Google Sheets | 2025-07-17 |

**Total Scripts**: 1  
**Categories**: Data Export (1)  
**Last Updated**: July 17, 2025  
**Status**: Ready for expansion with additional chat automation tools

## Quick Start

1. **Open Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Create New Project**: Start a new Google Apps Script project
3. **Enable APIs**: Enable Chat and Sheets APIs
4. **Copy Code**: Paste the script code into the editor
5. **Configure**: Update spreadsheet ID and chat settings
6. **Authorize**: Grant Chat and Sheets permissions
7. **Run**: Execute the analysis function

## Prerequisites

- Google Workspace account with Chat access
- Google Apps Script enabled
- Chat API access and permissions
- Google Sheets access for data export
- Admin permissions for workspace chat analysis (depending on scope)

## Installation & Setup

1. **Open Google Apps Script**: Navigate to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Enable Required APIs**: Enable Chat and Sheets APIs in the project
4. **Copy Code**: Paste script content and configure variables
5. **Authorize**: Run script to authorize required permissions

### Required OAuth Scopes
- `https://www.googleapis.com/auth/chat.spaces.readonly` - Read chat spaces
- `https://www.googleapis.com/auth/chat.messages.readonly` - Read chat messages
- `https://www.googleapis.com/auth/spreadsheets` - Create and modify spreadsheets

## Script Documentation

### Data Export Scripts

#### chat-export-daily-details.gs
**Purpose**: Analyzes Google Chat usage data for the previous work week and generates comprehensive statistics  
**Location**: `/Exports/`  
**Created**: January 16, 2025  
**Last Updated**: July 17, 2025

**Features**:
- Fetches chat data for each day of the previous work week (Monday-Friday)
- Analyzes message counts, emoji usage, and response times
- Calculates text statistics and communication patterns
- Exports results to Google Sheets with structured data
- Handles API pagination and error cases
- Provides detailed logging for troubleshooting

**Configuration**:
```javascript
// Update these variables in the script
const SPREADSHEET_ID = 'your-spreadsheet-id';
const DEBUG_MODE = true; // Enable detailed logging
const INCLUDE_WEEKENDS = false; // Analyze weekends or not
```

**Output Data Includes**:
- Daily message counts by user
- Average message length and response times
- Emoji usage statistics and trends
- Communication pattern analysis
- Most active chat spaces and times
- Team collaboration metrics

**Usage**:
1. Configure the target spreadsheet ID
2. Run `analyzeChatActivity()` function
3. Review the generated analytics in Google Sheets
4. Use data for team communication insights

**Data Structure**:
The script exports data with the following columns:
- Date
- Total Messages
- Unique Users
- Average Message Length
- Most Active Hour
- Top Emojis Used
- Response Time Metrics
- Communication Patterns

## Configuration Options

### Time Range Settings
```javascript
// Analyze last work week (default)
const startDate = getLastMondayDate();
const endDate = getLastFridayDate();

// Custom date range
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-01-31');
```

### Chat Space Filtering
```javascript
// All accessible chat spaces
const spaces = Chat.Spaces.list();

// Specific chat spaces
const targetSpaces = ['space-id-1', 'space-id-2'];
```

### Export Customization
- **Sheet Formatting**: Customize headers, colors, and layout
- **Data Aggregation**: Modify grouping and summary calculations
- **Filtering**: Include/exclude specific users or spaces
- **Time Zones**: Adjust for different time zone analysis

## Common Use Cases

### Team Communication Analysis
- Monitor daily communication patterns
- Identify peak collaboration hours
- Track team engagement levels
- Analyze communication distribution

### Productivity Insights
- Measure response times and engagement
- Identify communication bottlenecks
- Track emoji usage and sentiment
- Monitor workspace adoption

### Reporting & Metrics
- Generate weekly team reports
- Create communication dashboards
- Export data for external analysis
- Track communication trends over time

### Workspace Optimization
- Identify underutilized chat spaces
- Optimize notification settings
- Improve team communication workflows
- Enhance collaboration efficiency

## Troubleshooting & Common Issues

- **Permission Errors**: Ensure all required APIs are enabled and authorized
- **Chat API Access**: Verify proper Chat API permissions and workspace access
- **API Limits**: Monitor quota usage and implement rate limiting for large datasets
- **File Access**: Verify spreadsheet sharing permissions and access rights
- **Script Timeout**: Use batch processing for large chat data operations
- **Data Export Issues**: Check spreadsheet creation permissions in target Drive folder
- **Empty Results**: Verify chat space access and date range parameters

## Best Practices & Optimization

- **Test First**: Always test scripts on small datasets before full deployment
- **Backup Data**: Create backups before running bulk operations
- **Monitor Performance**: Check execution logs and optimize for large datasets
- **Follow Quotas**: Respect Google API rate limits and daily quotas
- **Incremental Processing**: Process chat data in manageable time ranges
- **Privacy Compliance**: Ensure compliance with workspace privacy policies
- **Data Retention**: Follow organizational data retention policies

## Contributing

Contributions are welcome! Please:
- Follow the existing code style and structure
- Add comprehensive comments and documentation
- Test thoroughly before submitting
- Update this README with any new features or changes
- Follow Google Workspace API best practices
- Ensure privacy and security compliance

## License

MIT License - see repository root for full license text.

## 📞 Contact

**Primary Contact**: Kevin Lappe  
**Email**: kevin@averageintelligence.ai

## Related Resources

- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Google Chat API Documentation](https://developers.google.com/chat)
- [Google Sheets API Documentation](https://developers.google.com/sheets)
- [Google Workspace API Guidelines](https://developers.google.com/workspace)

## 🗂️ File Organization

```
chat/
├── README.md
├── LICENSE.md
├── Exports/
│   └── chat-export-daily-details.gs
├── Analysis Tools/
│   └── [Future analysis scripts]
├── Content Management/
│   └── [Future content management scripts]
├── Utility Tools/
│   └── [Future utility scripts]
└── Legacy Files/
    └── [Future legacy files]
```