# Calendar Automation Scripts

## 📅 Overview
Google Apps Scripts for Google Calendar automation, event analysis, workflow integration, and productivity tracking. This collection provides 5 tools for exporting calendar data, analyzing meeting patterns, and integrating with note-taking systems like Obsidian.

**Total Scripts**: 5 active automation tools  
**Last Updated**: July 21, 2025  

## 📁 Script Organization

### 📤 Export Functions (3 Scripts)
Multi-format calendar event export tools with advanced processing capabilities

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `calendar-export-daily.gs` | Daily note generation with events | Weekly automation, structured templates, navigation links |
| `calendar-export-date-range.gs` | Flexible date range exports | Custom periods, multiple formats, batch processing |
| `calendar-export-distance-time.gs` | Location-aware event export | Travel time analysis, distance calculations, route optimization |

### 📊 Analysis Tools (1 Script)
Advanced analytics for calendar events, meeting patterns, and productivity insights

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `calendar-analysis-duration-distance.gs` | Meeting duration and location analysis | Travel time calculations, meeting efficiency, location patterns |

### 📝 Content Tools (1 Script)
Content generation and integration tools for external systems

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `calendar-export-obsidian.gs` | Obsidian integration export | Markdown formatting, vault structure, daily note integration |

## 🚀 Getting Started

### Prerequisites
- Google Account with Calendar access
- Google Apps Script project
- Required API permissions:
  - Google Calendar API (read access)
  - Google Drive API (for file creation)
  - Google Sheets API (for data exports)
  - Google Maps API (for distance calculations)

### Quick Installation
1. **Choose Your Script**: Browse categories above based on your automation needs
2. **Copy to Apps Script**: Go to [script.google.com](https://script.google.com) and create new project
3. **Configure Settings**: Update calendar IDs, folder IDs, and date ranges
4. **Enable APIs**: Activate required Google APIs in Cloud Console
5. **Test Execution**: Run with small date ranges first to validate configuration
6. **Automate (Optional)**: Set up triggers for daily/weekly execution

### Common Configuration
```javascript
// Standard configuration pattern used across scripts
const CONFIG = {
  CALENDAR_ID: 'primary',              // Default calendar or specific ID
  OUTPUT_FOLDER_ID: 'your-folder-id',  // Drive folder for exports
  DATE_FORMAT: 'yyyy-MM-dd',           // ISO date format
  TIME_ZONE: 'America/New_York',       // Your timezone
  BATCH_SIZE: 50,                      // Events per processing batch
  INCLUDE_TRAVEL_TIME: true            // Calculate travel between events
};
```

## 📋 Usage Workflows

### 📝 Daily Note Automation Workflow
```
1. calendar-export-daily.gs           // Generate structured daily notes
2. calendar-export-obsidian.gs        // Format for Obsidian integration
3. calendar-export-distance-time.gs   // Add travel time calculations
4. Set up daily triggers for automation
```

### 📊 Calendar Analysis Workflow
```
1. calendar-analysis-duration-distance.gs // Analyze meeting patterns
2. calendar-export-date-range.gs      // Export data for further analysis
3. Generate monthly/quarterly reports
4. Apply insights to optimize scheduling
```

### 🗓️ Weekly Planning Workflow
```
1. calendar-export-date-range.gs      // Export upcoming week events
2. calendar-analysis-duration-distance.gs // Analyze week complexity
3. calendar-export-daily.gs           // Generate daily preparation notes
4. calendar-export-distance-time.gs   // Plan travel and commute times
```

## 🔧 Advanced Configuration

### Calendar Selection Options
```javascript
const CALENDAR_CONFIG = {
  PRIMARY: 'primary',                   // Main Google Calendar
  WORK: 'work@company.com',            // Work calendar by email
  PERSONAL: 'personal@gmail.com',      // Personal calendar
  MULTIPLE: ['primary', 'work@company.com'] // Multiple calendars
};
```

### Output Format Customization
```javascript
const OUTPUT_CONFIG = {
  FORMATS: {
    MARKDOWN: 'markdown',              // Structured markdown output
    JSON: 'json',                     // Machine-readable data
    CSV: 'csv',                       // Spreadsheet-compatible
    OBSIDIAN: 'obsidian-daily'        // Obsidian daily note format
  },
  TEMPLATES: {
    DAILY_NOTE: 'daily-template',     // Daily note structure
    WEEKLY_SUMMARY: 'weekly-summary', // Weekly overview format
    MEETING_PREP: 'meeting-preparation' // Meeting preparation template
  }
};
```

### Analysis Parameters
```javascript
const ANALYSIS_CONFIG = {
  METRICS: {
    DURATION_ANALYSIS: true,          // Meeting length patterns
    LOCATION_ANALYSIS: true,          // Travel time calculations
    PRODUCTIVITY_SCORING: true,       // Efficiency metrics
    TREND_IDENTIFICATION: true        // Pattern recognition
  },
  THRESHOLDS: {
    LONG_MEETING: 90,                // Minutes for long meeting flag
    SHORT_BREAK: 15,                 // Minimum break between meetings
    COMMUTE_THRESHOLD: 30            // Minutes for significant travel
  }
};
```

## 📊 Output Examples

### Daily Note Template
```markdown
# Monday, July 21, 2025

## Metadata
- **Date**: 2025-07-21
- **Day**: Monday
- **Week**: 2025-W30
- **Previous**: [[2025-07-20]]
- **Next**: [[2025-07-22]]

## Calendar Events

### Morning
| Time | Event | Location | Duration | Attendees |
|------|-------|----------|----------|-----------|
| 09:00-09:30 | Team Standup | Conference Room A | 30 min | Team (8) |
| 10:00-11:00 | Project Review | Zoom | 60 min | Stakeholders (5) |

### Afternoon  
| Time | Event | Location | Duration | Attendees |
|------|-------|----------|----------|-----------|
| 14:00-15:30 | Client Presentation | Client Office | 90 min | Client Team (6) |
| 16:00-16:30 | Debrief Meeting | Conference Room B | 30 min | Team (4) |

## Travel Schedule
- **09:30-10:00**: Buffer time (same building)
- **11:00-14:00**: Travel to client office (45 min + lunch break)
- **15:30-16:00**: Return travel (30 min)

## Daily Summary
- **Total Meeting Time**: 3.5 hours
- **Travel Time**: 1.25 hours  
- **Focus Time Available**: 3.25 hours
- **Meeting Density**: Medium
```

### Weekly Analysis Report
```markdown
# Weekly Calendar Analysis
**Week of July 21-25, 2025**

## Meeting Statistics
- **Total Meetings**: 23 meetings
- **Total Meeting Time**: 18.5 hours
- **Average Meeting Length**: 48 minutes
- **Longest Meeting**: 2 hours (Client Strategy Session)
- **Shortest Meeting**: 15 minutes (Quick Sync)

## Location Breakdown
- **Office Meetings**: 15 (65%)
- **Remote/Video Calls**: 6 (26%)
- **External Locations**: 2 (9%)
- **Total Travel Time**: 3.5 hours

## Productivity Insights
- **Peak Meeting Days**: Tuesday (6 meetings), Thursday (5 meetings)
- **Lightest Day**: Friday (2 meetings)
- **Focus Time Availability**: 
  - Monday: 4 hours
  - Tuesday: 2 hours ⚠️
  - Wednesday: 3.5 hours
  - Thursday: 2.5 hours ⚠️
  - Friday: 5.5 hours

## Recommendations
1. **Tuesday & Thursday**: Consider rescheduling 1-2 meetings for better focus time
2. **Back-to-back meetings**: 4 instances detected - add 15-minute buffers
3. **Travel optimization**: Group external meetings on same days
4. **Meeting efficiency**: 3 meetings over 60 minutes - consider agenda optimization
```

## 🔒 Security & Privacy

### Data Protection
- **Local Processing**: All calendar data processing within Google's secure infrastructure
- **Minimal Permissions**: Scripts request only necessary Calendar read and Drive write permissions
- **No External APIs**: Uses only Google's native APIs (except Google Maps for travel calculations)
- **User-Controlled**: All exports and analysis controlled by user with explicit authorization

### Security Best Practices
- **Permission Audits**: Regularly review script permissions and calendar access
- **Test with Samples**: Always test scripts with single-day exports before large operations
- **API Monitoring**: Track Calendar API usage to avoid rate limiting
- **Data Retention**: Configure automatic cleanup of old export files
- **Access Control**: Implement proper sharing settings for generated documents

## 📈 Performance & Scaling

### Optimization Features
- **Smart Batching**: Events processed in optimal batches (50 events default)
- **Intelligent Caching**: Event data cached for repeated operations and analysis
- **Error Recovery**: Comprehensive error handling with automatic retry and detailed logging
- **Progress Tracking**: Real-time progress updates for large date ranges and analysis operations
- **Resource Management**: Memory-efficient processing for large calendar datasets

### Performance Guidelines

| Operation Type | Recommended Range | Expected Time | Resource Usage |
|---------------|------------------|---------------|----------------|
| **Daily Export** | Single day | 10-30 seconds | Minimal |
| **Weekly Analysis** | 7 days | 30-60 seconds | Low |
| **Monthly Report** | 30 days | 1-3 minutes | Moderate |
| **Annual Analysis** | 365 days | 5-15 minutes | High |
| **Multi-Calendar** | Multiple sources | +50% time | High |

## 🔄 Integration Capabilities

### External System Integration
- **Obsidian**: Direct daily note generation with proper formatting and cross-linking
- **Notion**: Structured data export compatible with Notion database imports
- **Productivity Apps**: Data format compatible with time tracking and productivity tools
- **Documentation Systems**: Professional meeting summaries and analysis reports
- **Project Management**: Event data integration with task and project tracking systems

### Workflow Automation
- **Daily Triggers**: Automatic daily note generation and event preparation
- **Weekly Analysis**: Scheduled productivity reports and calendar optimization suggestions
- **Event-Driven**: Automatic processing when calendar events are created or modified
- **Integration Chains**: Sequential processing for complex multi-step workflows
- **Notification Systems**: Email alerts for schedule conflicts, travel warnings, and analysis insights

## 🤝 Contributing

### Development Standards
All scripts follow professional development practices:

```javascript
/**
 * Title: Calendar [Function] [Descriptor]
 * Service: Google Calendar
 * Purpose: [Clear purpose statement]
 * Created: YYYY-MM-DD
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: [Why this script exists]
- Description: [What it accomplishes]
- Problem Solved: [Specific problem addressed]
- Successful Execution: [Expected outcomes]
*/
```

### Contribution Guidelines
1. **Naming Convention**: Follow `calendar-[function]-[descriptor].gs` pattern
2. **Error Handling**: Implement comprehensive error recovery and user feedback
3. **Configuration**: Use standardized `CONFIG` object for all settings
4. **Performance**: Optimize for large date ranges with intelligent batching
5. **Documentation**: Include detailed examples and integration instructions

## 📞 Support & Resources

### Documentation & Help
- **Script Headers**: Each script includes comprehensive usage instructions and configuration examples
- **Integration Guides**: Detailed setup instructions for Obsidian and other external systems
- **Error Handling**: Clear error messages with suggested resolutions and troubleshooting steps
- **Best Practices**: Documented optimization techniques and workflow recommendations

### Getting Support
- **GitHub Issues**: Bug reports and feature requests via repository issues
- **Email Support**: Direct technical support at kevin@averageintelligence.ai
- **Community**: Google Apps Script forums and calendar automation communities
- **Documentation**: Official Google Calendar API and Apps Script documentation

### License & Commercial Use
- **License**: MIT License - full commercial use permitted
- **Attribution**: Optional but appreciated for public implementations
- **Warranty**: No warranty provided - thorough testing recommended for business use
- **Support Level**: Best-effort community support with active maintenance and updates

---

**Repository**: [Workspace Automation](https://github.com/kevinlappe/workspace-automation)  
**Maintainer**: Kevin Lappe  
**Last Review**: July 21, 2025
