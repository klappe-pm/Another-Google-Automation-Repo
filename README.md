# Google Workspace Automation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Scripts: 148](https://img.shields.io/badge/Scripts-148-blue)](docs/SCRIPT_CATALOG.md)
[![Services: 7](https://img.shields.io/badge/Services-7-green)](docs/SCRIPT_INVENTORY.md)

Google Apps Script automation tools for Google Workspace services.

## Overview

This repository contains 148 Google Apps Script files organized by service. Each script follows standardized naming conventions and documentation requirements.

## Requirements

- Node.js 18 or later
- Google account with appropriate permissions
- clasp CLI tool
- Git

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/workspace-automation.git
cd workspace-automation

# Install dependencies
npm install

# Authenticate with Google
npx clasp login
```

## Usage

### Deploy All Scripts
```bash
./automation/deployment/scripts/deploy-local.sh
```

### Deploy Specific Service
```bash
./automation/deployment/scripts/deploy-local.sh gmail
./automation/deployment/scripts/deploy-local.sh drive
```

### File Watcher (Auto-deployment)
```bash
# Start in foreground
./automation/utilities/git-automation/sync-control.sh start

# Start in background
./automation/utilities/git-automation/sync-control.sh start-background

# Check status
./automation/utilities/git-automation/sync-control.sh status

# Stop
./automation/utilities/git-automation/sync-control.sh stop
```

## Structure

```
workspace-automation/
├── apps/                    # Google Apps Script projects
│   ├── calendar/           # 1 script
│   ├── docs/              # 9 scripts
│   ├── drive/             # 47 scripts
│   ├── gmail/             # 64 scripts
│   ├── sheets/            # 21 scripts
│   ├── tasks/             # 2 scripts
│   └── utility/           # 4 scripts
├── automation/             # Development and deployment tools
├── config/                # Configuration files
├── docs/                  # Documentation
└── logs/                  # Deployment logs
```

## Development

### Naming Convention
Files use action-noun format:
- `export-labels.gs`
- `create-folders.gs`
- `analyze-data.gs`

Exception: Markdown operations use `markdown-` prefix.

### Required Header Format
```javascript
/**
 * Script Name: [filename without .gs]
 *
 * Script Summary:
 * [One-line description]
 *
 * Script Purpose:
 * - [Primary purpose]
 * - [Secondary purposes]
 *
 * Script Steps:
 * 1. [Step description]
 * 2. [Step description]
 *
 * Script Functions:
 * - functionName(): [Description]
 *
 * Script Helper Functions:
 * - _helperName(): [Description]
 *
 * Script Dependencies:
 * - [Dependencies or "None"]
 *
 * Google Services:
 * - ServiceName: [How used]
 */
```

### Code Standards
- Use `Logger.log()` not `console.log()`
- Handle errors with try-catch blocks
- Use batch operations for API calls
- Sort functions alphabetically
- Prefix helper functions with underscore

### Commit Requirements
All commits must pass these checks:
1. Valid JavaScript syntax
2. Proper comment format
3. Required headers present
4. No hardcoded secrets
5. Error handling implemented

## Documentation

- [Project Plan](PROJECT_PLAN.md) - Development roadmap
- [Coding Foundation](docs/CODING_FOUNDATION.md) - Coding standards
- [Foundation Requirements](docs/FOUNDATION_REQUIREMENTS.md) - Architecture plans
- [Development Policies](docs/DEVELOPMENT_POLICIES.md) - Development rules
- [API Permissions](docs/api/API_PERMISSIONS.md) - Required permissions
- [Script Catalog](docs/catalogs/SCRIPT_CATALOG.md) - All scripts listed
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions

## Services

### Gmail (64 scripts)
Email management, label operations, export functions, bulk processing.

### Drive (47 scripts)
File management, folder operations, markdown processing, metadata handling.

### Sheets (21 scripts)
Data processing, import/export, formatting, report generation.

### Docs (9 scripts)
Document processing, content management, export functions.

### Utility (4 scripts)
Cross-service utilities, configuration management.

### Tasks (2 scripts)
Task management and export.

### Calendar (1 script)
Event analysis and export.

## License

MIT License - see [LICENSE](LICENSE) file.

## Contact

**Maintainer**: Kevin Lappe
**Repository**: https://github.com/klappe-pm/Another-Google-Automation-Repo