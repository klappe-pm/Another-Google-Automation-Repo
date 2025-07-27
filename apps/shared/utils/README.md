# Shared Utilities Library

This directory contains reusable utility functions for Google Apps Script projects.

## Modules

- **email-utils.gs** - Email parsing and processing utilities
- **drive-utils.gs** - Google Drive folder and file management
- **sheet-utils.gs** - Spreadsheet formatting and setup utilities
- **error-utils.gs** - Error handling and retry logic
- **common-utils.gs** - Common utilities (date formatting, validation)

## Usage

These utilities are designed to be copied into your Google Apps Script project as libraries or included directly in your script.

## Functions by Module

### email-utils.gs
- `extractEmail(fromString)` - Extract email address from sender string
- `extractName(fromString)` - Extract display name from sender string
- `parseEmailData(message)` - Parse email message into structured data

### drive-utils.gs
- `getOrCreateFolder(folderName, parentFolder)` - Get existing or create new folder
- `createFolderStructure(config)` - Create nested folder structure
- `safeCreateFile(folder, blob)` - Safely create file with retry

### sheet-utils.gs
- `setupSheet(sheet, headers)` - Initialize sheet with headers and formatting
- `formatSheet(sheet, config)` - Apply consistent formatting
- `insertDataIntoSheet(sheet, data, headers)` - Insert data with formatting

### error-utils.gs
- `safeOperation(operation, fallback, retries)` - Execute with retry logic
- `handleError(error, context)` - Standardized error handling
- `logError(error, severity)` - Structured error logging

### common-utils.gs
- `formatDate(date, format)` - Consistent date formatting
- `validateEmail(email)` - Email validation
- `generateId()` - Generate unique identifiers