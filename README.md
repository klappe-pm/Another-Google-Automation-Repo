# Workspace Automation

> **🚀 Google Workspace Automation Suite** - Production-ready Google Apps Script tools for streamlining business workflows and productivity automation.

## 📊 Overview

This comprehensive repository contains **80+ production-ready Google Apps Script tools** designed to automate, analyze, and optimize Google Workspace operations. Each script is thoroughly documented, tested, and follows consistent naming conventions and coding standards for personal productivity deployment.

**Total Scripts**: 80+ functional automation tools  
**Services Covered**: 7 Google Workspace services
**Maintained by**: Kevin Lappe (kevin@averageintelligence.ai)

---

## 🏗️ Repository Architecture

```
Workspace Automation/
├── 📧 Gmail/          28 scripts - Email management & analysis
├── 🗄️ Drive/          23 scripts - File organization & processing  
├── 📅 Calendar/       5 scripts  - Event export & analysis
├── 📄 Docs/           6 scripts  - Document conversion & formatting
├── 📊 Sheets/         6 scripts  - Data automation & indexing
├── ✅ Tasks/          3 scripts  - Task export & integration
├── 💬 Chat/           1 script   - Message export & analysis
└── 🎨 Slides/         0 scripts  - (Prepared for future development)
```

---

## 🎯 Service Coverage & Capabilities

### 📧 **Gmail Automation**
**Most Comprehensive Service** - Advanced email management and analysis tools

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (6) | PDF, Markdown, Sheets | Multi-format exports, automated processing |
| **Label Management** (10) | Analysis, Creation, Statistics | Smart labeling, bulk operations, analytics |
| **Data Analysis** (6) | 24-month trends, Metadata | Temporal analysis, content processing |
| **Utility Scripts** (4) | Markdown fixing, Bulk operations | Quality assurance, format correction |

**Notable Capabilities:**
- Export emails to PDF + Markdown + Sheets simultaneously
- Automated label creation based on sender patterns
- 24-month email data analysis with trend reporting
- Advanced YAML metadata extraction and processing

### 🗄️ **Drive Automation**
**File Management Powerhouse** - Comprehensive file organization and processing

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **File Indexing** (3) | All files, Docs, Markdown | Comprehensive cataloging, metadata extraction |
| **YAML Management** (6) | Frontmatter, Categories | Bulk YAML operations, Obsidian integration |
| **Markdown Processing** (3) | Link fixing, Formatting | Content standardization, quality assurance |
| **Note Generation** (2) | Weekly/Daily templates | Automated note creation, calendar integration |
| **File Management** (2) | Search, Conversion | Advanced file operations, format conversion |

**Notable Capabilities:**
- Index thousands of files with automatic categorization
- Bulk YAML frontmatter management for knowledge bases
- Automated weekly/daily note generation with calendar integration
- Advanced markdown processing and link validation

### 📅 **Calendar Integration**
**Event Management & Analysis** - Calendar data export and workflow integration

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (3) | Date ranges, Daily notes | Flexible export options, workflow integration |
| **Data Analysis** (1) | Duration, Distance metrics | Location-based analysis, travel time calculations |
| **Integration Tools** (1) | Obsidian export | Note-taking system integration |

**Notable Capabilities:**
- Export Google Calendar meetings to [Obsidian.md](obsidian.md) formatted files, with automatic markdown formatting
- Calculate travel distances and times using Google Maps API from Google Calendar event details
- Comprehensive event analysis with duration and location metrics
- GMail label usage analysis
- Create Google Drive folder and file trees
- Add metadata to Google Docs

### 📄 **Docs Processing**
**Document Conversion & Management** - Advanced document automation

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (3) | Markdown, Comments, Lists | Advanced conversion, metadata preservation |
| **Content Management** (2) | Dynamic embedding, Formatting | Live content updates, style standardization |
| **Integration Tools** (1) | Obsidian export | Knowledge management integration |

**Notable Capabilities:**
- Advanced Google Docs to Markdown conversion with image handling
- Dynamic content embedding between documents
- Comment extraction and analysis for collaboration tracking
- Batch formatting across multiple documents

### 📊 **Sheets Automation**
**Data Processing & Automation** - Spreadsheet workflow optimization

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Content Generation** (2) | Markdown, Tree diagrams | Visual data representation |
| **Data Processing** (1) | CSV operations | File combination and processing |
| **Indexing Tools** (2) | File/Folder indexing | Comprehensive data cataloging |
| **Automation Tools** (1) | Date processing | Workflow automation |

### ✅ **Tasks Management**
**Task Export & Integration** - Productivity workflow enhancement

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (2) | Markdown/YAML, Todos | Structured task export, status tracking |
| **Integration Tools** (1) | Obsidian export | Note-taking integration |

### 💬 **Chat Processing**
**Message Export & Analysis** - Communication workflow integration

| Category | Scripts | Key Features |
|----------|---------|--------------|
| **Export Functions** (1) | Daily details | Message archival and analysis |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Google Account** with Workspace access
- **Google Apps Script** project access
- **API Permissions** for target services
- **Drive Storage** for output files

### Universal Installation Process

1. **Navigate to Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Enable Required APIs**: 
   - Gmail API (for email scripts)
   - Drive API (for file operations)
   - Calendar API (for calendar scripts)
   - Docs/Sheets APIs (as needed)
4. **Copy Script Code**: Paste from repository
5. **Configure Variables**: Update folder IDs, settings
6. **Authorize Permissions**: Grant required access
7. **Test & Execute**: Run with small datasets first

### Common Configuration Steps

```javascript
// Update these variables in most scripts:
const OUTPUT_FOLDER_ID = 'your-drive-folder-id-here';
const TARGET_SPREADSHEET_ID = 'your-spreadsheet-id-here';
const DATE_RANGE = { start: '2025-01-01', end: '2025-12-31' };
```

---

## 💡 Common Use Cases & Solutions

### **Email Management & Analysis**
- **Challenge**: Overwhelming email volume and poor organization
- **Solutions**: Automated labeling, bulk export, trend analysis
- **Scripts**: `gmail-labels-create-sender.gs`, `gmail-analysis-24months.gs`

### **Knowledge Management**
- **Challenge**: Scattered information across Google Workspace
- **Solutions**: Unified indexing, markdown conversion, Obsidian integration
- **Scripts**: `drive-index-all-files.gs`, `docs-export-markdown-obsidian.gs`

### **Productivity Tracking**
- **Challenge**: Understanding time allocation and workflow efficiency
- **Solutions**: Calendar analysis, task tracking, automated reporting
- **Scripts**: `calendar-analysis-duration-distance.gs`, `tasks-export-markdown-yaml.gs`

### **Document Standardization**
- **Challenge**: Inconsistent formatting and metadata across documents
- **Solutions**: Bulk formatting, YAML frontmatter, automated processing
- **Scripts**: `docs-formatter.gs`, `drive-yaml-add-frontmatter-bulk.gs`

### **Data Integration**
- **Challenge**: Connecting Google Workspace with external systems
- **Solutions**: Structured exports, API integrations, automated workflows
- **Scripts**: Multiple export and integration tools across services

---

## 📖 Documentation Standards

### **Script Header Format**
Every script includes comprehensive metadata:

```javascript
/**
 * Title: {Descriptive Script Name}
 * Service: {Google Service}
 * Purpose: {Primary function and goal}
 * Created: {Creation date}
 * Updated: {Last modification date}
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: {Detailed purpose explanation}
- Description: {What the script does}
- Problem Solved: {Specific problem addressed}
- Successful Execution: {Expected outcomes}
*/
```

### **Naming Convention**
Consistent format: `{service}-{function}-{descriptor}.gs`

**Examples:**
- `gmail-export-pdf-markdown.gs`
- `drive-index-all-files.gs`
- `calendar-analysis-duration-distance.gs`
- `docs-export-markdown-advanced.gs`

### **README Structure**
Each service folder contains:
- **Overview**: Service description and capabilities
- **Scripts Table**: Complete inventory with purposes
- **Installation**: Step-by-step setup instructions
- **Usage Examples**: Common implementation patterns
- **Configuration**: Required variables and options
- **Troubleshooting**: Common issues and solutions
- **File Organization**: Visual folder structure

---

## ⚙️ Configuration & Customization

### **Required API Scopes**
Scripts request minimal necessary permissions:

```javascript
// Common OAuth scopes across scripts:
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/drive.file
- https://www.googleapis.com/auth/calendar.readonly
- https://www.googleapis.com/auth/documents.readonly
- https://www.googleapis.com/auth/spreadsheets
```

### **Environment Variables**
Key configuration options:

```javascript
// Universal settings available in most scripts:
const CONFIG = {
  dateRange: { start: '2025-01-01', end: '2025-12-31' },
  outputFormat: 'markdown', // 'pdf', 'sheets', 'json'
  batchSize: 100, // Processing batch size
  debugMode: false, // Enable detailed logging
  backupEnabled: true // Create backups before operations
};
```

### **Custom Integration Options**
- **Obsidian Integration**: YAML frontmatter and markdown formatting
- **External APIs**: Google Maps, custom webhooks
- **Automated Triggers**: Time-based and event-driven execution
- **Cross-Service Workflows**: Chained operations across multiple services

---

## 📊 Performance & Scalability

### **Processing Benchmarks**
Typical performance for common operations:

| Operation Type | Small (100 items) | Medium (1K items) | Large (10K+ items) |
|----------------|-------------------|-------------------|-------------------|
| **Email Export** | 2-5 minutes | 15-30 minutes | 1-2 hours |
| **File Indexing** | 1-3 minutes | 10-20 minutes | 45+ minutes |
| **Calendar Export** | 30 seconds | 2-5 minutes | 15+ minutes |
| **Document Conversion** | 1-2 minutes | 8-15 minutes | 30+ minutes |
| **Label Analysis** | 30 seconds | 3-5 minutes | 10+ minutes |

### **Optimization Strategies**
- **Batch Processing**: Handle large datasets in manageable chunks
- **Rate Limiting**: Respect Google API quotas and limits
- **Incremental Updates**: Process only new/changed items
- **Error Recovery**: Robust error handling with retry logic
- **Progress Tracking**: Monitor execution status and completion

### **Quota Management**
Key Google API limits to monitor:

```javascript
// Daily quotas (per project):
Gmail API: 1,000,000,000 quota units
Drive API: 20,000 requests per 100 seconds  
Calendar API: 1,000,000 requests per day
Sheets API: 300 requests per 100 seconds
Script Runtime: 6 minutes maximum per execution
```

---

## 🛠️ Troubleshooting & Support

### **Common Issues & Solutions**

#### **Permission Errors**
- **Cause**: Insufficient API permissions or disabled services
- **Solution**: Enable required APIs in Google Cloud Console
- **Prevention**: Follow installation checklist completely

#### **Script Timeouts**
- **Cause**: Processing too much data in single execution
- **Solution**: Implement batch processing or reduce dataset size
- **Prevention**: Use incremental processing for large operations

#### **API Quota Exceeded**
- **Cause**: Too many API calls in short time period
- **Solution**: Implement rate limiting and request batching
- **Prevention**: Monitor usage patterns and optimize calls

#### **File Access Errors**
- **Cause**: Incorrect folder IDs or insufficient permissions
- **Solution**: Verify IDs and sharing settings
- **Prevention**: Test with small datasets first

### **Debug & Monitoring Tools**

```javascript
// Enable comprehensive logging:
const DEBUG_CONFIG = {
  enabled: true,
  level: 'verbose', // 'basic', 'detailed', 'verbose'
  logToSheet: true, // Log to spreadsheet for analysis
  emailNotifications: true // Send completion notifications
};
```

### **Support Channels**
- **Technical Issues**: Create GitHub issue with detailed logs
- **Feature Requests**: Submit enhancement proposals
- **General Questions**: Email kevin@averageintelligence.ai
- **Collaboration**: Open to partnerships and contributions

---

## 🤝 Contributing Guidelines

### **Development Standards**
- **Code Style**: Follow established patterns and naming conventions
- **Documentation**: Include comprehensive headers and comments
- **Testing**: Verify functionality across different scenarios
- **Error Handling**: Implement robust error management
- **Performance**: Optimize for efficiency and scalability

### **Contribution Process**
1. **Fork Repository**: Create personal copy for development
2. **Create Branch**: Use descriptive branch names
3. **Follow Standards**: Adhere to naming and documentation conventions
4. **Test Thoroughly**: Verify functionality with various datasets
5. **Submit PR**: Include detailed description and examples
6. **Update Docs**: Ensure README files reflect changes

### **Quality Standards**
- **Script Headers**: Complete metadata and usage information
- **Error Handling**: Graceful failure management
- **Logging**: Comprehensive execution tracking
- **Performance**: Efficient resource utilization
- **Documentation**: Clear usage instructions and examples

---

## 🔒 Security & Privacy

### **Data Protection**
- **Local Processing**: All operations within Google's ecosystem
- **No External Storage**: Data remains in user's Google Workspace
- **Minimal Permissions**: Request only necessary access levels
- **Audit Trail**: Comprehensive logging of all operations

### **Privacy Principles**
- **User Control**: Full control over data processing and storage
- **Transparency**: Clear documentation of all operations
- **Consent**: Explicit permission requests for all access
- **Data Minimization**: Process only necessary information

### **Security Best Practices**
- **Permission Review**: Regular audit of granted permissions
- **Access Monitoring**: Track script execution and access patterns
- **Version Control**: Maintain script versions and change logs
- **Backup Strategy**: Secure backups before bulk operations

---

## 📈 Project Roadmap & Future Development

### **Completed Milestones** ✅
- **Repository Standardization**: Consistent naming and documentation
- **Script Organization**: Logical categorization by service and function
- **Comprehensive Documentation**: Complete README coverage
- **Quality Assurance**: Error handling and performance optimization

### **Planned Enhancements** 🚧
- **Google Slides Integration**: Presentation automation tools
- **Advanced Analytics**: Cross-service data analysis and reporting
- **Webhook Integration**: External system connectivity
- **Template Library**: Pre-configured script templates
- **Automated Testing**: Comprehensive test suite development

### **Long-term Vision** 🔮
- **Enterprise Features**: Advanced workflow orchestration
- **AI Integration**: Intelligent content processing and analysis
- **Third-party Connectors**: Integration with popular productivity tools
- **Community Contributions**: Open-source collaboration framework

---

## 📄 License & Legal

**License**: MIT License - Complete freedom for commercial and personal use

### **License Summary**
- ✅ **Commercial Use**: Allowed for business applications
- ✅ **Modification**: Customize and adapt scripts as needed
- ✅ **Distribution**: Share and redistribute freely
- ✅ **Private Use**: Use internally within organizations
- ❌ **Liability**: No warranty or liability provided
- ❌ **Support Guarantee**: Best-effort support only

### **Attribution**
While not required, attribution is appreciated:

```
Workspace Automation Scripts by Kevin Lappe
GitHub: github.com/kevinlappe/workspace-automation
Email: kevin@averageintelligence.ai
```

---

## 📞 Contact & Community

**Primary Contact**: Kevin Lappe  
**Email**: kevin@averageintelligence.ai  

---

## 🔗 Related Resources & Documentation

### **Official Google Resources**
- [Google Apps Script Documentation](https://developers.google.com/apps-script) - Official reference
- [Google Workspace APIs](https://developers.google.com/workspace) - Service-specific APIs
- [Google Cloud Console](https://console.cloud.google.com) - API management
- [Apps Script IDE](https://script.google.com) - Development environment

### **Learning Resources**
- [Apps Script Tutorials](https://developers.google.com/apps-script/guides) - Getting started guides
- [API Reference Guides](https://developers.google.com/apps-script/reference) - Complete API documentation
- [Best Practices](https://developers.google.com/apps-script/guides/best-practices) - Optimization guidelines
- [Troubleshooting Guide](https://developers.google.com/apps-script/guides/troubleshooting) - Common issues

**Repository Maintained Since**: 2023  
**Last Major Update**: July 16, 2025  
**Next Review Cycle**: October 2025  
**Version**: 2.0 (Standardized)
