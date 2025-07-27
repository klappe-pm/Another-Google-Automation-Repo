# Script Refactoring Plan

## Current Script Inventory

### Validation Scripts (to consolidate)
- automation/validation/fix-comment-headers.js
- automation/validation/readme-linter.js
- automation/validation/javascript/gas-linter.js
- automation/validation/javascript/script-validator.js
- automation/validation/javascript/security-scanner.js
- automation/validation/javascript/validate-projects.js
- automation/validation/javascript/validation-script-validator.js
- automation/validation/javascript/analyze-and-verify-scripts.js

### Formatting Scripts (to consolidate)
- automation/tools/formatters/add-function-comments.js
- automation/tools/formatters/apply-smart-formatting.js
- automation/tools/formatters/clean-duplicates-final.js
- automation/tools/formatters/final-header-fix.js
- automation/tools/formatters/fix-all-naming-issues.js
- automation/tools/formatters/fix-script-headers.js
- automation/tools/formatters/fix-script-issues.js
- automation/tools/formatters/gas-formatter-smart.js
- automation/tools/formatters/gas-formatter.js
- automation/tools/formatters/lint-google-apps-scripts.js
- automation/tools/formatters/standardize-filenames.js
- automation/tools/formatters/standardize-script-headers.js

### Git/Deployment Scripts (to consolidate)
- automation/utilities/git-automation/quick-sync.sh
- automation/utilities/git-automation/auto-sync-full.sh
- automation/utilities/git-automation/git-sync.sh
- automation/utilities/git-automation/sync-control.sh
- automation/deployment/scripts/deploy-local.sh
- automation/deployment/scripts/test-deployment.sh

### Project Management Scripts (to consolidate)
- automation/tools/gas-tools/gas-catalog.js
- automation/tools/gas-tools/gas-duplicate-detector.js
- automation/tools/gas-tools/gas-project-discovery.js
- automation/tools/gas-tools/shell-catalog.js
- docs/tools/repo-reporter.js
- docs/tools/repo-review.js

### Setup Scripts (to consolidate)
- automation/deployment/setup/setup-git-hooks.sh
- automation/deployment/setup/setup-github-actions.sh
- automation/deployment/setup/setup-ide.sh
- automation/deployment/setup/verify-setup.sh

## Proposed Consolidated Structure

```
automation/
├── precommit/                    # All pre-commit checks
│   ├── check-all.js             # Master script that runs all checks
│   ├── lint-gas.js              # Lint Google Apps Scripts
│   ├── lint-readme.js           # Lint README files
│   ├── validate-structure.js    # Validate project structure
│   └── security-scan.js         # Security scanning
│
├── fixers/                      # All auto-fix scripts
│   ├── fix-all.js              # Master script that runs all fixes
│   ├── fix-gas-headers.js      # Fix GAS headers and comments
│   ├── fix-gas-formatting.js   # Fix GAS formatting issues
│   ├── fix-readme.js           # Fix README issues
│   └── fix-filenames.js        # Fix filename standardization
│
├── deployment/                  # Deployment scripts
│   ├── deploy.sh               # Main deployment script
│   ├── test.sh                 # Test deployment
│   └── sync.sh                 # Git sync operations
│
├── setup/                      # Setup scripts
│   ├── setup.sh               # Master setup script
│   └── verify.sh              # Verify setup
│
└── reports/                    # Reporting tools
    ├── project-report.js      # Generate project reports
    └── catalog.js             # Generate catalogs
```

## Scripts to Delete (duplicates/obsolete)
- Multiple git sync variants (keep only one)
- Multiple formatter variants (consolidate into one)
- Multiple validation variants (consolidate into one)
- Old migration scripts (no longer needed)