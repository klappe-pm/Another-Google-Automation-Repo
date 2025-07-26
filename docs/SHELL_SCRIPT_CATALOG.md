# Shell Script Catalog

Last Updated: 7/26/2025, 10:37:32 AM

## Summary
- **Total Scripts**: 28
- **With Shebang**: 28 (100%)
- **With Description**: 28 (100%)
- **Executable**: 24 (86%)
- **Average Quality Score**: 57%

### Scripts by Category
- Git Operations: 28 scripts

### Recently Updated
- setup-git-hooks.sh (2025-07-26)
- add-missing-manifests.sh (2025-07-25)
- auto-commit-push.sh (2025-07-25)
- auto-sync-full.sh (2025-07-25)
- auto-sync-full.sh (2025-07-25)

## Scripts by Category

### Git Operations (28 scripts)

| Script | Description | Quality | Executable | Lines |
|--------|-------------|---------|------------|-------|
| [add-missing-manifests.sh](automation/shell-scripts/add-missing-manifests.sh) | Add missing appsscript.json manifest files | 45% | ✅ | 36 |
| [auto-commit-push.sh](automation/auto-commit-push.sh) | Auto-commit and push script for Google Apps Script files | 55% | ✅ | 76 |
| [auto-sync-full.sh](archive/pre-reorganization-backup/auto-sync-full.sh) | Full automation script: File watch → Git push → Apps Script deployment | 55% | ✅ | 145 |
| [auto-sync-full.sh](automation/auto-sync-full.sh) | Full automation script: File watch → Git push → Apps Script deployment | 55% | ✅ | 145 |
| [cleanup-repo.sh](automation/shell-scripts/cleanup-repo.sh) | Repository Cleanup Script | 45% | ✅ | 133 |
| [complete_wif_setup.sh](automation/shell-scripts/complete_wif_setup.sh) | Exit on any error | 60% | ✅ | 46 |
| [comprehensive-security-scan.sh](automation/shell-scripts/comprehensive-security-scan.sh) | comprehensive-security-scan.sh | 60% | ❌ | 216 |
| [deploy-local.sh](archive/pre-reorganization-backup/deploy-local.sh) | Local Deployment Script - Workaround for Cloud Build Permission Issues | 60% | ✅ | 91 |
| [deploy-local.sh](automation/deploy-local.sh) | Local Deployment Script - Workaround for Cloud Build Permission Issues | 60% | ✅ | 91 |
| [fix-repo-quality.sh](automation/shell-scripts/fix-repo-quality.sh) | Repository Quality Fix Script | 60% | ✅ | 131 |
| [git-sync.sh](automation/shell-scripts/git-sync.sh) | Error trap for better debugging | 80% | ✅ | 572 |
| [init-git.sh](automation/shell-scripts/init-git.sh) | Error trap for better debugging | 60% | ✅ | 76 |
| [manage-cloud-build-triggers.sh](automation/shell-scripts/manage-cloud-build-triggers.sh) | Script to identify and manage Cloud Build triggers | 35% | ❌ | 77 |
| [quick-sync.sh](automation/shell-scripts/quick-sync.sh) | Quick Git Sync - Simple wrapper for the main git-sync script | 60% | ✅ | 20 |
| [restore-scripts.sh](automation/shell-scripts/restore-scripts.sh) | Restore actual scripts from backup to projects folder | 60% | ✅ | 36 |
| [scan-all-scripts.sh](automation/shell-scripts/scan-all-scripts.sh) | scan-all-scripts.sh | 70% | ✅ | 140 |
| [setup-auto-push.sh](automation/shell-scripts/setup-auto-push.sh) | Setup script for automatic git push on file save | 55% | ✅ | 172 |
| [setup-git-hooks.sh](automation/shell-scripts/setup-git-hooks.sh) | Setup Git Hooks for Google Apps Script Linting | 60% | ✅ | 31 |
| [setup-github-actions.sh](automation/shell-scripts/setup-github-actions.sh) | Quick GitHub Actions Setup for Auto-Sync | 45% | ✅ | 49 |
| [setup-ide.sh](automation/shell-scripts/setup-ide.sh) | IDE Setup Script for VS Code, Cursor, and Windsurf | 45% | ✅ | 175 |
| [setup-snyk-security.sh](docs/security/Snyk/setup-snyk-security.sh) | Error trap for better debugging | 60% | ❌ | 287 |
| [sync-control.sh](automation/sync-control.sh) | Control script for workspace automation sync | 45% | ✅ | 85 |
| [test-deployment.sh](archive/pre-reorganization-backup/test-deployment.sh) | Test Deployment Script - Milestone 1 Pipeline Validation | 60% | ✅ | 109 |
| [test-deployment.sh](automation/test-deployment.sh) | Test Deployment Script - Milestone 1 Pipeline Validation | 60% | ✅ | 109 |
| [unified_setup.sh](automation/shell-scripts/unified_setup.sh) | Unified Local Setup Script for Workspace Automation (v3 - Final) | 60% | ✅ | 184 |
| [update-project-mappings.sh](automation/shell-scripts/update-project-mappings.sh) | Update Project Mappings Script | 60% | ✅ | 70 |
| [verify_config_fixed.sh](automation/shell-scripts/verify_config_fixed.sh) | This script prints all current configurations for review. | 60% | ✅ | 66 |
| [verify-setup.sh](automation/shell-scripts/verify-setup.sh) | Error trap for better debugging | 60% | ❌ | 298 |

## High Quality Scripts

Scripts with quality score >= 80%:

### git-sync.sh
- **Path**: automation/shell-scripts/git-sync.sh
- **Description**: Error trap for better debugging
- **Quality Score**: 80%
- **Functions**: log, success, warning, error, info

## Scripts Needing Improvement

Scripts with quality score < 50%:

| Script | Score | Missing |
|--------|-------|---------|
| manage-cloud-build-triggers.sh | 35% | Set options, Executable, Usage docs |
| add-missing-manifests.sh | 45% | Set options, Usage docs |
| sync-control.sh | 45% | Set options, Usage docs |
| cleanup-repo.sh | 45% | Set options, Usage docs |
| setup-github-actions.sh | 45% | Set options, Usage docs |
| setup-ide.sh | 45% | Set options, Usage docs |

## Shell Script Best Practices

### Required Elements
1. **Shebang**: `#!/usr/bin/env bash` or `#!/bin/bash`
2. **Set Options**: `set -euo pipefail` for error handling
3. **Description**: Clear description at the top of the script
4. **Usage**: Document how to use the script
5. **Error Handling**: Proper error messages and exit codes

### Template
```bash
#!/usr/bin/env bash
set -euo pipefail

# Description: Brief description of what this script does
# Author: Your Name
# Usage: ./script.sh [options] [arguments]
#   -h, --help    Show this help message
#   -v, --verbose Enable verbose output
```

---

*This catalog is automatically generated. To update, run: `npm run shell:catalog`*