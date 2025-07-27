#!/bin/bash

echo "🚀 Migrating unique converted files..."

cd "/Users/kevinlappe/Documents/GitHub/Workspace Automation"

# Apply smart formatting first
echo "📝 Applying smart formatting..."
for file in temp/converted-scripts/*.gs; do
  if [ -f "$file" ]; then
    echo "  Formatting: $(basename "$file")"
    node automation/dev-tools/gas-formatter-smart.js "$file" 2>/dev/null || echo "    ⚠️  Formatting failed, keeping original"
  fi
done

# Migrate unique files to appropriate services
echo -e "\n📦 Migrating files to services..."

# calendar-export-after-date.gs -> calendar service
echo "  Moving calendar-export-after-date.gs to calendar service"
mv temp/converted-scripts/calendar-export-after-date.gs apps/calendar/src/ 2>/dev/null || echo "    ⚠️  Already exists or failed"

# docs-to-markdown-alt.gs -> docs service  
echo "  Moving docs-to-markdown-alt.gs to docs service"
mv temp/converted-scripts/docs-to-markdown-alt.gs apps/docs/src/docs-export-markdown-alt.gs 2>/dev/null || echo "    ⚠️  Already exists or failed"

# export-google-calendar-meetings-to-obsidian-markdown-files.gs -> calendar service
echo "  Moving calendar-meetings-export-obsidian.gs to calendar service"
mv temp/converted-scripts/export-google-calendar-meetings-to-obsidian-markdown-files.gs apps/calendar/src/calendar-meetings-export-obsidian.gs 2>/dev/null || echo "    ⚠️  Already exists or failed"

# google-sheets-markdown-file-generator.gs -> sheets service
echo "  Moving sheets-markdown-generator.gs to sheets service"
mv temp/converted-scripts/google-sheets-markdown-file-generator.gs apps/sheets/src/sheets-markdown-generator.gs 2>/dev/null || echo "    ⚠️  Already exists or failed"

# obsidian-vault-config-replacement-script.gs -> utility service
echo "  Moving obsidian-vault-config-updater.gs to utility service"
mv temp/converted-scripts/obsidian-vault-config-replacement-script.gs apps/utility/src/obsidian-vault-config-updater.gs 2>/dev/null || echo "    ⚠️  Already exists or failed"

# send-docs-to-markdown.gs -> docs service
echo "  Moving docs-export-markdown.gs to docs service"
mv temp/converted-scripts/send-docs-to-markdown.gs apps/docs/src/docs-export-markdown.gs 2>/dev/null || echo "    ⚠️  Already exists or failed"

# sheets-tabs-tree-diagram.gs -> sheets service
echo "  Moving sheets-tabs-tree-diagram.gs to sheets service"
mv temp/converted-scripts/sheets-tabs-tree-diagram.gs apps/sheets/src/sheets-create-tabs-tree-diagram.gs 2>/dev/null || echo "    ⚠️  Already exists or failed"

# Clean up remaining duplicates
echo -e "\n🧹 Cleaning up duplicates..."
rm -f temp/converted-scripts/chat-export-daily-details.gs
rm -f temp/converted-scripts/docs-embed-content-block.gs
rm -f temp/converted-scripts/docs-export-comments-sheets.gs
rm -f temp/converted-scripts/docs-export-file-list-to-sheets.gs
rm -f temp/converted-scripts/index-all-files.gs
rm -f temp/converted-scripts/sheets-csv-combiner.gs

# Remove the duplicate in calendar as identified by merger
rm -f apps/calendar/src/calendar-export-obsidian.gs

# Remove utility duplicates identified earlier
rm -f apps/utility/src/yaml-finder.gs

echo -e "\n✅ Migration complete!"

# Update counts
echo -e "\nFiles per service:"
for service in apps/*/; do
  if [ -d "$service/src" ]; then
    count=$(ls "$service/src/"*.gs 2>/dev/null | wc -l)
    echo "  $(basename $service): $count files"
  fi
done