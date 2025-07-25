# Utility Service

Google Apps Script utility functions and helper scripts for cross-service operations.

## Overview

This service provides utility scripts and helper functions that support operations across multiple Google Workspace services. These scripts handle common tasks like API key validation, data formatting, and cross-service integrations.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| utility-api-key-checker.gs | Validate and check API keys | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### Project Settings

- **Script ID**: `1X3W2-mJ5ss_2Xl8zHlQXq8ndwnPHURvUynnp-v5t39xL7j4LdDTEVl1B`
- **Time Zone**: America/New_York
- **Runtime**: V8

## Usage

### Basic Utility Functions

```javascript
// Make external API request
function makeApiRequest(url, options) {
  try {
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log('API request failed: ' + error.message);
    return null;
  }
}

// Format date consistently
function formatDate(date) {
  return Utilities.formatDate(date, 'America/New_York', 'yyyy-MM-dd HH:mm:ss');
}

// Generate unique ID
function generateUniqueId() {
  return Utilities.getUuid();
}
```

### Common Operations

1. **API Management**
   - Use `utility-api-key-checker.gs` to validate keys
   - Handle external API requests
   - Manage authentication tokens

2. **Data Processing**
   - Format dates and timestamps
   - Generate unique identifiers
   - Parse and validate data

3. **Cross-Service Functions**
   - Share common functions between services
   - Handle service authentication
   - Manage shared configurations

## Development

### Adding New Scripts

1. Create new file following naming convention: `utility-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Document utility functions clearly
4. Update this README with script details

### Testing

```javascript
// Test utility functions
function testUtilityFunctions() {
  try {
    // Test UUID generation
    const uuid = Utilities.getUuid();
    Logger.log('Generated UUID: ' + uuid);
    
    // Test date formatting
    const now = new Date();
    const formatted = Utilities.formatDate(now, 'America/New_York', 'yyyy-MM-dd');
    Logger.log('Formatted date: ' + formatted);
    
    // Test external request capability
    const testUrl = 'https://api.github.com/zen';
    const response = UrlFetchApp.fetch(testUrl);
    Logger.log('External request successful: ' + response.getResponseCode());
    
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**External Request Failed**
- Check URL validity
- Verify external request scope is included
- Handle network timeouts gracefully

**Permission Errors**
- Ensure script.external_request scope is added
- Check API endpoint requirements
- Verify authentication headers

**Performance Issues**
- Cache frequently used data
- Implement request throttling
- Use batch operations where possible

## Resources

- [Apps Script URL Fetch Service](https://developers.google.com/apps-script/reference/url-fetch)
- [Apps Script Utilities Service](https://developers.google.com/apps-script/reference/utilities)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025