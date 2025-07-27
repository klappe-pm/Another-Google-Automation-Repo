#!/bin/bash

# Remove duplicate scripts within the repository

echo "Removing duplicate scripts within repository..."

cd "/Users/kevinlappe/Documents/GitHub/Workspace Automation"

# Gmail duplicates
echo "Removing gmail duplicates..."
rm -f "apps/gmail/src/email-data-24months.gs"  # Keep gmail-analysis-24months.gs
rm -f "apps/gmail/src/email-export-to-sheets-search-label0rkeywaord-or-dateRange.gs"  # Keep gmail-export-advanced-sheets.gs
rm -f "apps/gmail/src/email-md-sheets-yaml-number-1.gs"  # Keep gmail-analysis-markdown-yaml-v2.gs
rm -f "apps/gmail/src/gmail-analysis-markdown-yaml.gs"  # Keep gmail-analysis-markdown-yaml-v2.gs
rm -f "apps/gmail/src/gmail-labels-statistics.gs"  # Keep gmail-labels-export-to-sheets.gs
rm -f "apps/gmail/src/gmail-labels-count.gs"  # Keep gmail-labels-status-count.gs
rm -f "apps/gmail/src/gmail-label-maker.gs"  # Keep gmail-labels-create-basic.gs

# Drive duplicates
echo "Removing drive duplicates..."
rm -f "apps/drive/src/drive-docs-finder-by-alias.gs"  # Keep drive-docs-find-by-alias.gs
rm -f "apps/drive/src/drive-shortcuts-to-shortcuts.gs"  # Keep drive-shortcuts-convert.gs

# Utility duplicates (keep in service directories)
echo "Removing utility duplicates..."
rm -f "apps/utility/src/email-md-sheets-yaml-number-1.gs"  # Keep in gmail
rm -f "apps/utility/src/tasks-export-tasklist-md-yaml.gs"  # Keep in tasks
rm -f "apps/utility/src/yaml-frontmatter-to-drive-folder-files-md.gs"  # Keep in drive
rm -f "apps/utility/src/YAML-add-frontmatter-multi-options.gs"  # Keep in drive
rm -f "apps/utility/src/zzz-yaml-add-yaml.gs"  # Keep in drive
rm -f "apps/utility/src/zzz-yaml-???.gs"  # Keep in drive
rm -f "apps/utility/src/dataview-category-subcategory-yaml.gs"  # Keep in drive
rm -f "apps/utility/src/yaml-folder-category.gs"  # Keep in drive
rm -f "apps/utility/src/linter-md-lines-spacing.gs"  # Keep in drive

# Remove gmail duplicate that's in drive
rm -f "apps/drive/src/drive-utility-script-25-gmail-duplicate-legacy.gs"  # Keep gmail-utility-delete-all-labels.gs

echo "Removed repository duplicates"

# Count files per service
echo ""
echo "Files per service after deduplication:"
for service in apps/*/; do
  if [ -d "$service/src" ]; then
    count=$(ls "$service/src/"*.gs 2>/dev/null | wc -l)
    echo "  $(basename $service): $count files"
  fi
done