# Workspace Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/klappe-pm/Another-Google-Automation-Repo/pulls)

A comprehensive Google Apps Script automation framework with integrated CI/CD pipeline for Google Workspace services.

## Problem Statement

Managing Google Apps Script projects traditionally requires manual copying between the web editor and version control, leading to:
- Lack of proper version control and collaboration
- No automated testing or deployment processes
- Difficulty maintaining consistency across multiple scripts
- Limited visibility into script dependencies and permissions

## Solution

This repository provides a complete development framework that bridges local development with Google Apps Script deployment, offering:
- Full Git-based version control for all scripts
- Automated deployment pipeline from local files to Google Apps Script
- Standardized project structure across 10 Google Workspace services
- Comprehensive API permission management
- Real-time file watching with automatic synchronization

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
├── automation/       # Deployment and sync scripts
├── config/          # Configuration files
├── docs/            # Documentation
└── diagrams/        # Architecture diagrams
```

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