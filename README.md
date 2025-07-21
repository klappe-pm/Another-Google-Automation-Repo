# Workspace Automation Scripts

**A Production-Ready Collection of Google Apps Script Tools**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/kevinlappe/workspace-automation/graphs/commit-activity)
[![GitHub last commit](https://img.shields.io/github/last-commit/kevinlappe/workspace-automation.svg)](https://GitHub.com/kevinlappe/workspace-automation/commit/)
[![Daily Health Check](https://github.com/kevinlappe/workspace-automation/actions/workflows/daily-health-check.yml/badge.svg)](https://github.com/kevinlappe/workspace-automation/actions/workflows/daily-health-check.yml)

## 📊 Overview

This comprehensive repository contains **79 production-ready Google Apps Script tools** designed to automate, analyze, and optimize Google Workspace operations. Each script is thoroughly documented, tested, and follows consistent naming conventions and coding standards.

**Total Scripts**: 79 functional automation tools  
**Services Covered**: 7 Google Workspace services  
**Maintained by**: Kevin Lappe (kevin@averageintelligence.ai)

---

## 🏗️ Repository Architecture

```
Workspace Automation/
├── 📧 Gmail/          35 scripts - Email management & analysis
├── 🗄️ Drive/          20 scripts - File organization & processing  
├── 📊 Sheets/         9 scripts  - Data automation & indexing
├── 📄 Docs/           6 scripts  - Document conversion & formatting
├── 📅 Calendar/       5 scripts  - Event export & analysis
├── ✅ Tasks/          3 scripts  - Task export & integration
├── 💬 Chat/           1 script   - Message export & analysis
└── 🎨 Slides/         0 scripts  - (Prepared for future development)
```

---

## 🎯 Service Coverage & Capabilities

### 📧 **Gmail Automation** (35 Scripts)
**Most Comprehensive Service** - Advanced email management and analysis tools

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (9) | PDF, Markdown, Sheets | Multi-format exports, automated processing |
| **Label Management** (15) | Analysis, Creation, Statistics | Smart labeling, bulk operations, analytics |
| **Analysis Tools** (7) | 24-month trends, Metadata | Temporal analysis, content processing |
| **Utility Tools** (4) | Markdown fixing, Bulk operations | Quality assurance, format correction |

**Notable Capabilities:**
- Export emails to PDF + Markdown + Sheets simultaneously
- Automated label creation based on sender patterns
- 24-month email data analysis with trend reporting
- Advanced YAML metadata extraction and processing

### 🗄️ **Drive Automation** (20 Scripts)
**File Management Powerhouse** - Comprehensive file organization and processing

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Content Management** (10) | File indexing, Markdown processing | Automated cataloging, content standardization |
| **YAML Management** (6) | Frontmatter, Categories | Bulk YAML operations, Obsidian integration |
| **Utility Tools** (4) | Deduplication, Tree generation | File optimization, visual organization |

**Notable Capabilities:**
- Index thousands of files with automatic categorization
- Manage YAML frontmatter in bulk for knowledge management systems
- Generate comprehensive file tree structures and hierarchies
- Advanced markdown processing and link management

### 📊 **Sheets Automation** (9 Scripts)
**Data Processing Center** - Automation and visualization tools

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Content Generation** (2) | Markdown, Tree diagrams | Visual data representation |
| **Data Processing** (1) | CSV operations | File combination and processing |
| **Indexing Tools** (2) | File/Folder cataloging | Comprehensive data organization |
| **Automation Tools** (1) | Date processing | Automated workflow triggers |
| **Utility Tools** (3) | Formatting, Sorting | Professional appearance, organization |

### 📅 **Calendar Automation** (5 Scripts)
**Time Management Excellence** - Event analysis and export functionality

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (3) | Date ranges, Daily exports | Flexible export options, workflow integration |
| **Analysis Tools** (1) | Duration, Distance metrics | Location-based analysis, travel calculations |
| **Content Tools** (1) | Obsidian integration | Note-taking system connectivity |

**Notable Capabilities:**
- Export calendar events to Obsidian-formatted markdown
- Calculate travel distances and times using Google Maps API
- Comprehensive event analysis with duration and location metrics

### 📄 **Docs Automation** (6 Scripts)
**Document Processing Hub** - Advanced conversion and formatting tools

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Content Management** (3) | Dynamic embedding, Formatting | Live content updates, style standardization |
| **Export Functions** (3) | Markdown, Comments, Lists | Advanced conversion, metadata preservation |

**Notable Capabilities:**
- Convert Google Docs to Markdown with image handling
- Embed dynamic content between documents
- Extract and analyze comments for collaboration insights

### ✅ **Tasks & 💬 Chat** (4 Scripts)
**Productivity Integration** - Task management and communication tools

| Service | Scripts | Key Features |
|---------|---------|--------------|
| **Tasks** (3) | Markdown/YAML export, Todos | Structured task export, Obsidian integration |
| **Chat** (1) | Daily details export | Message archival and analysis |

---

## 🚀 Quick Start Guide

### Prerequisites
- Google Account with Workspace access
- Access to Google Apps Script projects
- API permissions for target services
- Google Drive storage for output files

### Universal Installation Process

1. **Navigate to Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Enable Required APIs**:
   - Gmail API (for email scripts)
   - Drive API (for file operations)
   - Calendar API (for calendar scripts)
   - Docs/Sheets APIs (as needed)
4. **Copy Script Code**: Paste from repository
5. **Configure Variables**: Update folder IDs and settings
6. **Authorize Permissions**: Grant required access
7. **Test & Execute**: Run with small datasets first

### Common Configuration

```javascript
// Update these variables in most scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const TARGET_SPREADSHEET_ID = 'your-spreadsheet-id-here';
const DATE_RANGE = { start: '2025-01-01', end: '2025-12-31' };
```

---

## 💡 Featured Use Cases

### 📧 **Email Management Mastery**
**Challenge**: Overwhelming email volume, poor organization  
**Solution**: Automated labeling, bulk export, trend analysis  
**Scripts**: `gmail-labels-create-sender.gs`, `gmail-analysis-24months.gs`

### 🗄️ **Knowledge Management**
**Challenge**: Scattered information across Google Workspace  
**Solution**: Unified indexing, markdown conversion, Obsidian integration  
**Scripts**: `drive-index-all-files.gs`, `docs-export-markdown-obsidian.gs`

### 📅 **Productivity Analytics**
**Challenge**: Time management and productivity insights  
**Solution**: Calendar analysis, task export, comprehensive reporting  
**Scripts**: `calendar-analysis-duration-distance.gs`, `tasks-export-obsidian.gs`

---

## 📖 Professional Standards

### Script Header Format
Every script includes comprehensive metadata:

```javascript
/**
 * Title: Descriptive Script Name
 * Service: Google Service
 * Purpose: Primary function and goal
 * Created: 2024-MM-DD
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: Why this script exists
- Description: What the script accomplishes
- Problem Solved: Specific problem addressed
- Successful Execution: Expected outcomes
*/
```

### Naming Convention
All scripts follow consistent kebab-case naming:
- `{service}-{function}-{descriptor}.gs`
- Examples: `gmail-export-pdf-markdown.gs`, `drive-index-all-files.gs`

### Directory Organization
- **Service Folders**: Organized by Google Workspace service
- **Category Subfolders**: Grouped by functionality (Export, Analysis, Utility)
- **Legacy Files**: Properly archived in designated folders
- **Documentation**: Comprehensive READMEs for each service

---

## ⚙️ API Requirements

### Required OAuth Scopes
Scripts request minimal necessary permissions:

```javascript
// Common scopes across services:
- https://www.googleapis.com/auth/gmail
- https://www.googleapis.com/auth/drive.file
- https://www.googleapis.com/auth/calendar
- https://www.googleapis.com/auth/documents
- https://www.googleapis.com/auth/spreadsheets
```

### Security Best Practices
- **Minimal Permissions**: Only request necessary scopes
- **Data Privacy**: No data transmission outside Google ecosystem
- **Error Handling**: Comprehensive error management and logging
- **Rate Limiting**: Respectful API usage patterns

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Permission Errors
- **Cause**: Insufficient API permissions
- **Solution**: Enable required APIs in Google Cloud Console
- **Prevention**: Follow installation checklist completely

#### Script Timeouts
- **Cause**: Processing large datasets
- **Solution**: Implement batch processing or reduce dataset size
- **Prevention**: Use incremental processing for large operations

#### File Access Issues
- **Cause**: Incorrect folder/file IDs
- **Solution**: Verify and update ID variables in script
- **Prevention**: Test with small datasets first

---

## 📄 License & Usage

### MIT License
This project is licensed under the MIT License - see [LICENSE](LICENSE.md) for details.

#### License Summary
- ✅ **Commercial Use**: Allowed for business applications
- ✅ **Modification**: Customize and adapt scripts
- ✅ **Distribution**: Share and redistribute freely
- ✅ **Private Use**: Use internally within organizations
- ❌ **Liability**: No warranty provided
- ❌ **Support**: Best-effort community support

### Attribution
Attribution appreciated but not required:

```
Workspace Automation Scripts by Kevin Lappe
GitHub: github.com/kevinlappe/workspace-automation
Email: kevin@averageintelligence.ai
```

---

## 📚 Resources & Support

### Official Documentation
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Workspace APIs](https://developers.google.com/workspace)
- [Apps Script IDE](https://script.google.com)

### Community Resources
- [Apps Script Community](https://developers.google.com/apps-script/guides)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-apps-script)
- [Google Cloud Console](https://console.cloud.google.com/)

### Repository Information
- **Maintained Since**: 2023
- **Last Major Update**: July 21, 2025
- **Total Active Scripts**: 79 tools
- **Production Status**: Ready for immediate use

---

## 🤝 Contributing

This repository welcomes contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Follow naming conventions and header standards
4. Test thoroughly
5. Submit a pull request

### Quality Standards
- Follow existing naming conventions
- Include comprehensive script headers
- Add proper documentation
- Test with various datasets
- Maintain backward compatibility

---

**⭐ Star this repository if you find it helpful!**

*This repository represents 2+ years of Google Workspace automation development, standardized for professional use and community sharing.*
