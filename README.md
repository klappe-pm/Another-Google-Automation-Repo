# Another Google Automation Repository (AGAR)

_AGAR: a gelatinous substance obtained from various kinds of red seaweed and used in biological culture media and as a thickener in foods._

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/kevinlappe/workspace-automation/graphs/commit-activity)
[![GitHub last commit](https://img.shields.io/github/last-commit/kevinlappe/workspace-automation.svg)](https://GitHub.com/kevinlappe/workspace-automation/commit/)
[![Daily Health Check](https://github.com/kevinlappe/workspace-automation/actions/workflows/daily-health-check.yml/badge.svg)](https://github.com/kevinlappe/workspace-automation/actions/workflows/daily-health-check.yml)
[![Repository Health](https://img.shields.io/badge/Health-Automated%20Monitoring-brightgreen)](https://github.com/kevinlappe/workspace-automation/actions)

Another Google Automation Repository (AGAR) is a curated collection of Google Apps Scripts that automate tasks and enhance functionality within the Google Workspace ecosystem. This repository offers a variety of scripts tailored for services such as Gmail, Drive, Calendar, Docs, Sheets, Tasks, and Chat.

**Maintained by:** Kevin Lappe  
**License:** MIT License  
**Use:** Both personal and commercial use at no cost

## 🚀 Key Features by Service

### 📧 Gmail

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Advanced Email Management | Export to PDF, Markdown, Sheets | Multi-format exports, automated processing |
| Automated Label Management | Analysis, Creation, Statistics | Smart labeling, bulk operations, analytics |
| Trend Analysis | 24-month trends, Metadata | Temporal analysis, content processing |

**Capabilities:**
- Export emails to PDF, Markdown, and Sheets simultaneously
- Automate label creation based on sender patterns
- Analyze 24-month email data with trend reporting

### 📁 Google Drive

| Category | Scripts | Key Features |
|----------|---------|--------------|
| File Indexing | Index All Files, Docs, Markdown | Comprehensive cataloging, metadata extraction |
| YAML Management | Manage Frontmatter, Categories | Bulk YAML operations, Obsidian integration |
| Markdown Processing | Fix Links, Format | Content standardization, quality assurance |
| Note Generation | Weekly/Daily Templates | Automated note creation, calendar integration |

**Capabilities:**
- Index thousands of files with automatic categorization
- Manage YAML frontmatter in bulk for knowledge bases
- Generate weekly/daily notes automatically with calendar integration

### 📅 Google Calendar

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Export Functions | Date ranges, Daily notes | Flexible export options, workflow integration |
| Data Analysis | Duration, Distance metrics | Location-based analysis, travel time calculations |
| Integration Tools | Obsidian export | Note-taking system integration |

**Capabilities:**
- Export Google Calendar meetings to Obsidian.md formatted files with automatic markdown formatting
- Calculate travel distances and times using the Google Maps API from Google Calendar event details
- Analyze events comprehensively with duration and location metrics

### 📄 Google Docs

| Category | Scripts | Key Features |
|----------|---------|--------------|
| Export Functions | Markdown, Comments, Lists | Advanced conversion, metadata preservation |
| Content Management | Dynamic embedding, Formatting | Live content updates, style standardization |
| Integration Tools | Obsidian export | Knowledge management integration |

**Capabilities:**
- Convert Google Docs to Markdown, including handling images
- Embed content dynamically between documents
- Extract and analyze comments for collaboration tracking

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

## 📁 Repository Architecture

```
Workspace Automation/
├── scripts/
│   ├── gmail/
│   ├── drive/
│   ├── calendar/
│   ├── docs/
│   ├── sheets/
│   ├── tasks/
│   ├── chat/
│   └── slides/
├── tools/
├── templates/
└── security/
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
   - Gmail API (for email scripts)
   - Drive API (for file operations)
   - Calendar API (for calendar scripts)
   - Docs/Sheets APIs (as needed)
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
- ✅ **Private Use:** Use internally within organizations
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
- [Best Practices](https://developers.google.com/apps-script/guides/best-practices)
- [Troubleshooting Guide](https://developers.google.com/apps-script/guides/support/troubleshooting)

## 🤖 Repository Automation

This repository features advanced automation for maintenance and quality assurance:

### Daily Health Checks
- **Automated Review**: Publication readiness analysis every day at 9:00 AM UTC
- **Security Scanning**: Daily vulnerability and security assessment
- **Quality Metrics**: Code quality and documentation coverage tracking
- **Automated Reports**: Comprehensive analytics generated and committed daily

### Weekly Deep Analysis
- **Trend Analysis**: Weekly repository trends and metrics
- **Release Readiness**: Automated assessment for potential releases
- **Performance Tracking**: Historical analysis and improvement recommendations

### Release Management
- **Automated Versioning**: Semantic version management with changelog generation
- **Release Preparation**: Automated release notes and documentation updates
- **GitHub Releases**: One-click release creation with comprehensive notes

**View Automation Status**: Check the [Actions tab](https://github.com/kevinlappe/workspace-automation/actions) for real-time automation status.

## 📊 Repository Info

- **Repository Maintained Since:** 2023
- **Last Major Update:** July 19, 2025
- **Next Review Cycle:** October 2025
- **Version:** 2.0

**⭐ Star this repository if you find it helpful!**
