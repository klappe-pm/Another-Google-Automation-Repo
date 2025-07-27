# Calendar Service

Google Apps Script automation for Google Calendar management and analysis.

## Overview

This service provides automation scripts for Google Calendar operations including event management, data export, and calendar analytics.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| calendar-event-assistant.gs | Event creation and management | Active |
| calendar-analysis-duration-distance.gs | Analyze event durations and travel distances | Active |
| calendar-export-daily.gs | Export daily calendar data | Active |
| calendar-export-date-range.gs | Export events for specific date ranges | Active |
| calendar-export-distance-time.gs | Export events with distance/time calculations | Active |
| calendar-export-obsidian.gs | Export calendar data to Obsidian format | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### Project Settings

- **Script ID**: `1WBzQgskRgRPJkPBLhjf-2CHNVRqYVIh2Io-fBW75Ro_9wOpX8uzUIHUh`
- **Time Zone**: America/New_York
- **Runtime**: V8

## Usage

### Basic Event Export

```javascript
// Export today's calendar events
function exportTodayEvents() {
  const calendar = CalendarApp.getDefaultCalendar();
  const today = new Date();
  const events = calendar.getEventsForDay(today);

  // Process events
  events.forEach(event => {
    Logger.log(event.getTitle() + ' - ' + event.getStartTime());
  });
}
```

### Common Operations

1. **Export Events to Spreadsheet**
   - Use `calendar-export-daily.gs` for daily exports
   - Use `calendar-export-date-range.gs` for custom date ranges

2. **Analyze Calendar Data**
   - Use `calendar-analysis-duration-distance.gs` for meeting analytics
   - Export results to Google Sheets for visualization

3. **Obsidian Integration**
   - Use `calendar-export-obsidian.gs` to create markdown files
   - Includes YAML frontmatter for Obsidian metadata

## Development

### Adding New Scripts

1. Create new file following naming convention: `calendar-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Test locally before deployment
4. Update this README with script details

### Testing

```javascript
// Test calendar access
function testCalendarAccess() {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    Logger.log('Calendar Name: ' + calendar.getName());
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**Permission Denied**
- Ensure Calendar API is enabled in Google Cloud Console
- Check OAuth scopes in `appsscript.json`

**No Events Found**
- Verify calendar ID if not using default calendar
- Check date range parameters

**Export Failures**
- Confirm Drive folder permissions for export location
- Check execution time limits for large exports

## Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Apps Script Calendar Service](https://developers.google.com/apps-script/reference/calendar)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025