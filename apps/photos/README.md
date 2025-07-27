# Photos Service

Google Apps Script automation for Google Photos management and organization.

## Overview

This service provides automation scripts for Google Photos operations including album management, photo organization, and metadata export.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| photos-export-albums-to-sheets.gs | Export album information to Google Sheets | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/photoslibrary",
    "https://www.googleapis.com/auth/photoslibrary.readonly",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

### Project Settings

- **Script ID**: `1bkbORqQD2is7LWtlHRr6D_nCtd6uk1PP9t3SsVeCXobOrPgsVnK7yxPx`
- **Time Zone**: America/New_York
- **Runtime**: V8

## Usage

### Basic Photos Operations

```javascript
// Note: Photos API requires advanced service configuration
// This is a conceptual example
function listPhotoAlbums() {
  // Requires Photos Library API to be enabled
  // Use REST API calls or advanced service
  const response = UrlFetchApp.fetch('https://photoslibrary.googleapis.com/v1/albums', {
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });

  const albums = JSON.parse(response.getContentText());
  Logger.log('Found ' + albums.albums.length + ' albums');
}
```

### Common Operations

1. **Album Export**
   - Use `photos-export-albums-to-sheets.gs` to catalog albums
   - Export includes album names, photo counts, and creation dates

2. **Photo Organization**
   - Access photo metadata
   - Organize by date, location, or custom criteria

3. **Backup Operations**
   - Export photo metadata for backup
   - Track photo organization in spreadsheets

## Development

### Adding New Scripts

1. Create new file following naming convention: `photos-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Enable Photos Library API in Google Cloud Console
4. Update this README with script details

### Testing

```javascript
// Test Photos API access
function testPhotosAccess() {
  try {
    // Test OAuth token generation
    const token = ScriptApp.getOAuthToken();
    Logger.log('OAuth token generated successfully');

    // Note: Actual Photos API calls require additional setup
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**API Not Enabled**
- Enable Google Photos Library API in Cloud Console
- Configure OAuth consent screen if needed

**Scope Errors**
- Ensure photoslibrary scopes are included
- Re-authorize the script after adding scopes

**Rate Limits**
- Photos API has strict rate limits
- Implement exponential backoff
- Cache results when possible

## Resources

- [Google Photos Library API](https://developers.google.com/photos)
- [Photos API REST Reference](https://developers.google.com/photos/library/reference/rest)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025