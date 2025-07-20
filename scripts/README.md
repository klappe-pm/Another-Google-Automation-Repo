# Google Apps Script Automation Collection

## 📚 Overview

This folder contains **121+ Google Apps Scripts** organized by Google Workspace service. Each script automates specific tasks and workflows to enhance productivity and streamline operations across Google's ecosystem.

## 🗂️ Service Directories

| Service | Scripts | Primary Functions |
|---------|---------|-------------------|
| **📧 [Gmail](gmail/)** | 30+ scripts | Email management, label automation, export tools |
| **📁 [Drive](drive/)** | 21+ scripts | File indexing, YAML management, content organization |
| **📅 [Calendar](calendar/)** | 6+ scripts | Event export, analysis, Obsidian integration |
| **📄 [Docs](docs/)** | 6+ scripts | Markdown conversion, content extraction, formatting |
| **📊 [Sheets](sheets/)** | 6+ scripts | Data processing, visualization, CSV operations |
| **✅ [Tasks](tasks/)** | 3+ scripts | Task export, productivity analysis, integration |
| **💬 [Chat](chat/)** | 1+ scripts | Message export, communication analysis |
| **🎨 [Slides](slides/)** | Ready for development | Presentation automation (planned) |

## 🚀 Getting Started

### 1. Choose Your Service
Browse the service directories above to find automation scripts for your needs.

### 2. Setup Requirements
- Google Account with Workspace access
- Google Apps Script project access
- Required API permissions (see individual script documentation)

### 3. Installation Process
1. **Copy Script**: Copy desired `.gs` file to Google Apps Script
2. **Enable APIs**: Enable required Google APIs in Cloud Console
3. **Configure Settings**: Update folder IDs and parameters
4. **Test Execution**: Run with small datasets first

## 📋 Script Standards

### Naming Convention
All scripts follow the pattern: `service-function-descriptor.gs`
- **service**: gmail, drive, calendar, docs, sheets, tasks, chat
- **function**: export, import, analysis, create, update, delete
- **descriptor**: specific functionality in kebab-case

### Documentation Headers
Every script includes:
```javascript
/**
 * Title: Descriptive Script Name
 * Service: Google Service Used
 * Purpose: Primary function and goal
 * Created: Creation date
 * Updated: Last modification date
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */
```

## 🎯 Popular Use Cases

### Email Management
- **Problem**: Overwhelming inbox organization
- **Solutions**: [Gmail scripts](gmail/) for automated labeling and export
- **Best Scripts**: `gmail-export-pdf-markdown.gs`, `gmail-labels-create-sender.gs`

### Knowledge Management
- **Problem**: Scattered documents across Google Workspace
- **Solutions**: [Drive](drive/) and [Docs](docs/) scripts for unified organization
- **Best Scripts**: `drive-index-all-files.gs`, `docs-export-markdown-obsidian.gs`

### Productivity Analysis
- **Problem**: Understanding work patterns and efficiency
- **Solutions**: [Calendar](calendar/) and [Tasks](tasks/) scripts for analytics
- **Best Scripts**: `calendar-analysis-duration.gs`, `tasks-analysis-productivity.gs`

## 🔧 Service-Specific Features

### 📧 Gmail Automation
- **Advanced Export**: Multi-format email export (PDF, Markdown, Sheets)
- **Smart Labeling**: Automated label creation and management
- **Analytics**: 24-month trend analysis and statistics

### 📁 Drive Management
- **File Indexing**: Comprehensive cataloging of thousands of files
- **YAML Processing**: Bulk frontmatter management for knowledge bases
- **Content Organization**: Automated filing and structure maintenance

### 📅 Calendar Integration
- **Event Export**: Flexible date range exports to various formats
- **Location Analysis**: Distance and travel time calculations
- **Note Integration**: Automated daily/weekly note generation

### 📄 Document Processing
- **Format Conversion**: Google Docs to Markdown with image handling
- **Content Extraction**: Comments, metadata, and structure analysis
- **Dynamic Embedding**: Live content updates between documents

## 📖 Documentation

Each service directory contains:
- **README.md**: Service overview and script listings
- **Individual Scripts**: Comprehensive documentation headers
- **Usage Examples**: Common configuration and execution patterns
- **API Requirements**: Necessary permissions and setup

## 🔒 Security & Best Practices

### API Permissions
Scripts request minimal necessary permissions:
- **Read-only access** when possible
- **Specific scope targeting** (not broad permissions)
- **User consent required** for all operations

### Data Safety
- **No external data transmission** unless explicitly documented
- **Local processing** of sensitive information
- **User-controlled storage** locations and formats

## 🚀 Advanced Features

### Automation Integration
- **Triggers**: Time-based and event-driven execution
- **Batch Processing**: Efficient handling of large datasets
- **Error Handling**: Robust failure recovery and logging

### Customization Options
- **Configuration Variables**: Easy parameter adjustment
- **Template Support**: Customizable output formats
- **Extension Points**: Hooks for additional functionality

## 🤝 Contributing

### Adding New Scripts
1. Follow naming conventions
2. Include comprehensive documentation headers
3. Test with various data sizes
4. Update service README files

### Improving Existing Scripts
1. Maintain backward compatibility
2. Document breaking changes
3. Update modification dates
4. Test across different environments

## 📞 Support

- **Documentation**: Check service-specific README files
- **Issues**: Use GitHub issue templates
- **Contact**: kevin@averageintelligence.ai
- **License**: MIT (commercial use allowed)

## 📊 Repository Statistics

- **Total Scripts**: 121+ automation tools
- **Services Covered**: 8 Google Workspace services
- **Documentation Coverage**: 100% (all services documented)
- **Last Updated**: 2025-07-19

---

**Quick Start**: Choose a service directory above, read its README, and copy your first script to Google Apps Script! 🚀

**Repository**: [Workspace Automation (AGAR)](https://github.com/kevinlappe/workspace-automation)
