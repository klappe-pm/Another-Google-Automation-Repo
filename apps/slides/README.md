# Slides Service

Google Apps Script automation for Google Slides presentation management.

## Overview

This service provides automation scripts for Google Slides operations including presentation creation, content manipulation, and slide management.

## Scripts

| Script Name | Purpose | Status |
|-------------|---------|--------|
| (No scripts yet) | Placeholder for future scripts | Planned |

## Configuration

### Required Permissions

```json
{
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
}
```

### Project Settings

- **Script ID**: `1qWMrnFNy3b_Y1lo54Xjxzlg01t57ZmYMb1FB8N_JWTg_shNe318Zd55h`
- **Time Zone**: America/New_York
- **Runtime**: V8
- **Advanced Services**: Slides API v1

## Usage

### Basic Presentation Operations

```javascript
// Create a new presentation
function createPresentation() {
  const presentation = SlidesApp.create('New Presentation');
  const presentationId = presentation.getId();

  Logger.log('Created presentation with ID: ' + presentationId);
  return presentation;
}

// Add a slide
function addSlide(presentationId) {
  const presentation = SlidesApp.openById(presentationId);
  const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);

  // Add content to slide
  const shapes = slide.getShapes();
  shapes[0].getText().setText('Slide Title');
  shapes[1].getText().setText('Slide content goes here');

  return slide;
}
```

### Common Operations

1. **Presentation Creation**
   - Create presentations from templates
   - Bulk slide generation
   - Apply consistent themes

2. **Content Management**
   - Insert text, images, and shapes
   - Update slide content programmatically
   - Apply formatting and styles

3. **Data Integration**
   - Generate slides from spreadsheet data
   - Create charts and visualizations
   - Update presentations automatically

## Development

### Adding New Scripts

1. Create new file following naming convention: `slides-{function}-{description}.gs`
2. Add appropriate permissions to `appsscript.json` if needed
3. Use Slides API for advanced operations
4. Update this README with script details

### Testing

```javascript
// Test Slides API access
function testSlidesAccess() {
  try {
    // Create test presentation
    const presentation = SlidesApp.create('Test Presentation');
    const presentationId = presentation.getId();

    // Add a test slide
    const slide = presentation.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    Logger.log('Added slide to presentation');

    // Clean up
    DriveApp.getFileById(presentationId).setTrashed(true);
    return true;
  } catch (error) {
    Logger.log('Error: ' + error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

**API Limits**
- Slides API has request quotas
- Implement batch operations
- Use exponential backoff for retries

**Formatting Issues**
- Use Slides API for precise control
- Test with different themes
- Preserve aspect ratios for images

**Performance**
- Minimize API calls
- Use batch updates when possible
- Cache presentation data

## Resources

- [Google Slides API Documentation](https://developers.google.com/slides)
- [Apps Script Slides Service](https://developers.google.com/apps-script/reference/slides)
- [Main Repository](https://github.com/klappe-pm/Another-Google-Automation-Repo)

---

Last Updated: July 2025