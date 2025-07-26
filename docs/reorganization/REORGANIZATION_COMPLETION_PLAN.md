# Repository Reorganization Completion Plan

## Overview
This plan outlines the steps to complete the repository reorganization from the old structure to the new `/apps/` structure.

## Current State Analysis

### File Distribution
- **Root-level directories**: 132 .gs files in `/calendar/`, `/chat/`, `/docs/`, `/drive/`, `/gmail/`, `/photos/`, `/sheets/`, `/tasks/`, `/utility/`
- **New apps structure**: Proper directory structure created but `src/` directories are mostly empty
- **Git status**: 231 deleted files, 132 untracked files
- **Pending directories**: `src-pending/` folders contain scripts of unknown status

### Key Issues
1. Scripts exist in two locations (root and apps)
2. Unclear which scripts in `src-pending/` should be activated
3. Legacy backup directory still present
4. Git tracking needs to be updated
5. Documentation scattered across multiple directories

## Phase 1: Script Migration (Priority: High)

### 1.1 Calendar Scripts (8 files)
```bash
# Move calendar scripts
mv calendar/*.gs apps/calendar/src/
```
Files to move:
- calendar-analysis-duration-distance.gs
- calendar-event-assistant.gs
- calendar-export-daily.gs
- calendar-export-date-range.gs
- calendar-export-distance-time.gs
- calendar-export-obsidian.gs
- event-export-gcp-distance-time.gs
- events-date-duration-time-distance.gs

### 1.2 Chat Scripts (1 file)
```bash
# Move chat scripts
mv chat/*.gs apps/chat/src/
```
Files to move:
- chat-export-daily-details.gs

### 1.3 Docs Scripts (7 files)
```bash
# Move docs scripts
mv docs/*.gs apps/docs/src/
```
Files to move:
- docs-embed-content-block.gs
- docs-export-comments-sheets.gs
- docs-export-file-list-to-sheets.gs
- docs-export-markdown-advanced.gs
- docs-export-markdown-obsidian.gs
- docs-formatter-content.gs
- docs-formatter.gs

### 1.4 Drive Scripts (27 files)
```bash
# Move drive scripts
mv drive/*.gs apps/drive/src/
```
Files to move:
- All 27 drive-*.gs files (index, yaml, markdown, utility scripts)

### 1.5 Gmail Scripts (49 files)
```bash
# Move gmail scripts
mv gmail/*.gs apps/gmail/src/
```
Files to move:
- All 49 gmail-*.gs and email-*.gs files
- Note: sheets-utility-script-22-legacy.gs should go to sheets

### 1.6 Photos Scripts (1 file)
```bash
# Move photos scripts
mv photos/*.gs apps/photos/src/
```
Files to move:
- photos-export-albums-to-sheets.gs

### 1.7 Sheets Scripts (12 files)
```bash
# Move sheets scripts
mv sheets/*.gs apps/sheets/src/
# Also move misplaced file from gmail
mv gmail/sheets-utility-script-22-legacy.gs apps/sheets/src/
```

### 1.8 Tasks Scripts (6 files)
```bash
# Move tasks scripts
mv tasks/*.gs apps/tasks/src/
```

### 1.9 Utility Scripts (11 files)
```bash
# Move utility scripts
mv utility/*.gs apps/utility/src/
```

## Phase 2: Documentation Consolidation (Priority: High)

### 2.1 Create unified documentation structure
```bash
docs/
├── README.md                    # Main documentation index
├── architecture/               # Keep existing
├── guides/                     # Keep existing
├── setup/                      # Keep existing
├── milestones/                 # Keep existing
├── reorganization/             # Keep existing
├── standards/                  # Move from root
├── reports/                    # Move from root
├── security/                   # Move from root
├── diagrams/                   # Move from root
└── reference/                  # New - for API docs, configs
```

### 2.2 Move standards directory
```bash
# Move standards into docs
mv standards/ docs/standards/
```

### 2.3 Move reports directory
```bash
# Move reports into docs
mv reports/ docs/reports/
```

### 2.4 Move security directory
```bash
# Move security into docs
mv security/ docs/security/
```

### 2.5 Move diagrams directory
```bash
# Move diagrams into docs
mv diagrams/ docs/diagrams/
```

### 2.6 Consolidate scattered documentation
```bash
# Move root-level docs to appropriate subdirectories
mv CONTRIBUTING.md docs/setup/
mv FIX_SECRET_PERMISSIONS.md docs/setup/
mv LICENSE.md docs/

# Keep these in root for visibility
# - README.md (main project readme)
# - CLAUDE.md (AI assistant notes)
```

### 2.7 Update documentation paths
Update all internal links in documentation files to reflect new paths:
- `../standards/` → `../docs/standards/`
- `../reports/` → `../docs/reports/`
- `../security/` → `../docs/security/`
- `../diagrams/` → `../docs/diagrams/`

## Phase 3: Review Pending Scripts (Priority: Medium)

### 3.1 Analyze src-pending directories
For each app with a `src-pending/` directory:
1. Compare with active scripts to identify:
   - Duplicates (can be deleted)
   - Updated versions (should replace current)
   - New functionality (should be moved to src/)
   - Experimental/incomplete (keep in pending)

### 3.2 Decision Matrix
Create a spreadsheet tracking:
- Script name
- Current location
- Functionality
- Dependencies
- Decision (activate/archive/delete)

## Phase 4: Git Operations (Priority: High)

### 4.1 Stage all moves
```bash
# Add all new file locations
git add apps/

# Add moved documentation
git add docs/

# Remove old locations
git rm -r calendar/ chat/ docs/ drive/ gmail/ photos/ sheets/ tasks/ utility/
git rm -r standards/ reports/ security/ diagrams/
```

### 4.2 Handle special cases
```bash
# Keep the gmail directory structure if it has special files
# Check for appsscript.json and other config files
```

## Phase 5: Cleanup Operations (Priority: Medium)

### 5.1 Remove old backup
```bash
# After confirming all needed scripts are in apps/
rm -rf scripts-backup-20250723/
```

### 5.2 Update configuration files
- Update `project-mapping.json` if paths have changed
- Verify `.clasp.json` files in each app directory
- Update deployment scripts to use new paths

### 5.3 Clean root directory
Remove now-empty directories:
```bash
rmdir calendar chat docs drive gmail photos sheets tasks utility
rmdir standards reports security diagrams
```

### 5.4 Update root README.md
Update the main README to reflect:
- New `/apps/` structure
- New `/docs/` consolidated structure
- Updated paths to documentation

## Phase 6: Validation (Priority: High)

### 6.1 Structure validation
```bash
# Verify all apps have required structure
for app in apps/*/; do
  echo "Checking $app"
  ls -la "$app"src/
done
```

### 6.2 Script count validation
- Calendar: 8 scripts
- Chat: 1 script
- Docs: 7 scripts
- Drive: 27 scripts
- Gmail: 49 scripts
- Photos: 1 script
- Sheets: 13 scripts (including moved gmail script)
- Tasks: 6 scripts
- Utility: 11 scripts
Total: 123 active scripts

### 6.3 Documentation validation
```bash
# Verify documentation structure
tree docs/ -d -L 2
```

### 6.4 Deployment test
```bash
# Test local deployment for each app
./automation/deploy-local.sh calendar
./automation/deploy-local.sh gmail
# etc.
```

## Phase 7: Documentation Update (Priority: Low)

### 7.1 Create documentation index
Create `/docs/README.md` with:
- Documentation map
- Quick links to all sections
- Search tips

### 7.2 Update cross-references
- Update all relative paths in documentation
- Fix broken links
- Update navigation

### 7.3 Create migration log
Document:
- What was moved
- What was deleted
- What remains in pending
- Any issues encountered

## Execution Timeline

### Day 1 (Immediate)
- [ ] Phase 1: Move all scripts to apps/*/src/
- [ ] Phase 2: Consolidate documentation
- [ ] Phase 4.1: Stage git changes
- [ ] Phase 6.1: Validate structure

### Day 2
- [ ] Phase 3: Review and handle pending scripts
- [ ] Phase 5.1: Remove old backup
- [ ] Phase 6.2-6.3: Validate scripts and docs

### Day 3
- [ ] Phase 5.2: Update configurations
- [ ] Phase 6.4: Test deployments
- [ ] Phase 4.2: Final git commit

### Day 4
- [ ] Phase 7: Update documentation
- [ ] Final validation and testing

## Risk Mitigation

### Before starting:
1. Create a new backup: `cp -r . ../workspace-automation-backup-$(date +%Y%m%d)`
2. Ensure you have the current git state saved
3. Document any custom configurations in gmail/ or other apps

### During migration:
1. Move files in small batches
2. Validate after each batch
3. Keep detailed logs of actions

### After completion:
1. Run full test suite
2. Deploy to test environment first
3. Monitor for any missing functionality

## Success Criteria
- [ ] All 123 scripts moved to appropriate apps/*/src/ directories
- [ ] No scripts remain in root-level app directories
- [ ] All documentation consolidated under /docs/
- [ ] Git successfully tracks all moves
- [ ] All apps deploy successfully
- [ ] Documentation structure is clean and navigable
- [ ] No functionality lost

## Final Repository Structure
```
workspace-automation/
├── apps/                       # All Google Apps Script projects
│   ├── calendar/
│   ├── chat/
│   ├── docs/
│   ├── drive/
│   ├── gmail/
│   ├── photos/
│   ├── sheets/
│   ├── slides/
│   ├── tasks/
│   └── utility/
├── automation/                 # Deployment scripts
├── builder/                    # Docker/build configs
├── config/                     # Configuration files
├── docs/                       # ALL documentation
│   ├── architecture/
│   ├── diagrams/
│   ├── guides/
│   ├── milestones/
│   ├── reorganization/
│   ├── reports/
│   ├── security/
│   ├── setup/
│   └── standards/
├── logs/                       # Deployment logs
├── tools/                      # Development tools
├── CLAUDE.md                   # AI assistant notes
├── README.md                   # Main project readme
├── package.json
└── [other root config files]
```

## Notes
- Special attention to gmail/ directory which has additional config files
- Some scripts may have dependencies that need to be preserved
- Legacy scripts should be kept in src-pending/ until fully validated
- Documentation links must be updated throughout the codebase