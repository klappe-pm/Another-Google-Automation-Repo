<<<<<<< HEAD
# Another Google Automation Repository (AGAR)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/kevinlappe/workspace-automation/graphs/commit-activity)
[![GitHub last commit](https://img.shields.io/github/last-commit/kevinlappe/workspace-automation.svg)](https://GitHub.com/kevinlappe/workspace-automation/commit/)

Another Google Automation Repository (AGAR) is a curated collection of Google Apps Scripts that automate tasks and enhance functionality within the Google Workspace ecosystem. This repository offers a variety of scripts tailored for services such as Gmail, Drive, Calendar, Docs, Sheets, Tasks, and Chat.

**Maintained by:** Kevin Lappe  
**License:** MIT License  
**Use:** Both personal and commercial use at no cost

## 🚀 Key Features by Service

### 📧 Gmail

=======
# Another Google Automation Repo (AGAR)

_AGAR: a gelatinous substance obtained from various kinds of red seaweed and used in biological culture media and as a thickener in foods._

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/kevinlappe/workspace-automation/graphs/commit-activity)
[![GitHub last commit](https://img.shields.io/github/last-commit/kevinlappe/workspace-automation.svg)](https://GitHub.com/kevinlappe/workspace-automation/commit/)

Another Google Automation Repo (AGAR) offers a collection of Google Apps Scripts. These scripts automate tasks and enhance functionality across the Google Workspace ecosystem. AGAR provides a variety of tailored solutions to help you optimize your workflow and boost productivity, whether you manage operations in Gmail, Drive, Calendar, Docs, Sheets, Tasks, or Chat.

**Maintained by:** Kevin Lappe, _like happy_
**License:** MIT License  

## 🚀 Key Features

### 📧 Gmail

>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
| Category | Scripts | Key Features |
|----------|---------|--------------|
| Advanced Email Management | Export to PDF, Markdown, Sheets | Multi-format exports, automated processing |
| Automated Label Management | Analysis, Creation, Statistics | Smart labeling, bulk operations, analytics |
| Trend Analysis | 24-month trends, Metadata | Temporal analysis, content processing |

<<<<<<< HEAD
**Capabilities:**
- Export emails to PDF, Markdown, and Sheets simultaneously
- Automate label creation based on sender patterns
- Analyze 24-month email data with trend reporting

=======
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
### 📁 Google Drive

| Category | Scripts | Key Features |
|----------|---------|--------------|
| File Indexing | Index All Files, Docs, Markdown | Comprehensive cataloging, metadata extraction |
| YAML Management | Manage Frontmatter, Categories | Bulk YAML operations, Obsidian integration |
| Markdown Processing | Fix Links, Format | Content standardization, quality assurance |
| Note Generation | Weekly/Daily Templates | Automated note creation, calendar integration |

<<<<<<< HEAD
**Capabilities:**
- Index thousands of files with automatic categorization
- Manage YAML frontmatter in bulk for knowledge bases
- Generate weekly/daily notes automatically with calendar integration

=======
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
### 📅 Google Calendar

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Export Functions | Date ranges, Daily notes | Flexible export options, workflow integration |
| Data Analysis | Duration, Distance metrics | Location-based analysis, travel time calculations |
| Integration Tools | Obsidian export | Note-taking system integration |

<<<<<<< HEAD
**Capabilities:**
- Export Google Calendar meetings to Obsidian.md formatted files with automatic markdown formatting
- Calculate travel distances and times using the Google Maps API from Google Calendar event details
- Analyze events comprehensively with duration and location metrics

=======
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
### 📄 Google Docs

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Export Functions | Markdown, Comments, Lists | Advanced conversion, metadata preservation |
| Content Management | Dynamic embedding, Formatting | Live content updates, style standardization |
| Integration Tools | Obsidian export | Knowledge management integration |

<<<<<<< HEAD
**Capabilities:**
- Convert Google Docs to Markdown, including handling images
- Embed content dynamically between documents
- Extract and analyze comments for collaboration tracking
=======
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43

### 📊 Google Sheets

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Content Generation | Markdown, Tree diagrams | Visual data representation |
| Data Processing | CSV operations | File combination and processing |
| Indexing Tools | File/Folder indexing | Comprehensive data cataloging |

### ✅ Google Tasks & 💬 Chat

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Export Functions | Markdown/YAML, Todos | Structured task export, status tracking |
| Integration Tools | Obsidian export | Note-taking integration |
| Chat Export | Daily details | Message archival and analysis |

<<<<<<< HEAD
## 📁 Repository Architecture
=======
## 📁 Repo Architecture
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43

```
Workspace Automation/
├── Gmail/
├── Drive/
├── Calendar/
├── Docs/
├── Sheets/
├── Tasks/
├── Chat/
└── Slides/
```

## 🚀 Quick Start Guide

### Prerequisites

- A Google Account with Workspace access
- Access to Google Apps Script projects
- API Permissions for target services
- Drive Storage for output files

### Universal Installation Process

1. **Navigate to Apps Script:** Go to [script.google.com](https://script.google.com)
2. **Create a New Project:** Click "New Project"
3. **Enable Required APIs:**
<<<<<<< HEAD
   - Gmail API (for email scripts)
   - Drive API (for file operations)
   - Calendar API (for calendar scripts)
   - Docs/Sheets APIs (as needed)
=======
   - Gmail API
   - Drive API
   - Calendar API
   - Docs API
   - Sheets API
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
4. **Copy Script Code:** Paste from the repository
5. **Configure Variables:** Update folder IDs and settings
6. **Authorize Permissions:** Grant required access
7. **Test & Execute:** Run with small datasets first

### Common Configuration Steps

```javascript
// Update these variables in most scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const TARGET_SPREADSHEET_ID = 'your-spreadsheet-id-here';
const DATE_RANGE = { start: '2025-01-01', end: '2025-12-31' };
```

## 💡 Common Use Cases & Solutions

### Email Management & Analysis
- **Challenge:** Overwhelming email volume and poor organization
- **Solutions:** Automate labeling, bulk export, and trend analysis
- **Scripts:** `gmail-labels-create-sender.gs`, `gmail-analysis-24months.gs`

### Knowledge Management
- **Challenge:** Scattered information across Google Workspace
- **Solutions:** Unified indexing, markdown conversion, Obsidian integration
- **Scripts:** `drive-index-all-files.gs`, `docs-export-markdown-obsidian.gs`

## 📖 Documentation Standards

### Script Header Format

```javascript
/**
 * Every script includes comprehensive metadata:
 * Title: Descriptive Script Name
 * Service: Google Service
 * Purpose: Primary function and goal
 * Created: Creation date
 * Updated: Last modification date
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
#### Script Summary:
- Purpose: Detailed purpose explanation
- Description: What the script does
- Problem Solved: Specific problem addressed
- Successful Execution: Expected outcomes
*/
```

## ⚙️ Configuration & Customization

### Required API Scopes

```javascript
// Common OAuth scopes across scripts:
// Scripts request minimal necessary permissions
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/drive.file
- https://www.googleapis.com/auth/calendar.readonly
- https://www.googleapis.com/auth/documents.readonly
- https://www.googleapis.com/auth/spreadsheets
```

## 🔧 Troubleshooting & Support

### Common Issues & Solutions

#### Permission Errors
- **Cause:** Insufficient API permissions or disabled services
- **Solution:** Enable required APIs in Google Cloud Console
- **Prevention:** Follow the installation checklist completely

#### Script Timeouts
- **Cause:** Processing too much data in a single execution
- **Solution:** Implement batch processing or reduce dataset size
- **Prevention:** Use incremental processing for large operations

## 📄 License & Attribution

**License:** MIT License - Complete freedom for commercial and personal use. See the [LICENSE](LICENSE) file for details.

### License Summary
- ✅ **Commercial Use:** Allowed for business applications
- ✅ **Modification:** Customize and adapt scripts as needed
- ✅ **Distribution:** Share and redistribute freely
<<<<<<< HEAD
- ✅ **Private Use:** Use internally within organizations
=======
- ✅ **Private Use:** Use for your own projects
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
- ❌ **Liability:** No warranty or liability provided
- ❌ **Support Guarantee:** Best-effort support only

### Attribution

Attribution is appreciated but not required.

```
Workspace Automation Scripts by Kevin Lappe
GitHub: github.com/kevinlappe/workspace-automation
Email: kevin@averageintelligence.ai
```

## 📚 Related Resources & Documentation

### Official Google Resources
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Workspace APIs](https://developers.google.com/workspace)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Apps Script IDE](https://script.google.com)

### Learning Resources
- [Apps Script Tutorials](https://developers.google.com/apps-script/guides)
- [API Reference Guides](https://developers.google.com/apps-script/reference)
<<<<<<< HEAD
- [Best Practices](https://developers.google.com/apps-script/guides/best-practices)
- [Troubleshooting Guide](https://developers.google.com/apps-script/guides/support/troubleshooting)

## 📊 Repository Info

- **Repository Maintained Since:** 2023
- **Last Major Update:** July 16, 2025
- **Next Review Cycle:** October 2025
- **Version:** 2.0
=======
- [Troubleshooting Guide](https://developers.google.com/apps-script/guides/support/troubleshooting)
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43

## 📊 Repository Info

<<<<<<< HEAD
**⭐ Star this repository if you find it helpful!**
=======
- **Repository Maintained Since:** 2023
- **Last Major Update:** July 16, 2025
- **Next Review Cycle:** October 2025
- **Version:** 2.0

**⭐ Star this repository if you find it helpful!**
>>>>>>> 41869746819870db34440ddc6829136a86ff8d43
