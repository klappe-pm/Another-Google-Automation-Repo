# API Permissions Audit and Configuration Plan

## Current State Summary

### Configured Services (3/10)
1. **Calendar** - Full calendar and drive access
2. **Drive** - Comprehensive drive and metadata access  
3. **Gmail** - Most extensive with advanced APIs enabled

### Unconfigured Services (7/10)
- Chat, Docs, Photos, Sheets, Slides, Tasks, Utility

## Required Permissions by Service

### 📅 Calendar Service
**Current:** ✅ Properly configured
- Calendar API (read/write events)
- Drive API (export/backup)
- Sheets API (reporting)

### 💬 Chat Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/chat.messages",
  "https://www.googleapis.com/auth/chat.spaces",
  "https://www.googleapis.com/auth/drive"
]
```

### 📄 Docs Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
],
"dependencies": {
  "enabledAdvancedServices": [
    {
      "userSymbol": "Docs",
      "version": "v1",
      "serviceId": "docs"
    }
  ]
}
```

### 📁 Drive Service
**Current:** ✅ Properly configured
- Full Drive access
- Metadata access
- Spreadsheet integration

### 📧 Gmail Service
**Current:** ✅ Properly configured with advanced APIs
- Gmail read/modify/labels
- Drive integration
- Docs/Sheets APIs

### 📷 Photos Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/photoslibrary",
  "https://www.googleapis.com/auth/photoslibrary.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
]
```

### 📊 Sheets Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file"
],
"dependencies": {
  "enabledAdvancedServices": [
    {
      "userSymbol": "Sheets",
      "version": "v4",
      "serviceId": "sheets"
    }
  ]
}
```

### 📱 Slides Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
],
"dependencies": {
  "enabledAdvancedServices": [
    {
      "userSymbol": "Slides",
      "version": "v1",
      "serviceId": "slides"
    }
  ]
}
```

### ✅ Tasks Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
]
```

### 🔧 Utility Service
**Required Permissions:**
```json
"oauthScopes": [
  "https://www.googleapis.com/auth/script.external_request",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
]
```

## Implementation Priority

### High Priority
1. **Sheets** - Core service for data management
2. **Docs** - Document automation critical
3. **Tasks** - Task management integration

### Medium Priority
4. **Slides** - Presentation automation
5. **Photos** - Photo organization features
6. **Chat** - Team collaboration

### Low Priority
7. **Utility** - Helper functions (add as needed)

## Time Zone Standardization

All services should use consistent timezone:
```json
"timeZone": "America/New_York"
```

## Security Best Practices

1. **Principle of Least Privilege** - Only request necessary scopes
2. **Incremental Authorization** - Add scopes as features require
3. **Regular Audits** - Review and remove unused permissions
4. **Documentation** - Keep this audit updated with changes

## Next Steps

1. Update each unconfigured service's `appsscript.json`
2. Test each service after permission updates
3. Deploy changes through automation pipeline
4. Verify permissions in Google Cloud Console
5. Update service documentation