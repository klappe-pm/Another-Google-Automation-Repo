# Gmail Automation Scripts

## 📧 Overview
Comprehensive Google Apps Scripts for Gmail automation, email management, label organization, and productivity analysis. This collection provides 35 tools for processing, analyzing, and organizing Gmail data across multiple formats and use cases.

**Total Scripts**: 35 active automation tools  
**Legacy Files**: 12 properly archived  
**Last Updated**: July 21, 2025  

## 📁 Script Organization

### 📤 Export Functions (9 Scripts)
Multi-format email export tools with advanced processing capabilities

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `gmail-export-advanced-sheets.gs` | Advanced spreadsheet export | Complex data structures, multiple sheets, formatting |
| `gmail-export-basic-sheets.gs` | Simple spreadsheet export | Basic email data, single sheet format |
| `gmail-export-docs-pdf.gs` | Google Docs and PDF generation | Document creation, formatting, batch processing |
| `gmail-export-emails-pdf-attachments.gs` | Email to PDF with attachments | Attachment handling, file organization, metadata |
| `gmail-export-labels-to-sheets.gs` | Label data to spreadsheets | Label hierarchies, organization metrics |
| `gmail-export-pdf-markdown.gs` | Dual PDF and Markdown export | Multi-format output, synchronized content |
| `gmail-export-pdf-only.gs` | PDF-focused export | Optimized PDF generation, formatting control |
| `gmail-export-transportation-emails-markdown.gs` | Transportation receipt export | Receipt processing, expense tracking, Markdown format |
| `gmail-export-weekly-threads.gs` | Weekly thread summaries | Time-based organization, thread grouping |

### 🏷️ Label Management (15 Scripts)
Comprehensive label automation, creation, analysis, and organization tools

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `gmail-analysis-label-statistics.gs` | Label usage statistics | Thread counts, message analysis, usage patterns |
| `gmail-analysis-labeled-vs-unlabeled-count.gs` | Label coverage analysis | Organization metrics, unlabeled email identification |
| `gmail-labels-analysis.gs` | Comprehensive label analysis | Statistical measures, attachment analysis, export to Sheets |
| `gmail-labels-auto-sender.gs` | Automatic sender-based labeling | Intelligent label creation, bulk processing |
| `gmail-labels-count.gs` | Label counting utilities | Quick counts, summary statistics |
| `gmail-labels-create-basic.gs` | Basic label creation | Simple label setup, category creation |
| `gmail-labels-create-sender.gs` | Sender-based label creation | Automated sender categorization, name extraction |
| `gmail-labels-date-processor.gs` | Date-based label processing | Time-based organization, monthly processing |
| `gmail-labels-delete-all.gs` | Bulk label deletion | Cleanup utilities, system reset |
| `gmail-labels-export-to-sheets.gs` | Label export to spreadsheets | Data export, backup, analysis preparation |
| `gmail-labels-statistics.gs` | Statistical analysis | Advanced metrics, trend analysis |
| `gmail-labels-status-count.gs` | Status-based counting | Read/unread analysis, status tracking |
| `gmail-labels-unread-count.gs` | Unread email analysis | Attention management, priority identification |
| `gmail-process-auto-label-by-sender.gs` | Automated sender processing | Bulk labeling with progress tracking |
| `gmail-utility-delete-all-labels.gs` | Complete label system reset | System cleanup, fresh start utility |

### 🔍 Analysis Tools (7 Scripts)
Advanced analytics and data processing for Gmail content and organization patterns

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `gmail-analysis-24months.gs` | 24-month email trend analysis | Temporal patterns, volume tracking, sender analysis |
| `gmail-analysis-label-stats.gs` | Label statistics deep dive | Thread counts, attachment analysis, statistical measures |
| `gmail-analysis-labels-data.gs` | Label usage and organization metrics | Label statistics, thread counts, usage patterns |
| `gmail-analysis-markdown-yaml-v2.gs` | Enhanced Markdown metadata analysis | YAML frontmatter processing, content categorization |
| `gmail-analysis-markdown-yaml.gs` | Basic Markdown metadata extraction | Content structure analysis, metadata parsing |
| `gmail-analysis-metadata-misc.gs` | Miscellaneous metadata analysis | Custom data extraction, format analysis |
| `gmail-metadata-tools.gs` | Metadata processing utilities | Data validation, format conversion, cleanup tools |

### 🛠️ Utility Tools (4 Scripts)
Supporting utilities for Gmail content processing and maintenance

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `gmail-utility-header-cleaner.gs` | Email header cleanup | Header standardization, metadata cleaning |
| `gmail-utility-mark-read.gs` | Bulk read status management | Status updates, batch processing |
| `gmail-utility-markdown-fixer.gs` | Markdown format correction | Text file linting, YAML frontmatter, spacing fixes |
| `gmail-utility-md-linter.gs` | Markdown quality assurance | Content validation, format checking |

## 🚀 Getting Started

### Prerequisites
- Google Account with Gmail access
- Google Apps Script project
- Required API permissions:
  - Gmail API (read/write as needed)
  - Google Sheets API (for export functions)
  - Google Drive API (for file operations)

### Quick Installation
1. **Choose Your Script**: Browse the categories above
2. **Copy to Apps Script**: Go to [script.google.com](https://script.google.com) and create new project
3. **Configure Settings**: Update folder IDs, date ranges, and parameters
4. **Enable APIs**: Activate required Google APIs in Cloud Console
5. **Test Execution**: Run with small datasets first
6. **Automate (Optional)**: Set up triggers for scheduled execution

### Common Configuration
```javascript
// Standard configuration pattern used across scripts
const CONFIG = {
  OUTPUT_FOLDER_ID: 'your-drive-folder-id-here',
  BATCH_SIZE: 100,
  DATE_RANGE: {
    START: new Date(2024, 0, 1),  // January 1, 2024
    END: new Date(2025, 0, 1)     // January 1, 2025
  },
  SEARCH_QUERY: 'after:2024/01/01 before:2025/01/01'
};
```

## 📋 Usage Workflows

### 📊 Email Organization Workflow
```
1. Run gmail-labels-analysis.gs to understand current state
2. Use gmail-labels-create-sender.gs for automated organization
3. Apply gmail-process-auto-label-by-sender.gs for bulk processing
4. Monitor with gmail-labels-statistics.gs for ongoing insights
```

### 📤 Data Export Workflow
```
1. Configure date ranges and search criteria
2. Choose format: gmail-export-pdf-markdown.gs for dual output
3. Run export with appropriate parameters
4. Use gmail-utility-markdown-fixer.gs for format optimization
```

### 📈 Analytics Workflow
```
1. Run gmail-analysis-24months.gs for trend understanding
2. Use gmail-analysis-label-stats.gs for detailed metrics
3. Export insights with gmail-export-advanced-sheets.gs
4. Apply findings to improve email management strategy
```

## 🔧 Advanced Configuration

### Search Parameters
All scripts support Gmail's advanced search syntax:
```javascript
// Examples of supported search patterns
const searchQueries = [
  'from:sender@domain.com',
  'after:2024/01/01 before:2024/12/31',
  'has:attachment label:important',
  'subject:"invoice" -in:spam',
  'is:unread newer_than:7d'
];
```

### Performance Optimization
```javascript
const PERFORMANCE_CONFIG = {
  BATCH_SIZE: 50,           // Optimal for most operations
  TIMEOUT: 300000,          // 5-minute timeout
  CACHE_DURATION: 3600,     // 1-hour cache
  MAX_THREADS: 500,         // Per execution limit
  RETRY_ATTEMPTS: 3         // Error recovery
};
```

## 🔒 Security & Privacy

### Data Protection
- **Local Processing**: All operations within Google's secure infrastructure
- **No External Transmission**: Scripts never send data to external services
- **Minimal Permissions**: Request only necessary Gmail/Drive/Sheets access
- **User-Controlled**: All exports go to user-specified Google Drive locations

### Best Practices
- **Test First**: Always test with small datasets (10-50 emails)
- **Backup Labels**: Export label structure before bulk operations
- **Monitor Quotas**: Track API usage to avoid daily limits
- **Review Permissions**: Regularly audit script permissions in Google Account

## 📊 Performance & Limits

### Optimization Features
- **Batch Processing**: Configurable batch sizes for optimal performance
- **Progress Tracking**: Detailed logging for large operations
- **Error Recovery**: Automatic retry with exponential backoff
- **Cache Management**: Smart caching for frequently accessed data

### Recommended Operational Limits
| Operation Type | Recommended Batch Size | Max Date Range | Expected Time |
|---------------|----------------------|----------------|---------------|
| **Label Operations** | 100 threads | 6 months | 2-5 minutes |
| **Export Functions** | 50 emails | 3 months | 5-10 minutes |
| **Analysis Scripts** | 200 emails | 12 months | 3-8 minutes |
| **Utility Functions** | 100 items | No limit | 1-3 minutes |

## 🔄 Integration Capabilities

### External System Integration
- **Obsidian**: Direct markdown export for knowledge management
- **Excel/Sheets**: Advanced spreadsheet integration with formatting
- **PDF Tools**: Professional PDF generation with metadata
- **Backup Systems**: Automated data archival and organization

### Automation Integration
- **Triggers**: Time-based execution for regular processing
- **Workflows**: Chain multiple scripts for complex operations
- **Monitoring**: Built-in logging and progress tracking
- **Notifications**: Email alerts for completion and errors

## 🤝 Contributing

### Development Standards
All scripts follow standardized practices:

```javascript
/**
 * Title: Gmail [Function] [Descriptor]
 * Service: Gmail
 * Purpose: [Clear purpose statement]
 * Created: YYYY-MM-DD
 * Updated: 2025-07-21
 * Author: Kevin Lappe
 * Contact: kevin@averageintelligence.ai
 * License: MIT
 */

/*
Script Summary:
- Purpose: [Why this script exists]
- Description: [What it accomplishes]
- Problem Solved: [Specific problem addressed]
- Successful Execution: [Expected outcomes]
*/
```

### Adding New Scripts
1. Follow naming convention: `gmail-[function]-[descriptor].gs`
2. Include comprehensive error handling and logging
3. Use standardized configuration patterns
4. Add to appropriate functional directory
5. Update this README with script details

## 📞 Support & Resources

### Documentation
- **Script Headers**: Each script includes comprehensive usage instructions
- **Inline Comments**: Detailed code documentation for customization
- **Error Messages**: Clear error reporting with suggested solutions

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Email Support**: kevin@averageintelligence.ai
- **Documentation**: [Google Apps Script Docs](https://developers.google.com/apps-script)

### License & Usage
- **License**: MIT License (commercial use allowed)
- **Attribution**: Optional but appreciated
- **Warranty**: No warranty provided - use at your own risk
- **Support**: Best-effort community support

---

**Repository**: [Workspace Automation](https://github.com/kevinlappe/workspace-automation)  
**Maintainer**: Kevin Lappe  
**Last Review**: July 21, 2025
