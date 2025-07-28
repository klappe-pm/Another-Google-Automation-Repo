# Automation Tools & Scripts

This directory contains all automation tools and scripts for Google Workspace project management, organized by functional purpose for better maintainability and discoverability.

## Directory Structure

```
automation/
├── tools/              # Development and maintenance tools
│   ├── formatters/     # Code formatting and styling tools
│   ├── gas-tools/      # Google Apps Script specific tools
│   └── migration-tools/ # Project migration utilities
├── deployment/         # Deployment and setup scripts
│   ├── scripts/        # Deployment automation scripts
│   └── setup/          # Environment setup and configuration
├── validation/         # Testing, validation, and QA
│   ├── javascript/     # JS validators and linters
│   ├── security/       # Security scanning tools
│   └── dev-tools/      # Dev validation tools
└── utilities/          # General utilities and helpers
    ├── git-automation/ # Git workflow automation
    └── config/         # Configuration files and settings
```

## Cross-links

- [Main README](/README.md)
- [Deployment Scripts](deployment/README.md)
- [Validation Guides](validation/README.md)
- [Utilities README](utilities/README.md)

## Tools Directory

### formatters/
Code quality and formatting tools for maintaining consistent standards across all scripts.

- `add-function-comments.js` - Automatically adds function documentation
- `apply-smart-formatting.js` - Intelligent code formatting
- `clean-duplicates-final.js` - Removes duplicate files and code
- `final-header-fix.js` - Standardizes script headers
- `fix-all-naming-issues.js` - Corrects file naming conventions
- `fix-script-headers.js` - Updates and fixes script metadata
- `fix-script-issues.js` - General script issue resolution
- `gas-formatter-smart.js` - Smart Google Apps Script formatter
- `gas-formatter.js` - Basic Google Apps Script formatter
- `lint-google-apps-scripts.js` - Linting for Google Apps Scripts
- `standardize-filenames.js` - Enforces naming conventions
- `standardize-script-headers.js` - Standardizes script documentation

### gas-tools/
Google Apps Script project management and automation tools.

- `deploy-tools.js` - Deployment automation utilities
- `gas-catalog.js` - Project cataloging and indexing
- `gas-download-and-clean.js` - Download and cleanup automation
- `gas-duplicate-detector.js` - Identifies duplicate scripts
- `gas-project-archiver.js` - Archives old projects
- `gas-project-discovery.js` - Discovers and indexes projects
- `gas-project-downloader.js` - Bulk project downloading
- `gas-quick-duplicate-check.js` - Fast duplicate detection
- `gas-refactor-batch.js` - Batch refactoring tools
- `gas-txt-converter.js` - Converts between file formats
- `process-batch-projects.js` - Batch project processing
- `process-external-scripts.js` - External script integration
- `setup-projects.js` - Project initialization
- `shell-catalog.js` - Shell script cataloging
- `update-final-catalogs.js` - Catalog maintenance
- `update-google-samples.js` - Google samples synchronization

### migration-tools/
Tools for migrating and merging project versions.

- `gas-project-migrator.js` - Migrates projects between versions
- `gas-version-merger.js` - Merges different project versions
- `migrate-projects.js` - General project migration
- `move-standards.js` - Moves projects to standardized structure

## Deployment Directory

### scripts/
Deployment automation and project management scripts.

- `add-missing-manifests.sh` - Adds missing manifest files
- `deploy-local.sh` - Local deployment automation
- `manage-cloud-build-triggers.sh` - Cloud Build trigger management
- `restore-scripts.sh` - Script restoration utilities
- `test-deployment.sh` - Deployment testing
- `update-project-mappings.sh` - Updates project mappings

### setup/
Environment setup and configuration scripts.

- `complete_wif_setup.sh` - Complete Workload Identity Federation setup
- `setup-auto-push.sh` - Automated push configuration
- `setup-git-hooks.sh` - Git hooks installation
- `setup-github-actions.sh` - GitHub Actions configuration
- `setup-ide.sh` - IDE environment setup
- `unified_setup.sh` - Complete environment setup
- `verify-setup.sh` - Setup verification
- `verify_config_fixed.sh` - Configuration verification

## Validation Directory

### javascript/
JavaScript validation, linting, and analysis tools.

- `analyze-and-verify-scripts.js` - Comprehensive script analysis
- `gas-linter.js` - Google Apps Script linting
- `script-validator.js` - General script validation
- `security-scanner.js` - Security vulnerability scanning
- `validate-google-samples.js` - Validates Google sample code
- `validate-projects.js` - Project validation
- `validate-updates.js` - Update validation
- `validation-script-validator.js` - Validator for validation scripts

### security/
Security scanning and validation tools.

- `comprehensive-security-scan.sh` - Complete security audit
- `scan-all-scripts.sh` - Scans all scripts for security issues

### dev-tools/
Development environment validation tools and configurations.

## Utilities Directory

### git-automation/
Git workflow automation and repository management.

- `auto-commit-push.sh` - Automated commit and push
- `auto-sync-full.sh` - Full repository synchronization
- `cleanup-repo.sh` - Repository cleanup
- `fix-repo-quality.sh` - Repository quality improvements
- `git-sync.sh` - Git synchronization
- `init-git.sh` - Git repository initialization
- `migrate-unique-files.sh` - Migrates unique files
- `quick-sync.sh` - Quick synchronization
- `remove-duplicate-txt.sh` - Removes duplicate text files
- `remove-repo-duplicates.sh` - Repository duplicate removal
- `sync-control.sh` - Synchronization control

### config/
Configuration files and deployment status tracking.

- `deployment-status.json` - Tracks deployment status
- Configuration templates and settings

## Usage

### Getting Started
1. Choose the appropriate directory based on your task
2. Review the specific tool documentation within each script
3. Ensure proper permissions and dependencies are installed
4. Run tools with appropriate parameters

### Common Workflows

**Code Quality & Formatting:**
```bash
# Format all scripts
node tools/formatters/gas-formatter-smart.js

# Standardize headers
node tools/formatters/standardize-script-headers.js

# Clean duplicates
node tools/formatters/clean-duplicates-final.js
```

**Project Management:**
```bash
# Download and catalog projects
node tools/gas-tools/gas-project-downloader.js
node tools/gas-tools/gas-catalog.js

# Check for duplicates
node tools/gas-tools/gas-duplicate-detector.js
```

**Deployment:**
```bash
# Setup environment
./deployment/setup/unified_setup.sh

# Deploy locally
./deployment/scripts/deploy-local.sh

# Verify deployment
./deployment/scripts/test-deployment.sh
```

**Validation:**
```bash
# Run security scan
./validation/security/comprehensive-security-scan.sh

# Validate scripts
node validation/javascript/script-validator.js

# Lint Google Apps Scripts
node validation/javascript/gas-linter.js
```

**Git Automation:**
```bash
# Quick sync
./utilities/git-automation/quick-sync.sh

# Full cleanup and sync
./utilities/git-automation/auto-sync-full.sh
```

## File Naming Convention

All scripts follow the standardized naming convention:
- **JavaScript**: `{purpose}-{function}-{descriptor}.js`
- **Shell**: `{purpose}-{function}-{descriptor}.sh`
- **Example**: `gas-project-downloader.js`, `setup-git-hooks.sh`

## Prerequisites

- Node.js for JavaScript tools
- Bash for shell scripts
- Google Apps Script API access
- Git for version control automation
- Appropriate permissions for file system operations

## Contributing

1. Follow the established naming conventions
2. Add proper documentation headers to all scripts
3. Place tools in the appropriate functional directory
4. Update this README when adding new tools
5. Test all scripts before committing

## Migration Notes

This structure was reorganized from language-based folders (javascript/, shell/) to function-based folders for better organization. Original directory structure backed up to `/Users/kevinlappe/Documents/old_automation_dirs/`.

## License

MIT License

## Contact

kevin@averageintelligence.ai

---
*Last Updated: $(date)*
*Total Scripts: 59+ automation tools*
