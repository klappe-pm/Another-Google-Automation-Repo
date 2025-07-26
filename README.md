# Google Workspace Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Scripts: 148](https://img.shields.io/badge/Scripts-148-blue)](docs/SCRIPT_CATALOG.md)
[![Services: 7](https://img.shields.io/badge/Services-7-green)](docs/SCRIPT_INVENTORY.md)

A comprehensive collection of 148 professionally documented Google Apps Script automation tools for Google Workspace, organized by service with standardized naming conventions and full CI/CD pipeline support.

## 📋 Overview

This repository contains a complete automation framework for Google Workspace services:
- **148 Scripts** across 7 services
- **Standardized** action-noun naming convention
- **Comprehensive** documentation with inline comments
- **Automated** deployment via clasp CLI
- **Professional** code organization and formatting

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/workspace-automation.git
cd workspace-automation

# Install dependencies
npm install

# Deploy all scripts
./automation/deploy-local.sh

# Deploy specific service
./automation/deploy-local.sh gmail
```

## 📁 Repository Structure

```
workspace-automation/
├── apps/                    # Google Apps Script projects (148 scripts)
│   ├── calendar/           # Calendar automation (1 script)
│   ├── docs/              # Document automation (9 scripts)
│   ├── drive/             # Drive automation (47 scripts)
│   ├── gmail/             # Gmail automation (64 scripts)
│   ├── sheets/            # Sheets automation (21 scripts)
│   ├── tasks/             # Tasks automation (2 scripts)
│   └── utility/           # Utility scripts (4 scripts)
├── automation/             # Deployment and development tools
│   ├── deploy-local.sh    # Local deployment script
│   └── dev-tools/         # Development utilities
├── config/                # Configuration files
├── docs/                  # Documentation
└── logs/                  # Deployment logs
```

## 🛠️ Key Features by Service

### Gmail Automation (64 scripts)
- **Email Analysis**: Statistics, patterns, metadata extraction
- **Label Management**: Auto-labeling, bulk operations, organization
- **Export Functions**: PDF, Markdown, Sheets, multiple formats
- **Bulk Processing**: Mark read, delete, categorize

### Drive Automation (47 scripts)
- **File Management**: Indexing, deduplication, organization
- **Markdown Operations**: Generation, formatting, YAML frontmatter
- **Folder Operations**: Tree generation, bulk operations
- **Content Processing**: File conversion, metadata updates

### Sheets Automation (21 scripts)
- **Data Processing**: Analysis, formatting, validation
- **Import/Export**: CSV operations, cross-service integration
- **Automation**: Date handling, conditional formatting
- **Report Generation**: Statistics, summaries, visualizations

### Calendar Automation (1 script)
- **Event Analysis**: Duration and distance tracking
- **Data Export**: Comprehensive event data extraction

### Docs Automation (9 scripts)
- **Content Management**: Formatting, embedding, organization
- **Export Functions**: Markdown conversion, comment extraction
- **Document Processing**: Bulk operations, metadata handling

### Tasks Automation (2 scripts)
- **Task Management**: List operations, bulk processing
- **Export Functions**: Various format conversions

### Utility Scripts (4 scripts)
- **Configuration**: API keys, vault configs
- **Processing**: YAML handling, data transformation

## 📚 Documentation

- **[Script Catalog](docs/SCRIPT_CATALOG.md)** - Complete list with descriptions
- **[Script Inventory](docs/SCRIPT_INVENTORY.md)** - Detailed categorization
- **[Migration Summary](docs/MIGRATION_SUMMARY.md)** - Recent standardization details
- **[Setup Guide](docs/SETUP.md)** - Installation instructions
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing guidelines
- **[API Permissions](docs/API_PERMISSIONS.md)** - Required Google APIs

## 🔧 Development Standards

### Naming Convention
- **Action-Noun Format**: `export-labels`, `create-folders`
- **Markdown Prefix**: `markdown-` for markdown operations
- **No Service Prefix**: Folder structure indicates service

### Documentation Standards
Every script includes:
```javascript
/**
 * Script Name: [filename]
 * 
 * Script Summary:
 * [One-line description]
 * 
 * Script Purpose:
 * - [Primary purpose]
 * - [Secondary purposes]
 * 
 * Script Steps:
 * 1. [Step one]
 * 2. [Step two]
 * 
 * Script Functions:
 * - functionName(): [Description]
 * 
 * Google Services:
 * - ServiceName: [Usage description]
 */
```

### Code Organization
- Functions sorted alphabetically
- Main/Helper function separation
- Consistent formatting
- JSDoc inline comments

## 🚀 Deployment Options

### Local Deployment
```bash
# Deploy all scripts
./automation/deploy-local.sh

# Deploy with options
./automation/deploy-local.sh --service gmail --env production
```

### Cloud Build Integration
```bash
# Submit to Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# Monitor deployment
gcloud builds list --limit=5
```

## 🤝 Contributing

1. **Follow Standards**: Use action-noun naming
2. **Document Thoroughly**: Include all required headers
3. **Test Locally**: Verify before submitting
4. **Update Catalogs**: Keep documentation current

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📊 Project Statistics

- **Total Scripts**: 148
- **Services Covered**: 7
- **Functions Documented**: 924
- **Last Updated**: July 2025
- **Code Standards**: 100% compliance

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with** ❤️ **using Google Apps Script and Node.js**
npm run catalog:all        # Generate script inventories
```

## Architecture

### Repository Structure

```
workspace-automation/
├── apps/              # Google Apps Script projects
│   ├── calendar/     # Calendar automation scripts
│   ├── chat/         # Chat automation scripts
│   ├── docs/         # Document automation scripts
│   ├── drive/        # Drive automation scripts
│   ├── gmail/        # Gmail automation scripts
│   ├── photos/       # Photos automation scripts
│   ├── sheets/       # Sheets automation scripts
│   ├── slides/       # Slides automation scripts
│   ├── tasks/        # Tasks automation scripts
│   └── utility/      # Utility scripts
├── automation/       # Deployment and development tools
│   ├── shell-scripts/  # Deployment scripts
│   └── dev-tools/      # Formatting, linting, cataloging
├── config/          # Configuration files
├── docs/            # Documentation
│   ├── diagrams/    # Architecture diagrams
│   └── standards/   # Style guides and standards
└── .githooks/       # Git hooks for quality enforcement
```

For detailed architecture diagrams, see:
- [System Architecture](docs/diagrams/ARCHITECTURE.md)
- [Repository Structure](docs/diagrams/REPOSITORY_STRUCTURE.md)
- [Development Workflow](docs/diagrams/DEVELOPMENT_WORKFLOW.md)
- [Entity Relationships](docs/diagrams/ERD.md)

### Deployment Flow

```
Local Development → File Save → Auto-commit → GitHub Push → Deployment → Google Apps Script
```

The automation pipeline watches for file changes, commits them to Git, pushes to GitHub, and deploys to Google Apps Script projects automatically.

## Implementation Details

### Supported Services

| Service | Purpose | API Permissions |
|---------|---------|-----------------|
| Calendar | Event automation and analysis | Calendar, Drive, Sheets |
| Chat | Message automation | Chat Messages, Spaces, Drive |
| Docs | Document processing | Documents, Drive, Sheets |
| Drive | File organization | Drive, Metadata, Sheets |
| Gmail | Email management | Gmail, Labels, Drive, Docs |
| Photos | Photo organization | Photos Library, Drive, Sheets |
| Sheets | Spreadsheet automation | Sheets API v4, Drive |
| Slides | Presentation tools | Presentations, Drive, Sheets |
| Tasks | Task management | Tasks, Drive, Sheets |
| Utility | Helper functions | External Requests, Drive, Sheets |

### Key Components

**Automation Scripts**
- `deploy-local.sh` - Deploys all projects using local clasp CLI
- `auto-sync-full.sh` - File watcher with automatic deployment
- `sync-control.sh` - Process control for background synchronization
- `test-deployment.sh` - Validates deployment configuration

**Configuration**
- `project-mapping.json` - Maps services to Google Apps Script project IDs
- `cloudbuild.yaml` - Cloud Build configuration for CI/CD
- Individual `appsscript.json` files for each service with API permissions

## Getting Started

### Prerequisites

1. **Google Cloud Project** with the following APIs enabled:
   - Apps Script API
   - Drive API
   - Secret Manager API (for Cloud Build)

2. **Local Dependencies**:
   ```bash
   # Install Node.js (v18 or later)
   # Install clasp globally
   npm install -g @google/clasp
   
   # Authenticate with Google
   clasp login
   ```

3. **Repository Setup**:
   ```bash
   git clone https://github.com/your-org/workspace-automation.git
   cd workspace-automation
   ```

### Basic Usage

1. **Manual Deployment**:
   ```bash
   # Deploy all projects
   ./automation/deploy-local.sh
   ```

2. **Automatic Sync** (Recommended):
   ```bash
   # Start file watcher in foreground
   ./automation/sync-control.sh start
   
   # Or run in background
   ./automation/sync-control.sh start-background
   ```

3. **Development Workflow**:
   - Edit any `.gs` file in the `apps/` directory
   - Save the file
   - Automation will handle commit, push, and deployment
   - Check deployment status in the terminal output

### Configuration

Each service directory contains:
- `src/` - Script source files (.gs, .html, .js)
- `.clasp.json` - Project configuration with script ID
- `appsscript.json` - Manifest with dependencies and permissions

To add a new script:
1. Create the file in the appropriate service's `src/` directory
2. Follow naming convention: `service-function-description.gs`
3. Save the file - automation handles the rest

## Advanced Features

### Cloud Build Integration

For production deployments using Google Cloud Build:
```bash
gcloud builds submit --config=cloudbuild.yaml --project=your-project-id
```

### File Watching Options

The file watcher monitors:
- `*.gs` - Google Apps Script files
- `*.json` - Configuration files
- `*.html` - HTML templates
- `*.js` - JavaScript files

Excludes:
- `.git` directory
- `node_modules`
- `*.log` files

### Permission Management

API permissions are configured in each service's `appsscript.json` file. The framework includes:
- Automated permission auditing
- Standardized OAuth scope configuration
- Advanced Google API service integration where needed

## Development Guidelines

### File Naming Convention

Use descriptive names following the pattern:
```
{service}-{function}-{description}.gs
```

Examples:
- `gmail-filter-manager.gs`
- `drive-folder-organizer.gs`
- `sheets-data-processor.gs`

### Code Style

- Use consistent indentation (2 spaces)
- Include JSDoc comments for functions
- Follow Google Apps Script best practices
- Handle errors gracefully with try-catch blocks

### Testing

Before committing:
1. Test scripts in Google Apps Script editor
2. Verify permissions are correctly configured
3. Run deployment test: `./automation/test-deployment.sh`

## Troubleshooting

### Common Issues

**Authentication Failed**
- Run `clasp login` to re-authenticate
- Verify Google account has access to all script projects

**Deployment Failed**
- Check `.clasp.json` exists and contains valid script ID
- Verify `appsscript.json` has required permissions
- Review deployment logs for specific errors

**File Watcher Not Detecting Changes**
- Ensure you're editing files within `apps/` directory
- Check that file extension matches watch patterns
- Verify process is running: `./automation/sync-control.sh status`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the guidelines
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Contact

**Project Maintainer**: Kevin Lappe  
**Email**: kevin@averageintelligence.ai  
**Repository**: https://github.com/klappe-pm/Another-Google-Automation-Repo

---

**Version**: 3.0  
**Last Updated**: July 2025  
**Status**: Active Development