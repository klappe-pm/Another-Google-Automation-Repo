# API Permissions Guide

This document outlines the Google API permissions (OAuth scopes) required for the scripts in this repository.

## Required Google APIs

Before using these scripts, enable the following APIs in your Google Cloud Console:

```bash
# Enable all required APIs
gcloud services enable script.googleapis.com
gcloud services enable drive.googleapis.com
gcloud services enable sheets.googleapis.com
gcloud services enable gmail.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable tasks.googleapis.com
gcloud services enable docs.googleapis.com
```

## OAuth Scopes by Service

### Gmail Scripts (64 scripts)

**Required Scopes:**
- `https://www.googleapis.com/auth/gmail.modify` - Read, compose, and send emails
- `https://www.googleapis.com/auth/gmail.labels` - Manage labels
- `https://www.googleapis.com/auth/gmail.readonly` - Read-only access (for analysis scripts)

**Common Operations:**
- Reading email messages and threads
- Creating and managing labels
- Exporting email data
- Marking messages as read
- Deleting messages (requires user confirmation)

### Drive Scripts (47 scripts)

**Required Scopes:**
- `https://www.googleapis.com/auth/drive` - Full Drive access
- `https://www.googleapis.com/auth/drive.file` - File-specific access
- `https://www.googleapis.com/auth/drive.readonly` - Read-only access

**Common Operations:**
- Creating files and folders
- Reading and updating file content
- Managing file permissions
- Generating folder trees
- Processing markdown files

### Sheets Scripts (21 scripts)

**Required Scopes:**
- `https://www.googleapis.com/auth/spreadsheets` - Full Sheets access
- `https://www.googleapis.com/auth/drive` - Required for file operations

**Common Operations:**
- Reading and writing spreadsheet data
- Creating new sheets
- Formatting cells and ranges
- Importing/exporting data
- Creating charts and reports

### Calendar Scripts (1 script)

**Required Scopes:**
- `https://www.googleapis.com/auth/calendar` - Full Calendar access
- `https://www.googleapis.com/auth/calendar.readonly` - Read-only access

**Common Operations:**
- Reading calendar events
- Analyzing event data
- Exporting to spreadsheets

### Docs Scripts (9 scripts)

**Required Scopes:**
- `https://www.googleapis.com/auth/documents` - Full Docs access
- `https://www.googleapis.com/auth/drive` - Required for file operations

**Common Operations:**
- Reading document content
- Formatting documents
- Exporting to markdown
- Extracting comments

### Tasks Scripts (2 scripts)

**Required Scopes:**
- `https://www.googleapis.com/auth/tasks` - Full Tasks access
- `https://www.googleapis.com/auth/tasks.readonly` - Read-only access

**Common Operations:**
- Reading task lists
- Exporting tasks
- Creating task reports

### Utility Scripts (4 scripts)

**Required Scopes:**
Varies by script functionality, typically includes:
- `https://www.googleapis.com/auth/script.external_request` - For API calls
- `https://www.googleapis.com/auth/script.storage` - For data storage

## Setting Permissions

### Method 1: Automatic (Recommended)

When you run a script for the first time, Google will automatically prompt you to authorize the required permissions.

1. Run the script
2. Click "Review Permissions"
3. Select your Google account
4. Review the requested permissions
5. Click "Allow"

### Method 2: Manual Configuration

For advanced users or automated deployments:

1. Open the script in Google Apps Script editor
2. Click "Project Settings" (gear icon)
3. Check "Show 'appsscript.json' manifest file"
4. Edit `appsscript.json`:

```json
{
  "timeZone": "America/New_York",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/documents",
    "https://www.googleapis.com/auth/tasks"
  ],
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Gmail",
        "version": "v1",
        "serviceId": "gmail"
      },
      {
        "userSymbol": "Drive",
        "version": "v2",
        "serviceId": "drive"
      }
    ]
  }
}
```

## Security Best Practices

### 1. Principle of Least Privilege

Only request the minimum scopes needed:
- Use `.readonly` scopes when write access isn't needed
- Use specific scopes rather than broad access
- Remove unused scopes from manifest

### 2. Sensitive Operations

Scripts that perform sensitive operations include warnings:
- **Email Deletion**: Requires explicit user confirmation
- **Drive File Deletion**: Logs all deletions
- **Calendar Modifications**: Creates audit trail

### 3. Data Protection

- No credentials or API keys in code
- Use PropertiesService for sensitive configuration
- Implement proper error handling
- Log all critical operations

### 4. Regular Audits

Periodically review:
- Active OAuth grants at https://myaccount.google.com/permissions
- Script execution logs
- Permission usage patterns

## Troubleshooting Permissions

### Common Issues

**"Authorization required" error**
- Re-run the script and complete authorization
- Check that all required APIs are enabled

**"Insufficient permissions" error**
- Review the script's required scopes
- Ensure your account has access to the resources
- Check organizational policies that might restrict access

**"API not enabled" error**
```bash
# Enable the specific API
gcloud services enable [service-name].googleapis.com
```

### Revoking Permissions

To revoke permissions for a script:
1. Go to https://myaccount.google.com/permissions
2. Find the script in the list
3. Click "Remove Access"

### Testing Permissions

Test script with minimal permissions:
```javascript
function testPermissions() {
  try {
    // Test Gmail access
    const threads = GmailApp.getInboxThreads(0, 1);
    Logger.log('✅ Gmail access OK');
  } catch (e) {
    Logger.log('❌ Gmail access failed: ' + e.message);
  }
  
  try {
    // Test Drive access
    const files = DriveApp.getFilesByName('test');
    Logger.log('✅ Drive access OK');
  } catch (e) {
    Logger.log('❌ Drive access failed: ' + e.message);
  }
  
  // Add more service tests as needed
}
```

## Advanced Services

Some scripts require Advanced Google Services to be enabled:

1. In Apps Script editor, click "Services" (+)
2. Find the service you need
3. Click "Add"
4. The service will be available in your script

Common Advanced Services:
- Gmail API (for advanced email operations)
- Drive API (for advanced file operations)
- Calendar API (for advanced calendar features)
- Admin SDK (for domain administration)

---

Last Updated: July 2025