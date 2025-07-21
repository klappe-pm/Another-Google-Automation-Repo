# Drive Automation Scripts

## 📁 Overview
Comprehensive Google Apps Scripts for Google Drive file management, organization, indexing, and workflow automation. This collection provides 20 tools for processing Drive content, managing file structures, and automating document workflows across large file repositories.

**Total Scripts**: 20 active automation tools  
**Legacy Files**: 6 properly archived  
**Last Updated**: July 21, 2025  

## 📁 Script Organization

### 📝 Content Management (10 Scripts)
Advanced content processing, indexing, and organization tools

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `drive-docs-find-by-alias.gs` | Document search by alias/keywords | Alias-based discovery, metadata search, content indexing |
| `drive-index-all-files.gs` | Comprehensive Drive file indexing | Complete file cataloging, metadata extraction, hierarchical organization |
| `drive-index-docs-files.gs` | Google Docs specific indexing | Document content analysis, structure mapping, cross-references |
| `drive-index-markdown-files.gs` | Markdown file organization | MD file processing, frontmatter extraction, link validation |
| `drive-markdown-lint-spacing.gs` | Markdown formatting validation | Spacing standardization, format consistency, quality assurance |
| `drive-markdown-move-update-metadata.gs` | Markdown metadata management | Bulk metadata updates, file organization, frontmatter sync |
| `drive-markdown-process-blank-links.gs` | Link validation and repair | Broken link detection, URL validation, reference integrity |
| `drive-notes-create-weekly-daily.gs` | Automated note generation | Weekly/daily note templates, calendar integration, structure automation |
| `drive-notes-generate-weekly.gs` | Weekly note automation | Template-based note creation, recurring content, workflow integration |
| `drive-shortcuts-convert.gs` | Shortcut management utility | Shortcut conversion, link resolution, reference optimization |

### 🛠️ Utility Tools (4 Scripts)
Core utilities for Drive management, organization, and maintenance

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `drive-index-file-tree-generator.gs` | Visual file tree generation | Hierarchical visualization, HTML output, navigation trees |
| `drive-manager-comprehensive-indexer.gs` | Advanced Drive management | Complete indexing system, batch processing, metadata management |
| `drive-utility-deduplicate-files.gs` | Duplicate file removal | Duplicate detection, smart deletion, cleanup automation |
| `drive-utility-folder-ids.gs` | Folder ID reference tool | Recursive folder listing, ID extraction, reference generation |

### 📋 YAML Management (6 Scripts)
Specialized tools for YAML frontmatter processing and metadata management

| Script Name | Purpose | Key Features |
|-------------|---------|--------------|
| `drive-yaml-add-frontmatter-bulk.gs` | Bulk YAML frontmatter addition | Mass metadata application, template-based headers, batch processing |
| `drive-yaml-add-frontmatter-multi.gs` | Multi-file YAML processing | Selective frontmatter updates, category-based processing |
| `drive-yaml-add-simple.gs` | Simple YAML addition | Basic frontmatter insertion, minimal metadata, quick setup |
| `drive-yaml-dataview-categories.gs` | Dataview-compatible categorization | Obsidian integration, category management, dataview optimization |
| `drive-yaml-finder.gs` | YAML content discovery | Frontmatter search, metadata queries, content organization |
| `drive-yaml-folder-categories.gs` | Folder-based categorization | Hierarchical category assignment, folder structure mapping |

## 🚀 Getting Started

### Prerequisites
- Google Account with Drive access
- Google Apps Script project
- Required API permissions:
  - Google Drive API (read/write access)
  - Google Docs API (for document processing)
  - Google Sheets API (for index exports)

### Quick Installation
1. **Choose Your Script**: Browse categories above based on your automation needs
2. **Copy to Apps Script**: Go to [script.google.com](https://script.google.com) and create new project
3. **Configure Settings**: Update folder IDs, file patterns, and processing parameters
4. **Enable APIs**: Activate required Google APIs in Cloud Console
5. **Test Execution**: Run with small file sets first to validate configuration
6. **Scale Operations**: Apply to larger repositories once validated

### Common Configuration
```javascript
// Standard configuration pattern used across scripts
const CONFIG = {
  ROOT_FOLDER_ID: 'your-folder-id-here',
  BATCH_SIZE: 50,                    // Files per processing batch
  TIMEOUT: 300000,                   // 5-minute timeout
  INCLUDE_SUBFOLDERS: true,          // Recursive processing
  OUTPUT_FORMAT: 'markdown',         // Default output format
  CACHE_DURATION: 3600              // 1-hour cache
};
```

## 📋 Usage Workflows

### 🗂️ File Organization Workflow
```
1. drive-index-all-files.gs          // Catalog all content
2. drive-utility-deduplicate-files.gs // Remove duplicates
3. drive-utility-folder-ids.gs       // Map folder structure
4. drive-manager-comprehensive-indexer.gs // Advanced management
```

### 📝 Content Management Workflow
```
1. drive-index-markdown-files.gs     // Catalog markdown content
2. drive-yaml-add-frontmatter-bulk.gs // Apply metadata
3. drive-markdown-lint-spacing.gs    // Format validation
4. drive-markdown-process-blank-links.gs // Link integrity
```

### 📊 Knowledge Base Workflow
```
1. drive-yaml-dataview-categories.gs // Dataview optimization
2. drive-notes-create-weekly-daily.gs // Automated notes
3. drive-docs-find-by-alias.gs      // Content discovery
4. drive-index-file-tree-generator.gs // Visual mapping
```

## 🔧 Advanced Configuration

### File Processing Settings
```javascript
const PROCESSING_CONFIG = {
  FILE_TYPES: {
    MARKDOWN: ['.md', '.markdown'],
    DOCUMENTS: ['.docx', '.doc', '.gdoc'],
    IMAGES: ['.jpg', '.png', '.gif', '.svg'],
    ALL: ['*']
  },
  PROCESSING_MODE: {
    INDEX_ONLY: 'index',        // Create catalog without modifications
    UPDATE_METADATA: 'update',   // Update file metadata and frontmatter
    RESTRUCTURE: 'restructure'   // Reorganize file structure
  },
  YAML_TEMPLATE: {
    title: '${filename}',
    created: '${createdDate}',
    modified: '${modifiedDate}',
    tags: ['${folderName}'],
    category: '${parentFolder}',
    type: 'note'
  }
};
```

### Performance Optimization
```javascript
const PERFORMANCE_CONFIG = {
  BATCH_SIZE: 50,              // Optimal for most operations
  CACHE_SIZE: 1000,            // Items to cache
  RETRY_ATTEMPTS: 3,           // Error recovery
  PROGRESS_INTERVAL: 10,       // Progress update frequency
  MEMORY_THRESHOLD: 0.8        // Memory usage limit
};
```

## 📊 Key Features by Category

### 📝 Content Processing
- **Comprehensive Indexing**: Complete Drive cataloging with metadata extraction and hierarchy mapping
- **Markdown Specialization**: Advanced markdown processing with frontmatter management and link validation
- **Document Analysis**: Deep content analysis for Google Docs with structure mapping and cross-references
- **Template Automation**: Intelligent note generation with calendar integration and recurring content
- **Quality Assurance**: Format validation, link checking, and content standardization tools

### 📋 Metadata Management
- **YAML Frontmatter**: Bulk application and management of YAML headers with customizable templates
- **Category Intelligence**: Automated categorization based on folder structure and content analysis
- **Tag Management**: Smart tag assignment with hierarchical organization and search optimization
- **Cross-Reference Mapping**: Link integrity checking and reference management across document collections
- **Search Optimization**: Metadata structuring for enhanced discoverability and workflow integration

### 🛠️ File Organization
- **Duplicate Intelligence**: Smart detection and removal of duplicate files with safety checks
- **Structure Visualization**: Comprehensive folder tree generation with HTML output and navigation
- **Bulk Operations**: Mass file movement and organization with metadata preservation
- **Cleanup Automation**: Maintenance utilities for Drive hygiene and performance optimization
- **Reference Generation**: Automated folder ID extraction and script configuration assistance

## 🔒 Security & Privacy

### Data Protection
- **Local Processing**: All operations within Google's secure infrastructure
- **Permission-Based**: Scripts request only necessary Drive permissions
- **No External Services**: No data transmission to third-party services
- **User-Controlled**: All file operations are user-initiated and controlled

### Best Practices
- **Backup Critical Data**: Always backup important folders before bulk operations
- **Test with Small Sets**: Validate scripts with 10-50 files before large operations
- **Monitor API Quotas**: Track Drive API usage to avoid service interruptions
- **Regular Permission Audits**: Review script permissions quarterly
- **Version Control**: Track changes to important file collections

## 📈 Performance & Scaling

### Optimization Features
- **Intelligent Batching**: Files processed in optimal batches (default: 50 files)
- **Smart Caching**: Folder structures and metadata cached with TTL management
- **Progress Monitoring**: Real-time progress updates with ETA calculations
- **Error Recovery**: Robust error handling with automatic operation resumption
- **Resource Management**: Memory-efficient processing for large file repositories

### Operational Scaling Guidelines

| Repository Size | Recommended Approach | Expected Processing Time | Resource Requirements |
|----------------|---------------------|------------------------|---------------------|
| **Small** (< 100 files) | Direct processing | 1-3 minutes | Standard quotas |
| **Medium** (100-1,000 files) | Batch processing | 5-15 minutes | Monitor API usage |
| **Large** (1,000-10,000 files) | Staged processing | 30-90 minutes | Dedicated time blocks |
| **Enterprise** (10,000+ files) | Scheduled processing | 2-6 hours | Off-peak execution |

## 🔄 Integration Capabilities

### External System Integration
- **Obsidian**: Direct markdown export with dataview optimization for knowledge management
- **Documentation Systems**: Professional documentation generation with cross-references
- **Backup Solutions**: Automated archival with metadata preservation and organization
- **CMS Integration**: Content management system connectivity with structured metadata
- **Analytics Platforms**: Data export for content analysis and usage metrics

### Workflow Automation
- **Scheduled Processing**: Time-based triggers for regular maintenance and organization
- **Event-Driven Actions**: Automatic processing when files are added or modified
- **Chain Operations**: Sequential script execution for complex workflow automation
- **Notification Systems**: Email alerts for completion status and error reporting
- **Integration APIs**: RESTful endpoints for external system connectivity

## 🤝 Contributing

### Development Standards
All scripts follow standardized development practices:

```javascript
/**
 * Title: Drive [Function] [Descriptor]
 * Service: Google Drive
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
1. **Naming Convention**: Follow `drive-[function]-[descriptor].gs` pattern
2. **Error Handling**: Implement comprehensive error recovery and logging
3. **Configuration**: Use standardized `CONFIG` object patterns
4. **Documentation**: Include detailed inline comments and usage examples
5. **Testing**: Validate with multiple file types and repository sizes

## 📞 Support & Resources

### Documentation & Help
- **Script Headers**: Each script includes comprehensive usage instructions and examples
- **Inline Documentation**: Detailed code comments for customization and troubleshooting
- **Error Reporting**: Clear error messages with suggested solutions and recovery steps
- **Best Practices**: Documented patterns for optimal performance and security

### Getting Support
- **GitHub Issues**: Bug reports and feature requests via repository issues
- **Email Support**: Direct support at kevin@averageintelligence.ai
- **Community**: Google Apps Script community forums and Stack Overflow
- **Documentation**: Official Google Drive API and Apps Script documentation

### License & Commercial Use
- **License**: MIT License - full commercial use permitted
- **Attribution**: Optional but appreciated for public implementations
- **Warranty**: No warranty provided - enterprise testing recommended
- **Support Level**: Best-effort community support with active maintenance

---

**Repository**: [Workspace Automation](https://github.com/kevinlappe/workspace-automation)  
**Maintainer**: Kevin Lappe  
**Last Review**: July 21, 2025
