# Workspace Automation Tools

This directory contains automation tools organized by file type and functionality to maintain, develop, and deploy Google Apps Script projects.

## Directory Structure

### JavaScript Tools (`javascript/`)
Development tools written in JavaScript for managing Google Apps Script projects.

#### `javascript/gas-tools/`
Core Google Apps Script project management tools:
- **gas-catalog.js** - Catalogs and indexes GAS projects
- **gas-download-and-clean.js** - Downloads and cleans GAS projects
- **gas-duplicate-detector.js** - Detects duplicate scripts
- **gas-project-archiver.js** - Archives GAS projects
- **gas-project-discovery.js** - Discovers GAS projects
- **gas-project-downloader.js** - Downloads GAS projects
- **gas-quick-duplicate-check.js** - Quick duplicate checking
- **gas-txt-converter.js** - Converts GAS files to text format
- **deploy-tools.js** - Deployment utilities
- **gas-refactor-batch.js** - Batch refactoring tools
- **process-batch-projects.js** - Batch project processing
- **process-external-scripts.js** - External script processing
- **setup-projects.js** - Project setup utilities
- **shell-catalog.js** - Shell script cataloging
- **update-final-catalogs.js** - Final catalog updates
- **update-google-samples.js** - Google samples updater

#### `javascript/formatters/`
Code formatting and standardization tools:
- **gas-formatter.js** - Basic GAS code formatter
- **gas-formatter-smart.js** - Advanced GAS code formatter
- **apply-smart-formatting.js** - Applies smart formatting
- **add-function-comments.js** - Adds function documentation
- **fix-script-headers.js** - Fixes script headers
- **standardize-script-headers.js** - Standardizes headers
- **standardize-filenames.js** - Standardizes file names
- **final-header-fix.js** - Final header fixes
- **clean-duplicates-final.js** - Final duplicate cleanup
- **fix-all-naming-issues.js** - Fixes naming issues
- **fix-script-issues.js** - General script fixes
- **lint-google-apps-scripts.js** - Lints GAS scripts

#### `javascript/validators/`
Code validation and quality assurance tools:
- **script-validator.js** - Main script validator
- **gas-linter.js** - GAS-specific linter
- **analyze-and-verify-scripts.js** - Script analysis
- **validate-projects.js** - Project validation
- **validate-google-samples.js** - Google samples validation
- **validate-updates.js** - Update validation
- **security-scanner.js** - Security scanning
- **validation-script-validator.js** - Additional validation

#### `javascript/migration-tools/`
Project migration and version management:
- **gas-project-migrator.js** - Migrates GAS projects
- **migrate-projects.js** - General project migration
- **gas-version-merger.js** - Merges GAS versions
- **move-standards.js** - Moves standardized files

### Shell Scripts (`shell/`)
Automation scripts written in Bash for system-level operations.

#### `shell/git-automation/`
Git and repository management:
- **auto-commit-push.sh** - Automated git commits and pushes
- **auto-sync-full.sh** - Full repository synchronization
- **git-sync.sh** - Git synchronization
- **init-git.sh** - Git repository initialization
- **quick-sync.sh** - Quick synchronization
- **sync-control.sh** - Sync control management
- **cleanup-repo.sh** - Repository cleanup
- **fix-repo-quality.sh** - Repository quality fixes
- **migrate-unique-files.sh** - Migrates unique files
- **remove-duplicate-txt.sh** - Removes duplicate text files
- **remove-repo-duplicates.sh** - Removes repository duplicates

#### `shell/deployment/`
Deployment and project management:
- **deploy-local.sh** - Local deployment
- **test-deployment.sh** - Deployment testing
- **manage-cloud-build-triggers.sh** - Cloud build management
- **add-missing-manifests.sh** - Adds missing manifests
- **update-project-mappings.sh** - Updates project mappings
- **restore-scripts.sh** - Restores scripts

#### `shell/security/`
Security scanning and analysis:
- **comprehensive-security-scan.sh** - Comprehensive security scanning
- **scan-all-scripts.sh** - Scans all scripts for security issues

#### `shell/setup/`
Environment and project setup:
- **complete_wif_setup.sh** - Complete WIF setup
- **setup-auto-push.sh** - Sets up auto-push
- **setup-git-hooks.sh** - Sets up git hooks
- **setup-github-actions.sh** - Sets up GitHub Actions
- **setup-ide.sh** - IDE setup
- **unified_setup.sh** - Unified setup process
- **verify-setup.sh** - Verifies setup
- **verify_config_fixed.sh** - Verifies configuration fixes

### Configuration (`config/`)
Configuration files and settings:
- **deployment-status.json** - Deployment status tracking

## Usage

Each subfolder contains specialized tools for different aspects of the automation pipeline:

1. **Development**: Use `javascript/gas-tools/` for project management
2. **Code Quality**: Use `javascript/formatters/` and `javascript/validators/`
3. **Migration**: Use `javascript/migration-tools/` for project updates
4. **System Operations**: Use `shell/` scripts for repository and deployment management

## Prerequisites

- Node.js (for JavaScript tools)
- Bash (for shell scripts)
- Google Apps Script CLI (clasp)
- Git

## License

MIT License - See main repository LICENSE file

## Contact

Kevin Lappe - kevin@averageintelligence.ai
