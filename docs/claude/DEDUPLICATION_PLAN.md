# Deduplication Plan

Generated: 2025-07-26

## Summary
- **Total Scripts**: 183
- **Exact Duplicate Sets**: 50
- **Space Wasted**: 435.4 KB
- **Scripts to Remove**: ~90 files

## Key Findings

### 1. Most txt files are duplicates
Almost all files in `/txt to convert/` are exact duplicates of files already in the repository. These can be safely removed.

### 2. Duplicate scripts within repository
Several scripts exist in multiple locations within `/apps/`:
- Same script in both specific service and `/utility/`
- Legacy versions alongside current versions
- Scripts with slightly different names but identical content

### 3. Triple duplicates
Some scripts exist in 3+ locations:
- `email-md-sheets-yaml-number-1` exists in gmail, utility, and txt
- `gmail-labels-statistics` has 5 copies (3 in repo, 2 txt files)

## Deduplication Strategy

### Phase 1: Remove txt file duplicates
Since these are exact duplicates of repository files, we can safely remove them:

```bash
# Files to remove from /txt to convert/:
- event-export-gcp-distance-time.txt (duplicate of apps/calendar/src/)
- events-date-duration-time-distance.txt (duplicate of apps/calendar/src/)
- docs-formatter.txt (duplicate of apps/docs/src/)
- drive-docs-finder-by-alias.txt (duplicate of apps/drive/src/)
# ... and 46 more
```

### Phase 2: Consolidate repository duplicates

#### Gmail duplicates to resolve:
1. `email-data-24months.gs` = `gmail-analysis-24months.gs`
   - Keep: `gmail-analysis-24months.gs` (better naming)
   
2. `email-export-to-sheets-search-label0rkeywaord-or-dateRange.gs` = `gmail-export-advanced-sheets.gs`
   - Keep: `gmail-export-advanced-sheets.gs` (cleaner name)

3. `email-md-sheets-yaml-number-1.gs` = `gmail-analysis-markdown-yaml.gs` = `gmail-analysis-markdown-yaml-v2.gs`
   - Keep: `gmail-analysis-markdown-yaml-v2.gs` (newest version)

4. `gmail-labels-export-to-sheets.gs` = `gmail-labels-statistics.gs`
   - Keep: `gmail-labels-export-to-sheets.gs` (more descriptive)

5. `gmail-labels-count.gs` = `gmail-labels-status-count.gs`
   - Keep: `gmail-labels-status-count.gs` (more specific)

#### Drive duplicates to resolve:
1. `drive-docs-find-by-alias.gs` = `drive-docs-finder-by-alias.gs`
   - Keep: `drive-docs-find-by-alias.gs` (shorter)

2. `drive-shortcuts-convert.gs` = `drive-shortcuts-to-shortcuts.gs`
   - Keep: `drive-shortcuts-convert.gs` (clearer purpose)

#### Cross-service duplicates:
1. Scripts in both service directory and `/utility/`:
   - `drive-yaml-*` files duplicated in utility
   - `email-md-sheets-yaml-number-1.gs` in gmail and utility
   - `tasks-export-tasklist-md-yaml.gs` in tasks and utility
   - **Action**: Keep in service directory, remove from utility

### Phase 3: Handle unique txt files
After removing duplicates, process remaining unique txt files:
1. Convert to .gs format
2. Apply smart formatting
3. Migrate to appropriate service directory

## Execution Plan

### Step 1: Backup everything
```bash
tar -czf backup-before-dedup-$(date +%Y%m%d).tar.gz apps/ "txt to convert/"
```

### Step 2: Remove txt duplicates
```bash
# List of 50+ txt files to remove
rm "txt to convert/event-export-gcp-distance-time.txt"
rm "txt to convert/events-date-duration-time-distance.txt"
# ... etc
```

### Step 3: Remove repository duplicates
```bash
# Remove duplicate scripts within apps/
rm apps/gmail/src/email-data-24months.gs
rm apps/gmail/src/email-export-to-sheets-search-label0rkeywaord-or-dateRange.gs
# ... etc
```

### Step 4: Process remaining unique files
```bash
npm run gas:convert:txt  # Convert remaining unique txt files
npm run gas:migrate:all  # Migrate to proper locations
```

### Step 5: Final cleanup
```bash
npm run gas:duplicates   # Verify no duplicates remain
npm run catalog:all      # Update catalogs
```

## Space Savings
- Immediate: ~435 KB from exact duplicates
- Additional: ~200 KB from consolidating similar scripts
- Total: ~635 KB (approximately 30% reduction)

## Risk Mitigation
1. Complete backup before any deletions
2. Test scripts after deduplication
3. Update any references to removed files
4. Document which version was kept and why

## Next Steps
1. Review and approve this plan
2. Execute deduplication
3. Run comprehensive tests
4. Update documentation