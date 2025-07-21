# Sheets Automation Scripts

## 📊 Overview
Google Apps Scripts for Google Sheets automation, data processing, content generation, and advanced spreadsheet operations. This collection provides 9 tools for transforming spreadsheet data into various formats and automating complex data workflows.

**Total Scripts**: 9 active automation tools  
**Last Updated**: July 21, 2025  

## 📁 Script Organization

### 📝 Content Generation (2 Scripts)
Advanced content creation and markdown generation tools

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `sheets-create-markdown.gs` | Generate markdown from sheet data | Template-based conversion, structured formatting, bulk processing |
| `sheets-create-tree-diagram.gs` | Create visual tree diagrams | Hierarchical visualization, markdown output, interactive trees |

### 🔄 Data Processing (1 Script)
CSV operations and data transformation tools

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `sheets-csv-combiner.gs` | Combine multiple CSV files | Batch processing, automatic deduplication, error handling |

### 📊 Indexing Tools (2 Scripts)
File and folder cataloging systems

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `sheets-index-folders-files.gs` | Comprehensive Drive indexing | Complete file cataloging, metadata extraction, hierarchical organization |
| `sheets-index-general.gs` | General-purpose indexing | Flexible indexing system, customizable output, batch processing |

### ⚡ Automation Tools (1 Script)
Workflow automation and processing triggers

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `sheets-process-date-automation.gs` | Date-based processing automation | Trigger-based execution, date range filtering, automated workflows |

### 🛠️ Utility Tools (3 Scripts)
Formatting, organization, and maintenance utilities

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `sheets-format-comprehensive-styling.gs` | Comprehensive sheet formatting | Professional styling, consistent formatting, bulk operations |
| `sheets-utility-tab-sorter.gs` | Worksheet organization | Automated sorting, tab management, structure optimization |
| `sheets-export-markdown-files.gs` | Advanced markdown export | Multi-format export, template system, batch processing |

## 🚀 Getting Started

### Prerequisites
- Google Account with Sheets access
- Google Apps Script project
- Required API permissions:
  - Google Sheets API (read/write access)
  - Google Drive API (for file operations)
  - Google Docs API (for document integration)

### Quick Installation
1. **Choose Your Script**: Browse categories above based on your automation needs
2. **Copy to Apps Script**: Go to [script.google.com](https://script.google.com) and create new project
3. **Configure Settings**: Update spreadsheet IDs, ranges, and output parameters
4. **Enable APIs**: Activate required Google APIs in Cloud Console
5. **Test Execution**: Run with small datasets first to validate configuration
6. **Scale Operations**: Apply to larger spreadsheets once validated

### Common Configuration
```javascript
// Standard configuration pattern used across scripts
const CONFIG = {
  SPREADSHEET_ID: 'your-spreadsheet-id-here',
  OUTPUT_FOLDER_ID: 'your-drive-folder-id-here',
  DATA_RANGE: 'A1:Z1000',          // Adjust based on your data
  BATCH_SIZE: 100,                 // Rows per processing batch
  INCLUDE_HEADERS: true,           // Include header row in processing
  OUTPUT_FORMAT: 'markdown'        // Default output format
};
```

## 📋 Usage Workflows

### 📝 Content Generation Workflow
```
1. sheets-create-markdown.gs         // Generate structured markdown
2. sheets-create-tree-diagram.gs     // Create visual hierarchies
3. sheets-format-comprehensive-styling.gs // Apply professional formatting
4. sheets-export-markdown-files.gs   // Export to Drive files
```

### 📊 Data Processing Workflow
```
1. sheets-csv-combiner.gs            // Combine external CSV data
2. sheets-process-date-automation.gs // Apply date-based processing
3. sheets-utility-tab-sorter.gs      // Organize worksheets
4. sheets-format-comprehensive-styling.gs // Apply consistent formatting
```

### 🗂️ Drive Integration Workflow
```
1. sheets-index-folders-files.gs     // Catalog Drive structure
2. sheets-index-general.gs           // General-purpose indexing
3. sheets-create-tree-diagram.gs     // Visualize folder hierarchy
4. sheets-export-markdown-files.gs   // Export documentation
```

## 🔧 Advanced Configuration

### Data Processing Settings
```javascript
const PROCESSING_CONFIG = {
  DATA_SOURCES: {
    RANGE: 'A1:Z',              // Dynamic range detection
    HEADERS: 'A1:Z1',           // Header row specification
    DATA_START: 'A2',           // Data starting cell
    MAX_ROWS: 10000             // Maximum rows to process
  },
  OUTPUT_OPTIONS: {
    FORMAT: 'markdown',          // Output format preference
    TEMPLATE: 'standard',        // Template selection
    INCLUDE_METADATA: true,      // Add creation metadata
    FILE_NAMING: '${date}_${title}' // Dynamic file naming
  }
};
```

### Template System Configuration
```javascript
const TEMPLATE_CONFIG = {
  MARKDOWN_TEMPLATES: {
    TABLE: 'table-format',       // Standard table formatting
    LIST: 'bullet-list',         // Bulleted list format
    TREE: 'hierarchical-tree',   // Tree structure format
    DOCUMENT: 'full-document'    // Complete document format
  },
  FORMATTING_OPTIONS: {
    HEADERS: {
      H1: '# ${title}',
      H2: '## ${section}',
      H3: '### ${subsection}'
    }
  }
};
```

## 📊 Key Features by Category

### 📝 Content Generation
- **Template-Based Conversion**: Transform spreadsheet data using customizable markdown templates
- **Visual Tree Generation**: Create hierarchical diagrams with interactive navigation and linking
- **Structured Formatting**: Professional document generation with consistent styling and layout
- **Bulk Processing**: Handle large datasets with batch processing and progress tracking

### 🔄 Data Processing
- **CSV Integration**: Seamlessly combine multiple CSV files with intelligent header management
- **Data Validation**: Comprehensive error checking and data type validation with cleanup options
- **Date Automation**: Advanced date-based processing with timezone support and recurring operations
- **Conflict Resolution**: Smart handling of duplicate data and conflicting information

### 📊 Indexing and Organization
- **Drive Integration**: Complete Google Drive file and folder indexing with metadata extraction
- **Flexible Cataloging**: Customizable indexing parameters with multiple output format options
- **Hierarchical Mapping**: Visual representation of folder structures and file relationships
- **Search Optimization**: Structured data organization for enhanced discoverability and navigation

### 🛠️ Utility and Maintenance
- **Professional Formatting**: Consistent styling across all worksheets with corporate-standard appearance
- **Automated Organization**: Intelligent tab sorting and worksheet management with naming conventions
- **Export Systems**: Advanced file export capabilities with template-based formatting and batch operations
- **Quality Assurance**: Data validation and format checking with automated correction suggestions

## 🔒 Security & Privacy

### Data Protection
- **Local Processing**: All operations within Google's secure infrastructure
- **Permission-Based**: Scripts request only necessary Sheets/Drive permissions
- **No External Services**: Zero data transmission to third-party platforms
- **User-Controlled**: All operations require explicit user authorization

### Best Practices
- **Data Backup**: Always backup important spreadsheets before bulk operations
- **Permission Review**: Regularly audit script permissions and access levels
- **Test Environment**: Validate scripts with copy spreadsheets before production use
- **Access Control**: Implement proper sharing settings for generated documents

## 📈 Performance & Scaling

### Optimization Features
- **Smart Batching**: Optimal batch sizes for different operation types (50-100 rows)
- **Memory Management**: Efficient memory usage for large spreadsheet processing
- **Progress Tracking**: Real-time progress updates with detailed status information
- **Error Recovery**: Robust error handling with automatic recovery and resumption

### Performance Guidelines

| Spreadsheet Size | Recommended Batch Size | Expected Processing Time | Memory Requirements |
|------------------|----------------------|------------------------|-------------------|
| **Small** (< 1,000 rows) | 100 rows | 30 seconds - 2 minutes | Standard |
| **Medium** (1,000-10,000 rows) | 250 rows | 2-10 minutes | Monitor usage |
| **Large** (10,000-50,000 rows) | 500 rows | 10-30 minutes | High memory mode |
| **Enterprise** (50,000+ rows) | 1,000 rows | 30+ minutes | Dedicated processing |

## 🔄 Integration Capabilities

### External System Integration
- **Documentation Systems**: Direct export to wikis, knowledge bases, and documentation platforms
- **Project Management**: Integration with project tracking and task management systems
- **Business Intelligence**: Data export for analytics platforms and reporting tools
- **Content Management**: Structured content generation for websites and publications

### Workflow Automation
- **Scheduled Processing**: Time-based triggers for regular data processing and updates
- **Event-Driven Actions**: Automatic processing when spreadsheet data changes
- **Chain Operations**: Sequential script execution for complex multi-step workflows
- **Notification Systems**: Email and chat notifications for completion status and errors

## 🤝 Contributing

### Development Standards
All scripts follow professional development practices:

```javascript
/**
 * Title: Sheets [Function] [Descriptor]
 * Service: Google Sheets
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

### Contribution Guidelines
1. **Naming Convention**: Follow `sheets-[function]-[descriptor].gs` pattern
2. **Error Handling**: Implement comprehensive error recovery and user feedback
3. **Configuration**: Use standardized `CONFIG` object for all settings
4. **Performance**: Optimize for large datasets with batch processing
5. **Documentation**: Include detailed examples and usage instructions

## 📞 Support & Resources

### Documentation & Help
- **Script Headers**: Each script includes comprehensive usage instructions and examples
- **Configuration Guides**: Detailed setup instructions with common troubleshooting solutions
- **Error Handling**: Clear error messages with suggested resolutions and recovery steps
- **Best Practices**: Documented optimization techniques for various use cases

### Getting Support
- **GitHub Issues**: Bug reports and feature requests via repository issues
- **Email Support**: Direct technical support at kevin@averageintelligence.ai
- **Community**: Google Apps Script forums and Stack Overflow
- **Documentation**: Official Google Sheets API and Apps Script documentation

### License & Commercial Use
- **License**: MIT License - full commercial use permitted
- **Attribution**: Optional but appreciated for public implementations
- **Warranty**: No warranty provided - thorough testing recommended
- **Support Level**: Best-effort community support with active maintenance

---

**Repository**: [Workspace Automation](https://github.com/kevinlappe/workspace-automation)  
**Maintainer**: Kevin Lappe  
**Last Review**: July 21, 2025
