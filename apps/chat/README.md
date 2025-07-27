# Chat Service

Google Apps Script automation for Google Chat integration and messaging.

## Overview

This service provides automation scripts for Google Chat operations including message posting, space management, and chat data export.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| chat-export-daily-details.gs | Export daily chat messages with details | Active |

## Configuration

### Required Permissions

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/chat.messages",
    "https://www.googleapis.com/auth/chat.spaces",
    "https://www.googleapis.com/auth/drive"
  ]
}
```

### Project Settings

- **Script ID**: `1j9M60-KeKOMlxdUVKCb0sO3c01OSL-btzmFj3Q77vcE0dY0aqz1ON7F8`
- **Time Zone**: America/New_York
- **Runtime**: V8

## Usage

### Basic Message Export

```javascript
// Export chat messages from a space
function exportChatMessages(spaceId) {
  // Note: Requires Chat API advanced service
  const messages = Chat.Spaces.Messages.list(spaceId);

  messages.messages.forEach(message => {
    Logger.log(message.text);
  });
}
```

### Common Operations

1. **Export Chat History**
   - Use `chat-export-daily-details.gs` for daily exports
   - Exports include message content, sender, and timestamps

2. **Message Automation**
   - Send automated messages to spaces
   - Schedule regular updates or notifications

3. **Space Management**
   - List available spaces
   - Monitor space activity

## Development

### Adding New Scripts

1. Create new file following naming convention: `chat-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Enable Chat API in Google Cloud Console
4. Update this README with script details

### Testing

```javascript
// Test chat API access
function testChatAccess() {
  try {
    // This requires Chat API to be enabled
    Logger.log('Chat API test - manual verification required');
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
- Enable Google Chat API in Cloud Console
- Add Chat advanced service in Apps Script

**Permission Denied**
- Verify OAuth scopes include chat permissions
- Ensure service account has access to spaces

**Space Not Found**
- Check space ID format
- Verify bot is added to the space

## Resources

- [Google Chat API Documentation](https://developers.google.com/chat)
- [Apps Script Chat Integration](https://developers.google.com/apps-script/guides/chat)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025