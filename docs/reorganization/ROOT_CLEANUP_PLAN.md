# Root Directory Cleanup Plan

## Current State
38 files in root directory - too cluttered for easy navigation

## Goal
Reduce to ~10 essential files in root

## Files to Keep in Root
1. **README.md** - Main documentation
2. **LICENSE.md** - Legal requirement
3. **.gitignore** - Git configuration
4. **.gitattributes** - Git configuration
5. **package.json** - Node.js configuration
6. **package-lock.json** - Node.js lock file
7. **Makefile** - Build automation

## Files to Move/Delete

### Move to `/docs/milestones/`
- MILESTONE_1_LOG.md
- MILESTONE_1_SUMMARY.md
- CI_CD_PHASE3_COMPLETE.md
- PHASE3_FIXES_APPLIED.md

### Move to `/docs/setup/`
- GITHUB_SECRETS_SETUP.md
- CONTRIBUTING.md

### Move to `/docs/reorganization/`
- REORGANIZATION_SUMMARY.md
- REPOSITORY_CLEANUP_PLAN.md
- VAULT_STRUCTURE_PREVIEW.md
- VAULT_STRUCTURE.md
- ROOT_CLEANUP_PLAN.md (this file)
- SCRIPT_RESTORATION_LOG.md

### Move to `/logs/`
- auto-sync.log
- auto-sync-background.log
- All deployment-*.log files (10 files)

### Move to `/reports/`
- audit-report.md
- script-error-matrix.json

### Delete (System/Temporary Files)
- .DS_Store
- .eslintrc.temp.js
- package.json.backup

### Move to `/config/`
- com.workspace-automation.watcher.plist

### Remove (Already Symlinked)
- cloudbuild.yaml (symlink)
- project-mapping.json (symlink)

## New Directory Structure
```
workspace-automation/
├── README.md
├── LICENSE.md
├── .gitignore
├── .gitattributes
├── package.json
├── package-lock.json
├── Makefile
├── apps/
├── automation/
├── config/
├── docs/
│   ├── milestones/
│   ├── setup/
│   └── reorganization/
├── logs/
├── reports/
└── [other directories...]
```

## Result
Root directory reduced from 38 to 7 essential files